#!/bin/bash
# smoke_env.sh - Smoke tests nos ambientes de produção/staging
# Testa endpoints críticos em Vercel (frontend) e Render (backend)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_FILE="$REPO_ROOT/audit/evidence/smoke_env.log"

FRONTEND_URL="${FRONTEND_URL:-https://ouvify.vercel.app}"
BACKEND_URL="${BACKEND_URL:-https://ouvify-backend.onrender.com}"

echo "🔥 ====================================="
echo "🔥 Smoke Tests - Production Environment"
echo "🔥 ====================================="
echo ""
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""

# Criar arquivo de log
mkdir -p "$(dirname "$OUTPUT_FILE")"
{
    echo "Smoke Tests - $(date)"
    echo "========================================"
    echo ""
} > "$OUTPUT_FILE"

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local desc=$3
    local expect_status=${4:-200}
    
    echo "🧪 Testing: $desc"
    echo "   $method $url"
    
    {
        echo ""
        echo "## $desc"
        echo "URL: $url"
        echo "Method: $method"
        echo ""
    } >> "$OUTPUT_FILE"
    
    # Fazer request com timeout
    if [ "$method" = "GET" ]; then
        response=$(curl -sS -w "\n%{http_code}\n%{time_total}\n" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            --max-time 10 \
            "$url" 2>&1) || {
            echo "   ❌ FAIL: Connection error"
            {
                echo "Status: CONNECTION_ERROR"
                echo "Error: $response"
                echo ""
            } >> "$OUTPUT_FILE"
            return 1
        }
    else
        response=$(curl -sS -w "\n%{http_code}\n%{time_total}\n" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            --max-time 10 \
            -d '{}' \
            "$url" 2>&1) || {
            echo "   ❌ FAIL: Connection error"
            {
                echo "Status: CONNECTION_ERROR"
                echo "Error: $response"
                echo ""
            } >> "$OUTPUT_FILE"
            return 1
        }
    fi
    
    # Extrair status code e tempo
    status_code=$(echo "$response" | tail -2 | head -1)
    time_total=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -2)
    
    {
        echo "Status Code: $status_code"
        echo "Time: ${time_total}s"
        echo "Response Body (first 500 chars):"
        echo "$body" | head -c 500
        echo ""
        echo ""
    } >> "$OUTPUT_FILE"
    
    if [ "$status_code" = "$expect_status" ]; then
        echo "   ✅ OK: $status_code (${time_total}s)"
        return 0
    else
        echo "   ❌ FAIL: Expected $expect_status, got $status_code"
        return 1
    fi
}

# Contadores
passed=0
failed=0

# Testes Backend
echo ""
echo "🔍 Backend Tests ($BACKEND_URL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Health check (se existir)
if test_endpoint "GET" "$BACKEND_URL/health/" "Backend Health Check" 200; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 2. API Root
if test_endpoint "GET" "$BACKEND_URL/api/" "API Root" 200; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 3. Tenant Info (P0)
if test_endpoint "GET" "$BACKEND_URL/api/tenant-info/" "Tenant Info (P0)" 401; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 4. Token (Login) (P0)
if test_endpoint "POST" "$BACKEND_URL/api/token/" "Login Token (P0)" 400; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 5. Check Subdomínio (P0)
if test_endpoint "GET" "$BACKEND_URL/api/check-subdominio/?subdominio=test" "Check Subdomínio (P0)" 200; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 6. Register Tenant (P0)
if test_endpoint "POST" "$BACKEND_URL/api/register-tenant/" "Register Tenant (P0)" 400; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Testes Frontend
echo ""
echo "🔍 Frontend Tests ($FRONTEND_URL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Home page
if test_endpoint "GET" "$FRONTEND_URL/" "Home Page" 200; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 2. Manifest (P0)
if test_endpoint "GET" "$FRONTEND_URL/site.webmanifest" "Web Manifest (P0)" 200; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# 3. API integration page (se existir)
if test_endpoint "GET" "$FRONTEND_URL/api/health" "Frontend API Health" 200; then
    passed=$((passed + 1))
else
    # Não crítico
    echo "   ℹ️  Frontend API route not found (expected for static site)"
fi

# Sumário
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMÁRIO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Passed: $passed"
echo "  ❌ Failed: $failed"
echo ""

{
    echo ""
    echo "========================================"
    echo "SUMMARY"
    echo "========================================"
    echo "Passed: $passed"
    echo "Failed: $failed"
    echo "Date: $(date)"
} >> "$OUTPUT_FILE"

echo "📝 Full log saved to: audit/evidence/smoke_env.log"
echo ""

if [ $failed -gt 0 ]; then
    echo "❌ Some tests failed!"
    exit 1
else
    echo "✅ All tests passed!"
    exit 0
fi
