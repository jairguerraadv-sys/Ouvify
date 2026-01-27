from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from .models import Client, TeamMember, TeamInvitation
from apps.core.validators import validate_subdomain, validate_strong_password
from apps.core.utils import is_reserved_subdomain
import re


class ClientPublicSerializer(serializers.ModelSerializer):
    """
    Serializer público para informações do tenant.
    Retorna apenas dados seguros e necessários para o frontend.
    """
    class Meta:
        model = Client
        fields = [
            'nome', 
            'subdominio', 
            'cor_primaria', 
            'cor_secundaria',
            'cor_texto',
            'logo',
            'favicon',
            'fonte_customizada'
        ]
        # Todos os campos são apenas leitura (read-only)


class RegisterTenantSerializer(serializers.Serializer):
    """
    Serializer para registro de novo tenant (empresa) + usuário proprietário.
    """
    # Dados do Usuário
    nome = serializers.CharField(max_length=150, help_text="Nome completo do usuário")
    email = serializers.EmailField(help_text="Email corporativo")
    senha = serializers.CharField(
        write_only=True, 
        min_length=8,
        help_text="Senha (mínimo 8 caracteres)"
    )
    
    # Dados da Empresa
    nome_empresa = serializers.CharField(max_length=100, help_text="Nome da empresa")
    subdominio_desejado = serializers.SlugField(
        max_length=63,
        help_text="Subdomínio desejado (ex: minhaempresa)"
    )
    
    def validate_email(self, value):
        """Verifica se o email já está em uso e valida domínio."""
        value = value.lower().strip()
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        
        # Validação básica de formato
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Formato de email inválido.")
        
        # Validar contra domínios temporários/descartáveis
        disposable_domains = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org',
            'fakeinbox.com', 'yopmail.com', 'maildrop.cc'
        ]
        domain = value.split('@')[1].lower()
        if domain in disposable_domains:
            raise serializers.ValidationError(
                "Email temporário não permitido. Use um email permanente."
            )
        
        return value
    
    def validate_subdominio_desejado(self, value):
        """Valida o formato e disponibilidade do subdomínio."""
        value = value.lower().strip()
        
        # Usar validator do core
        try:
            validate_subdomain(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        # Verificar se já existe
        if Client.objects.filter(subdominio=value).exists():
            raise serializers.ValidationError("Este subdomínio já está em uso.")
        
        return value
    
    def validate_senha(self, value):
        """Valida a força da senha usando validator do core."""
        try:
            validate_strong_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value
    
    def validate_nome(self, value):
        """Valida o nome do usuário."""
        value = value.strip()
        
        if len(value) < 3:
            raise serializers.ValidationError("Nome deve ter no mínimo 3 caracteres.")
        
        # Verificar se tem pelo menos nome e sobrenome
        parts = value.split()
        if len(parts) < 2:
            raise serializers.ValidationError("Por favor, informe nome e sobrenome.")
        
        return value
    
    def validate_nome_empresa(self, value):
        """Valida o nome da empresa."""
        value = value.strip()
        
        if len(value) < 3:
            raise serializers.ValidationError("Nome da empresa deve ter no mínimo 3 caracteres.")
        
        return value


class ClientSerializer(serializers.ModelSerializer):
    """Serializer para retornar dados do tenant."""
    
    class Meta:
        model = Client
        fields = ['id', 'nome', 'subdominio', 'logo', 'cor_primaria', 'cor_secundaria', 'cor_texto', 'favicon', 'fonte_customizada', 'data_criacao']
        read_only_fields = ['id', 'data_criacao']


class ClientBrandingSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de branding do tenant.
    Permite atualizar apenas campos de white label.
    """
    class Meta:
        model = Client
        fields = [
            'logo',
            'cor_primaria',
            'cor_secundaria',
            'cor_texto',
            'fonte_customizada',
            'favicon'
        ]
        
    def validate_cor_primaria(self, value):
        """Valida formato hexadecimal da cor primária."""
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError("Cor deve estar no formato hexadecimal (ex: #3B82F6)")
        return value
    
    def validate_cor_secundaria(self, value):
        """Valida formato hexadecimal da cor secundária."""
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError("Cor deve estar no formato hexadecimal (ex: #10B981)")
        return value
    
    def validate_cor_texto(self, value):
        """Valida formato hexadecimal da cor de texto."""
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError("Cor deve estar no formato hexadecimal (ex: #1F2937)")
        return value
    
    def validate_logo(self, value):
        """Valida URL da logo."""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("URL da logo deve começar com http:// ou https://")
        return value
    
    def validate_favicon(self, value):
        """Valida URL do favicon."""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("URL do favicon deve começar com http:// ou https://")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Serializer para retornar dados do usuário."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']


class TenantAdminSerializer(serializers.ModelSerializer):
    """Serializer completo para administração de tenants."""
    
    # Campos calculados
    owner_email = serializers.SerializerMethodField()
    total_feedbacks = serializers.SerializerMethodField()
    total_users = serializers.SerializerMethodField()
    ultimo_login = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id',
            'nome',
            'subdominio',
            'ativo',
            'plano',
            'subscription_status',
            'stripe_customer_id',
            'stripe_subscription_id',
            'data_criacao',
            'data_atualizacao',
            'data_fim_assinatura',
            'logo',
            'cor_primaria',
            'cor_secundaria',
            'owner_email',
            'total_feedbacks',
            'total_users',
            'ultimo_login',
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao', 'stripe_customer_id', 'stripe_subscription_id']
    
    def get_owner_email(self, obj):
        """Retorna email do proprietário do tenant."""
        if obj.owner:
            return obj.owner.email
        return None
    
    def get_total_feedbacks(self, obj):
        """Retorna total de feedbacks do tenant."""
        from apps.feedbacks.models import Feedback
        return Feedback.objects.filter(client=obj).count()
    
    def get_total_users(self, obj):
        """Retorna total de usuários associados ao tenant."""
        from django.contrib.auth.models import User
        # Contar usuários que têm o owner como referência ou estão no tenant
        return User.objects.filter(tenants_owned=obj).count() or 1
    
    def get_ultimo_login(self, obj):
        """Retorna data do último login do owner."""
        if obj.owner and obj.owner.last_login:
            return obj.owner.last_login.isoformat()
        return None


class TenantActivityLogSerializer(serializers.Serializer):
    """Serializer para logs de atividade do tenant."""
    id = serializers.IntegerField()
    acao = serializers.CharField()
    descricao = serializers.CharField()
    data = serializers.DateTimeField()
    autor = serializers.CharField(allow_null=True)
    ip_address = serializers.CharField(allow_null=True)


# =============================================================================
# TEAM MANAGEMENT SERIALIZERS
# =============================================================================

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico do usuário (para nested relationships)"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id', 'username', 'email']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer para TeamMember com informações do usuário"""
    user = UserBasicSerializer(read_only=True)
    invited_by_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    can_be_managed = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'user', 'role', 'role_display', 'status', 'status_display',
            'invited_by', 'invited_by_name', 'invited_at', 'joined_at',
            'removed_at', 'can_be_managed',
        ]
        read_only_fields = ['id', 'invited_by', 'invited_at', 'joined_at', 'removed_at']
    
    def get_invited_by_name(self, obj):
        if obj.invited_by:
            return obj.invited_by.get_full_name() or obj.invited_by.username
        return None
    
    def get_can_be_managed(self, obj):
        """Verifica se o usuário atual pode gerenciar este membro"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'team_member'):
            return False
        return request.team_member.can_manage_member(obj)


class TeamInvitationSerializer(serializers.ModelSerializer):
    """Serializer para criar e listar convites"""
    invited_by_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    invite_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'email', 'role', 'role_display', 'status', 'status_display',
            'personal_message', 'token', 'invited_by', 'invited_by_name',
            'created_at', 'expires_at', 'accepted_at', 'is_valid', 'is_expired', 'invite_url',
        ]
        read_only_fields = ['id', 'token', 'invited_by', 'status', 'created_at', 'expires_at', 'accepted_at']
    
    def get_invited_by_name(self, obj):
        if obj.invited_by:
            return obj.invited_by.get_full_name() or obj.invited_by.username
        return None
    
    def get_invite_url(self, obj):
        return f"https://{obj.client.subdominio}.ouvy.com/convite/{obj.token}"
    
    def validate_email(self, value):
        validator = EmailValidator()
        validator(value)
        
        client = self.context.get('client')
        if client:
            if TeamMember.objects.filter(user__email=value, client=client, status=TeamMember.ACTIVE).exists():
                raise serializers.ValidationError("Este usuário já é membro da equipe")
            if TeamInvitation.objects.filter(email=value, client=client, status=TeamInvitation.PENDING).exists():
                raise serializers.ValidationError("Já existe um convite pendente para este email")
        
        return value.lower()
    
    def validate_role(self, value):
        if value == TeamMember.OWNER:
            raise serializers.ValidationError("Não é possível convidar como OWNER")
        return value
    
    def validate(self, attrs):
        client = self.context.get('client')
        if client and not client.can_add_team_member():
            limit = client.get_team_members_limit()
            raise serializers.ValidationError(
                f"Limite de membros atingido ({limit}). Faça upgrade para adicionar mais membros."
            )
        return attrs


class AcceptInvitationSerializer(serializers.Serializer):
    """Serializer para aceitar convite (público)"""
    token = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(required=True, write_only=True, min_length=8, style={'input_type': 'password'})
    
    def validate_token(self, value):
        try:
            invitation = TeamInvitation.objects.get(token=value)
            if not invitation.is_valid:
                raise serializers.ValidationError("Convite expirado ou já utilizado")
            self.context['invitation'] = invitation
            return value
        except TeamInvitation.DoesNotExist:
            raise serializers.ValidationError("Token inválido")
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não conferem'})
        return attrs
    
    def save(self):
        invitation = self.context['invitation']
        user, created = User.objects.get_or_create(
            email=invitation.email,
            defaults={
                'username': invitation.email,
                'first_name': self.validated_data['first_name'],
                'last_name': self.validated_data['last_name'],
            }
        )
        
        if created:
            user.set_password(self.validated_data['password'])
            user.save()
        
        team_member = invitation.accept(user)
        return {'user': user, 'team_member': team_member, 'invitation': invitation}

