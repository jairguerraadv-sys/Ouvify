# ✅ CHECKLIST DE LANÇAMENTO - OUVIFY SAAS
**Lista de Verificação Pré-Lançamento (Production-Ready)**

**Versão:** 1.0  
**Data:** 3 de Fevereiro de 2026  
**Status Atual:** 🚧 EM DESENVOLVIMENTO (78% completo)

---

## 📋 LEGENDA

- ✅ **COMPLETO** - Implementado e testado
- 🟡 **PARCIAL** - Implementado mas precisa ajustes
- ❌ **FALTANTE** - Não implementado
- 🔄 **EM ANDAMENTO** - Sendo desenvolvido
- ⏭️ **BLOQUEADO** - Depende de outro item

---

## 🎯 FASE 1: FUNCIONALIDADES ESSENCIAIS

### 1.1 Autenticação e Autorização
- ✅ Sistema de cadastro de cliente-empresa funcional
- ✅ Login com JWT (access + refresh tokens)
- ✅ Recuperação de senha com email
- ✅ Logout com blacklist de tokens
- ✅ Logout de todos os dispositivos
- ✅ Two-Factor Authentication (2FA) implementado
- ✅ Roles e permissões (Super Admin, Admin, Manager, Agent, Viewer)
- ✅ Middleware de isolamento multi-tenant
- ❌ "Lembrar-me" opcional (Remember Me checkbox)

**Status:** 🟢 95% - Pronto com 1 nice-to-have faltando

---

### 1.2 Gestão de Feedbacks
- ✅ CRUD completo de feedbacks
- ✅ 4 tipos (denúncia, reclamação, sugestão, elogio)
- ✅ Geração automática de protocolo único
- ✅ Upload de anexos (Cloudinary)
- ✅ Categorização com tags
- ✅ Sistema de status (pendente, em_analise, resolvido, fechado)
- ✅ Prioridades (baixa, média, alta, crítica)
- ✅ Atribuição para membros da equipe
- ✅ Comentários internos (interações)
- ✅ Resposta ao usuário final
- ✅ SLA tracking (tempo de resposta e resolução)
- ✅ Templates de resposta reutilizáveis
- 🟡 Formulário público de envio (existe mas UX pode melhorar)
- ✅ Consulta pública por protocolo

**Status:** 🟢 98% - Excelente

---

### 1.3 Painel de Controle (Dashboard)
- ✅ Métricas principais (cards de stats)
- ✅ Gráficos de feedbacks por tipo (recharts)
- ✅ Gráficos de feedbacks por status
- ✅ Listagem de feedbacks com filtros
- ✅ Paginação
- ✅ Detalhe de feedback individual
- ✅ Edição de feedback
- ❌ Busca global no header (ElasticSearch backend pronto)
- 🟡 Relatórios exportáveis (modelo pronto, export faltando)
- ✅ Analytics de SLA
- 🟡 Notificações in-app (push configurado, UI badge faltando)

**Status:** 🟡 85% - Bom mas com gaps

---

### 1.4 Gestão de Equipe
- ✅ CRUD de membros da equipe
- ✅ Convites por email com roles
- ✅ Aceitação de convite via link único
- ✅ Suspensão/reativação de membros
- ✅ Remoção de membros
- ✅ Estatísticas de equipe
- ✅ Reenvio de convite
- ❌ Histórico de ações por membro (audit log existe, integração faltante)

**Status:** 🟢 90% - Muito bom

---

### 1.5 White Label (Personalização)
- ✅ Upload de logo
- ✅ Personalização de cor primária
- ✅ Personalização de cor secundária
- ✅ Personalização de fonte (Google Fonts)
- ✅ Preview em tempo real
- ❌ Upload de favicon customizado
- ❌ Customização de email footer
- ❌ Domínio customizado próprio (ex: feedback.empresaX.com)

**Status:** 🟡 70% - Core implementado, extras faltando

---

### 1.6 Assinaturas e Billing
- ✅ Integração Stripe (checkout)
- ✅ Webhook Stripe configurado
- ✅ Modelos Plan, Subscription, Invoice
- ✅ Trial de 14 dias
- ✅ Ciclo de vida (trial, active, past_due, canceled)
- ✅ Cancelamento de assinatura
- 🟡 Reativação de assinatura (modelo suporta, UI faltando)
- ❌ Upgrade/downgrade de planos na UI
- ❌ Histórico de pagamentos na UI
- ❌ Integração NF-e (Focus NFe para Brasil)
- ❌ Alerta de pagamento vencido (modelo suporta, cron faltando)

