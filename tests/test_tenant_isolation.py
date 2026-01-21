
import pytest
from django.test import TestCase


from django.contrib.auth.models import User
from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.core.utils import set_current_tenant, clear_current_tenant

@pytest.mark.django_db
class TestTenantIsolation(TestCase):
    """Valida isolamento completo de dados entre tenants"""

    def setUp(self):
        self.tenant_a = Client.objects.create(
            nome="Empresa A LTDA",
            subdominio="empresa-a",
            ativo=True
        )
        self.tenant_b = Client.objects.create(
            nome="Empresa B LTDA",
            subdominio="empresa-b",
            ativo=True
        )
        self.user_a = User.objects.create_user(
            username='admin_a',
            email='admin@empresa-a.com',
            password='senha123'
        )
        self.user_b = User.objects.create_user(
            username='admin_b',
            email='admin@empresa-b.com',
            password='senha123'
        )
        set_current_tenant(self.tenant_a)
        self.feedback_a = Feedback.objects.create(
            client=self.tenant_a,
            tipo='reclamacao',
            titulo='Feedback A',
            descricao='Mensagem do tenant A',
            email_contato='user@empresa-a.com',
            status='pendente'
        )
        clear_current_tenant()
        set_current_tenant(self.tenant_b)
        self.feedback_b = Feedback.objects.create(
            client=self.tenant_b,
            tipo='sugestao',
            titulo='Feedback B',
            descricao='Mensagem do tenant B',
            email_contato='user@empresa-b.com',
            status='pendente'
        )
        clear_current_tenant()
    def tearDown(self):
        clear_current_tenant()

    def test_feedback_isolation_between_tenants(self):
        set_current_tenant(self.tenant_a)
        feedbacks_a = Feedback.objects.filter(client=self.tenant_a)
        self.assertEqual(feedbacks_a.count(), 1)
        self.assertIn(self.feedback_a, feedbacks_a)
        self.assertNotIn(self.feedback_b, feedbacks_a)
        self.assertNotEqual(self.feedback_a.protocolo, self.feedback_b.protocolo)
        clear_current_tenant()

    def test_query_filtering_by_tenant(self):
        set_current_tenant(self.tenant_a)
        feedbacks = Feedback.objects.filter(client=self.tenant_a)
        self.assertEqual(feedbacks.count(), 1)
        self.assertEqual(feedbacks.first(), self.feedback_a)
        clear_current_tenant()
        set_current_tenant(self.tenant_b)
        feedbacks = Feedback.objects.filter(client=self.tenant_b)
        self.assertEqual(feedbacks.count(), 1)
        self.assertEqual(feedbacks.first(), self.feedback_b)
        clear_current_tenant()
