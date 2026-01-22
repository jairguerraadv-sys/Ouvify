import threading
from typing import Optional, TYPE_CHECKING
import re
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

if TYPE_CHECKING:
    from apps.tenants.models import Client


# Thread-local storage para armazenar o tenant atual
_thread_locals = threading.local()


def set_current_tenant(tenant: Optional['Client']) -> None:
    """
    Define o tenant atual no contexto da thread.
    
    Args:
        tenant: Instância do modelo Client ou None
    """
    _thread_locals.tenant = tenant


def get_current_tenant() -> Optional['Client']:
    """
    Retorna o tenant atual do contexto da thread.
    
    Returns:
        Instância do Client ou None se não houver tenant definido
    """
    return getattr(_thread_locals, 'tenant', None)


def clear_current_tenant() -> None:
    """
    Limpa o tenant atual do contexto da thread.
    Útil para testes e situações onde é necessário resetar o estado.
    """
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')


# Alias para compatibilidade
remove_current_tenant = clear_current_tenant


def get_tenant_id() -> Optional[int]:
    """
    Retorna o ID do tenant atual, se houver.
    
    Returns:
        ID do tenant (int) ou None
    """
    tenant = get_current_tenant()
    return tenant.pk if tenant else None


def tenant_context_required(func):
    """
    Decorator para garantir que uma função é executada com um tenant definido.
    Levanta exceção se não houver tenant no contexto.
    
    Usage:
        @tenant_context_required
        def minha_funcao():
            # código que precisa de tenant
    """
    def wrapper(*args, **kwargs):
        if get_current_tenant() is None:
            raise ValueError(
                "Esta operação requer um tenant ativo no contexto. "
                "Certifique-se de que a requisição passou pelo TenantMiddleware."
            )
        return func(*args, **kwargs)
    return wrapper


# ============================================================================
# Validation and Sanitization Helpers
# ============================================================================

def is_valid_subdomain(subdomain: str) -> bool:
    """
    Valida se um subdomínio é válido conforme as regras DNS.
    
    Args:
        subdomain: String do subdomínio
        
    Returns:
        bool: True se válido, False caso contrário
    """
    if not subdomain or len(subdomain) < 3 or len(subdomain) > 63:
        return False
    
    # Regex: deve começar e terminar com letra ou número,
    # pode conter letras minúsculas, números e hífens
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    return bool(re.match(pattern, subdomain))


def get_reserved_subdomains() -> list[str]:
    """
    Retorna lista de subdomínios reservados que não podem ser usados.
    
    Returns:
        list[str]: Lista de subdomínios reservados
    """
    return [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'pop', 'imap',
        'webmail', 'email', 'static', 'assets', 'cdn', 'media', 'files',
        'blog', 'forum', 'shop', 'store', 'help', 'support', 'docs',
        'ouvy', 'test', 'dev', 'staging', 'prod', 'production', 'localhost'
    ]


def is_reserved_subdomain(subdomain: str) -> bool:
    """
    Verifica se um subdomínio está na lista de reservados.
    
    Args:
        subdomain: String do subdomínio
        
    Returns:
        bool: True se reservado, False caso contrário
    """
    return subdomain.lower() in get_reserved_subdomains()


def sanitize_string(value: str, max_length: int = 200) -> str:
    """
    Sanitiza uma string removendo caracteres perigosos e espaços extras.
    
    Args:
        value: String para sanitizar
        max_length: Comprimento máximo permitido
        
    Returns:
        str: String sanitizada
    """
    if not value:
        return ''
    
    # Remover espaços extras
    sanitized = ' '.join(value.split())
    
    # Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()


# ============================================================================
# Network and Request Helpers
# ============================================================================

def get_client_ip(request) -> str:
    """
    Extrai o IP real do cliente, considerando proxies reversos.
    
    Args:
        request: HttpRequest object
        
    Returns:
        str: IP address do cliente
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Pegar o primeiro IP da lista (cliente real)
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip


# ============================================================================
# Query and Search Helpers
# ============================================================================

def get_time_range(period: str = '24h'):
    """
    Retorna um range de tempo baseado no período especificado.
    
    Args:
        period: Período desejado ('24h', '7d', '30d', '90d', '1y')
        
    Returns:
        tuple: (start_datetime, end_datetime)
    """
    now = timezone.now()
    
    period_map = {
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '90d': timedelta(days=90),
        '1y': timedelta(days=365),
    }
    
    delta = period_map.get(period, timedelta(hours=24))
    start = now - delta
    
    return start, now


def build_search_query(search_term: str, fields: list[str]) -> Q:
    """
    Constrói uma query Q do Django para busca em múltiplos campos.
    
    Args:
        search_term: Termo de busca
        fields: Lista de campos para buscar (ex: ['titulo', 'descricao'])
        
    Returns:
        Q: Query object do Django
    """
    query = Q()
    
    if not search_term or not fields:
        return query
    
    for field in fields:
        # Case-insensitive search
        query |= Q(**{f'{field}__icontains': search_term})
    
    return query

# ============================================================================
# Context Managers
# ============================================================================

from contextlib import contextmanager

@contextmanager
def tenant_context(tenant):
    """
    Context manager para executar código com um tenant específico
    
    Uso:
        with tenant_context(my_client):
            feedback = Feedback.objects.create(...)
    """
    previous_tenant = get_current_tenant()
    try:
        set_current_tenant(tenant)
        yield tenant
    finally:
        if previous_tenant:
            set_current_tenant(previous_tenant)
        else:
            clear_current_tenant()

