# 📋 ACTION PLAN - Ouvify

Plano de ação priorizado com backlog de implementações, estimativas e critérios de aceite.

**Data:** 31/01/2026
**Versão Alvo:** MVP (v1.0.0)
**Completude Atual:** 92%

---

## Resumo Executivo

| Categoria   | Itens | Esforço Total | Prioridade |
| ----------- | ----- | ------------- | ---------- |
| 🔴 Críticos | 1     | 3 dias        | P0         |
| 🟡 Altos    | 4     | 8 dias        | P1         |
| 🔵 Médios   | 6     | 12 dias       | P2         |
| ⚪ Baixos   | 8     | 16 dias       | P3         |

**Total estimado para MVP completo:** ~11 dias de desenvolvimento

---

## Auditoria de Segurança (PARTE 1–2) — Status

Data: 03/02/2026

- ✅ PARTE 1 (estrutura, dependências, hygiene): concluída e validada.
- ✅ PARTE 2 (auth/ACL/multi-tenancy): concluída e validada (isolamento por tenant com JWT no middleware, hardening do boundary de tenant, throttling em endpoints públicos sensíveis, convite/branding com autorização reforçada).

Artefatos:

- `AUDIT_REPORT.md` (relatório com evidências)

Próximo passo:

- Iniciar PARTE 3 (auth/access mais amplo: superfícies de ataque, permissões por rota, sessão/tokens, CSRF/CORS, headers e políticas de cookie).

## 🔴 PRIORIDADE 0 - CRÍTICOS (Bloqueia Lançamento)

### AP-001: Implementar Interface de Webhooks

**Descrição:**
A funcionalidade de webhooks existe no backend mas não há UI para gerenciamento.

**Escopo:**

- Página de listagem de webhooks
- Modal de criação/edição
- Página de logs de entregas
- Botão de retry manual
- Validação de URL

**Esforço:** 3 dias

**Arquivos envolvidos:**

- `apps/frontend/app/webhooks/page.tsx` (criar)
- `apps/frontend/app/webhooks/[id]/page.tsx` (criar)
- `apps/frontend/components/webhooks/WebhookForm.tsx` (criar)
- `apps/frontend/components/webhooks/WebhookLogs.tsx` (criar)

**Critérios de Aceite:**

- [ ] Listar webhooks existentes com status
- [ ] Criar novo webhook com URL e eventos
- [ ] Editar/excluir webhook existente
- [ ] Visualizar logs das últimas 100 entregas
- [ ] Fazer retry de entrega falha
- [ ] Testes unitários (>80% coverage)

**Dependências:** Nenhuma

---

## 🟡 PRIORIDADE 1 - ALTOS (MVP+ / Semana 1-2)

### AP-002: Aumentar Cobertura de Testes Backend

**Descrição:**
A cobertura atual é ~75%, precisa chegar a 80% mínimo.

**Escopo:**

- Testes de edge cases em feedbacks
- Testes de erros em billing
- Testes de rate limiting
- Testes de sanitização

**Esforço:** 2 dias

**Arquivos envolvidos:**

- `apps/backend/apps/feedbacks/tests/test_edge_cases.py` (criar)
- `apps/backend/apps/billing/tests/test_errors.py` (criar)
- `apps/backend/apps/core/tests/test_rate_limiting.py` (criar)

**Critérios de Aceite:**

- [ ] Coverage backend ≥ 80%
- [ ] Todos os endpoints críticos testados
- [ ] Testes de integração completos
- [ ] CI passando

**Dependências:** Nenhuma

---

### AP-003: Aumentar Cobertura de Testes Frontend

**Descrição:**
A cobertura atual é ~45%, precisa chegar a 60% mínimo.

**Escopo:**

- Testes de componentes de formulário
- Testes de páginas principais
- Testes de hooks customizados
- Testes E2E de fluxos críticos

**Esforço:** 3 dias

**Arquivos envolvidos:**

- `apps/frontend/__tests__/components/*.test.tsx`
- `apps/frontend/__tests__/pages/*.test.tsx`
- `apps/frontend/e2e/*.spec.ts`

**Critérios de Aceite:**

- [ ] Coverage frontend ≥ 60%
- [ ] Componentes de formulário testados
- [ ] Páginas principais testadas
- [ ] E2E dos fluxos de login, feedback, dashboard
- [ ] CI passando

**Dependências:** Nenhuma

---

### AP-004: Criar Guias de Usuário

**Descrição:**
Documentação para diferentes perfis de usuário.

**Escopo:**

- Guia Cliente Empresa (admin)
- Guia Usuário Final (consumidor)
- Guia Super Admin (suporte interno)

**Esforço:** 2 dias

**Arquivos envolvidos:**

- `docs/GUIA_CLIENTE_EMPRESA.md` (criar)
- `docs/GUIA_USUARIO_FINAL.md` (criar)
- `docs/GUIA_SUPER_ADMIN.md` (criar)

**Critérios de Aceite:**

