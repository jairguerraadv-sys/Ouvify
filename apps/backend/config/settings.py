"""
Django settings for Ouvify project.
Configurações carregadas de variáveis de ambiente para segurança.
"""

import os
import sys
from pathlib import Path

# Sentry para monitoring
import sentry_sdk
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=False,
    environment=(
        "production"
        if not os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
        else "development"
    ),
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Adicionar diretório apps ao path do Python para facilitar imports
sys.path.insert(0, str(BASE_DIR / "apps"))

# Carregar variáveis de ambiente do arquivo .env
# Primeiro tenta do diretório do backend, depois do pai (para compatibilidade)
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv(BASE_DIR.parent / ".env")

# Detectar modo de teste e carregar configurações específicas
if os.getenv("TESTING", "False").lower() in ("true", "1", "yes"):
    TESTING_MODE = True
else:
    TESTING_MODE = False

# =============================================================================
# CONFIGURAÇÕES DE SEGURANÇA
# =============================================================================

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

# SECURITY WARNING: keep the secret key used in production secret!
# Em produção (DEBUG=False), SECRET_KEY DEVE estar em variável de ambiente
SECRET_KEY_ENV = os.getenv("SECRET_KEY")

if not DEBUG and not SECRET_KEY_ENV:
    # Produção SEM SECRET_KEY configurada - ERRO CRÍTICO
    raise ValueError(
        "🔴 ERRO DE SEGURANÇA: SECRET_KEY não configurada em produção!\n"
        "Defina a variável de ambiente SECRET_KEY com uma chave única.\n"
        "Gere uma nova: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )

# ATUALIZADO: Auditoria 30/01/2026
# Em produção, EXIGIR SECRET_KEY da env; em dev/teste, usar fallback seguro
if DEBUG or os.getenv("TESTING", "False").lower() in ("true", "1", "yes"):
    # Desenvolvimento/Teste: usar fallback APENAS se não configurada
    SECRET_KEY = SECRET_KEY_ENV or "dev-only-key-do-not-use-in-production-" + str(
        hash("ouvify")
    )
    if not SECRET_KEY_ENV:
        import warnings

        warnings.warn(
            "⚠️ SECRET_KEY não configurada. Usando chave de desenvolvimento. "
            "NUNCA use em produção!",
            UserWarning,
        )
else:
    # Produção: SEMPRE usar da variável de ambiente (já validado acima)
    SECRET_KEY = SECRET_KEY_ENV

if DEBUG and SECRET_KEY_ENV:
    print("✅ SECRET_KEY carregado de .env com sucesso.")

# Hosts permitidos
# Para Railway: adicione todos os possíveis domínios e use suffix pattern
allowed_hosts_str = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1,testserver,.local,.localhost,.railway.app,.up.railway.app,ouvify-production.up.railway.app",
)
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(",") if h.strip()]

# Permitir liberar hosts temporariamente via env (para diagnóstico em produção)
if os.getenv("ALLOW_ALL_HOSTS", "False").lower() in ("true", "1", "yes"):
    ALLOWED_HOSTS = ["*"]

# Bloquear configuração insegura em produção
if not DEBUG and ALLOWED_HOSTS == ["*"]:
    raise ValueError(
        "🔴 ERRO DE SEGURANÇA: ALLOW_ALL_HOSTS ativado em produção. "
        "Defina ALLOWED_HOSTS com domínios específicos."
    )

# Utilizar cabeçalhos de proxy para host/esquema corretos atrás de reverse proxy
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Headers de segurança (configurações completas em bloco de produção abaixo)
# Content Security Policy
if not DEBUG:
    # CSP_INCLUDE_NONCE_IN = ['script-src']  # Django 6.0+ native nonce support
    CSP_DEFAULT_SRC = ("'self'",)
    CSP_SCRIPT_SRC = ("'self'", "NONCE", "https://js.stripe.com", "'strict-dynamic'")
    CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")  # Tailwind necessita unsafe-inline
    CSP_IMG_SRC = ("'self'", "data:", "https:", "blob:")
    CSP_FONT_SRC = ("'self'", "data:")
    CSP_CONNECT_SRC = ("'self'", "https://api.stripe.com")
    CSP_FRAME_SRC = ("https://js.stripe.com", "https://hooks.stripe.com")
    CSP_OBJECT_SRC = ("'none'",)
    CSP_BASE_URI = ("'self'",)
    CSP_FORM_ACTION = ("'self'",)

    # CSP Mode: 'enforce' (blocking) or 'report-only' (monitoring)
    CSP_MODE = os.getenv("CSP_MODE", "enforce")

