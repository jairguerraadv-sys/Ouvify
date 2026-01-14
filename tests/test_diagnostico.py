"""Verifica isolamento por tenant via ORM com banco de teste."""
from django.test import TestCase

from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.core.utils import set_current_tenant, clear_current_tenant


class DiagnosticoTenantIsolationTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.empresa_a = Client.objects.create(
            nome="Empresa A",
            subdominio="empresaa",
            cor_primaria="#3B82F6",
            ativo=True,
        )
        cls.empresa_b = Client.objects.create(
            nome="Empresa B",
            subdominio="empresab",
            cor_primaria="#10B981",
            ativo=True,
        )

        # Feedbacks em tenants distintos
        set_current_tenant(cls.empresa_a)
        Feedback.objects.create(
            tipo="denuncia",
            titulo="Feedback A",
            descricao="Isolamento A",
            anonimo=True,
            email_contato="a@a.com",
        )
        clear_current_tenant()

        set_current_tenant(cls.empresa_b)
        Feedback.objects.create(
            tipo="elogio",
            titulo="Feedback B",
            descricao="Isolamento B",
            anonimo=True,
            email_contato="b@b.com",
        )
        clear_current_tenant()

    def test_all_tenants_sees_both(self):
        total = Feedback.objects.all_tenants().count()  # type: ignore[attr-defined]
        self.assertEqual(total, 2)

    def test_filter_with_tenant_a(self):
        set_current_tenant(self.empresa_a)
        feedbacks_a = list(Feedback.objects.all())
        clear_current_tenant()
        self.assertEqual(len(feedbacks_a), 1)
        self.assertEqual(feedbacks_a[0].titulo, "Feedback A")

    def test_filter_with_tenant_b(self):
        set_current_tenant(self.empresa_b)
        feedbacks_b = list(Feedback.objects.all())
        clear_current_tenant()
        self.assertEqual(len(feedbacks_b), 1)
        self.assertEqual(feedbacks_b[0].titulo, "Feedback B")
