"""
Decorators para controle de permissões em views e viewsets.
Uso em function-based views e métodos de ViewSets.
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import TeamMember


def require_permission(permission: str):
    """
    Decorator que verifica se o usuário tem uma permissão específica.
    
    Uso:
        @require_permission('manage_feedbacks')
        def my_view(request):
            ...
    
    Args:
        permission: Nome da permissão (ex: 'manage_team', 'manage_feedbacks')
    
    Returns:
        Função decorada que verifica permissão antes de executar
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            # Verificar autenticação
            if not user.is_authenticated:
                return Response(
                    {'detail': 'Autenticação necessária'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Obter tenant do request (injetado pelo TenantMiddleware)
            tenant = getattr(request, 'tenant', None)
            if not tenant:
                return Response(
                    {'detail': 'Tenant não identificado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se é membro da equipe
            try:
                membership = TeamMember.objects.get(
                    user=user,
                    client=tenant,
                    status=TeamMember.ACTIVE
                )
            except TeamMember.DoesNotExist:
                return Response(
                    {'detail': 'Você não é membro desta equipe'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar permissão
            if not membership.has_permission(permission):
                return Response(
                    {'detail': f'Permissão necessária: {permission}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Adicionar membership no request para uso posterior
            request.team_member = membership
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def require_role(required_role: str):
    """
    Decorator que verifica se o usuário tem uma role mínima.
    Hierarquia: OWNER > ADMIN > MODERATOR > VIEWER
    
    Uso:
        @require_role('ADMIN')  # Aceita ADMIN e OWNER
        def my_view(request):
            ...
    
    Args:
        required_role: Role mínima necessária (OWNER, ADMIN, MODERATOR, VIEWER)
    
    Returns:
        Função decorada que verifica role antes de executar
    """
    # Hierarquia de roles (role -> roles aceitas)
    role_hierarchy = {
        'OWNER': ['OWNER'],
        'ADMIN': ['OWNER', 'ADMIN'],
        'MODERATOR': ['OWNER', 'ADMIN', 'MODERATOR'],
        'VIEWER': ['OWNER', 'ADMIN', 'MODERATOR', 'VIEWER'],
    }
    
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            # Verificar autenticação
            if not user.is_authenticated:
                return Response(
                    {'detail': 'Autenticação necessária'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Obter tenant
            tenant = getattr(request, 'tenant', None)
            if not tenant:
                return Response(
                    {'detail': 'Tenant não identificado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar membership
            try:
                membership = TeamMember.objects.get(
                    user=user,
                    client=tenant,
                    status=TeamMember.ACTIVE
                )
            except TeamMember.DoesNotExist:
                return Response(
                    {'detail': 'Você não é membro desta equipe'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar role
            allowed_roles = role_hierarchy.get(required_role, [])
            if membership.role not in allowed_roles:
                return Response(
                    {'detail': f'Role mínima necessária: {required_role}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Adicionar membership no request
            request.team_member = membership
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def require_active_subscription(view_func):
    """
    Decorator que verifica se o tenant tem assinatura ativa.
    
    Uso:
        @require_active_subscription
        def premium_feature(request):
            ...
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            return Response(
                {'detail': 'Tenant não identificado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if tenant.plano == 'free':
            return Response(
                {'detail': 'Recurso disponível apenas em planos pagos. Faça upgrade!'},
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        if tenant.subscription_status not in ['active', 'trialing']:
            return Response(
                {'detail': 'Assinatura inativa. Atualize seu pagamento.'},
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def require_feature(feature_name: str):
    """
    Decorator que verifica se o tenant tem acesso a uma feature específica.
    
    Uso:
        @require_feature('allow_api_access')
        def api_endpoint(request):
            ...
    
    Args:
        feature_name: Nome da feature (ex: 'allow_internal_notes')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            tenant = getattr(request, 'tenant', None)
            
            if not tenant:
                return Response(
                    {'detail': 'Tenant não identificado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not tenant.has_feature(feature_name):
                upgrade_msg = tenant.get_upgrade_message(feature_name)
                return Response(
                    {'detail': upgrade_msg},
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator
