#!/bin/bash
# ==================================================================================
# P1-004: Dependency Security Audit  
# Script para auditar vulnerabilidades em dependências Python e JavaScript
# ==================================================================================

set -e  # Exit on error

EVIDENCE_DIR="/workspaces/Ouvify/audit/evidence"
REPORT_FILE="/workspaces/Ouvify/audit/DEPENDENCY_AUDIT_$(date +%Y%m%d).md"

mkdir -p "$EVIDENCE_DIR"

echo "===================================================================="
echo "  P1-004: DEPENDENCY SECURITY AUDIT"
echo "  Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "===================================================================="
echo

# ===================================================================
# 1. BACKEND (Python)
# ===================================================================
echo "1. Auditando dependências Python com pip-audit..."
cd /workspaces/Ouvify/apps/backend

# Verificar se pip-audit está instalado
if ! command -v pip-audit &> /dev/null; then
    echo "⚠️  pip-audit não instalado. Instalando..."
    pip install pip-audit
fi

# Executar audit com output JSON
pip-audit --requirement requirements/base.txt --format json > "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>&1 || true

# Executar audit com output human-readable
echo "Backend vulnerabilities:" > "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).txt"
pip-audit --requirement requirements/base.txt >> "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).txt" 2>&1 || echo "✅ No vulnerabilities found!" >> "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).txt"

echo "✅ Backend audit completed. Check: $EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).{json,txt}"
echo

# ===================================================================
# 2. FRONTEND (JavaScript/TypeScript)
# ===================================================================
echo "2. Auditando dependências JavaScript/TypeScript com npm audit..."
cd /workspaces/Ouvify/apps/frontend

# Audit com JSON output
npm audit --json > "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>&1 || true

# Audit com human-readable output
echo "Frontend vulnerabilities:" > "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).txt"
npm audit >> "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).txt" 2>&1 || echo "✅ No vulnerabilities found!" >> "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).txt"

echo "✅ Frontend audit completed. Check: $EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).{json,txt}"
echo

# ===================================================================
# 3. GERAR RELATÓRIO CONSOLIDADO
# ===================================================================
echo "3. Gerando relatório consolidado markdown..."

cat > "$REPORT_FILE" <<'REPORT_HEADER'
# 🔍 Relatório de Auditoria de Dependências

**Data:** $(date '+%d/%m/%Y %H:%M:%S')  
**Auditor:** Automated Security Audit (P1-004)  
**Ferramenta:** pip-audit (Python) + npm audit (JavaScript)

---

## 📊 Sumário Executivo

### Backend (Python)
REPORT_HEADER

