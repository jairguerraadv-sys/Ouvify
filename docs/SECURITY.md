# 🛡️ Guia de Segurança - Ouvify

Este documento descreve as políticas e práticas de segurança implementadas no Ouvify.

---

## 1. Visão Geral

O Ouvify implementa segurança em múltiplas camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    WAF (Cloudflare)                          │
│              DDoS Protection, Bot Detection                  │
├─────────────────────────────────────────────────────────────┤
│                    TLS 1.3 (HTTPS)                          │
│              Encryption in Transit                           │
├─────────────────────────────────────────────────────────────┤
│                  Security Headers                            │
│          CSP, HSTS, X-Frame-Options, etc.                   │
├─────────────────────────────────────────────────────────────┤
│                   Rate Limiting                              │
│              Por IP e por Tenant                            │
├─────────────────────────────────────────────────────────────┤
│               Authentication (JWT)                           │
│          Access Token + Refresh Token + 2FA                 │
├─────────────────────────────────────────────────────────────┤
│                 Authorization (RBAC)                         │
│           Owner > Admin > Moderator > Viewer                │
├─────────────────────────────────────────────────────────────┤
│               Tenant Isolation                               │
│          TenantAwareModel + TenantAwareManager              │
├─────────────────────────────────────────────────────────────┤
│               Input Sanitization                             │
│            Bleach (Backend) + DOMPurify (Frontend)          │
├─────────────────────────────────────────────────────────────┤
│              Database (PostgreSQL)                           │
│            Encryption at Rest + Backups                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Autenticação

### 2.1 JWT (JSON Web Tokens)

**Configuração:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
}
```

**Fluxo:**
1. Usuário faz login com email/senha
2. Backend retorna `access_token` (15 min) e `refresh_token` (7 dias)
3. Frontend armazena tokens no `localStorage`
4. Cada request inclui `Authorization: Bearer <access_token>`
5. Quando access expira, refresh é usado para obter novo access
6. Logout adiciona tokens à blacklist

### 2.2 Two-Factor Authentication (2FA)

**Implementação:** TOTP via `pyotp`

**Fluxo:**
1. Usuário habilita 2FA em Configurações
2. Sistema gera secret e QR code
3. Usuário escaneia com app autenticador (Google Authenticator, Authy)
4. Sistema gera backup codes
5. Login passa a exigir código 2FA

**Endpoints:**
- `POST /api/auth/2fa/enable/` - Habilitar
- `POST /api/auth/2fa/confirm/` - Confirmar setup
- `POST /api/auth/2fa/verify/` - Verificar no login
- `POST /api/auth/2fa/disable/` - Desabilitar

### 2.3 Senhas

**Hashing:** Django PBKDF2 (padrão)

**Validações:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial
- Não pode ser similar ao email

### 2.4 Reset de Senha

**Fluxo:**
1. Usuário solicita reset com email
2. Sistema gera token único (expira em 1h)
3. Email enviado com link
4. Usuário define nova senha
5. Token é invalidado

---

## 3. Autorização (RBAC)

### 3.1 Roles e Permissões

| Role | Feedbacks | Equipe | Config | Billing | Admin |
|------|-----------|--------|--------|---------|-------|
| OWNER | CRUD | CRUD | CRUD | CRUD | ✅ |
| ADMIN | CRUD | CRUD | Read | Read | ❌ |
| MODERATOR | CRU | Read | ❌ | ❌ | ❌ |
| VIEWER | Read | ❌ | ❌ | ❌ | ❌ |

### 3.2 Implementação

```python
# Decorador para verificar role
@require_role(['OWNER', 'ADMIN'])
def manage_team(request):
    pass

# Mixin para ViewSets
class OwnerOnlyMixin:
    def get_queryset(self):
        if not request.team_member.role == 'OWNER':
            raise PermissionDenied()
        return super().get_queryset()
```

---

## 4. Multi-Tenancy

### 4.1 Isolamento de Dados

```python
class TenantAwareManager(models.Manager):
    def get_queryset(self):
        from apps.core.middleware import get_current_tenant
        tenant = get_current_tenant()
        if tenant:
            return super().get_queryset().filter(client=tenant)
        return super().get_queryset().none()
```

**Garantias:**
- ✅ Queries filtradas automaticamente por tenant
- ✅ Criação de objetos associa tenant automaticamente
- ✅ Não é possível acessar dados de outro tenant
- ✅ Admin Django usa `all_tenants()` explicitamente

### 4.2 Identificação do Tenant

Ordem de prioridade:
1. Header `X-Tenant-ID` (para APIs)
2. Subdomínio da URL
3. Token JWT claims
4. Fallback para desenvolvimento (desabilitado em produção)

---

## 5. Sanitização de Inputs

### 5.1 Backend (Bleach)

```python
# apps/core/sanitizers.py
import bleach
import html

def sanitize_plain_text(value: str) -> str:
    """Remove ALL HTML - para campos de texto puro."""
    return html.escape(value.strip())

def sanitize_rich_text(value: str, allow_links=False) -> str:
    """Permite formatação básica - para rich text."""
    allowed_tags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li']
    if allow_links:
        allowed_tags.extend(['a'])
    return bleach.clean(
        value,
        tags=allowed_tags,
        attributes={'a': ['href', 'title']},
        strip=True
    )
```

### 5.2 Frontend (DOMPurify)

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}
```

### 5.3 Proteções

