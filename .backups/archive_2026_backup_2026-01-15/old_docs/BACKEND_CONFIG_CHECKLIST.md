# 🔧 Backend Configuration Checklist

## Configurações Finais para Produção

### 1. ✅ Atualizar `settings.py`

Adicione as seguintes configurações:

```python
# ouvy_saas/config/settings.py

# ============================================
# REST FRAMEWORK CONFIGURATION
# ============================================
REST_FRAMEWORK = {
    # Exception Handler customizado
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    
    # Paginação padrão
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    
    # Autenticação
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    
    # Permissões
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    
    # Throttling (rate limiting)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    
    # Renderização
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'logs/django_warnings.log',
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'logs/django_errors.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.core': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.feedbacks': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps.tenants': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ============================================
# MIDDLEWARE CONFIGURATION
# ============================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Custom middleware (IMPORTANTE: deve vir depois do AuthenticationMiddleware)
    'apps.core.middleware.TenantMiddleware',
]

# ============================================
# CORS CONFIGURATION (se necessário)
# ============================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend em dev
    "https://ouvy-frontend.vercel.app",  # Frontend em produção
]

CORS_ALLOW_CREDENTIALS = True

# ============================================
# SECURITY SETTINGS (PRODUÇÃO)
# ============================================
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

### 2. ✅ Criar diretório de logs

```bash
mkdir -p ouvy_saas/logs
touch ouvy_saas/logs/.gitkeep

# Adicionar ao .gitignore
echo "logs/*.log" >> .gitignore
```

---

### 3. ✅ Instalar dependências adicionais (se necessário)

```bash
# Para CORS (se frontend e backend em domínios diferentes)
pip install django-cors-headers

# Para rate limiting avançado
pip install django-ratelimit

# Para caching com Redis (futuro)
pip install django-redis

# Atualizar requirements.txt
pip freeze > requirements.txt
```

---

### 4. ✅ Criar migrations para novos indexes

```python
# apps/feedbacks/migrations/0003_add_indexes.py

from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('feedbacks', '0002_previous_migration'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='feedback',
            index=models.Index(fields=['client', 'status'], name='feedback_client_status_idx'),
        ),
        migrations.AddIndex(
            model_name='feedback',
            index=models.Index(fields=['client', '-data_criacao'], name='feedback_client_date_idx'),
        ),
        migrations.AddIndex(
            model_name='feedback',
            index=models.Index(fields=['protocolo'], name='feedback_protocolo_idx'),
        ),
    ]
```

```bash
# Gerar e aplicar migrations
cd ouvy_saas
python manage.py makemigrations
python manage.py migrate
```

---

### 5. ✅ Testar Exception Handler

```bash
# Testar endpoint com erro para ver resposta customizada
curl -X POST http://localhost:8000/api/feedbacks/consultar-protocolo/ \
  -H "Content-Type: application/json" \
  -d '{"codigo": ""}'

# Deve retornar:
# {
#   "error": "Parâmetro 'codigo' é obrigatório",
#   "exemplo": "/api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY"
# }
```

---

### 6. ✅ Testar Paginação

```bash
# Listar feedbacks com paginação padrão (20 itens)
curl http://localhost:8000/api/feedbacks/ \
  -H "Authorization: Token YOUR_TOKEN"

# Deve retornar:
# {
#   "count": 150,
#   "next": "http://localhost:8000/api/feedbacks/?page=2",
#   "previous": null,
#   "page_size": 20,
#   "total_pages": 8,
#   "current_page": 1,
#   "results": [...]
# }

# Customizar page_size
curl "http://localhost:8000/api/feedbacks/?page_size=50" \
  -H "Authorization: Token YOUR_TOKEN"
```

---

### 7. ✅ Verificar Logging

```bash
# Em outro terminal, monitore os logs
tail -f ouvy_saas/logs/django_warnings.log

# Faça algumas requisições
curl http://localhost:8000/api/feedbacks/ -H "Authorization: Token YOUR_TOKEN"

# Deve aparecer logs como:
# INFO 2026-01-15 10:30:00 middleware 🔍 TenantMiddleware inicializado
# DEBUG 2026-01-15 10:30:01 middleware Tenant identificado: Empresa XYZ
# INFO 2026-01-15 10:30:01 views ✅ Feedback criado | Protocolo: OUVY-A3B9
```

---

### 8. ✅ Testar Query Optimization

```bash
# Instalar django-debug-toolbar (development only)
pip install django-debug-toolbar

