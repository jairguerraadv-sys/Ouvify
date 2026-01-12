"""
Classes de throttling customizadas para proteção contra abuso de APIs.
"""
from rest_framework.throttling import AnonRateThrottle
import logging

logger = logging.getLogger(__name__)


class ProtocoloConsultaThrottle(AnonRateThrottle):
    """
    Throttle para limitar consultas de protocolo por IP.
    
    Rate: 5 requisições por minuto por endereço IP.
    
    Objetivo: Proteger contra:
    - Força bruta para descobrir protocolos válidos
    - Enumeração massiva de códigos
    - Abuso do endpoint público
    
    O formato do protocolo (OUVY-XXXX-YYYY) tem 36^8 = ~2.8 trilhões
    de combinações, mas com 5 req/min, um atacante precisaria de
    ~1 milhão de anos para testar todas as combinações.
    """
    
    # Nome da configuração em settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']
    scope = 'protocolo_consulta'
    
    def allow_request(self, request, view):
        """
        Sobrescreve para adicionar logging de tentativas suspeitas.
        """
        # Verificar se a requisição é permitida
        allowed = super().allow_request(request, view)
        
        if not allowed:
            # Logar tentativa bloqueada
            ip_address = self.get_ident(request)
            protocolo = request.query_params.get('codigo', 'N/A')
            
            logger.warning(
                f"🚨 Rate limit excedido | "
                f"IP: {ip_address} | "
                f"Protocolo tentado: {protocolo} | "
                f"Endpoint: consultar-protocolo"
            )
        
        return allowed
    
    def wait(self):
        """
        Retorna o tempo de espera em segundos até a próxima requisição permitida.
        """
        wait_seconds = super().wait()
        if wait_seconds:
            return int(wait_seconds)
        return None
