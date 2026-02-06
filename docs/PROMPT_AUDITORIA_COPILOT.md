# 🤖 PROMPT MASTER DE AUDITORIA - OUVIFY

## Prompt Completo para GitHub Copilot no VS Code

---

## CONTEXTO DO PROJETO

Você está auditando o **Ouvify**, uma plataforma SaaS White Label de canal de feedback de usuários (denúncias, reclamações, sugestões, elogios) com código de rastreio. O sistema é multi-tenant onde empresas-clientes pagam mensalidade para usar.

**Stack:**

- Backend: Python 3.11 + Django 5.1 + DRF + PostgreSQL + Celery + Redis
- Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Radix UI
- Pagamentos: Stripe
- Storage: Cloudinary
- Monitoramento: Sentry
- Deploy: Backend no Railway, Frontend no Vercel

---

## 🔍 PROMPT COMPLETO PARA AUDITORIA

```
Você é um auditor técnico especializado realizando uma auditoria completa do projeto Ouvify. Execute as seguintes verificações de forma sistemática:

## FASE 1: AUDITORIA DE SEGURANÇA [CRÍTICO]

### 1.1 Autenticação e Autorização
Analise os seguintes arquivos e verifique:
- `apps/backend/apps/tenants/jwt_views.py` - Implementação JWT
- `apps/backend/apps/tenants/logout_views.py` - Invalidação de tokens
- `apps/backend/apps/tenants/decorators.py` - Decorators de permissão
- `apps/backend/apps/core/middleware.py` - Middleware de tenant
- `apps/frontend/components/ProtectedRoute.tsx` - Proteção de rotas

Verifique:
□ Token JWT tem expiração curta (< 15 min)?
□ Refresh token implementado com rotação?
□ Blacklist de tokens para logout?
□ Isolamento multi-tenant em todas queries?
□ Rate limiting em endpoints de auth?

### 1.2 Validação e Sanitização
Analise:
- `apps/backend/apps/core/sanitizers.py`
- `apps/backend/apps/core/validators.py`
- `apps/frontend/lib/sanitize.ts`
- `apps/frontend/lib/validation.ts`

Verifique:
□ Todos inputs sanitizados antes de salvar?
□ DOMPurify usado para renderizar HTML?
□ Bleach usado no backend?
□ Validação de tipos de arquivo em uploads?
□ Limite de tamanho de uploads?

### 1.3 Headers de Segurança
Analise:
- `apps/backend/config/settings.py` (linhas 80-120)
- `apps/frontend/next.config.ts` (headers function)

Verifique:
□ HSTS habilitado com preload?
□ X-Frame-Options: DENY?
□ X-Content-Type-Options: nosniff?
□ CSP configurado corretamente?
□ Permissions-Policy restritivo?

### 1.4 Secrets e Configuração
Verifique:
□ Nenhum secret hardcoded no código (grep por API_KEY, SECRET, PASSWORD)
□ .env.example existe e documenta todas variáveis?
□ SECRET_KEY validada em produção?
□ DEBUG=False em produção?
□ ALLOWED_HOSTS restritivo?

### 1.5 LGPD/GDPR
Analise:
- `apps/backend/apps/consent/` - Gestão de consentimento
- `apps/backend/apps/core/lgpd_views.py` - Direitos do titular

Verifique:
□ Endpoint de exclusão de conta (/api/account/)?
□ Endpoint de exportação de dados (/api/export-data/)?
□ Consentimento registrado antes de coleta?
□ Logs não contêm dados sensíveis?
□ Anonimização implementada?

---

## FASE 2: AUDITORIA DE CÓDIGO

### 2.1 Backend - Estrutura e Padrões
Para cada app em `apps/backend/apps/`:

**feedbacks/**
- models.py: Verificar se Feedback herda de TenantAwareModel
- views.py: Verificar permissões em cada ViewSet
- serializers.py: Verificar validação de dados
- Verificar se signals estão documentados

**tenants/**
- models.py: Verificar Client e TeamMember
- Verificar limites de plano implementados
- Verificar feature gating funcionando

**billing/**
- Verificar integração Stripe
- Verificar webhooks de pagamento
- Verificar gestão de assinatura

**notifications/**
- Verificar push notifications
- Verificar email service

**webhooks/**
- Verificar assinatura e verificação
- Verificar retry logic

### 2.2 Frontend - Estrutura e Padrões
Verifique:
- Componentes sem props tipadas?
- Hooks com dependências incorretas?
- useEffect sem cleanup?
- Fetch sem tratamento de erro?
- Estados de loading faltantes?
- Componentes sem memo quando necessário?

### 2.3 Código Duplicado
Execute busca por:
- Funções de formatação duplicadas
- Componentes de UI similares
- Validadores repetidos
- Chamadas API duplicadas

### 2.4 Código Legado/Morto
Identifique:
- Arquivos sem imports (órfãos)
- Funções nunca chamadas
- Endpoints sem uso no frontend
- Componentes não renderizados

---

## FASE 3: VERIFICAÇÃO DE INTEGRIDADE

### 3.1 Correspondência Backend-Frontend
Para cada funcionalidade, verifique se existe:

| Funcionalidade | Endpoint Backend | Página/Componente Frontend | Status |
|----------------|------------------|---------------------------|--------|
| Registro Tenant | POST /api/register-tenant/ | /cadastro | ? |
| Login | POST /api/token/ | /login | ? |
| Enviar Feedback | POST /api/feedbacks/ | /enviar | ? |
| Consultar Protocolo | GET /api/feedbacks/consultar-protocolo/ | /acompanhar | ? |
| Dashboard | GET /api/feedbacks/ + /api/analytics/ | /dashboard | ? |
| Gestão Feedbacks | /api/feedbacks/{id}/ | /dashboard/feedbacks | ? |
| Responder Feedback | POST /api/feedbacks/responder-protocolo/ | Modal resposta | ? |
| Gestão Equipe | /api/team/members/ | /dashboard/equipe | ? |
| Convites | /api/team/invitations/ | /dashboard/equipe + /convite | ? |
| Configurações | PATCH /api/tenant-info/ | /dashboard/configuracoes | ? |
| Branding | POST /api/upload-branding/ | /dashboard/configuracoes | ? |
| Assinatura | /api/v1/billing/ | /dashboard/assinatura | ? |
| Webhooks | /api/v1/webhooks/ | /dashboard/configuracoes | ? |
| Audit Log | /api/auditlog/ | /dashboard/auditlog | ? |
| Relatórios | /api/analytics/ | /dashboard/relatorios | ? |
| Perfil | /api/auth/me/ | /dashboard/perfil | ? |
| Reset Senha | /api/password-reset/* | /recuperar-senha | ? |
| Admin Tenants | /api/admin/tenants/ | /admin | ? |

### 3.2 Rotas Quebradas
Verifique:
- Links internos apontando para rotas inexistentes
- Imports de componentes inexistentes
- Chamadas a endpoints inexistentes

---

## FASE 4: PERFORMANCE

### 4.1 Backend
Verifique:
□ Queries N+1 (usar django-debug-toolbar ou nplusone)
□ Índices nos campos mais consultados
□ Select_related/prefetch_related usado
□ Paginação implementada em listagens
□ Cache em endpoints frequentes

### 4.2 Frontend
Verifique:
□ Bundle size (next build --analyze)
□ Lazy loading de componentes
□ Imagens otimizadas (next/image)
□ Code splitting funcionando
□ Memoização onde necessário

---

## FASE 5: FUNCIONALIDADES MVP

Verifique se cada item está **100% funcional**:

### Para Usuário Final
□ Acessar página de envio de feedback por subdomínio
□ Selecionar tipo (denúncia/sugestão/elogio/reclamação)
□ Preencher formulário com validação
□ Anexar arquivos (se permitido pelo plano)
□ Receber código de protocolo
□ Consultar status pelo protocolo
□ Ver histórico de interações
□ Adicionar informações ao protocolo
□ Aceitar termos e consentimento LGPD

### Para Admin do Tenant
□ Fazer login com email/senha
□ Ver dashboard com métricas
□ Listar feedbacks com filtros
□ Ver detalhes de um feedback
□ Responder feedback
□ Alterar status
□ Alterar prioridade
□ Atribuir para membro da equipe
□ Adicionar notas internas
□ Ver timeline de interações
□ Usar templates de resposta
□ Gerenciar tags/categorias
□ Convidar membros para equipe
□ Definir roles (admin, operador)
□ Remover membros
□ Configurar logo
□ Configurar cores
□ Configurar favicon
□ Ver preview do branding
□ Exportar feedbacks (CSV/JSON)
□ Ver relatórios de analytics
□ Gerenciar assinatura
□ Fazer upgrade de plano
□ Cancelar assinatura
□ Configurar webhooks
□ Ver audit log
□ Alterar perfil
□ Alterar senha
□ Habilitar 2FA
□ Excluir conta
□ Exportar dados pessoais

### Para Super Admin
□ Listar todos os tenants
□ Ver status de cada tenant
□ Ativar/desativar tenant
□ Ver métricas globais

---

## SAÍDA ESPERADA

Gere um relatório estruturado com:

### 1. Sumário Executivo
- Score geral de maturidade (0-100)
- Top 5 problemas críticos
- Top 5 melhorias recomendadas

### 2. Relatório de Segurança
- Vulnerabilidades críticas (🔴)
- Vulnerabilidades médias (🟡)
- Vulnerabilidades baixas (🟢)
- Recomendações

### 3. Relatório de Código
- Duplicações encontradas
- Código legado identificado
- Sugestões de refatoração

### 4. Relatório de Integridade
- Funcionalidades completas ✅
- Funcionalidades parciais ⚠️
- Funcionalidades faltantes ❌

### 5. Relatório de Performance
- Gargalos identificados
- Otimizações sugeridas

### 6. Plano de Ação Priorizado
- Sprint 1: Correções críticas de segurança
- Sprint 2: Funcionalidades faltantes MVP
- Sprint 3: Performance e otimização
- Sprint 4: Documentação e polimento

### 7. Lista de Arquivos para Correção
Para cada arquivo que precisa de alteração, liste:
- Caminho do arquivo
- Problema identificado
- Correção sugerida
- Prioridade (Alta/Média/Baixa)
```

