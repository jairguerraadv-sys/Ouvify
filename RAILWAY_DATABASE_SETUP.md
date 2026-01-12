# 🚀 Configuração de Banco de Dados no Railway

## Problema Identificado
A aplicação estava tentando conectar ao PostgreSQL em `localhost:5432`, mas em Railway o banco deve ser configurado via variáveis de ambiente.

## Solução Implementada

O `settings.py` foi atualizado para:
1. **Suportar `DATABASE_URL`** - A forma padrão do Railway passar credenciais
2. **Fallback para variáveis individuais** - Para desenvolvimento local
3. **Suporte a SQLite** - Para testes

## Variáveis de Ambiente Necessárias no Railway

### Opção 1: Usar Banco de Dados PostgreSQL do Railway (RECOMENDADO)

1. **Adicionar plugin PostgreSQL no Railway:**
   - Dashboard → Seu projeto → "Add Plugin" → PostgreSQL
   - Railway cria automaticamente a variável `DATABASE_URL`

2. **Variáveis obrigatórias:**
   ```
   DEBUG=False
   SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
   ALLOWED_HOSTS=*.railway.app,yourdomain.com
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **Variáveis opcionais (Stripe):**
   ```
   STRIPE_API_KEY=sk_test_xxx...
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

### Opção 2: Banco Externo (ex: AWS RDS, Digital Ocean)

```
DEBUG=False
SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
DATABASE_URL=postgresql://username:password@external-host.com:5432/dbname
ALLOWED_HOSTS=*.railway.app
```

### Opção 3: Desenvolvimento Local

```
DEBUG=True
SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
DB_ENGINE=sqlite
```

## Passo a Passo - Railway Dashboard

### 1. Acessar Variáveis de Ambiente
```
Dashboard → Seu Projeto → Variables (ou Environment)
```

### 2. Adicionar Variáveis
Clique em "New Variable" e adicione:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `DEBUG` | `False` | ✅ |
| `SECRET_KEY` | `HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!` | ✅ |
| `ALLOWED_HOSTS` | `*.railway.app,yourdomain.com` | ✅ |
| `DATABASE_URL` | `(auto-generated se usar plugin PostgreSQL)` | ✅ |
| `STRIPE_API_KEY` | `sk_test_...` | ❌ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ❌ |

### 3. Adicionar Plugin PostgreSQL (Se não houver BD)
```
Railway Dashboard → + (Add Plugin) → PostgreSQL
→ Aceitar termos → Conectar ao projeto
→ DATABASE_URL será criada automaticamente
```

### 4. Deploy
```
git push origin main
Railway detecta alterações e faz deploy automático
```

## Verificação

### Local
```bash
# Teste com variáveis de ambiente
export DEBUG=False
export SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
export DATABASE_URL=postgresql://user:pass@localhost:5432/ouvy_db

python manage.py migrate
python manage.py runserver
```

### Em Railway
Após fazer deploy, verifique os logs:
```
Railway Dashboard → Logs
Procure por:
✅ "✅ Banco de dados configurado via DATABASE_URL"
✅ "Migrations foram aplicadas com sucesso"
```

## Solução de Problemas

### Erro: "connection refused"
**Causa:** DATABASE_URL não configurada corretamente
**Solução:** 
1. Ir para Railway Dashboard
2. Verificar se `DATABASE_URL` está presente em Variables
3. Se não houver, adicionar plugin PostgreSQL

### Erro: "psycopg2.OperationalError: FATAL: password authentication failed"
**Causa:** Credenciais incorretas
**Solução:**
1. Copiar DATABASE_URL exato do Railway
2. Cole em Variables como `DATABASE_URL`
3. Aguarde redeploy automático

### Erro: "no such table: django_migrations"
**Causa:** Migrations não foram aplicadas
**Solução:**
1. SSH no container do Railway (se disponível)
2. Execute: `python manage.py migrate`
3. Ou configure webhook de deploy com script de migrations

## Variáveis de Produção - Template Final

```
DEBUG=False
SECRET_KEY=HB)Wn*W)RlgtV=4x_V2ijcf$SWhneBobEN1!-o_UWo2(Ff(#r!
ALLOWED_HOSTS=*.railway.app,www.ouvy-saas.com,ouvy-saas.com
DATABASE_URL=postgresql://user:password@host:5432/ouvy_prod
STRIPE_API_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
LANGUAGE_CODE=pt-br
TIME_ZONE=America/Sao_Paulo
```

## Próximas Etapas

1. ✅ Código atualizado com suporte a DATABASE_URL
2. ✅ `dj-database-url` adicionado a requirements.txt
3. ⏳ **PRÓXIMO:** Configurar variáveis no Railway Dashboard
4. ⏳ **PRÓXIMO:** Fazer deploy: `git push origin main`
5. ⏳ **PRÓXIMO:** Verificar logs no Railway

## Referências

- [Railway Database Documentation](https://docs.railway.app/guides/databases)
- [dj-database-url](https://github.com/jazzband/dj-database-url)
- [Django Database Configuration](https://docs.djangoproject.com/en/6.0/ref/settings/#databases)
