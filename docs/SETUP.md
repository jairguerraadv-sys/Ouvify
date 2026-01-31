# 🛠️ Guia de Setup do Ambiente - Ouvify

Este guia mostra como configurar o ambiente de desenvolvimento local do Ouvify.

---

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Verificar |
|----------|---------------|-----------|
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Python | 3.11.0 | `python --version` |
| PostgreSQL | 16.0 | `psql --version` |
| Redis | 7.0 | `redis-cli --version` |
| Git | 2.30 | `git --version` |

### macOS

```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install node@18 python@3.11 postgresql@16 redis git

# Iniciar serviços
brew services start postgresql@16
brew services start redis
```

### Ubuntu/Debian

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# PostgreSQL 16
sudo apt-get install -y postgresql-16

# Redis
sudo apt-get install -y redis-server
sudo systemctl enable redis-server

# Git
sudo apt-get install -y git
```

### Windows (WSL2)

Recomendamos usar WSL2 com Ubuntu. Siga as instruções do Ubuntu acima dentro do WSL2.

---

## 1. Clone do Repositório

```bash
# Clone via SSH (recomendado)
git clone git@github.com:jairguerraadv-sys/ouvify.git

# Ou via HTTPS
git clone https://github.com/jairguerraadv-sys/ouvify.git

cd ouvify
```

---

## 2. Configuração do Backend

### 2.1 Ambiente Virtual Python

```bash
cd apps/backend

# Criar ambiente virtual
python3.11 -m venv venv

# Ativar ambiente virtual
# macOS/Linux:
source venv/bin/activate

# Windows:
# .\venv\Scripts\activate

# Verificar
which python  # Deve mostrar caminho do venv
```

### 2.2 Instalar Dependências

```bash
# Instalar requirements
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.3 Configurar Variáveis de Ambiente

```bash
# Copiar exemplo de .env
cp ../../.env.example .env

# OU usar o .env da raiz do monorepo
ln -s ../../.env .env
```

Edite o arquivo `.env`:

```dotenv
# DJANGO CORE
SECRET_KEY=sua-chave-secreta-aqui-gere-uma-nova
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# DATABASE (desenvolvimento local - SQLite)
# Deixe DATABASE_URL vazio para usar SQLite
DATABASE_URL=

# Ou use PostgreSQL local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ouvify_dev

# REDIS (desenvolvimento local)
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=jwt-secret-dev-only
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# CORS (frontend local)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# EMAIL (console em dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# STRIPE (modo teste)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CLOUDINARY (opcional em dev)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2.4 Criar Banco de Dados

**Opção 1: SQLite (mais simples para dev)**

O Django cria automaticamente o `db.sqlite3` na primeira migração.

**Opção 2: PostgreSQL local**

```bash
# Criar banco
createdb ouvify_dev

# Ou via psql
psql -U postgres -c "CREATE DATABASE ouvify_dev;"
```

### 2.5 Executar Migrações

```bash
# Aplicar migrações
python manage.py migrate

# Criar superusuário (admin)
python manage.py createsuperuser
# Email: admin@ouvify.local
# Senha: admin123 (apenas em dev!)
```

### 2.6 Dados de Teste (Opcional)

```bash
# Criar tenant de teste
python manage.py shell << 'EOF'
from django.contrib.auth.models import User
from apps.tenants.models import Client, TeamMember

# Criar cliente de teste
client = Client.objects.create(
    nome='Empresa Teste',
    subdominio='teste',
    plano='pro'
)

# Associar admin ao tenant
admin = User.objects.get(is_superuser=True)
client.owner = admin
client.save()

# Criar TeamMember
TeamMember.objects.create(
    user=admin,
    client=client,
    role='OWNER',
    status='ACTIVE'
)

print(f"Tenant criado: {client.nome} ({client.subdominio})")
print(f"Tenant ID: {client.id}")
EOF
```

### 2.7 Iniciar Servidor

```bash
# Servidor de desenvolvimento
python manage.py runserver

