"""
Billing URLs - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import InvoiceViewSet, PlanViewSet, StripeWebhookView, SubscriptionViewSet

router = DefaultRouter()
router.register(r"plans", PlanViewSet, basename="plan")
router.register(r"subscription", SubscriptionViewSet, basename="subscription")
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
