"""
Handlers customizados para exceções da API.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Handler customizado para tornar mensagens de erro mais amigáveis.
    """
    # Chamar o handler padrão do DRF
    response = exception_handler(exc, context)
    
    # Customizar resposta de throttling (429)
    if response is not None and response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        # Extrair tempo de espera
        wait_time = None
        if hasattr(exc, 'wait'):
            wait_time = int(exc.wait) if exc.wait else None
        
        # Mensagem customizada em português
        custom_response = {
            "error": "Limite de consultas excedido",
            "detail": f"Você excedeu o limite de consultas permitidas. Aguarde {wait_time} segundos e tente novamente." if wait_time else "Muitas tentativas. Aguarde alguns instantes.",
            "wait_seconds": wait_time,
            "tip": "Este limite protege o sistema contra uso abusivo. Se você precisa consultar múltiplos protocolos, entre em contato com o suporte."
        }
        
        response.data = custom_response
    
    return response
