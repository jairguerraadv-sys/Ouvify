"""
Billing Serializers - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe
"""
from rest_framework import serializers
from .models import Plan, Subscription, Invoice


class PlanSerializer(serializers.ModelSerializer):
    """Serializer para planos de assinatura."""
    
    price_display = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'slug',
            'price_cents',
            'price_display',
            'currency',
            'description',
            'features',
            'limits',
            'is_popular',
            'is_free',
            'trial_days',
            'is_active'
        ]
        read_only_fields = ['id']


class PlanPublicSerializer(serializers.ModelSerializer):
    """Serializer público para exibição de planos (sem dados sensíveis)."""
    
    price_display = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'slug',
            'price_cents',
            'price_display',
            'currency',
            'description',
            'features',
            'limits',
            'is_popular',
            'is_free',
            'trial_days'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer para assinaturas."""
    
    plan = PlanSerializer(read_only=True)
    is_active = serializers.ReadOnlyField()
    is_trialing = serializers.ReadOnlyField()
    trial_days_remaining = serializers.ReadOnlyField()
    can_access_features = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'plan',
            'status',
            'is_active',
            'is_trialing',
            'trial_days_remaining',
            'can_access_features',
            'trial_start',
            'trial_end',
            'current_period_start',
            'current_period_end',
            'cancel_at_period_end',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer para faturas."""
    
    amount_display = serializers.ReadOnlyField()
    is_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'subscription',
            'amount_cents',
            'amount_display',
            'currency',
            'status',
            'is_paid',
            'pdf_url',
            'hosted_invoice_url',
            'period_start',
            'period_end',
            'paid_at',
            'due_date',
            'description',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CheckoutRequestSerializer(serializers.Serializer):
    """Serializer para requisição de checkout."""
    
    plan_id = serializers.IntegerField(required=True)
    success_url = serializers.URLField(required=True)
    cancel_url = serializers.URLField(required=True)


class CheckoutResponseSerializer(serializers.Serializer):
    """Serializer para resposta de checkout."""
    
    session_id = serializers.CharField()
    checkout_url = serializers.URLField()


class PortalRequestSerializer(serializers.Serializer):
    """Serializer para requisição do portal de billing."""
    
    return_url = serializers.URLField(required=True)


class PortalResponseSerializer(serializers.Serializer):
    """Serializer para resposta do portal de billing."""
    
    portal_url = serializers.URLField()


class SubscriptionStatusSerializer(serializers.Serializer):
    """Serializer para status da assinatura."""
    
    has_subscription = serializers.BooleanField()
    plan = PlanSerializer(allow_null=True)
    status = serializers.CharField(allow_null=True)
    is_trialing = serializers.BooleanField(default=False)
    trial_days_remaining = serializers.IntegerField(default=0)
    current_period_end = serializers.DateTimeField(allow_null=True)
    cancel_at_period_end = serializers.BooleanField(default=False)
    can_access = serializers.BooleanField(default=False)


class CancelSubscriptionSerializer(serializers.Serializer):
    """Serializer para cancelamento de assinatura."""
    
    at_period_end = serializers.BooleanField(default=True)
