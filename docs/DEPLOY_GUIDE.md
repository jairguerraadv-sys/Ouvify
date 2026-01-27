# 🚀 GUIA DE DEPLOY - OUVY SAAS

## ✅ Status dos Preparativos

### Backend - Railway (PRONTO)
- ✅ `Procfile` criado
- ✅ `runtime.txt` criado (Python 3.11.8)
- ✅ `nixpacks.toml` configurado
- ✅ `deploy.sh` criado e executável
- ✅ `requirements.txt` verificado (gunicorn presente)
- ✅ `.env.local` criado para desenvolvimento

### Frontend - Vercel
- ⏳ Necessita configuração (próximo passo)

---

## 📋 PASSO A PASSO - DEPLOY

### 1. CONFIGURAR SMTP (30 minutos)

#### Opção A: SendGrid (Recomendado - 100 emails/dia grátis)

**1.1. Criar conta:**
```
1. Acesse: https://sendgrid.com/
2. Sign Up (plano gratuito)
3. Verificar email
4. Complete onboarding
```

**1.2. Criar API Key:**
```
1. Settings > API Keys
2. Create API Key
3. Nome: "Ouvy Production"
4. Permissions: "Mail Send" (Full Access)
5. Copiar chave (aparece só 1 vez!)
   Exemplo: SG.xxxxxxxxxxxxxxxxxxxxxx
```

**1.3. Testar localmente:**

```bash
# 1. Criar arquivo .env no backend
cd /Users/jairneto/Desktop/ouvy_saas/apps/backend
cp .env.local .env

# 2. Editar .env e adicionar:
nano .env
```

Adicione estas linhas:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.sua_chave_aqui
DEFAULT_FROM_EMAIL=noreply@ouvy.com
```

**1.4. Testar envio:**

```bash
# Ativar venv
source /Users/jairneto/Desktop/ouvy_saas/.venv/bin/activate

# Abrir Django shell
cd /Users/jairneto/Desktop/ouvy_saas/apps/backend
python manage.py shell

# Cole este código:
from django.core.mail import send_mail

result = send_mail(
    subject='🎉 Teste SMTP - Ouvy',
    message='Email de teste enviado com sucesso!',
    from_email='noreply@ouvy.com',
    recipient_list=['SEU_EMAIL_AQUI@gmail.com'],
    html_message='<h1 style="color: blue;">✅ SMTP Configurado!</h1><p>Sistema de emails funcionando perfeitamente.</p>',
)

print(f"✅ Email enviado! Resultado: {result}")
```

**Deve retornar:** `1`  
**Verificar:** Caixa de entrada (pode ir para spam na primeira vez)

---

### 2. DEPLOY BACKEND - RAILWAY (1-2 horas)

#### 2.1. Criar projeto Railway

```bash
# Acesse: https://railway.app/

1. Login with GitHub
2. New Project
3. "Deploy from GitHub repo"
4. Autorizar Railway no GitHub
5. Selecionar repositório: ouvy-saas
6. Aguardar análise...
```

#### 2.2. Configurar root directory

```
No Railway Dashboard:
1. Settings
2. Service Settings
3. Root Directory: apps/backend
4. Salvar
```

#### 2.3. Adicionar PostgreSQL

```
1. Na Dashboard do projeto
2. "+ New" > Database > PostgreSQL
3. Aguardar provisioning (~2 min)
4. Railway cria automaticamente DATABASE_URL
```

#### 2.4. Adicionar Redis

```
1. Na Dashboard do projeto
2. "+ New" > Database > Redis
3. Aguardar provisioning (~1 min)
4. Railway cria automaticamente REDIS_URL
```

#### 2.5. Configurar variáveis de ambiente

```
No Railway > Backend Service > Variables:

