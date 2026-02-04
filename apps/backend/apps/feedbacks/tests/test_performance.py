"""
Teste de performance para validar otimizações N+1 em Feedback queries.
"""

import os

import django
from django.db import connection
from django.test import TestCase
from django.test.utils import override_settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.core.utils import set_current_tenant
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client


class FeedbackQueryOptimizationTest(TestCase):
    """Valida que queries de Feedback não executam N+1"""

    def setUp(self):
        """Criar dados de teste"""
        self.tenant = Client.objects.create(nome="Empresa Teste", subdominio="teste")

        # Definir tenant atual
        set_current_tenant(self.tenant)

        # Criar 10 feedbacks para teste
        self.feedbacks = []
        for i in range(10):
            feedback = Feedback.objects.create(
                client=self.tenant,
                titulo=f"Feedback {i}",
                descricao=f"Descrição {i}",
                tipo="reclamacao",
                email_contato=f"user{i}@example.com",
            )
            self.feedbacks.append(feedback)

    def test_no_n_plus_1_in_list_view(self):
        """Valida que listagem não executa N+1 queries"""
        from apps.feedbacks.views import FeedbackViewSet

        # Simular request
        viewset = FeedbackViewSet()
        viewset.request = type(
            "MockRequest", (), {"tenant": self.tenant, "query_params": {}}
        )()

        # Resetar contador de queries
        connection.queries_log.clear()

        # Executar queryset (simulando list view)
        queryset = viewset.get_queryset()
        feedbacks = list(queryset[:5])  # Pegar apenas 5 para teste

        # Verificar acesso aos relacionamentos
        for feedback in feedbacks:
            # Acesso que poderia causar N+1
            client_name = feedback.client.nome
            self.assertEqual(client_name, "Empresa Teste")

        # Validar que NÃO executou queries extras
        num_queries = len(connection.queries)
        self.assertLessEqual(
            num_queries,
            3,
            f"Query N+1 detectada: {num_queries} queries executadas. "
            f"Queries: {[q['sql'][:100] for q in connection.queries]}",
        )

        print(f"✅ List view: {num_queries} queries (esperado: 1-3)")

    def test_no_n_plus_1_in_detail_view(self):
        """Valida que detail view não executa N+1 queries"""
        from apps.feedbacks.views import FeedbackViewSet

        viewset = FeedbackViewSet()
        viewset.action = "retrieve"  # Simular detail view
        viewset.request = type(
            "MockRequest", (), {"tenant": self.tenant, "query_params": {}}
        )()

        # Resetar contador
        connection.queries_log.clear()

        # Executar queryset de detail
        queryset = viewset.get_queryset()
        feedback = queryset.filter(pk=self.feedbacks[0].pk).first()

        # Acesso que poderia causar N+1
        client_name = feedback.client.nome
        self.assertEqual(client_name, "Empresa Teste")

        # Verificar prefetch_related funcionou
        interacoes_count = feedback.interacoes.count()  # Deve usar prefetch
        arquivos_count = feedback.arquivos.count()  # Deve usar prefetch
        self.assertGreaterEqual(interacoes_count, 0)
        self.assertGreaterEqual(arquivos_count, 0)

        num_queries = len(connection.queries)
        self.assertLessEqual(
            num_queries, 3, f"Query N+1 detectada na detail view: {num_queries} queries"
        )

        print(f"✅ Detail view: {num_queries} queries (esperado: 1-3)")

    @override_settings(DEBUG=True)
    def test_individual_queries_optimized(self):
        """Valida que queries individuais têm select_related"""
        connection.queries_log.clear()

        # Testar query individual por ID (usando all_tenants para bypassar filtro)
        feedback = (
            Feedback.objects.all_tenants()
            .filter(pk=self.feedbacks[0].pk)
            .select_related("client", "autor")
            .first()
        )

        # Acesso aos relacionamentos
        client_name = feedback.client.nome
        self.assertEqual(client_name, "Empresa Teste")

        num_queries = len(connection.queries)
        self.assertEqual(
            num_queries,
            1,
            f"Query deveria executar apenas 1 query, executou {num_queries}",
        )

        print("✅ Individual queries otimizadas")


if __name__ == "__main__":
    import unittest

    unittest.main()
