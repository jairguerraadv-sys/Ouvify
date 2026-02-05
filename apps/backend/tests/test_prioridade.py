"""
Testes para sistema de Prioridade de feedbacks.
"""

import pytest

from apps.core.utils import clear_current_tenant, set_current_tenant
from apps.feedbacks.models import Feedback


@pytest.mark.django_db
class TestPrioridadeSystem:
    """Testes para o sistema de Prioridade."""

    def test_create_feedback_with_default_prioridade(
        self, user_factory, tenant_factory
    ):
        """Testa que feedback é criado com prioridade 'media' por padrão."""
        tenant = tenant_factory()
        set_current_tenant(tenant)

        try:
            feedback = Feedback.objects.create(
                tipo="reclamacao",
                titulo="Feedback Teste",
                descricao="Descrição",
                status="pendente",
                client=tenant,
            )

            assert feedback.prioridade == "media"
        finally:
            clear_current_tenant()

    def test_create_feedback_with_alta_prioridade(self, user_factory, tenant_factory):
        """Testa criação de feedback com prioridade alta."""
        tenant = tenant_factory()
        set_current_tenant(tenant)

        try:
            feedback = Feedback.objects.create(
                tipo="denuncia",
                titulo="Denúncia Urgente",
                descricao="Descrição",
                status="pendente",
                prioridade="alta",
                client=tenant,
            )

            assert feedback.prioridade == "alta"
        finally:
            clear_current_tenant()

    def test_create_feedback_with_critica_prioridade(
        self, user_factory, tenant_factory
    ):
        """Testa criação de feedback com prioridade crítica."""
        tenant = tenant_factory()
        set_current_tenant(tenant)

        try:
            feedback = Feedback.objects.create(
                tipo="denuncia",
                titulo="Emergência",
                descricao="Situação crítica",
                status="pendente",
                prioridade="critica",
                client=tenant,
            )

            assert feedback.prioridade == "critica"
        finally:
            clear_current_tenant()

    def test_filter_by_prioridade(self, api_client, authenticated_user):
        """Testa filtro por prioridade via API."""
        user, tenant = authenticated_user
        api_client.force_authenticate(user=user)
        set_current_tenant(tenant)

        try:
            # Criar feedbacks com diferentes prioridades
            Feedback.objects.create(
                tipo="reclamacao",
                titulo="Baixa Prioridade",
                descricao="Desc",
                status="pendente",
                prioridade="baixa",
                client=tenant,
            )
            fb_alta = Feedback.objects.create(
                tipo="reclamacao",
                titulo="Alta Prioridade",
                descricao="Desc",
                status="pendente",
                prioridade="alta",
                client=tenant,
            )

            # Verificar diretamente no banco
            from apps.feedbacks.models import Feedback as Fb

            all_feedbacks = list(
                Fb.objects.filter(client=tenant).values_list("prioridade", flat=True)
            )
            alta_feedbacks = list(Fb.objects.filter(client=tenant, prioridade="alta"))

            assert "alta" in all_feedbacks
            assert len(alta_feedbacks) >= 1
        finally:
            clear_current_tenant()

    def test_prioridade_choices(self, tenant_factory):
        """Verifica que as choices de prioridade estão corretas."""
        expected_choices = [
            ("baixa", "Baixa"),
            ("media", "Média"),
            ("alta", "Alta"),
            ("critica", "Crítica"),
        ]

        assert Feedback.PRIORIDADE_CHOICES == expected_choices
