from typing import Any, Dict, cast

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
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
    Permite listar, detalhar, atualizar status e plano.
    
    Endpoints:
    - GET /api/admin/tenants/ - Listar todos (com filtros)
    - GET /api/admin/tenants/{id}/ - Detalhes
    - PATCH /api/admin/tenants/{id}/ - Atualizar (ativo, plano)
    - GET /api/admin/tenants/metrics/ - Métricas gerais (MRR real)
    - POST /api/admin/tenants/{id}/impersonate/ - Gerar token de impersonation
    """

    queryset = Client.objects.all().select_related('owner').order_by('-data_criacao')
    serializer_class = TenantAdminSerializer
    permission_classes = [IsAdminUser]

    http_method_names = ['get', 'head', 'options', 'patch', 'put', 'post']
    
    def get_queryset(self):
        """Aplica filtros de busca e ordenação."""
        queryset = super().get_queryset()
        
        # Busca por nome ou subdomínio
        search = self.request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(subdominio__icontains=search)
            )
        
        # Filtro por status ativo
        ativo = self.request.query_params.get('ativo')
        if ativo is not None:
            queryset = queryset.filter(ativo=ativo.lower() == 'true')
        
        # Filtro por plano
        plano = self.request.query_params.get('plano', '').strip()
        if plano:
            queryset = queryset.filter(plano=plano)
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', '-data_criacao')
        allowed_orderings = ['nome', '-nome', 'data_criacao', '-data_criacao', 'plano', '-plano']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        
        return queryset

    def perform_update(self, serializer):
        """Log de alterações e atualização de plano no Stripe se necessário."""
        old_instance = self.get_object()
        old_plano = old_instance.plano
        old_ativo = old_instance.ativo
        
        instance = serializer.save()
        
        # Log detalhado
        changes = []
        if old_plano != instance.plano:
            changes.append(f"plano: {old_plano} → {instance.plano}")
        if old_ativo != instance.ativo:
            changes.append(f"ativo: {old_ativo} → {instance.ativo}")
        
        change_str = ", ".join(changes) if changes else "sem alterações"
        logger.info(
            f"🔒 Tenant atualizado pelo superadmin | "
            f"Tenant: {instance.subdominio} | "
            f"Admin: {self.request.user.username} | "
            f"Alterações: {change_str}"
        )
    
    @action(detail=False, methods=['get'], url_path='metrics')
    def metrics(self, request):
        """
        Retorna métricas agregadas de todos os tenants.
        Inclui MRR real do Stripe quando disponível.
        """
        from django.db.models import Count, Q
        from datetime import datetime, timedelta
        
        tenants = Client.objects.all()
        now = datetime.now()
        inicio_mes = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Agregações
        stats = tenants.aggregate(
            total=Count('id'),
            ativos=Count('id', filter=Q(ativo=True)),
            inativos=Count('id', filter=Q(ativo=False)),
            free=Count('id', filter=Q(plano='free')),
            starter=Count('id', filter=Q(plano='starter')),
            pro=Count('id', filter=Q(plano='pro')),
            enterprise=Count('id', filter=Q(plano='enterprise')),
            novos_mes=Count('id', filter=Q(data_criacao__gte=inicio_mes)),
        )
        
        # Calcular MRR real baseado nos planos
        PLAN_PRICES_BRL = {
            'free': 0,
            'starter': 99,
            'pro': 299,
            'enterprise': 999,
        }
        
        mrr = 0
        for plano, preco in PLAN_PRICES_BRL.items():
            count = tenants.filter(plano=plano, ativo=True, subscription_status='active').count()
            mrr += count * preco
        
        # Tentar obter MRR do Stripe (se configurado)
        stripe_mrr = None
        try:
            subscriptions = stripe.Subscription.list(status='active', limit=100)
            stripe_mrr = sum(
                sub.items.data[0].price.unit_amount / 100 
                for sub in subscriptions.auto_paging_iter()
                if sub.items.data
            )
        except Exception as e:
            logger.warning(f"Não foi possível obter MRR do Stripe: {e}")
        
        # Calcular churn (cancelamentos no último mês)
        churn_count = tenants.filter(
            subscription_status='canceled',
            data_atualizacao__gte=inicio_mes
        ).count()
        
        total_inicio_mes = tenants.filter(data_criacao__lt=inicio_mes).count()
        churn_rate = (churn_count / total_inicio_mes * 100) if total_inicio_mes > 0 else 0
        
        return Response({
            'total_tenants': stats['total'],
            'tenants_ativos': stats['ativos'],
            'tenants_inativos': stats['inativos'],
            'novos_mes': stats['novos_mes'],
            'distribuicao_planos': {
                'free': stats['free'],
                'starter': stats['starter'],
                'pro': stats['pro'],
                'enterprise': stats['enterprise'],
            },
            'mrr': mrr,
            'mrr_stripe': stripe_mrr,
            'churn_rate': round(churn_rate, 2),
            'churn_count': churn_count,
        })
    
    @action(detail=True, methods=['post'], url_path='impersonate')
    def impersonate(self, request, pk=None):
        """
        Gera um token temporário para o admin acessar o painel do tenant.
        Token válido por 1 hora.
        """
        tenant = self.get_object()
        
        if not tenant.owner:
            return Response(
                {"error": "Tenant não possui owner associado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Gerar token JWT temporário para o owner do tenant
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(tenant.owner)
        # Adicionar claim customizado para identificar impersonation
        refresh['impersonation'] = True
        refresh['impersonated_by'] = request.user.id
        refresh['tenant_id'] = tenant.id
        
        # Definir expiração curta (1 hora)
        refresh.set_exp(lifetime=timedelta(hours=1))
        
        logger.warning(
            f"⚠️ IMPERSONATION | Admin: {request.user.username} | "
            f"Tenant: {tenant.subdominio} | Owner: {tenant.owner.username}"
        )
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'tenant': {
                'id': tenant.id,
                'nome': tenant.nome,
                'subdominio': tenant.subdominio,
            },
            'expires_in': 3600,
            'warning': 'Este token é para impersonation. Use com responsabilidade.'
        })
    
    @action(detail=True, methods=['get'], url_path='activity-logs')
    def activity_logs(self, request, pk=None):
        """
        Retorna histórico de atividades do tenant.
        """
        tenant = self.get_object()
        
        # Buscar feedbacks recentes como proxy de atividade
        from apps.feedbacks.models import Feedback, FeedbackInteracao
        
        activities = []
        
        # Feedbacks criados
        feedbacks = Feedback.objects.filter(client=tenant).order_by('-data_criacao')[:20]
        for fb in feedbacks:
            activities.append({
                'id': fb.id,
                'acao': 'feedback_criado',
                'descricao': f"Feedback #{fb.protocolo} criado: {fb.titulo[:50]}",
                'data': fb.data_criacao.isoformat(),
                'autor': fb.email_contato if not fb.anonimo else 'Anônimo',
                'ip_address': None,
            })
        
        # Interações recentes
        interacoes = FeedbackInteracao.objects.filter(
            feedback__client=tenant
        ).select_related('feedback', 'autor').order_by('-data')[:20]
        
        for inter in interacoes:
            activities.append({
                'id': inter.id,
                'acao': f'interacao_{inter.tipo.lower()}',
                'descricao': f"Interação em #{inter.feedback.protocolo}: {inter.mensagem[:50]}...",
                'data': inter.data.isoformat(),
                'autor': inter.autor.username if inter.autor else 'Sistema',
                'ip_address': None,
            })
        
        # Ordenar por data
        activities.sort(key=lambda x: x['data'], reverse=True)
        
        return Response({
            'tenant_id': tenant.id,
            'tenant_nome': tenant.nome,
            'activities': activities[:50],
            'total': len(activities),
        })


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
