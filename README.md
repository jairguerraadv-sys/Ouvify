# 🎯 Ouvify - White Label SaaS de Canal de Feedback

<div align="center">

![Ouvify Logo](https://via.placeholder.com/400x100/4F46E5/FFFFFF?text=OUVIFY)

**Plataforma SaaS de canal de feedback para empresas**  
Denúncias • Reclamações • Sugest • Elogios • Rastreamento por Protocolo

[![Deploy Backend](https://img.shields.io/badge/deploy-Render-46E3B7?logo=render)](https://ouvify-backend.onrender.com)
[![Deploy Frontend](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)](https://ouvify.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/license-Proprietário-red)](LICENSE)

</div>

---

## 📚 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Local](#instalação-local)
  - [Backend (Django)](#backend-django)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Docker Compose](#docker-compose)
- [Configuração](#configuração)
- [Testes](#testes)
- [Deploy](#deploy)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**Ouvify** é uma plataforma SaaS White Label que permite empresas gerenciarem canais de feedback de usuários (denúncias, reclamações, sugestões, elogios) com:

- ✅ **Multi-tenancy:** Cada cliente tem sua instância isolada
- ✅ **Rastreamento:** Código de protocolo único para acompanhamento
- ✅ **Anonimato:** Feedbacks podem ser enviados sem identificação
- ✅ **Gestão de Equipe:** Múltiplos usuários por empresa com permissões
- ✅ **Analytics:** Dashboard com métricas e gráficos em tempo real
- ✅ **Webhooks:** Integrações com sistemas externos
- ✅ **LGPD/GDPR:** Conformidade total com leis de proteção de dados

### Casos de Uso

- 🏢 **Empresas:** Canal de denúncias interno (compliance)
- 🏛️ **Órgãos Públicos:** Ouvidoria digital
- 🏫 **Instituições de Ensino:** Feedback de alunos e professores
- 🏥 **Saúde:** Reclamações e sugestões de pacientes
- 🛒 **E-commerce:** SAC 2.0 com rastreamento

---

## ⚡ Funcionalidades Principais

### 🎫 Sistema de Feedback
- [x] Criação de feedback (público/anônimo)
- [x] Tipos: Denúncia, Reclamação, Sugestão, Elogio
- [x] Protocolo único de rastreamento (ex: `OUV-2026-0001`)
- [x] Upload de arquivos/imagens (Cloudinary)
- [x] Histórico de interações (timeline)
- [x] Status: Novo, Em Análise, Resolvido, Arquivado
- [x] Atribuição para membros da equipe
- [x] Tags de categorização
- [x] Prioridades (Baixa, Média, Alta, Urgente)
- [x] Busca e filtros avançados

### 👥 Multi-Tenancy & Team Management
- [x] Registro self-service de empresas
- [x] Subdomínio personalizado (`empresa.ouvify.com`)
- [x] Branding customizado (logo, cores)
- [x] Gestão de equipe (owner, admin, viewer)
- [x] Convites por email com tokens
- [x] Isolamento total de dados entre tenants

### 🔐 Autenticação & Segurança
- [x] JWT (JSON Web Tokens) com blacklist
- [x] Refresh token rotation automático
- [x] 2FA (Two-Factor Authentication)
- [x] Rate limiting (anti-brute force)
- [x] CORS configurado
- [x] CSRF protection
- [x] Content Security Policy (CSP)
- [x] Sanitização de inputs (XSS prevention)
- [x] Audit Log completo

### 📊 Analytics & Relatórios
- [x] Dashboard com métricas em tempo real
- [x] Gráficos interativos (Recharts)
- [x] Exportação CSV
- [ ] Exportação PDF (em desenvolvimento)
- [x] Filtros por data, tipo, status
- [x] Tempo médio de resolução
- [x] Taxa de resposta

### 💳 Billing (Stripe)
- [x] Planos: Starter, Pro, Enterprise
- [x] Checkout Stripe integrado
- [x] Webhook para status de pagamento
- [x] Upgrade/downgrade de plano
- [x] Portal do cliente Stripe
- [x] Histórico de faturas

### 🔗 Webhooks & Integrações
- [x] CRUD de endpoints webhook
- [x] Eventos: `feedback.created`, `feedback.updated`, `feedback.resolved`
- [x] Retry automático com exponential backoff
- [x] Logs de entrega
- [x] Validação de assinatura

### 📱 Notificações
- [x] Push Notifications (Service Worker)
- [x] Email transacional (SendGrid)
- [x] Preferências por canal e tipo
- [x] Templates customizáveis

### 🛡️ LGPD/GDPR
- [x] Gestão de consentimentos versionados
- [x] Exportação de dados pessoais (JSON/CSV)
- [x] Direito ao esquecimento (delete account)
- [x] Anonimização de IPs
- [x] Audit log de acessos
- [x] Política de Privacidade e Termos de Uso

---

## 🛠️ Tecnologias

### Backend
- **Python 3.13**
- **Django 5.1.15** (Web framework)
- **Django REST Framework 3.15.2** (API REST)
- **PostgreSQL 16** (Database)
- **Redis 7.1** (Cache + Celery)
- **Celery 5.6** (Task queue)
- **JWT** (djangorestframework-simplejwt)
- **Stripe SDK** (Payments)
- **Cloudinary** (File storage)
- **Bleach** (Sanitização HTML)
- **Sentry** (Error monitoring)

### Frontend
- **Next.js 16.1** (React framework)
- **React 19.2** (UI library)
- **TypeScript 5** (Type safety)
- **TailwindCSS 3.4** (Styling)
- **Axios 1.13** (HTTP client)
- **Recharts 3.7** (Charts)
- **Radix UI** (Headless components)
- **Lucide React** (Icons)
- **SWR 2.3** (Data fetching)

### Infrastructure
- **Render** (Backend hosting)
- **Vercel** (Frontend hosting)
- **Railway** (PostgreSQL + Redis)
- **Cloudinary** (CDN + storage)
- **SendGrid** (Emails)
- **Sentry** (Monitoring)

### DevOps
- **Docker** (Containerization)
- **Docker Compose** (Local dev)
- **Nginx** (Reverse proxy)
- **Prometheus + Grafana** (Monitoring - configurado, não deployado)

---

## 🏗️ Arquitetura

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                          USUÁRIOS                                │
│  (Cidadãos, Empresas, Administradores)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    ┌────▼─────┐          ┌────▼─────┐
    │ Frontend │          │ Frontend │
    │ Vercel   │          │ Mobile   │
    │ (Next.js)│          │ (PWA)    │
    └────┬─────┘          └────┬─────┘
         │                     │
         └──────────┬──────────┘
                    │ HTTPS/JWT
         ┌──────────▼──────────┐
         │   Backend - Render   │
         │   Django + DRF       │
         │  ┌─────────────────┐│
         │  │ Multi-Tenancy   ││
         │  │ Middleware      ││
         │  └─────────────────┘│
         │  ┌─────────────────┐│
         │  │ Apps Django     ││
         │  │ • tenants       ││
         │  │ • feedbacks     ││
         │  │ • billing       ││
         │  │ • webhooks      ││
         │  │ • notifications ││
         │  └─────────────────┘│
         └──┬───────────┬──────┘
            │           │
   ┌────────▼───┐  ┌───▼────────┐
   │ PostgreSQL │  │   Redis    │
   │  (Railway) │  │ (Railway)  │
   │            │  │ Cache +    │
   │ • Dados    │  │ Celery     │
   │ • Users    │  └────────────┘
   │ • Tenants  │
   └────────────┘
            │
   ┌────────▼───────────────────────────┐
   │   Serviços Externos                │
   │  • Cloudinary (Files)              │
   │  • Stripe (Payments)               │
   │  • SendGrid (Emails)               │
   │  • Sentry (Monitoring)             │
   └────────────────────────────────────┘
```

**Mais detalhes:** Veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📋 Pré-requisitos

### Para Desenvolvimento Local

- **Python 3.13+** ([Download](https://www.python.org/downloads/))
- **Node.js 20+** e **npm** ([Download](https://nodejs.org/))
- **PostgreSQL 16+** ([Download](https://www.postgresql.org/download/))
- **Redis 7+** ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Contas Externas (Opcional para features completas)

- [Stripe](https://stripe.com/) - Pagamentos (use test keys em dev)
- [Cloudinary](https://cloudinary.com/) - Upload de arquivos
- [SendGrid](https://sendgrid.com/) - Emails transacionais
- [Sentry](https://sentry.io/) - Monitoring de erros

---

## 🚀 Instalação Local

### Opção 1: Setup Manual

#### Backend (Django)

```bash
# 1. Clone o repositório
git clone https://github.com/jairguerraadv-sys/Ouvify.git
cd Ouvify/apps/backend

# 2. Crie ambiente virtual Python
python3.13 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 3. Instale dependências
pip install -r requirements/dev.txt

# 4. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 5. Execute migrações
python manage.py migrate

# 6. Crie superusuário
python manage.py createsuperuser

# 7. (Opcional) Carregue dados de exemplo
python manage.py loaddata fixtures/initial_data.json

# 8. Inicie o servidor
python manage.py runserver
```

Backend rodando em: **http://127.0.0.1:8000**

#### Frontend (Next.js)

```bash
# 1. Entre na pasta frontend
cd apps/frontend

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua API URL

# 4. Inicie servidor de desenvolvimento
npm run dev
```

Frontend rodando em: **http://localhost:3000**

### Opção 2: Docker Compose

```bash
# Clone e entre no diretório
git clone https://github.com/jairguerraadv-sys/Ouvify.git
cd Ouvify

# Configure environment
cp .env.example .env
# Edite .env conforme necessário

# Build e inicie containers
docker-compose up --build

# Em outro terminal, execute migrações
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

**Serviços disponíveis:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/painel-admin-ouvify-2026/
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## ⚙️ Configuração

### Variáveis de Ambiente - Backend

Crie `/apps/backend/.env` baseado em `.env.example`:

```bash
# Django Core
SECRET_KEY=seu-secret-key-aqui-gere-um-novo
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (desenvolvimento local usa SQLite, produção PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/ouvify_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=seu-jwt-secret-diferente-do-secret-key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
# EMAIL_HOST_USER=seu-email@sendgrid.net
# EMAIL_HOST_PASSWORD=sua-senha

# Sentry
SENTRY_DSN=https://...@sentry.io/...
```

### Variáveis de Ambiente - Frontend

Crie `/apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## 🧪 Testes

### Backend (Python + pytest)

```bash
cd apps/backend

# Rodar todos os testes
pytest

# Com cobertura
pytest --cov=apps --cov-report=html

# Teste específico
pytest apps/feedbacks/tests/test_views.py

# Testes de performance (N+1 queries)
pytest apps/feedbacks/tests/test_performance.py -v
```

### Frontend (Jest + React Testing Library)

```bash
cd apps/frontend

# Rodar todos os testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Testes E2E (Playwright)

```bash
cd apps/frontend

# Instalar Playwright browsers (primeira vez)
npx playwright install

# Rodar testes E2E
npm run test:e2e

# Com UI interativa
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Load Testing (Locust)

```bash
cd apps/backend
locust -f locustfile.py --host=http://localhost:8000
```

Acesse: http://localhost:8089

---

## 🔍 Auditoria do Backend

Para executar auditoria determinística do backend (verifica configuração, dependências, imports e testes):

```bash
# Via Makefile (recomendado)
make audit-backend

# Ou diretamente
bash scripts/audit_backend.sh
```

**O que é verificado:**
- ✅ Criação/ativação de virtualenv
- ✅ Instalação de dependências (requirements/test.txt)
- ✅ Django system check (configurações básicas)
- ✅ Coleta de testes com pytest (sem executar)
- ✅ Verificação de imports Python (AST parsing)

**Resultados:** `audit-reports/backend/`

Para mais detalhes, consulte: [docs/BACKEND_AUDIT.md](docs/BACKEND_AUDIT.md)

---
# Instalar Locust
pip install locust

# Rodar testes de carga
locust -f locustfile.py --host=http://localhost:8000

# Acesse UI: http://localhost:8089
```

---

## 🚢 Deploy

### Backend - Render

1. **Criar conta no [Render](https://render.com/)**

2. **Criar PostgreSQL database:**
   - Dashboard > New > PostgreSQL
   - Copiar `DATABASE_URL` e `DATABASE_PRIVATE_URL`

3. **Criar Redis instance:**
   - Dashboard > New > Redis
   - Copiar `REDIS_URL`

4. **Criar Web Service:**
   ```yaml
   # render.yaml já configurado
   - type: web
     name: ouvify-backend
     env: python
     buildCommand: pip install -r requirements/prod.txt && python manage.py collectstatic --noinput && python manage.py migrate
     startCommand: gunicorn config.wsgi:application
     envVars:
       - key: SECRET_KEY
         generateValue: true
       - key: DEBUG
         value: False
       - key: DATABASE_PRIVATE_URL
         fromDatabase: 
           name: ouvify-db
           property: connectionString
   ```

5. **Conectar repositório GitHub** e fazer deploy automático

### Frontend - Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd apps/frontend
   vercel
   ```

3. **Configurar variáveis de ambiente** no dashboard Vercel:
   - `NEXT_PUBLIC_API_URL` = sua URL do Render
   - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
   - etc.

4. **Deploy automático** configurado via GitHub integration

**URLs de Produção:**
- Backend: https://ouvify-backend.onrender.com
- Frontend: https://ouvify.vercel.app

---

## 📖 Documentação

### Documentação Técnica

- [📐 ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [🔌 API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - Referência completa da API
- [👤 USER_GUIDE.md](docs/USER_GUIDE.md) - Guia do usuário final
- [⚙️ ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) - Guia de administração
- [🔒 SECURITY.md](docs/SECURITY.md) - Políticas de segurança
- [❓ TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Solução de problemas comuns
- [📊 AUDIT_COMPLETE_2026-02-05.md](docs/AUDIT_COMPLETE_2026-02-05.md) - Relatório de auditoria completo

### API Documentation (Swagger/OpenAPI)

Acesse a documentação interativa da API:

**Desenvolvimento:** http://127.0.0.1:8000/api/schema/swagger/  
**Produção:** https://ouvify-backend.onrender.com/api/schema/swagger/

---

## 🤝 Contribuindo

Este é um projeto proprietário. Contribuições são bem-vindas de membros autorizados da equipe.

### Workflow

1. **Clone o repositório**
2. **Crie uma branch:** `git checkout -b feature/nova-funcionalidade`
3. **Commit suas mudanças:** `git commit -m 'feat: adiciona nova funcionalidade'`
4. **Push para o repositório:** `git push origin feature/nova-funcionalidade`
5. **Abra um Pull Request**

### Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona novo recurso
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas gerais
```

---

## 📞 Suporte

### Canais de Suporte

- **Documentação:** [docs/README.md](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/jairguerraadv-sys/Ouvify/issues)
- **Email:** (Definir email de suporte)

### FAQ

**P: Como resetar minha senha?**  
R: Use a página `/recuperar-senha` ou endpoint `POST /api/password-reset/request/`

**P: Como adicionar um novo membro à equipe?**  
R: Dashboard > Equipe > Convidar Membro

**P: Como exportar meus dados (LGPD)?**  
R: Dashboard > Perfil > Exportar Dados ou `GET /api/export-data/`

---

## 📄 Licença

Copyright © 2026 Ouvify. Todos os direitos reservados.

Este software é proprietário e confidencial. Uso não autorizado é estritamente proibido.

---

## 🙏 Agradecimentos

- Django & DRF Community
- Next.js & Vercel Team
- Todos os contribuidores e beta testers

---

<div align="center">

**Feito com ❤️ pelo time Ouvify**

[🌐 Website](https://ouvify.vercel.app) • [📚 Docs](docs/README.md) • [🐛 Report Bug](https://github.com/jairguerraadv-sys/Ouvify/issues)

</div>