# Permissions Policy (antigamente Feature-Policy)
PERMISSIONS_POLICY = {
    "geolocation": [],
    "microphone": [],
    "camera": [],
    "payment": ["self"],
}

# HSTS (HTTP Strict Transport Security) - apenas em produção
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

if DEBUG:
    print(f"🌐 ALLOWED_HOSTS: {ALLOWED_HOSTS}")

# Validação de segurança em produção
if not DEBUG and SECRET_KEY.startswith("django-insecure"):
    raise ValueError(
        "🔴 ERRO DE SEGURANÇA: SECRET_KEY padrão detectada em modo de produção!\n"
        "Configure a variável SECRET_KEY no arquivo .env com uma chave única.\n"
        "Gere uma nova: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Bibliotecas de Terceiros
    "rest_framework",  # Para criar a API
    # 'rest_framework.authtoken',  # Legacy TokenAuth removido (hardening 2026)
    "rest_framework_simplejwt.token_blacklist",  # JWT com blacklist
    "corsheaders",  # Para o frontend conectar (Next.js)
    "drf_spectacular",  # OpenAPI 3.0 documentation
    # Nossos Apps (Ouvify)
    "apps.core",
    "apps.tenants",
    "apps.feedbacks",
    "apps.notifications",  # Push Notifications
    "apps.auditlog",  # Audit Log & Analytics
    "apps.consent",  # LGPD Consent Management
    "apps.billing",  # Billing & Subscriptions (Sprint 4)
    "apps.webhooks",  # Webhooks & Integrações (Sprint 5)
]

# Performance monitoring (development only, not in testing) - Auditoria Fase 3
if DEBUG and not TESTING_MODE:
    INSTALLED_APPS += [
        "nplusone.ext.django",  # N+1 query detection
        "debug_toolbar",  # Django Debug Toolbar
    ]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CORS para API
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",  # ✅ RE-HABILITADO: JWT não usa cookies mas mantemos para Django Admin
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Middleware de Multi-tenancy (O nosso porteiro)
    "apps.core.middleware.TenantMiddleware",
    # Enforce de isolamento e membership do tenant
    "apps.core.middleware.TenantIsolationMiddleware",
    # Middleware de segurança adicional (headers CSP, etc)
    "apps.core.security_middleware.SecurityHeadersMiddleware",
]

# Performance monitoring middleware (development only, not in testing) - Auditoria Fase 3
if DEBUG and not TESTING_MODE:
    MIDDLEWARE += [
        "nplusone.ext.django.NPlusOneMiddleware",  # N+1 detection
        "debug_toolbar.middleware.DebugToolbarMiddleware",  # Debug toolbar
    ]

    # Debug Toolbar configuration
    INTERNAL_IPS = [
        "127.0.0.1",
        "localhost",
    ]

    # nplusone configuration
    NPLUSONE_RAISE = True  # Raise exception on N+1 (para forçar correção)
    NPLUSONE_LOGGER = "nplusone"
    NPLUSONE_LOG_LEVEL = "WARN"

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# =============================================================================
# BANCO DE DADOS
# =============================================================================

# Preferir DATABASE_PRIVATE_URL do Railway (melhor performance)
# Fallback para DATABASE_URL se não estiver disponível
DATABASE_PRIVATE_URL = os.getenv("DATABASE_PRIVATE_URL")  # Railway private network
DATABASE_URL = os.getenv("DATABASE_URL")  # Railway public / Heroku

