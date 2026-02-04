"""
Sistema de Automações - Ouvify
==================================

Sprint 3 - Feature 2: Automações (6h)

Funcionalidades:
- Auto-atribuição por regras
- Escalation automático de SLA
- Lembretes de SLA próximo do vencimento
"""

import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


# =============================================================================
# AUTO-ATRIBUIÇÃO
# =============================================================================


@shared_task(bind=True, max_retries=3)
def auto_assign_feedback(self, feedback_id: int):
    """
    Auto-atribui feedback baseado em regras do tenant.

    Regras de atribuição (em ordem de prioridade):
    1. Por tipo de feedback (ex: denúncias → equipe de compliance)
    2. Por prioridade (crítica → supervisores)
    3. Round-robin entre membros disponíveis

    Args:
        feedback_id: ID do feedback a ser atribuído
    """
    from apps.feedbacks.models import Feedback

    try:
        feedback = Feedback.objects.select_related("client").get(id=feedback_id)

        # Já está atribuído? Ignora
        if feedback.assigned_to:
            logger.debug(f"⏭️ Feedback {feedback.protocolo} já atribuído")
            return

        tenant = feedback.client

        # Buscar regras de auto-atribuição do tenant
        rules = getattr(tenant, "auto_assign_rules", None)

        if rules:
            # Tentar atribuição por regra específica
            assigned = _apply_assignment_rules(feedback, rules)
            if assigned:
                return

        # Fallback: Round-robin entre membros ativos
        _round_robin_assignment(feedback)

    except Feedback.DoesNotExist:
        logger.warning(f"❌ Feedback {feedback_id} não encontrado para auto-atribuição")
    except Exception as e:
        logger.error(f"❌ Erro na auto-atribuição: {str(e)}", exc_info=True)
        raise self.retry(exc=e, countdown=60)


def _apply_assignment_rules(feedback, rules: dict) -> bool:
    """
    Aplica regras de atribuição específicas.

    Args:
        feedback: Instância do feedback
        rules: Dict com regras de atribuição

    Returns:
        True se atribuição foi feita, False caso contrário
    """
    from apps.tenants.models import TeamMember

    # Regra por tipo
    type_rules = rules.get("by_type", {})
    if feedback.tipo in type_rules:
        member_id = type_rules[feedback.tipo]
        try:
            member = TeamMember.objects.get(
                id=member_id, client=feedback.client, status=TeamMember.ACTIVE
            )
            _assign_feedback(feedback, member, "tipo")
            return True
        except TeamMember.DoesNotExist:
            pass

    # Regra por prioridade
    priority_rules = rules.get("by_priority", {})
    if feedback.prioridade in priority_rules:
        member_id = priority_rules[feedback.prioridade]
        try:
            member = TeamMember.objects.get(
                id=member_id, client=feedback.client, status=TeamMember.ACTIVE
            )
            _assign_feedback(feedback, member, "prioridade")
            return True
        except TeamMember.DoesNotExist:
            pass

    return False


def _round_robin_assignment(feedback):
    """
    Atribui feedback usando round-robin entre membros ativos.
    """
    from apps.feedbacks.models import Feedback
    from apps.tenants.models import TeamMember

    # Buscar membros ativos do tenant
    members = list(
        TeamMember.objects.filter(client=feedback.client, status=TeamMember.ACTIVE)
        .exclude(role=TeamMember.VIEWER)  # Viewers não recebem atribuições
        .order_by("id")
    )

    if not members:
        logger.warning(
            f"⚠️ Nenhum membro disponível para atribuição no tenant {feedback.client.nome}"
        )
        return

    # Contar feedbacks atribuídos a cada membro (balanceamento)
    member_counts = {}
    for member in members:
        count = Feedback.objects.filter(
            client=feedback.client,
            assigned_to=member,
            status__in=["novo", "pendente", "em_andamento"],
        ).count()
        member_counts[member.id] = count

    # Escolher membro com menos feedbacks
    min_count = min(member_counts.values())
    for member in members:
        if member_counts[member.id] == min_count:
            _assign_feedback(feedback, member, "round_robin")
            return


def _assign_feedback(feedback, member, method: str):
    """Helper para atribuir feedback."""
    from django.utils import timezone

    feedback.assigned_to = member
    feedback.assigned_at = timezone.now()
    feedback.save(update_fields=["assigned_to", "assigned_at"])

    logger.info(
        f"✅ Auto-atribuição ({method}): {feedback.protocolo} → {member.user.username}"
    )


# =============================================================================
# ESCALATION DE SLA
# =============================================================================


