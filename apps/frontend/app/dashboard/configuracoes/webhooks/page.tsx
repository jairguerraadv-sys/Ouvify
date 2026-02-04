"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  TestTube,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import Link from "next/link";
import { FlexBetween, MutedText } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface WebhookEndpoint {
  id: string;
  url: string;
  is_active: boolean;
  secret: string;
  events: string[];
  created_at: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_triggered_at: string | null;
}

interface WebhookDelivery {
  id: string;
  event_type: string;
  status_code: number | null;
  success: boolean;
  attempt: number;
  duration_ms: number | null;
  created_at: string;
  error_message: string | null;
}

interface WebhookStats {
  total_endpoints: number;
  active_endpoints: number;
  total_events_today: number;
  total_deliveries_today: number;
  success_rate: number;
  avg_response_time: number;
}

interface AvailableEvent {
  value: string;
  label: string;
}

export default function WebhooksPage() {
  return (
    <DashboardLayout>
      <WebhooksContent />
    </DashboardLayout>
  );
}

function WebhooksContent() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<
    Record<string, WebhookDelivery[]>
  >({});

  // Create form state
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // `DashboardLayout` já lida com `ProtectedRoute` e `Sidebar`

  useEffect(() => {
    loadWebhooks();
    loadStats();
    loadAvailableEvents();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = (await api.get("/api/v1/webhooks/endpoints/")) as {
        data: { results?: WebhookEndpoint[] } | WebhookEndpoint[];
      };
      const data = response.data;
      setWebhooks(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao carregar webhooks:", error);
      toast.error("Erro ao carregar webhooks");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = (await api.get("/api/v1/webhooks/endpoints/stats/")) as {
        data: WebhookStats;
      };
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const loadAvailableEvents = async () => {
    try {
      const response = (await api.get(
        "/api/v1/webhooks/endpoints/available_events/",
      )) as { data: AvailableEvent[] };
      setAvailableEvents(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar eventos disponíveis:", error);
      // Fallback events
      setAvailableEvents([
        { value: "feedback.created", label: "Feedback Criado" },
        { value: "feedback.updated", label: "Feedback Atualizado" },
        { value: "feedback.resolved", label: "Feedback Resolvido" },
        { value: "feedback.assigned", label: "Feedback Atribuído" },
        { value: "team.member_added", label: "Membro Adicionado" },
        { value: "team.member_removed", label: "Membro Removido" },
      ]);
    }
  };

  const loadDeliveries = async (webhookId: string) => {
    try {
      const response = (await api.get(
        `/api/v1/webhooks/endpoints/${webhookId}/deliveries/`,
      )) as { data: WebhookDelivery[] };
      setDeliveries((prev) => ({
        ...prev,
        [webhookId]: response.data || [],
      }));
    } catch (error) {
      console.error("Erro ao carregar entregas:", error);
    }
  };

  const createWebhook = async () => {
    if (!newUrl) {
      toast.error("URL é obrigatória");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Selecione pelo menos um evento");
      return;
    }

    setCreating(true);
    try {
      await api.post("/api/v1/webhooks/endpoints/", {
        url: newUrl,
        events: selectedEvents,
        is_active: true,
      });
      toast.success("Webhook criado com sucesso!");
      setShowCreateDialog(false);
      setNewUrl("");
      setSelectedEvents([]);
      loadWebhooks();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao criar webhook");
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este webhook?")) return;

    try {
      await api.delete(`/api/v1/webhooks/endpoints/${id}/`);
      toast.success("Webhook excluído");
      loadWebhooks();
      loadStats();
    } catch (error) {
      toast.error("Erro ao excluir webhook");
    }
  };

  const toggleWebhook = async (id: string, currentState: boolean) => {
    try {
      await api.patch(`/api/v1/webhooks/endpoints/${id}/`, {
        is_active: !currentState,
      });
      toast.success(currentState ? "Webhook desativado" : "Webhook ativado");
      loadWebhooks();
    } catch (error) {
      toast.error("Erro ao atualizar webhook");
    }
  };

  const testWebhook = async (id: string) => {
    try {
      await api.post(`/api/v1/webhooks/endpoints/${id}/test/`);
      toast.success("Evento de teste enviado!");
      loadDeliveries(id);
    } catch (error) {
      toast.error("Erro ao enviar teste");
    }
  };

  const regenerateSecret = async (id: string) => {
    if (!confirm("Isso invalidará o secret atual. Continuar?")) return;

    try {
      const response = await api.post(
        `/api/v1/webhooks/endpoints/${id}/regenerate_secret/`,
      );
      toast.success("Secret regenerado!");
      loadWebhooks();
    } catch (error) {
      toast.error("Erro ao regenerar secret");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const toggleExpand = (id: string) => {
    if (expandedWebhook === id) {
      setExpandedWebhook(null);
    } else {
      setExpandedWebhook(id);
      if (!deliveries[id]) {
        loadDeliveries(id);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <FlexBetween>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/configuracoes"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Webhook className="w-6 h-6" />
                Webhooks
              </h1>
              <MutedText block>Configure integrações em tempo real</MutedText>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Webhook</DialogTitle>
                <DialogDescription>
                  Configure um endpoint para receber notificações em tempo real.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL do Endpoint</Label>
                  <Input
                    id="url"
                    placeholder="https://seu-servidor.com/webhook"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A URL deve usar HTTPS e aceitar requisições POST
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Eventos para escutar</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {availableEvents.map((event) => (
                      <div
                        key={event.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={event.value}
                          checked={selectedEvents.includes(event.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEvents([
                                ...selectedEvents,
                                event.value,
                              ]);
                            } else {
                              setSelectedEvents(
                                selectedEvents.filter((e) => e !== event.value),
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={event.value}
                          className="text-sm cursor-pointer"
                        >
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={createWebhook} disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Webhook"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </FlexBetween>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Endpoints Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.active_endpoints} / {stats.total_endpoints}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eventos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_events_today}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.success_rate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avg_response_time.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Configurados</CardTitle>
          <CardDescription>
            Gerencie seus webhooks e monitore as entregas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum webhook configurado</p>
              <p className="text-sm">
                Crie seu primeiro webhook para começar a receber notificações
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  expanded={expandedWebhook === webhook.id}
                  deliveries={deliveries[webhook.id] || []}
                  onToggle={() => toggleWebhook(webhook.id, webhook.is_active)}
                  onDelete={() => deleteWebhook(webhook.id)}
                  onTest={() => testWebhook(webhook.id)}
                  onRegenerateSecret={() => regenerateSecret(webhook.id)}
                  onCopy={copyToClipboard}
                  onExpand={() => toggleExpand(webhook.id)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">
                Documentação de Webhooks
              </h4>
              <p className="text-sm text-blue-700">
                Aprenda como integrar webhooks com sua aplicação
              </p>
            </div>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <a href="/docs/webhooks" target="_blank">
                Ver Documentação
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente separado para cada webhook
function WebhookCard({
  webhook,
  expanded,
  deliveries,
  onToggle,
  onDelete,
  onTest,
  onRegenerateSecret,
  onCopy,
  onExpand,
  formatDate,
}: {
  webhook: WebhookEndpoint;
  expanded: boolean;
  deliveries: WebhookDelivery[];
  onToggle: () => void;
  onDelete: () => void;
  onTest: () => void;
  onRegenerateSecret: () => void;
  onCopy: (text: string, label: string) => void;
  onExpand: () => void;
  formatDate: (date: string) => string;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const successRate =
    webhook.total_deliveries > 0
      ? (
          (webhook.successful_deliveries / webhook.total_deliveries) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-background">
        <FlexBetween>
          <div className="flex items-center gap-3">
            <Switch checked={webhook.is_active} onCheckedChange={onToggle} />
            <div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-background-tertiary px-2 py-0.5 rounded">
                  {webhook.url}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onCopy(webhook.url, "URL")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {webhook.events.map((event) => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={webhook.is_active ? "default" : "secondary"}>
              {webhook.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTest}
              title="Enviar teste"
            >
              <TestTube className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExpand}>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </FlexBetween>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            {webhook.successful_deliveries} sucesso
          </span>
          <span className="flex items-center gap-1">
            <X className="w-4 h-4 text-red-500" />
            {webhook.failed_deliveries} falhas
          </span>
          <span>Taxa: {successRate}%</span>
          {webhook.last_triggered_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Último: {formatDate(webhook.last_triggered_at)}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-background-secondary p-4 space-y-4">
          {/* Secret */}
          <div>
            <Label className="text-sm font-medium">
              Secret (para validação de assinatura)
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-sm font-mono bg-background px-3 py-2 rounded border">
                {showSecret ? webhook.secret : "•".repeat(32)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(webhook.secret, "Secret")}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerateSecret}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerar
              </Button>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div>
            <Label className="text-sm font-medium">Entregas Recentes</Label>
            {deliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhuma entrega registrada
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {deliveries.slice(0, 5).map((delivery) => (
                  <FlexBetween
                    key={delivery.id}
                    className="bg-background p-2 rounded border text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {delivery.success ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="outline">{delivery.event_type}</Badge>
                      <span className="text-muted-foreground">
                        {delivery.status_code && `HTTP ${delivery.status_code}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {delivery.duration_ms && (
                        <span>{delivery.duration_ms}ms</span>
                      )}
                      <span>{formatDate(delivery.created_at)}</span>
                    </div>
                  </FlexBetween>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
