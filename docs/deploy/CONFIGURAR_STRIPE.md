# 🔑 GUIA RÁPIDO: CONFIGURAR STRIPE

**Status:** ✅ Variáveis criadas no Railway com placeholders  
**Próximo passo:** Substituir por chaves reais do Stripe  

---

## 1️⃣ CRIAR PRODUTOS NO STRIPE DASHBOARD

### Acesse: https://dashboard.stripe.com/test/products

**Criar 3 produtos com preços mensais:**

### Produto 1: Starter
- Nome: `Plano Starter - Ouvy`
- Preço: `R$ 97,00` por mês
- Tipo: Assinatura recorrente
- Cobrança: Mensal
- **Copiar o Price ID** (formato: `price_xxxxxxxxxxxxx`)

### Produto 2: Pro
- Nome: `Plano Pro - Ouvy`
- Preço: `R$ 247,00` por mês
- Tipo: Assinatura recorrente
- Cobrança: Mensal
- **Copiar o Price ID** (formato: `price_xxxxxxxxxxxxx`)

### Produto 3: Enterprise
- Nome: `Plano Enterprise - Ouvy`
- Preço: `R$ 497,00` por mês
- Tipo: Assinatura recorrente
- Cobrança: Mensal
- **Copiar o Price ID** (formato: `price_xxxxxxxxxxxxx`)

---

## 2️⃣ OBTER CHAVE SECRETA (SECRET KEY)

### Acesse: https://dashboard.stripe.com/test/apikeys

1. Na seção "Standard keys"
2. Encontre "Secret key"
3. Clique em "Reveal test key"
4. **Copiar a chave** (formato: `sk_test_xxxxxxxxxxxxx`)

⚠️ **IMPORTANTE:** 
- Use `sk_test_` para ambiente de TESTE
- Use `sk_live_` para ambiente de PRODUÇÃO (depois de validar tudo)

---

## 3️⃣ CONFIGURAR WEBHOOK

### Acesse: https://dashboard.stripe.com/test/webhooks

1. Clicar em **"Add endpoint"**
2. **Endpoint URL:**
   ```
   https://ouvy-saas-production.up.railway.app/api/stripe/webhook/
   ```
3. **Selecionar eventos:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Clicar em **"Add endpoint"**
5. **Copiar o Webhook Secret** (formato: `whsec_xxxxxxxxxxxxx`)

---

## 4️⃣ ATUALIZAR VARIÁVEIS NO RAILWAY

### Execute os comandos abaixo substituindo pelos valores reais:

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Chave secreta Stripe (copie do dashboard)
railway variables --set "STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx"

# Webhook secret (copie do webhook criado)
railway variables --set "STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx"

# Price IDs dos produtos (copie de cada produto)
railway variables --set "STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxxxxx"
railway variables --set "STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx"
railway variables --set "STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxxxxx"
```

---

## 5️⃣ VERIFICAR VARIÁVEIS ATUALIZADAS

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
railway variables | grep STRIPE
```

**Resultado esperado:**
```
STRIPE_SECRET_KEY               sk_test_51Qhf... (51 caracteres)
STRIPE_WEBHOOK_SECRET           whsec_xxx... (32+ caracteres)
STRIPE_PRICE_STARTER_MONTHLY    price_xxx... 
STRIPE_PRICE_PRO_MONTHLY        price_xxx...
STRIPE_PRICE_ENTERPRISE_MONTHLY price_xxx...
```

---

## 6️⃣ TESTAR INTEGRAÇÃO

### Teste em ambiente local primeiro:

1. **Baixar variáveis localmente:**
   ```bash
   cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
   railway run --environment production
   ```

2. **Ou criar arquivo .env local:**
   ```bash
   # .env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxxxxx
   STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
   STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxxxxx
   ```

3. **Iniciar servidor local:**
   ```bash
   cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
   python manage.py runserver
   ```

4. **Testar webhook localmente com Stripe CLI:**
   ```bash
   # Instalar Stripe CLI (se ainda não tiver)
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Escutar eventos
   stripe listen --forward-to localhost:8000/api/stripe/webhook/
   
   # Em outro terminal, disparar evento de teste
   stripe trigger payment_intent.succeeded
   ```

### Teste em produção (Railway):

