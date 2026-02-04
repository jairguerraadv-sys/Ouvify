"""
Stripe Service - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe

Este módulo fornece funções utilitárias para integração com Stripe:
- Criação de customer
- Criação de checkout session
- Webhook handling
- Portal de billing
"""

import logging
from datetime import datetime
from typing import Any, Dict

import stripe
from apps.tenants.models import Client
from django.conf import settings
from django.utils import timezone

from .models import Invoice, Plan, Subscription

logger = logging.getLogger(__name__)


def get_stripe_api():
    """Configura e retorna o módulo stripe com API key."""
    api_key = getattr(settings, "STRIPE_SECRET_KEY", None)
    if not api_key:
        raise ValueError("STRIPE_SECRET_KEY não configurada")
    stripe.api_key = api_key
    return stripe


def create_or_get_customer(client: Client) -> str:
    """
    Cria ou retorna o Stripe Customer ID para um cliente.

    Args:
        client: Instância do Client (tenant)

    Returns:
        Stripe Customer ID
    """
    stripe_api = get_stripe_api()

    # Verifica se já existe subscription com customer_id
    subscription = Subscription.objects.filter(
        client=client, stripe_customer_id__isnull=False
    ).first()

    if subscription and subscription.stripe_customer_id:
        return subscription.stripe_customer_id

    # Cria novo customer
    customer = stripe_api.Customer.create(
        email=client.email,
        name=client.nome,
        metadata={"client_id": str(client.id), "subdomain": client.subdominio},
    )

    logger.info(f"Stripe customer criado: {customer.id} para client {client.id}")
    return customer.id


def create_checkout_session(
    client: Client, plan: Plan, success_url: str, cancel_url: str
) -> Dict[str, Any]:
    """
    Cria uma sessão de checkout do Stripe.

    Args:
        client: Cliente (tenant) que está comprando
        plan: Plano selecionado
        success_url: URL de redirecionamento após sucesso
        cancel_url: URL de redirecionamento após cancelamento

    Returns:
        Dict com session_id e checkout_url
    """
    stripe_api = get_stripe_api()

    if not plan.stripe_price_id:
        raise ValueError(f"Plano {plan.name} não tem stripe_price_id configurado")

    customer_id = create_or_get_customer(client)

    # Verifica se já existe subscription ativa
    existing_sub = Subscription.objects.filter(
        client=client,
        status__in=[Subscription.STATUS_ACTIVE, Subscription.STATUS_TRIALING],
    ).first()

    if existing_sub:
        raise ValueError("Cliente já possui assinatura ativa")

    # Cria checkout session
    session = stripe_api.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        subscription_data={
            "trial_period_days": plan.trial_days if plan.trial_days > 0 else None,
            "metadata": {"client_id": str(client.id), "plan_id": str(plan.id)},
        },
        metadata={"client_id": str(client.id), "plan_id": str(plan.id)},
    )

    logger.info(f"Checkout session criado: {session.id} para client {client.id}")

    return {"session_id": session.id, "checkout_url": session.url}


def create_billing_portal_session(client: Client, return_url: str) -> Dict[str, Any]:
    """
    Cria uma sessão do portal de billing do Stripe.

    Args:
        client: Cliente (tenant)
        return_url: URL de retorno após usar o portal

    Returns:
        Dict com portal_url
    """
    stripe_api = get_stripe_api()

    subscription = Subscription.objects.filter(
        client=client, stripe_customer_id__isnull=False
    ).first()

    if not subscription or not subscription.stripe_customer_id:
        raise ValueError("Cliente não possui customer no Stripe")

    session = stripe_api.billing_portal.Session.create(
        customer=subscription.stripe_customer_id, return_url=return_url
    )

    return {"portal_url": session.url}


