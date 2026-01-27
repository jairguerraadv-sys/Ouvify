# 🚀 Roadmap MVP - Ouvy SaaS

**Versão:** v1.0.0  
**Data Início:** 27/01/2026  
**Data Lançamento:** 27/03/2026 (60 dias)  
**Método:** Ágil (Sprints de 12 dias)

---

## 🎯 OBJETIVO DO MVP

Lançar plataforma B2B SaaS de gestão de feedbacks white-label com:
- ✅ Multi-usuário por tenant
- ✅ Workflow colaborativo com atribuição
- ✅ Sistema de billing funcional
- ✅ Notificações por email
- ✅ Analytics básico
- ✅ Compliance legal (LGPD)

**Diferencial competitivo:** White-label completo + Preço acessível (R$99-299/mês)

---

## 📊 GAPS PRIORIZADOS

### MoSCoW Analysis

#### 🔴 MUST HAVE (MVP Blocker - 14 features)
| ID | Feature | Estimativa | Categoria |
|----|---------|------------|-----------|
| M1 | Team Member Model | 6h | Multi-User |
| M2 | Roles e Permissões (Admin/Moderator/Viewer) | 8h | Multi-User |
| M3 | Convites de Usuário (email invite) | 10h | Multi-User |
| M4 | User Acceptance Flow | 4h | Multi-User |
| M5 | Team Management Page | 8h | Multi-User |
| M6 | Limites de Usuários por Plano | 2h | Multi-User |
| M7 | Atribuição de Feedback (assign_to) | 6h | Workflow |
| M8 | Email: Feedback Atribuído | 2h | Notifications |
| M9 | Email: Novo Feedback | 4h | Notifications |
| M10 | Upgrade/Downgrade de Plano | 8h | Billing |
| M11 | Trial Gratuito 14 dias | 6h | Billing |
| M12 | Termos de Uso (legal doc) | 8h | Legal |
| M13 | Política de Privacidade (legal doc) | 8h | Legal |
| M14 | Pricing Page (landing) | 8h | Marketing |

**TOTAL: 88 horas**

#### 🟡 SHOULD HAVE (Launch Priority - 20 features selecionadas)
| ID | Feature | Estimativa | Categoria |
|----|---------|------------|-----------|
| S1 | Tags/Labels customizáveis | 8h | Feedback |
| S2 | Prioridade (baixa/média/alta/urgente) | 4h | Feedback |
| S3 | SLA Tracking (tempo de resposta) | 12h | Feedback |
| S4 | Exportação CSV | 6h | Feedback |
| S5 | Exportação PDF | 8h | Feedback |
| S6 | Gráficos de Tendência | 12h | Analytics |
| S7 | Tempo Médio de Resposta | 6h | Analytics |
| S8 | SLA Compliance (%) | 6h | Analytics |
| S9 | Feedbacks por Período | 8h | Analytics |
| S10 | Notificações In-App (bell) | 10h | Notifications |
| S11 | Configuração de Preferências | 6h | Notifications |
| S12 | Mark as Read | 2h | Notifications |
| S13 | Notification Center | 8h | Notifications |
| S14 | Billing Portal (Stripe) | 4h | Billing |
| S15 | Invoices/Notas Fiscais | 12h | Billing |
| S16 | Proration (upgrade mid-cycle) | 4h | Billing |
| S17 | Payment Method Update | 4h | Billing |
| S18 | Domínio Próprio (CNAME) | 12h | White Label |
| S19 | Templates de Email customizáveis | 8h | White Label |
| S20 | Campos Customizados no formulário | 12h | White Label |

**TOTAL: 152 horas**

#### COULD HAVE & WON'T HAVE
Veja seção "Backlog Futuro" no final deste documento.

---

## 🏃 SPRINTS

### 📅 Sprint 1: Foundation - Multi-User & Permissions
**Duração:** 27/01 → 07/02 (12 dias)  
**Objetivo:** Habilitar múltiplos usuários por tenant com controle de acesso

