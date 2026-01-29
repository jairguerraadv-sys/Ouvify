"""
Billing Signals - Ouvy SaaS
Sprint 4 - Feature 4.2: Planos & Trial

Signals para:
- Auto-iniciar trial quando novo tenant é criado
- Enviar notificações de trial expirando
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import IntegrityError

from apps.tenants.models import Client
from .models import Plan, Subscription

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Client)
def auto_start_trial_for_new_tenant(sender, instance, created, **kwargs):
    """
    Automaticamente inicia um trial do plano Professional 
    quando um novo tenant é criado.
    """
    if not created:
        return
    
    # Verifica se já existe subscription
    existing = Subscription.objects.all_tenants().filter(
        client=instance
    ).exists()
    
    if existing:
        logger.info(f"Tenant {instance.nome} já possui subscription")
        return
    
    # Busca plano Professional ou o mais alto plano com trial
    trial_plan = Plan.objects.filter(
        is_active=True,
        trial_days__gt=0,
        slug='professional'  # Prefere o Professional
    ).first()
    
    if not trial_plan:
        # Fallback para qualquer plano com trial
        trial_plan = Plan.objects.filter(
            is_active=True,
            trial_days__gt=0
        ).order_by('-price_cents').first()
    
    if not trial_plan:
        logger.warning(f"Nenhum plano com trial disponível para {instance.nome}")
        return
    
    try:
        # Cria subscription em trial
        subscription = Subscription.objects.create(
            client=instance,
            plan=trial_plan,
            status=Subscription.STATUS_INCOMPLETE  # Será ativado pelo start_trial
        )
        
        subscription.start_trial()
        
        logger.info(
            f"✅ Trial iniciado para {instance.nome} | "
            f"Plano: {trial_plan.name} | "
            f"Dias: {trial_plan.trial_days}"
        )
    except IntegrityError:
        # Subscription já existe (pode ter sido criada por outro processo)
        logger.info(f"Subscription já existe para {instance.nome}")
    except Exception as e:
        logger.error(f"Erro ao criar trial para {instance.nome}: {e}")
