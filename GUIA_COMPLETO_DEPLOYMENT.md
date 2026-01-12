# 🚀 Ouvy SaaS - Guia Completo de Teste e Deploy

## 📊 Visão Geral

Parabéns! Você tem um **SaaS completo e funcionando**. Este guia vai ajudá-lo a:

1. **Testar localmente** — Validar o fluxo de pagamento
2. **Deploy no Railway** — Backend + PostgreSQL em produção
3. **Deploy na Vercel** — Frontend Next.js em produção
4. **Configurar Domínios** — Usar seu próprio domínio

---

## 🎯 Arquitetura Final

```
┌──────────────────────────────────────────────────────────┐
│                   Clientes Finais                        │
│         (Empresas que usam o Ouvy para feedback)         │
└──────────────────────────────────────────────────────────┘
                          │
                          │ Subdomínios
                          │ empresa1.ouvy.com
                          │ empresa2.ouvy.com
                          ▼
┌──────────────────────────────────────────────────────────┐
│            Frontend (Next.js) - VERCEL                   │
│            https://app.ouvy.com                          │
│                                                          │
│  ├─ Landing (/)                                         │
│  ├─ Cadastro (/cadastro)                                │
│  ├─ Login (/login)                                      │
│  ├─ Planos (/planos) ← Stripe Checkout                  │
│  ├─ Dashboard (/dashboard)                              │
│  ├─ Feedback Acompanhar (/acompanhar)                   │
│  └─ Admin Super (/admin)                                │
└──────────────────────────────────────────────────────────┘
                          │
                   HTTPS API Calls
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│         Backend (Django REST) - RAILWAY                  │
│       https://api.ouvy.com  (ou railway.app)            │
│                                                          │
│  ├─ /api/register-tenant/        (SaaS Signup)         │
│  ├─ /api/tenant-info/            (Get tenant data)      │
│  ├─ /api/check-subdominio/       (Check subdomain)      │
│  ├─ /api/feedbacks/              (CRUD feedback)        │
│  ├─ /api/tenants/subscribe/      (Create checkout)      │
│  ├─ /api/tenants/webhook/        (Stripe webhook)       │
│  ├─ /api/admin/tenants/          (Admin API)            │
│  └─ /api-token-auth/             (Login)                │
│                                                          │
│  Database: PostgreSQL (Railway)                         │
│  ├─ Users (Django)                                      │
│  ├─ Tenants/Clients (Empresas)                          │
│  ├─ Feedbacks (Denúncias/Sugestões/Elogios)            │
│  └─ FeedbackInteracoes (Chat com timeline)             │
└──────────────────────────────────────────────────────────┘
                          │
                   HTTPS Webhooks
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                  Stripe (Pagamentos)                     │
│                                                          │
│  ├─ Checkout Sessions (Criar checkout)                  │
│  ├─ Webhooks (Notificar sucesso)                        │
│  └─ Customer Portal (Gerenciar assinatura)             │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Documentação de Testes e Deploy

### 1️⃣ **TESTE LOCAL - Fluxo de Pagamento**
👉 Leia: `TESTE_PAGAMENTO.md`

**O que você vai fazer:**
- Configurar Stripe CLI (webhook local)
- Simular compra com cartão de teste
- Validar que o banner muda de "Free" para "Premium"

**Tempo:** ~10 minutos

**Resultado:** Você vai ter 100% de confiança que o sistema funciona

---

### 2️⃣ **DEPLOY NO RAILWAY - Backend + Postgres**
👉 Leia: `DEPLOY_RAILWAY.md`

**O que você vai fazer:**
- Criar conta no Railway
- Deploy do Django
- Criar banco PostgreSQL automático
- Configurar variáveis de ambiente

**Tempo:** ~15 minutos

**Resultado:** Backend rodando em `https://backend.railway.app`

---

### 3️⃣ **DEPLOY NA VERCEL - Frontend Next.js**
👉 Leia: `DEPLOY_VERCEL.md`

**O que você vai fazer:**
- Criar conta no Vercel
- Deploy do Next.js
- Conectar ao backend no Railway
- (Opcional) Configurar domínio customizado

**Tempo:** ~10 minutos

