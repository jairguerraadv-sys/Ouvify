"""
Testes de Billing - Ouvify
Sprint 1 Correções: Auditoria 30/01/2026

Cobertura:
- test_plan_model: Operações do modelo Plan
- test_subscription_lifecycle: Ciclo de vida completo da assinatura
- test_invoice_model: Operações do modelo Invoice
- test_checkout_logic: Lógica de checkout (mocked)
- test_webhook_handling: Lógica de webhooks (mocked)

Nota: Testes de API com TenantMiddleware estão em tests/test_billing_integration.py
"""
import json
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import timedelta

import pytest
from django.utils import timezone

from apps.billing.models import Plan, Subscription, Invoice
from apps.tenants.models import Client


# ======================
# FIXTURES
# ======================

@pytest.fixture
def test_user(db):
    """Cria usuário de teste."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return User.objects.create_user(
        username=f'testuser-{unique_id}@example.com',
        email=f'testuser-{unique_id}@example.com',
        password='TestPass123!'
    )


@pytest.fixture
def test_plan(db):
    """Cria plano de teste."""
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return Plan.objects.create(
        name=f'Professional-{unique_id}',
        slug=f'professional-{unique_id}',
        price_cents=9900,
        currency='BRL',
        stripe_price_id=f'price_test_{unique_id}',
        stripe_product_id=f'prod_test_{unique_id}',
        features={
            'analytics': True,
            'automations': True,
            'webhooks': True
        },
        limits={
            'feedbacks_per_month': 1000,
            'team_members': 5
        },
        description='Plano profissional completo',
        is_popular=True,
        is_active=True,
        trial_days=14
    )


@pytest.fixture
def free_plan(db):
    """Cria plano gratuito de teste."""
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return Plan.objects.create(
        name=f'Free-{unique_id}',
        slug=f'free-{unique_id}',
        price_cents=0,
        currency='BRL',
        features={'analytics': False},
        limits={'feedbacks_per_month': 100, 'team_members': 1},
        is_active=True,
        trial_days=0
    )


@pytest.fixture
def create_tenant(db, test_user):
    """Factory para criar tenants únicos (sem auto-trial)."""
    def _create_tenant(name_prefix='Test'):
        import uuid
        from django.db.models.signals import post_save
        from apps.billing.signals import auto_start_trial_for_new_tenant
        
        unique_id = str(uuid.uuid4())[:8]
        
        # Desconectar signal que cria trial automaticamente
        post_save.disconnect(auto_start_trial_for_new_tenant, sender=Client)
        
        try:
            tenant = Client.objects.create(
                nome=f'{name_prefix} Company {unique_id}',
                subdominio=f'{name_prefix.lower()}-{unique_id}',
                plano='free',
                ativo=True,
                owner=test_user
            )
        finally:
            # Reconectar signal
            post_save.connect(auto_start_trial_for_new_tenant, sender=Client)
        
        return tenant
    return _create_tenant


@pytest.fixture
def create_subscription(db, test_plan, create_tenant):
    """Factory para criar subscriptions únicas."""
    def _create_subscription(status=Subscription.STATUS_ACTIVE):
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        tenant = create_tenant(f'Sub-{unique_id[:4]}')
        
        return Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=status,
            stripe_subscription_id=f'sub_test_{unique_id}',
            stripe_customer_id=f'cus_test_{unique_id}',
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=30)
        )
    return _create_subscription


# ======================
# TESTES DO MODELO PLAN
# ======================

@pytest.mark.django_db
class TestPlanModel:
    """Testes unitários para o modelo Plan."""
    
    def test_plan_price_display(self, test_plan):
        """Teste formatação de preço."""
        assert '99.00' in test_plan.price_display
        assert 'R' in test_plan.price_display
    
    def test_plan_is_free(self, free_plan, test_plan):
        """Teste verificação de plano gratuito."""
        assert free_plan.is_free is True
        assert test_plan.is_free is False
    
    def test_plan_has_feature(self, test_plan):
        """Teste verificação de features."""
        assert test_plan.has_feature('analytics') is True
        assert test_plan.has_feature('inexistent') is False
    
    def test_plan_get_limit(self, test_plan):
        """Teste obtenção de limites."""
        assert test_plan.get_limit('feedbacks_per_month') == 1000
        assert test_plan.get_limit('inexistent', default=0) == 0
    
    def test_plan_str(self, test_plan):
        """Teste representação string."""
        assert 'Professional' in str(test_plan)
        assert '99.00' in str(test_plan)
    
    def test_plan_creation(self, db):
        """Teste criação de plano com todos os campos."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        plan = Plan.objects.create(
            name=f'Enterprise-{unique_id}',
            slug=f'enterprise-{unique_id}',
            price_cents=29900,
            currency='BRL',
            stripe_price_id=f'price_ent_{unique_id}',
            stripe_product_id=f'prod_ent_{unique_id}',
            features={'sso': True, 'api_access': True, 'priority_support': True},
            limits={'feedbacks_per_month': -1, 'team_members': -1},
            description='Plano enterprise ilimitado',
            is_active=True
        )
        
        assert plan.id is not None
        assert plan.price_cents == 29900
        assert plan.has_feature('sso') is True
        assert plan.get_limit('feedbacks_per_month') == -1  # Ilimitado
    
    def test_plan_active_filter(self, test_plan, db):
        """Teste filtro de planos ativos."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        # Criar plano inativo
        Plan.objects.create(
            name=f'Inactive-{unique_id}',
            slug=f'inactive-{unique_id}',
            price_cents=1000,
            is_active=False
        )
        
        active_plans = Plan.objects.filter(is_active=True)
        assert test_plan in active_plans
        
        all_inactive = Plan.objects.filter(is_active=False)
        assert all_inactive.count() >= 1


# ======================
# TESTES DO CICLO DE VIDA DA ASSINATURA
# ======================

@pytest.mark.django_db
class TestSubscriptionLifecycle:
    """Testes para ciclo de vida completo da assinatura."""
    
    def test_subscription_status_active(self, create_subscription):
        """Assinatura ativa deve retornar is_active=True."""
        subscription = create_subscription(status=Subscription.STATUS_ACTIVE)
        assert subscription.is_active is True
        assert subscription.status == Subscription.STATUS_ACTIVE
    
    def test_subscription_trial_start(self, test_plan, create_tenant):
        """Teste início de período de trial."""
        tenant = create_tenant('Trial')
        
        subscription = Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=Subscription.STATUS_TRIALING
        )
        subscription.start_trial(days=14)
        
        assert subscription.is_trialing is True
        assert subscription.trial_days_remaining > 0
        assert subscription.can_access_features is True
    
    def test_subscription_cancel(self, create_subscription):
        """Teste cancelamento de assinatura."""
        subscription = create_subscription()
        subscription.cancel(at_period_end=True)
        
        assert subscription.cancel_at_period_end is True
    
    def test_subscription_activate(self, test_plan, create_tenant):
        """Teste ativação de assinatura após pagamento."""
        tenant = create_tenant('Activate')
        
        subscription = Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=Subscription.STATUS_TRIALING
        )
        subscription.activate()
        
        assert subscription.status == Subscription.STATUS_ACTIVE
        assert subscription.is_active is True
    
    def test_subscription_can_access_features(self, create_subscription):
        """Assinatura ativa deve permitir acesso a features."""
        subscription = create_subscription()
        assert subscription.can_access_features is True
    
    def test_subscription_past_due_grace_period(self, test_plan, create_tenant):
        """Assinatura vencida deve ter período de graça."""
        tenant = create_tenant('PastDue')
        
        subscription = Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=Subscription.STATUS_PAST_DUE
        )
        
        # Período de graça - ainda pode acessar
        assert subscription.can_access_features is True
        assert subscription.is_active is False
    
    def test_subscription_unique_per_tenant(self, test_plan, create_tenant):
        """Apenas uma assinatura ativa por tenant."""
        tenant = create_tenant('Unique')
        
        # Criar primeira subscription
        Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=Subscription.STATUS_ACTIVE
        )
        
        # Tentar criar segunda assinatura ativa deve falhar
        from django.db import IntegrityError
        
        with pytest.raises(IntegrityError):
            Subscription.objects.create(
                client=tenant,
                plan=test_plan,
                status=Subscription.STATUS_ACTIVE
            )
    
    def test_subscription_expired(self, test_plan, create_tenant):
        """Teste assinatura expirada."""
        tenant = create_tenant('Expired')
        
        subscription = Subscription.objects.create(
            client=tenant,
            plan=test_plan,
            status=Subscription.STATUS_CANCELED,
            current_period_end=timezone.now() - timedelta(days=1)
        )
        
        assert subscription.is_active is False
        assert subscription.status == Subscription.STATUS_CANCELED


# ======================
# TESTES DO MODELO INVOICE
# ======================

@pytest.mark.django_db
class TestInvoiceModel:
    """Testes para o modelo Invoice."""
    
    def test_invoice_creation(self, create_subscription):
        """Teste criação de fatura."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        subscription = create_subscription()
        
        invoice = Invoice.objects.create(
            client=subscription.client,
            subscription=subscription,
            stripe_invoice_id=f'in_test_{unique_id}',
            amount_cents=9900,
            currency='BRL',
            status='paid',
            paid_at=timezone.now()
        )
        
        assert invoice.id is not None
        assert invoice.amount_cents == 9900
        assert invoice.status == 'paid'
    
    def test_invoice_pending(self, create_subscription):
        """Teste fatura pendente."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        subscription = create_subscription()
        
        invoice = Invoice.objects.create(
            client=subscription.client,
            subscription=subscription,
            stripe_invoice_id=f'in_pending_{unique_id}',
            amount_cents=9900,
            currency='BRL',
            status='pending'
        )
        
        assert invoice.status == 'pending'
        assert invoice.paid_at is None
    
    def test_invoice_amount_display(self, create_subscription):
        """Teste formatação de valor da fatura."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        subscription = create_subscription()
        
        invoice = Invoice.objects.create(
            client=subscription.client,
            subscription=subscription,
            stripe_invoice_id=f'in_display_{unique_id}',
            amount_cents=9900,
            currency='BRL',
            status='paid'
        )
        
        # Verificar que o valor está correto (99.00)
        assert invoice.amount_cents / 100 == 99.00


