# ✅ CHECKLIST DEPLOY FINAL - OUVY SAAS
**Data:** 14 de janeiro de 2026  
**Objetivo:** Lista executável de verificação para deploy em produção

---

## 🔴 BLOQUEADORES CRÍTICOS (OBRIGATÓRIO)

### 1. Variáveis de Ambiente

#### Railway (Backend)
```bash
[ ] SECRET_KEY - Gerada aleatoriamente (não usar default)
[ ] DATABASE_URL - Configurado automaticamente pelo Railway
[ ] DEBUG=False
[ ] ALLOWED_HOSTS - Incluir *.railway.app e domínio customizado
[ ] CORS_ALLOWED_ORIGINS - Incluir domínio Vercel
[ ] STRIPE_SECRET_KEY - Chave secreta do Stripe
[ ] STRIPE_WEBHOOK_SECRET - Configurar após criar webhook
[ ] FRONTEND_URL - URL do Vercel
```

**Como validar:**
```bash
# No Railway Dashboard > Variables
# Verificar cada variável está presente e preenchida
# Nunca usar valores de desenvolvimento em produção
```

#### Vercel (Frontend)
```bash
[ ] NEXT_PUBLIC_API_URL - URL completa do Railway (https://...)
[ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Chave pública do Stripe
```

---

### 2. Segurança do Admin Django

#### Mudar URL do Admin
```python
# Arquivo: ouvy_saas/config/urls.py
# ANTES:
path('admin/', admin.site.urls),

# DEPOIS (escolher algo único):
path('painel-admin-secreto-xyz-2026/', admin.site.urls),
```

**Por quê:** Prevenir ataques automatizados de força bruta em `/admin/`

```bash
[ ] URL do admin alterada para algo obscuro
[ ] Testar acesso no novo URL
[ ] Documentar nova URL (em local seguro, não no Git)
```

---

### 3. Configuração Webhook Stripe

