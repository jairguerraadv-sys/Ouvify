'use client';

/**
 * Card de alertas de segurança para o dashboard
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getSecurityEvents,
  AuditLog,
  getSeverityColor,
  formatRelativeTime,
} from '@/lib/audit-log';

interface SecurityAlertsCardProps {
  className?: string;
  maxItems?: number;
}

export function SecurityAlertsCard({ className, maxItems = 5 }: SecurityAlertsCardProps) {
  const [alerts, setAlerts] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getSecurityEvents();
      setAlerts(data.slice(0, maxItems));
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Alertas de Segurança
          </CardTitle>
          <CardDescription>Eventos que requerem atenção</CardDescription>
        </div>
        {alerts.length > 0 && (
          <Badge variant="destructive">{alerts.length}</Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm font-medium">Nenhum alerta</p>
            <p className="text-xs text-muted-foreground">
              Sistema operando normalmente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
              >
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {alert.action_display}
                    </span>
                    <Badge className={getSeverityColor(alert.severity)} variant="outline">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(alert.timestamp)}</span>
                    {alert.ip_address && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{alert.ip_address}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <Link href="/dashboard/auditlog" className="block">
              <Button variant="outline" className="w-full">
                Ver todos os logs
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SecurityAlertsCard;
