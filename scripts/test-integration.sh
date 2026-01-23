#!/bin/bash

echo "🔍 Testando integração Frontend ↔ Backend"
echo "=========================================="
echo ""

BACKEND_URL="${BACKEND_URL:-https://ouvy-saas-production.up.railway.app}"
FRONTEND_URL="${FRONTEND_URL:-https://ouvy-frontend-jairguerraadv-sys-projects.vercel.app}"

PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_codes="$3"
    
    echo -n "  $name... "
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if echo "$expected_codes" | grep -q "$STATUS"; then
        echo "✅ HTTP $STATUS"
        ((PASSED++))
    else
        echo "❌ HTTP $STATUS (esperado: $expected_codes)"
        ((FAILED++))
    fi
}

echo "1. Backend Health Checks"
echo "------------------------"
test_endpoint "Health endpoint" "$BACKEND_URL/health/" "200"
test_endpoint "API docs" "$BACKEND_URL/api/docs/" "200 301 302"
test_endpoint "Admin" "$BACKEND_URL/painel-admin-ouvy-2026/" "200 301 302"

echo ""
echo "2. Backend API Endpoints"
echo "------------------------"
test_endpoint "Feedbacks API" "$BACKEND_URL/api/feedbacks/" "200 401 403"
test_endpoint "Tenant Info" "$BACKEND_URL/api/tenant-info/" "200 404"

echo ""
echo "3. Frontend"
echo "-----------"
test_endpoint "Homepage" "$FRONTEND_URL" "200"
test_endpoint "Login page" "$FRONTEND_URL/login" "200 308"

echo ""
echo "4. CORS Check"
echo "-------------"
echo -n "  CORS headers... "
CORS_HEADER=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/feedbacks/" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")

if [ -n "$CORS_HEADER" ]; then
    echo "✅ Configurado"
    ((PASSED++))
else
    echo "⚠️  Não detectado (pode estar OK)"
fi

echo ""
echo "=========================================="
echo "📊 RESULTADO: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo "✅ INTEGRAÇÃO VALIDADA"
    exit 0
else
    echo "⚠️  ALGUNS TESTES FALHARAM"
    exit 1
fi
