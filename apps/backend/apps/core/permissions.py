"""
🔒 Permissions Customizadas para RBAC (Role-Based Access Control)

Este módulo implementa permissions baseadas em roles hierárquicas:
- OWNER: Proprietário do tenant (todos os poderes)
- ADMIN: Administrador (gerencia equipe + feedbacks)
- MODERATOR: Moderador (responde feedbacks)
- VIEWER: Visualizador (apenas leitura)

Criado em: 2026-02-05
Auditoria: AUDITORIA_SEGURANCA_2026-02-05.md (Correção de vulnerabilidade ALTA)
"""

import logging

from rest_framework import permissions

from apps.core.utils import get_current_tenant
from apps.tenants.models import TeamMember

logger = logging.getLogger(__name__)


class IsOwner(permissions.BasePermission):
    """
    Permission que permite acesso APENAS para usuários com role OWNER.
    
    Uso típico:
    - Deletar tenant
    - Transferir ownership
    - Mudanças de plano (billing)
    - Configurações críticas
    
    Exemplo:
        class TenantViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsOwner]
    """
    
    message = "Apenas o proprietário (OWNER) pode executar esta ação."
    
    def has_permission(self, request, view):
        """Verifica se usuário autenticado é OWNER do tenant atual"""
        if not request.user or not request.user.is_authenticated:
            logger.warning(
                f"⚠️ Tentativa de acesso OWNER sem autenticação | "
                f"Path: {request.path}"
            )
            return False
        
        tenant = get_current_tenant()
        
        if not tenant:
            logger.warning(
                f"⚠️ Tentativa de acesso OWNER sem tenant | "
                f"User: {request.user.email} | Path: {request.path}"
            )
            return False
        
        try:
            membership = TeamMember.objects.select_related('client').get(
                user=request.user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
            
            is_owner = membership.role == TeamMember.OWNER
            
            if not is_owner:
                logger.warning(
                    f"🚫 Acesso OWNER negado | "
                    f"User: {request.user.email} | "
                    f"Role: {membership.role} | "
                    f"Tenant: {tenant.nome} | "
                    f"Action: {view.__class__.__name__}.{view.action if hasattr(view, 'action') else 'unknown'}"
                )
            
            return is_owner
            
        except TeamMember.DoesNotExist:
            logger.warning(
                f"🚫 Usuário não é membro do tenant | "
                f"User: {request.user.email} | "
                f"Tenant: {tenant.nome} | "
                f"Path: {request.path}"
            )
            return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission que permite acesso para OWNER ou ADMIN.
    
    Uso típico:
    - Gerenciar membros da equipe
    - Convidar novos usuários
    - Modificar configurações do tenant
    - Ver analytics completas
    
    Exemplo:
        class TeamMemberViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    """
    
    message = "Apenas proprietários (OWNER) ou administradores (ADMIN) podem executar esta ação."
    
    def has_permission(self, request, view):
        """Verifica se usuário é OWNER ou ADMIN"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        
        if not tenant:
            return False
        
        try:
            membership = TeamMember.objects.select_related('client').get(
                user=request.user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
            
            is_allowed = membership.role in [TeamMember.OWNER, TeamMember.ADMIN]
            
            if not is_allowed:
                logger.warning(
                    f"🚫 Acesso OWNER/ADMIN negado | "
                    f"User: {request.user.email} | "
                    f"Role: {membership.role} | "
                    f"Tenant: {tenant.nome} | "
                    f"Action: {view.__class__.__name__}.{view.action if hasattr(view, 'action') else 'unknown'}"
                )
            
            return is_allowed
            
        except TeamMember.DoesNotExist:
            logger.warning(
                f"🚫 Usuário não é membro do tenant | "
                f"User: {request.user.email} | "
                f"Tenant: {tenant.nome}"
            )
            return False


class CanModifyFeedback(permissions.BasePermission):
    """
    Permission que permite modificar feedbacks baseado em role.
    
    LEITURA (SAFE_METHODS): GET, HEAD, OPTIONS
    - Todos os roles podem ler (OWNER, ADMIN, MODERATOR, VIEWER)
    
    ESCRITA: POST, PUT, PATCH, DELETE
    - OWNER, ADMIN, MODERATOR: Podem modificar
    - VIEWER: Apenas leitura
    
    Exemplo:
        class FeedbackViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, CanModifyFeedback]
    """
    
    message = "Visualizadores (VIEWER) não podem modificar feedbacks. Contate um administrador."
    
    def has_permission(self, request, view):
        """Verifica permissão no nível de view"""
        # Leitura é permitida para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Escrita requer autenticação
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        
        if not tenant:
            return False
        
        try:
            membership = TeamMember.objects.select_related('client').get(
                user=request.user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
            
            # OWNER, ADMIN, MODERATOR podem modificar
            # VIEWER apenas lê
            can_modify = membership.role in [
                TeamMember.OWNER,
                TeamMember.ADMIN,
                TeamMember.MODERATOR
            ]
            
            if not can_modify:
                logger.warning(
                    f"🚫 Tentativa de modificação por VIEWER | "
                    f"User: {request.user.email} | "
                    f"Tenant: {tenant.nome} | "
                    f"Method: {request.method} | "
                    f"Action: {view.__class__.__name__}.{view.action if hasattr(view, 'action') else 'unknown'}"
                )
            
            return can_modify
            
        except TeamMember.DoesNotExist:
            logger.warning(
                f"🚫 Usuário não é membro do tenant (modificação negada) | "
                f"User: {request.user.email} | "
                f"Tenant: {tenant.nome}"
            )
            return False
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica permissão no nível de objeto individual.
        
        Regras adicionais:
        - Feedback deve pertencer ao tenant do usuário (isolamento)
        - OWNER/ADMIN podem modificar QUALQUER feedback
        - MODERATOR apenas feedbacks não-interno ou atribuídos a ele
        """
        # Leitura permitida (já passou pelo has_permission)
        if request.method in permissions.SAFE_METHODS:
            # Garantir que feedback pertence ao tenant (não vazar entre tenants)
            tenant = get_current_tenant()
            if hasattr(obj, 'client'):
                if obj.client != tenant:
                    logger.error(
                        f"🚨 SEGURANÇA: Tentativa de acesso cross-tenant bloqueada | "
                        f"User: {request.user.email if request.user else 'anonymous'} | "
                        f"User Tenant: {tenant.nome if tenant else None} | "
                        f"Object Tenant: {obj.client.nome}"
                    )
                    return False
            return True
        
        # Para escrita, verificar role específica
        tenant = get_current_tenant()
        
        if not tenant:
            return False
        
        # Validar que objeto pertence ao tenant do usuário
        if hasattr(obj, 'client'):
            if obj.client != tenant:
                logger.error(
                    f"🚨 SEGURANÇA: Tentativa de modificação cross-tenant bloqueada | "
                    f"User: {request.user.email} | "
                    f"User Tenant: {tenant.nome} | "
                    f"Object Tenant: {obj.client.nome} | "
                    f"Method: {request.method}"
                )
                return False
        
        try:
            membership = TeamMember.objects.get(
                user=request.user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
            
            # OWNER e ADMIN: acesso total
            if membership.role in [TeamMember.OWNER, TeamMember.ADMIN]:
                return True
            
            # MODERATOR: regras especiais
            if membership.role == TeamMember.MODERATOR:
                # Se feedback tem flag 'interno', apenas OWNER/ADMIN
                if hasattr(obj, 'interno') and obj.interno:
                    logger.warning(
                        f"🚫 MODERATOR tentou acessar feedback interno | "
                        f"User: {request.user.email} | "
                        f"Feedback ID: {obj.pk if hasattr(obj, 'pk') else 'unknown'}"
                    )
                    return False
                
                # Se feedback tem atribuição, apenas usuário atribuído ou OWNER/ADMIN
                if hasattr(obj, 'atribuido_para') and obj.atribuido_para:
                    if obj.atribuido_para != request.user:
                        logger.warning(
                            f"🚫 MODERATOR tentou modificar feedback de outro user | "
                            f"User: {request.user.email} | "
                            f"Atribuído para: {obj.atribuido_para.email}"
                        )
                        return False
                
                # Caso contrário, MODERATOR pode modificar
                return True
            
            # VIEWER: bloqueado (já deveria ter sido bloqueado em has_permission)
            logger.warning(
                f"🚫 VIEWER tentou modificar objeto | "
                f"User: {request.user.email}"
            )
            return False
            
        except TeamMember.DoesNotExist:
            return False


class Requires2FAForSensitiveOperation(permissions.BasePermission):
    """
    Permission que exige 2FA habilitado E verificado recentemente
    para operações sensíveis.
    
    Operações sensíveis:
    - Deletar conta
    - Alterar senha
    - Transferir ownership
    - Mudar role de membros
    - Cancelar assinatura
    
    Requisitos:
    1. Usuário deve ter 2FA habilitado (userprofile.two_factor_enabled)
    2. Deve ter verificado 2FA nos últimos 15 minutos (session timestamp)
    
    Exemplo:
        class DeleteAccountView(APIView):
            permission_classes = [IsAuthenticated, Requires2FAForSensitiveOperation]
    """
    
    message = (
        "Esta operação sensível requer autenticação de dois fatores (2FA). "
        "Habilite 2FA em Configurações > Segurança e verifique seu código."
    )
    
    def has_permission(self, request, view):
        """Verifica se 2FA está habilitado e foi verificado recentemente"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar se 2FA está habilitado
        user_profile = getattr(request.user, 'userprofile', None)
        
        if not user_profile:
            logger.error(
                f"🚨 UserProfile não encontrado | "
                f"User: {request.user.email}"
            )
            self.message = "Perfil de usuário não configurado corretamente."
            return False
        
        if not user_profile.two_factor_enabled:
            logger.warning(
                f"🚫 Operação sensível bloqueada: 2FA não habilitado | "
                f"User: {request.user.email} | "
                f"Action: {view.__class__.__name__}.{view.action if hasattr(view, 'action') else 'unknown'}"
            )
            return False
        
        # Verificar timestamp de última verificação 2FA
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        last_2fa_verify = request.session.get('last_2fa_verify_timestamp')
        
        if not last_2fa_verify:
            logger.warning(
                f"🚫 Operação sensível bloqueada: 2FA não verificado nesta sessão | "
                f"User: {request.user.email}"
            )
            self.message = (
                "Por segurança, verifique seu código 2FA antes desta operação. "
                "POST /api/auth/2fa/verify/"
            )
            return False
        
        try:
            last_verify_time = datetime.fromisoformat(last_2fa_verify)
            time_since_verify = timezone.now() - last_verify_time
            
            # Exigir re-verificação se passou mais de 15 minutos
            if time_since_verify > timedelta(minutes=15):
                logger.warning(
                    f"🚫 Operação sensível bloqueada: verificação 2FA expirada | "
                    f"User: {request.user.email} | "
                    f"Última verificação: {time_since_verify.total_seconds()//60:.0f} min atrás"
                )
                self.message = (
                    "Sua verificação 2FA expirou (15 minutos). "
                    "Verifique novamente seu código 2FA."
                )
                return False
            
            # 2FA válido e recente
            logger.info(
                f"✅ Operação sensível autorizada com 2FA | "
                f"User: {request.user.email} | "
                f"Action: {view.__class__.__name__}"
            )
            return True
            
        except (ValueError, TypeError) as e:
            logger.error(
                f"🚨 Erro ao validar timestamp 2FA | "
                f"User: {request.user.email} | "
                f"Erro: {e}"
            )
            self.message = "Erro ao validar autenticação 2FA. Tente novamente."
            return False
