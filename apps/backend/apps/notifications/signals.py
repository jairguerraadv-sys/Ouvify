"""
Signals para enviar notificações automaticamente
Conecta eventos do sistema a notificações push
"""

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


# Importar Feedback de forma segura
try:
    from apps.feedbacks.models import Feedback

    FEEDBACKS_AVAILABLE = True
except ImportError:
    FEEDBACKS_AVAILABLE = False
    Feedback = None


def _track_field_changes(sender, instance, **kwargs):
    """
    Rastreia mudanças em campos específicos para detectar atualizações

    Este signal pre_save armazena os valores anteriores para comparação
    """
    if not instance.pk:
        # Novo objeto, não há campos anteriores
        instance._previous_status = None
        return

    try:
        # Buscar objeto atual do banco
        old_instance = sender.objects.get(pk=instance.pk)
        instance._previous_status = getattr(old_instance, "status", None)
    except sender.DoesNotExist:
        instance._previous_status = None


def _handle_feedback_notification(sender, instance, created, **kwargs):
    """
    Handler para notificações de feedback

    - Novo feedback → notifica admins do tenant
    - Status alterado → notifica autor (se não anônimo)
    """
    import os

    # Não envia notificações em ambiente de teste
    if os.environ.get("TESTING", "").lower() == "true":
        logger.debug(
            f"TESTING=True - ignorando notificações para feedback {instance.id}"
        )
        return

    from .tasks import send_feedback_created_push, send_status_update_push

    if created:
        # Novo feedback → notificar admins
        logger.info(f"Novo feedback {instance.id} - enviando notificações")
        send_feedback_created_push.delay(instance.id)  # type: ignore[attr-defined]
    else:
        # Verificar se status mudou
        old_status = getattr(instance, "_previous_status", None)
        new_status = getattr(instance, "status", None)

        if old_status and new_status and old_status != new_status:
            logger.info(
                f"Feedback {instance.id} status alterado: {old_status} → {new_status}"
            )
            send_status_update_push.delay(instance.id, old_status)  # type: ignore[attr-defined]


# Registrar signals apenas se o modelo Feedback estiver disponível
if FEEDBACKS_AVAILABLE and Feedback is not None:
    # pre_save para rastrear mudanças
    @receiver(pre_save, sender=Feedback)
    def feedback_pre_save(sender, instance, **kwargs):
        _track_field_changes(sender, instance, **kwargs)

    # post_save para enviar notificações
    @receiver(post_save, sender=Feedback)
    def feedback_post_save(sender, instance, created, **kwargs):
        _handle_feedback_notification(sender, instance, created, **kwargs)

    logger.info("Signals de notificação para Feedback registrados")
else:
    logger.warning("Modelo Feedback não disponível - signals não registrados")
