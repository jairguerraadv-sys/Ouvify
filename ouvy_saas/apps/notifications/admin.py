"""
Admin para o módulo de notificações
"""
from django.contrib import admin
from .models import PushSubscription, Notification, NotificationPreference


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tenant', 'active', 'created_at', 'last_used']
    list_filter = ['active', 'tenant', 'created_at']
    search_fields = ['user__email', 'endpoint']
    readonly_fields = ['created_at', 'updated_at', 'last_used']
    raw_id_fields = ['user', 'tenant']
    
    fieldsets = (
        ('Identificação', {
            'fields': ('user', 'tenant', 'active')
        }),
        ('Dados da Subscription', {
            'fields': ('endpoint', 'p256dh', 'auth'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('user_agent', 'ip_address'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_used'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'tipo', 'user', 'tenant', 'sent_at', 'is_read', 'delivery_success']
    list_filter = ['tipo', 'delivery_success', 'tenant', 'sent_at']
    search_fields = ['title', 'body', 'user__email']
    readonly_fields = ['sent_at', 'read_at', 'clicked_at', 'push_sent_count']
    raw_id_fields = ['user', 'tenant']
    date_hierarchy = 'sent_at'
    
    fieldsets = (
        ('Destinatário', {
            'fields': ('tenant', 'user')
        }),
        ('Conteúdo', {
            'fields': ('tipo', 'title', 'body', 'icon', 'url', 'data')
        }),
        ('Status', {
            'fields': ('sent_at', 'read_at', 'clicked_at')
        }),
        ('Entrega', {
            'fields': ('delivery_success', 'delivery_error', 'push_sent_count'),
            'classes': ('collapse',)
        }),
    )
    
    def is_read(self, obj):
        return obj.read_at is not None
    is_read.boolean = True
    is_read.short_description = 'Lida'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 
        'notify_feedback_novo', 
        'notify_feedback_atualizado',
        'quiet_hours_enabled'
    ]
    list_filter = ['quiet_hours_enabled']
    search_fields = ['user__email']
    raw_id_fields = ['user']
