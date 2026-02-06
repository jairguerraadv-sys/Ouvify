# 🎯 Backlog MVP - Ouvify

**Data:** 05 de Fevereiro de 2026  
**Status do MVP:** 88% completo - VIÁVEL para lançamento com pequenos ajustes

---

## 📊 OVERVIEW

**Completude Geral:** 88%  
**Bloqueadores (P0):** 0 ✅  
**Alta Prioridade (P1):** 4 itens ⚠️  
**Média Prioridade (P2):** 6 itens 📝  
**Baixa Prioridade (P3):** 3 itens ℹ️

**Esforço Total Estimado (P1):** 4-5 dias  
**Recomendação:** Implementar P1 antes do lançamento público

---

## 🚨 P0 - BLOQUEADORES CRÍTICOS

### Status: ✅ NENHUM BLOQUEADOR

**O projeto está PRONTO para MVP do ponto de vista técnico.**

Todos os componentes críticos estão funcionais:

- ✅ Multi-tenant isolation robusto
- ✅ Autenticação JWT com blacklist
- ✅ CRUD de feedbacks completo
- ✅ Rastreamento por protocolo
- ✅ Dashboard analytics
- ✅ Webhooks funcionais
- ✅ LGPD compliance básico
- ✅ Deploy automatizado (Render + Vercel)

---

## ⚠️ P1 - ALTA PRIORIDADE (para lançamento seguro)

### P1-001: Enforce 2FA em operações sensíveis 🔒

**Problema:** Operações críticas (mudança de senha, exclusão de conta, transferência de ownership) não exigem verificação 2FA mesmo se o usuário tem 2FA habilitado.

**Impacto:** Se a sessão de um admin for comprometida, atacante pode fazer mudanças irreversíveis.

**Esforço:** M (1 dia = 8h)

**Arquivos afetados:**

- `apps/backend/apps/core/views.py` (PasswordResetConfirmView)
- `apps/backend/apps/core/account_views.py` (DeleteAccountView)
- `apps/backend/apps/tenants/views.py` (transferir ownership)

**Solução proposta:**

```python
# Criar decorator
from functools import wraps
from rest_framework.exceptions import PermissionDenied

def require_2fa_verified(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.has_2fa_enabled and not request.session.get('2fa_verified_at'):
            raise PermissionDenied("Esta operação requer verificação 2FA")
        return view_func(request, *args, **kwargs)
    return wrapper

# Aplicar nas views
@require_2fa_verified
class DeleteAccountView(APIView):
    ...
```

**Critérios de aceite:**

- [ ] Mudança de senha exige 2FA se habilitado
- [ ] Exclusão de conta exige 2FA se habilitado
- [ ] Transferência de ownership exige 2FA se habilitado
- [ ] Mensagem de erro amigável quando 2FA não verificado
- [ ] Testado com usuário com 2FA habilitado e desabilitado

**Teste manual:**

1. Habilitar 2FA para um usuário
2. Fazer login
3. Tentar deletar conta SEM passar pelo flow de 2FA
4. Deve falhar com erro 403
5. Passar pelo flow de 2FA
6. Tentar deletar conta novamente
7. Deve permitir

---

### P1-002: Documentação de usuário completa 📚

**Problema:** Não existem guias detalhados para admins de empresas e usuários finais. Novos usuários não saberão usar o produto sem suporte constante.

**Impacto:** Alto custo de onboarding, tickets de suporte, frustração de usuários.

**Esforço:** L (2-3 dias = 20h)

**Arquivos a criar:**

- `/docs/USER_GUIDE_COMPANY_ADMIN.md` (novo)
- `/docs/USER_GUIDE_END_USER.md` (novo)
- `/docs/TROUBLESHOOTING.md` (novo)

**Conteúdo necessário - Guia Admin:**

1. **Primeiros Passos**
   - Como criar conta da empresa
   - Tour pela interface
   - Configuração inicial (logo, cores, domínio)

