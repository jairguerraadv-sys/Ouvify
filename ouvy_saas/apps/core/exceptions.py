"""
Custom exceptions and exception handler for the Ouvy SaaS application.
Provides consistent error handling and messaging across the API.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    
    Provides consistent error responses across the API:
    - Standardizes error format
    - Adds logging for debugging
    - Handles Django exceptions that DRF doesn't catch by default
    - Custom messages for throttling (429 errors)
    
    Error Response Format:
    {
        "error": "Human-readable error message",
        "detail": "Additional details if available",
        "code": "ERROR_CODE" (optional)
    }
    """
    # Chamar o handler padrão do DRF primeiro
    response = exception_handler(exc, context)
    
    # Se o DRF tratou a exceção
    if response is not None:
        _log_exception(exc, context, response.status_code)
        
        # Customizar resposta de throttling (429)
        if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            wait_time = None
            if hasattr(exc, 'wait'):
                wait_time = int(exc.wait) if exc.wait else None
            
            response.data = {
                "error": "Limite de consultas excedido",
                "detail": f"Você excedeu o limite de consultas. Aguarde {wait_time} segundos e tente novamente." if wait_time else "Muitas tentativas. Aguarde alguns instantes.",
                "wait_seconds": wait_time,
                "tip": "Este limite protege o sistema contra uso abusivo."
            }
            return response
        
        # Padronizar formato de resposta para outros erros
        if isinstance(response.data, dict):
            if 'error' not in response.data and 'detail' in response.data:
                error_data = {
                    'error': response.data.pop('detail'),
                }
                error_data.update(response.data)
                response.data = error_data
        
        return response
    
    # Tratar exceções do Django que DRF não trata
    if isinstance(exc, DjangoValidationError):
        _log_exception(exc, context, status.HTTP_400_BAD_REQUEST)
        
        if hasattr(exc, 'message_dict'):
            errors = exc.message_dict
        elif hasattr(exc, 'messages'):
            errors = exc.messages
        else:
            errors = str(exc)
        
        return Response(
            {
                'error': 'Erro de validação',
                'detail': errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if isinstance(exc, Http404):
        _log_exception(exc, context, status.HTTP_404_NOT_FOUND)
        
        return Response(
            {
                'error': 'Recurso não encontrado',
                'detail': str(exc) if str(exc) else 'O recurso solicitado não existe'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Logar exceções não tratadas
    logger.error(
        f"❌ Exceção não tratada: {type(exc).__name__} | "
        f"Mensagem: {str(exc)} | "
        f"View: {context.get('view', 'Unknown')}",
        exc_info=True
    )
    
    # Retornar erro genérico
    return Response(
        {
            'error': 'Erro interno do servidor',
            'detail': 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.'
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _log_exception(exc, context, status_code):
    """Helper para logar exceções de forma consistente."""
    view = context.get('view', None)
    view_name = view.__class__.__name__ if view else 'Unknown'
    request = context.get('request', None)
    
    # Determinar nível de log baseado no status code
    if 400 <= status_code < 500:
        log_level = logger.warning
        emoji = '⚠️'
    else:
        log_level = logger.error
        emoji = '❌'
    
    log_message = (
        f"{emoji} Exceção capturada: {type(exc).__name__} | "
        f"Status: {status_code} | "
        f"View: {view_name} | "
        f"Mensagem: {str(exc)}"
    )
    
    if request:
        log_message += f" | Method: {request.method} | Path: {request.path}"
    
    log_level(log_message)


# Custom Exceptions
class TenantNotFoundError(Exception):
    """Exceção levantada quando o tenant não pode ser identificado."""
    pass


class InvalidProtocolError(Exception):
    """Exceção levantada quando o protocolo é inválido."""
    pass


class RateLimitExceededError(Exception):
    """Exceção levantada quando o rate limit é excedido."""
    pass
