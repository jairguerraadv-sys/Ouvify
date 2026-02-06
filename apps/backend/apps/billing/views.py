"""
Billing Views - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe

Endpoints:
- GET /api/v1/billing/plans/ - Lista planos disponíveis
- GET /api/v1/billing/subscription/ - Status da assinatura atual
- POST /api/v1/billing/checkout/ - Cria sessão de checkout
- POST /api/v1/billing/portal/ - Cria sessão do portal de billing
- POST /api/v1/billing/cancel/ - Cancela assinatura
- POST /api/v1/billing/webhook/ - Webhook do Stripe
- GET /api/v1/billing/invoices/ - Lista faturas
"""

import logging

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import stripe_service
from .models import Invoice, Plan, Subscription
from .serializers import (
    CancelSubscriptionSerializer,
    CheckoutRequestSerializer,
    CheckoutResponseSerializer,
    InvoiceSerializer,
    PlanPublicSerializer,
    PlanSerializer,
    PortalRequestSerializer,
    PortalResponseSerializer,
    SubscriptionStatusSerializer,
)

logger = logging.getLogger(__name__)


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para planos de assinatura.

    GET /api/v1/billing/plans/ - Lista planos ativos
    GET /api/v1/billing/plans/{id}/ - Detalhes de um plano
    """

    queryset = Plan.objects.filter(is_active=True)
    permission_classes = [AllowAny]  # Planos são públicos

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return PlanSerializer
        return PlanPublicSerializer


class SubscriptionViewSet(viewsets.ViewSet):
    """
    ViewSet para gerenciamento de assinaturas.
    """

    permission_classes = [IsAuthenticated]

    def get_client(self):
        """Retorna o client do usuário autenticado."""
        return getattr(self.request.user, "client", None)

    @action(detail=False, methods=["get"])
    def status(self, request):
        """
        GET /api/v1/billing/subscription/status/
        Retorna status da assinatura atual.
        """
        client = self.get_client()
        if not client:
            return Response(
                {"error": "Usuário não possui client associado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription_status = stripe_service.get_subscription_status(client)
        serializer = SubscriptionStatusSerializer(subscription_status)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def checkout(self, request):
        """
        POST /api/v1/billing/subscription/checkout/
        Cria sessão de checkout do Stripe.
        """
        client = self.get_client()
        if not client:
            return Response(
                {"error": "Usuário não possui client associado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            plan = Plan.objects.get(
                id=serializer.validated_data["plan_id"], is_active=True
            )
        except Plan.DoesNotExist:
            return Response(
                {"error": "Plano não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            result = stripe_service.create_checkout_session(
                client=client,
                plan=plan,
                success_url=serializer.validated_data["success_url"],
                cancel_url=serializer.validated_data["cancel_url"],
            )
            response_serializer = CheckoutResponseSerializer(result)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erro ao criar checkout: {e}")
            return Response(
                {"error": "Erro ao criar sessão de checkout"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def portal(self, request):
        """
        POST /api/v1/billing/subscription/portal/
        Cria sessão do portal de billing do Stripe.
        """
        client = self.get_client()
        if not client:
            return Response(
                {"error": "Usuário não possui client associado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PortalRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = stripe_service.create_billing_portal_session(
                client=client, return_url=serializer.validated_data["return_url"]
            )
            response_serializer = PortalResponseSerializer(result)
            return Response(response_serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erro ao criar portal: {e}")
            return Response(
                {"error": "Erro ao criar sessão do portal"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def cancel(self, request):
        """
        POST /api/v1/billing/subscription/cancel/
        Cancela a assinatura atual.
        """
        client = self.get_client()
        if not client:
            return Response(
                {"error": "Usuário não possui client associado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription = Subscription.objects.filter(
            client=client,
            status__in=[Subscription.STATUS_ACTIVE, Subscription.STATUS_TRIALING],
        ).first()

        if not subscription:
            return Response(
                {"error": "Nenhuma assinatura ativa encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            result = stripe_service.cancel_subscription(
                subscription=subscription,
                at_period_end=serializer.validated_data["at_period_end"],
            )
            return Response({"message": "Assinatura cancelada com sucesso", **result})
        except Exception as e:
            logger.error(f"Erro ao cancelar assinatura: {e}")
            return Response(
                {"error": "Erro ao cancelar assinatura"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para faturas.

    GET /api/v1/billing/invoices/ - Lista faturas do tenant
    GET /api/v1/billing/invoices/{id}/ - Detalhes de uma fatura
    """

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        client = getattr(self.request.user, "client", None)
        if not client:
            return Invoice.objects.none()
        return Invoice.objects.filter(client=client)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    """
    Endpoint para receber webhooks do Stripe.

    POST /api/v1/billing/webhook/
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        if not sig_header:
            return Response(
                {"error": "Missing Stripe-Signature header"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = stripe_service.handle_webhook_event(payload, sig_header)
            return Response(result)
        except ValueError as e:
            logger.error(f"Webhook payload error: {e}")
            return Response(
                {"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return Response(
                {"error": "Webhook processing failed"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UsageStatsView(APIView):
    """
    Endpoint para estatísticas de uso de features (Feature Gating).
    
    GET /api/v1/billing/usage/
    
    Retorna:
        - plan: slug do plano atual
        - plan_name: nome do plano
        - feedbacks_used: feedbacks criados este mês
        - feedbacks_limit: limite de feedbacks/mês (-1 = ilimitado)
        - usage_percent: porcentagem de uso (0-100)
        - is_blocked: se atingiu o limite
        - is_near_limit: se está próximo do limite (>80%)
    
    Usado pelo frontend para:
    - Exibir alertas quando próximo do limite (80%)
    - Bloquear botão "Novo Feedback" quando no limite (100%)
    - Mostrar barra de progresso de uso
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        from apps.feedbacks.models import Feedback
        from .feature_gating import get_client_subscription

        client = getattr(request.user, "client", None)
        if not client:
            return Response(
                {"error": "Usuário não possui client associado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Busca subscription ativa
        subscription = get_client_subscription(client)
        
        if not subscription:
            return Response(
                {"error": "Assinatura não encontrada"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        plan = subscription.plan

        # Conta feedbacks do mês atual
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        feedbacks_used = Feedback.objects.filter(
            client=client,
            data_criacao__gte=month_start
        ).count()

        # Determina limite do plano
        feedbacks_limit = plan.get_limit('feedbacks_per_month')
        
        # Se não tem limite no JSON, usa lógica por slug
        if feedbacks_limit is None:
            if plan.slug == 'free':
                feedbacks_limit = 50
            else:
                feedbacks_limit = -1  # Ilimitado

        # Calcula porcentagem e flags
        if feedbacks_limit > 0:
            usage_percent = (feedbacks_used / feedbacks_limit) * 100
            is_blocked = feedbacks_used >= feedbacks_limit
            is_near_limit = usage_percent > 80
        else:
            # Ilimitado
            usage_percent = 0
            is_blocked = False
            is_near_limit = False

        data = {
            'plan': plan.slug,
            'plan_name': plan.name,
            'feedbacks_used': feedbacks_used,
            'feedbacks_limit': feedbacks_limit,
            'usage_percent': round(usage_percent, 1),
            'is_blocked': is_blocked,
            'is_near_limit': is_near_limit,
        }

        from .serializers import UsageStatsSerializer
        serializer = UsageStatsSerializer(data)
        return Response(serializer.data)

