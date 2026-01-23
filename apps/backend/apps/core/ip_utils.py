"""
Utilitários para anonimização de IPs em logs e analytics
Conformidade com LGPD e GDPR
"""
import ipaddress
from typing import Optional


def anonymize_ipv4(ip: str) -> str:
    """
    Anonimiza IPv4 removendo o último octeto
    Exemplo: 192.168.1.100 -> 192.168.1.0
    
    Args:
        ip: Endereço IPv4
    
    Returns:
        str: IP anonimizado
    """
    try:
        addr = ipaddress.IPv4Address(ip)
        # Zerar último octeto
        parts = str(addr).split('.')
        parts[-1] = '0'
        return '.'.join(parts)
    except (ipaddress.AddressValueError, ValueError):
        return '0.0.0.0'


def anonymize_ipv6(ip: str) -> str:
    """
    Anonimiza IPv6 removendo os últimos 80 bits (mantém /48)
    Exemplo: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 2001:0db8:85a3::
    
    Args:
        ip: Endereço IPv6
    
    Returns:
        str: IP anonimizado
    """
    try:
        addr = ipaddress.IPv6Address(ip)
        # Manter apenas os primeiros 48 bits (primeiros 3 blocos de 16 bits)
        network = ipaddress.IPv6Network(f"{addr}/48", strict=False)
        return str(network.network_address)
    except (ipaddress.AddressValueError, ValueError):
        return '::'


def anonymize_ip(ip: Optional[str]) -> str:
    """
    Anonimiza endereço IP (IPv4 ou IPv6) para conformidade com LGPD/GDPR
    
    Estratégias:
    - IPv4: Remove último octeto (192.168.1.100 -> 192.168.1.0)
    - IPv6: Mantém apenas /48 (primeiros 3 blocos)
    - Preserva informação geográfica geral
    - Remove identificação individual
    
    Args:
        ip: Endereço IP (v4 ou v6) ou None
    
    Returns:
        str: IP anonimizado ou valor padrão
    
    Examples:
        >>> anonymize_ip('192.168.1.100')
        '192.168.1.0'
        
        >>> anonymize_ip('2001:0db8:85a3::8a2e:0370:7334')
        '2001:db8:85a3::'
        
        >>> anonymize_ip(None)
        '0.0.0.0'
    """
    if not ip:
        return '0.0.0.0'
    
    ip = ip.strip()
    
    # Detectar tipo de IP
    try:
        addr = ipaddress.ip_address(ip)
        
        if isinstance(addr, ipaddress.IPv4Address):
            return anonymize_ipv4(ip)
        elif isinstance(addr, ipaddress.IPv6Address):
            return anonymize_ipv6(ip)
        else:
            return '0.0.0.0'
            
    except ValueError:
        # IP inválido
        return '0.0.0.0'


def get_client_ip(request) -> str:
    """
    Extrai IP do cliente da request Django considerando proxies
    
    Ordem de precedência:
    1. HTTP_X_FORWARDED_FOR (proxy/load balancer)
    2. HTTP_X_REAL_IP (nginx)
    3. REMOTE_ADDR (conexão direta)
    
    Args:
        request: HttpRequest do Django
    
    Returns:
        str: IP do cliente
    """
    # Verificar headers de proxy
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Primeiro IP da lista é o cliente original
        ip = x_forwarded_for.split(',')[0].strip()
        return ip
    
    # Nginx real IP
    x_real_ip = request.META.get('HTTP_X_REAL_IP')
    if x_real_ip:
        return x_real_ip.strip()
    
    # Conexão direta
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def log_anonymized_access(request, logger, message: str, **extra):
    """
    Faz log de acesso com IP anonimizado
    
    Usage:
        from apps.core.ip_utils import log_anonymized_access
        
        log_anonymized_access(
            request,
            logger,
            "User login attempt",
            user_id=user.id,
            success=True
        )
    
    Args:
        request: HttpRequest
        logger: Logger instance
        message: Mensagem do log
        **extra: Campos adicionais para o log
    """
    client_ip = get_client_ip(request)
    anonymized_ip = anonymize_ip(client_ip)
    
    logger.info(
        message,
        extra={
            'anonymized_ip': anonymized_ip,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            **extra
        }
    )
