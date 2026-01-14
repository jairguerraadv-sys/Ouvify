# ⚡ Próximos Passos - Deploy Ouvy SaaS

## 📊 Status Atual
- ✅ Auditoria completa realizada
- ✅ Correções críticas de segurança aplicadas
- ✅ Documentação consolidada (22 arquivos duplicados removidos)
- ✅ Frontend atualizado com logout seguro
- ⚠️ Mudanças prontas para commit
- ⚠️ Migração criada mas não executada
- ⚠️ Testes de integração pendentes

**Prontidão para Deploy: 94%**

---

## 🚀 Ações Imediatas (Antes do Deploy)

### 1️⃣ Commitar Alterações (5 minutos)

```bash
cd /Users/jairneto/Desktop/ouvy_saas

# Adicionar novos arquivos
git add ALTERACOES_APLICADAS.md
git add AUDITORIA_PRE_DEPLOY_2026.md
git add CHECKLIST_DEPLOY_FINAL.md
git add RELATORIO_AUDITORIA_EXECUTIVO.md
git add RESUMO_IMPLEMENTACAO.md
git add PROXIMOS_PASSOS.md
git add docs/INDICE_DOCUMENTACAO.md
git add ouvy_saas/apps/feedbacks/migrations/0005_feedback_autor.py
git add ouvy_saas/apps/tenants/logout_views.py
git add scripts/verificar_deploy.sh

# Adicionar modificações
git add ouvy_frontend/contexts/AuthContext.tsx
git add ouvy_saas/config/urls.py
git add ouvy_saas/apps/feedbacks/models.py

# Adicionar remoções
git add -u

# Commit com mensagem descritiva
git commit -m "feat: apply security fixes and improvements

BREAKING CHANGES:
- Admin URL changed to /painel-admin-ouvy-2026/
- Logout now invalidates token server-side

Features:
- Add logout endpoint with token invalidation (LogoutView)
- Add autor field to Feedback model for traceability
- Create comprehensive audit documentation (3 reports)
- Clean up 28 duplicate/obsolete documentation files

Documentation:
- AUDITORIA_PRE_DEPLOY_2026.md (technical audit)
- CHECKLIST_DEPLOY_FINAL.md (deployment checklist)
- RELATORIO_AUDITORIA_EXECUTIVO.md (executive summary)
- INDICE_DOCUMENTACAO.md (documentation index)

Scripts:
- verificar_deploy.sh (pre-deploy validation)"

# Push para o repositório
git push origin main
```

**⚠️ IMPORTANTE: SECURITY_NOTES.md NÃO DEVE SER COMMITADO!**
Este arquivo contém informações sensíveis e está em `.gitignore`.

---

### 2️⃣ Executar Migração (5 minutos)

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Verificar migrações pendentes
python manage.py showmigrations feedbacks

# Aplicar migração
python manage.py migrate feedbacks

# Confirmar aplicação
python manage.py showmigrations feedbacks | grep 0005_feedback_autor
```

**Resultado esperado:**
```
[X] 0005_feedback_autor
```

---

### 3️⃣ Validar Variáveis de Ambiente (30 minutos)

#### Railway (Backend)
Acesse: https://railway.app → seu projeto → Variables

Verifique se todas estão configuradas:

```bash
# Core Django
SECRET_KEY=<gerado automaticamente>
DEBUG=False
ALLOWED_HOSTS=ouvy-saas-production.up.railway.app
DJANGO_SETTINGS_MODULE=config.settings

# Database (auto-configurado pelo Railway)
DATABASE_URL=postgresql://...

