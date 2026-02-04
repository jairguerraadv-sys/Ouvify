"""
Billing Models - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe

Modelos:
- Plan: Planos de assinatura
- Subscription: Assinaturas ativas por tenant
- Invoice: Histórico de faturas
"""

from django.db import models
from django.utils import timezone

from apps.core.models import TenantAwareModel


class Plan(models.Model):
    """Modelo para planos de assinatura."""

    # Identificadores
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    # Preços
    price_cents = models.PositiveIntegerField(default=0, help_text="Preço em centavos")
    currency = models.CharField(max_length=3, default="BRL")

    # Stripe
    stripe_price_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_product_id = models.CharField(max_length=100, blank=True, null=True)

    # Features & Limits
    features = models.JSONField(
        default=dict,
        help_text="Features habilitadas: {'analytics': true, 'automations': true, ...}",
    )
    limits = models.JSONField(
        default=dict,
        help_text="Limites: {'feedbacks_per_month': 1000, 'team_members': 5, ...}",
    )

    # Display
    description = models.TextField(blank=True)
    is_popular = models.BooleanField(
        default=False, help_text="Destaque na página de preços"
    )
    display_order = models.PositiveIntegerField(default=0)

    # Status
    is_active = models.BooleanField(default=True)
    trial_days = models.PositiveIntegerField(default=14)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "price_cents"]
        verbose_name = "Plano"
        verbose_name_plural = "Planos"

    def __str__(self):
        return f"{self.name} - R\${self.price_cents/100:.2f}/mês"

    @property
    def price_display(self):
        """Retorna preço formatado."""
        return f"R\$ {self.price_cents/100:.2f}"

    @property
    def is_free(self):
        """Verifica se é plano gratuito."""
        return self.price_cents == 0

    def has_feature(self, feature_name):
        """Verifica se plano tem uma feature específica."""
        return self.features.get(feature_name, False)

    def get_limit(self, limit_name, default=None):
        """Retorna limite específico do plano."""
        return self.limits.get(limit_name, default)


class Subscription(TenantAwareModel):
    """Modelo para assinaturas de tenants."""

    # Status choices
    STATUS_TRIALING = "trialing"
    STATUS_ACTIVE = "active"
    STATUS_PAST_DUE = "past_due"
    STATUS_CANCELED = "canceled"
    STATUS_UNPAID = "unpaid"
    STATUS_INCOMPLETE = "incomplete"

    STATUS_CHOICES = [
        (STATUS_TRIALING, "Trial"),
        (STATUS_ACTIVE, "Ativa"),
        (STATUS_PAST_DUE, "Vencida"),
        (STATUS_CANCELED, "Cancelada"),
        (STATUS_UNPAID, "Não Paga"),
        (STATUS_INCOMPLETE, "Incompleta"),
    ]

    # Relacionamentos
    plan = models.ForeignKey(
        Plan, on_delete=models.PROTECT, related_name="subscriptions"
    )

    # Stripe
    stripe_subscription_id = models.CharField(
        max_length=100, blank=True, null=True, unique=True
    )
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_TRIALING
    )

    # Datas
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    cancel_at_period_end = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Assinatura"
        verbose_name_plural = "Assinaturas"
        # Cada tenant só pode ter uma assinatura ativa
        constraints = [
            models.UniqueConstraint(
                fields=["client"],
                condition=models.Q(status__in=["trialing", "active", "past_due"]),
                name="unique_active_subscription_per_tenant",
            )
        ]

    def __str__(self):
        return f"{self.client.nome} - {self.plan.name} ({self.status})"

    @property
    def is_active(self):
        """Verifica se assinatura está ativa (inclui trial)."""
        return self.status in [self.STATUS_ACTIVE, self.STATUS_TRIALING]

    @property
    def is_trialing(self):
        """Verifica se está em período de trial."""
        return self.status == self.STATUS_TRIALING

    @property
    def trial_days_remaining(self):
        """Retorna dias restantes do trial."""
        if not self.is_trialing or not self.trial_end:
            return 0
        remaining = (self.trial_end - timezone.now()).days
        return max(0, remaining)

    @property
    def can_access_features(self):
        """Verifica se tenant pode acessar features do plano."""
        return self.status in [
            self.STATUS_ACTIVE,
            self.STATUS_TRIALING,
            self.STATUS_PAST_DUE,  # Grace period
        ]

    def start_trial(self, days=None):
        """Inicia período de trial."""
        if days is None:
            days = self.plan.trial_days

        now = timezone.now()
        self.status = self.STATUS_TRIALING
        self.trial_start = now
        self.trial_end = now + timezone.timedelta(days=days)
        self.current_period_start = now
        self.current_period_end = self.trial_end
        self.save()

    def activate(self):
        """Ativa assinatura após pagamento."""
        self.status = self.STATUS_ACTIVE
        self.save()

    def cancel(self, at_period_end=True):
        """Cancela assinatura."""
        if at_period_end:
            self.cancel_at_period_end = True
        else:
            self.status = self.STATUS_CANCELED
            self.canceled_at = timezone.now()
        self.save()

    def has_feature(self, feature_name):
        """Verifica se assinatura dá acesso a uma feature."""
        if not self.can_access_features:
            return False
        return self.plan.has_feature(feature_name)

    def check_limit(self, limit_name, current_value):
        """Verifica se está dentro do limite."""
        limit = self.plan.get_limit(limit_name)
        if limit is None:  # Sem limite
            return True
        return current_value < limit


class Invoice(TenantAwareModel):
    """Modelo para faturas."""

    # Status choices
    STATUS_DRAFT = "draft"
    STATUS_OPEN = "open"
    STATUS_PAID = "paid"
    STATUS_VOID = "void"
    STATUS_UNCOLLECTIBLE = "uncollectible"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Rascunho"),
        (STATUS_OPEN, "Aberta"),
        (STATUS_PAID, "Paga"),
        (STATUS_VOID, "Cancelada"),
        (STATUS_UNCOLLECTIBLE, "Incobrável"),
    ]

    # Relacionamentos
    subscription = models.ForeignKey(
        Subscription, on_delete=models.SET_NULL, null=True, related_name="invoices"
    )

    # Stripe
    stripe_invoice_id = models.CharField(
        max_length=100, blank=True, null=True, unique=True
    )

    # Valores
    amount_cents = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=3, default="BRL")

    # Status
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT
    )

    # URLs
    pdf_url = models.URLField(blank=True, null=True)
    hosted_invoice_url = models.URLField(blank=True, null=True)

    # Datas
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Metadata
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Fatura"
        verbose_name_plural = "Faturas"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Fatura #{self.id} - {self.client.nome} - {self.amount_display}"

    @property
    def amount_display(self):
        """Retorna valor formatado."""
        return f"R\$ {self.amount_cents/100:.2f}"

    @property
    def is_paid(self):
        """Verifica se fatura foi paga."""
        return self.status == self.STATUS_PAID

    def mark_as_paid(self):
        """Marca fatura como paga."""
        self.status = self.STATUS_PAID
        self.paid_at = timezone.now()
        self.save()