Clique "Raw Editor" e cole:
```

```env
# Django Core
SECRET_KEY=SUA_CHAVE_SECRETA_AQUI_MINIMO_50_CARACTERES_USE_GERADOR_ABAIXO
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app,ouvy.com,www.ouvy.com
USE_X_FORWARDED_HOST=True

# Database (Railway gera automaticamente)
# DATABASE_URL=postgresql://...

# Redis (Railway gera automaticamente)
# REDIS_URL=redis://...

# CORS
CORS_ALLOWED_ORIGINS=https://ouvy.vercel.app,https://ouvy-saas.vercel.app,https://ouvy.com
CORS_ALLOW_CREDENTIALS=True

# Email SendGrid
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.sua_chave_sendgrid_aqui
DEFAULT_FROM_EMAIL=noreply@ouvy.com
SERVER_EMAIL=admin@ouvy.com

# Cloudinary (opcional agora)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=seu_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Sentry (opcional)
SENTRY_DSN=
```

**Gerar SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 2.6. Fazer deploy

```bash
# Commit dos arquivos de deploy
cd /Users/jairneto/Desktop/ouvy_saas

git add apps/backend/Procfile
git add apps/backend/runtime.txt
git add apps/backend/nixpacks.toml
git add apps/backend/deploy.sh
git add apps/backend/.env.local
git commit -m "feat: adicionar arquivos de deploy Railway"

# Push para trigger deploy
git push origin consolidate-monorepo
```

**Railway fará automaticamente:**
1. Detectar mudanças no GitHub
2. Build da aplicação (~3-5 min)
3. Executar migrations
4. Collect static files
5. Iniciar Gunicorn
6. Gerar URL pública

#### 2.7. Verificar deploy

```bash
# Obter URL do Railway
# Exemplo: https://ouvy-backend-production.up.railway.app

# Testar health check
curl https://SUA_URL.up.railway.app/api/health/

# Deve retornar algo como:
# {"status": "healthy", "database": "connected"}
```

#### 2.8. Verificar logs

```
No Railway Dashboard:
1. Clicar no service Backend
2. Aba "Deployments"
3. Clicar no último deploy
4. Ver logs em tempo real

Procurar por:
✅ "Starting Ouvy Backend Deploy..."
✅ "Running migrations..."
✅ "Migrations applied successfully"
✅ "Collecting static files..."
✅ "Starting Gunicorn server..."
```

---

### 3. DEPLOY FRONTEND - VERCEL (30 minutos)

#### 3.1. Preparar Next.js

```bash
cd /Users/jairneto/Desktop/ouvy_saas/apps/frontend

# Criar .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://SUA_URL_RAILWAY.up.railway.app
NEXT_PUBLIC_APP_URL=https://ouvy.vercel.app
EOF

# Criar vercel.json (se não existir)
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://SUA_URL_RAILWAY.up.railway.app"
  }
}
EOF
```

#### 3.2. Deploy Vercel

```bash
# Acesse: https://vercel.com/

1. Login with GitHub
2. "Add New..." > Project
3. Import Git Repository
4. Selecionar: ouvy-saas
5. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: apps/frontend
   - Build Command: npm run build (padrão)
   - Output Directory: .next (padrão)
6. Environment Variables:
   NEXT_PUBLIC_API_URL = https://SUA_URL_RAILWAY.up.railway.app
   NEXT_PUBLIC_APP_URL = https://ouvy.vercel.app
7. Deploy

Aguardar build (~3-5 minutos)
```

#### 3.3. Verificar deploy

```bash
# Vercel gera URL automaticamente
# Exemplo: https://ouvy-saas.vercel.app

# Testar no browser:
1. Abrir: https://sua-url.vercel.app
2. Verificar se página carrega
3. Tentar fazer login
4. Verificar DevTools > Network > Requests API
```

#### 3.4. Configurar domínio customizado (opcional)

```
Se tiver domínio próprio:

