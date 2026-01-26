# 🚀 Auditoria de Performance - Fase 3

**Data:** 26 de Janeiro de 2026  
**Status:** 🔄 EM ANDAMENTO  
**Objetivo:** Otimizar performance para escalar de 100 → 10.000 usuários concorrentes

---

## 📊 ANÁLISE INICIAL

### Stack Atual
- **Backend:** Django 6.0.1 + DRF 3.16.1
- **Frontend:** Next.js 16.1.5 + React 19.2.4
- **Database:** PostgreSQL (Railway - DATABASE_PRIVATE_URL)
- **Cache:** Redis 7.1.0 (django-redis 6.0.0)
- **Deploy:** Railway (backend) + Vercel (frontend)

### Baseline Performance (Pré-Otimização)
- **Tempo de resposta médio:** ~200-300ms (estimado)
- **Queries por request:** 10-50 queries (sem otimização)
- **Bundle size frontend:** ~1.5MB (estimado)
- **Throughput:** ~50 req/s (estimado)

---

## 🔍 PROBLEMAS IDENTIFICADOS

### 1. QUERIES N+1 (CRÍTICO)

#### 1.1. FeedbackViewSet.list
**Arquivo:** `apps/backend/apps/feedbacks/views.py`  
**Endpoint:** `GET /api/feedbacks/`

**Problema:**
```python
# ATUAL (linha 86-90):
queryset = queryset.select_related('client', 'autor')

if getattr(self, 'action', None) in ['retrieve', 'adicionar_interacao']:
    queryset = queryset.prefetch_related(...)
```

❌ **Problema:** `prefetch_related` só é aplicado em `retrieve`, mas `list` também precisa!

**Impacto:**
- Para 100 feedbacks na lista:
  - 1 query inicial (SELECT * FROM feedbacks)
  - 100 queries para interações (se acessadas no serializer)
  - 100 queries para arquivos (se acessados no serializer)
  - **Total:** 201 queries por request

**Solução:**
```python
# Aplicar prefetch_related também no list
queryset = queryset.prefetch_related(
    Prefetch(
        'interacoes',
        queryset=FeedbackInteracao.objects.select_related('autor').order_by('data')
    ),
    'arquivos'
)
```

**Queries esperadas:** 3 queries (feedback + interações + arquivos)

---

#### 1.2. FeedbackViewSet - Dashboard Stats
**Endpoint:** `GET /api/feedbacks/dashboard_stats/` (se existir)

**Problema:** Se stats forem calculadas em Python (iterando feedbacks), gera N queries.

**Solução:** Usar agregação no banco:
```python
from django.db.models import Count, Q

stats = Feedback.objects.filter(client=tenant).aggregate(
    total=Count('id'),
    pendentes=Count('id', filter=Q(status='pendente')),
    resolvidos=Count('id', filter=Q(status='resolvido')),
)
```

**Redução:** N queries → 1 query

---

#### 1.3. TenantInfoView (MÉDIO)
**Arquivo:** `apps/backend/apps/tenants/views.py`  
**Endpoint:** `GET /api/tenant-info/`

**Problema Atual:** Carrega TODOS os campos do tenant, mesmo que não sejam usados.

**Solução:** Usar `.only()` para carregar apenas campos necessários:
```python
tenant = Client.objects.only(
    'nome', 'subdominio', 'logo', 'favicon',
    'cor_primaria', 'cor_secundaria', 'cor_texto'
).get(subdominio=subdomain, ativo=True)
```

**Redução de dados transferidos:** ~80%

---

### 2. MISSING INDEXES (ALTO)

#### 2.1. Índices Compostos Faltando

**Tabela:** `feedbacks_feedback`

**Queries frequentes:**
1. `WHERE client_id = X AND status = Y ORDER BY data_criacao DESC` (dashboard)
2. `WHERE client_id = X AND tipo = Y` (filtros)
3. `WHERE email_contato = X` (busca por usuário)

**Índices necessários:**
```sql
-- Índice composto: client + status + data_criacao
CREATE INDEX fb_client_status_date_idx 
ON feedbacks_feedback(client_id, status, data_criacao DESC);

-- Índice composto: client + tipo
CREATE INDEX fb_client_tipo_idx 
ON feedbacks_feedback(client_id, tipo);

-- Índice: email_contato (busca)
CREATE INDEX fb_email_idx 
ON feedbacks_feedback(email_contato);
```

**Impacto:** Query time reduzido de ~100ms → ~5ms

---

#### 2.2. Índices em FeedbackInteracao

**Tabela:** `feedbacks_feedbackinteracao`

**Query frequente:**
```sql
SELECT * FROM feedbacks_feedbackinteracao 
WHERE feedback_id = X 
ORDER BY data_criacao DESC;
```

