"""
Webhook Admin - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import WebhookEndpoint, WebhookEvent, WebhookDelivery


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    """Admin para WebhookEndpoint."""
    
    list_display = (
        'name',
        'client',
        'url_preview',
        'is_active_badge',
        'event_count',
        'success_rate',
        'created_at',
    )
    list_filter = ('is_active', 'created_at', 'client')
    search_fields = ('name', 'url', 'client__nome')
    readonly_fields = ('id', 'secret', 'created_at', 'updated_at', 'total_deliveries', 'successful_deliveries')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'client', 'url', 'description')
        }),
        ('Configuração', {
            'fields': ('events', 'is_active', 'secret')
        }),
        ('Estatísticas', {
            'fields': ('total_deliveries', 'successful_deliveries'),
            'classes': ('collapse',)
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def url_preview(self, obj):
        """Mostra URL truncada."""
        url = obj.url
        if len(url) > 40:
            url = url[:40] + '...'
        return url
    url_preview.short_description = 'URL'
    
    def is_active_badge(self, obj):
        """Badge visual para status ativo."""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #4ade80; color: white; padding: 3px 8px; border-radius: 4px;">Ativo</span>'
            )
        return format_html(
            '<span style="background-color: #f87171; color: white; padding: 3px 8px; border-radius: 4px;">Inativo</span>'
        )
    is_active_badge.short_description = 'Status'
    
    def event_count(self, obj):
        """Conta eventos inscritos."""
        return len(obj.events) if obj.events else 0
    event_count.short_description = 'Eventos'
    
    def success_rate(self, obj):
        """Taxa de sucesso."""
        if obj.total_deliveries == 0:
            return '-'
        rate = (obj.successful_deliveries / obj.total_deliveries) * 100
        color = '#4ade80' if rate >= 90 else '#fbbf24' if rate >= 70 else '#f87171'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color,
            rate
        )
    success_rate.short_description = 'Taxa Sucesso'


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """Admin para WebhookEvent."""
    
    list_display = (
        'id',
        'event_type',
        'source_model',
        'source_id',
        'delivery_count',
        'created_at',
    )
    list_filter = ('event_type', 'source_model', 'created_at')
    search_fields = ('event_type', 'source_model', 'source_id')
    readonly_fields = ('id', 'payload_preview', 'created_at')
    
    def delivery_count(self, obj):
        """Conta entregas do evento."""
        return obj.deliveries.count()
    delivery_count.short_description = 'Entregas'
    
    def payload_preview(self, obj):
        """Preview formatado do payload."""
        import json
        return format_html(
            '<pre style="max-height: 300px; overflow-y: auto;">{}</pre>',
            json.dumps(obj.payload, indent=2, ensure_ascii=False)
        )
    payload_preview.short_description = 'Payload'


@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    """Admin para WebhookDelivery."""
    
    list_display = (
        'id',
        'endpoint',
        'event_type',
        'status_badge',
        'response_status',
        'duration_ms',
        'attempt',
        'created_at',
    )
    list_filter = ('success', 'response_status', 'created_at', 'endpoint')
    search_fields = ('endpoint__name', 'event__event_type')
    readonly_fields = ('id', 'endpoint', 'event', 'response_body_preview', 'created_at')
    
    def event_type(self, obj):
        """Tipo do evento."""
        return obj.event.event_type
    event_type.short_description = 'Tipo Evento'
    
    def status_badge(self, obj):
        """Badge visual para sucesso."""
        if obj.success:
            return format_html(
                '<span style="background-color: #4ade80; color: white; padding: 3px 8px; border-radius: 4px;">✓</span>'
            )
        return format_html(
            '<span style="background-color: #f87171; color: white; padding: 3px 8px; border-radius: 4px;">✗</span>'
        )
    status_badge.short_description = 'Status'
    
    def response_body_preview(self, obj):
        """Preview do corpo da resposta."""
        if not obj.response_body:
            return '-'
        body = obj.response_body
        if len(body) > 500:
            body = body[:500] + '...'
        return format_html('<pre>{}</pre>', body)
    response_body_preview.short_description = 'Resposta'
