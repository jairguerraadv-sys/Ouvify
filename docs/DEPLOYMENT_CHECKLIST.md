🚀 GUIA DE DEPLOYMENT PÓS-AUDITORIA
═══════════════════════════════════════════════════════════════════════════════

Data: 12 de janeiro de 2026
Fase: Code Freeze → Production
Tech Lead QA

═══════════════════════════════════════════════════════════════════════════════
📋 CHECKLIST PRÉ-DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════════

ANTES DE FAZER O MERGE PARA MAIN:
─────────────────────────────────────────────────────────────────────────────

□ 1. Executar Auditoria Completa
   Comando: python audit_master.py
   Esperado: STATUS: SEGURO PARA CODE FREEZE

□ 2. Resolver Issue Crítica: Django SECRET_KEY
   [ ] Gerar nova SECRET_KEY:
       python manage.py shell
       from django.core.management.utils import get_random_secret_key
       print(get_random_secret_key())
   
   [ ] Atualizar .env (desenvolvimento)
   [ ] Atualizar .env.production (produção)

□ 3. Revisar 5 Itens Médios
   [ ] Verificar permission_classes em FeedbackViewSet
   [ ] Adicionar *.pyc ao .gitignore
   [ ] Validar Webhook Stripe
   [ ] Confirmar ESLint TypeScript rules
   [ ] Testar SECRET_KEY loading em settings.py

□ 4. Executar Testes Locais
   [ ] Backend: python manage.py test
   [ ] Frontend: npm test
   [ ] Integração: ./test_full_integration.sh

□ 5. Validar Build
   [ ] Backend build (local): python manage.py check
   [ ] Frontend build: npm run build
   [ ] Sem erros ou warnings críticos

□ 6. Verificar Documentação
   [ ] README.md atualizado
   [ ] Instruções de setup claras
   [ ] Variáveis de ambiente documentadas

□ 7. Git & Merge
   [ ] Commit com mensagem descritiva
   [ ] Push para branch de feature
   [ ] Create Pull Request
   [ ] Code review aprovado
   [ ] Merge para main

═══════════════════════════════════════════════════════════════════════════════
📤 DEPLOY EM STAGING
═══════════════════════════════════════════════════════════════════════════════

PREPARAÇÃO:
─────────────────────────────────────────────────────────────────────────────

1. Verificar Variáveis de Ambiente Staging
   [ ] SECRET_KEY: Única e segura (gerada em produção)
   [ ] DEBUG: False
   [ ] ALLOWED_HOSTS: Domínio de staging
   [ ] STRIPE_KEYS: Teste/Test keys
   [ ] DATABASE_URL: Banco de staging

2. Build & Deploy
   [ ] git pull origin main
   [ ] pip install -r requirements.txt
   [ ] python manage.py migrate
   [ ] python manage.py collectstatic --noinput
   [ ] Iniciar servidor: gunicorn config.wsgi

VALIDAÇÃO EM STAGING:
─────────────────────────────────────────────────────────────────────────────

3. Testes Funcionais
   [ ] Acessar interface de login
   [ ] Criar novo tenant
   [ ] Enviar feedback
   [ ] Consultar protocolo
   [ ] Dashboard funcionando
   [ ] Pagamento (teste Stripe)

4. Testes de Segurança
   [ ] Verificar: curl -i https://staging.yourdomain.com (deve ter HTTPS)
   [ ] Verificar headers de segurança:
       curl -I https://staging.yourdomain.com | grep -i security
   [ ] Verificar: DEBUG está False nos logs
   [ ] Testar rate limiting: Fazer 100+ requisições em 1 minuto

5. Logs & Monitoring
   [ ] Verificar logs (sem errors)
   [ ] Alertas: 0 critical
   [ ] Performance: Tempo resposta < 500ms

6. Teste de Rate Limiting (Crítico)
   [ ] Executar script de teste:
       python test_rate_limiting.py
   [ ] Esperado: 429 (Too Many Requests) após limite

