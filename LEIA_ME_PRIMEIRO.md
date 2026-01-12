# 📖 LEIA-ME PRIMEIRO

## Bem-vindo! 🎉

Parabéns! Você tem um **SaaS totalmente funcional** nas mãos. Este documento vai te guiar pelo próximo passo.

---

## 🗺️ Mapa de Navegação

Você tem 4 guias principais. Leia **nesta ordem**:

### 1️⃣ `TESTE_PAGAMENTO.md` ← **COMECE AQUI**
**Tempo:** ~10-15 minutos  
**O que você faz:** Testa o fluxo de pagamento localmente com Stripe

**Pré-requisitos:**
- Backend rodando em `127.0.0.1:8000`
- Frontend rodando em `localhost:3000`
- Stripe CLI instalado (`stripe --version`)

**Objetivo:** Ver o banner mudar de "Free" para "Premium" após uma compra fake

**Checklist:**
- [ ] Leu o guia
- [ ] Iniciou o túnel Stripe (`stripe listen`)
- [ ] Atualizou `.env` com o webhook secret
- [ ] Reiniciou o Django
- [ ] Fez uma compra teste
- [ ] Viu o banner mudar

**Se tudo funcionou:** Parabéns! Seu SaaS vende. Próximo passo → Railway

---

### 2️⃣ `DEPLOY_RAILWAY.md` ← **DEPOIS DISSO**
**Tempo:** ~20-30 minutos  
**O que você faz:** Coloca o Backend + PostgreSQL em produção

**Pré-requisitos:**
- Conta no Railway (railway.app) - **CRIE AGORA**
- Git configurado
- Backend testado localmente

**Objetivo:** Backend rodando em `https://seu-backend.railway.app`

**Checklist:**
- [ ] Conta Railway criada
- [ ] Git repository pronto
- [ ] Procfile criado
- [ ] requirements.txt atualizado
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Deploy via `git push railway main`
- [ ] Backend respondendo em produção

**Se tudo funcionou:** Backend está vivo na internet. Próximo → Vercel

---

### 3️⃣ `DEPLOY_VERCEL.md` ← **DEPOIS DISSO**
**Tempo:** ~15-20 minutos  
**O que você faz:** Coloca o Frontend em produção

**Pré-requisitos:**
- Conta Vercel (vercel.com) - **CRIE AGORA**
- Frontend testado localmente
- Backend já em produção (Railway)

**Objetivo:** Frontend rodando em `https://seu-frontend.vercel.app`

**Checklist:**
- [ ] Conta Vercel criada
- [ ] Variables de ambiente configuradas no Vercel
- [ ] Deploy via `vercel --prod`
- [ ] Frontend respondendo em produção
- [ ] CORS configurado no Railway para aceitar Vercel

**Se tudo funcionou:** SaaS está totalmente em produção 🎉

---

### 4️⃣ `GUIA_COMPLETO_DEPLOYMENT.md` ← **REFERÊNCIA**
**Tempo:** Leitura rápida (10 min)  
**O que é:** Visão geral de tudo + próximos passos

**Use quando:**
- Precisa relembrar a arquitetura
- Quer saber o que fazer depois do deploy
- Precisa de troubleshooting

---

### 📚 `QUICK_REFERENCE.md` ← **CONSULTA RÁPIDA**
**O que é:** Cheat sheet com comandos e URLs

**Use quando:**
- Precisa de um comando rapidinho
- Esqueceu a URL de um endpoint
- Quer diagnosticar um erro

---

## ⚡ TL;DR (Muito Longo; Não Li)

```bash
# 1. Teste local
stripe listen --forward-to localhost:8000/api/tenants/webhook/
# → Vá em http://localhost:3000/planos
# → Teste compra
# → Veja banner mudar

# 2. Deploy backend
cd /Users/jairneto/Desktop/ouvy_saas
git push railway main
# Aguarde ~5 minutos

# 3. Deploy frontend
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
vercel --prod
# Aguarde ~2 minutos

# Pronto! SaaS está vivo 🚀
```

---

## 🎯 O Que Cada Arquivo Faz

