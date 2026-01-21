from rest_framework.test import APIClient
from django.conf import settings

def create_tenant_api_client(client_obj):
    """
    Cria APIClient configurado para simular requisições do tenant
    Args:
        client_obj: Instância de apps.tenants.models.Client
    Returns:
        APIClient configurado com HTTP_HOST correto
    Uso:
        client = create_tenant_api_client(my_tenant)
        response = client.get('/api/feedbacks/')
    """
    api_client = APIClient()
    subdomain = getattr(client_obj, 'subdominio', getattr(client_obj, 'subdomain', None))
    api_client.defaults['HTTP_HOST'] = f'{subdomain}.localhost'
    return api_client

def setup_test_allowed_hosts(subdomains):
    """
    Adiciona subdomínios ao ALLOWED_HOSTS temporariamente
    Args:
        subdomains: Lista de subdomínios (ex: ['empresa-a', 'empresa-b'])
    """
    if not hasattr(settings, '_test_allowed_hosts_backup'):
        settings._test_allowed_hosts_backup = settings.ALLOWED_HOSTS.copy()
    hosts_to_add = [f'{sub}.localhost' for sub in subdomains]
    hosts_to_add.extend([f'{sub}.testserver' for sub in subdomains])
    settings.ALLOWED_HOSTS.extend(hosts_to_add)

def restore_allowed_hosts():
    """Restaura ALLOWED_HOSTS ao estado original"""
    if hasattr(settings, '_test_allowed_hosts_backup'):
        settings.ALLOWED_HOSTS = settings._test_allowed_hosts_backup
        delattr(settings, '_test_allowed_hosts_backup')