**Índice necessário:**
```sql
CREATE INDEX fbi_feedback_date_idx 
ON feedbacks_feedbackinteracao(feedback_id, data_criacao DESC);
```

---

### 3. CACHING AUSENTE (ALTO)

#### 3.1. TenantInfoView - Sem Cache
**Problema:** Endpoint público `/api/tenant-info/` consulta DB a cada request.

**Impacto:** 
- Chamado em TODAS as páginas públicas
- 1000 req/min = 1000 queries/min desnecessárias

**Solução:**
```python
cache_key = f"tenant_info:{subdomain}"
cached_data = cache.get(cache_key)

if cached_data:
    return Response(cached_data)

# ... buscar do DB ...
cache.set(cache_key, data, timeout=3600)  # 1 hora
```

**Redução de queries:** 1000/min → 1/hour (99.98%)

---

#### 3.2. Dashboard Stats - Sem Cache
**Problema:** Stats recalculadas a cada request do dashboard.

**Solução:**
```python
cache_key = f"dashboard_stats:{tenant.id}"
stats = cache.get(cache_key)

if not stats:
    stats = calculate_stats()
    cache.set(cache_key, stats, timeout=300)  # 5 minutos
```

**Invalidação:** Via signals quando Feedback é criado/atualizado.

---

### 4. FRONTEND PERFORMANCE (MÉDIO)

#### 4.1. Bundle Size Grande
**Problema estimado:**
- Next.js bundle: ~1.5MB
- Lucide icons importados inteiros
- Bibliotecas pesadas sem tree-shaking

**Soluções:**
1. Lazy load de componentes pesados (charts, analytics)
2. Code splitting por rota
3. Optimizar imports: `import { Icon } from 'lucide-react'` → `import Icon from 'lucide-react/dist/esm/icons/icon'`

**Redução esperada:** 1.5MB → 800KB (47%)

---

#### 4.2. Sem Code Splitting
**Problema:** Todos os componentes carregados na página inicial.

**Solução:**
```typescript
const AnalyticsChart = dynamic(
  () => import('@/components/dashboard/AnalyticsChart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

**Impacto:** FCP (First Contentful Paint) reduzido de 2.5s → 1.2s

---

### 5. WEB VITALS (MÉDIO)

**Metas a atingir:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Ações:**
1. Implementar tracking com `web-vitals`
2. Otimizar imagens com `next/image`
3. Preload de fontes críticas
4. Skeleton screens para evitar layout shifts

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### Prioridade P0 (Crítico - Implementar Agora)
1. ✅ Instalar ferramentas de análise (nplusone, django-debug-toolbar)
2. ⏳ Corrigir queries N+1 em FeedbackViewSet
3. ⏳ Adicionar índices compostos (migration)
4. ⏳ Implementar cache em TenantInfoView
5. ⏳ Implementar cache em Dashboard Stats

### Prioridade P1 (Alto - Implementar Esta Semana)
6. ⏳ Otimizar bundle size do frontend
7. ⏳ Implementar code splitting e lazy loading
8. ⏳ Adicionar Web Vitals tracking
9. ⏳ Executar load testing (Locust)

### Prioridade P2 (Médio - Próxima Sprint)
10. ⏳ Database connection pooling (PgBouncer)
11. ⏳ CDN para assets estáticos
12. ⏳ Implement Elasticsearch para busca full-text
13. ⏳ Background jobs para tarefas pesadas (Celery)

---

## 🎯 METAS DE PERFORMANCE

### Backend
- **Latência p95:** < 200ms (atual: ~300ms)
- **Throughput:** > 200 req/s (atual: ~50 req/s)
- **Queries por request:** < 5 (atual: 10-50)
- **Cache hit rate:** > 80%

### Frontend
- **Bundle size:** < 1MB (atual: ~1.5MB)
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Lighthouse Score:** > 90

### Database
- **Query time p95:** < 10ms (com índices)
- **Connection pooling:** 20-50 conexões
- **Slow query log:** 0 queries > 100ms

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta | Melhoria |
|---------|-------|------|----------|
| Latência p95 | 300ms | 200ms | -33% |
| Queries/request | 50 | 5 | -90% |
| Throughput | 50 req/s | 200 req/s | +300% |
| Bundle size | 1.5MB | 1MB | -33% |
| Cache hit rate | 0% | 80% | +80pp |
| LCP | 3.5s | 2.5s | -29% |

---

**Próximos Passos:**
1. Configurar nplusone para detecção automática
2. Executar análise em endpoints críticos
3. Implementar correções priorizadas
4. Validar com load testing

**Tempo estimado total:** 6-8 horas
