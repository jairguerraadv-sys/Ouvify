"""
Testes de Notifications - Ouvify
Sprint 2 Correções: Auditoria 30/01/2026

Cobertura:
- test_push_subscription: Gerenciamento de subscriptions push
- test_notification_crud: Operações de notificações
- test_notification_marking: Marcar como lida/não lida
"""

import uuid

import pytest
from apps.notifications.models import Notification, PushSubscription
from apps.tenants.models import Client


@pytest.fixture
def test_user(db):
    """Cria usuário de teste."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    return User.objects.create_user(
        username="notification_test@example.com",
        email="notification_test@example.com",
        password="TestPass123!",
    )


@pytest.fixture
def test_tenant(db, test_user):
    """Cria tenant de teste sem trigger de subscription."""
    unique_id = str(uuid.uuid4())[:8]
    tenant = Client.objects.create(
        nome=f"Notification Test Company {unique_id}",
        subdominio=f"notificationtest-{unique_id}",
        plano="professional",
        ativo=True,
        owner=test_user,
    )
    return tenant


# ======================
# TESTES DE PUSH SUBSCRIPTION MODEL
# ======================


@pytest.mark.django_db
class TestPushSubscriptionModel:
    """Testes unitários para modelo PushSubscription."""

    def test_create_subscription(self, test_user, test_tenant):
        """Criar subscription de push."""
        sub = PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.service.com/test/123",
            p256dh="test_public_key_base64",
            auth="test_auth_secret",
            user_agent="Mozilla/5.0 Test",
            ip_address="127.0.0.1",
            active=True,
        )

        assert sub.id is not None
        assert sub.endpoint == "https://push.service.com/test/123"
        assert sub.active is True

    def test_subscription_unique_per_user_endpoint(self, test_user, test_tenant):
        """Subscription deve ser única por user+endpoint."""
        PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.service.com/unique/123",
            p256dh="key1",
            auth="auth1",
        )

        # Tentar criar duplicado deve falhar
        with pytest.raises(Exception):
            PushSubscription.objects.create(
                user=test_user,
                tenant=test_tenant,
                endpoint="https://push.service.com/unique/123",
                p256dh="key2",
                auth="auth2",
            )

    def test_deactivate_subscription(self, test_user, test_tenant):
        """Desativar subscription."""
        sub = PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.service.com/test/456",
            p256dh="key",
            auth="auth",
            active=True,
        )

        sub.deactivate()

        sub.refresh_from_db()
        assert sub.active is False

    def test_mark_as_used(self, test_user, test_tenant):
        """Marcar subscription como usada."""
        sub = PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.service.com/test/789",
            p256dh="key",
            auth="auth",
        )

        assert sub.last_used is None

        sub.mark_as_used()

        sub.refresh_from_db()
        assert sub.last_used is not None

    def test_subscription_str(self, test_user, test_tenant):
        """Representação string da subscription."""
        sub = PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.service.com/long/endpoint/here",
            p256dh="key",
            auth="auth",
        )

        str_repr = str(sub)
        assert test_user.email in str_repr


# ======================
# TESTES DE NOTIFICATION MODEL
# ======================


@pytest.mark.django_db
class TestNotificationModel:
    """Testes unitários para modelo Notification."""

    def test_create_notification(self, test_user, test_tenant):
        """Criar notificação."""
        notif = Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="feedback_novo",
            title="Novo Feedback Recebido",
            body="Você recebeu um novo feedback.",
            data={"feedback_id": 123},
        )

        assert notif.id is not None
        assert notif.tipo == "feedback_novo"
        assert notif.is_read is False

    def test_mark_notification_as_read(self, test_user, test_tenant):
        """Marcar notificação como lida."""
        notif = Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="feedback_novo",
            title="Novo Feedback",
            body="Descrição do feedback",
        )

        assert notif.is_read is False

        notif.mark_as_read()

        notif.refresh_from_db()
        assert notif.is_read is True
        assert notif.read_at is not None

    def test_notification_data_field(self, test_user, test_tenant):
        """Campo data deve armazenar JSON."""
        data = {
            "feedback_id": 456,
            "client_name": "Test Client",
            "tags": ["importante", "urgente"],
        }

        notif = Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="System Alert",
            body="Alert message",
            data=data,
        )

        notif.refresh_from_db()
        assert notif.data["feedback_id"] == 456
        assert "importante" in notif.data["tags"]

    def test_notification_ordering(self, test_user, test_tenant):
        """Notificações devem ser ordenadas por data."""
        Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="First",
            body="First notification",
        )

        Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="Second",
            body="Second notification",
        )

        # n2 deve vir primeiro (mais recente)
        notifications = Notification.objects.filter(user=test_user).order_by("-sent_at")
        assert notifications[0].title == "Second"


# ======================
# TESTES DE NOTIFICATION QUERIES
# ======================


@pytest.mark.django_db
class TestNotificationQueries:
    """Testes para queries de notificações."""

    def test_filter_unread_notifications(self, test_user, test_tenant):
        """Filtrar notificações não lidas."""
        Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="Unread",
            body="Not read",
        )

        read_notif = Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="Read",
            body="Already read",
        )
        read_notif.mark_as_read()

        unread_list = Notification.objects.filter(user=test_user, read_at__isnull=True)
        assert unread_list.count() == 1
        assert unread_list.first().title == "Unread"

    def test_filter_by_type(self, test_user, test_tenant):
        """Filtrar notificações por tipo."""
        Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="feedback_novo",
            title="Feedback 1",
            body="New feedback",
        )

        Notification.objects.create(
            user=test_user,
            tenant=test_tenant,
            tipo="sistema",
            title="System Alert",
            body="System message",
        )

        feedbacks = Notification.objects.filter(user=test_user, tipo="feedback_novo")
        assert feedbacks.count() == 1

    def test_filter_by_tenant(self, test_user, db):
        """Filtrar notificações por tenant."""
        unique1 = str(uuid.uuid4())[:8]
        unique2 = str(uuid.uuid4())[:8]

        tenant1 = Client.objects.create(
            nome=f"Tenant 1 {unique1}",
            subdominio=f"tenant1-{unique1}",
            plano="free",
            ativo=True,
            owner=test_user,
        )

        tenant2 = Client.objects.create(
            nome=f"Tenant 2 {unique2}",
            subdominio=f"tenant2-{unique2}",
            plano="free",
            ativo=True,
            owner=test_user,
        )

        Notification.objects.create(
            user=test_user,
            tenant=tenant1,
            tipo="sistema",
            title="For Tenant 1",
            body="Message",
        )

        Notification.objects.create(
            user=test_user,
            tenant=tenant2,
            tipo="sistema",
            title="For Tenant 2",
            body="Message",
        )

        tenant1_notifs = Notification.objects.filter(tenant=tenant1)
        assert tenant1_notifs.count() == 1
        assert tenant1_notifs.first().title == "For Tenant 1"


# ======================
# TESTES DE PUSH SUBSCRIPTION QUERIES
# ======================


@pytest.mark.django_db
class TestPushSubscriptionQueries:
    """Testes para queries de push subscriptions."""

    def test_filter_active_subscriptions(self, test_user, test_tenant):
        """Filtrar subscriptions ativas."""
        PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.example.com/active",
            p256dh="key1",
            auth="auth1",
            active=True,
        )

        PushSubscription.objects.create(
            user=test_user,
            tenant=test_tenant,
            endpoint="https://push.example.com/inactive",
            p256dh="key2",
            auth="auth2",
            active=False,
        )

        active = PushSubscription.objects.filter(user=test_user, active=True)
        assert active.count() == 1

    def test_filter_by_user(self, test_tenant, db):
        """Filtrar subscriptions por usuário."""
        from django.contrib.auth import get_user_model

        User = get_user_model()

        user1 = User.objects.create_user(
            username="user1@test.com", email="user1@test.com", password="TestPass123!"
        )

        user2 = User.objects.create_user(
            username="user2@test.com", email="user2@test.com", password="TestPass123!"
        )

        PushSubscription.objects.create(
            user=user1,
            tenant=test_tenant,
            endpoint="https://push.example.com/user1",
            p256dh="key1",
            auth="auth1",
        )

        PushSubscription.objects.create(
            user=user2,
            tenant=test_tenant,
            endpoint="https://push.example.com/user2",
            p256dh="key2",
            auth="auth2",
        )

        user1_subs = PushSubscription.objects.filter(user=user1)
        assert user1_subs.count() == 1
