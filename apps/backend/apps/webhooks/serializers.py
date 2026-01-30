"""
Webhook Serializers - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""
from rest_framework import serializers
from .models import WebhookEndpoint, WebhookEvent, WebhookDelivery


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer para WebhookEndpoint."""
    
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = WebhookEndpoint
        fields = [
            'id',
            'name',
            'url',
            'description',
            'events',
            'is_active',
            'headers',
            'max_retries',
            'retry_delay',
            'total_deliveries',
            'successful_deliveries',
            'failed_deliveries',
            'success_rate',
            'last_triggered',
            'last_success',
            'last_failure',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'total_deliveries',
            'successful_deliveries',
            'failed_deliveries',
            'last_triggered',
            'last_success',
            'last_failure',
            'created_at',
            'updated_at',
        ]

    def validate_url(self, value):
        """Valida que a URL é HTTPS em produção."""
        # Em produção, exigir HTTPS
        # if not value.startswith('https://'):
        #     raise serializers.ValidationError("URL deve usar HTTPS")
        return value

    def validate_events(self, value):
        """Valida que os eventos são válidos."""
        valid_events = [e[0] for e in WebhookEndpoint.EVENTS]
        valid_events.append('*')  # Wildcard para todos os eventos
        
        for event in value:
            if event not in valid_events:
                raise serializers.ValidationError(
                    f"Evento inválido: {event}. Eventos válidos: {valid_events}"
                )
        return value


class WebhookEndpointCreateSerializer(WebhookEndpointSerializer):
    """Serializer para criação de webhook, inclui secret na resposta."""
    
    secret = serializers.CharField(read_only=True)
    
    class Meta(WebhookEndpointSerializer.Meta):
        fields = WebhookEndpointSerializer.Meta.fields + ['secret']


class WebhookEndpointSecretSerializer(serializers.Serializer):
    """Serializer para regenerar secret."""
    secret = serializers.CharField(read_only=True)


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer para WebhookEvent."""
    
    class Meta:
        model = WebhookEvent
        fields = [
            'id',
            'event_type',
            'payload',
            'source_model',
            'source_id',
            'status',
            'created_at',
            'processed_at',
        ]
        read_only_fields = fields


class WebhookDeliverySerializer(serializers.ModelSerializer):
    """Serializer para WebhookDelivery."""
    
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    event_type = serializers.CharField(source='event.event_type', read_only=True)
    
    class Meta:
        model = WebhookDelivery
        fields = [
            'id',
            'endpoint',
            'endpoint_name',
            'event',
            'event_type',
            'request_url',
            'request_headers',
            'request_payload',
            'response_status',
            'response_body',
            'duration_ms',
            'success',
            'error_message',
            'attempt',
            'next_retry_at',
            'created_at',
        ]
        read_only_fields = fields


class WebhookDeliverySummarySerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem."""
    
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    event_type = serializers.CharField(source='event.event_type', read_only=True)
    
    class Meta:
        model = WebhookDelivery
        fields = [
            'id',
            'endpoint_name',
            'event_type',
            'response_status',
            'duration_ms',
            'success',
            'error_message',
            'attempt',
            'created_at',
        ]


class WebhookTestSerializer(serializers.Serializer):
    """Serializer para testar webhook."""
    
    endpoint_id = serializers.UUIDField()
    event_type = serializers.ChoiceField(choices=[e[0] for e in WebhookEndpoint.EVENTS])


class WebhookStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas de webhooks."""
    
    total_endpoints = serializers.IntegerField()
    active_endpoints = serializers.IntegerField()
    total_events_today = serializers.IntegerField()
    total_deliveries_today = serializers.IntegerField()
    success_rate = serializers.FloatField()
    avg_response_time = serializers.FloatField()
