"""
Módulo de sanitização para prevenção de XSS e injeções.
Centraliza funções de limpeza e validação de inputs de usuário.

ATUALIZAÇÃO (2026-01-15): Adicionado suporte a bleach para rich text opcional
"""

import html
import re
from typing import List, Optional

# Tentar importar bleach (opcional)
try:
    import bleach

    BLEACH_AVAILABLE = True
except ImportError:
    bleach = None
    BLEACH_AVAILABLE = False


def sanitize_html_input(value: str, max_length: int = 10000) -> str:
    """
    Sanitiza entrada de texto removendo/escapando HTML potencialmente perigoso.

    ✅ MÉTODO ATUAL: html.escape() - Escapa TODOS os caracteres HTML
    - Mais seguro (zero chance de XSS)
    - Perde formatação
    - Nativo do Python (sem dependências)

    Args:
        value: String de entrada do usuário
        max_length: Comprimento máximo permitido

    Returns:
        str: String sanitizada e segura
    """
    if not value:
        return ""

    # 1. Normalizar espaços em branco
    sanitized = " ".join(value.split())

    # 2. Escapar entidades HTML para prevenir XSS
    sanitized = html.escape(sanitized, quote=True)

    # 3. Remover caracteres de controle invisíveis (exceto newlines)
    sanitized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", sanitized)

    # 4. Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized.strip()


def sanitize_html_with_bleach(
    text: str,
    allowed_tags: Optional[List[str]] = None,
    allowed_attributes: Optional[dict] = None,
    strip: bool = True,
) -> str:
    """
    Sanitiza HTML usando biblioteca bleach, permitindo tags específicas.

    ✅ NOVO MÉTODO: bleach.clean() - Permite formatação controlada
    - Permite tags HTML seguras (b, i, u, p, br, strong, em)
    - Remove tags perigosas (<script>, <iframe>, etc)
    - Remove atributos de eventos (onclick, onmouseover)
    - Ideal para rich text editors

    ⚠️ REQUER: pip install bleach

    Args:
        text: Texto HTML para sanitizar
        allowed_tags: Lista de tags permitidas (padrão: formatação básica)
        allowed_attributes: Dicionário de atributos permitidos por tag
        strip: Se True, remove tags não permitidas; se False, escapa-as

    Returns:
        str: HTML sanitizado

    Raises:
        ImportError: Se bleach não estiver instalado

    Examples:
        >>> # Formatação básica (padrão)
        >>> sanitize_html_with_bleach("<p>Texto <strong>negrito</strong></p>")
        '<p>Texto <strong>negrito</strong></p>'

        >>> # Remover script malicioso
        >>> sanitize_html_with_bleach("<p onclick='alert(1)'>Texto</p>")
        '<p>Texto</p>'

        >>> # Permitir links
        >>> sanitize_html_with_bleach(
        ...     "<a href='https://example.com'>Link</a>",
        ...     allowed_tags=['a'],
        ...     allowed_attributes={'a': ['href']}
        ... )
        '<a href="https://example.com">Link</a>'
    """
    if not BLEACH_AVAILABLE:
        raise ImportError(
            "A biblioteca 'bleach' não está instalada. "
            "Instale com: pip install bleach==6.1.0"
        )

    if not text:
        return ""

    # Tags seguras para formatação básica
    if allowed_tags is None:
        allowed_tags = [
            "p",
            "br",
            "strong",
            "em",
            "b",
            "i",
            "u",
            "ul",
            "ol",
            "li",
            "blockquote",
            "code",
            "pre",
        ]

    # Atributos permitidos (nenhum por padrão para máxima segurança)
    if allowed_attributes is None:
        allowed_attributes = {}

    # Sanitizar usando bleach
    sanitized = bleach.clean(
        text,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=strip,
        strip_comments=True,  # Remover comentários HTML
    )

    # Remover caracteres de controle
    sanitized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", sanitized)

    return sanitized.strip()


