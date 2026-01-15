# 📋 GUIA COMPLETO: PRODUTO OUVY - SISTEMA DE FEEDBACKS/DENÚNCIAS

**Data:** 14/01/2026  
**Versão:** 1.0  

---

## 🎯 VISÃO GERAL DO PRODUTO

O **Ouvy** é uma plataforma SaaS de **Ouvidoria Digital** para empresas gerenciarem:
- 🚨 **Denúncias** (compliance, ética, assédio)
- 💡 **Sugestões** (melhorias, ideias)
- 😞 **Reclamações** (problemas, insatisfações)
- ⭐ **Elogios** (reconhecimento, feedbacks positivos)

**Diferencial:** Sistema multi-tenant, anônimo opcional, LGPD compliant, com protocolo de acompanhamento.

---

## 📊 ARQUITETURA DO PRODUTO

### Fluxo Completo:

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO FINAL (PÚBLICO)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PÁGINA DE ENVIO: /enviar                                   │
│  - Formulário público (sem login)                           │
│  - Campos: tipo, título, descrição, email (opcional)        │
│  - Opção de anonimato                                       │
│  - Gera protocolo único (ex: FB-2026-ABC123)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ POST /api/feedbacks/
                            │
┌─────────────────────────────────────────────────────────────┐
│  BACKEND DJANGO (Railway)                                   │
│  - Cria registro no banco com tenant_id                     │
│  - Gera protocolo único                                     │
│  - Notifica responsáveis (futuro: email)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PÁGINA DE ACOMPANHAMENTO: /acompanhar                     │
│  - Consulta pública (sem login)                             │
│  - Input: código do protocolo                               │
│  - Retorna: status, histórico, respostas públicas          │
│  - Permite enviar mensagens adicionais                      │
└─────────────────────────────────────────────────────────────┘

                            ↕

┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD ADMIN: /dashboard/feedbacks                     │
│  - Acesso restrito (login obrigatório)                     │
│  - Lista todos feedbacks do tenant                          │
│  - Filtros: status, tipo, busca                             │
│  - Ações: visualizar, responder, mudar status, arquivar    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 ROTAS E PÁGINAS

### **1. PÁGINAS PÚBLICAS (Frontend)**

#### `/enviar` - Envio de Feedback/Denúncia
**Propósito:** Página principal do produto - formulário público de envio

**Características:**
- ✅ Acesso público (sem login)
- ✅ Multi-idioma preparado
- ✅ Tipos: Denúncia, Sugestão, Reclamação, Elogio
- ✅ Anonimato opcional
- ✅ Sanitização de inputs (XSS protection)
- ✅ Validação client-side
- ✅ Gera protocolo único ao enviar
- ✅ Mostra card de sucesso com protocolo

**URL de acesso:**
```
https://ouvy-frontend-[tenant].vercel.app/enviar
```

**Campos do formulário:**
```typescript
{
  tipo: 'denuncia' | 'sugestao' | 'reclamacao' | 'elogio',
  titulo: string,           // 5-200 caracteres
  descricao: string,        // min 10 caracteres
  anonimo: boolean,         // checkbox
  email_contato: string     // obrigatório se não anônimo
}
```

**Endpoint chamado:**
```
POST /api/feedbacks/
```

---

#### `/acompanhar` - Consulta de Protocolo
**Propósito:** Página pública para acompanhar status de feedbacks enviados

**Características:**
- ✅ Acesso público (sem login)
- ✅ Rate limiting (proteção contra brute force)
- ✅ Busca por código de protocolo
- ✅ Mostra histórico de interações
- ✅ Permite enviar mensagens adicionais
- ✅ Cooldown de 60s após muitas tentativas

**URL de acesso:**
```
https://ouvy-frontend-[tenant].vercel.app/acompanhar
```

**Endpoint chamado:**
```
GET /api/feedbacks/consultar-protocolo/?codigo=FB-2026-ABC123
```

**Informações exibidas:**
- Status atual (novo, em análise, resolvido, etc)
- Data de criação
- Tipo de manifestação
- Histórico de interações públicas
- Respostas da equipe

---

### **2. PÁGINAS ADMINISTRATIVAS (Dashboard)**

#### `/dashboard/feedbacks` - Lista de Feedbacks
**Propósito:** Página administrativa para gerenciar todos os feedbacks do tenant

**Características:**
- 🔒 Acesso restrito (login obrigatório)
- ✅ Lista todos feedbacks do tenant
- ✅ Filtros: status, tipo, busca por protocolo/título
- ✅ Paginação automática
- ✅ Ordenação por data
- ✅ Badges coloridos por status
- ✅ Ações em contexto (visualizar, arquivar, etc)

**URL de acesso:**
```
https://ouvy-frontend-[tenant].vercel.app/dashboard/feedbacks
```

**Endpoints chamados:**
```
GET /api/feedbacks/                      # Lista feedbacks
GET /api/feedbacks/?status=novo          # Filtrado por status
POST /api/feedbacks/{id}/status/         # Mudar status
POST /api/feedbacks/{id}/arquivar/       # Arquivar
```

---

#### `/dashboard/feedbacks/[protocolo]` - Detalhes do Feedback
**Propósito:** Visualização detalhada e gerenciamento de um feedback específico

**Características:**
- 🔒 Acesso restrito (login obrigatório)
- ✅ Visualização completa do feedback
- ✅ Timeline de interações
- ✅ Envio de respostas (públicas ou internas)
- ✅ Mudança de status
- ✅ Atribuição de responsável
- ✅ Anexos (futuro)
- ✅ Notas internas (privadas)

**URL de acesso:**
```
https://ouvy-frontend-[tenant].vercel.app/dashboard/feedbacks/FB-2026-ABC123
```

**Endpoints chamados:**
```
GET /api/feedbacks/{protocolo}/                    # Buscar detalhes
POST /api/feedbacks/{protocolo}/interacoes/        # Adicionar interação
POST /api/feedbacks/{protocolo}/status/            # Mudar status
```

---

## 🔐 SISTEMA DE MULTI-TENANCY

### Como funciona:

1. **Subdomínio ou Path-based:**
   - Cada empresa tem identificação única
   - Exemplo: `empresa1.ouvy.com.br` ou `ouvy.com.br/empresa1`

2. **Middleware de Tenant:**
   ```python
   # Backend Django
   class TenantMiddleware:
       - Extrai tenant do request (subdomain ou header)
       - Valida tenant existe no banco
       - Injeta tenant_id em todas queries
   ```

3. **Isolamento de Dados:**
   - Todos os modelos têm `tenant_id`
   - Queries automáticas filtram por tenant
   - Impossível acessar dados de outro tenant

---

## 🚀 COMO IMPLANTAR PARA UM NOVO CLIENTE

### **Passo 1: Criar Tenant no Backend**

```bash
# Acessar console Django
cd ouvy_saas
python manage.py shell

# Criar tenant
from apps.tenants.models import Tenant
tenant = Tenant.objects.create(
    nome="Empresa XYZ Ltda",
    subdominio="empresaxyz",
    plano="pro",
    ativo=True
)

# Criar usuário admin do tenant
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.create_user(
    username="admin@empresaxyz.com",
    email="admin@empresaxyz.com",
    password="senha_segura_aqui",
    tenant=tenant,
    is_staff=True
)
```

### **Passo 2: Configurar DNS (se usar subdomínio)**

```
# Adicionar registro CNAME no DNS:
empresaxyz.ouvy.com.br → CNAME → ouvy-frontend.vercel.app
```

### **Passo 3: Configurar Vercel (opcional)**

```bash
# Adicionar domínio customizado no Vercel
vercel domains add empresaxyz.ouvy.com.br
```

