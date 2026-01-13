# 🚀 Deploy no Railway (Backend + Postgres)

## O Que é Railway?

Railway é uma plataforma moderna que:
- Cria banco de dados PostgreSQL automaticamente
- Deploy com um `git push`
- Gerencia variáveis de ambiente
- Escalas automaticamente
- Custa pouco para startups

---

## 📋 Pré-Requisitos

- [ ] Conta no Railway (railway.app)
- [ ] Git instalado e repositório criado
- [ ] Backend testado localmente
- [ ] Arquivo `.env` com todas as chaves

---

## 🔑 Passo 1: Crie uma Conta no Railway

Acesse: https://railway.app

1. Clique em "Sign Up"
2. Autentique com GitHub (recomendado)
3. Confirme email

---

## 📦 Passo 2: Prepare o Backend para Deploy

### 2.1 Crie um arquivo `Procfile` na raiz do projeto:

```bash
cat > /Users/jairneto/Desktop/ouvy_saas/Procfile << 'EOF'
web: cd ouvy_saas && python manage.py migrate && gunicorn config.wsgi
EOF
```

### 2.2 Instale o Gunicorn (servidor production):

```bash
cd /Users/jairneto/Desktop/ouvy_saas
/Users/jairneto/Desktop/ouvy_saas/venv/bin/pip install gunicorn
```

### 2.3 Atualize o `requirements.txt`:

```bash
cd /Users/jairneto/Desktop/ouvy_saas
/Users/jairneto/Desktop/ouvy_saas/venv/bin/pip freeze > requirements.txt
```

Verifique que inclui: `Django`, `djangorestframework`, `stripe`, `gunicorn`, etc.

---

## 🔧 Passo 3: Configure o Django para Production

Vá para `/ouvy_saas/config/settings.py` e faça essas alterações:

### 3.1 Adicione Railway à lista de hosts permitidos:

```python
# settings.py (procure por ALLOWED_HOSTS)
ALLOWED_HOSTS = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,.local,*.railway.app'  # Adicione *.railway.app
).split(',')
```

### 3.2 Desabilite debug em produção:

```python
# settings.py (já está lá, mas confirme)
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')
```

### 3.3 Atualize a configuração de banco de dados (já faz isso automaticamente, mas confirme):

```python
# settings.py (database config)
# Railway fornecerá DATABASE_URL automaticamente
# Django já lê a variável se estiver usando dj-database-url
```

### 3.4 Configure CORS para produção:

```python
# settings.py (procure por CORS)
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,https://yourdomain.vercel.app'  # Adicione Vercel
).split(',')
```

---

## 📝 Passo 4: Inicialize Git (se não tiver feito)

```bash
cd /Users/jairneto/Desktop/ouvy_saas

# Se não tiver .git ainda:
git init
git add .
git commit -m "Initial commit - SaaS with Stripe"

# Se já tiver, só faça:
git add .
git commit -m "Prepare for Railway deployment"
```

---

## 🚀 Passo 5: Deploy no Railway

### 5.1 Instale a CLI do Railway:

```bash
# macOS
brew install railway

# Ou: npm install -g @railway/cli
```

### 5.2 Autentique:

```bash
railway login
```

Vai abrir o navegador. Autentique com sua conta Railway.

### 5.3 Crie um novo projeto:

```bash
cd /Users/jairneto/Desktop/ouvy_saas
railway init
```

Escolha um nome para o projeto (ex: `ouvy-saas-backend`).

### 5.4 Adicione um PostgreSQL (banco de dados):

```bash
railway add
```

Escolha `postgresql` na lista. Railway vai criar um banco automaticamente.

### 5.5 Defina as variáveis de ambiente:

```bash
railway variables set DEBUG=False
railway variables set SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
railway variables set STRIPE_PUBLIC_KEY=pk_test_...
railway variables set STRIPE_SECRET_KEY=sk_test_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_test_...
railway variables set BASE_URL=https://seu-domain.vercel.app  # Será o frontend
railway variables set CORS_ALLOWED_ORIGINS=https://seu-domain.vercel.app
```

### 5.6 Deploy:

```bash
cd /Users/jairneto/Desktop/ouvy_saas
git push railway main
```

Wait for the build to complete. You should see:

```
✓ Deployed to: https://your-service.railway.app
```

---

## ✅ Validação do Deploy

1. Acesse: `https://your-service.railway.app/api/tenant-info/`
2. Você deve receber um JSON com informações do tenant (ou um erro de tenant não encontrado, que é normal)

---

## 🐛 Troubleshooting no Railway

### ❌ "Connection refused to database"
Railway pode levar alguns minutos para criar o banco. Espere 2-3 minutos e redeploy.

### ❌ "Invalid DATABASE_URL"
Railway injeta `DATABASE_URL` automaticamente. Se não funcionar:
```bash
railway variables set DATABASE_URL=postgresql://...
```

### ❌ "Static files not found"
Django admin pode não ter CSS. Execute:
```bash
# No seu repositório local:
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
/Users/jairneto/Desktop/ouvy_saas/venv/bin/python manage.py collectstatic --noinput
git add .
git commit -m "Add static files"
git push railway main
```

---

## 📍 Próximo Passo: Frontend no Vercel

Seu backend está no ar! Agora deploy do frontend na Vercel.

Quer o guia?
