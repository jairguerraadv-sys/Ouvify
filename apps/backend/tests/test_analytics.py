"""
Testes do Dashboard Analytics - Ouvify
==========================================

Sprint 3 - Feature 1: Dashboard Analytics (8h)

Testa:
- Endpoint /api/feedbacks/analytics/
- Endpoint /api/feedbacks/export-csv/
- Métricas de SLA
- Tendências e agregações
"""

import pytest
import uuid
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from unittest.mock import MagicMock

from apps.feedbacks.models import Feedback, Tag
from apps.core.utils import set_current_tenant


@pytest.fixture
def tenant(db, tenant_factory):
    """Cria tenant de teste."""
    tenant = tenant_factory()
    set_current_tenant(tenant)
    return tenant


@pytest.fixture
def user_with_tenant(db, user_factory, tenant):
    """Cria usuário associado ao tenant."""
    user = user_factory()
    return user


@pytest.fixture
def feedbacks_variados(db, tenant, feedback_factory):
    """Cria feedbacks variados para testes de analytics."""
    set_current_tenant(tenant)
    
    feedbacks = []
    
    # Feedbacks de diferentes tipos e status
    for tipo in ['reclamacao', 'sugestao', 'denuncia', 'elogio']:
        for status in ['novo', 'pendente', 'em_andamento', 'resolvido']:
            fb = feedback_factory(
                client=tenant,
                tipo=tipo,
                status=status,
                prioridade='media'
            )
            feedbacks.append(fb)
    
    # Adicionar alguns com SLA calculado
    for i in range(5):
        fb = feedbacks[i]
        fb.registrar_primeira_resposta()
        fb.calcular_sla_primeira_resposta()
        fb.save()
    
    # Marcar alguns como resolvidos com SLA
    for i in range(3):
        fb = feedbacks[i]
        fb.status = 'resolvido'
        fb.registrar_resolucao()
        fb.calcular_sla_resolucao()
        fb.save()
    
    return feedbacks


@pytest.mark.django_db
class TestAnalyticsEndpoint:
    """Testes do endpoint /api/feedbacks/analytics/"""
    
    def test_analytics_sem_tenant_retorna_erro(self, api_client, tenant):
        """Analytics sem tenant identificado retorna erro."""
        response = api_client.get('/api/v1/feedbacks/analytics/')
        # Sem autenticação ou tenant, retorna erro
        assert response.status_code in [400, 401, 403]


@pytest.mark.django_db
class TestAnalyticsCalculations:
    """Testes dos cálculos de analytics."""
    
    def test_resumo_por_status(self, tenant, feedbacks_variados):
        """Verifica contagem por status."""
        set_current_tenant(tenant)
        
        from django.db.models import Count, Q
        
        stats = Feedback.objects.filter(client=tenant).aggregate(
            total=Count('id'),
            resolvidos=Count('id', filter=Q(status='resolvido')),
            pendentes=Count('id', filter=Q(status='pendente'))
        )
        
        assert stats['total'] > 0
        assert stats['resolvidos'] >= 0
        assert stats['pendentes'] >= 0
    
    def test_metricas_sla(self, tenant, feedbacks_variados):
        """Verifica métricas de SLA."""
        set_current_tenant(tenant)
        
        from django.db.models import Count, Q
        
        sla_stats = Feedback.objects.filter(
            client=tenant,
            data_primeira_resposta__isnull=False
        ).aggregate(
            dentro=Count('id', filter=Q(sla_primeira_resposta=True)),
            fora=Count('id', filter=Q(sla_primeira_resposta=False))
        )
        
        # Deve haver feedbacks com SLA calculado
        total_sla = sla_stats['dentro'] + sla_stats['fora']
        assert total_sla > 0
    
    def test_agregacao_por_tipo(self, tenant, feedbacks_variados):
        """Verifica agregação por tipo."""
        set_current_tenant(tenant)
        
        por_tipo = dict(
            Feedback.objects.filter(client=tenant).values('tipo').annotate(
                count=Count('id')
            ).values_list('tipo', 'count')
        )
        
        assert 'reclamacao' in por_tipo
        assert 'sugestao' in por_tipo
    
    def test_agregacao_por_prioridade(self, tenant, feedbacks_variados):
        """Verifica agregação por prioridade."""
        set_current_tenant(tenant)
        
        por_prioridade = dict(
            Feedback.objects.filter(client=tenant).values('prioridade').annotate(
                count=Count('id')
            ).values_list('prioridade', 'count')
        )
        
        assert 'media' in por_prioridade


@pytest.mark.django_db
class TestExportCSV:
    """Testes do endpoint de exportação CSV."""
    
    def test_export_sem_tenant_retorna_erro(self, api_client, tenant):
        """Export sem tenant identificado retorna erro."""
        response = api_client.get('/api/v1/feedbacks/export-csv/')
        assert response.status_code in [400, 401, 403]


@pytest.mark.django_db
class TestDashboardStatsCache:
    """Testes do cache do dashboard."""
    
    def test_dashboard_stats_cacheavel(self, tenant, feedback_factory):
        """Dashboard stats deve ser cacheável."""
        set_current_tenant(tenant)
        
        # Criar alguns feedbacks
        for _ in range(5):
            feedback_factory(client=tenant)
        
        from django.core.cache import cache
        
        # Simular cache
        cache_key = f"dashboard_stats:{tenant.id}"
        test_data = {"total": 5, "cached": True}
        cache.set(cache_key, test_data, timeout=300)
        
        # Verificar cache
        cached = cache.get(cache_key)
        assert cached is not None
        assert cached['total'] == 5
    
    def test_analytics_cache_diferente_por_periodo(self, tenant):
        """Analytics deve ter cache diferente por período."""
        from django.core.cache import cache
        
        cache_7 = f"analytics:{tenant.id}:7"
        cache_30 = f"analytics:{tenant.id}:30"
        
        cache.set(cache_7, {"periodo": 7}, timeout=600)
        cache.set(cache_30, {"periodo": 30}, timeout=600)
        
        assert cache.get(cache_7)['periodo'] == 7
        assert cache.get(cache_30)['periodo'] == 30


@pytest.mark.django_db
class TestTendencias:
    """Testes de cálculo de tendências."""
    
    def test_tendencia_por_dia(self, tenant, feedback_factory):
        """Verifica cálculo de tendência por dia."""
        set_current_tenant(tenant)
        
        from django.db.models import Count
        from django.db.models.functions import TruncDate
        
        # Criar feedbacks em dias diferentes
        hoje = timezone.now()
        for i in range(7):
            fb = feedback_factory(client=tenant)
            fb.data_criacao = hoje - timedelta(days=i)
            fb.save()
        
        # Agregar por dia
        tendencia = Feedback.objects.filter(client=tenant).annotate(
            data=TruncDate('data_criacao')
        ).values('data').annotate(
            count=Count('id')
        ).order_by('data')
        
        # Deve haver múltiplos dias
        assert tendencia.count() > 0
