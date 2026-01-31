"""
Tasks Celery para envio de notificações push
Processamento assíncrono para não bloquear requisições
"""
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Verificar se pywebpush está disponível
try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False
    logger.warning("pywebpush não instalado. Push notifications desabilitadas.")


User = get_user_model()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_push_notification(self, notification_id: int) -> Dict[str, Any]:
    """
    Envia Web Push notification para todos os dispositivos do usuário
    
    Args:
        notification_id: ID da notificação no banco
        
    Returns:
        Dict com contagem de sucesso e erros
    """
    from .models import PushSubscription, Notification
    
    if not WEBPUSH_AVAILABLE:
        logger.error("pywebpush não disponível")
        return {'error': 'WebPush not available'}
    
    try:
        notification = Notification.objects.select_related('user', 'tenant').get(id=notification_id)
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} não encontrada")
        return {'error': 'Notification not found'}
    
    user = notification.user
    if not user:
        logger.warning(f"Notification {notification_id} não tem usuário associado")
        return {'error': 'No user associated'}
    
    # Verificar preferências do usuário
    preferences = getattr(user, 'notification_preferences', None)
    if preferences:
        if not preferences.should_notify(notification.tipo):
            logger.info(f"Usuário {user.id} desabilitou notificações do tipo {notification.tipo}")
            return {'skipped': 'User preference'}
        
        if preferences.is_quiet_hours():
            logger.info(f"Usuário {user.id} está em horário de silêncio")
            return {'skipped': 'Quiet hours'}
    
    # Buscar subscriptions ativas do usuário
    subscriptions = PushSubscription.objects.filter(
        user=user,
        tenant=notification.tenant,
        active=True
    )
    
    if not subscriptions.exists():
        logger.info(f"Usuário {user.email} não tem subscriptions ativas")
        notification.record_delivery(success=False, error="No active subscriptions")
        return {'success': 0, 'errors': 0, 'no_subscriptions': True}
    
    # Preparar payload da notificação
    payload = _build_notification_payload(notification)
    
    # Obter VAPID keys
    vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', None)
    vapid_admin_email = getattr(settings, 'VAPID_ADMIN_EMAIL', 'admin@ouvify.app')
    
    if not vapid_private_key:
        logger.error("VAPID_PRIVATE_KEY não configurada")
        notification.record_delivery(success=False, error="VAPID key not configured")
        return {'error': 'VAPID not configured'}
    
    vapid_claims = {'sub': f'mailto:{vapid_admin_email}'}
    
    success_count = 0
    error_count = 0
    
    # Enviar para cada subscription
    for subscription in subscriptions:
        try:
            subscription_info = {
                'endpoint': subscription.endpoint,
                'keys': {
                    'p256dh': subscription.p256dh,
                    'auth': subscription.auth
                }
            }
            
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims
            )
            
            success_count += 1
            subscription.mark_as_used()
            
        except WebPushException as e:
            error_count += 1
            logger.error(f"WebPush error para subscription {subscription.id}: {e}")
            
            # Se 410 Gone ou 404, subscription expirou
            if e.response and e.response.status_code in (404, 410):
                subscription.deactivate()
                logger.info(f"Subscription {subscription.id} desativada (status {e.response.status_code})")
        
        except Exception as e:
            error_count += 1
            logger.error(f"Erro inesperado ao enviar push: {e}")
    
    # Registrar resultado
    notification.record_delivery(
        success=success_count > 0,
        error=f"{error_count} falhas" if error_count else '',
        push_count=success_count
    )
    
    logger.info(f"Push notification {notification_id}: {success_count} sucesso, {error_count} erros")
    return {'success': success_count, 'errors': error_count}


def _build_notification_payload(notification) -> Dict[str, Any]:
    """Constrói payload da notificação para Web Push"""
    return {
        'title': notification.title,
        'body': notification.body,
        'icon': notification.icon or '/icon-192x192.png',
        'badge': '/badge-72x72.png',
        'url': notification.url or '/',
        'data': {
            'notification_id': notification.id,
            'tipo': notification.tipo,
            **notification.data
        },
        'tag': f'ouvy-notification-{notification.id}',
        'timestamp': int(notification.sent_at.timestamp() * 1000),
        'requireInteraction': notification.tipo in ('ALERTA', 'FEEDBACK_NOVO'),
    }


@shared_task
def send_feedback_created_push(feedback_id: int) -> Dict[str, Any]:
    """
    Notifica administradores sobre novo feedback
    
    Args:
        feedback_id: ID do feedback criado
    """
    from apps.feedbacks.models import Feedback
    from .models import Notification
    
    try:
        feedback = Feedback.objects.select_related('client').get(id=feedback_id)
    except Feedback.DoesNotExist:
        logger.error(f"Feedback {feedback_id} não encontrado")
        return {'error': 'Feedback not found'}
    
    tenant = feedback.client
    
    # Buscar admins/staff do tenant
    admins = User.objects.filter(
        tenant=tenant,
        is_staff=True,
        is_active=True
    )
    
    if not admins.exists():
        logger.warning(f"Tenant {tenant.id} não tem admins para notificar")
        return {'warning': 'No admins found'}
    
    # Determinar tipo de feedback para mensagem
    tipo_display = feedback.get_tipo_display() if hasattr(feedback, 'get_tipo_display') else 'Feedback'
    
    notifications_sent = 0
    
    for admin in admins:
        notification = Notification.objects.create(
            tenant=tenant,
            user=admin,
            tipo='FEEDBACK_NOVO',
            title=f'Novo {tipo_display}',
            body=feedback.titulo[:150] if feedback.titulo else 'Novo feedback recebido',
            icon='/icons/feedback-new.png',
            url=f'/dashboard/feedbacks/{feedback.id}',
            data={
                'feedback_id': feedback.id,
                'protocolo': feedback.protocolo,
                'tipo': getattr(feedback, 'tipo', 'feedback'),
            }
        )
        
        # Enviar push de forma assíncrona
        send_push_notification.delay(notification.id)  # type: ignore[attr-defined]
        notifications_sent += 1
    
    logger.info(f"Notificações de novo feedback enviadas para {notifications_sent} admins")
    return {'notifications_sent': notifications_sent}


