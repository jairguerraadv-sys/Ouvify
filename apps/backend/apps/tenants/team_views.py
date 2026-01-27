"""
Views para gerenciamento de equipes e convites.
APIs completas para multi-user system com roles e permissões.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import TeamMember, TeamInvitation
from .serializers import (
    TeamMemberSerializer,
    TeamInvitationSerializer,
    AcceptInvitationSerializer
)
from .mixins import PermissionRequiredMixin, TenantFilterMixin
from .decorators import require_permission


class TeamMemberViewSet(PermissionRequiredMixin, TenantFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar membros da equipe.
    
    Endpoints:
        GET    /api/team/members/              - Listar membros
        GET    /api/team/members/{id}/         - Detalhe de membro
        PATCH  /api/team/members/{id}/         - Atualizar role
        DELETE /api/team/members/{id}/         - Remover membro
        POST   /api/team/members/{id}/suspend/ - Suspender
        POST   /api/team/members/{id}/activate/- Reativar
        GET    /api/team/members/stats/        - Estatísticas da equipe
    """
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    required_permissions = {
        'list': 'view_analytics',  # Todos podem ver a equipe
        'retrieve': 'view_analytics',
        'update': 'manage_team',
        'partial_update': 'manage_team',
        'destroy': 'manage_team',
    }
    
    def get_queryset(self):
        """Retorna membros do tenant atual com eager loading"""
        return TeamMember.objects.filter(
            client=self.request.tenant
        ).select_related('user', 'invited_by').order_by('-invited_at')
    
    def update(self, request, *args, **kwargs):
        """Atualiza role do membro (PATCH)"""
        member = self.get_object()
        
        # Validar se pode gerenciar este membro
        if not request.team_member.can_manage_member(member):
            return Response(
                {'detail': 'Você não tem permissão para editar este membro'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Não pode alterar OWNER
        if member.role == TeamMember.OWNER:
            return Response(
                {'detail': 'Não é possível alterar o proprietário. Use transferência de propriedade.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Remove membro da equipe (soft delete)"""
        member = self.get_object()
        
        # Validar permissões
        if not request.team_member.can_manage_member(member):
            return Response(
                {'detail': 'Você não tem permissão para remover este membro'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Não pode remover OWNER
        if member.role == TeamMember.OWNER:
            return Response(
                {'detail': 'Não é possível remover o proprietário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Não pode se remover
        if member.user == request.user:
            return Response(
                {'detail': 'Você não pode remover a si mesmo. Peça a outro administrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remover (soft delete)
        member.remove(removed_by=request.user)
        
        return Response(
            {'detail': 'Membro removido com sucesso'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def suspend(self, request, pk=None):
        """Suspende membro da equipe"""
        member = self.get_object()
        
        if not request.team_member.can_manage_member(member):
            return Response(
                {'detail': 'Você não tem permissão para suspender este membro'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if member.role == TeamMember.OWNER:
            return Response(
                {'detail': 'Não é possível suspender o proprietário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.suspend(suspended_by=request.user)
        
        return Response({
            'detail': 'Membro suspenso com sucesso',
            'member': TeamMemberSerializer(member).data
        })
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def activate(self, request, pk=None):
        """Reativa membro suspenso"""
        member = self.get_object()
        
        if not request.team_member.can_manage_member(member):
            return Response(
                {'detail': 'Você não tem permissão para reativar este membro'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if member.status != TeamMember.SUSPENDED:
            return Response(
                {'detail': 'Apenas membros suspensos podem ser reativados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.activate()
        
        return Response({
            'detail': 'Membro reativado com sucesso',
            'member': TeamMemberSerializer(member).data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas da equipe"""
        tenant = request.tenant
        members = TeamMember.objects.filter(client=tenant)
        
        stats = {
            'total_members': members.count(),
            'active_members': members.filter(status=TeamMember.ACTIVE).count(),
            'suspended_members': members.filter(status=TeamMember.SUSPENDED).count(),
            'removed_members': members.filter(status=TeamMember.REMOVED).count(),
            'members_by_role': {
                'owner': members.filter(role=TeamMember.OWNER, status=TeamMember.ACTIVE).count(),
                'admin': members.filter(role=TeamMember.ADMIN, status=TeamMember.ACTIVE).count(),
                'moderator': members.filter(role=TeamMember.MODERATOR, status=TeamMember.ACTIVE).count(),
                'viewer': members.filter(role=TeamMember.VIEWER, status=TeamMember.ACTIVE).count(),
            },
            'team_limit': tenant.get_team_members_limit(),
            'current_count': tenant.get_active_team_members_count(),
            'team_usage_percentage': tenant.get_team_usage_percentage(),
            'can_add_members': tenant.can_add_team_member(),
            'plan': tenant.get_plano_display(),
        }
        
        return Response(stats)


class TeamInvitationViewSet(PermissionRequiredMixin, TenantFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar convites de equipe.
    
    Endpoints:
        POST   /api/team/invitations/          - Criar convite
        GET    /api/team/invitations/          - Listar convites
        DELETE /api/team/invitations/{id}/     - Revogar convite
        POST   /api/team/invitations/accept/   - Aceitar convite (público)
        POST   /api/team/invitations/{id}/resend/ - Reenviar email
    """
    serializer_class = TeamInvitationSerializer
    permission_classes = [IsAuthenticated]
    
    required_permissions = {
        'list': 'view_analytics',  # Todos podem ver convites
        'create': 'manage_team',   # Apenas Admin+ pode convidar
        'destroy': 'manage_team',  # Apenas Admin+ pode revogar
    }
    
    def get_queryset(self):
        """Retorna convites do tenant atual"""
        return TeamInvitation.objects.filter(
            client=self.request.tenant
        ).select_related('invited_by').order_by('-created_at')
    
    def get_serializer_context(self):
        """Adiciona client no contexto do serializer"""
        context = super().get_serializer_context()
        context['client'] = self.request.tenant
        return context
    
    def perform_create(self, serializer):
        """Cria convite e envia email automaticamente"""
        invitation = serializer.save(
            client=self.request.tenant,
            invited_by=self.request.user
        )
        
        # Enviar email de convite
        self.send_invitation_email(invitation)
    
    def send_invitation_email(self, invitation):
        """
        Envia email de convite com link único.
        Usa template HTML para melhor apresentação.
        """
        invite_url = f"https://{invitation.client.subdominio}.ouvy.com/convite/{invitation.token}"
        
        # Template context
        context = {
            'invitation': invitation,
            'invite_url': invite_url,
            'company_name': invitation.client.nome,
            'invited_by_name': invitation.invited_by.get_full_name() or invitation.invited_by.username,
            'role_display': invitation.get_role_display(),
            'expires_days': 7,
        }
        
        # Renderizar template HTML
        html_message = render_to_string('emails/team_invitation.html', context)
        
        # Texto plano (fallback)
        text_message = f"""
Olá!

{context['invited_by_name']} convidou você para fazer parte da equipe {context['company_name']} no Ouvy.

Cargo: {context['role_display']}

Aceite o convite clicando no link abaixo:
{invite_url}

Este convite expira em 7 dias.

Se você não estava esperando este convite, pode ignorar este email.

---
Ouvy - Gestão de Feedbacks White Label
        """
        
        try:
            send_mail(
                subject=f"🎉 Convite para {invitation.client.nome} no Ouvy",
                message=text_message.strip(),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@ouvy.com'),
                recipient_list=[invitation.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            # Log erro mas não falha a criação do convite
            print(f"[ERROR] Falha ao enviar email de convite: {e}")
            # Em produção, use logging adequado:
            # logger.error(f"Falha ao enviar convite para {invitation.email}: {e}")
    
    def destroy(self, request, *args, **kwargs):
        """Revoga convite (muda status para REVOKED)"""
        invitation = self.get_object()
        
        # Verificar se convite ainda é pendente
        if invitation.status != TeamInvitation.PENDING:
            return Response(
                {'detail': f'Convite já está {invitation.get_status_display().lower()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invitation.revoke()
        
        return Response(
            {'detail': 'Convite revogado com sucesso'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def resend(self, request, pk=None):
        """Reenvia email de convite"""
        invitation = self.get_object()
        
        # Validar status
        if invitation.status != TeamInvitation.PENDING:
            return Response(
                {'detail': 'Apenas convites pendentes podem ser reenviados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar expiração
        if invitation.is_expired:
            return Response(
                {'detail': 'Convite expirado. Crie um novo convite.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reenviar email
        self.send_invitation_email(invitation)
        
        return Response({
            'detail': 'Email reenviado com sucesso',
            'invitation': TeamInvitationSerializer(invitation).data
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def accept(self, request):
        """
        Aceita convite e cria TeamMember.
        Endpoint público (sem autenticação).
        Retorna JWT tokens para login automático.
        """
        serializer = AcceptInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Aceitar convite (cria user + team member)
        result = serializer.save()
        user = result['user']
        team_member = result['team_member']
        invitation = result['invitation']
        
        # Gerar JWT tokens para login automático
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Convite aceito com sucesso! Bem-vindo à equipe.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name(),
            },
            'team_member': {
                'id': team_member.id,
                'role': team_member.role,
                'role_display': team_member.get_role_display(),
            },
            'tenant': {
                'id': invitation.client.id,
                'name': invitation.client.nome,
                'subdomain': invitation.client.subdominio,
            }
        }, status=status.HTTP_201_CREATED)
