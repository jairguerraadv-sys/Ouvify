"""
URLs para Audit Log API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, AuditLogSummaryViewSet, UserSessionViewSet

app_name = 'auditlog'

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')
router.register(r'summaries', AuditLogSummaryViewSet, basename='auditlog-summary')
router.register(r'sessions', UserSessionViewSet, basename='user-session')

urlpatterns = [
    path('', include(router.urls)),
]