# Adicionar ao settings.py (apenas em DEBUG=True)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']

# Acessar http://localhost:8000/api/feedbacks/
# No debug toolbar, verificar "SQL" - deve mostrar apenas 1-2 queries
```

---

### 9. ✅ Validar Validators

```python
# Teste manual no shell
python manage.py shell

from apps.core.validators import *

# Testar subdomain
validate_subdomain('empresa123')  # OK
validate_subdomain('minha-empresa')  # OK
try:
    validate_subdomain('www')  # Deve falhar (reservado)
except ValueError as e:
    print(f"✅ Bloqueou: {e}")

# Testar senha
validate_strong_password('senha123')  # OK
try:
    validate_strong_password('123456')  # Deve falhar (sem letras)
except ValueError as e:
    print(f"✅ Bloqueou: {e}")

# Testar CNPJ
validate_cnpj('11.222.333/0001-81')  # Testar com CNPJ válido
try:
    validate_cnpj('11.222.333/0001-99')  # Deve falhar (dígito inválido)
except ValueError as e:
    print(f"✅ Bloqueou: {e}")
```

---

### 10. ✅ Performance Check

```bash
# Instalar locust para load testing
pip install locust

# Criar locustfile.py
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class OuvyUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def list_feedbacks(self):
        self.client.get("/api/feedbacks/", 
                       headers={"Authorization": "Token YOUR_TOKEN"})
    
    @task(2)
    def dashboard_stats(self):
        self.client.get("/api/feedbacks/dashboard-stats/",
                       headers={"Authorization": "Token YOUR_TOKEN"})
EOF

# Rodar load test
locust -f locustfile.py --headless -u 10 -r 2 -t 1m --host http://localhost:8000

# Avaliar:
# - Response time (deve estar < 200ms para listagens)
# - Failures (deve ser 0%)
# - RPS (requests per second)
```

---

### 11. ✅ Security Audit

```bash
# Verificar vulnerabilidades conhecidas
pip install safety
safety check

# Verificar configurações de segurança
python manage.py check --deploy

# Deve mostrar apenas warnings, não errors críticos
```

---

### 12. ✅ Deploy Checklist

Antes de fazer deploy em produção:

- [ ] `DEBUG = False` em produção
- [ ] `SECRET_KEY` configurada via variável de ambiente
- [ ] `ALLOWED_HOSTS` configurado corretamente
- [ ] Database em PostgreSQL (não SQLite)
- [ ] Static files configurados com WhiteNoise
- [ ] Logs configurados e diretório criado
- [ ] CORS configurado (se necessário)
- [ ] HTTPS habilitado (SECURE_SSL_REDIRECT=True)
- [ ] Migrations aplicadas
- [ ] Indexes criados no banco
- [ ] Rate limiting testado
- [ ] Exception handler testado
- [ ] Paginação testada
- [ ] Query optimization validada
- [ ] Backup strategy definida

---

## 🔍 Comandos de Verificação Rápida

```bash
# Verificar settings
python manage.py diffsettings

# Verificar middlewares
python manage.py check --tag middleware

# Verificar segurança
python manage.py check --tag security

# Verificar database
python manage.py inspectdb | head -20

# Verificar migrations pendentes
python manage.py showmigrations

# Verificar static files
python manage.py collectstatic --dry-run

# Verificar CORS (se instalado)
python manage.py show_urls | grep cors
```

---

## 📝 Variáveis de Ambiente Necessárias

Criar arquivo `.env` (não commitar!):

```bash
# .env
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CORS (se necessário)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (para notificações futuras)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Sentry (monitoring, opcional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/123456

# Redis (caching, futuro)
REDIS_URL=redis://localhost:6379/0
```

---

## ✅ Conclusão

Depois de seguir todos os passos:

1. ✅ Backend refatorado com código limpo
2. ✅ Performance otimizada (queries, paginação)
3. ✅ Logging estruturado
4. ✅ Exception handling consistente
5. ✅ Security best practices
6. ✅ Pronto para produção

**Status:** 🚀 Production Ready!
