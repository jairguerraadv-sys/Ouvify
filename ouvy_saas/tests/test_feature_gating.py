"""
Test suite para o sistema de feature gating.

Valida que cada plano tem acesso apenas às features apropriadas.
Testa geração de mensagens de upgrade e bloqueio de recursos.

Cobertura:
- PlanFeatures class methods
- Client model feature methods
- FeatureNotAvailableError exception
- FeedbackViewSet adicionar_interacao feature validation
- Custom exception handler (403 responses)
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.tenants.models import Client
from apps.tenants.plans import PlanFeatures
from apps.feedbacks.models import Feedback, FeedbackInteracao
from apps.feedbacks.constants import InteracaoTipo, FeedbackStatus
from apps.core.exceptions import FeatureNotAvailableError
import logging

logger = logging.getLogger(__name__)


class PlanFeaturesTestCase(TestCase):
    """Testa a classe PlanFeatures e seus métodos."""
    
    def test_plan_features_exist(self):
        """Verifica se todos os planos existem em PLAN_LIMITS."""
        expected_plans = {'free', 'starter', 'pro', 'enterprise'}
        actual_plans = set(PlanFeatures.PLAN_LIMITS.keys())
        self.assertEqual(expected_plans, actual_plans)
    
    def test_plan_feature_structure(self):
        """Verifica se cada plano tem a estrutura correta de features."""
        required_features = {
            'max_feedbacks_per_month',
            'max_users',
            'allow_internal_notes',
            'allow_attachments',
            'allow_custom_branding',
            'allow_api_access',
            'allow_webhooks',
            'allow_integrations',
            'support_tier',
            'storage_gb',
        }
        
        for plan_name, features in PlanFeatures.PLAN_LIMITS.items():
            self.assertEqual(required_features, set(features.keys()),
                           f"Plano '{plan_name}' tem features faltando")
    
    def test_get_plan_features(self):
        """Testa método get_plan_features."""
        free_features = PlanFeatures.get_plan_features('free')
        self.assertFalse(free_features['allow_internal_notes'])
        self.assertFalse(free_features['allow_attachments'])
        
        starter_features = PlanFeatures.get_plan_features('starter')
        self.assertTrue(starter_features['allow_internal_notes'])
        self.assertFalse(starter_features['allow_attachments'])
        
        pro_features = PlanFeatures.get_plan_features('pro')
        self.assertTrue(pro_features['allow_internal_notes'])
        self.assertTrue(pro_features['allow_attachments'])
    
    def test_get_plan_features_invalid_plan(self):
        """Testa ValueError ao pedir plano inválido."""
        with self.assertRaises(ValueError):
            PlanFeatures.get_plan_features('invalid_plan')
    
    def test_has_feature(self):
        """Testa método has_feature."""
        # Free não tem notas internas
        self.assertFalse(PlanFeatures.has_feature('free', 'allow_internal_notes'))
        
        # Starter tem notas internas
        self.assertTrue(PlanFeatures.has_feature('starter', 'allow_internal_notes'))
        
        # Enterprise tem tudo
        self.assertTrue(PlanFeatures.has_feature('enterprise', 'allow_internal_notes'))
        self.assertTrue(PlanFeatures.has_feature('enterprise', 'allow_attachments'))
    
    def test_get_upgrade_message(self):
        """Testa geração de mensagens de upgrade."""
        msg = PlanFeatures.get_upgrade_message('free', 'allow_internal_notes')
        self.assertIn('Starter', msg)
        self.assertIn('Notas Internas', msg)
        
        msg = PlanFeatures.get_upgrade_message('starter', 'allow_attachments')
        self.assertIn('Pro', msg)
        self.assertIn('Anexos', msg)
    
    def test_storage_limits(self):
        """Testa limites de armazenamento por plano."""
        self.assertEqual(PlanFeatures.PLAN_LIMITS['free']['storage_gb'], 1)
        self.assertEqual(PlanFeatures.PLAN_LIMITS['starter']['storage_gb'], 10)
        self.assertEqual(PlanFeatures.PLAN_LIMITS['pro']['storage_gb'], 100)
        self.assertIsNone(PlanFeatures.PLAN_LIMITS['enterprise']['storage_gb'])
    
    def test_support_tiers(self):
        """Testa tiers de suporte por plano."""
        self.assertEqual(PlanFeatures.PLAN_LIMITS['free']['support_tier'], 'community')
        self.assertEqual(PlanFeatures.PLAN_LIMITS['starter']['support_tier'], 'email')
        self.assertEqual(PlanFeatures.PLAN_LIMITS['pro']['support_tier'], 'priority')
        self.assertEqual(PlanFeatures.PLAN_LIMITS['enterprise']['support_tier'], '24/7')


class ClientPlanMethodsTestCase(TestCase):
    """Testa os métodos de feature gating da classe Client."""
    
    def setUp(self):
        """Cria clientes de teste para cada plano."""
        self.user = User.objects.create_user(username='owner', password='pass123')
        
        self.client_free = Client.objects.create(
            owner=self.user,
            nome='Free Company',
            subdominio='free-company',
            plano='free'
        )
        
        self.client_starter = Client.objects.create(
            owner=self.user,
            nome='Starter Company',
            subdominio='starter-company',
            plano='starter'
        )
        
        self.client_pro = Client.objects.create(
            owner=self.user,
            nome='Pro Company',
            subdominio='pro-company',
            plano='pro'
        )
        
        self.client_enterprise = Client.objects.create(
            owner=self.user,
            nome='Enterprise Company',
            subdominio='enterprise-company',
            plano='enterprise'
        )
    
    def test_has_feature_internal_notes(self):
        """Testa acesso a notas internas por plano."""
        self.assertFalse(self.client_free.has_feature_internal_notes())
        self.assertTrue(self.client_starter.has_feature_internal_notes())
        self.assertTrue(self.client_pro.has_feature_internal_notes())
        self.assertTrue(self.client_enterprise.has_feature_internal_notes())
    
    def test_has_feature_attachments(self):
        """Testa acesso a anexos por plano."""
        self.assertFalse(self.client_free.has_feature_attachments())
        self.assertFalse(self.client_starter.has_feature_attachments())
        self.assertTrue(self.client_pro.has_feature_attachments())
        self.assertTrue(self.client_enterprise.has_feature_attachments())
    
    def test_has_feature_custom_branding(self):
        """Testa acesso a customização de marca."""
        self.assertFalse(self.client_free.has_feature_custom_branding())
        self.assertTrue(self.client_starter.has_feature_custom_branding())
        self.assertTrue(self.client_pro.has_feature_custom_branding())
        self.assertTrue(self.client_enterprise.has_feature_custom_branding())
    
    def test_has_feature_api_access(self):
        """Testa acesso à API REST."""
        self.assertFalse(self.client_free.has_feature_api_access())
        self.assertFalse(self.client_starter.has_feature_api_access())
        self.assertTrue(self.client_pro.has_feature_api_access())
        self.assertTrue(self.client_enterprise.has_feature_api_access())
    
    def test_has_feature_webhooks(self):
        """Testa acesso a webhooks."""
        self.assertFalse(self.client_free.has_feature_webhooks())
        self.assertFalse(self.client_starter.has_feature_webhooks())
        self.assertTrue(self.client_pro.has_feature_webhooks())
        self.assertTrue(self.client_enterprise.has_feature_webhooks())
    
    def test_get_storage_limit_gb(self):
        """Testa limites de armazenamento por cliente."""
        self.assertEqual(self.client_free.get_storage_limit_gb(), 1)
        self.assertEqual(self.client_starter.get_storage_limit_gb(), 10)
        self.assertEqual(self.client_pro.get_storage_limit_gb(), 100)
        self.assertIsNone(self.client_enterprise.get_storage_limit_gb())
    
    def test_get_max_feedbacks_per_month(self):
        """Testa limites de feedbacks por mês."""
        self.assertEqual(self.client_free.get_max_feedbacks_per_month(), 50)
        self.assertEqual(self.client_starter.get_max_feedbacks_per_month(), 500)
        self.assertIsNone(self.client_pro.get_max_feedbacks_per_month())
        self.assertIsNone(self.client_enterprise.get_max_feedbacks_per_month())
    
    def test_get_support_tier(self):
        """Testa tiers de suporte."""
        self.assertEqual(self.client_free.get_support_tier(), 'community')
        self.assertEqual(self.client_starter.get_support_tier(), 'email')
        self.assertEqual(self.client_pro.get_support_tier(), 'priority')
        self.assertEqual(self.client_enterprise.get_support_tier(), '24/7')
    
    def test_get_upgrade_message(self):
        """Testa mensagens de upgrade customizadas."""
        msg = self.client_free.get_upgrade_message('allow_internal_notes')
        self.assertIn('Starter', msg)
        self.assertIn('Notas Internas', msg)
    
    def test_is_premium_free_plan(self):
        """Free plan não é premium."""
        self.assertFalse(self.client_free.is_premium())
    
    def test_is_premium_active_subscription(self):
        """Planos com subscription_status='active' são premium."""
        self.client_starter.subscription_status = 'active'
        self.assertTrue(self.client_starter.is_premium())


class FeatureNotAvailableErrorTestCase(TestCase):
    """Testa a exceção FeatureNotAvailableError."""
    
    def test_exception_creation(self):
        """Testa criação da exceção."""
        exc = FeatureNotAvailableError('allow_internal_notes', 'free')
        self.assertEqual(exc.feature, 'allow_internal_notes')
        self.assertEqual(exc.plan, 'free')
        self.assertIn('Starter', exc.message)
    
    def test_exception_custom_message(self):
        """Testa exceção com mensagem customizada."""
        custom_msg = 'Você precisa fazer upgrade para usar notas internas'
        exc = FeatureNotAvailableError('allow_internal_notes', 'free', custom_msg)
        self.assertEqual(exc.message, custom_msg)


class FeedbackViewSetFeatureGatingTestCase(APITestCase):
    """Testa feature gating no FeedbackViewSet."""
    
    def setUp(self):
        """Cria dados de teste."""
        self.user_empresa = User.objects.create_user(
            username='empresa_teste',
            password='pass123'
        )
        
        self.client_free = Client.objects.create(
            owner=self.user_empresa,
            nome='Empresa Free',
            subdominio='empresa-free',
            plano='free'
        )
        
        self.client_starter = Client.objects.create(
            owner=User.objects.create_user(username='owner2', password='pass123'),
            nome='Empresa Starter',
            subdominio='empresa-starter',
            plano='starter'
        )
        
        self.feedback_free = Feedback.objects.create(
            client=self.client_free,
            protocolo='OUVY-FREE-TEST',
            titulo='Free Feedback',
            descricao='Test feedback para plano free'
        )
        
        self.feedback_starter = Feedback.objects.create(
            client=self.client_starter,
            protocolo='OUVY-STAR-TEST',
            titulo='Starter Feedback',
            descricao='Test feedback para plano starter'
        )
        
        self.api_client = APIClient()
    
    def test_free_plan_cannot_create_internal_notes(self):
        """Plano free não pode criar NOTA_INTERNA."""
        self.api_client.force_authenticate(user=self.user_empresa)
        self.api_client.defaults['HTTP_X_TENANT_ID'] = str(self.client_free.id)
        
        response = self.api_client.post(
            f'/api/feedbacks/{self.feedback_free.id}/adicionar-interacao/',
            {
                'mensagem': 'Esta é uma nota interna',
                'tipo': 'NOTA_INTERNA'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('não disponível no seu plano', response.data['error'])
    
    def test_starter_plan_can_create_internal_notes(self):
        """Plano starter pode criar NOTA_INTERNA."""
        user_starter = self.client_starter.owner
        self.api_client.force_authenticate(user=user_starter)
        self.api_client.defaults['HTTP_X_TENANT_ID'] = str(self.client_starter.id)
        
        response = self.api_client.post(
            f'/api/feedbacks/{self.feedback_starter.id}/adicionar-interacao/',
            {
                'mensagem': 'Esta é uma nota interna',
                'tipo': 'NOTA_INTERNA'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que a interação foi criada
        interacao = FeedbackInteracao.objects.get(feedback=self.feedback_starter, tipo=InteracaoTipo.NOTA_INTERNA)
        self.assertEqual(interacao.mensagem, 'Esta é uma nota interna')
    
    def test_public_responses_not_blocked_by_feature_gating(self):
        """Respostas anônimas (RESPOSTA_USUARIO) não são bloqueadas por feature gating."""
        response = self.api_client.post(
            f'/api/feedbacks/{self.feedback_free.id}/adicionar-interacao/',
            {
                'mensagem': 'Resposta do denunciante',
                'protocolo': 'OUVY-FREE-TEST'
            },
            format='json'
        )
        
        # Deve retornar 201, mesmo em plano free
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class FeatureGatingExceptionHandlerTestCase(APITestCase):
    """Testa que o custom_exception_handler retorna 403 Forbidden para FeatureNotAvailableError."""
    
    def setUp(self):
        """Cria dados de teste."""
        self.user = User.objects.create_user(username='teste', password='pass123')
        self.client_tenant = Client.objects.create(
            owner=self.user,
            nome='Test Company',
            subdominio='test-company',
            plano='free'
        )
        self.feedback = Feedback.objects.create(
            client=self.client_tenant,
            protocolo='OUVY-TEST-EXCP',
            titulo='Test',
            descricao='Test'
        )
        self.api_client = APIClient()
    
    def test_feature_not_available_returns_403(self):
        """FeatureNotAvailableError deve retornar 403 Forbidden."""
        self.api_client.force_authenticate(user=self.user)
        self.api_client.defaults['HTTP_X_TENANT_ID'] = str(self.client_tenant.id)
        
        response = self.api_client.post(
            f'/api/feedbacks/{self.feedback.id}/adicionar-interacao/',
            {
                'mensagem': 'Nota interna bloqueada',
                'tipo': 'NOTA_INTERNA'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
        self.assertIn('feature', response.data)
        self.assertIn('current_plan', response.data)
