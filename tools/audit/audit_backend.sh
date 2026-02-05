#!/bin/bash
###############################################################################
# AUDIT BACKEND - Ouvify
# Testes, linting, endpoints, multi-tenant isolation
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
BACKEND_DIR="$WORKSPACE_ROOT/apps/backend"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/backend.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🐍 Backend Audit - Django/Python${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY BACKEND AUDIT REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Python Version
    echo "1. PYTHON VERSION"
    echo "----------------------------------------"
    python3 --version
    echo ""
    
    # 2. Django Check
    echo "2. DJANGO SYSTEM CHECK"
    echo "----------------------------------------"
    cd "$BACKEND_DIR"
    if [ -f "manage.py" ]; then
        echo "Running Django system check..."
        python3 manage.py check --deploy 2>&1 || echo "⚠️  Check completed with warnings"
    fi
    echo ""
    
    # 3. Migrations Status
    echo "3. MIGRATIONS STATUS"
    echo "----------------------------------------"
    cd "$BACKEND_DIR"
    if [ -f "manage.py" ]; then
        echo "Checking for unapplied migrations..."
        python3 manage.py showmigrations --list 2>&1 | tail -30 || echo "Unable to check migrations"
    fi
    echo ""
    
    # 4. Django Apps Installed
    echo "4. INSTALLED APPS"
    echo "----------------------------------------"
    if [ -f "$BACKEND_DIR/config/settings.py" ]; then
        grep -A 30 "INSTALLED_APPS" "$BACKEND_DIR/config/settings.py" | grep -E "^\s+'" | head -20
    fi
    echo ""
    
    # 5. API Endpoints
    echo "5. API ENDPOINTS (URLS)"
    echo "----------------------------------------"
    cd "$BACKEND_DIR"
    if [ -f "manage.py" ]; then
        echo "Listing URL patterns..."
        python3 manage.py show_urls 2>&1 | head -50 || {
            echo "show_urls not available, checking urls.py manually..."
            grep -r "path\|re_path" config/urls.py apps/*/urls.py 2>/dev/null | head -30
        }
    fi
    echo ""
    
    # 6. Models Overview
    echo "6. DATABASE MODELS"
    echo "----------------------------------------"
    cd "$BACKEND_DIR/apps"
    echo "Models by app:"
    for app in */; do
        if [ -f "${app}models.py" ]; then
            echo "App: $app"
            grep -E "^class.*\(models\." "${app}models.py" | head -10
        fi
    done
    echo ""
    
    # 7. Multi-Tenancy Implementation
    echo "7. MULTI-TENANCY CHECK"
    echo "----------------------------------------"
    echo "Checking tenant model and middleware..."
    if [ -d "$BACKEND_DIR/apps/tenants" ]; then
        echo "Tenant app found"
        grep -E "class.*Tenant|class.*Client" "$BACKEND_DIR/apps/tenants/models.py" 2>/dev/null | head -5 || echo "Model not found"
    fi
    echo ""
    echo "Checking for tenant middleware:"
    grep -r "TenantMiddleware\|tenant" "$BACKEND_DIR/config/settings.py" 2>/dev/null | head -5 || echo "Not found in settings"
    echo ""
    
    # 8. Authentication & Permissions
    echo "8. AUTHENTICATION & PERMISSIONS"
    echo "----------------------------------------"
    echo "Checking permission classes..."
    grep -r "permission_classes\|IsAuthenticated\|IsAdmin" "$BACKEND_DIR/apps" --include="*.py" | head -15 || echo "None found"
    echo ""
    
    # 9. Tests Existence
    echo "9. TESTS COVERAGE"
    echo "----------------------------------------"
    cd "$BACKEND_DIR"
    echo "Test files found:"
    find apps/ tests/ -name "test*.py" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "Running pytest (if available)..."
    if command -v pytest &> /dev/null; then
        # Run tests with coverage
        pytest --version
        echo "Running tests with coverage..."
        pytest --cov=apps --cov-report=term-missing --tb=short -v 2>&1 | tee "$EVIDENCE_DIR/pytest_output.txt" | tail -50 || {
            echo "⚠️  Tests failed or had errors"
        }
    else
        echo "⚠️  pytest not installed"
        echo "Falling back to Django test runner..."
        python3 manage.py test --keepdb --parallel 2>&1 | tail -30 || echo "Tests failed"
    fi
    echo ""
    
    # 10. Linting (if available)
    echo "10. CODE LINTING"
    echo "----------------------------------------"
    cd "$BACKEND_DIR"
    if command -v pylint &> /dev/null; then
        echo "Running pylint on apps/..."
        pylint apps/ --disable=all --enable=E,F --exit-zero > "$EVIDENCE_DIR/pylint_errors.txt" 2>&1
        echo "Critical errors found:"
        cat "$EVIDENCE_DIR/pylint_errors.txt" | grep -E "E:|F:" | wc -l || echo "0"
        echo "Sample errors:"
        head -20 "$EVIDENCE_DIR/pylint_errors.txt"
    else
        echo "⚠️  pylint not installed"
    fi
    echo ""
    
    # 11. Celery Tasks
    echo "11. CELERY TASKS"
    echo "----------------------------------------"
    echo "Searching for Celery task definitions..."
    grep -r "@shared_task\|@task" "$BACKEND_DIR/apps" --include="*.py" | head -10 || echo "No Celery tasks found"
    echo ""
    
    # 12. API Serializers
    echo "12. DRF SERIALIZERS"
    echo "----------------------------------------"
    echo "Checking serializer definitions..."
    find "$BACKEND_DIR/apps" -name "serializers.py" -o -name "serializer.py" | head -10 || echo "None found"
    echo ""
    
    echo "========================================"
    echo "Backend audit completed: $(date)"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Backend audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
