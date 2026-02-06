# 🔒 Componentes de Audit Log

Componentes React/TypeScript para visualização de logs de auditoria do sistema.

---

## 📦 Arquivos Disponíveis

### 1. Hook: `hooks/use-audit-log.ts` (270 linhas) ✨ RECOMENDADO

Hook otimizado com SWR para consumo da API de audit logs.

**Uso:**
```tsx
import { useAuditLog, useAuditLogExport } from '@/hooks/use-audit-log';

function MyAuditPage() {
  const {
    logs,          // AuditLog[]
    count,         // Total de registros
    totalPages,    // Total de páginas
    currentPage,   // Página atual
    analytics,     // AuditAnalytics (dashboard data)
    availableActions, // ActionOption[] (para filtros)
    isLoading,     // boolean
    refetchLogs,   // () => Promise<any>
  } = useAuditLog({
    action: 'FEEDBACK_CREATED',
    severity: 'ERROR',
    date_from: '2026-01-01',
    date_to: '2026-02-01',
    page: 1,
    page_size: 20,
  });

  return (
    <div>
      {isLoading ? <Skeleton /> : logs?.map(log => <div>{log.description}</div>)}
    </div>
  );
}
```

**Vantagens:**
- ✅ Cache automático (SWR)
- ✅ Revalidação em foco/reconexão
- ✅ Deduplicação de requests
- ✅ 90% menos código boilerplate

---

### 2. Componente: `components/auditlog/AuditLogTable.tsx` (380 linhas) ✨ NOVO

Tabela responsiva de audit logs com paginação melhorada.

**Uso:**
```tsx
import { AuditLogTable } from '@/components/auditlog/AuditLogTable';
import { useAuditLog } from '@/hooks/use-audit-log';

function MyPage() {
  const [page, setPage] = useState(1);
  const { logs, count, totalPages, currentPage, pageSize, isLoading } = useAuditLog({ page });

  return (
    <AuditLogTable
      logs={logs}
      count={count}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      isLoading={isLoading}
      onPageChange={setPage}
      onLogClick={(log) => console.log('Clicked:', log)}
    />
  );
}
```

**Features:**
- ✅ Design responsivo mobile-first
- ✅ Cards mobile em vez de tabela horizontal scroll
- ✅ Paginação com números de página (não apenas prev/next)
- ✅ Detalhes expandíveis inline (mobile)
- ✅ Ícones emoji para cada tipo de ação
- ✅ Badges coloridos por severidade
- ✅ Loading skeleton
- ✅ Empty state com ícone

---

### 3. API Client: `lib/audit-log.ts` (251 linhas) - ORIGINAL

Cliente HTTP para API de audit logs (implementação original).

**Uso:**
```typescript
import { getAuditLogs, exportAuditLogs } from '@/lib/audit-log';

// Buscar logs
const response = await getAuditLogs({
  action: 'LOGIN',
  page: 1,
  page_size: 25,
});
console.log(response.results); // AuditLog[]
console.log(response.count);   // number

// Exportar CSV
const blob = await exportAuditLogs({ date_from: '2026-01-01' });
// Download manual do blob
```

**Quando usar:**
- ✅ Queries únicas (não reativas)
- ✅ Scripts ou jobs
- ✅ SSR (Server-Side Rendering)

---

### 4. Componentes Originais: `components/audit/` - ORIGINAL

Implementação original com 3 componentes.

#### `AuditLogTable.tsx` (468 linhas)
Tabela com filtros integrados e sheet lateral.

**Uso:**
```tsx
import { AuditLogTable } from '@/components/audit/AuditLogTable';

<AuditLogTable />
```

**Features:**
- ✅ Filtros: Ação, Severidade, Data, Busca
- ✅ Paginação: 10/25/50/100 itens
- ✅ Exportação CSV
- ✅ Sheet lateral para detalhes

#### `AnalyticsDashboard.tsx`
Dashboard com gráficos e métricas.

**Uso:**
```tsx
import { AnalyticsDashboard } from '@/components/audit/AnalyticsDashboard';

<AnalyticsDashboard />
```

**Exibe:**
- Total de logs (30 dias)
- Usuários ativos únicos
- Breakdown por ação
- Série temporal
- Top 5 usuários

#### `SecurityAlertsCard.tsx`
Card de alertas de segurança.

**Uso:**
```tsx
import { SecurityAlertsCard } from '@/components/audit/SecurityAlertsCard';

<SecurityAlertsCard maxItems={10} />
```

---

## 🎯 Qual Usar?

### Use o Hook (`use-audit-log.ts`) quando:
- ✅ Componentes reativos (revalidação automática)
- ✅ Múltiplas queries na mesma página
- ✅ Precisar de cache automático
- ✅ **RECOMENDADO para novos desenvolvimentos**

### Use o API Client (`lib/audit-log.ts`) quando:
- ✅ Scripts ou jobs (não React)
- ✅ SSR (getServerSideProps)
- ✅ Queries únicas sem necessidade de revalidação

### Use o Componente Novo (`components/auditlog/AuditLogTable.tsx`) quando:
- ✅ Precisar de layout mobile-first
- ✅ Paginação com números de página
- ✅ Detalhes expandíveis inline

### Use os Componentes Originais (`components/audit/`) quando:
- ✅ Precisar de filtros integrados no componente
- ✅ Sheet lateral para detalhes
- ✅ Já está usando na página existente

---

## 🚀 Exemplo Completo

### Página Customizada de Audit Logs

