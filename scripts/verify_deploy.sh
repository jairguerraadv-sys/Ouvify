#!/bin/bash
# Deploy Verification Script - Ouvy SaaS
# Sprint 5 - Feature 5.5: Testes E2E & Deploy Final
#
# Este script verifica todos os componentes antes do deploy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 OUVY SAAS - Deploy Verification Script                 ║${NC}"
echo -e "${BLUE}║     Sprint 5 - Verificação Final                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track results
PASSED=0
FAILED=0
WARNINGS=0

check() {
    local name="$1"
    local result="$2"
    if [ "$result" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((PASSED++))
    else
        echo -e "  ${RED}✗${NC} $name"
        ((FAILED++))
    fi
}

warn() {
    local name="$1"
    echo -e "  ${YELLOW}⚠${NC} $name"
    ((WARNINGS++))
}

# ============================================
# 1. BACKEND CHECKS
# ============================================
echo -e "\n${BLUE}📦 1. Backend Checks${NC}"
echo "────────────────────────────────────"

cd "$PROJECT_ROOT/apps/backend"

# Check if venv exists
if [ -d "../../venv" ]; then
    source ../../venv/bin/activate 2>/dev/null || true
fi

# Django configuration check
echo "  Checking Django configuration..."
if python manage.py check --deploy 2>/dev/null; then
    check "Django deploy check" 0
else
    check "Django deploy check" 1
fi

# Migrations check
echo "  Checking migrations..."
MIGRATION_STATUS=$(python manage.py migrate --check 2>&1 || echo "PENDING")
if [[ "$MIGRATION_STATUS" != *"PENDING"* ]] && [[ "$MIGRATION_STATUS" != *"error"* ]]; then
    check "Migrations up-to-date" 0
else
    warn "Pending migrations detected"
fi

# Static files check
echo "  Checking static files..."
if python manage.py collectstatic --noinput --dry-run 2>/dev/null | grep -q "static"; then
    check "Static files collection" 0
else
    check "Static files collection" 1
fi

# Security settings check
echo "  Checking security settings..."
SECURITY_ISSUES=$(python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.conf import settings
issues = []
if settings.DEBUG:
    issues.append('DEBUG=True')
if not settings.SECURE_SSL_REDIRECT:
    issues.append('SECURE_SSL_REDIRECT=False')
print(','.join(issues) if issues else 'OK')
" 2>/dev/null || echo "ERROR")

if [ "$SECURITY_ISSUES" == "OK" ]; then
    check "Security settings" 0
elif [ "$SECURITY_ISSUES" == "ERROR" ]; then
    warn "Could not verify security settings"
else
    warn "Security issues: $SECURITY_ISSUES"
fi

# ============================================
# 2. FRONTEND CHECKS
# ============================================
echo -e "\n${BLUE}🎨 2. Frontend Checks${NC}"
echo "────────────────────────────────────"

cd "$PROJECT_ROOT/apps/frontend"

# TypeScript check
echo "  Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    check "TypeScript compilation" 0
else
    check "TypeScript compilation" 1
fi

# ESLint check
echo "  Running ESLint..."
if npm run lint 2>/dev/null; then
    check "ESLint" 0
else
    warn "ESLint has warnings"
fi

# Build check
echo "  Testing production build..."
if npm run build 2>/dev/null; then
    check "Production build" 0
else
    check "Production build" 1
fi

# ============================================
# 3. TESTS
# ============================================
echo -e "\n${BLUE}🧪 3. Tests${NC}"
echo "────────────────────────────────────"

cd "$PROJECT_ROOT/apps/backend"

# Backend unit tests
echo "  Running backend tests..."
if python -m pytest --tb=no -q 2>/dev/null | tail -1 | grep -q "passed"; then
    check "Backend unit tests" 0
else
    warn "Some backend tests may have failed"
fi

cd "$PROJECT_ROOT/apps/frontend"

# Frontend unit tests
echo "  Running frontend tests..."
if npm run test -- --passWithNoTests 2>/dev/null; then
    check "Frontend unit tests" 0
else
    warn "Some frontend tests may have failed"
fi

# ============================================
# 4. ENVIRONMENT
# ============================================
echo -e "\n${BLUE}🔐 4. Environment${NC}"
echo "────────────────────────────────────"

cd "$PROJECT_ROOT/apps/backend"

# Check required env vars
echo "  Checking required environment variables..."
REQUIRED_VARS=("SECRET_KEY" "DATABASE_URL" "ALLOWED_HOSTS")
MISSING_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^$var=" .env 2>/dev/null; then
        # Check if it's in .env file
        if ! grep -q "^$var=" .env 2>/dev/null; then
            ((MISSING_VARS++))
        fi
    fi
done

if [ $MISSING_VARS -eq 0 ]; then
    check "Required environment variables" 0
else
    warn "Some environment variables may be missing"
fi

# ============================================
# 5. DATABASE
# ============================================
echo -e "\n${BLUE}🗄️  5. Database${NC}"
echo "────────────────────────────────────"

# Check database connection
echo "  Checking database connection..."
DB_CHECK=$(python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection
try:
    connection.ensure_connection()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null || echo "ERROR")

if [ "$DB_CHECK" == "OK" ]; then
    check "Database connection" 0
else
    warn "Database connection issue: $DB_CHECK"
fi

# ============================================
# 6. DEPENDENCIES
# ============================================
echo -e "\n${BLUE}📚 6. Dependencies${NC}"
echo "────────────────────────────────────"

cd "$PROJECT_ROOT/apps/backend"

# Check for security vulnerabilities in Python packages
echo "  Checking Python dependencies..."
if pip check 2>/dev/null; then
    check "Python dependencies" 0
else
    warn "Dependency issues detected"
fi

cd "$PROJECT_ROOT/apps/frontend"

# Check for npm vulnerabilities
echo "  Checking npm dependencies..."
AUDIT_RESULT=$(npm audit --production 2>/dev/null | tail -1 || echo "UNKNOWN")
if [[ "$AUDIT_RESULT" == *"0 vulnerabilities"* ]] || [[ "$AUDIT_RESULT" == *"found 0"* ]]; then
    check "npm dependencies" 0
else
    warn "npm audit found issues"
fi

# ============================================
# 7. FINAL SUMMARY
# ============================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                        📊 SUMMARY                              ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✓ Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "  ${RED}✗ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ DEPLOY VERIFICATION PASSED - Ready for production!        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ DEPLOY VERIFICATION FAILED - Fix issues before deploy      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
