#!/bin/bash

echo "🔍 AUDITORIA - INTEGRAÇÕES"
echo "=========================="

cd "$(dirname "$0")/.."

# 1. Redis
echo "4.1 Testando Redis..."
echo -n "  Conexão... "
if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "✅ PONG"
else
    echo "⚠️  Não conectou"
fi

echo -n "  Set/Get... "
docker compose exec -T redis redis-cli SET audit_test "success" EX 30 > /dev/null 2>&1
RESULT=$(docker compose exec -T redis redis-cli GET audit_test 2>/dev/null)
if [ "$RESULT" = "success" ]; then
    echo "✅ Funcionando"
else
    echo "⚠️  Falhou"
fi

# 2. PostgreSQL
echo ""
echo "4.2 Testando PostgreSQL..."
echo -n "  Conexão... "
if docker compose exec -T postgres pg_isready -U ouvy 2>/dev/null | grep -q "accepting"; then
    echo "✅ Aceitando conexões"
else
    echo "⚠️  Não conectou"
fi

echo -n "  Tabelas... "
TABLE_COUNT=$(docker compose exec -T postgres psql -U ouvy -d ouvify_dev -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✅ $TABLE_COUNT tabelas"
else
    echo "⚠️  Nenhuma tabela ou erro"
fi

# 3. ElasticSearch
echo ""
echo "4.3 Testando ElasticSearch..."
echo -n "  Cluster health... "
HEALTH=$(curl -s http://localhost:9200/_cluster/health 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ -n "$HEALTH" ]; then
    echo "✅ Status: $HEALTH"
else
    echo "⚠️  Não conectou"
fi

# 4. Celery
echo ""
echo "4.4 Testando Celery..."
echo -n "  Worker... "
CELERY_STATUS=$(docker compose ps celery 2>/dev/null | grep -E "(Up|running)" || echo "")
if [ -n "$CELERY_STATUS" ]; then
    echo "✅ Rodando"
else
    echo "⚠️  Não encontrado"
fi

echo -n "  Beat... "
BEAT_STATUS=$(docker compose ps celery-beat 2>/dev/null | grep -E "(Up|running)" || echo "")
if [ -n "$BEAT_STATUS" ]; then
    echo "✅ Rodando"
else
    echo "⚠️  Não encontrado"
fi

# 5. Mailhog
echo ""
echo "4.5 Testando Mailhog..."
echo -n "  Web UI... "
MAILHOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8025 2>/dev/null || echo "000")
if [ "$MAILHOG_STATUS" = "200" ]; then
    echo "✅ Acessível"
else
    echo "⚠️  HTTP $MAILHOG_STATUS"
fi

echo ""
echo "✅ AUDITORIA DE INTEGRAÇÕES CONCLUÍDA"
