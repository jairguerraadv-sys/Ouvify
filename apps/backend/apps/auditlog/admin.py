"""
Admin para Audit Log
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import AuditLog, AuditLogSummary, UserSession


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin para visualização de Audit Logs."""

    list_display = [
        "timestamp",
        "action_badge",
        "severity_badge",
        "user_display",
        "description_short",
        "ip_address",
    ]
    list_filter = [
        "action",
        "severity",
        "timestamp",
        "tenant",
    ]
    search_fields = [
        "description",
        "user__email",
        "ip_address",
        "object_repr",
    ]
    readonly_fields = [
        "timestamp",
        "action",
        "severity",
        "description",
        "user",
        "tenant",
        "content_type",
        "object_id",
        "object_repr",
        "ip_address",
        "user_agent",
        "metadata",
    ]
    date_hierarchy = "timestamp"
    ordering = ["-timestamp"]

    def has_add_permission(self, request):
        """Desabilita criação manual."""
        return False

    def has_change_permission(self, request, obj=None):
        """Desabilita edição."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Apenas superusuários podem deletar logs."""
        return request.user.is_superuser

    def action_badge(self, obj):
        """Exibe ação como badge colorido."""
        colors = {
            "LOGIN": "#22c55e",
            "LOGOUT": "#6b7280",
            "LOGIN_FAILED": "#ef4444",
            "CREATE": "#3b82f6",
            "UPDATE": "#f59e0b",
            "DELETE": "#ef4444",
            "SECURITY_ALERT": "#dc2626",
        }
        color = colors.get(obj.action, "#6b7280")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 4px; font-size: 11px;">{} {}</span>',
            color,
            obj.action_icon,
            obj.get_action_display(),
        )

    action_badge.short_description = "Ação"
    action_badge.admin_order_field = "action"

    def severity_badge(self, obj):
        """Exibe severidade como badge."""
        colors = {
            "INFO": "#3b82f6",
            "WARNING": "#f59e0b",
            "ERROR": "#ef4444",
            "CRITICAL": "#dc2626",
        }
        color = colors.get(obj.severity, "#6b7280")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 4px; font-size: 10px;">{}</span>',
            color,
            obj.get_severity_display(),
        )

    severity_badge.short_description = "Severidade"
    severity_badge.admin_order_field = "severity"

    def user_display(self, obj):
        """Exibe email do usuário ou 'Sistema'."""
        if obj.user:
            return obj.user.email
        return format_html('<em style="color: #6b7280;">Sistema</em>')

    user_display.short_description = "Usuário"
    user_display.admin_order_field = "user__email"

    def description_short(self, obj):
        """Descrição truncada."""
        if len(obj.description) > 60:
            return obj.description[:60] + "..."
        return obj.description

    description_short.short_description = "Descrição"


@admin.register(AuditLogSummary)
class AuditLogSummaryAdmin(admin.ModelAdmin):
    """Admin para resumos de Audit Log."""

    list_display = ["date", "tenant", "action", "count", "unique_users"]
    list_filter = ["date", "action", "tenant"]
    ordering = ["-date"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Admin para sessões de usuário."""

    list_display = [
        "user",
        "started_at",
        "last_activity",
        "is_active_badge",
        "duration_display",
        "device_type",
        "browser",
        "ip_address",
    ]
    list_filter = ["is_active", "device_type", "browser", "os"]
    search_fields = ["user__email", "ip_address"]
    readonly_fields = [
        "user",
        "tenant",
        "session_key",
        "started_at",
        "last_activity",
        "ended_at",
        "ip_address",
        "user_agent",
        "device_type",
        "browser",
        "os",
    ]
    date_hierarchy = "started_at"
    ordering = ["-started_at"]

    def is_active_badge(self, obj):
        """Badge para status ativo."""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #22c55e; color: white; '
                'padding: 2px 8px; border-radius: 4px;">Ativa</span>'
            )
        return format_html(
            '<span style="background-color: #6b7280; color: white; '
            'padding: 2px 8px; border-radius: 4px;">Encerrada</span>'
        )

    is_active_badge.short_description = "Status"

    def duration_display(self, obj):
        """Exibe duração formatada."""
        minutes = obj.duration
        if minutes < 60:
            return f"{minutes} min"
        hours = minutes // 60
        mins = minutes % 60
        return f"{hours}h {mins}min"

    duration_display.short_description = "Duração"
