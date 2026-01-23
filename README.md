# 📚 Ouvy SaaS - Documentação Completa

<div align="center">

![Ouvy Logo](apps/frontend/public/logo.svg)

**Plataforma SaaS White Label para Canais de Feedback**

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/jairguerraadv-sys/ouvy-saas)
[![Django](https://img.shields.io/badge/Django-6.0.1-green)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

[🚀 Demo](https://ouvy-frontend.vercel.app) • [📖 Documentação](docs/) • [🐛 Issues](https://github.com/jairguerraadv-sys/ouvy-saas/issues)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Início Rápido](#início-rápido)
- [Documentação](#documentação)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **Ouvy** é uma plataforma SaaS (Software as a Service) que permite empresas criarem seus próprios canais de comunicação para receber feedback de usuários, incluindo:

- 🚨 **Denúncias** - Canal seguro e anônimo
- 💬 **Reclamações** - Gestão de insatisfações
- 💡 **Sugestões** - Coleta de ideias e melhorias
- ⭐ **Elogios** - Reconhecimento positivo

Cada feedback gera um **protocolo único de rastreamento** (ex: `OUVY-A3B2-C9D4`) que permite ao usuário acompanhar o andamento da sua solicitação.

### White Label

Cada empresa cliente (tenant) possui:
- ✅ Subdomínio personalizado (ex: `minhaempresa.ouvy.com`)
- ✅ Logo customizada
- ✅ Cores da marca (futuro)
- ✅ Isolamento total de dados

---

## ✨ Funcionalidades

### Para Empresas Clientes

- 🔐 **Cadastro e Autenticação** com recuperação de senha
- 📊 **Dashboard de Gestão** com métricas e analytics
- 📝 **Gerenciamento de Feedbacks** com timeline de interações
- 💳 **Pagamentos via Stripe** (planos Starter e Pro)
- ⚙️ **Configurações de Tenant** (logo, cores, etc)
- 📧 **Sistema de Notificações** (email, em breve)
- 📈 **Relatórios e Exportações** (CSV, PDF)

### Para Usuários Finais

- 📱 **Envio de Feedback Anônimo** ou identificado
- 📎 **Upload de Anexos** (imagens, documentos)
- 🔍 **Rastreamento por Protocolo** sem necessidade de login
- 💬 **Chat de Acompanhamento** com a empresa
- 🌐 **Interface Responsiva** (mobile-first)

---

## 🛠️ Tecnologias

### Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Django | 6.0.1 | Framework web |
| Django REST Framework | 3.15.2 | API REST |
| PostgreSQL | 16.x | Banco de dados |
| Stripe | 14.1.0 | Pagamentos |
| Gunicorn | 23.0.0 | Servidor WSGI |

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 15 | Framework React |
| TypeScript | 5.x | Tipagem estática |
| TailwindCSS | 3.x | Estilização |
| SWR | 2.3.8 | Data fetching |
| Axios | 1.13.2 | HTTP client |

### Infraestrutura

- **Backend**: Railway (PostgreSQL + Django)
- **Frontend**: Vercel (Edge Network + CDN)
- **Pagamentos**: Stripe (Test & Live mode)
- **CI/CD**: GitHub Actions
- **Monitoramento**: Sentry (a configurar)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                     │
│  Next.js 15 • TypeScript • TailwindCSS • Design System  │
│                https://ouvy-frontend.vercel.app          │
└─────────────────────────────────────────────────────────┘
                            │
                   HTTPS REST API
                            │
┌─────────────────────────────────────────────────────────┐
│               Backend API (Railway)                      │
│  Django 6.0.1 • DRF • Token Auth • Rate Limiting        │
│     https://ouvy-saas-production.up.railway.app         │
└─────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────▼──────────┐    ┌──────────▼──────────┐
    │  PostgreSQL        │    │   Stripe API        │
    │  (Railway)         │    │   (Payments)        │
    └────────────────────┘    └─────────────────────┘
```

### Apps Django

```
apps/backend/apps/
├── core/          # Middlewares, utils, validações, exceptions
├── tenants/       # Gestão de clientes (white-label, Stripe)
└── feedbacks/     # Sistema de feedbacks e protocolos
```

---

## 🚀 Início Rápido

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+ (ou SQLite para dev)
- Conta Stripe (Test mode)

### 1. Clone o Repositório

```bash
git clone https://github.com/jairguerraadv-sys/ouvy-saas.git
cd ouvy-saas
```

### 2. Backend Setup

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Migrations
cd ouvy_saas
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver
```

Backend disponível em: http://localhost:8000

### 3. Frontend Setup

```bash
# Em outro terminal
cd ouvy_frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com a URL do backend

# Rodar servidor de desenvolvimento
npm run dev
```

Frontend disponível em: http://localhost:3000

### 4. Acessar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Swagger API Docs**: http://localhost:8000/api/docs/

---

## 📖 Documentação

### Documentação Completa

| Documento | Descrição | Audiência |
|-----------|-----------|-----------|
| [PLANO_AUDITORIA_COMPLETA.md](PLANO_AUDITORIA_COMPLETA.md) | Plano de auditoria e checklist pré-produção | DevOps, QA |
| [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) | Referência rápida do design system | Devs Frontend |
| [docs/GUIA_DEPLOYMENT.md](docs/GUIA_DEPLOYMENT.md) | Guia completo de deploy (Railway + Vercel) | DevOps |
| [docs/SECURITY.md](docs/SECURITY.md) | Boas práticas de segurança | Todos |
| [docs/TESTE_PAGAMENTO.md](docs/TESTE_PAGAMENTO.md) | Como testar integração Stripe | QA, Devs |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Endpoints da API REST | Devs Backend |

### Endpoints Principais

```bash
# Autenticação
POST   /api-token-auth/              # Login
POST   /api/register-tenant/         # Cadastro
POST   /api/password-reset/request/  # Recuperar senha
POST   /api/password-reset/confirm/  # Confirmar nova senha

# Feedbacks
GET    /api/feedbacks/                          # Listar (autenticado)
POST   /api/feedbacks/                          # Criar (público)
GET    /api/feedbacks/consultar-protocolo/      # Rastrear (público)
POST   /api/feedbacks/responder-protocolo/      # Responder (público)

# Pagamentos
POST   /api/tenants/subscribe/                  # Criar checkout Stripe
POST   /api/tenants/webhook/                    # Webhook Stripe
GET    /api/tenants/subscription/               # Ver assinatura
DELETE /api/tenants/subscription/               # Cancelar assinatura
PATCH  /api/tenants/subscription/               # Atualizar plano

# Admin
GET    /api/tenant-info/              # Info do tenant
GET    /health/                       # Health check
GET    /api/docs/                     # Swagger UI
```

---

## 🚀 Deploy

### Railway (Backend)

1. Criar conta no [Railway](https://railway.app)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente:
   ```
   SECRET_KEY=...
   DEBUG=False
   ALLOWED_HOSTS=.railway.app
   DATABASE_URL=postgresql://...  (Railway fornece)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Deploy automático via git push

### Vercel (Frontend)

1. Criar conta no [Vercel](https://vercel.com)
2. Importar repositório
3. Configurar variáveis:
   ```
   NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
   ```
4. Deploy automático

**📘 Ver**: [docs/GUIA_DEPLOYMENT.md](docs/GUIA_DEPLOYMENT.md) para detalhes completos

---

## 🧪 Testes

### Backend

```bash
# Testes unitários
python manage.py test

# Testes de integração
./test_integration.sh

# Teste de API
python test_api.py

# Teste de protocolo
python test_protocolo.py
```

### Frontend

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E (Playwright)
npm run test:e2e
```

---

## 🔐 Segurança

- ✅ **HTTPS obrigatório** em produção
- ✅ **HSTS** habilitado (1 ano)
- ✅ **CSP** (Content Security Policy)
- ✅ **Rate Limiting** (5 req/min para consulta de protocolo)
- ✅ **CORS** configurado
- ✅ **Token Authentication** com hash seguro
- ✅ **Isolamento de dados** entre tenants
- ✅ **LGPD/GDPR** compliance
- ✅ **Backups automáticos** diários

Ver [docs/SECURITY.md](docs/SECURITY.md) para detalhes.

---

## 📊 Status do Projeto

| Categoria | Status | Notas |
|-----------|--------|-------|
| Backend API | ✅ 100% | Todos os endpoints implementados |
| Frontend | ✅ 95% | Admin panel em progresso |
| Autenticação | ✅ 100% | Com recuperação de senha |
| Pagamentos | ✅ 100% | Stripe Test Mode funcionando |
| White Label | 🟡 80% | Subdomínio dinâmico preparado |
| Testes | 🟡 70% | Backend 80%, Frontend 60% |
| Documentação | ✅ 90% | Precisa consolidação |
| Deploy | ✅ 100% | Railway + Vercel ativos |

**Legenda**: ✅ Completo | 🟡 Em progresso | ❌ Pendente

---

## 🗺️ Roadmap

### v1.0 (Atual)
- [x] Sistema de feedbacks completo
- [x] Autenticação e autorização
- [x] Integração Stripe
- [x] Deploy em produção
- [x] Design system completo
- [x] Recuperação de senha
- [x] Termos e privacidade

### v1.1 (Próxima)
- [ ] Sistema de notificações por email
- [ ] Dashboard analytics avançado
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Subdomínio dinâmico ativo
- [ ] Monitoramento com Sentry

### v2.0 (Futuro)
- [ ] App móvel (React Native)
- [ ] Multi-idioma (i18n)
- [ ] API pública para integrações
- [ ] Webhooks personalizados
- [ ] IA para categorização automática

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Código de Conduta

- Seja respeitoso e inclusivo
- Siga os padrões de código do projeto
- Escreva testes para novas funcionalidades
- Documente mudanças significativas

---

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 👥 Time

- **Desenvolvimento**: [Jair Guerra](https://github.com/jairguerraadv-sys)
- **Design**: [Ouvy Team]
- **Product**: [Ouvy Team]

---

## 📞 Contato

- **Email**: support@ouvy.com
- **Website**: https://ouvy-frontend.vercel.app
- **GitHub**: https://github.com/jairguerraadv-sys/ouvy-saas

---

<div align="center">

**Feito com ❤️ pela equipe Ouvy**

[⬆ Voltar ao topo](#ouvy-saas---documentação-completa)

</div>
