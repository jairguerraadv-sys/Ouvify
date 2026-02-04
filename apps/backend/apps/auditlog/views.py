"""
Views para Audit Log API
"""

from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AuditLog, AuditLogSummary, UserSession
from .serializers import (AuditAnalyticsSerializer, AuditLogSerializer,
                          AuditLogSummarySerializer, UserSessionSerializer)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualização de audit logs.

    Endpoints:
    - GET /api/auditlog/logs/ - Lista todos os logs
    - GET /api/auditlog/logs/{id}/ - Detalhe de um log
    - GET /api/auditlog/logs/analytics/ - Analytics consolidados
    - GET /api/auditlog/logs/actions/ - Lista de ações disponíveis
    - GET /api/auditlog/logs/export/ - Exporta logs para CSV
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["action", "severity", "user"]
    search_fields = ["description", "object_repr", "user__email"]
    ordering_fields = ["timestamp", "action", "severity"]
    ordering = ["-timestamp"]

    def get_queryset(self):
        """Filtra logs por tenant do usuário."""
        user = self.request.user

        # Superusuário vê todos os logs
        if user.is_superuser:
            queryset = AuditLog.objects.all()
        else:
            # Usuário comum vê apenas logs do seu tenant
            queryset = AuditLog.objects.filter(
                Q(tenant=getattr(user, "client", None)) | Q(user=user)
            )

        # Filtros adicionais via query params
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)

        return queryset.select_related("user", "tenant", "content_type")

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        """
        Retorna dados de analytics consolidados para dashboards.

        Query params:
        - period: Período em dias (default: 30)
        """
        period_days = int(request.query_params.get("period", 30))
        period_start = timezone.now() - timedelta(days=period_days)
        period_end = timezone.now()

        queryset = self.get_queryset().filter(timestamp__gte=period_start)

        # Total de logs
        total_logs = queryset.count()

        # Usuários ativos únicos
        total_users_active = (
            queryset.exclude(user__isnull=True).values("user").distinct().count()
        )

        # Breakdown por ação
        action_breakdown = list(
            queryset.values("action")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        # Adicionar display names
        action_dict = dict(AuditLog.ACTION_CHOICES)
        for item in action_breakdown:
            item["action_display"] = action_dict.get(item["action"], item["action"])

        # Breakdown por severidade
        severity_counts = list(
            queryset.values("severity").annotate(count=Count("id")).order_by("-count")
        )

        severity_dict = dict(AuditLog.SEVERITY_CHOICES)
        total_for_percentage = sum(item["count"] for item in severity_counts) or 1
        severity_breakdown = []
        for item in severity_counts:
            severity_breakdown.append(
                {
                    "severity": item["severity"],
                    "severity_display": severity_dict.get(
                        item["severity"], item["severity"]
                    ),
                    "count": item["count"],
                    "percentage": round(item["count"] / total_for_percentage * 100, 1),
                }
            )

        # Série temporal (últimos N dias)
        time_series = list(
            queryset.annotate(date=TruncDate("timestamp"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        # Top usuários por atividade
        top_users_qs = (
            queryset.exclude(user__isnull=True)
            .values("user__id", "user__email", "user__nome")
            .annotate(action_count=Count("id"))
            .order_by("-action_count")[:5]
        )
        top_users = [
            {
                "user_id": item["user__id"],
                "user_email": item["user__email"],
                "user_nome": item["user__nome"] or "N/A",
                "action_count": item["action_count"],
            }
            for item in top_users_qs
        ]

        # Alertas de segurança
        security_actions = [
            "LOGIN_FAILED",
            "SECURITY_ALERT",
            "SUSPICIOUS_ACTIVITY",
            "ACCESS_DENIED",
        ]
        security_alerts = queryset.filter(action__in=security_actions).count()

        data = {
            "total_logs": total_logs,
            "total_users_active": total_users_active,
            "action_breakdown": action_breakdown,
            "severity_breakdown": severity_breakdown,
            "time_series": time_series,
            "top_users": top_users,
            "security_alerts": security_alerts,
            "period_start": period_start,
            "period_end": period_end,
        }

        serializer = AuditAnalyticsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def actions(self, request):
        """Lista todas as ações disponíveis para filtro."""
        return Response(
            [
                {"value": value, "label": label}
                for value, label in AuditLog.ACTION_CHOICES
            ]
        )

    @action(detail=False, methods=["get"])
    def export(self, request):
        """
        Exporta logs para CSV.

        Query params:
        - format: csv (default)
        - date_from: Data inicial
        - date_to: Data final
        """
        import csv

        from django.http import HttpResponse

        queryset = self.get_queryset()[:10000]  # Limite de 10k registros

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="audit_logs.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Data/Hora",
                "Ação",
                "Severidade",
                "Usuário",
                "Descrição",
                "IP",
                "Objeto Afetado",
            ]
        )

        for log in queryset:
            writer.writerow(
                [
                    log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    log.get_action_display(),
                    log.get_severity_display(),
                    log.user.email if log.user else "Sistema",
                    log.description,
                    log.ip_address or "",
                    log.object_repr,
                ]
            )

        # Registrar a exportação
        AuditLog.objects.create_log(
            action="EXPORT",
            user=request.user if request.user.is_authenticated else None,
            description="Exportação de logs de auditoria",
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            metadata={"count": queryset.count()},
        )

        return response

    @action(detail=False, methods=["get"])
    def recent_security(self, request):
        """
        Retorna eventos de segurança recentes.
        Útil para alertas em dashboards.
        """
        security_actions = [
            "LOGIN_FAILED",
            "SECURITY_ALERT",
            "SUSPICIOUS_ACTIVITY",
            "ACCESS_DENIED",
        ]

        queryset = self.get_queryset().filter(action__in=security_actions)[:50]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _get_client_ip(self, request):
        """Extrai IP do cliente."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class AuditLogSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para resumos agregados de audit logs.

    Endpoints:
    - GET /api/auditlog/summaries/ - Lista resumos
    - GET /api/auditlog/summaries/by_date/ - Resumo por data
    """

    serializer_class = AuditLogSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["action", "date"]
    ordering = ["-date"]

    def get_queryset(self):
        """Filtra por tenant do usuário."""
        user = self.request.user

        if user.is_superuser:
            return AuditLogSummary.objects.all()

        return AuditLogSummary.objects.filter(tenant=getattr(user, "client", None))

    @action(detail=False, methods=["get"])
    def by_date(self, request):
        """
        Retorna resumo agregado por data.

        Query params:
        - days: Número de dias (default: 30)
        """
        days = int(request.query_params.get("days", 30))
        date_from = timezone.now().date() - timedelta(days=days)

        queryset = self.get_queryset().filter(date__gte=date_from)

        # Agregar por data
        aggregated = (
            queryset.values("date")
            .annotate(
                total_count=Count("id"), total_actions=Count("action", distinct=True)
            )
            .order_by("date")
        )

        return Response(list(aggregated))


class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualização de sessões de usuário.

    Endpoints:
    - GET /api/auditlog/sessions/ - Lista sessões
    - GET /api/auditlog/sessions/active/ - Sessões ativas
    - GET /api/auditlog/sessions/stats/ - Estatísticas de sessão
    """

    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["user", "is_active", "device_type"]
    ordering = ["-started_at"]

    def get_queryset(self):
        """Filtra por tenant do usuário."""
        user = self.request.user

        if user.is_superuser:
            return UserSession.objects.all()

        return UserSession.objects.filter(
            Q(tenant=getattr(user, "client", None)) | Q(user=user)
        ).select_related("user")

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Lista apenas sessões ativas."""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Retorna estatísticas de sessão.
        """
        queryset = self.get_queryset()
        last_30_days = timezone.now() - timedelta(days=30)
        recent = queryset.filter(started_at__gte=last_30_days)

        # Device breakdown
        device_breakdown = list(
            recent.values("device_type").annotate(count=Count("id")).order_by("-count")
        )

        # Browser breakdown
        browser_breakdown = list(
            recent.values("browser").annotate(count=Count("id")).order_by("-count")[:5]
        )

        # Sessões ativas
        active_count = queryset.filter(is_active=True).count()

        # Média de duração (em minutos)
        completed_sessions = queryset.filter(ended_at__isnull=False)
        if completed_sessions.exists():
            from django.db.models import (Avg, DurationField,
                                          ExpressionWrapper, F)

            avg_duration_qs = completed_sessions.annotate(
                duration=ExpressionWrapper(
                    F("ended_at") - F("started_at"), output_field=DurationField()
                )
            ).aggregate(avg=Avg("duration"))
            avg_duration = avg_duration_qs["avg"]
            avg_minutes = avg_duration.total_seconds() / 60 if avg_duration else 0
        else:
            avg_minutes = 0

        return Response(
            {
                "active_sessions": active_count,
                "total_sessions_30d": recent.count(),
                "avg_session_duration_minutes": round(avg_minutes, 1),
                "device_breakdown": device_breakdown,
                "browser_breakdown": browser_breakdown,
            }
        )