if DATABASE_PRIVATE_URL:
    # Railway Private URL (recomendado para produção)
    # Usa rede privada interna do Railway para conexão mais rápida
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_PRIVATE_URL,
            conn_max_age=600,  # Pool de conexões persistentes
            conn_health_checks=True,  # Health checks automáticos
            ssl_require=False,  # Railway private network não precisa SSL
        )
    }

    # Configurações adicionais de performance
    DATABASES["default"]["OPTIONS"] = {
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000",  # 30s timeout
    }

    # Configuração do pool de conexões (se usar pgbouncer)
    if os.getenv("DATABASE_POOL_MODE"):
        DATABASES["default"]["DISABLE_SERVER_SIDE_CURSORS"] = True

    print("✅ Usando DATABASE_PRIVATE_URL (Railway Private Network)")

elif DATABASE_URL:
    # Fallback para DATABASE_URL público
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,  # Public URL exige SSL
        )
    }

    # Configurações adicionais de performance
    DATABASES["default"]["OPTIONS"] = {
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000",  # 30s timeout
    }

    print(
        "⚠️ Usando DATABASE_URL (Public Network) - Configure DATABASE_PRIVATE_URL para melhor performance"
    )

else:
    # Desenvolvimento: suportar configuração manual ou SQLite
    DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()

    if DB_ENGINE == "postgresql":
        # Configuração PostgreSQL manual para desenvolvimento
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.getenv("DB_NAME", "ouvify_db"),
                "USER": os.getenv("DB_USER", "postgres"),
                "PASSWORD": os.getenv("DB_PASSWORD", ""),
                "HOST": os.getenv("DB_HOST", "localhost"),
                "PORT": os.getenv("DB_PORT", "5432"),
                "CONN_MAX_AGE": 600,
                "OPTIONS": {
                    "connect_timeout": 10,
                },
            }
        }

        # Validação de credenciais em produção
        if not DEBUG and not os.getenv("DB_PASSWORD"):
            raise ValueError(
                "🔴 ERRO: DB_PASSWORD não configurada!\n"
                "Configure em Railway: DATABASE_PRIVATE_URL, DATABASE_URL ou DB_PASSWORD"
            )
    else:
        # SQLite para desenvolvimento (fallback)
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }

        if not DEBUG:
            raise ImproperlyConfigured(
                "DATABASE_URL ou DATABASE_PRIVATE_URL deve estar configurada em produção"
            )
        print("⚠️ Usando SQLite (apenas desenvolvimento)")


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# =============================================================================
# INTERNACIONALIZAÇÃO
# =============================================================================

LANGUAGE_CODE = os.getenv("LANGUAGE_CODE", "pt-br")
TIME_ZONE = os.getenv("TIME_ZONE", "America/Sao_Paulo")
USE_I18N = True
USE_TZ = True

# =============================================================================
# ARQUIVOS ESTÁTICOS E MEDIA
# =============================================================================

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# =============================================================================
# MEDIA FILES E CLOUDINARY
# =============================================================================

# Configuração de Cloudinary (Upload de arquivos)
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")

if CLOUDINARY_URL:
    # Se Cloudinary está configurado, usar ele como storage principal
    # Parser do CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
    from urllib.parse import urlparse

    import cloudinary
    import cloudinary.api
    import cloudinary.uploader

    parsed = urlparse(CLOUDINARY_URL)

    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": parsed.hostname,
        "API_KEY": parsed.username,
        "API_SECRET": parsed.password,
    }

    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

    # Configurar biblioteca cloudinary
    cloudinary.config(
        cloud_name=CLOUDINARY_STORAGE["CLOUD_NAME"],
        api_key=CLOUDINARY_STORAGE["API_KEY"],
        api_secret=CLOUDINARY_STORAGE["API_SECRET"],
        secure=True,
    )

    print(f"☁️  Cloudinary configurado: {CLOUDINARY_STORAGE['CLOUD_NAME']}")
else:
    # Fallback para armazenamento local (desenvolvimento)
    MEDIA_URL = "media/"
    MEDIA_ROOT = BASE_DIR / "media"
    print("⚠️ Cloudinary não configurado. Usando armazenamento local.")

# Limites de upload
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE

# Tipos de arquivo permitidos
ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

# =============================================================================
# CONFIGURAÇÕES DE SEGURANÇA (CONSOLIDADAS)
# =============================================================================

# Headers de segurança aplicados em todos os ambientes
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Configurações adicionais apenas em produção
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================

