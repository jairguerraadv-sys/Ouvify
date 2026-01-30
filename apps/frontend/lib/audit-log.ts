/**
 * API Client para Audit Log
 */

import { apiClient } from '@/lib/api';

// ===== TYPES =====

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
  metadata: Record<string, unknown>;
}

export interface ActionOption {
  value: string;
  label: string;
}

export interface ActionCount {
  action: string;
  action_display: string;
  count: number;
}

export interface SeverityBreakdown {
  severity: string;
  severity_display: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
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
  action_breakdown: ActionCount[];
  severity_breakdown: SeverityBreakdown[];
  time_series: TimeSeriesData[];
  top_users: TopUser[];
  security_alerts: number;
  period_start: string;
  period_end: string;
}

export interface SessionStats {
  active_sessions: number;
  total_sessions_30d: number;
  avg_session_duration_minutes: number;
  device_breakdown: Array<{ device_type: string; count: number }>;
  browser_breakdown: Array<{ browser: string; count: number }>;
}

export interface AuditLogFilters {
  action?: string;
  severity?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== API FUNCTIONS =====

const BASE_URL = '/api/auditlog';

/**
 * Busca lista paginada de audit logs
 */
export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<PaginatedResponse<AuditLog>> {
  const params = new URLSearchParams();
  
  if (filters.action) params.append('action', filters.action);
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.page_size) params.append('page_size', String(filters.page_size));
  
  const url = `${BASE_URL}/logs/?${params.toString()}`;
  const response = await apiClient.get<PaginatedResponse<AuditLog>>(url);
  return response.data;
}

/**
 * Busca um audit log específico
 */
export async function getAuditLog(id: number): Promise<AuditLog> {
  const response = await apiClient.get<AuditLog>(`${BASE_URL}/logs/${id}/`);
  return response.data;
}

/**
 * Busca dados de analytics consolidados
 */
export async function getAuditAnalytics(
  periodDays: number = 30
): Promise<AuditAnalytics> {
  const response = await apiClient.get<AuditAnalytics>(
    `${BASE_URL}/logs/analytics/?period=${periodDays}`
  );
  return response.data;
}

/**
 * Busca lista de ações disponíveis para filtro
 */
export async function getActionOptions(): Promise<ActionOption[]> {
  const response = await apiClient.get<ActionOption[]>(`${BASE_URL}/logs/actions/`);
  return response.data;
}

/**
 * Busca eventos de segurança recentes
 */
export async function getSecurityEvents(): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[]>(`${BASE_URL}/logs/recent_security/`);
  return response.data;
}

/**
 * Exporta logs para CSV
 */
export async function exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
  const params = new URLSearchParams();
  
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  
  const response = await apiClient.get(`${BASE_URL}/logs/export/?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Busca estatísticas de sessão
 */
export async function getSessionStats(): Promise<SessionStats> {
  const response = await apiClient.get<SessionStats>(`${BASE_URL}/sessions/stats/`);
  return response.data;
}

// ===== HELPER FUNCTIONS =====

/**
 * Retorna cor baseada na severidade
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    INFO: 'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-300',
    WARNING: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
    ERROR: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300',
    CRITICAL: 'bg-error-200 text-error-900 dark:bg-error-800 dark:text-error-100',
  };
  return colors[severity] || colors.INFO;
}

/**
 * Retorna cor baseada na ação
 */
export function getActionColor(action: string): string {
  if (action.includes('LOGIN')) {
    return action.includes('FAILED') 
      ? 'bg-error-100 text-error-800' 
      : 'bg-success-100 text-success-800';
  }
  if (action.includes('CREATE') || action.includes('CREATED')) {
    return 'bg-primary-100 text-primary-800';
  }
  if (action.includes('UPDATE') || action.includes('CHANGED')) {
    return 'bg-warning-100 text-warning-800';
  }
  if (action.includes('DELETE') || action.includes('REMOVED')) {
    return 'bg-error-100 text-error-800';
  }
  if (action.includes('SECURITY') || action.includes('SUSPICIOUS')) {
    return 'bg-error-200 text-error-900';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * Formata timestamp para exibição
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Formata data relativa (ex: "há 5 minutos")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  
  return formatTimestamp(timestamp);
}
