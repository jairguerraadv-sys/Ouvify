# 📋 PLANO DE AÇÃO PRIORIZADO - OUVIFY SAAS
**Backlog Ágil para Finalização do MVP**

**Data de Criação:** 3 de Fevereiro de 2026  
**Status:** 🚧 EM ANDAMENTO  
**Progresso Geral:** 78% completo

---

## 📊 RESUMO EXECUTIVO

**Total de Issues:** 35 mapeados  
**Bloqueadores (P0):** 5 issues - 108 horas  
**Alta Prioridade (P1):** 9 issues - 86 horas  
**Média Prioridade (P2):** 10 issues - 64 horas  
**Baixa Prioridade (P3):** 11 issues - 48 horas  

**Esforço Total Estimado:** ~306 horas (~8 semanas para 1 dev full-time)

---

## 🔴 P0 - BLOQUEADORES CRÍTICOS
**Deve ser resolvido ANTES do lançamento**

### ISSUE-001: Frontend Sem Testes Unitários
**Prioridade:** 🔴 P0 - CRÍTICO  
**Esforço:** 40 horas  
**Responsável:** Frontend Dev (Senior)  
**Dependências:** Nenhuma

**Descrição:**
O frontend possui 166 arquivos TS/TSX sem nenhum teste unitário. Jest e Testing Library estão configurados mas a pasta de testes está vazia. Isso representa alto risco de bugs em produção.

**Localização:**
- `apps/frontend/` - 166 arquivos TS/TSX
- `apps/frontend/jest.config.ts` - configurado mas não usado
- `apps/frontend/jest.setup.ts` - configurado mas não usado

**Impacto:**
- CRÍTICO - Bugs em produção são inevitáveis
- Refactoring impossível sem quebrar funcionalidades
- Regressões não detectadas

**Solução Proposta:**
1. Criar testes para componentes críticos:
   - [ ] `app/cadastro/page.tsx` - formulário de cadastro
   - [ ] `app/login/page.tsx` - formulário de login
   - [ ] `app/dashboard/page.tsx` - dashboard principal
   - [ ] `app/dashboard/feedbacks/page.tsx` - listagem de feedbacks
   - [ ] `app/enviar/page.tsx` - formulário público
   - [ ] `components/forms/FeedbackForm.tsx` (se existir)
   - [ ] `components/dashboard/StatsCard.tsx` (se existir)

2. Testar hooks customizados:
   - [ ] `hooks/useAuth.ts` (se existir)
   - [ ] `hooks/useFeedbacks.ts` (se existir)
   - [ ] `hooks/useToast.ts` (se existir)

3. Testar utilities:
   - [ ] `lib/api.ts` - funções de API
   - [ ] `lib/utils.ts` - helpers

4. Configurar cobertura mínima:
   ```json
   {
     "collectCoverageFrom": [
       "app/**/*.{ts,tsx}",
       "components/**/*.{ts,tsx}",
       "hooks/**/*.{ts,tsx}",
       "lib/**/*.{ts,tsx}"
     ],
     "coverageThreshold": {
       "global": {
         "statements": 60,
         "branches": 50,
         "functions": 60,
         "lines": 60
       }
     }
   }
   ```

**Critérios de Aceitação:**
- [ ] Mínimo 60% de cobertura de código
- [ ] Todos os componentes críticos testados
- [ ] Todos os hooks customizados testados
- [ ] CI roda testes automaticamente
- [ ] Testes passam em 100%

**Riscos:**
- Baixo - tecnologia madura (Jest + Testing Library)

**Notas:**
Considerar usar Storybook em paralelo para documentação visual dos componentes.

---

### ISSUE-002: Landing Page Incompleta
**Prioridade:** 🔴 P0 - CRÍTICO  
**Esforço:** 24 horas  
**Responsável:** Frontend Dev + UX Designer  
**Dependências:** Nenhuma

**Descrição:**
A página de marketing (`/`) existe mas não possui elementos de conversão necessários para transformar visitantes em clientes. Sem isso, zero aquisições orgânicas.

**Localização:**
- `apps/frontend/app/(marketing)/page.tsx`
- `apps/frontend/app/(marketing)/layout.tsx`

