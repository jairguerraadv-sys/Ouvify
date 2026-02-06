"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  User,
  Calendar,
  Globe,
  AlertCircle,
  Activity,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
  id: number;
  user: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  changes?: Record<string, any>;
}

interface UserSession {
  id: number;
  user: {
    email: string;
  };
  ip_address: string;
  user_agent: string;
  started_at: string;
  last_activity: string;
  is_active: boolean;
}

export default function AuditLogPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Auditoria e Segurança</h1>
          <p className="text-muted-foreground">
            Monitore atividades e sessões do sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ActiveSessionsCard />
          <AuditLogsCard />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const response = await api.get<{ results: UserSession[] }>(
        "/api/auditlog/sessions/active/",
      );
      setSessions(response.results || []);
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sessões Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sessões Ativas
          <Badge variant="secondary" className="ml-auto">
            {sessions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma sessão ativa no momento</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {session.user.email}
                      </span>
                    </div>
                    {session.is_active && (
                      <Badge variant="success" className="text-xs">
                        Online
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <span>{session.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        Última atividade:{" "}
                        {format(new Date(session.last_activity), "PPp", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AuditLogsCard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const response = await api.get<{ results: AuditLog[] }>(
        "/api/auditlog/logs/?limit=50",
      );
      setLogs(response.results || []);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "text-green-600",
      update: "text-blue-600",
      delete: "text-red-600",
      login: "text-purple-600",
      logout: "text-gray-600",
    };
    return colors[action.toLowerCase()] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum log de auditoria registrado</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={log.id}>
                  <div className="py-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm uppercase ${getActionColor(log.action)}`}
                          >
                            {log.action}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.resource_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          por {log.user.email}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Globe className="h-3 w-3" />
                          {log.ip_address}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
