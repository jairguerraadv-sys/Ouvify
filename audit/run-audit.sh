#!/bin/bash
# ============================================
# Script de Auditoria Automatizada - Ouvify
# Data: 2026-01-30
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretórios
PROJECT_ROOT="/Users/jairneto/Desktop/ouvy_saas"
AUDIT_DIR="${PROJECT_ROOT}/audit/reports/2026-01-30"
BACKEND_DIR="${PROJECT_ROOT}/apps/backend"
FRONTEND_DIR="${PROJECT_ROOT}/apps/frontend"

# Criar diretório de relatórios se não existir
mkdir -p "${AUDIT_DIR}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   AUDITORIA AUTOMATIZADA - OUVIFY SAAS    ${NC}"
echo -e "${BLUE}   Data: $(date +%Y-%m-%d)                 ${NC}"
echo -e "${BLUE}============================================${NC}"

# ============================================
# 1. DJANGO DEPLOY CHECK
# ============================================
echo -e "\n${YELLOW}[1/6] Verificando Django Deploy Check...${NC}"

cd "${BACKEND_DIR}"

if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "Rodando: python manage.py check --deploy"
python manage.py check --deploy 2>&1 | tee "${AUDIT_DIR}/django-deploy-check.txt" || true

echo -e "${GREEN}✓ Django check salvo em: django-deploy-check.txt${NC}"

# ============================================
# 2. AUDITORIA DE DEPENDÊNCIAS - BACKEND
# ============================================
echo -e "\n${YELLOW}[2/6] Auditando dependências Python (pip-audit)...${NC}"

if ! command -v pip-audit &> /dev/null; then
    echo "Instalando pip-audit..."
    pip install pip-audit
fi

echo "Rodando: pip-audit"
pip-audit --format json --output "${AUDIT_DIR}/pip-audit.json" 2>&1 || true
pip-audit --format text 2>&1 | tee "${AUDIT_DIR}/pip-audit.txt" || true

echo -e "${GREEN}✓ Auditoria pip salva em: pip-audit.json, pip-audit.txt${NC}"

# ============================================
# 3. AUDITORIA DE DEPENDÊNCIAS - FRONTEND
# ============================================
echo -e "\n${YELLOW}[3/6] Auditando dependências Node.js (npm audit)...${NC}"

cd "${FRONTEND_DIR}"

echo "Rodando: npm audit"
npm audit --json > "${AUDIT_DIR}/npm-audit.json" 2>&1 || true
npm audit 2>&1 | tee "${AUDIT_DIR}/npm-audit.txt" || true

echo -e "${GREEN}✓ Auditoria npm salva em: npm-audit.json, npm-audit.txt${NC}"

# ============================================
# 4. SECRETS SCANNING (gitleaks)
# ============================================
echo -e "\n${YELLOW}[4/6] Escaneando secrets (gitleaks)...${NC}"

cd "${PROJECT_ROOT}"

if command -v gitleaks &> /dev/null; then
    echo "Rodando: gitleaks detect"
    gitleaks detect --source . --report-path "${AUDIT_DIR}/gitleaks-report.json" --report-format json 2>&1 || true
    echo -e "${GREEN}✓ Gitleaks salvo em: gitleaks-report.json${NC}"
else
    echo -e "${RED}⚠ gitleaks não instalado. Instale com: brew install gitleaks${NC}"
    echo "gitleaks não instalado - pulando scan de secrets" > "${AUDIT_DIR}/gitleaks-report.json"
fi

# ============================================
# 5. SAST - SEMGREP
# ============================================
echo -e "\n${YELLOW}[5/6] Análise estática (semgrep)...${NC}"

if command -v semgrep &> /dev/null; then
    echo "Rodando: semgrep (backend)"
    semgrep scan "${BACKEND_DIR}" --config auto --json --output "${AUDIT_DIR}/semgrep-backend.json" 2>&1 || true
    
    echo "Rodando: semgrep (frontend)"
    semgrep scan "${FRONTEND_DIR}" --config auto --json --output "${AUDIT_DIR}/semgrep-frontend.json" 2>&1 || true
    
    echo -e "${GREEN}✓ Semgrep salvo em: semgrep-backend.json, semgrep-frontend.json${NC}"
else
    echo -e "${RED}⚠ semgrep não instalado. Instale com: pip install semgrep${NC}"
    echo "semgrep não instalado" > "${AUDIT_DIR}/semgrep-backend.json"
    echo "semgrep não instalado" > "${AUDIT_DIR}/semgrep-frontend.json"
fi

# ============================================
# 6. LINT E TYPE CHECK
# ============================================
echo -e "\n${YELLOW}[6/6] Lint e Type Check...${NC}"

# Backend
cd "${BACKEND_DIR}"
echo "Rodando: ruff check (backend)"
if command -v ruff &> /dev/null; then
    ruff check . --output-format json > "${AUDIT_DIR}/ruff-backend.json" 2>&1 || true
    echo -e "${GREEN}✓ Ruff backend salvo em: ruff-backend.json${NC}"
else
    echo "ruff não instalado" > "${AUDIT_DIR}/ruff-backend.json"
fi

# Frontend
cd "${FRONTEND_DIR}"
echo "Rodando: npm run lint (frontend)"
npm run lint 2>&1 | tee "${AUDIT_DIR}/eslint-frontend.txt" || true

echo "Rodando: npm run type-check (frontend)"
npm run type-check 2>&1 | tee "${AUDIT_DIR}/typescript-check.txt" || true

echo -e "${GREEN}✓ Lint frontend salvo em: eslint-frontend.txt, typescript-check.txt${NC}"

# ============================================
# RESUMO
# ============================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}   AUDITORIA CONCLUÍDA                     ${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "\n${GREEN}Relatórios gerados em: ${AUDIT_DIR}${NC}"
echo ""
ls -la "${AUDIT_DIR}"

echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Revise os relatórios gerados"
echo "2. Abra as issues no GitHub (ver audit/ISSUES_GITHUB.md)"
echo "3. Crie os PRs de correção"
echo "4. Execute os testes: cd apps/backend && pytest"

echo -e "\n${GREEN}Auditoria finalizada!${NC}"
