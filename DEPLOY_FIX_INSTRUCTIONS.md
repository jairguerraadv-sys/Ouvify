# 🚀 CORRIGIR DEPLOYS - VERCEL E RAILWAY

## ⚠️ PROBLEMA IDENTIFICADO

Após consolidação do monorepo, os deploys falharam porque:
- **Vercel**: Procurando `ouvy_frontend/` (não existe mais)
- **Railway**: Procurando `ouvy_saas/` (não existe mais)

**Nova estrutura:**
- Frontend: `apps/frontend/`
- Backend: `apps/backend/`

---

## 🔧 SOLUÇÃO 1: VERCEL (Frontend)

### Opção A: Via Dashboard Vercel (RECOMENDADO)

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto:** ouvy-saas ou ouvy-frontend
3. **Settings → General → Root Directory**
4. **Altere de:** `ouvy_frontend` 
5. **Para:** `apps/frontend`
6. **Clique:** Save
7. **Deployments → Redeploy** (última build)

### Opção B: Via Arquivo vercel.json (JÁ ATUALIZADO)

Os arquivos já estão corretos:
- ✅ `/vercel.json` - Build commands apontam para `apps/frontend/`
- ✅ `/apps/frontend/vercel.json` - Configuração local correta

**Problema:** Vercel Dashboard ainda tem Root Directory = `ouvy_frontend`

---

## 🔧 SOLUÇÃO 2: RAILWAY (Backend)

### Opção A: Via Dashboard Railway (RECOMENDADO)

1. **Acesse:** https://railway.app/dashboard
2. **Selecione o projeto:** ouvy-saas backend
3. **Settings → Build & Deploy**
4. **Root Directory:** Altere para `apps/backend`
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120`
7. **Clique:** Save Changes
8. **Redeploy**

### Opção B: Via railway.json (JÁ ATUALIZADO)

Arquivo `apps/backend/railway.json` já corrigido:
- ✅ Removido `cd ouvy_saas` dos comandos
- ✅ Paths relativos à raiz de `apps/backend/`

**Se Railway não detectar automaticamente:**
- Precisa configurar Root Directory no dashboard

---

## ✅ PASSOS PARA CORRIGIR (5-10 MINUTOS)

### 1. Commit das Correções
```bash
cd ~/Desktop/ouvy_saas
git add apps/backend/railway.json
git commit -m "fix(deploy): update Railway config for apps/backend structure"
git push origin consolidate-monorepo
```

### 2. Vercel - Atualizar Root Directory
```
Dashboard → Project → Settings → General → Root Directory
Alterar: ouvy_frontend → apps/frontend
Save → Redeploy
```

### 3. Railway - Atualizar Root Directory
```
Dashboard → Project → Settings → Build & Deploy
Root Directory: apps/backend
Build Command: pip install -r requirements.txt
Start Command: python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3
Save → Redeploy
```

### 4. Validar Deploys
```bash
# Frontend (Vercel)
curl https://seu-projeto.vercel.app/

# Backend (Railway)
curl https://seu-projeto.railway.app/api/health/
```

---

## 🎯 ALTERNATIVA: Deploy Manual Temporário

Se precisar validar localmente antes:

### Frontend (Local)
```bash
cd ~/Desktop/ouvy_saas/apps/frontend
npm run build
npm run start
# Acesse: http://localhost:3000
```

### Backend (Local com Docker)
```bash
cd ~/Desktop/ouvy_saas
docker-compose up -d backend
# Acesse: http://localhost:8000/api/health/
```

---

## 📋 CHECKLIST DE DEPLOY

### Vercel (Frontend)
- [ ] Root Directory = `apps/frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `.next`
- [ ] Install Command = `npm install`
- [ ] Redeploy concluído
- [ ] Site acessível

### Railway (Backend)
- [ ] Root Directory = `apps/backend`
- [ ] Build Command = `pip install -r requirements.txt`
- [ ] Start Command configurado corretamente
- [ ] Environment variables configuradas
- [ ] Redeploy concluído
- [ ] Health check OK

---

## 🆘 TROUBLESHOOTING

### Vercel: Build Ainda Falhando?
```bash
# Verificar se vercel.json está correto
cat ~/Desktop/ouvy_saas/vercel.json

# Deve ter: "buildCommand": "cd apps/frontend && npm install && npm run build"
```

### Railway: Comando Não Encontrado?
```bash
# Verificar Procfile se existir
cat ~/Desktop/ouvy_saas/apps/backend/Procfile

# Deve ter paths relativos, sem "cd ouvy_saas"
```

### Environment Variables Faltando?
- Verificar se todas as ENV vars foram migradas no dashboard
- DATABASE_URL, REDIS_URL, SECRET_KEY, etc.

---

## 🚀 APÓS CORREÇÃO DOS DEPLOYS

### 1. Merge do PR
```bash
# Após review e aprovação
git checkout main
git pull origin main
git branch -d consolidate-monorepo
```

### 2. Começar Fase 4 - Notificações Push
- Gerar VAPID keys
- Implementar Service Worker
- Criar NotificationCenter UI
- Testar em staging

---

## ✅ COMANDOS RÁPIDOS

```bash
# 1. Commit correções
git add -A
git commit -m "fix(deploy): update Vercel and Railway configs for monorepo"
git push origin consolidate-monorepo

# 2. Atualizar PR
# (As mudanças aparecerão automaticamente no PR)

# 3. Aguardar deploys
# Vercel: ~2-3 minutos
# Railway: ~3-5 minutos
```

---

**🎯 PRÓXIMA AÇÃO:** Atualizar Root Directory no Vercel e Railway! 🚀
