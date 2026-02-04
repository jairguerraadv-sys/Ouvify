from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.feedbacks.models import Feedback
from config.feature_flags import feature_flags


class AnalyticsView(APIView):
    """
    View para métricas básicas de analytics
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retorna métricas básicas do sistema
        """
        # Verificar se analytics está habilitado
        if not feature_flags.is_enabled("ANALYTICS"):
            return Response(
                {"error": "Analytics desabilitado para este ambiente"}, status=403
            )

        # Calcular período (últimos 30 dias)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)

        # Métricas gerais
        total_feedbacks = Feedback.objects.count()
        feedbacks_periodo = Feedback.objects.filter(
            data_criacao__gte=start_date, data_criacao__lte=end_date
        ).count()

        # Métricas por status
        status_counts = Feedback.objects.aggregate(
            pendente=Count("id", filter=Q(status="pendente")),
            em_analise=Count("id", filter=Q(status="em_analise")),
            resolvido=Count("id", filter=Q(status="resolvido")),
            fechado=Count("id", filter=Q(status="fechado")),
        )

        # Métricas por tipo
        tipo_counts = Feedback.objects.aggregate(
            reclamacao=Count("id", filter=Q(tipo="reclamacao")),
            sugestao=Count("id", filter=Q(tipo="sugestao")),
            denuncia=Count("id", filter=Q(tipo="denuncia")),
            elogio=Count("id", filter=Q(tipo="elogio")),
        )

        # Métricas por tenant
        tenant_counts = (
            Feedback.objects.values("client__nome")
            .annotate(total=Count("id"))
            .order_by("-total")[:10]
        )  # Top 10 tenants

        # Taxa de resolução (resolvidos + fechados / total)
        resolvidos_fechados = status_counts["resolvido"] + status_counts["fechado"]
        taxa_resolucao = (
            (resolvidos_fechados / total_feedbacks * 100) if total_feedbacks > 0 else 0
        )

        # Tempo médio de resposta (simplificado - apenas para feedbacks resolvidos)
        feedbacks_resolvidos = Feedback.objects.filter(
            status__in=["resolvido", "fechado"], data_criacao__gte=start_date
        ).exclude(data_atualizacao__isnull=True)

        tempo_medio_resposta = 0
        if feedbacks_resolvidos.exists():
            total_tempo = sum(
                (f.data_atualizacao - f.data_criacao).total_seconds() / 3600  # em horas
                for f in feedbacks_resolvidos
            )
            tempo_medio_resposta = total_tempo / feedbacks_resolvidos.count()

        return Response(
            {
                "periodo": {
                    "inicio": start_date.isoformat(),
                    "fim": end_date.isoformat(),
                },
                "metricas_gerais": {
                    "total_feedbacks": total_feedbacks,
                    "feedbacks_ultimos_30_dias": feedbacks_periodo,
                    "taxa_resolucao_percentual": round(taxa_resolucao, 2),
                    "tempo_medio_resposta_horas": round(tempo_medio_resposta, 2),
                },
                "metricas_por_status": status_counts,
                "metricas_por_tipo": tipo_counts,
                "top_tenants": list(tenant_counts),
                "features_habilitadas": feature_flags.get_enabled_features(),
            }
        )


