/**
 * SubscriptionManager Component - Ouvify
 * Sprint 4 - Feature 4.3: Pricing Page
 *
 * Componente para gerenciar assinatura no dashboard
 */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Calendar,
  FileText,
  Settings,
  AlertTriangle,
  Crown,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  useSubscriptionStatus,
  useBillingActions,
  SubscriptionStatus,
} from "@/hooks/use-billing";

interface SubscriptionManagerProps {
  className?: string;
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { status, loading, error, refetch } = useSubscriptionStatus();
  const { createPortal, loading: actionLoading } = useBillingActions();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    const result = await createPortal(window.location.href);
    if (result?.portal_url) {
      window.location.href = result.portal_url;
    }
    setPortalLoading(false);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="error">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status?.has_subscription) {
    return (
      <NoSubscriptionCard
        onUpgrade={() => (window.location.href = "/precos")}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Minha Assinatura
            </CardTitle>
            <CardDescription>Gerencie seu plano e faturamento</CardDescription>
          </div>
          <StatusBadge status={status.status || "inactive"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        {status.plan && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold text-lg">{status.plan.name}</p>
              <p className="text-sm text-muted-foreground">
                {status.plan.description}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl">
                {status.plan.is_free
                  ? "Grátis"
                  : `R$ ${status.plan.price_cents / 100}`}
              </p>
              {!status.plan.is_free && (
                <p className="text-sm text-muted-foreground">/mês</p>
              )}
            </div>
          </div>
        )}

        {/* Trial Alert */}
        {status.is_trialing && (
          <TrialAlert daysRemaining={calculateTrialDaysRemaining(status)} />
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="flex items-center gap-2"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Gerenciar Pagamento
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/dashboard/billing/invoices")
            }
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Ver Faturas
          </Button>

          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/precos")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Mudar Plano
          </Button>
        </div>

        {/* Usage Preview */}
        {status.plan?.limits && <UsagePreview limits={status.plan.limits} />}
      </CardContent>
    </Card>
  );
}

// Sub-components
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    active: { label: "Ativo", variant: "default" },
    trialing: { label: "Em teste", variant: "secondary" },
    past_due: { label: "Atrasado", variant: "destructive" },
    canceled: { label: "Cancelado", variant: "destructive" },
    inactive: { label: "Inativo", variant: "outline" },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function NoSubscriptionCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Sem assinatura ativa</h3>
        <p className="text-muted-foreground mb-4">
          Escolha um plano para desbloquear todos os recursos
        </p>
        <Button onClick={onUpgrade}>Ver Planos</Button>
      </CardContent>
    </Card>
  );
}

function TrialAlert({ daysRemaining }: { daysRemaining: number }) {
  const urgency = daysRemaining <= 3 ? "warning" : "info";

  return (
    <Alert variant={urgency}>
      <Clock className="h-4 w-4" />
      <AlertTitle>Período de teste</AlertTitle>
      <AlertDescription>
        {daysRemaining > 0 ? (
          <>
            Seu teste grátis termina em <strong>{daysRemaining} dias</strong>.{" "}
            {daysRemaining <= 3 &&
              "Adicione um método de pagamento para continuar usando."}
          </>
        ) : (
          "Seu período de teste terminou. Escolha um plano para continuar."
        )}
      </AlertDescription>
    </Alert>
  );
}

function UsagePreview({ limits }: { limits: Record<string, number> }) {
  // Mock usage data - in production, this would come from the API
  const usageMap: Record<string, { used: number; label: string }> = {
    feedbacks_per_month: { used: 25, label: "Feedbacks este mês" },
    users: { used: 2, label: "Usuários" },
    storage_gb: { used: 0.3, label: "Armazenamento (GB)" },
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase">
        Uso
      </h4>
      {Object.entries(limits).map(([key, limit]) => {
        const usage = usageMap[key];
        if (!usage || limit === -1) return null;

        const percentage = Math.min((usage.used / limit) * 100, 100);
        const isNearLimit = percentage >= 80;

        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{usage.label}</span>
              <span
                className={isNearLimit ? "text-warning-600 font-medium" : ""}
              >
                {usage.used} / {limit}
              </span>
            </div>
            <Progress
              value={percentage}
              className={isNearLimit ? "bg-warning-100" : ""}
            />
          </div>
        );
      })}
    </div>
  );
}

function calculateTrialDaysRemaining(status: SubscriptionStatus): number {
  // This would be calculated from trial_end date
  // For now, return a mock value
  return 10;
}

export default SubscriptionManager;
