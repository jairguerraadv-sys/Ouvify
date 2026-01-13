# 🚀 Deploy no Vercel (Frontend Next.js)

## O Que é Vercel?

Vercel é a plataforma oficial do Next.js:
- Deploy com um `git push`
- CDN global para performance
- Serverless functions (se precisar)
- Grátis para startups
- Preview deployments automáticos

---

## 📋 Pré-Requisitos

- [ ] Conta no Vercel (vercel.com)
- [ ] Repositório Git com o frontend
- [ ] Backend já deployed na Railway
- [ ] Domínio customizado (opcional, mas recomendado)

---

## 🔑 Passo 1: Crie uma Conta no Vercel

Acesse: https://vercel.com

1. Clique em "Sign Up"
2. Autentique com GitHub (recomendado)
3. Confirme email

---

## 🔧 Passo 2: Prepare o Frontend

### 2.1 Configure as variáveis de ambiente:

Crie ou atualize `.env.production` na raiz do frontend:

```bash
cat > /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/.env.production << 'EOF'
# Use sua URL do Railway
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...  # Sua chave pública do Stripe
EOF
```

### 2.2 Atualize o código para usar a variável:

**Verifique se seus hooks estão usando a URL correta.**

Em `hooks/use-dashboard.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_URL,
});
```

---

## 📝 Passo 3: Commit e Push

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

git add .
git commit -m "Configure for production deployment"
git push origin main
```

---

## 🚀 Passo 4: Deploy no Vercel

### 4.1 Instale a CLI do Vercel:

```bash
npm install -g vercel
```

### 4.2 Autentique:

```bash
vercel login
```

### 4.3 Deploy:

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
vercel --prod
```

Durante o deploy, Vercel vai perguntar:

- **Project name?** → `ouvy-frontend` (ou o nome que quiser)
- **Which scope?** → Seu nome ou organização
- **Link to existing project?** → `N` (se for primeira vez)
- **Override settings?** → `N`

Vercel vai:
1. Detectar Next.js automaticamente
2. Fazer build
3. Deploy para a URL: `https://ouvy-frontend.vercel.app`

---

## 🔐 Passo 5: Configure Variáveis de Ambiente no Vercel Dashboard

Para que as variáveis de produção funcionem, configure no dashboard:

### No navegador, acesse: https://vercel.com/dashboard

1. Selecione seu projeto `ouvy-frontend`
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLIC_KEY = pk_test_...
```

4. Clique em **Save**

### 5.1 Redeploy para aplicar:

```bash
vercel --prod
```

---

## 🌐 Passo 6: Configure um Domínio Customizado (Opcional)

Se quiser `app.suaempresa.com` em vez de `ouvy-frontend.vercel.app`:

### No Vercel Dashboard:

1. Vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite `app.suaempresa.com`
4. Vercel vai fornecer os registros DNS que você precisa adicionar no seu registrador

### No seu Registrador (GoDaddy, Namecheap, etc):

1. Acesse o painel de DNS
2. Adicione os registros CNAME que Vercel forneceu
3. Espere 24h para propagar (geralmente 15 minutos)

---

## ✅ Validação do Deploy

1. Acesse: `https://ouvy-frontend.vercel.app` (ou seu domínio customizado)
2. Faça login
3. Vá para `/planos`
4. Teste o fluxo de pagamento

**Importante:** O webhook do Stripe precisa saber da sua URL do Railway:

```bash
# No seu .env do Railway:
BASE_URL=https://ouvy-frontend.vercel.app  # Frontend
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

---

## 🐛 Troubleshooting no Vercel

### ❌ "Cannot find module '@/components'"
Pode ser um problema de build. Verifique:
```bash
cd ouvy_frontend
npm run build
```

Se funciona local, mas não no Vercel, pode ser:
- Diferença de case sensitivity (Windows vs Linux)
- Node version mismatch

**Solução:** No Vercel Dashboard → Settings → Node.js Version → escolha 20 ou 21

### ❌ "API requests to backend fail (CORS error)"
**Causa:** O backend não conhece o domínio do frontend

**Solução:**
1. Vá no Railway Dashboard
2. Edite a variável `CORS_ALLOWED_ORIGINS`
3. Adicione: `https://seu-dominio-vercel.app`
4. Redeploy o backend

### ❌ "Stripe checkout não funciona"
Verifique:
1. `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` está configurado no Vercel
2. A variável é acessível no frontend (deve começar com `NEXT_PUBLIC_`)
3. A chave não é a SECRET_KEY (deve ser a pública)

---

## 📍 O Que Você Conseguiu

Agora você tem:

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://app.suaempresa.com         │
└──────────────────┬──────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────┐
│  Backend (Railway)                  │
│  https://backend.railway.app        │
│  + PostgreSQL                       │
└─────────────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
         ┌──────────────────┐
         │ Stripe (SaaS)    │
         │ Pagamentos       │
         │ Webhooks         │
         └──────────────────┘
```

---

## 🎯 Próximos Passos (Opcional)

1. **Configurar Domínio Customizado**
   - Compre um domínio
   - Configure DNS no Vercel e Railway
   - Use `https://app.suaempresa.com`

2. **Configurar Email (Nodemailer/SendGrid)**
   - Enviar confirmação de pagamento
   - Notificações para o suporte

3. **Monitoramento (Sentry)**
   - Rastrear erros em produção
   - Alertas automáticos

4. **Analytics (Plausible/Mixpanel)**
   - Entender comportamento dos usuários
   - Otimizar conversão

5. **CI/CD (GitHub Actions)**
   - Testes automáticos
   - Deploy automático

---

## 🎉 Parabéns!

Seu SaaS agora está:
- ✅ No ar
- ✅ Com pagamentos funcionando
- ✅ Escalável
- ✅ Pronto para usuários reais

Quer um guia para estruturar subdomínios para cada cliente?
