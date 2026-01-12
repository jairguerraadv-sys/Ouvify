from django.http import HttpResponse
from django.shortcuts import render
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
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Limpar qualquer tenant anterior
        clear_current_tenant()
        
        # Extrair o host da requisição
        host = request.get_host().lower()
        
        # Remover porta se houver (ex: localhost:8000 -> localhost)
        host_without_port = host.split(':')[0]
        
        # Separar subdomínio do domínio base
        # Ex: clienteA.localhost -> ['clienteA', 'localhost']
        parts = host_without_port.split('.')
        
        tenant = None
        
        # Se houver subdomínio (mais de uma parte no host)
        if len(parts) > 1:
            subdomain = parts[0]
            
            # Ignorar subdominios comuns como www
            if subdomain not in ['www', 'api', 'admin']:
                try:
                    # Buscar o tenant pelo subdomínio
                    tenant = Client.objects.get(
                        subdominio=subdomain,
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
        else:
            # Sem subdomínio - pode ser acesso direto ao domínio base
            # Você pode personalizar esse comportamento:
            # - Redirecionar para uma landing page
            # - Permitir acesso ao admin Django
            # - Retornar erro
            request.tenant = None
        
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