**Impacto:**
- CRÍTICO - Sem conversões, o produto não vende
- SEO prejudicado sem conteúdo rico
- Bounce rate alto

**Solução Proposta:**

1. **Hero Section:**
   ```tsx
   - [ ] Headline persuasivo
   - [ ] Subheadline explicativo
   - [ ] CTA principal: "Começar Grátis por 14 Dias"
   - [ ] CTA secundário: "Ver Demo"
   - [ ] Imagem/vídeo do produto
   - [ ] Trust badges (LGPD compliant, SSL, etc.)
   ```

2. **Features Section:**
   ```tsx
   - [ ] 6-8 features principais com ícones
   - [ ] Benefícios orientados a resultados
   - [ ] Screenshots do dashboard
   ```

3. **Pricing Section:**
   ```tsx
   - [ ] Tabela de comparação de planos
   - [ ] Destaque do plano mais popular
   - [ ] Toggle mensal/anual (se houver desconto)
   - [ ] CTAs para cada plano
   ```

4. **Social Proof:**
   ```tsx
   - [ ] Depoimentos de clientes (3-5)
   - [ ] Logos de empresas usando (se houver)
   - [ ] Métricas (ex: "500+ feedbacks gerenciados hoje")
   ```

5. **FAQ:**
   ```tsx
   - [ ] 8-10 perguntas frequentes
   - [ ] Accordion interativo
   - [ ] Link para documentação completa
   ```

6. **Footer:**
   ```tsx
   - [ ] Links úteis (Produto, Preços, Docs, Blog)
   - [ ] Links legais (Privacidade, Termos, LGPD)
   - [ ] Contato e redes sociais
   - [ ] Copyright e informações da empresa
   ```

**Critérios de Aceitação:**
- [ ] Lighthouse Performance Score >90
- [ ] Lighthouse SEO Score >95
- [ ] Mobile-first responsive
- [ ] Meta tags OG para compartilhamento social
- [ ] Schema.org markup para SEO
- [ ] GTM/Analytics configurado
- [ ] Taxa de conversão >2% (meta inicial)

**Riscos:**
- Baixo - design pode ser iterado pós-lançamento

**Notas:**
Considerar A/B testing de headlines e CTAs após lançamento.

---

### ISSUE-003: Email Templates Faltantes
**Prioridade:** 🔴 P0 - CRÍTICO  
**Esforço:** 16 horas  
**Responsável:** Backend Dev + Designer  
**Dependências:** Nenhuma

**Descrição:**
Sistema de email está configurado (SMTP/SendGrid) mas não há templates HTML profissionais. Comunicação com clientes está quebrada.

**Localização:**
- `apps/backend/templates/emails/` - **PASTA NÃO EXISTE**
- `apps/backend/config/settings.py` - EMAIL_BACKEND configurado
- Criar estrutura completa de templates

**Impacto:**
- CRÍTICO - Emails essenciais não são enviados
- Experiência do usuário quebrada
- Perda de confiança na marca

**Solução Proposta:**

Criar pasta `apps/backend/templates/emails/` com estrutura:

```
emails/
├── base/
│   ├── base.html (template base)
│   └── header.html (header com logo)
├── auth/
│   ├── welcome.html (boas-vindas)
│   ├── password_reset.html (recuperação)
│   └── email_verification.html (se houver)
├── team/
│   ├── invitation.html (convite de equipe)
│   ├── invitation_accepted.html (confirmação)
│   └── member_removed.html (remoção)
├── feedbacks/
│   ├── new_feedback.html (novo feedback para empresa)
│   ├── feedback_updated.html (atualização para usuário)
│   ├── feedback_assigned.html (atribuição para membro)
│   └── feedback_resolved.html (resolução)
├── billing/
│   ├── subscription_confirmed.html (assinatura confirmada)
│   ├── payment_success.html (pagamento ok)
│   ├── payment_failed.html (falha no pagamento)
│   ├── invoice.html (fatura)
│   └── trial_ending.html (trial acabando)
└── newsletter/
    └── monthly_summary.html (resumo mensal)
```

