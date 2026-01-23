#!/bin/bash

echo "🔍 AUDITORIA - PERFORMANCE"
echo "=========================="

cd "$(dirname "$0")/.."

# 1. Backend Response Times
echo "6.1 Tempos de resposta do Backend:"

ENDPOINTS=("/health/" "/api/v1/feedbacks/" "/api/docs/")

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "  $endpoint: "
    
    TIME=$(curl -o /dev/null -s -w "%{time_total}" "http://localhost:8000$endpoint" --max-time 10 2>/dev/null || echo "timeout")
    
    if [ "$TIME" != "timeout" ]; then
        TIME_MS=$(echo "$TIME * 1000" | bc 2>/dev/null || echo "$TIME")
        echo "${TIME_MS}ms"
    else
        echo "⚠️  TIMEOUT"
    fi
done

# 2. Frontend Response Times
echo ""
echo "6.2 Tempos de resposta do Frontend:"

PAGES=("/" "/login")

for page in "${PAGES[@]}"; do
    echo -n "  $page: "
    
    TIME=$(curl -o /dev/null -s -w "%{time_total}" "http://localhost:3000$page" --max-time 10 2>/dev/null || echo "timeout")
    
    if [ "$TIME" != "timeout" ]; then
        TIME_MS=$(echo "$TIME * 1000" | bc 2>/dev/null || echo "$TIME")
        echo "${TIME_MS}ms"
    else
        echo "⚠️  TIMEOUT"
    fi
done

# 3. Recursos do sistema
echo ""
echo "6.3 Uso de recursos Docker:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -10 || echo "  ⚠️  Não foi possível obter stats"

echo ""
echo "✅ AUDITORIA DE PERFORMANCE CONCLUÍDA"