| Arquivo | Propósito | Leitor |
|---------|-----------|--------|
| `README_MULTITENANCY.md` | Explicação de multi-tenancy | Desenvolvedor |
| `CONTEXTO_OUVY.md` | Contexto do projeto | Você (passou) |
| `CONTEXTO_FRONTEND.md` | Detalhes do frontend | Frontend dev |
| `SECURITY.md` | Segurança e boas práticas | Devops/Security |
| `TESTE_PAGAMENTO.md` | **Teste local do fluxo de pagamento** | 👈 **COMECE AQUI** |
| `DEPLOY_RAILWAY.md` | Deploy do backend | Backend dev |
| `DEPLOY_VERCEL.md` | Deploy do frontend | Frontend dev |
| `GUIA_COMPLETO_DEPLOYMENT.md` | Visão geral + próximos passos | Você (roadmap) |
| `QUICK_REFERENCE.md` | Cheat sheet | Consulta rápida |

---

## 🚨 Passos Críticos

Não esqueça desses:

### ❌ ERROS COMUNS

1. **Não rodar `stripe listen`** antes de testar
   - Consequência: Webhook não chega, plano não atualiza
   - Solução: `stripe listen --forward-to localhost:8000/api/tenants/webhook/`

2. **Não copiar o `whsec_...` para o `.env`**
   - Consequência: Backend rejeita webhook
   - Solução: Copiar o código que `stripe listen` mostra

3. **Não reiniciar Django** após alterar `.env`
   - Consequência: Variáveis antigas são usadas
   - Solução: Parar (Ctrl+C) e rodar `python manage.py runserver` novamente

4. **Esquecer de adicionar `CORS_ALLOWED_ORIGINS`** no Railway
   - Consequência: Vercel não consegue chamar API do Railway
   - Solução: Adicionar o domínio Vercel em `CORS_ALLOWED_ORIGINS`

5. **Usar `STRIPE_SECRET_KEY`** em variáveis públicas do frontend
   - Consequência: Chave vazada, qualquer um consegue fazer transações
   - Solução: Usar apenas `STRIPE_PUBLIC_KEY` no frontend (prefixo `NEXT_PUBLIC_`)

---

## 🎓 Ordem Recomendada

### Se você é iniciante em SaaS:
1. Leia `CONTEXTO_OUVY.md` para entender a arquitetura
2. Siga `TESTE_PAGAMENTO.md` para ver tudo funcionando
3. Estude `DEPLOY_RAILWAY.md` para aprender deploy
4. Faça `DEPLOY_VERCEL.md` para por no ar
5. Leia `QUICK_REFERENCE.md` para futuras consultas

### Se você é experiente:
1. Vá direto para `TESTE_PAGAMENTO.md`
2. Use `QUICK_REFERENCE.md` como consulta
3. Execute os deploys (Railway + Vercel)

---

## ✅ Checklist Final Antes de Começar

- [ ] Você tem as chaves Stripe?
- [ ] Backend e frontend estão rodando localmente?
- [ ] Stripe CLI está instalado?
- [ ] Você tem conta no Railway?
- [ ] Você tem conta no Vercel?
- [ ] Você tem Git configurado?

Se respondeu "não" a alguma, volta e resolve antes de continuar.

---

## 🎯 Seu Próximo Passo Agora

### ➡️ **Abra `TESTE_PAGAMENTO.md` e siga passo por passo.**

Isso vai levar ~10-15 minutos. Depois você sabe que o sistema funciona.

---

## 💬 Perguntas Frequentes

**P: Preciso de um domínio customizado?**
R: Não obrigatório. Railway e Vercel fornecem URLs grátis. Você pode configurar domínio depois.

**P: Quantas pessoas podem se registrar?**
R: Sem limite. Cada uma vira um tenant separado com seus próprios dados.

**P: Quanto custa rodar isso em produção?**
R: Railway: ~$7/mês (PostgreSQL). Vercel: grátis (até 100GB bandwidth). Stripe: 2.9% + R$0.30 por transação.

**P: Posso testar o webhook sem Stripe CLI?**
R: Sim. Mas precisa pausar a aplicação, ir manualmente no Django Admin e mudar o `plano` para 'starter' pra ver o banner mudar.

**P: E se eu quiser mudar algo depois?**
R: Edita o código, faz `git push` (Railway/Vercel detecta e redeploy automático).

---

## 🎉 Pronto?

**Vá para `TESTE_PAGAMENTO.md` agora!**

boa sorte! 🚀
