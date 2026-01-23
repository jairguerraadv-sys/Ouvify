# Arquitetura do Sistema Ouvy SaaS

Este documento descreve a arquitetura técnica completa do sistema Ouvy SaaS, uma plataforma de canal de ética e ouvidoria multi-tenant.

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura de Alto Nível](#arquitetura-de-alto-nível)
4. [Fluxo de Requisições](#fluxo-de-requisições)
5. [Multi-tenancy](#multi-tenancy)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Sistema de Notificações](#sistema-de-notificações)
8. [Diagrama de Banco de Dados](#diagrama-de-banco-de-dados)
9. [Deploy e Infraestrutura](#deploy-e-infraestrutura)

---

## Visão Geral

O Ouvy SaaS é uma plataforma white-label para gestão de canais de ética, ouvidoria e feedbacks anônimos. O sistema permite que múltiplas organizações (tenants) operem de forma isolada na mesma infraestrutura.

### Principais Funcionalidades

- 📝 **Feedbacks Anônimos**: Denúncias, sugestões e reclamações com anonimato garantido
- 🔐 **Multi-tenancy**: Isolamento completo de dados entre organizações
- 🎨 **White Label**: Personalização visual por tenant
- 📊 **Analytics**: Dashboards e relatórios em tempo real
- 🔔 **Notificações Push**: Alertas em tempo real via Web Push
- 📜 **Audit Log**: Rastreamento completo de ações

---

## Stack Tecnológica

### Backend
- **Django 6.0.1**: Framework web Python
- **Django REST Framework 3.15**: API RESTful
- **PostgreSQL 16**: Banco de dados principal
- **Redis 7**: Cache e message broker
- **Celery 5.4**: Processamento assíncrono
- **ElasticSearch 8**: Busca full-text

### Frontend
- **Next.js 16.1**: Framework React com SSR
- **React 19**: Biblioteca de UI
- **TypeScript 5.8**: Type safety
- **Tailwind CSS 4**: Estilização
- **Recharts 3**: Gráficos e analytics

### Infraestrutura
- **Docker**: Containerização
- **Railway/Vercel**: Hosting
- **Prometheus + Grafana**: Monitoramento
- **Sentry**: Error tracking

---

## Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[React UI]
        SSR[Server Components]
        API_CLIENT[API Client]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx]
        CORS[CORS Handler]
    end
    
    subgraph "Backend (Django)"
        DRF[Django REST Framework]
        AUTH[JWT Auth]
        TENANT_MW[Tenant Middleware]
        VIEWS[ViewSets]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        ELASTIC[(ElasticSearch)]
    end
    
    subgraph "Async Processing"
        CELERY[Celery Workers]
        BEAT[Celery Beat]
    end
    
    subgraph "External Services"
        EMAIL[Email Service]
        PUSH[Web Push]
        SENTRY[Sentry]
    end
    
    UI --> SSR
    SSR --> API_CLIENT
    API_CLIENT --> NGINX
    NGINX --> CORS
    CORS --> DRF
    DRF --> AUTH
    AUTH --> TENANT_MW
    TENANT_MW --> VIEWS
    VIEWS --> POSTGRES
    VIEWS --> REDIS
    VIEWS --> ELASTIC
    VIEWS --> CELERY
    CELERY --> POSTGRES
    CELERY --> EMAIL
    CELERY --> PUSH
    BEAT --> CELERY
    DRF --> SENTRY
```

---

## Fluxo de Requisições

```mermaid
sequenceDiagram
    participant Client as Browser/App
    participant CDN as Vercel CDN
    participant Next as Next.js (Frontend)
    participant API as Django API
    participant Auth as JWT Auth
    participant MW as Tenant Middleware
    participant DB as PostgreSQL
    participant Cache as Redis
    
    Client->>CDN: Request /dashboard
    CDN->>Next: Forward request
    Next->>Next: Server Component render
    Next->>API: GET /api/feedbacks
    API->>Auth: Validate JWT
    Auth-->>API: User object
    API->>MW: Check tenant context
    MW->>DB: Get tenant by user
    DB-->>MW: Tenant data
    MW-->>API: Tenant context set
    API->>Cache: Check cache
    alt Cache hit
        Cache-->>API: Cached data
    else Cache miss
        API->>DB: Query feedbacks (filtered by tenant)
        DB-->>API: Feedbacks data
        API->>Cache: Store in cache
    end
    API-->>Next: JSON response
    Next-->>CDN: HTML + hydration data
    CDN-->>Client: Full page
```

---

## Multi-tenancy

O sistema implementa **Row-Level Security** para isolamento de dados entre tenants.

```mermaid
erDiagram
    Client ||--o{ User : "owns"
    Client ||--o{ Feedback : "owns"
    Client ||--o{ AuditLog : "owns"
    Client {
        int id PK
        string nome
        string slug UK
        string cnpj UK
        json theme_config
        boolean is_active
    }
    
    User {
        int id PK
        int client_id FK
        string email UK
        string role
    }
    
    Feedback {
        int id PK
        int client_id FK
        string protocolo UK
        string tipo
        string status
        text conteudo
        datetime created_at
    }
```

### Middleware de Tenant

```python
# Pseudocódigo do fluxo
1. Request chega no Django
2. TenantMiddleware intercepta
3. Extrai tenant_id do JWT ou header
4. Injeta tenant no request.tenant
5. QuerySets automaticamente filtram por tenant
6. Response retorna apenas dados do tenant
```

---

## Autenticação e Autorização

```mermaid
flowchart TD
    A[User Request] --> B{Has JWT?}
    B -->|No| C[Login Form]
    C --> D[POST /api/token/]
    D --> E{Credentials Valid?}
    E -->|No| F[401 Unauthorized]
    E -->|Yes| G{2FA Enabled?}
    G -->|Yes| H[Enter TOTP Code]
    H --> I{TOTP Valid?}
    I -->|No| F
    I -->|Yes| J[Generate JWT]
    G -->|No| J
    J --> K[Return Access + Refresh Token]
    
    B -->|Yes| L[Validate JWT]
    L --> M{Token Valid?}
    M -->|No| N[Refresh Token]
    N --> O{Refresh Valid?}
    O -->|No| F
    O -->|Yes| P[New Access Token]
    M -->|Yes| Q[Continue to View]
    P --> Q
    
    Q --> R{User Has Permission?}
    R -->|No| S[403 Forbidden]
    R -->|Yes| T[Process Request]
```

### Roles e Permissões

| Role | Permissões |
|------|------------|
| **superuser** | Acesso total ao sistema |
| **admin** | Gerencia tenant, usuários, configurações |
| **gestor** | Gerencia feedbacks, visualiza analytics |
| **analista** | Visualiza e responde feedbacks |
| **usuario** | Apenas submete feedbacks |

---

## Sistema de Notificações

```mermaid
flowchart LR
    subgraph "Trigger Events"
        A1[Feedback Created]
        A2[Status Changed]
        A3[New Response]
    end
    
    subgraph "Signal Handler"
        B[Django Signal]
    end
    
    subgraph "Async Processing"
        C[Celery Task]
    end
    
    subgraph "Notification Channels"
        D1[Email]
        D2[Web Push]
        D3[In-App]
    end
    
    subgraph "Storage"
        E[(Notification Model)]
    end
    
    A1 --> B
    A2 --> B
    A3 --> B
    B --> C
    C --> D1
    C --> D2
    C --> E
    E --> D3
```

### Web Push Flow

```mermaid
sequenceDiagram
    participant Browser
    participant SW as Service Worker
    participant Frontend
    participant Backend
    participant Push as Push Service
    
    Browser->>Frontend: User clicks "Enable Notifications"
    Frontend->>Browser: requestPermission()
    Browser-->>Frontend: Permission granted
    Frontend->>SW: Register Service Worker
    SW-->>Frontend: SW Active
    Frontend->>Push: Subscribe (VAPID Public Key)
    Push-->>Frontend: PushSubscription
    Frontend->>Backend: POST /api/push/subscribe/
    Backend->>Backend: Store subscription
    
    Note over Backend: Later, when event occurs...
    
    Backend->>Push: Send push message
    Push->>SW: Deliver notification
    SW->>Browser: Show notification
    Browser->>Frontend: User clicks notification
    Frontend->>Frontend: Navigate to feedback
```

---

## Diagrama de Banco de Dados

```mermaid
erDiagram
    Client ||--o{ User : "has many"
    Client ||--o{ Feedback : "has many"
    Client ||--o{ AuditLog : "has many"
    Client ||--o{ PushSubscription : "has many"
    
    User ||--o{ Feedback : "creates"
    User ||--o{ AuditLog : "generates"
    User ||--o{ PushSubscription : "owns"
    User ||--o{ UserSession : "has"
    
    Feedback ||--o{ FeedbackResponse : "has many"
    Feedback ||--o{ Attachment : "has many"
    
    AuditLog }|--|| ContentType : "references"
    
    Client {
        int id PK
        string nome
        string slug UK
        string cnpj UK
        json theme_config
        string logo_url
        boolean is_active
        datetime created_at
    }
    
    User {
        int id PK
        int client_id FK
        string email UK
        string password
        string nome
        string role
        boolean is_active
        boolean mfa_enabled
        string mfa_secret
        datetime last_login
    }
    
    Feedback {
        int id PK
        int client_id FK
        int user_id FK "nullable"
        string protocolo UK
        string tipo
        string status
        text conteudo
        boolean is_anonymous
        string ip_address
        datetime created_at
        datetime updated_at
    }
    
    FeedbackResponse {
        int id PK
        int feedback_id FK
        int user_id FK
        text conteudo
        boolean is_internal
        datetime created_at
    }
    
    AuditLog {
        int id PK
        int tenant_id FK
        int user_id FK "nullable"
        string action
        string severity
        text description
        int content_type_id FK
        int object_id
        string ip_address
        json metadata
        datetime timestamp
    }
    
    PushSubscription {
        int id PK
        int user_id FK
        int client_id FK
        string endpoint UK
        string p256dh
        string auth
        boolean is_active
        datetime created_at
    }
    
    Notification {
        int id PK
        int user_id FK
        int client_id FK
        string tipo
        string title
        text body
        json data
        boolean read
        boolean sent
        datetime created_at
    }
```

---

## Deploy e Infraestrutura

```mermaid
flowchart TB
    subgraph "Development"
        DEV[Local Dev]
        GIT[Git Repository]
    end
    
    subgraph "CI/CD"
        GHA[GitHub Actions]
        TESTS[Run Tests]
        LINT[Lint & Type Check]
        BUILD[Build Images]
    end
    
    subgraph "Staging"
        STAGING_FE[Vercel Preview]
        STAGING_BE[Railway Staging]
        STAGING_DB[(PostgreSQL Staging)]
    end
    
    subgraph "Production"
        CDN[Vercel Edge]
        PROD_FE[Next.js Production]
        PROD_BE[Railway Production]
        PROD_DB[(PostgreSQL Production)]
        PROD_REDIS[(Redis)]
        PROD_CELERY[Celery Workers]
    end
    
    subgraph "Monitoring"
        PROM[Prometheus]
        GRAF[Grafana]
        SENTRY[Sentry]
        LOGS[Log Aggregation]
    end
    
    DEV -->|push| GIT
    GIT -->|trigger| GHA
    GHA --> TESTS
    GHA --> LINT
    TESTS -->|pass| BUILD
    LINT -->|pass| BUILD
    BUILD -->|staging| STAGING_FE
    BUILD -->|staging| STAGING_BE
    STAGING_BE --> STAGING_DB
    
    BUILD -->|production| CDN
    CDN --> PROD_FE
    BUILD -->|production| PROD_BE
    PROD_BE --> PROD_DB
    PROD_BE --> PROD_REDIS
    PROD_BE --> PROD_CELERY
    
    PROD_BE --> PROM
    PROD_FE --> PROM
    PROM --> GRAF
    PROD_BE --> SENTRY
    PROD_FE --> SENTRY
    PROD_BE --> LOGS
```

### Ambientes

| Ambiente | URL Frontend | URL Backend | Banco |
|----------|-------------|-------------|-------|
| **Local** | localhost:3000 | localhost:8000 | SQLite/PostgreSQL |
| **Staging** | staging.ouvy.com.br | api-staging.ouvy.com.br | PostgreSQL (Railway) |
| **Production** | ouvy.com.br | api.ouvy.com.br | PostgreSQL (Railway) |

---

## Performance e Escalabilidade

### Estratégias de Cache

1. **Redis Cache**: Consultas frequentes (30s TTL)
2. **CDN Cache**: Assets estáticos (1 ano)
3. **API Response Cache**: GET endpoints (5min)

### Horizontal Scaling

```mermaid
flowchart LR
    LB[Load Balancer]
    
    subgraph "Backend Instances"
        BE1[Django 1]
        BE2[Django 2]
        BE3[Django N]
    end
    
    subgraph "Workers"
        W1[Celery 1]
        W2[Celery 2]
    end
    
    DB[(PostgreSQL Primary)]
    DB_R[(PostgreSQL Replica)]
    REDIS[(Redis Cluster)]
    
    LB --> BE1
    LB --> BE2
    LB --> BE3
    
    BE1 --> DB
    BE2 --> DB
    BE3 --> DB_R
    
    BE1 --> REDIS
    BE2 --> REDIS
    BE3 --> REDIS
    
    W1 --> DB
    W2 --> DB
    W1 --> REDIS
    W2 --> REDIS
```

---

## Segurança

### Medidas Implementadas

- ✅ JWT com rotação automática
- ✅ 2FA com TOTP
- ✅ CORS configurado
- ✅ CSP Headers
- ✅ Rate Limiting
- ✅ Input Sanitization (DOMPurify)
- ✅ Audit Log completo
- ✅ Encriptação em trânsito (TLS)
- ✅ Row-Level Security

### Fluxo de Segurança

```mermaid
flowchart TD
    A[Request] --> B[Rate Limiter]
    B -->|Blocked| C[429 Too Many Requests]
    B -->|Allowed| D[CORS Check]
    D -->|Invalid Origin| E[403 Forbidden]
    D -->|Valid| F[JWT Validation]
    F -->|Invalid| G[401 Unauthorized]
    F -->|Valid| H[Tenant Isolation]
    H --> I[Permission Check]
    I -->|Denied| J[403 Forbidden]
    I -->|Allowed| K[Input Sanitization]
    K --> L[Business Logic]
    L --> M[Audit Log]
    M --> N[Response]
```

---

## Próximos Passos

1. **Escalabilidade**: Kubernetes para auto-scaling
2. **Performance**: GraphQL para queries otimizadas
3. **Segurança**: SOC 2 compliance
4. **Features**: IA para categorização automática

---

*Última atualização: Janeiro 2026*
*Versão: 2.0*