---

## 📚 PROMPT PARA DOCUMENTAÇÃO

```
Após a auditoria, gere a seguinte documentação:

## 1. README.md Principal
Crie um README.md completo na raiz do projeto com:
- Logo e badges
- Descrição do projeto
- Features principais
- Screenshots
- Arquitetura (diagrama mermaid)
- Tech stack
- Quick start
- Variáveis de ambiente
- Deploy
- Contribuição
- Licença

## 2. docs/INSTALACAO.md
Guia detalhado de instalação para desenvolvedores:
- Requisitos (Node, Python, PostgreSQL, Redis)
- Clone do repositório
- Setup do backend
- Setup do frontend
- Variáveis de ambiente
- Rodando migrações
- Criando superusuário
- Rodando em desenvolvimento
- Rodando testes
- Troubleshooting comum

## 3. docs/API.md
Documentação da API REST:
- Autenticação (JWT)
- Rate limits
- Endpoints organizados por recurso
- Exemplos de request/response
- Códigos de erro
- Webhooks

## 4. docs/GUIA_ADMIN.md
Tutorial para administradores de tenant:
- Primeiro acesso
- Configurando branding
- Gerenciando feedbacks
- Gerenciando equipe
- Usando templates
- Relatórios
- Exportação
- Configurações avançadas
- FAQ

## 5. docs/GUIA_USUARIO.md
Tutorial para usuários finais:
- Como enviar um feedback
- Tipos de feedback
- Acompanhando seu protocolo
- Adicionando informações
- Privacidade e segurança

## 6. docs/DEPLOY.md
Guia de deploy:
- Configurando Railway (backend)
- Configurando Vercel (frontend)
- Variáveis de ambiente em produção
- Domínio customizado
- SSL/HTTPS
- Monitoramento
- Backup

## 7. docs/SEGURANCA.md
Documentação de segurança:
- Práticas de segurança implementadas
- Conformidade LGPD
- Política de privacidade template
- Termos de uso template
- Relatório de incidentes

## 8. CHANGELOG.md
Histórico de versões seguindo Keep a Changelog:
- [Unreleased]
- [1.0.0] - Data do MVP
```