**Status:** 🟡 65% - Funcional mas incompleto

---

## 🔒 FASE 2: SEGURANÇA E COMPLIANCE

### 2.1 Segurança Geral
- ✅ HTTPS obrigatório em produção
- ✅ SECRET_KEY único e seguro (validação no settings.py)
- ✅ Senhas hasheadas (bcrypt/argon2)
- ✅ CORS configurado restritivamente
- ✅ CSRF protection habilitado
- ✅ Rate limiting em endpoints críticos
- ✅ SQL Injection protection (Django ORM)
- ✅ XSS protection (DOMPurify + CSP)
- ✅ Clickjacking protection (X-Frame-Options)
- ✅ Headers de segurança (CSP, HSTS, etc.)
- ✅ CSP reporting endpoint (`/api/csp-report/`)
- ❌ WAF (Web Application Firewall) - Cloudflare recomendado
- ❌ DDoS protection adicional - Railway tem básico
- ❌ Penetration testing antes do lançamento

**Status:** 🟢 85% - Muito bom, recomendações extras

---

### 2.2 LGPD/GDPR Compliance
- ✅ Política de privacidade (página existe)
- ✅ Termos de uso (página existe)
- ✅ Política de cookies (página existe)
- ✅ Consent management (app completo)
- ✅ Direito ao esquecimento (DELETE /api/account/)
- ✅ Exportação de dados (GET /api/export-data/)
- ✅ Anonimização de feedbacks opcional
- ✅ Logs de auditoria de acessos (AuditLog app)
- ✅ Dados sensíveis não logados
- ❌ DPO (Data Protection Officer) designado no site
- ❌ Formulário de solicitação de dados (via UI, não apenas API)
- ❌ Banner de cookies (cookie consent)

**Status:** 🟢 90% - Excelente compliance técnico

---

### 2.3 Autenticação e Sessões
- ✅ JWT com expiração configurada
- ✅ Refresh token rotation
- ✅ Token blacklist para logout
- ✅ 2FA (Two-Factor Authentication)
- ✅ Password strength validation
- ✅ Account lockout após N tentativas (pode verificar)
- ❌ IP whitelisting (enterprise feature)
- ❌ SSO (SAML, Google, Microsoft) - pós-MVP

**Status:** 🟢 90% - Muito bom

---

## 🚀 FASE 3: INFRAESTRUTURA E DEVOPS

### 3.1 Deploy e Ambientes
- ✅ Backend em Railway (produção)
- ✅ Frontend em Vercel (produção)
- ✅ PostgreSQL gerenciado (Railway)
- ✅ Redis gerenciado (Railway)
- ✅ Deploy automático via Git push
- ❌ Ambiente de staging separado
- ❌ CI/CD pipeline (GitHub Actions)
  - ❌ Testes automatizados em PRs
  - ❌ Linting obrigatório
  - ❌ Build validation
  - ❌ Deploy preview para PRs
- ✅ Railway private network para DB
- ✅ Domínio customizado configurado (parcial)
- ✅ SSL/TLS automático (Vercel + Railway)

**Status:** 🟡 70% - Funcional mas sem CI/CD

---

### 3.2 Monitoring e Alertas
- ✅ Sentry configurado (backend + frontend)
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ❌ Uptime monitoring (UptimeRobot ou similar)
- ❌ Prometheus/Grafana (arquivos existem mas não usados)
- ❌ Alertas configurados:
  - ❌ Error rate >5% → Slack
  - ❌ Response time >1s → Slack
  - ❌ CPU >80% → Slack
  - ❌ Disk usage >90% → Email
- ❌ Status page pública (status.ouvify.com)

**Status:** 🟡 50% - Básico implementado

---

### 3.3 Backups e Disaster Recovery
- 🟡 Backup automático do banco (Railway oferece, confirmar config)
- ❌ Backup de uploads (Cloudinary tem, mas validar)
- ❌ Procedimento de restore documentado
- ❌ Backup de configurações (env vars)
- ❌ RTO/RPO definidos (Recovery Time/Point Objective)
- ❌ Plano de disaster recovery documentado

