from typing import Any, Dict, cast

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db import transaction
from .serializers import ClientPublicSerializer, RegisterTenantSerializer, ClientSerializer, UserSerializer, TenantAdminSerializer
from .models import Client
from .services import StripeService
import logging
import stripe

logger = logging.getLogger(__name__)


class TenantInfoView(APIView):
    """
    Retorna os dados públicos da empresa atual baseada no subdomínio.
    Acessível publicamente (não precisa de login).
    
    O TenantMiddleware já identificou a empresa e injetou no request.
    Esta view apenas serializa e retorna essas informações.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # O TenantMiddleware já injetou o 'tenant' dentro do request
        tenant = getattr(request, 'tenant', None)

        if not tenant:
            return Response(
                {
                    "detail": "Nenhuma empresa identificada neste domínio.",
                    "error": "tenant_not_found"
                }, 
                status=404
            )
        
        # Transforma o objeto Python em JSON seguro
        serializer = ClientPublicSerializer(tenant)
        return Response(serializer.data)


class RegisterTenantView(APIView):
    """
    Endpoint de registro de novo tenant (SaaS Signup).
    
    Cria atomicamente:
    1. Usuário proprietário
    2. Tenant (empresa) vinculado ao usuário
    3. Token de autenticação para login imediato
    
    POST /api/register-tenant/
    Body: {
        "nome": "João Silva",
        "email": "joao@empresa.com",
        "senha": "senhaSegura123",
        "nome_empresa": "Minha Empresa LTDA",
        "subdominio_desejado": "minhaempresa"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterTenantSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Dados inválidos",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data: Dict[str, Any] = cast(Dict[str, Any], serializer.validated_data)
        
        try:
            with transaction.atomic():
                # 1. Criar o usuário
                user = User.objects.create_user(
                    username=data.get('email', ''),  # type: ignore[arg-type]
                    email=data.get('email', ''),  # type: ignore[arg-type]
                    password=data.get('senha', ''),  # type: ignore[arg-type]
                    first_name=data.get('nome', '').split()[0] if data.get('nome') else '',  # type: ignore[arg-type]
                    last_name=' '.join(data.get('nome', '').split()[1:]) if len(data.get('nome', '').split()) > 1 else ''  # type: ignore[arg-type]
                )
                
                # 2. Criar o tenant (empresa)
                tenant = Client.objects.create(
                    owner=user,
                    nome=data.get('nome_empresa', ''),  # type: ignore[arg-type]
                    subdominio=data.get('subdominio_desejado', ''),  # type: ignore[arg-type]
                    ativo=True
                )
                
                # 3. Criar token de autenticação
                token, _ = Token.objects.get_or_create(user=user)
                
                logger.info(
                    f"✅ Novo tenant criado | "
                    f"Empresa: {tenant.nome} | "
                    f"Subdomínio: {tenant.subdominio} | "
                    f"Owner: {user.email}"
                )
                
                # 4. Retornar dados completos
                return Response(
                    {
                        "message": "Conta criada com sucesso!",
                        "user": UserSerializer(user).data,
                        "tenant": ClientSerializer(tenant).data,
                        "token": token.key,
                        "dashboard_url": f"http://{tenant.subdominio}.localhost:3000/dashboard"
                    },
                    status=status.HTTP_201_CREATED
                )
        
        except Exception as e:
            logger.error(f"❌ Erro ao criar tenant: {str(e)}")
            return Response(
                {
                    "detail": "Erro ao criar conta. Tente novamente.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CheckSubdominioView(APIView):
    """
    Verifica se um subdomínio está disponível para registro.
    
    GET /api/check-subdominio/?subdominio=minhaempresa
    Response: {
        "available": true,
        "subdominio": "minhaempresa"
    }
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        subdominio = request.query_params.get('subdominio', '').strip().lower()
        
        if not subdominio:
            return Response(
                {
                    "detail": "Parâmetro 'subdominio' é obrigatório",
                    "available": False
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar formato
        import re
        if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', subdominio):
            return Response(
                {
                    "available": False,
                    "subdominio": subdominio,
                    "message": "Formato inválido. Use apenas letras minúsculas, números e hífens."
                },
                status=status.HTTP_200_OK
            )
        
        # Verificar palavras reservadas
        reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'ouvy', 'blog', 'docs', 'help', 'status']
        if subdominio in reserved:
            return Response(
                {
                    "available": False,
                    "subdominio": subdominio,
                    "message": "Este subdomínio está reservado"
                },
                status=status.HTTP_200_OK
            )
        
        # Verificar se já existe no banco
        exists = Client.objects.filter(subdominio=subdominio).exists()
        
        return Response(
            {
                "available": not exists,
                "subdominio": subdominio,
                "message": "Disponível" if not exists else "Já está em uso"
            },
            status=status.HTTP_200_OK
        )


class TenantAdminViewSet(viewsets.ModelViewSet):
    """
    Gestão administrativa de tenants (somente superusuários).
    Permite listar, detalhar e atualizar status.
    """

    queryset = Client.objects.all()
    serializer_class = TenantAdminSerializer
    permission_classes = [IsAdminUser]

    http_method_names = ['get', 'head', 'options', 'patch', 'put']

    def perform_update(self, serializer):
        # Apenas log simples; regras extras podem ser adicionadas aqui
        instance = serializer.save()
        logger.info(
            f"🔒 Tenant atualizado pelo superadmin | Tenant: {instance.subdominio} | Ativo: {instance.ativo}"
        )


class CreateCheckoutSessionView(APIView):
    """
    Cria uma sessão de checkout no Stripe para o usuário assinar um plano.
    
    POST /api/tenants/subscribe/
    Headers: Authorization: Token <auth_token>
    Body: {
        "plano": "starter"  # ou "pro"
    }
    
    Response: {
        "url": "https://checkout.stripe.com/pay/..."
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        plano = request.data.get('plano', '').lower().strip()
        
        if not plano:
            return Response(
                {
                    "detail": "Campo 'plano' é obrigatório",
                    "error": "missing_plan"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obter o cliente (tenant) do usuário autenticado
        try:
            client = Client.objects.get(owner=request.user)
        except Client.DoesNotExist:
            return Response(
                {
                    "detail": "Usuário não tem um tenant associado",
                    "error": "no_tenant"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            checkout_url = StripeService.create_checkout_session(client, plano)
            logger.info(f"✅ Sessão de checkout criada | Tenant: {client.subdominio} | Plano: {plano}")
            return Response(
                {
                    "url": checkout_url
                },
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            logger.error(f"❌ Erro ao criar checkout: {str(e)}")
            return Response(
                {
                    "detail": str(e),
                    "error": "stripe_error"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Erro inesperado ao criar checkout: {str(e)}")
            return Response(
                {
                    "detail": "Erro ao processar pagamento",
                    "error": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StripeWebhookView(APIView):
    """
    Webhook do Stripe para processar eventos de pagamento.
    
    O Stripe chama isso quando um evento acontece (ex: checkout.session.completed).
    Esta view processa o evento e atualiza o banco de dados.
    
    POST /api/tenants/webhook/
    Headers: X-Stripe-Signature: <signature>
    Body: (raw JSON do Stripe)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            logger.warning("❌ Webhook recebido sem assinatura Stripe")
            return Response(
                {
                    "detail": "Header X-Stripe-Signature ausente",
                    "error": "missing_signature"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            StripeService.handle_webhook(payload, sig_header)
            logger.info("✅ Webhook do Stripe processado com sucesso")
            return Response(
                {
                    "status": "success"
                },
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            logger.warning(f"⚠️ Webhook inválido: {str(e)}")
            return Response(
                {
                    "detail": str(e),
                    "error": "invalid_webhook"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Erro ao processar webhook: {str(e)}")
            return Response(
                {
                    "detail": "Erro ao processar webhook",
                    "error": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
