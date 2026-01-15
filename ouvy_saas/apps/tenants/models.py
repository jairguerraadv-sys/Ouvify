from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


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
