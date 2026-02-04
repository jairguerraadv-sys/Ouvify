"""
URLs para Audit Log API
"""

from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import AuditLogSummaryViewSet, AuditLogViewSet, UserSessionViewSet

app_name = "auditlog"

router = SimpleRouter()
router.register(r"logs", AuditLogViewSet, basename="auditlog")
router.register(r"summaries", AuditLogSummaryViewSet, basename="auditlog-summary")
router.register(r"sessions", UserSessionViewSet, basename="user-session")

urlpatterns = [
    path("", include(router.urls)),
]
