# 📡 Documentação da API - Ouvify

## Visão Geral

A API do Ouvify é RESTful, baseada em Django REST Framework, com autenticação JWT.

**Base URLs:**
- Produção: `https://ouvify-production.up.railway.app`
- Staging: `https://ouvify-staging.up.railway.app`
- Local: `http://localhost:8000`

**Swagger/OpenAPI:** `/docs/swagger/` ou `/docs/redoc/`

---

## Autenticação

### Headers Obrigatórios

```http
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

### Obter Token

```http
POST /api/token/
Content-Type: application/json

{
  "username": "usuario@email.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "username": "usuario",
    "is_staff": false,
    "is_superuser": false
  },
  "tenant": {
    "id": 1,
    "nome": "Empresa ABC",
    "subdominio": "empresa-abc",
    "plano": "starter",
    "ativo": true,
    "logo": "https://res.cloudinary.com/.../logo.png",
    "cor_primaria": "#3B82F6"
  }
}
```

### Refresh Token

```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout

```http
POST /api/logout/
Authorization: Bearer <access_token>

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## Endpoints

### 1. Tenants (Multi-tenancy)

#### Registrar Novo Tenant

```http
POST /api/register-tenant/
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "SenhaSegura123!",
  "nome_empresa": "Empresa ABC",
  "subdominio_desejado": "empresa-abc"
}
```

**Response 201:**
```json
{
  "id": 1,
  "message": "Tenant criado com sucesso",
  "tenant": {
    "id": 1,
    "nome": "Empresa ABC",
    "subdominio": "empresa-abc",
    "plano": "free"
  },
  "user": {
    "id": 1,
    "email": "joao@empresa.com"
  }
}
```

#### Verificar Disponibilidade de Subdomínio

```http
GET /api/check-subdominio/?subdominio=empresa-abc
```

**Response 200:**
```json
{
  "disponivel": true,
  "subdominio": "empresa-abc"
}
```

#### Obter Informações do Tenant

```http
GET /api/tenant-info/
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "nome": "Empresa ABC",
  "subdominio": "empresa-abc",
  "logo": "https://...",
  "cor_primaria": "#3B82F6",
  "cor_secundaria": "#10B981",
  "cor_texto": "#1F2937",
  "fonte_customizada": "Inter",
  "favicon": null,
  "plano": "starter",
  "ativo": true,
  "subscription_status": "active",
  "data_fim_assinatura": null
}
```

#### Atualizar Tenant (Branding)

```http
PATCH /api/tenant-info/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Empresa ABC Ltda",
  "cor_primaria": "#EF4444",
  "cor_secundaria": "#F97316"
}
```

#### Upload de Logo/Favicon

```http
POST /api/upload-branding/
Authorization: Bearer <token>
Content-Type: multipart/form-data

logo: <file>
favicon: <file>
```

---

### 2. Feedbacks

#### Listar Feedbacks (Autenticado)

```http
GET /api/feedbacks/
Authorization: Bearer <token>
X-Tenant-ID: 1
```

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | Filtrar por status (pendente, em_analise, resolvido, fechado) |
| `tipo` | string | Filtrar por tipo (denuncia, reclamacao, sugestao, elogio) |
| `prioridade` | string | Filtrar por prioridade (baixa, media, alta, critica) |
| `search` | string | Busca em título e descrição |
| `ordering` | string | Ordenação (-data_criacao, prioridade, etc.) |
| `page` | int | Número da página |
| `page_size` | int | Itens por página (max 100) |

**Response 200:**
```json
{
  "count": 42,
  "next": "http://api/feedbacks/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "protocolo": "OUVY-A7B3-X9K2",
      "tipo": "denuncia",
      "titulo": "Título do feedback",
      "descricao": "Descrição completa...",
      "status": "pendente",
      "prioridade": "alta",
      "anonimo": true,
      "email_contato": null,
      "resposta_empresa": null,
      "data_criacao": "2026-01-30T10:30:00Z",
      "data_atualizacao": "2026-01-30T10:30:00Z",
      "assigned_to": null,
      "tags": [{"id": 1, "nome": "Urgente", "cor": "#EF4444"}]
    }
  ]
}
```

#### Criar Feedback (Público)

```http
POST /api/feedbacks/
X-Tenant-ID: 1
Content-Type: application/json

