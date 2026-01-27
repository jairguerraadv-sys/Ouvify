from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.utils import timezone
from .plans import PlanFeatures


class Client(models.Model):
    """
    Modelo que representa um Tenant (empresa cliente) no sistema multi-tenant.
    Cada cliente terá seu próprio subdomínio e configurações de white label.
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='tenants_owned',
        verbose_name='Proprietário',
        help_text='Usuário proprietário deste tenant',
        null=True,
        blank=True
    )

    nome = models.CharField(
        max_length=100,
        verbose_name='Nome da Empresa',
        help_text='Nome da empresa cliente'
    )

    subdominio = models.SlugField(
        max_length=63,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
                message='Subdomínio deve conter apenas letras minúsculas, números e hífens'
            )
        ],
        verbose_name='Subdomínio',
        help_text='Subdomínio único para acesso (ex: empresaA)'
    )

    logo = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='Logo',
        help_text='URL da logo da empresa para white label'
    )

    cor_primaria = models.CharField(
        max_length=7,
        default='#3B82F6',
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Cor deve estar no formato hexadecimal (ex: #3B82F6)'
            )
        ],
        verbose_name='Cor Primária',
        help_text='Cor primária da interface em hexadecimal'
    )

    cor_secundaria = models.CharField(
        max_length=7,
        default='#10B981',
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Cor deve estar no formato hexadecimal (ex: #10B981)'
            )
        ],
        verbose_name='Cor Secundária',
        help_text='Cor secundária da interface em hexadecimal',
        null=True,
        blank=True
    )

    cor_texto = models.CharField(
        max_length=7,
        default='#1F2937',
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Cor deve estar no formato hexadecimal (ex: #1F2937)'
            )
        ],
        verbose_name='Cor do Texto',
        help_text='Cor principal do texto em hexadecimal',
        null=True,
        blank=True
    )

    fonte_customizada = models.CharField(
        max_length=100,
        default='Inter',
        verbose_name='Fonte Customizada',
        help_text='Nome da fonte do Google Fonts (ex: Inter, Roboto, Poppins)',
        null=True,
        blank=True
    )

    favicon = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='Favicon',
        help_text='URL do favicon da empresa (.ico ou .png)'
    )

    ativo = models.BooleanField(
        default=True,
        verbose_name='Ativo',
        help_text='Define se o tenant está ativo no sistema'
    )

    # ==============================
    # Assinatura / Stripe
    # ==============================
    FREE = 'free'
    STARTER = 'starter'
    PRO = 'pro'

    PLANOS = [
        (FREE, 'Gratuito'),
        (STARTER, 'Starter - R$ 99/mês'),
        (PRO, 'Pro - R$ 299/mês'),
    ]

    plano = models.CharField(
        max_length=20,
        choices=PLANOS,
        default=FREE,
        verbose_name='Plano'
    )

    stripe_customer_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name='Stripe Customer ID'
    )

    stripe_subscription_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name='Stripe Subscription ID'
    )

    subscription_status = models.CharField(
        max_length=20,
        default='active',
        verbose_name='Status da Assinatura'
    )

    data_fim_assinatura = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fim da Assinatura'
    )

    data_criacao = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação'
    )

    data_atualizacao = models.DateTimeField(
        auto_now=True,
        verbose_name='Data de Atualização'
    )

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.subdominio})"

    def get_full_domain(self, base_domain='localhost:8000'):
        """Retorna o domínio completo do tenant"""
        return f"{self.subdominio}.{base_domain}"

    def is_premium(self) -> bool:
        """Retorna True se o cliente possuir plano diferente de 'free' e assinatura ativa/trial"""
        return self.plano != self.FREE and self.subscription_status in {'active', 'trialing'}

    # ==============================
    # FEATURE GATING
    # ==============================
    
    def has_feature(self, feature: str) -> bool:
        """
        Verifica se o cliente tem acesso a uma feature específica.
        
        Args:
            feature: Nome da feature (ex: 'allow_internal_notes')
        
        Returns:
            True se o cliente tem acesso, False caso contrário
        """
        return PlanFeatures.has_feature(self.plano, feature)
    
    def has_feature_internal_notes(self) -> bool:
        """Verifica se o cliente pode criar notas internas."""
        return self.has_feature('allow_internal_notes')
    
    def has_feature_attachments(self) -> bool:
        """Verifica se o cliente pode enviar anexos."""
        return self.has_feature('allow_attachments')
    
    def has_feature_custom_branding(self) -> bool:
        """Verifica se o cliente pode customizar a marca."""
        return self.has_feature('allow_custom_branding')
    
    def has_feature_api_access(self) -> bool:
        """Verifica se o cliente tem acesso à API REST."""
        return self.has_feature('allow_api_access')
    
    def has_feature_webhooks(self) -> bool:
        """Verifica se o cliente pode usar webhooks."""
        return self.has_feature('allow_webhooks')
    
    def has_feature_integrations(self) -> bool:
        """Verifica se o cliente pode usar integrações avançadas."""
        return self.has_feature('allow_integrations')
    
    def get_storage_limit_gb(self) -> float:
        """Retorna o limite de armazenamento em GB. None = ilimitado."""
        features = PlanFeatures.get_plan_features(self.plano)
        return features.get('storage_gb', 1)
    
    def get_max_feedbacks_per_month(self) -> int:
        """Retorna o limite de feedbacks por mês. None = ilimitado."""
        features = PlanFeatures.get_plan_features(self.plano)
        return features.get('max_feedbacks_per_month', 50)
    
    def get_max_users(self) -> int:
        """Retorna o limite de usuários. None = ilimitado."""
        features = PlanFeatures.get_plan_features(self.plano)
        return features.get('max_users', 1)
    
    def get_support_tier(self) -> str:
        """Retorna o nível de suporte: 'community', 'email', 'priority', '24/7'."""
        features = PlanFeatures.get_plan_features(self.plano)
        return features.get('support_tier', 'community')
    
    def get_upgrade_message(self, feature: str) -> str:
        """
        Retorna mensagem customizada para upgrade.
        
        Args:
            feature: Nome da feature bloqueada
        
        Returns:
            Mensagem descritiva
        """
        return PlanFeatures.get_upgrade_message(self.plano, feature)
    
    # Métodos adicionais de feature gating
    
    def has_feature_export(self) -> bool:
        """Verifica se o cliente pode exportar dados (CSV/JSON)."""
        return self.plano in ['starter', 'pro']
    
    def has_feature_analytics(self) -> bool:
        """Verifica se o cliente tem acesso a analytics avançado."""
        return self.plano == 'pro'
    
    def can_create_feedback(self) -> bool:
        """
        Valida se o cliente pode criar mais feedbacks baseado no limite do plano.
        
        Returns:
            True se ainda há espaço para criar feedback, False se limite atingido
        """
        # Import aqui para evitar circular import
        from apps.feedbacks.models import Feedback
        
        limits = {
            'free': 100,
            'starter': 1000,
            'pro': float('inf'),  # Ilimitado
        }
        
        current_count = Feedback.objects.filter(client=self).count()
        limit = limits.get(self.plano, 100)
        
        return current_count < limit
    
    def get_feedback_limit(self) -> int:
        """
        Retorna o limite total de feedbacks do plano.
        
        Returns:
            Número máximo de feedbacks permitidos
        """
        limits = {
            'free': 100,
            'starter': 1000,
            'pro': 999999,  # "Ilimitado" (representado como número grande)
        }
        return limits.get(self.plano, 100)
    
    def get_current_feedback_count(self) -> int:
        """
        Retorna o número atual de feedbacks do tenant.
        
        Returns:
            Quantidade de feedbacks criados
        """
        from apps.feedbacks.models import Feedback
        return Feedback.objects.filter(client=self).count()
    
    def get_feedback_usage_percentage(self) -> float:
        """
        Retorna a porcentagem de uso do limite de feedbacks.
        
        Returns:
            Porcentagem de 0 a 100 (ou None se ilimitado)
        """
        if self.plano == 'pro':
            return 0  # Ilimitado, sempre 0% de uso
        
        limit = self.get_feedback_limit()
        current = self.get_current_feedback_count()
        
        return (current / limit * 100) if limit > 0 else 0
    
    # ==============================
    # TEAM MANAGEMENT
    # ==============================
    
    MAX_TEAM_MEMBERS = {
        'free': 1,
        'starter': 5,
        'pro': 15,
    }
    
    def can_add_team_member(self) -> bool:
        """
        Verifica se pode adicionar mais membros à equipe.
        Respeita o limite do plano.
        
        Returns:
            True se pode adicionar, False se atingiu o limite
        """
        current = self.team_members.filter(status=TeamMember.ACTIVE).count()
        max_allowed = self.MAX_TEAM_MEMBERS.get(self.plano, 1)
        return current < max_allowed
    
    def get_team_members_limit(self) -> int:
        """Retorna o limite de membros do plano"""
        return self.MAX_TEAM_MEMBERS.get(self.plano, 1)
    
    def get_active_team_members_count(self) -> int:
        """Retorna o número de membros ativos"""
        return self.team_members.filter(status=TeamMember.ACTIVE).count()
    
    def get_team_usage_percentage(self) -> float:
        """Retorna a porcentagem de uso do limite de equipe"""
        limit = self.get_team_members_limit()
        current = self.get_active_team_members_count()
        return (current / limit * 100) if limit > 0 else 0


class TeamMember(models.Model):
    """
    Relaciona User a Client (tenant) com role específica.
    Permite 1 User em múltiplos Clients (multi-tenancy).
    Implementa sistema de permissões hierárquico OWNER > ADMIN > MODERATOR > VIEWER.
    """
    
    # Roles hierárquicas (do maior para menor poder)
    OWNER = 'OWNER'
    ADMIN = 'ADMIN'
    MODERATOR = 'MODERATOR'
    VIEWER = 'VIEWER'
    
    ROLE_CHOICES = [
        (OWNER, 'Proprietário'),        # Criador, todos os poderes
        (ADMIN, 'Administrador'),       # Gerencia equipe + feedbacks
        (MODERATOR, 'Moderador'),       # Responde feedbacks
        (VIEWER, 'Visualizador'),       # Read-only
    ]
    
    # Status do membro na equipe
    ACTIVE = 'ACTIVE'
    SUSPENDED = 'SUSPENDED'
    REMOVED = 'REMOVED'
    
    STATUS_CHOICES = [
        (ACTIVE, 'Ativo'),
        (SUSPENDED, 'Suspenso'),
        (REMOVED, 'Removido'),
    ]
    
    # Relacionamentos
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='team_memberships',
        verbose_name='Usuário',
        help_text='Usuário que é membro deste tenant'
    )
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='team_members',
        verbose_name='Cliente',
        help_text='Tenant ao qual este usuário pertence'
    )
    
    # Dados
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=VIEWER,
        verbose_name='Cargo',
        help_text='Nível de permissão do usuário'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=ACTIVE,
        verbose_name='Status',
        help_text='Status atual do membro na equipe'
    )
    
    # Metadata
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invitations_sent',
        verbose_name='Convidado Por',
        help_text='Usuário que enviou o convite'
    )
    
    invited_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data do Convite'
    )
    
    joined_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Entrada',
        help_text='Quando o usuário aceitou o convite'
    )
    
    removed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Remoção'
    )
    
    email_notifications = models.BooleanField(
        default=True,
        verbose_name='Receber notificações por email',
        help_text='Se desabilitado, não receberá emails de atribuição/novos feedbacks'
    )
    
    class Meta:
        db_table = 'tenants_team_member'
        verbose_name = 'Membro da Equipe'
        verbose_name_plural = 'Membros da Equipe'
        unique_together = [('user', 'client')]
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['role', 'status']),
        ]
        ordering = ['-invited_at']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.get_role_display()} @ {self.client.nome}"
    
    def has_permission(self, permission: str) -> bool:
        """
        Verifica se tem permissão específica.
        Hierarquia: OWNER > ADMIN > MODERATOR > VIEWER
        
        Args:
            permission: Nome da permissão (ex: 'manage_team', 'manage_feedbacks')
        
        Returns:
            True se tem permissão, False caso contrário
        """
        if self.status != self.ACTIVE:
            return False
        
        # Mapeamento de permissões por role
        permissions_map = {
            self.OWNER: [
                'manage_team',          # Gerenciar membros da equipe
                'manage_billing',       # Gerenciar assinatura e pagamentos
                'manage_settings',      # Configurações gerais do tenant
                'manage_branding',      # White label (logo, cores, etc)
                'manage_feedbacks',     # Criar, editar, deletar feedbacks
                'assign_feedbacks',     # Atribuir feedbacks a membros
                'view_analytics',       # Ver dashboards e relatórios
                'export_data',          # Exportar dados (CSV, PDF)
                'manage_integrations',  # Configurar integrações (Slack, etc)
                'delete_tenant',        # Deletar o tenant (perigoso)
            ],
            self.ADMIN: [
                'manage_team',          # Gerenciar membros (exceto owner)
                'manage_settings',      # Configurações gerais
                'manage_branding',      # White label
                'manage_feedbacks',     # Criar, editar, deletar feedbacks
                'assign_feedbacks',     # Atribuir feedbacks
                'view_analytics',       # Ver analytics
                'export_data',          # Exportar dados
                'manage_integrations',  # Configurar integrações
            ],
            self.MODERATOR: [
                'manage_feedbacks',     # Criar, editar, responder feedbacks
                'view_analytics',       # Ver analytics básico
            ],
            self.VIEWER: [
                'view_feedbacks',       # Apenas visualizar feedbacks
                'view_analytics',       # Ver analytics básico
            ],
        }
        
        allowed_permissions = permissions_map.get(self.role, [])
        return permission in allowed_permissions
    
    def can_manage_member(self, target_member: 'TeamMember') -> bool:
        """
        Verifica se pode gerenciar outro membro (editar role, remover, etc).
        
        Regras:
        - OWNER pode gerenciar todos (exceto outros OWNERs)
        - ADMIN pode gerenciar MODERATOR e VIEWER
        - MODERATOR e VIEWER não podem gerenciar ninguém
        
        Args:
            target_member: Membro alvo da ação
        
        Returns:
            True se pode gerenciar, False caso contrário
        """
        if not self.has_permission('manage_team'):
            return False
        
        # OWNER pode gerenciar todos exceto outros OWNERs
        if self.role == self.OWNER:
            return target_member.role != self.OWNER
        
        # ADMIN pode gerenciar apenas MODERATOR e VIEWER
        if self.role == self.ADMIN:
            return target_member.role in [self.MODERATOR, self.VIEWER]
        
        return False
    
    def get_role_hierarchy_level(self) -> int:
        """
        Retorna nível hierárquico (maior = mais poder).
        Usado para comparações e validações.
        """
        hierarchy = {
            self.OWNER: 4,
            self.ADMIN: 3,
            self.MODERATOR: 2,
            self.VIEWER: 1,
        }
        return hierarchy.get(self.role, 0)
    
    def suspend(self, suspended_by: User = None):
        """Suspende o membro da equipe"""
        self.status = self.SUSPENDED
        self.save()
    
    def activate(self):
        """Reativa o membro suspenso"""
        self.status = self.ACTIVE
        self.save()
    
    def remove(self, removed_by: User = None):
        """Remove o membro da equipe (soft delete)"""
        self.status = self.REMOVED
        self.removed_at = timezone.now()
        self.save()


class TeamInvitation(models.Model):
    """
    Convite pendente com token único.
    Expira em 7 dias e pode ser aceito apenas uma vez.
    """
    
    # Status do convite
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    EXPIRED = 'EXPIRED'
    REVOKED = 'REVOKED'
    
    STATUS_CHOICES = [
        (PENDING, 'Pendente'),
        (ACCEPTED, 'Aceito'),
        (EXPIRED, 'Expirado'),
        (REVOKED, 'Revogado'),
    ]
    
    # Relacionamentos
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='invitations',
        verbose_name='Cliente'
    )
    
    invited_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_invitations',
        verbose_name='Convidado Por'
    )
    
    # Dados do convite
    email = models.EmailField(
        verbose_name='Email do Convidado',
        help_text='Email para onde o convite será enviado'
    )
    
    role = models.CharField(
        max_length=20,
        choices=TeamMember.ROLE_CHOICES,
        default=TeamMember.VIEWER,
        verbose_name='Cargo',
        help_text='Role que será atribuída ao aceitar'
    )
    
    token = models.CharField(
        max_length=64,
        unique=True,
        editable=False,
        verbose_name='Token',
        help_text='Token único para aceitar o convite'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
        verbose_name='Status'
    )
    
    personal_message = models.TextField(
        blank=True,
        verbose_name='Mensagem Pessoal',
        help_text='Mensagem opcional incluída no email de convite'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado Em'
    )
    
    expires_at = models.DateTimeField(
        verbose_name='Expira Em',
        help_text='Data de expiração do convite (7 dias)'
    )
    
    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Aceito Em'
    )
    
    class Meta:
        db_table = 'tenants_team_invitation'
        verbose_name = 'Convite de Equipe'
        verbose_name_plural = 'Convites de Equipe'
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['email', 'status']),
            models.Index(fields=['client', 'status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Convite para {self.email} - {self.client.nome} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        """Gera token único e data de expiração se não existirem"""
        if not self.token:
            import secrets
            self.token = secrets.token_urlsafe(48)
        
        if not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=7)
        
        super().save(*args, **kwargs)
    
    @property
    def is_valid(self) -> bool:
        """Verifica se o convite ainda é válido"""
        return self.status == self.PENDING and timezone.now() <= self.expires_at
    
    @property
    def is_expired(self) -> bool:
        """Verifica se o convite expirou"""
        return timezone.now() > self.expires_at and self.status == self.PENDING
    
    def accept(self, user: User) -> TeamMember:
        """
        Aceita o convite e cria TeamMember.
        
        Args:
            user: Usuário que está aceitando o convite
        
        Returns:
            TeamMember criado
        
        Raises:
            ValueError: Se o convite não for válido
        """
        if not self.is_valid:
            raise ValueError("Convite inválido ou expirado")
        
        # Criar ou atualizar TeamMember
        team_member, created = TeamMember.objects.get_or_create(
            user=user,
            client=self.client,
            defaults={
                'role': self.role,
                'invited_by': self.invited_by,
                'joined_at': timezone.now(),
                'status': TeamMember.ACTIVE,
            }
        )
        
        # Se já existia, apenas atualizar
        if not created:
            team_member.role = self.role
            team_member.status = TeamMember.ACTIVE
            team_member.joined_at = timezone.now()
            team_member.save()
        
        # Marcar convite como aceito
        self.status = self.ACCEPTED
        self.accepted_at = timezone.now()
        self.save()
        
        return team_member
    
    def revoke(self):
        """Revoga o convite (não pode mais ser aceito)"""
        self.status = self.REVOKED
        self.save()
    
    def mark_as_expired(self):
        """Marca o convite como expirado"""
        if self.is_expired:
            self.status = self.EXPIRED
            self.save()

