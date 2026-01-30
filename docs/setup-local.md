# 🚀 Setup Local - Ouvify SaaS

Este guia explica como configurar o ambiente de desenvolvimento local do Ouvify.

## 📋 Pré-requisitos

- **Node.js** 18+ (recomendado: 20.x LTS)
- **Python** 3.11+
- **PostgreSQL** 14+ (opcional em dev - SQLite disponível)
- **Redis** (opcional - para cache e Celery)
- **Git**

## 📁 Estrutura do Projeto

```
ouvy_saas/
├── apps/
│   ├── backend/     # Django REST Framework
│   └── frontend/    # Next.js 14+
├── packages/        # Shared packages (monorepo)
├── docs/           # Documentação
├── tests/          # Testes E2E
└── monitoring/     # Prometheus, Grafana
```

## 🔧 Configuração Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/jairguerraadv-sys/ouvy-saas.git
cd ouvy_saas
```

### 2. Configurar o Backend (Django)

```bash
# Entrar no diretório do backend
cd apps/backend

# Criar e ativar virtualenv (use apenas UM dos comandos abaixo)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Aplicar migrações (SQLite em dev por padrão)
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Criar tenant de teste
python manage.py shell
>>> from apps.tenants.models import Client
>>> Client.objects.create(nome="Empresa Teste", subdominio="teste", ativo=True)

# Iniciar servidor
python manage.py runserver
```

O backend estará disponível em: http://127.0.0.1:8000

### 3. Configurar o Frontend (Next.js)

```bash
# Em outro terminal, entrar no diretório do frontend
cd apps/frontend

# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local conforme necessário

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:3000

## 🔌 Conectando Frontend ao Backend

### Variáveis de Ambiente Importantes

**Backend (.env):**
```bash
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
TENANT_FALLBACK_ENABLED=True  # Usa tenant padrão em dev
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Testando a Conexão

1. Acesse http://localhost:3000/enviar
2. Envie um feedback de teste
3. Copie o protocolo gerado (ex: OUVY-XXXX-YYYY)
4. Acesse http://localhost:3000/acompanhar
5. Cole o protocolo e consulte

## 🗄️ Usando PostgreSQL (Recomendado)

### Instalar PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Criar Banco de Dados

```bash
# Acessar PostgreSQL
psql postgres

# Criar database e usuário
CREATE DATABASE ouvy_db;
CREATE USER ouvy_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE ouvy_db TO ouvy_user;
\q
```

### Configurar Django

**apps/backend/.env:**
```bash
DATABASE_URL=postgres://ouvy_user:sua_senha@localhost:5432/ouvy_db
```

```bash
# Aplicar migrações
python manage.py migrate
```

## 🔴 Usando Redis (Opcional)

### Instalar Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### Configurar Django

**apps/backend/.env:**
```bash
REDIS_URL=redis://localhost:6379/0
```

## 📝 Comandos Úteis

### Backend

```bash
# Rodar testes
pytest

# Verificar cobertura
pytest --cov=apps

# Lint Python
ruff check .

# Formatar código
black .

# Verificar tipos
mypy apps/

# Criar migrações
python manage.py makemigrations

# Shell interativo
python manage.py shell_plus  # requer django-extensions

# Documentação da API (Swagger)
# Acesse: http://127.0.0.1:8000/api/schema/swagger/
```

### Frontend

```bash
# Lint TypeScript/React
npm run lint

# Verificar tipos
npm run type-check

# Build de produção
npm run build

# Testes
npm run test

# Testes E2E (Playwright)
npm run test:e2e
```

## 🐛 Troubleshooting

### Erro: "Tenant não identificado"

**Causa:** Em desenvolvimento, o sistema tenta identificar o tenant pelo subdomínio ou header.

**Solução 1:** Use fallback de tenant:
```bash
# apps/backend/.env
TENANT_FALLBACK_ENABLED=True
```

**Solução 2:** Envie header X-Tenant-ID:
```javascript
// No frontend, adicione ao localStorage
localStorage.setItem('tenant_id', '1');
```

### Erro: "CORS blocked"

**Causa:** Frontend e backend em portas diferentes sem CORS configurado.

**Solução:**
```bash
# apps/backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=True
```

### Erro: "No module named 'apps.xxx'"

**Causa:** virtualenv não ativado ou path incorreto.

**Solução:**
```bash
source venv/bin/activate
pip install -e .  # Se houver setup.py
```

### Erro: "Port 8000 already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :8000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
python manage.py runserver 8001
```

## 📚 Próximos Passos

- [Guia de Contribuição](./CONTRIBUTING.md)
- [Arquitetura do Sistema](./ARCHITECTURE.md)
- [Deploy em Produção](./deploy-railway.md)
- [Manual do Admin](./admin-manual.md)

---

**Dúvidas?** Abra uma issue no GitHub ou consulte a documentação da API em `/api/schema/swagger/`.
