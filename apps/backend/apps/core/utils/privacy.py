"""
Utilidades de Privacidade e LGPD
Funções para anonimização de dados sensíveis em logs e auditoria
"""


def anonymize_ip(ip: str) -> str:
    """
    Anonimiza endereço IP removendo o último octeto (IPv4) ou blocos (IPv6).
    
    Conforme LGPD/GDPR, IPs completos são considerados dados pessoais.
    Anonimização parcial permite análise geográfica sem identificação individual.
    
    Args:
        ip: Endereço IP completo (IPv4 ou IPv6)
    
    Returns:
        IP anonimizado com último octeto/bloco substituído por 'xxx' ou '0'
    
    Examples:
        >>> anonymize_ip('192.168.1.100')
        '192.168.1.0'
        
        >>> anonymize_ip('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
        '2001:0db8:85a3:0000:0000:8a2e:0370:0'
        
        >>> anonymize_ip('invalid')
        '0.0.0.0'
    """
    if not ip or not isinstance(ip, str):
        return '0.0.0.0'
    
    ip = ip.strip()
    
    # IPv4
    if '.' in ip and ':' not in ip:
        parts = ip.split('.')
        if len(parts) == 4:
            # Validar que todos os octetos são números
            try:
                for part in parts:
                    int(part)
                # Substituir último octeto por 0
                return '.'.join(parts[:3] + ['0'])
            except ValueError:
                return '0.0.0.0'
        return '0.0.0.0'
    
    # IPv6
    elif ':' in ip:
        parts = ip.split(':')
        if len(parts) >= 3:
            # Substituir últimos 2 blocos por 0
            return ':'.join(parts[:-2] + ['0', '0'])
        return '::0'
    
    # Formato desconhecido
    return '0.0.0.0'


def mask_email(email: str, visible_chars: int = 3) -> str:
    """
    Mascara parte do email para exibição segura em logs.
    
    Args:
        email: Email completo
        visible_chars: Quantidade de caracteres visíveis antes do @
    
    Returns:
        Email mascarado
    
    Examples:
        >>> mask_email('usuario@example.com')
        'usu***@example.com'
        
        >>> mask_email('a@example.com')
        'a***@example.com'
    """
    if not email or '@' not in email:
        return '***@***'
    
    local, domain = email.split('@', 1)
    
    if len(local) <= visible_chars:
        masked_local = local[0] + '***'
    else:
        masked_local = local[:visible_chars] + '***'
    
    return f'{masked_local}@{domain}'


def mask_cpf(cpf: str) -> str:
    """
    Mascara CPF mantendo apenas primeiros e últimos dígitos.
    
    Args:
        cpf: CPF completo (com ou sem formatação)
    
    Returns:
        CPF mascarado
    
    Examples:
        >>> mask_cpf('123.456.789-00')
        '123.***.***-00'
        
        >>> mask_cpf('12345678900')
        '123***00'
    """
    if not cpf:
        return '***'
    
    # Remover formatação
    cpf_digits = ''.join(c for c in cpf if c.isdigit())
    
    if len(cpf_digits) != 11:
        return '***'
    
    # Manter 3 primeiros e 2 últimos
    if '.' in cpf or '-' in cpf:
        return f'{cpf_digits[:3]}.***.***-{cpf_digits[-2:]}'
    
    return f'{cpf_digits[:3]}***{cpf_digits[-2:]}'


def mask_phone(phone: str) -> str:
    """
    Mascara telefone mantendo apenas DDD e últimos dígitos.
    
    Args:
        phone: Telefone completo
    
    Returns:
        Telefone mascarado
    
    Examples:
        >>> mask_phone('(11) 98765-4321')
        '(11) ****-4321'
        
        >>> mask_phone('11987654321')
        '11****4321'
    """
    if not phone:
        return '****'
    
    # Remover formatação
    phone_digits = ''.join(c for c in phone if c.isdigit())
    
    if len(phone_digits) < 8:
        return '****'
    
    # Manter 2 primeiros (DDD) e 4 últimos
    if '(' in phone or '-' in phone:
        ddd = phone_digits[:2]
        last = phone_digits[-4:]
        return f'({ddd}) ****-{last}'
    
    return f'{phone_digits[:2]}****{phone_digits[-4:]}'
