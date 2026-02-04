"""
Service de Cache para operações de alto nível
Abstrai operações de cache com padrões comuns
"""

import hashlib
import json
import logging
from functools import wraps
from typing import Any, Callable, Optional

from django.core.cache import cache

logger = logging.getLogger(__name__)


class CacheService:
    """
    Service de cache com operações de alto nível

    Features:
    - Cache por tenant (isolamento)
    - Cache-aside pattern
    - Invalidação inteligente
    - Métricas de hit/miss
    """

    # Prefixos de cache
    ANALYTICS_PREFIX = "analytics"
    FEEDBACKS_PREFIX = "feedbacks"
    DASHBOARD_PREFIX = "dashboard"
    USER_PREFIX = "user"

    # Timeouts padrão (segundos)
    SHORT_TTL = 60 * 5  # 5 minutos
    MEDIUM_TTL = 60 * 15  # 15 minutos
    LONG_TTL = 60 * 60  # 1 hora
    DAY_TTL = 60 * 60 * 24  # 1 dia

    def __init__(self, tenant_id: Optional[int] = None):
        """
        Inicializa o service com tenant opcional

        Args:
            tenant_id: ID do tenant para isolamento de cache
        """
        self.tenant_id = tenant_id

    def _build_key(self, prefix: str, *args) -> str:
        """
        Constrói chave de cache com prefixo e tenant

        Args:
            prefix: Prefixo da chave
            *args: Partes adicionais da chave
        """
        parts = [prefix]

        if self.tenant_id:
            parts.append(f"tenant:{self.tenant_id}")

        parts.extend([str(arg) for arg in args])

        return ":".join(parts)

    def _hash_params(self, params: dict) -> str:
        """Gera hash MD5 de parâmetros para usar como parte da chave"""
        serialized = json.dumps(params, sort_keys=True)
        return hashlib.md5(serialized.encode()).hexdigest()[:12]

    def get(self, key: str) -> Optional[Any]:
        """
        Obtém valor do cache

        Args:
            key: Chave do cache

        Returns:
            Valor ou None se não existir
        """
        try:
            return cache.get(key)
        except Exception as e:
            logger.warning(f"Erro ao ler cache: {e}")
            return None

    def set(self, key: str, value: Any, timeout: Optional[int] = None) -> bool:
        """
        Define valor no cache

        Args:
            key: Chave do cache
            value: Valor a armazenar
            timeout: TTL em segundos (usa MEDIUM_TTL se não informado)

        Returns:
            True se sucesso
        """
        try:
            timeout = timeout or self.MEDIUM_TTL
            cache.set(key, value, timeout=timeout)
            return True
        except Exception as e:
            logger.warning(f"Erro ao escrever cache: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Remove chave do cache

        Args:
            key: Chave a remover
        """
        try:
            cache.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Erro ao deletar cache: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Remove todas as chaves que correspondem ao padrão

        Args:
            pattern: Padrão de chave (ex: 'feedbacks:tenant:1:*')

        Returns:
            Número de chaves removidas
        """
        try:
            # Django-redis suporta delete_pattern
            if hasattr(cache, "delete_pattern"):
                return cache.delete_pattern(pattern)

            # Fallback: usar keys() e delete_many()
            if hasattr(cache, "keys"):
                keys = cache.keys(pattern)
                if keys:
                    cache.delete_many(keys)
                    return len(keys)

            return 0
        except Exception as e:
            logger.warning(f"Erro ao deletar padrão: {e}")
            return 0

    def get_or_set(
        self, key: str, factory: Callable[[], Any], timeout: Optional[int] = None
    ) -> Any:
        """
        Pattern cache-aside: obtém do cache ou executa factory

        Args:
            key: Chave do cache
            factory: Função que gera o valor se não estiver em cache
            timeout: TTL em segundos

        Returns:
            Valor do cache ou resultado do factory
        """
        value = self.get(key)

        if value is not None:
            return value

        # Executar factory
        value = factory()

        if value is not None:
            self.set(key, value, timeout)

        return value

    # =========================================================================
    # Operações específicas por domínio
    # =========================================================================

    def get_analytics(self, params: Optional[dict] = None) -> Optional[dict]:
        """Obtém analytics do cache"""
        key = self._build_key(self.ANALYTICS_PREFIX)
        if params:
            key = f"{key}:{self._hash_params(params)}"
        return self.get(key)

    def set_analytics(
        self, data: dict, params: Optional[dict] = None, timeout: Optional[int] = None
    ) -> bool:
        """Define analytics no cache"""
        key = self._build_key(self.ANALYTICS_PREFIX)
        if params:
            key = f"{key}:{self._hash_params(params)}"
        return self.set(key, data, timeout or self.MEDIUM_TTL)

    def get_dashboard_stats(self) -> Optional[dict]:
        """Obtém stats do dashboard do cache"""
        key = self._build_key(self.DASHBOARD_PREFIX, "stats")
        return self.get(key)

    def set_dashboard_stats(self, data: dict, timeout: Optional[int] = None) -> bool:
        """Define stats do dashboard no cache"""
        key = self._build_key(self.DASHBOARD_PREFIX, "stats")
        return self.set(key, data, timeout or self.SHORT_TTL)

    def get_recent_feedbacks(self, limit: int = 10) -> Optional[list]:
        """Obtém feedbacks recentes do cache"""
        key = self._build_key(self.FEEDBACKS_PREFIX, "recent", limit)
        return self.get(key)

    def set_recent_feedbacks(
        self, data: list, limit: int = 10, timeout: Optional[int] = None
    ) -> bool:
        """Define feedbacks recentes no cache"""
        key = self._build_key(self.FEEDBACKS_PREFIX, "recent", limit)
        return self.set(key, data, timeout or self.SHORT_TTL)

    def invalidate_tenant_cache(self) -> int:
        """Invalida todo cache do tenant atual"""
        if not self.tenant_id:
            return 0

        patterns = [
            f"*:tenant:{self.tenant_id}:*",
            f"*:tenant:{self.tenant_id}",
        ]

        count = 0
        for pattern in patterns:
            count += self.delete_pattern(pattern)

        logger.info(f"Invalidadas {count} chaves do tenant {self.tenant_id}")
        return count


# =========================================================================
# Decorators de cache
# =========================================================================


def cached(
    prefix: str,
    timeout: int = 60 * 15,
    key_builder: Optional[Callable[..., str]] = None,
):
    """
    Decorator para cachear resultado de função/método

    Args:
        prefix: Prefixo da chave de cache
        timeout: TTL em segundos
        key_builder: Função customizada para construir a chave

    Usage:
        @cached('analytics', timeout=300)
        def get_analytics(tenant_id, filters):
            # código custoso...
            return data
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Construir chave
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Chave padrão baseada em args/kwargs
                key_parts = [prefix, func.__name__]
                key_parts.extend([str(a) for a in args if not hasattr(a, "__dict__")])
                key_parts.append(
                    hashlib.md5(
                        json.dumps(kwargs, sort_keys=True, default=str).encode()
                    ).hexdigest()[:12]
                )
                cache_key = ":".join(key_parts)

            # Tentar obter do cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Executar função
            result = func(*args, **kwargs)

            # Salvar no cache
            if result is not None:
                cache.set(cache_key, result, timeout=timeout)

            return result

        return wrapper

    return decorator


def cached_method(prefix: str, timeout: int = 60 * 15, tenant_aware: bool = True):
    """
    Decorator para cachear método com suporte a tenant

    Args:
        prefix: Prefixo da chave de cache
        timeout: TTL em segundos
        tenant_aware: Se deve incluir tenant_id na chave
    """

    def decorator(method):
        @wraps(method)
        def wrapper(self, *args, **kwargs):
            # Construir chave
            key_parts = [prefix]

            # Incluir tenant se disponível
            if tenant_aware:
                tenant_id = getattr(self, "tenant_id", None)
                if tenant_id:
                    key_parts.append(f"tenant:{tenant_id}")

            key_parts.append(method.__name__)
            key_parts.extend([str(a) for a in args])

            if kwargs:
                key_parts.append(
                    hashlib.md5(
                        json.dumps(kwargs, sort_keys=True, default=str).encode()
                    ).hexdigest()[:12]
                )

            cache_key = ":".join(key_parts)

            # Tentar obter do cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Executar método
            result = method(self, *args, **kwargs)

            # Salvar no cache
            if result is not None:
                cache.set(cache_key, result, timeout=timeout)

            return result

        return wrapper

    return decorator


# =========================================================================
# Helper functions
# =========================================================================


def get_cache_service(request) -> CacheService:
    """
    Retorna instância do CacheService para o tenant do request
    """
    tenant_id: Optional[int] = getattr(request, "tenant_id", None)

    if not tenant_id:
        if hasattr(request, "user") and hasattr(request.user, "tenant_id"):
            tenant_id = request.user.tenant_id

    return CacheService(tenant_id=tenant_id)


def invalidate_on_change(model_class, cache_prefix: str):
    """
    Signal receiver para invalidar cache quando modelo muda

    Usage:
        from django.db.models.signals import post_save, post_delete

        post_save.connect(
            invalidate_on_change(Feedback, 'feedbacks'),
            sender=Feedback
        )
    """

    def receiver(sender, instance, **kwargs):
        tenant_id = getattr(instance, "client_id", None) or getattr(
            instance, "tenant_id", None
        )

        if tenant_id:
            service = CacheService(tenant_id=tenant_id)
            service.delete_pattern(f"{cache_prefix}:tenant:{tenant_id}:*")

    return receiver
