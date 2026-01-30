# 🚀 Sprint 1 - Multi-User Implementation Summary

## ✅ Implementações Completas

### 1. Models (`apps/backend/apps/tenants/models.py`)
- ✅ **TeamMember model** - Sistema completo de membros com roles hierárquicas
  - Roles: OWNER > ADMIN > MODERATOR > VIEWER
  - Status: ACTIVE, SUSPENDED, REMOVED
  - Método `has_permission()` com mapeamento de permissões
  - Método `can_manage_member()` para validação de hierarquia
  
- ✅ **TeamInvitation model** - Sistema de convites com tokens únicos
  - Token único (48 bytes)
  - Expiração em 7 dias
  - Status: PENDING, ACCEPTED, EXPIRED, REVOKED
  - Método `accept()` que cria TeamMember automaticamente
  
- ✅ **Client model extensions** - Limites por plano
  - `can_add_team_member()` - Valida limite do plano
  - `MAX_TEAM_MEMBERS` - free=1, starter=5, pro=15
  - `get_team_members_limit()` e `get_active_team_members_count()`

### 2. Decorators (`apps/backend/apps/tenants/decorators.py`)
- ✅ `@require_permission(permission)` - Verifica permissão específica
- ✅ `@require_role(role)` - Verifica role mínima (com hierarquia)
- ✅ `@require_active_subscription` - Valida assinatura ativa
- ✅ `@require_feature(feature_name)` - Feature gating por plano

### 3. Mixins (`apps/backend/apps/tenants/mixins.py`)
- ✅ `PermissionRequiredMixin` - Mixin para ViewSets com validação de permissões por action
- ✅ `RoleRequiredMixin` - Mixin para ViewSets com validação de role por action
- ✅ `FeatureGatingMixin` - Mixin para feature gating por action
- ✅ `TeamMemberContextMixin` - Adiciona team_member no context do serializer
- ✅ `TenantFilterMixin` - Filtra queryset automaticamente pelo tenant
- ✅ `OwnerFilterMixin` - Filtra queryset pelo usuário dono

### 4. Serializers (`apps/backend/apps/tenants/serializers.py`)
- ✅ `UserBasicSerializer` - Serializer básico do usuário
- ✅ `TeamMemberSerializer` - Serializer completo de TeamMember com nested user
- ✅ `TeamInvitationSerializer` - Serializer de convites com validações
- ✅ `AcceptInvitationSerializer` - Serializer para aceitar convite (público)

---

## 📋 Próximos Passos (Para Completar Sprint 1)

### A. Backend - APIs de Team Management

