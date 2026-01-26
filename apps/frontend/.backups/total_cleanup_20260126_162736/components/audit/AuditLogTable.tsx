'use client';

/**
 * Tabela de Audit Logs com filtros e paginação
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getAuditLogs,
  getActionOptions,
  exportAuditLogs,
  AuditLog,
  AuditLogFilters,
  ActionOption,
  getSeverityColor,
  formatTimestamp,
  formatRelativeTime,
} from '@/lib/audit-log';

interface AuditLogTableProps {
  className?: string;
}

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4" />,
  WARNING: <AlertTriangle className="h-4 w-4" />,
  ERROR: <AlertCircle className="h-4 w-4" />,
  CRITICAL: <XCircle className="h-4 w-4" />,
};

const PAGE_SIZES = [10, 25, 50, 100];

export function AuditLogTable({ className }: AuditLogTableProps) {
  const { toast } = useToast();
  
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionOptions, setActionOptions] = useState<ActionOption[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchInput, setSearchInput] = useState('');
  
  // Load data
  useEffect(() => {
    loadActionOptions();
  }, []);
  
  useEffect(() => {
    loadLogs();
  }, [currentPage, pageSize, filters]);
  
  const loadActionOptions = async () => {
    try {
      const options = await getActionOptions();
      setActionOptions(options);
    } catch (error) {
      console.error('Erro ao carregar opções de ação:', error);
    }
  };
  
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await getAuditLogs({
        ...filters,
        page: currentPage,
        page_size: pageSize,
      });
      setLogs(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs de auditoria.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handlers
  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  }, [searchInput]);
  
  const handleFilterChange = (key: keyof AuditLogFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
    setCurrentPage(1);
  };
  
  const handleExport = async () => {
    try {
      const blob = await exportAuditLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Exportação concluída',
        description: 'Os logs foram exportados com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os logs.',
        variant: 'destructive',
      });
    }
  };
  
  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
    setCurrentPage(1);
  };
  
  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Logs de Auditoria</CardTitle>
            <CardDescription>
              {totalCount.toLocaleString()} registros encontrados
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Busca */}
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Buscar por descrição, usuário..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
            />
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filtro de ação */}
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Filtro de severidade */}
          <Select
            value={filters.severity || 'all'}
            onValueChange={(value) => handleFilterChange('severity', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="INFO">Informação</SelectItem>
              <SelectItem value="WARNING">Aviso</SelectItem>
              <SelectItem value="ERROR">Erro</SelectItem>
              <SelectItem value="CRITICAL">Crítico</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Limpar filtros */}
          {(filters.action || filters.severity || filters.search) && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
        
        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="max-w-[300px]">Descrição</TableHead>
                <TableHead className="w-[100px]">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-mono text-sm">
                      <span title={formatTimestamp(log.timestamp)}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <span>{log.action_icon}</span>
                        <span className="text-sm">{log.action_display}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        <span className="flex items-center gap-1">
                          {SEVERITY_ICONS[log.severity]}
                          {log.severity_display}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <span className="text-sm">{log.user.email}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Exibindo</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>de {totalCount.toLocaleString()} registros</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Sheet de detalhes */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedLog?.action_icon} Detalhes do Log
            </SheetTitle>
            <SheetDescription>
              ID: {selectedLog?.id}
            </SheetDescription>
          </SheetHeader>
          
          {selectedLog && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Data/Hora</label>
                  <p className="font-medium">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Ação</label>
                  <p className="font-medium">{selectedLog.action_display}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Severidade</label>
                  <Badge className={getSeverityColor(selectedLog.severity)}>
                    {selectedLog.severity_display}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">IP</label>
                  <p className="font-mono text-sm">{selectedLog.ip_address || '-'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Usuário</label>
                <p className="font-medium">
                  {selectedLog.user?.email || 'Sistema'}
                  {selectedLog.user?.nome && (
                    <span className="text-muted-foreground"> ({selectedLog.user.nome})</span>
                  )}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Descrição</label>
                <p className="text-sm">{selectedLog.description}</p>
              </div>
              
              {selectedLog.object_repr && (
                <div>
                  <label className="text-sm text-muted-foreground">Objeto Afetado</label>
                  <p className="text-sm">{selectedLog.object_repr}</p>
                  {selectedLog.content_type_name && (
                    <p className="text-xs text-muted-foreground">
                      Tipo: {selectedLog.content_type_name}
                    </p>
                  )}
                </div>
              )}
              
              {Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground">Metadados</label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

export default AuditLogTable;
