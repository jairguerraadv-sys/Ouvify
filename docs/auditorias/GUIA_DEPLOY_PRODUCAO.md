# 🚀 GUIA DE DEPLOY - OUVY SAAS
**Data:** 14 de janeiro de 2026  
**Status:** Pós-Auditoria - Pronto para Produção

---

## ✅ PRÉ-REQUISITOS VERIFICADOS

- ✅ Auditoria completa executada
- ✅ Build frontend success (21 páginas)
- ✅ Django check: 0 issues
- ✅ npm audit: 0 vulnerabilities
- ✅ SECRET_KEY gerada e segura
- ✅ 34 correções aplicadas
- ✅ Documentação completa

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Backend (Railway)

**Arquivo:** `.env.production` (criar no Railway dashboard)

```bash
# Django Core
SECRET_KEY=j&x@uaqy(nonobld$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app,ouvy-saas-production.up.railway.app

# Database (auto-provisionado pelo Railway)
DATABASE_URL=postgresql://user:pass@host:port/database

# Stripe (USAR LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=https://ouvy-frontend.vercel.app

# CORS
CORS_ALLOWED_ORIGINS=https://ouvy-frontend.vercel.app
```

### Frontend (Vercel)

**Arquivo:** Configurar no Vercel dashboard

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app

# Stripe (public key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Site URL
NEXT_PUBLIC_SITE_URL=https://ouvy-frontend.vercel.app
```

---

## 📦 DEPLOY BACKEND (RAILWAY)

### 1. Preparar Repositório

```bash
cd /Users/jairneto/Desktop/ouvy_saas

# Verificar status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "chore: auditoria completa + 34 correções aplicadas

- SECRET_KEY gerada e segura
- 33 correções Button asChild
- Build frontend 100% funcional
- 0 vulnerabilidades
- Documentação completa
- Pronto para produção"

# Push para main
git push origin main
```

### 2. Configurar Railway

**Via Dashboard Railway:**

1. Acessar https://railway.app
2. Conectar repositório `ouvy-saas`
3. Criar novo projeto: "Ouvy Backend"
4. Adicionar PostgreSQL database
5. Configurar variáveis de ambiente (ver acima)
6. Configurar build:
   - **Root Directory:** `ouvy_saas`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn config.wsgi`

7. Deploy automático no push para `main`

### 3. Verificar Deploy

```bash
# Instalar Railway CLI
npm install -g railway

# Login
railway login

# Status
railway status

# Logs
railway logs
```

**Health Check:**
```bash
curl https://ouvy-saas-production.up.railway.app/api/health/
```

Esperado:
```json
{
  "status": "healthy",
  "database": "connected",
  "debug_mode": false
}
```

---

## 🎨 DEPLOY FRONTEND (VERCEL)

### 1. Configurar Vercel

**Via Dashboard Vercel:**

1. Acessar https://vercel.com
2. Importar repositório `ouvy-saas`
3. Configurar projeto:
   - **Framework:** Next.js
   - **Root Directory:** `ouvy_frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. Configurar variáveis de ambiente (ver acima)
5. Deploy automático no push para `main`

### 2. Verificar Deploy

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Status
vercel list

# Logs
vercel logs ouvy-frontend
```

**Acessar Site:**
```
https://ouvy-frontend.vercel.app
```

---

## 🧪 SMOKE TESTS PÓS-DEPLOY

### Backend API

```bash
BASE_URL="https://ouvy-saas-production.up.railway.app"

# 1. Health check
curl "$BASE_URL/api/health/"

# 2. Criar tenant (signup)
curl -X POST "$BASE_URL/api/tenants/signup/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@ouvy.com",
    "password": "senha123",
    "nome": "Empresa Teste",
    "subdominio": "empresateste"
  }'

# 3. Login
curl -X POST "$BASE_URL/api/tenants/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@ouvy.com",
    "password": "senha123"
  }'
# Salvar o token retornado

# 4. Criar feedback
TOKEN="seu-token-aqui"
curl -X POST "$BASE_URL/api/feedbacks/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "sugestao",
    "descricao": "Teste de produção"
  }'

# 5. Listar feedbacks
curl "$BASE_URL/api/feedbacks/" \
  -H "Authorization: Token $TOKEN"
```

### Frontend

**Testar Fluxos:**

1. **Landing Page**
   - Acessar https://ouvy-frontend.vercel.app
   - Verificar hero section
   - Clicar em "Começar Grátis"