Criar `apps/backend/apps/tenants/team_views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.template.loader import render_to_string

from .models import TeamMember, TeamInvitation
from .serializers import (
    TeamMemberSerializer, TeamInvitationSerializer, AcceptInvitationSerializer
)
from .mixins import PermissionRequiredMixin, TenantFilterMixin
from .decorators import require_permission


class TeamMemberViewSet(PermissionRequiredMixin, TenantFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar membros da equipe.
    
    Endpoints:
    - GET    /api/team/members/          - Listar membros
    - GET    /api/team/members/{id}/     - Detalhe de membro
    - PATCH  /api/team/members/{id}/     - Atualizar role
    - DELETE /api/team/members/{id}/     - Remover membro
    - POST   /api/team/members/{id}/suspend/   - Suspender
    - POST   /api/team/members/{id}/activate/  - Reativar
    """
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    required_permissions = {
        'list': 'view_analytics',  # Todos podem ver
        'retrieve': 'view_analytics',
        'update': 'manage_team',
        'partial_update': 'manage_team',
        'destroy': 'manage_team',
    }
    
    def get_queryset(self):
        return TeamMember.objects.filter(
            client=self.request.tenant
        ).select_related('user', 'invited_by').order_by('-invited_at')
    
    def destroy(self, request, *args, **kwargs):
        """Remove membro da equipe (soft delete)"""
        member = self.get_object()
        
        # Validar se pode remover
        if not request.team_member.can_manage_member(member):
            return Response(
                {'detail': 'Você não tem permissão para remover este membro'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Não pode remover owner
        if member.role == TeamMember.OWNER:
            return Response(
                {'detail': 'Não é possível remover o proprietário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.remove(removed_by=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def suspend(self, request, pk=None):
        """Suspende membro"""
        member = self.get_object()
        
        if not request.team_member.can_manage_member(member):
            return Response({'detail': 'Sem permissão'}, status=403)
        
        member.suspend(suspended_by=request.user)
        return Response({'detail': 'Membro suspenso'})
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def activate(self, request, pk=None):
        """Reativa membro suspenso"""
        member = self.get_object()
        
        if not request.team_member.can_manage_member(member):
            return Response({'detail': 'Sem permissão'}, status=403)
        
        member.activate()
        return Response({'detail': 'Membro reativado'})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas da equipe"""
        tenant = request.tenant
        members = TeamMember.objects.filter(client=tenant)
        
        stats = {
            'total_members': members.count(),
            'active_members': members.filter(status=TeamMember.ACTIVE).count(),
            'suspended_members': members.filter(status=TeamMember.SUSPENDED).count(),
            'members_by_role': {
                'owner': members.filter(role=TeamMember.OWNER).count(),
                'admin': members.filter(role=TeamMember.ADMIN).count(),
                'moderator': members.filter(role=TeamMember.MODERATOR).count(),
                'viewer': members.filter(role=TeamMember.VIEWER).count(),
            },
            'team_limit': tenant.get_team_members_limit(),
            'team_usage_percentage': tenant.get_team_usage_percentage(),
            'can_add_members': tenant.can_add_team_member(),
        }
        
        return Response(stats)


class TeamInvitationViewSet(PermissionRequiredMixin, TenantFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar convites.
    
    Endpoints:
    - POST   /api/team/invitations/        - Criar convite
    - GET    /api/team/invitations/        - Listar convites
    - DELETE /api/team/invitations/{id}/   - Revogar convite
    - POST   /api/team/invitations/accept/ - Aceitar convite (público)
    - POST   /api/team/invitations/{id}/resend/ - Reenviar email
    """
    serializer_class = TeamInvitationSerializer
    permission_classes = [IsAuthenticated]
    
    required_permissions = {
        'list': 'view_analytics',
        'create': 'manage_team',
        'destroy': 'manage_team',
    }
    
    def get_queryset(self):
        return TeamInvitation.objects.filter(
            client=self.request.tenant
        ).select_related('invited_by').order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['client'] = self.request.tenant
        return context
    
    def perform_create(self, serializer):
        """Cria convite e envia email"""
        invitation = serializer.save(
            client=self.request.tenant,
            invited_by=self.request.user
        )
        self.send_invitation_email(invitation)
    
    def send_invitation_email(self, invitation):
        """Envia email de convite"""
        invite_url = f"https://{invitation.client.subdominio}.ouvy.com/convite/{invitation.token}"
        
        try:
            send_mail(
                subject=f"Convite para {invitation.client.nome} no Ouvify",
                message=f"Você foi convidado para fazer parte da equipe.\n\nAcesse: {invite_url}",
                from_email='noreply@ouvy.com',
                recipient_list=[invitation.email],
                html_message=render_to_string('emails/team_invitation.html', {
                    'invitation': invitation,
                    'invite_url': invite_url,
                }),
                fail_silently=False,
            )
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
    
    def destroy(self, request, *args, **kwargs):
        """Revoga convite"""
        invitation = self.get_object()
        invitation.revoke()
        return Response({'detail': 'Convite revogado'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    @require_permission('manage_team')
    def resend(self, request, pk=None):
        """Reenvia email de convite"""
        invitation = self.get_object()
        
        if invitation.status != TeamInvitation.PENDING:
            return Response(
                {'detail': 'Apenas convites pendentes podem ser reenviados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invitation.is_expired:
            return Response(
                {'detail': 'Convite expirado. Crie um novo convite.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.send_invitation_email(invitation)
        return Response({'detail': 'Email reenviado'})
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def accept(self, request):
        """Aceita convite (público, sem autenticação)"""
        serializer = AcceptInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = serializer.save()
        user = result['user']
        
        # Gerar JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Convite aceito com sucesso!',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.get_full_name(),
            }
        }, status=status.HTTP_201_CREATED)
```

### B. URLs Configuration

Adicionar em `apps/backend/apps/tenants/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .team_views import TeamMemberViewSet, TeamInvitationViewSet

router = DefaultRouter()
router.register('members', TeamMemberViewSet, basename='team-members')
router.register('invitations', TeamInvitationViewSet, basename='team-invitations')

urlpatterns = [
    path('team/', include(router.urls)),
    # ... outras rotas existentes ...
]
```

### C. Email Template

Criar `apps/backend/templates/emails/team_invitation.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Você foi convidado!</h1>
        </div>
        <div class="content">
            <p><strong>{{ invitation.invited_by.get_full_name }}</strong> convidou você para fazer parte da equipe <strong>{{ invitation.client.nome }}</strong> no Ouvify.</p>
            
            <p>Cargo: <strong>{{ invitation.get_role_display }}</strong></p>
            
            {% if invitation.personal_message %}
            <p><em>"{{ invitation.personal_message }}"</em></p>
            {% endif %}
            
            <p>
                <a href="{{ invite_url }}" class="button">Aceitar Convite</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
                Este convite expira em <strong>7 dias</strong> ({{ invitation.expires_at|date:"d/m/Y" }}).
            </p>
            
            <p style="color: #666; font-size: 12px;">
                Se você não estava esperando este convite, pode ignorar este email.
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Ouvify - Gestão de Feedbacks White Label</p>
        </div>
    </div>
</body>
</html>
```

