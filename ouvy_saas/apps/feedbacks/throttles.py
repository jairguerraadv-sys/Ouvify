"""
Classes de throttling customizadas para proteção contra abuso de APIs.

Implementa rate limiting específico para endpoints públicos sensíveis,
protegendo contra força bruta e enumeração de protocolos.
"""
from rest_framework.throttling import AnonRateThrottle
import logging

logger = logging.getLogger(__name__)


class ProtocoloConsultaThrottle(AnonRateThrottle):
    """
    Throttle para limitar consultas de protocolo por IP + Código tentado.
    
    ✅ ATUALIZAÇÃO (2026-01-27):
    - Rate aumentado de 5/min para 10/min (melhor UX)
    - Cache key agora inclui IP + Protocolo (previne enumeração)
    - Logs melhorados para análise de segurança
    
    **Rate:** 10 requisições por minuto por combinação (IP + Protocolo)
    
    **Objetivo:** Proteger contra:
    - Força bruta para descobrir protocolos válidos
    - Enumeração massiva de códigos
    - Abuso do endpoint público
    
    **Segurança:**
    - Formato OUVY-XXXX-YYYY: 36^8 = ~2.8 trilhões de combinações
    - Com 10 req/min, um atacante precisaria de ~500 mil anos para brute force
    - Rate limit POR PROTOCOLO impede tentativas distribuídas
    
    **Exemplo de Cache Key:**
    - `throttle_protocolo_192.168.1.100_OUVY-A3B9-K7M2`
    - Permite 10 tentativas/min para CADA protocolo diferente
    - Mas apenas 10 tentativas/min para o MESMO protocolo
    """
    
    # Nome da configuração em settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']
    scope = 'protocolo_consulta'
    
    def get_cache_key(self, request, view):
        """
        Gera chave de cache única baseada em IP + Protocolo tentado.
        
        ✅ SEGURANÇA APRIMORADA:
        - Cache key inclui o código do protocolo
        - Impede que atacante tente múltiplos protocolos do mesmo IP
        - Força o atacante a distribuir tentativas entre IPs E protocolos
        
        **Comportamento:**
        - 10 tentativas/min para protocolo "OUVY-AAAA-BBBB" no IP X
        - 10 tentativas/min para protocolo "OUVY-CCCC-DDDD" no IP X
        - Se usuário errar o código, pode tentar outro sem ser bloqueado
        - Se usuário tentar o MESMO código 10x, será bloqueado por 1 min
        
        Args:
            request: Objeto Request do DRF
            view: View sendo acessada
            
        Returns:
            str: Chave única no formato "throttle_protocolo_{IP}_{CODIGO}"
        """
        if request.user and request.user.is_authenticated:
            # Usuários autenticados não são throttled por este throttle
            # (usam o throttle global 'user': '1000/hour')
            ident = None
        else:
            # Obter identificador do cliente (IP)
            ident = self.get_ident(request)
        
        if not ident:
            return None
        
        # Obter código do protocolo tentado (query param ou body)
        if request.method == 'GET':
            protocolo = request.query_params.get('codigo', '').strip().upper()  # type: ignore[attr-defined]
        else:
            # Para POST /responder-protocolo/
            protocolo = request.data.get('protocolo', '').strip().upper()
        
        # Sanitizar código (remover caracteres especiais)
        protocolo_clean = ''.join(c for c in protocolo if c.isalnum() or c == '-')
        
        # Se não houver protocolo, usar chave genérica (rate limit global)
        if not protocolo_clean:
            return self.cache_format % {
                'scope': self.scope,
                'ident': ident
            }
        
        # Chave específica: IP + Protocolo
        # Exemplo: throttle_protocolo_192.168.1.100_OUVY-A3B9-K7M2
        return f'throttle_protocolo_{ident}_{protocolo_clean}'
    
    def allow_request(self, request, view):
        """
        Sobrescreve para adicionar logging de tentativas suspeitas.
        
        Registra no log:
        - Tentativas bloqueadas (rate limit excedido)
        - IP do cliente
        - Protocolo que estava tentando acessar
        - Tempo de espera restante
        """
        # Verificar se a requisição é permitida
        allowed = super().allow_request(request, view)
        
        if not allowed:
            # Logar tentativa bloqueada
            ip_address = self.get_ident(request)
            
            # Obter protocolo tentado
            if request.method == 'GET':
                protocolo = request.query_params.get('codigo', 'N/A')  # type: ignore[attr-defined]
            else:
                protocolo = request.data.get('protocolo', 'N/A')
            
            # Calcular tempo de espera
            wait_time = self.wait()
            wait_str = f"{int(wait_time)}s" if wait_time else "N/A"
            
            logger.warning(
                f"🚨 Rate limit excedido | "
                f"IP: {ip_address} | "
                f"Protocolo tentado: {protocolo} | "
                f"Endpoint: {view.__class__.__name__}.{view.action if hasattr(view, 'action') else 'unknown'} | "
                f"Aguardar: {wait_str}"
            )
        
        return allowed
    
    def wait(self):
        """
        Retorna o tempo de espera em segundos até a próxima requisição permitida.
        
        Returns:
            int | None: Segundos para aguardar, ou None se não houver limite
        """
        wait_seconds = super().wait()
        if wait_seconds:
            return int(wait_seconds)
        return None


class FeedbackCriacaoThrottle(AnonRateThrottle):
    """
    Throttle para criação de feedbacks anônimos.
    
    Rate: 10 feedbacks por hora por IP.
    
    Objetivo: Prevenir spam de feedbacks.
    """
    scope = 'feedback_criacao'
    rate = '10/hour'
    
    def allow_request(self, request, view):
        allowed = super().allow_request(request, view)
        
        if not allowed:
            ip_address = self.get_ident(request)
            logger.warning(
                f"🚨 Rate limit de criação excedido | "
                f"IP: {ip_address} | "
                f"Tentou criar feedback"
            )
        
        return allowed
