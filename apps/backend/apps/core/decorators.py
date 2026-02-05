"""
Decorators para Feature Gating e Validação de Tenant
Implementa controle de acesso baseado em plano do tenant
"""

from functools import wraps

from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied

from apps.core.exceptions import FeatureNotAvailableError


def require_feature(feature_name: str):
    """
    Decorator para validar feature por plano do tenant.

    Uso:
        @require_feature('attachments')
        @action(detail=True, methods=['post'])
        def upload_arquivo(self, request, pk=None):
            ...

    Args:
        feature_name: Nome da feature a validar (ex: 'attachments', 'export', 'analytics')

    Raises:
        PermissionDenied: Se tenant não identificado ou inativo
        FeatureNotAvailableError: Se feature não disponível no plano atual
    """

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            tenant = getattr(request, "tenant", None)

            if not tenant:
                raise PermissionDenied("Tenant não identificado")

            if not tenant.ativo:
                raise PermissionDenied(
                    "Tenant inativo. Entre em contato com o suporte."
                )

            # Verificar feature específica usando método has_feature_<nome>
            feature_method = f"has_feature_{feature_name}"
            feature_check = getattr(tenant, feature_method, None)

            if not feature_check or not callable(feature_check) or not feature_check():
                raise FeatureNotAvailableError(
                    feature=feature_name,
                    message=f"Funcionalidade '{feature_name}' não disponível no plano {tenant.plano.upper()}",
                )

            return view_func(self, request, *args, **kwargs)

        return wrapped_view

    return decorator


def require_active_tenant(view_func):
    """
    Decorator para validar que tenant está ativo.

    Uso:
        @require_active_tenant
        @action(detail=False, methods=['post'])
        def create(self, request):
            ...

    Raises:
        PermissionDenied: Se tenant não identificado ou inativo
    """

    @wraps(view_func)
    def wrapped_view(self, request, *args, **kwargs):
        tenant = getattr(request, "tenant", None)

        if not tenant:
            raise PermissionDenied("Tenant não identificado")

        if not tenant.ativo:
            raise PermissionDenied(
                "Tenant inativo. Sua assinatura pode ter expirado. "
                "Entre em contato com o suporte."
            )

        return view_func(self, request, *args, **kwargs)

    return wrapped_view


def cache_response(
    timeout: int = 300, key_prefix: str = "view", vary_on_user: bool = True
):
    """
    Decorator para cache de responses de views DRF.

    Uso:
        @cache_response(timeout=600, key_prefix='feedbacks-list')
        def list(self, request):
            ...

    Args:
        timeout: TTL em segundos (default: 300 = 5 minutos)
        key_prefix: Prefixo da chave de cache
        vary_on_user: Se True, cache varia por usuário

    Returns:
        Response cacheada ou nova response
    """
    import hashlib

    from django.core.cache import cache

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            # Construir chave de cache
            cache_key_parts = [key_prefix, request.path]

            # Adicionar query params
            if request.GET:
                params_hash = hashlib.md5(
                    request.GET.urlencode().encode(), usedforsecurity=False
                ).hexdigest()[:12]
                cache_key_parts.append(params_hash)

            # Adicionar user se vary_on_user
            if vary_on_user and request.user.is_authenticated:
                cache_key_parts.append(f"user:{request.user.id}")

            # Adicionar tenant se existir
            tenant = getattr(request, "tenant", None)
            if tenant:
                cache_key_parts.append(f"tenant:{tenant.id}")

            cache_key = ":".join(cache_key_parts)

            # Tentar obter do cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return cached_response

            # Executar view
            response = view_func(self, request, *args, **kwargs)

            # Cachear apenas responses de sucesso
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)

            return response

        return wrapped_view

    return decorator


def invalidate_cache(patterns: list):
    """
    Decorator para invalidar cache após mutação.

    Uso:
        @invalidate_cache(['feedbacks:*', 'dashboard:*'])
        def create(self, request):
            ...

    Args:
        patterns: Lista de padrões de chave para invalidar
    """
    from django.core.cache import cache

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            response = view_func(self, request, *args, **kwargs)

            # Invalidar cache após mutação bem sucedida
            if response.status_code in [200, 201, 204]:
                tenant = getattr(request, "tenant", None)

                for pattern in patterns:
                    if tenant and "{tenant_id}" in pattern:
                        pattern = pattern.replace("{tenant_id}", str(tenant.id))

                    # Tentar delete_pattern se disponível (django-redis)
                    if hasattr(cache, "delete_pattern"):
                        cache.delete_pattern(pattern)

            return response

        return wrapped_view

    return decorator


