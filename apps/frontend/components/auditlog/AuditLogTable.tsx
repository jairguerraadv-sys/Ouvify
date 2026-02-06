/**
 * Componente de Tabela de Audit Logs
 * Exibe histórico de ações do sistema com filtros e paginação
 */

'use client';

import { useState } from 'react';
import {
  type AuditLog,
  type AuditLogFilters,
  SEVERITY_COLORS,
  getActionIcon,
  formatTimestamp,
  formatRelativeTime,
} from '@/hooks/use-audit-log';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  User,
  Calendar,
  Globe,
  FileText,
} from 'lucide-react';
import { MutedText } from '@/components/ui';

interface AuditLogTableProps {
  logs: AuditLog[] | undefined;
  count: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLogClick?: (log: AuditLog) => void;
}

export function AuditLogTable({
  logs,
  count,
  currentPage,
  totalPages,
  pageSize,
  isLoading,
  onPageChange,
  onLogClick,
}: AuditLogTableProps) {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  // Calcular range de itens
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, count);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-12 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              Nenhum log encontrado
            </h3>
            <MutedText>
              Não há registros de auditoria para os filtros selecionados
            </MutedText>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary">
              Logs de Auditoria
            </h3>
            <MutedText>
              Mostrando {startItem}-{endItem} de {count} registros
            </MutedText>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Tabela - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead className="w-[200px]">Usuário</TableHead>
                <TableHead className="w-[200px]">Ação</TableHead>
                <TableHead className="w-[100px]">Severidade</TableHead>
                <TableHead className="w-[150px]">IP</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-secondary">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                      <MutedText className="text-xs">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </MutedText>
                    </div>
                  </TableCell>

                  <TableCell>
                    {log.user ? (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary truncate">
                            {log.user.nome || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {log.user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <MutedText className="text-sm">Sistema</MutedText>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={log.action}>
                        {getActionIcon(log.action)}
                      </span>
                      <span className="text-sm font-medium text-secondary">
                        {log.action_display}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={SEVERITY_COLORS[log.severity] as any}
                      size="sm"
                    >
                      {log.severity_display}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {log.ip_address ? (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <MutedText className="text-xs font-mono">
                          {log.ip_address}
                        </MutedText>
                      </div>
                    ) : (
                      <MutedText className="text-xs">-</MutedText>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="max-w-md">
                      {log.description ? (
                        <p className="text-sm text-secondary truncate">
                          {log.description}
                        </p>
                      ) : (
                        <MutedText className="text-sm">
                          {log.object_repr || '-'}
                        </MutedText>
                      )}
                      {log.content_type_name && (
                        <MutedText className="text-xs">
                          {log.content_type_name}
                        </MutedText>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (onLogClick) {
                          onLogClick(log);
                        } else {
                          setExpandedLog(expandedLog === log.id ? null : log.id);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4 p-4">
          {logs.map((log) => (
            <Card
              key={log.id}
              className="border border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {getActionIcon(log.action)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-secondary truncate">
                        {log.action_display}
                      </h4>
                      <MutedText className="text-xs">
                        {formatRelativeTime(log.timestamp)}
                      </MutedText>
                    </div>
                  </div>
                  <Badge
                    variant={SEVERITY_COLORS[log.severity] as any}
                    size="sm"
                  >
                    {log.severity}
                  </Badge>
                </div>

                {/* Usuário */}
                {log.user && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-secondary truncate">
                        {log.user.nome || 'N/A'}
                      </p>
                      <MutedText className="text-xs truncate">
                        {log.user.email}
                      </MutedText>
                    </div>
                  </div>
                )}

                {/* Descrição */}
                {log.description && (
                  <p className="text-sm text-secondary line-clamp-2">
                    {log.description}
                  </p>
                )}

                {/* IP */}
                {log.ip_address && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <MutedText className="text-xs font-mono">
                      {log.ip_address}
                    </MutedText>
                  </div>
                )}

                {/* Botão de expandir */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setExpandedLog(expandedLog === log.id ? null : log.id)
                  }
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {expandedLog === log.id ? 'Ocultar' : 'Ver'} Detalhes
                </Button>

                {/* Detalhes expandidos */}
                {expandedLog === log.id && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <div>
                      <MutedText className="text-xs mb-1">Data/Hora:</MutedText>
                      <p className="text-sm text-secondary">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    {log.content_type_name && (
                      <div>
                        <MutedText className="text-xs mb-1">Tipo:</MutedText>
                        <p className="text-sm text-secondary">
                          {log.content_type_name}
                        </p>
                      </div>
                    )}
                    {log.object_repr && (
                      <div>
                        <MutedText className="text-xs mb-1">Objeto:</MutedText>
                        <p className="text-sm text-secondary">
                          {log.object_repr}
                        </p>
                      </div>
                    )}
                    {Object.keys(log.metadata).length > 0 && (
                      <div>
                        <MutedText className="text-xs mb-1">Metadados:</MutedText>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="border-t border-border p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <MutedText className="text-sm">
                Página {currentPage} de {totalPages}
              </MutedText>

              {/* Controles */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