# Origens permitidas para requisições do frontend
_DEFAULT_CORS_ALLOWED_ORIGINS = (
    "http://localhost:3000,http://127.0.0.1:3000,https://ouvify-frontend-jairguerraadv-sys-projects.vercel.app"
    if DEBUG
    else "https://ouvify-frontend-jairguerraadv-sys-projects.vercel.app"
)

CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    _DEFAULT_CORS_ALLOWED_ORIGINS,
).split(",")

# Segurança CORS: bloquear origens de desenvolvimento em produção
if not DEBUG:
    dev_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
    if any(origin.strip() in dev_origins for origin in CORS_ALLOWED_ORIGINS):
        raise ValueError(
            "🔴 ERRO DE SEGURANÇA: CORS_ALLOWED_ORIGINS contém localhost em produção. "
            "Defina apenas os domínios do frontend em produção."
        )

# Permitir credenciais (cookies, headers de autenticação)
# Em produção, o padrão é False para evitar leakage de cookies
CORS_ALLOW_CREDENTIALS = os.getenv(
    "CORS_ALLOW_CREDENTIALS", "True" if DEBUG else "False"
).lower() in ("true", "1", "yes")

# Headers permitidos
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-tenant-id",  # Header customizado para multitenancy
]

# Adicionar suporte para preview deployments do Vercel (*.vercel.app)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",  # Todos os deployments do Vercel
]

# =============================================================================
# CSRF (Cross-Site Request Forgery) Protection
# =============================================================================

# Origens confiáveis para CSRF (mesmas do CORS)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ouvify.vercel.app",
    "https://ouvify-frontend-jairguerraadv-sys-projects.vercel.app",
]

# Em produção, remover localhost
if not DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        origin
        for origin in CSRF_TRUSTED_ORIGINS
        if not origin.startswith("http://localhost")
        and not origin.startswith("http://127.0.0.1")
    ]

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",  # JWT como principal
        "rest_framework.authentication.SessionAuthentication",  # Para Django Admin
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "apps.core.throttling.TenantRateThrottle",  # ✅ Rate limiting por tenant
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",  # Rate limit geral para usuários anônimos
        "user": "1000/hour",  # Rate limit para usuários autenticados (fallback)
        "tenant": "5000/hour",  # ✅ Rate limit por tenant (evita abuso de múltiplos usuários)
        "tenant_burst": "100/minute",  # ✅ Burst limit por tenant
        "tenant_info": "100/hour",  # ✅ NOVO (Auditoria Fase 2): Endpoint público tenant-info
        "tenant_signup": "10/hour",  # Signup de tenant (público)
        "tenant_subdomain_check": "120/hour",  # Verificação de subdomínio (público)
        "invitation_accept": "30/hour",  # Aceite de convite (público via token)
        "protocolo_consulta": "10/minute",  # Rate limit para consulta de protocolo (IP + Protocolo)
        "feedback_criacao": "10/hour",  # ✅ Rate limit para criação de feedbacks
    },
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",  # Handler customizado
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",  # Paginação padrão
    "PAGE_SIZE": 20,  # 20 itens por página
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",  # Para documentação OpenAPI
}

# =============================================================================
# DRF-SPECTACULAR (OpenAPI Documentation)
# =============================================================================