{
  "tipo": "denuncia",
  "titulo": "Título do feedback",
  "descricao": "Descrição detalhada do problema...",
  "anonimo": true,
  "email_contato": "usuario@email.com"
}
```

**Response 201:**
```json
{
  "id": 1,
  "protocolo": "OUVY-A7B3-X9K2",
  "tipo": "denuncia",
  "titulo": "Título do feedback",
  "status": "pendente",
  "message": "Feedback criado com sucesso. Guarde seu protocolo para acompanhamento."
}
```

#### Consultar Feedback por Protocolo (Público)

```http
GET /api/feedbacks/consultar-protocolo/?protocolo=OUVY-A7B3-X9K2
```

**Response 200:**
```json
{
  "protocolo": "OUVY-A7B3-X9K2",
  "tipo": "denuncia",
  "titulo": "Título do feedback",
  "descricao": "Descrição...",
  "status": "em_analise",
  "data_criacao": "2026-01-30T10:30:00Z",
  "resposta_empresa": "Estamos analisando...",
  "data_resposta": "2026-01-30T14:00:00Z",
  "interacoes": [
    {
      "tipo": "resposta_empresa",
      "conteudo": "Estamos analisando sua solicitação.",
      "data_criacao": "2026-01-30T14:00:00Z"
    }
  ]
}
```

#### Responder Feedback via Protocolo (Público)

```http
POST /api/feedbacks/responder-protocolo/
X-Tenant-ID: 1
Content-Type: application/json

{
  "protocolo": "OUVY-A7B3-X9K2",
  "mensagem": "Gostaria de adicionar mais informações...",
  "email": "usuario@email.com"
}
```

#### Obter Detalhes do Feedback (Autenticado)

```http
GET /api/feedbacks/{id}/
Authorization: Bearer <token>
```

#### Atualizar Feedback

```http
PATCH /api/feedbacks/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "em_analise",
  "prioridade": "alta",
  "assigned_to": 5
}
```

#### Adicionar Interação (Comentário)

```http
POST /api/feedbacks/{id}/adicionar-interacao/
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "nota_interna",
  "conteudo": "Comentário interno para a equipe"
}
```

**Tipos de Interação:**
- `resposta_empresa` - Resposta visível ao usuário
- `nota_interna` - Nota visível apenas para equipe
- `resposta_usuario` - Resposta do usuário

#### Dashboard Stats

```http
GET /api/feedbacks/dashboard-stats/
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "total": 150,
  "por_status": {
    "pendente": 30,
    "em_analise": 45,
    "resolvido": 60,
    "fechado": 15
  },
  "por_tipo": {
    "denuncia": 40,
    "reclamacao": 50,
    "sugestao": 35,
    "elogio": 25
  },
  "por_prioridade": {
    "baixa": 20,
    "media": 80,
    "alta": 40,
    "critica": 10
  },
  "ultimos_7_dias": [
    {"data": "2026-01-24", "count": 5},
    {"data": "2026-01-25", "count": 8}
  ],
  "tempo_medio_resposta_horas": 4.5,
  "top_tags": [
    {"nome": "Urgente", "count": 25},
    {"nome": "Bug", "count": 18}
  ]
}
```

---

### 3. Tags

#### Listar Tags

```http
GET /api/tags/
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "nome": "Urgente",
      "cor": "#EF4444",
      "descricao": "Feedbacks que precisam de atenção imediata"
    }
  ]
}
```

#### Criar Tag

```http
POST /api/tags/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Bug",
  "cor": "#F97316",
  "descricao": "Reportes de erros no sistema"
}
```

---

### 4. Templates de Resposta

#### Listar Templates

```http
GET /api/response-templates/
Authorization: Bearer <token>
```

#### Criar Template

```http
POST /api/response-templates/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Resposta Padrão - Recebido",
  "categoria": "recebimento",
  "conteudo": "Olá, {{nome}}! Recebemos seu feedback e estamos analisando.",
  "tipos_aplicaveis": ["denuncia", "reclamacao"]
}
```

#### Renderizar Template

```http
POST /api/response-templates/render/
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": 1,
  "feedback_id": 42
}
```

---

### 5. Equipe (Team)

#### Listar Membros

```http
GET /api/team/members/
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "email": "admin@empresa.com",
        "name": "Admin"
      },
      "role": "OWNER",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### Convidar Membro

