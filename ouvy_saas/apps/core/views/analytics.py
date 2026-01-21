from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client
from config.feature_flags import feature_flags


class AnalyticsView(APIView):
    """
    View para métricas básicas de analytics
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retorna métricas básicas do sistema
        """
        # Verificar se analytics está habilitado
        if not feature_flags.is_enabled('ANALYTICS'):
            return Response({
                'error': 'Analytics desabilitado para este ambiente'
            }, status=403)

        # Calcular período (últimos 30 dias)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)

        # Métricas gerais
        total_feedbacks = Feedback.objects.count()
        feedbacks_periodo = Feedback.objects.filter(
            data_criacao__gte=start_date,
            data_criacao__lte=end_date
        ).count()

        # Métricas por status
        status_counts = Feedback.objects.aggregate(
            pendente=Count('id', filter=Q(status='pendente')),
            em_analise=Count('id', filter=Q(status='em_analise')),
            resolvido=Count('id', filter=Q(status='resolvido')),
            fechado=Count('id', filter=Q(status='fechado')),
        )

        # Métricas por tipo
        tipo_counts = Feedback.objects.aggregate(
            reclamacao=Count('id', filter=Q(tipo='reclamacao')),
            sugestao=Count('id', filter=Q(tipo='sugestao')),
            denuncia=Count('id', filter=Q(tipo='denuncia')),
            elogio=Count('id', filter=Q(tipo='elogio')),
        )

        # Métricas por tenant
        tenant_counts = Feedback.objects.values('client__nome').annotate(
            total=Count('id')
        ).order_by('-total')[:10]  # Top 10 tenants

        # Taxa de resolução (resolvidos + fechados / total)
        resolvidos_fechados = status_counts['resolvido'] + status_counts['fechado']
        taxa_resolucao = (resolvidos_fechados / total_feedbacks * 100) if total_feedbacks > 0 else 0

        # Tempo médio de resposta (simplificado - apenas para feedbacks resolvidos)
        feedbacks_resolvidos = Feedback.objects.filter(
            status__in=['resolvido', 'fechado'],
            data_criacao__gte=start_date
        ).exclude(data_atualizacao__isnull=True)

        tempo_medio_resposta = 0
        if feedbacks_resolvidos.exists():
            total_tempo = sum(
                (f.data_atualizacao - f.data_criacao).total_seconds() / 3600  # em horas
                for f in feedbacks_resolvidos
            )
            tempo_medio_resposta = total_tempo / feedbacks_resolvidos.count()

        return Response({
            'periodo': {
                'inicio': start_date.isoformat(),
                'fim': end_date.isoformat(),
            },
            'metricas_gerais': {
                'total_feedbacks': total_feedbacks,
                'feedbacks_ultimos_30_dias': feedbacks_periodo,
                'taxa_resolucao_percentual': round(taxa_resolucao, 2),
                'tempo_medio_resposta_horas': round(tempo_medio_resposta, 2),
            },
            'metricas_por_status': status_counts,
            'metricas_por_tipo': tipo_counts,
            'top_tenants': list(tenant_counts),
            'features_habilitadas': feature_flags.get_enabled_features(),
        })