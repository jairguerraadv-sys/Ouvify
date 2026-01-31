# 🎯 Ouvify - Plataforma White Label SaaS de Gestão de Feedback

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)

## 📋 Visão Geral

**Ouvify** é uma plataforma SaaS White Label completa para gestão de feedback de usuários, incluindo denúncias, reclamações, sugestões e elogios. O sistema oferece rastreamento por código único (protocolo), painel administrativo completo e customização visual para cada cliente.

### Principais Funcionalidades

- 📝 **Gestão de Feedbacks** - 4 tipos: Denúncia, Reclamação, Sugestão, Elogio
- 🔐 **Multi-Tenancy** - Isolamento completo de dados por cliente
- 🎨 **White Label** - Personalização de logo, cores e domínio
- 📊 **Analytics** - Dashboard com métricas e relatórios
- 👥 **Gestão de Equipe** - Roles: Owner, Admin, Moderator, Viewer
- 🔔 **Notificações** - Email, Push e Webhooks
- 💳 **Billing** - Integração Stripe com planos Free, Starter e Pro
- 🛡️ **LGPD/GDPR** - Conformidade completa com exportação e exclusão de dados

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js 16 + React 19)                      │
│                       Deploy: Vercel                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│                    (Django 5.1 + DRF)                           │
│                       Deploy: Railway                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ tenants │  │feedbacks│  │ billing │  │webhooks │   ...       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐    ┌──────────┐
        │PostgreSQL│   │  Redis   │    │Cloudinary│
        │ (Railway)│   │ (Railway)│    │  (CDN)   │
        └──────────┘   └──────────┘    └──────────┘
```

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | Next.js + React | 16.1.5 / 19.2.4 |
| Backend | Django + DRF | 5.1.5 / 3.15.2 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7.x |
| Storage | Cloudinary | - |
| Payments | Stripe | API v2024 |
| Auth | JWT (SimpleJWT) | 5.5.1 |
| Task Queue | Celery | 5.6.2 |
| Monitoring | Sentry | 2.50.0 |

---

## 📁 Estrutura do Monorepo

```
ouvify/
├── apps/
│   ├── backend/           # API Django
│   │   ├── apps/
│   │   │   ├── core/      # Utilitários, middlewares
│   │   │   ├── tenants/   # Multi-tenancy, auth, equipe
│   │   │   ├── feedbacks/ # CRUD de feedbacks
│   │   │   ├── billing/   # Stripe, planos
│   │   │   ├── webhooks/  # Integrações
│   │   │   ├── notifications/ # Push, email
│   │   │   ├── consent/   # LGPD
│   │   │   └── auditlog/  # Logs de auditoria
│   │   └── config/        # Settings Django
│   │
│   └── frontend/          # Next.js App
│       ├── app/           # Rotas (App Router)
│       ├── components/    # Componentes React
│       ├── contexts/      # React Contexts
│       ├── hooks/         # Custom Hooks
│       └── lib/           # Utilitários
│
├── docs/                  # Documentação
├── monitoring/            # Prometheus + Grafana
├── nginx/                 # Configurações Nginx
└── packages/              # Pacotes compartilhados
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Python 3.11+
- PostgreSQL 16
- Redis 7+

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/jairguerraadv-sys/ouvify.git
cd ouvify

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 3. Backend
cd apps/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# 4. Frontend
cd ../frontend
npm install

# 5. Iniciar ambientes
# Terminal 1 - Backend
cd apps/backend && python manage.py runserver

# Terminal 2 - Frontend
cd apps/frontend && npm run dev
```

### Comandos Úteis

```bash
# Monorepo (raiz)
npm run dev              # Dev frontend + backend
npm run build            # Build produção
npm run test             # Testes completos
npm run lint             # Lint completo

# Backend
npm run dev:backend      # Django runserver
npm run test:backend     # Pytest

# Frontend
npm run dev:frontend     # Next.js dev
npm run test:frontend    # Jest
npm run test:e2e         # Playwright E2E
```

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura e decisões técnicas |
| [API.md](./API.md) | Documentação completa da API |
| [DATABASE.md](./DATABASE.md) | Esquema do banco e migrações |
| [SETUP.md](./SETUP.md) | Guia de setup do ambiente |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guia de deploy (Railway + Vercel) |
| [SECURITY.md](./SECURITY.md) | Políticas de segurança |
| [TESTING.md](./TESTING.md) | Guia de testes |

---

## 🔐 Segurança

- **Autenticação**: JWT com access token (15min) e refresh token (7 dias)
- **2FA**: TOTP via pyotp
- **Rate Limiting**: Por IP e por tenant
- **Headers**: CSP, HSTS, X-Frame-Options, Permissions-Policy
- **Sanitização**: Bleach (backend) + DOMPurify (frontend)
- **Multi-tenancy**: Isolamento automático via TenantAwareModel
- **LGPD**: Endpoints de exportação e exclusão de dados

---

## 💰 Planos

| Feature | Free | Starter | Pro |
|---------|------|---------|-----|
| Feedbacks/mês | 50 | 500 | ∞ |
| Usuários | 1 | 5 | ∞ |
| Notas Internas | ❌ | ✅ | ✅ |
| Anexos | ❌ | ❌ | ✅ |
| White Label | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| Suporte | Community | Email | Priority |
| Storage | 1GB | 10GB | 100GB |

---

## 🧪 Testes

```bash
# Backend (pytest)
cd apps/backend
pytest --cov=apps --cov-report=html

# Frontend (Jest)
cd apps/frontend
npm test -- --coverage

# E2E (Playwright)
npm run test:e2e
```

**Cobertura Atual:**
- Backend: ~75%
- Frontend: ~45%
- E2E: Fluxos críticos cobertos

---

## 📊 Monitoramento

- **Sentry**: Tracking de erros e performance
- **Health Checks**: `/health` e `/ready`
- **Prometheus**: Métricas (opcional)
- **Grafana**: Dashboards (opcional)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Proprietário - © 2026 Ouvify. Todos os direitos reservados.

---

## 📞 Contato

- **Email**: suporte@ouvify.com.br
- **Website**: https://ouvify.com.br
- **Documentação API**: https://api.ouvify.com.br/docs/

---

*Última atualização: 31/01/2026*