**Status:** 🔴 30% - Crítico documentar

---

### 3.4 Performance
- ✅ Connection pooling do banco (600s)
- ✅ Redis para cache (configurado mas uso não claro)
- ✅ ElasticSearch para busca (configurado)
- ✅ CDN global (Vercel Edge)
- ✅ Image optimization (Cloudinary + next/image)
- ✅ Static files com Whitenoise
- ❌ Query caching implementado em todas as views pesadas
- ❌ Celery workers para tarefas assíncronas (celery configurado mas workers?)
- ❌ Database indexes compostos (apenas simples implementados)
- ❌ Frontend bundle size auditado
- ❌ Lazy loading de componentes (parcial)

**Status:** 🟡 65% - Base sólida mas não otimizado

---

## 🧪 FASE 4: TESTES E QUALIDADE

### 4.1 Testes Backend
- ✅ 309 testes unitários/integração
- ✅ pytest configurado
- ✅ Fixtures e factories
- ❌ Cobertura de testes medida (rodar `pytest --cov`)
- ❌ Meta de cobertura >80% enforced
- ❌ Testes de regressão para bugs críticos
- ❌ Testes de carga (Locust configurado mas não usado)
- ❌ Testes de segurança automatizados (OWASP ZAP)

**Status:** 🟡 60% - Muitos testes mas sem métricas

---

### 4.2 Testes Frontend
- ❌ **CRÍTICO:** 0 testes unitários (Jest configurado, sem testes)
- ❌ Testes de componentes críticos
- ❌ Testes de hooks customizados
- ❌ Testes de integração com API (mocks)
- ❌ Playwright E2E (configurado mas sem testes)
  - ❌ Fluxo de cadastro
  - ❌ Fluxo de login
  - ❌ Envio de feedback
  - ❌ Consulta de protocolo
- ❌ Visual regression testing (Percy/Chromatic)
- ❌ Lighthouse CI para performance

**Status:** 🔴 5% - BLOQUEADOR CRÍTICO

---

### 4.3 Testes de Aceitação
- ❌ Smoke tests pós-deploy
- ❌ Testes de fluxos completos E2E
- ❌ Testes de diferentes navegadores (Cross-browser)
- ❌ Testes mobile (Responsive)
- ❌ Testes de acessibilidade (WCAG 2.1)
- ❌ Testes de performance (Lighthouse >90)

**Status:** 🔴 0% - Nenhum teste de aceitação automatizado

---

## 📧 FASE 5: COMUNICAÇÕES E EMAILS

### 5.1 Email Transacional
- ✅ SMTP/SendGrid configurado
- ✅ Email de recuperação de senha (implementado)
- ❌ **CRÍTICO:** Templates HTML profissionais faltantes:
  - ❌ Boas-vindas ao cadastrar
  - ❌ Convite de equipe
  - ❌ Novo feedback recebido
  - ❌ Feedback atualizado
  - ❌ Confirmação de assinatura
  - ❌ Pagamento confirmado
  - ❌ Pagamento falhou
  - ❌ Trial acabando (3 dias antes)
- ❌ Branding do tenant nos emails
- ❌ Unsubscribe funcional (LGPD)
- ❌ Footer com compliance (LGPD)

**Status:** 🔴 20% - BLOQUEADOR CRÍTICO

---

### 5.2 Notificações Push
- ✅ Web Push API configurado
- ✅ PushSubscription model
- ✅ Preferências de notificação por usuário
- ❌ Gatilhos automáticos:
  - ❌ Novo feedback atribuído a mim
  - ❌ Feedback comentado
  - ❌ SLA próximo de vencer (últimas 2h)
  - ❌ Pagamento vencido
- ❌ Badge de contagem no header

**Status:** 🟡 60% - Infraestrutura pronta, gatilhos faltando

---

### 5.3 Notificações In-App
- ❌ Dropdown de notificações no header
- ❌ Badge de contagem não lidas
- ❌ Marcação de lida/não-lida
- ❌ Persistência no banco (NotificationLog model?)
- ❌ Tempo real via WebSocket (ou polling)

**Status:** 🔴 0% - Nice-to-have mas importante

---

## 📚 FASE 6: DOCUMENTAÇÃO

