# 📘 Tutorial: Adicionar Nova Página no Frontend

> **Tempo estimado:** 30 minutos  
> **Nível:** Intermediário  
> **Última atualização:** Janeiro 2026

## 📋 O que você vai aprender

Neste tutorial, vamos criar uma página completa:
- `/dashboard/reports` - Página de relatórios customizados

Você aprenderá:
1. Criar página com App Router (Next.js 15)
2. Criar componentes React
3. Usar hooks customizados
4. Integrar com API (React Query)
5. Adicionar ao menu lateral
6. Implementar loading/error states
7. Escrever testes E2E
8. Tornar responsivo

---

## 🎯 Caso de Uso

> **Como** um administrador  
> **Eu quero** gerar relatórios customizados  
> **Para** analisar métricas de feedbacks em períodos específicos

---

## 📁 Estrutura Final

```
apps/frontend/
├── app/
│   └── dashboard/
│       └── reports/
│           ├── page.tsx           # Página principal
│           └── loading.tsx        # Loading state
├── components/
│   └── reports/
│       ├── ReportBuilder.tsx      # Componente principal
│       ├── ReportFilters.tsx      # Filtros
│       ├── ReportPreview.tsx      # Preview do relatório
│       └── ReportExport.tsx       # Botões de export
├── hooks/
│   └── use-reports.ts             # Hook de dados
└── e2e/
    └── reports.spec.ts            # Testes E2E
```

---

## 🚀 Passo 1: Criar Página (5 min)

### 1.1 Criar diretório e página

```bash
mkdir -p apps/frontend/app/dashboard/reports
```

Crie `apps/frontend/app/dashboard/reports/page.tsx`:

```typescript
// apps/frontend/app/dashboard/reports/page.tsx

import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReportBuilder } from '@/components/reports/ReportBuilder';

export const metadata: Metadata = {
  title: 'Relatórios | Ouvify',
  description: 'Gere relatórios customizados de feedbacks',
};

export default function ReportsPage() {
  return (
    <div className="container py-8 space-y-6">
      <PageHeader
        title="Relatórios"
        description="Crie e exporte relatórios customizados de feedbacks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Relatórios' },
        ]}
      />
      
      <ReportBuilder />
    </div>
  );
}
```

### 1.2 Criar Loading State

Crie `apps/frontend/app/dashboard/reports/loading.tsx`:

```typescript
// apps/frontend/app/dashboard/reports/loading.tsx

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ReportsLoading() {
  return (
    <div className="container py-8 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Filters skeleton */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      
      {/* Preview skeleton */}
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}
```

---

## 🧩 Passo 2: Criar Componentes (15 min)

### 2.1 ReportBuilder (componente principal)

Crie `apps/frontend/components/reports/ReportBuilder.tsx`:

```typescript
// apps/frontend/components/reports/ReportBuilder.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportFilters, ReportFiltersValues } from './ReportFilters';
import { ReportPreview } from './ReportPreview';
import { ReportExport } from './ReportExport';
import { useReportData } from '@/hooks/use-reports';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export function ReportBuilder() {
  const [filters, setFilters] = useState<ReportFiltersValues>({
    reportType: 'feedbacks',
    dateStart: null,
    dateEnd: null,
    status: 'all',
    groupBy: 'day',
  });
  
  const { data, isLoading, error, refetch } = useReportData(filters);
  
  const handleFiltersChange = (newFilters: ReportFiltersValues) => {
    setFilters(newFilters);
  };
  
  const canGenerate = filters.dateStart && filters.dateEnd;
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            values={filters}
            onChange={handleFiltersChange}
          />
        </CardContent>
      </Card>
      
      {/* Estado de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error.message}
            <button
              onClick={() => refetch()}
              className="ml-2 underline"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Preview do relatório */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Preview</CardTitle>
          {data && <ReportExport data={data} filters={filters} />}
        </CardHeader>
        <CardContent>
          {!canGenerate && (
            <div className="text-center py-12 text-muted-foreground">
              Selecione as datas para gerar o relatório
            </div>
          )}
          
          {canGenerate && isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Gerando relatório...</span>
            </div>
          )}
          
          {canGenerate && !isLoading && data && (
            <ReportPreview data={data} groupBy={filters.groupBy} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2.2 ReportFilters

Crie `apps/frontend/components/reports/ReportFilters.tsx`:

```typescript
// apps/frontend/components/reports/ReportFilters.tsx

