# Problemas Identificados no Produto

## Status Atual
- ✅ **Backend**: Totalmente funcional, criando tenants e usuários reais
- ❌ **Frontend Dashboard**: Mostrando dados fictícios/hardcoded
- ❌ **Fluxo de Cadastro**: Funciona mas não reflete dados reais no dashboard

## Problemas Críticos

### 1. Dashboard com Dados Fictícios

**Arquivo**: `ouvy_frontend/app/dashboard/page.tsx`

**Problema**:
```tsx
// Dados hardcoded no código
const user = {
  name: 'João Silva',  // ❌ Sempre o mesmo
  email: 'joao@empresa.com', // ❌ Sempre o mesmo
  avatar: undefined
};

const activities = [
  {
    type: 'denuncia',
    title: 'Nova denúncia anônima recebida', // ❌ Fictício
    time: 'há 2 horas',
    color: 'bg-red-100 text-red-600'
  },
  // ... mais atividades fictícias
];

const recentFeedbacks = [
  {
    protocolo: 'OUVY-XGZ6-ZMMV', // ❌ Fictício
    tipo: 'Denúncia',
    titulo: 'Comportamento inadequado no escritório',
    status: 'em_analise',
    data: 'há 2 horas'
  },
  // ... mais feedbacks fictícios
];
```

**Solução Necessária**:
- Buscar usuário real do AuthContext
- Buscar atividades reais da API: `/api/feedbacks/recent-activities/`
- Buscar feedbacks reais da API: `/api/feedbacks/?page_size=5`

### 2. Stats do Dashboard Parcialmente Funcionais

**Arquivo**: `ouvy_frontend/app/dashboard/page.tsx`

**Problema**:
```tsx
const kpis = [
  {
    title: 'Total de Feedbacks',
    value: stats?.total?.toString() || '0', // ✅ Busca da API
    change: stats?.hoje ? `+${stats.hoje} hoje` : '+12 esta semana', // ⚠️ Fallback fictício
  },
  {
    title: 'Tempo Médio',
    value: '2.4h', // ❌ Hardcoded
    change: '-18% vs mês passado', // ❌ Hardcoded
  }
];
```

**Solução Necessária**:
- Endpoint de stats deve retornar TODOS os dados reais
- Remover todos os fallbacks fictícios

### 3. Página de Perfil com Mock Data

**Arquivo**: `ouvy_frontend/app/dashboard/perfil/page.tsx`

**Problema**:
```tsx
// Mock data - substituir por dados reais da API
const user = {
  name: 'João Silva',
  email: 'joao@empresa.com',
  // ...
};
```

**Solução Necessária**:
- Usar AuthContext para dados do usuário
- Criar endpoint `/api/users/me/` se necessário

### 4. Página de Assinatura com Mock Data

**Arquivo**: `ouvy_frontend/app/dashboard/assinatura/page.tsx`

**Problema**:
```tsx
// Mock user data (será substituído pelo AuthContext)
const user = {
  name: 'João Silva',
  company: 'Empresa Exemplo LTDA',
  // ...
};
```

**Solução Necessária**:
- Integrar com Stripe real
- Buscar assinatura da API: `/api/tenants/subscription/`

### 5. AuthContext Não Compartilha Dados do Usuário

**Arquivo**: `ouvy_frontend/contexts/AuthContext.tsx`

**Problema**:
- Context apenas verifica se está autenticado
- Não expõe dados do usuário logado
- Componentes não conseguem acessar nome, email, empresa

**Solução Necessária**:
```tsx
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // ⬅️ ADICIONAR
  tenant: Tenant | null; // ⬅️ ADICIONAR
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refresh: () => Promise<void>; // ⬅️ ADICIONAR
}
```

## Backend - Endpoints Necessários

### Endpoints Existentes ✅
- `/api/register-tenant/` - Criar conta
- `/api/feedbacks/dashboard-stats/` - Estatísticas
- `/api/feedbacks/` - Listar feedbacks
- `/api/tenant-info/` - Info do tenant

### Endpoints Faltando ❌
- `/api/users/me/` - Dados do usuário logado
- `/api/feedbacks/recent-activities/` - Atividades recentes
- `/api/tenants/subscription/` - Status da assinatura Stripe

## Plano de Correção

### Fase 1: Corrigir AuthContext (Prioritário)
1. Adicionar `user` e `tenant` ao context
2. Buscar dados em `/api/tenant-info/` no login
3. Criar hook `useAuth()` para acesso fácil

### Fase 2: Corrigir Dashboard Principal
1. Remover todos os dados hardcoded
2. Buscar atividades reais da API
3. Buscar feedbacks recentes da API
4. Usar dados reais do AuthContext

### Fase 3: Criar Endpoints Faltantes (Backend)
1. `/api/users/me/` - UserMeView
2. `/api/feedbacks/recent-activities/` - ActivityListView
3. `/api/tenants/subscription/` - SubscriptionView

### Fase 4: Corrigir Páginas Secundárias
1. `/dashboard/perfil` - Usar dados reais
2. `/dashboard/assinatura` - Integrar Stripe real
3. `/dashboard/feedbacks` - Já está funcional ✅

## Impacto

**Sem correção**:
- ❌ Produto parece demo/fake
- ❌ Múltiplos usuários veem mesmos dados
- ❌ Impossível testar fluxo real
- ❌ Não é um produto utilizável

**Com correção**:
- ✅ Cada usuário vê seus próprios dados
- ✅ Dashboard reflete realidade
- ✅ Produto 100% funcional
- ✅ Pronto para produção
