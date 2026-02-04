"""
Webhook Tests - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""

import uuid
from unittest.mock import Mock, patch

from apps.tenants.models import Client
from apps.webhooks.models import WebhookDelivery, WebhookEndpoint, WebhookEvent
from apps.webhooks.services import create_webhook_event, deliver_webhook
from django.test import TestCase


class WebhookEndpointModelTest(TestCase):
    """Testes do model WebhookEndpoint."""

    def setUp(self):
        """Configura dados de teste."""
        self.client_obj = Client.objects.create(
            nome="Empresa Teste", subdominio=f"empresa-teste-{uuid.uuid4().hex[:8]}"
        )

    def test_create_webhook_endpoint(self):
        """Teste criação de endpoint."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Meu Webhook",
            url="https://example.com/webhook",
            events=["feedback.created", "feedback.resolved"],
        )

        self.assertIsNotNone(endpoint.id)
        self.assertEqual(endpoint.name, "Meu Webhook")
        self.assertTrue(endpoint.is_active)
        self.assertIsNotNone(endpoint.secret)
        self.assertEqual(len(endpoint.secret), 64)

    def test_generate_secret(self):
        """Teste geração de secret."""
        secret1 = WebhookEndpoint.generate_secret()
        secret2 = WebhookEndpoint.generate_secret()

        self.assertEqual(len(secret1), 64)
        self.assertNotEqual(secret1, secret2)

    def test_sign_payload(self):
        """Teste assinatura de payload."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["*"],
        )

        payload = {"test": "data", "nested": {"key": "value"}}
        signature = endpoint.sign_payload(payload)

        self.assertTrue(signature.startswith("sha256="))
        self.assertEqual(len(signature), 71)  # sha256= + 64 chars

    def test_is_subscribed_to(self):
        """Teste verificação de inscrição em evento."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["feedback.created", "feedback.resolved"],
        )

        self.assertTrue(endpoint.is_subscribed_to("feedback.created"))
        self.assertTrue(endpoint.is_subscribed_to("feedback.resolved"))
        self.assertFalse(endpoint.is_subscribed_to("feedback.updated"))

    def test_wildcard_subscription(self):
        """Teste inscrição wildcard."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["*"],
        )

        self.assertTrue(endpoint.is_subscribed_to("feedback.created"))
        self.assertTrue(endpoint.is_subscribed_to("anything.else"))

    def test_update_stats(self):
        """Teste atualização de estatísticas."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["*"],
        )

        endpoint.update_stats(True)
        self.assertEqual(endpoint.total_deliveries, 1)
        self.assertEqual(endpoint.successful_deliveries, 1)
        self.assertEqual(endpoint.failed_deliveries, 0)
        self.assertIsNotNone(endpoint.last_success)

        endpoint.update_stats(False)
        self.assertEqual(endpoint.total_deliveries, 2)
        self.assertEqual(endpoint.successful_deliveries, 1)
        self.assertEqual(endpoint.failed_deliveries, 1)
        self.assertIsNotNone(endpoint.last_failure)

    def test_success_rate(self):
        """Teste cálculo de taxa de sucesso."""
        endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["*"],
        )

        self.assertEqual(endpoint.success_rate, 0.0)

        endpoint.total_deliveries = 10
        endpoint.successful_deliveries = 8
        endpoint.save()

        self.assertEqual(endpoint.success_rate, 80.0)


class WebhookEventModelTest(TestCase):
    """Testes do model WebhookEvent."""

    def test_create_event(self):
        """Teste criação de evento."""
        event = WebhookEvent.objects.create(
            event_type="feedback.created",
            payload={"feedback_id": 123},
            source_model="Feedback",
            source_id="123",
        )

        self.assertIsNotNone(event.id)
        self.assertEqual(event.status, "pending")
        self.assertIsNone(event.processed_at)


