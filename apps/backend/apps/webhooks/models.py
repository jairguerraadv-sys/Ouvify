"""
Webhook Models - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)

Models:
- WebhookEndpoint: Configuração de endpoint de webhook
- WebhookEvent: Evento enviado
- WebhookDelivery: Log de entrega
"""

import hashlib
import hmac
import json
import uuid

from django.db import models
from django.utils import timezone

from apps.core.models import TenantAwareModel


class WebhookEndpoint(TenantAwareModel):
    """Configuração de endpoint de webhook para um cliente."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic info
    name = models.CharField("Nome", max_length=100)
    url = models.URLField("URL do Webhook")
    description = models.TextField("Descrição", blank=True)

    # Authentication
    secret = models.CharField("Secret Key", max_length=64, editable=False)

    # Events to subscribe
    EVENTS = [
        ("feedback.created", "Feedback Criado"),
        ("feedback.updated", "Feedback Atualizado"),
        ("feedback.status_changed", "Status Alterado"),
        ("feedback.assigned", "Feedback Atribuído"),
        ("feedback.resolved", "Feedback Resolvido"),
        ("response.created", "Resposta Criada"),
        ("sla.warning", "Aviso de SLA"),
        ("sla.breach", "Violação de SLA"),
    ]
    events = models.JSONField("Eventos", default=list)

    # Status
    is_active = models.BooleanField("Ativo", default=True)

    # Headers extras
    headers = models.JSONField("Headers Customizados", default=dict, blank=True)

    # Retry config
    max_retries = models.PositiveSmallIntegerField("Máximo de Retentativas", default=3)
    retry_delay = models.PositiveIntegerField(
        "Delay entre Retentativas (seg)", default=60
    )

    # Stats
    total_deliveries = models.PositiveIntegerField(default=0)
    successful_deliveries = models.PositiveIntegerField(default=0)
    failed_deliveries = models.PositiveIntegerField(default=0)
    last_triggered = models.DateTimeField(null=True, blank=True)
    last_success = models.DateTimeField(null=True, blank=True)
    last_failure = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Webhook Endpoint"
        verbose_name_plural = "Webhook Endpoints"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.url})"

    def save(self, *args, **kwargs):
        if not self.secret:
            self.secret = self.generate_secret()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_secret():
        """Gera uma secret key segura."""
        return hashlib.sha256(uuid.uuid4().bytes).hexdigest()

    def sign_payload(self, payload: dict) -> str:
        """Assina o payload com HMAC-SHA256."""
        payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        signature = hmac.new(
            self.secret.encode("utf-8"), payload_bytes, hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"

    def is_subscribed_to(self, event_type: str) -> bool:
        """Verifica se está inscrito em um tipo de evento."""
        return event_type in self.events or "*" in self.events

    def update_stats(self, success: bool):
        """Atualiza estatísticas de entrega."""
        self.total_deliveries += 1
        self.last_triggered = timezone.now()

        if success:
            self.successful_deliveries += 1
            self.last_success = timezone.now()
        else:
            self.failed_deliveries += 1
            self.last_failure = timezone.now()

        self.save(
            update_fields=[
                "total_deliveries",
                "successful_deliveries",
                "failed_deliveries",
                "last_triggered",
                "last_success",
                "last_failure",
            ]
        )

    @property
    def success_rate(self) -> float:
        """Taxa de sucesso das entregas."""
        if self.total_deliveries == 0:
            return 0.0
        return (self.successful_deliveries / self.total_deliveries) * 100


class WebhookEvent(models.Model):
    """Evento de webhook a ser enviado."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    event_type = models.CharField("Tipo de Evento", max_length=50)
    payload = models.JSONField("Payload")

    # Source
    source_model = models.CharField("Model de Origem", max_length=50, blank=True)
    source_id = models.CharField("ID de Origem", max_length=50, blank=True)

    # Status
    STATUS_CHOICES = [
        ("pending", "Pendente"),
        ("processing", "Processando"),
        ("delivered", "Entregue"),
        ("failed", "Falhou"),
        ("partial", "Parcial"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Webhook Event"
        verbose_name_plural = "Webhook Events"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type} - {self.id}"


class WebhookDelivery(models.Model):
    """Log de entrega de webhook."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    endpoint = models.ForeignKey(
        WebhookEndpoint, on_delete=models.CASCADE, related_name="deliveries"
    )
    event = models.ForeignKey(
        WebhookEvent, on_delete=models.CASCADE, related_name="deliveries"
    )

    # Request
    request_url = models.URLField("URL")
    request_headers = models.JSONField("Headers", default=dict)
    request_payload = models.JSONField("Payload Enviado")

    # Response
    response_status = models.IntegerField("Status Code", null=True)
    response_headers = models.JSONField("Response Headers", default=dict)
    response_body = models.TextField("Response Body", blank=True)

    # Timing
    duration_ms = models.PositiveIntegerField("Duração (ms)", null=True)

    # Status
    success = models.BooleanField("Sucesso", default=False)
    error_message = models.TextField("Mensagem de Erro", blank=True)

    # Retry
    attempt = models.PositiveSmallIntegerField("Tentativa", default=1)
    next_retry_at = models.DateTimeField("Próxima Tentativa", null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Webhook Delivery"
        verbose_name_plural = "Webhook Deliveries"
        ordering = ["-created_at"]

    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.endpoint.name} - {self.event.event_type}"
