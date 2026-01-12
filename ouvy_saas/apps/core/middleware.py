from django.http import HttpResponse
from django.shortcuts import render
from django.db.models import Q
from apps.tenants.models import Client
from .utils import set_current_tenant, clear_current_tenant


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
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Verificar se a URL está na lista de exceções
        if any(request.path.startswith(url) for url in self.EXEMPT_URLS):
            # Processar requisição sem verificar tenant
            return self.get_response(request)
        
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
        
        # Verificar se é um IP (127.0.0.1, 192.168.x.x, etc) ou localhost
        is_ip_or_localhost = (
            host_without_port == 'localhost' or 
            host_without_port.replace('.', '').isdigit() or  # IP numérico
            host_without_port == '127.0.0.1'
        )
        
        # Se for IP/localhost, tentar via header ou usar padrão
        if is_ip_or_localhost or len(parts) == 1:
            # Sem subdomínio - tentar obter tenant via header ou usar padrão
            
            # 1. Tentar via header X-Tenant-ID (útil para desenvolvimento/API)
            tenant_id = request.headers.get('X-Tenant-ID')
            if tenant_id:
                try:
                    tenant = Client.objects.get(id=tenant_id, ativo=True)
                    set_current_tenant(tenant)
                    request.tenant = tenant
                except (Client.DoesNotExist, ValueError):
                    pass
            
            # 2. Se ainda não tiver tenant, usar o primeiro ativo (desenvolvimento)
            if not tenant:
                try:
                    tenant = Client.objects.filter(ativo=True).first()
                    if tenant:
                        set_current_tenant(tenant)
                        request.tenant = tenant
                except Exception:
                    pass
            
            # 3. Se não houver nenhum tenant, deixar None
            if not tenant:
                request.tenant = None
        
        # Se houver subdomínio (mais de uma parte no host e não é IP)
        elif len(parts) > 1:
            subdomain = parts[0]
            
            # Ignorar subdominios comuns como www
            if subdomain not in ['www', 'api', 'admin']:
                try:
                    # Buscar o tenant pelo subdomínio (case-insensitive)
                    tenant = Client.objects.get(
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
