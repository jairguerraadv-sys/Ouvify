#!/bin/bash
###############################################################################
# AUDIT FRONTEND - Ouvify
# Testes, linting, build, bundle analysis
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
FRONTEND_DIR="$WORKSPACE_ROOT/apps/frontend"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/frontend.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   ⚛️  Frontend Audit - Next.js/React${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY FRONTEND AUDIT REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Node/NPM Versions
    echo "1. NODE/NPM VERSIONS"
    echo "----------------------------------------"
    node --version
    npm --version
    echo ""
    
    # 2. Next.js Version
    echo "2. NEXT.JS CONFIGURATION"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    echo "Next.js version:"
    cat package.json | grep '"next"'
    echo ""
    
    # 3. Pages/Routes
    echo "3. PAGES AND ROUTES"
    echo "----------------------------------------"
    echo "App Router pages found:"
    find app/ -name "page.tsx" -o -name "page.js" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "Route structure:"
    find app/ -name "page.tsx" -o -name "page.js" 2>/dev/null | head -30 || echo "None"
    echo ""
    
    # 4. Components Count
    echo "4. COMPONENTS"
    echo "----------------------------------------"
    echo "Component files found:"
    find components/ -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "Sample components:"
    ls components/ 2>/dev/null | head -20 || echo "Components directory not found"
    echo ""
    
    # 5. TypeScript Check
    echo "5. TYPESCRIPT TYPE CHECK"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    if [ -f "tsconfig.json" ]; then
        echo "Running TypeScript compiler check..."
        npx tsc --noEmit 2>&1 | tee "$EVIDENCE_DIR/tsc_check.txt" | head -30 || {
            echo "⚠️  TypeScript errors found - check $EVIDENCE_DIR/tsc_check.txt"
        }
    else
        echo "⚠️  tsconfig.json not found"
    fi
    echo ""
    
    # 6. Linting
    echo "6. ESLINT CHECK"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    if [ -f "eslint.config.mjs" ] || [ -f ".eslintrc.json" ]; then
        echo "Running ESLint..."
        npm run lint 2>&1 | tee "$EVIDENCE_DIR/eslint_output.txt" | tail -30 || {
            echo "⚠️  Linting issues found"
        }
    else
        echo "⚠️  ESLint config not found"
    fi
    echo ""
    
    # 7. Build Test
    echo "7. PRODUCTION BUILD TEST"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    echo "Attempting production build..."
    if npm run build 2>&1 | tee "$EVIDENCE_DIR/build_output.txt" | tail -50; then
        echo "✅ Build successful"
        
        # Check build size
        if [ -d ".next" ]; then
            echo ""
            echo "Build analysis:"
            du -sh .next/ 2>/dev/null || echo "Cannot measure"
            
            echo ""
            echo "Largest chunks:"
            find .next/static/chunks -name "*.js" -exec ls -lh {} \; 2>/dev/null | \
                awk '{print $5 "\t" $9}' | sort -rh | head -10 || echo "Cannot analyze"
        fi
    else
        echo "❌ Build failed - check $EVIDENCE_DIR/build_output.txt"
    fi
    echo ""
    
    # 8. Test Suite
    echo "8. UNIT TESTS"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    if grep -q '"test"' package.json; then
        echo "Running test suite..."
        npm run test -- --passWithNoTests 2>&1 | tee "$EVIDENCE_DIR/jest_output.txt" | tail -30 || {
            echo "⚠️  Some tests failed"
        }
    else
        echo "⚠️  No test script found in package.json"
    fi
    echo ""
    
    # 9. Dependencies Check
    echo "9. DEPENDENCY ANALYSIS"
    echo "----------------------------------------"
    cd "$FRONTEND_DIR"
    echo "Direct dependencies:"
    cat package.json | grep -A 100 '"dependencies"' | grep '":' | wc -l || echo "0"
    echo ""
    echo "Dev dependencies:"
    cat package.json | grep -A 100 '"devDependencies"' | grep '":' | wc -l || echo "0"
    echo ""
    echo "Key frameworks:"
    cat package.json | grep -E '"(react|next|typescript|tailwindcss)"'
    echo ""
    
    # 10. API Integration
    echo "10. API INTEGRATION CHECK"
    echo "----------------------------------------"
    echo "Checking for API base URL configuration..."
    grep -r "API_URL\|NEXT_PUBLIC_API" . --include="*.ts" --include="*.tsx" --include="*.env*" | head -10 || echo "Not found"
    echo ""
    echo "API client usage:"
    grep -r "axios\|fetch" lib/ app/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0"
    echo ""
    
    # 11. Environment Variables
    echo "11. ENVIRONMENT CONFIGURATION"
    echo "----------------------------------------"
    echo "Environment variables defined:"
    if [ -f ".env.example" ]; then
        cat .env.example | grep "^[A-Z]" | cut -d'=' -f1
    elif [ -f ".env.local.example" ]; then
        cat .env.local.example | grep "^[A-Z]" | cut -d'=' -f1
    else
        echo "No .env.example found"
    fi
    echo ""
    
    # 12. Security Headers (CSP)
    echo "12. SECURITY CONFIGURATION"
    echo "----------------------------------------"
    echo "Checking for Content Security Policy..."
    if [ -f "csp-config.js" ]; then
        echo "✅ CSP config found"
        head -20 csp-config.js
    else
        echo "⚠️  No CSP config found"
    fi
    echo ""
    
    echo "Checking next.config:"
    if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
        echo "✅ Next.js config found"
        head -30 next.config.* 2>/dev/null | head -30
    fi
    echo ""
    
    echo "========================================"
    echo "Frontend audit completed: $(date)"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Frontend audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
