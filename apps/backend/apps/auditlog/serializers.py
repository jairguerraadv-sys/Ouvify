"""
Serializers para Audit Log API
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AuditLog, AuditLogSummary, UserSession

User = get_user_model()


class AuditLogUserSerializer(serializers.ModelSerializer):
    """Serializer simplificado para usuário em audit logs."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name"]
        read_only_fields = fields

    def get_full_name(self, obj):
        """Retorna nome completo ou username como fallback."""
        return obj.get_full_name() or obj.username


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer para visualização de audit logs."""

    user = AuditLogUserSerializer(read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    action_icon = serializers.CharField(read_only=True)
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "timestamp",
            "action",
            "action_display",
            "action_icon",
            "severity",
            "severity_display",
            "description",
            "user",
            "content_type_name",
            "object_id",
            "object_repr",
            "ip_address",
            "metadata",
        ]
        read_only_fields = fields

    def get_content_type_name(self, obj):
        """Retorna o nome legível do tipo de conteúdo."""
        if obj.content_type:
            return obj.content_type.model_class()._meta.verbose_name
        return None


class AuditLogCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de audit logs via API."""

    class Meta:
        model = AuditLog
        fields = [
            "action",
            "severity",
            "description",
            "object_id",
            "metadata",
        ]

    def create(self, validated_data):
        """Adiciona contexto da request ao criar."""
        request = self.context.get("request")
        if request:
            validated_data["user"] = (
                request.user if request.user.is_authenticated else None
            )
            validated_data["ip_address"] = self._get_client_ip(request)
            validated_data["user_agent"] = request.META.get("HTTP_USER_AGENT", "")

            # Tenta obter tenant do usuário
            if hasattr(request.user, "client"):
                validated_data["tenant"] = request.user.client

        return super().create(validated_data)

    def _get_client_ip(self, request):
        """Extrai IP do cliente considerando proxies."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class AuditLogSummarySerializer(serializers.ModelSerializer):
    """Serializer para resumos de audit log."""

    action_display = serializers.SerializerMethodField()

    class Meta:
        model = AuditLogSummary
        fields = [
            "id",
            "date",
            "action",
            "action_display",
            "count",
            "unique_users",
        ]
        read_only_fields = fields

    def get_action_display(self, obj):
        """Retorna display name da ação."""
        action_dict = dict(AuditLog.ACTION_CHOICES)
        return action_dict.get(obj.action, obj.action)


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer para sessões de usuário."""

    user_email = serializers.CharField(source="user.email", read_only=True)
    duration = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserSession
        fields = [
            "id",
            "user_email",
            "session_key",
            "started_at",
            "last_activity",
            "ended_at",
            "ip_address",
            "device_type",
            "browser",
            "os",
            "is_active",
            "duration",
        ]
        read_only_fields = fields


# ===== ANALYTICS SERIALIZERS =====


class ActionCountSerializer(serializers.Serializer):
    """Serializer para contagem por ação."""

    action = serializers.CharField()
    action_display = serializers.CharField()
    count = serializers.IntegerField()


class TimeSeriesDataSerializer(serializers.Serializer):
    """Serializer para dados de série temporal."""

    date = serializers.DateField()
    count = serializers.IntegerField()


class SeverityBreakdownSerializer(serializers.Serializer):
    """Serializer para breakdown por severidade."""

    severity = serializers.CharField()
    severity_display = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class TopUsersSerializer(serializers.Serializer):
    """Serializer para top usuários por atividade."""

    user_id = serializers.IntegerField()
    user_email = serializers.EmailField()
    user_full_name = serializers.CharField()
    action_count = serializers.IntegerField()


class AuditAnalyticsSerializer(serializers.Serializer):
    """Serializer para dados de analytics consolidados."""

    total_logs = serializers.IntegerField()
    total_users_active = serializers.IntegerField()
    action_breakdown = ActionCountSerializer(many=True)
    severity_breakdown = SeverityBreakdownSerializer(many=True)
    time_series = TimeSeriesDataSerializer(many=True)
    top_users = TopUsersSerializer(many=True)
    security_alerts = serializers.IntegerField()
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
