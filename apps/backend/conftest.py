"""
Fixtures globais para testes pytest do Ouvify
"""

import os
from pathlib import Path

# IMPORTANTE: Configurar modo de teste ANTES de importar Django
os.environ["TESTING"] = "True"
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Desabilitar nplusone - configuração via variável de ambiente
os.environ["NPLUSONE_RAISE"] = "False"
os.environ["NPLUSONE_WHITELIST"] = "*"

from unittest.mock import MagicMock

import pytest
from apps.core.utils import set_current_tenant
from django.conf import settings
from dotenv import load_dotenv

# Carregar variáveis de ambiente do .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# Patch nplusone após Django estar configurado para evitar erros
try:
    from nplusone.core import notifiers

    # Substituir o notifier por um noop
    class NoopNotifier:
        def notify(self, message):
            pass

    notifiers.Notifier = NoopNotifier
except ImportError:
    pass


@pytest.fixture(scope="session")
def django_db_setup(django_db_blocker):
    """Setup do banco de dados para testes - força SQLite em memória."""
    from django.conf import settings as django_settings
    from django.core.management import call_command

    # Substituir completamente a configuração do banco para usar SQLite em memória
    # Força a configuração em múltiplos lugares para garantir que seja usada
    sqlite_config = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
        "ATOMIC_REQUESTS": False,
        "CONN_MAX_AGE": 0,  # Sem pool de conexões para SQLite
        "OPTIONS": {},  # Sem opções extras (evita connect_timeout)
        "TEST": {},
    }

    # Atualiza DATABASES em settings
    settings.DATABASES = {"default": sqlite_config}

    # Força também no django.conf.settings (caso esteja usando diretamente)
    if hasattr(django_settings, "DATABASES"):
        django_settings.DATABASES = {"default": sqlite_config}

    with django_db_blocker.unblock():
        call_command("migrate", "--run-syncdb", verbosity=0)


@pytest.fixture
def api_client():
    """Cliente API para testes REST."""
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def user_factory(db):
    """Factory para criar usuários de teste."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    def create_user(
        email="test@example.com", password="TestPass123!", username=None, **kwargs
    ):
        if username is None:
            username = email
        return User.objects.create_user(
            username=username, email=email, password=password, **kwargs
        )

    return create_user


@pytest.fixture
def tenant_factory(db):
    """Factory para criar tenants de teste."""
    from apps.tenants.models import Client

    def create_tenant(
        nome="Test Company",
        subdominio="testcompany",
        plano="professional",
        ativo=True,
        **kwargs,
    ):
        return Client.objects.create(
            nome=nome, subdominio=subdominio, plano=plano, ativo=ativo, **kwargs
        )

    return create_tenant


@pytest.fixture
def tenant(db, tenant_factory):
    """Cria tenant de teste e configura contexto multi-tenant."""
    t = tenant_factory()
    set_current_tenant(t)
    return t


@pytest.fixture
def feedback_factory(db, tenant_factory):
    """Factory para criar feedbacks de teste."""
    from apps.feedbacks.models import Feedback

    def create_feedback(
        client=None,
        tipo="reclamacao",
        titulo="Feedback de Teste",
        descricao="Descrição do feedback de teste",
        status="novo",
        **kwargs,
    ):
        if client is None:
            client = tenant_factory()

        return Feedback.objects.create(
            client=client,
            tipo=tipo,
            titulo=titulo,
            descricao=descricao,
            status=status,
            **kwargs,
        )

    return create_feedback


@pytest.fixture
def authenticated_user(db, user_factory, tenant_factory):
    """Usuário autenticado com tenant associado."""
    tenant = tenant_factory()
    user = user_factory(email="admin@tenant.com")
    tenant.owner = user
    tenant.save()

    return user, tenant


@pytest.fixture
def authenticated_api_client(api_client, authenticated_user):
    """Cliente API autenticado."""
    user, tenant = authenticated_user
    api_client.force_authenticate(user=user)
    api_client.credentials(HTTP_HOST=f"{tenant.subdominio}.localhost")
    return api_client


@pytest.fixture
def superuser_factory(db):
    """Factory para criar superusuários."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    def create_superuser(
        email="superadmin@ouvify.com", password="SuperAdmin123!", **kwargs
    ):
        return User.objects.create_superuser(
            username=email, email=email, password=password, **kwargs
        )

    return create_superuser


@pytest.fixture
def jwt_tokens(db, authenticated_user):
    """Gerar tokens JWT para usuário autenticado."""
    from rest_framework_simplejwt.tokens import RefreshToken

    user, _ = authenticated_user
    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# Configuração para marcar testes que precisam de banco de dados
def pytest_configure(config):
    """Configuração adicional do pytest."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "e2e: marks tests as end-to-end tests")


# Fixture para limpar dados entre testes
@pytest.fixture(autouse=True)
def reset_sequences(db):
    """Reset sequences após cada teste (se necessário)."""
    yield
    # Cleanup pode ser adicionado aqui se necessário


@pytest.fixture(autouse=True)
def skip_celery_tasks(monkeypatch):
    """Mocka tasks Celery para evitar conexão com Redis/Celery durante testes."""
    monkeypatch.setenv("CELERY_TASK_ALWAYS_EAGER", "True")

    import apps.notifications.tasks as notif_tasks

    monkeypatch.setattr(notif_tasks, "send_feedback_created_push", MagicMock())
    monkeypatch.setattr(notif_tasks, "send_status_update_push", MagicMock())
    monkeypatch.setattr(notif_tasks, "send_push_notification", MagicMock())

    import apps.feedbacks.tasks as fb_tasks

    monkeypatch.setattr(fb_tasks, "send_new_feedback_email", MagicMock())
    monkeypatch.setattr(fb_tasks, "send_assignment_email", MagicMock())
