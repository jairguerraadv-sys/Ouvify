# 🎯 Quick Reference - Ouvy SaaS

## Estrutura de Pastas

```
/Users/jairneto/Desktop/ouvy_saas/
├── ouvy_saas/                    # Backend (Django)
│   ├── config/                   # Configurações
│   ├── apps/
│   │   ├── core/                 # Middleware, exceptions
│   │   ├── tenants/              # Clientes SaaS (Model + Auth)
│   │   ├── feedbacks/            # Feedbacks (Denúncias/Sugestões)
│   │   └── __init__.py
│   ├── manage.py
│   └── requirements.txt
│
├── ouvy_frontend/                # Frontend (Next.js)
│   ├── app/
│   │   ├── (site)/               # Landing page
│   │   ├── cadastro/             # Signup
│   │   ├── login/                # Login
│   │   ├── planos/               # Pricing (Stripe checkout)
│   │   ├── dashboard/            # Dashboard (métricas + feedbacks)
│   │   ├── acompanhar/           # Public feedback tracking
│   │   └── enviar/               # Anonymous feedback submission
│   ├── components/               # Shadcn UI components
│   ├── hooks/                    # Custom React hooks
│   └── package.json
│
├── .env                          # Variáveis de ambiente
├── TESTE_PAGAMENTO.md            # Guia de teste local
├── DEPLOY_RAILWAY.md             # Guia deploy backend
├── DEPLOY_VERCEL.md              # Guia deploy frontend
└── GUIA_COMPLETO_DEPLOYMENT.md   # Guia geral

```

---

## 🔧 Comandos Úteis

### Backend (Django)

```bash
# Ativar virtual environment
source /Users/jairneto/Desktop/ouvy_saas/venv/bin/activate

# Fazer migrações
python /Users/jairneto/Desktop/ouvy_saas/ouvy_saas/manage.py makemigrations
python /Users/jairneto/Desktop/ouvy_saas/ouvy_saas/manage.py migrate

# Rodar servidor
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
python manage.py runserver 127.0.0.1:8000

# Criar superuser (admin)
python manage.py createsuperuser

# Django shell (testar modelos)
python manage.py shell

# Ver migrações pendentes
python manage.py showmigrations

# Resetar banco (dev only!)
python manage.py flush
```

### Frontend (Next.js)

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Instalar dependências
npm install

# Rodar dev server
npm run dev
# Acessa: http://localhost:3000

# Build para produção
npm run build

# Testar build localmente
npm run start

# Linter
npm run lint
```

### Stripe (Webhooks Locais)

```bash
# Instalar CLI (se não tiver)
brew install stripe

# Iniciar túnel para webhooks locais
stripe listen --forward-to localhost:8000/api/tenants/webhook/

# Usar em um teste (sem o túnel rodando)
stripe trigger payment_intent.succeeded
```

### Git & Deploy

```bash
# Commit básico
git add .
git commit -m "Mensagem"

# Push para Railway
git push railway main

# Deploy Vercel via CLI
vercel --prod

# Ver status do deploy
vercel ls
```

---

## 📍 URLs Importantes

### Local Development

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://127.0.0.1:8000 |
| Django Admin | http://127.0.0.1:8000/admin |
| API Docs | http://127.0.0.1:8000/api/ |

### Production (Após Deploy)

| Serviço | URL |
|---------|-----|
| Frontend | https://app.vercel.app (ou seu domínio) |
| Backend | https://backend.railway.app |
| Django Admin | https://backend.railway.app/admin |

---

## 🔑 Variáveis de Ambiente

### `.env` (Raiz do Projeto)

```env
# Django
SECRET_KEY=...
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Production)
DB_ENGINE=sqlite (ou postgresql)
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_HOST=...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
BASE_URL=http://localhost:3000

# i18n
LANGUAGE_CODE=pt-br
TIME_ZONE=America/Sao_Paulo
```

### `.env.local` (Frontend)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### `.env.production` (Frontend - Deploy)

```env
NEXT_PUBLIC_API_URL=https://backend.railway.app
```

---

## 🧪 Testes Rápidos

### Testar Backend

```bash
# Verificar saúde do sistema
curl http://127.0.0.1:8000/api/core/health/

# Listar feedbacks
curl -H "Authorization: Token YOUR_TOKEN" \
  http://127.0.0.1:8000/api/feedbacks/

# Criar checkout session
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plano":"starter"}' \
  http://127.0.0.1:8000/api/tenants/subscribe/

# Webhook de teste (com stripe CLI)
stripe trigger checkout.session.completed
```

### Testar Frontend (F12 Console)

```javascript
// Verificar token
localStorage.getItem('authToken')

