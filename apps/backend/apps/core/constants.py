"""
Constantes do sistema para evitar strings mágicas e melhorar manutenibilidade.
"""

# ============================================================================
# FEEDBACK - Status e Tipos
# ============================================================================


class FeedbackStatus:
    """Status possíveis de um Feedback"""

    PENDENTE = "pendente"
    EM_ANALISE = "em_analise"
    RESOLVIDO = "resolvido"
    FECHADO = "fechado"

    CHOICES = [
        (PENDENTE, "Pendente"),
        (EM_ANALISE, "Em Análise"),
        (RESOLVIDO, "Resolvido"),
        (FECHADO, "Fechado"),
    ]

    @classmethod
    def values(cls):
        """Retorna lista de valores válidos"""
        return [cls.PENDENTE, cls.EM_ANALISE, cls.RESOLVIDO, cls.FECHADO]


class FeedbackTipo:
    """Tipos de feedback"""

    DENUNCIA = "denuncia"
    SUGESTAO = "sugestao"
    ELOGIO = "elogio"
    RECLAMACAO = "reclamacao"

    CHOICES = [
        (DENUNCIA, "Denúncia"),
        (SUGESTAO, "Sugestão"),
        (ELOGIO, "Elogio"),
        (RECLAMACAO, "Reclamação"),
    ]

    @classmethod
    def values(cls):
        """Retorna lista de valores válidos"""
        return [cls.DENUNCIA, cls.SUGESTAO, cls.ELOGIO, cls.RECLAMACAO]


class InteracaoTipo:
    """Tipos de interação em um feedback"""

    MENSAGEM_PUBLICA = "MENSAGEM_PUBLICA"
    NOTA_INTERNA = "NOTA_INTERNA"
    MUDANCA_STATUS = "MUDANCA_STATUS"

    CHOICES = [
        (MENSAGEM_PUBLICA, "Mensagem Pública"),
        (NOTA_INTERNA, "Nota Interna"),
        (MUDANCA_STATUS, "Mudança de Status"),
    ]

    @classmethod
    def values(cls):
        """Retorna lista de valores válidos"""
        return [cls.MENSAGEM_PUBLICA, cls.NOTA_INTERNA, cls.MUDANCA_STATUS]


# ============================================================================
# TENANT - Planos e Status
# ============================================================================


class TenantPlano:
    """Planos de assinatura disponíveis"""

    FREE = "free"
    STARTER = "starter"
    PRO = "pro"

    CHOICES = [
        (FREE, "Gratuito"),
        (STARTER, "Starter - R$ 99/mês"),
        (PRO, "Pro - R$ 299/mês"),
    ]

    @classmethod
    def values(cls):
        """Retorna lista de valores válidos"""
        return [cls.FREE, cls.STARTER, cls.PRO]

    @classmethod
    def is_premium(cls, plano):
        """Verifica se o plano é premium (pago)"""
        return plano in [cls.STARTER, cls.PRO]


class SubscriptionStatus:
    """Status de assinatura Stripe"""

    ACTIVE = "active"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    UNPAID = "unpaid"

    CHOICES = [
        (ACTIVE, "Ativa"),
        (CANCELED, "Cancelada"),
        (INCOMPLETE, "Incompleta"),
        (INCOMPLETE_EXPIRED, "Incompleta Expirada"),
        (PAST_DUE, "Atrasada"),
        (TRIALING, "Período de Teste"),
        (UNPAID, "Não Paga"),
    ]

    @classmethod
    def is_active_status(cls, status):
        """Verifica se o status permite acesso ao sistema"""
        return status in [cls.ACTIVE, cls.TRIALING]


# ============================================================================
# SISTEMA - Configurações e Limites
# ============================================================================


class RateLimits:
    """Rate limits do sistema"""

    PASSWORD_RESET = "3/hour"  # 3 tentativas por hora
    PROTOCOLO_CONSULTA = "5/minute"  # 5 consultas por minuto
    FEEDBACK_CRIACAO = "10/hour"  # 10 feedbacks por hora (anônimo)
    API_DEFAULT = "100/hour"  # Rate limit padrão da API


class PaginationLimits:
    """Limites de paginação"""

    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100


class Timeouts:
    """Timeouts para operações externas"""

    STRIPE_API = 5.0  # 5 segundos
    EMAIL_SEND = 10.0  # 10 segundos
    WEBHOOK_PROCESSING = 5.0  # 5 segundos


# ============================================================================
# SUBDOMÍNIOS - Validação
# ============================================================================

RESERVED_SUBDOMAINS = [
    "www",
    "api",
    "admin",
    "app",
    "mail",
    "ftp",
    "smtp",
    "pop",
    "imap",
    "webmail",
    "email",
    "static",
    "assets",
    "cdn",
    "media",
    "files",
    "blog",
    "forum",
    "shop",
    "store",
    "help",
    "support",
    "docs",
    "ouvify",
    "ouvy",
    "test",
    "dev",
    "staging",
    "prod",
    "production",
    "localhost",
    "status",
    "monitor",
    "health",
    "metrics",
]


# ============================================================================
# PROTOCOLO - Configuração
# ============================================================================


class ProtocoloConfig:
    """Configurações de protocolo de feedback"""

    PREFIX = "OUVY"
    PARTE1_LENGTH = 4
    PARTE2_LENGTH = 4
    MAX_TENTATIVAS = 10

    @classmethod
    def format(cls):
        """Retorna formato do protocolo"""
        return f"{cls.PREFIX}-XXXX-YYYY"
