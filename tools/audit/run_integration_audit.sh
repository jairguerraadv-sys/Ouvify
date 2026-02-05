#!/bin/bash
# run_integration_audit.sh - Master script para auditoria completa de integração
# Roda todos os scripts de auditoria em ordem e falha se encontrar P0

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EVIDENCE_DIR="$REPO_ROOT/audit/evidence"

echo "🚀 ========================================"
echo "🚀 Integration Audit - Full Suite"
echo "🚀 ========================================"
echo ""
echo "Repo: $REPO_ROOT"
echo "Evidence: $EVIDENCE_DIR"
echo ""

# Criar diretórios
mkdir -p "$EVIDENCE_DIR"

# Contadores
total_checks=0
passed_checks=0
failed_checks=0
p0_issues=0

# Função helper
run_check() {
    local name=$1
    local command=$2
    local is_critical=${3:-false}
    
    total_checks=$((total_checks + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$total_checks] $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if eval "$command"; then
        echo "✅ PASSED: $name"
        passed_checks=$((passed_checks + 1))
    else
        echo "❌ FAILED: $name"
        failed_checks=$((failed_checks + 1))
        
        if [ "$is_critical" = "true" ]; then
            p0_issues=$((p0_issues + 1))
        fi
    fi
}

# FASE 1: EXTRAÇÃO DE CONTRATOS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 1: Contract Extraction"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_check "Frontend Contract" \
    "python3 $SCRIPT_DIR/audit_contract_frontend.py"

run_check "Backend Contract" \
    "python3 $SCRIPT_DIR/audit_contract_backend.py"

run_check "Contract Diff" \
    "python3 $SCRIPT_DIR/contract_diff.py" \
    true  # Crítico - pode ter P0s

# FASE 2: SMOKE TESTS
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 2: Smoke Tests (Environment)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: Smoke tests podem falhar se ambiente não está no ar
run_check "Smoke Tests" \
    "bash $SCRIPT_DIR/smoke_env.sh" \
    false  # Não crítico para development

# FASE 3: STATIC ASSETS
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 3: Static Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_check "Static Assets (Manifest)" \
    "bash $SCRIPT_DIR/check_static_assets.sh" \
    true  # Crítico - P0 se manifest falta

# FASE 4: CSP
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 4: Content Security Policy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_check "CSP Headers" \
    "bash $SCRIPT_DIR/check_csp.sh" \
    true  # Crítico - P0 se inline script sem nonce

# RESUMO FINAL
echo ""
echo "========================================"
echo "🎯 AUDIT SUMMARY"
echo "========================================"
echo ""
echo "Total Checks:  $total_checks"
echo "✅ Passed:      $passed_checks"
echo "❌ Failed:      $failed_checks"
echo ""

if [ $p0_issues -gt 0 ]; then
    echo "🚨 P0 ISSUES DETECTED: $p0_issues"
    echo ""
    echo "❌ AUDIT FAILED - Cannot proceed to production"
    echo ""
    echo "Review evidence in: $EVIDENCE_DIR/"
    echo "Review contract matrix: $REPO_ROOT/audit/CONTRACT_MATRIX.md"
    exit 1
else
    echo "✅ NO P0 ISSUES"
    
    if [ $failed_checks -gt 0 ]; then
        echo ""
        echo "⚠️  Some non-critical checks failed"
        echo "Review and fix before production deployment"
        exit 2
    else
        echo ""
        echo "✅ ALL CHECKS PASSED"
        echo ""
        echo "Safe to proceed with deployment"
        exit 0
    fi
fi
