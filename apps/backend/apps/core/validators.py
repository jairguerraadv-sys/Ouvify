"""
Custom validators for Ouvify application.
Provides reusable validation logic for models and serializers.
"""
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
import re


def strip_null_bytes(value: str) -> str:
    """Remove null bytes que podem causar problemas de segurança."""
    if not value:
        return ''
    return value.replace('\x00', '')


def validate_subdomain(value: str) -> None:
    """
    Valida se um subdomínio segue as regras DNS.
    
    Args:
        value: Subdomínio a validar
        
    Raises:
        ValidationError: Se o subdomínio for inválido
    """
    # Sanitizar contra null bytes
    value = strip_null_bytes(value)
    
    if not value:
        raise ValidationError('Subdomínio não pode ser vazio')
    
    if len(value) < 3:
        raise ValidationError('Subdomínio deve ter no mínimo 3 caracteres')
    
    if len(value) > 63:
        raise ValidationError('Subdomínio deve ter no máximo 63 caracteres')
    
    # Deve começar e terminar com letra ou número
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Subdomínio deve começar e terminar com letra ou número, '
            'podendo conter hífens no meio'
        )
    
    # Verificar subdomínios reservados
    reserved = [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'pop', 'imap',
        'webmail', 'email', 'static', 'assets', 'cdn', 'media', 'files',
        'blog', 'forum', 'shop', 'store', 'help', 'support', 'docs',
        'ouvify', 'ouvy', 'test', 'dev', 'staging', 'prod', 'production', 'localhost'
    ]
    
    if value.lower() in reserved:
        raise ValidationError(f'O subdomínio "{value}" está reservado e não pode ser usado')


def validate_hex_color(value: str) -> None:
    """
    Valida se uma cor está no formato hexadecimal correto.
    
    Args:
        value: Cor em formato hex (ex: #FF5733)
        
    Raises:
        ValidationError: Se a cor for inválida
    """
    pattern = r'^#[0-9A-Fa-f]{6}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Cor deve estar no formato hexadecimal (ex: #FF5733)'
        )


def validate_protocol_code(value: str) -> None:
    """
    Valida se um código de protocolo está no formato correto.
    
    Args:
        value: Código de protocolo (ex: OUVY-A3B9-K7M2)
        
    Raises:
        ValidationError: Se o código for inválido
    """
    # Formato: OUVY-XXXX-YYYY (onde X e Y são alfanuméricos)
    pattern = r'^OUVY-[A-Z0-9]{4}-[A-Z0-9]{4}$'
    if not re.match(pattern, value.upper()):
        raise ValidationError(
            'Código de protocolo inválido. '
            'Formato esperado: OUVY-XXXX-YYYY'
        )


def validate_strong_password(value: str) -> None:
    """
    Valida se uma senha é forte o suficiente.
    
    Args:
        value: Senha a validar
        
    Raises:
        ValidationError: Se a senha for fraca
    """
    if len(value) < 8:
        raise ValidationError('A senha deve ter no mínimo 8 caracteres')
    
    if not re.search(r'[A-Za-z]', value):
        raise ValidationError('A senha deve conter pelo menos uma letra')
    
    if not re.search(r'\d', value):
        raise ValidationError('A senha deve conter pelo menos um número')
    
    # Opcional: verificar caractere especial
    # if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
    #     raise ValidationError('A senha deve conter pelo menos um caractere especial')


def validate_cnpj(value: str) -> None:
    """
    Valida se um CNPJ é válido.
    
    Args:
        value: CNPJ a validar (com ou sem formatação)
        
    Raises:
        ValidationError: Se o CNPJ for inválido
    """
    # Remove caracteres não numéricos
    cnpj = re.sub(r'[^\d]', '', value)
    
    if len(cnpj) != 14:
        raise ValidationError('CNPJ deve ter 14 dígitos')
    
    # Verifica se todos os dígitos são iguais
    if cnpj == cnpj[0] * 14:
        raise ValidationError('CNPJ inválido')
    
    # Validação dos dígitos verificadores
    def calcular_digito(cnpj_parcial: str, pesos: list[int]) -> int:
        soma = sum(int(cnpj_parcial[i]) * pesos[i] for i in range(len(pesos)))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto
    
    # Primeiro dígito verificador
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    digito1 = calcular_digito(cnpj[:12], pesos1)
    
    if digito1 != int(cnpj[12]):
        raise ValidationError('CNPJ inválido')
    
    # Segundo dígito verificador
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    digito2 = calcular_digito(cnpj[:13], pesos2)
    
    if digito2 != int(cnpj[13]):
        raise ValidationError('CNPJ inválido')


def validate_phone_br(value: str) -> None:
    """
    Valida se um telefone brasileiro é válido.
    
    Args:
        value: Telefone a validar (com ou sem formatação)
        
    Raises:
        ValidationError: Se o telefone for inválido
    """
    # Remove caracteres não numéricos
    phone = re.sub(r'[^\d]', '', value)
    
    # Aceita 10 dígitos (fixo) ou 11 dígitos (celular com 9)
    if len(phone) not in [10, 11]:
        raise ValidationError(
            'Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)'
        )
    
    # Validar DDD (código de área)
    ddd = int(phone[:2])
    ddds_validos = list(range(11, 100))  # DDDs válidos vão de 11 a 99
    
    if ddd not in ddds_validos:
        raise ValidationError('DDD inválido')
