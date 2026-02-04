import json

import pytest
from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from apps.feedbacks.models import Feedback
from apps.tenants.models import Client as TenantClient


class FeedbackAPITestCase(TestCase):
    """
    Testes de integração para a API de Feedbacks
    """

    def setUp(self):
        """Configuração inicial para os testes"""
        self.client = Client()

        # Criar tenant de teste
        self.tenant = TenantClient.objects.create(
            nome="Empresa Teste", subdominio="teste", plano="starter", ativo=True
        )

        # Criar usuário de teste
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Headers para simular tenant
        self.headers = {
            "HTTP_X_TENANT_ID": str(self.tenant.pk),
            "CONTENT_TYPE": "application/json",
        }

    def test_create_feedback_anonymous(self):
        """Teste: Criar feedback anônimo"""
        payload = {
            "tipo": "denuncia",
            "titulo": "Denúncia de Teste",
            "descricao": "Descrição detalhada da denúncia para teste",
            "anonimo": True,
        }

        response = self.client.post(
            reverse("feedback-list"),
            data=payload,
            content_type="application/json",
            **self.headers,
        )

        self.assertEqual(response.status_code, 201)

        # Verificar se o feedback foi criado
        data = response.json()
        self.assertIn("protocolo", data)
        self.assertEqual(data["tipo"], "denuncia")
        self.assertEqual(data["titulo"], "Denúncia de Teste")
        self.assertTrue(data["anonimo"])

        # Verificar no banco usando all_tenants() (fora do contexto de tenant no thread-local)
        feedback = Feedback.objects.all_tenants().get(
            protocolo=data["protocolo"], client=self.tenant
        )
        self.assertEqual(feedback.client, self.tenant)
        self.assertEqual(feedback.tipo, "denuncia")

    def test_create_feedback_authenticated(self):
        """Teste: Criar feedback como usuário autenticado"""
        # Fazer login
        self.client.login(username="testuser", password="testpass123")

        payload = {
            "tipo": "sugestao",
            "titulo": "Sugestão de Melhoria",
            "descricao": "Implementar dark mode na plataforma",
            "anonimo": False,
        }

        response = self.client.post(
            reverse("feedback-list"),
            data=payload,
            content_type="application/json",
            **self.headers,
        )

        self.assertEqual(response.status_code, 201)

        data = response.json()
        self.assertEqual(data["tipo"], "sugestao")
        self.assertFalse(data["anonimo"])

    def test_consultar_protocolo(self):
        """Teste: Consultar status de feedback por protocolo"""
        # Criar feedback primeiro (simplificado - sem verificar banco)
        payload = {
            "tipo": "reclamacao",
            "titulo": "Reclamação de Teste",
            "descricao": "Serviço lento",
            "anonimo": True,
        }

        create_response = self.client.post(
            reverse("feedback-list"),
            data=payload,
            content_type="application/json",
            **self.headers,
        )

        self.assertEqual(create_response.status_code, 201)

        protocolo = create_response.json()["protocolo"]

        # Consultar protocolo
        url = reverse("feedback-consultar-protocolo")
        response = self.client.get(f"{url}?protocolo={protocolo}", **self.headers)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["protocolo"], protocolo)

    def test_protocolo_not_found(self):
        """Teste: Consultar protocolo inexistente"""
        url = reverse("feedback-consultar-protocolo")
        response = self.client.get(f"{url}?protocolo=INVALID-PROTOCOL", **self.headers)

        self.assertEqual(response.status_code, 404)

    def test_tenant_isolation(self):
        """Teste: Isolamento entre tenants"""
        # Criar um segundo tenant
        tenant2 = TenantClient.objects.create(
            nome="Empresa 2",
            subdominio="empresa2",
            plano="starter",
            ativo=True,
        )

        # Criar feedback no tenant2
        feedback_t2 = Feedback.objects.all_tenants().create(
            client=tenant2,
            tipo="reclamacao",
            titulo="Reclamação Tenant2",
            descricao="Texto",
            anonimo=True,
        )

        # Consultar o protocolo do tenant2 com header do tenant1 deve retornar 404
        url = reverse("feedback-consultar-protocolo")
        response = self.client.get(
            f"{url}?protocolo={feedback_t2.protocolo}",
            **self.headers,
        )
        self.assertEqual(response.status_code, 404)

    def test_rate_limiting(self):
        """Teste: Rate limiting na consulta de protocolo"""
        # Fazer múltiplas requisições rápidas
        url = reverse("feedback-consultar-protocolo")

        for i in range(10):
            response = self.client.get(f"{url}?codigo=INVALID-PROTOCOL", **self.headers)

        # A última deve ser bloqueada por rate limiting
        # (depende da configuração do throttle)
        # Este teste pode precisar ser ajustado baseado na configuração real

    # def test_export_feedbacks(self):
    #     """Teste: Exportar feedbacks em CSV"""
    #     # TODO: Implementar teste de export quando URL estiver funcionando
    #     pass


class HealthCheckTestCase(TestCase):
    """Testes para health checks"""

    def setUp(self):
        self.client = Client()

    def test_health_endpoint(self):
        """Teste: Health check endpoint"""
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")

    def test_api_health_endpoint(self):
        """Teste: API health check"""
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")
