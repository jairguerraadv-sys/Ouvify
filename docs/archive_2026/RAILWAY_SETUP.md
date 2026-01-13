# 🚀 GUIA DE CONFIGURAÇÃO - RAILWAY

## Problema Identificado

Container falha ao iniciar com erro:
```
ValueError: 🔴 ERRO DE SEGURANÇA: SECRET_KEY não configurada em produção!
```

## Solução - Configurar Variáveis de Ambiente no Railway

### ✅ PASSO 1: Gerar uma Nova SECRET_KEY

Execute localmente:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Exemplo de output:
```
ab-3$2h5k)9x@1qw8z7^mno4p(rs_tuvw!xyz&12345abcde
```

**Copie esta chave!** ← Será usada no Railway

### ✅ PASSO 2: Adicionar SECRET_KEY no Railway

#### Opção A: Via Dashboard Railway (Mais Fácil)

1. Acesse: https://railway.app/project/seu-projeto
2. Clique em **Variables** ou **Environment**
3. Clique em **Add Variable**
4. **Name**: `SECRET_KEY`
5. **Value**: Cole a chave gerada (ex: `ab-3$2h5k)9x@1qw8z7^mno4p(rs_tuvw!xyz&12345abcde`)
6. Clique em **Save/Deploy**

#### Opção B: Via CLI Railway

```bash
# Install Railway CLI (se não tiver)
npm install -g @railway/cli

# Login
railway login

# Dentro do projeto
cd /Users/jairneto/Desktop/ouvy_saas

# Set variable
railway variables set SECRET_KEY="ab-3$2h5k)9x@1qw8z7^mno4p(rs_tuvw!xyz&12345abcde"

# Deploy
railway up
```

### ✅ PASSO 3: Verificar se a Variável foi Configurada

No Railway Dashboard:
1. Vá para **Variables** 
2. Procure por `SECRET_KEY`
3. Você deve ver: `SECRET_KEY = ab-3$2h5k)9x@1qw8z7^mno4p(rs_tuvw!xyz&12345abcde`

### ✅ PASSO 4: Triggar Novo Deploy

Após adicionar a variável:

1. Clique em **Deploy** (ou push para repository)
2. Aguarde o build completar (~2-3 minutos)
3. Verifique os logs para confirmar sucesso

Expected logs:
```
✅ SECRET_KEY carregado de ambiente com sucesso.
```

---

## 📋 Outras Variáveis Recomendadas

Além de `SECRET_KEY`, adicione também:

| Variável | Valor | Notas |
|----------|-------|-------|
| `DEBUG` | `False` | NUNCA coloque True em produção |
| `ALLOWED_HOSTS` | `seu-dominio.com` | Seu domínio real |
| `DATABASE_URL` | `postgres://...` | Banco de dados (Railway cria automaticamente) |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` | Chave pública Stripe (produção) |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Chave secreta Stripe (produção) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook Stripe |

---

## 🛠️ Troubleshooting

### Erro: "SECRET_KEY não configurada"

**Solução**: Adicionar `SECRET_KEY` ao Railway Variables (veja PASSO 2)

### Erro: "Variable not set after deploy"

**Solução**: 
1. Verifique se você clicou em **Save**
2. Triggar novo deploy após salvar
3. Aguarde ~2 minutos

### Build continua falhando?

1. Verifique os logs do Railway
2. Procure por: `ValueError: 🔴 ERRO DE SEGURANÇA`
3. Se encontrar, SECRET_KEY ainda não foi configurada

---

## ✅ Verificação Final

Se tudo funcionar:

1. Logs mostrarão: ✅ SUCCESS
2. URL do Railway estará ativa (https://seu-dominio-railway.app)
3. Acessar a aplicação sem erros

---

## 🔐 Segurança

⚠️ **IMPORTANTE**:

- **NUNCA** compartilhe sua SECRET_KEY
- **NUNCA** commite SECRET_KEY no Git
- **NUNCA** use a mesma SECRET_KEY em múltiplos ambientes
- **SEMPRE** gere uma NOVA chave por ambiente (dev/staging/prod)

---

**Criado**: 12 de janeiro de 2026  
**Atualizado**: Após erro de produção  
**Status**: Pronto para Deploy