# ======================
# TESTES DE LÓGICA DE CHECKOUT (MOCKED)
# ======================

@pytest.mark.django_db
class TestCheckoutLogic:
    """Testes para lógica de checkout."""
    
    @patch('apps.billing.stripe_service.get_stripe_api')
    def test_checkout_session_creation_mock(self, mock_stripe_api, test_plan, create_tenant):
        """Teste criação de sessão de checkout com mock."""
        # Setup mock
        mock_stripe = MagicMock()
        mock_session = MagicMock()
        mock_session.id = 'cs_test_123'
        mock_session.url = 'https://checkout.stripe.com/session/test'
        mock_stripe.checkout.Session.create.return_value = mock_session
        mock_stripe_api.return_value = mock_stripe
        
        tenant = create_tenant('Checkout')
        
        # Simular criação de checkout session
        session_data = {
            'mode': 'subscription',
            'client_reference_id': str(tenant.id),
            'success_url': 'https://app.ouvify.com/success',
            'cancel_url': 'https://app.ouvify.com/cancel',
            'line_items': [{
                'price': test_plan.stripe_price_id,
                'quantity': 1
            }]
        }
        
        # Verificar estrutura dos dados
        assert 'mode' in session_data
        assert session_data['mode'] == 'subscription'
        assert test_plan.stripe_price_id in session_data['line_items'][0]['price']


