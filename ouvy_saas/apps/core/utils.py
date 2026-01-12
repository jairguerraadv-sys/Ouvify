import threading
from typing import Optional
from apps.tenants.models import Client


# Thread-local storage para armazenar o tenant atual
_thread_locals = threading.local()


def set_current_tenant(tenant: Optional[Client]) -> None:
    """
    Define o tenant atual no contexto da thread.
    
    Args:
        tenant: Instância do modelo Client ou None
    """
    _thread_locals.tenant = tenant


def get_current_tenant() -> Optional[Client]:
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
    return tenant.id if tenant else None


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