1. Vercel Dashboard > Settings > Domains
2. Add Domain: ouvy.com
3. Seguir instruções para adicionar DNS records
4. Aguardar propagação (~24h)
```

---

### 4. TESTAR FLUXO COMPLETO (30 minutos)

#### 4.1. Teste de convite em staging

**Criar tenant admin:**

```bash
# SSH no Railway (ou usar Railway CLI)
# OU usar Django admin via web

# Acessar: https://SUA_URL_RAILWAY.up.railway.app/admin/
# Login com superuser (criar primeiro se necessário)
```

**Criar superuser no Railway:**

```bash
# No Railway Dashboard:
1. Backend Service > Settings
2. "Custom Start Command" (temporário)
3. Adicionar: python manage.py createsuperuser
4. Deploy
5. Ver logs e seguir prompts
6. Voltar start command para: ./deploy.sh
```

**Testar API de convite:**

```bash
# 1. Login e obter token
curl -X POST https://SUA_URL_RAILWAY.up.railway.app/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@teste.com","password":"senha123"}'

# Copiar access token

# 2. Criar convite
curl -X POST https://SUA_URL_RAILWAY.up.railway.app/api/team/invitations/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@seudominio.com",
    "role": "MODERATOR",
    "personal_message": "Bem-vindo ao time!"
  }'

# 3. Verificar email recebido
# 4. Clicar no link do convite
# 5. Preencher cadastro
# 6. Verificar login automático
```

---

## 🔧 TROUBLESHOOTING

### Problema: Build falha no Railway

**Solução:**
```bash
# Verificar logs no Railway Dashboard
# Procurar por:
- Erro de dependência: adicionar no requirements.txt
- Erro de migração: verificar models.py
- Erro de variável: adicionar no Railway Variables
```

### Problema: Email não chega

**Solução:**
```bash
# 1. Verificar SendGrid API Key está correta
# 2. Verificar logs do Railway para erros de SMTP
# 3. Verificar caixa de spam
# 4. Verificar remetente (DEFAULT_FROM_EMAIL)
```

### Problema: Frontend não conecta com backend

**Solução:**
```bash
# 1. Verificar NEXT_PUBLIC_API_URL está correta
# 2. Verificar CORS_ALLOWED_ORIGINS no backend inclui domínio Vercel
# 3. Verificar ALLOWED_HOSTS no backend inclui .railway.app
# 4. Verificar Network tab no DevTools
```

### Problema: Database connection error

**Solução:**
```bash
# Railway geralmente conecta automaticamente
# Se erro persistir:
1. Verificar DATABASE_URL está presente nas variáveis
2. Verificar PostgreSQL service está running
3. Restart backend service
```

---

## ✅ CHECKLIST DE DEPLOY

### Pré-Deploy
- [x] Procfile criado
- [x] runtime.txt criado
- [x] nixpacks.toml criado
- [x] deploy.sh criado e executável
- [x] requirements.txt verificado
- [ ] .env.production criado (frontend)
- [ ] SendGrid configurado
- [ ] SECRET_KEY gerado

### Deploy Backend
- [ ] Projeto Railway criado
- [ ] PostgreSQL provisionado
- [ ] Redis provisionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] Migrations aplicadas
- [ ] Health check OK

### Deploy Frontend
- [ ] Projeto Vercel criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Página abre no browser
- [ ] API calls funcionam

### Testes
- [ ] Login funciona
- [ ] Criar feedback funciona
- [ ] Team management funciona
- [ ] Convite enviado por email
- [ ] Link de convite funciona
- [ ] Aceitar convite funciona
- [ ] Auto-login após aceitar OK

---

## 📞 SUPORTE

### Railway
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com/

### SendGrid
- Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Status: https://status.sendgrid.com/

---

**Data de criação:** 26/01/2026  
**Última atualização:** 26/01/2026  
**Autor:** GitHub Copilot  
**Status:** ✅ Backend pronto para deploy | ⏳ Frontend próximo passo
