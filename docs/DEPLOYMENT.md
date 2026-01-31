# 🚀 Guia de Deployment - Ouvify

Este guia descreve como fazer deploy do Ouvify em produção usando Railway (backend) e Vercel (frontend).

---

## Arquitetura de Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Cloudflare   │     │     Vercel      │     │    Railway      │
│   (DNS + CDN)   │────►│   (Frontend)    │────►│   (Backend)     │
│                 │     │   Next.js 16    │     │   Django 5.1    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    │                    │                    │
                              ┌─────▼─────┐        ┌─────▼─────┐        ┌─────▼─────┐
                              │ PostgreSQL│        │   Redis   │        │Cloudinary │
                              │ (Railway) │        │ (Railway) │        │  (Media)  │
                              └───────────┘        └───────────┘        └───────────┘
```

---

## 1. Deploy do Backend (Railway)

### 1.1 Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `ouvify`
6. Configure o Root Directory: `apps/backend`

### 1.2 Adicionar Serviços

No dashboard do Railway, adicione:

**PostgreSQL:**
```
1. Clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Railway cria automaticamente DATABASE_URL
```

**Redis:**
```
1. Clique em "+ New"
2. Selecione "Database" → "Redis"
3. Railway cria automaticamente REDIS_URL
```

### 1.3 Configurar Variáveis de Ambiente

No serviço do backend, vá em "Variables" e adicione:

```bash
# Django Core
SECRET_KEY=<gerar com: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app,ouvify-production.up.railway.app

# Database (Railway preenche automaticamente)
# DATABASE_URL=postgresql://... (auto)
# DATABASE_PRIVATE_URL=postgresql://... (auto - usar este!)

# Redis (Railway preenche automaticamente)
# REDIS_URL=redis://... (auto)

# JWT
JWT_SECRET_KEY=<gerar chave única de 64 caracteres>
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# CORS
CORS_ALLOWED_ORIGINS=https://ouvify.vercel.app,https://ouvify-saas.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://ouvify.vercel.app/dashboard?payment=success
STRIPE_CANCEL_URL=https://ouvify.vercel.app/cadastro?payment=canceled

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=sua-api-secret

# Email (produção)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@ouvify.com.br
EMAIL_HOST_PASSWORD=<app-password>
DEFAULT_FROM_EMAIL=Ouvify <noreply@ouvify.com.br>

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 1.4 Configurar Build

Railway detecta automaticamente o `nixpacks.toml`:

```toml
# apps/backend/nixpacks.toml
[phases.setup]
nixPkgs = ['python311', 'postgresql']

[phases.install]
cmds = ['pip install -r requirements.txt']

# Nota (auditoria 2026-01-31): `apps/backend/requirements.txt` é o arquivo
# self-contained usado em ambientes onde o build context é `apps/backend`.
# O `requirements.txt` na raiz é um wrapper para tooling no root.

[phases.build]
cmds = ['python manage.py collectstatic --noinput']

[start]
cmd = 'python manage.py migrate --noinput && gunicorn config.wsgi --bind 0.0.0.0:$PORT --workers 2 --timeout 120'
```

### 1.5 Configurar Health Checks

No Railway, configure:
- **Health Check Path:** `/health/`
- **Restart Policy:** Always

### 1.6 Deploy

```bash
# Deploy automático via push
git push origin main

# Ou via Railway CLI
railway up
```

### 1.7 Verificar Deploy

```bash
# Testar health check
curl https://ouvify-production.up.railway.app/health/

# Resposta esperada:
# {"status": "healthy", "database": "ok", "redis": "ok"}
```

---

## 2. Deploy do Frontend (Vercel)

### 2.1 Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. Clique em "Add New Project"
4. Importe o repositório `ouvify`
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 2.2 Configurar Variáveis de Ambiente

No Vercel, vá em Settings → Environment Variables:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://ouvify-production.up.railway.app

# Site URL
NEXT_PUBLIC_SITE_URL=https://ouvify.vercel.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=<seu-token>

# CSP Mode (production = enforce)
CSP_MODE=enforce
```

### 2.3 Configuração vercel.json

O arquivo já está configurado em `apps/frontend/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "name": "ouvify-frontend",
  "buildCommand": "cd apps/frontend && npm install && npm run build",
  "outputDirectory": "apps/frontend/.next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload"}
      ]
    }
  ]
}
```

### 2.4 Deploy

```bash
# Deploy automático via push
git push origin main

# Ou via Vercel CLI
cd apps/frontend
vercel --prod
```

### 2.5 Configurar Domínio Customizado

1. No Vercel, vá em Settings → Domains
2. Adicione seu domínio: `ouvify.com.br`
3. Configure DNS no Cloudflare:

```
Type: CNAME
Name: @
Target: cname.vercel-dns.com

