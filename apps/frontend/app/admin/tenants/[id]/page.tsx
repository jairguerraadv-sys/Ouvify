"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  Mail,
  Calendar,
  CreditCard,
  Users,
  Activity,
  ArrowLeft,
  ExternalLink,
  Power,
  CheckCircle,
  XCircle,
  Globe,
  Palette,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import Link from "next/link";
import { FlexBetween } from "@/components/ui/layout-utils";

interface TenantDetails {
  id: number;
  nome: string;
  subdominio: string;
  email: string;
  plano: string;
  ativo: boolean;
  data_criacao: string;
  stripe_customer_id?: string;
  subscription_status?: string;
  total_feedbacks?: number;
  ultimo_login?: string;
  logo?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
}

export default function TenantDetailsPage() {
  return (
    <ProtectedRoute>
      <TenantDetailsContent />
    </ProtectedRoute>
  );
}

function TenantDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<TenantDetails>(
        `/api/admin/tenants/${tenantId}/`,
      );
      setTenant(response);
    } catch (error: any) {
      console.error("Erro ao carregar detalhes do tenant:", error);
      if (error?.response?.status === 404) {
        toast.error("Tenant não encontrado");
      } else if (error?.response?.status === 403) {
        toast.error("Acesso negado");
      } else {
        toast.error(getErrorMessage(error) || "Erro ao carregar dados");
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId]);

  const handleToggleStatus = async () => {
    if (!tenant) return;

    const action = tenant.ativo ? "desativar" : "reativar";
    if (!confirm(`Deseja realmente ${action} este tenant?`)) return;

    setToggling(true);
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/`, {
        ativo: !tenant.ativo,
      });

      setTenant({ ...tenant, ativo: !tenant.ativo });
      toast.success(
        `Tenant ${tenant.ativo ? "desativado" : "reativado"} com sucesso!`,
      );
    } catch (error: any) {
      toast.error(getErrorMessage(error) || "Erro ao alterar status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <TenantDetailsSkeleton />;
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card border-border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Tenant não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O tenant solicitado não existe ou foi removido.
          </p>
          <Button onClick={() => router.push("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Lista
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <FlexBetween>
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Admin</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">
                Tenant #{tenant.id}
              </span>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </FlexBetween>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tenant Header Card */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Logo ou Avatar */}
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                  {tenant.logo ? (
                    <img
                      src={tenant.logo}
                      alt={`Logo ${tenant.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>

                {/* Info Principal */}
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {tenant.nome}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {tenant.subdominio}.ouvify.com
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge
                      variant={tenant.ativo ? "success" : "destructive"}
                    >
                      {tenant.ativo ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </>
                      )}
                    </Badge>
                    <Badge variant="default" className="uppercase">
                      {tenant.plano || "Free"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://${tenant.subdominio}.ouvify.com/enviar`,
                      "_blank",
                    )
                  }
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Página Pública
                </Button>
                <Button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  variant={tenant.ativo ? "destructive" : "default"}
                  className={
                    tenant.ativo
                      ? "bg-error hover:bg-error"
                      : "bg-success hover:bg-success"
                  }
                >
                  <Power className="w-4 h-4 mr-2" />
                  {toggling
                    ? "Processando..."
                    : tenant.ativo
                      ? "Desativar"
                      : "Reativar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Informações de Contato */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <InfoRow label="Email" value={tenant.email} />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Conta */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-success" />
                Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <InfoRow
                  label="Cliente desde"
                  value={new Date(tenant.data_criacao).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                />
                <InfoRow
                  label="Último login"
                  value={
                    tenant.ultimo_login
                      ? new Date(tenant.ultimo_login).toLocaleDateString(
                          "pt-BR",
                        )
                      : "Nunca"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <InfoRow
                  label="Plano"
                  value={tenant.plano?.toUpperCase() || "FREE"}
                />
                <InfoRow
                  label="Status"
                  value={tenant.subscription_status || "Sem assinatura"}
                />
                <InfoRow
                  label="Stripe ID"
                  value={tenant.stripe_customer_id || "N/A"}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            label="Total Feedbacks"
            value={tenant.total_feedbacks?.toString() || "0"}
            color="blue"
          />
          <StatsCard
            icon={Activity}
            label="Status"
            value={tenant.ativo ? "Operacional" : "Suspenso"}
            color={tenant.ativo ? "green" : "red"}
          />
          <StatsCard
            icon={BarChart3}
            label="Plano"
            value={tenant.plano?.toUpperCase() || "FREE"}
            color="purple"
          />
          <StatsCard
            icon={Calendar}
            label="Dias de Conta"
            value={Math.floor(
              (new Date().getTime() - new Date(tenant.data_criacao).getTime()) /
                (1000 * 60 * 60 * 24),
            ).toString()}
            color="orange"
          />
        </div>

        {/* White-label Preview */}
        {(tenant.cor_primaria || tenant.cor_secundaria) && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-secondary" />
                Configuração White-label
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Cores personalizadas configuradas pelo tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                {tenant.cor_primaria && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cor Primária
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-border overflow-hidden"
                        aria-label="Cor primária"
                      >
                        <svg
                          viewBox="0 0 48 48"
                          className="w-full h-full"
                          role="presentation"
                        >
                          <rect
                            width="48"
                            height="48"
                            fill={tenant.cor_primaria}
                          />
                        </svg>
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">
                        {tenant.cor_primaria}
                      </span>
                    </div>
                  </div>
                )}
                {tenant.cor_secundaria && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cor Secundária
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-border overflow-hidden"
                        aria-label="Cor secundária"
                      >
                        <svg
                          viewBox="0 0 48 48"
                          className="w-full h-full"
                          role="presentation"
                        >
                          <rect
                            width="48"
                            height="48"
                            fill={tenant.cor_secundaria}
                          />
                        </svg>
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">
                        {tenant.cor_secundaria}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para linhas de informação
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <FlexBetween>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </FlexBetween>
  );
}

// Componente de card de estatísticas
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: "blue" | "green" | "red" | "purple" | "orange";
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-primary/10 text-primary",
    green: "bg-success/10 text-success",
    red: "bg-error/10 text-error",
    purple: "bg-secondary/10 text-secondary",
    orange: "bg-warning/10 text-warning",
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function TenantDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Skeleton className="h-8 w-64 bg-muted" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-xl bg-muted" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-muted" />
                <Skeleton className="h-4 w-32 bg-muted" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-muted" />
                  <Skeleton className="h-6 w-16 bg-muted" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