SPECTACULAR_SETTINGS = {
    "TITLE": "Ouvify API",
    "DESCRIPTION": """
## API do Sistema Ouvify

O Ouvify é uma plataforma SaaS multi-tenant para canais de ética, ouvidoria e gestão de feedbacks anônimos.

### Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Para obter um token:

1. Faça POST em `/api/token/` com `email` e `password`
2. Use o `access` token no header: `Authorization: Bearer <token>`
3. Renove tokens expirados com `/api/token/refresh/`

### Multi-tenancy

Cada requisição é automaticamente filtrada pelo tenant do usuário autenticado.
Não é possível acessar dados de outros tenants.

### Rate Limiting

- Anônimos: 100 req/hora
- Autenticados: 1000 req/hora
- Por tenant: 5000 req/hora

### Códigos de Status

- `200 OK`: Sucesso
- `201 Created`: Recurso criado
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Erro no servidor
    """,
    "VERSION": "2.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "displayOperationId": False,
        "filter": True,
    },
    "COMPONENT_SPLIT_REQUEST": True,
    "SORT_OPERATIONS": False,
    "TAGS": [
        {"name": "Authentication", "description": "Endpoints de autenticação e JWT"},
        {
            "name": "Feedbacks",
            "description": "Gerenciamento de denúncias, sugestões e feedbacks",
        },
        {"name": "Tenants", "description": "Configurações e dados do tenant"},
        {"name": "Users", "description": "Gerenciamento de usuários"},
        {"name": "Notifications", "description": "Notificações push e in-app"},
        {"name": "Audit Log", "description": "Logs de auditoria e analytics"},
        {"name": "Search", "description": "Busca full-text (ElasticSearch)"},
        {"name": "2FA", "description": "Two-Factor Authentication (TOTP)"},
    ],
    "EXTERNAL_DOCS": {
        "description": "Documentação Completa",
        "url": "https://docs.ouvify.com.br",
    },
    "CONTACT": {
        "name": "Suporte Ouvify",
        "email": "suporte@ouvify.com.br",
    },
    "LICENSE": {
        "name": "Proprietary",
    },
}

# =============================================================================
# JWT (JSON Web Tokens) - djangorestframework-simplejwt
# =============================================================================

from datetime import timedelta

SIMPLE_JWT = {
    # Tokens expiráveis para segurança
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),  # Access token expira em 15 minutos
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),  # Refresh token expira em 7 dias
    # Rotacionar refresh tokens após uso (blacklist anterior)
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    # Algoritmo e chave de assinatura
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    # Headers de autorização
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    # Classes de token
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    # Sliding tokens (opcional, não usado)
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

# =============================================================================
# LOGGING
# =============================================================================

# Em produção, usar apenas console (Railway/Heroku não suportam file logs)
# Em desenvolvimento, usar também file handler
_log_handlers = ["console"]

# Tentar criar diretório de logs apenas em desenvolvimento local
if DEBUG:
    try:
        (BASE_DIR / "logs").mkdir(exist_ok=True)
        _log_handlers.append("file")
    except (PermissionError, OSError):
        # Em containers/produção, não temos permissão para criar diretórios
        pass

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        **(
            {
                "file": {
                    "class": "logging.FileHandler",
                    "filename": BASE_DIR / "logs" / "django.log",
                    "formatter": "verbose",
                }
            }
            if "file" in _log_handlers
            else {}
        ),
    },
    "root": {
        "handlers": _log_handlers,
        "level": "INFO" if not DEBUG else "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": _log_handlers,
            "level": "INFO",
            "propagate": False,
        },
        "apps": {
            "handlers": _log_handlers,
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
        "gunicorn": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# =============================================================================
# DEFAULT PRIMARY KEY
# =============================================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =============================================================================
# STRIPE
# =============================================================================

STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv(
    "STRIPE_WEBHOOK_SECRET", ""
)  # Será configurado após testar webhook local
STRIPE_REQUEST_TIMEOUT = int(os.getenv("STRIPE_REQUEST_TIMEOUT", "10"))
STRIPE_MAX_NETWORK_RETRIES = int(os.getenv("STRIPE_MAX_NETWORK_RETRIES", "2"))

# Price IDs do Stripe (substitua pelos IDs reais após criar produtos)
STRIPE_PRICE_IDS = {
    "starter_monthly": os.getenv("STRIPE_PRICE_STARTER_MONTHLY", ""),
    "pro_monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY", ""),
    "enterprise_monthly": os.getenv("STRIPE_PRICE_ENTERPRISE_MONTHLY", ""),
}

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

# =============================================================================
# CONFIGURAÇÕES DE EMAIL (SMTP)
# =============================================================================

# Provedor de Email (suporta: SendGrid, AWS SES, Mailgun, SMTP genérico)
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)

# Configurações SMTP
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.sendgrid.net")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "apikey")  # Para SendGrid: 'apikey'
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")  # API Key do provedor
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", "30"))

# Remetentes
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Ouvify <no-reply@ouvify.com.br>")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", DEFAULT_FROM_EMAIL)

