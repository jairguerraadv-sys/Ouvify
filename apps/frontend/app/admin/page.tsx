"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  UserPlus,
  MoreHorizontal,
  Eye,
  Power,
  ExternalLink,
  UserCog,
  Activity,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { FlexBetween, MutedText } from "@/components/ui";

interface TenantAdmin {
  id: number;
  nome: string;
  subdominio: string;
  ativo: boolean;
  plano: string;
  subscription_status: string;
  data_criacao: string;
  owner_email: string | null;
  total_feedbacks: number;
  total_users: number;
  ultimo_login: string | null;
  logo: string | null;
  cor_primaria: string | null;
}

interface AdminMetrics {
  total_tenants: number;
  tenants_ativos: number;
  tenants_inativos: number;
  novos_mes: number;
  distribuicao_planos: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
  mrr: number;
  mrr_stripe: number | null;
  churn_rate: number;
  churn_count: number;
}

const fetcher = async <T,>(url: string): Promise<T> => {
  return api.get<T>(url);
};

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const [search, setSearch] = useState("");
  const [filterPlano, setFilterPlano] = useState<string>("all");
  const [filterAtivo, setFilterAtivo] = useState<string>("all");
  const [ordering, setOrdering] = useState("-data_criacao");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    tenant: TenantAdmin | null;
    action: "toggle" | "impersonate";
  }>({ open: false, tenant: null, action: "toggle" });

  // Query params para filtros
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterPlano !== "all") params.append("plano", filterPlano);
    if (filterAtivo !== "all") params.append("ativo", filterAtivo);
    if (ordering) params.append("ordering", ordering);
    return params.toString();
  }, [search, filterPlano, filterAtivo, ordering]);

  // Fetch tenants
  const { data: tenants, error, mutate, isLoading } = useSWR<TenantAdmin[]>(
    `/api/admin/tenants/?${queryParams}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useSWR<AdminMetrics>(
    "/api/admin/tenants/metrics/",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Toggle ativo status
  const handleToggleAtivo = useCallback(async (tenant: TenantAdmin) => {
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/`, { ativo: !tenant.ativo });
      await mutate();
      toast.success(`Tenant ${tenant.ativo ? "desativado" : "ativado"} com sucesso!`);
    } catch (err) {
      console.error("Erro ao atualizar tenant", err);
      toast.error("Erro ao atualizar tenant");
    }
    setConfirmDialog({ open: false, tenant: null, action: "toggle" });
  }, [mutate]);

  // Impersonate tenant
  const handleImpersonate = useCallback(async (tenant: TenantAdmin) => {
    try {
      const response = await api.post<{
        access_token: string;
        tenant: { subdominio: string };
      }>(`/api/admin/tenants/${tenant.id}/impersonate/`);
      
      // Abrir nova aba com token
      const url = `http://${response.tenant.subdominio}.localhost:3000/dashboard?impersonate_token=${response.access_token}`;
      window.open(url, "_blank");
      
      toast.success("Sessão de impersonation iniciada em nova aba");
    } catch (err) {
      console.error("Erro ao impersonar tenant", err);
      toast.error("Erro ao iniciar impersonation");
    }
    setConfirmDialog({ open: false, tenant: null, action: "impersonate" });
  }, []);

  // Update plano
  const handleUpdatePlano = useCallback(async (tenant: TenantAdmin, newPlano: string) => {
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/`, { plano: newPlano });
      await mutate();
      toast.success(`Plano alterado para ${newPlano.toUpperCase()}`);
    } catch (err) {
      console.error("Erro ao alterar plano", err);
      toast.error("Erro ao alterar plano");
    }
  }, [mutate]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (!tenants) return;
    
    const headers = ["ID", "Nome", "Subdomínio", "Plano", "Status", "Feedbacks", "Data Criação"];
    const rows = tenants.map(t => [
      t.id,
      t.nome,
      t.subdominio,
      t.plano,
      t.ativo ? "Ativo" : "Inativo",
      t.total_feedbacks,
      t.data_criacao
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenants_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    
    toast.success("CSV exportado com sucesso!");
  }, [tenants]);

  // Handle 403
  if (error?.response?.status === 403) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card border-border p-8">
          <h1 className="text-2xl font-semibold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Área restrita a Super Admins.</p>
        </Card>
      </main>
    );
  }

  const getPlanoBadgeColor = (plano: string) => {
    const colors: Record<string, string> = {
      free: "bg-muted",
      starter: "bg-primary-600",
      pro: "bg-secondary-600",
      enterprise: "bg-amber-600",
    };
    return colors[plano] || "bg-muted";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border p-6 min-h-screen sticky top-0">
          <div className="mb-8">
            <Logo size="md" />
            <p className="text-xs text-muted-foreground mt-2">Torre de Controle Admin</p>
          </div>
          
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent text-accent-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Visão Geral</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Financeiro</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Logs de Atividade</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="mb-8">
            <FlexBetween>
              <div>
                <h1 className="text-2xl font-semibold">Painel do Super Admin</h1>
                <MutedText block>Monitoramento de crescimento do SaaS</MutedText>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => mutate()}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleExportCSV}
                  className="bg-secondary text-secondary-foreground border-border"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </FlexBetween>
          </header>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            <KPICard
              title="Total Tenants"
              value={metrics?.total_tenants}
              icon={Building2}
              loading={metricsLoading}
            />
            <KPICard
              title="Ativos"
              value={metrics?.tenants_ativos}
              icon={Users}
              color="text-success-400"
              loading={metricsLoading}
            />
            <KPICard
              title="Novos no Mês"
              value={metrics?.novos_mes}
              icon={UserPlus}
              color="text-primary-400"
              loading={metricsLoading}
            />
            <KPICard
              title="MRR"
              value={metrics?.mrr}
              icon={DollarSign}
              color="text-emerald-400"
              format="currency"
              loading={metricsLoading}
            />
            <KPICard
              title="MRR Stripe"
              value={metrics?.mrr_stripe}
              icon={TrendingUp}
              color="text-secondary-400"
              format="currency"
              loading={metricsLoading}
            />
            <KPICard
              title="Churn Rate"
              value={metrics?.churn_rate}
              icon={Activity}
              color="text-error-400"
              format="percent"
              loading={metricsLoading}
            />
          </div>

          {/* Distribuição de Planos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border p-4">
              <FlexBetween>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Free</p>
                  <p className="text-2xl font-bold text-muted-foreground">{metrics?.distribuicao_planos?.free || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-muted-foreground" />
                </div>
              </FlexBetween>
            </Card>
            <Card className="bg-card border-border p-4">
              <FlexBetween>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Starter</p>
                  <p className="text-2xl font-bold text-primary-400">{metrics?.distribuicao_planos?.starter || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-primary-400" />
                </div>
              </FlexBetween>
            </Card>
            <Card className="bg-card border-border p-4">
              <FlexBetween>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Pro</p>
                  <p className="text-2xl font-bold text-secondary-400">{metrics?.distribuicao_planos?.pro || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary-500/20 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-secondary-400" />
                </div>
              </FlexBetween>
            </Card>
            <Card className="bg-card border-border p-4">
              <FlexBetween>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Enterprise</p>
                  <p className="text-2xl font-bold text-amber-400">{metrics?.distribuicao_planos?.enterprise || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-amber-400" />
                </div>
              </FlexBetween>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px] max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou subdomínio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filter by Plano */}
                <Select value={filterPlano} onValueChange={setFilterPlano}>
                  <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos Planos</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter by Status */}
                <Select value={filterAtivo} onValueChange={setFilterAtivo}>
                  <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="true">Ativos</SelectItem>
                    <SelectItem value="false">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordering */}
                <Select value={ordering} onValueChange={setOrdering}>
                  <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="-data_criacao">Mais recentes</SelectItem>
                    <SelectItem value="data_criacao">Mais antigos</SelectItem>
                    <SelectItem value="nome">Nome A-Z</SelectItem>
                    <SelectItem value="-nome">Nome Z-A</SelectItem>
                    <SelectItem value="plano">Plano ↑</SelectItem>
                    <SelectItem value="-plano">Plano ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card className="bg-card border-border">
            <Table>
              <TableCaption className="text-muted-foreground">
                {isLoading ? "Carregando..." : `${tenants?.length || 0} tenants encontrados`}
              </TableCaption>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Empresa</TableHead>
                  <TableHead className="text-muted-foreground">Subdomínio</TableHead>
                  <TableHead className="text-muted-foreground">Plano</TableHead>
                  <TableHead className="text-muted-foreground">Feedbacks</TableHead>
                  <TableHead className="text-muted-foreground">Criado em</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  (tenants || []).map((tenant) => (
                    <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {tenant.logo ? (
                              <img
                                src={tenant.logo}
                                alt={tenant.nome ? `Logo da empresa ${tenant.nome}` : 'Logo da empresa'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">{tenant.nome}</p>
                            <p className="text-xs text-muted-foreground">{tenant.owner_email || "Sem email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`http://${tenant.subdominio}.localhost:3000/dashboard`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-400 hover:text-primary-300 hover:underline text-sm"
                        >
                          {tenant.subdominio}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={tenant.plano || "free"}
                          onValueChange={(value) => handleUpdatePlano(tenant, value)}
                        >
                          <SelectTrigger className={`w-[100px] h-7 text-xs ${getPlanoBadgeColor(tenant.plano || "free")} border-0`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.total_feedbacks || 0}
                      </TableCell>
                      <TableCell>
                        <MutedText>{formatDate(tenant.data_criacao, 'short')}</MutedText>
                      </TableCell>
                      <TableCell>
                        <Badge className={tenant.ativo ? "bg-success-600/20 text-success-400 border-success-600/30" : "bg-error-600/20 text-error-400 border-error-600/30"}>
                          {tenant.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuLabel className="text-muted-foreground">Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="text-popover-foreground hover:bg-muted cursor-pointer">
                              <Link href={`/admin/tenants/${tenant.id}`} className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-popover-foreground hover:bg-muted cursor-pointer"
                              onClick={() => setConfirmDialog({ open: true, tenant, action: "impersonate" })}
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              Impersonar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-popover-foreground hover:bg-muted cursor-pointer">
                              <a href={`http://${tenant.subdominio}.localhost:3000/dashboard`} target="_blank" rel="noreferrer" className="flex items-center">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir Painel
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className={`cursor-pointer ${tenant.ativo ? "text-error-400 hover:bg-error-500/20" : "text-success-400 hover:bg-success-500/20"}`}
                              onClick={() => setConfirmDialog({ open: true, tenant, action: "toggle" })}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {tenant.ativo ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={
          confirmDialog.action === "toggle"
            ? confirmDialog.tenant?.ativo ? "Desativar Tenant" : "Ativar Tenant"
            : "Impersonar Tenant"
        }
        description={
          confirmDialog.action === "toggle"
            ? `Tem certeza que deseja ${confirmDialog.tenant?.ativo ? "desativar" : "ativar"} o tenant "${confirmDialog.tenant?.nome}"?`
            : `Você está prestes a acessar o painel do tenant "${confirmDialog.tenant?.nome}" como o proprietário. Esta ação será registrada no log de auditoria.`
        }
        confirmText={confirmDialog.action === "toggle" ? "Confirmar" : "Iniciar Impersonation"}
        variant={confirmDialog.action === "toggle" && confirmDialog.tenant?.ativo ? "destructive" : "default"}
        onConfirm={() => {
          if (confirmDialog.tenant) {
            if (confirmDialog.action === "toggle") {
              handleToggleAtivo(confirmDialog.tenant);
            } else {
              handleImpersonate(confirmDialog.tenant);
            }
          }
        }}
      />
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | null | undefined;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  format?: "number" | "currency" | "percent";
  loading?: boolean;
}

function KPICard({ title, value, icon: Icon, color = "text-foreground", format = "number", loading }: KPICardProps) {
  const formatValue = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "-";
    
    switch (format) {
      case "currency":
        return `R$ ${val.toLocaleString("pt-BR")}`;
      case "percent":
        return `${val}%`;
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <FlexBetween>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1 bg-muted" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{formatValue(value)}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </FlexBetween>
      </CardContent>
    </Card>
  );
}
