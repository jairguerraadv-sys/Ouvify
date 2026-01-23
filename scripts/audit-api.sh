#!/bin/bash

echo "🔍 AUDITORIA - ENDPOINTS DA API"
echo "================================"

cd "$(dirname "$0")/.."

BASE_URL="http://localhost:8000"

# Endpoints para testar
declare -A ENDPOINTS
ENDPOINTS=(
    ["/health/"]="Health Check"
    ["/api/v1/feedbacks/"]="Feedbacks List"
    ["/api/docs/"]="API Docs (Swagger)"
    ["/admin/"]="Django Admin"
)

echo "Testando endpoints públicos..."
for path in "${!ENDPOINTS[@]}"; do
    name="${ENDPOINTS[$path]}"
    echo -n "  $name ($path)... "
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL$path" --max-time 10 2>/dev/null || echo "000")
    
    case $STATUS in
        200|301|302)
            echo "✅ HTTP $STATUS"
            ;;
        401|403)
            echo "✅ HTTP $STATUS (requer autenticação)"
            ;;
        000)
            echo "⚠️  TIMEOUT ou servidor inacessível"
            ;;
        *)
            echo "⚠️  HTTP $STATUS"
            ;;
    esac
done

echo ""
echo "✅ AUDITORIA DE API CONCLUÍDA"
