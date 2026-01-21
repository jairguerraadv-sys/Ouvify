# 🚀 GUIA DE DEPLOY - CORREÇÕES PRÉ-PRODUÇÃO

**Data:** 20 de janeiro de 2026  
**Projeto:** Ouvy SaaS  
**Status:** Aprovado para produção com correções

---

## 🔴 CORREÇÕES CRÍTICAS (OBRIGATÓRIAS)

### 1. Atualizar Dependências JavaScript
```bash
# No diretório ouvy_frontend/
npm audit fix
npm update
npm audit
```

**Verificar correção:**
- Vulnerabilidades devem reduzir para < 5
- Testar aplicação após update
- Verificar compatibilidade com Next.js 16.1.1

### 2. Corrigir Query N+1 em Feedbacks
**Arquivo:** `apps/feedbacks/views.py:163`

**Antes:**
```python
is_company = bool(request.user and request.user.is_authenticated)
```

**Depois:**
```python
# Otimizar query para evitar N+1
feedbacks = Feedback.objects.filter(client=tenant).select_related('user')
# ... resto do código
```

### 3. Revisar Content Security Policy
**Arquivo:** `config/settings.py`

**Atual:**
```python
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "https://js.stripe.com")
```

**Recomendado para produção:**
```python
CSP_SCRIPT_SRC = ("'self'", "https://js.stripe.com")
# Remover 'unsafe-inline' se possível
```

---

## 🟡 OTIMIZAÇÕES RECOMENDADAS

### 4. Implementar API Response Caching
```python
# Adicionar em settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### 5. Configurar Database Connection Pooling
```python
# Para PostgreSQL em produção
DATABASES = {
    'default': {
        # ... outras configs
        'CONN_MAX_AGE': 60,  # Reutilizar conexões
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

### 6. Otimizar Static Files
```bash
# Coletar static files
python manage.py collectstatic --noinput

# Configurar CDN (já tem Cloudinary)
# Verificar STATIC_URL e MEDIA_URL
```

---

## 🟢 VERIFICAÇÕES PRÉ-DEPLOY

### Checklist de Segurança
- [ ] `npm audit` mostra < 5 vulnerabilidades
- [ ] Query N+1 corrigida em feedbacks
- [ ] CSP sem 'unsafe-inline'
- [ ] SECRET_KEY configurada em produção
- [ ] DEBUG=False em produção
- [ ] ALLOWED_HOSTS configurados corretamente
- [ ] HTTPS forçado (SECURE_SSL_REDIRECT=True)

### Checklist de Performance
- [ ] Testes de carga passando (833 req/sec)
- [ ] Response time < 500ms
- [ ] CPU/Memory < 80%
- [ ] Database connections otimizadas
- [ ] Redis cache configurado

### Checklist de Funcionalidade
- [ ] Autenticação funcionando
- [ ] Multi-tenant isolation ativo
- [ ] Upload de arquivos (Cloudinary)
- [ ] Sanitização XSS validada
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente

---

## 📋 VARIÁVEIS DE AMBIENTE PRODUÇÃO

```bash
# Obrigatórias
DEBUG=False
SECRET_KEY=<chave-única-de-64-caracteres>
DATABASE_URL=<postgresql-url>
ALLOWED_HOSTS=<domínios-produção>

# Recomendadas
REDIS_URL=<redis-url>
CLOUDINARY_URL=<cloudinary-url>
SENTRY_DSN=<sentry-dsn>
STRIPE_SECRET_KEY=<stripe-key>

# Opcionais
TENANT_FALLBACK_ENABLED=False
CORS_ALLOW_CREDENTIALS=False
```

---

## 🚀 COMANDOS DE DEPLOY

### Backend (Railway)
```bash
# Build e deploy
railway deploy

# Verificar health check
curl https://your-app.railway.app/health/

# Verificar logs
railway logs
```

### Frontend (Vercel)
```bash
# Build e deploy
vercel --prod

# Verificar deployment
vercel ls
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Métricas Críticas
- Response time médio
- Error rate (< 1%)
- Database connections
- Memory/CPU usage
- Rate limiting hits

### Logs para Monitorar
- Erros 500 (Sentry)
- Rate limiting blocks
- Database timeouts
- File upload failures

---

## 🆘 PLANO DE ROLLBACK

**Se algo der errado:**

1. **Rollback imediato:**
   ```bash
   # Railway
   railway rollback <previous-deployment-id>
   
   # Vercel
   vercel rollback
   ```

2. **Verificar causa:**
   - Logs de erro
   - Métricas de performance
   - Database connections

3. **Comunicar stakeholders**

---

## ✅ CRITÉRIOS DE SUCESSO

**Deploy considerado bem-sucedido quando:**
- ✅ Zero erros 500 em 1 hora
- ✅ Response time < 500ms consistente
- ✅ Todas as funcionalidades testadas
- ✅ Rate limiting não bloqueando usuários legítimos
- ✅ Isolamento tenant funcionando
- ✅ Upload de arquivos operando

---

*Guia preparado automaticamente pela auditoria de segurança.*</content>
<parameter name="filePath">/Users/jairneto/Desktop/ouvy_saas/DEPLOY_READINESS_GUIDE.md