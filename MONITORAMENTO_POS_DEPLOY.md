# 📊 MONITORAMENTO PÓS-DEPLOY - SLA E MÉTRICAS

## 1. KPIs de Segurança (Monitorar Diariamente)

### 1.1 Rate Limiting
```python
# Métrica: % de requisições bloqueadas por rate limit
# Target: <0.1% (indicador de brute force se > 1%)

# Queries para Django logs:
# SELECT count(*) FROM logs WHERE status_code=429 AND date > NOW() - INTERVAL 1 DAY;

# Alert thresholds:
# 🟢 GREEN:   < 0.1%
# 🟡 YELLOW:  0.1% - 1%
# 🔴 RED:     > 1%
```

### 1.2 Falhas de Autenticação
```python
# Métrica: Login failures por IP
# Target: Máx 5 falhas/hora por IP

# Alert: Se qualquer IP tem > 10 falhas em 1 hora
# → Possível ataque de brute force
# → Action: Investigar / bloquear IP

# Query PostgreSQL:
SELECT 
    client_ip,
    COUNT(*) as failed_attempts,
    MAX(timestamp) as last_attempt
FROM auth_logs
WHERE status = 'FAILED'
AND timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY client_ip
HAVING COUNT(*) > 10
ORDER BY failed_attempts DESC;
```

### 1.3 Exposição de Dados
```python
# Métrica: Tokens em logs
# Target: 0 (nunca expor)

# Query: Procurar por padrões de token
SELECT * FROM logs 
WHERE message LIKE '%token=%' 
   OR message LIKE '%reset=%'
   OR message LIKE '%password=%'
AND date > NOW() - INTERVAL 1 WEEK;

# Se encontrar algo: 🔴 CRÍTICO - Rotação de segredos necessária
```

### 1.4 Acessos Não-Autorizados
```python
# Métrica: 403/401 responses
# Target: <0.01%

# Alert: Se > 1% em 5 minutos
# → Possível token compromise
# → Action: Investigar / invalidar sessões

SELECT 
    status_code,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM http_logs
WHERE timestamp > NOW() - INTERVAL 5 MINUTES
GROUP BY status_code
ORDER BY count DESC;
```

---

## 2. KPIs de Performance (Monitorar a Cada 4 Horas)

### 2.1 Tempo de Resposta da API
```python
# Métrica: P95 latência (95º percentil)
# Target: < 200ms

# Query Prometheus:
# histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Thresholds:
# 🟢 GREEN:   < 150ms
# 🟡 YELLOW:  150-300ms
# 🔴 RED:     > 300ms

# Se RED: Investigar
# - Database query lentidão
# - Stripe API timeout
# - Cache miss
```

### 2.2 Uptime da API
```python
# Métrica: % de requisições bem-sucedidas (2xx/3xx)
# Target: > 99.9%

# Thresholds:
# 🟢 GREEN:   > 99.5%
# 🟡 YELLOW:  99.0% - 99.5%
# 🔴 RED:     < 99.0%

# Daily check:
curl -s https://api.ouvy.com/health/ | jq .status
# Expected: "ok"

# Se RED: Investigar
# - Database connection pool exhausted
# - Memory leaks
# - Infinite loops
```

### 2.3 Erro Rates
```python
# Métrica: % de respostas 5xx
# Target: < 0.01%

# Alert: Se > 0.1% em 5 minutos
# → Critical issue detectado
# → Action: Check logs, restart if needed

SELECT 
    status_code,
    COUNT(*) as count
FROM http_logs
WHERE timestamp > NOW() - INTERVAL 5 MINUTES
    AND status_code >= 500
GROUP BY status_code;
```

---

## 3. KPIs de Disponibilidade (Monitorar Continuamente)

### 3.1 Database Connectivity
```bash
# Health check a cada 30 segundos
curl -s https://api.ouvy.com/health/db/ | jq .database_status

# Expected: "connected"

# Alert: Se "disconnected" por > 2 minutos
# → Investigar connection pool
# → Possível: máx conexões atingido, DNS issue
```

### 3.2 Stripe Connectivity
```bash
# Health check a cada 1 minuto
curl -s https://api.ouvy.com/health/stripe/ | jq .stripe_status

# Expected: "connected"

# Alert: Se "disconnected" por > 5 minutos
# → Investigar:
#   - API keys expiradas
#   - Rate limit do Stripe atingido
#   - Network connectivity
```

