# RELATÓRIO DE CONFIGURAÇÕES - RAILWAY E VERCEL

**Data:** 14/01/2026  
**Verificação:** Via CLI  

---

## 🚂 RAILWAY (Backend Django)

**Projeto:** imaginative-learning  
**Ambiente:** production  
**Serviço:** ouvy-saas  
**URL:** https://ouvy-saas-production.up.railway.app  

### Variáveis Configuradas ✅

#### Banco de Dados:
- `DATABASE_URL`: ✅ PostgreSQL configurado
- `DB_ENGINE`: django.db.backends.postgresql
- `DB_HOST`: localhost
- `DB_NAME`: ouvy_db
- `DB_USER`: postgres
- `DB_PORT`: 5432

#### Django Settings:
- `SECRET_KEY`: ✅ Configurado
- `DEBUG`: False (produção)
- `ALLOWED_HOSTS`: ouvy-saas-production.up.railway.app,.railway.app
- `LANGUAGE_CODE`: pt-br
- `TIME_ZONE`: America/Sao_Paulo

#### CORS:
- `CORS_ALLOWED_ORIGINS`: ✅ Vercel domains configurados
- `CORS_ALLOW_CREDENTIALS`: True

### ✅ Variáveis Stripe Configuradas (Placeholders):

**Variáveis adicionadas:**
```bash
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER_TROCAR_POR_CHAVE_REAL
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER_TROCAR_POR_WEBHOOK_SECRET
STRIPE_PRICE_STARTER_MONTHLY=price_PLACEHOLDER_STARTER
STRIPE_PRICE_PRO_MONTHLY=price_PLACEHOLDER_PRO
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_PLACEHOLDER_ENTERPRISE
```

**Status:** 🟡 Variáveis criadas, mas com valores placeholder  
**Ação necessária:** Substituir por chaves reais do Stripe Dashboard  
**Guia completo:** Ver arquivo `CONFIGURAR_STRIPE.md`

---

## ▲ VERCEL (Frontend Next.js)

**Projeto:** ouvy-frontend  
**Owner:** jairguerraadv-sys-projects  
**Ambiente:** production  
**URL:** https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app  

### Variáveis Configuradas ✅

- `NEXT_PUBLIC_API_URL`: ✅ "https://ouvy-saas-production.up.railway.app"
- `NEXT_PUBLIC_SITE_URL`: ✅ "https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app"
- `VERCEL_ENV`: production
- `TURBO_CACHE`: remote:rw (otimização)

### Status Geral: ✅ CONFIGURADO

**Frontend:** Todas variáveis necessárias presentes  
**Integração:** Backend URL corretamente configurada  

---

## 📋 AÇÕES NECESSÁRIAS

### 1. Configurar Stripe no Railway (URGENTE)

```bash
# 1. Criar produtos no Stripe Dashboard
# - Starter: R$ 97/mês
# - Pro: R$ 247/mês  
# - Enterprise: R$ 497/mês

# 2. Copiar Price IDs e adicionar ao Railway:
cd ouvy_saas
railway variables set STRIPE_SECRET_KEY="sk_live_xxx"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_xxx"
railway variables set STRIPE_PRICE_STARTER_MONTHLY="price_xxx"
railway variables set STRIPE_PRICE_PRO_MONTHLY="price_xxx"
railway variables set STRIPE_PRICE_ENTERPRISE_MONTHLY="price_xxx"

# 3. Reiniciar serviço
railway up
```

### 2. Configurar Webhook no Stripe

**URL do Webhook:**
```
https://ouvy-saas-production.up.railway.app/api/stripe/webhook/
```

**Eventos necessários:**
- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 3. Testar Integração

```bash
# Após configurar:
# 1. Acessar: https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app/precos
# 2. Clicar em "Começar agora"
# 3. Usar cartão teste: 4242 4242 4242 4242
# 4. Verificar webhook recebido
# 5. Verificar assinatura em /dashboard/assinatura
```

---

## 🔍 VERIFICAÇÃO DE SEGURANÇA

### Railway: ✅
- [x] DEBUG=False em produção
- [x] SECRET_KEY único e seguro
- [x] ALLOWED_HOSTS restrito
- [x] CORS configurado corretamente
- [x] Database URL segura (internal)

### Vercel: ✅
- [x] API_URL apontando para Railway
- [x] HTTPS habilitado
- [x] Variáveis criptografadas

---

## 📊 RESUMO

| Plataforma | Status | Ação Necessária |
|------------|--------|-----------------|
| Railway Backend | 🟡 Parcial | Substituir placeholders Stripe por valores reais |
| Vercel Frontend | ✅ OK | Nenhuma |
| Integração | 🟢 OK | Aguarda config Stripe |
| Banco de Dados | ✅ OK | Nenhuma |
| CORS | ✅ OK | Nenhuma |
| Variáveis Stripe | 🟡 Criadas | Preencher com chaves reais |

**Bloqueador atual:** Variáveis Stripe criadas com placeholders - precisa atualizar com valores do Stripe Dashboard

**Tempo estimado:** 15 minutos para criar produtos no Stripe + 5 minutos para atualizar variáveis + 5 minutos para testes

---

## 📝 COMANDOS ÚTEIS

### Railway CLI:
```bash
# Ver todas variáveis
railway variables

# Adicionar variável
railway variables set KEY="value"

# Remover variável
railway variables delete KEY

# Ver logs
railway logs

# Status do serviço
railway status
```

### Vercel CLI:
```bash
# Ver variáveis
vercel env ls

# Adicionar variável
vercel env add KEY production

# Baixar variáveis
vercel env pull .env.local

# Deploy
vercel --prod
```

---

**Última verificação:** 14/01/2026 via CLI  
**Status:** 🟡 Variáveis Stripe criadas com placeholders  
**Próxima ação:** Seguir guia em `CONFIGURAR_STRIPE.md` para preencher com valores reais  
**Guia rápido:** 
1. Criar 3 produtos no Stripe Dashboard
2. Copiar chaves (Secret Key, Webhook Secret, Price IDs)
3. Executar: `railway variables --set "STRIPE_SECRET_KEY=sk_test_xxx"` (etc)
4. Testar checkout com cartão 4242 4242 4242 4242