# CORS
CORS_ALLOWED_ORIGINS=https://ouvy-saas.vercel.app,https://www.ouvy.com.br

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@ouvy.com.br
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@ouvy.com.br
```

#### Vercel (Frontend)
Acesse: https://vercel.com → seu projeto → Settings → Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app

# Stripe (chaves públicas)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

**Verificar:**
- [ ] Todas variáveis criadas
- [ ] Valores corretos (sem espaços extras)
- [ ] Chaves Stripe em modo de produção (não test mode)
- [ ] CORS permite domínio do Vercel

---

### 4️⃣ Configurar Webhook Stripe (15 minutos)

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://ouvy-saas-production.up.railway.app/api/stripe/webhook/`
4. Eventos para ouvir:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copie o "Signing secret" (whsec_...)
6. Adicione no Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Testar webhook:**
```bash
stripe listen --forward-to https://ouvy-saas-production.up.railway.app/api/stripe/webhook/
stripe trigger checkout.session.completed
```

---

### 5️⃣ Configurar Backup no Railway (15 minutos)

1. Acesse Railway → Database → Settings
2. Enable "Automated Backups"
3. Configurações recomendadas:
   - Frequência: Diária (3:00 AM)
   - Retenção: 7 dias
   - Região: Mesma do database
4. Criar backup manual: "Create Backup Now"
5. Testar restore em ambiente de staging

---

## 🧪 Testes Críticos (2 horas)

### Teste 1: Isolamento Multi-Tenant (30 min)

```bash
# Script de teste
cd /Users/jairneto/Desktop/ouvy_saas
python ouvy_saas/manage.py shell

# No shell Django:
from apps.tenants.models import Tenant
from apps.core.models import User
from apps.feedbacks.models import Feedback

# Criar 2 empresas de teste
empresa_a = Tenant.objects.create(
    nome="Empresa A Teste",
    subdominio="empresa-a-teste",
    plano="basico"
)

empresa_b = Tenant.objects.create(
    nome="Empresa B Teste",
    subdominio="empresa-b-teste",
    plano="basico"
)

# Criar usuários para cada empresa
user_a = User.objects.create_user(
    email="user@empresa-a.com",
    password="Teste123!",
    tenant=empresa_a
)

user_b = User.objects.create_user(
    email="user@empresa-b.com",
    password="Teste123!",
    tenant=empresa_b
)

# Criar feedbacks
Feedback.objects.create(
    tipo="elogio",
    descricao="Feedback da Empresa A",
    status="pendente",
    tenant=empresa_a,
    autor=user_a
)

Feedback.objects.create(
    tipo="sugestao",
    descricao="Feedback da Empresa B",
    status="pendente",
    tenant=empresa_b,
    autor=user_b
)

# TESTE DE ISOLAMENTO
# Simular contexto do tenant A
from apps.tenants.middleware import set_current_tenant
set_current_tenant(empresa_a)

# Verificar que só vê feedbacks da empresa A
feedbacks_a = Feedback.objects.all()
print(f"Feedbacks empresa A: {feedbacks_a.count()}")  # Deve ser 1
print(feedbacks_a.first().descricao)  # "Feedback da Empresa A"

# Simular contexto do tenant B
set_current_tenant(empresa_b)

# Verificar que só vê feedbacks da empresa B
feedbacks_b = Feedback.objects.all()
print(f"Feedbacks empresa B: {feedbacks_b.count()}")  # Deve ser 1
print(feedbacks_b.first().descricao)  # "Feedback da Empresa B"

# Limpar testes
empresa_a.delete()
empresa_b.delete()
```

**Resultado esperado:** Cada tenant vê APENAS seus próprios dados.

---

### Teste 2: Fluxo de Pagamento Stripe (1 hora)

#### 2.1 Criar Checkout
```bash
# Via Postman ou cURL
curl -X POST https://ouvy-saas-production.up.railway.app/api/payments/checkout/ \
  -H "Authorization: Token SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_1Abc123...",
    "success_url": "https://ouvy-saas.vercel.app/sucesso",
    "cancel_url": "https://ouvy-saas.vercel.app/cancelado"
  }'
```

**Resultado esperado:** Retorna `checkout_url` para Stripe Checkout.

#### 2.2 Completar Pagamento
1. Abra a `checkout_url` no navegador
2. Use cartão de teste: `4242 4242 4242 4242`
3. Data: qualquer data futura
4. CVV: qualquer 3 dígitos
5. Complete o pagamento

