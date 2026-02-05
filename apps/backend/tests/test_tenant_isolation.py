import pytest
from django.contrib.auth.models import User
from django.test import TestCase

from apps.core.utils import clear_current_tenant, set_current_tenant
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client


@pytest.mark.django_db
class TestTenantIsolation(TestCase):
    """Valida isolamento completo de dados entre clients (tenants)"""

    def setUp(self):
        """Configurar cenário com dois clients"""

        # Criar Clients
        self.tenant_a = Client.objects.create(
            nome="Empresa A LTDA", subdominio="empresa-a"
        )

        self.tenant_b = Client.objects.create(
            nome="Empresa B LTDA", subdominio="empresa-b"
        )

        # Criar Users
        self.user_a = User.objects.create_user(
            username="admin_a", email="admin@empresa-a.com", password="senha123"
        )

        self.user_b = User.objects.create_user(
            username="admin_b", email="admin@empresa-b.com", password="senha123"
        )

        # DEFINIR contexto de tenant A antes de criar feedback
        set_current_tenant(self.tenant_a)

        self.feedback_a = Feedback.objects.create(
            client=self.tenant_a,
            tipo="reclamacao",
            titulo="Feedback A",
            descricao="Descrição do feedback A",
            email_contato="user@empresa-a.com",
            status="pendente",
        )

        # LIMPAR e definir contexto de tenant B
        clear_current_tenant()
        set_current_tenant(self.tenant_b)

        self.feedback_b = Feedback.objects.create(
            client=self.tenant_b,
            tipo="sugestao",
            titulo="Feedback B",
            descricao="Descrição do feedback B",
            email_contato="user@empresa-b.com",
            status="pendente",
        )

        # LIMPAR contexto ao final do setup
        clear_current_tenant()

    def tearDown(self):
        """Limpar contexto após cada teste"""
        clear_current_tenant()

    def test_feedback_isolation_between_tenants(self):
        """Garante que tenant A não acessa dados do tenant B"""

        # Definir contexto para tenant A
        set_current_tenant(self.tenant_a)

        # Listar feedbacks do Tenant A
        feedbacks_a = Feedback.objects.filter(client=self.tenant_a)

        self.assertEqual(feedbacks_a.count(), 1)
        self.assertIn(self.feedback_a, feedbacks_a)
        self.assertNotIn(self.feedback_b, feedbacks_a)

        clear_current_tenant()

    def test_query_filtering_by_tenant(self):
        """Testa que queries filtram corretamente por tenant"""

        # Tenant A
        set_current_tenant(self.tenant_a)
        feedbacks = Feedback.objects.filter(client=self.tenant_a)

        self.assertEqual(feedbacks.count(), 1)
        self.assertEqual(feedbacks.first(), self.feedback_a)

        clear_current_tenant()

        # Tenant B
        set_current_tenant(self.tenant_b)
        feedbacks = Feedback.objects.filter(client=self.tenant_b)

        self.assertEqual(feedbacks.count(), 1)
        self.assertEqual(feedbacks.first(), self.feedback_b)

        clear_current_tenant()