1. **Acessar página de preços:**
   ```
   https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app/precos
   ```

2. **Clicar em "Começar agora" em qualquer plano**

3. **Usar cartão de teste:**
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura (ex: `12/28`)
   - CVC: qualquer 3 dígitos (ex: `123`)
   - CEP: qualquer 5 dígitos (ex: `12345`)

4. **Completar checkout**

5. **Verificar webhook recebido:**
   ```bash
   cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
   railway logs
   ```

6. **Verificar assinatura no dashboard:**
   ```
   https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app/dashboard/assinatura
   ```

---

## 7️⃣ CARTÕES DE TESTE DO STRIPE

### Sucesso:
- `4242 4242 4242 4242` - Pagamento bem-sucedido

### Falha:
- `4000 0000 0000 0002` - Cartão recusado

### Requer autenticação (3D Secure):
- `4000 0025 0000 3155` - Autenticação bem-sucedida
- `4000 0000 0000 9995` - Autenticação sempre falha

### Outros cenários:
- `4000 0000 0000 0341` - Pagamento rejeitado por fraude
- `4000 0000 0000 9979` - Cartão roubado

---

## 8️⃣ CHECKLIST DE VALIDAÇÃO

### Antes de ir para produção (sk_live_):

- [ ] Testei checkout com cartão de sucesso
- [ ] Testei checkout com cartão de falha
- [ ] Webhook está recebendo eventos
- [ ] Assinatura aparece no dashboard
- [ ] Consigo cancelar assinatura
- [ ] Consigo reativar assinatura
- [ ] Testei com cartão 3D Secure
- [ ] Verifiquei logs do Railway (sem erros)
- [ ] Verifiquei eventos no Stripe Dashboard

---

## 9️⃣ MIGRAR PARA PRODUÇÃO

### Quando tudo estiver funcionando em TEST:

1. **Ativar conta Stripe:**
   - Completar verificação de negócio
   - Adicionar dados bancários
   - Ativar pagamentos

2. **Obter chaves de PRODUÇÃO:**
   - Acessar: https://dashboard.stripe.com/apikeys
   - Copiar `sk_live_` (Secret key)
   - Criar produtos em modo LIVE
   - Copiar novos Price IDs

3. **Atualizar variáveis Railway:**
   ```bash
   railway variables --set "STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx"
   railway variables --set "STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx"
   railway variables --set "STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxxxxx"
   railway variables --set "STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx"
   railway variables --set "STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxxxxx"
   ```

4. **Atualizar webhook:**
   - Mudar para modo LIVE no Stripe Dashboard
   - Mesma URL, mesmos eventos

---

## 🆘 TROUBLESHOOTING

### Erro: "Invalid API Key"
- ✅ Verificar se copiou a chave completa
- ✅ Verificar se está usando chave de TEST (sk_test_) ou LIVE (sk_live_)
- ✅ Verificar se a chave não tem espaços no início/fim

### Erro: "No such price"
- ✅ Verificar se o Price ID está correto
- ✅ Verificar se o produto está em TEST ou LIVE mode
- ✅ Verificar se o produto está ativo

### Webhook não recebe eventos:
- ✅ Verificar URL do webhook no Stripe Dashboard
- ✅ Verificar se Railway está online (railway status)
- ✅ Verificar logs: railway logs
- ✅ Testar manualmente: stripe trigger payment_intent.succeeded

### Checkout não abre:
- ✅ Verificar console do navegador (F12)
- ✅ Verificar se STRIPE_PRICE_IDs estão configurados
- ✅ Verificar se usuário está autenticado
- ✅ Verificar logs do Railway

---

## 📚 LINKS ÚTEIS

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Documentação Stripe:** https://stripe.com/docs
- **Cartões de teste:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Webhooks:** https://stripe.com/docs/webhooks

---

## ✅ STATUS ATUAL

- [x] Variáveis criadas no Railway
- [ ] Produtos criados no Stripe
- [ ] Chaves reais configuradas
- [ ] Webhook configurado
- [ ] Testes realizados
- [ ] Pronto para produção

---

**Próximos passos:**
1. Criar produtos no Stripe Dashboard
2. Copiar chaves e Price IDs
3. Atualizar variáveis Railway com valores reais
4. Testar checkout completo

**Tempo estimado:** 15-20 minutos