# Em produção, usar backend real; em desenvolvimento, apenas console
if not DEBUG and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
elif DEBUG:
    # Em dev, imprime emails no console
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# =============================================================================
# VALIDAÇÕES DE AMBIENTE
# =============================================================================

# Avisos úteis no startup
if DEBUG:
    print("=" * 80)
    print("🟡 MODO DESENVOLVIMENTO ATIVO")
    print("=" * 80)
    print(f"📍 BASE_DIR: {BASE_DIR}")
    db_config = DATABASES.get("default", {})
    db_engine = db_config.get("ENGINE", "N/A") if isinstance(db_config, dict) else "N/A"
    print(f"🗄️  Database: {db_engine}")
    print(f"🌐 CORS Origins: {CORS_ALLOWED_ORIGINS}")
    print(
        f"🔑 SECRET_KEY: {'✅ Configurada' if not SECRET_KEY.startswith('django-insecure') else '⚠️ Usando chave padrão'}"
    )
    print(f"🛡️  Rate Limiting: ✅ Ativado (5 req/min para consulta de protocolo)")
    print(
        f"💳 Stripe: {'✅ Configurado' if STRIPE_SECRET_KEY else '⚠️ Aguardando STRIPE_SECRET_KEY'}"
    )
    print("=" * 80)
else:
    print("=" * 80)
    print("🟢 MODO PRODUÇÃO ATIVO")
    print("=" * 80)
    print("⚠️  Certifique-se de que todas as variáveis de ambiente estão configuradas!")
    print("=" * 80)

# ============================================
# OVERRIDES PARA MODO DE TESTE
# ============================================

if TESTING_MODE:
    print("🧪 Aplicando configurações de teste E2E...")

    # Desabilitar rate limiting
    REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
        "anon": "100000/minute",
        "user": "100000/minute",
        "protocolo_consulta": "100000/minute",
        "feedback_criacao": "100000/minute",
        "tenant": "100000/minute",  # ✅ Adicionar para testes JWT
        "tenant_burst": "100000/minute",
        "tenant_info": "100000/minute",  # ✅ Endpoint público tenant-info
        "tenant_signup": "100000/minute",
        "tenant_subdomain_check": "100000/minute",
        "invitation_accept": "100000/minute",
    }

    # Desabilitar CSRF e nplusone middleware para testes
    MIDDLEWARE = [
        m for m in MIDDLEWARE if "CsrfViewMiddleware" not in m and "NPlusOne" not in m
    ]

    # Desabilitar nplusone completamente
    NPLUSONE_RAISE = False
    NPLUSONE_WHITELIST = ["*"]  # Whitelist tudo
    import logging

    NPLUSONE_LOGGER = logging.getLogger("nplusone")  # Logger real, não string

    # Permitir todos os hosts
    ALLOWED_HOSTS = ["*"]

    # Logs verbosos
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

    # Outras configurações de teste
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "test-cache",
        }
    }
    PASSWORD_HASHERS = [
        "django.contrib.auth.hashers.MD5PasswordHasher",
    ]


# =============================================================================
# WEB PUSH NOTIFICATIONS (VAPID)
# =============================================================================
# Gere as keys com: python manage.py generate_vapid_keys
# Adicione ao .env ou variáveis de ambiente do Railway

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_ADMIN_EMAIL = os.getenv("VAPID_ADMIN_EMAIL", "admin@ouvify.app")

# Verificar VAPID em produção (opcional - apenas warning)
if not DEBUG and not VAPID_PRIVATE_KEY:
    import warnings

    warnings.warn(
        "VAPID_PRIVATE_KEY não configurada. Push notifications não funcionarão. "
        "Execute: python manage.py generate_vapid_keys"
    )

    print("⚙️  Rate limiting DESABILITADO para testes E2E")
# =============================================================================
# CELERY CONFIGURATION
# =============================================================================

CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_ENABLE_UTC = True

# Configuração de retry
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# Logging
CELERY_WORKER_LOG_FORMAT = "[%(asctime)s: %(levelname)s/%(processName)s] %(message)s"
CELERY_WORKER_TASK_LOG_FORMAT = "[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s"

# Para testes: executar tasks síncronas
if TESTING_MODE:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
