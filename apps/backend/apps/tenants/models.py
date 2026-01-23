from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
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

