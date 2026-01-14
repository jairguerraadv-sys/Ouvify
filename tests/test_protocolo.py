"""Valida protocolo de rastreamento sem depender de servidor externo."""
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.tenants.models import Client


class ProtocoloAPITest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="a@example.com", email="a@example.com", password="Senha123!"
        )
        cls.tenant = Client.objects.create(
            owner=cls.user,
            nome="Empresa A",
            subdominio="empresaa",
            cor_primaria="#3B82F6",
            ativo=True,
        )
        cls.token, _ = Token.objects.get_or_create(user=cls.user)

    def _client(self):
        client = APIClient()
        client.defaults['HTTP_HOST'] = "empresaa.local"
        return client

    def _client_authed(self):
        client = self._client()
        client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        return client

    def _get_results(self, response):
        data = response.json()
        return data.get("results", data) if isinstance(data, dict) else data

    def test_criacao_e_consulta_protocolo(self):
        client_public = self._client()
        resp_create = client_public.post(
            "/api/feedbacks/",
            {
                "tipo": "denuncia",
                "titulo": "Teste de Protocolo Automático",
                "descricao": "Verificando geração de protocolo",
                "anonimo": False,
                "email_contato": "teste@exemplo.com",
            },
            format="json",
        )
        self.assertEqual(resp_create.status_code, 201)
        data = resp_create.json()
        protocolo = data.get("protocolo")
        self.assertTrue(protocolo)

        # Consulta pública
        resp_consulta = client_public.get(
            "/api/feedbacks/consultar-protocolo/",
            {"codigo": protocolo},
        )
        self.assertEqual(resp_consulta.status_code, 200)
        self.assertEqual(resp_consulta.json().get("protocolo"), protocolo)

        # Consulta inválida
        resp_invalido = client_public.get(
            "/api/feedbacks/consultar-protocolo/",
            {"codigo": "OUVY-ZZZZ-9999"},
        )
        self.assertEqual(resp_invalido.status_code, 404)

        # Sem código
        resp_sem_codigo = client_public.get("/api/feedbacks/consultar-protocolo/")
        self.assertEqual(resp_sem_codigo.status_code, 400)

        # Listagem autenticada deve trazer protocolos
        client_authed = self._client_authed()
        resp_list = client_authed.get("/api/feedbacks/")
        self.assertEqual(resp_list.status_code, 200)
        feedbacks = self._get_results(resp_list)
        self.assertGreaterEqual(len(feedbacks), 1)
        self.assertTrue(all(fb.get("protocolo") for fb in feedbacks))
