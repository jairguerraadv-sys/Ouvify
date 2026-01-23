"""
Constantes do módulo de Tenants.
"""


class PlanoTipo:
    """Tipos de planos de assinatura."""
    FREE = 'free'
    STARTER = 'starter'
    PRO = 'pro'
    
    @classmethod
    def choices(cls):
        """Retorna lista de tuplas para uso em models.CharField(choices=...)"""
        return [
            (cls.FREE, 'Free'),
            (cls.STARTER, 'Starter'),
            (cls.PRO, 'Pro'),
        ]
    
    @classmethod
    def values(cls):
        """Retorna lista de valores válidos."""
        return [cls.FREE, cls.STARTER, cls.PRO]
    
    @classmethod
    def pagos(cls):
        """Retorna apenas planos pagos."""
        return [cls.STARTER, cls.PRO]


class SubscriptionStatus:
    """Status possíveis de assinatura Stripe."""
    ACTIVE = 'active'
    CANCELED = 'canceled'
    INCOMPLETE = 'incomplete'
    INCOMPLETE_EXPIRED = 'incomplete_expired'
    PAST_DUE = 'past_due'
    TRIALING = 'trialing'
    UNPAID = 'unpaid'
    
    @classmethod
    def values(cls):
        """Retorna lista de valores válidos."""
        return [
            cls.ACTIVE,
            cls.CANCELED,
            cls.INCOMPLETE,
            cls.INCOMPLETE_EXPIRED,
            cls.PAST_DUE,
            cls.TRIALING,
            cls.UNPAID,
        ]


# Subdominios reservados
RESERVED_SUBDOMAINS = [
    'www', 'api', 'app', 'admin', 'blog', 'mail', 'ftp', 'localhost',
    'staging', 'dev', 'test', 'demo', 'sandbox', 'docs', 'help',
    'support', 'status', 'monitor', 'cdn', 'static', 'assets',
]

# Regex para validação de subdomínio
SUBDOMAIN_REGEX = r'^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'

# Limites
MAX_CLIENT_NOME_LENGTH = 100
MAX_SUBDOMINIO_LENGTH = 50
