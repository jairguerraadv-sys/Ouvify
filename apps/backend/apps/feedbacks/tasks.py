"""
Celery tasks para envio de emails relacionados a feedbacks.

Tasks disponíveis:
- send_assignment_email: Notifica team member quando feedback é atribuído
- send_new_feedback_email: Notifica admins quando novo feedback é criado
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_assignment_email(self, feedback_id: int, team_member_id: int):
    """
    Envia email ao team member quando feedback é atribuído.

    Args:
        feedback_id: ID do feedback
        team_member_id: ID do TeamMember que recebeu atribuição

    Returns:
        dict: Status do envio
    """
    from apps.feedbacks.models import Feedback
    from apps.tenants.models import TeamMember

    try:
        feedback = Feedback.objects.select_related("client", "assigned_by").get(
            id=feedback_id
        )

        team_member = TeamMember.objects.select_related("user").get(id=team_member_id)

        # Verificar se member quer receber emails (campo será adicionado)
        if (
            hasattr(team_member, "email_notifications")
            and not team_member.email_notifications
        ):
            logger.info(f"📧 Email notifications disabled for {team_member.user.email}")
            return {"status": "skipped", "reason": "notifications_disabled"}

        # Construir URL do feedback
        feedback_url = f"https://{feedback.client.subdominio}.ouvify.com/dashboard/feedbacks/{feedback.id}"

        # Renderizar template HTML
        html_message = render_to_string(
            "emails/feedback_assigned.html",
            {
                "team_member": team_member,
                "feedback": feedback,
                "feedback_url": feedback_url,
                "assigned_by": (
                    feedback.assigned_by.get_full_name()
                    if feedback.assigned_by
                    else "Sistema"
                ),
            },
        )

        # Renderizar versão texto (fallback)
        text_message = f"""
Olá {team_member.user.first_name},

Um feedback foi atribuído para você no {feedback.client.nome}.

Feedback: {feedback.protocolo} - {feedback.titulo}
Tipo: {feedback.get_tipo_display()}
Atribuído por: {feedback.assigned_by.get_full_name() if feedback.assigned_by else 'Sistema'}

Acesse: {feedback_url}

---
Ouvify - Gestão de Feedbacks
        """.strip()

        # Enviar email
        result = send_mail(
            subject=f"[{feedback.client.nome}] Feedback atribuído: {feedback.protocolo}",
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[team_member.user.email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"✅ Email de atribuição enviado para {team_member.user.email}")

        return {
            "status": "sent",
            "email": team_member.user.email,
            "feedback_id": feedback_id,
            "result": result,
        }

    except Exception as exc:
        logger.error(f"❌ Erro ao enviar email de atribuição: {exc}")
        # Retry com backoff exponencial
        raise self.retry(exc=exc, countdown=60 * (2**self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_new_feedback_email(self, feedback_id: int):
    """
    Envia email para admins quando novo feedback é criado.

    Args:
        feedback_id: ID do feedback criado

    Returns:
        dict: Status do envio
    """
    from apps.feedbacks.models import Feedback
    from apps.tenants.models import TeamMember

    try:
        feedback = Feedback.objects.select_related("client").get(id=feedback_id)

        # Buscar admins e owners que querem notificações
        admins = TeamMember.objects.filter(
            client=feedback.client,
            role__in=[TeamMember.OWNER, TeamMember.ADMIN],
            status=TeamMember.ACTIVE,
        ).select_related("user")

        # Filtrar apenas quem tem email_notifications ativo (se campo existir)
        if hasattr(TeamMember, "email_notifications"):
            admins = admins.filter(email_notifications=True)

        if not admins.exists():
            logger.info(
                f"📧 Nenhum admin para notificar sobre feedback {feedback.protocolo}"
            )
            return {"status": "skipped", "reason": "no_recipients"}

        feedback_url = f"https://{feedback.client.subdominio}.ouvify.com/dashboard/feedbacks/{feedback.id}"

        emails_sent = 0
        for admin in admins:
            html_message = render_to_string(
                "emails/new_feedback.html",
                {
                    "admin": admin,
                    "feedback": feedback,
                    "feedback_url": feedback_url,
                },
            )

            text_message = f"""
Olá {admin.user.first_name},

Um novo feedback foi recebido no {feedback.client.nome}.

Protocolo: {feedback.protocolo}
Tipo: {feedback.get_tipo_display()}
Título: {feedback.titulo}

Acesse: {feedback_url}

---
Ouvify - Gestão de Feedbacks
            """.strip()

            send_mail(
                subject=f"[{feedback.client.nome}] Novo feedback: {feedback.protocolo}",
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.user.email],
                html_message=html_message,
                fail_silently=True,
            )
            emails_sent += 1

        logger.info(f"✅ {emails_sent} emails de novo feedback enviados")

        return {
            "status": "sent",
            "emails_sent": emails_sent,
            "feedback_id": feedback_id,
        }

    except Exception as exc:
        logger.error(f"❌ Erro ao enviar email de novo feedback: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2**self.request.retries))
