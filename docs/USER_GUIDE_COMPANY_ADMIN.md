# 📋 Company Administrator Guide - Ouvify

**Version:** 1.0 (Release Candidate)  
**Date:** February 6, 2026  
**Audience:** Business administrators managing their Ouvify instance

---

## 📖 Table of Contents

1. [🚀 Getting Started](#-getting-started)
2. [🎨 White-Label Customization](#-white-label-customization)
3. [🛡️ Security Settings](#️-security-settings)
4. [📊 Audit Log](#-audit-log)
5. [👥 Team Management](#-team-management)
6. [🎫 Feedback Management](#-feedback-management)
7. [💳 Billing & Subscription](#-billing--subscription)
8. [❓ Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### Creating Your Company Account

1. **Access:** Navigate to [ouvify.vercel.app/cadastro](https://ouvify.vercel.app/cadastro)
2. **Fill Company Information:**
   - **Company Name**: Legal business name
   - **Tax ID (CNPJ)**: Business registration number
   - **Business Email**: Will be your login credential
   - **Strong Password**: Minimum 8 characters with letters and numbers
3. **Choose Subdomain:**
   - Example: If you choose `mycompany`, your feedback page will be `mycompany.ouvify.com`
   - ⚠️ **Cannot be changed later** - choose wisely!
4. **Accept Terms**: Review and accept the Terms of Service and Privacy Policy
5. **Create Account**
6. **Email Verification**: Check your inbox (may be in spam folder)
7. **Activate Account**: Click the verification link

✅ **Done!** You can now log in to your dashboard.

---

### 🎓 Onboarding Checklist

After your first login, you'll see an **Onboarding Checklist** with 4 tasks:

```
┌─────────────────────────────────────────────────────────┐
│ ✨ Configure Your Account                             X │
│ Complete the steps below to get started (0/3 completed) │
├─────────────────────────────────────────────────────────┤
│ Progress: 0/4                                  [0%] ▒▒▒▒▒│
├─────────────────────────────────────────────────────────┤
│ ○ 🎨 Customize Branding            [Configure →]        │
│ ○ 🏷️ Create Tags/Channels          [Create Tags →]      │
│ ○ 💬 Submit Test Feedback          [View Feedbacks →]   │
│ ○ 👥 Invite Team (Optional)        [Invite →]           │
└─────────────────────────────────────────────────────────┘
```

**Each task is critical:**

1. **🎨 Customize Branding** (Required)
   - Upload your logo and set brand colors
   - Your public feedback page will reflect your brand
   
2. **🏷️ Create Tags/Channels** (Required)
   - Organize feedbacks by department or category
   - Example: "HR", "Finance", "IT Support"
   
3. **💬 Submit Test Feedback** (Required)
   - Test the feedback flow from a user's perspective
   - Ensure everything works as expected
   
4. **👥 Invite Team** (Optional)
   - Add collaborators to manage feedbacks
   - Assign different permission levels

**Auto-Dismiss:** When you complete all required tasks (3/3), the checklist automatically closes after 3 seconds. You can manually dismiss it anytime by clicking the **X**.

**Progress Tracking:**
- **0-33%**: Just getting started
- **34-66%**: Making good progress
- **67-99%**: Almost there!
- **100%**: 🎉 Account fully configured!

---

## 🎨 White-Label Customization

Make Ouvify look like your own product. Navigate to **Settings** > **Branding**.

### 📸 Logo Upload

**Requirements:**
- **Format**: PNG, JPG, or SVG
- **Size**: Recommended 200x200px (max 2MB)
- **Background**: Transparent PNG works best

**Steps:**
1. Click **"Upload Logo"**
2. Select your file
3. Preview appears instantly
4. Click **"Save Changes"**

**Where it appears:**
- ✅ Public feedback page header
- ✅ Email notifications
- ✅ Customer portal

---

### 🎨 Brand Colors

**Primary Color:**
- Main brand color (buttons, links, headers)
- Use your company's primary color
- Default: `#6366F1` (Indigo)

**Secondary Color:**
- Accent color (badges, alerts, hover states)
- Complementary to primary
- Default: `#8B5CF6` (Purple)

**How to set:**
1. Click the color picker
2. Choose your color OR paste HEX code (e.g., `#FF5733`)
3. See live preview
4. Click **"Save Changes"**

**Pro Tip:** Use your brand style guide colors for perfect consistency.

---

### 🌐 Custom Domain (Enterprise Plan)

Want `feedback.mycompany.com` instead of `mycompany.ouvify.com`?

**Available on:** Enterprise Plan only

**Setup:**
1. Go to **Settings** > **Domains**
2. Enter your desired domain: `feedback.mycompany.com`
3. Add DNS records (we'll provide CNAME values)
4. Click **"Verify Domain"**
5. Wait 24-48 hours for propagation

**DNS Configuration:**
```
Type: CNAME
Host: feedback
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 🛡️ Security Settings

Navigate to **Profile** > **Security** for advanced security controls.

### 🔐 Two-Factor Authentication (2FA/MFA)

Add an extra security layer to your account. **Highly recommended for admins!**

#### Setup 2FA

1. Go to **Profile** > **Security** > **Two-Factor Authentication**
2. Click **"Enable 2FA"**
3. **Scan QR Code:**
   - Open your authenticator app (Google Authenticator, Authy, 1Password, etc.)
   - Scan the QR code displayed
   - If you can't scan, manually enter the secret key
4. **Verify Setup:**
   - Enter the 6-digit code from your app
   - Click **"Confirm"**
5. **Save Backup Codes:**
   - You'll see 10 single-use recovery codes
   - Click **"Download .txt"** or **"Copy All"**
   - ⚠️ **Store securely!** These are your recovery method if you lose your device

✅ **2FA is now active!** Next login will require a code.

---

#### Using 2FA at Login

After entering your email/password, you'll be redirected to:

**Challenge Page:**
```
┌─────────────────────────────────────────┐
│  🔐 Two-Factor Authentication           │
├─────────────────────────────────────────┤
│  Open your authenticator app and enter  │
│  the 6-digit code:                      │
│                                         │
│  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]          │
│                                         │
│  [Verify Code]                          │
│                                         │
│  Lost your device? → Use backup code    │
└─────────────────────────────────────────┘
```

**If you lost your device:**
1. Click **"Lost your device?"**
2. Toggle **"Use Backup Code"**
3. Enter one of your 10 recovery codes
4. ⚠️ That code will be invalidated after use

---

#### Disable 2FA

**Security Warning:** Only disable if absolutely necessary.

1. Go to **Security** > **Two-Factor Authentication**
2. Click **"Disable 2FA"**
3. **Enter your password**
4. **Enter a valid 6-digit code** from your app
5. Confirm

**Why both?** Prevents unauthorized disabling if someone steals your password.

---

#### Regenerate Backup Codes

Used up your backup codes? Generate new ones:

1. Go to **Security** > **Backup Codes**
2. Click **"Regenerate Codes"**
3. ⚠️ **Old codes will be invalidated**
4. Download/copy new codes

---

## 📊 Audit Log

Track every action in your system. Navigate to **Audit & Analytics** > **Logs**.

### What is Recorded

**20+ Action Types:**
- 🔓 **LOGIN** / 🔒 **LOGOUT**
- ❌ **LOGIN_FAILED** (security alert)
- 🔑 **PASSWORD_CHANGE** / **PASSWORD_RESET**
- 🛡️ **MFA_ENABLED** / **MFA_DISABLED**
- ➕ **CREATE** / ✏️ **UPDATE** / 🗑️ **DELETE**
- 👁️ **VIEW** / 📥 **EXPORT**

**For each log:**
- ⏱️ **Timestamp**: Exact date/time
- 👤 **User**: Who performed the action
- 🎯 **Action**: What happened
- 📊 **Severity**: INFO, WARNING, ERROR, CRITICAL
- 📝 **Description**: Human-readable details
- 🌐 **IP Address**: User's IP
- 🎯 **Target**: Affected object (e.g., "Feedback #1234")

---

### Using the Audit Log Table

**Filters:**
- **Action Type**: Dropdown with all 20+ types
- **Severity**: INFO, WARNING, ERROR, CRITICAL
- **Date Range**: From/To date pickers
- **Search**: Free text (searches description, user email, object name)

**Example Use Cases:**

1. **Security Investigation:**
   - Filter by **"LOGIN_FAILED"**
   - Check if IPs are unusual
   - Action: Block IP if brute-force detected

2. **Compliance Audit:**
   - Export last 90 days
   - Filter by **"DELETE"** or **"UPDATE"**
   - Provide to auditors

3. **User Activity:**
   - Search by user email
   - See all actions by that user
   - Useful for internal investigations

---

### Export Audit Logs

**Formats:**
- 📄 **CSV**: For Excel/Sheets analysis

**Steps:**
1. Apply desired filters
2. Click **"Export CSV"** button
3. File downloads: `audit-logs-2026-02-06.csv`

**CSV Columns:**
```
ID, Timestamp, User, Action, Severity, Description, IP Address, Target
```

---

## 👥 Team Management

Navigate to **Team** to manage collaborators.

### Roles & Permissions

| Permission | Viewer | Admin | Owner |
|------------|--------|-------|-------|
| View feedbacks | ✅ | ✅ | ✅ |
| Comment on feedbacks | ✅ | ✅ | ✅ |
| Change feedback status | ❌ | ✅ | ✅ |
| Delete feedbacks | ❌ | ✅ | ✅ |
| Invite team members | ❌ | ✅ | ✅ |
| Billing & subscription | ❌ | ❌ | ✅ |
| White-label settings | ❌ | ❌ | ✅ |
| Delete account | ❌ | ❌ | ✅ |

---

### Inviting Team Members

1. Go to **Team** > **Invite Member**
2. Enter **email address**
3. Select **role** (Viewer / Admin)
4. Click **"Send Invitation"**
5. Invitee receives email with activation link (valid 7 days)
6. They create password and join your team

**Team Size Limits:**
- **Starter**: 3 members
- **Pro**: 10 members
- **Enterprise**: Unlimited

---

### Managing Existing Members

**Change Role:**
1. Find member in team list
2. Click **"Edit"**
3. Select new role
4. Confirm

**Remove Member:**
1. Click **"Remove"** next to member name
2. Confirm deletion
3. They immediately lose access

⚠️ **Warning:** Owner cannot be removed. Transfer ownership first.

---

## 🎫 Feedback Management

Navigate to **Feedbacks** to view and manage submissions.

### Feedback Status Workflow

```
NEW → IN REVIEW → RESOLVED → ARCHIVED
```

**Status Meanings:**
- 🆕 **NEW**: Just received, not reviewed yet
- 🔍 **IN REVIEW**: Team is investigating
- ✅ **RESOLVED**: Issue fixed or answered
- 📦 **ARCHIVED**: Closed and filed

### Viewing Feedback Details

Click any feedback to see:
- 📝 **Full description**
- 📎 **Attachments** (images/files)
- 👤 **Submitter info** (if not anonymous)
- 📅 **Submission date/time**
- 🏷️ **Tags/Categories**
- ⚡ **Priority level**
- 💬 **Internal comments**
- 📊 **Status history**

### Internal Comments

Add notes visible only to your team:

1. Open feedback
2. Scroll to **"Internal Comments"**
3. Type your note
4. Click **"Add Comment"**

**Use cases:**
- Assign to colleague: "@John, please handle this"
- Update status: "Contacted customer, awaiting response"
- Document resolution: "Refunded $50, issue closed"

---

## 💳 Billing & Subscription

Navigate to **Subscription** to manage your plan.

### Current Plan Overview

You'll see:
- 💳 **Plan name**: Starter / Pro / Enterprise
- 💰 **Price**: $0, $49/mo, $199/mo
- 📊 **Usage**:
  - Feedbacks: 15/50 (30% used)
  - Storage: 0.3GB/1GB
  - Team: 2/3 members
- 📅 **Next billing date**: March 6, 2026

### Upgrading Your Plan

**Why upgrade?**
- 📈 More feedbacks per month
- 👥 Larger team capacity
- 💾 More storage
- 🔗 Webhooks (Pro+)
- 🎨 Custom domains (Enterprise)

**Steps:**
1. Go to **Subscription** > **Change Plan**
2. Select desired tier
3. Click **"Upgrade to [Plan]"**
4. Enter payment details (Stripe Checkout)
5. Confirm purchase

**Billing:**
- **Prorated**: You only pay the difference for remaining period
- **Example**: Upgrade on Feb 15 (halfway through month) → Pay $24.50 instead of $49

### Downgrading Your Plan

**Before downgrading:**
- ⚠️ Check if you exceed new plan limits
- Delete extra team members if needed
- Archive old feedbacks to reduce count

**Steps:**
1. Go to **Subscription** > **Change Plan**
2. Select lower tier
3. Confirm downgrade
4. **Takes effect**: Next billing cycle (not immediately)

### Billing Portal

Stripe provides a self-service portal for:
- 💳 Update payment method
- 📄 Download invoices
- 📧 Update billing email
- ❌ Cancel subscription

**Access:**
1. Go to **Subscription**
2. Click **"Manage Billing"**
3. Stripe portal opens in new tab

---

## ❓ Troubleshooting

### I can't receive feedbacks on my public page

**Checklist:**
1. ✅ Subdomain configured? (Check **Settings** > **Domain**)
2. ✅ Account verified? (Check email)
3. ✅ Payment method added? (Starter plan needs card on file)

**Test:**
1. Open `{your-subdomain}.ouvify.com` in incognito window
2. Try submitting a feedback
3. Check **Feedbacks** dashboard

If still not working: Contact support with your subdomain.

---

### Team member can't log in

**Common causes:**
1. ❌ **Invitation expired** (7-day validity)
   - Solution: Resend invitation
2. ❌ **Wrong email**
   - Solution: Verify email address
3. ❌ **Account not activated**
   - Solution: Check spam folder for activation email

---

### 2FA issues

**Lost authenticator app:**
1. Use one of your 10 backup codes at login
2. After logging in, disable 2FA
3. Re-enable with new device

**Backup codes lost too:**
- Contact support with ID verification
- We'll temporarily disable 2FA for password reset

---

### Webhook not receiving events

**Debugging:**
1. Go to **Settings** > **Webhooks**
2. Check **"Delivery Logs"**
3. Look for failed attempts

**Common issues:**
- ❌ **Invalid URL**: Must be `https://` (not `http://`)
- ❌ **Timeout**: Endpoint takes >30s to respond
- ❌ **Wrong signature**: Validate HMAC-SHA256 signature

---

### LGPD/Consent questions

**User wants to delete data:**
1. Go to **Settings** > **Privacy**
2. Click **"Export My Data"** (send to user first)
3. Click **"Delete Account"**
4. All personal data is anonymized

**Check consent status:**
1. Go to **Audit & Analytics** > **Privacy**
2. See who accepted/declined
3. Export consent log for audits

---

## 📞 Need More Help?

- 📧 **Email Support**: jairguerraadv@gmail.com
- 📚 **Documentation**: [/docs](../README.md)
- 🎥 **Video Tutorials**: Coming soon
- 💬 **Live Chat**: Pro/Enterprise only (dashboard bottom-right)

---

<div align="center">

**🚀 Ouvify - Enterprise Feedback Platform**

Version 1.0 | Release Candidate

</div>

1. Entre em contato com suporte@ouvify.com
2. Forneça o domínio desejado
3. Configure o registro CNAME no seu provedor de DNS:
   ```
   feedback.minhaempresa.com → [valor fornecido pelo suporte]
   ```
4. Aguarde propagação (até 48h)
5. Confirmamos quando estiver ativo

---

## 3. Gestão de Equipe

### 3.1 Entendendo os Roles (Papéis)

| Role | Pode fazer |
|------|-----------|
| **Owner** | Tudo (é você, dono da conta) |
| **Admin** | Gerenciar feedbacks, ver analytics, convidar membros (não pode deletar conta ou alterar billing) |
| **Viewer** | Apenas visualizar feedbacks e analytics (não pode editar nada) |

**Nota:** Só pode haver 1 Owner por empresa. Para transferir ownership, entre em contato com o suporte.

### 3.2 Como Convidar Membros

1. Vá em **Equipe**
2. Clique em **"Convidar Membro"**
3. Preencha:
   - **Email** do novo membro
   - **Nome completo**
   - **Role** (Admin ou Viewer)
4. Clique em **"Enviar Convite"**
5. A pessoa receberá um email com link de aceitação
6. Link é válido por 7 dias

**O convidado deve:**
1. Clicar no link do email
2. Criar uma senha
3. Aceitar o convite
4. Pronto! Já tem acesso ao dashboard da empresa

### 3.3 Como Remover Membros

1. Vá em **Equipe**
2. Encontre o membro na lista
3. Clique no ícone de **3 pontinhos** (⋮)
4. Selecione **"Remover da Equipe"**
5. Confirme a remoção

**Atenção:** A pessoa perde acesso imediatamente. Feedbacks atribuídos a ela ficam sem atribuição.

### 3.4 Como Alterar Role de um Membro

1. Vá em **Equipe**
2. Encontre o membro
3. Clique em **"Editar"**
4. Selecione o novo role
5. Salve

---

## 4. Gerenciamento de Feedbacks

### 4.1 Workflow Padrão

```
┌─────────┐   Triagem   ┌─────────────┐   Resolver   ┌────────────┐
│  NOVO   │ ─────────→  │ EM ANÁLISE  │ ──────────→  │ RESOLVIDO  │
└─────────┘             └─────────────┘              └────────────┘
     │                         │                            │
     │                         ▼                            │
     │              ┌─────────────────────┐                 │
     └──────────→   │ AGUARDANDO INFO     │                 │
                    └─────────────────────┘                 │
                               │                            │
                               ▼                            ▼
                         ┌─────────────┐          ┌──────────────┐
                         │ ARQUIVADO   │  ←────── │  ARQUIVADO   │
                         └─────────────┘          └──────────────┘
```

### 4.2 Como Visualizar Feedbacks

**Página principal:** `/dashboard/feedbacks`

**Filtros disponíveis:**
- **Status:** Novo, Em Análise, Aguardando Info, Resolvido, Arquivado
- **Tipo:** Denúncia, Reclamação, Sugestão, Elogio
- **Prioridade:** Baixa, Média, Alta, Urgente
- **Período:** Hoje, Última semana, Último mês, Customizado
- **Atribuído para:** Qualquer membro da equipe
- **Busca:** Por palavras-chave, protocolo, email

**Ordenação:**
- Mais recentes primeiro (padrão)
- Mais antigos primeiro
- Prioridade (urgente → baixa)
- Status

### 4.3 Como Fazer Triage de um Novo Feedback

1. Na lista de feedbacks, clique em um com status **"Novo"**
2. Leia o conteúdo completo
3. Veja anexos (se houver)
4. Decida:
   - **É válido?** → Mude para "Em Análise"
   - **Precisa mais informações?** → Mude para "Aguardando Informações" e envie mensagem
   - **É spam/duplicado?** → Arquive
5. **Defina prioridade:**
   - **Urgente:** Situação crítica, risco imediato
   - **Alta:** Impact significativo, precisa atenção rápida
   - **Média:** Importante mas não urgente
   - **Baixa:** Nice to have, pode esperar
6. **Atribua para alguém:**
   - Selecione você mesmo ou outro membro da equipe
   - A pessoa recebe notificação
7. **Adicione tags** (opcional):
   - Ex: "produto", "atendimento", "entrega", etc.
   - Ajuda a categorizar e filtrar depois

### 4.4 Como Responder ao Usuário

**Se o feedback foi enviado com email de contato:**

1. Abra o feedback
2. Role até "Histórico de Interações"
3. Clique em **"Adicionar Resposta"**
4. Digite sua mensagem
5. Marque ✓ **"Enviar por email"**
6. Clique em **"Enviar"**

**O usuário receberá:**
- Email com sua resposta
- Pode acessar o protocolo para ver a mensagem

**Se o feedback foi anônimo:**
- A resposta fica visível apenas no sistema interno
- Usuário pode ver pelo protocolo (se souber)

### 4.5 Como Solicitar Mais Informações

1. Mude status para **"Aguardando Informações"**
2. Adicione uma resposta explicando o que precisa
3. Se tiver email de contato, marque para enviar por email

**Exemplo de mensagem:**
```
Olá! Obrigado pelo feedback.

Para podermos ajudar, precisamos de mais detalhes:
- Qual data e hora ocorreu?
- Qual o número do seu pedido?
- Pode enviar uma foto do problema?

Aguardamos seu retorno pelo protocolo OUVY-2026-0042.

Atenciosamente,
Equipe [Sua Empresa]
```

### 4.6 Como Adicionar Notas Internas

Notas internas NÃO são visíveis para o usuário final.

1. Abra o feedback
2. Vá em "Notas Internas"
3. Clique em **"Adicionar Nota"**
4. Digite (ex: "Falei com o João do setor X, ele vai resolver até amanhã")
5. Salve

**Use notas para:**
- Registrar conversas internas
- Planos de ação
- Histórico de investigação

### 4.7 Como Marcar como Resolvido

1. Certifique-se que o problema foi solucionado
2. Adicione uma resposta final ao usuário explicando a resolução
3. Mude status para **"Resolvido"**
4. (Opcional) Adicione nota interna sobre o que foi feito

**Boas práticas:**
- Sempre explique a resolução, mesmo resumidamente
- Se possível, peça feedback sobre a solução
- Mantenha o feedback em "Resolvido" por alguns dias antes de arquivar

### 4.8 Como Arquivar

Arquivar serve para "dar baixa" em feedbacks que já foram tratados e não precisam mais de ação.

1. Abra o feedback
2. Clique em **"Arquivar"**
3. Confirme

**Quando arquivar:**
- Feedback resolvido há mais de 7 dias
- Spam confirmadado
- Duplicado
- Não se aplica

**Atenção:** Feedbacks arquivados não aparecem na lista padrão (mas podem ser filtrados).

### 4.9 Como Atribuir para outro Membro

1. Abra o feedback
2. Na barra lateral, seção "Atribuído para"
3. Clique e selecione outro membro
4. Salve

**A pessoa recebe notificação:**
- Email (se ativado nas preferências)
- Notificação no dashboard

---

## 5. Analytics e Relatórios

### 5.1 Dashboard de Métricas

**Página:** `/dashboard/analytics`

**Métricas principais:**
- **Total de feedbacks:** Todos os tempos
- **Taxa de resolução:** % de feedbacks resolvidos
- **Tempo médio de resposta:** Quanto tempo demora para primeira resposta
- **Tempo médio de resolução:** Quanto tempo para resolver
- **NPS (Net Promoter Score):** Baseado em elogios vs reclamações

**Gráficos:**
- Feedbacks por dia/semana/mês (evolução)
- Distribuição por tipo (pizza)
- Distribuição por status (barras)
- Feedbacks por membro da equipe
- Tempo de resolução por prioridade

### 5.2 Como Filtrar Analytics

Use os filtros no topo:
- **Período:** Últimos 7 dias, 30 dias, 3 meses, ano, customizado
- **Tipo:** Todos, ou apenas Denúncias, Reclamações, etc.
- **Status:** Todos, ou apenas Resolvidos, etc.
- **Membro:** Todos, ou filtrar por quem está atribuído

Clique em **"Aplicar Filtros"** e os gráficos atualizam automaticamente.

### 5.3 Como Exportar Relatórios

1. Na página de Analytics, clique em **"Exportar Relatório"**
2. Escolha o formato:
   - **PDF:** Relatório visual com gráficos
   - **CSV:** Dados crus para Excel
   - **JSON:** Dados estruturados (para integrações)
3. Configure período e filtros
4. Clique em **"Gerar"**
5. Download começa automaticamente

**Conteúdo do relatório:**
- Resumo executivo
- Todos os gráficos
- Tabela detalhada de feedbacks
- Insights automáticos (ex: "reclamações aumentaram 20% no último mês")

---

## 6. Configurações Avançadas

### 6.1 Webhooks

Webhooks permitem integrar o Ouvify com outros sistemas (Slack, Discord, Zapier, etc.).

**Como configurar:**

1. Vá em **Configurações** > **Webhooks**
2. Clique em **"Novo Webhook"**
3. Preencha:
   - **Nome:** Ex: "Slack - Canal #feedbacks"
   - **URL:** Endereço que receberá os eventos
   - **Eventos:** Marque o que quer receber:
     - ✓ Novo feedback criado
     - ✓ Feedback atualizado
     - ✓ Feedback resolvido
     - ✓ Nova resposta adicionada
   - **Secret:** (opcional) Para validar origem
4. Clique em **"Testar Webhook"**
5. Se passar, clique em **"Salvar"**

**Payload exemplo enviado:**
```json
{
  "event": "feedback.created",
  "timestamp": "2026-02-05T19:30:00Z",
  "data": {
    "protocolo": "OUVY-2026-0042",
    "tipo": "RECLAMACAO",
    "status": "NOVO",
    "descricao": "Produto chegou com defeito",
    "link": "https://minhaempresa.ouvify.com/dashboard/feedbacks/OUVY-2026-0042"
  }
}
```

**Integrações populares:**
- **Slack:** Criar canal #feedbacks e receber notificações
- **Discord:** Similar ao Slack
- **Zapier:** Conectar com 5000+ apps (Google Sheets, Asana, Trello, etc.)
- **Custom:** Seu próprio sistema

### 6.2 Notificações

**Página:** **Configurações** > **Notificações**

Configure quando quer receber alertas:

**Por Email:**
- [ ] Novo feedback criado
- [ ] Feedback atribuído para mim
- [ ] Resposta do usuário em feedback que estou acompanhando
- [ ] Feedback ficou muito tempo sem resposta (>24h)
- [ ] Relatório semanal (resumo)

**Por Push (no navegador):**
- [ ] Novo feedback criado
- [ ] Feedback atribuído para mim

**Frequência de emails:**
- Instantâneo
- Diário (resumo às 9h)
- Semanal (segundas às 9h)

### 6.3 Formulário de Feedback Personalizado

**Em desenvolvimento** (disponível em breve):
- Adicionar campos customizados
- Tornar campos obrigatórios
- Customizar tipos de feedback

---

## 7. Billing e Assinatura

### 7.1 Planos Disponíveis

| Plano | Feedbacks/mês | Membros da Equipe | Preço |
|-------|---------------|-------------------|-------|
| **Starter** | Até 100 | 3 | R$ 97/mês |
| **Professional** | Até 500 | 10 | R$ 297/mês |
| **Business** | Ilimitado | 25 | R$ 597/mês |
| **Enterprise** | Ilimitado | Ilimitado | Customizado |

**Todos os planos incluem:**
- ✓ White label completo
- ✓ Analytics
- ✓ Webhooks
- ✓ API
- ✓ Suporte por email
- ✓ LGPD compliance
- ✓ SSL/segurança

### 7.2 Como Alterar Plano

1. Vá em **Assinatura**
2. Veja plano atual e uso
3. Clique em **"Mudar Plano"**
4. Selecione o novo plano
5. Confirme

**Upgrade (subir de plano):**
- Mudança é imediata
- Cobrança proporcional (apenas a diferença do período restante)

**Downgrade (descer de plano):**
- Mudança ocorre no próximo ciclo de cobrança
- Você continua com benefícios do plano atual até lá

### 7.3 Como Atualizar Método de Pagamento

1. Vá em **Assinatura** > **Pagamento**
2. Clique em **"Atualizar Cartão"**
3. Insira dados do novo cartão (Stripe seguro)
4. Salve

### 7.4 O que acontece se a assinatura expirar?

**Aviso:** Enviamos 3 emails antes de expirar (7 dias, 3 dias, 1 dia antes).

**Após expiração:**
- Seus clientes NÃO conseguem mais enviar feedbacks (página mostra aviso)
- Você ainda consegue acessar o dashboard (modo leitura)
- Webhooks e notificações pausam
- Dados não são deletados

**Para reativar:**
1. Atualize método de pagamento
2. Clique em **"Reativar Assinatura"**
3. Tudo volta a funcionar em minutos

**Cancelamento voluntário:**
- Dados ficam disponíveis por 30 dias
- Após 30 dias, dados são permanentemente deletados (LGPD)
- Você recebe email para exportar dados antes da exclusão

---

## 8. Troubleshooting

### 8.1 Problemas Comuns

**"Não consigo fazer login"**
- Verifique se email/senha estão corretos
- Tente redefinir senha: `/recuperar-senha`
- Limpe cache do navegador
- Tente navegador diferente (Chrome, Firefox)

**"Não recebi o email de verificação"**
- Verifique spam/lixeira
- Adicione `noreply@ouvify.com` aos contatos
- Reenvie email: no login, clique em "Reenviar email de verificação"

**"Meu logo não aparece"**
- Arquivo muito grande? Limite: 2MB
- Formato suportado: PNG, JPG, SVG
- Limpe cache: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)

**"Usuário não consegue acessar meu canal"**
- Confirme o link: `{seu-subdominio}.ouvify.com` (ou domínio customizado)
- Verifique se assinatura está ativa
- Tente você mesmo em navegador anônimo

**"Webhook não está funcionando"**
- Teste o webhook na página de configuração
- Verifique logs: mostra últimas 10 tentativas
- URL está acessível publicamente? (não pode ser localhost)
- Seu servidor responde com status 200?

**"Analytics não estão atualizando"**
- Analytics atualizam a cada 5 minutos (não é tempo real)
- Force refresh: Ctrl+R
- Verifique se feedbacks foram criados no período filtrado

### 8.2 Contato com Suporte

**Email:** suporte@ouvify.com  
**Horário:** Segunda a sexta, 9h às 18h (horário de Brasília)  
**Tempo de resposta:** Até 24h úteis

**Ao entrar em contato, forneça:**
- Email da sua conta
- Subdomínio da empresa
- Descrição detalhada do problema
- Prints de tela (se aplicável)
- Passos para reproduzir

**Emergências (planos Business/Enterprise):**
- WhatsApp: [número] - 24/7
- Slack: canal dedicado

---

## 📱 Próximos Passos

1. **Personalize seu canal** (logo, cores)
2. **Convide sua equipe**
3. **Compartilhe o link** do canal com seus clientes
4. **Configure webhooks** (opcional, mas recomendado)
5. **Monitore os feedbacks** diariamente

---

**Precisa de ajuda?** Entre em contato: suporte@ouvify.com

**Documentação técnica:** [docs.ouvify.com](https://docs.ouvify.com)

---

*Última atualização: 05/02/2026*