Type: CNAME
Name: www
Target: cname.vercel-dns.com
```

---

## 3. Configurar Stripe Webhooks

### 3.1 Criar Webhook no Stripe

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. Configure:
   - **URL:** `https://ouvify-production.up.railway.app/api/tenants/webhook/`
   - **Events:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. Copie o **Webhook Secret** e adicione ao Railway:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 3.2 Testar Webhook

```bash
# Via Stripe CLI
stripe trigger checkout.session.completed
```

---

## 4. Configurar Sentry

### 4.1 Backend

```bash
# Já configurado em settings.py
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 4.2 Frontend

```bash
# Já configurado em sentry.client.config.js e sentry.server.config.js
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## 5. CI/CD (GitHub Actions)

### 5.1 Workflows Configurados

Os workflows já estão em `.github/workflows/`:

**backend-ci.yml:**
- Lint (Black, Flake8)
- Security scan (Bandit, Safety)
- Testes com PostgreSQL
- Deploy automático

**frontend-ci.yml:**
- Lint (ESLint)
- Type check (TypeScript)
- Testes (Jest)
- Build check

### 5.2 Secrets do GitHub

Configure em Settings → Secrets:

```
RAILWAY_TOKEN=<railway token>
VERCEL_TOKEN=<vercel token>
VERCEL_ORG_ID=<org id>
VERCEL_PROJECT_ID=<project id>
```

---

## 6. Monitoramento em Produção

### 6.1 Health Checks

```bash
# Backend
curl https://ouvify-production.up.railway.app/health/
curl https://ouvify-production.up.railway.app/ready/

# Frontend
curl https://ouvify.vercel.app/api/health  # Se implementado
```

### 6.2 Logs

**Railway:**
- Dashboard → Service → Logs (tempo real)
- Download de logs históricos disponível

**Vercel:**
- Dashboard → Functions → Logs
- Runtime Logs para edge functions

### 6.3 Métricas

**Railway:**
- CPU, Memory, Network no dashboard
- Configurar alertas de uso

**Vercel:**
- Analytics de Web Vitals
- Edge Function metrics

---

## 7. Rollback

### 7.1 Railway

```bash
# Via CLI
railway rollback

# Ou no dashboard:
# 1. Vá para Deployments
# 2. Selecione deployment anterior
# 3. Clique em "Rollback"
```

### 7.2 Vercel

```bash
# Via CLI
vercel rollback

# Ou no dashboard:
# 1. Vá para Deployments
# 2. Clique nos "..." do deployment anterior
# 3. Selecione "Promote to Production"
```

---

## 8. Scaling

### 8.1 Railway Auto-scaling

```bash
# Configurar no railway.toml ou dashboard:
[deploy]
numReplicas = 2  # Mínimo de réplicas
```

### 8.2 Vercel Edge

O Vercel escala automaticamente com Edge Functions.

---

## 9. Backup e Recovery

### 9.1 Database Backup (Railway)

- Backups automáticos diários
- Point-in-time recovery disponível
- Para restaurar: Dashboard → PostgreSQL → Backups

### 9.2 Backup Manual

```bash
# Exportar
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Importar
psql $DATABASE_URL < backup_20260131_120000.sql
```

---

## 10. Checklist de Deploy

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrações testadas localmente
- [ ] Testes passando
- [ ] Build local funcionando
- [ ] Secrets do GitHub configurados

### Durante o Deploy

- [ ] Monitorar logs de build
- [ ] Verificar health checks
- [ ] Testar endpoints críticos

### Após o Deploy

- [ ] Verificar Sentry (sem erros novos)
- [ ] Testar fluxo de login
- [ ] Testar criação de feedback
- [ ] Testar checkout (se aplicável)
- [ ] Monitorar métricas por 1 hora

---

## 11. Troubleshooting

### Build Falhou

```bash
# Verificar logs de build
railway logs --build

# Limpar cache
railway up --force
```

### 502 Bad Gateway

```bash
# Verificar se app está rodando
curl https://ouvify-production.up.railway.app/health/

# Verificar logs
railway logs
```

### Database Connection Error

```bash
# Verificar se DATABASE_PRIVATE_URL está configurado
# Railway fornece automaticamente

# Testar conexão
railway run python manage.py dbshell
```

### Migration Error

```bash
# Rodar migrações manualmente
railway run python manage.py migrate

# Se tiver conflito
railway run python manage.py migrate --fake <app> <migration>
```

---

*Última atualização: 31/01/2026*