| Task | Descrição | Estimativa | Assignee | Status |
|------|-----------|------------|----------|--------|
| **M1** | Criar model TeamMember (FK: user, client, role) | 6h | Backend | 🟡 TODO |
| **M2** | Implementar Roles enum + Permissions | 8h | Backend | 🟡 TODO |
| **M3** | API: Invite User (POST /api/team/invite/) | 6h | Backend | 🟡 TODO |
| **M3** | Email: User Invitation | 4h | Backend | 🟡 TODO |
| **M4** | API: Accept Invite (POST /api/team/accept/) | 4h | Backend | 🟡 TODO |
| **M5** | Frontend: Team Management Page | 8h | Frontend | 🟡 TODO |
| **M6** | Feature Gating: User Limits (free=1, starter=5, pro=15) | 2h | Backend | 🟡 TODO |
| - | Testes Unitários + E2E | 4h | QA | 🟡 TODO |

**TOTAL: 42 horas**

**Acceptance Criteria:**
- ✅ Admin pode convidar usuários via email
- ✅ Usuário recebe email com link de convite
- ✅ Usuário aceita convite e define senha
- ✅ Roles funcionando: Admin (tudo), Moderator (editar feedback), Viewer (somente ler)
- ✅ Limite de usuários validado no convite (free=1, starter=5, pro=15)
- ✅ UI exibe lista de team members com ações (resend invite, remover)

---

### 📅 Sprint 2: Workflow & Notifications
**Duração:** 08/02 → 19/02 (12 dias)  
**Objetivo:** Workflow colaborativo + notificações por email

| Task | Descrição | Estimativa | Assignee | Status |
|------|-----------|------------|----------|--------|
| **M7** | Adicionar campo assign_to FK em Feedback model | 2h | Backend | 🟡 TODO |
| **M7** | API: Assign Feedback (PATCH /api/feedbacks/{id}/) | 4h | Backend | 🟡 TODO |
| **M8** | Email: Feedback Assigned (template + envio) | 2h | Backend | 🟡 TODO |
| **M9** | Email: New Feedback (notificar admins) | 4h | Backend | 🟡 TODO |
| **S1** | Model: Tags (ManyToMany com Feedback) | 4h | Backend | 🟡 TODO |
| **S1** | API: CRUD Tags + assign to feedback | 4h | Backend | 🟡 TODO |
| **S2** | Adicionar campo priority em Feedback | 2h | Backend | 🟡 TODO |
| **S2** | UI: Priority badge + filter | 2h | Frontend | 🟡 TODO |
| **S3** | SLA Model: tempo_resposta_esperado por tipo | 6h | Backend | 🟡 TODO |
| **S3** | SLA Tracking: calcular tempo decorrido | 6h | Backend | 🟡 TODO |
| - | Frontend: Assign dropdown + tags UI | 6h | Frontend | 🟡 TODO |
| - | Testes Unitários + E2E | 4h | QA | 🟡 TODO |

**TOTAL: 46 horas**

**Acceptance Criteria:**
- ✅ Admin/Moderator pode atribuir feedback a team member
- ✅ Assignee recebe email imediato ao ser atribuído
- ✅ Admins recebem email ao surgir novo feedback
- ✅ Tags podem ser criadas e aplicadas a feedbacks
- ✅ Prioridade visível em cards de feedback
- ✅ SLA tracking calcula tempo decorrido vs esperado
- ✅ Filtros funcionando (assign_to, tags, priority)

---

### 📅 Sprint 3: Billing & Legal
**Duração:** 20/02 → 03/03 (12 dias)  
**Objetivo:** Sistema de billing completo + compliance legal

