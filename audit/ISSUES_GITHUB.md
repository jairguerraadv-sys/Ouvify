# 📋 Issues GitHub - Auditoria Ouvify 2026-01-30

Este documento lista as issues a serem criadas no GitHub, organizadas por prioridade.

---

## 🔴 CRITICAL (P0) - Bloqueia Deploy

### Issue #1: [SEC] Verificar SECRET_KEY em Produção (Railway)
**Labels:** `security`, `critical`, `devops`
**Assignee:** DevOps Lead

**Descrição:**
O arquivo `.env` local contém uma SECRET_KEY de desenvolvimento (`django-insecure-dev-key-for-local-only-do-not-use-in-production`).

**Ação Requerida:**
1. Verificar no Railway se a variável `SECRET_KEY` está definida com valor diferente
2. Se não estiver, gerar nova chave: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
3. Documentar o processo em `/docs/deploy-railway.md`

**Evidência:** `apps/backend/.env` linha 7
**Impacto:** Possível comprometimento total do sistema em produção
**Tempo Estimado:** 15 minutos

---

### Issue #2: [CLEANUP] Remover virtualenvs duplicados (venv/ e .venv/)
**Labels:** `cleanup`, `critical`
**Assignee:** Backend Developer

**Descrição:**
Existem dois diretórios de virtualenv na raiz do projeto, causando confusão e possíveis inconsistências de dependências.

**Ação Requerida:**
```bash
# Verificar se estão no git
git ls-files venv/ .venv/

# Remover do git se estiverem
git rm -r --cached venv/ .venv/

# Padronizar para apenas um
rm -rf .venv/  # Manter apenas venv/
```

**Evidência:** `find . -type d -name "venv"` retorna dois diretórios
**Tempo Estimado:** 10 minutos

---

## 🟠 HIGH (P1) - Antes do Release

### Issue #3: [BUG] Link quebrado para /notifications
**Labels:** `bug`, `high`, `frontend`
**Assignee:** Frontend Developer

**Descrição:**
O componente `NotificationCenter.tsx` referencia a rota `/notifications` que não existe no App Router.

**Ação Requerida:**
1. Criar `apps/frontend/app/(dashboard)/notifications/page.tsx` com listagem de notificações
2. OU alterar o link para rota existente

**Evidência:** `apps/frontend/components/notifications/NotificationCenter.tsx` linha 274
**Tempo Estimado:** 1 hora

---

### Issue #4: [PERF] Adicionar select_related em WebhookDeliveryViewSet
**Labels:** `performance`, `high`, `backend`
**Assignee:** Backend Developer

**Descrição:**
O queryset de `WebhookDeliveryViewSet` não usa `select_related`, causando N+1 queries.

**Ação Requerida:**
```python
# apps/backend/apps/webhooks/views.py linha 160
def get_queryset(self):
    tenant = get_current_tenant()
    if not tenant:
        return WebhookDelivery.objects.none()
    return WebhookDelivery.objects.filter(
        endpoint__client=tenant
    ).select_related('endpoint', 'event').order_by('-created_at')[:100]
```

**Evidência:** Arquivo `apps/backend/apps/webhooks/views.py`
**Tempo Estimado:** 15 minutos

---

### Issue #5: [SEC] Verificar dados expostos no endpoint consultar-protocolo
**Labels:** `security`, `high`, `backend`
**Assignee:** Backend Developer

**Descrição:**
O endpoint público `/api/feedbacks/consultar-protocolo/` pode estar expondo dados sensíveis (email_contato) na resposta.

**Ação Requerida:**
1. Revisar `FeedbackConsultaSerializer` 
2. Garantir que apenas campos públicos são retornados:
   - protocolo, tipo_display, status_display, data_criacao
   - interacoes públicas (não notas internas)
   - NÃO incluir: email_contato, IP, autor

**Evidência:** Endpoint está na lista EXEMPT_URLS
**Tempo Estimado:** 30 minutos

---

### Issue #6: [LGPD] Implementar exclusão completa de dados (Right to be Forgotten)
**Labels:** `lgpd`, `compliance`, `high`, `backend`
**Assignee:** Backend Developer

**Descrição:**
Verificar se a exclusão de conta (`AccountDeletionView`) remove TODOS os dados pessoais conforme LGPD.

**Ação Requerida:**
1. Verificar cascade deletes nos models
2. Listar todas as tabelas que contêm PII
3. Implementar processo de anonimização para dados que devem ser mantidos (audit log)
4. Documentar em `/docs/lgpd.md`

**Evidência:** `apps/backend/apps/core/lgpd_views.py`
**Tempo Estimado:** 2 horas

---

### Issue #7: [DOC] Criar .env.example para backend
**Labels:** `documentation`, `high`
**Assignee:** Backend Developer