**Requisitos de Design:**
- [ ] Responsivo (mobile-first)
- [ ] Branding do tenant (logo, cores primárias)
- [ ] Footer com unsubscribe (LGPD)
- [ ] Botões CTA visíveis
- [ ] Fallback para texto plano
- [ ] Preheader text para preview
- [ ] Inline CSS (compatibilidade email clients)

**Template Base (base.html):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ subject }}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Inter', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <!-- Header com logo do tenant -->
        <tr>
            <td style="background-color: {{ tenant.cor_primaria }}; padding: 20px;">
                <img src="{{ tenant.logo }}" alt="{{ tenant.nome }}" height="40">
            </td>
        </tr>
        
        <!-- Conteúdo -->
        <tr>
            <td style="padding: 40px 20px;">
                {% block content %}{% endblock %}
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f3f4f6; padding: 20px; font-size: 12px; color: #6b7280;">
                <p>Este email foi enviado por {{ tenant.nome }}</p>
                <p><a href="{{ unsubscribe_url }}">Cancelar recebimento</a> | <a href="{{ privacy_url }}">Política de Privacidade</a></p>
            </td>
        </tr>
    </table>
</body>
</html>
```

**Integração no Código:**
```python
# apps/backend/apps/core/email_utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def send_templated_email(
    tenant,
    to_email,
    subject,
    template_name,
    context
):
    context.update({
        'tenant': tenant,
        'unsubscribe_url': f"{tenant.get_url()}/unsubscribe",
        'privacy_url': f"{tenant.get_url()}/privacidade"
    })
    
    html_content = render_to_string(
        f'emails/{template_name}',
        context
    )
    text_content = strip_tags(html_content)  # fallback
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=f"{tenant.nome} <noreply@ouvify.com>",
        to=[to_email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()
```

**Gatilhos a Implementar:**
```python
# Após criar tenant
signal: post_save on Client
→ send welcome email

# Após criar convite
signal: post_save on TeamInvitation
→ send invitation email

# Após criar feedback
signal: post_save on Feedback (created=True)
→ send new_feedback email to team

# Após atualizar feedback
signal: post_save on Feedback (update)
→ send feedback_updated email to autor

# Após pagamento Stripe
webhook: invoice.payment_succeeded
→ send payment_success email
```

**Critérios de Aceitação:**
- [ ] Todos os 12+ templates criados
- [ ] Design responsivo testado em 5+ email clients
- [ ] Personalização por tenant funcional
- [ ] Gatilhos automáticos implementados
- [ ] Unsubscribe funcional (LGPD)
- [ ] Taxa de entrega >95% (monitorar SendGrid)

**Riscos:**
- Médio - compatibilidade entre email clients
- Baixo - personalização por tenant pode ter edge cases

**Notas:**
Considerar usar MJML ou Foundation for Emails para facilitar responsividade.

---

### ISSUE-004: Fluxo de Onboarding Inexistente
**Prioridade:** 🔴 P0 - CRÍTICO  
**Esforço:** 20 horas  
**Responsável:** Frontend Dev  
**Dependências:** ISSUE-003 (email de boas-vindas)

**Descrição:**
Cliente cadastra empresa mas não recebe orientação sobre como usar o sistema. Alta taxa de abandono esperada sem onboarding guiado.

**Localização:**
- `apps/frontend/app/dashboard/page.tsx` - primeiro acesso
- `apps/frontend/lib/driver-tour.ts` - **CRIAR**
- Driver.js já está instalado em `package.json` mas não usado

**Impacto:**
- CRÍTICO - Usuários abandonam por não entender o sistema
- Support tickets altos
- Baixa adoção de features

**Solução Proposta:**

1. **Setup Wizard (Primeira Vez):**
   Criar componente `<OnboardingWizard>` com 5 passos:

   **Passo 1: Upload de Logo e Cores**
   ```tsx
   - [ ] Upload de logo (drag & drop)
   - [ ] Color picker para cor primária
   - [ ] Preview em tempo real
   - [ ] "Pular por enquanto" opcional
   ```

   **Passo 2: Criar Primeira Categoria**
   ```tsx
   - [ ] Input para nome da categoria (ex: "Recursos Humanos")
   - [ ] Sugestões pré-definidas (RH, TI, Financeiro, etc.)
   - [ ] "Adicionar mais depois" opcional
   ```

   **Passo 3: Adicionar Membro da Equipe**
   ```tsx
   - [ ] Form de convite (email + role)
   - [ ] Explicação dos roles (Admin, Manager, Agent)
   - [ ] "Trabalho sozinho por enquanto" opcional
   ```

   **Passo 4: Testar Envio de Feedback**
   ```tsx
   - [ ] Botão "Enviar Feedback Demo"
   - [ ] Abre modal simulando formulário público
   - [ ] Gera protocolo de teste
   - [ ] Mostra como aparece no dashboard
   ```

   **Passo 5: Consultar Protocolo**
   ```tsx
   - [ ] Explica onde compartilhar link público
   - [ ] Mostra página de acompanhamento
   - [ ] "Concluir Setup" → redireciona para dashboard
   ```

2. **Tour Guiado (Driver.js):**
   Após wizard, tour rápido do dashboard:

   ```typescript
   // lib/driver-tour.ts
   import { driver } from "driver.js";
   import "driver.js/dist/driver.css";

   export const dashboardTour = driver({
     showProgress: true,
     steps: [
       {
         element: "#stats-cards",
         popover: {
           title: "📊 Métricas em Tempo Real",
           description: "Acompanhe total de feedbacks, por tipo e SLA",
           position: "bottom"
         }
       },
       {
         element: "#feedbacks-list",
         popover: {
           title: "💬 Lista de Feedbacks",
           description: "Todos os feedbacks recebidos aparecem aqui",
           position: "top"
         }
       },
       {
         element: "#search-bar",
         popover: {
           title: "🔍 Busca Rápida",
           description: "Encontre feedbacks por protocolo ou palavra-chave",
           position: "bottom"
         }
       },
       {
         element: "#team-menu",
         popover: {
           title: "👥 Equipe",
           description: "Gerencie membros e convites",
           position: "left"
         }
       },
       {
         element: "#settings-menu",
         popover: {
           title: "⚙️ Configurações",
           description: "Personalize cores, logo e integrações",
           position: "left"
         }
       }
     ]
   });
   ```

3. **Checklist de Tarefas (Dashboard):**
   Componente `<OnboardingChecklist>` sempre visível até completar:

   ```tsx
   const tasks = [
     { id: 1, title: "Upload logo", done: !!tenant.logo },
     { id: 2, title: "Personalizar cores", done: tenant.cor_primaria !== '#3B82F6' },
     { id: 3, title: "Criar categorias", done: tags.length > 0 },
     { id: 4, title: "Adicionar membro", done: teamMembers.length > 1 },
     { id: 5, title: "Receber 1º feedback", done: feedbacks.length > 0 },
     { id: 6, title: "Responder 1º feedback", done: feedbacks.some(f => f.resposta_empresa) }
   ];

   const progress = tasks.filter(t => t.done).length / tasks.length * 100;
   ```

4. **Empty States Educativos:**
   Quando não há dados, mostrar ilustração + CTA:

   ```tsx
   // Sem feedbacks
   <EmptyState
     icon={<Inbox />}
     title="Nenhum feedback ainda"
     description="Compartilhe seu link de feedback para começar a receber"
     cta={{
       label: "Copiar Link de Feedback",
       action: copyPublicLink
     }}
   />

   // Sem membros de equipe
   <EmptyState
     icon={<Users />}
     title="Você está sozinho"
     description="Convide sua equipe para colaborar"
     cta={{
       label: "Convidar Membro",
       action: openInviteModal
     }}
   />
   ```

5. **Tooltips Contextuais:**
   Adicionar tooltips informativos em elementos não-óbvios usando `@radix-ui/react-tooltip` (já instalado).

**Persistência de Estado:**
```typescript
// hooks/useOnboarding.ts
export function useOnboarding() {
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setOnboardingStep(1); // Iniciar wizard
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setOnboardingStep(null);
  };

  return { onboardingStep, completeOnboarding };
}
```

**Critérios de Aceitação:**
- [ ] Wizard aparece no primeiro acesso
- [ ] Todos os 5 passos funcionais
- [ ] Tour guiado roda após wizard
- [ ] Checklist persiste até completar
- [ ] Empty states educativos em todas as listas vazias
- [ ] Pode ser reaberto via "Ajuda > Tour Guiado"
- [ ] Tempo médio de onboarding <10min

**Riscos:**
- Baixo - Driver.js é biblioteca madura

**Notas:**
Adicionar link "Pular Tutorial" para usuários experientes.

---

### ISSUE-005: Documentação de Deploy Faltante
**Prioridade:** 🔴 P0 - CRÍTICO  
**Esforço:** 8 horas  
**Responsável:** DevOps / Tech Lead  
**Dependências:** Nenhuma

**Descrição:**
Não há documentação de como fazer deploy do projeto. Isso é risco operacional crítico se houver necessidade de deploy emergencial ou rollback.

**Localização:**
- `/docs/DEPLOYMENT.md` - **NÃO EXISTE**
- Criar documentação completa

**Impacto:**
- CRÍTICO - Equipe não consegue fazer deploy em emergência
- Onboarding de novos devs lento
- Risco de configuração incorreta em produção

**Solução Proposta:**

Criar `/docs/DEPLOYMENT.md` com estrutura completa:

```markdown
# 🚀 GUIA DE DEPLOY - OUVIFY SAAS

