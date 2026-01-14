# 🚀 DEPLOY SIMPLIFICADO - Passo a Passo

## Opção A: Deploy via Dashboards (RECOMENDADO - Mais Fácil)

### 📝 Instruções Completas
Siga o arquivo `DEPLOY_DASHBOARD.md` para deploy visual pelos dashboards.

**Resumo:**
1. Railway Dashboard → Importar repo → Configurar variáveis → Deploy
2. Vercel Dashboard → Importar repo → Configurar NEXT_PUBLIC_API_URL → Deploy
3. Testar integração

---

## Opção B: Deploy via CLI

### 🔧 Instalação das CLIs

#### Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Ou via npm
npm install -g @railway/cli

# Verificar instalação
railway --version
```

#### Vercel CLI
```bash
# npm
npm install -g vercel

# Verificar instalação
vercel --version
```

---

### 1️⃣ DEPLOY BACKEND (Railway)

```bash
# Navegar para pasta backend
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Login no Railway
railway login
# Abrirá navegador para autenticar

# Criar novo projeto OU linkar existente
railway init   # Para novo projeto
# OU
railway link   # Para projeto existente

# Adicionar PostgreSQL
railway add -p postgresql

# Configurar variáveis de ambiente
railway variables set SECRET_KEY="j&x@uaqy(nonobld\$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#"
railway variables set DEBUG="False"
railway variables set ALLOWED_HOSTS=".railway.app,.up.railway.app"

# Deploy!
railway up

# Ver status e obter URL
railway status

# Testar
curl $(railway status --json | jq -r .url)/health/
```

### 📝 Anotar URL do Backend
Exemplo: `https://ouvy-saas-production.up.railway.app`

---

### 2️⃣ DEPLOY FRONTEND (Vercel)

```bash
# Navegar para pasta frontend
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Login no Vercel
vercel login
# Abrirá navegador para autenticar

# Deploy inicial (responder perguntas)
vercel
# ? Set up and deploy? Yes
# ? Which scope? [Seu time]
# ? Link to existing project? No
# ? What's your project's name? ouvy-frontend
# ? In which directory is your code located? ./

# Configurar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL
# Quando perguntar, cole: https://ouvy-saas-production.up.railway.app
# Selecione: Production, Preview, Development

# Deploy para produção
vercel --prod

# Ver URL de produção
vercel inspect
```

### 📝 Anotar URL do Frontend
Exemplo: `https://ouvy-frontend.vercel.app`

---

### 3️⃣ ATUALIZAR CORS NO BACKEND

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Atualizar CORS com URL do Vercel
railway variables set CORS_ALLOWED_ORIGINS="https://ouvy-frontend.vercel.app"

# Redeploy
railway up
```

---

### 4️⃣ TESTAR INTEGRAÇÃO

```bash
# Testar backend
curl https://ouvy-saas-production.up.railway.app/health/
curl https://ouvy-saas-production.up.railway.app/api/tenant-info/

# Criar feedback de teste
curl -X POST https://ouvy-saas-production.up.railway.app/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "sugestao",
    "titulo": "Teste produção",
    "descricao": "Testando deploy em produção",
    "anonimo": false,
    "email_contato": "teste@exemplo.com"
  }'

# Abrir frontend no navegador
open https://ouvy-frontend.vercel.app
```

---

## ✅ Checklist Final

### Backend (Railway)
- [ ] Deploy realizado sem erros
- [ ] PostgreSQL conectado
- [ ] `/health/` retorna 200 OK
- [ ] `/api/tenant-info/` retorna dados
- [ ] Variáveis de ambiente configuradas
- [ ] URL anotada

### Frontend (Vercel)
- [ ] Deploy realizado sem erros
- [ ] Build sem erros (21 páginas)
- [ ] NEXT_PUBLIC_API_URL configurada
- [ ] Página inicial carrega
- [ ] URL anotada

### Integração
- [ ] CORS atualizado no backend
- [ ] Frontend consegue criar feedback
- [ ] Protocolo é gerado corretamente
- [ ] Consulta de protocolo funciona

---

## 🐛 Problemas Comuns

### Erro: CLIs não instaladas
```bash
# Instalar Railway
curl -fsSL https://railway.app/install.sh | sh

# Instalar Vercel
npm install -g vercel
```

### Erro: Permission denied (npm global)
```bash
# Usar npx em vez de global
npx @railway/cli login
npx vercel login
```

### Erro: CORS blocked
```bash
# Verificar e atualizar CORS
railway variables set CORS_ALLOWED_ORIGINS="https://sua-url.vercel.app"
railway up
```

### Erro: 500 Internal Server Error
```bash
# Ver logs do backend
railway logs

# Verificar variáveis
railway variables
```

---

## 📊 Comandos Úteis Pós-Deploy

```bash
# Railway
railway logs -f          # Ver logs em tempo real
railway status           # Ver status e URL
railway variables        # Listar variáveis
railway rollback         # Voltar deploy anterior

# Vercel
vercel logs             # Ver logs
vercel list             # Listar deploys
vercel inspect          # Ver detalhes
vercel domains add      # Adicionar domínio custom
```

---

## 🎉 Pronto!

Seu Ouvy SaaS está no ar! 🚀

**URLs Finais:**
- Backend: https://ouvy-saas-production.up.railway.app
- Frontend: https://ouvy-frontend.vercel.app
- Admin: https://ouvy-saas-production.up.railway.app/admin/
- Swagger: https://ouvy-saas-production.up.railway.app/swagger/

**Próximos Passos:**
1. Criar superusuário: `railway run python manage.py createsuperuser`
2. Configurar Stripe webhooks (opcional)
3. Adicionar domínio customizado (opcional)
4. Configurar monitoramento (Sentry, Analytics)

---

*Guia criado em 14/01/2026*  
*Ouvy SaaS - Deploy Simplificado*
