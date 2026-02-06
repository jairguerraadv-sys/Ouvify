"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Loader2,
  Activity,
  User,
  Shield,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: number;
  action: string;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  timestamp: string;
  ip_address: string;
  user_agent: string;
  changes?: Record<string, any>;
  resource_type?: string;
  resource_id?: number;
  status: "success" | "failure" | "warning";
}

interface AuditSummary {
  date: string;
  total_actions: number;
  unique_users: number;
  most_common_action: string;
  success_rate: number;
}

const ACTION_TYPES = [
  "all",
  "login",
  "logout",
  "create",
  "update",
  "delete",
  "view",
  "export",
  "import",
  "config_change",
];

const STATUS_COLORS = {
  success: "bg-green-600",
  failure: "bg-red-600",
  warning: "bg-yellow-600",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [summaries, setSummaries] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filtros
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    subDays(new Date(), 7),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchSummaries();
  }, [dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFrom && {
          date_from: format(startOfDay(dateFrom), "yyyy-MM-dd"),
        }),
        ...(dateTo && { date_to: format(endOfDay(dateTo), "yyyy-MM-dd") }),
      });

      const response = await api.get<{
        results: AuditLogEntry[];
        count: number;
      }>(`/api/auditlog/logs/?${params}`);

      setLogs(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 20));
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaries = async () => {
    if (!dateFrom || !dateTo) return;

    try {
      const params = new URLSearchParams({
        date_from: format(startOfDay(dateFrom), "yyyy-MM-dd"),
        date_to: format(endOfDay(dateTo), "yyyy-MM-dd"),
      });

      const response = await api.get<AuditSummary[]>(
        `/api/auditlog/summaries/by_date/?${params}`,
      );

      setSummaries(response || []);
    } catch (error) {
      console.error("Erro ao carregar sumários:", error);
    }
  };

  const exportLogs = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format: "csv",
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(dateFrom && {
          date_from: format(startOfDay(dateFrom), "yyyy-MM-dd"),
        }),
        ...(dateTo && { date_to: format(endOfDay(dateTo), "yyyy-MM-dd") }),
      });

      const response = await api.get(`/api/auditlog/export/?${params}`, {
        headers: { Accept: "text/csv" },
      });

      // Criar blob e download
      const blob = new Blob([response as any], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Logs exportados com sucesso");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const totalActions = summaries.reduce((sum, s) => sum + s.total_actions, 0);
  const avgSuccessRate =
    summaries.length > 0
      ? summaries.reduce((sum, s) => sum + s.success_rate, 0) / summaries.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Audit Log
          </h1>
          <p className="text-muted-foreground">
            Registro completo de todas as ações realizadas no sistema
          </p>
        </div>
        <Button onClick={exportLogs} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exportar CSV
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Ações
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Média do período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Únicos
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaries.reduce((sum, s) => sum + s.unique_users, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Com atividade registrada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ação Mais Comum
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {summaries[0]?.most_common_action || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Mais frequente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Refine sua busca nos logs de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Ação</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "Todas" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom
                      ? format(dateFrom, "PPP", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo
                      ? format(dateTo, "PPP", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Usuário, IP, ação..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria</CardTitle>
          <CardDescription>
            {logs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {format(
                            new Date(log.timestamp),
                            "dd/MM/yyyy HH:mm:ss",
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.user.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.resource_type && (
                            <span className="text-sm">
                              {log.resource_type} #{log.resource_id}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ip_address}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[log.status]}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