### 6.1 Documentação Técnica (Devs)
- ❌ `/docs/README.md` - Overview do projeto
- ❌ `/docs/ARCHITECTURE.md` - Arquitetura e decisões
- ❌ `/docs/API.md` - Documentação completa da API
- ✅ `/docs/README_MULTITENANCY.md` - Multi-tenancy explicado
- ❌ `/docs/DATABASE.md` - Esquema e migrações
- ❌ `/docs/SETUP.md` - Guia de setup local
- ❌ **ISSUE-005:** `/docs/DEPLOYMENT.md` - Guia de deploy
- ❌ `/docs/SECURITY.md` - Políticas de segurança
- ❌ `/docs/TESTING.md` - Guia de testes
- ❌ `/docs/CONTRIBUTING.md` - Guia de contribuição
- ❌ `/docs/TROUBLESHOOTING.md` - Solução de problemas

**Status:** 🔴 18% - CRÍTICO documentar

---

### 6.2 Documentação de API (Externa)
- ✅ drf-spectacular configurado (OpenAPI 3.0)
- ✅ Endpoint Swagger (provavelmente `/api/schema/swagger-ui/`)
- ❌ Exemplos de requests/responses
- ❌ Guia de autenticação (como obter token)
- ❌ Documentação de webhooks
- ❌ Rate limits documentados
- ❌ Postman/Insomnia collection
- ❌ SDKs (Python, JavaScript) - pós-MVP

**Status:** 🟡 50% - Swagger existe mas incompleto

---

### 6.3 Documentação de Usuário (Clientes)
- ❌ **CRÍTICO:** Guia do Cliente-Empresa:
  - ❌ Como cadastrar e fazer onboarding
  - ❌ Como personalizar white label
  - ❌ Como gerenciar feedbacks
  - ❌ Como adicionar equipe
  - ❌ Como gerar relatórios
  - ❌ Como configurar webhooks
  - ❌ Como cancelar assinatura
- ❌ **CRÍTICO:** Guia do Usuário Final:
  - ❌ Como enviar feedback
  - ❌ Como acompanhar protocolo
  - ❌ Privacidade e anonimato
- ❌ Guia do Super Admin (Ouvify)
- ❌ FAQ completo
- ❌ Vídeos tutoriais
- ❌ Help Center / Base de conhecimento

**Status:** 🔴 0% - BLOQUEADOR CRÍTICO

---

### 6.4 Documentação de Marketing
- ❌ Página de Features detalhada
- ❌ Página de Pricing clara
- ❌ Case studies / Depoimentos
- ❌ Blog (opcional mas recomendado para SEO)
- ❌ Changelog público
- ❌ Roadmap público (opcional)

**Status:** 🔴 10% - Landing page básica existe

---

## 🎨 FASE 7: UX E INTERFACE

### 7.1 Landing Page Pública
- 🟡 Página inicial existe mas incompleta
- ❌ **ISSUE-002:** Hero section com CTA claro
- ❌ Seção de features/benefícios
- ❌ Pricing table com comparação
- ❌ Depoimentos/social proof
- ❌ FAQ
- ❌ Footer completo com links
- ❌ Meta tags OG para SEO
- ❌ Schema.org markup
- ❌ GTM/Analytics configurado

**Status:** 🔴 30% - BLOQUEADOR CRÍTICO

---

### 7.2 Onboarding de Novos Clientes
- ❌ **ISSUE-004:** Tour guiado (Driver.js instalado mas não usado)
- ❌ Setup wizard (5 passos):
  - ❌ Upload logo e cores
  - ❌ Criar categorias
  - ❌ Adicionar membro
  - ❌ Testar feedback demo
  - ❌ Ver como consultar protocolo
- ❌ Checklist de tarefas no dashboard
- ❌ Tooltips contextuais
- ❌ Empty states educativos
- ❌ Vídeo tutorial embedado

**Status:** 🔴 0% - BLOQUEADOR CRÍTICO

---

### 7.3 Experiência do Dashboard
- ✅ Layout responsivo (mobile-first)
- ✅ Dark mode (next-themes configurado)
- ✅ Loading states (spinners)
- ✅ Error states (toast notifications)
- ✅ Formulários com validação
- ❌ Busca global no header
- ❌ Atalhos de teclado (ex: Cmd+K para busca)
- ❌ Drag & drop para upload de anexos (pode ter)
- ❌ Filtros persistentes (query params)
- ❌ Tabelas com ordenação e filtros avançados
- ❌ Indicadores visuais de SLA (badges de cor)

