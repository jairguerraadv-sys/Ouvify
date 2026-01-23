"""
URLs da API de Notificações
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PushSubscriptionViewSet,
    NotificationViewSet,
    NotificationPreferenceViewSet,
)

router = DefaultRouter()
router.register(r'subscriptions', PushSubscriptionViewSet, basename='push-subscription')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')

urlpatterns = [
    path('', include(router.urls)),
]
