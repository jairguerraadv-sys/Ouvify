"""
Webhook Service - Ouvy SaaS
Sprint 5 - Feature 5.2: Integrações (Webhooks)

Serviço para envio de webhooks
"""
import json
import logging
import time
from typing import Optional
from datetime import timedelta

import requests
from django.utils import timezone
from celery import shared_task

from .models import WebhookEndpoint, WebhookEvent, WebhookDelivery

logger = logging.getLogger(__name__)


def create_webhook_event(
    event_type: str,
    payload: dict,
    source_model: str = '',
    source_id: str = ''
) -> WebhookEvent:
    """
    Cria um evento de webhook e dispara o processamento.
    
    Args:
        event_type: Tipo do evento (ex: 'feedback.created')
        payload: Dados do evento
        source_model: Nome do model de origem
        source_id: ID do objeto de origem
    
    Returns:
        WebhookEvent criado
    """
    event = WebhookEvent.objects.create(
        event_type=event_type,
        payload=payload,
        source_model=source_model,
        source_id=source_id,
    )
    
    # Disparar processamento assíncrono
    process_webhook_event.delay(str(event.id))
    
    return event


@shared_task(bind=True, max_retries=3)
def process_webhook_event(self, event_id: str):
    """
    Processa um evento de webhook, enviando para todos os endpoints inscritos.
    """
    try:
        event = WebhookEvent.objects.get(id=event_id)
    except WebhookEvent.DoesNotExist:
        logger.error(f"Webhook event {event_id} not found")
        return
    
    event.status = 'processing'
    event.save(update_fields=['status'])
    
    # Buscar endpoints ativos inscritos neste evento
    # Nota: Precisamos filtrar por tenant no payload
    tenant_id = event.payload.get('tenant_id')
    
    endpoints = WebhookEndpoint.objects.filter(
        is_active=True,
    )
    
    if tenant_id:
        endpoints = endpoints.filter(client_id=tenant_id)
    
    delivered_count = 0
    failed_count = 0
    
    for endpoint in endpoints:
        if not endpoint.is_subscribed_to(event.event_type):
            continue
        
        success = deliver_webhook(endpoint, event)
        
        if success:
            delivered_count += 1
        else:
            failed_count += 1
    
    # Atualizar status do evento
    if delivered_count > 0 and failed_count == 0:
        event.status = 'delivered'
    elif delivered_count > 0 and failed_count > 0:
        event.status = 'partial'
    elif failed_count > 0:
        event.status = 'failed'
    else:
        event.status = 'delivered'  # Nenhum endpoint inscrito
    
    event.processed_at = timezone.now()
    event.save(update_fields=['status', 'processed_at'])