## 📋 Pré-requisitos

### Contas Necessárias
- [x] GitHub (repositório do projeto)
- [x] Railway (backend + PostgreSQL + Redis)
- [x] Vercel (frontend)
- [x] Cloudinary (uploads de imagens)
- [x] Stripe (pagamentos)
- [x] SendGrid (emails)
- [x] Sentry (monitoring)

### Ferramentas Locais
- Node.js 18+ (LTS)
- Python 3.11+
- Git
- Railway CLI (opcional)
- Vercel CLI (opcional)

---

## 🔧 PARTE 1: Setup do Backend (Railway)

### 1.1 Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. New Project > Deploy from GitHub repo
3. Selecione `Ouvify` repositório
4. Railway detectará automaticamente via `nixpacks.toml`

### 1.2 Adicionar PostgreSQL

1. No projeto Railway, clique em **New**
2. Selecione **Database > PostgreSQL**
3. Railway gerará automaticamente:
   - `DATABASE_URL` (público)
   - `DATABASE_PRIVATE_URL` (rede privada - USAR ESTE)

### 1.3 Adicionar Redis

1. Clique em **New > Database > Redis**
2. Railway gerará:
   - `REDIS_URL`

### 1.4 Configurar Variáveis de Ambiente

No serviço do backend, adicionar:

```bash
# Django
SECRET_KEY=<gerar-com-comando-abaixo>
DEBUG=False
ALLOWED_HOSTS=ouvify-production.up.railway.app,api.seudominio.com
DJANGO_SETTINGS_MODULE=config.settings

# Database (automático)
DATABASE_PRIVATE_URL=<railway-gera>
DATABASE_URL=<railway-gera>

# Redis (automático)
REDIS_URL=<railway-gera>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<seu-cloud-name>
CLOUDINARY_API_KEY=<sua-api-key>
CLOUDINARY_API_SECRET=<seu-api-secret>

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx

# SendGrid
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>
DEFAULT_FROM_EMAIL=noreply@ouvify.com

# Sentry
SENTRY_DSN=https://xxx@oxx.ingest.sentry.io/xxx

# CORS (domínio do frontend)
CORS_ALLOWED_ORIGINS=https://app.ouvify.com,https://ouvify.vercel.app

# Frontend URL
FRONTEND_URL=https://app.ouvify.com
```

**Gerar SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 1.5 Executar Migrações

Via Railway Dashboard > Service > Deploy Logs, aguardar build.

Após deploy, abrir Terminal (Railway CLI ou dashboard):

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### 1.6 Configurar Domínio Customizado

1. Settings > Networking > Public Networking
2. Generate Domain → `ouvify-production.up.railway.app`
3. Ou adicionar domínio customizado:
   - Add Custom Domain: `api.ouvify.com`
   - Configurar DNS:
     ```
     CNAME api.ouvify.com → ouvify-production.up.railway.app
     ```

