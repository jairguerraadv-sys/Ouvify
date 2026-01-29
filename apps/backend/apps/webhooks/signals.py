"""
Webhook Signals - Ouvy SaaS
Sprint 5 - Feature 5.2: Integrações (Webhooks)

Signals para disparar webhooks automaticamente
"""
import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.feedbacks.models import Feedback
from .services import (
    trigger_feedback_created,
    trigger_feedback_status_changed,
    trigger_feedback_resolved,
)

logger = logging.getLogger(__name__)


# Cache para armazenar status antigo do feedback
_feedback_status_cache = {}


@receiver(pre_save, sender=Feedback)
def cache_feedback_status(sender, instance, **kwargs):
    """Cache do status antigo antes de salvar."""
    if instance.pk:
        try:
            old_instance = Feedback.objects.get(pk=instance.pk)
            _feedback_status_cache[instance.pk] = old_instance.status
        except Feedback.DoesNotExist:
            pass


@receiver(post_save, sender=Feedback)
def trigger_feedback_webhooks(sender, instance, created, **kwargs):
    """
    Dispara webhooks quando um feedback é criado ou atualizado.
    """
    try:
        if created:
            # Novo feedback criado
            trigger_feedback_created(instance)
            logger.info(f"Webhook triggered: feedback.created for {instance.protocolo}")
        else:
            # Feedback atualizado - verificar se status mudou
            old_status = _feedback_status_cache.pop(instance.pk, None)
            
            if old_status and old_status != instance.status:
                trigger_feedback_status_changed(instance, old_status, instance.status)
                logger.info(
                    f"Webhook triggered: feedback.status_changed for {instance.protocolo} "
                    f"({old_status} -> {instance.status})"
                )
                
                # Se resolvido, disparar evento específico
                if instance.status in ['resolvido', 'concluido', 'fechado']:
                    trigger_feedback_resolved(instance)
                    logger.info(f"Webhook triggered: feedback.resolved for {instance.protocolo}")
                    
    except Exception as e:
        # Não deixar erro de webhook quebrar o fluxo principal
        logger.error(f"Error triggering webhook: {e}", exc_info=True)