def require_plan(min_plan: str):
    """
    Decorator para validar plano mínimo necessário.

    Uso:
        @require_plan('starter')
        @action(detail=False, methods=['get'])
        def advanced_analytics(self, request):
            ...

    Args:
        min_plan: Plano mínimo necessário ('free', 'starter', 'pro')

    Raises:
        PermissionDenied: Se tenant não identificado ou inativo
        FeatureNotAvailableError: Se plano atual é inferior ao requerido
    """
    PLAN_HIERARCHY = {
        "free": 0,
        "starter": 1,
        "pro": 2,
    }

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            tenant = getattr(request, "tenant", None)

            if not tenant:
                raise PermissionDenied("Tenant não identificado")

            if not tenant.ativo:
                raise PermissionDenied("Tenant inativo")

            # Validar hierarquia de plano
            current_plan_level = PLAN_HIERARCHY.get(tenant.plano, 0)
            required_plan_level = PLAN_HIERARCHY.get(min_plan, 0)

            if current_plan_level < required_plan_level:
                raise FeatureNotAvailableError(
                    feature=f"plan_{min_plan}",
                    message=f"Esta funcionalidade requer plano {min_plan.upper()} ou superior. "
                    f"Seu plano atual: {tenant.plano.upper()}",
                )

            return view_func(self, request, *args, **kwargs)

        return wrapped_view

    return decorator


# =============================================================================
# P1-001: 2FA Enforcement para Operações Sensíveis
# =============================================================================


def require_2fa_verification(view_method):
    """
    Decorator que exige verificação recente de 2FA para operações sensíveis.
    
    Aplica-se a operações críticas como:
    - Mudança de senha
    - Exclusão de conta
    - Transferência de ownership
    - Mudança de email
    
    Usage:
        class PasswordResetConfirmView(APIView):
            @require_2fa_verification
            def post(self, request):
                ...
    
    Security Feature (P1-001):
    - Previne que atacante com sessão comprometida faça ações irreversíveis
    - Usuário DEVE ter verificado 2FA nos últimos 15min para operações sensíveis
    - Se usuário não tem 2FA habilitado, passa (2FA é opcional)
    """
    
    @wraps(view_method)
    def wrapper(self, request, *args, **kwargs):
        from django.utils import timezone
        from datetime import timedelta, datetime
        
        user: User = request.user
        
        # Verificar se usuário tem 2FA habilitado
        has_2fa = False
        if hasattr(user, 'totp_device_set'):
            has_2fa = user.totp_device_set.filter(confirmed=True).exists()
        
        # Se usuário TEM 2FA habilitado, DEVE ter verificado recentemente
        if has_2fa:
            last_verification_str = request.session.get('2fa_verified_at')
            
            if not last_verification_str:
                raise PermissionDenied({
                    "detail": "Esta operação sensível requer verificação 2FA",
                    "error_code": " 2FA_REQUIRED",
                    "next_step": "Faça login ou verifique seu código 2FA antes de continuar"
                })
            
            # Verificar se verificação foi recent (< 15min)
            try:
                last_verification = datetime.fromisoformat(last_verification_str)
                # Tornar timezone-aware se necessário
                if last_verification.tzinfo is None:
                    last_verification = timezone.make_aware(last_verification)
                
                age = timezone.now() - last_verification
                if age > timedelta(minutes=15):
                    # Limpar verificação expirada
                    del request.session['2fa_verified_at']
                    request.session.modified = True
                    
                    raise PermissionDenied({
                        "detail": "Sua verificação 2FA expirou (timeout: 15min)",
                        "error_code": "2FA_EXPIRED",
                        "next_step": "Por favor, verifique seu código 2FA novamente"
                    })
            except (ValueError, TypeError):
                # Se não conseguir parsear, invalidar
                raise PermissionDenied({
                    "detail": "Verificação 2FA inválida",
                    "error_code": "2FA_INVALID"
                })
        
        # Se passou pelas checagens, executar view
        return view_method(self, request, *args, **kwargs)
    
    return wrapper


def record_2fa_verification(request):
    """
    Helper para registrar que o usuário passou pela verificação 2FA.
    Chamar após validação bem-sucedida do código TOTP.
    
    Usage:
        # No endpoint de verificação 2FA, após validar o código
        from apps.core.decorators import record_2fa_verification
        record_2fa_verification(request)
        
        return Response({"detail": "2FA verificado com sucesso"})
    """
    from django.utils import timezone
    
    request.session['2fa_verified_at'] = timezone.now().isoformat()
    request.session.modified = True