7. Teste de Multi-Tenant
   [ ] Executar script de isolamento:
       python test_isolamento.py
   [ ] Verificar dados isolados por tenant

═══════════════════════════════════════════════════════════════════════════════
🚀 DEPLOY EM PRODUCTION
═══════════════════════════════════════════════════════════════════════════════

PREPARAÇÃO FINAL:
─────────────────────────────────────────────────────────────────────────────

1. Backup do Banco de Dados
   [ ] Fazer backup de toda base de dados atual
   [ ] Verificar integridade: pg_dump -t | pg_restore

2. Variaáveis de Ambiente Produção
   [ ] SECRET_KEY: Nova chave única
   [ ] DEBUG: False (obrigatório)
   [ ] ALLOWED_HOSTS: Seus domínios reais
   [ ] STRIPE_KEYS: Live keys (não test!)
   [ ] DATABASE_URL: Produção PostgreSQL
   [ ] SSL_CERTIFICATE: Caminho para cert
   [ ] LOG_LEVEL: INFO (não DEBUG)

3. Segurança em Produção
   [ ] SECURE_SSL_REDIRECT: True
   [ ] SESSION_COOKIE_SECURE: True
   [ ] CSRF_COOKIE_SECURE: True
   [ ] SESSION_COOKIE_HTTPONLY: True
   [ ] CSRF_COOKIE_HTTPONLY: True

4. Executar Auditoria Final
   [ ] python audit_security.py → Resultado: OK
   [ ] python audit_debug.py → Sem console.log/debugger
   [ ] python audit_typing.py → Tipagem OK

DEPLOY:
─────────────────────────────────────────────────────────────────────────────

5. Executar Migração de Banco
   [ ] python manage.py migrate
   [ ] Verificar: Migração sucedida (sem rollback)

6. Coletar Arquivos Estáticos
   [ ] python manage.py collectstatic --noinput
   [ ] Verificar: Todos os arquivos copiados

7. Iniciar Servidor
   [ ] gunicorn config.wsgi --workers 4 --bind 0.0.0.0:8000
   [ ] Ou: supervisord (para gerenciar processo)

8. Verificar Health Checks
   [ ] curl https://yourdomain.com/health/ → 200 OK
   [ ] curl https://yourdomain.com/api/health/ → 200 OK

PÓS-DEPLOYMENT:
─────────────────────────────────────────────────────────────────────────────

9. Validação Imediata (Primeira 1 hora)
   [ ] Monitorar erro logs (Sentry)
   [ ] Verificar performance (NewRelic, DataDog)
   [ ] Testar critial paths (login, payment, feedback)
   [ ] Validar HTTPS está funcionando
   [ ] Verificar rate limiting ativo

10. Validação Estendida (Próximas 24h)
    [ ] Monitorar uptime (99.9%+ esperado)
    [ ] Verificar alertas de performance
    [ ] Validar backups estão sendo executados
    [ ] Revisar logs de erro
    [ ] Confirmar webhooks Stripe funcionando

11. Monitoramento Contínuo
    [ ] Setup alertas para:
        - 5xx errors
        - Response time > 1s
        - Uptime < 99%
        - Rate limit exceeded
    [ ] Daily health check report
    [ ] Weekly security audit

═══════════════════════════════════════════════════════════════════════════════
🔧 CONFIGURAÇÃO DE AMBIENTE PRODUCTION
═══════════════════════════════════════════════════════════════════════════════

Exemplo para Railway/Heroku:

# Via Dashboard:
1. Settings → Config Vars
2. Adicionar variáveis:
   - SECRET_KEY: [chave gerada]
   - DEBUG: False
   - ALLOWED_HOSTS: yourdomain.com,www.yourdomain.com
   - DATABASE_URL: [PostgreSQL URI]
   - STRIPE_PUBLIC_KEY: pk_live_xxxxx
   - STRIPE_SECRET_KEY: sk_live_xxxxx
   - STRIPE_WEBHOOK_SECRET: whsec_xxxxx

# Via CLI (Railway):
railway variables set SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
railway variables set DEBUG=False
railway deploy