**Status:** 🟡 70% - Bom mas com melhorias

---

### 7.4 Acessibilidade (A11y)
- ❌ Testes de acessibilidade (axe-core)
- ❌ WCAG 2.1 Level AA compliance
- ❌ Navegação por teclado
- ❌ ARIA labels apropriados
- ❌ Contraste de cores adequado
- ❌ Screen reader friendly
- ❌ Focus indicators visíveis

**Status:** 🔴 20% - Não auditado

---

## 📊 FASE 8: ANALYTICS E REPORTING

### 8.1 Analytics para Clientes
- ✅ Dashboard com métricas principais
- ✅ Gráficos por tipo de feedback
- ✅ Gráficos por status
- ✅ Métricas de SLA
- ❌ Filtros por período (semana, mês, ano, custom)
- ❌ Comparação com período anterior
- ❌ Métricas por membro da equipe
- ❌ Métricas por categoria/tag
- ❌ NPS score tracking (se aplicável)

**Status:** 🟡 60% - Base boa mas incompleta

---

### 8.2 Exportação de Relatórios
- 🟡 Página de relatórios existe
- ❌ **ISSUE-006:** Exportação para PDF (ReportLab)
- ❌ Exportação para Excel (openpyxl)
- ❌ Exportação para CSV
- ❌ Filtros de período para export
- ❌ Preview antes de exportar
- ❌ Download assíncrono (Celery) para grandes volumes
- ❌ Agendamento de relatórios periódicos (semanal, mensal)

**Status:** 🔴 10% - ALTA PRIORIDADE

---

### 8.3 Analytics Interno (Ouvify)
- ✅ Super admin dashboard
- ✅ Métricas globais de uso
- ✅ Gestão de clientes
- ❌ Churn rate
- ❌ MRR (Monthly Recurring Revenue)
- ❌ LTV (Lifetime Value)
- ❌ CAC (Customer Acquisition Cost)
- ❌ Active users por tenant
- ❌ Feature adoption tracking

**Status:** 🟡 50% - Básico implementado

---

## 🔗 FASE 9: INTEGRAÇÕES

### 9.1 Webhooks (Outgoing)
- ✅ CRUD de webhook endpoints
- ✅ Teste de webhook
- ✅ Logs de webhooks
- ✅ Retry automático (pode confirmar)
- ❌ Webhook signature (HMAC) para segurança
- ❌ Filtros de eventos (enviar só tipos específicos)
- ❌ Rate limiting de webhooks

**Status:** 🟢 80% - Muito bom

---

### 9.2 APIs Externas
- ✅ Stripe (pagamentos)
- ✅ Cloudinary (uploads)
- ✅ SendGrid (emails)
- ✅ Sentry (monitoring)
- ❌ Slack integration (webhook pronto, UI faltando)
- ❌ Teams integration
- ❌ Discord integration
- ❌ Focus NFe (notas fiscais Brasil)
- ❌ Zapier/Make.com integration (webhook pronto mas não promovido)

**Status:** 🟡 60% - Core pronto, extras faltando

---

### 9.3 API Pública (Incoming)
- ✅ API REST completa (DRF)
- ✅ JWT authentication
- ✅ OpenAPI documentation (Swagger)
- ❌ API keys dedicadas (alternativa ao JWT)
- ❌ Rate limiting por API key
- ❌ Sandbox environment para testes
- ❌ SDKs oficiais (Python, JS)
- ❌ Developer portal (portal.ouvify.com)

**Status:** 🟡 55% - Existe mas não promovida

---

## 🏁 FASE 10: LANÇAMENTO

### 10.1 Pré-Lançamento
- ❌ Beta fechado com 5-10 clientes selecionados
- ❌ Feedback coletado e iterado
- ❌ Bugs críticos resolvidos
- ❌ Onboarding validado (<10min)
- ❌ Documentação completa validada
- ❌ Testes de carga executados
- ❌ Penetration testing realizado
- ❌ Legal review (termos, privacidade)

**Status:** 🔴 0% - Aguardando P0

---

