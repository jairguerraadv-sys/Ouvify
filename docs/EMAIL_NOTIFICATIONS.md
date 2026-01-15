# Sistema de Notificações por Email - Ouvy

## 📧 Visão Geral

Sistema automático de notificações por email implementado com **Django Signals**, que envia emails automaticamente quando:

- ✅ **Novo feedback** é criado
- ✅ **Nova resposta/interação** é adicionada
- ✅ **Status do feedback** é alterado

---

## 🏗️ Arquitetura

### **Componentes**

```
apps/feedbacks/signals.py    # Django signals (triggers automáticos)
apps/feedbacks/apps.py        # Registro dos signals
apps/core/email_service.py    # Serviço de envio de emails
config/settings.py            # Configurações SMTP
```

### **Fluxo de Notificação**

```
1. Feedback.objects.create()
   ↓
2. Signal post_save disparado
   ↓
3. notificar_novo_feedback() executado
   ↓
4. EmailService.send_new_feedback_notification()
   ↓
5. Email enviado via SMTP
```

---

## 📡 Signals Implementados

### **1. Novo Feedback (`notificar_novo_feedback`)**

**Quando:** Feedback é criado (`created=True`)  
**Para:** Email do `tenant.owner`  
**Template:** HTML responsivo com detalhes do feedback

```python
# Exemplo de uso (automático):
feedback = Feedback.objects.create(
    client=tenant,
    titulo="Bug no checkout",
    descricao="Botão não funciona",
    tipo="BUG"
)
# Email enviado automaticamente! ✉️
```

### **2. Nova Resposta (`notificar_resposta_feedback`)**

**Quando:** Interação/resposta criada no feedback  
**Para:** Email do `tenant.owner`  
**Status:** Preparado para implementação no EmailService

```python
# Exemplo de uso (automático):
interacao = Interacao.objects.create(
    feedback=feedback,
    usuario=request.user,
    mensagem="Corrigido na versão 2.1"
)
# Email de resposta enviado! 💬
```

### **3. Mudança de Status (`notificar_mudanca_status`)**

**Quando:** Status do feedback é alterado  
**Para:** Email do `tenant.owner`  
**Rate Limit:** 1 email por feedback a cada 5 minutos  
**Status:** Preparado para implementação no EmailService

```python
# Exemplo de uso (automático):
feedback.status = "RESOLVIDO"
feedback.save()
# Email de status enviado! 🔄
```

---

## ⚙️ Configuração

### **1. Variáveis de Ambiente (.env)**

```bash
# =============================================================================
# EMAIL CONFIGURATION (SMTP)
# =============================================================================

# Provider: sendgrid, ses, mailgun, gmail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx

# From Email
DEFAULT_FROM_EMAIL=Ouvy <no-reply@ouvy.com.br>

# Base URL (para links nos emails)
BASE_URL=https://app.ouvy.com.br
```

### **2. Provedores Suportados**

#### **SendGrid (Recomendado)**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.your_api_key_here
```

#### **Gmail**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
```

#### **AWS SES**
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_HOST_USER=AKIA...
EMAIL_HOST_PASSWORD=your-smtp-password
```

#### **Mailgun**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.seudominio.com
EMAIL_HOST_PASSWORD=sua-senha
```

---

## 🧪 Testes

### **Testar Notificação Manual**

```python
# Django shell
python manage.py shell

from apps.core.models import Client
from apps.feedbacks.models import Feedback

# Criar feedback (email enviado automaticamente)
tenant = Client.objects.first()
feedback = Feedback.objects.create(
    client=tenant,
    titulo="Teste de Notificação",
    descricao="Verificando se email funciona",
    tipo="SUGESTAO"
)

# Verificar logs
# ✅ Notificação enviada para owner@email.com - Feedback OUV-123456
```

### **Testar Rate Limiting**

```python
from apps.feedbacks.signals import desativar_notificacoes_temporariamente

# Desativar por 1 hora (útil para fixtures)
desativar_notificacoes_temporariamente(3600)

# Criar múltiplos feedbacks sem spam de emails
for i in range(100):
    Feedback.objects.create(...)

# Reativar
from apps.feedbacks.signals import reativar_notificacoes
reativar_notificacoes()
```

---

## 🛠️ Debugging