### **Passo 4: Compartilhar URLs com Cliente**

```
📧 Email para o cliente:

Olá, Empresa XYZ!

Sua plataforma Ouvy está pronta! 🎉

🔗 URLs importantes:

1. Envio de Feedbacks (compartilhe com seus colaboradores):
   https://ouvy-frontend.vercel.app/enviar

2. Acompanhamento de Protocolos:
   https://ouvy-frontend.vercel.app/acompanhar

3. Dashboard Administrativo:
   https://ouvy-frontend.vercel.app/dashboard
   Login: admin@empresaxyz.com
   Senha: [fornecida em canal seguro]

📋 Como funciona:

- Colaboradores acessam /enviar e criam feedbacks
- Sistema gera protocolo único (ex: FB-2026-ABC123)
- Acompanhamento público via /acompanhar
- Gestão completa no /dashboard

🔒 Segurança:
- Dados isolados (multi-tenant)
- Anonimato opcional
- LGPD compliant
- Criptografia SSL

Precisa de ajuda? suporte@ouvy.com.br
```

---

## 🎨 PERSONALIZAÇÃO POR CLIENTE

### **1. Branding (White Label)**

**Arquivo:** `ouvy_frontend/components/ui/logo.tsx`

```typescript
// Substituir logo por tenant
const logos = {
  'empresaxyz': '/logos/empresaxyz.svg',
  'default': '/logo-ouvy.svg'
};

export function Logo({ tenant }) {
  return <img src={logos[tenant] || logos.default} />;
}
```

### **2. Cores Personalizadas**

**Arquivo:** `ouvy_frontend/tailwind.config.ts`

```typescript
// Adicionar tema por tenant
const themes = {
  empresaxyz: {
    primary: '#0066CC',
    secondary: '#003366',
  }
};
```

### **3. Campos Customizados**

**Backend:** Adicionar campos dinâmicos via JSON

```python
# models.py
class Feedback(TenantAwareModel):
    campos_customizados = models.JSONField(default=dict, blank=True)
    
# Exemplo de uso:
feedback.campos_customizados = {
    'departamento': 'RH',
    'setor': 'Administrativo',
    'prioridade': 'Alta'
}
```

---

## 📱 WIDGETS E INTEGRAÇÕES

### **Widget JavaScript (Futuro)**

```html
<!-- Incorporar no site do cliente -->
<script src="https://ouvy.com.br/widget.js"></script>
<script>
  Ouvy.init({
    tenant: 'empresaxyz',
    position: 'bottom-right',
    color: '#0066CC'
  });
</script>
```

### **API REST para Integrações**

```bash
# Webhook quando novo feedback chega
POST https://cliente.com/webhook/ouvy
{
  "evento": "novo_feedback",
  "protocolo": "FB-2026-ABC123",
  "tipo": "denuncia",
  "titulo": "..."
}
```

---

## 🔔 NOTIFICAÇÕES

### **Email Automático (Configurar)**

**Quando enviar:**
- ✅ Novo feedback recebido → Notifica admins
- ✅ Resposta da equipe → Notifica autor (se não anônimo)
- ✅ Status mudou → Notifica autor
- ✅ Lembrete de feedback antigo sem resposta

**Configurar em:** `ouvy_saas/config/settings.py`

```python
# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@ouvy.com.br'
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD')

# Celery para async (futuro)
CELERY_BROKER_URL = 'redis://...'
```

---

## 📊 RELATÓRIOS E ANALYTICS

### **Métricas Disponíveis** (Dashboard)

**Rota:** `/dashboard/relatorios`

**Dados exibidos:**
- 📈 Total de feedbacks por período
- 📊 Distribuição por tipo (denúncia, sugestão, etc)
- ⏱️ Tempo médio de resolução
- 📉 Taxa de satisfação (se implementado)
- 🎯 Feedbacks por categoria
- 👥 Feedbacks anônimos vs identificados

