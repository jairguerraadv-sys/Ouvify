"""
Billing Admin - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe
"""
from django.contrib import admin
from .models import Plan, Subscription, Invoice


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price_display', 'is_active', 'is_popular', 'trial_days']
    list_filter = ['is_active', 'is_popular']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'price_cents']
    
    fieldsets = (
        ('Identificação', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Preços', {
            'fields': ('price_cents', 'currency', 'stripe_price_id', 'stripe_product_id')
        }),
        ('Features & Limites', {
            'fields': ('features', 'limits'),
            'classes': ('collapse',)
        }),
        ('Configurações', {
            'fields': ('is_active', 'is_popular', 'trial_days', 'display_order')
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['client', 'plan', 'status', 'is_active', 'trial_days_remaining', 'current_period_end']
    list_filter = ['status', 'plan', 'cancel_at_period_end']
    search_fields = ['client__nome', 'stripe_subscription_id', 'stripe_customer_id']
    raw_id_fields = ['client', 'plan']
    readonly_fields = ['created_at', 'updated_at', 'is_active', 'trial_days_remaining']
    
    fieldsets = (
        ('Relacionamentos', {
            'fields': ('client', 'plan')
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'cancel_at_period_end')
        }),
        ('Stripe', {
            'fields': ('stripe_subscription_id', 'stripe_customer_id'),
            'classes': ('collapse',)
        }),
        ('Datas', {
            'fields': ('trial_start', 'trial_end', 'trial_days_remaining',
                      'current_period_start', 'current_period_end', 'canceled_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'amount_display', 'status', 'is_paid', 'paid_at', 'created_at']
    list_filter = ['status', 'currency']
    search_fields = ['client__nome', 'stripe_invoice_id', 'description']
    raw_id_fields = ['client', 'subscription']
    readonly_fields = ['created_at', 'updated_at', 'amount_display', 'is_paid']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Relacionamentos', {
            'fields': ('client', 'subscription')
        }),
        ('Valores', {
            'fields': ('amount_cents', 'amount_display', 'currency')
        }),
        ('Status', {
            'fields': ('status', 'is_paid')
        }),
        ('Stripe', {
            'fields': ('stripe_invoice_id', 'pdf_url', 'hosted_invoice_url'),
            'classes': ('collapse',)
        }),
        ('Datas', {
            'fields': ('period_start', 'period_end', 'paid_at', 'due_date')
        }),
        ('Informações', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
