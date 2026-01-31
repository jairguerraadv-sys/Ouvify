# 🗄️ Documentação do Banco de Dados - Ouvify

## Visão Geral

O Ouvify utiliza **PostgreSQL 16** como banco de dados principal, hospedado no Railway.

**Características:**
- Multi-tenancy por banco compartilhado (shared database)
- Isolamento lógico via `client_id`
- Soft deletes em modelos críticos
- Índices otimizados para queries frequentes

---

## 1. Diagrama ER (Entidade-Relacionamento)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TENANTS MODULE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐       1:N       ┌────────────────┐                     │
│  │     User       │◄────────────────│  TeamMember    │                     │
│  │  (auth_user)   │                 │                │                     │
│  └───────┬────────┘                 └───────┬────────┘                     │
│          │                                  │                               │
│          │ 1:1 owner                        │ N:1                          │
│          ▼                                  ▼                               │
│  ┌────────────────┐                 ┌────────────────┐                     │
│  │    Client      │◄────────────────│ TeamInvitation │                     │
│  │   (Tenant)     │                 │                │                     │
│  └───────┬────────┘                 └────────────────┘                     │
│          │                                                                  │
│          │ 1:N (client_id em todos os TenantAwareModels)                   │
│          ▼                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                              FEEDBACKS MODULE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐       N:1       ┌────────────────┐                     │
│  │   Feedback     │─────────────────│    Client      │                     │
│  │                │                 │                │                     │
│  └───────┬────────┘                 └────────────────┘                     │
│          │                                                                  │
│          │ 1:N                      ┌────────────────┐                     │
│          ├─────────────────────────►│FeedbackInteracao                     │
│          │                          │ (comentários)  │                     │
│          │                          └────────────────┘                     │
│          │                                                                  │
│          │ N:M                      ┌────────────────┐                     │
│          ├─────────────────────────►│      Tag       │                     │
│          │                          │                │                     │
│          │                          └────────────────┘                     │
│          │                                                                  │
│          │ N:1                      ┌────────────────┐                     │
│          └─────────────────────────►│ResponseTemplate│                     │
│                                     │                │                     │
│                                     └────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BILLING MODULE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐       N:1       ┌────────────────┐                     │
│  │ Subscription   │─────────────────│     Plan       │                     │
│  │                │                 │                │                     │
│  └───────┬────────┘                 └────────────────┘                     │
│          │                                                                  │
│          │ 1:N                      ┌────────────────┐                     │
│          └─────────────────────────►│    Invoice     │                     │
│                                     │                │                     │
│                                     └────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              OTHER MODULES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐            │
│  │WebhookEndpoint │    │ Notification   │    │   AuditLog     │            │
│  └────────────────┘    └────────────────┘    └────────────────┘            │
│                                                                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐            │
│  │WebhookDelivery │    │PushSubscription│    │  UserConsent   │            │
│  └────────────────┘    └────────────────┘    └────────────────┘            │
│                                                                             │
│  ┌────────────────┐                                                        │
│  │ ConsentVersion │                                                        │
│  └────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tabelas Principais

### 2.1 tenants_client (Tenant/Cliente)

```sql
CREATE TABLE tenants_client (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES auth_user(id),
    nome VARCHAR(100) NOT NULL,
    subdominio VARCHAR(63) UNIQUE NOT NULL,
    logo VARCHAR(500),
    favicon VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
    cor_secundaria VARCHAR(7) DEFAULT '#10B981',
    cor_texto VARCHAR(7) DEFAULT '#1F2937',
    fonte_customizada VARCHAR(100) DEFAULT 'Inter',
    ativo BOOLEAN DEFAULT TRUE,
    plano VARCHAR(20) DEFAULT 'free',
    stripe_customer_id VARCHAR(50) UNIQUE,
    stripe_subscription_id VARCHAR(50),
    subscription_status VARCHAR(20) DEFAULT 'active',
    data_fim_assinatura TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_client_subdominio ON tenants_client(subdominio);
CREATE INDEX idx_client_plano ON tenants_client(plano);
CREATE INDEX idx_client_ativo ON tenants_client(ativo);
```