2. **Gestão de Equipe**
   - Como convidar membros
   - Explicação de roles (Owner/Admin/Viewer)
   - Como remover membros

3. **Gerenciamento de Feedbacks**
   - Como visualizar feedbacks recebidos
   - Workflow de triage (Novo → Em Análise → Resolvido)
   - Como atribuir para membro da equipe
   - Como responder ao usuário
   - Como adicionar notas internas
   - Como arquivar/fechar

4. **Analytics e Relatórios**
   - Como interpretar dashboard
   - Filtros disponíveis
   - Exportar relatórios

5. **Configurações Avançadas**
   - Webhooks (como configurar)
   - Notificações
   - Branding avançado
   - Integração com Slack/Discord

6. **Billing e Assinatura**
   - Como atualizar plano
   - Como gerenciar pagamento
   - O que acontece se assinatura expirar

**Conteúdo necessário - Guia Usuário Final:**

1.**Como enviar um feedback**

- Acessar o canal da empresa
- Escolher tipo (denúncia/reclamação/sugestão/elogio)
- Preencher formulário
- Anexar arquivos (opcional)
- Decidir: anônimo ou identificado

2. **Como acompanhar**
   - Salvar o código de protocolo (ex: OUVY-2026-0042)
   - Acessar página de acompanhamento
   - Inserir código
   - Ver histórico e status

3. **Status explicados**
   - **Novo:** Recebemos seu feedback
   - **Em Análise:** Equipe está avaliando
   - **Aguardando Informações:** Precisamos de mais detalhes
   - **Resolvido:** Concluído
   - **Arquivado:** Finalizado

4. **Privacidade e Anonimato**
   - O que acontece se enviar anônimo
   - Quais dados coletamos
   - Seus direitos (LGPD)
   - Como exportar/deletar dados

**Critérios de aceite:**

- [ ] Guia admin cobre 100% dos fluxos principais
- [ ] Guia usuário é compreensível para leigo
- [ ] Screenshots ou diagramas ilustrativos (mínimo 5 por guia)
- [ ] Seção de troubleshooting com top 10 problemas
- [ ] Links internos funcionais entre docs
- [ ] Revisado por alguém não-técnico

---

### P1-003: Rate limiting abrangente ⏱️

**Problema:** Alguns endpoints sensíveis não têm rate limiting, permitindo abuse.

**Impacto:** Brute force, DoS, spam de criação de contas.

**Esforço:** S (4h)

**Arquivos afetados:**

- `apps/backend/apps/core/views.py` (password reset, register)
- `apps/backend/apps/tenants/views.py` (register tenant)
- `apps/backend/config/settings.py` (config global)

**Solução proposta:**

```python
# Instalar django-ratelimit
# requirements/base.txt: django-ratelimit==4.1.0

# apps/backend/apps/core/views.py
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
class PasswordResetView(APIView):
    ...

@ratelimit(key='ip', rate='3/h', method='POST')
class RegisterView(APIView):
    ...

# Ou usar DRF throttle
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class SignupRateThrottle(AnonRateThrottle):
    rate = '3/hour'

class PasswordResetView(APIView):
    throttle_classes = [SignupRateThrottle]
```

**Endpoints que precisam rate limit:**

- [ ] `POST /api/auth/register/` - 3/hora por IP
- [ ] `POST /api/auth/password-reset/` - 5/hora por IP
- [ ] `POST / /api/register-tenant/` - 2/hora por IP
- [ ] `POST /api/token/` (login) - 10/min por IP (já existe?)
- [ ] `POST /api/feedbacks/` - 10/min por IP (anônimo)

**Critérios de aceite:**

- [ ] Todos os endpoints sensíveis têm rate limit
- [ ] Response 429 (Too Many Requests) quando exceder
- [ ] Mensagem de erro amigável com tempo de retry
- [ ] Testado com script automatizado
- [ ] Não bloqueia usuários legítimos em uso normal

---

### P1-004: Executar e documentar auditorias de dependências 🔍

**Problema:** pip-audit e npm audit não foram executados completamente. CVEs desconhecidas podem existir.