def handle_webhook_event(payload: bytes, sig_header: str) -> Dict[str, Any]:
    """
    Processa eventos de webhook do Stripe.

    Args:
        payload: Corpo raw da requisição
        sig_header: Header Stripe-Signature

    Returns:
        Dict com resultado do processamento
    """
    stripe_api = get_stripe_api()
    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)

    if not webhook_secret:
        raise ValueError("STRIPE_WEBHOOK_SECRET não configurado")

    try:
        event = stripe_api.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError as e:
        logger.error(f"Webhook payload inválido: {e}")
        raise
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Webhook signature inválida: {e}")
        raise

    # Processa eventos
    event_type = event["type"]
    data = event["data"]["object"]

    handlers = {
        "checkout.session.completed": handle_checkout_completed,
        "invoice.paid": handle_invoice_paid,
        "invoice.payment_failed": handle_invoice_payment_failed,
        "customer.subscription.updated": handle_subscription_updated,
        "customer.subscription.deleted": handle_subscription_deleted,
    }

    handler = handlers.get(event_type)
    if handler:
        return handler(data)

    logger.info(f"Evento não tratado: {event_type}")
    return {"status": "ignored", "event_type": event_type}


def handle_checkout_completed(data: Dict) -> Dict[str, Any]:
    """Processa checkout.session.completed."""
    client_id = data.get("metadata", {}).get("client_id")
    plan_id = data.get("metadata", {}).get("plan_id")

    if not client_id or not plan_id:
        logger.warning("Checkout completed sem metadata")
        return {"status": "error", "message": "Missing metadata"}

    try:
        client = Client.objects.get(id=client_id)
        plan = Plan.objects.get(id=plan_id)
    except (Client.DoesNotExist, Plan.DoesNotExist) as e:
        logger.error(f"Entidade não encontrada: {e}")
        return {"status": "error", "message": str(e)}

    # Cria ou atualiza subscription
    subscription, created = Subscription.objects.update_or_create(
        client=client,
        defaults={
            "plan": plan,
            "stripe_subscription_id": data.get("subscription"),
            "stripe_customer_id": data.get("customer"),
            "status": Subscription.STATUS_ACTIVE,
        },
    )

    logger.info(
        f"Subscription {'criada' if created else 'atualizada'}: {subscription.id}"
    )
    return {"status": "success", "subscription_id": subscription.id}


def handle_invoice_paid(data: Dict) -> Dict[str, Any]:
    """Processa invoice.paid."""
    stripe_subscription_id = data.get("subscription")

    if not stripe_subscription_id:
        return {"status": "ignored", "message": "No subscription"}

    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription_id
        )
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription não encontrada: {stripe_subscription_id}")
        return {"status": "error", "message": "Subscription not found"}

    # Cria invoice local
    invoice, created = Invoice.objects.update_or_create(
        stripe_invoice_id=data.get("id"),
        defaults={
            "client": subscription.client,
            "subscription": subscription,
            "amount_cents": data.get("amount_paid", 0),
            "currency": data.get("currency", "brl").upper(),
            "status": Invoice.STATUS_PAID,
            "pdf_url": data.get("invoice_pdf"),
            "hosted_invoice_url": data.get("hosted_invoice_url"),
            "paid_at": timezone.now(),
        },
    )

    # Atualiza subscription para ativa
    subscription.status = Subscription.STATUS_ACTIVE
    subscription.save()

    logger.info(f"Invoice {'criada' if created else 'atualizada'}: {invoice.id}")
    return {"status": "success", "invoice_id": invoice.id}


def handle_invoice_payment_failed(data: Dict) -> Dict[str, Any]:
    """Processa invoice.payment_failed."""
    stripe_subscription_id = data.get("subscription")

    if not stripe_subscription_id:
        return {"status": "ignored"}

    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription_id
        )
        subscription.status = Subscription.STATUS_PAST_DUE
        subscription.save()

        logger.warning(f"Pagamento falhou para subscription {subscription.id}")
        return {"status": "success", "subscription_id": subscription.id}
    except Subscription.DoesNotExist:
        return {"status": "error", "message": "Subscription not found"}


