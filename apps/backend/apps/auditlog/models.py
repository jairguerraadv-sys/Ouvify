"""
Models para Audit Log
Rastreia todas as ações importantes no sistema para compliance e segurança
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class AuditLogManager(models.Manager):
    """Manager customizado para AuditLog."""
    
    def create_log(
        self,
        action: str,
        user=None,
        tenant=None,
        content_object=None,
        description: str = '',
        ip_address: str = None,
        user_agent: str = None,
        metadata: dict = None,
        severity: str = 'INFO'
    ):
        """
        Cria um novo registro de audit log.
        
        Args:
            action: Tipo da ação (ex: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
            user: Usuário que realizou a ação
            tenant: Tenant/Cliente associado
            content_object: Objeto afetado pela ação (opcional)
            description: Descrição detalhada da ação
            ip_address: Endereço IP do usuário
            user_agent: User-Agent do navegador
            metadata: Dados adicionais em JSON
            severity: Nível de severidade (INFO, WARNING, ERROR, CRITICAL)
        """
        log = self.model(
            action=action,
            user=user,
            tenant=tenant,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {},
            severity=severity,
        )
        
        if content_object:
            log.content_type = ContentType.objects.get_for_model(content_object)
            log.object_id = content_object.pk
            log.object_repr = str(content_object)[:200]
        
        log.save()
        return log
    
    def for_tenant(self, tenant):
        """Retorna logs filtrados por tenant."""
        return self.filter(tenant=tenant)
    
    def for_user(self, user):
        """Retorna logs filtrados por usuário."""
        return self.filter(user=user)
    
    def recent(self, days: int = 7):
        """Retorna logs recentes."""
        since = timezone.now() - timezone.timedelta(days=days)
        return self.filter(timestamp__gte=since)
    
    def by_action(self, action: str):
        """Filtra por tipo de ação."""
        return self.filter(action=action)


class AuditLog(models.Model):
    """
    Modelo principal de Audit Log.
    Armazena registros de todas as ações importantes no sistema.
    """
    
    # Tipos de ação
    ACTION_CHOICES = [
        # Autenticação
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGIN_FAILED', 'Falha de Login'),
        ('PASSWORD_CHANGE', 'Alteração de Senha'),
        ('PASSWORD_RESET', 'Reset de Senha'),
        ('MFA_ENABLED', 'MFA Ativado'),
        ('MFA_DISABLED', 'MFA Desativado'),
        
        # CRUD
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Exclusão'),
        ('VIEW', 'Visualização'),
        ('EXPORT', 'Exportação'),
        
        # Feedbacks
        ('FEEDBACK_CREATED', 'Feedback Criado'),
        ('FEEDBACK_UPDATED', 'Feedback Atualizado'),
        ('FEEDBACK_STATUS_CHANGED', 'Status do Feedback Alterado'),
        ('FEEDBACK_ASSIGNED', 'Feedback Atribuído'),
        ('FEEDBACK_RESOLVED', 'Feedback Resolvido'),
        
        # Tenant/Admin
        ('TENANT_CREATED', 'Tenant Criado'),
        ('TENANT_UPDATED', 'Tenant Atualizado'),
        ('TENANT_SUSPENDED', 'Tenant Suspenso'),
        ('USER_INVITED', 'Usuário Convidado'),
        ('USER_REMOVED', 'Usuário Removido'),
        ('PERMISSION_CHANGED', 'Permissão Alterada'),
        
        # Sistema
        ('SETTINGS_CHANGED', 'Configurações Alteradas'),
        ('API_ACCESS', 'Acesso à API'),
        ('WEBHOOK_TRIGGERED', 'Webhook Disparado'),
        
        # Segurança
        ('SECURITY_ALERT', 'Alerta de Segurança'),
        ('SUSPICIOUS_ACTIVITY', 'Atividade Suspeita'),
        ('ACCESS_DENIED', 'Acesso Negado'),
    ]
    
    SEVERITY_CHOICES = [
        ('INFO', 'Informação'),
        ('WARNING', 'Aviso'),
        ('ERROR', 'Erro'),
        ('CRITICAL', 'Crítico'),
    ]
    
    # Campos principais
    timestamp = models.DateTimeField(
        'Data/Hora',
        default=timezone.now,
        db_index=True
    )
    action = models.CharField(
        'Ação',
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True
    )
    severity = models.CharField(
        'Severidade',
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='INFO',
        db_index=True
    )
    description = models.TextField(
        'Descrição',
        blank=True
    )
    
    # Relacionamentos
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='Usuário',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    tenant = models.ForeignKey(
        'tenants.Client',
        verbose_name='Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    # Generic Foreign Key para objeto afetado
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        db_index=True
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    object_repr = models.CharField(
        'Representação do Objeto',
        max_length=200,
        blank=True
    )
    
    # Informações de contexto
    ip_address = models.GenericIPAddressField(
        'Endereço IP',
        null=True,
        blank=True,
        db_index=True
    )
    user_agent = models.TextField(
        'User Agent',
        blank=True
    )
    metadata = models.JSONField(
        'Metadados',
        default=dict,
        blank=True
    )
    
    objects = AuditLogManager()
    
    class Meta:
        verbose_name = 'Log de Auditoria'
        verbose_name_plural = 'Logs de Auditoria'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp', 'action']),
            models.Index(fields=['tenant', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', 'severity']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Sistema'
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {user_str}: {self.get_action_display()}"
    
    @property
    def action_icon(self) -> str:
        """Retorna ícone para a ação."""
        icons = {
            'LOGIN': '🔐',
            'LOGOUT': '🚪',
            'LOGIN_FAILED': '❌',
            'CREATE': '➕',
            'UPDATE': '✏️',
            'DELETE': '🗑️',
            'VIEW': '👁️',
            'EXPORT': '📥',
            'FEEDBACK_CREATED': '📝',
            'FEEDBACK_RESOLVED': '✅',
            'SECURITY_ALERT': '🚨',
            'SUSPICIOUS_ACTIVITY': '⚠️',
        }
        return icons.get(self.action, '📋')


class AuditLogSummary(models.Model):
    """
    Modelo para armazenar resumos agregados de audit logs.
    Útil para analytics e dashboards sem precisar agregar em tempo real.
    """
    
    date = models.DateField(
        'Data',
        db_index=True
    )
    tenant = models.ForeignKey(
        'tenants.Client',
        verbose_name='Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_summaries'
    )
    action = models.CharField(
        'Ação',
        max_length=50,
        db_index=True
    )
    count = models.PositiveIntegerField(
        'Contagem',
        default=0
    )
    unique_users = models.PositiveIntegerField(
        'Usuários Únicos',
        default=0
    )
    
    class Meta:
        verbose_name = 'Resumo de Auditoria'
        verbose_name_plural = 'Resumos de Auditoria'
        unique_together = ['date', 'tenant', 'action']
        indexes = [
            models.Index(fields=['date', 'tenant']),
            models.Index(fields=['date', 'action']),
        ]
    
    def __str__(self):
        return f"{self.date} - {self.action}: {self.count}"


class UserSession(models.Model):
    """
    Rastreia sessões de usuário para análise de comportamento.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='Usuário',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    tenant = models.ForeignKey(
        'tenants.Client',
        verbose_name='Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_sessions'
    )
    session_key = models.CharField(
        'Chave da Sessão',
        max_length=40,
        unique=True
    )
    started_at = models.DateTimeField(
        'Início',
        default=timezone.now
    )
    last_activity = models.DateTimeField(
        'Última Atividade',
        default=timezone.now
    )
    ended_at = models.DateTimeField(
        'Fim',
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(
        'Endereço IP',
        null=True,
        blank=True
    )
    user_agent = models.TextField(
        'User Agent',
        blank=True
    )
    device_type = models.CharField(
        'Tipo de Dispositivo',
        max_length=20,
        blank=True
    )
    browser = models.CharField(
        'Navegador',
        max_length=50,
        blank=True
    )
    os = models.CharField(
        'Sistema Operacional',
        max_length=50,
        blank=True
    )
    is_active = models.BooleanField(
        'Ativo',
        default=True
    )
    
    class Meta:
        verbose_name = 'Sessão de Usuário'
        verbose_name_plural = 'Sessões de Usuário'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.started_at:%Y-%m-%d %H:%M}"
    
    @property
    def duration(self):
        """Duração da sessão em minutos."""
        end = self.ended_at or timezone.now()
        return int((end - self.started_at).total_seconds() / 60)
