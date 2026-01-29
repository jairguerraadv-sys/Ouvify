"""
Billing Tests - Ouvy SaaS
Sprint 4 - Feature 4.1: Integração Stripe

Testes unitários para:
- Modelos de billing (Plan, Subscription, Invoice)
- Feature gating
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User

from apps.tenants.models import Client, TeamMember
from apps.billing.models import Plan, Subscription, Invoice
from apps.billing.feature_gating import (
    get_client_subscription,
    check_feature_access,
    check_limit_access
)


@pytest.fixture
def test_tenant(db):
    """Cria tenant de teste."""
    return Client.objects.create(
        nome='Test Company Billing',
        subdominio=f'billing-test-{timezone.now().timestamp():.0f}',
        ativo=True
    )


@pytest.fixture
def test_user(db, test_tenant):
    """Cria usuário de teste associado ao tenant."""
    user = User.objects.create_user(
        username=f'billing_user_{timezone.now().timestamp():.0f}',
        email='billing_user@test.com',
        password='testpass123'
    )
    # Criar TeamMember para associar user ao tenant
    TeamMember.objects.create(
        user=user,
        client=test_tenant,
        role=TeamMember.ADMIN,
        status=TeamMember.ACTIVE
    )
    return user


@pytest.fixture
def free_plan(db):
    """Cria plano gratuito."""
    return Plan.objects.create(
        name='Free Test',
        slug='free-test',
        price_cents=0,
        features={'basic_feedbacks': True, 'analytics': False},
        limits={'feedbacks_per_month': 100, 'team_members': 2},
        trial_days=0
    )


@pytest.fixture
def professional_plan(db):
    """Cria plano profissional."""
    return Plan.objects.create(
        name='Professional Test',
        slug='professional-test',
        price_cents=9900,
        features={'basic_feedbacks': True, 'analytics': True, 'automations': True},
        limits={'feedbacks_per_month': 2000, 'team_members': 15},
        trial_days=14
    )


@pytest.fixture
def test_tenant_for_subscription(db):
    """Cria tenant específico para testes de subscription (sem auto-trial)."""
    # Deleta subscription criada pelo signal
    tenant = Client.objects.create(
        nome='Test Company Subscription',
        subdominio=f'sub-test-{timezone.now().timestamp():.0f}',
        ativo=True
    )
    # Remove qualquer subscription criada pelo signal
    Subscription.objects.all_tenants().filter(client=tenant).delete()
    return tenant


@pytest.fixture
def active_subscription(db, test_tenant_for_subscription, professional_plan):
    """Cria subscription ativa."""
    return Subscription.objects.create(
        client=test_tenant_for_subscription,
        plan=professional_plan,
        status=Subscription.STATUS_ACTIVE,
        current_period_start=timezone.now(),
        current_period_end=timezone.now() + timedelta(days=30)
    )


@pytest.fixture
def trial_tenant(db):
    """Cria tenant separado para trial (sem auto-trial)."""
    tenant = Client.objects.create(
        nome='Test Company Trial',
        subdominio=f'trial-test-{timezone.now().timestamp():.0f}',
        ativo=True
    )
    # Remove qualquer subscription criada pelo signal
    Subscription.objects.all_tenants().filter(client=tenant).delete()
    return tenant


@pytest.fixture
def trial_subscription(db, trial_tenant, professional_plan):
    """Cria subscription em trial."""
    now = timezone.now()
    return Subscription.objects.create(
        client=trial_tenant,
        plan=professional_plan,
        status=Subscription.STATUS_TRIALING,
        trial_start=now,
        trial_end=now + timedelta(days=14),
        current_period_start=now,
        current_period_end=now + timedelta(days=14)
    )


# =============================================================================
# Testes do Model Plan
# =============================================================================

@pytest.mark.django_db
class TestPlanModel:
    """Testes para o modelo Plan."""
    
    def test_create_plan(self, free_plan):
        """Testa criação de plano."""
        assert free_plan.id is not None
        assert free_plan.name == 'Free Test'
        assert free_plan.slug == 'free-test'
        assert free_plan.is_free is True
    
    def test_plan_price_display(self, professional_plan):
        """Testa formatação de preço."""
        # Note: R$ pode aparecer com ou sem escape
        assert '99' in professional_plan.price_display
    
    def test_plan_has_feature(self, professional_plan):
        """Testa verificação de feature."""
        assert professional_plan.has_feature('analytics') is True
        assert professional_plan.has_feature('sso') is False
    
    def test_plan_get_limit(self, professional_plan):
        """Testa obtenção de limite."""
        assert professional_plan.get_limit('feedbacks_per_month') == 2000
        assert professional_plan.get_limit('nonexistent', default=0) == 0


# =============================================================================
# Testes do Model Subscription
# =============================================================================

@pytest.mark.django_db
class TestSubscriptionModel:
    """Testes para o modelo Subscription."""
    
    def test_create_subscription(self, active_subscription):
        """Testa criação de subscription."""
        assert active_subscription.id is not None
        assert active_subscription.status == Subscription.STATUS_ACTIVE
    
    def test_subscription_is_active(self, active_subscription, trial_subscription):
        """Testa propriedade is_active."""
        assert active_subscription.is_active is True
        assert trial_subscription.is_active is True
    
    def test_subscription_is_trialing(self, trial_subscription):
        """Testa propriedade is_trialing."""
        assert trial_subscription.is_trialing is True
    
    def test_trial_days_remaining(self, trial_subscription):
        """Testa cálculo de dias restantes do trial."""
        remaining = trial_subscription.trial_days_remaining
        assert 0 <= remaining <= 14
    
    def test_can_access_features(self, active_subscription):
        """Testa se pode acessar features."""
        assert active_subscription.can_access_features is True
    
    def test_subscription_has_feature(self, active_subscription):
        """Testa verificação de feature via subscription."""
        assert active_subscription.has_feature('analytics') is True
        assert active_subscription.has_feature('sso') is False
    
    def test_subscription_check_limit(self, active_subscription):
        """Testa verificação de limite."""
        assert active_subscription.check_limit('feedbacks_per_month', 100) is True
        assert active_subscription.check_limit('feedbacks_per_month', 2000) is False
    
    def test_subscription_start_trial(self, test_tenant, professional_plan):
        """Testa início de trial."""
        subscription = Subscription.objects.create(
            client=test_tenant,
            plan=professional_plan,
            status=Subscription.STATUS_INCOMPLETE
        )
        subscription.start_trial(days=7)
        
        assert subscription.status == Subscription.STATUS_TRIALING
        assert subscription.trial_start is not None
        assert subscription.trial_end is not None
    
    def test_subscription_activate(self, trial_subscription):
        """Testa ativação de subscription."""
        trial_subscription.activate()
        assert trial_subscription.status == Subscription.STATUS_ACTIVE
    
    def test_subscription_cancel(self, active_subscription):
        """Testa cancelamento de subscription."""
        active_subscription.cancel(at_period_end=True)
        assert active_subscription.cancel_at_period_end is True


# =============================================================================
# Testes do Model Invoice
# =============================================================================

@pytest.mark.django_db
class TestInvoiceModel:
    """Testes para o modelo Invoice."""
    
    def test_create_invoice(self, test_tenant_for_subscription, active_subscription):
        """Testa criação de invoice."""
        invoice = Invoice.objects.create(
            client=test_tenant_for_subscription,
            subscription=active_subscription,
            amount_cents=9900,
            status=Invoice.STATUS_PAID,
            paid_at=timezone.now()
        )
        
        assert invoice.id is not None
        assert invoice.is_paid is True
    
    def test_invoice_amount_display(self, test_tenant_for_subscription, active_subscription):
        """Testa formatação de valor."""
        invoice = Invoice.objects.create(
            client=test_tenant_for_subscription,
            subscription=active_subscription,
            amount_cents=9900,
            status=Invoice.STATUS_DRAFT
        )
        
        # Note: R$ pode aparecer com ou sem escape dependendo da codificação
        assert '99' in invoice.amount_display
    
    def test_invoice_mark_as_paid(self, test_tenant_for_subscription, active_subscription):
        """Testa marcação como paga."""
        invoice = Invoice.objects.create(
            client=test_tenant_for_subscription,
            subscription=active_subscription,
            amount_cents=9900,
            status=Invoice.STATUS_OPEN
        )
        
        invoice.mark_as_paid()
        
        assert invoice.status == Invoice.STATUS_PAID
        assert invoice.paid_at is not None


# =============================================================================
# Testes de Feature Gating
# =============================================================================

@pytest.mark.django_db
class TestFeatureGating:
    """Testes para feature gating."""
    
    def test_get_client_subscription(self, test_tenant_for_subscription, active_subscription):
        """Testa obtenção de subscription do client."""
        subscription = get_client_subscription(test_tenant_for_subscription)
        assert subscription is not None
        assert subscription.id == active_subscription.id
    
    def test_check_feature_access(self, test_tenant_for_subscription, active_subscription):
        """Testa verificação de acesso a feature."""
        assert check_feature_access(test_tenant_for_subscription, 'analytics') is True
        assert check_feature_access(test_tenant_for_subscription, 'sso') is False
    
    def test_check_feature_access_no_subscription(self, test_tenant):
        """Testa feature access sem subscription."""
        # Garante que não há subscription
        Subscription.objects.filter(client=test_tenant).delete()
        assert check_feature_access(test_tenant, 'analytics') is False
    
    def test_check_limit_access(self, test_tenant_for_subscription, active_subscription):
        """Testa verificação de limite."""
        assert check_limit_access(test_tenant_for_subscription, 'feedbacks_per_month', 100) is True
        assert check_limit_access(test_tenant_for_subscription, 'feedbacks_per_month', 2000) is False


# =============================================================================
# Teste de Auto-Start Trial
# =============================================================================

@pytest.mark.django_db
class TestAutoStartTrial:
    """Testes para auto-start de trial em novos tenants."""
    
    def test_auto_start_trial_on_tenant_creation(self, db, professional_plan):
        """Testa que trial é iniciado automaticamente ao criar tenant."""
        # Cria um novo tenant
        new_tenant = Client.objects.create(
            nome='New Company Auto Trial',
            subdominio=f'auto-trial-{timezone.now().timestamp():.0f}',
            ativo=True
        )
        
        # Verifica se subscription foi criada
        subscription = Subscription.objects.all_tenants().filter(
            client=new_tenant
        ).first()
        
        assert subscription is not None
        assert subscription.status == Subscription.STATUS_TRIALING
        assert subscription.trial_start is not None
        assert subscription.trial_end is not None
    
    def test_no_duplicate_trial_on_existing_subscription(self, test_tenant_for_subscription, active_subscription):
        """Testa que não cria trial duplicado se já existe subscription."""
        # O test_tenant_for_subscription já tem active_subscription
        # Verifica que só existe uma subscription
        subscription_count = Subscription.objects.all_tenants().filter(
            client=test_tenant_for_subscription
        ).count()
        
        assert subscription_count == 1


# =============================================================================
# Teste de Criação de Planos via Command
# =============================================================================

@pytest.mark.django_db
class TestCreateDefaultPlansCommand:
    """Testes para o comando de criação de planos."""
    
    def test_default_plans_exist(self, db):
        """Testa se planos padrão foram criados."""
        from django.core.management import call_command
        call_command('create_default_plans')
        
        assert Plan.objects.filter(slug='free').exists()
        assert Plan.objects.filter(slug='starter').exists()
        assert Plan.objects.filter(slug='professional').exists()
        assert Plan.objects.filter(slug='enterprise').exists()
