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

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from apps.tenants.models import Client
from .models import Plan, Subscription, Invoice
from .serializers import (
    PlanSerializer,
    PlanPublicSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    CheckoutRequestSerializer,
    CheckoutResponseSerializer,
    PortalRequestSerializer,
    PortalResponseSerializer,
    SubscriptionStatusSerializer,
    CancelSubscriptionSerializer
)
from . import stripe_service

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
        return getattr(self.request.user, 'client', None)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        GET /api/v1/billing/subscription/status/
        Retorna status da assinatura atual.
        """
        client = self.get_client()
        if not client:
            return Response(
                {'error': 'Usuário não possui client associado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription_status = stripe_service.get_subscription_status(client)
        serializer = SubscriptionStatusSerializer(subscription_status)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """
        POST /api/v1/billing/subscription/checkout/
        Cria sessão de checkout do Stripe.
        """
        client = self.get_client()
        if not client:
            return Response(
                {'error': 'Usuário não possui client associado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            plan = Plan.objects.get(
                id=serializer.validated_data['plan_id'],
                is_active=True
            )
        except Plan.DoesNotExist:
            return Response(
                {'error': 'Plano não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            result = stripe_service.create_checkout_session(
                client=client,
                plan=plan,
                success_url=serializer.validated_data['success_url'],
                cancel_url=serializer.validated_data['cancel_url']
            )
            response_serializer = CheckoutResponseSerializer(result)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Erro ao criar checkout: {e}")
            return Response(
                {'error': 'Erro ao criar sessão de checkout'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def portal(self, request):
        """
        POST /api/v1/billing/subscription/portal/
        Cria sessão do portal de billing do Stripe.
        """
        client = self.get_client()
        if not client:
            return Response(
                {'error': 'Usuário não possui client associado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PortalRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = stripe_service.create_billing_portal_session(
                client=client,
                return_url=serializer.validated_data['return_url']
            )
            response_serializer = PortalResponseSerializer(result)
            return Response(response_serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Erro ao criar portal: {e}")
            return Response(
                {'error': 'Erro ao criar sessão do portal'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """
        POST /api/v1/billing/subscription/cancel/
        Cancela a assinatura atual.
        """
        client = self.get_client()
        if not client:
            return Response(
                {'error': 'Usuário não possui client associado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CancelSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        subscription = Subscription.objects.filter(
            client=client,
            status__in=[Subscription.STATUS_ACTIVE, Subscription.STATUS_TRIALING]
        ).first()
        
        if not subscription:
            return Response(
                {'error': 'Nenhuma assinatura ativa encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            result = stripe_service.cancel_subscription(
                subscription=subscription,
                at_period_end=serializer.validated_data['at_period_end']
            )
            return Response({
                'message': 'Assinatura cancelada com sucesso',
                **result
            })
        except Exception as e:
            logger.error(f"Erro ao cancelar assinatura: {e}")
            return Response(
                {'error': 'Erro ao cancelar assinatura'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        client = getattr(self.request.user, 'client', None)
        if not client:
            return Invoice.objects.none()
        return Invoice.objects.filter(client=client)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Endpoint para receber webhooks do Stripe.
    
    POST /api/v1/billing/webhook/
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        if not sig_header:
            return Response(
                {'error': 'Missing Stripe-Signature header'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = stripe_service.handle_webhook_event(payload, sig_header)
            return Response(result)
        except ValueError as e:
            logger.error(f"Webhook payload error: {e}")
            return Response(
                {'error': 'Invalid payload'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return Response(
                {'error': 'Webhook processing failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
