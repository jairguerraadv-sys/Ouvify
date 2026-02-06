/**
 * Hook para gerenciamento de Audit Logs
 * Integra com a API de auditoria do backend
 */

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ===== TIPOS =====

export interface AuditLogUser {
  id: number;
  email: string;
  nome: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  action_display: string;
  action_icon: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  severity_display: string;
  description: string;
  user: AuditLogUser | null;
  content_type_name: string | null;
  object_id: number | null;
  object_repr: string;
  ip_address: string | null;
  metadata: Record<string, any>;
}

export interface AuditLogPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  total_pages: number;
  current_page: number;
  results: AuditLog[];
}

export interface AuditLogFilters {
  action?: string;
  severity?: string;
  user?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ActionOption {
  value: string;
  label: string;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface SeverityBreakdown {
  severity: string;
  severity_display: string;
  count: number;
  percentage: number;
}

export interface TopUser {
  user_id: number;
  user_email: string;
  user_nome: string;
  action_count: number;
}

export interface AuditAnalytics {
  total_logs: number;
  total_users_active: number;
  action_breakdown: Array<{
    action: string;
    action_display: string;
    count: number;
  }>;
  severity_breakdown: SeverityBreakdown[];
  time_series: TimeSeriesData[];
  top_users: TopUser[];
  security_alerts: number;
  period_start: string;
  period_end: string;
}

// ===== HOOK PRINCIPAL =====

export function useAuditLog(filters?: AuditLogFilters) {
  // Construir query string
  const queryParams = new URLSearchParams();
  
  if (filters?.action) queryParams.append('action', filters.action);
  if (filters?.severity) queryParams.append('severity', filters.severity);
  if (filters?.user) queryParams.append('user', filters.user.toString());
  if (filters?.date_from) queryParams.append('date_from', filters.date_from);
  if (filters?.date_to) queryParams.append('date_to', filters.date_to);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.page_size) queryParams.append('page_size', filters.page_size.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/auditlog/logs/${queryString ? `?${queryString}` : ''}`;

  // SWR para logs paginados
  const { 
    data: logs, 
    error: logsError, 
    mutate: refetchLogs,
    isLoading: isLoadingLogs
  } = useSWR<AuditLogPaginatedResponse>(endpoint);

  // SWR para analytics
  const {
    data: analytics,
    error: analyticsError,
    mutate: refetchAnalytics,
    isLoading: isLoadingAnalytics
  } = useSWR<AuditAnalytics>('/api/auditlog/logs/analytics/?period=30');

  // SWR para lista de ações
  const {
    data: availableActions,
    error: actionsError,
    isLoading: isLoadingActions
  } = useSWR<ActionOption[]>('/api/auditlog/logs/actions/');

  // Estado de loading combinado
  const isLoading = isLoadingLogs || isLoadingAnalytics || isLoadingActions;
  const error = logsError || analyticsError || actionsError;

  return {
    // Dados de logs
    logs: logs?.results,
    count: logs?.count || 0,
    totalPages: logs?.total_pages || 0,
    currentPage: logs?.current_page || 1,
    pageSize: logs?.page_size || 20,
    next: logs?.next,
    previous: logs?.previous,
    
    // Analytics
    analytics,
    
    // Lista de ações para filtro
    availableActions,
    
    // Estados
    isLoading,
    error,
    
    // Refetch
    refetchLogs,
    refetchAnalytics,
  };
}

// ===== HOOK PARA DETALHES DE UM LOG =====

export function useAuditLogDetail(logId: number | null) {
  const { data, error, isLoading } = useSWR<AuditLog>(
    logId ? `/api/auditlog/logs/${logId}/` : null
  );

  return {
    log: data,
    error,
    isLoading,
  };
}

// ===== HOOK PARA EXPORTAÇÃO =====

export function useAuditLogExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportLogs = useCallback(async (filters?: AuditLogFilters) => {
    setIsExporting(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.date_from) queryParams.append('date_from', filters.date_from);
      if (filters?.date_to) queryParams.append('date_to', filters.date_to);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.severity) queryParams.append('severity', filters.severity);

      const queryString = queryParams.toString();
      const url = `/api/auditlog/logs/export/${queryString ? `?${queryString}` : ''}`;

      // Fazer download do CSV
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar logs');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Logs exportados com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast.error('Erro ao exportar logs. Tente novamente.');
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportLogs,
    isExporting,
  };
}

// ===== UTILITÁRIOS =====

export const SEVERITY_COLORS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'destructive',
} as const;

export const ACTION_ICONS: Record<string, string> = {
  // Autenticação
  LOGIN: '🔑',
  LOGOUT: '🚪',
  LOGIN_FAILED: '🚫',
  PASSWORD_CHANGE: '🔐',
  PASSWORD_RESET: '🔄',
  MFA_ENABLED: '🛡️',
  MFA_DISABLED: '⚠️',
  
  // CRUD
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  VIEW: '👁️',
  EXPORT: '📤',
  
  // Feedbacks
  FEEDBACK_CREATED: '📝',
  FEEDBACK_UPDATED: '📋',
  FEEDBACK_STATUS_CHANGED: '🔄',
  FEEDBACK_ASSIGNED: '👤',
  FEEDBACK_RESOLVED: '✅',
  
  // Tenant/Admin
  TENANT_CREATED: '🏢',
  TENANT_UPDATED: '🏢',
  TENANT_SUSPENDED: '⏸️',
  USER_INVITED: '📧',
  USER_REMOVED: '👋',
  PERMISSION_CHANGED: '🔑',
  
  // Sistema
  SETTINGS_CHANGED: '⚙️',
  API_ACCESS: '🔌',
  WEBHOOK_TRIGGERED: '🔔',
  
  // Segurança
  SECURITY_ALERT: '🚨',
  SUSPICIOUS_ACTIVITY: '⚠️',
  ACCESS_DENIED: '🚫',
};

export function getActionIcon(action: string): string {
  return ACTION_ICONS[action] || '📄';
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'há poucos segundos';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  
  return formatTimestamp(timestamp);
}