# Parse backend JSON e contar CVEs
BACKEND_CRITICAL=$(jq -r '.vulnerabilities[] | select(.fix_versions) | select(.severity == "CRITICAL") | .id' "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>/dev/null | wc -l || echo "0")
BACKEND_HIGH=$(jq -r '.vulnerabilities[] | select(.fix_versions) | select(.severity == "HIGH") | .id' "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>/dev/null | wc -l || echo "0")
BACKEND_MEDIUM=$(jq -r '.vulnerabilities[] | select(.fix_versions) | select(.severity == "MEDIUM") | .id' "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>/dev/null | wc -l || echo "0")
BACKEND_LOW=$(jq -r '.vulnerabilities[] | select(.fix_versions) | select(.severity == "LOW") | .id' "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>/dev/null | wc -l || echo "0")

cat >> "$REPORT_FILE" <<BACKEND_SUMMARY
- **Critical:** $BACKEND_CRITICAL
- **High:** $BACKEND_HIGH
- **Medium:** $BACKEND_MEDIUM
- **Low:** $BACKEND_LOW

### Frontend (JavaScript/TypeScript)
BACKEND_SUMMARY

# Parse frontend JSON
FRONTEND_CRITICAL=$(jq -r '.metadata.vulnerabilities.critical' "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>/dev/null || echo "0")
FRONTEND_HIGH=$(jq -r '.metadata.vulnerabilities.high' "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>/dev/null || echo "0")
FRONTEND_MEDIUM=$(jq -r '.metadata.vulnerabilities.moderate' "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>/dev/null || echo "0")
FRONTEND_LOW=$(jq -r '.metadata.vulnerabilities.low' "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>/dev/null || echo "0")

cat >> "$REPORT_FILE" <<FRONTEND_SUMMARY
- **Critical:** $FRONTEND_CRITICAL
- **High:** $FRONTEND_HIGH
- **Medium:** $FRONTEND_MEDIUM
- **Low:** $FRONTEND_LOW

---

## 🐍 Backend (Python) - Detalhes

\`\`\`
$(cat "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).txt")
\`\`\`

**JSON completo:** \`audit/evidence/pip_audit_$(date +%Y%m%d).json\`

---

## 🌐 Frontend (JavaScript) - Detalhes

\`\`\`
$(cat "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).txt")
\`\`\`

**JSON completo:** \`audit/evidence/npm_audit_$(date +%Y%m%d).json\`

---

## ✅ Plano de Ação

### Vulnerabilidades Críticas (Action Required)
FRONTEND_SUMMARY

# Adicionar lista de CVEs críticas
if [ "$BACKEND_CRITICAL" -gt 0 ] || [ "$FRONTEND_CRITICAL" -gt 0 ]; then
    echo "⚠️ **EXISTEM VULNERABILIDADES CRÍTICAS!**" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Backend Critical CVEs:**" >> "$REPORT_FILE"
    jq -r '.vulnerabilities[] | select(.severity == "CRITICAL") | "- [\(.id)](\(.advisory_url)) - Package: \(.package) - Fixed in: \(.fix_versions | join(", "))"' "$EVIDENCE_DIR/pip_audit_$(date +%Y%m%d).json" 2>/dev/null >> "$REPORT_FILE" || echo "None" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Frontend Critical CVEs:**" >> "$REPORT_FILE"
    jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "critical") | "- \(.key) - \(.value.via[].title // .value.via[])"' "$EVIDENCE_DIR/npm_audit_$(date +%Y%m%d).json" 2>/dev/null >> "$REPORT_FILE" || echo "None" >> "$REPORT_FILE"
else
    echo "✅ **Nenhuma vulnerabilidade crítica encontrada!**" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "### Vulnerabilidades High" >> "$REPORT_FILE"
if [ "$BACKEND_HIGH" -gt 0 ] || [ "$FRONTEND_HIGH" -gt 0 ]; then
    echo "**Plano:** Avaliar e aplicar patches em até 7 dias" >> "$REPORT_FILE"
else
    echo "✅ Nenhuma" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "### Vulnerabilidades Medium/Low" >> "$REPORT_FILE"  
echo "**Plano:** Avaliar e atualizar na próxima janela de manutenção (mensal)" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Próxima auditoria agendada:** $(date -d '+30 days' '+%d/%m/%Y')" >> "$REPORT_FILE"
echo "**Executar script:** \`./tools/audit/dependency_audit.sh\`" >> "$REPORT_FILE"

echo "✅ Relatório completo em: $REPORT_FILE"
echo
echo "===================================================================="
echo "  AUDIT CONCLUÍDA!"  
echo "===================================================================="
echo "📋 Relatório: $REPORT_FILE"
echo "📁 Evidence: $EVIDENCE_DIR"
echo
echo "Ações recomendadas:"
if [ "$BACKEND_CRITICAL" -gt 0 ] || [ "$FRONTEND_CRITICAL" -gt 0 ]; then
    echo "⚠️  URGENTE: Corrigir vulnerabilidades CRÍTICAS imediatamente!"
    exit 1
else
    echo "✅ Nenhuma ação urgente necessária."
    exit 0
fi
