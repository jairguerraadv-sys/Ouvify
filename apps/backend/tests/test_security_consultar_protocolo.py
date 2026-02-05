"""
🔒 Testes de Segurança para Consulta de Protocolo
Auditoria: CR-001 (CRÍTICA) - Vazamento cross-tenant

Scenario
s:
1. Sem tenant header/subdomínio → 400 (Bad Request)
2. Tenant ID inválido → 404 (Not Found)
3. Protocolo existe em outro tenant → 404 (Not Found)
4. Protocolo existe no tenant correto → 200 + dados públicos

Criado em: 2026-02-05
"""

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.feedbacks.models import Feedback
from apps.tenants.models import Client


class ConsultarProtocoloSecurityTests(APITestCase):
    """
    Testes de segurança para garantir que /api/feedbacks/consultar-protocolo/
    não vaza dados entre tenants
    """

    def setUp(self):
        """Criar 2 tenants e feedbacks de teste"""
        self.client = APIClient()

        # Tenant 1
        self.tenant1 = Client.objects.create(
            nome="Empresa A",
            subdominio="empresa-a",
            ativo=True,
        )

        # Tenant 2
        self.tenant2 = Client.objects.create(
            nome="Empresa B",
            subdominio="empresa-b",
            ativo=True,
        )

        # Feedback no Tenant 1
        self.feedback1 = Feedback.objects.create(
            client=self.tenant1,
            protocolo="OUVY-A1B2-C3D4",
            titulo="Reclamação Tenant 1",
            descricao="Dados sensíveis do Tenant 1",
            status=Feedback.RECEBIDO,
            tipo=Feedback.RECLAMACAO,
        )

        # Feedback no Tenant 2
        self.feedback2 = Feedback.objects.create(
            client=self.tenant2,
            protocolo="OUVY-E5F6-G7H8",
            titulo="Elogio Tenant 2",
            descricao="Dados do Tenant 2",
            status=Feedback.RECEBIDO,
            tipo=Feedback.ELOGIO,
        )

    def test_consultar_protocolo_sem_tenant_header_retorna_400(self):
        """
        Scenario 1: Requisição sem X-Tenant-ID ou subdomínio
        Esperado: 400 Bad Request
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_HOST="localhost:8000",  # Sem subdomínio válido
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.json())

    def test_consultar_protocolo_tenant_invalido_retorna_404(self):
        """
        Scenario 2: X-Tenant-ID inválido
        Esperado: 404 Not Found (genérico, não revela se tenant existe)
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_X_TENANT_ID="99999",  # Tenant não existe
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_consultar_protocolo_tenant_inativo_retorna_404(self):
        """
        Scenario 2b: Tenant desativado
        Esperado: 404 Not Found
        """
        self.tenant1.ativo = False
        self.tenant1.save()

        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_X_TENANT_ID=str(self.tenant1.id),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_consultar_protocolo_outro_tenant_retorna_404(self):
        """
        🔴 CRÍTICA: VAZAMENTO DE DADOS

        Scenario 3: Protocolo do Tenant 2 consultado via Tenant 1
        Esperado: 404 Not Found (protocolo não encontrado)

        Antes do fix: Retornava 200 + dados do feedback (VAZAMENTO!)
        Depois do fix: Retorna 404 genérico
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-E5F6-G7H8",  # Protocolo do Tenant 2
            HTTP_X_TENANT_ID=str(self.tenant1.id),  # Consultado via Tenant 1
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            msg="🔴 CRÍTICA: Protocolo de outro tenant foi retornado! Vazamento cross-tenant detectado!",
        )

    def test_consultar_protocolo_tenant_correto_retorna_200_com_dados_publicos(self):
        """
        Scenario 4: Protocolo correto do tenant correto
        Esperado: 200 OK + dados públicos (sem informações sensíveis)
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_X_TENANT_ID=str(self.tenant1.id),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Validar que apenas campos públicos são retornados
        self.assertIn("protocolo", data)
        self.assertIn("titulo", data)
        self.assertIn("status", data)
        self.assertEqual(data["protocolo"], "OUVY-A1B2-C3D4")
        self.assertEqual(data["titulo"], "Reclamação Tenant 1")

    def test_consultar_protocolo_via_subdominio_funcionando(self):
        """
        Scenario 5: Consulta via subdomínio (sem X-Tenant-ID header)
        Esperado: 200 OK se subdomínio for válido
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_HOST="empresa-a.example.com",  # Subdomínio válido
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["protocolo"], "OUVY-A1B2-C3D4")

    def test_consultar_protocolo_nao_expoe_campos_sensíveis(self):
        """
        Validar que FeedbackConsultaSerializer não retorna campos internos
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-A1B2-C3D4",
            HTTP_X_TENANT_ID=str(self.tenant1.id),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Campos que NÃO devem estar em resposta pública
        sensitive_fields = ["descricao_interna", "notas_internas", "email_denunciante"]
        for field in sensitive_fields:
            self.assertNotIn(
                field,
                data,
                msg=f"🔴 SEGURANÇA: Campo sensível '{field}' foi exposto na resposta pública!",
            )

    def test_consultar_protocolo_case_insensitive(self):
        """
        Protocolo deve ser case-insensitive (normalizar para maiúsculas)
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/?protocolo=ouvy-a1b2-c3d4",  # Minúsculas
            HTTP_X_TENANT_ID=str(self.tenant1.id),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["protocolo"], "OUVY-A1B2-C3D4")

    def test_consultar_protocolo_sem_parametro_retorna_400(self):
        """
        Falta do parâmetro 'protocolo' deve retornar erro
        """
        response = self.client.get(
            "/api/feedbacks/consultar-protocolo/",  # Sem ?protocolo=
            HTTP_X_TENANT_ID=str(self.tenant1.id),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.json())


class ConsultarProtocoloEnumerationTests(APITestCase):
    """
    Testes para detectar vulnerabilidades de enumeração de protocolos
    """

    def setUp(self):
        self.client = APIClient()
        self.tenant1 = Client.objects.create(
            nome="Empresa A",
            subdominio="empresa-a",
            ativo=True,
        )
        self.tenant2 = Client.objects.create(
            nome="Empresa B",
            subdominio="empresa-b",
            ativo=True,
        )

        # Criar apenas UM feedback no Tenant 1
        self.feedback1 = Feedback.objects.create(
            client=self.tenant1,
            protocolo="OUVY-AAAA-BBBB",
            titulo="Feedback existente",
            status=Feedback.RECEBIDO,
            tipo=Feedback.RECLAMACAO,
        )

    def test_enumeracao_protocolos_retorna_404_generico(self):
        """
        Validar que tentativas de enumerar protocolos retornam sempre 404
        sem revelar qual protocolo existe em qual tenant
        """
        non_existent_protocols = ["OUVY-XXXX-YYYY", "OUVY-1111-2222", "OUVY-CCCC-DDDD"]

        for protocol in non_existent_protocols:
            response = self.client.get(
                f"/api/feedbacks/consultar-protocolo/?protocolo={protocol}",
                HTTP_X_TENANT_ID=str(self.tenant1.id),
            )

            self.assertEqual(
                response.status_code,
                status.HTTP_404_NOT_FOUND,
                msg=f"Protocolo {protocol} retornou status diferente de 404",
            )

            # Error message deve ser genérico (não revelar se existe em outro tenant)
            data = response.json()
            self.assertIn("Protocolo não encontrado", data.get("error", ""))

    def test_nao_consegue_enumerar_protocols_cross_tenant(self):
        """
        Validar que atacante não consegue descobrir protocolos de outro tenant
        via tentativas de enumerar
        """
        # Feedback no Tenant 2
        feedback2 = Feedback.objects.create(
            client=self.tenant2,
            protocolo="OUVY-SECRET-XXXX",
            titulo="Secret feedback",
            status=Feedback.RECEBIDO,
            tipo=Feedback.SUGESTAO,
        )

        # Tentar consultar protocolo do Tenant 2 usando Tenant 1
        response = self.client.get(
            f"/api/feedbacks/consultar-protocolo/?protocolo={feedback2.protocolo}",
            HTTP_X_TENANT_ID=str(self.tenant1.id),  # Tenant 1, não 2!
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertNotIn(feedback2.protocolo, str(response.json()))


# ===== Integração com Rate Limiting (para FASE 3) =====


class ConsultarProtocoloRateLimitingTests(APITestCase):
    """
    Testes para validar Rate Limiting em consultar-protocolo
    (Part of Phase 3: Rate Limiting)
    """

    def setUp(self):
        self.client = APIClient()
        self.tenant = Client.objects.create(
            nome="Empresa Teste",
            subdominio="empresa-teste",
            ativo=True,
        )

    @override_settings(
        REST_FRAMEWORK={
            "DEFAULT_THROTTLE_CLASSES": [
                "rest_framework.throttling.AnonRateThrottle",
            ],
            "DEFAULT_THROTTLE_RATES": {
                "anon": "100/day",
                # Protocol lookup será throttled separadamente em Phase 3
            },
        }
    )
    def test_consultar_protocolo_rate_limiting_placeholder(self):
        """
        Placeholder para rate limiting tests (será implementado na FASE 3)
        Já está estruturado para aplicar ProtocolLookupThrottle na action
        """
        pass  # Será implementado em FASE 3


if __name__ == "__main__":
    import unittest

    unittest.main()