---

## 🎯 EXECUÇÃO DA AUDITORIA

### Ordem Recomendada de Execução:

1. **Executar auditoria de segurança primeiro** - é crítico
2. **Corrigir vulnerabilidades críticas** antes de continuar
3. **Executar auditoria de código** para entender a base
4. **Verificar integridade** para mapear gaps
5. **Verificar performance** para otimizações
6. **Implementar funcionalidades faltantes**
7. **Gerar documentação** com projeto estável
8. **Review final** antes do go-live

### Comandos Úteis Durante Auditoria:

```bash
# Backend - Verificar segurança
cd apps/backend
pip install bandit safety
bandit -r apps/ -f json -o security_report.json
safety check --json > dependency_report.json

# Backend - Verificar cobertura de testes
pytest --cov=apps --cov-report=html

# Frontend - Verificar build e bundle
cd apps/frontend
npm run build
npm run analyze

# Frontend - Verificar lint
npm run lint

# Verificar secrets expostos
git log -p | grep -i "password\|secret\|api_key\|token" | head -50

# Verificar arquivos grandes
find . -type f -size +1M | grep -v node_modules | grep -v .git
```

---

## ✅ CRITÉRIOS DE ACEITE DA AUDITORIA

A auditoria estará completa quando:

1. [ ] Nenhuma vulnerabilidade crítica de segurança
2. [ ] Todas as funcionalidades MVP funcionando
3. [ ] Cobertura de testes > 70% backend, > 60% frontend
4. [ ] Build sem erros em ambos projetos
5. [ ] Deploy funcionando em staging
6. [ ] Documentação completa gerada
7. [ ] Performance aceitável (LCP < 2.5s, FID < 100ms)
8. [ ] LGPD em conformidade

---

_Use este prompt como guia para realizar uma auditoria completa e sistemática do projeto Ouvify._