**Impacto:** Vulnerabilidades críticas não identificadas.

**Esforço:** S (2h)

**Tarefas:**

1. Backend: `pip-audit --requirement requirements/base.txt --format json > audit/evidence/pip_audit_final.json`
2. Frontend: `npm audit --json > audit/evidence/npm_audit_final.json`
3. Analisar outputs
4. Para cada CVE high/critical:
   - Avaliar se afeta o projeto (falso positivo?)
   - Se afeta: atualizar lib ou aplicar workaround
   - Se não afeta: documentar motivo
5. Criar `/audit/DEPENDENCY_AUDIT_$(date +%Y%m%d).md` com:
   - Lista de todas as CVEs encontradas
   - Severidade de cada uma
   - Status (Fixed/Mitigated/Accepted/False Positive)
   - Plano de ação para não resolvidas

**Critérios de aceite:**

- [ ] pip-audit executado sem erros
- [ ] npm audit executado sem erros
- [ ] Zero CVEs critical não resolvidas
- [ ] CVEs high têm plano de mitigação documentado
- [ ] Relatório salvo em `/audit/DEPENDENCY_AUDIT_*.md`
- [ ] Processo documentado para auditorias mensais

---

## 📝 P2 - MÉDIA PRIORIDADE (melhorias pré-lançamento)

### P2-001: Índices adicionais de database

**Esforço:** S (2h)  
**Impacto:** Performance 20-30% melhor em dashboards com muitos feedbacks

**Arquivos:** `apps/backend/apps/feedbacks/models.py`, nova migration

**Índices a adicionar:**

```python
class Meta:
    indexes = [
        # Já existentes (manter)
        models.Index(fields=['client', 'status', '-data_criacao']),
        models.Index(fields=['client', 'tipo']),

        # NOVOS
        models.Index(fields=['client', 'prioridade', '-data_criacao']),
        models.Index(fields=['client', 'atribuido_para', 'status']),
        models.Index(fields=['protocolo']),  # busca por protocolo é comum
    ]
```

---

### P2-002: Connection pooling (CONN_MAX_AGE)

**Esforço:** S (1h)  
**Impacto:** Reduz latência média 15-20%, reduz conexões ao DB

`**Arquivo:**`apps/backend/config/settings.py`

```python
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,  # 10 minutos
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30s timeout
        }
    }
}
```

---

### P2-003: localStorage → httpOnly cookies (tokens)

**Esforço:** M (1 dia)  
**Impacto:** Elimina risco de XSS vazar tokens

**Arquivos:**

- `apps/backend/config/settings.py` (config de cookies)
- `apps/frontend/lib/api.ts` (remover localStorage)
- `apps/frontend/lib/auth.ts` (adaptar para cookies)

**Mudanças necessárias:**

- Backend define cookies httpOnly no response de login
- Frontend não armazena tokens manualmente
- CORS precisa de `credentials: 'include'`
- SameSite=Strict para proteção CSRF

---

### P2-004: Política de retenção automatizada (LGPD)

**Esforço:** M (1 dia)  
**Impacto:** Compliance LGPD garantido

**Arquivo:** criar `apps/backend/apps/feedbacks/tasks.py`

```python
from celery import shared_task
from datetime import timedelta
from django.utils import timezone

@shared_task
def cleanup_old_feedbacks():
    """Deleta feedbacks arquivados há mais de 2 anos"""
    cutoff_date = timezone.now() - timedelta(days=730)
    old_feedbacks = Feedback.objects.filter(
        status='ARQUIVADO',
        data_atualizacao__lt=cutoff_date
    )
    count = old_feedbacks.count()
    old_feedbacks.delete()
    return f'Deleted {count} old feedbacks'
