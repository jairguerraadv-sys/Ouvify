#!/bin/bash
###############################################################################
# RUN ALL AUDITS - Ouvify
# Executa toda a suite de auditoria em ordem, com ROMA como backbone
###############################################################################

set -e  # Exit on first error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

WORKSPACE_ROOT="/workspaces/Ouvify"
TOOLS_DIR="$WORKSPACE_ROOT/tools/audit"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
MASTER_LOG="$EVIDENCE_DIR/audit_master.log"

# Create evidence directory
mkdir -p "$EVIDENCE_DIR"

# Logging function
log_master() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MASTER_LOG"
}

echo -e "${CYAN}"
echo "═══════════════════════════════════════════════════════════════════"
echo "   🤖 ROMA-POWERED AUDIT SUITE - OUVIFY MONOREPO"
echo "═══════════════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Framework:${NC} ROMA (Reasoning On Multiple Abstractions)"
echo -e "${BLUE}Target:${NC} Ouvify SaaS - White Label Feedback Platform"
echo -e "${BLUE}Started:${NC} $(date)"
echo ""
log_master "=== ROMA AUDIT SUITE STARTED ==="

# Step 0: Bootstrap ROMA
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}   STEP 0: ROMA BOOTSTRAP${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$TOOLS_DIR/roma_bootstrap.sh" ]; then
    log_master "Executing ROMA bootstrap..."
    bash "$TOOLS_DIR/roma_bootstrap.sh"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ROMA bootstrap successful${NC}"
        log_master "ROMA bootstrap: SUCCESS"
    else
        echo -e "${RED}❌ ROMA bootstrap failed${NC}"
        log_master "ROMA bootstrap: FAILED"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  ROMA bootstrap script not found, skipping...${NC}"
    log_master "ROMA bootstrap: SKIPPED (script not found)"
fi

echo ""
sleep 2

# Define audit scripts in order
AUDIT_SCRIPTS=(
    "audit_inventory.sh:INVENTORY:Catalog monorepo structure"
    "audit_integrity.sh:INTEGRITY:Code quality and duplications"
    "audit_security.sh:SECURITY:Vulnerability scanning"
    "audit_backend.sh:BACKEND:Django/Python tests and checks"
    "audit_frontend.sh:FRONTEND:Next.js/React tests and build"
    "audit_performance.sh:PERFORMANCE:Speed and optimization"
)

# Counter for progress
TOTAL_AUDITS=${#AUDIT_SCRIPTS[@]}
CURRENT=0
FAILED_AUDITS=()

# Execute each audit
for AUDIT_DEF in "${AUDIT_SCRIPTS[@]}"; do
    # Parse definition: script:name:description
    IFS=':' read -r SCRIPT NAME DESC <<< "$AUDIT_DEF"
    CURRENT=$((CURRENT + 1))
    
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}   STEP $CURRENT/$TOTAL_AUDITS: $NAME${NC}"
    echo -e "${MAGENTA}   $DESC${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_master "Starting audit: $NAME ($SCRIPT)"
    
    if [ -f "$TOOLS_DIR/$SCRIPT" ]; then
        # Make script executable
        chmod +x "$TOOLS_DIR/$SCRIPT"
        
        # Execute audit
        if bash "$TOOLS_DIR/$SCRIPT"; then
            echo -e "${GREEN}✅ $NAME audit completed successfully${NC}"
            log_master "$NAME: SUCCESS"
        else
            echo -e "${RED}❌ $NAME audit failed${NC}"
            log_master "$NAME: FAILED"
            FAILED_AUDITS+=("$NAME")
            
            # Ask if should continue despite failure
            echo ""
            echo -e "${YELLOW}Continue with remaining audits? [Y/n]${NC}"
            read -t 10 -n 1 CONTINUE || CONTINUE="Y"
            echo ""
            
            if [[ ! $CONTINUE =~ ^[Yy]$ ]] && [ "$CONTINUE" != "" ]; then
                echo -e "${RED}Audit suite aborted by user${NC}"
                log_master "Audit suite: ABORTED by user after $NAME failure"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Audit script not found: $SCRIPT${NC}"
        log_master "$NAME: SKIPPED (script not found)"
        FAILED_AUDITS+=("$NAME (script not found)")
    fi
    
    echo ""
    sleep 1
done

# Final Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   📊 AUDIT SUITE SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

log_master "=== AUDIT SUITE COMPLETED ==="

echo -e "${BLUE}Completed:${NC} $(date)"
echo -e "${BLUE}Total Audits:${NC} $TOTAL_AUDITS"

if [ ${#FAILED_AUDITS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All audits passed!${NC}"
    log_master "Final status: ALL PASSED"
    EXIT_CODE=0
else
    echo -e "${RED}❌ Failed Audits: ${#FAILED_AUDITS[@]}${NC}"
    log_master "Final status: ${#FAILED_AUDITS[@]} FAILURES"
    echo ""
    echo -e "${YELLOW}Failed audit modules:${NC}"
    for FAILED in "${FAILED_AUDITS[@]}"; do
        echo -e "  ${RED}✗${NC} $FAILED"
        log_master "  FAILED: $FAILED"
    done
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}📁 Evidence Directory:${NC} $EVIDENCE_DIR"
echo -e "${BLUE}📝 Master Log:${NC} $MASTER_LOG"
echo ""

echo -e "${CYAN}Generated Reports:${NC}"
echo "  • inventory.log    - Monorepo structure and dependencies"
echo "  • integrity.log    - Code quality and duplications"
echo "  • security.log     - Security vulnerabilities"
echo "  • backend.log      - Backend tests and checks"
echo "  • frontend.log     - Frontend tests and build"
echo "  • performance.log  - Performance metrics"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review all reports in: $EVIDENCE_DIR"
echo "  2. Address critical findings (security & integrity)"
echo "  3. Update documentation based on inventory"
echo "  4. Generate consolidated report: AUDIT_REPORT.md"
echo "  5. Create backlog from findings: MVP_BACKLOG.md"
echo ""

# Stop ROMA server if it was started
if [ -f "$EVIDENCE_DIR/roma.pid" ]; then
    ROMA_PID=$(cat "$EVIDENCE_DIR/roma.pid")
    if ps -p $ROMA_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 Stopping ROMA server (PID: $ROMA_PID)...${NC}"
        kill $ROMA_PID 2>/dev/null || true
        log_master "ROMA server stopped"
    fi
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
log_master "Script completed with exit code: $EXIT_CODE"

exit $EXIT_CODE