| Task | Descrição | Estimativa | Assignee | Status |
|------|-----------|------------|----------|--------|
| **M10** | API: Upgrade Plan (POST /api/billing/upgrade/) | 4h | Backend | 🟡 TODO |
| **M10** | API: Downgrade Plan (POST /api/billing/downgrade/) | 4h | Backend | 🟡 TODO |
| **M11** | Trial Logic: 14 dias gratuitos (campo trial_ends_at) | 4h | Backend | 🟡 TODO |
| **M11** | Cron Job: Verificar fim de trial (Celery) | 2h | Backend | 🟡 TODO |
| **S14** | Integrar Stripe Customer Portal | 4h | Backend | 🟡 TODO |
| **S15** | Geração de Invoices (modelo brasileiro) | 8h | Backend | 🟡 TODO |
| **S15** | API: Download Invoice PDF | 4h | Backend | 🟡 TODO |
| **S16** | Proration: calcular crédito em upgrade | 4h | Backend | 🟡 TODO |
| **S17** | Stripe: Update Payment Method flow | 4h | Backend | 🟡 TODO |
| **M12** | Documento: Termos de Uso (legal review) | 8h | Legal/PM | 🟡 TODO |
| **M13** | Documento: Política de Privacidade (legal review) | 8h | Legal/PM | 🟡 TODO |
| **M14** | Frontend: Pricing Page (landing) | 8h | Frontend | 🟡 TODO |
| - | Frontend: Billing settings page | 6h | Frontend | 🟡 TODO |
| - | Testes Unitários + E2E | 4h | QA | 🟡 TODO |

**TOTAL: 72 horas** (overtime previsto)

**Acceptance Criteria:**
- ✅ Cliente pode fazer upgrade/downgrade de plano
- ✅ Trial de 14 dias funciona (sem cobrar cartão)
- ✅ Stripe Customer Portal acessível via settings
- ✅ Invoices gerados em PDF (modelo brasileiro)
- ✅ Proration aplicada corretamente em upgrades
- ✅ Usuário pode atualizar cartão de crédito
- ✅ Termos e Privacidade revisados por advogado
- ✅ Pricing page com CTAs funcionando

---

### 📅 Sprint 4: Analytics & Polish
**Duração:** 04/03 → 15/03 (12 dias)  
**Objetivo:** Dashboards + refinamento de UX

| Task | Descrição | Estimativa | Assignee | Status |
|------|-----------|------------|----------|--------|
| **S4** | Exportação CSV: feedbacks com filtros | 6h | Backend | 🟡 TODO |
| **S5** | Exportação PDF: relatório customizado | 8h | Backend | 🟡 TODO |
| **S6** | Gráficos de Tendência (Chart.js/Recharts) | 12h | Frontend | 🟡 TODO |
| **S7** | Metric: Tempo Médio de Resposta | 6h | Backend | 🟡 TODO |
| **S8** | Metric: SLA Compliance (%) | 6h | Backend | 🟡 TODO |
| **S9** | Metric: Feedbacks por Período (comparação) | 8h | Backend | 🟡 TODO |
| **S10** | Notificações In-App (bell icon + dropdown) | 10h | Frontend | 🟡 TODO |
| **S11** | Settings: Notification Preferences | 6h | Frontend | 🟡 TODO |
| **S12** | API: Mark notification as read | 2h | Backend | 🟡 TODO |
| **S13** | Notification Center (page com histórico) | 8h | Frontend | 🟡 TODO |
| - | UI/UX Polish: Design review | 8h | Design | 🟡 TODO |
| - | Performance Audit (Lighthouse) | 4h | DevOps | 🟡 TODO |
| - | Testes Unitários + E2E | 4h | QA | 🟡 TODO |

**TOTAL: 88 horas** (overtime previsto)

**Acceptance Criteria:**
- ✅ CSV export com todos os campos e filtros aplicados
- ✅ PDF export com logo do cliente e dados customizados
- ✅ Gráficos de tendência (últimos 30 dias) funcionando
- ✅ Tempo médio de resposta calculado corretamente
- ✅ SLA compliance visível em dashboard
- ✅ Comparação de períodos (mês atual vs anterior)
- ✅ Bell icon com contador de notificações não lidas
- ✅ Preferências de notificação salvas por usuário
- ✅ Notification center com histórico paginado
- ✅ Lighthouse score > 90 (performance, a11y, best practices)