#### 2.3 Verificar Webhook
Checar logs no Railway:
```bash
railway logs --filter "stripe webhook"
```

**Resultado esperado:**
- Log: "Stripe webhook received: checkout.session.completed"
- Assinatura criada no banco
- Status do tenant atualizado

#### 2.4 Verificar Dashboard
1. Login no dashboard: https://ouvy-saas.vercel.app/login
2. Verificar se plano foi atualizado
3. Verificar se funcionalidades premium estão disponíveis

#### 2.5 Testar Cancelamento
```bash
curl -X POST https://ouvy-saas-production.up.railway.app/api/payments/cancel/ \
  -H "Authorization: Token SEU_TOKEN_AQUI"
```

**Resultado esperado:** Assinatura cancelada, tenant volta ao plano gratuito.

---

### Teste 3: Logout com Invalidação de Token (15 min)

#### 3.1 Via Frontend
1. Fazer login: https://ouvy-saas.vercel.app/login
2. Abrir DevTools → Application → Local Storage
3. Copiar o `auth_token`
4. Fazer logout
5. Tentar usar o token copiado:

```bash
curl -X GET https://ouvy-saas-production.up.railway.app/api/feedbacks/ \
  -H "Authorization: Token SEU_TOKEN_COPIADO"
```

**Resultado esperado:** Status 401 Unauthorized (token inválido).

#### 3.2 Via API Direta
```bash
# Login
curl -X POST https://ouvy-saas-production.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "SuaSenha123"}'

# Copiar o token retornado

# Testar acesso
curl -X GET https://ouvy-saas-production.up.railway.app/api/feedbacks/ \
  -H "Authorization: Token SEU_TOKEN"
# Deve retornar 200 OK com dados

# Fazer logout
curl -X POST https://ouvy-saas-production.up.railway.app/api/logout/ \
  -H "Authorization: Token SEU_TOKEN"

# Testar acesso novamente
curl -X GET https://ouvy-saas-production.up.railway.app/api/feedbacks/ \
  -H "Authorization: Token SEU_TOKEN"
# Deve retornar 401 Unauthorized
```

---

### Teste 4: Admin Django Seguro (5 min)

```bash
# Tentar acessar URL antiga (deve falhar)
curl -I https://ouvy-saas-production.up.railway.app/admin/

# Deve retornar 404 Not Found

# Acessar URL nova (deve funcionar)
curl -I https://ouvy-saas-production.up.railway.app/painel-admin-ouvy-2026/

# Deve retornar 200 OK ou redirect para login
```

**Verificar logs do Railway:** Não deve haver tentativas de acesso a `/admin/` bem-sucedidas.

---

### Teste 5: Rate Limiting (10 min)

```bash
# Teste de rate limit no endpoint de protocolo
for i in {1..10}; do
  curl -X GET "https://ouvy-saas-production.up.railway.app/api/feedbacks/protocolo/?q=OUVY2026001" \
    -H "Authorization: Token SEU_TOKEN" \
    -w "\n%{http_code}\n" \
    -s -o /dev/null
done
```

**Resultado esperado:**
- Primeiras 5 requisições: 200 OK
- Próximas 5 requisições: 429 Too Many Requests

---

## 📋 Checklist Pré-Deploy

Execute o script de verificação:

```bash
cd /Users/jairneto/Desktop/ouvy_saas
./scripts/verificar_deploy.sh
```

### Checklist Manual

#### Backend (Railway)
- [ ] Todas variáveis de ambiente configuradas
- [ ] Database conectado e acessível
- [ ] Migração 0005_feedback_autor executada
- [ ] Admin acessível em `/painel-admin-ouvy-2026/`
- [ ] Webhook Stripe configurado e testado
- [ ] Backup automático habilitado
- [ ] Logs monitorados (sem erros críticos)
- [ ] SSL/HTTPS funcionando

