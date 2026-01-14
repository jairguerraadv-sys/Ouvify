# 🚀 Deploy Rápido via Dashboards

Como alternativa ao deploy via CLI, você pode fazer deploy pelos dashboards web:

## Backend - Railway Dashboard

### 1. Criar Projeto
1. Acesse: https://railway.app/dashboard
2. Click em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize acesso ao repositório `ouvy-saas`
5. Selecione o repositório
6. Railway detectará automaticamente o Django

### 2. Configurar Root Directory
1. No projeto, vá em "Settings"
2. Em "Root Directory", defina: `ouvy_saas`
3. Save

### 3. Adicionar PostgreSQL
1. Click em "New Service"
2. Selecione "Database" → "PostgreSQL"
3. Railway criará o banco e configurará `DATABASE_URL` automaticamente

### 4. Configurar Variáveis de Ambiente
1. Vá em "Variables"
2. Adicione:
```
SECRET_KEY=j&x@uaqy(nonobld$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app
CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app
```

### 5. Deploy
1. Click em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Copie a URL gerada (ex: `ouvy-saas-production.up.railway.app`)

### 6. Verificar
```bash
curl https://ouvy-saas-production.up.railway.app/health/
```

---

## Frontend - Vercel Dashboard

### 1. Importar Projeto
1. Acesse: https://vercel.com/dashboard
2. Click em "Add New" → "Project"
3. Import Git Repository: `ouvy-saas`
4. Selecione o repositório

### 2. Configurar Build
1. Framework Preset: Next.js
2. Root Directory: `ouvy_frontend`
3. Build Command: `npm run build` (default)
4. Output Directory: `.next` (default)

### 3. Configurar Variáveis de Ambiente
1. Em "Environment Variables"
2. Adicionar:
```
Key: NEXT_PUBLIC_API_URL
Value: https://ouvy-saas-production.up.railway.app
```
3. Selecionar: Production, Preview, Development

### 4. Deploy
1. Click em "Deploy"
2. Aguarde o build (1-2 minutos)
3. Vercel mostrará a URL de produção

### 5. Atualizar CORS no Backend
1. Volte para Railway
2. Atualize `CORS_ALLOWED_ORIGINS` com a URL do Vercel
3. Exemplo: `https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app`
4. Redeploy do backend

---

## ✅ Verificação Final

### Testes Básicos
```bash
# Backend
curl https://seu-backend.railway.app/health/
curl https://seu-backend.railway.app/api/tenant-info/

# Frontend
open https://seu-frontend.vercel.app

# Teste integração
# 1. Abrir frontend
# 2. Ir em /enviar
# 3. Preencher formulário
# 4. Verificar se protocolo é gerado
# 5. Testar consulta em /acompanhar
```

---

## 🎯 URLs Importantes

Após deploy, anote:

**Backend (Railway):**
- URL: https://ouvy-saas-production.up.railway.app
- Admin: https://ouvy-saas-production.up.railway.app/admin/
- API: https://ouvy-saas-production.up.railway.app/api/
- Health: https://ouvy-saas-production.up.railway.app/health/
- Swagger: https://ouvy-saas-production.up.railway.app/swagger/

**Frontend (Vercel):**
- URL: https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app
- Enviar Feedback: /enviar
- Acompanhar: /acompanhar
- Cadastro: /cadastro
- Login: /login

---

## 📊 Monitoramento

### Railway
- Dashboard: Ver métricas de CPU/RAM
- Logs: Click em "View Logs"
- Deployments: Histórico de deploys

### Vercel
- Analytics: Ver tráfego e performance
- Logs: Ver builds e runtime logs
- Deployments: Histórico e rollback

---

## 🔧 Comandos CLI (Opcional)

Se preferir CLI após configuração inicial:

```bash
# Railway
npx @railway/cli login
npx @railway/cli status
npx @railway/cli logs

# Vercel  
npx vercel login
npx vercel list
npx vercel logs
```

---

**Deploy via dashboard é mais visual e recomendado para primeira vez!**
