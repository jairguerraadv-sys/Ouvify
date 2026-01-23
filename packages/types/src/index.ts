// Tipos compartilhados entre backend e frontend

export interface User {
  id: number;
  email: string;
  nome?: string;
  tenant_id: number;
}

export interface Tenant {
  id: number;
  nome: string;
  subdomain: string;
}

export interface Feedback {
  id: number;
  tipo: 'DENUNCIA' | 'RECLAMACAO' | 'SUGESTAO' | 'ELOGIO';
  status: 'NOVO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO';
  titulo: string;
  protocolo: string;
}