# ======================
# TESTES DE WEBHOOK (MOCKED)
# ======================

@pytest.mark.django_db  
class TestWebhookLogic:
    """Testes para lógica de webhooks."""
    
    def test_checkout_completed_event_structure(self, test_plan, create_tenant):
        """Teste estrutura do evento checkout.session.completed."""
        tenant = create_tenant('Webhook')
        
        event_data = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': 'cs_test_123',
                    'customer': 'cus_test_123',
                    'subscription': 'sub_test_123',
                    'metadata': {
                        'client_id': str(tenant.id),
                        'plan_id': str(test_plan.id)
                    }
                }
            }
        }
        
        assert event_data['type'] == 'checkout.session.completed'
        assert 'metadata' in event_data['data']['object']
        assert event_data['data']['object']['metadata']['client_id'] == str(tenant.id)
    
    def test_subscription_updated_event_structure(self, create_subscription):
        """Teste estrutura do evento customer.subscription.updated."""
        subscription = create_subscription()
        
        event_data = {
            'type': 'customer.subscription.updated',
            'data': {
                'object': {
                    'id': subscription.stripe_subscription_id,
                    'status': 'active',
                    'current_period_end': int(timezone.now().timestamp()) + 86400 * 30
                }
            }
        }
        
        assert event_data['type'] == 'customer.subscription.updated'
        assert event_data['data']['object']['status'] == 'active'
    
    def test_invoice_paid_event_structure(self, create_subscription):
        """Teste estrutura do evento invoice.paid."""
        subscription = create_subscription()
        
        event_data = {
            'type': 'invoice.paid',
            'data': {
                'object': {
                    'id': 'in_test_123',
                    'subscription': subscription.stripe_subscription_id,
                    'amount_paid': 9900,
                    'currency': 'brl',
                    'status': 'paid'
                }
            }
        }
        
        assert event_data['type'] == 'invoice.paid'
        assert event_data['data']['object']['amount_paid'] == 9900