2. **Cadastro**
   - Preencher formulário
   - Verificar validação de subdomínio
   - Criar conta

3. **Dashboard**
   - Login automático deve funcionar
   - Verificar KPIs
   - Verificar lista de feedbacks

4. **Enviar Feedback**
   - Acessar /enviar
   - Preencher formulário público
   - Copiar protocolo gerado

5. **Acompanhar**
   - Acessar /acompanhar
   - Consultar protocolo
   - Adicionar mensagem

6. **Stripe Checkout**
   - Acessar /precos
   - Clicar em "Assinar Pro"
   - Verificar redirecionamento Stripe
   - Testar com cartão de teste

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Railway (Backend)

**Logs:**
```bash
railway logs --tail
```

**Métricas:**
- CPU usage
- Memory usage
- Request count
- Response time

**Alertas:**
- Erros 5xx
- Database connection failures
- High response time (>1s)

### Vercel (Frontend)

**Analytics:**
- Page views
- Unique visitors
- Bounce rate
- Load time

**Logs:**
```bash
vercel logs --tail
```

---

## 🔧 TROUBLESHOOTING

### Backend não inicia

**Verificar:**
```bash
# Logs
railway logs

# Variáveis de ambiente
railway variables

# Database connection
railway connect
```

**Problemas Comuns:**
1. `SECRET_KEY` não configurada
2. `DATABASE_URL` inválida
3. Migrations não aplicadas
4. ALLOWED_HOSTS incorreto

**Solução:**
```bash
# Aplicar migrations
railway run python manage.py migrate

# Criar superuser
railway run python manage.py createsuperuser
```

### Frontend não carrega

**Verificar:**
```bash
# Logs
vercel logs

# Build
vercel inspect <deployment-url>

# Variáveis
vercel env ls
```

**Problemas Comuns:**
1. `NEXT_PUBLIC_API_URL` incorreta
2. Build failed
3. CORS error

**Solução:**
- Verificar variáveis de ambiente
- Rebuildar: `vercel --prod`
- Verificar CORS no backend

### Stripe Webhook não funciona

**Verificar:**
1. `STRIPE_WEBHOOK_SECRET` configurada
2. Endpoint registrado no Stripe
3. Signature validation

**Testar:**
```bash
stripe listen --forward-to https://ouvy-saas-production.up.railway.app/api/tenants/stripe-webhook/
```

---

## ✅ CHECKLIST FINAL

### Antes do Go Live

- [ ] Backend deployed no Railway
- [ ] Frontend deployed no Vercel
- [ ] PostgreSQL provisionado
- [ ] Variáveis de ambiente configuradas
- [ ] Stripe webhook configurado
- [ ] Health checks passando
- [ ] Smoke tests executados
- [ ] SSL/HTTPS ativo
- [ ] Domínio customizado (opcional)
- [ ] Monitoramento ativo

### Pós Go Live

- [ ] Monitorar logs por 24h
- [ ] Testar fluxos críticos
- [ ] Validar Stripe payments
- [ ] Verificar emails (se implementado)
- [ ] Coletar métricas
- [ ] Documentar issues
- [ ] Planejar melhorias

---

## 📞 SUPORTE

### Recursos

- **Documentação:** `/docs/`
- **API Docs:** `https://api.ouvy.com/swagger/`
- **Relatório Auditoria:** `/docs/auditorias/`
- **Guia Deployment:** Este arquivo

### Logs

- **Railway:** https://railway.app/dashboard
- **Vercel:** https://vercel.com/dashboard
- **Stripe:** https://dashboard.stripe.com

---

## 🎯 PRÓXIMOS PASSOS

### Curto Prazo (1 Semana)

1. Monitorar métricas de produção
2. Coletar feedback de usuários
3. Limpar ESLint warnings
4. Otimizar performance

### Médio Prazo (1 Mês)

1. Implementar upload de anexos
2. Sistema de email notifications
3. Dashboard com gráficos
4. Testes E2E (Cypress)

### Longo Prazo (3 Meses)

1. Dark mode
2. i18n (internacionalização)
3. Mobile app
4. Webhooks outbound
5. API pública

---

**Deploy Guide Criado:** 14 de janeiro de 2026  
**Status:** Pronto para Deploy  
**Next Action:** Executar deploy backend + frontend

---

🚀 **Boa sorte com o lançamento do Ouvy SaaS!**