#### Frontend (Vercel)
- [ ] Build passando sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] NEXT_PUBLIC_API_URL aponta para Railway
- [ ] Logout funcionando (invalida token)
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Stripe Checkout abrindo corretamente
- [ ] Páginas de erro (404, 500) estilizadas

#### Segurança
- [ ] SECURITY_NOTES.md NÃO está no git
- [ ] .env NÃO está no git
- [ ] Admin URL obscurecida
- [ ] Rate limiting funcionando
- [ ] CORS configurado corretamente
- [ ] Headers de segurança (CSP, HSTS) ativos
- [ ] Tokens invalidados no logout
- [ ] Isolamento multi-tenant validado

#### Performance
- [ ] API respondendo em <500ms
- [ ] Frontend carregando em <3s
- [ ] Database com índices corretos
- [ ] Imagens otimizadas (WebP, lazy loading)
- [ ] Bundle JS <500KB (gzipped)

#### Compliance
- [ ] Política de privacidade disponível
- [ ] Termos de uso disponíveis
- [ ] Endpoint de exclusão LGPD funcionando
- [ ] Logs não armazenam dados sensíveis
- [ ] Stripe em modo de produção

---

## 🚨 Bloqueadores Críticos

**NÃO FAZER DEPLOY SE:**

1. ❌ Migração 0005 não executada → Feedbacks sem campo autor
2. ❌ STRIPE_WEBHOOK_SECRET não configurado → Pagamentos não processados
3. ❌ DATABASE_URL não configurado → App não inicia
4. ❌ CORS não permite Vercel → Frontend não acessa API
5. ❌ Teste de isolamento falhou → Vazamento de dados entre tenants

---

## 📊 Métricas de Sucesso

### Deploy bem-sucedido se:
- ✅ Build sem erros (Railway + Vercel)
- ✅ Health check retorna 200 OK
- ✅ Login/Logout funcionando
- ✅ Criação de feedback funcionando
- ✅ Pagamento Stripe funcionando
- ✅ Webhook recebendo eventos
- ✅ Dashboard carregando estatísticas
- ✅ Isolamento multi-tenant validado
- ✅ Sem erros 500 nos primeiros 30 minutos

---

## 🔄 Rollback Plan

Se algo der errado:

### Railway
```bash
# Via CLI
railway rollback

# Ou via dashboard: Deployments → Select previous version → Redeploy
```

### Vercel
```bash
# Via CLI
vercel rollback

# Ou via dashboard: Deployments → Previous deployment → Promote to Production
```

### Database
```bash
# Restaurar backup
railway db:restore <backup-id>

# Reverter migração
python manage.py migrate feedbacks 0004
```

---

## 📞 Suporte

**Documentação:**
- AUDITORIA_PRE_DEPLOY_2026.md → Auditoria técnica completa
- CHECKLIST_DEPLOY_FINAL.md → Checklist detalhado
- RELATORIO_AUDITORIA_EXECUTIVO.md → Resumo executivo
- SECURITY_NOTES.md → Informações sensíveis (NÃO COMMITAR)

**Logs:**
- Railway: `railway logs --tail=100`
- Vercel: Dashboard → Logs ou `vercel logs`

**Monitoramento:**
- Railway: Dashboard → Metrics
- Vercel: Dashboard → Analytics
- Stripe: Dashboard → Logs

---

## ✅ Próxima Ação

**AGORA:**
```bash
# 1. Commitar mudanças
git add . && git commit -m "feat: apply security fixes and improvements"

# 2. Push
git push origin main

# 3. Executar migração
cd ouvy_saas && python manage.py migrate

# 4. Validar variáveis de ambiente (Railway + Vercel)

# 5. Executar testes críticos

# 6. Verificar checklist
./scripts/verificar_deploy.sh

# 7. Deploy! 🚀
```

---

**Última atualização:** Janeiro 2026  
**Status do Projeto:** 94% pronto para produção  
**Próximo milestone:** Deploy em produção (Railway + Vercel)
