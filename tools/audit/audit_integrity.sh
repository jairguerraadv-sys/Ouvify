#!/bin/bash
###############################################################################
# AUDIT INTEGRITY - Ouvify
# Detecta duplicações, dead code, imports quebrados, rotas faltantes
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/integrity.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔍 Integrity Audit - Code Quality${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY INTEGRITY AUDIT REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Legacy/Backup Folders
    echo "1. LEGACY/BACKUP/OLD FOLDERS"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT"
    find . -type d \( -name "*old*" -o -name "*backup*" -o -name "*legacy*" -o -name "*v1*" -o -name "*tmp*" \) \
        ! -path "*node_modules*" ! -path "*/.git/*" ! -path "*/__pycache__/*" || echo "None found"
    echo ""
    
    # 2. Duplicate Dependencies (Python)
    echo "2. PYTHON DEPENDENCY CHECK"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/requirements/base.txt" ]; then
        cd "$WORKSPACE_ROOT/apps/backend"
        echo "Checking for duplicate package names..."
        cat requirements/base.txt | grep -v "^#" | grep -v "^$" | cut -d'=' -f1 | cut -d'>' -f1 | cut -d'<' -f1 | sort | uniq -d || echo "No duplicates found"
    fi
    echo ""
    
    # 3. Broken Python Imports (basic check)
    echo "3. PYTHON IMPORT ANALYSIS"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/backend" ]; then
        cd "$WORKSPACE_ROOT/apps/backend"
        echo "Searching for common import issues..."
        # Look for imports from non-existent modules
        grep -r "from.*import" apps/ --include="*.py" | grep -v "__pycache__" | \
            grep -E "(from old|from backup|from legacy)" | head -10 || echo "No obvious issues found"
    fi
    echo ""
    
    # 4. Unused Python Files (no imports)
    echo "4. POTENTIALLY UNUSED PYTHON FILES"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/backend/apps" ]; then
        cd "$WORKSPACE_ROOT/apps/backend"
        echo "Files not imported anywhere (sample):"
        for file in $(find apps/ -name "*.py" ! -name "__*" ! -path "*/__pycache__/*" | head -20); do
            filename=$(basename "$file" .py)
            # Skip if it's imported somewhere
            if ! grep -rq "import.*$filename\|from.*$filename" apps/ 2>/dev/null; then
                echo "  - $file"
            fi
        done
    fi
    echo ""
    
    # 5. TypeScript Build Check
    echo "5. TYPESCRIPT/FRONTEND BUILD CHECK"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/frontend" ]; then
        cd "$WORKSPACE_ROOT/apps/frontend"
        echo "Checking if frontend builds..."
        if npm run build &> "$EVIDENCE_DIR/frontend_build.log"; then
            echo "✅ Build successful"
        else
            echo "❌ Build failed - check $EVIDENCE_DIR/frontend_build.log"
            echo "First 20 errors:"
            tail -20 "$EVIDENCE_DIR/frontend_build.log"
        fi
    fi
    echo ""
    
    # 6. Dead Routes (URLs defined but views missing)
    echo "6. ROUTE INTEGRITY CHECK"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/urls.py" ]; then
        echo "Checking Django URL patterns..."
        cd "$WORKSPACE_ROOT/apps/backend"
        grep -E "path\(.*views\." config/urls.py | head -10 || echo "No direct view imports in main urls.py"
    fi
    echo ""
    
    # 7. Missing Assets/Static Files
    echo "7. STATIC/MEDIA REFERENCES"
    echo "----------------------------------------"
    echo "Checking for broken asset references..."
    if [ -d "$WORKSPACE_ROOT/apps/frontend" ]; then
        cd "$WORKSPACE_ROOT/apps/frontend"
        # Look for image imports that might not exist
        grep -r "src=\"/images" app/ --include="*.tsx" --include="*.jsx" | head -10 || echo "No direct image refs found"
    fi
    echo ""
    
    # 8. Duplicate Code Detection (basic)
    echo "8. DUPLICATE CODE PATTERNS"
    echo "----------------------------------------"
    echo "Searching for copy-pasted code patterns..."
    cd "$WORKSPACE_ROOT/apps/backend"
    # Find files with very similar names (might be duplicates)
    find apps/ -name "*.py" ! -path "*/__pycache__/*" | \
        sed 's|.*/||' | sort | uniq -d | head -10 || echo "No obvious duplicates"
    echo ""
    
    # 9. TODOs and FIXMEs
    echo "9. TODOs/FIXMEs IN CODE"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT"
    echo "Backend TODOs:"
    grep -r "TODO\|FIXME\|XXX\|HACK" apps/backend --include="*.py" | wc -l || echo "0"
    echo "Frontend TODOs:"
    grep -r "TODO\|FIXME\|XXX\|HACK" apps/frontend --include="*.ts" --include="*.tsx" | wc -l || echo "0"
    echo ""
    echo "Sample TODOs (first 10):"
    grep -r "TODO\|FIXME" apps/ --include="*.py" --include="*.ts" --include="*.tsx" | head -10 || echo "None"
    echo ""
    
    # 10. Large Files (potential optimization targets)
    echo "10. LARGE FILES (>100KB)"
    echo "----------------------------------------"
    find apps/ -type f -size +100k ! -path "*node_modules*" ! -path "*/__pycache__/*" ! -path "*/.next/*" -exec ls -lh {} \; | \
        awk '{print $5 "\t" $9}' | head -20 || echo "None found"
    echo ""
    
    echo "========================================"
    echo "Integrity audit completed: $(date)"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Integrity audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
