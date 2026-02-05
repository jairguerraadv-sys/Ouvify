"""
Testes do Sistema de SLA Tracking - Ouvify
=============================================

Sprint 2 - Feature 5: SLA Tracking (12h)

Testa:
- Campos de SLA no modelo Feedback
- Cálculo de tempo de primeira resposta
- Cálculo de tempo de resolução
- Verificação de SLA dentro/fora do prazo
- Signals automáticos de SLA
"""

from datetime import timedelta
from unittest.mock import MagicMock

import pytest
from django.utils import timezone

from apps.core.utils import clear_current_tenant, set_current_tenant
from apps.feedbacks.models import Feedback, FeedbackInteracao


@pytest.fixture
def tenant(db, tenant_factory):
    """Cria tenant de teste."""
    tenant = tenant_factory()
    # Define tenant atual para queries
    set_current_tenant(tenant)
    return tenant


@pytest.fixture
def feedback(db, tenant, feedback_factory):
    """Cria feedback de teste."""
    set_current_tenant(tenant)
    return feedback_factory(
        client=tenant,
        tipo="sugestao",
        titulo="Feedback SLA Test",
        descricao="Descrição do feedback para teste de SLA",
        status="pendente",
    )


@pytest.mark.django_db
class TestSLAFieldsExist:
    """Testa se os campos de SLA existem no modelo."""

    def test_campos_sla_existem(self, feedback):
        """Verifica que todos os campos de SLA existem."""
        assert hasattr(feedback, "tempo_primeira_resposta")
        assert hasattr(feedback, "tempo_resolucao")
        assert hasattr(feedback, "data_primeira_resposta")
        assert hasattr(feedback, "data_resolucao")
        assert hasattr(feedback, "sla_primeira_resposta")
        assert hasattr(feedback, "sla_resolucao")

    def test_campos_sla_inicialmente_nulos(self, feedback):
        """Campos SLA devem ser nulos inicialmente."""
        assert feedback.tempo_primeira_resposta is None
        assert feedback.tempo_resolucao is None
        assert feedback.data_primeira_resposta is None
        assert feedback.data_resolucao is None
        assert feedback.sla_primeira_resposta is None
        assert feedback.sla_resolucao is None


@pytest.mark.django_db
class TestSLAPrimeiraResposta:
    """Testa cálculo de SLA de primeira resposta."""

    def test_registrar_primeira_resposta(self, feedback):
        """Testa registro de primeira resposta."""
        # Registra resposta
        feedback.registrar_primeira_resposta()

        # Verifica que data foi preenchida
        assert feedback.data_primeira_resposta is not None
        assert feedback.tempo_primeira_resposta is not None

    def test_sla_dentro_do_prazo(self, feedback):
        """Primeira resposta em < 24h deve estar dentro do SLA."""
        # Feedback criado agora, resposta imediata
        feedback.registrar_primeira_resposta()
        feedback.calcular_sla_primeira_resposta(sla_horas=24)

        # Deve estar dentro do SLA
        assert feedback.sla_primeira_resposta is True

    def test_sla_fora_do_prazo(self, feedback, tenant):
        """Primeira resposta em > 24h deve estar fora do SLA."""
        set_current_tenant(tenant)

        # Simula feedback criado há 25 horas
        feedback.data_criacao = timezone.now() - timedelta(hours=25)
        feedback.save()

        # Refetch para ter data_criacao atualizada
        feedback.refresh_from_db()

        # Registra resposta agora
        feedback.registrar_primeira_resposta()
        feedback.calcular_sla_primeira_resposta(sla_horas=24)

        # Deve estar fora do SLA
        assert feedback.sla_primeira_resposta is False

    def test_sla_customizado(self, feedback):
        """Testa SLA customizado (ex: 48 horas)."""
        feedback.registrar_primeira_resposta()
        feedback.calcular_sla_primeira_resposta(sla_horas=48)

        # Resposta imediata, deve estar dentro do SLA
        assert feedback.sla_primeira_resposta is True