---

### 📅 Sprint 5: Launch Prep
**Duração:** 16/03 → 27/03 (12 dias)  
**Objetivo:** Testes finais, documentação e lançamento

| Task | Descrição | Estimativa | Assignee | Status |
|------|-----------|------------|----------|--------|
| - | Testes E2E completos (todos fluxos) | 12h | QA | 🟡 TODO |
| - | Load Testing (Locust: 100 usuários simultâneos) | 4h | DevOps | 🟡 TODO |
| - | Security Scan (OWASP ZAP) | 4h | DevOps | 🟡 TODO |
| - | Documentação: User Guides (Help Center) | 8h | PM | 🟡 TODO |
| - | Documentação: API Docs (Swagger) | 4h | Backend | 🟡 TODO |
| - | Video Tutorial (onboarding) | 4h | Marketing | 🟡 TODO |
| **S18** | Custom Domain: CNAME setup guide | 6h | DevOps | 🟡 TODO |
| **S18** | Custom Domain: SSL auto-provision | 6h | DevOps | 🟡 TODO |
| **S19** | Email Templates: Drag-and-drop editor | 8h | Frontend | 🟡 TODO |
| **S20** | Custom Fields: CRUD + render in form | 12h | Fullstack | 🟡 TODO |
| - | SEO: Meta tags, sitemap, robots.txt | 4h | Frontend | 🟡 TODO |
| - | Deploy Production + Smoke Tests | 4h | DevOps | 🟡 TODO |
| - | Launch Announcement (blog, social, email) | 4h | Marketing | 🟡 TODO |

**TOTAL: 80 horas** (overtime previsto)

**Acceptance Criteria:**
- ✅ 100% de cobertura nos fluxos críticos (signup, feedback, billing)
- ✅ Load test passa com 100 users @ 95th percentile < 500ms
- ✅ Zero vulnerabilidades críticas (OWASP)
- ✅ Help Center com 10+ artigos
- ✅ API docs completos (Swagger UI)
- ✅ Vídeo de onboarding < 3 minutos
- ✅ Custom domain funciona (CNAME + SSL)
- ✅ Email templates customizáveis via UI
- ✅ Custom fields criados e renderizados corretamente
- ✅ Google indexando landing page
- ✅ Deploy production sem downtime
- ✅ Anúncio público do lançamento

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs Técnicos
- **Uptime:** > 99.5% (Railway + Vercel)
- **Response Time (p95):** < 500ms
- **Error Rate:** < 0.1%
- **Test Coverage:** > 80%
- **Lighthouse Score:** > 90

### KPIs de Produto
- **Signups (primeiros 30 dias):** 50 tenants
- **Conversão Trial → Pago:** 20% (10 pagantes)
- **Churn Rate:** < 5%
- **NPS:** > 40
- **Daily Active Users:** 30% dos pagantes

### KPIs de Negócio
- **MRR (Monthly Recurring Revenue):** R$2.500/mês após 60 dias
- **CAC (Customer Acquisition Cost):** < R$500
- **LTV (Lifetime Value):** > R$3.000 (6 meses)
- **LTV/CAC Ratio:** > 3

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atraso na revisão legal (M12/M13) | ALTO | CRÍTICO | Contratar advogado especialista na Sprint 2 |
| Complexidade SLA tracking (S3) | MÉDIO | ALTO | Spike técnico no início Sprint 2 |
| Performance analytics (S6-S9) | MÉDIO | MÉDIO | Usar biblioteca pronta (Recharts), não custom |
| Stripe webhooks instáveis | BAIXO | ALTO | Retry logic + idempotency keys |
| Team Member permissions bugs | ALTO | CRÍTICO | Testes E2E extensivos Sprint 1 |
| Custom domain SSL provisioning | MÉDIO | ALTO | Usar Let's Encrypt + Cloudflare |
| Overtime Sprints 3-5 | ALTO | MÉDIO | Buffer de 8 dias (lançamento 27/03 vs 19/03) |

