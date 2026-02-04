"""
Testes de Audit Log - Ouvify
Sprint 2 Correções: Auditoria 30/01/2026

Cobertura:
- test_audit_log_creation: Criação de logs de auditoria
- test_audit_log_queries: Queries e filtros de logs
"""

import uuid

import pytest
from apps.auditlog.models import AuditLog
from apps.tenants.models import Client
from django.utils import timezone


@pytest.fixture
def test_user(db):
    """Cria usuário de teste."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    return User.objects.create_user(
        username="auditlog_test@example.com",
        email="auditlog_test@example.com",
        password="TestPass123!",
        is_staff=True,
    )


@pytest.fixture
def test_tenant(db, test_user):
    """Cria tenant de teste."""
    unique_id = str(uuid.uuid4())[:8]
    tenant = Client.objects.create(
        nome=f"Audit Test Company {unique_id}",
        subdominio=f"audittest-{unique_id}",
        plano="professional",
        ativo=True,
        owner=test_user,
    )
    return tenant


# ======================
# TESTES DO MODELO AUDIT LOG
# ======================


@pytest.mark.django_db
class TestAuditLogModel:
    """Testes unitários para modelo AuditLog."""

    def test_create_log_with_manager(self, test_user, test_tenant):
        """Criar log usando manager."""
        log = AuditLog.objects.create_log(
            action="CREATE",
            user=test_user,
            tenant=test_tenant,
            description="Teste de criação de log",
        )

        assert log.id is not None
        assert log.action == "CREATE"
        assert log.user == test_user

    def test_create_log_with_metadata(self, test_user, test_tenant):
        """Criar log com metadados JSON."""
        metadata = {"browser": "Chrome", "os": "Windows", "device": "Desktop"}

        log = AuditLog.objects.create_log(
            action="LOGIN",
            user=test_user,
            tenant=test_tenant,
            description="Login realizado",
            metadata=metadata,
        )

        assert log.metadata["browser"] == "Chrome"
        assert log.metadata["os"] == "Windows"

    def test_create_log_with_ip_and_user_agent(self, test_user, test_tenant):
        """Criar log com IP e User Agent."""
        log = AuditLog.objects.create_log(
            action="LOGIN",
            user=test_user,
            tenant=test_tenant,
            description="Login do usuário",
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        )

        assert log.ip_address == "192.168.1.100"
        assert "Mozilla" in log.user_agent

    def test_create_log_with_severity(self, test_user, test_tenant):
        """Criar log com diferentes níveis de severidade."""
        info_log = AuditLog.objects.create_log(
            action="VIEW",
            user=test_user,
            tenant=test_tenant,
            description="Visualização de dados",
            severity="INFO",
        )

        warning_log = AuditLog.objects.create_log(
            action="LOGIN_FAILED",
            user=test_user,
            tenant=test_tenant,
            description="Tentativa de login falhou",
            severity="WARNING",
        )

        error_log = AuditLog.objects.create_log(
            action="DELETE",
            user=test_user,
            tenant=test_tenant,
            description="Erro ao deletar recurso",
            severity="ERROR",
        )

        assert info_log.severity == "INFO"
        assert warning_log.severity == "WARNING"
        assert error_log.severity == "ERROR"

    def test_log_timestamp_auto(self, test_user, test_tenant):
        """Timestamp deve ser criado automaticamente."""
        before = timezone.now()

        log = AuditLog.objects.create_log(
            action="CREATE",
            user=test_user,
            tenant=test_tenant,
            description="Teste de timestamp",
        )

        after = timezone.now()

        assert log.timestamp >= before
        assert log.timestamp <= after


# ======================
# TESTES DE QUERIES DO AUDIT LOG
# ======================


@pytest.mark.django_db
class TestAuditLogQueries:
    """Testes para queries de AuditLog."""

    def test_filter_by_action(self, test_user, test_tenant):
        """Filtrar logs por tipo de ação."""
        AuditLog.objects.create_log(
            action="LOGIN", user=test_user, tenant=test_tenant, description="Login"
        )

        AuditLog.objects.create_log(
            action="LOGOUT", user=test_user, tenant=test_tenant, description="Logout"
        )

        AuditLog.objects.create_log(
            action="LOGIN",
            user=test_user,
            tenant=test_tenant,
            description="Another login",
        )

        login_logs = AuditLog.objects.by_action("LOGIN")
        assert login_logs.count() == 2

    def test_recent_logs(self, test_user, test_tenant):
        """Filtrar logs recentes."""
        # Criar log recente
        AuditLog.objects.create_log(
            action="CREATE",
            user=test_user,
            tenant=test_tenant,
            description="Recent log",
        )

        recent = AuditLog.objects.recent(days=7)
        # Deve ter pelo menos 1 log recente (pode ter mais dos signals)
        assert recent.filter(description="Recent log").count() == 1


# ======================
# TESTES DE AÇÕES DE AUDIT
# ======================


@pytest.mark.django_db
class TestAuditLogActions:
    """Testes para diferentes tipos de ações de auditoria."""

    def test_login_action(self, test_user, test_tenant):
        """Log de login."""
        log = AuditLog.objects.create_log(
            action="LOGIN",
            user=test_user,
            tenant=test_tenant,
            description="Usuário realizou login",
            ip_address="192.168.1.1",
        )

        assert log.action == "LOGIN"

    def test_logout_action(self, test_user, test_tenant):
        """Log de logout."""
        log = AuditLog.objects.create_log(
            action="LOGOUT",
            user=test_user,
            tenant=test_tenant,
            description="Usuário realizou logout",
        )

        assert log.action == "LOGOUT"

    def test_create_action(self, test_user, test_tenant):
        """Log de criação de recurso."""
        log = AuditLog.objects.create_log(
            action="CREATE",
            user=test_user,
            tenant=test_tenant,
            description="Feedback criado",
            metadata={"feedback_id": 123},
        )

        assert log.action == "CREATE"
        assert log.metadata["feedback_id"] == 123

    def test_update_action(self, test_user, test_tenant):
        """Log de atualização de recurso."""
        log = AuditLog.objects.create_log(
            action="UPDATE",
            user=test_user,
            tenant=test_tenant,
            description="Feedback atualizado",
            metadata={
                "feedback_id": 123,
                "changes": {"status": {"old": "novo", "new": "em_analise"}},
            },
        )

        assert log.action == "UPDATE"
        assert "changes" in log.metadata

    def test_delete_action(self, test_user, test_tenant):
        """Log de exclusão de recurso."""
        log = AuditLog.objects.create_log(
            action="DELETE",
            user=test_user,
            tenant=test_tenant,
            description="Feedback excluído",
            metadata={"feedback_id": 123, "reason": "Solicitação do cliente"},
            severity="WARNING",
        )

        assert log.action == "DELETE"
        assert log.severity == "WARNING"

    def test_password_change_action(self, test_user, test_tenant):
        """Log de alteração de senha."""
        log = AuditLog.objects.create_log(
            action="PASSWORD_CHANGE",
            user=test_user,
            tenant=test_tenant,
            description="Usuário alterou a senha",
            severity="INFO",
        )

        assert log.action == "PASSWORD_CHANGE"

    def test_login_failed_action(self, test_user, test_tenant):
        """Log de falha de login."""
        log = AuditLog.objects.create_log(
            action="LOGIN_FAILED",
            user=test_user,
            tenant=test_tenant,
            description="Tentativa de login com senha incorreta",
            ip_address="10.0.0.1",
            severity="WARNING",
        )

        assert log.action == "LOGIN_FAILED"
        assert log.severity == "WARNING"


# ======================
# TESTES DE AUDIT LOG SEM TENANT
# ======================


@pytest.mark.django_db
class TestAuditLogWithoutTenant:
    """Testes para logs sem tenant (ações globais)."""

    def test_create_log_without_tenant(self, test_user):
        """Criar log sem tenant associado."""
        log = AuditLog.objects.create_log(
            action="ADMIN_ACTION",
            user=test_user,
            description="Ação administrativa global",
        )

        assert log.tenant is None
        assert log.user == test_user

    def test_create_log_without_user(self, test_tenant):
        """Criar log sem usuário (ação do sistema)."""
        log = AuditLog.objects.create_log(
            action="SYSTEM",
            tenant=test_tenant,
            description="Ação automática do sistema",
        )

        assert log.user is None
        assert log.tenant == test_tenant
