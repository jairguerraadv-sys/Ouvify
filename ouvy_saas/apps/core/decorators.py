"""
Decorators para Feature Gating e Validação de Tenant
Implementa controle de acesso baseado em plano do tenant
"""

from functools import wraps
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
            tenant = getattr(request, 'tenant', None)
            
            if not tenant:
                raise PermissionDenied("Tenant não identificado")
            
            if not tenant.ativo:
                raise PermissionDenied("Tenant inativo. Entre em contato com o suporte.")
            
            # Verificar feature específica usando método has_feature_<nome>
            feature_method = f'has_feature_{feature_name}'
            feature_check = getattr(tenant, feature_method, None)
            
            if not feature_check or not callable(feature_check) or not feature_check():
                raise FeatureNotAvailableError(
                    feature=feature_name,
                    message=f"Funcionalidade '{feature_name}' não disponível no plano {tenant.plano.upper()}"
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
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            raise PermissionDenied("Tenant não identificado")
        
        if not tenant.ativo:
            raise PermissionDenied(
                "Tenant inativo. Sua assinatura pode ter expirado. "
                "Entre em contato com o suporte."
            )
        
        return view_func(self, request, *args, **kwargs)
    return wrapped_view


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
        'free': 0,
        'starter': 1,
        'pro': 2,
    }
    
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            tenant = getattr(request, 'tenant', None)
            
            if not tenant:
                raise PermissionDenied("Tenant não identificado")
            
            if not tenant.ativo:
                raise PermissionDenied("Tenant inativo")
            
            # Validar hierarquia de plano
            current_plan_level = PLAN_HIERARCHY.get(tenant.plano, 0)
            required_plan_level = PLAN_HIERARCHY.get(min_plan, 0)
            
            if current_plan_level < required_plan_level:
                raise FeatureNotAvailableError(
                    feature=f'plan_{min_plan}',
                    message=f"Esta funcionalidade requer plano {min_plan.upper()} ou superior. "
                            f"Seu plano atual: {tenant.plano.upper()}"
                )
            
            return view_func(self, request, *args, **kwargs)
        return wrapped_view
    return decorator
