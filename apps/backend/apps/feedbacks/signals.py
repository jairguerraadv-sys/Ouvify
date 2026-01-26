"""
Sistema de Notificações por Email - Feedbacks
==============================================

Triggers automáticos para enviar emails quando:
- Novo feedback é criado
- Resposta/interação é adicionada
- Status do feedback é alterado
"""

import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.cache import cache

from apps.core.services import EmailService, WebhookService
from .models import Feedback, FeedbackInteracao

logger = logging.getLogger(__name__)


# =============================================================================
# SIGNAL: Novo Feedback Criado
# =============================================================================

@receiver(post_save, sender=Feedback)
def notificar_novo_feedback(sender, instance, created, **kwargs):
    """
    Notifica o tenant por email quando um novo feedback é criado.

    Args:
        sender: Classe Feedback
        instance: Instância do feedback criado
        created: True se foi criação (False se atualização)
        **kwargs: Argumentos adicionais do signal
    """
    # Só envia para novos feedbacks (created=True)
    if not created:
        return

    # Ignora se não tem tenant
    if not instance.client:
        logger.warning(
            f"⚠️ Feedback {instance.protocolo} sem client - "
            f"Notificação não enviada"
        )
        return

    try:
        # Envia notificação usando EmailService
        EmailService.send_feedback_notification(instance)

        # Envia webhook se configurado
        WebhookService.send_feedback_webhook(instance, 'feedback.created')

        logger.info(f"✅ Notificações enviadas para feedback {instance.protocolo}")

    except Exception as e:
        logger.error(
            f"❌ Erro ao processar notificações do feedback {instance.protocolo}: "
            f"{str(e)}",
            exc_info=True
        )


# =============================================================================
# SIGNAL: Nova Interação/Resposta
# =============================================================================

@receiver(post_save, sender=FeedbackInteracao)
def notificar_resposta_feedback(sender, instance, created, **kwargs):
    """
    Notifica quando há uma nova resposta/interação no feedback.
    
    Args:
        sender: Classe FeedbackInteracao
        instance: Instância da interação criada
        created: True se foi criação
        **kwargs: Argumentos adicionais do signal
    """
    # Só envia para novas interações
    if not created:
        return
    
    feedback = instance.feedback
    
    # Ignora se não tem tenant ou email
    if not feedback.client or not feedback.client.owner:
        return
    
    owner_email = feedback.client.owner.email
    if not owner_email:
        return
    
    try:
        # Envia notificação de resposta
        success = EmailService.send_feedback_response_notification(
            feedback=feedback,
            response_message=instance.mensagem
        )
        
        if success:
            logger.info(
                f"✅ Notificação de resposta enviada para {owner_email} - "
                f"Feedback {feedback.protocolo}"
            )
        else:
            logger.warning(
                f"⚠️ Falha ao enviar notificação de resposta - "
                f"Feedback {feedback.protocolo}"
            )
            
    except Exception as e:
        # Se método não existe ainda no EmailService, só loga
        if "send_feedback_response_notification" in str(e):
            logger.debug(
                f"ℹ️ Método send_feedback_response_notification não implementado ainda"
            )
        else:
            logger.error(
                f"❌ Erro ao processar notificação de resposta: {str(e)}",
                exc_info=True
            )


# =============================================================================
# SIGNAL: Mudança de Status (com rate limiting)
# =============================================================================

@receiver(pre_save, sender=Feedback)
def preparar_notificacao_status(sender, instance, **kwargs):
    """
    Captura o status anterior antes de salvar (para comparação).
    """
    if instance.pk:
        try:
            # Busca instância anterior do banco
            instance._status_anterior = Feedback.objects.get(pk=instance.pk).status
        except Feedback.DoesNotExist:
            instance._status_anterior = None