@shared_task
def send_status_update_push(feedback_id: int, old_status: Optional[str] = None) -> Dict[str, Any]:
    """
    Notifica criador do feedback sobre mudança de status
    
    Args:
        feedback_id: ID do feedback atualizado
        old_status: Status anterior (opcional)
    """
    from apps.feedbacks.models import Feedback
    from .models import Notification
    
    try:
        feedback = Feedback.objects.select_related('client').get(id=feedback_id)
    except Feedback.DoesNotExist:
        logger.error(f"Feedback {feedback_id} não encontrado")
        return {'error': 'Feedback not found'}
    
    # Se feedback é anônimo, não podemos notificar
    if getattr(feedback, 'anonimo', False) or not getattr(feedback, 'autor', None):
        logger.info(f"Feedback {feedback_id} é anônimo ou sem autor")
        return {'skipped': 'Anonymous or no author'}
    
    autor = feedback.autor
    tenant = feedback.client
    
    # Determinar tipo de notificação baseado no novo status
    new_status = getattr(feedback, 'status', 'atualizado')
    if new_status == 'resolvido':
        tipo = 'FEEDBACK_RESOLVIDO'
        title = 'Seu feedback foi resolvido! 🎉'
    else:
        tipo = 'FEEDBACK_ATUALIZADO'
        title = 'Seu feedback foi atualizado'
    
    status_display = feedback.get_status_display() if hasattr(feedback, 'get_status_display') else new_status
    
    notification = Notification.objects.create(
        tenant=tenant,
        user=autor,
        tipo=tipo,
        title=title,
        body=f'Status: {status_display}',
        icon='/icons/feedback-update.png',
        url=f'/acompanhar?protocolo={feedback.protocolo}',
        data={
            'feedback_id': feedback.id,
            'protocolo': feedback.protocolo,
            'old_status': old_status,
            'new_status': new_status,
        }
    )
    
    # Enviar push
    send_push_notification.delay(notification.id)  # type: ignore[attr-defined]
    
    logger.info(f"Notificação de atualização enviada para autor do feedback {feedback_id}")
    return {'notification_id': notification.id}


@shared_task
def send_broadcast_notification(
    tenant_id: int,
    title: str,
    body: str,
    url: str = '',
    data: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Envia notificação broadcast para todos os usuários de um tenant
    
    Args:
        tenant_id: ID do tenant
        title: Título da notificação
        body: Corpo da notificação
        url: URL de destino (opcional)
        data: Dados extras (opcional)
    """
    from apps.tenants.models import Client
    from .models import Notification
    
    try:
        tenant = Client.objects.get(id=tenant_id)
    except Client.DoesNotExist:
        logger.error(f"Tenant {tenant_id} não encontrado")
        return {'error': 'Tenant not found'}
    
    # Buscar todos os usuários ativos do tenant
    users = User.objects.filter(tenant=tenant, is_active=True)
    
    notifications_created = 0
    
    for user in users:
        notification = Notification.objects.create(
            tenant=tenant,
            user=user,
            tipo='SISTEMA',
            title=title,
            body=body,
            url=url,
            data=data or {}
        )
        
        send_push_notification.delay(notification.id)  # type: ignore[attr-defined]
        notifications_created += 1
    
    logger.info(f"Broadcast enviado para {notifications_created} usuários do tenant {tenant_id}")
    return {'notifications_created': notifications_created}


@shared_task
def cleanup_old_notifications(days: int = 90) -> Dict[str, int]:
    """
    Remove notificações antigas para manter o banco limpo
    
    Args:
        days: Dias de retenção (padrão: 90)
    """
    from .models import Notification
    
    cutoff = timezone.now() - timezone.timedelta(days=days)
    
    # Deletar notificações antigas que já foram lidas
    deleted_count, _ = Notification.objects.filter(
        sent_at__lt=cutoff,
        read_at__isnull=False
    ).delete()
    
    logger.info(f"Removidas {deleted_count} notificações antigas")
    return {'deleted': deleted_count}


@shared_task
def cleanup_inactive_subscriptions(days: int = 30) -> Dict[str, int]:
    """
    Remove subscriptions inativas há muito tempo
    
    Args:
        days: Dias sem uso para considerar inativa
    """
    from .models import PushSubscription
    
    cutoff = timezone.now() - timezone.timedelta(days=days)
    
    # Deletar subscriptions inativas ou não usadas há muito tempo
    deleted_count, _ = PushSubscription.objects.filter(
        active=False
    ).delete()
    
    # Também deletar subscriptions nunca usadas e muito antigas
    old_unused, _ = PushSubscription.objects.filter(
        last_used__isnull=True,
        created_at__lt=cutoff
    ).delete()
    
    total = deleted_count + old_unused
    logger.info(f"Removidas {total} subscriptions inativas/antigas")
    return {'deleted': total}