### 2.2 tenants_teammember (Membro de Equipe)

```sql
CREATE TABLE tenants_teammember (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id),
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP DEFAULT NOW(),
    email_notifications BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, client_id)
);

-- Roles: OWNER, ADMIN, MODERATOR, VIEWER
-- Status: ACTIVE, SUSPENDED, REMOVED

CREATE INDEX idx_teammember_client ON tenants_teammember(client_id);
CREATE INDEX idx_teammember_status ON tenants_teammember(status);
```

### 2.3 tenants_teaminvitation (Convites)

```sql
CREATE TABLE tenants_teaminvitation (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    email VARCHAR(254) NOT NULL,
    role VARCHAR(20) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    invited_by_id INTEGER REFERENCES auth_user(id),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP
);

-- Status: PENDING, ACCEPTED, EXPIRED, REVOKED
CREATE INDEX idx_invitation_token ON tenants_teaminvitation(token);
CREATE INDEX idx_invitation_email ON tenants_teaminvitation(email);
```

### 2.4 feedbacks_feedback

```sql
CREATE TABLE feedbacks_feedback (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    protocolo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    prioridade VARCHAR(10) DEFAULT 'media',
    anonimo BOOLEAN DEFAULT FALSE,
    email_contato VARCHAR(254),
    resposta_empresa TEXT,
    data_resposta TIMESTAMP,
    autor_id INTEGER REFERENCES auth_user(id),
    assigned_to_id INTEGER REFERENCES tenants_teammember(id),
    assigned_by_id INTEGER REFERENCES auth_user(id),
    assigned_at TIMESTAMP,
    
    -- SLA Tracking
    tempo_primeira_resposta INTERVAL,
    tempo_resolucao INTERVAL,
    data_primeira_resposta TIMESTAMP,
    data_resolucao TIMESTAMP,
    sla_primeira_resposta BOOLEAN,
    sla_resolucao BOOLEAN,
    
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tipos: denuncia, reclamacao, sugestao, elogio
-- Status: pendente, em_analise, resolvido, fechado
-- Prioridade: baixa, media, alta, critica

CREATE INDEX idx_feedback_client ON feedbacks_feedback(client_id);
CREATE INDEX idx_feedback_protocolo ON feedbacks_feedback(protocolo);
CREATE INDEX idx_feedback_status ON feedbacks_feedback(status);
CREATE INDEX idx_feedback_tipo ON feedbacks_feedback(tipo);
CREATE INDEX idx_feedback_prioridade ON feedbacks_feedback(prioridade);
CREATE INDEX idx_feedback_data_criacao ON feedbacks_feedback(data_criacao DESC);

-- Índice composto para queries frequentes
CREATE INDEX idx_feedback_client_status_data 
    ON feedbacks_feedback(client_id, status, data_criacao DESC);
```

### 2.5 feedbacks_feedbackinteracao

```sql
CREATE TABLE feedbacks_feedbackinteracao (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    feedback_id INTEGER NOT NULL REFERENCES feedbacks_feedback(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id INTEGER REFERENCES auth_user(id),
    data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tipos: resposta_empresa, nota_interna, resposta_usuario, mudanca_status

CREATE INDEX idx_interacao_feedback ON feedbacks_feedbackinteracao(feedback_id);
CREATE INDEX idx_interacao_tipo ON feedbacks_feedbackinteracao(tipo);
```

### 2.6 feedbacks_tag

```sql
CREATE TABLE feedbacks_tag (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    nome VARCHAR(50) NOT NULL,
    cor VARCHAR(7) DEFAULT '#6B7280',
    descricao TEXT,
    
    UNIQUE(client_id, nome)
);

CREATE TABLE feedbacks_feedback_tags (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER NOT NULL REFERENCES feedbacks_feedback(id),
    tag_id INTEGER NOT NULL REFERENCES feedbacks_tag(id),
    
    UNIQUE(feedback_id, tag_id)
);
```

