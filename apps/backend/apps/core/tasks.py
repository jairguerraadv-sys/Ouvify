"""
Tasks Celery para operações assíncronas
Inclui: emails, cache, analytics, cleanup, notificações
"""

import logging
from datetime import timedelta
from typing import List, Optional

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.db import models
from django.utils import timezone

logger = logging.getLogger(__name__)


# =============================================================================
# Tasks de Email
# =============================================================================


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    rate_limit="10/m",
)
def send_email_async(
    self,
    subject: str,
    message: str,
    recipient_list: List[str],
    html_message: Optional[str] = None,
    from_email: Optional[str] = None,
):
    """
    Envia email de forma assíncrona

    Args:
        subject: Assunto do email
        message: Corpo texto simples
        recipient_list: Lista de destinatários
        html_message: Corpo HTML (opcional)
        from_email: Remetente (usa default se não informado)
    """
    try:
        from_email = from_email or settings.DEFAULT_FROM_EMAIL

        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"Email enviado com sucesso para {recipient_list}")
        return True

    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3)
def send_feedback_notification(self, feedback_id: int, event_type: str):
    """
    Envia notificação de feedback para o tenant

    Args:
        feedback_id: ID do feedback
        event_type: Tipo do evento (created, updated, resolved)
    """
    try:
        from apps.feedbacks.models import Feedback

        feedback = Feedback.objects.select_related("client").get(id=feedback_id)
        tenant = feedback.client

        # Obter emails dos administradores do tenant
        admin_emails = []
        if tenant.owner and tenant.owner.email:
            admin_emails.append(tenant.owner.email)

        if not admin_emails:
            logger.warning(f"Nenhum email encontrado para tenant {tenant.id}")
            return False

        # Templates de email por evento
        templates = {
            "created": {
                "subject": f"[Ouvify] Novo feedback recebido - {feedback.protocolo}",
                "message": f"""
Olá,

Um novo feedback foi recebido na sua plataforma Ouvify.

Protocolo: {feedback.protocolo}
Tipo: {feedback.get_tipo_display()}
Título: {feedback.titulo}

Acesse o dashboard para mais detalhes.

Atenciosamente,
Equipe Ouvify
                """.strip(),
            },
            "updated": {
                "subject": f"[Ouvify] Feedback atualizado - {feedback.protocolo}",
                "message": f"""
Olá,

O feedback {feedback.protocolo} foi atualizado.

Novo status: {feedback.get_status_display()}

Acesse o dashboard para mais detalhes.

Atenciosamente,
Equipe Ouvify
                """.strip(),
            },
            "resolved": {
                "subject": f"[Ouvify] Feedback resolvido - {feedback.protocolo}",
                "message": f"""
Olá,

O feedback {feedback.protocolo} foi marcado como resolvido.

Tipo: {feedback.get_tipo_display()}
Título: {feedback.titulo}

Parabéns pela resolução!

Atenciosamente,
Equipe Ouvify
                """.strip(),
            },
        }

        template = templates.get(event_type, templates["updated"])

        send_email_async.delay(  # type: ignore[attr-defined]
            subject=template["subject"],
            message=template["message"],
            recipient_list=admin_emails,
        )

        return True

    except Exception as e:
        logger.error(f"Erro ao enviar notificação: {e}")
        raise self.retry(exc=e)


# =============================================================================
# Tasks de Cache
# =============================================================================


@shared_task
def update_analytics_cache():
    """
    Atualiza cache de analytics para todos os tenants ativos
    """
    from django.core.cache import cache
    from django.db.models import Count

    from apps.feedbacks.models import Feedback
    from apps.tenants.models import Client

    tenants = Client.objects.filter(ativo=True)

    for tenant in tenants:
        try:
            stats = Feedback.objects.filter(client=tenant).aggregate(
                total=Count("id"),
                novos=Count("id", filter=models.Q(status="novo")),
                em_andamento=Count("id", filter=models.Q(status="em_andamento")),
                resolvidos=Count("id", filter=models.Q(status="resolvido")),
            )

            cache_key = f"analytics:tenant:{tenant.id}"
            cache.set(cache_key, stats, timeout=60 * 60)  # 1 hora

            logger.debug(f"Cache atualizado para tenant {tenant.id}")

        except Exception as e:
            logger.error(f"Erro ao atualizar cache do tenant {tenant.id}: {e}")

    return len(tenants)


@shared_task
def invalidate_tenant_cache(tenant_id: int):
    """
    Invalida cache de um tenant específico
    """
    from django.core.cache import cache

    cache_keys = [
        f"analytics:tenant:{tenant_id}",
        f"feedbacks:tenant:{tenant_id}",
        f"dashboard:tenant:{tenant_id}",
    ]

    cache.delete_many(cache_keys)
    logger.info(f"Cache invalidado para tenant {tenant_id}")

    return True


@shared_task
def warm_cache_for_tenant(tenant_id: int):
    """
    Aquece cache para um tenant específico
    """
    from django.core.cache import cache
    from django.db.models import Count, Q

    from apps.feedbacks.models import Feedback
    from apps.tenants.models import Client

    try:
        tenant = Client.objects.get(id=tenant_id)

        # Stats básicas
        stats = Feedback.objects.filter(client=tenant).aggregate(
            total=Count("id"),
            novos=Count("id", filter=Q(status="novo")),
            em_andamento=Count("id", filter=Q(status="em_andamento")),
            resolvidos=Count("id", filter=Q(status="resolvido")),
        )
        cache.set(f"analytics:tenant:{tenant_id}", stats, timeout=60 * 60)

        # Feedbacks recentes
        recent = list(
            Feedback.objects.filter(client=tenant)
            .order_by("-created_at")[:10]
            .values("id", "protocolo", "titulo", "status", "created_at")
        )
        cache.set(f"recent:tenant:{tenant_id}", recent, timeout=60 * 15)

        logger.info(f"Cache aquecido para tenant {tenant_id}")
        return True

    except Exception as e:
        logger.error(f"Erro ao aquecer cache: {e}")
        return False