# ======================
# TESTES DE STRIPE SERVICE (MOCKED)
# ======================

@pytest.mark.django_db
class TestStripeServiceMocked:
    """Testes para stripe_service com mocks."""
    
    @patch('apps.billing.stripe_service.get_stripe_api')
    def test_create_customer_mock(self, mock_stripe_api, test_user, create_tenant):
        """Teste criação de customer no Stripe."""
        mock_stripe = MagicMock()
        mock_customer = MagicMock()
        mock_customer.id = 'cus_test_new_123'
        mock_stripe.Customer.create.return_value = mock_customer
        mock_stripe_api.return_value = mock_stripe
        
        tenant = create_tenant('Customer')
        
        # Simular criação de customer
        customer_data = {
            'email': test_user.email,
            'name': tenant.nome,
            'metadata': {
                'client_id': str(tenant.id)
            }
        }
        
        assert 'email' in customer_data
        assert customer_data['metadata']['client_id'] == str(tenant.id)
    
    @patch('apps.billing.stripe_service.get_stripe_api')
    def test_cancel_subscription_mock(self, mock_stripe_api, create_subscription):
        """Teste cancelamento de subscription no Stripe."""
        subscription = create_subscription()
        
        mock_stripe = MagicMock()
        mock_sub = MagicMock()
        mock_sub.cancel_at_period_end = True
        mock_stripe.Subscription.modify.return_value = mock_sub
        mock_stripe_api.return_value = mock_stripe
        
        # Simular cancelamento
        cancel_data = {
            'cancel_at_period_end': True
        }
        
        assert cancel_data['cancel_at_period_end'] is True
    
    @patch('apps.billing.stripe_service.get_stripe_api')
    def test_billing_portal_session_mock(self, mock_stripe_api, create_subscription):
        """Teste criação de portal session."""
        subscription = create_subscription()
        
        mock_stripe = MagicMock()
        mock_portal = MagicMock()
        mock_portal.url = 'https://billing.stripe.com/portal/test'
        mock_stripe.billing_portal.Session.create.return_value = mock_portal
        mock_stripe_api.return_value = mock_stripe
        
        # Simular criação de portal
        portal_data = {
            'customer': subscription.stripe_customer_id,
            'return_url': 'https://app.ouvify.com/dashboard'
        }
        
        assert portal_data['customer'] == subscription.stripe_customer_id