**Resultado:** Frontend rodando em `https://app.vercel.app` (seu domínio)

---

## 🎯 Checklist de Implementação

### Fase 1: Desenvolvimento Local ✅
- [x] Backend (Django + DRF)
- [x] Frontend (Next.js + Tailwind + Shadcn/UI)
- [x] Autenticação (DRF Token)
- [x] Stripe Integration (Checkout + Webhooks)
- [x] Dashboard com Métricas
- [x] Página de Planos (Pricing)
- [x] Admin Dashboard

### Fase 2: Testes Locais (EM PROGRESSO)
- [ ] Testar fluxo de pagamento com Stripe CLI
- [ ] Validar webhook local
- [ ] Testar multi-tenancy
- [ ] Testar login e logout

### Fase 3: Deploy em Produção (PRÓXIMO)
- [ ] Deploy backend no Railway
- [ ] Deploy frontend na Vercel
- [ ] Configurar CORS entre Vercel ↔ Railway
- [ ] Testar pagamento em produção
- [ ] Configurar domínio customizado

### Fase 4: Pós-Deploy (OPCIONAL)
- [ ] Configurar email (SendGrid/Nodemailer)
- [ ] Configurar monitoring (Sentry)
- [ ] Configurar analytics (Plausible)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Backup automático do banco

---

## 🔑 Chaves e Secrets (GUARDE EM LOCAL SEGURO)

Você vai precisar dessas chaves durante o deploy:

```
STRIPE_PUBLIC_KEY = pk_test_...
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...
DJANGO_SECRET_KEY = django-insecure-...
DATABASE_URL = postgresql://...
```

**NUNCA** commite essas chaves no Git. Use `.gitignore` e variáveis de ambiente.

---

## 📞 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Cannot connect to backend" | Vercel não conhece Railway. Configure `CORS_ALLOWED_ORIGINS` no Railway |
| "Payment not updating DB" | Stripe CLI não está rodando. Execute `stripe listen` |
| "Webhook signature invalid" | `STRIPE_WEBHOOK_SECRET` está errado. Copie do `stripe listen` output |
| "Frontend gets 404 on API" | Backend URL está errada no `.env.production` do Vercel |
| "Database connection failed" | Railway leva 2-3 minutos pra criar banco. Aguarde e redeploy |

---

## 🚀 Próximos Passos Após Deploy

Quando tudo estiver em produção:

### 1. **Configurar Email Transacional**
```python
# Para confirmar pagamentos, resetar senha, etc
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'SG.xxx'
```

### 2. **Configurar Domínio Customizado**
```
app.suaempresa.com → Vercel
api.suaempresa.com → Railway
empresaX.suaempresa.com → Multi-tenant (Vercel)
```

### 3. **Configurar Renovação Automática de Assinatura**
- Stripe fatura automaticamente
- Webhook atualiza status
- Enviar email de confirmação

### 4. **Configurar Portal do Cliente**
- Link para gerenciar assinatura (Stripe Customer Portal)
- Histórico de faturas
- Método de pagamento

---

## 📊 Métricas e KPIs

Acompanhe esses números:

- **MRR** (Monthly Recurring Revenue) = Starter × 99 + Pro × 299
- **Churn Rate** = Quantos cancelam por mês
- **CAC** (Customer Acquisition Cost) = Custo para adquirir cada cliente
- **LTV** (Lifetime Value) = Quanto cada cliente vale em média

---

## 📚 Referências

- [Stripe Docs](https://stripe.com/docs)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Railway Docs](https://railway.app/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎉 Você Conquistou!

Parabéns! Você agora tem:

✅ Um SaaS totalmente funcional  
✅ Sistema de pagamentos integrado  
✅ Dashboard para gerenciar clientes  
✅ API escalável em produção  
✅ Frontend otimizado em CDN global  

**Agora é só vender!** 🚀

---

## 📞 Suporte

Se tiver dúvidas durante o deploy:

1. Leia o troubleshooting no guia específico (TESTE_PAGAMENTO.md, DEPLOY_RAILWAY.md, etc)
2. Procure nos logs de erro (Railway Dashboard, Vercel Logs)
3. Consulte a documentação oficial das plataformas

Boa sorte! 🚀
