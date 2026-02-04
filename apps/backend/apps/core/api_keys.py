"""
Sistema de API Keys - Ouvify
================================

Sprint 3 - Feature 3: API Pública (4h)

Funcionalidades:
- Geração de API keys para acesso programático
- Validação e autenticação via API key
- Rate limiting por API key
"""

import hashlib
import logging
import secrets
from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.core.models import TenantAwareModel

logger = logging.getLogger(__name__)


class APIKey(TenantAwareModel):
    """
    Chave de API para acesso programático.

    Permite integração com sistemas externos sem usar JWT.
    Cada key está vinculada a um tenant específico.
    """

    # Nome identificador da key
    name = models.CharField(
        max_length=100,
        verbose_name="Nome",
        help_text="Nome descritivo para identificar a API key",
    )

    # Prefixo visível (primeiros 8 caracteres)
    prefix = models.CharField(
        max_length=8,
        db_index=True,
        verbose_name="Prefixo",
        help_text="Prefixo visível da key (para identificação)",
    )

    # Hash da key completa (nunca armazenamos a key em texto)
    key_hash = models.CharField(
        max_length=64,
        unique=True,
        verbose_name="Hash da Key",
        help_text="SHA-256 hash da API key",
    )

    # Permissões
    PERMISSION_CHOICES = [
        ("read", "Somente Leitura"),
        ("write", "Leitura e Escrita"),
        ("admin", "Administrador"),
    ]

    permissions = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default="read",
        verbose_name="Permissões",
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Expira em",
        help_text="Deixe vazio para key sem expiração",
    )

    # Controle
    is_active = models.BooleanField(default=True)
    requests_count = models.PositiveIntegerField(
        default=0, verbose_name="Total de Requisições"
    )

    # Rate limiting
    rate_limit = models.PositiveIntegerField(
        default=1000,
        verbose_name="Rate Limit (req/hora)",
        help_text="Máximo de requisições por hora",
    )

    class Meta:
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.prefix}...)"

    @classmethod
    def generate(
        cls,
        client,
        name: str,
        permissions: str = "read",
        expires_days: int = None,
        rate_limit: int = 1000,
    ):
        """
        Gera uma nova API key.

        Args:
            client: Tenant ao qual a key pertence
            name: Nome identificador
            permissions: Nível de permissão (read/write/admin)
            expires_days: Dias até expiração (None = sem expiração)
            rate_limit: Requisições por hora

        Returns:
            tuple: (APIKey instance, raw_key)

        IMPORTANTE: A raw_key só é retornada UMA vez, na criação.
        Não é possível recuperá-la depois.
        """
        # Gerar key aleatória segura
        raw_key = secrets.token_urlsafe(32)  # 256 bits
        prefix = raw_key[:8]
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        # Data de expiração
        expires_at = None
        if expires_days:
            expires_at = timezone.now() + timedelta(days=expires_days)

        # Criar instância
        api_key = cls.objects.create(
            client=client,
            name=name,
            prefix=prefix,
            key_hash=key_hash,
            permissions=permissions,
            expires_at=expires_at,
            rate_limit=rate_limit,
        )

        logger.info(f"🔑 API Key criada: {name} ({prefix}...) | Tenant: {client.nome}")

        return api_key, raw_key

    @classmethod
    def validate(cls, raw_key: str):
        """
        Valida uma API key.

        Args:
            raw_key: A key completa fornecida na requisição

        Returns:
            APIKey instance ou None se inválida
        """
        if not raw_key or len(raw_key) < 8:
            return None

        prefix = raw_key[:8]
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        try:
            api_key = cls.objects.select_related("client").get(
                prefix=prefix, key_hash=key_hash, is_active=True
            )

            # Verificar expiração
            if api_key.expires_at and api_key.expires_at < timezone.now():
                logger.warning(f"⚠️ API Key expirada: {api_key.name}")
                return None

            # Atualizar último uso
            api_key.last_used_at = timezone.now()
            api_key.requests_count += 1
            api_key.save(update_fields=["last_used_at", "requests_count"])

            return api_key

        except cls.DoesNotExist:
            return None

    def is_rate_limited(self) -> bool:
        """
        Verifica se a key excedeu o rate limit.

        Returns:
            True se rate limited, False caso contrário
        """
        from django.core.cache import cache

        cache_key = f"api_key_rate:{self.id}"
        current = cache.get(cache_key, 0)

        if current >= self.rate_limit:
            logger.warning(
                f"⚠️ Rate limit excedido: {self.name} ({current}/{self.rate_limit})"
            )
            return True

        # Incrementar contador (expira em 1 hora)
        cache.set(cache_key, current + 1, timeout=3600)
        return False

    def revoke(self):
        """Revoga (desativa) a API key."""
        self.is_active = False
        self.save(update_fields=["is_active"])
        logger.info(f"🔒 API Key revogada: {self.name}")


# =============================================================================
# AUTENTICAÇÃO POR API KEY
# =============================================================================

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class APIKeyAuthentication(BaseAuthentication):
    """
    Autenticação via API Key.

    Uso:
    - Header: `X-API-Key: <sua_api_key>`
    - Query param: `?api_key=<sua_api_key>`
    """

    keyword = "X-API-Key"

    def authenticate(self, request):
        """
        Autentica requisição via API Key.

        Returns:
            tuple: (None, api_key) se autenticado
            None: se não houver API key

        Raises:
            AuthenticationFailed: se API key inválida
        """
        # Tentar obter key do header
        api_key = request.META.get("HTTP_X_API_KEY")

        # Fallback para query param
        if not api_key:
            api_key = request.query_params.get("api_key")

        if not api_key:
            return None  # Não é autenticação por API key

        # Validar key
        key_instance = APIKey.validate(api_key)

        if not key_instance:
            raise AuthenticationFailed("API Key inválida ou expirada")

        # Verificar rate limit
        if key_instance.is_rate_limited():
            raise AuthenticationFailed(
                "Rate limit excedido. Tente novamente mais tarde."
            )

        # Definir tenant no request
        request.tenant = key_instance.client
        request.api_key = key_instance

        # Retornar None como user (autenticação anônima com API key)
        return (None, key_instance)

    def authenticate_header(self, request):
        """Header para resposta 401."""
        return self.keyword
