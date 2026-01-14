"""
Django settings for Ouvy SaaS project.
Configurações carregadas de variáveis de ambiente para segurança.
"""

from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Adicionar diretório apps ao path do Python para facilitar imports
sys.path.insert(0, str(BASE_DIR / 'apps'))

# Carregar variáveis de ambiente do arquivo .env (no diretório pai)
load_dotenv(BASE_DIR.parent / '.env')

# =============================================================================
# CONFIGURAÇÕES DE SEGURANÇA
# =============================================================================

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')

# SECURITY WARNING: keep the secret key used in production secret!
# Em produção (DEBUG=False), SECRET_KEY DEVE estar em variável de ambiente
SECRET_KEY_ENV = os.getenv('SECRET_KEY')

if not DEBUG and not SECRET_KEY_ENV:
    # Produção SEM SECRET_KEY configurada - ERRO CRÍTICO
    raise ValueError(
        "🔴 ERRO DE SEGURANÇA: SECRET_KEY não configurada em produção!\n"
        "Defina a variável de ambiente SECRET_KEY com uma chave única.\n"
        "Gere uma nova: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )

# Em desenvolvimento, usar fallback; em produção, usar da env
SECRET_KEY = SECRET_KEY_ENV or 'r0FpXcqiJeBmF7EPR2AhEAsI0L8HV1dNMDueS7DP1PE9vENXI'

if DEBUG:
    print("✅ SECRET_KEY carregado de .env com sucesso.")

# Hosts permitidos
# Para Railway: adicione todos os possíveis domínios e use suffix pattern
allowed_hosts_str = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,.local,.railway.app,.up.railway.app,ouvy-saas-production.up.railway.app'
)
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',') if h.strip()]

# Permitir liberar hosts temporariamente via env (para diagnóstico em produção)
if os.getenv('ALLOW_ALL_HOSTS', 'False').lower() in ('true', '1', 'yes'):
    ALLOWED_HOSTS = ['*']

# Utilizar cabeçalhos de proxy para host/esquema corretos atrás de reverse proxy
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Headers de segurança adicionais
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

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
if not DEBUG and SECRET_KEY.startswith('django-insecure'):
    raise ValueError(
        "🔴 ERRO DE SEGURANÇA: SECRET_KEY padrão detectada em modo de produção!\n"
        "Configure a variável SECRET_KEY no arquivo .env com uma chave única.\n"
        "Gere uma nova: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Bibliotecas de Terceiros
    'rest_framework',      # Para criar a API
    'rest_framework.authtoken',  # Para autenticação via token
    'corsheaders',         # Para o frontend conectar (Next.js)
    'drf_yasg',            # Swagger/OpenAPI documentation

    # Nossos Apps (Ouvy)
    'apps.core',
    'apps.tenants',
    'apps.feedbacks',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Adicionado para API
    # 'django.middleware.common.CommonMiddleware',  # Desabilitado: Railway usa proxy reverse
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Desabilitado: API usa token auth, não cookie CSRF
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Middleware de Multi-tenancy (O nosso porteiro)
    'apps.core.middleware.TenantMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# =============================================================================
# BANCO DE DADOS
# =============================================================================

# Suporte para DATABASE_URL (Railway, Heroku, etc.)
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Produção: usar DATABASE_URL (Railway, Heroku, etc.)
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    print("✅ Banco de dados configurado via DATABASE_URL")
else:
    # Desenvolvimento: suportar configuração manual ou SQLite
    DB_ENGINE = os.getenv('DB_ENGINE', 'sqlite').lower()

    if DB_ENGINE == 'postgresql':
        # Configuração PostgreSQL manual para desenvolvimento
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.getenv('DB_NAME', 'ouvy_db'),
                'USER': os.getenv('DB_USER', 'postgres'),
                'PASSWORD': os.getenv('DB_PASSWORD', ''),
                'HOST': os.getenv('DB_HOST', 'localhost'),
                'PORT': os.getenv('DB_PORT', '5432'),
                'CONN_MAX_AGE': 600,
                'OPTIONS': {
                    'connect_timeout': 10,
                }
            }
        }
        
        # Validação de credenciais em produção
        if not DEBUG and not os.getenv('DB_PASSWORD'):
            raise ValueError(
                "🔴 ERRO: DB_PASSWORD não configurada!\n"
                "Configure em Railway: DATABASE_URL ou DB_PASSWORD"
            )
    else:
        # SQLite para desenvolvimento (fallback)
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
        
        if not DEBUG:
            print(
                "⚠️ AVISO: Usando SQLite em modo de produção. "
                "Configure DATABASE_URL no .env para usar PostgreSQL."
            )


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# =============================================================================
# INTERNACIONALIZAÇÃO
# =============================================================================

LANGUAGE_CODE = os.getenv('LANGUAGE_CODE', 'pt-br')
TIME_ZONE = os.getenv('TIME_ZONE', 'America/Sao_Paulo')
USE_I18N = True
USE_TZ = True

# =============================================================================
# ARQUIVOS ESTÁTICOS E MEDIA
# =============================================================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# =============================================================================
# CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS
# =============================================================================

if not DEBUG:
    # Configurações de segurança para produção
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================

# Origens permitidas para requisições do frontend
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app'
).split(',')

# Permitir credenciais (cookies, headers de autenticação)
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() in ('true', '1', 'yes')

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-id',  # Header customizado para multitenancy
]

# Adicionar suporte para preview deployments do Vercel (*.vercel.app)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",  # Todos os deployments do Vercel
]

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Rate limit geral para usuários anônimos
        'user': '1000/hour',  # Rate limit para usuários autenticados
        'protocolo_consulta': '5/minute',  # Rate limit específico para consulta de protocolo
    },
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',  # Handler customizado
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',  # Paginação padrão
    'PAGE_SIZE': 20,  # 20 itens por página
}

# =============================================================================
# LOGGING
# =============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO' if not DEBUG else 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

# Criar diretório de logs se não existir
(BASE_DIR / 'logs').mkdir(exist_ok=True)

# =============================================================================
# DEFAULT PRIMARY KEY
# =============================================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# STRIPE
# =============================================================================

STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')  # Será configurado após testar webhook local

BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')

# =============================================================================
# VALIDAÇÕES DE AMBIENTE
# =============================================================================

# Avisos úteis no startup
if DEBUG:
    print("=" * 80)
    print("🟡 MODO DESENVOLVIMENTO ATIVO")
    print("=" * 80)
    print(f"📍 BASE_DIR: {BASE_DIR}")
    db_config = DATABASES.get('default', {})
    db_engine = db_config.get('ENGINE', 'N/A') if isinstance(db_config, dict) else 'N/A'
    print(f"🗄️  Database: {db_engine}")
    print(f"🌐 CORS Origins: {CORS_ALLOWED_ORIGINS}")
    print(f"🔑 SECRET_KEY: {'✅ Configurada' if not SECRET_KEY.startswith('django-insecure') else '⚠️ Usando chave padrão'}")
    print(f"🛡️  Rate Limiting: ✅ Ativado (5 req/min para consulta de protocolo)")
    print(f"💳 Stripe: {'✅ Configurado' if STRIPE_SECRET_KEY else '⚠️ Aguardando STRIPE_SECRET_KEY'}")
    print("=" * 80)
else:
    print("=" * 80)
    print("🟢 MODO PRODUÇÃO ATIVO")
    print("=" * 80)
    print("⚠️  Certifique-se de que todas as variáveis de ambiente estão configuradas!")
    print("=" * 80)