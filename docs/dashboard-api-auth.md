# Dashboard API Authentication Guide

## Visão Geral

Este documento explica como funciona a autenticação da API no dashboard do OUVY, incluindo tratamento de erros 401/403/404 e melhores práticas de debugging.

## Chave do Token

- **Chave no localStorage**: `auth_token`
- **Formato**: Token de autenticação do Django REST Framework
- **Como obter**: Via endpoint `/api-token-auth/` com username/password

## Comportamento de Autenticação

### 401 Unauthorized
- **Causa**: Token ausente, inválido ou expirado
- **Ação**: Redirecionamento automático para `/login`
- **Limpeza**: Remove `auth_token` e `tenant_id` do localStorage

### 403 Forbidden
- **Causa**: Token válido, mas usuário sem permissão para o recurso
- **Ação**: **NÃO redireciona** para login
- **Tratamento**: Mostrar erro na UI com mensagem "Sem permissão para acessar este recurso"

### 404 Not Found
- **Causa**: Rota não existe ou tenant incorreto
- **Mensagem**: "Recurso não encontrado (verifique se a rota existe e se você está no tenant correto)"

## Estrutura da API

### Cliente HTTP (`lib/api.ts`)

```typescript
// Interceptor de request - sempre adiciona token se existir
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('tenant_id');

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
});

// Interceptor de response - trata erros globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa tokens e redireciona
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tenant_id');
      window.location.href = '/login';
    }
    // 403 não redireciona

    return Promise.reject(error);
  }
);
```

### Hooks de Dashboard

```typescript
// Sempre usa api.get() - nunca axios/fetch direto
export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    '/api/feedbacks/dashboard-stats/',
    (url) => api.get(url), // Usa api.get
    { refreshInterval: 30000 }
  );

  return { stats: data, error: error?.message, isLoading };
}
```

## Debugging

### Cenários Comuns

#### 1. Erro 401 inesperado
- Verificar se `auth_token` existe no localStorage
- Verificar se o token não expirou
- Verificar se o backend está rodando

#### 2. Erro 403
- Token válido, mas usuário sem permissão
- Verificar roles/permissions do usuário
- Verificar se está no tenant correto

#### 3. Erro 404
- Verificar se a rota existe no backend
- Verificar se o tenant_id está correto
- Verificar se há diferenças entre dev/prod

### Logs de Debug

```typescript
// Em desenvolvimento - logs detalhados
logger.error('API Error:', {
  url: error.config?.url,
  method: error.config?.method,
  status: error.response?.status,
  requestId: error.config?.headers?.['X-Request-ID'],
  data: error.response?.data,
});

// Em produção - logs essenciais apenas
logger.error('API Error:', {
  url: error.config?.url,
  method: error.config?.method,
  status: error.response?.status,
  requestId: error.config?.headers?.['X-Request-ID'],
});
```

### Testes Manuais

```bash
# 1. Login para obter token
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  http://localhost:8000/api-token-auth/

# 2. Testar endpoint com token
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/feedbacks/dashboard-stats/

# 3. Testar sem token (deve dar 401)
curl http://localhost:8000/api/feedbacks/dashboard-stats/
```

## Boas Práticas

1. **Sempre use `api.get/post/put/delete`** - nunca axios/fetch direto
2. **Trate erros 403 na UI** - não confunda com 401
3. **Use ProtectedRoute** em páginas que precisam de auth
4. **Verifique tenant_id** quando houver 404s
5. **Logs em dev vs prod** - detalhado apenas em desenvolvimento

## Troubleshooting

### Problema: "Network Error" no login
- Verificar NEXT_PUBLIC_API_URL no .env.local
- Deve ser `http://127.0.0.1:8000` para desenvolvimento

### Problema: 404 em produção mas 200 em dev
- Verificar se as rotas existem no backend de produção
- Verificar tenant configuration

### Problema: Token não persiste
- Verificar se está usando `auth_token` (não `token`)
- Verificar se localStorage está sendo limpo indevidamente
export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    '/api/feedbacks/dashboard-stats/',
    (url) => api.get(url), // Usa api.get
    { refreshInterval: 30000 }
  );
  return { stats: data, error: error?.message };
}
```

## Debugging

### Cenário 1: 401 inesperado
1. Verificar se `localStorage.getItem('auth_token')` retorna um token válido
2. Verificar se o servidor está rodando
3. Verificar se o token não expirou

### Cenário 2: 403 em endpoint que funcionava
1. Verificar se as permissões do usuário mudaram
2. Verificar se o tenant está correto (`localStorage.getItem('tenant_id')`)
3. Verificar se o endpoint requer permissões especiais

### Cenário 3: 404 em endpoint existente
1. Verificar se o tenant está correto
2. Verificar se a URL está completa (`/api/feedbacks/`, não `/feedbacks/`)
3. Verificar se o servidor tem as rotas registradas

### Logs de Debug

Em desenvolvimento, os logs incluem dados detalhados:
```javascript
logger.error('API Error:', {
  url: '/api/feedbacks/',
  method: 'GET',
  status: 401,
  requestId: 'req-123',
  data: { detail: 'Authentication credentials were not provided.' }
});
```

Em produção, apenas informações essenciais:
```javascript
logger.error('API Error:', {
  url: '/api/feedbacks/',
  method: 'GET',
  status: 401,
  requestId: 'req-123'
});
```

## Testes Recomendados

### Cenário: Sem Token
1. Limpar localStorage: `localStorage.clear()`
2. Acessar `/dashboard`
3. Deve redirecionar para `/login`

### Cenário: Token Válido
1. Fazer login normalmente
2. Acessar `/dashboard`
3. Deve carregar feedbacks e estatísticas

### Cenário: Token Inválido
1. Definir token inválido: `localStorage.setItem('auth_token', 'invalid')`
2. Acessar `/dashboard`
3. Deve redirecionar para `/login`

### Cenário: Sem Permissão (403)
1. Usar conta sem permissões adequadas
2. Tentar acessar endpoint restrito
3. Deve mostrar erro sem redirecionar

## Headers Automáticos

O interceptor adiciona automaticamente:
- `Authorization: Token {token}` (se existir)
- `X-Tenant-ID: {tenantId}` (se existir)

## Tratamento de Erros nos Componentes

```typescript
// ✅ Correto - usa getErrorMessage
const { stats, error, isLoading } = useDashboardStats();

if (error) {
  return <ErrorMessage message={error} />;
}

// ❌ Evitar - não usar try/catch manual
try {
  const data = await api.get('/api/feedbacks/');
} catch (err) {
  console.error(err); // O interceptor já loga
}
```