def sanitize_rich_text(text: str, allow_links: bool = False) -> str:
    """
    Sanitiza rich text permitindo formatação HTML segura.

    Wrapper conveniente para sanitize_html_with_bleach com configurações
    otimizadas para editores de rich text (como TinyMCE, CKEditor, Quill).

    Args:
        text: Texto HTML do editor
        allow_links: Se True, permite tags <a> com href

    Returns:
        str: HTML sanitizado

    Examples:
        >>> # Texto formatado simples
        >>> sanitize_rich_text("<p>Texto <strong>importante</strong></p>")
        '<p>Texto <strong>importante</strong></p>'

        >>> # Com links
        >>> sanitize_rich_text('<a href="http://evil.com" onclick="hack()">Link</a>', allow_links=True)
        '<a href="http://evil.com">Link</a>'
    """
    if not BLEACH_AVAILABLE:
        # Fallback para html.escape se bleach não disponível
        return sanitize_html_input(text)

    allowed_tags = [
        "p",
        "br",
        "strong",
        "em",
        "b",
        "i",
        "u",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "span",
        "div",
    ]

    allowed_attributes = {}

    if allow_links:
        allowed_tags.append("a")
        allowed_attributes["a"] = ["href", "title", "rel"]

    return sanitize_html_with_bleach(
        text, allowed_tags=allowed_tags, allowed_attributes=allowed_attributes
    )


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
        return ""

    # Normalizar espaços
    sanitized = " ".join(value.split())

    # Permitir apenas letras, números, espaços e caracteres comuns
    # Inclui acentos portugueses
    sanitized = re.sub(
        r'[^\w\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ.,!?@#$%&*()\-_+=\[\]{}|\':;"/\\]',
        "",
        sanitized,
    )

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
        return ""

    # Remover espaços e converter para minúsculas
    sanitized = email.strip().lower()

    # Remover caracteres inválidos
    sanitized = re.sub(r"[^\w.@+-]", "", sanitized)

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
        return ""

    # Remover espaços e converter para maiúsculas
    sanitized = code.strip().upper()

    # Permitir apenas formato esperado: letras, números e hífens
    sanitized = re.sub(r"[^A-Z0-9\-]", "", sanitized)

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
        return ""

    # Converter para minúsculas e remover espaços
    sanitized = subdomain.strip().lower()

    # Permitir apenas letras minúsculas, números e hífens
    sanitized = re.sub(r"[^a-z0-9\-]", "", sanitized)

    # Remover hífens do início e fim
    sanitized = sanitized.strip("-")

    # Limitar a 63 caracteres (máximo DNS)
    if len(sanitized) > 63:
        sanitized = sanitized[:63].rstrip("-")

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
        return ""

    return value.replace("\x00", "")


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
        return ""

    # Normalizar espaços
    sanitized = " ".join(query.split())

    # Remover caracteres especiais de regex
    sanitized = re.sub(r"[^\w\s@.\-]", "", sanitized)

    # Limitar comprimento
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized.strip()


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitiza nome de arquivo para prevenir path traversal e caracteres inválidos.

    Args:
        filename: Nome do arquivo original
        max_length: Comprimento máximo permitido

    Returns:
        str: Nome de arquivo seguro
    """
    if not filename:
        return "unnamed"

    # Remover path traversal
    sanitized = filename.replace("..", "").replace("/", "").replace("\\", "")

    # Remover caracteres inválidos para sistemas de arquivos
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", sanitized)

    # Normalizar espaços
    sanitized = " ".join(sanitized.split())

    # Substituir espaços por underscore
    sanitized = sanitized.replace(" ", "_")

    # Limitar comprimento preservando extensão
    if len(sanitized) > max_length:
        name, ext = sanitized.rsplit(".", 1) if "." in sanitized else (sanitized, "")
        max_name_length = max_length - len(ext) - 1 if ext else max_length
        sanitized = f"{name[:max_name_length]}.{ext}" if ext else name[:max_length]

    return sanitized.strip("_") or "unnamed"


def sanitize_phone_number(phone: str) -> str:
    """
    Sanitiza número de telefone removendo formatação.

    Args:
        phone: Número de telefone com possível formatação

    Returns:
        str: Apenas números (e opcionalmente +)
    """
    if not phone:
        return ""

    # Manter apenas dígitos e +
    sanitized = re.sub(r"[^\d+]", "", phone)

    # Garantir que + só aparece no início
    if "+" in sanitized and not sanitized.startswith("+"):
        sanitized = sanitized.replace("+", "")

    return sanitized


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
    sanitized = re.sub(r"[\x00-\x1f\x7f]", "", value)

    # Escapar caracteres especiais do JSON
    sanitized = sanitized.replace("\\", "\\\\")

    return sanitized
