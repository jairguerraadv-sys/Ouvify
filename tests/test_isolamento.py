"""Testa isolamento multi-tenant via API interna sem depender de servidor externo."""
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.tenants.models import Client


class IsolamentoAPITest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_a = User.objects.create_user(
            username="a@example.com", email="a@example.com", password="Senha123!"
        )
        cls.user_b = User.objects.create_user(
            username="b@example.com", email="b@example.com", password="Senha123!"
        )

        cls.tenant_a = Client.objects.create(
            owner=cls.user_a,
            nome="Empresa A",
            subdominio="empresaa",
            cor_primaria="#3B82F6",
            ativo=True,
        )
        cls.tenant_b = Client.objects.create(
            owner=cls.user_b,
            nome="Empresa B",
            subdominio="empresab",
            cor_primaria="#10B981",
            ativo=True,
        )

        cls.token_a, _ = Token.objects.get_or_create(user=cls.user_a)
        cls.token_b, _ = Token.objects.get_or_create(user=cls.user_b)

    def _client_for(self, tenant, token):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        client.defaults['HTTP_HOST'] = f"{tenant.subdominio}.local"
        return client

    def _get_results(self, response):
        data = response.json()
        return data.get("results", data) if isinstance(data, dict) else data

    def test_isolation_between_tenants(self):
        client_public_a = APIClient()
        client_public_a.defaults['HTTP_HOST'] = "empresaa.local"
        client_public_b = APIClient()
        client_public_b.defaults['HTTP_HOST'] = "empresab.local"

        # Criar feedbacks públicos (endpoint permite AllowAny)
        resp_a = client_public_a.post(
            "/api/feedbacks/",
            {
                "tipo": "sugestao",
                "titulo": "Feedback da Empresa A",
                "descricao": "Este feedback pertence à Empresa A",
                "anonimo": False,
                "email_contato": "contato@empresaa.com",
            },
            format="json",
        )
        self.assertEqual(resp_a.status_code, 201)

        resp_b = client_public_b.post(
            "/api/feedbacks/",
            {
                "tipo": "reclamacao",
                "titulo": "Feedback da Empresa B",
                "descricao": "Este feedback pertence à Empresa B",
                "anonimo": False,
                "email_contato": "contato@empresab.com",
            },
            format="json",
        )
        self.assertEqual(resp_b.status_code, 201)

        # Listar autenticado por tenant
        client_a = self._client_for(self.tenant_a, self.token_a.key)
        list_a = client_a.get("/api/feedbacks/")
        self.assertEqual(list_a.status_code, 200)
        data_a = self._get_results(list_a)
        self.assertEqual(len(data_a), 1)
        self.assertIn("Empresa A", data_a[0]["titulo"])

        client_b = self._client_for(self.tenant_b, self.token_b.key)
        list_b = client_b.get("/api/feedbacks/")
        self.assertEqual(list_b.status_code, 200)
        data_b = self._get_results(list_b)
        self.assertEqual(len(data_b), 1)
        self.assertIn("Empresa B", data_b[0]["titulo"])

        # Garantir que feedbacks não vazam entre tenants
        self.assertNotEqual(data_a[0]["id"], data_b[0]["id"])
