#!/bin/bash
###############################################################################
# ROMA BOOTSTRAP - Ouvify Audit
# Inicializa o servidor ROMA local para orquestrar a auditoria
###############################################################################

set -e  # Fail on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
WORKSPACE_ROOT="/workspaces/Ouvify"
ROMA_SERVER_SCRIPT="$WORKSPACE_ROOT/scripts/roma_server.py"
AUDIT_EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
LOG_FILE="$AUDIT_EVIDENCE_DIR/roma_bootstrap.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🤖 ROMA Bootstrap - Ouvify Audit System${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Create evidence directory
mkdir -p "$AUDIT_EVIDENCE_DIR"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting ROMA bootstrap..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Check if Flask is installed
log "Checking Flask installation..."
if ! python3 -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Flask not found. Installing...${NC}"
    pip install flask
    log "Flask installed successfully"
else
    log "Flask already installed"
fi

# Check if ROMA server script exists
if [ ! -f "$ROMA_SERVER_SCRIPT" ]; then
    echo -e "${RED}❌ ROMA server script not found at: $ROMA_SERVER_SCRIPT${NC}"
    exit 1
fi

log "ROMA server script found"

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5000 already in use. Attempting to stop existing process...${NC}"
    PID=$(lsof -ti:5000)
    kill -9 $PID 2>/dev/null || true
    sleep 2
    log "Killed process on port 5000 (PID: $PID)"
fi

# Start ROMA server in background
log "Starting ROMA server on http://127.0.0.1:5000..."
nohup python3 "$ROMA_SERVER_SCRIPT" > "$AUDIT_EVIDENCE_DIR/roma_server.log" 2>&1 &
ROMA_PID=$!

echo $ROMA_PID > "$AUDIT_EVIDENCE_DIR/roma.pid"
log "ROMA server started with PID: $ROMA_PID"

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for ROMA server to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://127.0.0.1:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ROMA server is healthy!${NC}"
        log "ROMA server health check passed"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ ROMA server failed to start within 30 seconds${NC}"
        log "ERROR: ROMA server failed to start"
        cat "$AUDIT_EVIDENCE_DIR/roma_server.log"
        exit 1
    fi
    
    sleep 1
done

# Test health endpoint
echo ""
echo -e "${BLUE}🔍 Testing ROMA endpoints...${NC}"
HEALTH_RESPONSE=$(curl -s http://127.0.0.1:5000/health)
log "Health response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health endpoint: PASSED${NC}"
else
    echo -e "${RED}❌ Health endpoint: FAILED${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ ROMA Bootstrap Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📊 Dashboard:    ${BLUE}http://127.0.0.1:5000${NC}"
echo -e "🔄 Health Check: ${BLUE}http://127.0.0.1:5000/health${NC}"
echo -e "📋 API:          ${BLUE}http://127.0.0.1:5000/api/audit${NC}"
echo -e "📝 PID:          ${YELLOW}$ROMA_PID${NC}"
echo -e "📂 Logs:         ${YELLOW}$AUDIT_EVIDENCE_DIR/roma_server.log${NC}"
echo ""
echo -e "${YELLOW}💡 To stop ROMA: kill $ROMA_PID${NC}"
echo -e "${YELLOW}💡 To view logs: tail -f $AUDIT_EVIDENCE_DIR/roma_server.log${NC}"
echo ""

log "Bootstrap completed successfully"
exit 0