```http
POST /api/team/invitations/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "novo@empresa.com",
  "role": "MODERATOR"
}
```

#### Aceitar Convite

```http
POST /api/team/invitations/accept/
Content-Type: application/json

{
  "token": "abc123...",
  "nome": "Novo Usuário",
  "senha": "SenhaSegura123!"
}
```

#### Atualizar Role

```http
PATCH /api/team/members/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Remover Membro

```http
DELETE /api/team/members/{id}/
Authorization: Bearer <token>
```

---

### 6. Billing (Stripe)

#### Listar Planos

```http
GET /api/v1/billing/plans/
```

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Free",
      "slug": "free",
      "price_cents": 0,
      "price_display": "R$ 0,00",
      "features": {...},
      "limits": {...}
    },
    {
      "id": 2,
      "name": "Starter",
      "slug": "starter",
      "price_cents": 9900,
      "price_display": "R$ 99,00"
    }
  ]
}
```

#### Criar Checkout Session

```http
POST /api/tenants/subscribe/
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": "starter"
}
```

**Response 200:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/...",
  "session_id": "cs_test_..."
}
```

#### Obter Assinatura Atual

```http
GET /api/tenants/subscription/
Authorization: Bearer <token>
```

#### Cancelar Assinatura

```http
POST /api/tenants/subscription/
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "cancel"
}
```

#### Reativar Assinatura

```http
POST /api/tenants/subscription/reactivate/
Authorization: Bearer <token>
```

---

### 7. Webhooks

#### Listar Endpoints

```http
GET /api/v1/webhooks/endpoints/
Authorization: Bearer <token>
```

#### Criar Endpoint

```http
POST /api/v1/webhooks/endpoints/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Meu Webhook",
  "url": "https://minha-api.com/webhook",
  "events": ["feedback.created", "feedback.status_changed"],
  "is_active": true
}
```

**Eventos Disponíveis:**
- `feedback.created`
- `feedback.updated`
- `feedback.status_changed`
- `feedback.assigned`
- `feedback.resolved`
- `response.created`
- `sla.warning`
- `sla.breach`
- `*` (todos os eventos)

---

### 8. Analytics

```http
GET /api/analytics/
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `period` | string | Período: 7d, 30d, 90d, 1y |
| `start_date` | date | Data início (YYYY-MM-DD) |
| `end_date` | date | Data fim (YYYY-MM-DD) |

---

### 9. LGPD

#### Exportar Dados

```http
GET /api/export-data/?format=json
Authorization: Bearer <token>
```

**Response:** Download de arquivo JSON/CSV

#### Excluir Conta

```http
DELETE /api/account/
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirm": true,
  "reason": "Motivo opcional"
}
```

---

### 10. 2FA (Two-Factor)

#### Habilitar 2FA

```http
POST /api/auth/2fa/enable/
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,...",
  "backup_codes": ["XXXX-XXXX", "YYYY-YYYY", ...]
}
```

#### Confirmar 2FA

```http
POST /api/auth/2fa/confirm/
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

#### Verificar 2FA (no login)

```http
POST /api/auth/2fa/verify/
Content-Type: application/json

{
  "user_id": 1,
  "code": "123456"
}
```

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Rate Limits

| Endpoint | Limite |
|----------|--------|
| Login | 5/minuto por IP |
| Criar Feedback | 10/minuto por IP |
| API geral | 100/minuto por tenant |
| Consulta Protocolo | 20/minuto por IP |

---

## Paginação

Todos os endpoints de listagem usam paginação:

```json
{
  "count": 100,
  "next": "https://api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

*Última atualização: 31/01/2026*