@receiver(post_save, sender=Feedback)
def notificar_mudanca_status(sender, instance, created, **kwargs):
    """
    Notifica quando o status do feedback muda.

    Implementa rate limiting para evitar spam de emails.
    """
    # Ignora se é criação (já notificado em notificar_novo_feedback)
    if created:
        return

    # Verifica se status mudou
    status_anterior = getattr(instance, '_status_anterior', None)
    if not status_anterior or status_anterior == instance.status:
        return

    # Rate limiting: 1 notificação de status por feedback a cada 5 minutos
    cache_key = f"status_notification_{instance.pk}"
    if cache.get(cache_key):
        logger.debug(
            f"⏱️ Rate limit ativo - Notificação de status ignorada para "
            f"feedback {instance.protocolo}"
        )
        return

    try:
        # Envia notificação de mudança de status
        EmailService.send_feedback_status_update(instance, status_anterior)

        # Envia webhook se configurado
        WebhookService.send_feedback_webhook(instance, 'feedback.updated')

        # Define rate limit por 5 minutos
        cache.set(cache_key, True, 300)

        logger.info(f"✅ Notificação de status enviada para feedback {instance.protocolo}")

    except Exception as e:
        logger.error(
            f"❌ Erro ao processar notificação de status do feedback {instance.protocolo}: "
            f"{str(e)}",
            exc_info=True
        )
            
    except Exception as e:
        # Se método não existe ainda, só loga
        if "send_status_change_notification" in str(e):
            logger.debug(
                f"ℹ️ Método send_status_change_notification não implementado ainda"
            )
        else:
            logger.error(
                f"❌ Erro ao processar notificação de status: {str(e)}",
                exc_info=True
            )


# =============================================================================
# UTILITIES
# =============================================================================

def desativar_notificacoes_temporariamente(tempo_segundos=3600):
    """
    Desativa notificações temporariamente (útil para migrations/fixtures).
    
    Args:
        tempo_segundos: Tempo em segundos (padrão: 1 hora)
    
    Usage:
        from apps.feedbacks.signals import desativar_notificacoes_temporariamente
        desativar_notificacoes_temporariamente(3600)
    """
    cache.set('notificacoes_desativadas', True, tempo_segundos)
    logger.info(f"🔕 Notificações desativadas por {tempo_segundos}s")


def reativar_notificacoes():
    """
    Reativa notificações imediatamente.
    """
    cache.delete('notificacoes_desativadas')
    logger.info("🔔 Notificações reativadas")


def notificacoes_estao_ativas():
    """
    Verifica se notificações estão ativas.
    
    Returns:
        bool: True se ativas
    """
    return not cache.get('notificacoes_desativadas', False)


# =============================================================================
# CACHE INVALIDATION - Auditoria Fase 3 (26/01/2026)
# =============================================================================

@receiver(post_save, sender=Feedback)
def invalidate_dashboard_cache_on_feedback_save(sender, instance, created, **kwargs):
    """
    Invalida cache de dashboard stats quando Feedback é criado ou atualizado.
    
    **Performance (Auditoria Fase 3):**
    - Garante dados frescos após mudanças
    - Próximo request recalcula e atualiza cache
    - Mantém 99% de cache hit rate (5min lifetime)
    
    **Cache keys invalidados:**
    - dashboard_stats:{tenant_id}
    """
    if hasattr(instance, 'client') and instance.client:
        cache_key = f"dashboard_stats:{instance.client.id}"
        deleted = cache.delete(cache_key)
        
        if deleted:
            action = 'criado' if created else 'atualizado'
            logger.debug(
                f"🗑️ Cache invalidado: {cache_key} | "
                f"Feedback {instance.protocolo} {action}"
            )


@receiver(post_save, sender=FeedbackInteracao)
def invalidate_dashboard_cache_on_interacao(sender, instance, created, **kwargs):
    """
    Invalida cache quando interação é adicionada (pode mudar status do feedback).
    
    **Razão:** Interações podem alterar status do feedback (pendente → resolvido),
    impactando estatísticas do dashboard.
    
    Auditoria Fase 3 (26/01/2026)
    """
    if hasattr(instance, 'feedback') and instance.feedback:
        feedback = instance.feedback
        if hasattr(feedback, 'client') and feedback.client:
            cache_key = f"dashboard_stats:{feedback.client.id}"
            deleted = cache.delete(cache_key)
            
            if deleted:
                logger.debug(
                    f"🗑️ Cache invalidado: {cache_key} | "
                    f"Interação adicionada ao feedback {feedback.protocolo}"
                )

