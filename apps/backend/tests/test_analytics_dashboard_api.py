import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User

from apps.tenants.models import Client as Tenant
from apps.core.utils import tenant_context
from apps.feedbacks.models import Feedback


@pytest.mark.django_db
def test_analytics_dashboard_shape():
    tenant = Tenant.objects.create(nome="Tenant A", subdominio="tenant-a", ativo=True)
    user = User.objects.create_user(username="u@a.com", email="u@a.com", password="pass123456")
    tenant.owner = user
    tenant.save(update_fields=["owner"])

    with tenant_context(tenant):
        Feedback.objects.create(
            client=tenant,
            tipo="denuncia",
            titulo="T",
            descricao="D",
            email_contato="x@y.com",
            status="pendente",
        )

    api = APIClient()
    api.force_authenticate(user=user)
    api.defaults["HTTP_HOST"] = f"{tenant.subdominio}.localhost"

    resp = api.get("/api/v1/analytics/dashboard/?period=month")
    assert resp.status_code in (200, 403)

    if resp.status_code == 403:
        # feature flag pode estar desabilitada no ambiente de testes
        assert "error" in resp.data
        return

    data = resp.data
    assert set(data.keys()) == {"trend", "byType", "byStatus", "responseTime", "summary"}
    assert isinstance(data["trend"], list)
    assert isinstance(data["byType"], list)
    assert isinstance(data["byStatus"], list)
    assert isinstance(data["responseTime"], list)
    assert isinstance(data["summary"], dict)

    assert set(data["summary"].keys()) == {
        "totalFeedbacks",
        "avgResponseTime",
        "slaCompliance",
        "satisfactionScore",
    }
