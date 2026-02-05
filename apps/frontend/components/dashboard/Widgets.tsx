/**
 * Dashboard Widgets - Ouvify
 * Sprint 5 - Feature 5.1: Dashboard Melhorado
 *
 * Widgets reutilizáveis para o dashboard
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Users,
  MessageSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Stat Widget
interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatWidget({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: StatWidgetProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-2 mt-2">
                {trend && (
                  <span
                    className={cn(
                      "flex items-center text-xs font-medium",
                      trend === "up" && "text-success-600",
                      trend === "down" && "text-error-600",
                      trend === "neutral" && "text-text-tertiary",
                    )}
                  >
                    {trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                    {trend === "down" && (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trendValue}
                  </span>
                )}
                {subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// SLA Compliance Widget
interface SLAWidgetProps {
  compliance: number;
  target: number;
  trend?: "up" | "down";
  details?: {
    onTime: number;
    late: number;
    pending: number;
  };
}

export function SLAComplianceWidget({
  compliance,
  target,
  trend,
  details,
}: SLAWidgetProps) {
  const isHealthy = compliance >= target;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          Compliance SLA
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "Saudável" : "Atenção"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold">{compliance}%</span>
          <span className="text-sm text-muted-foreground mb-1">
            / meta {target}%
          </span>
          {trend && (
            <span
              className={cn(
                "flex items-center text-sm mb-1",
                trend === "up" ? "text-success-600" : "text-error-600",
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </span>
          )}
        </div>

        <Progress value={compliance} className="h-2 mb-4" />

        {details && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-success-600">
                {details.onTime}
              </p>
              <p className="text-xs text-muted-foreground">No prazo</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-error-600">
                {details.late}
              </p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-warning-600">
                {details.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Activity Widget
interface Activity {
  id: string;
  type: "feedback" | "response" | "status_change" | "assignment";
  title: string;
  description: string;
  time: string;
  user?: string;
}

export function RecentActivityWidget({
  activities,
}: {
  activities: Activity[];
}) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case "response":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "status_change":
        return <Zap className="h-4 w-4 text-warning-600" />;
      case "assignment":
        return <Users className="h-4 w-4 text-primary-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time} {activity.user && `• ${activity.user}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Widget
interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
}

export function QuickActionsWidget({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors relative"
            >
              <div className="text-primary mb-2">{action.icon}</div>
              <span className="text-sm font-medium text-center">
                {action.label}
              </span>
              {action.badge && (
                <Badge className="absolute -top-2 -right-2 h-5 px-1.5 text-xs">
                  {action.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Team Performance Widget
interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  resolved: number;
  avgTime: string;
}

export function TeamPerformanceWidget({ members }: { members: TeamMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Desempenho da Equipe</CardTitle>
        <CardDescription>Top performers esta semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member, idx) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 text-center">
                {idx === 0 ? (
                  <Star className="h-5 w-5 text-warning-500 fill-warning-500" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.resolved} resolvidos • {member.avgTime} tempo médio
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Alerts Widget
interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertsWidget({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "bg-error-50 border-error-200 text-error-800";
      case "warning":
        return "bg-warning-50 border-warning-200 text-warning-800";
      case "info":
        return "bg-primary-50 border-primary-200 text-primary-800";
    }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            getAlertStyles(alert.type),
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
          {alert.action && (
            <button
              onClick={alert.action.onClick}
              className="text-sm font-medium underline hover:no-underline"
            >
              {alert.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default {
  StatWidget,
  SLAComplianceWidget,
  RecentActivityWidget,
  QuickActionsWidget,
  TeamPerformanceWidget,
  AlertsWidget,
};