- [ ] Guia com screenshots
- [ ] Passo a passo de funcionalidades
- [ ] FAQ por perfil
- [ ] Troubleshooting comum
- [ ] Revisão por Product

**Dependências:** Nenhuma

---

### AP-005: Configurar Alertas de Monitoramento

**Descrição:**
Alertas automáticos para erros e degradação de performance.

**Escopo:**

- Alertas Sentry por email/Slack
- Threshold de erro rate
- Alertas de lentidão de API
- Alertas de uso de recursos

**Esforço:** 1 dia

**Arquivos envolvidos:**

- Configuração Sentry (web)
- Configuração Railway (web)
- `.github/workflows/monitoring.yml` (opcional)

**Critérios de Aceite:**

- [ ] Alerta quando error rate > 5%
- [ ] Alerta quando API p95 > 1s
- [ ] Notificação em Slack/email
- [ ] Documentação de runbook

**Dependências:** Sentry configurado ✅

---

## 🔵 PRIORIDADE 2 - MÉDIOS (V1.1 / Semana 3-4)

### AP-006: Implementar Exportação de Relatórios

**Descrição:**
Exportar feedbacks e métricas em PDF e Excel.

**Escopo:**

- Exportar listagem de feedbacks (CSV/Excel)
- Exportar relatório do dashboard (PDF)
- Filtros na exportação
- Geração assíncrona para grandes volumes

**Esforço:** 3 dias

**Arquivos envolvidos:**

- `apps/backend/apps/feedbacks/views.py`
- `apps/backend/apps/feedbacks/exporters.py` (criar)
- `apps/frontend/components/ExportButton.tsx` (criar)

**Critérios de Aceite:**

- [ ] Exportar CSV/Excel com filtros aplicados
- [ ] Exportar PDF do dashboard
- [ ] Progress indicator para grandes volumes
- [ ] Limite de registros configurável
- [ ] Testes de geração

**Dependências:** AP-001

---

### AP-007: Implementar Notificações Real-time

**Descrição:**
Notificações push via WebSocket para novos feedbacks.

**Escopo:**

- WebSocket connection (Django Channels)
- Frontend listener
- Toast de notificação
- Badge counter no header

**Esforço:** 2 dias

**Arquivos envolvidos:**

- `apps/backend/apps/notifications/consumers.py` (criar)
- `apps/backend/config/asgi.py`
- `apps/frontend/hooks/useWebSocket.ts` (criar)
- `apps/frontend/components/NotificationBell.tsx`

**Critérios de Aceite:**

- [ ] WebSocket conecta ao carregar dashboard
- [ ] Toast aparece em novo feedback
- [ ] Badge atualiza em tempo real
- [ ] Reconnect automático
- [ ] Fallback para polling

**Dependências:** Redis configurado ✅

---

### AP-008: Cache em Endpoints Críticos

**Descrição:**
Implementar cache Redis nos endpoints mais acessados.

**Escopo:**

- Cache de dashboard metrics
- Cache de feedbacks list (por query)
- Cache de configurações do tenant
- Invalidação inteligente

**Esforço:** 1 dia

**Arquivos envolvidos:**

- `apps/backend/apps/feedbacks/views.py`
- `apps/backend/apps/core/cache.py` (criar)
- `apps/backend/config/cache_config.py`

**Critérios de Aceite:**

- [ ] Dashboard carrega 2x mais rápido
- [ ] Hit rate > 70%
- [ ] Invalidação em write operations
- [ ] TTL configurável
- [ ] Métricas de cache

**Dependências:** Redis configurado ✅

---

### AP-009: Integração Slack

**Descrição:**
Notificações de feedbacks no Slack.

**Escopo:**

- OAuth Slack
- Webhook para canal
- Configuração por tenant
- Tipos de eventos configuráveis

**Esforço:** 2 dias

**Arquivos envolvidos:**

- `apps/backend/apps/integrations/slack.py` (criar)
- `apps/frontend/app/settings/integrations/slack/page.tsx` (criar)

**Critérios de Aceite:**

- [ ] OAuth flow funcional
- [ ] Notificação em novo feedback
- [ ] Configurar canal por evento
- [ ] Desabilitar integração
- [ ] Documentação de setup

**Dependências:** AP-001

---

### AP-010: Postman Collection

**Descrição:**
Collection Postman documentada para a API.

**Escopo:**

- Todos os endpoints documentados
- Variáveis de ambiente
- Exemplos de request/response
- Fluxos de teste automatizado

**Esforço:** 1 dia

**Arquivos envolvidos:**

- `docs/ouvify-api.postman_collection.json` (criar)
- `docs/ouvify-api.postman_environment.json` (criar)

**Critérios de Aceite:**

- [ ] Todos os endpoints incluídos
- [ ] Variáveis de ambiente
- [ ] Exemplos funcionais
- [ ] Tests scripts básicos
- [ ] Publicado no Postman

**Dependências:** Swagger funcionando ✅

---

### AP-011: Bulk Actions em Feedbacks

**Descrição:**
Ações em massa na listagem de feedbacks.

