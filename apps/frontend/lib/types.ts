// Tipos de Feedback
export type FeedbackType = 'denuncia' | 'sugestao' | 'elogio' | 'reclamacao';

export type FeedbackStatus = 'pendente' | 'em_analise' | 'resolvido' | 'fechado';

export interface Feedback {
  id: number;
  protocolo: string;
  tipo: FeedbackType;
  titulo: string;
  descricao: string;
  status: FeedbackStatus;
  categoria: string;
  anonimo: boolean;
  email_contato: string | null;
  data_criacao: string;
  data_atualizacao: string;
  resposta_empresa?: string | null;
  data_resposta?: string | null;
  anexos?: FeedbackAnexo[];
  arquivos?: FeedbackAnexo[];  // Alias para anexos
  historico?: FeedbackHistorico[];
}

export interface FeedbackAnexo {
  id: number;
  arquivo: string;
  url: string;
  nome_original: string;
  tipo_mime: string;
  tamanho_bytes: number;
  tamanho_mb: number;
  interno: boolean;
  data_envio: string;
  enviado_por_nome: string;
}

export interface FeedbackHistorico {
  id: number;
  acao: string;
  descricao: string;
  usuario?: string;
  data: string;
}

export interface DashboardStats {
  total: number;
  pendentes: number;
  resolvidos: number;
  hoje: number;
  taxa_resolucao: string;
  por_tipo: Record<FeedbackType, number>;
  por_status: Record<FeedbackStatus, number>;
  tempo_medio_resposta?: string;
  variacao_tempo?: string;
}

export interface FeedbackFilters {
  status?: FeedbackStatus;
  tipo?: FeedbackType;
  categoria?: string;
  search?: string;
  data_inicio?: string;
  data_fim?: string;
}

// Tipos de Usuário
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  tenant_id?: number;
}

export interface Tenant {
  id: number;
  nome_empresa: string;
  subdominio: string;
  logo?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  email_contato: string;
  telefone?: string;
  ativo: boolean;
  data_criacao: string;
}

// Tipos de Autenticação
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  nome_empresa: string;
  subdominio_desejado: string;
}

export interface AuthToken {
  token: string;
  user: User;
  tenant?: Tenant;
}

// Tipos de Resposta da API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  errors?: Record<string, string[]>;
  error?: string;
  message?: string;
}

// Constantes
export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  denuncia: 'Denúncia',
  sugestao: 'Sugestão',
  elogio: 'Elogio',
  reclamacao: 'Reclamação',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export const FEEDBACK_TYPE_COLORS: Record<FeedbackType, string> = {
  denuncia: 'error',
  sugestao: 'info',
  elogio: 'success',
  reclamacao: 'warning',
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  pendente: 'warning',
  em_analise: 'info',
  resolvido: 'success',
  fechado: 'default',
};
