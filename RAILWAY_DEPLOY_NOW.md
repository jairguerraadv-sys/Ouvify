# 🚀 PRÓXIMOS PASSOS - Deploy no Railway

## ✅ Correções Aplicadas

1. **DATABASE_URL Support** - Agora a aplicação suporta a forma padrão do Railway
2. **dj-database-url** - Adicionado ao requirements.txt
3. **settings.py Atualizado** - Prioridade correta de conexão com banco

## 📋 Checklist para Deploy

### 1. Adicionar PostgreSQL no Railway (se não tiver)
```
Dashboard → Seu Projeto → "+ Add" → Plugin → PostgreSQL
→ Railway cria automaticamente DATABASE_URL
```

### 2. Configurar Variáveis de Ambiente
No Railway Dashboard → Variables, adicione:

```
DEBUG=False
SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
ALLOWED_HOSTS=*.railway.app
```

**PostgreSQL**: Railway gera `DATABASE_URL` automaticamente quando você adiciona o plugin

**Stripe** (opcional, se usar):
```
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Atualizar requirements.txt no servidor
```bash
pip install -r requirements.txt
# Instala: dj-database-url==2.1.0
```

### 4. Aplicar Migrations
```bash
python manage.py migrate
```

### 5. Deploy
```bash
git push origin main
# Railway detecta alterações e faz redeploy automático
```

## 🔍 Verificação

Após deploy, verifique os logs do Railway:

✅ **Sucesso - procure por:**
```
✅ Banco de dados configurado via DATABASE_URL
✅ Running on http://0.0.0.0:8000
```

❌ **Erro - procure por:**
```
connection refused
psycopg2.OperationalError
password authentication failed
```

## 📚 Documentação Completa

Veja `RAILWAY_DATABASE_SETUP.md` para instruções detalhadas.

## 🆘 Solução de Problemas

### "connection to server at "localhost" (::1), port 5432 failed"
→ DATABASE_URL não está configurada
→ Verifique Railway Dashboard → Variables

### "FATAL: password authentication failed"
→ Credenciais incorretas em DATABASE_URL
→ Copie exatamente do Railway Dashboard

### Migrations não aplicadas
→ SSH no container: `railway shell`
→ Execute: `python manage.py migrate`

## 📞 Suporte

Todos os arquivos necessários estão no repositório:
- `RAILWAY_DATABASE_SETUP.md` - Guia completo
- `RAILWAY_SETUP.md` - Configuração anterior (SECRET_KEY)
- `DEPLOYMENT_CHECKLIST.md` - Checklist geral

---

**Última atualização:** 2026-01-12
**Versão:** v1.0 com DATABASE_URL support