---

## 📦 DEPENDÊNCIAS EXTERNAS

### Serviços
- ✅ Stripe (billing)
- ✅ Cloudinary (uploads)
- ✅ Sentry (monitoring)
- ✅ Railway (backend)
- ✅ Vercel (frontend)
- ⚠️ **NOVO:** SendGrid/Mailgun (transactional email - escolher Sprint 1)
- ⚠️ **NOVO:** Advogado especialista LGPD (Sprint 2)

### Bibliotecas
- ✅ Django 6.0
- ✅ Next.js 16
- ✅ Recharts (gráficos)
- ⚠️ **NOVO:** react-email (templates) ou MJML
- ⚠️ **NOVO:** pdf-lib (PDF generation)

---

## 🎯 BACKLOG FUTURO (Post-MVP)

### Q2 2026 (Abril-Junho)
| Feature | Estimativa | Business Value |
|---------|------------|----------------|
| 2FA (TOTP) | 12h | Segurança enterprise |
| Session Management | 6h | Segurança corporativa |
| Feedback Templates | 8h | Eficiência |
| Email Reply Integration | 20h | Convenience |
| Slack Integration | 12h | Workflow |
| API Pública REST | 16h | Integrações |
| Webhooks Outgoing | 12h | Extensibilidade |
| Usage Metrics Dashboard (admin) | 10h | Business intelligence |
| Health Dashboard | 12h | Ops |

**TOTAL Q2: 108 horas**

### Q3 2026 (Julho-Setembro)
| Feature | Estimativa | Business Value |
|---------|------------|----------------|
| Busca Full-Text (Elasticsearch) | 16h | UX |
| Satisfação (CSAT) | 12h | Customer success |
| Relatórios Agendados | 8h | Engagement |
| PWA Completo | 20h | Mobile UX |
| Zapier Integration | 20h | No-code |
| Microsoft Teams | 12h | Enterprise |
| Custom Dashboards | 20h | Power users |
| Impersonation | 8h | Suporte |

**TOTAL Q3: 116 horas**

---

## 📝 NOTAS FINAIS

### Assumptions
1. **Team:** 1 Backend Dev (40h/semana) + 1 Frontend Dev (40h/semana) + 0.5 QA (20h/semana) + 0.25 PM (10h/semana)
2. **Velocity:** 80 story points/sprint (40h backend + 40h frontend)
3. **Sprints:** 5 sprints × 12 dias = 60 dias
4. **Buffer:** 8 dias embutidos para imprevistos

### Horas Totais
- **Sprint 1:** 42h (normal)
- **Sprint 2:** 46h (normal)
- **Sprint 3:** 72h (+32h overtime)
- **Sprint 4:** 88h (+48h overtime)
- **Sprint 5:** 80h (+40h overtime)
- **TOTAL:** 328 horas (vs 240h nominais = +88h overtime)

### Recomendações
1. **Contratar QA dedicado** para Sprint 3-5 (overtime alto)
2. **Priorizar legal review** na Sprint 2 (M12/M13 são blockers)
3. **Negociar com advogado** template base + revisão customizada (economiza tempo)
4. **Usar templates prontos** para emails (react-email, MJML) ao invés de custom
5. **Monitorar daily** progress Sprints 3-5 (alto risco de atraso)

### Definition of Done
- ✅ Código revisado (PR aprovado)
- ✅ Testes unitários passando (> 80% coverage)
- ✅ Teste E2E do fluxo completo
- ✅ Documentação atualizada (README, API docs)
- ✅ Deploy em staging validado
- ✅ PM/PO aprovou feature

---

**Última Atualização:** 26/01/2026  
**Próxima Revisão:** 07/02/2026 (fim Sprint 1)  
**Owner:** Product Manager  
**Stakeholders:** CEO, CTO, Lead Developer
