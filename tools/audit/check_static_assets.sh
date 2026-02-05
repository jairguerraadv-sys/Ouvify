#!/bin/bash
# check_static_assets.sh - Verifica assets estáticos do frontend
# Confirma se manifest e outros assets críticos existem

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/apps/frontend"
OUTPUT_FILE="$REPO_ROOT/audit/evidence/static_assets.log"

echo "📦 ========================================"
echo "📦 Static Assets Check - Frontend"
echo "📦 ========================================"
echo ""

mkdir -p "$(dirname "$OUTPUT_FILE")"
{
    echo "Static Assets Check - $(date)"
    echo "========================================"
    echo ""
} > "$OUTPUT_FILE"

# Verificar estrutura do projeto
echo "🔍 Project type detection..."
if [ -f "$FRONTEND_DIR/next.config.js" ] || [ -f "$FRONTEND_DIR/next.config.mjs" ]; then
    PROJECT_TYPE="Next.js"
    PUBLIC_DIR="$FRONTEND_DIR/public"
elif [ -f "$FRONTEND_DIR/vite.config.ts" ]; then
    PROJECT_TYPE="Vite"
    PUBLIC_DIR="$FRONTEND_DIR/public"
else
    PROJECT_TYPE="Unknown"
    PUBLIC_DIR="$FRONTEND_DIR/public"
fi

echo "  Framework: $PROJECT_TYPE"
echo "  Public dir: $PUBLIC_DIR"
echo ""

{
    echo "Framework: $PROJECT_TYPE"
    echo "Public Directory: $PUBLIC_DIR"
    echo ""
} >> "$OUTPUT_FILE"

# Verificar public directory
echo "📁 Checking public directory..."
if [ -d "$PUBLIC_DIR" ]; then
    echo "  ✅ Public directory exists"
    {
        echo "Public directory structure:"
        ls -lah "$PUBLIC_DIR" 2>&1
        echo ""
    } >> "$OUTPUT_FILE"
else
    echo "  ❌ Public directory NOT found"
    {
        echo "ERROR: Public directory not found"
        echo ""
    } >> "$OUTPUT_FILE"
fi

# Assets críticos
CRITICAL_ASSETS=(
    "site.webmanifest"
    "manifest.json"
    "favicon.ico"
    "robots.txt"
)

echo ""
echo "🔍 Checking critical assets..."
issues=0

for asset in "${CRITICAL_ASSETS[@]}"; do
    if [ -f "$PUBLIC_DIR/$asset" ]; then
        size=$(du -h "$PUBLIC_DIR/$asset" | cut -f1)
        echo "  ✅ $asset ($size)"
        {
            echo "✅ $asset - EXISTS ($size)"
            head -20 "$PUBLIC_DIR/$asset" 2>&1
            echo ""
        } >> "$OUTPUT_FILE"
    else
        echo "  ❌ $asset - NOT FOUND"
        {
            echo "❌ $asset - NOT FOUND"
            echo ""
        } >> "$OUTPUT_FILE"
        issues=$((issues + 1))
    fi
done

# Verificar se manifest está no Config (Next.js)
echo ""
echo "🔍 Checking framework config..."
if [ "$PROJECT_TYPE" = "Next.js" ]; then
    echo "  Checking next.config..."
    
    config_file="$FRONTEND_DIR/next.config.js"
    if [ ! -f "$config_file" ]; then
        config_file="$FRONTEND_DIR/next.config.mjs"
    fi
    
    if [ -f "$config_file" ]; then
        {
            echo "next.config content:"
            cat "$config_file"
            echo ""
        } >> "$OUTPUT_FILE"
        
        if grep -q "manifest" "$config_file"; then
            echo "  ✅ Manifest referenced in config"
        else
            echo "  ⚠️  Manifest not referenced in config"
        fi
    fi
    
    # Verificar app/layout.tsx ou pages/_document.tsx
    if [ -f "$FRONTEND_DIR/app/layout.tsx" ]; then
        echo "  Checking app/layout.tsx for manifest link..."
        if grep -q "manifest" "$FRONTEND_DIR/app/layout.tsx"; then
            echo "    ✅ Manifest link found in layout"
        else
            echo "    ⚠️  Manifest link not found in layout"
        fi
    fi
fi

# Verificar build output (se existir)
echo ""
echo "🔍 Checking build output..."
if [ -d "$FRONTEND_DIR/.next" ]; then
    echo "  ✅ .next directory exists (Next.js build)"
    
    if [ -f "$FRONTEND_DIR/.next/server/pages-manifest.json" ]; then
        echo "  ✅ pages-manifest.json exists"
    fi
elif [ -d "$FRONTEND_DIR/dist" ]; then
    echo "  ✅ dist directory exists (Vite build)"
else
    echo "  ⚠️  No build output found (run 'npm run build' first)"
fi

# Sumário
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMÁRIO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
{
    echo ""
    echo "========================================"
    echo "SUMMARY"
    echo "========================================"
} >> "$OUTPUT_FILE"

if [ $issues -eq 0 ]; then
    echo "  ✅ All critical assets found"
    {
        echo "Status: PASS"
        echo "Issues: 0"
    } >> "$OUTPUT_FILE"
    exit 0
else
    echo "  ❌ $issues critical asset(s) missing"
    {
        echo "Status: FAIL"
        echo "Issues: $issues"
    } >> "$OUTPUT_FILE"
    exit 1
fi
