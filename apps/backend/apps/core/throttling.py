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


# ============================================================================
# FASE 3: THROTTLES ESPECÍFICOS DE ENDPOINTS (AL-001 a AL-006)
# ============================================================================


class LoginRateThrottle(UserRateThrottle):
    """
    Rate limiting para endpoint de login (TokenObtainPairView).

    Limita a 5 requisições por hora para prevenir brute force de credenciais.
    Escopo: por usuário (para não bloquear outros login na mesma empresa)

    Exemplo de aplicação em views:
        class TokenObtainPairView(TokenViewBase):
            throttle_classes = [LoginRateThrottle]
    """

    scope = "login"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        """
        Retorna chave de cache baseada no username (não é usuário autenticado ainda).
        """
        # Para login, usar o username/email do POST
        username = request.data.get("username") or request.data.get("email")
        if username:
            return f"throttle_login_{username.lower()}"

        # Fallback para IP (menos preciso)
        return self.get_ident(request)


class TwoFactorSetupThrottle(UserRateThrottle):
    """
    Rate limiting para setup inicial de 2FA.

    Limita a 5 requisições por hora para prevenir abuso.
    Usuários normalmente configuram 2FA apenas uma vez.

    Escopo: por user_id
    """

    scope = "two_factor_setup"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        """
        Retorna chave de cache baseada no user_id do usuário autenticado.
        """
        if request.user and request.user.is_authenticated:
            return f"throttle_2fa_setup_{request.user.pk}"

        # Fallback para IP
        return self.get_ident(request)


class TwoFactorVerifyThrottle(UserRateThrottle):
    """
    Rate limiting para verificação de código 2FA (TwoFactorVerifyView).

    Limita a 10 requisições por hora para prevenir brute force de TOTP.
    Usuários conseguem 10 tentativas a cada hora (tempo suficiente para erros).

    Escopo: por user_id (usuário tentando verificar 2FA)
    """

    scope = "two_factor_verify"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        """
        Retorna chave de cache baseada no user_id do usuário autenticado.
        """
        if request.user and request.user.is_authenticated:
            return f"throttle_2fa_verify_{request.user.pk}"

        # Fallback para IP
        return self.get_ident(request)


class PasswordResetConfirmThrottle(AnonRateThrottle):
    """
    Rate limiting para confirmação de reset de senha (PasswordResetConfirmView).

    Limita a 10 requisições por hora por IP para prevenir brute force de tokens.
    Anônimo pois usuário não está autenticado neste ponto.
    """

    scope = "password_reset_confirm"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)


class TenantRegistrationThrottle(AnonRateThrottle):
    """
    Rate limiting para criação de novos tenants (RegisterTenantView).

    Limita a 3 registros por dia por IP para prevenir abuse/spam.
    Crítico: registros consomem recursos (BD, banco de dados, subdomínio).
    """

    scope = "tenant_registration"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)


class FeedbackSubmissionThrottle(UserRateThrottle):
    """
    Rate limiting para submissão de feedbacks (FeedbackViewSet.create).

    Limita a 5 feedbacks por hora por tenant para prevenir spam.
    Escopo: por tenant (múltiplos usuários da mesma org não se bloqueiam)
    """

    scope = "feedback_submission"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        """
        Retorna chave de cache baseada no tenant.
        """
        tenant = getattr(request, "tenant", None)
        if tenant:
            return f"throttle_feedback_submit_{tenant.id}"

        # Fallback para user
        if request.user and request.user.is_authenticated:
            return f"throttle_feedback_submit_user_{request.user.pk}"

        # Fallback para IP (endpoints públicos)
        return self.get_ident(request)


class ProtocolLookupThrottle(AnonRateThrottle):
    """
    Rate limiting para consulta de protocolos (consultar_protocolo action).

    Limita a 20 consultas por hora por IP para prevenir enumeração de protocolos.
    Pode ser acesso anônimo (via DNS) ou autenticado (via JWT).
    """

    scope = "protocol_lookup"

    def allow_request(self, request, view):
        # Desabilitar em modo de teste
        if os.getenv("TESTING", "false").lower() == "true":
            return True
        return super().allow_request(request, view)