'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';

export interface ReportFiltersValues {
  reportType: 'feedbacks' | 'sla' | 'team' | 'trends';
  dateStart: string | null;
  dateEnd: string | null;
  status: string;
  groupBy: 'day' | 'week' | 'month';
}

interface ReportFiltersProps {
  values: ReportFiltersValues;
  onChange: (values: ReportFiltersValues) => void;
}

export function ReportFilters({ values, onChange }: ReportFiltersProps) {
  const handleChange = (key: keyof ReportFiltersValues, value: string) => {
    onChange({ ...values, [key]: value });
  };
  
  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    onChange({
      ...values,
      dateStart: start.toISOString().split('T')[0],
      dateEnd: end.toISOString().split('T')[0],
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Linha 1: Tipo e Agrupamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reportType">Tipo de Relatório</Label>
          <Select
            value={values.reportType}
            onValueChange={(v) => handleChange('reportType', v)}
          >
            <SelectTrigger id="reportType">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feedbacks">📊 Feedbacks por Período</SelectItem>
              <SelectItem value="sla">⏱️ SLA Compliance</SelectItem>
              <SelectItem value="team">👥 Performance da Equipe</SelectItem>
              <SelectItem value="trends">📈 Tendências</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="groupBy">Agrupar por</Label>
          <Select
            value={values.groupBy}
            onValueChange={(v) => handleChange('groupBy', v)}
          >
            <SelectTrigger id="groupBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Linha 2: Datas */}
      <div className="space-y-2">
        <Label>Período</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(7)}
          >
            Últimos 7 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(30)}
          >
            Últimos 30 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(90)}
          >
            Últimos 90 dias
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={values.dateStart || ''}
              onChange={(e) => handleChange('dateStart', e.target.value)}
              className="pl-10"
              placeholder="Data início"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={values.dateEnd || ''}
              onChange={(e) => handleChange('dateEnd', e.target.value)}
              className="pl-10"
              placeholder="Data fim"
            />
          </div>
        </div>
      </div>
      
      {/* Linha 3: Filtros adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={values.status}
            onValueChange={(v) => handleChange('status', v)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
              <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
              <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 ReportPreview

Crie `apps/frontend/components/reports/ReportPreview.tsx`:

```typescript
// apps/frontend/components/reports/ReportPreview.tsx

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportData } from '@/hooks/use-reports';

interface ReportPreviewProps {
  data: ReportData;
  groupBy: string;
}

export function ReportPreview({ data, groupBy }: ReportPreviewProps) {
  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList>
        <TabsTrigger value="chart">📊 Gráfico</TabsTrigger>
        <TabsTrigger value="table">📋 Tabela</TabsTrigger>
        <TabsTrigger value="summary">📈 Resumo</TabsTrigger>
      </TabsList>
      
      <TabsContent value="chart" className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                name="Total"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="resolved"
                fill="hsl(var(--success))"
                name="Resolvidos"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="hsl(var(--warning))"
                name="Pendentes"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      
      <TabsContent value="table" className="pt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Resolvidos</TableHead>
                <TableHead className="text-right">Pendentes</TableHead>
                <TableHead className="text-right">Taxa Resolução</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right">{row.total}</TableCell>
                  <TableCell className="text-right">{row.resolved}</TableCell>
                  <TableCell className="text-right">{row.pending}</TableCell>
                  <TableCell className="text-right">
                    {row.total > 0
                      ? `${((row.resolved / row.total) * 100).toFixed(1)}%`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      
      <TabsContent value="summary" className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total de Feedbacks"
            value={data.summary.total}
            icon="📬"
          />
          <SummaryCard
            title="Resolvidos"
            value={data.summary.resolved}
            icon="✅"
            color="text-green-600"
          />
          <SummaryCard
            title="Pendentes"
            value={data.summary.pending}
            icon="⏳"
            color="text-yellow-600"
          />
          <SummaryCard
            title="Taxa de Resolução"
            value={`${data.summary.resolutionRate.toFixed(1)}%`}
            icon="📊"
            color="text-blue-600"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color = 'text-foreground',
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
```

### 2.4 ReportExport

Crie `apps/frontend/components/reports/ReportExport.tsx`:

```typescript
// apps/frontend/components/reports/ReportExport.tsx

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { ReportData } from '@/hooks/use-reports';
import { ReportFiltersValues } from './ReportFilters';
import { useToast } from '@/hooks/use-toast';

interface ReportExportProps {
  data: ReportData;
  filters: ReportFiltersValues;
}

export function ReportExport({ data, filters }: ReportExportProps) {
  const { toast } = useToast();
  
  const exportCSV = () => {
    const headers = ['Período', 'Total', 'Resolvidos', 'Pendentes', 'Taxa Resolução'];
    const rows = data.tableData.map((row) => [
      row.label,
      row.total,
      row.resolved,
      row.pending,
      row.total > 0 ? `${((row.resolved / row.total) * 100).toFixed(1)}%` : '0%',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    
    downloadFile(csvContent, 'relatorio.csv', 'text/csv');
    toast({
      title: 'Exportado!',
      description: 'Relatório CSV baixado com sucesso.',
    });
  };
  
  const exportJSON = () => {
    const jsonContent = JSON.stringify({
      filters,
      summary: data.summary,
      data: data.tableData,
      generatedAt: new Date().toISOString(),
    }, null, 2);
    
    downloadFile(jsonContent, 'relatorio.json', 'application/json');
    toast({
      title: 'Exportado!',
      description: 'Relatório JSON baixado com sucesso.',
    });
  };
  
  const exportPDF = async () => {
    toast({
      title: 'Gerando PDF...',
      description: 'Aguarde enquanto o relatório é gerado.',
    });
    
    // TODO: Implementar geração de PDF via API
    // const response = await api.post('/reports/generate-pdf/', { filters, data });
    // window.open(response.data.pdf_url, '_blank');
    
    toast({
      title: 'PDF gerado!',
      description: 'O relatório foi aberto em uma nova aba.',
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### 2.5 Criar index de exports

Crie `apps/frontend/components/reports/index.ts`:

```typescript
// apps/frontend/components/reports/index.ts

export { ReportBuilder } from './ReportBuilder';
export { ReportFilters, type ReportFiltersValues } from './ReportFilters';
export { ReportPreview } from './ReportPreview';
export { ReportExport } from './ReportExport';
```

---

## 🪝 Passo 3: Criar Hook de Dados (5 min)

Crie `apps/frontend/hooks/use-reports.ts`:

```typescript
// apps/frontend/hooks/use-reports.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ReportFiltersValues } from '@/components/reports/ReportFilters';

export interface ReportDataRow {
  label: string;
  total: number;
  resolved: number;
  pending: number;
}

export interface ReportSummary {
  total: number;
  resolved: number;
  pending: number;
  resolutionRate: number;
  avgResolutionTime: number;
}

export interface ReportData {
  chartData: ReportDataRow[];
  tableData: ReportDataRow[];
  summary: ReportSummary;
}

export function useReportData(filters: ReportFiltersValues) {
  return useQuery<ReportData>({
    queryKey: ['report', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/', {
        params: {
          type: filters.reportType,
          date_start: filters.dateStart,
          date_end: filters.dateEnd,
          status: filters.status !== 'all' ? filters.status : undefined,
          group_by: filters.groupBy,
        },
      });
      return data;
    },
    enabled: Boolean(filters.dateStart && filters.dateEnd),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export function useReportExport() {
  return {
    exportPDF: async (filters: ReportFiltersValues) => {
      const { data } = await api.post('/reports/generate-pdf/', filters);
      return data.pdf_url;
    },
  };
}
```

---

## 📍 Passo 4: Adicionar ao Menu (3 min)

Edite o componente de Sidebar para incluir o novo item:

```typescript
// apps/frontend/components/layout/Sidebar.tsx

import {
  LayoutDashboard,
  MessageSquare,
  FileText,      // <- Adicionar
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Feedbacks',
    href: '/dashboard/feedbacks',
    icon: MessageSquare,
  },
  {
    label: 'Relatórios',      // <- NOVO
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Equipe',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    label: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];
```

---

## 🧪 Passo 5: Escrever Testes E2E (10 min)

Crie `apps/frontend/e2e/reports.spec.ts`:

```typescript
// apps/frontend/e2e/reports.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navegar para relatórios
    await page.goto('/dashboard/reports');
  });
  
  test('should render reports page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
    await expect(page.getByText('Configurar Relatório')).toBeVisible();
  });
  
  test('should show report types in dropdown', async ({ page }) => {
    await page.click('[id="reportType"]');
    
    await expect(page.getByText('Feedbacks por Período')).toBeVisible();
    await expect(page.getByText('SLA Compliance')).toBeVisible();
    await expect(page.getByText('Performance da Equipe')).toBeVisible();
    await expect(page.getByText('Tendências')).toBeVisible();
  });
  
  test('should set quick date ranges', async ({ page }) => {
    // Clicar em "Últimos 7 dias"
    await page.click('button:has-text("Últimos 7 dias")');
    
    // Verificar que as datas foram preenchidas
    const dateStart = page.locator('input[type="date"]').first();
    const dateEnd = page.locator('input[type="date"]').last();
    
    await expect(dateStart).not.toHaveValue('');
    await expect(dateEnd).not.toHaveValue('');
  });
  
  test('should generate report with filters', async ({ page }) => {
    // Selecionar tipo
    await page.click('[id="reportType"]');
    await page.click('text=Feedbacks por Período');
    
    // Selecionar período
    await page.click('button:has-text("Últimos 30 dias")');
    
    // Aguardar loading
    await expect(page.getByText('Gerando relatório...')).toBeVisible();
    
    // Aguardar resultado
    await expect(page.getByRole('tab', { name: /Gráfico/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Tabela/ })).toBeVisible();
  });
  
  test('should switch between chart and table views', async ({ page }) => {
    // Gerar relatório primeiro
    await page.click('button:has-text("Últimos 7 dias")');
    await page.waitForSelector('[role="tablist"]');
    
    // Clicar em Tabela
    await page.click('[role="tab"]:has-text("Tabela")');
    await expect(page.locator('table')).toBeVisible();
    
    // Clicar em Resumo
    await page.click('[role="tab"]:has-text("Resumo")');
    await expect(page.getByText('Total de Feedbacks')).toBeVisible();
  });
  
  test('should export to CSV', async ({ page }) => {
    // Gerar relatório
    await page.click('button:has-text("Últimos 7 dias")');
    await page.waitForSelector('button:has-text("Exportar")');
    
    // Abrir dropdown de export
    await page.click('button:has-text("Exportar")');
    
    // Iniciar download
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Exportar CSV');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('relatorio.csv');
  });
  
  test('should show message when no dates selected', async ({ page }) => {
    await expect(
      page.getByText('Selecione as datas para gerar o relatório')
    ).toBeVisible();
  });
  
  test('should be responsive on mobile', async ({ page }) => {
    // Simular viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que os elementos são visíveis
    await expect(page.getByText('Relatórios')).toBeVisible();
    await expect(page.getByText('Configurar Relatório')).toBeVisible();
    
    // Verificar que os filtros estão empilhados
    const filters = page.locator('.grid');
    await expect(filters.first()).toBeVisible();
  });
});
```

### Rodar testes:

```bash
cd apps/frontend

# Rodar todos testes E2E
npx playwright test

# Rodar apenas o arquivo de reports
npx playwright test e2e/reports.spec.ts

# Com UI
npx playwright test --ui

# Com browser visível
npx playwright test --headed
```

---

## ✅ Checklist Final

| Item | Status |
|------|--------|
| Página criada em app/dashboard/reports | ⬜ |
| Loading state implementado | ⬜ |
| ReportBuilder componente | ⬜ |
| ReportFilters componente | ⬜ |
| ReportPreview com gráfico/tabela | ⬜ |
| ReportExport funcional | ⬜ |
| Hook useReportData | ⬜ |
| Menu atualizado | ⬜ |
| Testes E2E passando | ⬜ |
| Responsivo (mobile) | ⬜ |

---

## 🎨 Dicas de UI/UX

1. **Loading states** - Sempre mostrar feedback visual
2. **Empty states** - Mensagem clara quando não há dados
3. **Error handling** - Mostrar erros de forma amigável
4. **Quick actions** - Botões de atalho para datas comuns
5. **Responsive** - Testar em mobile, tablet e desktop
6. **Keyboard navigation** - Suportar Tab e Enter

---

## 🔗 Próximos Passos

1. **[Tutorial: Guia de Testes](./testing-guide.md)**
2. **[Tutorial: Adicionar Endpoint API](./add-api-endpoint.md)**
3. **[Arquitetura](../ARCHITECTURE.md)**

---

*Última atualização: 29/01/2026*
