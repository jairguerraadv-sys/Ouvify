from typing import Any, Dict, cast

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db import transaction
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from .serializers import ClientPublicSerializer, RegisterTenantSerializer, ClientSerializer, UserSerializer, TenantAdminSerializer, ClientBrandingSerializer
from .models import Client
from .services import StripeService
from .upload_service import UploadService
import logging
import stripe

logger = logging.getLogger(__name__)


class TenantInfoView(APIView):
    """
    Retorna os dados públicos da empresa atual baseada no subdomínio.
    Acessível publicamente (não precisa de login) para GET.
    Requer autenticação para PATCH (atualização de branding).
    
    GET: Retorna informações públicas do tenant (cached)
    PATCH: Atualiza configurações de white label (requer autenticação)
    
    O TenantMiddleware já identificou a empresa e injetou no request.
    Esta view apenas serializa e retorna essas informações.
    
    Cache: 5 minutos (informações públicas mudam raramente)
    """
    def get_permissions(self):
        """GET é público, PATCH requer autenticação"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    @method_decorator(cache_page(60 * 5))  # Cache de 5 minutos
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
    
    def patch(self, request):
        """
        Atualiza configurações de white label do tenant.
        Requer autenticação e que o usuário pertença ao tenant.
        """
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            return Response(
                {
                    "detail": "Nenhuma empresa identificada neste domínio.",
                    "error": "tenant_not_found"
                }, 
                status=404
            )
        
        # Verificar se o usuário pertence a este tenant
        if hasattr(request.user, 'client') and request.user.client != tenant:
            return Response(
                {
                    "detail": "Você não tem permissão para modificar este tenant.",
                    "error": "permission_denied"
                },
                status=403
            )
        
        # Atualizar apenas campos de branding
        serializer = ClientBrandingSerializer(tenant, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Limpar cache após atualização
            from django.core.cache import cache
            cache_key = f'tenant_info_{tenant.subdominio}'
            cache.delete(cache_key)
            
            # Retornar dados atualizados
            return Response(
                ClientPublicSerializer(tenant).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadBrandingView(APIView):
    """
    Endpoint para upload de imagens de branding (logo e favicon).
    
    POST /api/upload-branding/
    Content-Type: multipart/form-data
    Headers: Authorization: Token <token>
    Body:
        - logo: arquivo de imagem (opcional)
        - favicon: arquivo de imagem (opcional)
    
    Retorna URLs das imagens após upload no Cloudinary.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        tenant = getattr(request, 'tenant', None)
        
        if not tenant:
            return Response(
                {
                    "detail": "Nenhuma empresa identificada neste domínio.",
                    "error": "tenant_not_found"
                }, 
                status=404
            )
        
        # Verificar se o usuário pertence a este tenant
        if hasattr(request.user, 'client') and request.user.client != tenant:
            return Response(
                {
                    "detail": "Você não tem permissão para modificar este tenant.",
                    "error": "permission_denied"
                },
                status=403
            )
        
        logo_file = request.FILES.get('logo')
        favicon_file = request.FILES.get('favicon')
        
        if not logo_file and not favicon_file:
            return Response(
                {
                    "detail": "Nenhum arquivo enviado. Envie 'logo' ou 'favicon'.",
                    "error": "no_file"
                },
                status=400
            )
        
        result = {
            "logo_url": None,
            "favicon_url": None,
            "errors": []
        }
        
        # Upload da logo
        if logo_file:
            success, url, error = UploadService.upload_logo(logo_file, tenant.subdominio)
            if success:
                tenant.logo = url
                result['logo_url'] = url
            else:
                result['errors'].append({"field": "logo", "message": error})
        
        # Upload do favicon
        if favicon_file:
            success, url, error = UploadService.upload_favicon(favicon_file, tenant.subdominio)
            if success:
                tenant.favicon = url
                result['favicon_url'] = url
            else:
                result['errors'].append({"field": "favicon", "message": error})
        
        # Salvar alterações se houve sucesso em algum upload
        if result['logo_url'] or result['favicon_url']:
            tenant.save()
            
            # Limpar cache
            from django.core.cache import cache
            cache_key = f'tenant_info_{tenant.subdominio}'
            cache.delete(cache_key)
            
            return Response(result, status=status.HTTP_200_OK)
        
        # Se chegou aqui, todos os uploads falharam
        return Response(
            {
                "detail": "Falha no upload de todos os arquivos",
                "errors": result['errors']
            },
            status=status.HTTP_400_BAD_REQUEST
        )


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


