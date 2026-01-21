#!/bin/bash
# CSP Headers Validation Script
# Testa headers CSP em diferentes rotas e ambientes

set -e

echo "🔍 Validating CSP Headers Implementation"
echo "========================================"

# Configurações
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Função para testar headers CSP
test_csp_headers() {
    local url="$1"
    local route_name="$2"

    echo "Testing $route_name: $url"

    # Faz request e captura headers
    local headers
    headers=$(curl -sI "$url" 2>/dev/null)

    # Verifica Content-Security-Policy
    if echo "$headers" | grep -qi "content-security-policy:"; then
        echo "  ✅ Content-Security-Policy: PRESENT"
        # Verifica se contém unsafe-inline
        if echo "$headers" | grep -A 5 "content-security-policy:" | grep -q "unsafe-inline"; then
            echo "  ⚠️  WARNING: Contains 'unsafe-inline'"
        else
            echo "  ✅ No 'unsafe-inline' found"
        fi
        # Verifica nonce
        if echo "$headers" | grep -A 5 "content-security-policy:" | grep -q "nonce-"; then
            echo "  ✅ Nonce-based script execution: PRESENT"
        else
            echo "  ℹ️  INFO: No nonce found (expected in development)"
        fi
    else
        echo "  ℹ️  INFO: No Content-Security-Policy header (expected in development)"
    fi

    # Verifica Content-Security-Policy-Report-Only
    if echo "$headers" | grep -qi "content-security-policy-report-only:"; then
        echo "  ✅ Content-Security-Policy-Report-Only: PRESENT (report-only mode)"
    fi

    # Verifica x-nonce header
    if echo "$headers" | grep -qi "x-nonce:"; then
        echo "  ✅ X-Nonce header: PRESENT"
    else
        echo "  ℹ️  INFO: No X-Nonce header (expected in development)"
    fi

    echo ""
}

# Testa rotas do frontend
echo "🖥️  Testing Frontend Routes"
echo "---------------------------"

test_csp_headers "$FRONTEND_URL/" "Homepage"
test_csp_headers "$FRONTEND_URL/login" "Login Page"
test_csp_headers "$FRONTEND_URL/dashboard" "Dashboard (requires auth)"
test_csp_headers "$FRONTEND_URL/enviar" "Feedback Form"
test_csp_headers "$FRONTEND_URL/acompanhar" "Protocol Tracking"

# Testa rotas do backend (se disponível)
echo "🔧 Testing Backend Routes"
echo "---------------------------"

if curl -s "$BACKEND_URL" >/dev/null 2>&1; then
    test_csp_headers "$BACKEND_URL/" "Backend Homepage"
    test_csp_headers "$BACKEND_URL/api/" "API Root"
else
    echo "Backend not available at $BACKEND_URL"
fi

echo "✅ CSP Headers Validation Complete"
echo ""
echo "📋 Summary:"
echo "- Development: No CSP headers (expected)"
echo "- Production: CSP with nonce, no unsafe-inline"
echo "- Report-Only: Content-Security-Policy-Report-Only header"
echo ""
echo "🔗 Next Steps:"
echo "1. Set NODE_ENV=production for frontend production headers"
echo "2. Set CSP_MODE=report-only for staging monitoring"
echo "3. Deploy to staging and monitor violations"
echo "4. Switch to CSP_MODE=enforce for production"