# Sprint 2 - Sistema de Gestão de Feedbacks Avançado

## Resumo do Sprint

**Período:** 27/01/2026
**Estimativa:** 42 horas
**Realizado:** ~38 horas
**Status:** ✅ COMPLETO

---

## Features Implementadas

### Feature 1: Sistema de Atribuição de Feedbacks (6h) ✅

**Commit:** `369a5d1`

**Funcionalidades:**
- Atribuição de feedbacks para membros da equipe
- Registro de quem atribuiu e quando
- Filtros: `assigned_to_me`, `unassigned`
- Validação: apenas membros do mesmo tenant

**Arquivos modificados:**
- `apps/feedbacks/models.py` - Campos: `assigned_to`, `assigned_at`, `assigned_by`
- `apps/feedbacks/serializers.py` - Serialização de campos de atribuição
- `apps/feedbacks/filters.py` - Filtros de atribuição

**Testes:** `tests/test_feedback_assignment.py` - 5 testes

---

### Feature 2: Email Notifications com Celery (6h) ✅

**Commit:** `0226ac4`

**Funcionalidades:**
- Notificação por email em novo feedback
- Notificação por email em mudança de status
- Notificação por email em resposta
- Tasks assíncronos com Celery + Redis

**Arquivos modificados:**
- `apps/notifications/tasks.py` - Tasks Celery
- `apps/feedbacks/signals.py` - Triggers de notificação
- `apps/core/services.py` - EmailService

**Configuração:**
```python
# settings.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

---

### Feature 3: Sistema de Tags/Labels (6h) ✅

**Commit:** `ad553f6`

**Funcionalidades:**
- Modelo Tag com cor e descrição
- Relação Many-to-Many com Feedback
- Filtro por tags (any/all)
- Contagem de feedbacks por tag

**Arquivos modificados:**
- `apps/feedbacks/models.py` - Modelo Tag, relação M2M
- `apps/feedbacks/serializers.py` - TagSerializer
- `apps/feedbacks/filters.py` - Filtros: `tags`, `tags__all`

**Testes:** `tests/test_tags.py` - 3 testes

**Exemplo de uso:**
```python
# Criar tag
tag = Tag.objects.create(
    nome="Bug",
    cor="#FF0000",
    descricao="Reportes de bugs",
    client=tenant
)

# Adicionar tag ao feedback
feedback.tags.add(tag)

# Filtrar por tag
Feedback.objects.filter(tags=tag)
```

---

### Feature 4: Sistema de Prioridade (4h) ✅

**Commit:** `06d091e`

**Funcionalidades:**
- Campo prioridade com 4 níveis
- Filtro por prioridade na API
- Ordenação por prioridade
- Default: "media"

**Níveis de prioridade:**
| Valor | Label | Descrição |
|-------|-------|-----------|
| baixa | Baixa | Pode esperar |
| media | Média | Normal (default) |
| alta | Alta | Urgente |
| critica | Crítica | Crítico |

**Arquivos modificados:**
- `apps/feedbacks/models.py` - Campo `prioridade`
- `apps/feedbacks/serializers.py` - Serialização
- `apps/feedbacks/filters.py` - Filtro `prioridade`

**Migration:** `0010_add_prioridade`

**Testes:** `tests/test_prioridade.py` - 5 testes

---

### Feature 5: SLA Tracking (12h) ✅

**Commit:** `c95103e`

**Funcionalidades:**
- Rastreamento de tempo de primeira resposta
- Rastreamento de tempo de resolução
- Verificação automática de SLA
- Signals para auto-cálculo

**Campos adicionados:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tempo_primeira_resposta` | DurationField | Tempo até primeira resposta |
| `tempo_resolucao` | DurationField | Tempo até resolução |
| `data_primeira_resposta` | DateTimeField | Data/hora da primeira resposta |
| `data_resolucao` | DateTimeField | Data/hora da resolução |
| `sla_primeira_resposta` | BooleanField | True se dentro do SLA |
| `sla_resolucao` | BooleanField | True se dentro do SLA |

**SLA Padrão:**
- Primeira resposta: 24 horas
- Resolução: 72 horas

**Métodos do modelo:**
```python
# Registrar primeira resposta
feedback.registrar_primeira_resposta()

# Registrar resolução
feedback.registrar_resolucao()

# Calcular SLA customizado
feedback.calcular_sla_primeira_resposta(sla_horas=48)
feedback.calcular_sla_resolucao(sla_horas=120)
```

**Signals automáticos:**
- `registrar_primeira_resposta_sla` - Auto-calcula ao criar interação
- `registrar_resolucao_sla` - Auto-calcula ao mudar status para 'resolvido'

**Migration:** `0011_add_sla_tracking`

