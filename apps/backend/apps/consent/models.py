from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ConsentVersion(models.Model):
    """Versões dos termos e políticas"""
    
    DOCUMENT_TYPES = [
        ('terms', 'Termos de Uso'),
        ('privacy', 'Política de Privacidade'),
        ('lgpd', 'Consentimento LGPD'),
        ('marketing', 'Marketing'),
    ]
    
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    version = models.CharField(max_length=20)  # Ex: "1.0", "2.0"
    content_url = models.CharField(max_length=255)  # URL do documento
    is_current = models.BooleanField(default=True)
    is_required = models.BooleanField(default=True)  # Se é obrigatório aceitar
    
    created_at = models.DateTimeField(auto_now_add=True)
    effective_date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'consent_versions'
        ordering = ['-created_at']
        unique_together = ['document_type', 'version']
    
    def __str__(self):
        return f"{self.get_document_type_display()} v{self.version}"
    
    def save(self, *args, **kwargs):
        # Se marcado como current, desmarcar outros
        if self.is_current:
            ConsentVersion.objects.filter(
                document_type=self.document_type,
                is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class UserConsent(models.Model):
    """Registro de consentimentos dos usuários"""
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='consents'
    )
    # Para usuários anônimos
    email = models.EmailField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500)
    
    consent_version = models.ForeignKey(
        ConsentVersion,
        on_delete=models.PROTECT,
        related_name='user_consents'
    )
    
    accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    # Para revogação
    revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    # Contexto do consentimento
    context = models.CharField(max_length=50)  # 'signup', 'login', 'feedback', 'settings'
    
    class Meta:
        db_table = 'user_consents'
        ordering = ['-accepted_at']
        indexes = [
            models.Index(fields=['user', 'consent_version']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        identifier = self.user.email if self.user else self.email
        return f"{identifier} - {self.consent_version}"
    
    def accept(self):
        """Aceitar consentimento"""
        self.accepted = True
        self.accepted_at = timezone.now()
        self.revoked = False
        self.revoked_at = None
        self.save()
    
    def revoke(self):
        """Revogar consentimento"""
        self.revoked = True
        self.revoked_at = timezone.now()
        self.save()


class ConsentLog(models.Model):
    """Log de auditoria de consentimentos (para LGPD)"""
    
    user_consent = models.ForeignKey(
        UserConsent,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    action = models.CharField(max_length=20)  # 'accept', 'revoke', 'update'
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500)
    
    class Meta:
        db_table = 'consent_logs'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.timestamp}"
