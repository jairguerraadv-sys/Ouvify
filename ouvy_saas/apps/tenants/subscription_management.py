"""
Views adicionais para gestão de assinaturas.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.tenants.models import Client
from apps.tenants.services import StripeService
import logging
import stripe

logger = logging.getLogger(__name__)


class ManageSubscriptionView(APIView):
    """
    Gerencia assinatura do cliente (visualizar, cancelar, atualizar).
    
    GET /api/tenants/subscription/
    - Retorna informações da assinatura atual
    
    DELETE /api/tenants/subscription/
    - Cancela a assinatura ao final do período atual
    
    PATCH /api/tenants/subscription/
    - Atualiza o plano da assinatura
    Body: { "new_plan": "pro" }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Retorna informações da assinatura atual"""
        try:
            client = Client.objects.get(owner=request.user)
            
            if not client.stripe_subscription_id:
                return Response(
                    {
                        "plano": client.plano or "free",
                        "status": "free",
                        "has_subscription": False,
                        "message": "Nenhuma assinatura ativa"
                    },
                    status=status.HTTP_200_OK
                )
            
            # Buscar detalhes no Stripe
            try:
                subscription = stripe.Subscription.retrieve(client.stripe_subscription_id)
                
                return Response(
                    {
                        "plano": client.plano,
                        "status": subscription.status,
                        "current_period_end": subscription.current_period_end,
                        "cancel_at_period_end": subscription.cancel_at_period_end,
                        "has_subscription": True,
                        "stripe_customer_id": client.stripe_customer_id,
                    },
                    status=status.HTTP_200_OK
                )
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erro ao buscar assinatura no Stripe: {str(e)}")
                return Response(
                    {
                        "plano": client.plano,
                        "status": client.subscription_status,
                        "has_subscription": True,
                        "error": "Erro ao buscar detalhes no Stripe"
                    },
                    status=status.HTTP_200_OK
                )
        
        except Client.DoesNotExist:
            return Response(
                {"detail": "Cliente não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request):
        """Cancela a assinatura ao final do período atual"""
        try:
            client = Client.objects.get(owner=request.user)
            
            if not client.stripe_subscription_id:
                return Response(
                    {"detail": "Nenhuma assinatura ativa para cancelar"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cancelar no Stripe (ao final do período)
            try:
                subscription = stripe.Subscription.modify(
                    client.stripe_subscription_id,
                    cancel_at_period_end=True
                )
                
                logger.info(
                    f"✅ Assinatura cancelada | "
                    f"Cliente: {client.nome} | "
                    f"Subscription ID: {client.stripe_subscription_id}"
                )
                
                return Response(
                    {
                        "message": "Assinatura cancelada com sucesso",
                        "detail": "Seu acesso permanecerá ativo até o final do período pago",
                        "cancel_at": subscription.current_period_end
                    },
                    status=status.HTTP_200_OK
                )
            
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erro ao cancelar no Stripe: {str(e)}")
                return Response(
                    {"detail": "Erro ao cancelar assinatura. Tente novamente."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Client.DoesNotExist:
            return Response(
                {"detail": "Cliente não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request):
        """Atualiza o plano da assinatura"""
        new_plan = request.data.get('new_plan', '').lower()
        
        if new_plan not in ['starter', 'pro']:
            return Response(
                {"detail": "Plano inválido. Use 'starter' ou 'pro'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            client = Client.objects.get(owner=request.user)
            
            if not client.stripe_subscription_id:
                return Response(
                    {"detail": "Crie uma assinatura primeiro antes de atualizar"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Atualizar no Stripe
            try:
                subscription = stripe.Subscription.retrieve(client.stripe_subscription_id)
                
                # Obter o price ID do novo plano
                from apps.tenants.services import PLAN_PRICES
                new_price_id = PLAN_PRICES.get(new_plan)
                
                if not new_price_id:
                    return Response(
                        {"detail": "Price ID não configurado para este plano"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Atualizar subscription item
                stripe.Subscription.modify(
                    client.stripe_subscription_id,
                    items=[{
                        'id': subscription['items'].data[0].id,
                        'price': new_price_id,
                    }],
                    proration_behavior='create_prorations',  # Cobra/credita proporcional
                )
                
                # Atualizar no banco
                client.plano = new_plan
                client.save()
                
                logger.info(
                    f"✅ Plano atualizado | "
                    f"Cliente: {client.nome} | "
                    f"Novo plano: {new_plan}"
                )
                
                return Response(
                    {
                        "message": "Plano atualizado com sucesso",
                        "new_plan": new_plan,
                        "detail": "O valor proporcional será ajustado na próxima fatura"
                    },
                    status=status.HTTP_200_OK
                )
            
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erro ao atualizar plano no Stripe: {str(e)}")
                return Response(
                    {"detail": "Erro ao atualizar plano. Tente novamente."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Client.DoesNotExist:
            return Response(
                {"detail": "Cliente não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )


class ReactivateSubscriptionView(APIView):
    """
    Reativa uma assinatura que foi cancelada mas ainda não expirou.
    
    POST /api/tenants/subscription/reactivate/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            client = Client.objects.get(owner=request.user)
            
            if not client.stripe_subscription_id:
                return Response(
                    {"detail": "Nenhuma assinatura encontrada"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reativar no Stripe
            try:
                stripe.Subscription.modify(
                    client.stripe_subscription_id,
                    cancel_at_period_end=False
                )
                
                logger.info(
                    f"✅ Assinatura reativada | "
                    f"Cliente: {client.nome}"
                )
                
                return Response(
                    {
                        "message": "Assinatura reativada com sucesso",
                        "detail": "Sua assinatura continuará renovando normalmente"
                    },
                    status=status.HTTP_200_OK
                )
            
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erro ao reativar no Stripe: {str(e)}")
                return Response(
                    {"detail": "Erro ao reativar assinatura. Tente novamente."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Client.DoesNotExist:
            return Response(
                {"detail": "Cliente não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