```tsx
'use client';

import { useState } from 'react';
import { useAuditLog, useAuditLogExport } from '@/hooks/use-audit-log';
import { AuditLogTable } from '@/components/auditlog/AuditLogTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Filter } from 'lucide-react';

export default function MyAuditPage() {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    severity: 'ERROR',
  });

  const {
    logs,
    count,
    totalPages,
    currentPage,
    pageSize,
    analytics,
    isLoading,
  } = useAuditLog(filters);

  const { exportLogs, isExporting } = useAuditLogExport();

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = () => {
    exportLogs(filters);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total de Logs</p>
              <p className="text-3xl font-bold">{analytics.total_logs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              <p className="text-3xl font-bold">{analytics.total_users_active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Alertas</p>
              <p className="text-3xl font-bold">{analytics.security_alerts}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <select
              value={filters.severity || ''}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Todas as severidades</option>
              <option value="INFO">Informação</option>
              <option value="WARNING">Aviso</option>
              <option value="ERROR">Erro</option>
              <option value="CRITICAL">Crítico</option>
            </select>

            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <AuditLogTable
        logs={logs}
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

## 📊 Tipos TypeScript

### `AuditLog`
```typescript
interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  action_display: string;
  action_icon: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  severity_display: string;
  description: string;
  user: AuditLogUser | null;
  content_type_name: string | null;
  object_id: number | null;
  object_repr: string;
  ip_address: string | null;
  metadata: Record<string, any>;
}
```

### `AuditLogFilters`
```typescript
interface AuditLogFilters {
  action?: string;       // 'LOGIN', 'FEEDBACK_CREATED', etc.
  severity?: string;     // 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
  user?: number;         // User ID
  date_from?: string;    // YYYY-MM-DD
  date_to?: string;      // YYYY-MM-DD
  search?: string;       // Busca textual
  page?: number;         // Página atual
  page_size?: number;    // Itens por página (10/25/50/100)
}
```

### `AuditAnalytics`
```typescript
interface AuditAnalytics {
  total_logs: number;
  total_users_active: number;
  action_breakdown: Array<{
    action: string;
    action_display: string;
    count: number;
  }>;
  severity_breakdown: SeverityBreakdown[];
  time_series: TimeSeriesData[];
  top_users: TopUser[];
  security_alerts: number;
  period_start: string;
  period_end: string;
}
```

---

## 🎨 Design Guidelines

### Cores por Severidade

```tsx
INFO: 'info'       // Badge azul
WARNING: 'warning' // Badge amarelo
ERROR: 'error'     // Badge vermelho claro
CRITICAL: 'destructive' // Badge vermelho escuro
```

### Ícones por Ação

```tsx
LOGIN: '🔑'
LOGOUT: '🚪'
LOGIN_FAILED: '🚫'
FEEDBACK_CREATED: '📝'
FEEDBACK_UPDATED: '📋'
DELETE: '🗑️'
SECURITY_ALERT: '🚨'
CREATE: '➕'
UPDATE: '✏️'
VIEW: '👁️'
// ... etc
```

### Formatação de Data

```typescript
import { formatTimestamp, formatRelativeTime } from '@/hooks/use-audit-log';

formatTimestamp('2026-02-06T14:30:00Z');
// "06/02/2026, 14:30:00"

formatRelativeTime('2026-02-06T14:30:00Z');
// "há 2 horas"
```

---

## 🧪 Testes

### Teste 1: Hook com SWR

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuditLog } from '@/hooks/use-audit-log';

test('busca logs com filtros', async () => {
  const { result } = renderHook(() =>
    useAuditLog({ severity: 'ERROR', page: 1 })
  );

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.logs).toBeDefined();
  expect(result.current.count).toBeGreaterThan(0);
});
```

### Teste 2: Componente de Tabela

```tsx
import { render, screen } from '@testing-library/react';
import { AuditLogTable } from '@/components/auditlog/AuditLogTable';

const mockLogs = [
  {
    id: 1,
    timestamp: '2026-02-06T14:30:00Z',
    action: 'LOGIN',
    action_display: 'Login',
    severity: 'INFO',
    description: 'User logged in',
    user: { id: 1, email: 'user@test.com', nome: 'Test User' },
    // ... outros campos
  },
];

test('renderiza tabela de logs', () => {
  render(
    <AuditLogTable
      logs={mockLogs}
      count={1}
      currentPage={1}
      totalPages={1}
      pageSize={20}
      isLoading={false}
      onPageChange={() => {}}
    />
  );

  expect(screen.getByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

---

## 📚 Recursos Adicionais

- **Relatório de Implementação:** [docs/AUDITLOG_IMPLEMENTATION_REPORT.md](../../docs/AUDITLOG_IMPLEMENTATION_REPORT.md)
- **API Backend:** [apps/backend/apps/auditlog/](../../../backend/apps/auditlog/)
- **API Future Features:** [docs/API_FUTURE_FEATURES.md](../../docs/API_FUTURE_FEATURES.md)

---

## 🏆 Resumo

| Abordagem | Arquivo | Quando Usar | Status |
|-----------|---------|-------------|--------|
| **Hook SWR** | `hooks/use-audit-log.ts` | Componentes reativos | ✨ **Recomendado** |
| **API Client** | `lib/audit-log.ts` | Scripts, SSR | ✅ Original |
| **Tabela Nova** | `components/auditlog/AuditLogTable.tsx` | Mobile-first | ✨ **Nova** |
| **Tabela Original** | `components/audit/AuditLogTable.tsx` | Filtros integrados | ✅ Original |

**Recomendação:** Use `use-audit-log.ts` + `components/auditlog/AuditLogTable.tsx` para novos desenvolvimentos.

---

**Implementado por:** Ouvify Frontend Engineer  
**Data:** 06 de Fevereiro de 2026  
**Status:** ✅ Pronto para Produção
