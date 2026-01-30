class TenantIsolationMiddleware:
    """
    Middleware para garantir isolamento de dados multi-tenant.
    Bloqueia requisições autenticadas sem tenant e impede acesso cruzado entre tenants.
    Deve ser inserido APÓS o TenantMiddleware na stack do Django.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Permitir URLs públicas sem tenant
        public_paths = getattr(TenantMiddleware, 'EXEMPT_URLS', [])
        if any(request.path.startswith(url) for url in public_paths):
            return self.get_response(request)

        # Se a requisição for autenticada, o tenant DEVE estar presente
        user = getattr(request, 'user', None)
        tenant = getattr(request, 'tenant', None)
        if user and user.is_authenticated:
            if not tenant:
                return JsonResponse({
                    "error": "tenant_required",
                    "detail": "Usuário autenticado sem tenant associado."
                }, status=403)

            # Se o usuário tiver campo tenant/cliente, garantir correspondência
            if hasattr(user, 'tenant_id') and user.tenant_id != tenant.id:
                return JsonResponse({
                    "error": "tenant_mismatch",
                    "detail": "Usuário não pertence ao tenant da requisição."
                }, status=403)
            if hasattr(user, 'client_id') and user.client_id != tenant.id:
                return JsonResponse({
                    "error": "tenant_mismatch",
                    "detail": "Usuário não pertence ao tenant da requisição."
                }, status=403)

        # Opcional: bloquear requisições sem tenant para rotas privadas
        if not tenant and not any(request.path.startswith(url) for url in public_paths):
            return JsonResponse({
                "error": "tenant_required",
                "detail": "Tenant não identificado na requisição."
            }, status=403)

        return self.get_response(request)
"""
Tenant Middleware for Ouvify application.
Handles automatic tenant identification based on subdomain or headers.
"""
import logging
import os
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db.models import Q
from apps.tenants.models import Client
from .utils import set_current_tenant, clear_current_tenant

logger = logging.getLogger(__name__)


class TenantMiddleware:
    """
    Middleware que identifica o tenant baseado no subdomínio da requisição
    e armazena essa informação no thread-local para uso em toda a aplicação.
    
    Funcionamento:
    1. Extrai o host da requisição (ex: clienteA.localhost:8000)
    2. Identifica o subdomínio (clienteA)
    3. Busca o Client correspondente no banco de dados
    4. Armazena o tenant no thread-local via set_current_tenant()
    5. Permite que a requisição continue normalmente
    6. Limpa o tenant após a resposta
    """
    
    # URLs que não precisam de tenant (públicas)
    EXEMPT_URLS = [
        '/admin/',
        '/api/register-tenant/',
        '/api/check-subdominio/',
        '/api-token-auth/',
        '/api/token/',
        '/health/',  # Health check para monitoring
        '/ready/',   # Readiness check
        '/api/password-reset/',  # Reset de senha
        '/api/feedbacks/consultar-protocolo/',  # Consulta pública de protocolo
        '/api/tenants/webhook/',  # Webhook do Stripe (valida via signature)
    ]
    
    # URLs que permitem tenant via header mesmo sem subdomínio
    HEADER_TENANT_URLS = [
        '/api/feedbacks/',
        '/api/tenant-info/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Em produção, o fallback de tenant é desativado por segurança
        self.fallback_enabled = os.getenv(
            'TENANT_FALLBACK_ENABLED',
            'True' if settings.DEBUG else 'False'
        ).lower() in ('true', '1', 'yes')
        logger.info("🔧 TenantMiddleware initialized")
    
    def __call__(self, request):
        # Verificar se a URL está na lista de exceções
        if any(request.path.startswith(url) for url in self.EXEMPT_URLS):
            # Processar requisição sem verificar tenant
            response = self.get_response(request)
            return response
        
        # Limpar qualquer tenant anterior
        clear_current_tenant()
        
        # Extrair o host da requisição
        host = request.get_host()
        
        # Remover porta se houver (ex: localhost:8000 -> localhost)
        host_without_port = host.split(':')[0]
        
        # Separar subdomínio do domínio base
        # Ex: empresaA.localhost -> ['empresaA', 'localhost']
        parts = host_without_port.split('.')
        
        tenant = None
        subdomain = None
        
        # Verificar se é um IP (127.0.0.1, 192.168.x.x, etc) ou localhost
        is_ip_or_localhost = (
            host_without_port == 'localhost' or 
            host_without_port.replace('.', '').isdigit() or  # IP numérico
            host_without_port == '127.0.0.1'
        )
        
        # Se for IP/localhost, tentar via header ou usar padrão (se habilitado)
        if is_ip_or_localhost or len(parts) == 1:
            tenant_id = request.headers.get('X-Tenant-ID')

            if tenant_id:
                try:
                    tenant = Client.objects.get(id=tenant_id, ativo=True)
                    set_current_tenant(tenant)
                    request.tenant = tenant
                    logger.debug(f"✅ Tenant identificado via header: {tenant.nome}")
                except (Client.DoesNotExist, ValueError):
                    logger.warning(f"⚠️ Tenant ID inválido no header: {tenant_id}")

            # Fallback só é permitido quando explicitamente ativado
            if not tenant and self.fallback_enabled:
                try:
                    tenant = Client.objects.filter(ativo=True).only(
                        'id', 'nome', 'subdominio', 'ativo'
                    ).first()
                    if tenant:
                        set_current_tenant(tenant)
                        request.tenant = tenant
                        logger.debug(f"🔧 Usando tenant padrão (dev): {tenant.nome}")
                except Exception as e:
                    logger.error(f"❌ Erro ao buscar tenant padrão: {e}")

            if not tenant and not self.fallback_enabled:
                return JsonResponse(
                    {
                        "error": "tenant_required",
                        "detail": "Informe o tenant via subdomínio ou header X-Tenant-ID",
                    },
                    status=400,
                )

            if not tenant:
                request.tenant = None
                logger.debug("ℹ️ Nenhum tenant identificado (modo público)")
        
        # Se houver subdomínio (mais de uma parte no host e não é IP)
        elif len(parts) > 1:
            subdomain = parts[0]
            
            # Ignorar subdominios comuns como www
            if subdomain not in ['www', 'api', 'admin']:
                try:
                    # Buscar o tenant pelo subdomínio (case-insensitive)
                    # Otimizado: carregar apenas campos necessários
                    tenant = Client.objects.only(
                        'id', 'nome', 'subdominio', 'ativo'
                    ).get(
                        subdominio__iexact=subdomain,
                        ativo=True
                    )
                    
                    # Armazenar tenant no thread-local
                    set_current_tenant(tenant)
                    
                    # Também adicionar ao objeto request para fácil acesso
                    request.tenant = tenant
                    
                except Client.DoesNotExist:
                    # Tenant não encontrado - retornar erro 404
                    return HttpResponse(
                        f'<h1>Tenant não encontrado</h1>'
                        f'<p>O subdomínio "{subdomain}" não está registrado no sistema.</p>',
                        status=404
                    )
                except Client.MultipleObjectsReturned:
                    # Caso de erro de dados - múltiplos tenants com mesmo subdomínio
                    return HttpResponse(
                        '<h1>Erro de configuração</h1>'
                        '<p>Múltiplos tenants encontrados. Contate o administrador.</p>',
                        status=500
                    )
        
        # Processar a requisição
        response = self.get_response(request)
        
        # Limpar o tenant após o processamento (boa prática)
        clear_current_tenant()
        
        return response
    
    def process_exception(self, request, exception):
        """
        Limpar o tenant em caso de exceção para evitar vazamento
        entre requisições em ambientes de thread pool.
        """
        clear_current_tenant()
        return None
