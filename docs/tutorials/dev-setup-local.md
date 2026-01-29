# 📘 Tutorial: Setup Ambiente de Desenvolvimento Local

> **Tempo estimado:** 30 minutos  
> **Nível:** Iniciante  
> **Última atualização:** Janeiro 2026

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 15+ | [postgresql.org](https://www.postgresql.org/download/) |
| Redis | 7+ | [redis.io](https://redis.io/download/) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/downloads) |

### Verificar instalações

```bash
python --version    # Python 3.11.x
node --version      # v18.x ou superior
psql --version      # psql 15.x ou superior
redis-cli --version # redis-cli 7.x
git --version       # git 2.40+
```

---

## 🚀 Passo 1: Clone do Repositório (2 min)

```bash
# Clone o repositório
git clone https://github.com/jairguerraadv-sys/ouvy-saas.git
cd ouvy-saas

# Verificar estrutura
ls -la
# Deve mostrar: apps/, docs/, packages/, scripts/, etc.
```

---

## 🐍 Passo 2: Backend Setup (15 min)

### 2.1 Criar ambiente virtual

```bash
# Criar venv
python -m venv .venv

# Ativar (macOS/Linux)
source .venv/bin/activate

# Ativar (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Ativar (Windows CMD)
.venv\Scripts\activate.bat
```

> 💡 **Dica:** Você verá `(.venv)` no início do prompt quando o ambiente estiver ativado.

### 2.2 Instalar dependências

```bash
cd apps/backend
pip install --upgrade pip
pip install -r requirements.txt
```

> ⏱️ Isso pode levar 2-5 minutos dependendo da sua conexão.

### 2.3 Configurar banco de dados PostgreSQL

```bash
# Criar database (macOS/Linux)
createdb ouvy_dev

# Ou via psql
psql -U postgres -c "CREATE DATABASE ouvy_dev;"
```

### 2.4 Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env  # ou vim, code, etc.
```

**Conteúdo do `.env`:**

```bash
# =============================================================================
# OUVY SAAS - Configuração Local
# =============================================================================

# Database
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/ouvy_dev

# Redis
REDIS_URL=redis://localhost:6379/0

# Django
SECRET_KEY=dev-secret-key-minimo-50-caracteres-aqui-para-desenvolvimento-local
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (console para dev - não envia emails reais)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Stripe (Test Keys - obter em https://dashboard.stripe.com/test/apikeys)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (opcional para dev)
# SENDGRID_API_KEY=SG....

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2.5 Aplicar migrations

```bash
python manage.py migrate
```

Você verá output como:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, feedbacks, tenants...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

### 2.6 Criar superuser (admin)

```bash
python manage.py createsuperuser
```

Siga os prompts:
```
Email: admin@ouvy.local
Password: ********
Password (again): ********
Superuser created successfully.
```

### 2.7 Carregar dados de exemplo (opcional)

```bash
# Se existir fixture de demo
python manage.py loaddata fixtures/demo_data.json

# Ou criar dados via shell
python manage.py shell
```

```python
# No shell Django
from apps.tenants.models import Client
from django.utils import timezone
from datetime import timedelta

# Criar tenant de teste
client = Client.objects.create(
    nome='Empresa Demo',
    subdominio='demo',
    trial_end_date=timezone.now().date() + timedelta(days=14)
)
print(f"Tenant criado: {client.nome} ({client.subdominio})")
exit()
```

### 2.8 Rodar servidor backend

```bash
python manage.py runserver
```

✅ **Verificar:**
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/docs/

---

## ⚛️ Passo 3: Frontend Setup (10 min)

### 3.1 Instalar dependências

```bash
# Em outro terminal (mantenha o backend rodando)
cd apps/frontend
npm install
```

> ⏱️ Isso pode levar 2-3 minutos.

### 3.2 Configurar variáveis de ambiente

```bash
# Criar arquivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 3.3 Rodar servidor frontend

```bash
npm run dev
```

✅ **Verificar:** http://localhost:3000

---

## 🔄 Passo 4: Rodar Workers (Opcional)

Para funcionalidades assíncronas (emails, notificações):

### 4.1 Celery Worker (processamento de tasks)

```bash
# Terminal 3
cd apps/backend
celery -A config worker -l info
```

### 4.2 Celery Beat (tarefas agendadas)

```bash
# Terminal 4
cd apps/backend
celery -A config beat -l info
```

---

## 🧪 Passo 5: Rodar Testes

### Backend (pytest)

```bash
cd apps/backend

# Todos os testes
pytest

# Com verbose
pytest -v

# Com cobertura
pytest --cov=apps --cov-report=html

# Arquivo específico
pytest tests/test_feedbacks.py

# Teste específico
pytest tests/test_feedbacks.py::TestFeedbackAPI::test_create_feedback
```

### Frontend (Jest + Playwright)

```bash
cd apps/frontend

# Unit tests
npm test

# E2E tests
npx playwright install  # Primeira vez apenas
npx playwright test

# E2E com UI
npx playwright test --ui
```

---

## ✅ Checklist de Validação

| Item | Status | Como Verificar |
|------|--------|----------------|
| Backend rodando | ⬜ | Acessar http://localhost:8000 |
| Frontend rodando | ⬜ | Acessar http://localhost:3000 |
| Admin acessível | ⬜ | Login em http://localhost:8000/admin |
| API Docs visível | ⬜ | Acessar http://localhost:8000/api/docs |
| Login funciona | ⬜ | Criar conta e fazer login |
| Criar feedback | ⬜ | Submeter um feedback de teste |
| Celery rodando | ⬜ | Verificar logs do worker |
| Testes passando | ⬜ | Rodar `pytest` sem erros |

---

## 🐛 Troubleshooting

### ❌ Erro: "DATABASE_URL not set"

**Causa:** Arquivo `.env` não encontrado ou não na pasta correta.

**Solução:**
```bash
cd apps/backend
ls -la .env  # Verificar se existe
cat .env     # Verificar conteúdo
```

---

### ❌ Erro: "Port 8000 already in use"

**Causa:** Outra instância do servidor rodando.

**Solução:**
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

### ❌ Erro: "Module not found"

**Causa:** Dependências não instaladas ou venv não ativado.

**Solução:**
```bash
# Verificar venv ativo
which python  # Deve mostrar caminho com .venv

# Reinstalar dependências
pip install -r requirements.txt
```

---

### ❌ Erro: "CORS error" no frontend

**Causa:** Backend não está rodando ou URL incorreta.

**Solução:**
1. Verificar se backend está em http://localhost:8000
2. Verificar `NEXT_PUBLIC_API_URL` no `.env.local`
3. Verificar `CORS_ALLOWED_ORIGINS` no Django settings

---

### ❌ Erro: "Redis connection refused"

**Causa:** Redis não está rodando.

**Solução:**
```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7
```

---

### ❌ Erro: "PostgreSQL connection refused"

**Causa:** PostgreSQL não está rodando ou credenciais incorretas.

**Solução:**
```bash
# Verificar se está rodando
pg_isready

# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verificar conexão
psql -U postgres -d ouvy_dev -c "SELECT 1;"
```

---

## 📁 Estrutura do Projeto

```
ouvy-saas/
├── apps/
│   ├── backend/           # Django API
│   │   ├── apps/          # Django apps
│   │   │   ├── core/      # Utilitários compartilhados
│   │   │   ├── feedbacks/ # CRUD de feedbacks
│   │   │   ├── tenants/   # Multi-tenancy
│   │   │   ├── billing/   # Stripe integration
│   │   │   └── ...
│   │   ├── config/        # Django settings
│   │   ├── tests/         # Testes backend
│   │   └── manage.py
│   │
│   └── frontend/          # Next.js App
│       ├── app/           # App Router pages
│       ├── components/    # React components
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Utilities
│       └── ...
│
├── docs/                  # Documentação
├── packages/              # Monorepo packages compartilhados
├── scripts/               # Scripts de automação
└── ...
```

---

## 🔗 Próximos Passos

1. **[Tutorial: Adicionar Endpoint API](./add-api-endpoint.md)** - Como criar novos endpoints
2. **[Tutorial: Adicionar Página Frontend](./add-frontend-page.md)** - Como criar novas páginas
3. **[Tutorial: Guia de Testes](./testing-guide.md)** - Como escrever e rodar testes
4. **[Arquitetura](../ARCHITECTURE.md)** - Entender a arquitetura do projeto

---

## 📹 Vídeo Tutorial

> 🎥 **[Assistir no Loom](https://loom.com/share/xxx)** - 5 minutos de screencast

---

## 💬 Suporte

- **Issues:** [GitHub Issues](https://github.com/jairguerraadv-sys/ouvy-saas/issues)
- **Discussions:** [GitHub Discussions](https://github.com/jairguerraadv-sys/ouvy-saas/discussions)
- **Email:** dev@ouvy.com

---

*Última atualização: 29/01/2026*