// Testar API call
fetch('http://127.0.0.1:8000/api/feedbacks/', {
  headers: {'Authorization': 'Token YOUR_TOKEN'}
}).then(r => r.json()).then(console.log)

// Simular logout
localStorage.removeItem('authToken')
```

---

## 📊 Endpoints Principais

### Autenticação
- `POST /api-token-auth/` - Login (email + password)
- `DELETE /api-token-auth/` - Logout

### SaaS (Registro de Clientes)
- `POST /api/register-tenant/` - Criar novo cliente
- `GET /api/tenant-info/` - Info do tenant atual
- `GET /api/check-subdominio/` - Verificar disponibilidade

### Feedbacks
- `GET /api/feedbacks/` - Listar feedbacks (auth)
- `POST /api/feedbacks/` - Criar feedback (auth)
- `GET /api/feedbacks/{id}/` - Detalhes (auth)
- `GET /api/feedbacks/consultar-protocolo/` - Consultar por código (público)
- `POST /api/feedbacks/responder-protocolo/` - Responder (público)
- `GET /api/feedbacks/dashboard-stats/` - KPIs (auth)
- `POST /api/feedbacks/{id}/adicionar-interacao/` - Chat (auth)

### Pagamentos
- `POST /api/tenants/subscribe/` - Criar checkout (auth)
- `POST /api/tenants/webhook/` - Webhook do Stripe (público)

### Admin
- `GET /api/admin/tenants/` - Listar tenants (admin only)
- `PATCH /api/admin/tenants/{id}/` - Atualizar tenant (admin only)

---

## 🚨 Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "ModuleNotFoundError: django" | Venv não ativado | `source venv/bin/activate` |
| "ConnectionRefusedError: 127.0.0.1:8000" | Backend não está rodando | `python manage.py runserver` |
| "CORS error" | Frontend URL não está em ALLOWED_ORIGINS | Adicionar no settings.py |
| "Invalid token" | Token expirado ou inválido | Fazer login novamente |
| "Stripe key not found" | .env não carregado | Reiniciar servidor Django |
| "Page not found" | Rota não existe no Next.js | Verificar app/ estrutura |
| "Webhook signature invalid" | STRIPE_WEBHOOK_SECRET errado | Copiar exatamente do `stripe listen` |

---

## 📚 Recursos Úteis

- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Django Docs:** https://docs.djangoproject.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/
- **Shadcn/UI:** https://ui.shadcn.com/

---

## 💡 Dicas Pro

1. **Use `httpie` ou `Postman`** para testar APIs
   ```bash
   brew install httpie
   http -b POST 127.0.0.1:8000/api-token-auth/ email=test@test.com password=123
   ```

2. **Ative DEBUG=True em desenvolvimento** para ver erros detalhados

3. **Use Django Admin** para gerenciar dados manualmente:
   ```
   http://127.0.0.1:8000/admin/
   user: admin
   password: (que você criou no createsuperuser)
   ```

4. **Monitore requests com `django-debug-toolbar`**:
   ```bash
   pip install django-debug-toolbar
   # Adicionar em INSTALLED_APPS e MIDDLEWARE
   ```

5. **Use `pytest` para testes automáticos**:
   ```bash
   pip install pytest pytest-django
   pytest
   ```

---

## 🎯 Checklist Antes de Deploy

- [ ] `.env` tem todas as chaves Stripe
- [ ] `requirements.txt` atualizado com `gunicorn`
- [ ] `Procfile` criado no backend
- [ ] `DEBUG=False` configurado para production
- [ ] `ALLOWED_HOSTS` inclui o domínio Railway
- [ ] `CORS_ALLOWED_ORIGINS` inclui o domínio Vercel
- [ ] Banco de dados migrado localmente
- [ ] Testes de pagamento passam com Stripe CLI
- [ ] Git repository initialized e commited
- [ ] `.gitignore` exclui `.env` e `venv/`

---

## 🚀 Quick Deploy Command

```bash
# Backend (Railway)
cd /Users/jairneto/Desktop/ouvy_saas
git add . && git commit -m "Deploy" && git push railway main

# Frontend (Vercel)
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
vercel --prod
```

---

## 📞 Últimos Passos

1. ✅ Teste localmente com `TESTE_PAGAMENTO.md`
2. 📦 Deploy backend com `DEPLOY_RAILWAY.md`
3. 🎨 Deploy frontend com `DEPLOY_VERCEL.md`
4. 🌐 Configure domínio customizado
5. 💰 Comece a vender!

**Boa sorte! 🚀**