### 2.7 feedbacks_responsetemplate

```sql
CREATE TABLE feedbacks_responsetemplate (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    conteudo TEXT NOT NULL,
    tipos_aplicaveis JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT TRUE,
    uso_count INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

### 2.8 billing_plan

```sql
CREATE TABLE billing_plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    price_cents INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    stripe_price_id VARCHAR(100),
    stripe_product_id VARCHAR(100),
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    description TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    trial_days INTEGER DEFAULT 14,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.9 billing_subscription

```sql
CREATE TABLE billing_subscription (
    id SERIAL PRIMARY KEY,
    client_id INTEGER UNIQUE NOT NULL REFERENCES tenants_client(id),
    plan_id INTEGER NOT NULL REFERENCES billing_plan(id),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'trialing',
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Status: trialing, active, past_due, canceled, unpaid, incomplete
```

### 2.10 billing_invoice

```sql
CREATE TABLE billing_invoice (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    subscription_id INTEGER REFERENCES billing_subscription(id),
    stripe_invoice_id VARCHAR(100) UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL,
    invoice_pdf_url VARCHAR(500),
    hosted_invoice_url VARCHAR(500),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.11 webhooks_webhookendpoint

```sql
CREATE TABLE webhooks_webhookendpoint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    secret VARCHAR(64) NOT NULL,
    events JSONB DEFAULT '[]',
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    max_retries INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 60,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_triggered TIMESTAMP,
    last_success TIMESTAMP,
    last_failure TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.12 webhooks_webhookdelivery

```sql
CREATE TABLE webhooks_webhookdelivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES webhooks_webhookendpoint(id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_time_ms INTEGER,
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- Status: pending, delivered, failed, retrying
```

### 2.13 notifications_notification

```sql
CREATE TABLE notifications_notification (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    user_id INTEGER REFERENCES auth_user(id),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Types: feedback_new, feedback_response, status_change, team_invite, billing
```

### 2.14 notifications_pushsubscription

```sql
CREATE TABLE notifications_pushsubscription (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id),
    client_id INTEGER NOT NULL REFERENCES tenants_client(id),
    endpoint VARCHAR(500) NOT NULL,
    p256dh_key VARCHAR(200) NOT NULL,
    auth_key VARCHAR(100) NOT NULL,
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    
    UNIQUE(user_id, endpoint)
);
```

### 2.15 consent_consentversion

```sql
CREATE TABLE consent_consentversion (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    content_url VARCHAR(255) NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    effective_date TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(document_type, version)
);

-- Types: terms, privacy, lgpd, marketing
```

### 2.16 consent_userconsent

```sql
CREATE TABLE consent_userconsent (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id),
    email VARCHAR(254),
    ip_address INET NOT NULL,
    user_agent VARCHAR(500) NOT NULL,
    consent_version_id INTEGER NOT NULL REFERENCES consent_consentversion(id),
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    context VARCHAR(50) NOT NULL
);

-- Context: signup, login, feedback, settings
```

### 2.17 auditlog_auditlog

```sql
CREATE TABLE auditlog_auditlog (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES tenants_client(id),
    user_id INTEGER REFERENCES auth_user(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Actions: create, update, delete, login, logout, export, etc.

CREATE INDEX idx_auditlog_client ON auditlog_auditlog(client_id);
CREATE INDEX idx_auditlog_user ON auditlog_auditlog(user_id);
CREATE INDEX idx_auditlog_action ON auditlog_auditlog(action);
CREATE INDEX idx_auditlog_created ON auditlog_auditlog(created_at DESC);
```

---

## 3. Migrações

### Migrações Aplicadas

