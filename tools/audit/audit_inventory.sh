#!/bin/bash
###############################################################################
# AUDIT INVENTORY - Ouvify
# Mapeia estrutura completa do monorepo: apps, rotas, dependências, ambientes
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/inventory.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   📦 Inventory Audit - Ouvify Monorepo${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY INVENTORY REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Workspace Structure
    echo "1. WORKSPACE STRUCTURE"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT"
    tree -L 3 -I 'node_modules|__pycache__|*.pyc|.next|build|dist|.git' -d || \
        find . -maxdepth 3 -type d ! -path '*/node_modules/*' ! -path '*/__pycache__/*' ! -path '*/.next/*' ! -path '*/.git/*' | head -100
    echo ""
    
    # 2. Python Apps (Django)
    echo "2. BACKEND APPS (Django)"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/backend/apps" ]; then
        ls -la "$WORKSPACE_ROOT/apps/backend/apps/" | grep "^d" || echo "No apps found"
    fi
    echo ""
    
    # 3. Frontend Pages (Next.js)
    echo "3. FRONTEND PAGES (Next.js)"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/frontend/app" ]; then
        find "$WORKSPACE_ROOT/apps/frontend/app" -name "page.tsx" -o -name "page.js" | head -50
    fi
    echo ""
    
    # 4. Backend Dependencies
    echo "4. BACKEND DEPENDENCIES"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/requirements/base.txt" ]; then
        wc -l "$WORKSPACE_ROOT/apps/backend/requirements/base.txt"
        echo "Top 20 packages:"
        head -20 "$WORKSPACE_ROOT/apps/backend/requirements/base.txt"
    fi
    echo ""
    
    # 5. Frontend Dependencies
    echo "5. FRONTEND DEPENDENCIES"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/frontend/package.json" ]; then
        cd "$WORKSPACE_ROOT/apps/frontend"
        echo "Total dependencies:"
        cat package.json | grep -A 100 '"dependencies"' | grep -c '":' || echo "0"
        echo ""
        echo "Key dependencies:"
        cat package.json | grep -E '"(next|react|typescript|axios)"' || echo "None found"
    fi
    echo ""
    
    # 6. Django URLs/Routes
    echo "6. BACKEND ROUTES (Django)"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/urls.py" ]; then
        grep -E "path\(|re_path\(|include\(" "$WORKSPACE_ROOT/apps/backend/config/urls.py" | head -20
    fi
    echo ""
    
    # 7. Environment Variables
    echo "7. ENVIRONMENT CONFIG"
    echo "----------------------------------------"
    echo "Backend .env.example:"
    if [ -f "$WORKSPACE_ROOT/apps/backend/.env.example" ]; then
        grep -E "^[A-Z_]+=" "$WORKSPACE_ROOT/apps/backend/.env.example" | cut -d'=' -f1 | sort
    fi
    echo ""
    echo "Frontend .env.example:"
    if [ -f "$WORKSPACE_ROOT/apps/frontend/.env.example" ]; then
        grep -E "^[A-Z_]+=" "$WORKSPACE_ROOT/apps/frontend/.env.example" | cut -d'=' -f1 | sort
    fi
    echo ""
    
    # 8. Code Statistics
    echo "8. CODE STATISTICS"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT"
    if command -v cloc &> /dev/null; then
        cloc apps/backend apps/frontend --json | head -50
    else
        echo "Python files:"
        find apps/backend -name "*.py" ! -path "*/__pycache__/*" | wc -l
        echo "TypeScript/JavaScript files:"
        find apps/frontend -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l
    fi
    echo ""
    
    # 9. Docker Services
    echo "9. DOCKER SERVICES"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/docker-compose.yml" ]; then
        grep -E "^  [a-z]" "$WORKSPACE_ROOT/docker-compose.yml" | sed 's/://' | sed 's/^  //'
    fi
    echo ""
    
    # 10. File Types Distribution
    echo "10. FILE TYPES"
    echo "----------------------------------------"
    find apps -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
    echo ""
    
    echo "========================================"
    echo "Inventory completed: $(date)"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Inventory audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
