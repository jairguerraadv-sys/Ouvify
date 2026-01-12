"""
Serviço de integração com Stripe para gerenciar assinaturas e pagamentos.
"""
import stripe
from stripe import StripeError, SignatureVerificationError
from django.conf import settings
from .models import Client


# Configurar chave API do Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


# Mapeamento de planos para price IDs do Stripe (Test Mode)
PLAN_PRICES = {
    'starter': 'price_1SorAs2LAa2LQ6ehqpXlpgGb',
    'pro': 'price_1SorEB2LAa2LQ6eh4vbGlvhW'
}


class StripeService:
    """Gerencia operações com o Stripe (Checkout, Webhooks, etc)."""

    @staticmethod
    def create_checkout_session(client: Client, plan_type: str) -> str:
        """
        Cria uma sessão de checkout no Stripe para o cliente assinar um plano.
        
        Args:
            client: Instância do modelo Client
            plan_type: Tipo do plano ('starter' ou 'pro')
        
        Returns:
            URL da sessão de checkout do Stripe
        
        Raises:
            ValueError: Se o plan_type não é válido
        """
        # Validar plan_type
        if plan_type not in PLAN_PRICES:
            raise ValueError(f"Plano inválido: {plan_type}. Deve ser um de: {list(PLAN_PRICES.keys())}")
        
        price_id = PLAN_PRICES[plan_type]
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    }
                ],
                mode='subscription',
                client_reference_id=str(client.pk),
                metadata={'plan': plan_type},
                success_url=f"{settings.BASE_URL}/dashboard?success=true",
                cancel_url=f"{settings.BASE_URL}/planos?canceled=true",
            )
            url = getattr(session, 'url', None)
            if not url:
                raise ValueError("URL de checkout não recebida do Stripe")
            return url
        except StripeError as e:
            raise ValueError(f"Erro ao criar sessão de checkout: {str(e)}")

    @staticmethod
    def handle_webhook(payload: bytes, sig_header: str) -> bool:
        """
        Valida e processa webhook do Stripe.
        Atualiza dados de assinatura quando o pagamento é confirmado.
        
        Args:
            payload: Body do request (bytes)
            sig_header: Header X-Stripe-Signature
        
        Returns:
            True se processado com sucesso
        
        Raises:
            ValueError: Se assinatura inválida ou erro ao processar
        """
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        
        if not webhook_secret:
            raise ValueError("STRIPE_WEBHOOK_SECRET não configurado em settings")
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            raise ValueError(f"Payload inválido: {str(e)}")
        except SignatureVerificationError as e:
            raise ValueError(f"Assinatura de webhook inválida: {str(e)}")
        
        # Processar evento checkout.session.completed
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            client_id = session.get('client_reference_id')
            
            if not client_id:
                raise ValueError("client_reference_id ausente no webhook")
            
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise ValueError(f"Cliente com ID {client_id} não encontrado")
            
            # Extrair informações da assinatura
            customer_id = session.get('customer')
            subscription_id = session.get('subscription')
            
            # Determinar o plano: usar metadata do checkout (mais confiável)
            plan_type = (session.get('metadata') or {}).get('plan')
            if plan_type not in PLAN_PRICES:
                plan_type = 'starter'  # Fallback seguro
            
            # Atualizar cliente
            client.stripe_customer_id = customer_id
            client.stripe_subscription_id = subscription_id
            client.plano = plan_type
            client.subscription_status = 'active'
            client.save()
        
        return True
