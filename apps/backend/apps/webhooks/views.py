"""
Webhook Views - Ouvy SaaS
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""
from datetime import timedelta

from django.db.models import Avg
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.core.utils import get_current_tenant
from .models import WebhookEndpoint, WebhookEvent, WebhookDelivery
from .serializers import (
    WebhookEndpointSerializer,
    WebhookEndpointCreateSerializer,
    WebhookEndpointSecretSerializer,
    WebhookEventSerializer,
    WebhookDeliverySerializer,
    WebhookDeliverySummarySerializer,
    WebhookStatsSerializer,
)
from .services import create_webhook_event


class WebhookEndpointViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar webhooks endpoints."""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra por tenant."""
        tenant = get_current_tenant()
        if not tenant:
            return WebhookEndpoint.objects.none()
        return WebhookEndpoint.objects.filter(client=tenant)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WebhookEndpointCreateSerializer
        return WebhookEndpointSerializer

    def perform_create(self, serializer):
        """Define o client automaticamente."""
        tenant = get_current_tenant()
        if tenant:
            serializer.save(client=tenant)

    @action(detail=True, methods=['post'])
    def regenerate_secret(self, request, pk=None):
        """Regenera a secret key do webhook."""
        endpoint = self.get_object()
        endpoint.secret = WebhookEndpoint.generate_secret()
        endpoint.save(update_fields=['secret'])
        
        return Response(
            WebhookEndpointSecretSerializer({'secret': endpoint.secret}).data
        )

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Envia um evento de teste para o webhook."""
        endpoint = self.get_object()
        
        # Criar evento de teste
        event = create_webhook_event(
            event_type='test',
            payload={
                'tenant_id': endpoint.client_id,
                'message': 'Este é um evento de teste do Ouvy',
                'timestamp': timezone.now().isoformat(),
            },
            source_model='Test',
            source_id='test'
        )
        
        return Response({
            'message': 'Evento de teste enviado',
            'event_id': str(event.id),
        })

    @action(detail=True, methods=['get'])
    def deliveries(self, request, pk=None):
        """Lista entregas deste webhook."""
        endpoint = self.get_object()
        deliveries = endpoint.deliveries.all()[:50]
        serializer = WebhookDeliverySummarySerializer(deliveries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas gerais de webhooks."""
        today = timezone.now().date()
        start_of_day = timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.min.time())
        )
        
        endpoints = self.get_queryset()
        
        stats = {
            'total_endpoints': endpoints.count(),
            'active_endpoints': endpoints.filter(is_active=True).count(),
            'total_events_today': WebhookEvent.objects.filter(
                created_at__gte=start_of_day
            ).count(),
            'total_deliveries_today': WebhookDelivery.objects.filter(
                endpoint__in=endpoints,
                created_at__gte=start_of_day
            ).count(),
            'success_rate': self._calculate_success_rate(endpoints),
            'avg_response_time': self._calculate_avg_response_time(endpoints),
        }
        
        return Response(WebhookStatsSerializer(stats).data)

    def _calculate_success_rate(self, endpoints):
        """Calcula taxa de sucesso."""
        total = sum(e.total_deliveries for e in endpoints)
        successful = sum(e.successful_deliveries for e in endpoints)
        return (successful / total * 100) if total > 0 else 0.0

    def _calculate_avg_response_time(self, endpoints):
        """Calcula tempo médio de resposta."""
        result = WebhookDelivery.objects.filter(
            endpoint__in=endpoints,
            duration_ms__isnull=False,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).aggregate(avg=Avg('duration_ms'))
        return result['avg'] or 0.0

    @action(detail=False, methods=['get'])
    def available_events(self, request):
        """Lista eventos disponíveis para inscrição."""
        return Response([
            {'value': e[0], 'label': e[1]}
            for e in WebhookEndpoint.EVENTS
        ])


class WebhookEventViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar eventos de webhook."""
    
    serializer_class = WebhookEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra eventos do tenant."""
        tenant = get_current_tenant()
        if not tenant:
            return WebhookEvent.objects.none()
        return WebhookEvent.objects.filter(
            payload__tenant_id=tenant.id
        ).order_by('-created_at')[:100]


class WebhookDeliveryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar entregas de webhook."""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra deliveries do tenant."""
        tenant = get_current_tenant()
        if not tenant:
            return WebhookDelivery.objects.none()
        return WebhookDelivery.objects.filter(
            endpoint__client=tenant
        ).order_by('-created_at')[:100]

    def get_serializer_class(self):
        if self.action == 'list':
            return WebhookDeliverySummarySerializer
        return WebhookDeliverySerializer

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retenta uma entrega manualmente."""
        delivery = self.get_object()
        
        if delivery.success:
            return Response(
                {'error': 'Esta entrega já foi bem-sucedida'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Importar aqui para evitar circular import
        from .services import deliver_webhook
        
        success = deliver_webhook(
            delivery.endpoint,
            delivery.event,
            delivery.attempt + 1
        )
        
        return Response({
            'success': success,
            'message': 'Retentativa realizada' if success else 'Retentativa falhou'
        })