#### Passos:
1. Fazer deploy do backend no Railway
2. Copiar URL: `https://[seu-dominio].railway.app/api/tenants/webhook/`
3. Acessar [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
4. Criar novo webhook apontando para a URL acima
5. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copiar "Signing secret" (começa com `whsec_...`)
7. Adicionar no Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

```bash
[ ] Webhook criado no Stripe
[ ] Eventos selecionados corretamente
[ ] Signing secret configurado no Railway
[ ] Testar webhook (enviar evento de teste no Stripe Dashboard)
[ ] Verificar logs no Railway que webhook foi processado
```

---

### 4. Teste de Pagamento Completo

#### Stripe Test Mode (ANTES de ir para produção)
```bash
[ ] Criar conta teste no frontend
[ ] Clicar em "Assinar Starter"
[ ] Usar cartão de teste: 4242 4242 4242 4242
[ ] CVV: 123, Data: 12/34, ZIP: 12345
[ ] Completar checkout no Stripe
[ ] Verificar se voltou para dashboard
[ ] Confirmar no backend que plano foi atualizado
[ ] Verificar logs do webhook (Railway)
[ ] Testar cancelamento de assinatura
[ ] Testar reativação de assinatura
```

**Cartões de teste Stripe:**
- Sucesso: `4242 4242 4242 4242`
- Falha: `4000 0000 0000 0002`
- Requer autenticação: `4000 0025 0000 3155`

---

### 5. Teste de Isolamento Multi-Tenant

#### Criar 2 Tenants e Validar Isolamento
```bash
# Tenant A
[ ] Criar empresa "Empresa A" (subdomínio: empresaa)
[ ] Fazer login como Empresa A
[ ] Criar 3 feedbacks

# Tenant B
[ ] Criar empresa "Empresa B" (subdomínio: empresab)
[ ] Fazer login como Empresa B
[ ] Criar 2 feedbacks

# Validar Isolamento
[ ] Empresa A vê apenas seus 3 feedbacks
[ ] Empresa B vê apenas seus 2 feedbacks
[ ] Tentar acessar feedback da Empresa A com token da Empresa B (deve falhar)
[ ] Verificar que dashboard stats estão corretos para cada empresa
```

**Como testar via API:**
```bash
# Login Empresa A
TOKEN_A=$(curl -X POST https://api/api-token-auth/ -d '{"username":"a@a.com","password":"senha"}' | jq -r .token)

# Login Empresa B
TOKEN_B=$(curl -X POST https://api/api-token-auth/ -d '{"username":"b@b.com","password":"senha"}' | jq -r .token)

# Listar feedbacks A (deve retornar 3)
curl -H "Authorization: Token $TOKEN_A" https://api/api/feedbacks/

# Listar feedbacks B (deve retornar 2)
curl -H "Authorization: Token $TOKEN_B" https://api/api/feedbacks/

# Tentar acessar feedback de A com token de B (deve dar 404)
curl -H "Authorization: Token $TOKEN_B" https://api/api/feedbacks/1/
```

---

### 6. Backup do Banco de Dados

#### Railway
```bash
[ ] Acessar Railway Dashboard > Database
[ ] Verificar se backups automáticos estão habilitados
[ ] Configurar retenção de backups (mínimo 7 dias)
[ ] Fazer backup manual de teste
[ ] Documentar procedimento de restore
```

**Backup Manual (comando):**
```bash
# Conectar ao banco Railway
railway connect postgres

# Fazer backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Testar restore (em ambiente de teste)
psql $DATABASE_URL_TEST < backup_20260114.sql
```

---

## 🟡 VERIFICAÇÕES IMPORTANTES

### 7. Health Checks

```bash
[ ] GET https://[backend-url]/health/ retorna 200
[ ] GET https://[backend-url]/ready/ retorna 200
[ ] Frontend carrega em https://[frontend-url]
[ ] Frontend consegue se comunicar com backend (sem erro CORS)
```

---

### 8. Smoke Tests Pós-Deploy

#### Fluxos Críticos
```bash
[ ] Cadastro de novo tenant funciona
[ ] Login com email/senha funciona
[ ] Enviar feedback público (sem auth) funciona
[ ] Consultar protocolo funciona
[ ] Dashboard carrega com dados corretos
[ ] Lista de feedbacks carrega (com paginação)
[ ] Adicionar resposta a feedback funciona
[ ] Mudar status de feedback funciona
[ ] Password reset envia email (se configurado)
[ ] Checkout Stripe abre corretamente
```

---

### 9. Testes de Segurança

```bash
[ ] HTTPS enforced (HTTP redireciona para HTTPS)
[ ] Headers de segurança presentes (X-Frame-Options, CSP, etc)
[ ] Admin Django NÃO acessível em /admin/ (retorna 404)
[ ] Admin Django acessível apenas no novo URL
[ ] Rate limiting funcionando:
    - Consultar protocolo: 5/minuto (testar exceder)
    - Password reset: 3/hora (testar exceder)
    - Criar feedback: 100/hora (difícil testar, validar código)
[ ] Tentativa de SQL injection falha (ex: ' OR 1=1--)
[ ] Tentativa de XSS falha (ex: <script>alert('XSS')</script>)
```

**Testar Headers de Segurança:**
```bash
curl -I https://[backend-url] | grep -E "(X-Frame|X-Content|Strict-Transport)"

# Deve conter:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
```

---

### 10. Performance Básica

```bash
[ ] Lighthouse score > 85 (https://pagespeed.web.dev)
[ ] Tempo de resposta API < 500ms (média):
    - GET /api/feedbacks/ < 500ms
    - GET /api/feedbacks/dashboard-stats/ < 300ms
    - POST /api/feedbacks/ < 400ms
[ ] Página inicial carrega em < 2s
[ ] Dashboard carrega em < 3s
[ ] Sem erros no console do browser
[ ] Sem warnings críticos no console
```

**Testar tempo de resposta:**
```bash
time curl -H "Authorization: Token $TOKEN" https://api/api/feedbacks/
# Deve retornar em < 0.5s
```

---

### 11. Logs e Monitoring

```bash
[ ] Logs do Railway estão sendo gerados corretamente
[ ] Logs do Vercel estão sendo gerados corretamente
[ ] Nenhum erro 500 nos logs (últimas 24h)
[ ] Configurar alerta de downtime (UptimeRobot, Pingdom)
[ ] (Opcional) Configurar Sentry para error tracking
```

---

### 12. DNS e Domínio (Se usar domínio próprio)

```bash
[ ] Registro A apontando para Railway IP (backend)
[ ] Registro CNAME apontando para Vercel (frontend)
[ ] Registro wildcard *.ouvy.com para subdomínios
[ ] SSL certificado emitido (automático Railway/Vercel)
[ ] Testar: https://ouvy.com
[ ] Testar: https://empresaa.ouvy.com
[ ] Aguardar propagação DNS (24-48h)
```

---

## 🟢 MELHORIAS DESEJÁVEIS (Pós-Deploy)

### 13. Invalidação de Token no Logout
```python
# Implementar endpoint para invalidar token
# DELETE /api/logout/
# Token deve ser removido do banco ou marcado como inválido
```

### 14. Cache (Redis)
```bash
[ ] Configurar Redis Addon no Railway
[ ] Implementar cache de tenant_info (1 hora)
[ ] Implementar cache de dashboard_stats (5 minutos)
[ ] Testar invalidação de cache ao criar feedback
```

### 15. Error Tracking (Sentry)
```bash
[ ] Criar conta no Sentry.io
[ ] Adicionar Sentry DSN no Railway e Vercel
[ ] Testar captura de erros (forçar erro 500)
[ ] Configurar alertas por email/Slack
```

### 16. Adição do Campo `autor` no Feedback
```python
# Migration necessária:
# python manage.py makemigrations
# python manage.py migrate

# Permitirá rastrear quem criou cada feedback
# Útil para auditoria e analytics
```

### 17. White Label Completo (Cores)
```python
# Implementar no backend:
# - Permitir alterar cor_primaria e cor_secundaria
# - Retornar cores no /api/tenant-info/

# Implementar no frontend:
# - Injetar cores como CSS variables
# - Aplicar em botões, links, badges
```

---

## 📊 CHECKLIST RESUMIDO (Copy-Paste)

```
🔴 CRÍTICO (Bloqueadores)
[ ] 1. Variáveis de ambiente configuradas (Railway + Vercel)
[ ] 2. URL do admin Django alterada (segurança)
[ ] 3. Webhook Stripe configurado e testado
[ ] 4. Teste completo de pagamento (Stripe test mode)
[ ] 5. Teste de isolamento multi-tenant (2 empresas)
[ ] 6. Backup do banco configurado

🟡 IMPORTANTE (Validações)
[ ] 7. Health checks respondendo (200 OK)
[ ] 8. Smoke tests pós-deploy (todos fluxos críticos)
[ ] 9. Testes de segurança (HTTPS, headers, rate limit)
[ ] 10. Performance básica (Lighthouse > 85, API < 500ms)
[ ] 11. Logs e monitoring configurados
[ ] 12. DNS e domínio (se aplicável)

🟢 DESEJÁVEL (Pós-Deploy)
[ ] 13. Invalidação de token no logout
[ ] 14. Cache (Redis) implementado
[ ] 15. Error tracking (Sentry) configurado
[ ] 16. Campo autor no Feedback adicionado
[ ] 17. White label completo (cores customizáveis)
```

---

## 🚨 ROLLBACK PLAN (Se algo der errado)

### Cenário: Deploy com erro crítico

#### Railway (Backend)
```bash
1. Acessar Railway Dashboard
2. Deployments > Selecionar deploy anterior (que funcionava)
3. Clicar em "Redeploy"
4. Aguardar rollback completar
5. Verificar health checks
```

#### Vercel (Frontend)
```bash
1. Acessar Vercel Dashboard
2. Deployments > Selecionar deploy anterior
3. Clicar em "Promote to Production"
4. Aguardar rollback completar
5. Verificar site funcionando
```

#### Banco de Dados (Se necessário)
```bash
1. Acessar Railway > Database
2. Backups > Selecionar backup anterior
3. Clicar em "Restore"
4. CUIDADO: Dados entre backup e agora serão perdidos
5. Notificar usuários sobre possível perda de dados
```

---

## 📞 CONTATOS IMPORTANTES

```
Railway Support: https://railway.app/help
Vercel Support: https://vercel.com/support
Stripe Support: https://support.stripe.com
GitHub Issues: https://github.com/jairguerraadv-sys/ouvy-saas/issues
```

---

## ✅ ASSINATURA DE CONCLUSÃO

```
Data do Deploy: ___/___/2026
Horário: ___:___
Responsável: _________________

Todos os itens críticos foram verificados: [ ] SIM [ ] NÃO
Deploy aprovado para produção: [ ] SIM [ ] NÃO

Observações:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

**Documento criado em:** 14 de janeiro de 2026  
**Versão:** 1.0  
**Última atualização:** 14 de janeiro de 2026