def handle_subscription_updated(data: Dict) -> Dict[str, Any]:
    """Processa customer.subscription.updated."""
    stripe_subscription_id = data.get("id")

    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription_id
        )
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription não encontrada: {stripe_subscription_id}")
        return {"status": "error", "message": "Subscription not found"}

    # Mapeia status do Stripe para nosso status
    status_map = {
        "trialing": Subscription.STATUS_TRIALING,
        "active": Subscription.STATUS_ACTIVE,
        "past_due": Subscription.STATUS_PAST_DUE,
        "canceled": Subscription.STATUS_CANCELED,
        "unpaid": Subscription.STATUS_UNPAID,
        "incomplete": Subscription.STATUS_INCOMPLETE,
    }

    stripe_status = data.get("status")
    if stripe_status in status_map:
        subscription.status = status_map[stripe_status]

    # Atualiza datas
    current_period_start = data.get("current_period_start")
    current_period_end = data.get("current_period_end")

    if current_period_start:
        subscription.current_period_start = datetime.fromtimestamp(
            current_period_start, tz=timezone.utc
        )
    if current_period_end:
        subscription.current_period_end = datetime.fromtimestamp(
            current_period_end, tz=timezone.utc
        )

    subscription.cancel_at_period_end = data.get("cancel_at_period_end", False)
    subscription.save()

    logger.info(f"Subscription atualizada: {subscription.id} -> {subscription.status}")
    return {"status": "success", "subscription_id": subscription.id}


def handle_subscription_deleted(data: Dict) -> Dict[str, Any]:
    """Processa customer.subscription.deleted."""
    stripe_subscription_id = data.get("id")

    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription_id
        )
        subscription.status = Subscription.STATUS_CANCELED
        subscription.canceled_at = timezone.now()
        subscription.save()

        logger.info(f"Subscription cancelada: {subscription.id}")
        return {"status": "success", "subscription_id": subscription.id}
    except Subscription.DoesNotExist:
        return {"status": "error", "message": "Subscription not found"}


def cancel_subscription(
    subscription: Subscription, at_period_end: bool = True
) -> Dict[str, Any]:
    """
    Cancela uma assinatura no Stripe.

    Args:
        subscription: Instância da Subscription
        at_period_end: Se True, cancela no fim do período atual

    Returns:
        Dict com resultado
    """
    stripe_api = get_stripe_api()

    if not subscription.stripe_subscription_id:
        # Subscription local sem Stripe
        subscription.cancel(at_period_end=at_period_end)
        return {"status": "success", "local_only": True}

    if at_period_end:
        stripe_api.Subscription.modify(
            subscription.stripe_subscription_id, cancel_at_period_end=True
        )
    else:
        stripe_api.Subscription.delete(subscription.stripe_subscription_id)

    subscription.cancel(at_period_end=at_period_end)

    return {"status": "success"}


def get_subscription_status(client: Client) -> Dict[str, Any]:
    """
    Retorna status completo da assinatura de um cliente.

    Args:
        client: Cliente (tenant)

    Returns:
        Dict com informações da assinatura
    """
    subscription = (
        Subscription.objects.filter(
            client=client,
            status__in=[
                Subscription.STATUS_ACTIVE,
                Subscription.STATUS_TRIALING,
                Subscription.STATUS_PAST_DUE,
            ],
        )
        .select_related("plan")
        .first()
    )

    if not subscription:
        return {
            "has_subscription": False,
            "plan": None,
            "status": None,
            "can_access": False,
        }

    return {
        "has_subscription": True,
        "plan": {
            "id": subscription.plan.id,
            "name": subscription.plan.name,
            "slug": subscription.plan.slug,
            "price_cents": subscription.plan.price_cents,
            "features": subscription.plan.features,
            "limits": subscription.plan.limits,
        },
        "status": subscription.status,
        "is_trialing": subscription.is_trialing,
        "trial_days_remaining": subscription.trial_days_remaining,
        "current_period_end": subscription.current_period_end,
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "can_access": subscription.can_access_features,
    }
