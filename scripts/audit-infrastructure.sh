#!/bin/bash
set -e

echo "🔍 AUDITORIA - INFRAESTRUTURA"
echo "=============================="

cd "$(dirname "$0")/.."

# 1. Validar sintaxe do docker-compose.yml
echo -n "1.1 Validando docker-compose.yml... "
docker compose config > /dev/null 2>&1 && echo "✅" || echo "❌ FALHOU"

# 2. Verificar paths atualizados
echo -n "1.2 Verificando paths (apps/backend, apps/frontend)... "
grep -q "apps/backend" docker-compose.yml && \
grep -q "apps/frontend" docker-compose.yml && echo "✅" || echo "❌ FALHOU"

# 3. Verificar status de todos os serviços
echo ""
echo "1.3 Status dos serviços:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# 4. Verificar health de cada serviço
SERVICES=("postgres" "redis" "elasticsearch" "backend" "frontend" "celery" "celery-beat" "mailhog")

echo ""
echo "1.4 Health Check dos Serviços:"
for service in "${SERVICES[@]}"; do
    STATUS=$(docker compose ps "$service" 2>/dev/null | grep -E "(Up|running)" || echo "")
    if [ -n "$STATUS" ]; then
        echo "  ✅ $service: UP"
    else
        echo "  ⚠️  $service: DOWN ou não encontrado"
    fi
done

# 5. Verificar logs para erros críticos
echo ""
echo "1.5 Verificando logs por erros críticos..."
BACKEND_ERRORS=$(docker compose logs --tail=50 backend 2>&1 | grep -iE "error|exception|fatal" | head -5 || true)
if [ -n "$BACKEND_ERRORS" ]; then
    echo "  ⚠️  Erros no backend:"
    echo "$BACKEND_ERRORS" | head -3
else
    echo "  ✅ Nenhum erro crítico no backend"
fi

FRONTEND_ERRORS=$(docker compose logs --tail=50 frontend 2>&1 | grep -iE "error|exception|fatal" | head -5 || true)
if [ -n "$FRONTEND_ERRORS" ]; then
    echo "  ⚠️  Erros no frontend:"
    echo "$FRONTEND_ERRORS" | head -3
else
    echo "  ✅ Nenhum erro crítico no frontend"
fi

echo ""
echo "✅ AUDITORIA DE INFRAESTRUTURA CONCLUÍDA"