- ✅ SQL Injection: ORM Django + parameterized queries
- ✅ XSS: Sanitização + CSP
- ✅ CSRF: Token CSRF em forms Django
- ✅ Command Injection: Sem uso de shell commands com input do usuário

---

## 6. Headers de Segurança

### 6.1 Content Security Policy (CSP)

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-xxx' 'strict-dynamic' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### 6.2 Outros Headers

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self)
```

---

## 7. Rate Limiting

### 7.1 Configuração

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'apps.core.throttling.TestAwareUserRateThrottle',
        'apps.core.throttling.TestAwareAnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '100/minute',
        'anon': '20/minute',
        'login': '5/minute',
        'feedback_create': '10/minute',
        'protocol_query': '20/minute',
    }
}
```

### 7.2 Endpoints Protegidos

| Endpoint | Limite | Escopo |
|----------|--------|--------|
| POST /api/token/ | 5/min | Por IP |
| POST /api/feedbacks/ | 10/min | Por IP |
| GET /api/feedbacks/consultar-protocolo/ | 20/min | Por IP |
| API geral (autenticado) | 100/min | Por tenant |

---

## 8. LGPD/GDPR Compliance

### 8.1 Direitos do Titular

| Direito | Implementação | Endpoint |
|---------|--------------|----------|
| Acesso | Exportação de dados | `GET /api/export-data/` |
| Retificação | Edição de perfil | `PATCH /api/auth/me/` |
| Exclusão | Direito ao esquecimento | `DELETE /api/account/` |
| Portabilidade | Export JSON/CSV | `GET /api/export-data/?format=csv` |
| Oposição | Preferências de notificação | Settings |

### 8.2 Consentimento

```python
# apps/consent/models.py
class UserConsent(models.Model):
    user = models.ForeignKey(User, ...)
    consent_version = models.ForeignKey(ConsentVersion, ...)
    accepted = models.BooleanField()
    accepted_at = models.DateTimeField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(...)
    context = models.CharField(...)  # signup, login, feedback
```

### 8.3 Dados Sensíveis

- ✅ Senhas: Hash PBKDF2
- ✅ Tokens: Armazenados com expiração
- ✅ IPs: Anonimizados em logs
- ✅ Emails: Não logados em texto plano
- ✅ PII: Não expostos em erros

---

## 9. Auditoria

### 9.1 Audit Log

```python
# Eventos logados
- login_success
- login_failure
- logout
- password_change
- password_reset
- 2fa_enabled
- 2fa_disabled
- feedback_created
- feedback_updated
- feedback_deleted
- team_member_added
- team_member_removed
- settings_changed
- data_exported
- account_deleted
```

### 9.2 Exemplo de Log

```json
{
  "action": "login_success",
  "user_id": 123,
  "client_id": 1,
  "ip_address": "192.168.1.xxx",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-01-31T10:30:00Z",
  "details": {
    "method": "password",
    "2fa_used": true
  }
}
```

---

## 10. Segurança de Upload

### 10.1 Validações

```python
# Tipos permitidos
ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
}

# Tamanho máximo
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
```

### 10.2 Processo de Upload

1. Validar extensão
2. Validar MIME type via magic bytes
3. Verificar tamanho
4. Renomear arquivo (UUID)
5. Upload para Cloudinary
6. Salvar URL no banco

---

## 11. Segurança de API

### 11.1 CORS

```python
CORS_ALLOWED_ORIGINS = [
    'https://ouvify.vercel.app',
    'https://ouvify-saas.vercel.app',
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'x-tenant-id',
]
```

### 11.2 Proteções

- ✅ HTTPS obrigatório em produção
- ✅ CORS restrito a origens conhecidas
- ✅ JWT com expiração curta
- ✅ Rate limiting ativo
- ✅ Sem informações sensíveis em erros

---

## 12. Resposta a Incidentes

### 12.1 Classificação

| Severidade | Descrição | Tempo de Resposta |
|------------|-----------|-------------------|
| P0 Crítico | Vazamento de dados, acesso não autorizado | Imediato |
| P1 Alto | Vulnerabilidade explorável | 4 horas |
| P2 Médio | Falha de segurança sem exploração | 24 horas |
| P3 Baixo | Melhoria de segurança | 7 dias |

### 12.2 Processo

1. **Detectar** - Monitoramento Sentry, logs, reports
2. **Conter** - Isolar sistemas afetados
3. **Erradicar** - Corrigir vulnerabilidade
4. **Recuperar** - Restaurar serviços
5. **Aprender** - Post-mortem e melhorias

### 12.3 Contato de Segurança

- **Email:** security@ouvify.com.br
- **Prazo para resposta:** 48 horas

---

## 13. Checklist de Segurança

### Deploy

- [ ] SECRET_KEY única e segura
- [ ] DEBUG=False em produção
- [ ] ALLOWED_HOSTS configurado
- [ ] HTTPS obrigatório
- [ ] CORS configurado corretamente
- [ ] Headers de segurança ativos
- [ ] Rate limiting habilitado
- [ ] Logs de auditoria funcionando
- [ ] Backups configurados
- [ ] Sentry monitorando erros

### Código

- [ ] Inputs sanitizados
- [ ] Queries parametrizadas
- [ ] Tokens com expiração
- [ ] Senhas com hash
- [ ] Uploads validados
- [ ] Erros não expõem informações

### Compliance

- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] Consentimento coletado
- [ ] Export de dados funcional
- [ ] Exclusão de conta funcional

---

*Última atualização: 31/01/2026*