@pytest.mark.django_db
class TestSLAResolucao:
    """Testa cálculo de SLA de resolução."""

    def test_registrar_resolucao(self, feedback):
        """Testa registro de resolução."""
        feedback.registrar_resolucao()

        # Verifica que data foi preenchida
        assert feedback.data_resolucao is not None
        assert feedback.tempo_resolucao is not None

    def test_sla_resolucao_dentro_prazo(self, feedback):
        """Resolução em < 72h deve estar dentro do SLA."""
        feedback.registrar_resolucao()
        feedback.calcular_sla_resolucao(sla_horas=72)

        # Deve estar dentro do SLA
        assert feedback.sla_resolucao is True

    def test_sla_resolucao_fora_prazo(self, feedback, tenant):
        """Resolução em > 72h deve estar fora do SLA."""
        set_current_tenant(tenant)

        # Simula feedback criado há 73 horas
        feedback.data_criacao = timezone.now() - timedelta(hours=73)
        feedback.save()
        feedback.refresh_from_db()

        # Registra resolução agora
        feedback.registrar_resolucao()
        feedback.calcular_sla_resolucao(sla_horas=72)

        # Deve estar fora do SLA
        assert feedback.sla_resolucao is False


@pytest.mark.django_db
class TestSLAIntegracao:
    """Testa integração completa do SLA."""

    def test_fluxo_completo_sla(self, feedback, tenant):
        """Testa fluxo completo: criação → resposta → resolução."""
        set_current_tenant(tenant)

        # 1. Feedback criado (já feito na fixture)
        assert feedback.status == "pendente"

        # 2. Primeira resposta
        feedback.registrar_primeira_resposta()
        feedback.calcular_sla_primeira_resposta(sla_horas=24)
        assert feedback.sla_primeira_resposta is True

        # 3. Mudança para em_andamento
        feedback.status = "em_andamento"
        feedback.save()

        # 4. Resolução
        feedback.status = "resolvido"
        feedback.registrar_resolucao()
        feedback.calcular_sla_resolucao(sla_horas=72)
        feedback.save()

        # Verifica estado final
        assert feedback.status == "resolvido"
        assert feedback.sla_primeira_resposta is True
        assert feedback.sla_resolucao is True
        assert feedback.tempo_primeira_resposta is not None
        assert feedback.tempo_resolucao is not None

    def test_sla_preservado_apos_salvar(self, feedback, tenant):
        """SLA deve ser preservado após salvar feedback."""
        set_current_tenant(tenant)

        feedback.registrar_primeira_resposta()
        feedback.calcular_sla_primeira_resposta()
        feedback.save()

        # Refetch
        feedback_db = Feedback.objects.get(pk=feedback.pk)

        # SLA deve estar preservado
        assert feedback_db.data_primeira_resposta is not None
        assert feedback_db.tempo_primeira_resposta is not None
        assert feedback_db.sla_primeira_resposta is not None


@pytest.mark.django_db
class TestSLASerializacao:
    """Testa serialização dos campos SLA."""

    def test_campos_sla_no_serializer(self):
        """Verifica que campos SLA estão no serializer."""
        from apps.feedbacks.serializers import FeedbackSerializer

        fields = FeedbackSerializer.Meta.fields

        assert "tempo_primeira_resposta" in fields
        assert "tempo_resolucao" in fields
        assert "data_primeira_resposta" in fields
        assert "data_resolucao" in fields
        assert "sla_primeira_resposta" in fields
        assert "sla_resolucao" in fields

    def test_campos_sla_somente_leitura(self):
        """Campos SLA devem ser somente leitura."""
        from apps.feedbacks.serializers import FeedbackSerializer

        read_only = FeedbackSerializer.Meta.read_only_fields

        assert "tempo_primeira_resposta" in read_only
        assert "tempo_resolucao" in read_only
        assert "data_primeira_resposta" in read_only
        assert "data_resolucao" in read_only
        assert "sla_primeira_resposta" in read_only
        assert "sla_resolucao" in read_only
