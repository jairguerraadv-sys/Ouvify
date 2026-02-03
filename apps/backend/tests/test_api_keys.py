"""
Testes do Sistema de API Keys - Ouvify
==========================================

Sprint 3 - Feature 3: API Pública (4h)

Testa:
- Geração de API keys
- Validação de API keys
- Rate limiting
- Expiração de keys
"""

import pytest
from datetime import timedelta
from django.utils import timezone
from unittest.mock import MagicMock, patch

from apps.core.utils import set_current_tenant


@pytest.fixture
def tenant(db, tenant_factory):
    """Cria tenant de teste."""
    tenant = tenant_factory()
    set_current_tenant(tenant)
    return tenant


@pytest.mark.django_db
class TestAPIKeyGeneration:
    """Testes de geração de API keys."""
    
    def test_generate_api_key(self, tenant):
        """Gera API key com sucesso."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Test Key',
            permissions='read'
        )
        
        assert api_key is not None
        assert api_key.name == 'Test Key'
        assert api_key.permissions == 'read'
        assert api_key.is_active is True
        assert len(raw_key) > 32
        assert api_key.prefix == raw_key[:8]
    
    def test_generate_api_key_with_expiration(self, tenant):
        """Gera API key com data de expiração."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Expiring Key',
            expires_days=30
        )
        
        assert api_key.expires_at is not None
        assert api_key.expires_at > timezone.now()
        assert api_key.expires_at < timezone.now() + timedelta(days=31)
    
    def test_generate_api_key_with_custom_rate_limit(self, tenant):
        """Gera API key com rate limit customizado."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='High Limit Key',
            rate_limit=5000
        )
        
        assert api_key.rate_limit == 5000


@pytest.mark.django_db
class TestAPIKeyValidation:
    """Testes de validação de API keys."""
    
    def test_validate_valid_key(self, tenant):
        """Valida API key correta."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Valid Key'
        )
        
        validated = APIKey.validate(raw_key)
        
        assert validated is not None
        assert validated.id == api_key.id
    
    def test_validate_invalid_key(self, tenant):
        """Rejeita API key inválida."""
        from apps.core.api_keys import APIKey
        
        validated = APIKey.validate('invalid_key_12345678901234567890')
        
        assert validated is None
    
    def test_validate_expired_key(self, tenant):
        """Rejeita API key expirada."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Expired Key',
            expires_days=1
        )
        
        # Simular expiração
        api_key.expires_at = timezone.now() - timedelta(hours=1)
        api_key.save()
        
        validated = APIKey.validate(raw_key)
        
        assert validated is None
    
    def test_validate_revoked_key(self, tenant):
        """Rejeita API key revogada."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Revoked Key'
        )
        
        api_key.revoke()
        
        validated = APIKey.validate(raw_key)
        
        assert validated is None
    
    def test_validate_updates_usage(self, tenant):
        """Validação atualiza contadores de uso."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Usage Key'
        )
        
        initial_count = api_key.requests_count
        
        APIKey.validate(raw_key)
        
        api_key.refresh_from_db()
        assert api_key.requests_count == initial_count + 1
        assert api_key.last_used_at is not None


@pytest.mark.django_db
class TestAPIKeyRateLimiting:
    """Testes de rate limiting."""
    
    def test_rate_limit_not_exceeded(self, tenant):
        """Rate limit não excedido permite requisições."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Limited Key',
            rate_limit=100
        )
        
        # Primeira requisição
        is_limited = api_key.is_rate_limited()
        
        assert is_limited is False
    
    @patch('django.core.cache.cache')
    def test_rate_limit_exceeded(self, mock_cache, tenant):
        """Rate limit excedido bloqueia requisições."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='Over Limit Key',
            rate_limit=10
        )
        
        # Simular limite excedido
        mock_cache.get.return_value = 15
        
        is_limited = api_key.is_rate_limited()
        
        assert is_limited is True


@pytest.mark.django_db
class TestAPIKeyPermissions:
    """Testes de permissões de API keys."""
    
    def test_read_permission(self, tenant):
        """Cria key com permissão de leitura."""
        from apps.core.api_keys import APIKey
        
        api_key, _ = APIKey.generate(
            client=tenant,
            name='Read Key',
            permissions='read'
        )
        
        assert api_key.permissions == 'read'
    
    def test_write_permission(self, tenant):
        """Cria key com permissão de escrita."""
        from apps.core.api_keys import APIKey
        
        api_key, _ = APIKey.generate(
            client=tenant,
            name='Write Key',
            permissions='write'
        )
        
        assert api_key.permissions == 'write'
    
    def test_admin_permission(self, tenant):
        """Cria key com permissão admin."""
        from apps.core.api_keys import APIKey
        
        api_key, _ = APIKey.generate(
            client=tenant,
            name='Admin Key',
            permissions='admin'
        )
        
        assert api_key.permissions == 'admin'


@pytest.mark.django_db
class TestAPIKeyRevocation:
    """Testes de revogação de API keys."""
    
    def test_revoke_key(self, tenant):
        """Revoga API key com sucesso."""
        from apps.core.api_keys import APIKey
        
        api_key, raw_key = APIKey.generate(
            client=tenant,
            name='To Revoke'
        )
        
        assert api_key.is_active is True
        
        api_key.revoke()
        
        assert api_key.is_active is False
    
    def test_revoked_key_string_representation(self, tenant):
        """String representation da key funciona."""
        from apps.core.api_keys import APIKey
        
        api_key, _ = APIKey.generate(
            client=tenant,
            name='String Key'
        )
        
        string = str(api_key)
        
        assert 'String Key' in string
        assert api_key.prefix in string