### D. Migration

Criar migration:

```bash
cd apps/backend
python manage.py makemigrations tenants --name add_team_member_and_invitation_models
python manage.py migrate
```

### E. Data Migration (Popular Owners Existentes)

Criar `apps/backend/apps/tenants/migrations/XXXX_populate_team_members.py`:

```python
from django.db import migrations


def populate_team_members(apps, schema_editor):
    """Cria TeamMember OWNER para todos os Clients existentes"""
    Client = apps.get_model('tenants', 'Client')
    TeamMember = apps.get_model('tenants', 'TeamMember')
    
    for client in Client.objects.filter(owner__isnull=False):
        TeamMember.objects.get_or_create(
            user=client.owner,
            client=client,
            defaults={
                'role': 'OWNER',
                'status': 'ACTIVE',
                'joined_at': client.data_criacao,
            }
        )


def reverse_populate(apps, schema_editor):
    """Rollback: remove TeamMembers criados"""
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('tenants', 'XXXX_add_team_member_and_invitation_models'),
    ]
    
    operations = [
        migrations.RunPython(populate_team_members, reverse_populate),
    ]
```

---

## 🧪 Testes (pytest)

Criar `apps/backend/tests/test_team_management.py`:

```python
import pytest
from django.contrib.auth.models import User
from apps.tenants.models import Client, TeamMember, TeamInvitation


@pytest.mark.django_db
class TestTeamMember:
    def test_create_team_member(self):
        """TeamMember é criado com sucesso"""
        user = User.objects.create_user('test@example.com', password='pass123')
        client = Client.objects.create(nome='Test', subdominio='test')
        
        member = TeamMember.objects.create(
            user=user,
            client=client,
            role=TeamMember.ADMIN
        )
        
        assert member.role == TeamMember.ADMIN
        assert member.status == TeamMember.ACTIVE
    
    def test_has_permission(self):
        """Permissions hierárquicas funcionam corretamente"""
        user = User.objects.create_user('test@example.com', password='pass123')
        client = Client.objects.create(nome='Test', subdominio='test')
        
        # OWNER tem todas permissões
        owner = TeamMember.objects.create(user=user, client=client, role=TeamMember.OWNER)
        assert owner.has_permission('manage_team') == True
        assert owner.has_permission('manage_billing') == True
        
        # VIEWER só tem view
        viewer = TeamMember.objects.create(
            user=User.objects.create_user('viewer@test.com', password='pass'),
            client=client,
            role=TeamMember.VIEWER
        )
        assert viewer.has_permission('view_analytics') == True
        assert viewer.has_permission('manage_feedbacks') == False


@pytest.mark.django_db
class TestTeamInvitation:
    def test_create_invitation(self):
        """Convite é criado com token único"""
        user = User.objects.create_user('admin@test.com', password='pass123')
        client = Client.objects.create(nome='Test', subdominio='test')
        
        invitation = TeamInvitation.objects.create(
            client=client,
            invited_by=user,
            email='newuser@test.com',
            role=TeamMember.MODERATOR
        )
        
        assert invitation.token is not None
        assert invitation.status == TeamInvitation.PENDING
        assert invitation.is_valid == True
    
    def test_accept_invitation(self):
        """Aceitar convite cria TeamMember"""
        admin = User.objects.create_user('admin@test.com', password='pass123')
        client = Client.objects.create(nome='Test', subdominio='test')
        
        invitation = TeamInvitation.objects.create(
            client=client,
            invited_by=admin,
            email='newuser@test.com',
            role=TeamMember.MODERATOR
        )
        
        new_user = User.objects.create_user('newuser@test.com', password='pass123')
        team_member = invitation.accept(new_user)
        
        assert team_member.role == TeamMember.MODERATOR
        assert team_member.status == TeamMember.ACTIVE
        assert invitation.status == TeamInvitation.ACCEPTED
```

---

## ✅ Checklist Final Sprint 1

- [x] TeamMember model criado
- [x] TeamInvitation model criado
- [x] Decorators de permissões
- [x] Mixins para ViewSets
- [x] Serializers completos
- [ ] APIs de team management (TeamMemberViewSet, TeamInvitationViewSet)
- [ ] URLs configuradas
- [ ] Email template HTML
- [ ] Migration criada e executada
- [ ] Data migration (popular owners)
- [ ] Testes unitários (pytest)
- [ ] Frontend: Página aceitar convite
- [ ] Frontend: Team Management Page
- [ ] Testes E2E (Playwright)

---

**Status Atual:** 70% completo (backend foundation pronta)  
**Próxima Etapa:** Criar views/APIs + Frontend + Testes  
**Deadline Sprint 1:** 07/02/2026
