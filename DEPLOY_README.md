# 🚀 Deploy - Escolha seu Método

## 📚 Guias Disponíveis

### 1. **DEPLOY_DASHBOARD.md** ⭐ RECOMENDADO
Deploy visual via Railway e Vercel dashboards (mais fácil para iniciantes).

**Quando usar:** Primeira vez fazendo deploy, preferência por interface visual

**Tempo estimado:** 15-20 minutos

### 2. **DEPLOY_SIMPLES.md** 
Guia passo a passo simplificado via CLI com comandos diretos.

**Quando usar:** Experiência com CLI, quer deploy rápido

**Tempo estimado:** 10-15 minutos

### 3. **DEPLOY_INSTRUCTIONS.md**
Guia completo e detalhado com troubleshooting extensivo.

**Quando usar:** Referência completa, problemas específicos

**Tempo estimado:** Leitura de referência

### 4. **deploy.sh** 
Script automatizado interativo para deploy.

**Quando usar:** Quer automação máxima, múltiplos deploys

**Como usar:** `./deploy.sh`

---

## 🎯 Recomendação Rápida

### Primeira vez?
👉 Use **DEPLOY_DASHBOARD.md**
- Mais visual e intuitivo
- Menos chance de erro
- Ótimo para aprender

### Já conhece Railway/Vercel?
👉 Use **DEPLOY_SIMPLES.md**
- Comandos diretos
- Deploy em 10 minutos
- Referência rápida

### Quer automação?
👉 Execute **./deploy.sh**
- Menu interativo
- Configuração guiada
- Testes automatizados

---

## ✅ Checklist Pré-Deploy

Antes de começar qualquer deploy:

- [x] Código commitado e pushed no GitHub
- [x] SECRET_KEY gerada no `.env`
- [ ] Conta criada no Railway
- [ ] Conta criada no Vercel
- [ ] CLIs instaladas (se usar método CLI)

---

## 🚀 Início Rápido (CLI)

```bash
# 1. Instalar CLIs
curl -fsSL https://railway.app/install.sh | sh
npm install -g vercel

# 2. Deploy Backend
cd ouvy_saas
railway login
railway init
railway up

# 3. Deploy Frontend
cd ../ouvy_frontend
vercel login
vercel --prod

# 4. Testar
curl https://seu-backend.railway.app/health/
open https://seu-frontend.vercel.app
```

---

## 🌐 Início Rápido (Dashboard)

1. **Railway:** https://railway.app/dashboard
   - New Project → From GitHub → ouvy-saas
   - Root Directory: `ouvy_saas`
   - Add PostgreSQL
   - Configure variáveis
   - Deploy

2. **Vercel:** https://vercel.com/dashboard
   - New Project → Import ouvy-saas
   - Root Directory: `ouvy_frontend`
   - Add env: NEXT_PUBLIC_API_URL
   - Deploy

3. **Atualizar CORS** no Railway com URL Vercel

4. **Testar** ambos os ambientes

---

## 📊 Após Deploy

### URLs para testar:
```bash
# Backend
https://seu-backend.railway.app/health/
https://seu-backend.railway.app/api/tenant-info/
https://seu-backend.railway.app/admin/
https://seu-backend.railway.app/swagger/

# Frontend
https://seu-frontend.vercel.app/
https://seu-frontend.vercel.app/enviar
https://seu-frontend.vercel.app/acompanhar
```

### Criar superusuário (opcional):
```bash
cd ouvy_saas
railway run python manage.py createsuperuser
```

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns:
1. **CORS blocked** → Verificar `CORS_ALLOWED_ORIGINS` no Railway
2. **500 Error** → Ver logs: `railway logs` ou Vercel dashboard
3. **Build failed** → Verificar `requirements.txt` ou `package.json`
4. **Database error** → Confirmar PostgreSQL adicionado no Railway

### Documentação Extra:
- `/docs/auditorias/` - Relatórios de auditoria
- `/docs/PLANO_AUDITORIA_COMPLETO.md` - Plano completo
- `REVISAO_MICRO_FRONTEND.md` - Detalhes do frontend

---

## 🎉 Sucesso no Deploy!

Após seguir qualquer um dos guias, você terá:
- ✅ Backend Django no Railway com PostgreSQL
- ✅ Frontend Next.js no Vercel
- ✅ Integração funcionando
- ✅ CORS configurado
- ✅ SSL/HTTPS habilitado

**Próximos passos:**
1. Configurar domínio customizado
2. Adicionar Stripe webhooks
3. Configurar monitoramento (Sentry)
4. Backup do banco de dados

---

*Última atualização: 14/01/2026*  
*Ouvy SaaS - White Label Feedback Platform*
