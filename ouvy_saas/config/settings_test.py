"""
Django settings para ambiente de teste E2E
Herda de settings.py e override configurações específicas
"""

# Import all from main settings first
from .settings import *

# ============================================
# CONFIGURAÇÕES DE TESTE E2E
# ============================================

# Desabilitar rate limiting para testes
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100000/minute',  # Praticamente ilimitado
    'user': '100000/minute',
    'protocolo_consulta': '100000/minute',
    'feedback_criacao': '100000/minute',
}

# Desabilitar CSRF para testes (já que Playwright não mantém cookies CSRF facilmente)
MIDDLEWARE = [m for m in MIDDLEWARE if 'CsrfViewMiddleware' not in m]

# Permitir todos os hosts em testes
ALLOWED_HOSTS = ['*']

# Logs mais verbosos para debug de testes
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Desabilitar emails em testes
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache em memória para testes (mais rápido)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'test-cache',
    }
}

# Senha simples para fixtures de teste (mais rápido)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

print("⚙️  Usando settings_test.py - Rate limiting DESABILITADO")