# Acessar:
# - API: http://localhost:8000/
# - Admin: http://localhost:8000/painel-admin-ouvy-2026/
# - Swagger: http://localhost:8000/docs/swagger/
```

---

## 3. Configuração do Frontend

### 3.1 Instalar Dependências

```bash
cd apps/frontend

# Instalar pacotes
npm install
```

### 3.2 Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env.local
```

Edite `.env.local`:

```dotenv
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Site URL (para SEO)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (public key)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Sentry (opcional em dev)
NEXT_PUBLIC_SENTRY_DSN=
```

### 3.3 Iniciar Servidor de Desenvolvimento

```bash
# Iniciar Next.js
npm run dev

# Acessar:
# - Frontend: http://localhost:3000
# - Login: http://localhost:3000/login
# - Dashboard: http://localhost:3000/dashboard
```

---

## 4. Configuração do Celery (Opcional)

Para processar tarefas assíncronas (emails, webhooks, etc.):

```bash
# Terminal 1: Redis (se não estiver rodando)
redis-server

# Terminal 2: Celery Worker
cd apps/backend
source venv/bin/activate
celery -A config worker --loglevel=info

# Terminal 3: Celery Beat (agendamento)
celery -A config beat --loglevel=info
```

---

## 5. Executar Testes

### Backend (pytest)

```bash
cd apps/backend
source venv/bin/activate

# Todos os testes
pytest

# Com cobertura
pytest --cov=apps --cov-report=html

# Testes específicos
pytest apps/feedbacks/tests/
pytest apps/tenants/tests/test_jwt_auth.py -v
```

### Frontend (Jest)

```bash
cd apps/frontend

# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### E2E (Playwright)

```bash
cd apps/frontend

# Instalar browsers
npx playwright install

# Executar testes E2E
npm run test:e2e

# Com interface gráfica
npm run test:e2e:ui

# Modo debug
npm run test:e2e:debug
```

---

## 6. Comandos Úteis

### Monorepo (raiz)

```bash
# Dev completo (frontend + backend)
npm run dev

# Build produção
npm run build

# Lint completo
npm run lint

# Testes completos
npm run test
```

### Backend

```bash
# Criar nova migração
python manage.py makemigrations <app_name>

# Shell Django
python manage.py shell

# Verificar deployment
python manage.py check --deploy

# Coletar estáticos
python manage.py collectstatic
```

### Frontend

```bash
# Análise de bundle
npm run analyze

# Lint com fix
npm run lint -- --fix

# Type check
npm run type-check
```

---

## 7. Configuração de IDEs

### VS Code

Extensões recomendadas:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Settings recomendados (`.vscode/settings.json`):

```json
{
  "python.defaultInterpreterPath": "./apps/backend/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### PyCharm

1. Abra o projeto
2. Configure o interpretador Python: `apps/backend/venv/bin/python`
3. Marque `apps/backend` como Sources Root
4. Configure pytest como test runner

---

## 8. Troubleshooting

### Erro: "Module not found"

```bash
# Reinstalar dependências
cd apps/backend
pip install -r requirements.txt --force-reinstall

cd ../frontend
rm -rf node_modules
npm install
```

### Erro: "Port already in use"

```bash
# Encontrar processo na porta
lsof -i :8000  # backend
lsof -i :3000  # frontend

# Matar processo
kill -9 <PID>
```

### Erro: "Database connection failed"

```bash
# Verificar PostgreSQL
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Verificar conexão
psql -U postgres -c "SELECT 1"
```

### Erro: "Redis connection refused"

```bash
# Verificar Redis
redis-cli ping  # Deve retornar PONG

# Iniciar Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Erro de CORS

Verifique se `CORS_ALLOWED_ORIGINS` no `.env` inclui a URL do frontend:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Erro de Token JWT

```bash
# Limpar tokens inválidos
python manage.py shell
>>> from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
>>> OutstandingToken.objects.all().delete()
```

---

## 9. Próximos Passos

1. ✅ Ambiente configurado
2. Leia a [documentação da API](./API.md)
3. Entenda a [arquitetura](./ARCHITECTURE.md)
4. Configure o [deploy](./DEPLOYMENT.md)

---

*Última atualização: 31/01/2026*
