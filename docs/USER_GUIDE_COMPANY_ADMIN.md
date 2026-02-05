# 📋 Guia do Administrador da Empresa - Ouvify

**Versão:** 1.0  
**Data:** 05 de Fevereiro de 2026  
**Para:** Administradores de empresas que usam o Ouvify

---

## 📖 Índice

1. [Primeiros Passos](#1-primeiros-passos)
2. [Configuração Inicial](#2-configuração-inicial)
3. [Gestão de Equipe](#3-gestão-de-equipe)
4. [Gerenciamento de Feedbacks](#4-gerenciamento-de-feedbacks)
5. [Analytics e Relatórios](#5-analytics-e-relatórios)
6. [Configurações Avançadas](#6-configurações-avançadas)
7. [Billing e Assinatura](#7-billing-e-assinatura)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Primeiros Passos

### 1.1 Como criar conta da empresa

1. Acesse [ouvify.vercel.app/cadastro](https://ouvify.vercel.app/cadastro)
2. Preencha os dados da empresa:
   - **Razão Social:** Nome oficial da empresa
   - **CNPJ:** Identificação fiscal
   - **Email empresarial:** Será usado para login e notificações
   - **Senha forte:** Mínimo 8 caracteres, letras e números
3. Escolha um **subdomínio** único:
   - Exemplo: se escolher "minhaempresa", seu canal será `minhaempresa.ouvify.com`
   - Este endereço será usado pelos seus clientes para enviar feedbacks
4. Aceite os termos de uso e política de privacidade
5. Clique em **"Criar Conta"**
6. Verifique seu email (pode chegar em spam)
7. Clique no link de verificação

**Pronto!** Você criou sua conta e já pode acessar o dashboard.

### 1.2 Tour pela Interface

Após fazer login, você verá:

**📊 Dashboard Principal** (`/dashboard`)
- Visão geral de feedbacks recebidos
- Métricas rápidas: total, novos hoje, em análise, resolvidos
- Gráficos de tendências

**📝 Feedbacks** (`/dashboard/feedbacks`)
- Lista de todos os feedbacks recebidos
- Filtros por status, tipo, prioridade, data
- Busca por palavras-chave ou protocolo

**👥 Equipe** (`/dashboard/equipe`)
- Membros da sua equipe
- Convites pendentes
- Gerenciamento de roles (Owner/Admin/Viewer)

**⚙️ Configurações** (`/dashboard/configuracoes`)
- Personalização do white label (logo, cores)
- Webhooks
- Notificações

**📈 Analytics** (`/dashboard/analytics`)
- Estatísticas detalhadas
- Exportar relatórios

**💳 Assinatura** (`/dashboard/assinatura`)
- Plano atual
- Uso, billing

---

## 2. Configuração Inicial

### 2.1 Personalizar White Label (Branding)

Deixe o canal com a cara da sua empresa:

1. Vá em **Configurações** > **Aparência**
2. **Upload do Logo:**
   - Tamanho recomendado: 200x200px
   - Formatos: PNG, JPG, SVG
   - Aparecerá na página de feedback dos seus clientes
3. **Cores Primária e Secundária:**
   - Escolha cores que combinem com sua marca
   - Use o seletor de cores ou insira código HEX
   - Preview automático
4. **Mensagem de Boas-Vindas** (opcional):
   - Texto que aparece no topo da página de feedback
   - Exemplo: "Sua opinião é importante! Envie seu feedback."
5. Clique em **"Salvar Alterações"**

**Dica:** Teste o link público (`{seu-subdominio}.ouvify.com`) para ver como seus clientes verão.

###2.2 Configurar Domínio Personalizado (Opcional)

Quer usar `feedback.minhaempresa.com` em vez de `minhaempresa.ouvify.com`?

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