@shared_task(bind=True)
def check_sla_escalation(self):
    """
    Verifica feedbacks que estão próximos ou já passaram do SLA.

    Executa a cada 15 minutos via Celery Beat.

    Ações:
    1. SLA vencido → Notifica supervisores
    2. SLA próximo (< 2h) → Notifica responsável
    3. Feedbacks críticos sem resposta → Escalation imediato
    """
    from apps.feedbacks.models import Feedback

    logger.info("🔍 Verificando SLA para escalation...")

    agora = timezone.now()

    # Configurações de SLA padrão
    SLA_PRIMEIRA_RESPOSTA = 24  # horas
    SLA_RESOLUCAO = 72  # horas
    ALERTA_PROXIMO = 2  # horas antes do vencimento

    # Buscar feedbacks pendentes de todos os tenants ativos
    feedbacks_pendentes = Feedback.objects.filter(
        status__in=["novo", "pendente", "em_andamento"], client__ativo=True
    ).select_related("client", "assigned_to")

    escalations = []
    warnings = []

    for fb in feedbacks_pendentes:
        tempo_desde_criacao = agora - fb.data_criacao
        horas_desde_criacao = tempo_desde_criacao.total_seconds() / 3600

        # Feedbacks sem primeira resposta
        if not fb.data_primeira_resposta:
            if horas_desde_criacao >= SLA_PRIMEIRA_RESPOSTA:
                escalations.append(
                    {
                        "feedback": fb,
                        "tipo": "sla_resposta_vencido",
                        "horas": horas_desde_criacao,
                    }
                )
            elif horas_desde_criacao >= (SLA_PRIMEIRA_RESPOSTA - ALERTA_PROXIMO):
                warnings.append(
                    {
                        "feedback": fb,
                        "tipo": "sla_resposta_proximo",
                        "horas_restantes": SLA_PRIMEIRA_RESPOSTA - horas_desde_criacao,
                    }
                )

        # Feedbacks sem resolução
        if fb.status != "resolvido" and not fb.data_resolucao:
            if horas_desde_criacao >= SLA_RESOLUCAO:
                escalations.append(
                    {
                        "feedback": fb,
                        "tipo": "sla_resolucao_vencido",
                        "horas": horas_desde_criacao,
                    }
                )
            elif horas_desde_criacao >= (SLA_RESOLUCAO - ALERTA_PROXIMO):
                warnings.append(
                    {
                        "feedback": fb,
                        "tipo": "sla_resolucao_proximo",
                        "horas_restantes": SLA_RESOLUCAO - horas_desde_criacao,
                    }
                )

        # Feedbacks críticos sem resposta em 4h → Escalation imediato
        if fb.prioridade == "critica" and not fb.data_primeira_resposta:
            if horas_desde_criacao >= 4:
                escalations.append(
                    {
                        "feedback": fb,
                        "tipo": "critico_sem_resposta",
                        "horas": horas_desde_criacao,
                    }
                )

    # Processar escalations
    for item in escalations:
        _process_escalation(item)

    # Processar warnings
    for item in warnings:
        _process_warning(item)

    logger.info(
        f"📊 SLA Check: {len(escalations)} escalations, {len(warnings)} warnings"
    )

    return {"escalations": len(escalations), "warnings": len(warnings)}


def _process_escalation(item: dict):
    """Processa um escalation de SLA."""
    fb = item["feedback"]
    tipo = item["tipo"]

    logger.warning(
        f"🚨 ESCALATION [{tipo}]: {fb.protocolo} | "
        f"Tenant: {fb.client.nome} | Horas: {item.get('horas', 0):.1f}h"
    )

    # Criar notificação de escalation
    try:
        from apps.notifications.tasks import send_escalation_notification

        send_escalation_notification.delay(fb.id, tipo)
    except Exception as e:
        logger.error(f"Erro ao enviar notificação de escalation: {e}")


def _process_warning(item: dict):
    """Processa um warning de SLA próximo."""
    fb = item["feedback"]
    tipo = item["tipo"]

    logger.info(
        f"⚠️ SLA WARNING [{tipo}]: {fb.protocolo} | "
        f"Tenant: {fb.client.nome} | Restam: {item.get('horas_restantes', 0):.1f}h"
    )

    # Enviar lembrete ao responsável
    if fb.assigned_to:
        try:
            from apps.notifications.tasks import send_sla_reminder

            send_sla_reminder.delay(fb.id, item.get("horas_restantes", 0))
        except Exception as e:
            logger.error(f"Erro ao enviar lembrete de SLA: {e}")


# =============================================================================
# LEMBRETES AUTOMÁTICOS
# =============================================================================


@shared_task(bind=True)
def send_daily_digest(self):
    """
    Envia resumo diário para cada tenant.

    Executa às 9h via Celery Beat.

    Conteúdo:
    - Feedbacks pendentes
    - SLAs vencidos/próximos
    - Estatísticas do dia anterior
    """
    from apps.tenants.models import Client

    logger.info("📧 Gerando digest diário...")

    tenants = Client.objects.filter(ativo=True)

    for tenant in tenants:
        try:
            _generate_tenant_digest(tenant)
        except Exception as e:
            logger.error(f"Erro ao gerar digest para {tenant.nome}: {e}")

    return {"tenants_processed": tenants.count()}


def _generate_tenant_digest(tenant):
    """Gera e envia digest para um tenant."""
    from apps.feedbacks.models import Feedback
    from django.db.models import Count, Q

    agora = timezone.now()
    ontem = agora - timedelta(days=1)

    # Estatísticas
    stats = Feedback.objects.filter(client=tenant).aggregate(
        total_pendentes=Count("id", filter=Q(status__in=["novo", "pendente"])),
        criados_ontem=Count("id", filter=Q(data_criacao__gte=ontem)),
        resolvidos_ontem=Count(
            "id", filter=Q(data_resolucao__gte=ontem, status="resolvido")
        ),
        sla_vencidos=Count(
            "id", filter=Q(sla_primeira_resposta=False) | Q(sla_resolucao=False)
        ),
    )

    logger.info(
        f"📊 Digest [{tenant.nome}]: "
        f"Pendentes: {stats['total_pendentes']} | "
        f"Criados ontem: {stats['criados_ontem']} | "
        f"Resolvidos ontem: {stats['resolvidos_ontem']} | "
        f"SLA vencidos: {stats['sla_vencidos']}"
    )

    # Enviar email de digest (se configurado)
    if hasattr(tenant, "email_digest") and tenant.email_digest:
        try:
            from apps.notifications.tasks import send_digest_email

            send_digest_email.delay(tenant.id, stats)
        except Exception as e:
            logger.error(f"Erro ao enviar digest email: {e}")