**Escopo:**

- Seleção múltipla
- Alterar status em massa
- Adicionar tags em massa
- Excluir em massa (com confirmação)

**Esforço:** 2 dias

**Arquivos envolvidos:**

- `apps/backend/apps/feedbacks/views.py`
- `apps/frontend/app/feedbacks/page.tsx`
- `apps/frontend/components/feedbacks/BulkActions.tsx` (criar)

**Critérios de Aceite:**

- [ ] Checkbox de seleção
- [ ] Select all / deselect all
- [ ] Barra de ações em massa
- [ ] Confirmação para delete
- [ ] Feedback de sucesso/erro
- [ ] Limite de 100 itens

**Dependências:** Nenhuma

---

## ⚪ PRIORIDADE 3 - BAIXOS (V1.2+ / Backlog)

### AP-012: FAQ Interativo

**Esforço:** 1 dia
**Escopo:** Página de FAQ com busca e categorias

### AP-013: Dark Mode

**Esforço:** 2 dias
**Escopo:** Toggle de tema, persistência em localStorage

### AP-014: Keyboard Shortcuts

**Esforço:** 1 dia
**Escopo:** Atalhos para ações comuns (K para busca, N para novo, etc)

### AP-015: Dashboard Drill-down

**Esforço:** 3 dias
**Escopo:** Clicar em métrica para ver detalhes

### AP-016: API Pública Versionada

**Esforço:** 3 dias
**Escopo:** /api/v1/ com rate limit separado e API keys

### AP-017: SSO SAML

**Esforço:** 5 dias
**Escopo:** Integração com IdPs corporativos

### AP-018: Mobile App (React Native)

**Esforço:** 20 dias
**Escopo:** App básico para visualizar feedbacks

### AP-019: White-label Avançado

**Esforço:** 5 dias
**Escopo:** Custom domain, logo, cores por tenant

---

## Cronograma Sugerido

### Sprint 1 (Semana 1) - 5 dias

| Dia | Task                  | Responsável  | Status |
| --- | --------------------- | ------------ | ------ |
| 1-3 | AP-001 Webhooks UI    | Frontend Dev | 🔴     |
| 4-5 | AP-002 Testes Backend | Backend Dev  | 🟡     |

### Sprint 2 (Semana 2) - 5 dias

| Dia | Task                   | Responsável  | Status |
| --- | ---------------------- | ------------ | ------ |
| 1-3 | AP-003 Testes Frontend | Frontend Dev | 🟡     |
| 4-5 | AP-004 Guias           | Tech Writer  | 🟡     |
| 5   | AP-005 Alertas         | DevOps       | 🟡     |

### Sprint 3 (Semana 3) - MVP Release! 🚀

| Dia | Task                  | Responsável | Status |
| --- | --------------------- | ----------- | ------ |
| 1   | Code freeze           | Team        | ⬜     |
| 2   | QA final              | QA          | ⬜     |
| 3   | Deploy staging        | DevOps      | ⬜     |
| 4   | UAT                   | Product     | ⬜     |
| 5   | **PRODUCTION DEPLOY** | Team        | ⬜     |

### Sprint 4+ (V1.1)

- AP-006 Exportação
- AP-007 Notificações
- AP-008 Cache
- AP-009 Slack

---

## Definition of Done (DoD)

Para cada task ser considerada DONE:

- [ ] Código implementado e funcionando
- [ ] Testes unitários passando
- [ ] Testes de integração (se aplicável)
- [ ] Code review aprovado
- [ ] Zero erros de lint
- [ ] Documentação atualizada
- [ ] Deploy em staging
- [ ] QA aprovado
- [ ] Merge para main

---

## Riscos Identificados

| Risco                 | Probabilidade | Impacto | Mitigação                   |
| --------------------- | ------------- | ------- | --------------------------- |
| Atraso Webhooks UI    | Média         | Alto    | Priorizar, pair programming |
| Coverage não atingida | Baixa         | Médio   | Adicionar mais devs         |
| Instabilidade em prod | Baixa         | Alto    | Monitoramento rigoroso      |
| Bugs de multi-tenancy | Baixa         | Crítico | Testes exaustivos           |

---

## Métricas de Sucesso

### Lançamento MVP

- [ ] Zero bugs críticos em produção
- [ ] Uptime > 99.5%
- [ ] API p95 < 500ms
- [ ] NPS interno > 7

### 30 dias pós-lançamento

- [ ] 10+ clientes ativos
- [ ] 1000+ feedbacks processados
- [ ] Zero vazamentos de dados
- [ ] <5 bugs reportados por semana

---

## Contatos

| Role      | Nome | Contato               |
| --------- | ---- | --------------------- |
| Tech Lead | -    | tech@ouvify.com.br    |
| Product   | -    | product@ouvify.com.br |
| DevOps    | -    | devops@ouvify.com.br  |
| QA        | -    | qa@ouvify.com.br      |

---

_Última atualização: 31/01/2026_
_Próxima revisão: 07/02/2026_