### 1.7 Verificar Health Checks

1. Acesse `https://api.ouvify.com/health/`
2. Deve retornar `{"status": "healthy"}`

---

## 🎨 PARTE 2: Setup do Frontend (Vercel)

### 2.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. New Project > Import Git Repository
3. Selecione `Ouvify` repositório
4. Root Directory: `apps/frontend`
5. Framework Preset: **Next.js** (auto-detectado)

### 2.2 Configurar Variáveis de Ambiente

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.ouvify.com
NEXT_PUBLIC_API_BASE_URL=https://api.ouvify.com/api

# Stripe (pública)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=<sentry-auth-token>

# Feature Flags (opcional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=false
```

### 2.3 Configurar Domínio

1. Settings > Domains
2. Add Domain: `app.ouvify.com`
3. Configurar DNS:
   ```
   CNAME app.ouvify.com → cname.vercel-dns.com
   ```
4. Vercel configurará SSL automaticamente (Let's Encrypt)

### 2.4 Verificar Deploy

1. Acesse `https://app.ouvify.com`
2. Landing page deve carregar
3. Testar fluxo de cadastro → login

---

## 🔄 PARTE 3: Configurações Pós-Deploy

### 3.1 Configurar Stripe Webhook

1. Dashboard Stripe > Developers > Webhooks
2. Add Endpoint: `https://api.ouvify.com/api/tenants/webhook/`
3. Events to send:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar Webhook Secret e adicionar em Railway:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### 3.2 Configurar SendGrid

