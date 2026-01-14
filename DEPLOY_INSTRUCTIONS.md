# 🚀 Guia de Deploy - Ouvy SaaS

**Data:** 14 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Deploy

---

## 📋 Pré-requisitos

### Contas Necessárias
- [x] GitHub (código commitado e pushed)
- [ ] Railway (backend hosting)
- [ ] Vercel (frontend hosting)
- [ ] Stripe (pagamentos - opcional)

### Ferramentas
- [x] Git instalado
- [x] Node.js/npm instalado
- [x] Python 3.14+ instalado

---

## 🎯 Ordem de Deploy

1. **Backend (Railway)** - Deploy primeiro para obter URL da API
2. **Frontend (Vercel)** - Deploy após backend, usando API URL
3. **Configurações finais** - Webhooks, CORS, testes

---

## 🔧 PARTE 1: Deploy Backend (Railway)

### Passo 1: Login no Railway
```bash
npx @railway/cli login
```

### Passo 2: Link ou Criar Projeto
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Se projeto já existe:
npx @railway/cli link

# Ou criar novo:
npx @railway/cli init
```

### Passo 3: Configurar Variáveis de Ambiente
```bash
# Adicionar variáveis necessárias
npx @railway/cli variables set SECRET_KEY="j&x@uaqy(nonobld$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#"
npx @railway/cli variables set DEBUG="False"
npx @railway/cli variables set ALLOWED_HOSTS=".railway.app,.up.railway.app"
npx @railway/cli variables set CORS_ALLOWED_ORIGINS="https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app"

# Database será criada automaticamente pelo Railway (PostgreSQL)
```

### Passo 4: Adicionar PostgreSQL
```bash
# Criar serviço PostgreSQL
npx @railway/cli service add postgresql

# Railway automaticamente configura DATABASE_URL
```

### Passo 5: Deploy Backend
```bash
# Deploy da pasta ouvy_saas
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
npx @railway/cli up

# Aguardar build e deploy
# Railway executará automaticamente:
# 1. pip install -r requirements.txt
# 2. python manage.py migrate
# 3. python manage.py collectstatic
# 4. gunicorn config.wsgi:application
```

### Passo 6: Verificar Deploy Backend
```bash
# Obter URL do backend
npx @railway/cli status

# Testar health check
curl https://seu-backend.up.railway.app/health/

# Deve retornar: {"status":"healthy","database":"ok","debug_mode":false}
```

### Passo 7: Anotar URL do Backend
```bash
# Exemplo:
# https://ouvy-saas-production.up.railway.app

# Esta URL será usada no frontend!
```

---

## 🎨 PARTE 2: Deploy Frontend (Vercel)

### Passo 1: Login no Vercel
```bash
npx vercel login
```

### Passo 2: Deploy Frontend
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Deploy inicial (preview)
npx vercel

# Responda as perguntas:
# ? Set up and deploy? Yes
# ? Which scope? Seu time/conta
# ? Link to existing project? No
# ? What's your project's name? ouvy-frontend
# ? In which directory is your code located? ./
```

### Passo 3: Configurar Variáveis de Ambiente (Vercel)
```bash
# Adicionar variável NEXT_PUBLIC_API_URL
npx vercel env add NEXT_PUBLIC_API_URL

# Quando perguntar, cole a URL do backend Railway:
# https://ouvy-saas-production.up.railway.app

# Selecione: Production, Preview, Development (todas)
```

### Passo 4: Deploy para Produção
```bash
# Deploy para produção
npx vercel --prod

# Aguardar build
# Vercel executará:
# 1. npm install
# 2. npm run build
# 3. Deploy dos arquivos estáticos
```

### Passo 5: Verificar Deploy Frontend
```bash
# Vercel mostrará a URL de produção
# Exemplo: https://ouvy-frontend.vercel.app

# Abrir no navegador e testar:
# - Página inicial carrega
# - Enviar feedback funciona
# - Consultar protocolo funciona
```

---

## 🔄 PARTE 3: Configurações Finais

### Atualizar CORS no Backend
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Atualizar variável no Railway com URL do Vercel
npx @railway/cli variables set CORS_ALLOWED_ORIGINS="https://seu-frontend.vercel.app"

# Redeploy backend
npx @railway/cli up
```

### Testar Integração Completa
```bash
# 1. Abrir frontend em produção
open https://seu-frontend.vercel.app

# 2. Testar fluxo de envio de feedback
# 3. Verificar se protocolo é gerado
# 4. Testar consulta de protocolo
# 5. Testar cadastro de tenant (se habilitado)
```

---

## ✅ Checklist Pós-Deploy

### Backend (Railway)
- [ ] Health check retorna 200 OK
- [ ] `/api/tenant-info/` retorna dados
- [ ] PostgreSQL conectado
- [ ] Migrations aplicadas
- [ ] Static files coletados
- [ ] DEBUG=False em produção
- [ ] SECRET_KEY configurada
- [ ] ALLOWED_HOSTS correto
- [ ] CORS configurado

### Frontend (Vercel)
- [ ] Build sem erros
- [ ] Página inicial carrega
- [ ] NEXT_PUBLIC_API_URL configurado
- [ ] Formulário de feedback funciona
- [ ] Consulta de protocolo funciona
- [ ] Imagens carregando
- [ ] CSS aplicado corretamente
- [ ] Sem erros no console

### Integração
- [ ] Frontend consegue fazer POST /api/feedbacks/
- [ ] Protocolo é retornado corretamente
- [ ] Consulta de protocolo funciona
- [ ] Rate limiting ativo (429 após 5 tentativas)
- [ ] Mensagens de erro amigáveis
- [ ] CORS permitindo requests

---

## 🐛 Troubleshooting

### Erro: CORS blocked
**Problema:** Frontend não consegue acessar backend  
**Solução:**
```bash
# Verificar CORS no backend
npx @railway/cli variables get CORS_ALLOWED_ORIGINS

