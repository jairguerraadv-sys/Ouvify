# 🔐 Segurança - Ouvify SaaS

Este documento descreve os controles de segurança implementados no Ouvify.

## 📋 Sumário

1. [Autenticação e Autorização](#autenticação-e-autorização)
2. [Multi-tenancy e Isolamento](#multi-tenancy-e-isolamento)
3. [Proteções de API](#proteções-de-api)
4. [Headers de Segurança](#headers-de-segurança)
5. [Criptografia](#criptografia)
6. [Checklist de Segurança](#checklist-de-segurança)

---

## 🔑 Autenticação e Autorização

### JWT (JSON Web Tokens)

O Ouvify usa JWT para autenticação de API:

```
Authorization: Bearer <access_token>
```

**Configuração:**
- Access Token: expira em 15 minutos
- Refresh Token: expira em 7 dias
- Blacklist habilitado para invalidação

**Fluxo:**
1. POST `/api/token/` com email/password
2. Recebe `access` e `refresh` tokens
3. Usa `access` em todas as requisições
4. Renova com POST `/api/token/refresh/`

### Senhas

- Mínimo 8 caracteres
- Validadores Django padrão:
  - UserAttributeSimilarityValidator
  - MinimumLengthValidator
  - CommonPasswordValidator
  - NumericPasswordValidator

### Two-Factor Authentication (2FA)

Disponível para planos Pro:
- TOTP (Time-based One-Time Password)
- Backup codes para recuperação

---

## 🏢 Multi-tenancy e Isolamento

### Modelo de Isolamento

O Ouvify usa **isolamento por linha** (row-level) com `client_id` em todas as tabelas sensíveis:

```python
class TenantAwareModel(models.Model):
    client = models.ForeignKey('tenants.Client', on_delete=models.CASCADE)
    
    objects = TenantAwareManager()  # Filtra automaticamente por tenant
```

### Garantias de Isolamento

1. **TenantAwareManager:** Todas as queries filtradas automaticamente
2. **TenantMiddleware:** Identifica tenant por subdomínio ou header
3. **Validação em ViewSets:** Verifica se recurso pertence ao tenant
4. **Testes de isolamento:** Cobertura para cenários cross-tenant

### Identificação de Tenant

```
Prioridade:
1. Subdomínio: empresa.ouvify.com → tenant "empresa"
2. Header: X-Tenant-ID: 123
3. Fallback (dev only): primeiro tenant ativo
```

---

## 🛡️ Proteções de API

### Rate Limiting

```python
DEFAULT_THROTTLE_RATES = {
    'anon': '100/hour',           # Usuários anônimos
    'user': '1000/hour',          # Usuários autenticados
    'tenant': '5000/hour',        # Por tenant
    'protocolo_consulta': '10/minute',  # Consulta de protocolo
    'feedback_criacao': '10/hour',      # Criação de feedbacks
}
```

### Proteção contra Brute Force

- Consulta de protocolo: 10 tentativas/minuto por IP+protocolo
- Login: Lockout após 5 tentativas falhas (via django-axes se habilitado)

### Validação de Input

- **XSS:** Sanitização com `html.escape()` ou `bleach`
- **SQL Injection:** ORM Django (sem raw queries)
- **CSRF:** Token validation habilitado

```python
# Exemplo de sanitização
def validate_titulo(self, value):
    return sanitize_plain_text(value, max_length=200)
```

---

## 📋 Headers de Segurança

### Backend (Django)

```python
# settings.py (produção)
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
```

### Content Security Policy (CSP)

```python
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "NONCE", "https://js.stripe.com", "'strict-dynamic'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")  # Tailwind
CSP_IMG_SRC = ("'self'", "data:", "https:", "blob:")
CSP_FRAME_SRC = ("https://js.stripe.com", "https://hooks.stripe.com")
```

### Frontend (Next.js)

```typescript
// next.config.ts
headers: [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

---

## 🔒 Criptografia

### Em Trânsito

- **HTTPS obrigatório** em produção
- TLS 1.2+ (Railway/Vercel gerenciam)
- HSTS habilitado

### Em Repouso

- **Senhas:** bcrypt (Django default)
- **Tokens JWT:** assinados com SECRET_KEY
- **Banco de dados:** PostgreSQL encryption at rest (Railway)

### Protocolo de Rastreio

```python
# Geração criptograficamente segura
def gerar_protocolo():
    caracteres = string.ascii_uppercase + string.digits
    parte1 = ''.join(secrets.choice(caracteres) for _ in range(4))
    parte2 = ''.join(secrets.choice(caracteres) for _ in range(4))
    return f"OUVY-{parte1}-{parte2}"
```

- **Algoritmo:** CSPRNG (`secrets.choice`)
- **Espaço:** 36^8 = 2.8 trilhões de combinações
- **Formato:** `OUVY-XXXX-YYYY` (não sequencial)

---

## ✅ Checklist de Segurança

### Pré-Deploy

- [ ] SECRET_KEY única e não commitada
- [ ] DEBUG=False em produção
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS restrito aos domínios do frontend
- [ ] HTTPS redirect habilitado
- [ ] Senhas de banco de dados fortes
- [ ] Variáveis de ambiente não expostas

### Pós-Deploy

- [ ] Headers de segurança presentes (verificar com securityheaders.com)
- [ ] Rate limiting funcionando
- [ ] Logs de segurança habilitados (Sentry)
- [ ] Backup de banco configurado
- [ ] Alertas de monitoramento ativos

### Periódico

- [ ] Atualizar dependências (`pip-audit`, `npm audit`)
- [ ] Rodar SAST (semgrep)
- [ ] Revisar logs de acesso
- [ ] Testar isolamento multi-tenant
- [ ] Verificar tokens expirados

---

## 🚨 Reportando Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: security@ouvify.com
3. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

Respondemos em até 48 horas úteis.

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/Top10/)
- [Django Security](https://docs.djangoproject.com/en/5.0/topics/security/)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

**Última revisão:** 30 de Janeiro de 2026  
**Responsável:** Equipe de Segurança Ouvify
