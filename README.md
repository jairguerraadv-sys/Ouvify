# 🎯 Ouvify - Enterprise White-Label Feedback Platform

<div align="center">

![Ouvify Logo](https://via.placeholder.com/400x100/6366F1/FFFFFF?text=OUVIFY)

**🏆 Release Candidate 1.0 - Production Ready**

**Enterprise-grade SaaS platform for customer feedback management**  
Whistleblowing • Complaints • Suggestions • Testimonials • Protocol Tracking

[![Deploy Backend](https://img.shields.io/badge/deploy-Render-46E3B7?logo=render&logoColor=white)](https://ouvify-backend.onrender.com)
[![Deploy Frontend](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)](https://ouvify.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/UI-Shadcn%20%2B%20Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Design System](https://img.shields.io/badge/Design%20System-v3.0-6366F1?logo=figma&logoColor=white)](docs/DESIGN_SYSTEM.md)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

**🚀 Status:** Production Ready | **📅 Release Date:** February 6, 2026

</div>

---

## 📚 Table of Contents

- [🎯 About](#-about)
- [✨ Key Features](#-key-features)
- [🎨 Identidade Visual & Design System](#-identidade-visual--design-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
  - [Docker Compose (Recommended)](#docker-compose-recommended)
  - [Manual Setup](#manual-setup)
- [📖 Documentation](#-documentation)
- [🔒 Security & Compliance](#-security--compliance)
- [💳 Billing & Plans](#-billing--plans)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)
- [📄 License](#-license)

---

## 🎯 About

**Ouvify** is a production-ready, enterprise-grade **White-Label SaaS platform** designed to empower organizations with a comprehensive feedback management system. Built with modern technologies and security best practices, Ouvify enables companies to collect, manage, and analyze customer feedback while maintaining complete brand control and data privacy.

### 🌟 What Makes Ouvify Different

- 🏢 **True Multi-Tenancy**: Complete data isolation with custom subdomains per tenant
- 🎨 **Full White-Label**: Custom logo, colors, and branding on all public pages
- 🔐 **Enterprise Security**: 2FA/MFA, audit logs, JWT with rotation, rate limiting
- ⚖️ **LGPD/GDPR Ready**: Consent management, data export, right to deletion
- 💳 **Monetization Built-in**: Stripe integration with tiered pricing (Starter/Pro/Enterprise)
- 🎓 **User Onboarding**: Interactive checklist and guided tour for new clients
- 📊 **Advanced Analytics**: Real-time dashboards with Recharts visualization
- 🔗 **Webhooks & Integrations**: RESTful API + customizable webhooks
- 🌐 **Anonymous Feedback**: Protocol-based tracking without user identification
- 📱 **PWA Ready**: Mobile-first responsive design with offline support

### 🎯 Use Cases

| Industry | Use Case |
|----------|----------|
| 🏢 **Corporate** | Internal whistleblowing channel (SOX/compliance) |
| 🏛️ **Government** | Digital ombudsman services |
| 🏫 **Education** | Student/faculty feedback systems |
| 🏥 **Healthcare** | Patient complaint management (HIPAA-friendly) |
| 🛒 **E-commerce** | Customer service 2.0 with protocol tracking |
| 🏦 **Financial** | Regulatory compliance feedback channels |

---

## ✨ Key Features

### 🔐 Security & Authentication (Phase 3)
- ✅ **Two-Factor Authentication (2FA/MFA)**: TOTP-based with QR codes, backup codes, and recovery options
- ✅ **JWT with Blacklist**: Secure token-based authentication with refresh rotation
- ✅ **Rate Limiting**: Brute-force protection on login and sensitive endpoints
- ✅ **Audit Logging**: Complete system activity tracking (20+ action types, 4 severity levels)
- ✅ **Content Security Policy (CSP)**: XSS and injection prevention
- ✅ **CORS & CSRF**: Cross-site request protection
- ✅ **Password Security**: Bcrypt hashing, complexity requirements, breach detection

### ⚖️ Privacy & Compliance (Phase 3)
- ✅ **LGPD/GDPR Compliance**: Full compliance with data protection regulations
- ✅ **Consent Management**: Versioned consent tracking (terms, privacy, marketing)
- ✅ **ConsentGate**: Blocking modal for mandatory consent acceptance
- ✅ **Anonymous Feedback**: Protocol-based tracking without PII collection
- ✅ **Data Export**: JSON/CSV export of personal data
- ✅ **Right to Deletion**: Account deletion with data anonymization
- ✅ **Consent Audit Trail**: Complete log of consent actions

### 🎨 White-Label & Branding (Phase 2)
- ✅ **Custom Branding**: Logo, primary/secondary colors, custom fonts
- ✅ **Favicon Customization**: Per-tenant favicon support
- ✅ **Custom Subdomains**: `client.ouvify.com` isolated routing
- ✅ **Public Page Theming**: Branded feedback submission pages
- ✅ **Email Templates**: Branded transactional emails
- ✅ **Preview System**: Real-time branding preview before saving

### 💳 Billing & Monetization (Phase 2)
- ✅ **Stripe Integration**: Checkout, subscriptions, webhook handling
- ✅ **Tiered Pricing**: Starter (Free), Pro ($49/mo), Enterprise ($199/mo)
- ✅ **Feature Gating**: Dynamic feature access by plan (storage, team size, advanced features)
- ✅ **Usage Limits**: Automatic enforcement of plan limits
- ✅ **Customer Portal**: Stripe-hosted billing management
- ✅ **Upgrade/Downgrade**: Seamless plan transitions with prorated billing

### 🎓 User Experience (Phase 4)
- ✅ **Onboarding Checklist**: 4-step interactive setup (Brand, Tags, Feedback, Team)
- ✅ **Progress Tracking**: Visual progress bar (0-100%) with auto-dismiss
- ✅ **Guided Tour**: Driver.js-powered interactive walkthrough
- ✅ **localStorage Persistence**: User preferences and dismissed states
- ✅ **Mobile-First Design**: Responsive UI with TailwindCSS
- ✅ **Dark Mode Support**: System-aware theme switching

### 📊 Analytics & Reporting (Phase 4)
- ✅ **Audit Log Dashboard**: Filterable table with 13+ fields (user, action, IP, severity)
- ✅ **Security Alerts**: Real-time monitoring of failed logins and MFA events
- ✅ **Analytics Dashboard**: Time series, action breakdown, severity distribution
- ✅ **Export Capabilities**: CSV export with custom filters
- ✅ **Real-Time Metrics**: SWR-powered caching for performance
- ✅ **Tenant Isolation**: Users see only their tenant's data

### 🎫 Feedback Management (Core)
- ✅ **Protocol Tracking**: Unique codes (e.g., `OUVY-2026-0001`)
- ✅ **4 Feedback Types**: Whistleblowing, Complaint, Suggestion, Testimonial
- ✅ **Status Workflow**: New → In Review → Resolved → Archived
- ✅ **Priority Levels**: Low, Medium, High, Urgent
- ✅ **File Attachments**: Cloudinary integration for images/documents
- ✅ **Timeline History**: Complete interaction audit trail
- ✅ **Team Assignment**: Assign feedbacks to specific team members
- ✅ **Tags & Categories**: Flexible categorization system
- ✅ **Advanced Search**: Full-text search with filters

### 👥 Team & Collaboration
- ✅ **Role-Based Access**: Owner, Admin, Viewer
- ✅ **Email Invitations**: Token-based team invites
- ✅ **Activity Tracking**: Per-user action logs
- ✅ **Team Limits by Plan**: Starter (3), Pro (10), Enterprise (Unlimited)

### 🔗 Integrations
- ✅ **RESTful API**: Complete Django REST Framework API
- ✅ **Webhooks**: Custom endpoints with retry logic
- ✅ **Event Types**: `feedback.created`, `feedback.updated`, `feedback.resolved`
- ✅ **Signature Validation**: HMAC-based webhook security
- ✅ **Delivery Logs**: Complete webhook attempt history

---

## 🎨 Identidade Visual & Design System

**Ouvify passou por um rebrand completo para atingir o nível Modern SaaS profissional.** O design system foi completamente redesenhado seguindo as melhores práticas de acessibilidade (WCAG AA/AAA), contraste de texto (21:1 em elementos críticos), e consistência visual.

### 📚 Documentação Oficial

- **[Brand Guidelines](docs/BRAND_GUIDELINES.md)** - Manual de Marca (Designers)
  - Paleta de cores semântica (30 variáveis CSS)
  - Tipografia (Inter + Poppins)
  - Logo & identidade visual
  - Princípios de design (5 regras fundamentais)
  - Templates prontos para uso

- **[Design System](docs/DESIGN_SYSTEM.md)** - Guia Técnico (Developers)
  - Componentes Core (Button, Card, Input, Badge, EmptyState)
  - Regra de espaçamento (múltiplos de 4px)
  - Acessibilidade (WCAG AA/AAA)
  - Templates de código (Page, Form, List)
  - Troubleshooting (6 problemas comuns)

### 🎨 Stack de UI

- **Base**: Shadcn UI + TailwindCSS 3.4
- **Ícones**: Lucide React (500+ ícones)
- **Fontes**: Inter (Body) + Poppins (Headings)
- **Contraste**: 21:1 (WCAG AAA) em textos críticos
- **Espaçamento**: Múltiplos de 4px (consistente)
- **Dark Mode**: Suporte nativo com tokens semânticos

### ✅ Highlights do Rebrand

| Fase | Entrega | Status |
|------|---------|--------|
| **Fase 1** | Paleta profissional (Slate/Blue, 30 variáveis) | ✅ |
| **Fase 2** | Logo unificado (100% layouts) | ✅ |
| **Fase 3** | UX & Contraste (+238% improvement) | ✅ |
| **Fase 4** | Documentação Final (1.650+ linhas) | ✅ |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.13 | Core language |
| **Django** | 5.1.15 | Web framework |
| **Django REST Framework** | 3.15.2 | API layer |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7.1 | Cache + Celery broker |
| **Celery** | 5.6 | Async task queue |
| **SimpleJWT** | 5.3 | JWT authentication |
| **PyOTP** | 2.9 | 2FA/MFA implementation |
| **Stripe** | 11.7 | Payment processing |
| **Cloudinary** | 1.41 | File storage & CDN |
| **Bleach** | 6.2 | HTML sanitization |
| **Sentry** | 2.19 | Error monitoring |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1 | React framework (App Router) |
| **React** | 19.2 | UI library |
| **TypeScript** | 5.7 | Type safety |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Shadcn/ui** | Latest | Accessible component library |
| **SWR** | 2.3 | Data fetching & caching |
| **Axios** | 1.13 | HTTP client |
| **Recharts** | 3.7 | Data visualization |
| **Driver.js** | 1.6 | Onboarding tours |
| **Lucide React** | Latest | Icon system |

### Infrastructure
- **Hosting**: Render (Backend), Vercel (Frontend)
- **Database**: Railway PostgreSQL 16
- **Cache**: Railway Redis 7
- **CDN**: Cloudinary
- **Email**: SendGrid
- **Monitoring**: Sentry
- **Payments**: Stripe

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Prometheus + Grafana (configured)

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (recommended) OR
- **Python 3.13+**, **Node.js 20+**, **PostgreSQL 16+**, **Redis 7+**

### Docker Compose (Recommended)

**Fastest way to run Ouvify locally:**

```bash
# 1. Clone repository
git clone https://github.com/jairguerraadv-sys/Ouvify.git
cd Ouvify

# 2. Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. Start all services (Backend, Frontend, PostgreSQL, Redis)
docker-compose up -d

# 4. Run migrations
docker-compose exec backend python manage.py migrate

# 5. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 6. (Optional) Load sample data
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/api/docs/
- 🔐 Admin Panel: http://localhost:8000/admin/

**Stop:**
```bash
docker-compose down
```

---

### Manual Setup

<details>
<summary><strong>Backend (Django)</strong></summary>

```bash
# Navigate to backend
cd apps/backend

# Create virtual environment
python3.13 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements/dev.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Backend running at:** http://127.0.0.1:8000

</details>

<details>
<summary><strong>Frontend (Next.js)</strong></summary>

```bash
# Navigate to frontend
cd apps/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

**Frontend running at:** http://localhost:3000

</details>

<details>
<summary><strong>Required Services</strong></summary>

**PostgreSQL:**
```bash
# Docker (recommended)
docker run --name ouvify-postgres \
  -e POSTGRES_DB=ouvify \
  -e POSTGRES_USER=ouvify \
  -e POSTGRES_PASSWORD=ouvify123 \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Redis:**
```bash
# Docker (recommended)
docker run --name ouvify-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

**Celery (Background Tasks):**
```bash
# In a new terminal (backend virtualenv activated)
celery -A config worker -l info
```

</details>

---

## 📖 Documentation

Comprehensive documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| 📘 [Architecture](docs/ARCHITECTURE.md) | System architecture, diagrams, and design decisions |
| 🛡️ [Security](docs/SECURITY.md) | Security practices, 2FA, audit logging |
| 🚀 [Deployment](docs/DEPLOYMENT.md) | Production deployment guide (Render/Vercel) |
| 📋 [API Documentation](docs/API.md) | Complete REST API reference |
| 📊 [Database Schema](docs/DATABASE.md) | ER diagrams and table descriptions |
| 👨‍💼 [Company Admin Guide](docs/USER_GUIDE_COMPANY_ADMIN.md) | Guide for client administrators |
| 👤 [End User Guide](docs/USER_GUIDE_END_USER.md) | Guide for feedback submitters |
| ✅ [Deploy Checklist](DEPLOY_CHECKLIST.md) | Pre-production validation checklist |

---

## 🔒 Security & Compliance

Ouvify implements enterprise-grade security practices:

### 🛡️ Authentication
- **2FA/MFA**: TOTP-based (compatible with Google Authenticator, Authy, 1Password)
- **JWT**: Access (15min) + Refresh (7 days) tokens with rotation
- **Backup Codes**: 10 single-use recovery codes per user
- **Rate Limiting**: 5 attempts / 15 minutes on login

### 📋 Audit Logging
- **20+ Action Types**: LOGIN, CREATE, UPDATE, DELETE, MFA_ENABLED, etc.
- **4 Severity Levels**: INFO, WARNING, ERROR, CRITICAL
- **Complete Tracking**: User, IP address, user agent, timestamp, metadata
- **Tenant Isolation**: Users can only see their tenant's logs
- **Export**: CSV export with custom filters

### ⚖️ LGPD/GDPR Compliance
- **Consent Management**: Versioned tracking of terms, privacy policy, marketing
- **ConsentGate**: Blocking modal requiring acceptance before dashboard access
- **Anonymous Feedback**: Protocol-based tracking without PII
- **Data Portability**: JSON/CSV export of all user data
- **Right to Deletion**: Account deletion with complete data removal
- **Audit Trail**: All consent actions logged with timestamp and IP

### 🔐 Infrastructure Security
- **CSP**: Content Security Policy headers prevent XSS
- **CORS**: Strict origin validation
- **CSRF**: Token-based protection on state-changing operations
- **Input Sanitization**: Bleach library for HTML sanitization
- **SQL Injection**: Django ORM with parameterized queries
- **Password Security**: Bcrypt with cost factor 12

---

## 💳 Billing & Plans

Ouvify offers three tiers powered by Stripe:

| Feature | Starter (Free) | Pro ($49/mo) | Enterprise ($199/mo) |
|---------|----------------|--------------|----------------------|
| **Feedbacks/month** | 50 | 500 | Unlimited |
| **Team Members** | 3 | 10 | Unlimited |
| **Storage** | 1GB | 10GB | 100GB |
| **White-Label** | ✅ | ✅ | ✅ |
| **2FA/MFA** | ✅ | ✅ | ✅ |
| **Audit Logs** | 30 days | 90 days | 1 year |
| **Analytics** | Basic | Advanced | Advanced + Custom |
| **Webhooks** | ❌ | 5 endpoints | Unlimited |
| **API Access** | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | Email | Email + Phone |

**Implementation Details:**
- Stripe Checkout for secure payment processing
- Automatic plan enforcement via middleware
- Customer Portal for self-service billing management
- Prorated billing on upgrades/downgrades
- Webhook handling for payment events

---

## 📄 License

**Proprietary License** - All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

For licensing inquiries: jairguerraadv@gmail.com

---

## 🤝 Contributing

This is a proprietary project. Contributions are currently limited to authorized team members.

---

## 📞 Support

- 📧 **Email**: jairguerraadv@gmail.com
- 📚 **Documentation**: [docs/](docs/)
- 🐛 **Bug Reports**: GitHub Issues (authorized users only)

---

<div align="center">

**🚀 Built with ❤️ by Ouvify Team**

**Release Candidate 1.0** | February 6, 2026

Production ready for enterprise deployment

</div>

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
