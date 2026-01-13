# 🧪 Teste do Dinheiro - Guia Completo

## Objetivo
Validar que o fluxo de pagamento funciona end-to-end: usuário clica em "Assinar", paga no Stripe, e o badge muda automaticamente para "Premium" no dashboard.

---

## 📋 Checklist Pré-Teste

Antes de começar, certifique-se:

- [ ] Backend rodando em `127.0.0.1:8000`
- [ ] Frontend rodando em `localhost:3000`
- [ ] Stripe CLI instalado (`stripe --version`)
- [ ] Arquivo `.env` na raiz com as chaves Stripe
- [ ] Você está logado (tem um token válido)

---

## 🚀 Passo 1: Inicie o Túnel do Stripe

Este é o **passo crítico**. O túnel cria um canal seguro entre Stripe e seu computador local.

### Terminal 1 (Novo):
```bash
stripe listen --forward-to localhost:8000/api/tenants/webhook/
```

Você verá algo assim:
```
> Ready! Your webhook signing secret is whsec_test_51Soqhh2LAa2LQ6eh...
```

**⚠️ IMPORTANTE:** Copie o código `whsec_test_...` completo.

---

## 🔐 Passo 2: Configure o Webhook Secret

O backend precisa saber qual é o segredo para validar eventos do Stripe.

### Abra o arquivo `.env` na raiz:
```bash
nano /Users/jairneto/Desktop/ouvy_saas/.env
```

### Adicione esta linha (cole o whsec que você copiou):
```env
STRIPE_WEBHOOK_SECRET=whsec_test_51Soqhh2LAa2LQ6eh...
```

### Salve (Ctrl+X, Y, Enter em nano)

---

## 🔄 Passo 3: Reinicie o Django

O servidor Django precisa recarregar o arquivo `.env`.

### Terminal do Backend:
```bash
# Se está rodando, pare com Ctrl+C
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
/Users/jairneto/Desktop/ouvy_saas/venv/bin/python manage.py runserver 127.0.0.1:8000
```

Você deve ver:
```
💳 Stripe: ✅ Configurado
```

---

## 💳 Passo 4: Teste a Compra

Agora vem a parte divertida.

### Acesse:
```
http://localhost:3000/planos
```

### Clique em "Assinar Starter"

A página vai redirecionar para o Stripe Checkout. Se isso não acontecer, abra o console do navegador (F12) e procure por erros.

### No Checkout, use os dados de teste:

| Campo | Valor |
|-------|-------|
| Email | qualquer um (ex: teste@exemplo.com) |
| Cartão | `4242 4242 4242 4242` |
| Validade | `12/30` (ou qualquer data futura) |
| CVC | `123` |

### Clique em "Pagar" (ou "Pay")

---

## ✅ Passo 5: Validação

Após clicar em "Pagar", três coisas devem acontecer simultaneamente:

### 1. **Dashboard (Frontend)**
- Você deve ser redirecionado para `http://localhost:3000/dashboard?success=true`
- O banner azul "Plano Free" deve ter desaparecido
- Um banner **verde com "✓ Premium"** deve aparecer no topo

### 2. **Terminal do Stripe** (onde você rodou `stripe listen`)
```
2026-01-12 14:32:50   --> checkout.session.completed [evt_1Soqhh2LAa2LQ6eh...]
2026-01-12 14:32:51   <-- 200 OK
```

Se você ver `200 OK`, significa que:
- O webhook foi recebido
- O backend validou a assinatura
- O banco de dados foi atualizado

### 3. **Django Admin (Verificação Manual)**
Acesse: `http://127.0.0.1:8000/admin/`
- Vá em "Clientes"
- Procure pelo seu tenant
- Os campos devem estar atualizados:
  - `plano: 'starter'`
  - `stripe_customer_id: ch_...`
  - `stripe_subscription_id: sub_...`
  - `subscription_status: 'active'`

---

## 🐛 Troubleshooting

### ❌ "Erro ao criar sessão de pagamento"
**Causas possíveis:**
- Você não está logado (sem token válido)
- O arquivo `.env` não tem `STRIPE_SECRET_KEY`
- O backend não está rodando

**Solução:**
1. Verifique se tem um token válido em localStorage (F12 > Application > localStorage)
2. Confirme as chaves no `.env`
3. Reinicie o backend

### ❌ "Header X-Stripe-Signature ausente"
**Causa:** O túnel do Stripe não está rodando

**Solução:**
```bash
stripe listen --forward-to localhost:8000/api/tenants/webhook/
```

### ❌ "Assinatura de webhook inválida"
**Causa:** O `STRIPE_WEBHOOK_SECRET` não bate com o que o Stripe está enviando

**Solução:**
1. Verifique que você copiou o whsec inteiro (começa com `whsec_test_`)
2. Reinicie o Django após adicionar ao `.env`
3. No terminal do `stripe listen`, confirme que não tem erros

### ❌ O banner não muda para "Premium"
Mesmo que o webhook tenha sucesso (`200 OK`), a página não vai atualizar automaticamente.

**Solução:**
- Recarregue a página (F5)
- Ou abra uma aba nova do dashboard
- O hook vai ter atualizado o banco de dados, mas o frontend precisa refetch

### ❌ "Invalid payment method"
**Causa:** Você digitou o cartão errado ou não é um cartão de teste

**Solução:**
Use exatamente: `4242 4242 4242 4242`

---

## 📊 O Que Você Aprendeu

Quando esse teste passar, você terá validado:

1. ✅ **Autenticação:** Backend reconheceu o usuário
2. ✅ **Criação de Sessão:** Backend criou sessão no Stripe
3. ✅ **Redirect:** Frontend redirecionou para checkout
4. ✅ **Pagamento:** Stripe processou o cartão
5. ✅ **Webhook:** Stripe enviou evento de sucesso
6. ✅ **Validação:** Backend validou a assinatura do webhook
7. ✅ **Atualização de BD:** Cliente foi marcado como "Premium"
8. ✅ **Renderização:** Frontend renderizou o novo status

Isso é um **SaaS completo funcionando**.

---

## 🎯 Próximo Passo

Uma vez que tudo estiver funcionando, você pode:

1. **Deploy no Railway** (Backend + Postgres)
2. **Deploy na Vercel** (Frontend)
3. **Configurar DNS** para seus subdomínios

Quer o guia de deploy agora?
