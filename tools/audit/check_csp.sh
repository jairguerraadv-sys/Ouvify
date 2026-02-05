#!/bin/bash
# check_csp.sh - Verifica Content Security Policy headers
# Analisa CSP do frontend e detecta violações de inline scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_FILE="$REPO_ROOT/audit/evidence/csp_headers.log"

FRONTEND_URL="${FRONTEND_URL:-https://ouvify.vercel.app}"

echo "🔐 ========================================"
echo "🔐 CSP (Content Security Policy) Check"
echo "🔐 ========================================"
echo ""
echo "URL: $FRONTEND_URL"
echo ""

mkdir -p "$(dirname "$OUTPUT_FILE")"
{
    echo "CSP Check - $(date)"
    echo "========================================"
    echo "URL: $FRONTEND_URL"
    echo ""
} > "$OUTPUT_FILE"

# 1. Capturar headers
echo "📥 Fetching headers..."
headers=$(curl -sS -I "$FRONTEND_URL" 2>&1)

{
    echo "Full Headers:"
    echo "$headers"
    echo ""
    echo "========================================"
    echo ""
} >> "$OUTPUT_FILE"

# 2. Extrair CSP headers
echo "🔍 Analyzing CSP headers..."
csp_header=$(echo "$headers" | grep -i "content-security-policy:" || echo "")

if [ -z "$csp_header" ]; then
    echo "  ⚠️  No CSP header found"
    {
        echo "CSP Status: NOT CONFIGURED"
        echo ""
    } >> "$OUTPUT_FILE"
else
    echo "  ✅ CSP header found"
    echo ""
    echo "CSP Policy:"
    echo "$csp_header"
    
    {
        echo "CSP Status: CONFIGURED"
        echo ""
        echo "CSP Header:"
        echo "$csp_header"
        echo ""
    } >> "$OUTPUT_FILE"
    
    # Analisar diretivas
    echo ""
    echo "🔍 CSP Directives:"
    
    # script-src
    if echo "$csp_header" | grep -q "script-src"; then
        script_src=$(echo "$csp_header" | grep -oP "script-src[^;]+" || echo "")
        echo "  script-src: $script_src"
        
        if echo "$script_src" | grep -q "'unsafe-inline'"; then
            echo "    ⚠️  'unsafe-inline' detected - allows inline scripts (security risk)"
        elif echo "$script_src" | grep -q "nonce-"; then
            echo "    ✅ nonce- detected - uses nonces for inline scripts"
        elif echo "$script_src" | grep -q "'strict-dynamic'"; then
            echo "    ✅ 'strict-dynamic' detected - modern CSP"
        else
            echo "    ✅ No 'unsafe-inline' - inline scripts blocked"
        fi
    fi
    
    # style-src
    if echo "$csp_header" | grep -q "style-src"; then
        style_src=$(echo "$csp_header" | grep -oP "style-src[^;]+" || echo "")
        echo "  style-src: $style_src"
    fi
fi

# 3. Fetch HTML and check for inline scripts
echo ""
echo "📥 Fetching HTML content..."
html_content=$(curl -sS "$FRONTEND_URL" 2>&1)

{
    echo "HTML Content (first 2000 chars):"
    echo "$html_content" | head -c 2000
    echo ""
    echo "..."
    echo ""
} >> "$OUTPUT_FILE"

# 4. Detect inline scripts
echo ""
echo "🔍 Checking for inline scripts..."
inline_script_count=$(echo "$html_content" | grep -c "<script>" || echo "0")
inline_script_content=$(echo "$html_content" | grep -A 2 "<script>" | head -20 || echo "")

if [ "$inline_script_count" -gt 0 ]; then
    echo "  ⚠️  $inline_script_count inline <script> tag(s) found"
    echo ""
    echo "  Inline scripts (first 20 lines):"
    echo "$inline_script_content" | head -20
    
    {
        echo "Inline Scripts: DETECTED ($inline_script_count)"
        echo ""
        echo "Inline Script Content (sample):"
        echo "$inline_script_content"
        echo ""
    } >> "$OUTPUT_FILE"
    
    # Verificar se tem nonce
    if echo "$inline_script_content" | grep -q "nonce="; then
        echo "    ✅ Scripts have nonce attribute"
        nonce_violation=false
    else
        echo "    ❌ Scripts missing nonce attribute - CSP violation!"
        nonce_violation=true
    fi
else
    echo "  ✅ No inline scripts detected"
    {
        echo "Inline Scripts: NONE"
        echo ""
    } >> "$OUTPUT_FILE"
    nonce_violation=false
fi

# 5. Check for Stripe or other external scripts
echo ""
echo "🔍 Checking external script sources..."
stripe_script=$(echo "$html_content" | grep "js.stripe.com" || echo "")

if [ -n "$stripe_script" ]; then
    echo "  ℹ️  Stripe script detected"
    echo "     $stripe_script"
    
    # Verificar se Stripe está na whitelist CSP
    if [ -n "$csp_header" ] && echo "$csp_header" | grep -q "js.stripe.com"; then
        echo "    ✅ Stripe whitelisted in CSP"
    else
        echo "    ⚠️  Stripe NOT whitelisted in CSP - may be blocked"
    fi
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMÁRIO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

issues=0

if [ -z "$csp_header" ]; then
    echo "  ⚠️  CSP: Not configured"
    issues=$((issues + 1))
else
    echo "  ✅ CSP: Configured"
fi

if [ "$nonce_violation" = true ]; then
    echo "  ❌ Inline scripts without nonce - CSP VIOLATION (P0)"
    issues=$((issues + 1))
elif [ "$inline_script_count" -gt 0 ]; then
    echo "  ✅ Inline scripts with nonce - CSP OK"
else
    echo "  ✅ No inline scripts - CSP OK"
fi

{
    echo "========================================"
    echo "SUMMARY"
    echo "========================================"
    echo "CSP Configured: $([ -n "$csp_header" ] && echo "YES" || echo "NO")"
    echo "Inline Scripts: $inline_script_count"
    echo "Nonce Violation: $([ "$nonce_violation" = true ] && echo "YES (P0)" || echo "NO")"
    echo "Issues: $issues"
    echo ""
} >> "$OUTPUT_FILE"

echo ""
echo "📝 Full log saved to: audit/evidence/csp_headers.log"
echo ""

if [ $issues -gt 0 ]; then
    echo "❌ CSP issues detected!"
    exit 1
else
    echo "✅ CSP check passed!"
    exit 0
fi