═══════════════════════════════════════════════════════════════════════════════
🔐 SEGURANÇA EM PRODUÇÃO
═══════════════════════════════════════════════════════════════════════════════

Checklist de Segurança Crítica:

□ SSL/TLS
   [ ] Certificado válido (Let's Encrypt OK)
   [ ] HTTPS obrigatório (redirecionar HTTP)
   [ ] HTTP Strict-Transport-Security habilitado

□ Autenticação
   [ ] Tokens JWT com expiração (15 min recomendado)
   [ ] Refresh tokens com expiração (7 dias)
   [ ] Logout clear tokens
   [ ] HttpOnly cookies (não acessível via JS)

□ Autorização
   [ ] permission_classes em todos endpoints
   [ ] Validar ownership de recursos
   [ ] Admin panel com 2FA

□ Rate Limiting
   [ ] 100 req/hora por IP (padrão)
   [ ] 1000 req/hora por token autenticado
   [ ] 429 responses (Too Many Requests)
   [ ] Log de abuso

□ Criptografia
   [ ] Senhas com bcrypt (Django default)
   [ ] Dados sensíveis criptografados em repouso
   [ ] TLS em trânsito

□ Logging & Monitoring
   [ ] Todos eventos críticos logados
   [ ] Alertas para tentativas de acesso não autorizado
   [ ] Logs armazenados seguro (não expostos publicamente)

□ Backup & Recovery
   [ ] Backups automáticos (pelo menos diário)
   [ ] Teste de restauração (teste mensal)
   [ ] Retenção de 30 dias mínimo

□ Dependências
   [ ] Executar: pip check (sem vulnerabilidades)
   [ ] npm audit (no frontend)
   [ ] Atualizar periodicamente

═══════════════════════════════════════════════════════════════════════════════
🆘 ROLLBACK EM CASO DE PROBLEMA
═══════════════════════════════════════════════════════════════════════════════

Se algo der errado em produção (nos primeiros minutos):

1. STOP IMEDIATO:
   [ ] Desativar load balancer (pointing a versão anterior)
   [ ] Ou: Revert deployment no Railway/Heroku

2. INVESTIGAÇÃO:
   [ ] Revisar logs de erro (Sentry/LogRocket)
   [ ] Verificar variáveis de ambiente
   [ ] Testar localmente com mesma config

3. RECOVERY:
   [ ] Opção 1: Reverter para versão anterior (git)
   [ ] Opção 2: Rollback de banco de dados (usar backup)
   [ ] Opção 3: Fix & redeploy (se problema identificado)

4. POST-MORTEM:
   [ ] Documentar o que deu errado
   [ ] Atualizar checklist
   [ ] Adicionar teste para prevenir

═══════════════════════════════════════════════════════════════════════════════
📞 CONTATOS DE EMERGÊNCIA
═══════════════════════════════════════════════════════════════════════════════

Em caso de problema crítico:

Escalação:
1. Tech Lead: [seu contato]
2. DevOps: [seu contato]
3. Security: [seu contato]
4. Management: [seu contato]

Recursos:
- Status Page: status.ouvy.com
- Incident Channel: #incident-response (Slack)
- Runbooks: docs/runbooks/

═══════════════════════════════════════════════════════════════════════════════
✅ SIGNOFF E APROVAÇÃO
═══════════════════════════════════════════════════════════════════════════════

Antes de fazer deploy em produção:

Aprovações necessárias:
□ Tech Lead: __________________ Data: __________
□ QA Lead: ____________________ Data: __________
□ DevOps: ____________________ Data: __________
□ Product Manager: ____________ Data: __________

Checklist final (todos devem estar marcados):
□ Todos os audits passaram
□ Todos os testes passaram
□ Backup realizado
□ Variáveis de ambiente configuradas
□ Monitoramento setup
□ Runbook documentado
□ Team notification enviada
□ Go-no-go decision: GO ✓

═══════════════════════════════════════════════════════════════════════════════
Data de Deployment: __________
Versão: __________
Responsável: __________
═══════════════════════════════════════════════════════════════════════════════
