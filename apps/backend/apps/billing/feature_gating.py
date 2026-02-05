"""
Feature Gating - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe

Decorators e utilitários para controle de acesso baseado em planos.
"""

from functools import wraps
from typing import List, Optional

from rest_framework import status
from rest_framework.response import Response

from .models import Subscription


def require_plan(
    required_features: Optional[List[str]] = None,
    min_plan_slug: Optional[str] = None,
    check_limit: Optional[str] = None,
    limit_value_getter: Optional[callable] = None,
):
    """
    Decorator que verifica se o usuário tem acesso a uma feature/plano.

    Usage:
        @require_plan(required_features=['analytics'])
        def analytics_view(request):
            ...

        @require_plan(min_plan_slug='professional')
        def premium_view(request):
            ...

        @require_plan(check_limit='feedbacks_per_month', limit_value_getter=get_feedback_count)
        def create_feedback(request):
            ...

    Args:
        required_features: Lista de features que devem estar habilitadas
        min_plan_slug: Slug mínimo do plano requerido (free < starter < professional < enterprise)
        check_limit: Nome do limite a verificar
        limit_value_getter: Função que recebe request e retorna valor atual do limite
    """

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Verifica se usuário está autenticado
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Autenticação necessária"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Obtém client do usuário
            client = getattr(request.user, "client", None)
            if not client:
                return Response(
                    {"error": "Usuário não possui tenant associado"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Busca subscription ativa
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
                return Response(
                    {
                        "error": "Assinatura não encontrada",
                        "code": "NO_SUBSCRIPTION",
                        "message": "Você precisa de uma assinatura ativa para acessar este recurso.",
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            if not subscription.can_access_features:
                return Response(
                    {
                        "error": "Assinatura inativa",
                        "code": "SUBSCRIPTION_INACTIVE",
                        "status": subscription.status,
                        "message": "Sua assinatura não está ativa. Verifique seu pagamento.",
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            # Verifica features requeridas
            if required_features:
                missing_features = [
                    f for f in required_features if not subscription.has_feature(f)
                ]
                if missing_features:
                    return Response(
                        {
                            "error": "Feature não disponível no plano",
                            "code": "FEATURE_NOT_AVAILABLE",
                            "missing_features": missing_features,
                            "current_plan": subscription.plan.slug,
                            "message": f'Este recurso requer as features: {", ".join(missing_features)}',
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # Verifica plano mínimo
            if min_plan_slug:
                plan_hierarchy = ["free", "starter", "professional", "enterprise"]
                try:
                    current_level = plan_hierarchy.index(subscription.plan.slug)
                    required_level = plan_hierarchy.index(min_plan_slug)

                    if current_level < required_level:
                        return Response(
                            {
                                "error": "Plano insuficiente",
                                "code": "UPGRADE_REQUIRED",
                                "current_plan": subscription.plan.slug,
                                "required_plan": min_plan_slug,
                                "message": f"Este recurso requer o plano {min_plan_slug} ou superior.",
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except ValueError:
                    # Plano não está na hierarquia, permite acesso
                    pass

            # Verifica limite
            if check_limit and limit_value_getter:
                current_value = limit_value_getter(request)
                if not subscription.check_limit(check_limit, current_value):
                    limit = subscription.plan.get_limit(check_limit)
                    return Response(
                        {
                            "error": "Limite atingido",
                            "code": "LIMIT_EXCEEDED",
                            "limit_name": check_limit,
                            "current_value": current_value,
                            "limit": limit,
                            "message": f"Você atingiu o limite de {limit} para {check_limit}.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # Adiciona subscription ao request para uso posterior
            request.subscription = subscription

            return view_func(request, *args, **kwargs)

        return wrapped_view

    return decorator


def get_client_subscription(client):
    """
    Retorna a subscription ativa de um client.

    Args:
        client: Instância do Client (tenant)

    Returns:
        Subscription ou None
    """
    # Usa all_tenants() para evitar filtro do TenantAwareManager
    # já que estamos filtrando explicitamente pelo client
    return (
        Subscription.objects.all_tenants()
        .filter(
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


def check_feature_access(client, feature_name: str) -> bool:
    """
    Verifica se um client tem acesso a uma feature.

    Args:
        client: Instância do Client (tenant)
        feature_name: Nome da feature

    Returns:
        True se tem acesso, False caso contrário
    """
    subscription = get_client_subscription(client)
    if not subscription:
        return False
    return subscription.has_feature(feature_name)


def check_limit_access(client, limit_name: str, current_value: int) -> bool:
    """
    Verifica se um client está dentro do limite.

    Args:
        client: Instância do Client (tenant)
        limit_name: Nome do limite
        current_value: Valor atual

    Returns:
        True se está dentro do limite, False caso contrário
    """
    subscription = get_client_subscription(client)
    if not subscription:
        return False
    return subscription.check_limit(limit_name, current_value)


def get_plan_limits(client) -> dict:
    """
    Retorna os limites do plano atual de um client.

    Args:
        client: Instância do Client (tenant)

    Returns:
        Dict com os limites ou dict vazio
    """
    subscription = get_client_subscription(client)
    if not subscription:
        return {}
    return subscription.plan.limits


def get_plan_features(client) -> dict:
    """
    Retorna as features do plano atual de um client.

    Args:
        client: Instância do Client (tenant)

    Returns:
        Dict com as features ou dict vazio
    """
    subscription = get_client_subscription(client)
    if not subscription:
        return {}
    return subscription.plan.features
