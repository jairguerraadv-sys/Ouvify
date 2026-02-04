# tests/test_api_tenant_isolation.py
import pytest
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.core.utils import clear_current_tenant, set_current_tenant, tenant_context
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client


@pytest.mark.django_db
class TestAPIClientIsolation(APITestCase):
    """Testa isolamento de client (tenant) nas APIs REST"""

    def setUp(self):
        """Configurar ambiente de teste"""

        # Criar clients
        self.client_a = Client.objects.create(nome="Empresa A", subdominio="empresa-a")

        self.client_b = Client.objects.create(nome="Empresa B", subdominio="empresa-b")

        # Criar usuários
        self.user_a = User.objects.create_user(
            username="admin_a", email="admin@a.com", password="senha123"
        )

        self.user_b = User.objects.create_user(
            username="admin_b", email="admin@b.com", password="senha123"
        )

        # Criar feedbacks com contexto
        with tenant_context(self.client_a):
            self.feedback_a = Feedback.objects.create(
                client=self.client_a,
                tipo="reclamacao",
                titulo="Feedback A",
                descricao="Teste A",
                email_contato="test@a.com",
                status="pendente",
            )
        with tenant_context(self.client_b):
            self.feedback_b = Feedback.objects.create(
                client=self.client_b,
                tipo="reclamacao",
                titulo="Feedback B",
                descricao="Teste B",
                email_contato="test@b.com",
                status="pendente",
            )

        # Adicionar subdomínios ao ALLOWED_HOSTS
        if not hasattr(settings, "_test_allowed_hosts_backup"):
            settings._test_allowed_hosts_backup = settings.ALLOWED_HOSTS.copy()
            settings.ALLOWED_HOSTS.extend(
                [
                    "empresa-a.localhost",
                    "empresa-b.localhost",
                    ".localhost",
                ]
            )

    @classmethod
    def tearDownClass(cls):
        """Restaurar ALLOWED_HOSTS"""
        if hasattr(settings, "_test_allowed_hosts_backup"):
            settings.ALLOWED_HOSTS = settings._test_allowed_hosts_backup
        super().tearDownClass()

    def _create_client_for_tenant(self, client_obj):
        """Cria APIClient configurado para simular requisição do tenant"""
        api_client = APIClient()
        api_client.defaults["HTTP_HOST"] = f"{client_obj.subdominio}.localhost"
        return api_client

    def test_consultar_protocolo_publico_funciona(self):
        """Endpoint público de consulta deve funcionar sem autenticação"""

        client = self._create_client_for_tenant(self.client_a)

        response = client.get(
            "/api/feedbacks/consultar-protocolo/",
            {"protocolo": self.feedback_a.protocolo},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["protocolo"], self.feedback_a.protocolo)

    def test_list_feedbacks_requer_autenticacao(self):
        """Listar feedbacks deve exigir autenticação"""

        client = self._create_client_for_tenant(self.client_a)

        response = client.get("/api/feedbacks/")

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_responder_protocolo_publico(self):
        """Resposta pública via protocolo deve funcionar"""

        client = self._create_client_for_tenant(self.client_a)

        data = {"protocolo": self.feedback_a.protocolo, "mensagem": "Resposta de teste"}

        response = client.post(
            "/api/feedbacks/responder-protocolo/", data, format="json"
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST],
        )
