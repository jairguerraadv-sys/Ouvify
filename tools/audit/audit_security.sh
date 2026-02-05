#!/bin/bash
###############################################################################
# AUDIT SECURITY - Ouvify
# Verifica secrets, vulnerabilidades de dependências, SAST básico
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/security.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔒 Security Audit - Vulnerability Scan${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY SECURITY AUDIT REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Secrets Scanning
    echo "1. SECRETS SCANNING"
    echo "----------------------------------------"
    echo "Searching for hardcoded secrets..."
    cd "$WORKSPACE_ROOT"
    
    echo "Checking for .env files in git:"
    git ls-files | grep "\.env$" || echo "✅ No .env files tracked"
    echo ""
    
    echo "Searching for potential secrets in code:"
    grep -r -i \
        -E "(SECRET_KEY|API_KEY|PASSWORD|TOKEN|PRIVATE_KEY|AWS_ACCESS|CREDENTIALS).*=.*['\"]" \
        apps/ \
        --include="*.py" \
        --include="*.js" \
        --include="*.ts" \
        --include="*.tsx" \
        --exclude="*.example" \
        --exclude="*.md" \
        | grep -v "os.getenv\|os.environ\|process.env" \
        | head -10 || echo "✅ No obvious hardcoded secrets found"
    echo ""
    
    # 2. Python Dependencies Audit
    echo "2. PYTHON DEPENDENCIES AUDIT"
    echo "----------------------------------------"
    if command -v pip-audit &> /dev/null; then
        cd "$WORKSPACE_ROOT/apps/backend"
        echo "Running pip-audit..."
        pip-audit --requirement requirements/base.txt --format json > "$EVIDENCE_DIR/pip_audit.json" 2>&1 || {
            echo "⚠️  pip-audit found vulnerabilities - check $EVIDENCE_DIR/pip_audit.json"
        }
        # Show summary
        if [ -f "$EVIDENCE_DIR/pip_audit.json" ]; then
            cat "$EVIDENCE_DIR/pip_audit.json" | head -50
        fi
    else
        echo "⚠️  pip-audit not installed. Installing..."
        pip install pip-audit
        cd "$WORKSPACE_ROOT/apps/backend"
        pip-audit --requirement requirements/base.txt --format json > "$EVIDENCE_DIR/pip_audit.json" || true
    fi
    echo ""
    
    # 3. NPM Audit
    echo "3. NPM DEPENDENCIES AUDIT"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/frontend" ]; then
        cd "$WORKSPACE_ROOT/apps/frontend"
        echo "Running npm audit..."
        npm audit --json > "$EVIDENCE_DIR/npm_audit.json" 2>&1 || {
            echo "⚠️  npm audit found vulnerabilities"
        }
        echo "Summary:"
        npm audit --production || true
    fi
    echo ""
    
    # 4. Django Security Settings
    echo "4. DJANGO SECURITY CONFIGURATION"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/settings.py" ]; then
        echo "Checking critical security settings..."
        
        echo "DEBUG setting:"
        grep "^DEBUG" "$WORKSPACE_ROOT/apps/backend/config/settings.py" || echo "Not found in main config"
        
        echo ""
        echo "SECRET_KEY handling:"
        grep -A 2 "SECRET_KEY" "$WORKSPACE_ROOT/apps/backend/config/settings.py" | head -5
        
        echo ""
        echo "ALLOWED_HOSTS:"
        grep "ALLOWED_HOSTS" "$WORKSPACE_ROOT/apps/backend/config/settings.py" | head -2
        
        echo ""
        echo "Security Headers:"
        grep -E "(SECURE_|X_FRAME|CSRF_|SESSION_COOKIE)" "$WORKSPACE_ROOT/apps/backend/config/settings.py" | head -10
    fi
    echo ""
    
    # 5. CORS Configuration
    echo "5. CORS CONFIGURATION"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/settings.py" ]; then
        echo "Checking CORS settings..."
        grep -A 5 "CORS_" "$WORKSPACE_ROOT/apps/backend/config/settings.py" | head -15
    fi
    echo ""
    
    # 6. Authentication Check
    echo "6. AUTHENTICATION CONFIGURATION"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/settings.py" ]; then
        echo "JWT Configuration:"
        grep -A 10 "SIMPLE_JWT" "$WORKSPACE_ROOT/apps/backend/config/settings.py" | head -15
    fi
    echo ""
    
    # 7. SQL Injection Patterns
    echo "7. SQL INJECTION RISK PATTERNS"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT/apps/backend"
    echo "Searching for raw SQL usage..."
    grep -r "\.raw\(|\.extra\(|execute\(" apps/ --include="*.py" | grep -v "test" | head -10 || echo "✅ No raw SQL found"
    echo ""
    
    # 8. XSS Prevention
    echo "8. XSS PREVENTION CHECK"
    echo "----------------------------------------"
    echo "Checking for sanitization libraries..."
    grep -r "bleach\|DOMPurify" "$WORKSPACE_ROOT/apps" --include="*.py" --include="*.ts" --include="*.tsx" | head -5 || echo "No sanitization library usage found"
    echo ""
    
    # 9. File Upload Security
    echo "9. FILE UPLOAD SECURITY"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT/apps/backend"
    echo "Checking file upload handling..."
    grep -r "FileField\|ImageField" apps/ --include="*.py" | head -5 || echo "No file fields found"
    echo ""
    
    # 10. Sensitive Data in Logs
    echo "10. LOGGING SECURITY"
    echo "----------------------------------------"
    echo "Checking for potential PII logging..."
    grep -r "logger.*password\|print.*password\|log.*token" apps/ --include="*.py" | head -5 || echo "✅ No obvious PII logging"
    echo ""
    
    # 11. Rate Limiting
    echo "11. RATE LIMITING CHECK"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT/apps/backend"
    grep -r "throttle\|ratelimit\|rate_limit" . --include="*.py" | head -10 || echo "⚠️  No rate limiting found"
    echo ""
    
    # 12. SAST (if semgrep available)
    echo "12. SAST (SEMGREP)"
    echo "----------------------------------------"
    if command -v semgrep &> /dev/null; then
        cd "$WORKSPACE_ROOT/apps/backend"
        echo "Running Semgrep SAST scan..."
        semgrep --config auto --json apps/ > "$EVIDENCE_DIR/semgrep_backend.json" 2>&1 || {
            echo "Semgrep completed with findings - check $EVIDENCE_DIR/semgrep_backend.json"
        }
        echo "Summary of findings:"
        cat "$EVIDENCE_DIR/semgrep_backend.json" | grep -o '"severity":"[^"]*"' | sort | uniq -c || echo "No JSON output"
    else
        echo "⚠️  Semgrep not available. To install: pip install semgrep"
    fi
    echo ""
    
    echo "========================================"
    echo "Security audit completed: $(date)"
    echo ""
    echo "RECOMMENDATIONS:"
    echo "1. Review $EVIDENCE_DIR/pip_audit.json for CVEs"
    echo "2. Review $EVIDENCE_DIR/npm_audit.json for vulnerabilities"
    echo "3. Ensure DEBUG=False in production"
    echo "4. Verify rate limiting is enabled on auth endpoints"
    echo "5. Check CORS configuration allows only trusted origins"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Security audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