**Exportação:**
- CSV (implementado)
- PDF (futuro)
- Excel (futuro)

---

## 🧪 TESTES

### **Testar Envio de Feedback**

```bash
# 1. Acessar página pública
open https://ouvy-frontend-[deployment].vercel.app/enviar

# 2. Preencher formulário:
Tipo: Denúncia
Título: "Teste de integração"
Descrição: "Este é um teste do sistema de feedbacks"
Anônimo: Não
Email: teste@example.com

# 3. Enviar e copiar protocolo retornado
# Exemplo: FB-2026-ABC123

# 4. Testar acompanhamento
open https://ouvy-frontend-[deployment].vercel.app/acompanhar
# Colar protocolo e consultar
```

### **Testar API Diretamente**

```bash
# Criar feedback via API
curl -X POST https://ouvy-saas-production.up.railway.app/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 1" \
  -d '{
    "tipo": "denuncia",
    "titulo": "Teste via API",
    "descricao": "Testando criação via curl",
    "anonimo": false,
    "email_contato": "teste@example.com"
  }'

# Resposta esperada:
{
  "protocolo": "FB-2026-XYZ789",
  "mensagem": "Feedback registrado com sucesso"
}
```

---

## 🔒 SEGURANÇA E COMPLIANCE

### **Medidas Implementadas:**

1. ✅ **Anonimato Garantido**
   - Sem tracking de IP se anônimo
   - Email opcional
   - Sem identificação forçada

2. ✅ **LGPD Compliance**
   - Exportação de dados via `/dashboard/perfil`
   - Exclusão de conta
   - Consentimento explícito

3. ✅ **Rate Limiting**
   - Consulta de protocolo: 10 req/min
   - Envio de feedback: 5 req/min
   - Previne spam e ataques

4. ✅ **Sanitização de Inputs**
   - Strip HTML tags
   - Proteção contra XSS
   - Validação de email

5. ✅ **Isolamento Multi-Tenant**
   - Dados isolados por tenant_id
   - Impossível cross-tenant access
   - Queries automáticas filtradas

---

## 📝 CONFIGURAÇÃO INICIAL

### **Variáveis de Ambiente Necessárias:**

**Backend (Railway):**
```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=ouvy-saas-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://ouvy-frontend.vercel.app

# Email (opcional mas recomendado)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@ouvy.com.br
EMAIL_HOST_PASSWORD=...

# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://ouvy-saas-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://ouvy-frontend.vercel.app
```

---

## 🎯 ROADMAP FUTURO

### **Próximas Funcionalidades:**

**Curto Prazo (1-2 meses):**
- [ ] Anexos em feedbacks (upload de arquivos)
- [ ] Notificações por email automáticas
- [ ] Widget JavaScript para incorporar no site
- [ ] Exportação de relatórios em PDF
- [ ] Pesquisa de satisfação pós-resolução

**Médio Prazo (3-6 meses):**
- [ ] App mobile (React Native)
- [ ] Chatbot para triagem automática
- [ ] Integração com Slack/Teams
- [ ] Dashboard analytics avançado
- [ ] API pública documentada

**Longo Prazo (6-12 meses):**
- [ ] IA para categorização automática
- [ ] Sistema de SLA e prazos
- [ ] Workflow customizável
- [ ] Auditoria completa (logs)
- [ ] Gamificação (pontos, badges)

---

## 📞 SUPORTE

**Documentação Técnica:**
- `/docs/FASE1_CORRECOES_APLICADAS.txt`
- `/docs/FASE2_INTEGRACAO_STRIPE.txt`
- `/docs/FASE3_LGPD_COMPLIANCE.txt`

**Repositório:**
- GitHub: `jairguerraadv-sys/ouvy-saas`

**Contatos:**
- Email: suporte@ouvy.com.br
- Slack: #ouvy-suporte

---

**Status do Sistema:** ✅ Operacional  
**Última atualização:** 14/01/2026
