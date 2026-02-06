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
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserSession {
  id: number;
  user: number;
  started_at: string;
  last_activity: string;
  ip_address: string;
  user_agent: string;
  device_type: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
  location?: string;
  is_active: boolean;
  is_current: boolean;
}

interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  total_logins_24h: number;
  total_logins_7d: number;
  most_used_device: string;
  most_used_browser: string;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([
        api.get<{ results: UserSession[] }>("/api/auditlog/sessions/"),
        api.get<SessionStats>("/api/auditlog/sessions/stats/"),
      ]);

      setSessions(sessionsData.results || []);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: number) => {
    setTerminating(sessionId);
    try {
      await api.delete(`/api/auditlog/sessions/${sessionId}/`);
      toast.success("Sessão encerrada com sucesso");
      fetchData(); // Recarrega dados
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setTerminating(null);
    }
  };

  const terminateAllSessions = async () => {
    if (
      !confirm(
        "Tem certeza que deseja encerrar todas as outras sessões? Você permanecerá conectado apenas neste dispositivo.",
      )
    ) {
      return;
    }

    try {
      await api.post("/api/logout/all/");
      toast.success("Todas as outras sessões foram encerradas");
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Segurança & Sessões
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas sessões ativas e monitore atividade da conta
          </p>
        </div>
        <Button variant="destructive" onClick={terminateAllSessions}>
          Encerrar todas as sessões
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessões Ativas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_sessions}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.total_sessions} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Logins (24h)
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_logins_24h}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_logins_7d} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dispositivo Principal
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats.most_used_device}
              </div>
              <p className="text-xs text-muted-foreground">Mais usado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Navegador Principal
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.most_used_browser}
              </div>
              <p className="text-xs text-muted-foreground">Mais usado</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Dispositivos e locais onde você está conectado atualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Navegador</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Última atividade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma sessão ativa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.device_type)}
                        <div>
                          <div className="font-medium">{session.os}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {session.device_type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{session.browser}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {session.location || session.ip_address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(session.last_activity), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {session.is_current ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Esta sessão
                        </Badge>
                      ) : session.is_active ? (
                        <Badge className="bg-blue-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inativa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.is_current && session.is_active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                          disabled={terminating === session.id}
                        >
                          {terminating === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-2">Encerrar</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