```

Agendar no Celery Beat para rodar mensalmente.

---

### P2-005: Runbook operacional completo

**Esforço:** M (1 dia)  
**Impacto:** Reduz tempo de resposta a incidentes de horas para minutos

**Arquivo:** `/docs/RUNBOOK.md`

**Seções obrigatórias:**

1. Procedimentos de backup (DB, media)
2. Restore de backup
3. Rotação de secrets (SECRET_KEY, Stripe, Cloudinary)
4. Como acessar logs (Render, Sentry, ElasticSearch)
5. Troubleshooting top 10 problemas
6. Resposta a incidentes de segurança
7. Escalação (quem chamar quando)
8. Runbook de deploy manual (se CI falhar)

---

### P2-006: E2E tests no CI/CD

**Esforço:** M (1 dia)  
**Impacto:** Detecta regressões antes de chegar em produção

**Arquivo:** `.github/workflows/e2e-tests.yml` (criar)

```yaml
name: E2E Tests
on: [pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run backend
        run: |
          cd apps/backend
          docker-compose up -d
      - name: Run frontend
        run: |
          cd apps/frontend
          npm install
          npm run dev &
      - name: Run Playwright
        run: |
          cd apps/frontend
          npx playwright test
```

**Tests prioritários:**

- Login/logout
- Criar feedback (anônimo e identificado)
- Buscar por protocolo
- Admin: ver dashboard, responder feedback

---

## ℹ️ P3 - BAIXA PRIORIDADE (pós-lançamento)

### P3-001: Limpeza de arquivos .pyc

**Esforço:** S (30min)  
**Impacto:** Limpeza do repo

Adicionar ao `.gitignore`:

```
**/*.pyc
**/__pycache__/
**/.pytest_cache/
```

Executar: `git rm --cached -r **/*.pyc`

---

### P3-002: Remover arquivos não usados

**Esforço:** S (2h)  
**Impacto:** Reduz confusão no código

Revisar e remover:

- `apps/tenants/logout_views.py`
- `apps/tenants/jwt_views.py`
- `apps/tenants/subscription_management.py`

Ou adicionar docstring explicando por que existem.

---

### P3-003: APM (Application Performance Monitoring)

**Esforço:** M (1 dia)  
**Impacto:** Observabilidade avançada

Opções:

- DataDog APM
- New Relic
- Elastic APM (já tem ElasticSearch)

Métricas a rastrear:

- Latência por endpoint (p50, p95, p99)
- Taxa de erros
- Throughput (req/s)
- DB query time
- Celery task duration

---

## 📊 ESTIMATIVAS TOTAIS

### Por Prioridade

- **P0:** 0 dias ✅
- **P1:** 4-5 dias (32-40h)
- **P2:** 6-7 dias (48-56h)
- **P3:** 2 dias (16h)

**Total:** 12-14 dias de trabalho completo

### Cenários de Lançamento

**🚀 Lançamento Rápido (1 semana):**

- Implementar apenas P1
- Lançar com documentação básica
- Iterar baseado em feedback

**✅ Lançamento Ideal (2-3 semanas):**

- Implementar P1 completo
- Implementar P2 selecionados (índices, pooling, runbook)
- Lançar com confiança

**🎯 Lançamento Premium (4 semanas):**

- Implementar P1 + P2 completos
- Alguns itens P3
- 100% polido e profissional

---

## 🎯 RECOMENDAÇÃO FINAL

**Sugerimos o "Lançamento Ideal" em 2-3 semanas:**

**Semana 1 (P1):**

- Dia 1-2: 2FA em operações sensíveis
- Dia 3-4: Documentação de usuário
- Dia 5: Rate limiting + Dependency audit

**Semana 2 (P2 críticos):**

- Dia 1: Índices de DB + Connection pooling
- Dia 2: Política de retenção LGPD
- Dia 3: Runbook operacional
- Dia 4-5: E2E tests no CI

**Semana 3 (Buffer e QA):**

- Testes integrados
- Correções de bugs encontrados
- Preparação final de lançamento

---

**Próxima ação:** Revisar este backlog com o time e priorizar pela capacidade disponível.

**Atualizado em:** 05/02/2026  
**Próxima revisão:** Após implementação de cada item P1