# =============================================================================
# Tasks de Cleanup
# =============================================================================


@shared_task
def cleanup_expired_tokens():
    """
    Remove tokens JWT blacklistados expirados
    """
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

        # Remover tokens expirados
        expired = OutstandingToken.objects.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()

        logger.info(f"Removidos {count} tokens expirados")
        return count

    except ImportError:
        logger.warning("Token blacklist não disponível")
        return 0


@shared_task
def cleanup_old_sessions():
    """
    Remove sessões antigas inativas
    """
    from django.contrib.sessions.models import Session

    # Sessões expiradas
    Session.objects.filter(expire_date__lt=timezone.now()).delete()

    logger.info("Sessões antigas removidas")
    return True


@shared_task
def cleanup_old_feedbacks(days: int = 365):
    """
    Arquiva feedbacks muito antigos (soft delete)
    """
    from apps.feedbacks.models import Feedback

    cutoff = timezone.now() - timedelta(days=days)

    old_feedbacks = Feedback.objects.filter(
        created_at__lt=cutoff, status="resolvido", arquivado=False
    )

    count = old_feedbacks.count()
    old_feedbacks.update(arquivado=True)

    logger.info(f"Arquivados {count} feedbacks antigos")
    return count


# =============================================================================
# Tasks de Relatórios
# =============================================================================


@shared_task
def send_daily_digest():
    """
    Envia digest diário para todos os tenants
    """
    from django.db.models import Count

    from apps.feedbacks.models import Feedback
    from apps.tenants.models import Client

    yesterday = timezone.now() - timedelta(days=1)

    tenants = Client.objects.filter(ativo=True)
    sent_count = 0

    for tenant in tenants:
        try:
            # Stats do dia anterior
            daily_stats = Feedback.objects.filter(
                client=tenant, created_at__gte=yesterday
            ).aggregate(
                novos=Count("id"),
            )

            # Só envia se houver atividade
            if daily_stats["novos"] > 0:
                admin_email = tenant.owner.email if tenant.owner else None

                if admin_email:
                    send_email_async.delay(  # type: ignore[attr-defined]
                        subject=f"[Ouvify] Resumo diário - {tenant.nome}",
                        message=f"""
Olá,

Aqui está o resumo de atividades de ontem:

• Novos feedbacks: {daily_stats['novos']}

Acesse o dashboard para mais detalhes.

Atenciosamente,
Equipe Ouvify
                        """.strip(),
                        recipient_list=[admin_email],
                    )
                    sent_count += 1

        except Exception as e:
            logger.error(f"Erro ao enviar digest para {tenant.id}: {e}")

    logger.info(f"Enviados {sent_count} digests diários")
    return sent_count


@shared_task(bind=True)
def generate_report_async(
    self, tenant_id: int, report_type: str, params: Optional[dict] = None
):
    """
    Gera relatório assíncrono
    """
    if params is None:
        params = {}
    from apps.feedbacks.models import Feedback
    from apps.tenants.models import Client

    try:
        tenant = Client.objects.get(id=tenant_id)

        if report_type == "feedbacks":
            # Gerar relatório de feedbacks
            data = list(
                Feedback.objects.filter(client=tenant).values(
                    "protocolo", "tipo", "status", "created_at", "titulo"
                )
            )

            # Aqui poderia gerar CSV/PDF e salvar em storage
            return {
                "status": "completed",
                "records": len(data),
                "report_type": report_type,
            }

        return {"status": "unknown_report_type"}

    except Exception as e:
        logger.error(f"Erro ao gerar relatório: {e}")
        raise self.retry(exc=e)


# =============================================================================
# Tasks de Integração (ElasticSearch)
# =============================================================================


@shared_task
def index_feedback_async(feedback_id: int):
    """
    Indexa feedback no ElasticSearch de forma assíncrona
    """
    try:
        from apps.feedbacks.documents import FeedbackDocument
        from apps.feedbacks.models import Feedback

        feedback = Feedback.objects.get(id=feedback_id)
        FeedbackDocument().update(feedback)

        logger.debug(f"Feedback {feedback_id} indexado")
        return True

    except ImportError:
        logger.warning("ElasticSearch não disponível")
        return False
    except Exception as e:
        logger.error(f"Erro ao indexar feedback: {e}")
        return False


@shared_task
def rebuild_search_index(tenant_id: Optional[int] = None):
    """
    Reconstrói índice de busca
    """
    try:
        from apps.feedbacks.documents import FeedbackDocument
        from apps.feedbacks.models import Feedback

        qs = Feedback.objects.all()
        if tenant_id:
            qs = qs.filter(client_id=tenant_id)

        count = 0
        for feedback in qs.iterator(chunk_size=100):
            FeedbackDocument().update(feedback)
            count += 1

        logger.info(f"Índice reconstruído: {count} documentos")
        return count

    except ImportError:
        logger.warning("ElasticSearch não disponível")
        return 0
