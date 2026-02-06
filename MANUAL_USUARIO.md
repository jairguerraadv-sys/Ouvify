# 📘 Manual do Usuário - Ouvify

**Central de Feedbacks White-Label para sua Empresa**

Versão: 1.0.0 | Atualizado: Fevereiro 2026

---

## 📋 Índice

1. [Primeiros Passos](#-primeiros-passos)
2. [Configuração da Marca (White-Label)](#-configuração-da-marca-white-label)
3. [Gestão de Equipe](#-gestão-de-equipe)
4. [Gestão de Feedbacks](#-gestão-de-feedbacks)
5. [Consulta Pública de Protocolo](#-consulta-pública-de-protocolo)
6. [Analytics e Relatórios](#-analytics-e-relatórios)
7. [Assinatura e Planos](#-assinatura-e-planos)
8. [Webhooks e Integrações](#-webhooks-e-integrações)
9. [Segurança e Privacidade](#-segurança-e-privacidade)
10. [FAQ - Perguntas Frequentes](#-faq---perguntas-frequentes)

---

## 🚀 Primeiros Passos

### Após o Cadastro

Quando você cria sua conta no Ouvify, automaticamente recebe:

1. **Subdomínio único**: `suaempresa.ouvify.com`
2. **Painel administrativo**: Acesso total ao dashboard
3. **Checklist de Onboarding**: Guia visual com 4 etapas

### Checklist de Onboarding

O Ouvify irá guiá-lo através de 4 tarefas essenciais:

✅ **1. Configurar Marca** - Enviar logo e definir cores da sua empresa
✅ **2. Criar Tags** - Organizar feedbacks por categoria
✅ **3. Receber Primeiro Feedback** - Testar o sistema
✅ **4. Convidar Equipe** _(Opcional)_ - Adicionar colaboradores

> **Dica**: Complete o onboarding para desbloquear o potencial completo do sistema!

---

## 🎨 Configuração da Marca (White-Label)

O Ouvify permite que você personalize completamente a aparência da plataforma.

### Como Configurar

1. Acesse: **Dashboard → Configurações → White Label**
2. Configure os seguintes elementos:

#### Logo da Empresa

- **Formato aceito**: PNG, JPG, WebP
- **Tamanho máximo**: 2 MB
- **Recomendado**: PNG com fundo transparente (500x200px)
- **Onde aparece**: Header, emails, página de consulta pública

#### Cores da Marca

- **Cor Primária**: Cor principal da interface (botões, links)
- **Cor Secundária**: Cor de apoio (badges, highlights)
- **Cor do Texto**: Cor dos textos principais

**Formatos aceitos**: HEX (`#6366F1`) ou HSL (`199 89% 48%`)

#### Favicon

- **Formato aceito**: ICO, PNG (16x16 ou 32x32)
- **Onde aparece**: Aba do navegador

#### Fonte Customizada

- Escolha entre 50+ fontes do Google Fonts
- Aplica automaticamente em toda a interface

### Preview em Tempo Real

Todas as alterações são aplicadas **instantaneamente** após salvar. Teste navegando pelas páginas para ver como ficou!

---

## 👥 Gestão de Equipe

### Convidar Membros

1. Acesse: **Dashboard → Equipe → Convidar Membro**
2. Preencha:
   - **Email**: Email corporativo do colaborador
   - **Cargo**: Defina o nível de acesso (ver abaixo)
   - **Mensagem Pessoal** _(opcional)_: Boas-vindas personalizadas

3. O convidado receberá um **email** com link de aceitação válido por **7 dias**

### Cargos e Permissões

| Cargo                | Permissões                                          |
| -------------------- | --------------------------------------------------- |
| **👁️ Visualizador**  | Visualizar feedbacks e relatórios (somente leitura) |
| **✏️ Moderador**     | Criar, editar e responder feedbacks                 |
| **🔐 Administrador** | Gerenciar equipe, configurações e white-label       |
| **👑 Proprietário**  | Acesso total + gerenciar assinatura                 |

> **Nota**: Cada plano tem limite de membros. Veja [Assinatura e Planos](#-assinatura-e-planos).

### Suspender/Ativar Membros

- **Suspender**: Remove acesso temporariamente (mantém histórico)
- **Remover**: Exclui permanentemente o membro

**Como fazer:**

1. Vá em **Equipe → Membros**
2. Clique no ícone de **⚠️ Suspender** ou **🗑️ Remover**

---

## 💬 Gestão de Feedbacks

### Lifecycle de um Feedback

```
📝 Pendente → 🔍 Em Análise → ✅ Resolvido → 📁 Fechado
```

### Responder um Feedback

1. Clique no feedback na lista
2. Digite sua resposta na área **"Resposta Pública"**
3. Clique em **Enviar Resposta**

> **💡 Dica**: O usuário receberá um email automaticamente com sua resposta!

### Atribuir para um Membro

1. Abra o feedback
2. Clique em **Atribuir a** no menu superior
3. Selecione o membro responsável

### Adicionar Notas Internas

Use **"Nota Interna"** para comunicação entre equipe **sem** que o usuário veja:

- Exemplo: _"Cliente VIP, priorizar"_
- Exemplo: _"Já houve 3 reclamações similares essa semana"_

### Tags para Organização

Crie tags como:

- **Reclamação**, **Sugestão**, **Elogio**, **Bug**
- **Financeiro**, **Produto**, **Atendimento**
- **Urgente**, **Resolvido Rapidamente**

**Como criar:**
Dashboard → Feedbacks → Tags → Nova Tag

---

## 🔍 Consulta Pública de Protocolo

Seus clientes podem **acompanhar o status** do feedback sem precisar de login!

### Como Funciona

1. Quando o usuário envia um feedback, ele recebe um **código de protocolo** único:

   ```
   Exemplo: OUVY-A3B9-K7M2
   ```

2. O usuário acessa: `suaempresa.ouvify.com/acompanhar`

3. Digita o protocolo e visualiza:
   - Status atual (Pendente, Em Análise, Resolvido)
   - Timeline de atualizações
   - Respostas da empresa
   - **Enviar mensagens públicas**

### Responder como Usuário Anônimo

O usuário pode **continuar a conversa** inserindo mensagens públicas através da página de consulta. Não é necessário login!

> **Segurança**: Rate limiting de 10 consultas/min por IP para evitar enumeração de protocolos.

---

## 📊 Analytics e Relatórios

### Dashboard de Analytics

Acesse: **Dashboard → Analytics**

**Métricas disponíveis:**

- Total de feedbacks (geral + últimos 30 dias)
- Taxa de resolução (%)
- Tempo médio de resposta (horas)
- Feedbacks pendentes vs. em análise

**Gráficos:**

- Distribuição por status (Pendente, Em Análise, Resolvido, Fechado)
- Distribuição por tipo (Reclamação, Sugestão, Denúncia, Elogio)

### Exportar Dados

**Formato CSV:**

1. Vá em **Feedbacks → Exportar**
2. Escolha filtros (data, status, tipo)
3. Clique em **Exportar CSV**

**Campos exportados:**

- Protocolo, Título, Tipo, Status, Data de Criação, Email de Contato

---

## 💳 Assinatura e Planos

### Comparação de Planos

| Recurso                  | Free | Starter | Pro | Enterprise |
| ------------------------ | ---- | ------- | --- | ---------- |
| **Feedbacks/mês**        | 50   | 500     | ∞   | ∞          |
| **Membros da equipe**    | 2    | 5       | 20  | ∞          |
| **White-Label completo** | ❌   | ✅      | ✅  | ✅         |
| **Webhooks**             | ❌   | ✅      | ✅  | ✅         |
| **Domínio customizado**  | ❌   | ❌      | ✅  | ✅         |
| **Suporte prioritário**  | ❌   | ❌      | ✅  | ✅         |
| **SLA 99.9%**            | ❌   | ❌      | ❌  | ✅         |

### Como Fazer Upgrade

1. Acesse: **Dashboard → Assinatura**
2. Clique em **Fazer Upgrade**
3. Escolha o plano desejado
4. Preencha dados de pagamento (Stripe)
5. Confirme a assinatura

> **✅ Seguro**: Processamento via Stripe (PCI-DSS Nível 1)

### Cancelar Assinatura

1. Acesse: **Dashboard → Assinatura → Gerenciar**
2. Clique em **Cancelar Assinatura**
3. Confirme o cancelamento

**O que acontece:**

- Acesso mantido até o fim do período pago
- Downgrade automático para plano Free após vencimento
- Dados são mantidos (não há exclusão)

---

## 🔗 Webhooks e Integrações

Webhooks permitem que você receba **notificações em tempo real** quando eventos ocorrem no Ouvify.

### Eventos Disponíveis

- `feedback.created` - Novo feedback recebido
- `feedback.updated` - Feedback atualizado
- `feedback.resolved` - Feedback marcado como resolvido
- `feedback.assigned` - Feedback atribuído a um membro
- `team.member_added` - Novo membro adicionado
- `team.member_removed` - Membro removido

### Como Configurar

1. Acesse: **Dashboard → Configurações → Webhooks**
2. Clique em **Novo Webhook**
3. Preencha:
   - **URL do Endpoint**: `https://seuservidor.com/webhook`
   - **Eventos**: Selecione quais eventos deseja receber
4. Clique em **Criar Webhook**

5. **Guarde o Secret** gerado! Você precisará para validar as requisições.

### Validar Assinatura

Cada webhook enviado inclui um header `X-Webhook-Signature` com HMAC-SHA256:

```python
import hmac
import hashlib

def validate_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### Testar Webhook

Clique em **🧪 Enviar Teste** para receber um evento de exemplo.

---

## 🔒 Segurança e Privacidade

### LGPD/GDPR Compliance

O Ouvify está em conformidade com as principais leis de proteção de dados:

#### Consentimento

- **Aceite obrigatório** de Termos de Uso e Política de Privacidade
- **Registro de consentimento** com timestamp e IP
- **Revogação a qualquer momento**

#### Direitos do Titular

- **Exportar dados**: Pagina de configurações → Exportar meus dados
- **Excluir conta**: Configurações → Excluir minha conta
  - Exclusão permanente em **30 dias**
  - Feedbacks são **anonimizados** (não excluídos)

### Autenticação 2FA (Two-Factor)

Proteja sua conta com autenticação de dois fatores:

1. Acesse: **Dashboard → Configurações → Segurança**
2. Clique em **Ativar 2FA**
3. Escaneie o **QR Code** com app autenticador:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
4. Digite o código de 6 dígitos para confirmar

**Backup Codes**: Guarde os 8 códigos de backup em local seguro!

### Proteções Ativas

- ✅ **Rate Limiting**: Proteção contra abuso e brute force
- ✅ **HTTPS Obrigatório**: Todas as conexões criptografadas (TLS 1.3)
- ✅ **HSTS**: Header forçando HTTPS por 1 ano
- ✅ **CSP**: Content Security Policy bloqueando scripts maliciosos
- ✅ **CSRF Protection**: Tokens anti-falsificação
- ✅ **SQL Injection**: Queries parametrizadas (Django ORM)

---

## ❓ FAQ - Perguntas Frequentes

### Geral

**P: Posso usar meu próprio domínio?**
R: Sim! No **Plano Pro** e acima, você pode configurar um domínio customizado (ex: `feedbacks.suaempresa.com`).

**P: Os dados são compartilhados entre clientes?**
R: **Não!** Cada tenant (empresa) tem isolamento total de dados. Nenhum cliente vê dados de outro.

**P: Posso migrar de outro sistema?**
R: Sim! Entre em contato com nosso suporte para importação via CSV.

### Planos e Pagamento

**P: O que acontece se eu ultrapassar o limite de feedbacks?**
R: Você receberá um alerta quando atingir 80% do limite. Ao atingir 100%, novos feedbacks serão bloqueados até o próximo mês ou upgrade.

**P: Posso fazer downgrade?**
R: Sim, mas funcionalidades premium serão desabilitadas imediatamente.

**P: Há desconto para pagamento anual?**
R: Sim! 20% de desconto ao escolher pagamento anual.

### Técnico

**P: O Ouvify tem API REST?**
R: Sim! Documentação completa em: `suaempresa.ouvify.com/api/docs`

**P: Vocês tem SLA de uptime?**
R: Sim! **99.9% de uptime** garantido no **Plano Enterprise**.

**P: Onde os dados são armazenados?**
R: Backend hospedado na **Render** (USA/Europa - escolha na configuração).
Frontend na **Vercel Edge Network** (CDN global).

**P: Fazem backup dos dados?**
R: Sim! Backups automáticos **diários** com retenção de 30 dias.

### Segurança

**P: Vocês vendem meus dados?**
R: **Jamais!** Leia nossa [Política de Privacidade](https://ouvify.com/privacidade) para detalhes.

**P: Funcionários da Ouvify podem ver meus feedbacks?**
R: Apenas em casos de suporte técnico **com sua autorização expressa**.

**P: E se eu esquecer minha senha?**
R: Use a opção **"Esqueci minha senha"** no login. Você receberá um link de reset por email.

---

## 📞 Suporte

**Email**: suporte@ouvify.com
**Chat ao vivo**: Disponível no dashboard (Planos Pro+)
**Base de Conhecimento**: https://help.ouvify.com
**Status da Plataforma**: https://status.ouvify.com

---

**Powered by Ouvify** 🚀 | Versão 1.0.0 | © 2026