### 3.3 Email Service
```bash
# Test a cada 6 horas
python ouvy_saas/manage.py shell << 'EOF'
from django.core.mail import send_mail
from django.conf import settings

try:
    send_mail(
        'Health Check',
        'If you receive this, email is working',
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL],
    )
    print("✅ Email working")
except Exception as e:
    print(f"❌ Email ERROR: {e}")
EOF
```

---

## 4. Dashboard Recomendado (Usar Grafana + Prometheus)

### Panels para monitorar:

```json
{
  "dashboard": {
    "title": "Ouvy SaaS - Production Monitoring",
    "panels": [
      {
        "title": "API Health Status",
        "query": "up{job='ouvy-api'}"
      },
      {
        "title": "P95 Response Time",
        "query": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
      },
      {
        "title": "Error Rate (5xx)",
        "query": "rate(http_requests_total{status=~'5..'}[5m]) * 100"
      },
      {
        "title": "Rate Limit Hits",
        "query": "increase(rate_limit_exceeded_total[1h])"
      },
      {
        "title": "Database Connections",
        "query": "db_connections_active / db_connections_max"
      },
      {
        "title": "Failed Auth Attempts",
        "query": "increase(auth_failures_total[1h])"
      },
      {
        "title": "Active Tenants",
        "query": "count(tenants_active)"
      },
      {
        "title": "Disk Usage",
        "query": "node_filesystem_avail_bytes / node_filesystem_size_bytes"
      }
    ]
  }
}
```

---

## 5. Alertas Críticos (Implementar em PagerDuty/Alertmanager)

### Alerta 1: Database Down
```yaml
alert: DatabaseConnectionDown
expr: pg_up == 0
for: 2m
annotations:
  severity: critical
  description: "PostgreSQL connection failed. Database is DOWN"
  action: "SSH to Railway, check: railway logs"
```

### Alerta 2: High Error Rate
```yaml
alert: HighErrorRate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.001
for: 5m
annotations:
  severity: critical
  description: "API error rate above 0.1%"
  action: "Check logs: railway logs -n 100"
```

### Alerta 3: Rate Limit Attack
```yaml
alert: RateLimitAttack
expr: increase(rate_limit_exceeded_total[5m]) > 100
for: 1m
annotations:
  severity: warning
  description: "Elevated rate limit hits (possible attack)"
  action: "Investigate IPs in: SELECT client_ip, COUNT(*) FROM logs WHERE status=429"
```

### Alerta 4: Failed Deployments
```yaml
alert: DeploymentFailed
expr: changes(deployment_version[1m]) == 0 AND time() - deployment_timestamp > 600
for: 10m
annotations:
  severity: critical
  description: "Deployment failed or stuck"
  action: "Check Railway build logs"
```

---

## 6. Rotina de Verificação Diária

### ☀️ Morning Check (8:00 AM)
```bash
#!/bin/bash
# File: /scripts/daily_health_check.sh

echo "🌅 Ouvy Daily Health Check - $(date)"

# 1. API Status
STATUS=$(curl -s https://api.ouvy.com/health/ | jq -r '.status')
if [ "$STATUS" != "ok" ]; then
    echo "❌ API DOWN!"
    # Trigger alert
    curl -X POST https://hooks.slack.com/... -d '{"text":"❌ OUVY API DOWN"}'
else
    echo "✅ API: OK"
fi

# 2. Database
DB_STATUS=$(curl -s https://api.ouvy.com/health/db/ | jq -r '.database_status')
echo "✅ Database: $DB_STATUS"

# 3. Error Rate (last 1 hour)
ERROR_RATE=$(curl -s https://prometheus.internal/... | jq '.data.result[0].value[1]')
if (( $(echo "$ERROR_RATE > 0.001" | bc -l) )); then
    echo "🟡 ERROR RATE: ${ERROR_RATE}% (monitor)"
else
    echo "✅ Error Rate: ${ERROR_RATE}% (OK)"
fi

# 4. Failed Auth Attempts (last 24h)
FAILED_AUTHS=$(psql -U $DB_USER -d $DB_NAME -c \
    "SELECT COUNT(*) FROM auth_logs WHERE status='FAILED' AND date > NOW() - INTERVAL 1 DAY;" \
    | tail -1 | xargs)
echo "👤 Failed Auth Attempts: $FAILED_AUTHS"

# 5. Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "💾 Disk Usage: $DISK_USAGE"

# 6. SSL Certificate Expiry
CERT_EXPIRY=$(curl -s https://api.ouvy.com | openssl s_client -showcerts 2>/dev/null | \
    openssl x509 -noout -dates | grep notAfter)
echo "🔐 SSL: $CERT_EXPIRY"

echo "✅ Daily check complete"
```

