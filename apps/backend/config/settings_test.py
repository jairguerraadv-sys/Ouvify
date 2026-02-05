"""
Django settings para ambiente de teste E2E
Herda de settings.py e override configurações específicas
"""

# Import all from main settings first
from .settings import *

# ============================================
# CONFIGURAÇÕES DE TESTE E2E
# ============================================

# Forçar SQLite para testes (evita connect_timeout e outras opções do PostgreSQL)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
        "ATOMIC_REQUESTS": False,
        "CONN_MAX_AGE": 0,  # Sem pool de conexões
        "OPTIONS": {},  # Sem opções extras (evita connect_timeout)
        "TEST": {},
    }
}

# Desabilitar rate limiting para testes
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
    "anon": "100000/minute",  # Praticamente ilimitado
    "user": "100000/minute",
    # Scopes customizados precisam existir mesmo em testes, pois o DRF
    # instancia os throttles (e resolve o rate) antes de allow_request().
    "tenant": "100000/minute",
    "tenant_burst": "100000/minute",
    "tenant_info": "100000/minute",
    "tenant_signup": "100000/minute",
    "tenant_subdomain_check": "100000/minute",
    "invitation_accept": "100000/minute",
    "protocolo_consulta": "100000/minute",
    "feedback_criacao": "100000/minute",
    # FASE 3: Scopes de throttles específicos
    "login": "100000/minute",
    "two_factor_setup": "100000/minute",
    "two_factor_verify": "100000/minute",
    "password_reset_confirm": "100000/minute",
    "tenant_registration": "100000/minute",
    "feedback_submission": "100000/minute",
    "protocol_lookup": "100000/minute",
}

# Desabilitar CSRF para testes (já que Playwright não mantém cookies CSRF facilmente)
MIDDLEWARE = [m for m in MIDDLEWARE if "CsrfViewMiddleware" not in m]

# Permitir todos os hosts em testes
ALLOWED_HOSTS = ["*"]

# Logs mais verbosos para debug de testes
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Desabilitar emails em testes
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Cache em memória para testes (mais rápido)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# Senha simples para fixtures de teste (mais rápido)
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

print("⚙️  Usando settings_test.py - Rate limiting DESABILITADO")