**Descrição:**
O backend não possui arquivo `.env.example` documentando as variáveis de ambiente necessárias.

**Ação Requerida:**
Criar `apps/backend/.env.example` com todas as variáveis:
- SECRET_KEY (obrigatório em produção)
- DEBUG
- DATABASE_URL / DATABASE_PRIVATE_URL
- ALLOWED_HOSTS
- CORS_ALLOWED_ORIGINS
- SENTRY_DSN
- CLOUDINARY_URL
- REDIS_URL
- EMAIL_* 
- STRIPE_*

**Tempo Estimado:** 30 minutos

---

## 🟡 MEDIUM (P2) - Próximo Sprint

### Issue #8: [REFACTOR] Remover duplicação em settings.py
**Labels:** `refactor`, `medium`, `backend`
**Assignee:** Backend Developer

**Descrição:**
O arquivo `settings.py` tem configurações de segurança duplicadas em dois blocos `if not DEBUG`.

**Ação Requerida:**
Consolidar todas as configurações de produção em um único bloco.

**Evidência:** Linhas 91-98 e 424-433
**Tempo Estimado:** 30 minutos

---

### Issue #9: [REFACTOR] Remover BASE_DIR duplicado
**Labels:** `refactor`, `medium`, `backend`

**Descrição:**
`BASE_DIR` é definido duas vezes consecutivas no settings.py.

**Evidência:** Linhas 25-26
**Tempo Estimado:** 5 minutos

---

### Issue #10: [TEST] Aumentar cobertura de testes
**Labels:** `testing`, `medium`
**Assignee:** QA Engineer

**Descrição:**
Faltam testes para módulos críticos:
- `apps/webhooks/` 
- `apps/billing/`
- `apps/consent/`

**Ação Requerida:**
1. Criar testes de integração para webhooks
2. Criar testes de feature gating
3. Criar testes de consentimento LGPD

**Tempo Estimado:** 4 horas

---

### Issue #11: [DOC] Completar documentação em /docs
**Labels:** `documentation`, `medium`
**Assignee:** Tech Writer

**Descrição:**
Criar/atualizar os seguintes documentos:
- `/docs/README.md` - Índice geral
- `/docs/setup-local.md` - Setup de desenvolvimento
- `/docs/deploy-railway.md` - Deploy do backend
- `/docs/deploy-vercel.md` - Deploy do frontend
- `/docs/admin-manual.md` - Manual do admin
- `/docs/user-manual.md` - Manual do usuário
- `/docs/security.md` - Controles de segurança
- `/docs/lgpd.md` - Conformidade LGPD

**Tempo Estimado:** 8 horas

---

## 🔵 LOW (P3) - Backlog

### Issue #12: [REFACTOR] Completar Type Hints Python
**Labels:** `refactor`, `low`, `backend`

**Descrição:**
Adicionar type hints completos em todos os arquivos Python para melhorar a manutenibilidade.

**Tempo Estimado:** 4 horas (incremental)

---

### Issue #13: [PERF] Revisar índices do banco de dados
**Labels:** `performance`, `low`, `backend`

**Descrição:**
Analisar queries lentas e adicionar índices compostos se necessário.

**Nota:** Já existem índices bem configurados no modelo Feedback.

---

## 📊 Resumo de PRs Sugeridos

| PR | Issues Relacionadas | Prioridade | Reviewer |
|----|---------------------|------------|----------|
| PR #1: fix/security-secrets | #1 | P0 | Security Lead |
| PR #2: chore/cleanup-venvs | #2 | P0 | Backend Lead |
| PR #3: feat/notifications-page | #3 | P1 | Frontend Lead |
| PR #4: perf/webhook-queries | #4 | P1 | Backend Lead |
| PR #5: fix/protocolo-serializer | #5 | P1 | Security Lead |
| PR #6: feat/lgpd-deletion | #6 | P1 | Backend Lead |
| PR #7: docs/env-example | #7 | P1 | Backend Lead |
| PR #8: refactor/settings-cleanup | #8, #9 | P2 | Backend Lead |
| PR #9: test/coverage-increase | #10 | P2 | QA Lead |
| PR #10: docs/complete-docs | #11 | P2 | Tech Writer |

---

## 🚀 Ordem de Execução dos PRs

1. **Semana 1 (Antes do Deploy):**
   - PR #1: fix/security-secrets ✅
   - PR #2: chore/cleanup-venvs ✅

2. **Semana 2 (Antes do Release):**
   - PR #3: feat/notifications-page
   - PR #4: perf/webhook-queries
   - PR #5: fix/protocolo-serializer
   - PR #6: feat/lgpd-deletion
   - PR #7: docs/env-example

3. **Sprint Seguinte:**
   - PR #8: refactor/settings-cleanup
   - PR #9: test/coverage-increase
   - PR #10: docs/complete-docs
