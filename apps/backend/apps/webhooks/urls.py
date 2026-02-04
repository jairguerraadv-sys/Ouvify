"""
Webhook URLs - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WebhookDeliveryViewSet, WebhookEndpointViewSet, WebhookEventViewSet

router = DefaultRouter()
router.register(r"endpoints", WebhookEndpointViewSet, basename="webhook-endpoint")
router.register(r"events", WebhookEventViewSet, basename="webhook-event")
router.register(r"deliveries", WebhookDeliveryViewSet, basename="webhook-delivery")

urlpatterns = [
    path("", include(router.urls)),
]
