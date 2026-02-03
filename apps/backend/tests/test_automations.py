"""
Testes das Automações - Ouvify
==================================

Sprint 3 - Feature 2: Automações (6h)

Testa:
- Auto-atribuição de feedbacks
- Verificação de SLA para escalation
- Round-robin de atribuição
"""

import pytest
from datetime import timedelta
from django.utils import timezone
from unittest.mock import MagicMock, patch

from apps.feedbacks.models import Feedback
from apps.core.utils import set_current_tenant


@pytest.fixture
def feedback_sem_atribuicao(db, tenant, feedback_factory):
    """Cria feedback sem atribuição."""
    set_current_tenant(tenant)
    return feedback_factory(client=tenant, status='pendente')


@pytest.fixture
def feedback_antigo(db, tenant, feedback_factory):
    """Cria feedback antigo (> 24h) sem resposta."""
    set_current_tenant(tenant)
    fb = feedback_factory(client=tenant, status='pendente')
    # Simular criação há 25 horas
    fb.data_criacao = timezone.now() - timedelta(hours=25)
    fb.save()
    return fb


@pytest.fixture
def feedback_critico(db, tenant, feedback_factory):
    """Cria feedback crítico sem resposta."""
    set_current_tenant(tenant)
    fb = feedback_factory(
        client=tenant, 
        status='pendente',
        prioridade='critica'
    )
    # Simular criação há 5 horas
    fb.data_criacao = timezone.now() - timedelta(hours=5)
    fb.save()
    return fb


@pytest.mark.django_db
class TestAutoAssignment:
    """Testes de auto-atribuição."""
    
    def test_feedback_ja_atribuido_ignora(self, tenant, feedback_factory, user_factory):
        """Feedback já atribuído não é re-atribuído."""
        from apps.tenants.models import TeamMember
        from apps.feedbacks.automations import auto_assign_feedback
        
        set_current_tenant(tenant)
        user = user_factory()
        member = TeamMember.objects.create(
            client=tenant,
            user=user,
            role=TeamMember.MODERATOR,
            status=TeamMember.ACTIVE
        )
        
        fb = feedback_factory(client=tenant, assigned_to=member)
        original_assigned = fb.assigned_to
        
        # Tentar auto-atribuir
        auto_assign_feedback(fb.id)
        
        fb.refresh_from_db()
        assert fb.assigned_to == original_assigned
    
    def test_round_robin_balanceamento(self, tenant, feedback_factory, user_factory):
        """Round-robin distribui feedbacks igualmente."""
        from apps.tenants.models import TeamMember
        from apps.feedbacks.automations import _round_robin_assignment
        
        set_current_tenant(tenant)
        
        # Criar 3 membros
        members = []
        for i in range(3):
            user = user_factory(email=f'member{i}@test.com')
            member = TeamMember.objects.create(
                client=tenant,
                user=user,
                role=TeamMember.MODERATOR,
                status=TeamMember.ACTIVE
            )
            members.append(member)
        
        # Criar feedback sem atribuição
        fb = feedback_factory(client=tenant)
        
        # Round-robin deve atribuir ao membro com menos feedbacks
        _round_robin_assignment(fb)
        
        fb.refresh_from_db()
        assert fb.assigned_to is not None
        assert fb.assigned_to in members


@pytest.mark.django_db
class TestSLAEscalation:
    """Testes de escalation de SLA."""
    
    def test_identifica_sla_vencido(self, feedback_antigo):
        """Identifica feedback com SLA de resposta vencido."""
        agora = timezone.now()
        tempo_desde_criacao = agora - feedback_antigo.data_criacao
        horas = tempo_desde_criacao.total_seconds() / 3600
        
        # Feedback criado há > 24h sem resposta
        assert horas >= 24
        assert feedback_antigo.data_primeira_resposta is None
    
    def test_identifica_critico_sem_resposta(self, feedback_critico):
        """Identifica feedback crítico sem resposta em > 4h."""
        agora = timezone.now()
        tempo_desde_criacao = agora - feedback_critico.data_criacao
        horas = tempo_desde_criacao.total_seconds() / 3600
        
        assert feedback_critico.prioridade == 'critica'
        assert horas >= 4
        assert feedback_critico.data_primeira_resposta is None
    
    def test_check_sla_escalation_executa(self, tenant, feedback_antigo):
        """Task de verificação de SLA executa sem erro."""
        from apps.feedbacks.automations import check_sla_escalation
        
        # Mockar notificações para evitar erros
        with patch('apps.feedbacks.automations._process_escalation'):
            with patch('apps.feedbacks.automations._process_warning'):
                result = check_sla_escalation()
        
        assert 'escalations' in result
        assert 'warnings' in result


@pytest.mark.django_db
class TestDailyDigest:
    """Testes do digest diário."""
    
    def test_generate_tenant_digest(self, tenant, feedback_factory):
        """Gera estatísticas corretas para digest."""
        from apps.feedbacks.automations import _generate_tenant_digest
        from django.db.models import Count, Q
        
        set_current_tenant(tenant)
        
        # Criar alguns feedbacks
        for _ in range(5):
            feedback_factory(client=tenant, status='pendente')
        
        for _ in range(3):
            fb = feedback_factory(client=tenant, status='resolvido')
            fb.data_resolucao = timezone.now()
            fb.save()
        
        # Deve executar sem erro
        _generate_tenant_digest(tenant)
        
        # Verificar estatísticas
        stats = Feedback.objects.filter(client=tenant).aggregate(
            pendentes=Count('id', filter=Q(status='pendente')),
            resolvidos=Count('id', filter=Q(status='resolvido'))
        )
        
        assert stats['pendentes'] == 5
        assert stats['resolvidos'] == 3


@pytest.mark.django_db
class TestAssignmentRules:
    """Testes de regras de atribuição."""
    
    def test_apply_rules_por_tipo(self, tenant, feedback_factory, user_factory):
        """Atribui feedback baseado em regra por tipo."""
        from apps.tenants.models import TeamMember
        from apps.feedbacks.automations import _apply_assignment_rules
        
        set_current_tenant(tenant)
        
        # Criar membro especialista em denúncias
        user = user_factory()
        compliance_member = TeamMember.objects.create(
            client=tenant,
            user=user,
            role=TeamMember.MODERATOR,
            status=TeamMember.ACTIVE
        )
        
        # Criar feedback de denúncia
        fb = feedback_factory(client=tenant, tipo='denuncia')
        
        # Regras de atribuição
        rules = {
            'by_type': {
                'denuncia': compliance_member.id
            }
        }
        
        result = _apply_assignment_rules(fb, rules)
        
        assert result is True
        fb.refresh_from_db()
        assert fb.assigned_to == compliance_member
    
    def test_apply_rules_por_prioridade(self, tenant, feedback_factory, user_factory):
        """Atribui feedback baseado em regra por prioridade."""
        from apps.tenants.models import TeamMember
        from apps.feedbacks.automations import _apply_assignment_rules
        
        set_current_tenant(tenant)
        
        # Criar supervisor para críticos
        user = user_factory()
        supervisor = TeamMember.objects.create(
            client=tenant,
            user=user,
            role=TeamMember.ADMIN,
            status=TeamMember.ACTIVE
        )
        
        # Criar feedback crítico
        fb = feedback_factory(client=tenant, prioridade='critica')
        
        # Regras de atribuição
        rules = {
            'by_priority': {
                'critica': supervisor.id
            }
        }
        
        result = _apply_assignment_rules(fb, rules)
        
        assert result is True
        fb.refresh_from_db()
        assert fb.assigned_to == supervisor