class WebhookDeliveryModelTest(TestCase):
    """Testes do model WebhookDelivery."""

    def setUp(self):
        """Configura dados de teste."""
        self.client_obj = Client.objects.create(
            nome="Empresa Teste", subdominio=f"empresa-teste-{uuid.uuid4().hex[:8]}"
        )
        self.endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://example.com/webhook",
            events=["*"],
        )
        self.event = WebhookEvent.objects.create(
            event_type="test",
            payload={"test": "data"},
        )

    def test_create_delivery(self):
        """Teste criação de delivery."""
        delivery = WebhookDelivery.objects.create(
            endpoint=self.endpoint,
            event=self.event,
            request_url="https://example.com/webhook",
            request_headers={"Content-Type": "application/json"},
            request_payload={"test": "data"},
        )

        self.assertIsNotNone(delivery.id)
        self.assertEqual(delivery.attempt, 1)
        self.assertFalse(delivery.success)


class WebhookServiceTest(TestCase):
    """Testes do serviço de webhook."""

    def setUp(self):
        """Configura dados de teste."""
        self.client_obj = Client.objects.create(
            nome="Empresa Teste", subdominio=f"empresa-teste-{uuid.uuid4().hex[:8]}"
        )
        self.endpoint = WebhookEndpoint.objects.create(
            client=self.client_obj,
            name="Test",
            url="https://httpbin.org/post",
            events=["feedback.created", "test"],
        )

    @patch("apps.webhooks.services.process_webhook_event.delay")
    def test_create_webhook_event(self, mock_task):
        """Teste criação de evento via serviço."""
        event = create_webhook_event(
            event_type="feedback.created",
            payload={"feedback_id": 123, "tenant_id": self.client_obj.id},
            source_model="Feedback",
            source_id="123",
        )

        self.assertIsNotNone(event.id)
        self.assertEqual(event.event_type, "feedback.created")
        mock_task.assert_called_once_with(str(event.id))

    @patch("requests.post")
    def test_deliver_webhook_success(self, mock_post):
        """Teste entrega bem-sucedida de webhook."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = '{"status": "ok"}'
        mock_response.headers = {"Content-Type": "application/json"}
        mock_post.return_value = mock_response

        event = WebhookEvent.objects.create(
            event_type="test",
            payload={"test": "data"},
        )

        success = deliver_webhook(self.endpoint, event)

        self.assertTrue(success)
        mock_post.assert_called_once()

        # Verificar que delivery foi criado
        delivery = WebhookDelivery.objects.filter(event=event).first()
        self.assertIsNotNone(delivery)
        self.assertTrue(delivery.success)
        self.assertEqual(delivery.response_status, 200)

    @patch("apps.webhooks.services.retry_webhook_delivery.apply_async")
    @patch("requests.post")
    def test_deliver_webhook_failure(self, mock_post, mock_retry):
        """Teste falha de entrega de webhook."""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_response.headers = {}
        mock_post.return_value = mock_response

        event = WebhookEvent.objects.create(
            event_type="test",
            payload={"test": "data"},
        )

        success = deliver_webhook(self.endpoint, event)

        self.assertFalse(success)

        delivery = WebhookDelivery.objects.filter(event=event).first()
        self.assertIsNotNone(delivery)
        self.assertFalse(delivery.success)
        self.assertEqual(delivery.response_status, 500)

    @patch("apps.webhooks.services.retry_webhook_delivery.apply_async")
    @patch("requests.post")
    def test_deliver_webhook_timeout(self, mock_post, mock_retry):
        """Teste timeout de webhook."""
        import requests

        mock_post.side_effect = requests.Timeout()

        event = WebhookEvent.objects.create(
            event_type="test",
            payload={"test": "data"},
        )

        success = deliver_webhook(self.endpoint, event)

        self.assertFalse(success)

        delivery = WebhookDelivery.objects.filter(event=event).first()
        self.assertIsNotNone(delivery)
        self.assertFalse(delivery.success)
        self.assertEqual(delivery.error_message, "Request timeout")


# Nota: Testes de API para webhooks são executados via testes de integração
# devido à complexidade do setup de tenant/middleware
# Os testes de unidade acima validam a funcionalidade core dos webhooks
