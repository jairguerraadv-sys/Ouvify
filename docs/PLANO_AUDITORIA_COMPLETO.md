# 🔍 PLANO DE AUDITORIA COMPLETO - OUVY SAAS
**Data:** 14 de janeiro de 2026  
**Status:** Preparação para Deploy Final em Produção  
**Plataforma:** White Label SaaS - Canal de Feedback  

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Objetivos da Auditoria](#2-objetivos-da-auditoria)
3. [Metodologia e Cronograma](#3-metodologia-e-cronograma)
4. [Fase 1: Auditoria de Arquitetura](#fase-1-auditoria-de-arquitetura)
5. [Fase 2: Auditoria de Código](#fase-2-auditoria-de-código)
6. [Fase 3: Auditoria de Segurança](#fase-3-auditoria-de-segurança)
7. [Fase 4: Auditoria de Performance](#fase-4-auditoria-de-performance)
8. [Fase 5: Auditoria de Infraestrutura](#fase-5-auditoria-de-infraestrutura)
9. [Fase 6: Auditoria de Funcionalidades](#fase-6-auditoria-de-funcionalidades)
10. [Fase 7: Auditoria de Documentação](#fase-7-auditoria-de-documentação)
11. [Fase 8: Testes de Aceitação](#fase-8-testes-de-aceitação)
12. [Critérios de Aprovação](#critérios-de-aprovação)
13. [Plano de Remediação](#plano-de-remediação)

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Descrição
**Ouvy** é uma plataforma SaaS White Label para gestão de canais de feedback (denúncias, reclamações, sugestões, elogios) com sistema de rastreamento por protocolo único.

### 1.2 Stack Tecnológico

#### Backend
- **Framework:** Django 6.0.1
- **API:** Django REST Framework 3.15.2
- **Database:** PostgreSQL 16.x (prod) / SQLite (dev)
- **Pagamentos:** Stripe 14.1.0
- **Server:** Gunicorn 23.0.0
- **Deploy:** Railway (backend)

#### Frontend
- **Framework:** Next.js 16.1.1
- **UI:** React 19.2.3 + TypeScript 5.x
- **Styling:** TailwindCSS 3.4.19 + Shadcn/UI
- **State:** SWR 2.3.8
- **HTTP Client:** Axios 1.13.2
- **Deploy:** Vercel (frontend)

### 1.3 Arquitetura Multi-Tenant
- Isolamento por subdomínio (ex: `empresa.ouvy.com`)
- Tenant identificado via middleware customizado
- Segregação total de dados por tenant
- Sistema de assinatura (Free/Starter/Pro)

---

## 2. OBJETIVOS DA AUDITORIA

### 2.1 Objetivos Primários
- ✅ **Garantir segurança:** Identificar e corrigir vulnerabilidades críticas
- ✅ **Validar integridade:** Verificar consistência de código e dados
- ✅ **Eliminar redundâncias:** Remover código duplicado/obsoleto
- ✅ **Assegurar completude:** Confirmar todas funcionalidades implementadas
- ✅ **Preparar deploy:** Validar ambiente para produção

### 2.2 Objetivos Secundários
- 📊 Otimizar performance
- 📚 Atualizar documentação
- 🧪 Validar cobertura de testes
- 🔄 Revisar processos de CI/CD
- 💾 Auditar backups e recovery

---

## 3. METODOLOGIA E CRONOGRAMA

### 3.1 Abordagem
- **Auditoria incremental** por fases
- **Testes automatizados** + manuais
- **Análise estática** de código
- **Revisão de segurança** OWASP
- **Documentação detalhada** de findings

### 3.2 Cronograma Sugerido

| Fase | Duração | Responsável | Status |
|------|---------|-------------|--------|
| 1. Arquitetura | 0.5 dia | Tech Lead | Pendente |
| 2. Código | 1 dia | Dev Team | Pendente |
| 3. Segurança | 1 dia | Security Lead | Pendente |
| 4. Performance | 0.5 dia | DevOps | Pendente |
| 5. Infraestrutura | 0.5 dia | DevOps | Pendente |
| 6. Funcionalidades | 1 dia | QA Team | Pendente |
| 7. Documentação | 0.5 dia | Tech Writer | Pendente |
| 8. Aceitação Final | 1 dia | Product Owner | Pendente |
| **Total** | **6 dias** | - | - |

### 3.3 Ferramentas Necessárias
```bash
# Backend
- Bandit (análise segurança Python)
- Safety (vulnerabilidades dependências)
- Pylint / Flake8 (qualidade código)
- Coverage.py (cobertura testes)

# Frontend
- ESLint (análise código TypeScript)
- Lighthouse (performance/acessibilidade)
- Jest (testes unitários)
- Cypress (testes E2E)

# Infraestrutura
- OWASP ZAP (pen testing)
- Postman/Insomnia (testes API)
- Railway CLI / Vercel CLI
```

---

## FASE 1: AUDITORIA DE ARQUITETURA

### 1.1 Estrutura de Diretórios

#### ✅ Checklist - Backend (`/ouvy_saas/`)
```bash
# Verificar estrutura esperada
□ apps/core/ existe e contém middleware
□ apps/tenants/ existe e contém models de Client
□ apps/feedbacks/ existe e contém models de Feedback
□ config/settings.py configurado corretamente
□ config/urls.py com rotas documentadas
□ logs/ diretório existe e é ignorado no git
□ migrations/ aplicadas em todos apps
□ venv/ ignorado no git
```

**Comandos:**
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
tree -L 2 -I 'venv|__pycache__|*.pyc'
python manage.py showmigrations
```

#### ✅ Checklist - Frontend (`/ouvy_frontend/`)
```bash
# Verificar estrutura esperada
□ app/ contém todas as rotas (dashboard, admin, etc)
□ components/ tem componentes reutilizáveis
□ hooks/ tem hooks customizados (use-dashboard, etc)
□ lib/ contém utilitários e configs
□ public/ tem assets estáticos
□ types/ tem definições TypeScript
□ .next/ ignorado no git
□ node_modules/ ignorado no git
```

**Comandos:**
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
tree -L 2 -I 'node_modules|.next'
```

### 1.2 Mapeamento de Dependências

#### Backend
```bash
# Verificar dependências
cd /Users/jairneto/Desktop/ouvy_saas
pip list --outdated
safety check --json
```

**Verificações:**
- [ ] Django 6.0.1 - verificar se há patches de segurança
- [ ] DRF 3.15.2 - última versão estável?
- [ ] Stripe 14.1.0 - verificar breaking changes
- [ ] psycopg2-binary - compatível com PostgreSQL 16?

#### Frontend
```bash
# Verificar dependências
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
npm audit
npm outdated
```

**Verificações:**
- [ ] Next.js 16.1.1 - verificar bugs conhecidos
- [ ] React 19.2.3 - versão estável?
- [ ] Vulnerabilidades críticas/altas? (npm audit)

### 1.3 Análise de Multi-Tenancy

#### Verificar Isolamento de Dados
```python
# Script de teste: test_tenant_isolation.py
from django.test import TestCase
from apps.tenants.models import Client
from apps.feedbacks.models import Feedback

class TenantIsolationTest(TestCase):
    def test_feedbacks_isolated_by_tenant(self):
        """Garantir que feedbacks de um tenant não vazem para outro"""
        tenant1 = Client.objects.create(nome="Empresa A", subdominio="empresaa")
        tenant2 = Client.objects.create(nome="Empresa B", subdominio="empresab")
        
        # Criar feedback para tenant1
        feedback1 = Feedback.objects.create(
            tenant=tenant1,
            tipo='sugestao',
            descricao='Teste'
        )
        
        # Tentar acessar via queryset de tenant2
        with tenant_switch(tenant2):
            count = Feedback.objects.all().count()
            assert count == 0, "FALHA: Dados vazando entre tenants!"
```

**Checklist:**
- [ ] Middleware `TenantMiddleware` ativo
- [ ] Todas as queries filtram por `tenant`
- [ ] Manager `TenantAwareManager` aplicado em todos models
- [ ] Testes de isolamento passando
- [ ] Admin não expõe dados de outros tenants

---

## FASE 2: AUDITORIA DE CÓDIGO

### 2.1 Análise Estática - Backend

#### Executar Pylint/Flake8
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Instalar ferramentas
pip install pylint flake8 bandit black isort

# Executar análises
pylint apps/ --reports=y > ../docs/auditorias/pylint_report.txt
flake8 apps/ --max-line-length=120 > ../docs/auditorias/flake8_report.txt
bandit -r apps/ -f json -o ../docs/auditorias/bandit_report.json
```

**Verificar:**
- [ ] Score Pylint > 8.0
- [ ] Sem erros críticos no Flake8
- [ ] Sem vulnerabilidades HIGH/CRITICAL no Bandit

#### Checar Code Smells
```bash
# Buscar TODOs/FIXMEs
grep -rn "TODO\|FIXME\|XXX\|HACK" apps/ > ../docs/auditorias/code_todos.txt

# Buscar código comentado
grep -rn "^[[:space:]]*#.*print\|#.*import" apps/ > ../docs/auditorias/commented_code.txt

# Buscar imports não utilizados
pylint --disable=all --enable=unused-import apps/
```

**Ação:**
- [ ] Resolver todos os TODOs críticos
- [ ] Remover código comentado
- [ ] Limpar imports não utilizados

### 2.2 Análise Estática - Frontend

#### Executar ESLint
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Executar ESLint
npm run lint > ../docs/auditorias/eslint_report.txt

# TypeScript errors
npx tsc --noEmit > ../docs/auditorias/typescript_errors.txt
```

**Verificar:**
- [ ] Sem erros do ESLint
- [ ] Sem erros do TypeScript
- [ ] Warnings revisados e justificados

#### Checar Duplicação de Código
```bash
# Instalar jscpd (Copy/Paste Detector)
npm install -g jscpd

# Executar análise
jscpd app/ components/ --min-lines=10 --format=markdown > ../docs/auditorias/code_duplication.md
```

**Ação:**
- [ ] Refatorar código duplicado (>10 linhas)
- [ ] Criar componentes reutilizáveis

### 2.3 Verificar Redundâncias e Versões Antigas

#### Arquivos Obsoletos
```bash
# Buscar arquivos com sufixos suspeitos
find . -type f \( -name "*.old" -o -name "*.bak" -o -name "*_old.*" -o -name "*_backup.*" -o -name "*_v1.*" -o -name "*_deprecated.*" \)

# Buscar diretórios de backup
find . -type d -name "*backup*" -o -name "*old*" -o -name "*deprecated*"
```

**Ação:**
- [ ] Listar todos os arquivos encontrados
- [ ] Verificar se ainda são necessários
- [ ] Mover para `/docs/archive_2026/` ou deletar

#### Componentes Duplicados (Frontend)
```bash
# Buscar componentes com nomes similares
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
find app/ components/ -type f -name "*.tsx" | sort | grep -i "button\|card\|form\|input"
```

**Verificar:**
- [ ] Múltiplos componentes Button?
- [ ] Múltiplos componentes Card?
- [ ] Consolidar em design system único

#### Models/APIs Duplicados (Backend)
```bash
# Buscar serializers/views similares
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
grep -rn "class.*Serializer" apps/ | cut -d: -f1 | sort | uniq -c | sort -rn
grep -rn "class.*ViewSet" apps/ | cut -d: -f1 | sort | uniq -c | sort -rn
```

### 2.4 Verificar Rotas e Caminhos

#### Backend - Rotas API
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
python manage.py show_urls > ../docs/auditorias/api_routes.txt
```

**Checklist:**
- [ ] Todas as rotas documentadas no Swagger
- [ ] Sem rotas órfãs (não utilizadas)
- [ ] Padrões de URL consistentes
- [ ] Versionamento de API (se aplicável)

**Rotas Esperadas:**
```
API Principal:
POST   /api/tenants/signup/                  - Criar tenant
POST   /api/tenants/check-subdomain/         - Verificar disponibilidade
POST   /api/tenants/login/                   - Login
POST   /api/tenants/logout/                  - Logout
POST   /api/tenants/subscribe/               - Criar checkout Stripe
POST   /api/tenants/stripe-webhook/          - Webhook Stripe
GET    /api/tenants/me/                      - Info do tenant atual

GET    /api/feedbacks/                       - Listar feedbacks
POST   /api/feedbacks/                       - Criar feedback
GET    /api/feedbacks/{id}/                  - Detalhes feedback
PATCH  /api/feedbacks/{id}/                  - Atualizar feedback
DELETE /api/feedbacks/{id}/                  - Deletar feedback
POST   /api/feedbacks/{id}/responder/        - Adicionar resposta

GET    /api/feedbacks/consultar-protocolo/   - Consulta pública
POST   /api/feedbacks/responder-protocolo/   - Responder publicamente

Admin:
GET    /api/admin/tenants/                   - Listar todos tenants
PATCH  /api/admin/tenants/{id}/toggle-active/ - Ativar/desativar

Health:
GET    /api/health/                          - Health check
GET    /api/health/ready/                    - Readiness probe
```

#### Frontend - Rotas Pages
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
find app/ -name "page.tsx" -o -name "layout.tsx"
```

**Rotas Esperadas:**
```
/                           - Landing page
/cadastro                   - Signup tenant
/login                      - Login tenant
/dashboard                  - Dashboard principal
/dashboard/feedbacks        - Lista feedbacks (?)
/dashboard/feedbacks/[id]   - Detalhes feedback (?)
/enviar                     - Formulário público envio
/acompanhar                 - Consultar protocolo
/[protocolo]                - Página de protocolo público
/admin                      - Admin super user
/planos ou /precos          - Página de preços
/termos                     - Termos de uso
/privacidade                - Política privacidade
/recuperar-senha            - Recuperar senha
```

**Ação:**
- [ ] Mapear todas as rotas existentes
- [ ] Identificar rotas faltantes
- [ ] Verificar links quebrados (404)

---

## FASE 3: AUDITORIA DE SEGURANÇA

### 3.1 Análise de Vulnerabilidades

#### OWASP Top 10 (2023)
```bash
# Checklist baseado em OWASP
```

**A01: Broken Access Control**
- [ ] Middleware de autenticação em todas rotas protegidas
- [ ] Verificação de permissões por tenant
- [ ] Usuário não pode acessar dados de outro tenant
- [ ] Admin routes protegidas (is_superuser)

**A02: Cryptographic Failures**
- [ ] `SECRET_KEY` única e segura em produção
- [ ] `SECRET_KEY` não está no código (apenas .env)
- [ ] Senhas hasheadas com PBKDF2 (Django default)
- [ ] HTTPS obrigatório em produção
- [ ] Cookies com `Secure`, `HttpOnly`, `SameSite`

**A03: Injection**
- [ ] Queries Django ORM (sem SQL raw)
- [ ] Inputs sanitizados (DOMPurify no frontend)
- [ ] Validação de dados em serializers
- [ ] Proteção contra XSS

**A04: Insecure Design**
- [ ] Rate limiting implementado
- [ ] Logs de auditoria (quem fez o quê)
- [ ] Soft delete para dados críticos
- [ ] Backup automático

**A05: Security Misconfiguration**
- [ ] `DEBUG=False` em produção
- [ ] `ALLOWED_HOSTS` restrito
- [ ] Headers de segurança configurados
- [ ] Erros não expõem stack traces
- [ ] Dependências atualizadas

**A06: Vulnerable Components**
- [ ] `safety check` sem vulnerabilidades críticas
- [ ] `npm audit` sem vulnerabilidades críticas
- [ ] Dependências com versões pinadas

**A07: Authentication Failures**
- [ ] Senhas fortes (min 8 caracteres)
- [ ] Rate limit em login (max 5 tentativas)
- [ ] Token expiração configurado
- [ ] Logout limpa token do cliente

**A08: Software and Data Integrity**
- [ ] Webhooks Stripe validados (signature)
- [ ] Uploads de arquivo validados (tipo, tamanho)
- [ ] Integridade de dados (constraints DB)

**A09: Security Logging Failures**
- [ ] Logs de login/logout
- [ ] Logs de acesso a dados sensíveis
- [ ] Logs de erros com contexto
- [ ] Logs não expõem senhas/tokens

**A10: SSRF**
- [ ] Validação de URLs em uploads externos
- [ ] Não há proxy/fetch de URLs arbitrárias

### 3.2 Variáveis de Ambiente

#### Verificar `.env` e `.env.example`
```bash
cd /Users/jairneto/Desktop/ouvy_saas

# Verificar se .env existe e não está no git
ls -la | grep .env
git status --ignored | grep .env

# Comparar .env.example com .env
diff .env.example .env
```

**Checklist:**
- [ ] `.env` no `.gitignore`
- [ ] `.env.example` atualizado com todas as vars
- [ ] Sem valores reais no `.env.example`
- [ ] `SECRET_KEY` não hardcoded no código
- [ ] `STRIPE_SECRET_KEY` não exposta
- [ ] `DATABASE_URL` segura

#### Variáveis Obrigatórias em Produção
```bash
# Backend (Railway)
SECRET_KEY=<gerada_aleatoriamente>
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app,ouvy-saas-production.up.railway.app
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://ouvy-frontend.vercel.app

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3.3 Testes de Penetração

#### Scan de Vulnerabilidades
```bash
# OWASP ZAP (GUI ou CLI)
# Target: https://ouvy-saas-production.up.railway.app
```

#### Testes Manuais
```bash
# 1. Testar SQL Injection
curl -X POST https://api.ouvy.com/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{"descricao": "Test'; DROP TABLE feedbacks;--"}'

# 2. Testar XSS
curl -X POST https://api.ouvy.com/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{"descricao": "<script>alert(1)</script>"}'

# 3. Testar Rate Limiting
for i in {1..20}; do
  curl -X GET https://api.ouvy.com/api/feedbacks/consultar-protocolo/?codigo=TEST-1234-5678
done

# 4. Testar Acesso sem Auth
curl -X GET https://api.ouvy.com/api/feedbacks/ -v

# 5. Testar CSRF
curl -X POST https://api.ouvy.com/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{"tipo": "sugestao", "descricao": "Test"}' -v
```

**Resultados Esperados:**
- [ ] SQL Injection: Bloqueado pelo ORM
- [ ] XSS: Sanitizado ou escapado
- [ ] Rate Limiting: HTTP 429 após limite
- [ ] Auth: HTTP 401 sem token
- [ ] CSRF: Token validado (se não public)

### 3.4 Segurança de Headers HTTP

#### Verificar Headers
```bash
curl -I https://ouvy-saas-production.up.railway.app
```

**Headers Obrigatórios:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**Checklist:**
- [ ] HSTS ativo
- [ ] X-Content-Type-Options ativo
- [ ] X-Frame-Options ativo
- [ ] CSP configurado
- [ ] Cookies com Secure/HttpOnly

---

## FASE 4: AUDITORIA DE PERFORMANCE

### 4.1 Backend Performance

#### Database Query Optimization
```python
# Script: test_query_performance.py
from django.test import TestCase
from django.db import connection
from django.test.utils import override_settings

class QueryPerformanceTest(TestCase):
    def test_n_plus_one_queries(self):
        """Detectar problema N+1"""
        with self.assertNumQueries(1):  # Esperado: 1 query
            feedbacks = Feedback.objects.select_related('tenant').all()
            for f in feedbacks:
                _ = f.tenant.nome  # Não deve gerar nova query
```

**Executar:**
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas
python manage.py test apps.feedbacks.tests.test_performance -v 2
```

**Checklist:**
- [ ] Usar `select_related()` para ForeignKey
- [ ] Usar `prefetch_related()` para ManyToMany
- [ ] Adicionar índices em campos filtrados
- [ ] Paginar results (DRF PageNumberPagination)

#### API Response Time
```bash
# Testar endpoints principais
for endpoint in "/api/feedbacks/" "/api/tenants/me/" "/api/health/"; do
  echo "Testing $endpoint"
  curl -w "@curl-format.txt" -o /dev/null -s "https://api.ouvy.com$endpoint"
done

# curl-format.txt:
#   time_namelookup:  %{time_namelookup}\n
#   time_connect:  %{time_connect}\n
#   time_total:  %{time_total}\n
```

**Metas:**
- [ ] Health check: < 100ms
- [ ] GET list: < 500ms
- [ ] POST create: < 1s

### 4.2 Frontend Performance

#### Lighthouse Audit
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Instalar Lighthouse CLI
npm install -g lighthouse

# Executar audit
lighthouse https://ouvy-frontend.vercel.app \
  --output=html \
  --output-path=../docs/auditorias/lighthouse_report.html
```

**Metas:**
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

#### Bundle Size Analysis
```bash
# Analisar tamanho do bundle
npm run build
npx next@latest build --analyze

# Verificar JS bundle size
du -sh .next/static/chunks/*.js | sort -h
```

**Checklist:**
- [ ] Bundle principal < 200KB (gzipped)
- [ ] Code splitting ativo
- [ ] Lazy loading de componentes pesados
- [ ] Imagens otimizadas (Next.js Image)

### 4.3 Caching Strategy

#### Backend
```python
# settings.py - Configurar cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    }
}

# Decorators em views
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache por 5 minutos
def dashboard_stats(request):
    ...
```

**Checklist:**
- [ ] Redis configurado (Railway addon)
- [ ] Cache em queries pesadas
- [ ] Invalidação de cache ao atualizar

#### Frontend
```typescript
// SWR com revalidação
const { data } = useSWR('/api/feedbacks/', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 30000, // 30s
});
```

**Checklist:**
- [ ] SWR configurado globalmente
- [ ] Cache de imagens (next/image)
- [ ] Static props para páginas estáticas

---

## FASE 5: AUDITORIA DE INFRAESTRUTURA

### 5.1 Deploy Backend (Railway)

#### Verificar Configuração
```bash
# Arquivo: railway.json
cat /Users/jairneto/Desktop/ouvy_saas/ouvy_saas/railway.json

# Procfile
cat /Users/jairneto/Desktop/ouvy_saas/Procfile
```

**Checklist:**
- [ ] `railway.json` existe e configurado
- [ ] `Procfile` com comando correto: `gunicorn config.wsgi`
- [ ] Health check endpoint configurado
- [ ] Auto-deploy no push para `main`
- [ ] Environment variables configuradas

**Variáveis Railway:**
```bash
# Verificar no dashboard Railway
SECRET_KEY
DEBUG=False
ALLOWED_HOSTS
DATABASE_URL (auto-provisionado)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FRONTEND_URL
```

#### Logs e Monitoring
```bash
# Railway CLI
railway logs --tail

# Verificar erros
railway logs | grep -i error
```

**Checklist:**
- [ ] Logs acessíveis via Railway dashboard
- [ ] Alertas configurados para erros críticos
- [ ] Uptime monitoring ativo

### 5.2 Deploy Frontend (Vercel)

#### Verificar Configuração
```bash
# Arquivo: vercel.json
cat /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/vercel.json

# next.config.ts
cat /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/next.config.ts
```

**Checklist:**
- [ ] `vercel.json` existe e configurado
- [ ] Rewrites para subdomínios (se aplicável)
- [ ] Environment variables configuradas
- [ ] Auto-deploy no push para `main`
- [ ] Preview deploys funcionando

**Variáveis Vercel:**
```bash
NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### Build e Deploy
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Build local para testar
npm run build

# Verificar erros
npm run build 2>&1 | grep -i error
```

**Checklist:**
- [ ] Build success sem errors
- [ ] Warnings revisados
- [ ] Deploy automático funcionando

### 5.3 Database (PostgreSQL)

#### Backup Strategy
```bash
# Railway PostgreSQL - verificar backups automáticos
# Dashboard Railway > Database > Backups
```

**Checklist:**
- [ ] Backups diários automáticos
- [ ] Retention policy definida (30 dias)
- [ ] Testar restore de backup
- [ ] Export manual antes de deploys críticos

#### Migrations
```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Verificar estado das migrations
python manage.py showmigrations

# Verificar se há migrations pendentes
python manage.py makemigrations --dry-run
```

**Checklist:**
- [ ] Todas migrations aplicadas
- [ ] Sem migrations pendentes
- [ ] Migrations testadas localmente
- [ ] Rollback plan documentado

### 5.4 CI/CD Pipeline

#### GitHub Actions
```bash
# Verificar workflows
cat /Users/jairneto/Desktop/ouvy_saas/.github/workflows/backend-tests.yml
```

**Checklist:**
- [ ] Tests rodando no CI
- [ ] Lint verificado no CI
- [ ] Build validado no CI
- [ ] Deploy automático após merge

**Workflow Esperado:**
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: python manage.py test
```

---

## FASE 6: AUDITORIA DE FUNCIONALIDADES

### 6.1 Funcionalidades Core - Backend

#### 1. Multi-Tenancy
```bash
# Teste manual via API
# 1. Criar Tenant A
curl -X POST https://api.ouvy.com/api/tenants/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa-a@test.com",
    "password": "senha123",
    "nome": "Empresa A",
    "subdominio": "empresaa"
  }'

# 2. Login Tenant A
TOKEN_A=$(curl -X POST https://api.ouvy.com/api/tenants/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "empresa-a@test.com", "password": "senha123"}' \
  | jq -r '.token')

# 3. Criar Feedback Tenant A
curl -X POST https://api.ouvy.com/api/feedbacks/ \
  -H "Authorization: Token $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"tipo": "sugestao", "descricao": "Teste A"}'

# 4. Criar Tenant B e tentar acessar dados de A
# ... (repetir passos e verificar isolamento)
```

**Checklist:**
- [ ] Tenant A não vê feedbacks de Tenant B
- [ ] Subdomínios únicos (não duplicados)
- [ ] Criação de tenant gera usuário automático
- [ ] Auto-login após signup

#### 2. Sistema de Feedback
```bash
# Cenários de teste

# 1. Criar feedback público (sem auth)
curl -X POST https://api.ouvy.com/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "denuncia",
    "descricao": "Teste público",
    "anonimo": true
  }'

# 2. Consultar por protocolo
curl -X GET "https://api.ouvy.com/api/feedbacks/consultar-protocolo/?codigo=OUVY-ABCD-1234"

# 3. Responder via protocolo (público)
curl -X POST https://api.ouvy.com/api/feedbacks/responder-protocolo/ \
  -H "Content-Type: application/json" \
  -d '{
    "protocolo": "OUVY-ABCD-1234",
    "mensagem": "Obrigado pelo contato"
  }'

# 4. Atualizar status (autenticado)
curl -X PATCH https://api.ouvy.com/api/feedbacks/1/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "em_analise"}'
```

**Checklist:**
- [ ] Criar feedback autenticado
- [ ] Criar feedback anônimo
- [ ] Gerar protocolo único (OUVY-XXXX-YYYY)
- [ ] Consultar feedback por protocolo (público)
- [ ] Adicionar resposta a feedback
- [ ] Atualizar status de feedback
- [ ] Upload de anexos (se implementado)
- [ ] Timeline de interações salva

#### 3. Autenticação e Autorização
```bash
# Testes de auth

# 1. Login com credenciais corretas
curl -X POST https://api.ouvy.com/api/tenants/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ouvy.com", "password": "senha123"}'

# 2. Login com senha errada (deve falhar)
curl -X POST https://api.ouvy.com/api/tenants/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ouvy.com", "password": "errada"}'

# 3. Acessar endpoint protegido sem token
curl -X GET https://api.ouvy.com/api/feedbacks/

# 4. Acessar com token válido
curl -X GET https://api.ouvy.com/api/feedbacks/ \
  -H "Authorization: Token $TOKEN"

# 5. Logout
curl -X POST https://api.ouvy.com/api/tenants/logout/ \
  -H "Authorization: Token $TOKEN"
```

**Checklist:**
- [ ] Login success retorna token
- [ ] Login failure retorna 401
- [ ] Token expira após X tempo
- [ ] Logout invalida token
- [ ] Endpoints protegidos requerem auth
- [ ] Rate limiting em login (5 tentativas)

#### 4. Integração Stripe
```bash
# Testes de pagamento

# 1. Criar checkout session
curl -X POST https://api.ouvy.com/api/tenants/subscribe/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro"}'

# 2. Simular webhook (teste local)
curl -X POST http://localhost:8000/api/tenants/stripe-webhook/ \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: ..." \
  -d @webhook_payload.json
```

**Checklist:**
- [ ] Criar checkout session retorna URL Stripe
- [ ] Webhook valida signature
- [ ] Webhook atualiza subscription status
- [ ] Webhook loga eventos
- [ ] Planos Free/Starter/Pro diferenciados

#### 5. Admin Panel
```bash
# Testes de admin (superuser)

# 1. Listar todos tenants
curl -X GET https://api.ouvy.com/api/admin/tenants/ \
  -H "Authorization: Token $ADMIN_TOKEN"

# 2. Desativar tenant
curl -X PATCH https://api.ouvy.com/api/admin/tenants/1/toggle-active/ \
  -H "Authorization: Token $ADMIN_TOKEN"
```

**Checklist:**
- [ ] Apenas superuser acessa /api/admin/
- [ ] Listar todos tenants
- [ ] Ativar/desativar tenant
- [ ] Visualizar métricas globais

### 6.2 Funcionalidades Core - Frontend

#### 1. Landing Page
**URL:** `/`

**Checklist:**
- [ ] Hero section visível
- [ ] CTA "Começar Grátis" redireciona para /cadastro
- [ ] CTA "Ver Planos" redireciona para /precos
- [ ] Footer com links (Termos, Privacidade)
- [ ] Responsivo (mobile/tablet/desktop)

#### 2. Cadastro (Signup)
**URL:** `/cadastro`

**Checklist:**
- [ ] Formulário com: Email, Senha, Nome Empresa, Subdomínio
- [ ] Validação de email (formato)
- [ ] Validação de senha (mín 8 caracteres)
- [ ] Verificação de subdomínio em tempo real (debounced)
- [ ] Mostra "disponível" ou "indisponível"
- [ ] Erro se subdomínio já existe
- [ ] Success: Redireciona para /dashboard
- [ ] Auto-login após signup

#### 3. Login
**URL:** `/login`

**Checklist:**
- [ ] Formulário com: Email, Senha
- [ ] Link "Esqueci minha senha"
- [ ] Success: Redireciona para /dashboard
- [ ] Erro: Mostra mensagem "Credenciais inválidas"
- [ ] Token salvo em localStorage

#### 4. Dashboard
**URL:** `/dashboard`

**Checklist:**
- [ ] Sidebar com menu (Dashboard, Feedbacks, Admin, Logout)
- [ ] KPIs visíveis: Total, Pendentes, Resolvidos, Taxa Resolução
- [ ] Banner de assinatura (Free vs Pro)
- [ ] Lista de feedbacks recentes
- [ ] Botão "Enviar Novo Feedback" (?)
- [ ] Responsivo

#### 5. Lista de Feedbacks
**URL:** `/dashboard/feedbacks` ou dentro do dashboard

**Checklist:**
- [ ] Tabela com: Protocolo, Tipo, Status, Data
- [ ] Filtros: Por tipo, por status
- [ ] Busca por protocolo
- [ ] Paginação
- [ ] Click em linha abre detalhes

#### 6. Detalhes de Feedback
**URL:** `/dashboard/feedbacks/[id]`

**Checklist:**
- [ ] Informações do feedback
- [ ] Timeline de interações
- [ ] Formulário para adicionar resposta
- [ ] Dropdown para alterar status
- [ ] Botão voltar para lista

#### 7. Formulário Público
**URL:** `/enviar`

**Checklist:**
- [ ] Campos: Tipo, Descrição, Email (opcional), Anexos (?)
- [ ] Checkbox "Enviar anonimamente"
- [ ] Success: Mostra protocolo gerado
- [ ] Botão "Acompanhar Feedback"

#### 8. Acompanhamento Público
**URL:** `/acompanhar`

**Checklist:**
- [ ] Campo: Protocolo
- [ ] Botão "Consultar"
- [ ] Mostra detalhes do feedback
- [ ] Mostra timeline
- [ ] Permite adicionar mensagem (chat público)

#### 9. Página de Protocolo
**URL:** `/[protocolo]` (ex: /OUVY-ABCD-1234)

**Checklist:**
- [ ] Rota dinâmica funciona
- [ ] Mostra detalhes do feedback
- [ ] Timeline visível
- [ ] Chat público ativo

#### 10. Página de Preços
**URL:** `/precos` ou `/planos`

**Checklist:**
- [ ] 3 planos: Free, Starter, Pro
- [ ] Preços visíveis
- [ ] Features listadas
- [ ] Botão "Assinar" redireciona para Stripe Checkout
- [ ] Retorno do checkout atualiza status

#### 11. Admin Panel
**URL:** `/admin`

**Checklist:**
- [ ] Apenas superuser acessa
- [ ] Lista todos tenants
- [ ] Toggle ativo/inativo
- [ ] Métricas gerais (?)

#### 12. Recuperar Senha
**URL:** `/recuperar-senha`

**Checklist:**
- [ ] Campo: Email
- [ ] Botão "Enviar Link"
- [ ] Envia email com link de reset
- [ ] Link válido por X horas
- [ ] Reset atualiza senha

#### 13. Termos e Privacidade
**URLs:** `/termos`, `/privacidade`

**Checklist:**
- [ ] Páginas estáticas existem
- [ ] Conteúdo atualizado
- [ ] Links funcionam

### 6.3 Funcionalidades Faltantes

#### Identificar Gaps
```bash
# Criar documento de funcionalidades
```

**Checklist de Completude:**

**Backend:**
- [ ] Upload de anexos em feedbacks
- [ ] Sistema de notificações (email)
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Soft delete (ao invés de delete)
- [ ] Auditoria de ações (quem fez o quê)
- [ ] Suporte a múltiplos usuários por tenant
- [ ] Permissões granulares (roles)
- [ ] Webhook de saída para integrações
- [ ] API pública (se planejado)

**Frontend:**
- [ ] Dashboard com gráficos (charts)
- [ ] Configurações de tenant (logo, cores)
- [ ] Notificações em tempo real
- [ ] Dark mode
- [ ] Idiomas (i18n)
- [ ] Exportar relatórios
- [ ] Ajuda/Onboarding

**Integrações:**
- [ ] Email provider (SendGrid, Mailgun)
- [ ] Storage (S3, Cloudinary) para anexos
- [ ] Analytics (Google Analytics)
- [ ] Error tracking (Sentry)

---

## FASE 7: AUDITORIA DE DOCUMENTAÇÃO

### 7.1 Documentação Técnica

#### README.md
```bash
cat /Users/jairneto/Desktop/ouvy_saas/README.md
```

**Checklist:**
- [ ] Descrição clara do projeto
- [ ] Tecnologias listadas
- [ ] Instruções de setup (local)
- [ ] Instruções de deploy
- [ ] Links para docs complementares
- [ ] Badges de status (CI, coverage)
- [ ] Screenshots/GIFs de demonstração

#### API Documentation (Swagger)
```bash
# Acessar: https://api.ouvy.com/swagger/
```

**Checklist:**
- [ ] Todos endpoints documentados
- [ ] Schemas de request/response
- [ ] Exemplos de uso
- [ ] Códigos de erro explicados
- [ ] Autenticação documentada

#### Arquivos .md em `/docs/`
```bash
ls -la /Users/jairneto/Desktop/ouvy_saas/docs/
```

**Checklist:**
- [ ] DEPLOYMENT_CHECKLIST.md atualizado
- [ ] SECURITY.md atualizado
- [ ] CHANGELOG.md mantido
- [ ] CONTRIBUTING.md (se open source)
- [ ] FAQ.md para devs

### 7.2 Comentários em Código

#### Backend
```bash
# Verificar docstrings
grep -rn "def \|class " apps/ | head -20

# Verificar se há docstrings
pylint --disable=all --enable=missing-docstring apps/
```

**Checklist:**
- [ ] Classes principais têm docstrings
- [ ] Métodos complexos têm docstrings
- [ ] Algoritmos explicados com comments

#### Frontend
```bash
# Verificar JSDoc
grep -rn "/\*\*" components/ hooks/
```

**Checklist:**
- [ ] Componentes principais têm JSDoc
- [ ] Funções complexas têm comments
- [ ] Props documentadas

### 7.3 Changelog

#### Manter histórico de mudanças
```bash
cat /Users/jairneto/Desktop/ouvy_saas/CHANGELOG.md
```

**Formato:**
```markdown
# Changelog

## [Unreleased]
- Feature XYZ

## [1.0.0] - 2026-01-14
### Added
- Sistema de multi-tenancy
- Integração Stripe

### Changed
- Atualizado Django para 6.0.1

### Fixed
- Bug em isolamento de tenants
```

---

## FASE 8: TESTES DE ACEITAÇÃO

### 8.1 Testes End-to-End

#### Cenário 1: Fluxo Completo de Signup → Feedback → Acompanhamento
```bash
# Script Cypress: e2e/complete-flow.spec.ts
```

**Steps:**
1. Acessar `/cadastro`
2. Preencher formulário (email, senha, empresa, subdomínio)
3. Verificar subdomínio disponível
4. Submeter
5. Verificar redirecionamento para `/dashboard`
6. Verificar KPIs zerados
7. Navegar para `/enviar` (público)
8. Preencher feedback
9. Submeter e copiar protocolo
10. Navegar para `/acompanhar`
11. Consultar protocolo
12. Verificar feedback exibido
13. Adicionar resposta
14. Voltar ao dashboard (autenticado)
15. Verificar feedback na lista
16. Atualizar status
17. Verificar timeline atualizada

**Checklist:**
- [ ] Fluxo completo funciona sem erros
- [ ] Todas transições de página OK
- [ ] Dados persistidos corretamente

#### Cenário 2: Fluxo de Pagamento
```bash
# Script: e2e/payment-flow.spec.ts
```

**Steps:**
1. Login
2. Navegar para `/precos`
3. Clicar em "Assinar Pro"
4. Redirecionar para Stripe Checkout
5. Preencher dados de teste
6. Confirmar pagamento
7. Redirecionar de volta (success)
8. Verificar banner de assinatura atualizado
9. Verificar status no dashboard

**Checklist:**
- [ ] Checkout Stripe abre
- [ ] Webhook recebe evento
- [ ] Status atualizado no DB
- [ ] Frontend reflete mudança

### 8.2 Testes de Usabilidade

#### Testar com Usuários Reais
```
# Recrutar 5 usuários beta
# Pedir para realizar tarefas:
1. Criar conta
2. Enviar feedback
3. Acompanhar protocolo
4. Navegar pelo dashboard
```

**Coletar Feedback:**
- [ ] Facilidade de uso (escala 1-5)
- [ ] Clareza das informações
- [ ] Problemas encontrados
- [ ] Sugestões de melhoria

### 8.3 Testes de Carga

#### Simular Múltiplos Usuários
```bash
# Instalar locust ou k6
pip install locust

# Criar script: locustfile.py
from locust import HttpUser, task, between

class OuvyUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(1)
    def list_feedbacks(self):
        self.client.get("/api/feedbacks/", headers={"Authorization": f"Token {self.token}"})
    
    @task(2)
    def create_feedback(self):
        self.client.post("/api/feedbacks/", json={
            "tipo": "sugestao",
            "descricao": "Load test"
        })

# Executar
locust -f locustfile.py --host=https://api.ouvy.com
```

**Metas:**
- [ ] 100 usuários simultâneos sem degradação
- [ ] 500 req/s sem erros
- [ ] Latência < 1s no p95

---

## CRITÉRIOS DE APROVAÇÃO

### 🟢 Go/No-Go para Produção

#### Critérios Obrigatórios (Bloqueadores)
- [ ] **Segurança:** Sem vulnerabilidades CRITICAL/HIGH
- [ ] **Funcional:** Todos fluxos core funcionando
- [ ] **Performance:** Lighthouse > 80 em todas métricas
- [ ] **Estabilidade:** Sem crashes em testes E2E
- [ ] **Deploy:** Build success em staging
- [ ] **Dados:** Backup strategy ativo
- [ ] **Documentação:** README + API docs completos

#### Critérios Desejáveis (Não-bloqueadores)
- [ ] **Testes:** Coverage > 80%
- [ ] **Performance:** API response < 500ms
- [ ] **UX:** Feedback de usuários beta positivo
- [ ] **Monitoria:** Logging + alertas configurados

### 🔴 Red Flags (Não Deployar)
- ❌ SECRET_KEY exposta no código
- ❌ DEBUG=True em produção
- ❌ SQL Injection vulnerável
- ❌ Dados vazando entre tenants
- ❌ Pagamento Stripe não funcionando
- ❌ Database sem backup

---

## PLANO DE REMEDIAÇÃO

### Template de Issue
```markdown
# [TIPO] Título do Problema

**Severidade:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Componente:** Backend / Frontend / Infra
**Descoberto em:** Fase X - Auditoria Y

## Descrição
[Descrever o problema encontrado]

## Impacto
[Impacto no usuário / sistema / segurança]

## Passos para Reproduzir
1. ...
2. ...

## Solução Proposta
[Como resolver]

## Checklist de Resolução
- [ ] Fix implementado
- [ ] Teste automatizado adicionado
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Merged para main
```

### Priorização

#### P0 - Crítico (Resolver Antes do Deploy)
- Vulnerabilidades de segurança
- Bugs que impedem funcionalidades core
- Vazamento de dados entre tenants
- Falhas de pagamento

#### P1 - Alto (Resolver em 1 Semana)
- Performance degradada
- Bugs não-bloqueadores
- Documentação faltante crítica

#### P2 - Médio (Resolver em 1 Mês)
- Melhorias de UX
- Refactoring de código
- Testes faltantes

#### P3 - Baixo (Backlog)
- Nice-to-have features
- Otimizações menores

---

## PRÓXIMOS PASSOS

### 1. Executar Auditoria
```bash
# Clone do checklist
cp docs/PLANO_AUDITORIA_COMPLETO.md docs/auditorias/AUDITORIA_2026-01-14.md

# Preencher cada item
# Documentar findings
# Criar issues para remediar
```

### 2. Sprint de Correções
```bash
# Criar branch de auditoria
git checkout -b audit/pre-production-fixes

# Resolver issues P0 e P1
# Commitar com mensagens descritivas
# Abrir PR com checklist de auditoria
```

### 3. Re-Teste
```bash
# Executar testes novamente
# Validar correções
# Atualizar documentação
```

### 4. Staging Deploy
```bash
# Deploy em ambiente de staging
# Testes finais
# Aprovação stakeholders
```

### 5. Production Deploy
```bash
# Seguir DEPLOYMENT_CHECKLIST.md
# Deploy backend (Railway)
# Deploy frontend (Vercel)
# Smoke tests em produção
# Monitoring 24h
```

---

## CONTATOS E RESPONSABILIDADES

| Papel | Nome | Responsabilidade |
|-------|------|-----------------|
| Tech Lead | [Nome] | Coordenar auditoria |
| Backend Lead | [Nome] | Auditoria backend + segurança |
| Frontend Lead | [Nome] | Auditoria frontend + UX |
| DevOps | [Nome] | Infraestrutura + deploy |
| QA Lead | [Nome] | Testes + validação |
| Product Owner | [Nome] | Aprovação final |

---

## ANEXOS

### A. Ferramentas e Comandos Úteis

```bash
# Backend
python manage.py check
python manage.py test --verbosity=2
python manage.py showmigrations
bandit -r apps/
safety check

# Frontend
npm run lint
npm run build
npm audit
npx lighthouse https://app.ouvy.com --view

# Git
git log --oneline --graph --all
git diff origin/main

# Railway
railway logs --tail
railway status

# Vercel
vercel logs
vercel inspect [deployment-url]
```

### B. Checklist de Segurança OWASP

[Link para OWASP Top 10 2023](https://owasp.org/Top10/)

### C. Referências
- Django Security: https://docs.djangoproject.com/en/5.0/topics/security/
- Next.js Best Practices: https://nextjs.org/docs/pages/building-your-application
- Stripe Integration: https://stripe.com/docs/payments/checkout
- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs

---

**Documento Criado em:** 14 de janeiro de 2026  
**Última Atualização:** 14 de janeiro de 2026  
**Versão:** 1.0.0  
**Status:** 🟡 Draft - Aguardando Execução

---

*Este plano de auditoria é um documento vivo e deve ser atualizado conforme o projeto evolui.*