**Testes:** `tests/test_sla.py` - 13 testes

---

## Resumo de Testes

| Feature | Arquivo | Testes |
|---------|---------|--------|
| Atribuição | test_feedback_assignment.py | 5 |
| Tags | test_tags.py | 3 |
| Prioridade | test_prioridade.py | 5 |
| SLA | test_sla.py | 13 |
| **TOTAL** | - | **26** |

**Comando para rodar todos os testes:**
```bash
cd apps/backend
TESTING=true python -m pytest tests/test_feedback_assignment.py tests/test_tags.py tests/test_prioridade.py tests/test_sla.py -v
```

---

## API Endpoints

### Feedbacks

```
GET    /api/v1/feedbacks/              # Lista feedbacks
POST   /api/v1/feedbacks/              # Cria feedback
GET    /api/v1/feedbacks/{id}/         # Detalhe
PATCH  /api/v1/feedbacks/{id}/         # Atualiza
DELETE /api/v1/feedbacks/{id}/         # Remove
```

**Filtros disponíveis:**
- `?assigned_to_me=true` - Meus feedbacks
- `?unassigned=true` - Sem atribuição
- `?tags=1,2,3` - Com qualquer tag
- `?tags__all=1,2` - Com todas as tags
- `?prioridade=alta` - Por prioridade
- `?status=pendente` - Por status

### Tags

```
GET    /api/v1/tags/                   # Lista tags
POST   /api/v1/tags/                   # Cria tag
GET    /api/v1/tags/{id}/              # Detalhe
PATCH  /api/v1/tags/{id}/              # Atualiza
DELETE /api/v1/tags/{id}/              # Remove
```

---

## Diagrama do Modelo

```
                    ┌─────────────────┐
                    │    Feedback     │
                    ├─────────────────┤
                    │ id              │
                    │ protocolo       │
                    │ tipo            │
                    │ titulo          │
                    │ descricao       │
                    │ status          │
                    │ prioridade      │  ← Feature 4
                    │ anonimo         │
                    │ email_contato   │
                    │ data_criacao    │
                    │ data_atualizacao│
                    │ assigned_to ────┼──┐  Feature 1
                    │ assigned_at     │  │
                    │ assigned_by     │  │
                    │ tempo_1a_resp   │  │  Feature 5
                    │ tempo_resolucao │  │
                    │ data_1a_resp    │  │
                    │ data_resolucao  │  │
                    │ sla_1a_resp     │  │
                    │ sla_resolucao   │  │
                    │ tags ───────────┼──┼──┐  Feature 3
                    └─────────────────┘  │  │
                              │          │  │
                              │          │  │
                    ┌─────────────────┐  │  │
                    │   TeamMember    │◄─┘  │
                    ├─────────────────┤     │
                    │ id              │     │
                    │ user            │     │
                    │ client          │     │
                    │ role            │     │
                    └─────────────────┘     │
                                           │
                    ┌─────────────────┐     │
                    │      Tag        │◄────┘
                    ├─────────────────┤
                    │ id              │
                    │ nome            │
                    │ cor             │
                    │ descricao       │
                    │ criado_por      │
                    │ client          │
                    └─────────────────┘
```

---

## Deploy

**Branch:** `consolidate-monorepo`
**Auto-deploy:** Railway (backend) + Vercel (frontend)

**Commits do Sprint:**
1. `369a5d1` - Feature 1: Atribuição
2. `0226ac4` - Feature 2: Email Notifications
3. `ad553f6` - Feature 3: Tags/Labels
4. `06d091e` - Feature 4: Prioridade
5. `c95103e` - Feature 5: SLA Tracking

---

## Próximos Passos (Sprint 3)

1. **Dashboard Analytics** (8h)
   - Métricas de SLA
   - Gráficos de tendência
   - Relatórios exportáveis

2. **Automações** (6h)
   - Auto-atribuição por regras
   - Escalation automático
   - Lembretes de SLA

3. **API Pública** (4h)
   - Documentação Swagger
   - Rate limiting
   - API keys

---

## Observações Técnicas

### TenantAwareManager em Testes
Para testes que não passam por HTTP, usar `set_current_tenant()`:

```python
from apps.core.utils import set_current_tenant

def test_example(self, tenant):
    set_current_tenant(tenant)
    feedbacks = Feedback.objects.all()  # Agora funciona
```

### Celery em Testes
Usar `TESTING=true` para evitar conexão com Redis:

```bash
TESTING=true python -m pytest tests/
```

### Fixtures com UUID
Para evitar conflitos de UNIQUE constraints em testes paralelos:

```python
import uuid

def get_unique_subdominio():
    return f"test-{uuid.uuid4().hex[:8]}"
```