class UserMeView(APIView):
    """
    Retorna dados completos do usuário autenticado.
    
    GET /api/users/me/
    Headers: Authorization: Token <auth_token>
    
    Response: {
        "id": 1,
        "name": "João Silva",
        "email": "joao@empresa.com",
        "first_name": "João",
        "last_name": "Silva",
        "data_cadastro": "2026-01-14T10:30:00Z",
        "empresa": "Minha Empresa LTDA",
        "tenant_id": 1,
        "tenant_subdominio": "minhaempresa"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Buscar tenant do usuário
        try:
            tenant = Client.objects.get(owner=user)
            tenant_data = {
                'id': tenant.id,  # type: ignore[attr-defined]
                'nome': tenant.nome,
                'subdominio': tenant.subdominio,
            }
        except Client.DoesNotExist:
            tenant_data = None
        
        return Response({
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'data_cadastro': user.date_joined.isoformat(),
            'empresa': tenant_data['nome'] if tenant_data else None,
            'tenant_id': tenant_data['id'] if tenant_data else None,
            'tenant_subdominio': tenant_data['subdominio'] if tenant_data else None,
        }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """
        Atualiza dados do usuário.
        
        PATCH /api/users/me/
        Body: {
            "first_name": "João",
            "last_name": "Silva",
        }
        """
        user = request.user
        
        # Campos permitidos para atualização
        allowed_fields = ['first_name', 'last_name']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        logger.info(f"✅ Usuário atualizado | ID: {user.id} | Email: {user.email}")
        
        # Retornar dados atualizados
        return self.get(request)


class SubscriptionView(APIView):
    """
    Retorna informações da assinatura do tenant.
    
    GET /api/tenants/subscription/
    Headers: Authorization: Token <auth_token>
    
    Response: {
        "id": "sub_123abc",
        "status": "active",  # active, canceled, past_due, trialing
        "plan_name": "Pro",
        "amount": 29900,  # em centavos (R$ 299,00)
        "currency": "brl",
        "current_period_start": "2026-01-01T00:00:00Z",
        "current_period_end": "2026-02-01T00:00:00Z",
        "cancel_at_period_end": false
    }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            tenant = Client.objects.get(owner=request.user)
        except Client.DoesNotExist:
            return Response(
                {"detail": "Tenant não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Se tem stripe_subscription_id, buscar do Stripe
        if tenant.stripe_subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(tenant.stripe_subscription_id)
                
                # Mapear plano
                plan_name = "Free"
                if subscription.items and subscription.items.data:
                    price_id = subscription.items.data[0].price.id
                    if 'starter' in price_id.lower():
                        plan_name = "Starter"
                    elif 'pro' in price_id.lower():
                        plan_name = "Pro"
                
                return Response({
                    'id': subscription.id,
                    'status': subscription.status,
                    'plan_name': plan_name,
                    'amount': subscription.items.data[0].price.unit_amount if subscription.items.data else 0,
                    'currency': subscription.currency,
                    'current_period_start': subscription.current_period_start,  # type: ignore[attr-defined]
                    'current_period_end': subscription.current_period_end,  # type: ignore[attr-defined]
                    'cancel_at_period_end': subscription.cancel_at_period_end,
                    'canceled_at': subscription.canceled_at,
                }, status=status.HTTP_200_OK)
            
            except stripe.error.StripeError as e:  # type: ignore[attr-defined]
                logger.error(f"❌ Erro ao buscar assinatura do Stripe: {str(e)}")
                # Fallback para dados locais se Stripe falhar
                pass
        
        # Retornar plano Free por padrão
        from datetime import datetime, timedelta
        now = datetime.now()
        
        return Response({
            'id': f'free_{tenant.id}',  # type: ignore[attr-defined]
            'status': 'trialing',  # Período trial do plano Free
            'plan_name': 'Free',
            'amount': 0,
            'currency': 'brl',
            'current_period_start': tenant.data_criacao.isoformat() if hasattr(tenant, 'data_criacao') else now.isoformat(),
            'current_period_end': (now + timedelta(days=30)).isoformat(),
            'cancel_at_period_end': False,
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        Cancela a assinatura do tenant.
        
        POST /api/tenants/subscription/cancel/
        """
        try:
            tenant = Client.objects.get(owner=request.user)
        except Client.DoesNotExist:
            return Response(
                {"detail": "Tenant não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not tenant.stripe_subscription_id:
            return Response(
                {"detail": "Nenhuma assinatura ativa para cancelar"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Cancelar no final do período (não imediatamente)
            subscription = stripe.Subscription.modify(
                tenant.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            logger.info(f"✅ Assinatura cancelada | Tenant: {tenant.subdominio} | Sub ID: {tenant.stripe_subscription_id}")
            
            return Response({
                'message': 'Assinatura cancelada com sucesso. Você terá acesso até o final do período pago.',
                'current_period_end': subscription.current_period_end,  # type: ignore[attr-defined]
            }, status=status.HTTP_200_OK)
        
        except stripe.error.StripeError as e:  # type: ignore[attr-defined]
            logger.error(f"❌ Erro ao cancelar assinatura: {str(e)}")
            return Response(
                {"detail": "Erro ao cancelar assinatura", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
