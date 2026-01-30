"""
Billing Tasks - Ouvify
Sprint 4 - Feature 4.2: Planos & Trial

Celery tasks para:
- Notificar sobre trials expirando
- Verificar subscriptions vencidas
- Enviar lembretes de pagamento
"""
import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import Subscription

logger = logging.getLogger(__name__)


@shared_task
def check_expiring_trials():
    """
    Verifica trials que vão expirar nos próximos 3 dias
    e envia notificações.
    """
    now = timezone.now()
    expiring_soon = now + timedelta(days=3)
    
    # Busca trials que expiram nos próximos 3 dias
    expiring_subscriptions = Subscription.objects.all_tenants().filter(
        status=Subscription.STATUS_TRIALING,
        trial_end__lte=expiring_soon,
        trial_end__gt=now
    ).select_related('client', 'plan')
    
    count = 0
    for subscription in expiring_subscriptions:
        days_remaining = (subscription.trial_end - now).days
        
        try:
            # Envia email de notificação
            send_trial_expiring_email(subscription, days_remaining)
            count += 1
            
            logger.info(
                f"📧 Notificação de trial enviada | "
                f"Tenant: {subscription.client.nome} | "
                f"Dias restantes: {days_remaining}"
            )
        except Exception as e:
            logger.error(f"Erro ao enviar notificação: {e}")
    
    return f"Notificações enviadas: {count}"


@shared_task
def expire_trials():
    """
    Expira trials que passaram da data de término.
    """
    now = timezone.now()
    
    expired_subscriptions = Subscription.objects.all_tenants().filter(
        status=Subscription.STATUS_TRIALING,
        trial_end__lt=now
    ).select_related('client', 'plan')
    
    count = 0
    for subscription in expired_subscriptions:
        try:
            # Verifica se há plano gratuito para downgrade
            from .models import Plan
            free_plan = Plan.objects.filter(
                is_active=True,
                price_cents=0
            ).first()
            
            if free_plan:
                # Downgrade para plano gratuito
                subscription.plan = free_plan
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.save()
                
                logger.info(
                    f"⬇️ Trial expirado - Downgrade para Free | "
                    f"Tenant: {subscription.client.nome}"
                )
            else:
                # Cancela subscription
                subscription.status = Subscription.STATUS_CANCELED
                subscription.canceled_at = now
                subscription.save()
                
                logger.info(
                    f"❌ Trial expirado - Cancelado | "
                    f"Tenant: {subscription.client.nome}"
                )
            
            # Envia email de trial expirado
            send_trial_expired_email(subscription)
            count += 1
            
        except Exception as e:
            logger.error(f"Erro ao expirar trial: {e}")
    
    return f"Trials expirados: {count}"


@shared_task
def check_past_due_subscriptions():
    """
    Verifica subscriptions com pagamento atrasado e envia lembretes.
    """
    now = timezone.now()
    
    past_due_subscriptions = Subscription.objects.all_tenants().filter(
        status=Subscription.STATUS_PAST_DUE
    ).select_related('client', 'plan')
    
    count = 0
    for subscription in past_due_subscriptions:
        try:
            send_payment_reminder_email(subscription)
            count += 1
            
            logger.info(
                f"📧 Lembrete de pagamento enviado | "
                f"Tenant: {subscription.client.nome}"
            )
        except Exception as e:
            logger.error(f"Erro ao enviar lembrete: {e}")
    
    return f"Lembretes enviados: {count}"


def send_trial_expiring_email(subscription, days_remaining):
    """Envia email de trial expirando."""
    if not subscription.client.owner or not subscription.client.owner.email:
        return
    
    subject = f"Seu trial do {subscription.plan.name} expira em {days_remaining} dias"
    message = f"""
Olá!

Seu período de trial do plano {subscription.plan.name} no Ouvify expira em {days_remaining} dias.

Para continuar aproveitando todos os recursos:
- Faça upgrade do seu plano
- Não perca seus dados e configurações

Acesse sua conta para fazer o upgrade: {settings.FRONTEND_URL}/billing

Equipe Ouvify
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[subscription.client.owner.email],
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")


def send_trial_expired_email(subscription):
    """Envia email de trial expirado."""
    if not subscription.client.owner or not subscription.client.owner.email:
        return
    
    subject = f"Seu trial do Ouvify expirou"
    message = f"""
Olá!

Seu período de trial no Ouvify expirou.

{"Sua conta foi convertida para o plano gratuito." if subscription.plan.price_cents == 0 else "Sua conta foi suspensa."}

Para recuperar o acesso completo:
- Faça upgrade para um plano pago
- Todos os seus dados estão preservados

Acesse sua conta: {settings.FRONTEND_URL}/billing

Equipe Ouvify
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[subscription.client.owner.email],
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")


def send_payment_reminder_email(subscription):
    """Envia lembrete de pagamento."""
    if not subscription.client.owner or not subscription.client.owner.email:
        return
    
    subject = f"Lembrete: Pagamento pendente no Ouvify"
    message = f"""
Olá!

Identificamos que há um pagamento pendente na sua assinatura do plano {subscription.plan.name}.

Para evitar a suspensão do serviço:
- Atualize suas informações de pagamento
- Ou entre em contato com nosso suporte

Acesse sua conta: {settings.FRONTEND_URL}/billing

Equipe Ouvify
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[subscription.client.owner.email],
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")
