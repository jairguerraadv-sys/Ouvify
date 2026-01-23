"""
Signals para capturar eventos automaticamente no Audit Log
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.contrib.auth import get_user_model

from .models import AuditLog

User = get_user_model()


# ===== AUTHENTICATION SIGNALS =====

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Registra login bem-sucedido."""
    ip_address = _get_client_ip(request) if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    
    # Tenta obter tenant do usuário
    tenant = getattr(user, 'client', None)
    
    AuditLog.objects.create_log(
        action='LOGIN',
        user=user,
        tenant=tenant,
        description=f'Login bem-sucedido: {user.email}',
        ip_address=ip_address,
        user_agent=user_agent,
        metadata={
            'email': user.email,
            'method': 'web'
        }
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Registra logout."""
    if user is None:
        return
    
    ip_address = _get_client_ip(request) if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    tenant = getattr(user, 'client', None)
    
    AuditLog.objects.create_log(
        action='LOGOUT',
        user=user,
        tenant=tenant,
        description=f'Logout: {user.email}',
        ip_address=ip_address,
        user_agent=user_agent,
    )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """Registra tentativa de login falha."""
    ip_address = _get_client_ip(request) if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    email = credentials.get('email', credentials.get('username', 'unknown'))
    
    # Tenta encontrar o usuário para associar ao tenant
    user = None
    tenant = None
    try:
        user = User.objects.get(email=email)
        tenant = getattr(user, 'client', None)
    except User.DoesNotExist:
        pass
    
    AuditLog.objects.create_log(
        action='LOGIN_FAILED',
        user=user,
        tenant=tenant,
        description=f'Tentativa de login falha: {email}',
        ip_address=ip_address,
        user_agent=user_agent,
        severity='WARNING',
        metadata={
            'email_attempted': email,
        }
    )


# ===== MODEL SIGNALS =====

def _get_client_ip(request):
    """Extrai IP do cliente considerando proxies."""
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_request_context():
    """
    Tenta obter contexto da request atual.
    Usa threading.local ou similar para acessar request.
    """
    try:
        from django.middleware.csrf import get_token
        from threading import local
        _thread_locals = local()
        return getattr(_thread_locals, 'request', None)
    except Exception:
        return None


# ===== FEEDBACK SIGNALS =====

try:
    from apps.feedbacks.models import Feedback
    
    @receiver(post_save, sender=Feedback)
    def log_feedback_created_or_updated(sender, instance, created, **kwargs):
        """Registra criação ou atualização de feedback."""
        action = 'FEEDBACK_CREATED' if created else 'FEEDBACK_UPDATED'
        
        AuditLog.objects.create_log(
            action=action,
            tenant=instance.client,
            content_object=instance,
            description=f"Feedback #{instance.protocolo}: {instance.get_tipo_display() if hasattr(instance, 'get_tipo_display') else instance.tipo}",
            metadata={
                'protocolo': instance.protocolo,
                'tipo': instance.tipo,
                'status': instance.status,
            }
        )
    
    # Rastrear mudanças de status
    @receiver(pre_save, sender=Feedback)
    def track_feedback_status_change(sender, instance, **kwargs):
        """Rastreia mudanças de status em feedbacks."""
        if not instance.pk:
            return  # Novo feedback, será tratado pelo post_save
        
        try:
            old_instance = Feedback.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                AuditLog.objects.create_log(
                    action='FEEDBACK_STATUS_CHANGED',
                    tenant=instance.client,
                    content_object=instance,
                    description=f"Feedback #{instance.protocolo}: status alterado de '{old_instance.status}' para '{instance.status}'",
                    metadata={
                        'protocolo': instance.protocolo,
                        'old_status': old_instance.status,
                        'new_status': instance.status,
                    }
                )
        except Feedback.DoesNotExist:
            pass

except ImportError:
    pass  # App feedbacks não instalado


# ===== USER SIGNALS =====

@receiver(post_save, sender=User)
def log_user_changes(sender, instance, created, **kwargs):
    """Registra criação de usuários."""
    if created:
        tenant = getattr(instance, 'client', None)
        AuditLog.objects.create_log(
            action='CREATE',
            user=instance,
            tenant=tenant,
            content_object=instance,
            description=f'Novo usuário criado: {instance.email}',
            metadata={
                'email': instance.email,
                'is_staff': instance.is_staff,
            }
        )


# ===== TENANT SIGNALS =====

try:
    from apps.tenants.models import Client
    
    @receiver(post_save, sender=Client)
    def log_tenant_changes(sender, instance, created, **kwargs):
        """Registra criação ou atualização de tenants."""
        action = 'TENANT_CREATED' if created else 'TENANT_UPDATED'
        
        AuditLog.objects.create_log(
            action=action,
            tenant=instance,
            content_object=instance,
            description=f"Tenant {'criado' if created else 'atualizado'}: {instance.nome}",
            metadata={
                'nome': instance.nome,
                'status': getattr(instance, 'status', 'active'),
            }
        )

except ImportError:
    pass  # App tenants não instalado