| App | Migration | Descrição |
|-----|-----------|-----------|
| tenants | 0001_initial | Criar Client |
| tenants | 0002_alter_client_logo | URL para logo |
| tenants | 0003_client_owner | Adicionar owner FK |
| tenants | 0004_client_plano | Campos de assinatura |
| tenants | 0005_client_branding | Cores e fonte |
| tenants | 0006_team_member | TeamMember e TeamInvitation |
| tenants | 0007_populate_team_members | Popular membros existentes |
| tenants | 0008_email_notifications | Preferência de notificações |
| feedbacks | 0001_initial | Criar Feedback |
| feedbacks | 0002_protocolo | Adicionar protocolo |
| feedbacks | 0003_interacao | FeedbackInteracao |
| feedbacks | 0004_indexes | Índices de performance |
| feedbacks | 0005_autor | Campo autor |
| feedbacks | 0006_protocolo_unique | Protocolo único |
| feedbacks | 0007_performance_indexes | Mais índices |
| feedbacks | 0008_assignment | Campos de atribuição |
| feedbacks | 0009_tags | Tag model |
| feedbacks | 0010_prioridade | Campo prioridade |
| feedbacks | 0011_sla_tracking | Campos de SLA |
| feedbacks | 0012_response_template | ResponseTemplate |
| billing | 0001_create_billing_models | Plan, Subscription, Invoice |
| consent | 0001_initial | ConsentVersion, UserConsent |
| notifications | 0001_initial | Notification, PushSubscription |
| webhooks | 0001_initial | WebhookEndpoint, WebhookDelivery |
| auditlog | 0001_initial | AuditLog |

### Comandos de Migração

```bash
# Criar nova migração
python manage.py makemigrations <app_name>

# Aplicar migrações
python manage.py migrate

# Ver status das migrações
python manage.py showmigrations

# Reverter migração
python manage.py migrate <app_name> <migration_name>
```

---

## 4. Índices Importantes

### Índices de Performance Críticos

```sql
-- Queries mais frequentes no dashboard
CREATE INDEX idx_feedback_dashboard 
    ON feedbacks_feedback(client_id, status, data_criacao DESC);

-- Busca por protocolo
CREATE INDEX idx_feedback_protocolo 
    ON feedbacks_feedback(protocolo);

-- Listagem de feedbacks com filtros
CREATE INDEX idx_feedback_filters 
    ON feedbacks_feedback(client_id, tipo, status, prioridade);

-- Analytics por período
CREATE INDEX idx_feedback_analytics 
    ON feedbacks_feedback(client_id, data_criacao);
```

---

## 5. Backup e Restauração

### Railway Backup Automático

O Railway faz backup automático diário do PostgreSQL. Para restaurar:

1. Acesse o dashboard do Railway
2. Vá para o serviço PostgreSQL
3. Clique em "Backups"
4. Selecione o backup desejado
5. Clique em "Restore"

### Backup Manual

```bash
# Exportar
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Importar
psql $DATABASE_URL < backup_20260131.sql
```

---

## 6. Queries Úteis

### Feedbacks por Tenant

```sql
SELECT 
    c.nome as empresa,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE f.status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE f.status = 'resolvido') as resolvidos
FROM feedbacks_feedback f
JOIN tenants_client c ON f.client_id = c.id
GROUP BY c.id, c.nome
ORDER BY total DESC;
```

### Tempo Médio de Resposta

```sql
SELECT 
    c.nome as empresa,
    AVG(f.tempo_primeira_resposta) as tempo_medio_resposta,
    AVG(f.tempo_resolucao) as tempo_medio_resolucao
FROM feedbacks_feedback f
JOIN tenants_client c ON f.client_id = c.id
WHERE f.data_primeira_resposta IS NOT NULL
GROUP BY c.id, c.nome;
```

### Uso de Storage por Tenant

```sql
-- Via Cloudinary API (não no banco local)
```

---

*Última atualização: 31/01/2026*
