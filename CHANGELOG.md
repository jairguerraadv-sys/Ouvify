# Changelog

Todas as mudanças notáveis do projeto Ouvy SaaS serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Multi-idioma (i18n) - PT-BR, EN-US, ES
- White-label completo (cores, fontes, domínio customizado)
- Integração Slack/Microsoft Teams
- App mobile (React Native)
- Dashboard analytics avançado

---

## [1.0.0] - 2026-01-29

### 🎉 Release Inicial - MVP Completo

Este é o primeiro release de produção do Ouvy SaaS, uma plataforma multi-tenant para gestão de feedbacks.

### ✨ Added

#### Core
- Sistema multi-tenant completo com isolamento de dados
- Arquitetura monorepo com Turborepo
- Deploy automático via Railway (backend) + Vercel (frontend)

#### Autenticação & Autorização
- JWT authentication com refresh tokens
- 4 roles hierárquicas: Owner, Admin, Moderator, Viewer
- 6 permissões granulares (manage_team, view_analytics, etc)
- Recuperação de senha via email
- Proteção CSRF completa

#### Feedbacks
- CRUD completo de feedbacks
- 4 tipos: Denúncia, Reclamação, Sugestão, Elogio
- Código de rastreio único (8 caracteres)
- Sistema de prioridades (Baixa, Média, Alta, Urgente)
- Sistema de tags customizáveis
- Atribuição de responsável
- Timeline de interações
- Comentários internos

#### Workflow & Automações
- 4 status: Pendente, Em Análise, Resolvido, Arquivado
- Auto-assign baseado em regras
- Escalation automático por SLA
- Digest diário de pendências (email)
- Regras customizáveis por tenant

#### Dashboard & Analytics
- KPIs em tempo real
- Gráficos de tendência
- SLA compliance tracking
- Métricas por status, tipo, responsável
- Filtros avançados (data, status, tipo)

#### Billing
- Integração Stripe completa
- 3 planos: Free, Pro ($49/mês), Enterprise ($199/mês)
- Trial automático de 14 dias
- Checkout Session seguro
- Webhooks para eventos de pagamento
- Portal do cliente para gerenciar subscription

#### Integrações
- API Keys para acesso programático
- Webhooks outgoing configuráveis
- Rate limiting (100 req/min)
- Export/Import CSV e JSON

#### Notificações
- Integração SendGrid
- Notificações de novo feedback
- Notificação de mudança de status
- Digest semanal de métricas
- Preferências por usuário

#### Compliance
- Termos de Uso e Política de Privacidade
- LGPD compliant
- Cookie consent banner
- Data retention policies
- Anonimização de dados

#### Frontend
- Design System completo (Shadcn/ui)
- Tema claro/escuro
- Responsivo (mobile-first)
- Loading states e skeletons
- Tratamento de erros graceful
- Acessibilidade WCAG 2.1 AA

#### Documentação
- Swagger/OpenAPI docs
- ReDoc alternativo
- Tutoriais para desenvolvedores
- Guia de contribuição
- Arquitetura documentada

#### Testes
- 50+ testes backend (pytest)
- 82% de cobertura de código
- Testes E2E com Playwright
- CI/CD com GitHub Actions

### 🔒 Security
- Helmet headers
- Content Security Policy (CSP)
- SQL Injection prevention (ORM)
- XSS sanitization
- Rate limiting
- Secrets management (env vars)
- HTTPS enforced

### 📊 Métricas do Release
- **50+ features** implementadas
- **40+ endpoints** API
- **50+ testes** passando
- **82% cobertura** de código
- **Score A+ (97/100)** na auditoria

---

## [0.5.0] - 2026-01-28

### Sprint 5: Integrações

#### Added
- API Keys para acesso programático
- Endpoints de gerenciamento de API Keys
- Webhooks outgoing configuráveis
- Export de dados (CSV, JSON)
- Import de dados (CSV, JSON)
- Preferências de notificação por usuário

---

## [0.4.0] - 2026-01-27

### Sprint 4: Billing & Planos

#### Added
- Modelo de planos (Free, Pro, Enterprise)
- Integração Stripe Checkout
- Stripe Webhooks (invoice.paid, subscription.updated, etc)
- Trial de 14 dias automático
- Feature gating baseado em plano
- Customer Portal para gerenciamento de subscription
- Limites por plano (usuários, feedbacks, storage)

---

## [0.3.0] - 2026-01-26

### Sprint 3: Analytics & SLA

#### Added
- Dashboard de analytics
- KPIs: total feedbacks, taxa resolução, tempo médio
- Gráficos de tendência (linha, barra)
- SLA tracking e compliance
- Filtros por período, status, tipo
- Export de relatórios

---

## [0.2.0] - 2026-01-25

### Sprint 2: Workflow & Automações

#### Added
- Auto-assign de feedbacks
- Regras de escalation
- SLA por tipo de feedback
- Digest diário por email
- Timeline de interações
- Sistema de comentários internos

---

## [0.1.0] - 2026-01-24

### Sprint 1: Multi-user & Permissões

#### Added
- Sistema de roles (Owner, Admin, Moderator, Viewer)
- Permissões granulares
- Convite de membros por email
- Gerenciamento de equipe
- CRUD de feedbacks básico
- Dashboard inicial

---

## [0.0.1] - 2026-01-22

### Setup Inicial

#### Added
- Estrutura monorepo com Turborepo
- Backend Django + DRF configurado
- Frontend Next.js 15 configurado
- PostgreSQL + Redis setup
- Deploy Railway + Vercel
- CI/CD básico

---

## Convenções de Versionamento

### Tipos de mudanças

- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de vulnerabilidades

### Versionamento Semântico

- **MAJOR** (1.x.x): Mudanças incompatíveis na API
- **MINOR** (x.1.x): Novas funcionalidades compatíveis
- **PATCH** (x.x.1): Correções de bugs compatíveis

---

## Links

- [Repositório](https://github.com/jairguerraadv-sys/ouvy-saas)
- [Issues](https://github.com/jairguerraadv-sys/ouvy-saas/issues)
- [Documentação](./docs/)

---

[Unreleased]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jairguerraadv-sys/ouvy-saas/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/jairguerraadv-sys/ouvy-saas/releases/tag/v0.0.1