# Deve incluir URL do frontend Vercel
# Atualizar se necessário:
npx @railway/cli variables set CORS_ALLOWED_ORIGINS="https://seu-frontend.vercel.app"
```

### Erro: 500 Internal Server Error
**Problema:** Backend com erro  
**Solução:**
```bash
# Ver logs do Railway
npx @railway/cli logs

# Verificar variáveis de ambiente
npx @railway/cli variables

# Verificar migrations
npx @railway/cli run python manage.py showmigrations
```

### Erro: Database connection failed
**Problema:** PostgreSQL não conectado  
**Solução:**
```bash
# Verificar se DATABASE_URL está configurada
npx @railway/cli variables get DATABASE_URL

# Se não existir, adicionar serviço PostgreSQL
npx @railway/cli service add postgresql
```

### Erro: Static files not loading
**Problema:** CSS/JS não carregam  
**Solução:**
```bash
# Rodar collectstatic manualmente
npx @railway/cli run python manage.py collectstatic --noinput

# Verificar STATIC_ROOT e STATIC_URL no settings.py
```

### Erro: Next.js build failed
**Problema:** Build do frontend falha  
**Solução:**
```bash
# Testar build localmente
cd ouvy_frontend
npm run build

# Ver logs do Vercel
npx vercel logs
```

---

## 📊 Monitoramento Pós-Deploy

### Railway Dashboard
- Acessar: https://railway.app/dashboard
- Verificar métricas de CPU/Memory
- Configurar alertas se necessário

### Vercel Dashboard
- Acessar: https://vercel.com/dashboard
- Ver analytics de acesso
- Verificar build logs

### Testes de Saúde (5 minutos)
```bash
# Backend health
curl https://seu-backend.up.railway.app/health/

# Frontend homepage
curl -I https://seu-frontend.vercel.app/

# API de feedback (criar)
curl -X POST https://seu-backend.up.railway.app/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "sugestao",
    "titulo": "Teste pós-deploy",
    "descricao": "Verificação de funcionamento em produção",
    "anonimo": false,
    "email_contato": "teste@exemplo.com"
  }'

# API de consulta (público)
curl "https://seu-backend.up.railway.app/api/feedbacks/consultar-protocolo/?codigo=PROTOCOLO-AQUI"
```

---

## 🔐 Configurações de Segurança Adicionais

### Configurar Stripe Webhooks (Opcional)
```bash
# No dashboard Stripe:
# 1. Adicionar webhook endpoint: https://seu-backend.up.railway.app/api/tenants/webhook/
# 2. Copiar signing secret
# 3. Adicionar no Railway:
npx @railway/cli variables set STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Configurar Email (Opcional)
```bash
# SendGrid ou outro provedor SMTP
npx @railway/cli variables set EMAIL_HOST="smtp.sendgrid.net"
npx @railway/cli variables set EMAIL_HOST_PASSWORD="SG.sua-api-key"
npx @railway/cli variables set DEFAULT_FROM_EMAIL="no-reply@ouvy.com"
```

### Configurar Domínio Customizado (Opcional)

**Railway:**
```bash
# Adicionar domínio no Railway Dashboard
# 1. Settings > Domains
# 2. Add Custom Domain
# 3. Configurar DNS (A record ou CNAME)
```

**Vercel:**
```bash
# Adicionar domínio
npx vercel domains add ouvy.com

# Seguir instruções de DNS
```

---

## 📝 Comandos Úteis

### Railway
```bash
# Ver status
npx @railway/cli status

# Ver logs em tempo real
npx @railway/cli logs -f

# Listar variáveis
npx @railway/cli variables

# Executar comando no container
npx @railway/cli run python manage.py shell

# Rollback para deploy anterior
npx @railway/cli rollback
```

### Vercel
```bash
# Listar deploys
npx vercel list

# Ver logs
npx vercel logs

# Inspecionar build
npx vercel inspect <deployment-url>

# Promover deploy para produção
npx vercel promote <deployment-url>

# Remover deploy
npx vercel remove <deployment-id>
```

---

## 🎉 Deploy Completo!

Após seguir todos os passos:

✅ **Backend Django** rodando no Railway com PostgreSQL  
✅ **Frontend Next.js** rodando no Vercel  
✅ **Integração funcionando** com CORS configurado  
✅ **Variáveis de ambiente** configuradas  
✅ **Health checks** validados  

### URLs Finais
- **Frontend:** https://seu-frontend.vercel.app
- **Backend API:** https://seu-backend.up.railway.app
- **Admin Django:** https://seu-backend.up.railway.app/admin/
- **Swagger:** https://seu-backend.up.railway.app/swagger/

### Próximos Passos
1. Configurar monitoramento (Sentry, LogRocket)
2. Configurar backups do banco de dados
3. Adicionar testes E2E automatizados
4. Configurar CI/CD com GitHub Actions
5. Documentar APIs para equipe

---

**Deploy realizado com sucesso!** 🚀

*Guia gerado em 14/01/2026*  
*Ouvy SaaS - White Label Feedback Platform*
