"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface NotificationPreferences {
  id: number;
  email_on_new_feedback: boolean;
  email_on_feedback_response: boolean;
  email_on_status_change: boolean;
  push_on_new_feedback: boolean;
  push_on_feedback_response: boolean;
  push_on_status_change: boolean;
  push_on_mention: boolean;
  digest_frequency: "never" | "daily" | "weekly";
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

const defaultPreferences: Partial<NotificationPreferences> = {
  email_on_new_feedback: true,
  email_on_feedback_response: true,
  email_on_status_change: true,
  push_on_new_feedback: false,
  push_on_feedback_response: false,
  push_on_status_change: false,
  push_on_mention: true,
  digest_frequency: "never",
};

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] =
    useState<Partial<NotificationPreferences>>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get<NotificationPreferences>(
        "/api/push/preferences/me/",
      );
      setPreferences(response);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
      // Se não existir, mantém os defaults
      if ((error as any)?.response?.status !== 404) {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/push/preferences/me/", preferences);
      toast.success("Preferências salvas com sucesso!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Configure como deseja receber notificações sobre feedbacks e
          atividades.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Notificações por E-mail</CardTitle>
          </div>
          <CardDescription>
            Receba atualizações importantes diretamente no seu e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Novo feedback</label>
              <p className="text-sm text-muted-foreground">
                Quando um novo feedback for enviado
              </p>
            </div>
            <Switch
              checked={preferences.email_on_new_feedback}
              onCheckedChange={(checked) =>
                updatePreference("email_on_new_feedback", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Resposta recebida</label>
              <p className="text-sm text-muted-foreground">
                Quando alguém responder a um feedback
              </p>
            </div>
            <Switch
              checked={preferences.email_on_feedback_response}
              onCheckedChange={(checked) =>
                updatePreference("email_on_feedback_response", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Mudança de status</label>
              <p className="text-sm text-muted-foreground">
                Quando o status de um feedback for alterado
              </p>
            </div>
            <Switch
              checked={preferences.email_on_status_change}
              onCheckedChange={(checked) =>
                updatePreference("email_on_status_change", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações Push</CardTitle>
          </div>
          <CardDescription>
            Receba notificações em tempo real no navegador (requer permissão)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Novo feedback</label>
              <p className="text-sm text-muted-foreground">
                Notificação instantânea para novos feedbacks
              </p>
            </div>
            <Switch
              checked={preferences.push_on_new_feedback}
              onCheckedChange={(checked) =>
                updatePreference("push_on_new_feedback", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Resposta recebida</label>
              <p className="text-sm text-muted-foreground">
                Quando alguém responder a um feedback
              </p>
            </div>
            <Switch
              checked={preferences.push_on_feedback_response}
              onCheckedChange={(checked) =>
                updatePreference("push_on_feedback_response", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Mudança de status</label>
              <p className="text-sm text-muted-foreground">
                Quando o status de um feedback for alterado
              </p>
            </div>
            <Switch
              checked={preferences.push_on_status_change}
              onCheckedChange={(checked) =>
                updatePreference("push_on_status_change", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Menções</label>
              <p className="text-sm text-muted-foreground">
                Quando você for mencionado em um comentário
              </p>
            </div>
            <Switch
              checked={preferences.push_on_mention}
              onCheckedChange={(checked) =>
                updatePreference("push_on_mention", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchPreferences} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar preferências
        </Button>
      </div>
    </div>
  );
}