class AnalyticsDashboardView(APIView):
    """Endpoint de dashboard de analytics (compat com frontend)."""

    permission_classes = [IsAuthenticated]

    PERIOD_DAYS = {
        "week": 7,
        "month": 30,
        "quarter": 90,
        "year": 365,
    }

    WEEKDAY_LABELS = {
        0: "Seg",
        1: "Ter",
        2: "Qua",
        3: "Qui",
        4: "Sex",
        5: "Sáb",
        6: "Dom",
    }

    MONTH_LABELS_PT = {
        1: "Jan",
        2: "Fev",
        3: "Mar",
        4: "Abr",
        5: "Mai",
        6: "Jun",
        7: "Jul",
        8: "Ago",
        9: "Set",
        10: "Out",
        11: "Nov",
        12: "Dez",
    }

    def get(self, request):
        if not feature_flags.is_enabled("ANALYTICS"):
            return Response(
                {"error": "Analytics desabilitado para este ambiente"}, status=403
            )

        period = (request.query_params.get("period") or "month").strip().lower()
        days = self.PERIOD_DAYS.get(period, 30)

        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Base queryset (tenant-aware via TenantAwareModel)
        base_qs = Feedback.objects.filter(
            data_criacao__gte=start_date, data_criacao__lte=end_date
        )

        # Summary
        total_feedbacks = base_qs.count()

        feedbacks_with_first_response = base_qs.exclude(
            tempo_primeira_resposta__isnull=True
        )
        avg_response_time_hours = 0.0
        if feedbacks_with_first_response.exists():
            total_hours = sum(
                (f.tempo_primeira_resposta.total_seconds() / 3600.0)
                for f in feedbacks_with_first_response
                if f.tempo_primeira_resposta
            )
            avg_response_time_hours = total_hours / max(
                feedbacks_with_first_response.count(), 1
            )

        sla_qs = base_qs.exclude(sla_primeira_resposta__isnull=True)
        sla_compliance = 0.0
        if sla_qs.exists():
            within = sla_qs.filter(sla_primeira_resposta=True).count()
            sla_compliance = (within / max(sla_qs.count(), 1)) * 100.0

        # Satisfaction score não existe no modelo; manter 0.0 (frontend tem fallback visual)
        satisfaction_score = 0.0

        # byType (UI usa "Dúvidas"; no backend equivale a "reclamacao")
        by_type_counts = base_qs.aggregate(
            denuncias=Count("id", filter=Q(tipo="denuncia")),
            sugestoes=Count("id", filter=Q(tipo="sugestao")),
            elogios=Count("id", filter=Q(tipo="elogio")),
            duvidas=Count("id", filter=Q(tipo="reclamacao")),
        )
        by_type = [
            {"name": "Denúncias", "value": by_type_counts["denuncias"]},
            {"name": "Sugestões", "value": by_type_counts["sugestoes"]},
            {"name": "Elogios", "value": by_type_counts["elogios"]},
            {"name": "Dúvidas", "value": by_type_counts["duvidas"]},
        ]

        # byStatus (UI tem "Em Progresso" mas o backend não tem esse estado hoje)
        by_status_counts = base_qs.aggregate(
            novo=Count("id", filter=Q(status="pendente")),
            em_analise=Count("id", filter=Q(status="em_analise")),
            resolvido=Count("id", filter=Q(status="resolvido")),
            fechado=Count("id", filter=Q(status="fechado")),
        )
        by_status = [
            {"name": "Novo", "value": by_status_counts["novo"]},
            {"name": "Em Análise", "value": by_status_counts["em_analise"]},
            {"name": "Em Progresso", "value": 0},
            {"name": "Resolvido", "value": by_status_counts["resolvido"]},
            {"name": "Fechado", "value": by_status_counts["fechado"]},
        ]

        # responseTime (últimos 7 dias): média de tempo_primeira_resposta por dia da semana
        response_days = 7
        rt_end = end_date
        rt_start = rt_end - timedelta(days=response_days)
        rt_qs = Feedback.objects.filter(
            data_criacao__gte=rt_start, data_criacao__lte=rt_end
        ).exclude(tempo_primeira_resposta__isnull=True)

        # Para tempo médio, calcular em Python por simplicidade (dataset pequeno: 7 dias)
        response_time = []
        meta_hours = 8
        for delta in range(response_days):
            day_dt = (rt_start + timedelta(days=delta)).date()
            label = self.WEEKDAY_LABELS.get(day_dt.weekday(), "Dia")
            day_feedbacks = rt_qs.filter(data_criacao__date=day_dt)
            tempo = 0.0
            if day_feedbacks.exists():
                total = 0.0
                count = 0
                for f in day_feedbacks:
                    if f.tempo_primeira_resposta:
                        total += f.tempo_primeira_resposta.total_seconds() / 3600.0
                        count += 1
                if count:
                    tempo = total / count
            response_time.append(
                {"day": label, "tempo": round(tempo, 2), "meta": meta_hours}
            )

        # trend: para week -> 7 dias (label Seg..Dom); para demais -> 6 buckets por mês
        trend = []
        if period == "week":
            for delta in range(7):
                day_dt = (start_date + timedelta(days=delta)).date()
                label = self.WEEKDAY_LABELS.get(day_dt.weekday(), "Dia")
                day_qs = base_qs.filter(data_criacao__date=day_dt)
                counts = day_qs.aggregate(
                    denuncias=Count("id", filter=Q(tipo="denuncia")),
                    sugestoes=Count("id", filter=Q(tipo="sugestao")),
                    elogios=Count("id", filter=Q(tipo="elogio")),
                    duvidas=Count("id", filter=Q(tipo="reclamacao")),
                )
                trend.append(
                    {
                        "month": label,
                        "denuncias": counts["denuncias"],
                        "sugestoes": counts["sugestoes"],
                        "elogios": counts["elogios"],
                        "duvidas": counts["duvidas"],
                    }
                )
        else:
            # últimos 6 meses (inclui mês atual)
            for i in range(5, -1, -1):
                month_start = (
                    end_date.replace(day=1) - timedelta(days=30 * i)
                ).replace(day=1)
                month_end = (month_start + timedelta(days=32)).replace(day=1)
                month_qs = Feedback.objects.filter(
                    data_criacao__gte=month_start,
                    data_criacao__lt=month_end,
                )
                counts = month_qs.aggregate(
                    denuncias=Count("id", filter=Q(tipo="denuncia")),
                    sugestoes=Count("id", filter=Q(tipo="sugestao")),
                    elogios=Count("id", filter=Q(tipo="elogio")),
                    duvidas=Count("id", filter=Q(tipo="reclamacao")),
                )
                label = self.MONTH_LABELS_PT.get(
                    month_start.month, str(month_start.month)
                )
                trend.append(
                    {
                        "month": label,
                        "denuncias": counts["denuncias"],
                        "sugestoes": counts["sugestoes"],
                        "elogios": counts["elogios"],
                        "duvidas": counts["duvidas"],
                    }
                )

        return Response(
            {
                "trend": trend,
                "byType": by_type,
                "byStatus": by_status,
                "responseTime": response_time,
                "summary": {
                    "totalFeedbacks": total_feedbacks,
                    "avgResponseTime": round(avg_response_time_hours, 2),
                    "slaCompliance": round(sla_compliance, 2),
                    "satisfactionScore": round(satisfaction_score, 2),
                },
            }
        )