### **1. Verificar se Signals Estão Registrados**

```python
from django.db.models.signals import post_save
from apps.feedbacks.models import Feedback

# Listar receivers registrados
print(post_save.receivers)
# Deve incluir notificar_novo_feedback
```

### **2. Verificar Emails no Console (Desenvolvimento)**

```bash
# Em development, emails são impressos no console
python manage.py runserver

# Criar feedback...
# Email aparece no terminal! 📧
```

### **3. Logs**

```python
import logging
logger = logging.getLogger('apps.feedbacks.signals')

# Logs gerados:
# ✅ Notificação enviada para email@example.com - Feedback OUV-123456
# ⚠️ Falha ao enviar notificação - Feedback OUV-789012
# ⏱️ Rate limit ativo - Notificação ignorada
```

---

## 📊 Monitoramento

### **Verificar Notificações Ativas**

```python
from apps.feedbacks.signals import notificacoes_estao_ativas

if notificacoes_estao_ativas():
    print("✅ Notificações ativas")
else:
    print("🔕 Notificações desativadas temporariamente")
```

### **Métricas (Railway/Logs)**

```bash
# Ver emails enviados
grep "✅ Notificação enviada" logs/django.log | wc -l

# Ver falhas
grep "❌ Erro ao processar notificação" logs/django.log

# Rate limits ativados
grep "⏱️ Rate limit ativo" logs/django.log
```

---

## 🔒 Segurança

### **1. Validações Implementadas**

- ✅ Verifica se `tenant.owner` existe
- ✅ Verifica se `owner.email` está configurado
- ✅ Rate limiting para mudanças de status (5 min)
- ✅ Try/catch em todos os signals (não quebra se email falhar)
- ✅ Logs detalhados para auditoria

### **2. Proteção contra Spam**

```python
# Mudanças rápidas de status = apenas 1 email/5min
feedback.status = "EM_ANALISE"
feedback.save()  # ✅ Email enviado

feedback.status = "RESOLVIDO"
feedback.save()  # ⏱️ Bloqueado (rate limit)

# Após 5 minutos...
feedback.status = "FECHADO"
feedback.save()  # ✅ Email enviado
```

---

## 🚀 Deploy

### **Railway**

```bash
# 1. Adicionar variáveis no Railway Dashboard
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_PASSWORD=SG.xxxxx
DEFAULT_FROM_EMAIL=Ouvy <no-reply@ouvy.com.br>

# 2. Deploy
railway up

# 3. Verificar logs
railway logs
```

### **Vercel (Frontend)**

```bash
# Atualizar BASE_URL no backend
BASE_URL=https://seu-dominio.vercel.app
```

---

## 📈 Próximos Passos

### **Implementar no EmailService:**

1. **`send_feedback_response_notification()`**
   - Email quando há nova resposta
   - Template com preview da mensagem

2. **`send_status_change_notification()`**
   - Email quando status muda
   - Destacar status anterior → novo

### **Melhorias Futuras:**

- [ ] Templates personalizados por tenant (White Label)
- [ ] Preferências de notificação (usuário escolhe o que receber)
- [ ] Digest diário (resumo de feedbacks do dia)
- [ ] Webhooks para integrações (Slack, Discord, etc.)

---

## 📚 Referências

- [Django Signals Docs](https://docs.djangoproject.com/en/stable/topics/signals/)
- [Django Email Backend](https://docs.djangoproject.com/en/stable/topics/email/)
- [SendGrid Django Guide](https://sendgrid.com/docs/for-developers/sending-email/django/)

---

## ❓ FAQ

**P: Emails não estão sendo enviados em produção**  
**R:** Verifique:
1. `EMAIL_HOST_PASSWORD` está configurado?
2. `DEBUG=False` no `.env`?
3. Logs mostram erros SMTP?

**P: Como desativar notificações temporariamente?**  
**R:** 
```python
from apps.feedbacks.signals import desativar_notificacoes_temporariamente
desativar_notificacoes_temporariamente(3600)  # 1 hora
```

**P: Posso customizar templates por tenant?**  
**R:** Atualmente não, mas pode ser implementado usando o sistema White Label para aplicar cores/logo personalizados nos emails.

---

**Implementado em:** Janeiro 2026  
**Versão:** 1.0.0  
**Status:** ✅ Produção
