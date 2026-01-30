# 📚 Documentação Ouvify SaaS

Bem-vindo à documentação do Ouvify - Plataforma SaaS para Canais de Ética, Ouvidoria e Gestão de Feedbacks.

## 🗂️ Índice de Documentos

### 🚀 Getting Started
- [Setup Local](./setup-local.md) - Configurar ambiente de desenvolvimento
- [Arquitetura](./ARCHITECTURE.md) - Visão geral da arquitetura do sistema
- [Contribuição](./CONTRIBUTING.md) - Como contribuir com o projeto

### 📦 Deploy
- [Deploy Railway](./deploy-railway.md) - Deploy do backend no Railway
- [Deploy Vercel](./deploy-vercel.md) - Deploy do frontend no Vercel
- [Deploy Guide](./DEPLOY_GUIDE.md) - Guia geral de deploy

### 📖 Manuais de Usuário
- [Manual do Administrador](./admin-manual.md) - Triagem, gestão e relatórios
- [Manual do Usuário](./user-manual.md) - Enviar feedback e acompanhar

### 🔐 Segurança e Compliance
- [Segurança](./security.md) - Controles e boas práticas de segurança
- [LGPD](./lgpd.md) - Conformidade com a Lei Geral de Proteção de Dados

### 📊 Relatórios de Auditoria
- [Audit Report 2026](./AUDIT_REPORT.md) - Relatório de auditoria técnica
- [Sprint 1 Report](./SPRINT1_COMPLETION_REPORT.md) - Relatório do Sprint 1
- [Sprint 2 Release Notes](./SPRINT2_RELEASE_NOTES.md) - Notas do Sprint 2

### 🎨 Design e UX
- [Design System](./design/) - Componentes e padrões de UI
- [Acessibilidade](./accessibility/) - Diretrizes de acessibilidade

### 📝 Tutoriais
- [Tutoriais](./tutorials/) - Guias passo-a-passo

### 📋 Logs e Histórico
- [Changelog](./CHANGELOG_FASE_1.md) - Histórico de mudanças
- [Logs](./logs/) - Logs de desenvolvimento

---

## 🏗️ Arquitetura em Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js @ Vercel)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Landing  │  │  Enviar  │  │Acompanhar│  │Dashboard │        │
│  │  Pages   │  │ Feedback │  │Protocolo │  │  Admin   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                   (Django @ Railway)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Feedbacks │  │ Tenants  │  │  Auth    │  │ Webhooks │        │
│  │   API    │  │  Multi   │  │   JWT    │  │   API    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASES                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │PostgreSQL│  │  Redis   │  │Cloudinary│                      │
│  │  (Data)  │  │ (Cache)  │  │ (Files)  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Links Úteis

### Produção
- **Frontend:** https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app
- **Backend:** https://ouvy-saas-production.up.railway.app
- **API Docs:** https://ouvy-saas-production.up.railway.app/api/schema/swagger/

### Desenvolvimento
- **Frontend:** http://localhost:3000
- **Backend:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/api/schema/swagger/

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** Django 5.x + Django REST Framework
- **Autenticação:** JWT (Simple JWT)
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Armazenamento:** Cloudinary
- **Monitoramento:** Sentry

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts
- **Testes:** Jest + Playwright

### Infraestrutura
- **Backend Hosting:** Railway
- **Frontend Hosting:** Vercel
- **CI/CD:** GitHub Actions

---

**Última atualização:** 30 de Janeiro de 2026  
**Versão:** 2.0.0