### 📋 Weekly Check (Monday 10:00 AM)
```bash
#!/bin/bash
# Executar:
# 1. Backup test: Restaurar backup em ambiente de teste
# 2. Load test: Simular 1000 users simultâneos
# 3. Security scan: OWASP ZAP scan
# 4. Dependency check: pip audit for vulnerabilities
# 5. Log analysis: Procurar por anomalias
```

### 📈 Monthly Check (1st day of month)
```bash
# 1. Review all alerts (falsos positivos?)
# 2. Update runbooks
# 3. Security audit
# 4. Performance optimization review
# 5. Capacity planning
# 6. Disaster recovery drill
```

---

## 7. Logs a Monitorar

### Logs Críticos
```bash
# 1. Authentication failures
grep "authentication.*failed\|invalid.*token\|401\|403" /var/log/ouvy/django.log

# 2. Database errors
grep "connection.*refused\|timeout\|connection pool" /var/log/ouvy/django.log

# 3. Stripe errors
grep "stripe.*error\|payment.*failed" /var/log/ouvy/django.log

# 4. Security events
grep "injection\|xss\|csrf\|sql.*syntax" /var/log/ouvy/django.log
```

### Dashboard Query para Logs
```bash
# ElasticSearch / CloudWatch query
index=ouvy_logs level=ERROR | stats count by source_ip, error_type
```

---

## 8. Runbook para Incidentes

### Cenário 1: API Lenta (P95 > 500ms)

**Passos:**
1. Verificar CPU/Memória do servidor
   ```bash
   railway logs | grep "CPU\|MEM"
   ```

2. Verificar queries lentas
   ```bash
   # Enable query logging em Django
   LOGGING_LEVEL=DEBUG python manage.py runserver
   ```

3. Verificar conexões de database
   ```bash
   psql -U $DB_USER -d $DB_NAME -c \
     "SELECT pid, duration, query FROM pg_stat_statements ORDER BY duration DESC LIMIT 5;"
   ```

4. Se problema persistir: Restart gracioso
   ```bash
   railway redeploy --skip-build
   ```

### Cenário 2: Rate Limiting Muito Alto

**Passos:**
1. Identificar IPs atacantes
   ```bash
   SELECT client_ip, COUNT(*) 
   FROM logs WHERE status_code=429
   GROUP BY client_ip ORDER BY COUNT(*) DESC;
   ```

2. Temporariamente bloquear IPs (nginx)
   ```bash
   # Adicionar ao railway.json environment
   BLOCKED_IPS="192.168.1.100,192.168.1.101"
   ```

3. Aumentar rate limit temporariamente
   ```bash
   railway environment add PASSWORD_RESET_THROTTLE="10/hour"
   ```

4. Investigar origem do ataque

### Cenário 3: Database Connection Pool Exhausted

**Passos:**
1. Verificar conexões ativas
   ```bash
   psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. Matar conexões idle
   ```bash
   psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
            WHERE state='idle' AND query_start < NOW() - INTERVAL 30 MINUTES;"
   ```

3. Aumentar pool size
   ```bash
   railway environment add DB_CONN_MAX_AGE=600
   ```

4. Restart aplicação
   ```bash
   railway redeploy
   ```

---

## 9. Métricas de Sucesso (30 Dias)

```markdown
# 📊 TARGET METRICS (Depois de 1 mês em produção)

## Segurança
- [x] 0 data breaches
- [x] 0 SQL injections detectadas
- [x] 0 XSS vulnerabilities
- [x] Rate limiting ativo e efetivo
- [x] Nenhum token em logs

## Performance
- [x] P95 latência < 200ms
- [x] Uptime > 99.9%
- [x] Error rate < 0.01%
- [x] DB query avg < 50ms

## Compliance
- [x] LGPD: Todos os exports OK
- [x] Backups: Diários, verificados
- [x] SSL: Válido e renovado automaticamente

## SLA
- [x] Tempo de incidente < 15 min
- [x] Tempo de resolução < 1 hora
```

---

**Monitoramento contínuo = Produção segura e confiável 🛡️**

Para dúvidas, consultar: `/AUDITORIA_DUE_DILIGENCE_CTO_2026.md`