def deliver_webhook(
    endpoint: WebhookEndpoint,
    event: WebhookEvent,
    attempt: int = 1
) -> bool:
    """
    Envia um webhook para um endpoint específico.
    
    Args:
        endpoint: Endpoint de destino
        event: Evento a enviar
        attempt: Número da tentativa
    
    Returns:
        True se sucesso, False se falhou
    """
    # Preparar payload
    payload = {
        'event': event.event_type,
        'timestamp': timezone.now().isoformat(),
        'data': event.payload,
        'event_id': str(event.id),
    }
    
    # Preparar headers
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Ouvy-Webhook/1.0',
        'X-Ouvy-Event': event.event_type,
        'X-Ouvy-Signature': endpoint.sign_payload(payload),
        'X-Ouvy-Delivery': str(event.id),
        'X-Ouvy-Timestamp': str(int(timezone.now().timestamp())),
    }
    
    # Adicionar headers customizados
    if endpoint.headers:
        headers.update(endpoint.headers)
    
    # Criar registro de delivery
    delivery = WebhookDelivery.objects.create(
        endpoint=endpoint,
        event=event,
        request_url=endpoint.url,
        request_headers=headers,
        request_payload=payload,
        attempt=attempt,
    )
    
    # Enviar request
    start_time = time.time()
    
    try:
        response = requests.post(
            endpoint.url,
            json=payload,
            headers=headers,
            timeout=30,  # 30 segundos timeout
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Atualizar delivery
        delivery.response_status = response.status_code
        delivery.response_headers = dict(response.headers)
        delivery.response_body = response.text[:10000]  # Limitar tamanho
        delivery.duration_ms = duration_ms
        delivery.success = 200 <= response.status_code < 300
        
        if not delivery.success:
            delivery.error_message = f"HTTP {response.status_code}"
            
            # Agendar retry se necessário
            if attempt < endpoint.max_retries:
                schedule_retry(delivery, endpoint, event, attempt)
        
        delivery.save()
        
        # Atualizar stats do endpoint
        endpoint.update_stats(delivery.success)
        
        logger.info(
            f"Webhook delivered: {endpoint.name} - {event.event_type} "
            f"- Status: {response.status_code} - Duration: {duration_ms}ms"
        )
        
        return delivery.success
        
    except requests.Timeout:
        duration_ms = int((time.time() - start_time) * 1000)
        delivery.duration_ms = duration_ms
        delivery.success = False
        delivery.error_message = "Request timeout"
        
        if attempt < endpoint.max_retries:
            schedule_retry(delivery, endpoint, event, attempt)
        
        delivery.save()
        endpoint.update_stats(False)
        
        logger.warning(f"Webhook timeout: {endpoint.name} - {event.event_type}")
        return False
        
    except requests.RequestException as e:
        duration_ms = int((time.time() - start_time) * 1000)
        delivery.duration_ms = duration_ms
        delivery.success = False
        delivery.error_message = str(e)
        
        if attempt < endpoint.max_retries:
            schedule_retry(delivery, endpoint, event, attempt)
        
        delivery.save()
        endpoint.update_stats(False)
        
        logger.error(f"Webhook error: {endpoint.name} - {event.event_type} - {e}")
        return False


def schedule_retry(
    delivery: WebhookDelivery,
    endpoint: WebhookEndpoint,
    event: WebhookEvent,
    current_attempt: int
):
    """Agenda uma retentativa de envio."""
    delay_seconds = endpoint.retry_delay * (2 ** (current_attempt - 1))  # Exponential backoff
    next_retry = timezone.now() + timedelta(seconds=delay_seconds)
    
    delivery.next_retry_at = next_retry
    delivery.save(update_fields=['next_retry_at'])
    
    # Agendar task de retry
    retry_webhook_delivery.apply_async(
        args=[str(endpoint.id), str(event.id), current_attempt + 1],
        eta=next_retry
    )


@shared_task
def retry_webhook_delivery(endpoint_id: str, event_id: str, attempt: int):
    """Task para retentativa de envio de webhook."""
    try:
        endpoint = WebhookEndpoint.objects.get(id=endpoint_id)
        event = WebhookEvent.objects.get(id=event_id)
        deliver_webhook(endpoint, event, attempt)
    except (WebhookEndpoint.DoesNotExist, WebhookEvent.DoesNotExist) as e:
        logger.error(f"Retry webhook failed: {e}")


# Convenience functions for common events
def trigger_feedback_created(feedback):
    """Dispara evento de feedback criado."""
    payload = {
        'tenant_id': feedback.client_id,
        'feedback': {
            'id': feedback.id,
            'protocolo': feedback.protocolo,
            'tipo': feedback.tipo,
            'titulo': feedback.titulo,
            'status': feedback.status,
            'anonimo': feedback.anonimo,
            'data_criacao': feedback.data_criacao.isoformat() if feedback.data_criacao else None,
        }
    }
    return create_webhook_event('feedback.created', payload, 'Feedback', str(feedback.id))


def trigger_feedback_status_changed(feedback, old_status, new_status):
    """Dispara evento de mudança de status."""
    payload = {
        'tenant_id': feedback.client_id,
        'feedback': {
            'id': feedback.id,
            'protocolo': feedback.protocolo,
            'tipo': feedback.tipo,
            'titulo': feedback.titulo,
            'status': new_status,
        },
        'old_status': old_status,
        'new_status': new_status,
    }
    return create_webhook_event('feedback.status_changed', payload, 'Feedback', str(feedback.id))


def trigger_feedback_resolved(feedback):
    """Dispara evento de feedback resolvido."""
    payload = {
        'tenant_id': feedback.client_id,
        'feedback': {
            'id': feedback.id,
            'protocolo': feedback.protocolo,
            'tipo': feedback.tipo,
            'titulo': feedback.titulo,
            'status': feedback.status,
            'resposta_empresa': feedback.resposta_empresa,
            'data_resolucao': feedback.data_resolucao.isoformat() if feedback.data_resolucao else None,
        }
    }
    return create_webhook_event('feedback.resolved', payload, 'Feedback', str(feedback.id))


def trigger_sla_breach(feedback, sla_type):
    """Dispara evento de violação de SLA."""
    payload = {
        'tenant_id': feedback.client_id,
        'feedback': {
            'id': feedback.id,
            'protocolo': feedback.protocolo,
            'tipo': feedback.tipo,
            'titulo': feedback.titulo,
            'status': feedback.status,
        },
        'sla_type': sla_type,
        'sla_breach_at': timezone.now().isoformat(),
    }
    return create_webhook_event('sla.breach', payload, 'Feedback', str(feedback.id))