1. Criar conta [SendGrid](https://sendgrid.com)
2. Create API Key (Full Access)
3. Adicionar em Railway: `EMAIL_HOST_PASSWORD=<api-key>`
4. Verificar domínio de envio:
   - Settings > Sender Authentication
   - Authenticate Your Domain
   - Configurar DNS TXT records

### 3.3 Configurar Cloudinary

1. Dashboard Cloudinary > Settings
2. Copiar credenciais e adicionar em Railway

### 3.4 Configurar Sentry

1. Criar projeto em [sentry.io](https://sentry.io)
2. Copiar DSN
3. Adicionar em Railway (backend) e Vercel (frontend)

---

## 🧪 PARTE 4: Testes Pós-Deploy

### Checklist de Validação

#### Backend
- [ ] `GET /health/` retorna 200
- [ ] `GET /ready/` retorna 200
- [ ] `POST /api/token/` (login) funciona
- [ ] `GET /api/tenant-info/` retorna dados
- [ ] Django Admin acessível `/painel-admin-ouvify-2026/`

#### Frontend
- [ ] Landing page carrega
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Dashboard carrega após login
- [ ] Consulta de protocolo funciona (página pública)

#### Integrações
- [ ] Upload de imagem (Cloudinary) funciona
- [ ] Email de recuperação de senha chega
- [ ] Checkout Stripe redireciona corretamente
- [ ] Webhook Stripe é recebido (ver logs Railway)

#### Performance
- [ ] Lighthouse Score >90 (frontend)
- [ ] Response time API <200ms (dashboard Sentry)
- [ ] Sem erros no Sentry

---

## 🚨 PARTE 5: Rollback e Recovery

### Rollback no Railway

1. Dashboard > Service > Deployments
2. Selecionar deploy anterior
3. **Redeploy** (3 pontos > Redeploy)
4. Aguardar deployment

### Rollback no Vercel

1. Dashboard > Project > Deployments
2. Deployment anterior > **Promote to Production**

### Backup do Banco de Dados

Railway faz backup automático, mas para backup manual:

```bash
# Exportar
railway run pg_dump $DATABASE_PRIVATE_URL > backup.sql

# Restaurar
railway run psql $DATABASE_PRIVATE_URL < backup.sql
```

### Logs de Erro

**Backend (Railway):**
```bash
railway logs --service=backend
```

**Frontend (Vercel):**
```bash
vercel logs <deployment-url>
```

**Ou via Sentry Dashboard.**

---

## 📊 PARTE 6: Monitoring

### Métricas a Monitorar

**Railway Dashboard:**
- CPU/Memory usage
- Request count
- Error rate
- Database connections

**Vercel Analytics:**
- Page views
- Web Vitals (LCP, FID, CLS)
- Deployment frequency
- Build time

**Sentry:**
- Error rate
- Performance (traces)
- Releases

### Alertas Recomendados

- Error rate >5% → Slack/Email
- Response time >1s → Slack/Email
- CPU >80% por >5min → Slack/Email
- Disk usage >90% → Slack/Email

---

## 🔐 PARTE 7: Security Checklist

Antes de ir para produção:

- [ ] SECRET_KEY único e seguro
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS restritivo (apenas frontend)
- [ ] HTTPS obrigatório
- [ ] Stripe em modo LIVE
- [ ] Admin Django em URL obscura
- [ ] Rate limiting ativado
- [ ] Backups automáticos configurados
- [ ] Sentry configurado
- [ ] CSP headers ativos
- [ ] Variáveis sensíveis nunca commitadas

---

## 📝 PARTE 8: Manutenção

### Deploy de Nova Versão

**Automático (CI/CD):**
- Push para `main` → Railway e Vercel deployam automaticamente

**Manual (emergência):**

```bash
# Backend (Railway)
git push origin main
# Railway detecta e deploya

# Frontend (Vercel)
cd apps/frontend
vercel --prod
```

### Executar Migrações em Produção

```bash
railway run python manage.py migrate
```

### Acessar Console em Produção

```bash
# Railway Shell
railway run python manage.py shell

# Ou via dashboard: Service > Shell
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Database connection failed"

- Verificar `DATABASE_PRIVATE_URL` em Railway
- Verificar health do PostgreSQL service

### Erro: "CORS origin not allowed"

- Verificar `CORS_ALLOWED_ORIGINS` em Railway
- Adicionar domínio do Vercel

### Erro: "Stripe webhook signature invalid"

- Verificar `STRIPE_WEBHOOK_SECRET` em Railway
- Recriar webhook no Stripe Dashboard

### Erro: "Static files not found"

```bash
railway run python manage.py collectstatic --noinput
```

### Frontend não conecta com API

- Verificar `NEXT_PUBLIC_API_URL` no Vercel
- Testar endpoint diretamente no browser

---

## 📞 SUPORTE

**Em caso de problemas críticos:**
- 🔴 P0: Contatar time de ops imediatamente
- 🟡 P1: Abrir issue no GitHub
- 🟢 P2+: Agendar fix no próximo sprint

**Contatos:**
- DevOps: devops@ouvify.com
- Tech Lead: tech@ouvify.com
- On-call: Slack #ouvify-alerts
```

**Critérios de Aceitação:**
- [ ] Documento `/docs/DEPLOYMENT.md` criado
- [ ] Todos os passos testados em ambiente de staging
- [ ] Pode ser seguido por dev junior sem ajuda
- [ ] Screenshots/GIFs para passos visuais
- [ ] Troubleshooting cobre 90% dos erros comuns

**Riscos:**
- Baixo - é documentação

**Notas:**
Manter atualizado conforme infraestrutura evoluir.

---

## 🎯 RESUMO P0

**Total de Esforço P0:** 108 horas (~2.7 semanas para 1 dev)  
**Recomendação:** Dividir entre 2 devs para completar em 1.5 semanas

**Dependências:**
```
ISSUE-001 (Testes) ─────────────────► Pode rodar em paralelo
                                      │
ISSUE-002 (Landing) ────────────────► Pode rodar em paralelo
                                      │
ISSUE-003 (Emails) ──────┐           │
                         ▼           │
ISSUE-004 (Onboarding) ◄─┘           │
                                      │
ISSUE-005 (Deploy Docs) ─────────────┘ Pode rodar em paralelo
```

**Após concluir P0:** Sistema está pronto para **BETA FECHADO** com 5-10 clientes selecionados.

---

Continue lendo para P1 (Alta Prioridade) →
