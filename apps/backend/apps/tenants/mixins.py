"""
Mixins para controle de permissões em ViewSets (DRF).
Uso em classes que herdam de ModelViewSet, GenericViewSet, etc.
"""

from rest_framework.exceptions import PermissionDenied
from .models import TeamMember


class PermissionRequiredMixin:
    """
    Mixin para ViewSets com verificação automática de permissões por action.
    
    Uso:
        class FeedbackViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
            required_permissions = {
                'list': 'view_feedbacks',
                'retrieve': 'view_feedbacks',
                'create': 'manage_feedbacks',
                'update': 'manage_feedbacks',
                'partial_update': 'manage_feedbacks',
                'destroy': 'manage_feedbacks',
            }
    
    Atributos:
        required_permissions (dict): Mapeamento action -> permissão necessária
    """
    required_permissions = {}
    
    def check_permissions(self, request):
        """
        Override do método check_permissions do DRF.
        Adiciona verificação de permissões do TeamMember.
        """
        # Chamar verificação padrão do DRF primeiro
        super().check_permissions(request)
        
        # Obter action atual (list, create, update, etc)
        action = self.action
        
        # Verificar se há permissão configurada para esta action
        required_perm = self.required_permissions.get(action)
        
        if not required_perm:
            # Sem permissão configurada, passa (permite)
            return
        
        user = request.user
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            raise PermissionDenied("Tenant não identificado")
        
        # Verificar se é membro ativo da equipe
        try:
            membership = TeamMember.objects.select_related('user', 'client').get(
                user=user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
        except TeamMember.DoesNotExist:
            raise PermissionDenied("Você não é membro desta equipe")
        
        # Verificar permissão específica
        if not membership.has_permission(required_perm):
            raise PermissionDenied(f"Permissão necessária: {required_perm}")
        
        # Adicionar membership no request para uso posterior
        request.team_member = membership


class RoleRequiredMixin:
    """
    Mixin para ViewSets com verificação de role mínima por action.
    
    Uso:
        class TeamManagementViewSet(RoleRequiredMixin, viewsets.ModelViewSet):
            required_roles = {
                'list': 'VIEWER',
                'create': 'ADMIN',
                'update': 'ADMIN',
                'destroy': 'OWNER',
            }
    
    Atributos:
        required_roles (dict): Mapeamento action -> role mínima necessária
    """
    required_roles = {}
    
    # Hierarquia de roles
    ROLE_HIERARCHY = {
        'OWNER': ['OWNER'],
        'ADMIN': ['OWNER', 'ADMIN'],
        'MODERATOR': ['OWNER', 'ADMIN', 'MODERATOR'],
        'VIEWER': ['OWNER', 'ADMIN', 'MODERATOR', 'VIEWER'],
    }
    
    def check_permissions(self, request):
        """Override com verificação de role"""
        super().check_permissions(request)
        
        action = self.action
        required_role = self.required_roles.get(action)
        
        if not required_role:
            return
        
        user = request.user
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            raise PermissionDenied("Tenant não identificado")
        
        try:
            membership = TeamMember.objects.select_related('user', 'client').get(
                user=user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
        except TeamMember.DoesNotExist:
            raise PermissionDenied("Você não é membro desta equipe")
        
        # Verificar role
        allowed_roles = self.ROLE_HIERARCHY.get(required_role, [])
        if membership.role not in allowed_roles:
            raise PermissionDenied(f"Role mínima necessária: {required_role}")
        
        request.team_member = membership


class FeatureGatingMixin:
    """
    Mixin para ViewSets com feature gating (controle por plano).
    
    Uso:
        class AdvancedAnalyticsViewSet(FeatureGatingMixin, viewsets.ReadOnlyModelViewSet):
            required_features = {
                'list': 'allow_analytics',
                'export': 'allow_api_access',
            }
    
    Atributos:
        required_features (dict): Mapeamento action -> feature necessária
    """
    required_features = {}
    
    def check_permissions(self, request):
        """Override com verificação de feature"""
        super().check_permissions(request)
        
        action = self.action
        required_feature = self.required_features.get(action)
        
        if not required_feature:
            return
        
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            raise PermissionDenied("Tenant não identificado")
        
        if not tenant.has_feature(required_feature):
            upgrade_msg = tenant.get_upgrade_message(required_feature)
            raise PermissionDenied(upgrade_msg)


class TeamMemberContextMixin:
    """
    Mixin que adiciona automaticamente o TeamMember no contexto do serializer.
    Útil para serializers que precisam saber o role do usuário.
    
    Uso:
        class MyViewSet(TeamMemberContextMixin, viewsets.ModelViewSet):
            ...
    """
    
    def get_serializer_context(self):
        """Adiciona team_member no contexto"""
        context = super().get_serializer_context()
        
        # Adicionar team_member se existir no request
        if hasattr(self.request, 'team_member'):
            context['team_member'] = self.request.team_member
        
        return context


class TenantFilterMixin:
    """
    Mixin que filtra automaticamente o queryset pelo tenant.
    Evita que usuários vejam dados de outros tenants.
    
    Uso:
        class FeedbackViewSet(TenantFilterMixin, viewsets.ModelViewSet):
            ...
    
    IMPORTANTE: O model deve ter um campo 'client' (FK para Client).
    """
    
    def get_queryset(self):
        """Filtra queryset pelo tenant"""
        queryset = super().get_queryset()
        tenant = getattr(self.request, 'tenant', None)
        
        if not tenant:
            # Se não houver tenant, retorna queryset vazio (segurança)
            return queryset.none()
        
        # Filtra pelo client (tenant)
        return queryset.filter(client=tenant)


class OwnerFilterMixin:
    """
    Mixin que filtra automaticamente pelo owner (usuário atual).
    Útil para resources que pertencem a um usuário específico.
    
    Uso:
        class MyNotificationsViewSet(OwnerFilterMixin, viewsets.ReadOnlyModelViewSet):
            owner_field = 'user'  # Nome do campo FK para User
    
    Atributos:
        owner_field (str): Nome do campo que referencia o usuário dono
    """
    owner_field = 'user'
    
    def get_queryset(self):
        """Filtra queryset pelo owner"""
        queryset = super().get_queryset()
        
        if not self.request.user.is_authenticated:
            return queryset.none()
        
        # Filtra pelo campo owner
        filter_kwargs = {self.owner_field: self.request.user}
        return queryset.filter(**filter_kwargs)
