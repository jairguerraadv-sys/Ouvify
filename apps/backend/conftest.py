"""
Fixtures globais para testes pytest do Ouvify
"""
import os
from pathlib import Path
import django
import pytest
from django.conf import settings
from dotenv import load_dotenv

# Carregar variáveis de ambiente do .env
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(env_path)

# Configurar Django para modo de teste
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['TESTING'] = 'True'


@pytest.fixture(scope='session')
def django_db_setup():
    """Setup do banco de dados para testes."""
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }


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
        email='test@example.com',
        password='TestPass123!',
        username=None,
        **kwargs
    ):
        if username is None:
            username = email
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **kwargs
        )
    
    return create_user


@pytest.fixture
def tenant_factory(db):
    """Factory para criar tenants de teste."""
    from apps.tenants.models import Client
    
    def create_tenant(
        nome='Test Company',
        subdominio='testcompany',
        plano='professional',
        ativo=True,
        **kwargs
    ):
        return Client.objects.create(
            nome=nome,
            subdominio=subdominio,
            plano=plano,
            ativo=ativo,
            **kwargs
        )
    
    return create_tenant


@pytest.fixture
def feedback_factory(db, tenant_factory):
    """Factory para criar feedbacks de teste."""
    from apps.feedbacks.models import Feedback
    
    def create_feedback(
        client=None,
        tipo='reclamacao',
        titulo='Feedback de Teste',
        descricao='Descrição do feedback de teste',
        status='novo',
        **kwargs
    ):
        if client is None:
            client = tenant_factory()
        
        return Feedback.objects.create(
            client=client,
            tipo=tipo,
            titulo=titulo,
            descricao=descricao,
            status=status,
            **kwargs
        )
    
    return create_feedback


@pytest.fixture
def authenticated_user(db, user_factory, tenant_factory):
    """Usuário autenticado com tenant associado."""
    tenant = tenant_factory()
    user = user_factory(email='admin@tenant.com')
    tenant.owner = user
    tenant.save()
    
    return user, tenant


@pytest.fixture
def authenticated_api_client(api_client, authenticated_user):
    """Cliente API autenticado."""
    user, tenant = authenticated_user
    api_client.force_authenticate(user=user)
    api_client.credentials(HTTP_HOST=f'{tenant.subdominio}.localhost')
    return api_client


@pytest.fixture
def superuser_factory(db):
    """Factory para criar superusuários."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    def create_superuser(
        email='superadmin@ouvy.com',
        password='SuperAdmin123!',
        **kwargs
    ):
        return User.objects.create_superuser(
            username=email,
            email=email,
            password=password,
            **kwargs
        )
    
    return create_superuser


@pytest.fixture
def jwt_tokens(db, authenticated_user):
    """Gerar tokens JWT para usuário autenticado."""
    from rest_framework_simplejwt.tokens import RefreshToken
    
    user, _ = authenticated_user
    refresh = RefreshToken.for_user(user)
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


# Configuração para marcar testes que precisam de banco de dados
def pytest_configure(config):
    """Configuração adicional do pytest."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "e2e: marks tests as end-to-end tests"
    )


# Fixture para limpar dados entre testes
@pytest.fixture(autouse=True)
def reset_sequences(db):
    """Reset sequences após cada teste (se necessário)."""
    yield
    # Cleanup pode ser adicionado aqui se necessário
