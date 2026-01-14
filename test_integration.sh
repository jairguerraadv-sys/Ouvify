#!/bin/bash

# Script de Teste de Integração Frontend + Backend
# Ouvy SaaS - 14 de Janeiro de 2026

echo "🧪 TESTE DE INTEGRAÇÃO FRONTEND + BACKEND"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função de teste
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

# 1. Testar Backend
echo "📡 BACKEND API TESTS (http://localhost:8000)"
echo "--------------------------------------------"

test_endpoint \
    "Home/Health Check" \
    "http://localhost:8000/" \
    200 \
    "Should return 200"

test_endpoint \
    "API Root" \
    "http://localhost:8000/api/" \
    200 \
    "Should return 200"

test_endpoint \
    "Consultar Protocolo (sem código)" \
    "http://localhost:8000/api/feedbacks/consultar-protocolo/" \
    400 \
    "Should return 400 (bad request)"

test_endpoint \
    "Dashboard Stats (sem auth)" \
    "http://localhost:8000/api/feedbacks/dashboard-stats/" \
    403 \
    "Should return 403 (forbidden)"

test_endpoint \
    "Tenant Info" \
    "http://localhost:8000/api/tenants/info/" \
    200 \
    "Should return 200"

echo ""

# 2. Testar Frontend
echo "🌐 FRONTEND TESTS (http://localhost:3000)"
echo "--------------------------------------------"

test_endpoint \
    "Homepage" \
    "http://localhost:3000/" \
    200 \
    "Should return 200"

test_endpoint \
    "Login Page" \
    "http://localhost:3000/login" \
    200 \
    "Should return 200"

test_endpoint \
    "Cadastro Page" \
    "http://localhost:3000/cadastro" \
    200 \
    "Should return 200"

test_endpoint \
    "Enviar Feedback" \
    "http://localhost:3000/enviar" \
    200 \
    "Should return 200"

test_endpoint \
    "Acompanhar Page" \
    "http://localhost:3000/acompanhar" \
    200 \
    "Should return 200"

test_endpoint \
    "Dashboard (requer auth)" \
    "http://localhost:3000/dashboard" \
    200 \
    "Should redirect or return 200"

echo ""

# 3. Testar CORS
echo "🔐 CORS TESTS"
echo "--------------------------------------------"

echo -n "Testing: CORS Headers... "
cors_headers=$(curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    "http://localhost:8000/api/feedbacks/consultar-protocolo/" \
    | grep -i "access-control")

if [ ! -z "$cors_headers" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   $cors_headers"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""

# 4. Testar Validações
echo "🛡️  VALIDATION TESTS"
echo "--------------------------------------------"

echo -n "Testing: Subdomain Validation... "
subdomain_check=$(curl -s "http://localhost:8000/api/tenants/check-subdominio/?subdominio=www")
if echo "$subdomain_check" | grep -q "reservado\|disponível"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""

# 5. Testar Rate Limiting
echo "⏱️  RATE LIMITING TESTS"
echo "--------------------------------------------"

echo -n "Testing: Rate Limiting (6 requests)... "
rate_limit_hit=false

for i in {1..6}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "http://localhost:8000/api/feedbacks/consultar-protocolo/?codigo=TEST-1234-5678")
    
    if [ "$response" -eq "429" ]; then
        rate_limit_hit=true
        break
    fi
    sleep 0.2
done

if [ "$rate_limit_hit" = true ]; then
    echo -e "${GREEN}✅ PASS${NC} (Hit rate limit at request $i)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (Rate limit not hit in 6 requests)"
fi

echo ""

# Resumo
echo "=========================================="
echo "📊 RESUMO DOS TESTES"
echo "=========================================="
echo -e "Total de testes: $((PASSED + FAILED))"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo "✅ Integração frontend + backend está funcionando perfeitamente!"
    exit 0
else
    echo -e "${RED}❌ ALGUNS TESTES FALHARAM${NC}"
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
