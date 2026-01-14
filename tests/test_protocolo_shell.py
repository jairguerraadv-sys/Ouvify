"""Valida geração e unicidade de protocolos via ORM isolado."""
from django.test import TestCase

from apps.feedbacks.models import Feedback
from apps.tenants.models import Client
from apps.core.utils import set_current_tenant, clear_current_tenant


class ProtocoloShellTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.tenant = Client.objects.create(
            nome="Empresa A - Teste",
            subdominio="empresaa",
            cor_primaria="#0066CC",
            ativo=True,
        )

    def test_protocolo_unico_e_busca(self):
        set_current_tenant(self.tenant)
        fb = Feedback.objects.create(
            tipo="denuncia",
            titulo="Teste de Protocolo via ORM",
            descricao="Geração automática",
            anonimo=False,
            email_contato="teste@exemplo.com",
        )
        clear_current_tenant()

        # Busca global
        found = Feedback.objects.all_tenants().get(protocolo=fb.protocolo)  # type: ignore[attr-defined]
        self.assertEqual(found.id, fb.id)
        self.assertEqual(found.client, self.tenant)

        # Protocolo inexistente
        with self.assertRaises(Feedback.DoesNotExist):
            Feedback.objects.all_tenants().get(protocolo="OUVY-ZZZZ-9999")  # type: ignore[attr-defined]

        # Unicidade
        total = Feedback.objects.all_tenants().count()  # type: ignore[attr-defined]
        distintos = Feedback.objects.all_tenants().values("protocolo").distinct().count()  # type: ignore[attr-defined]
        self.assertEqual(total, distintos)
