"""
Módulo de sanitização para prevenção de XSS e injeções.
Centraliza funções de limpeza e validação de inputs de usuário.
"""
import html
import re
from typing import Optional


def sanitize_html_input(value: str, max_length: int = 10000) -> str:
    """
    Sanitiza entrada de texto removendo/escapando HTML potencialmente perigoso.
    
    Args:
        value: String de entrada do usuário
        max_length: Comprimento máximo permitido
        
    Returns:
        str: String sanitizada e segura
    """
    if not value:
        return ''
    
    # 1. Normalizar espaços em branco
    sanitized = ' '.join(value.split())
    
    # 2. Escapar entidades HTML para prevenir XSS
    sanitized = html.escape(sanitized, quote=True)
    
    # 3. Remover caracteres de controle invisíveis (exceto newlines)
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', sanitized)
    
    # 4. Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()


def sanitize_plain_text(value: str, max_length: int = 500) -> str:
    """
    Sanitiza texto puro removendo caracteres especiais mantendo apenas alfanuméricos.
    Útil para nomes, títulos, etc.
    
    Args:
        value: String de entrada
        max_length: Comprimento máximo permitido
        
    Returns:
        str: String sanitizada
    """
    if not value:
        return ''
    
    # Normalizar espaços
    sanitized = ' '.join(value.split())
    
    # Permitir apenas letras, números, espaços e caracteres comuns
    # Inclui acentos portugueses
    sanitized = re.sub(r'[^\w\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ.,!?@#$%&*()\-_+=\[\]{}|\':;"/\\]', '', sanitized)
    
    # Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()


def sanitize_email(email: str) -> str:
    """
    Sanitiza e normaliza um endereço de email.
    
    Args:
        email: Endereço de email
        
    Returns:
        str: Email sanitizado em lowercase
    """
    if not email:
        return ''
    
    # Remover espaços e converter para minúsculas
    sanitized = email.strip().lower()
    
    # Remover caracteres inválidos
    sanitized = re.sub(r'[^\w.@+-]', '', sanitized)
    
    return sanitized


def sanitize_protocol_code(code: str) -> str:
    """
    Sanitiza código de protocolo para busca segura.
    
    Args:
        code: Código de protocolo (ex: OUVY-XXXX-YYYY)
        
    Returns:
        str: Código sanitizado e normalizado
    """
    if not code:
        return ''
    
    # Remover espaços e converter para maiúsculas
    sanitized = code.strip().upper()
    
    # Permitir apenas formato esperado: letras, números e hífens
    sanitized = re.sub(r'[^A-Z0-9\-]', '', sanitized)
    
    return sanitized


def sanitize_subdomain(subdomain: str) -> str:
    """
    Sanitiza subdomínio para formato válido DNS.
    
    Args:
        subdomain: Subdomínio desejado
        
    Returns:
        str: Subdomínio sanitizado
    """
    if not subdomain:
        return ''
    
    # Converter para minúsculas e remover espaços
    sanitized = subdomain.strip().lower()
    
    # Permitir apenas letras minúsculas, números e hífens
    sanitized = re.sub(r'[^a-z0-9\-]', '', sanitized)
    
    # Remover hífens do início e fim
    sanitized = sanitized.strip('-')
    
    # Limitar a 63 caracteres (máximo DNS)
    if len(sanitized) > 63:
        sanitized = sanitized[:63].rstrip('-')
    
    return sanitized


def strip_null_bytes(value: str) -> str:
    """
    Remove null bytes que podem causar problemas em bancos de dados.
    
    Args:
        value: String de entrada
        
    Returns:
        str: String sem null bytes
    """
    if not value:
        return ''
    
    return value.replace('\x00', '')


def sanitize_search_query(query: str, max_length: int = 100) -> str:
    """
    Sanitiza query de busca para uso seguro em filtros Django.
    
    Args:
        query: String de busca do usuário
        max_length: Comprimento máximo
        
    Returns:
        str: Query sanitizada
    """
    if not query:
        return ''
    
    # Normalizar espaços
    sanitized = ' '.join(query.split())
    
    # Remover caracteres especiais de regex
    sanitized = re.sub(r'[^\w\s@.\-]', '', sanitized)
    
    # Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()


def validate_and_sanitize_json_string(value: str) -> Optional[str]:
    """
    Valida e sanitiza uma string que pode conter JSON malicioso.
    
    Args:
        value: String potencialmente contendo JSON
        
    Returns:
        str ou None: String sanitizada ou None se inválida
    """
    if not value:
        return None
    
    # Remover caracteres de controle
    sanitized = re.sub(r'[\x00-\x1f\x7f]', '', value)
    
    # Escapar caracteres especiais do JSON
    sanitized = sanitized.replace('\\', '\\\\')
    
    return sanitized