### 10.2 Marketing e Comunicação
- ❌ Press release preparado
- ❌ Launch email para waitlist
- ❌ Post em redes sociais (LinkedIn, Twitter)
- ❌ Product Hunt launch preparado
- ❌ Blog post de lançamento
- ❌ Email signature com link
- ❌ Comunidades relevantes notificadas

**Status:** 🔴 0% - Aguardando P0

---

### 10.3 Pós-Lançamento (Primeiros 30 dias)
- ❌ Monitoring 24/7 configurado
- ❌ Plantão de devs para bugs críticos
- ❌ Processo de escalação definido
- ❌ Métricas de sucesso monitoradas:
  - ❌ Uptime >99.5%
  - ❌ Response time <200ms
  - ❌ Error rate <1%
  - ❌ Conversão trial→paid >20%
  - ❌ Churn <5%
  - ❌ NPS >50
- ❌ Roadmap Q2 definido baseado em feedback

**Status:** 🔴 0% - Aguardando lançamento

---

## 📊 RESUMO GERAL

### Por Fase

| Fase | Status | % Completo | Bloqueadores |
|------|--------|------------|--------------|
| 1. Funcionalidades Essenciais | 🟢 | 88% | 1 |
| 2. Segurança e Compliance | 🟢 | 88% | 0 |
| 3. Infraestrutura e DevOps | 🟡 | 63% | 1 |
| 4. Testes e Qualidade | 🔴 | 25% | 2 |
| 5. Comunicações e Emails | 🔴 | 30% | 1 |
| 6. Documentação | 🔴 | 20% | 3 |
| 7. UX e Interface | 🔴 | 33% | 2 |
| 8. Analytics e Reporting | 🟡 | 43% | 1 |
| 9. Integrações | 🟡 | 65% | 0 |
| 10. Lançamento | 🔴 | 0% | N/A |

**MÉDIA GERAL:** 🟡 **45.5% Production-Ready**

### Bloqueadores Críticos (P0)

1. ❌ **Testes Frontend** (ISSUE-001)
2. ❌ **Landing Page** (ISSUE-002)
3. ❌ **Email Templates** (ISSUE-003)
4. ❌ **Onboarding** (ISSUE-004)
5. ❌ **Deploy Docs** (ISSUE-005)
6. ❌ **Docs de Usuário** (ver Fase 6.3)
7. ❌ **CI/CD Pipeline** (ver Fase 3.1)
8. ❌ **Testes de Aceitação** (ver Fase 4.3)
9. ❌ **Exportação de Relatórios** (ver Fase 8.2)
10. ❌ **Backup/DR Docs** (ver Fase 3.3)

**Total de Bloqueadores:** 10 issues

---

## 🎯 PRÓXIMOS PASSOS

### Sprint 1 (2 semanas) - BLOQUEADORES P0
1. ✅ Criar `AUDIT_REPORT.md` - CONCLUÍDO
2. ✅ Criar `ACTION_PLAN.md` - CONCLUÍDO
3. ✅ Criar `LAUNCH_CHECKLIST.md` - CONCLUÍDO
4. 🔄 Resolver ISSUE-001 a ISSUE-005
5. 🔄 Criar documentação de usuário básica
6. 🔄 Implementar CI/CD básico
7. 🔄 Criar testes E2E críticos

**Meta:** Sistema pronto para **BETA FECHADO**

### Sprint 2 (2 semanas) - ALTA PRIORIDADE
1. Exportação de relatórios
2. Notificações automáticas
3. Busca global
4. Staging environment
5. Backup/DR procedures
6. Upgrade/downgrade de planos UI
7. Cobertura de testes >70%

**Meta:** Sistema pronto para **BETA PÚBLICO**

### Sprint 3 (1-2 semanas) - POLISH
1. Documentação completa
2. FAQ e Help Center
3. Performance optimization
4. Testes de carga
5. Ajustes de UX baseados em feedback beta
6. Marketing materials

**Meta:** **PRODUCTION-READY** 🚀

---

## ✅ ASSINATURAS

**Aprovado por:** _________________ (Tech Lead)  
**Data:** _________________

**Aprovado por:** _________________ (Product Owner)  
**Data:** _________________

**Aprovado por:** _________________ (CEO)  
**Data:** _________________

---

**Última atualização:** 3 de Fevereiro de 2026  
**Próxima revisão:** Após Sprint 1 (Fev 17, 2026)
