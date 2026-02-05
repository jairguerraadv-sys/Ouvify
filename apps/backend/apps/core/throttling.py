"""
Throttling customizado com suporte a modo de teste e tenant-based rate limiting
"""

import os

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class TestAwareAnonRateThrottle(AnonRateThrottle):
    """
    Throttle anônimo que desabilita em modo de teste
    """

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True

        # Desabilitar para localhost/127.0.0.1 em desenvolvimento
        remote_addr = request.META.get("REMOTE_ADDR", "")
        if remote_addr in ["127.0.0.1", "localhost", "::1"]:
            return True

        return super().allow_request(request, view)


class TestAwareUserRateThrottle(UserRateThrottle):
    """
    Throttle de usuário que desabilita em modo de teste
    """

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True

        # Desabilitar para localhost em desenvolvimento
        remote_addr = request.META.get("REMOTE_ADDR", "")
        if remote_addr in ["127.0.0.1", "localhost", "::1"]:
            return True

        return super().allow_request(request, view)


class TenantRateThrottle(UserRateThrottle):
    """
    Rate limiting por tenant ao invés de por IP.

    Isso é mais apropriado para ambientes multi-tenant onde múltiplos usuários
    de um mesmo tenant compartilham o mesmo IP (ex: NAT corporativo).

    Uso:
        REST_FRAMEWORK = {
            'DEFAULT_THROTTLE_CLASSES': [
                'apps.core.throttling.TenantRateThrottle',
            ],
            'DEFAULT_THROTTLE_RATES': {
                'tenant': '5000/hour',
            }
        }
    """

    scope = "tenant"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True

        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        """
        Retorna chave de cache baseada no tenant.

        Se usuário não autenticado ou sem tenant, fallback para IP.
        """
        # Se usuário não autenticado, usar IP
        if not request.user or not request.user.is_authenticated:
            return self.get_ident(request)

        # Usar tenant ID se disponível
        tenant = getattr(request, "tenant", None)
        if tenant:
            return f"throttle_tenant_{tenant.id}"

        # Fallback para user ID
        return f"throttle_user_{request.user.pk}"


class TenantBurstRateThrottle(TenantRateThrottle):
    """
    Rate limiting de burst (rajada) por tenant.

    Permite controlar picos de requisições em curto período.
    Ex: 100 requisições por minuto (burst), 5000 por hora (sustained)
    """

    scope = "tenant_burst"
