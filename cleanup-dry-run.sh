#!/bin/bash
# cleanup-dry-run.sh - DRY RUN da limpeza (não remove nada)

set -e

echo "🔍 ====================================="
echo "🔍 DRY RUN - Limpeza do Repositório"
echo "🔍 Nenhum arquivo será removido"
echo "🔍 ====================================="
echo ""

# FASE 1: Git --cached removals
echo "📦 FASE 1: Arquivos a remover do git (--cached)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if git ls-files | grep -q 'playwright-report/'; then
    echo "✅ playwright-report/ está no git:"
    git ls-files | grep 'playwright-report/' | wc -l
    echo "   arquivos encontrados"
else
    echo "✓ playwright-report/ não está no git"
fi
echo ""

# FASE 2: Arquivar docs de auditoria
echo "📄 FASE 2: Documentos de auditoria na raiz"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in ACTION_PLAN.md AUDIT_REPORT.md DEPLOY_AUDIT.md; do
    if [ -f "$file" ]; then
        if git ls-files --error-unmatch "$file" &>/dev/null; then
            echo "✅ $file (VERSIONADO - será arquivado)"
        else
            echo "⚠️  $file (NÃO VERSIONADO)"
        fi
    else
        echo "✓ $file (não existe)"
    fi
done
echo ""

# FASE 3: Arquivos locais de auditoria
echo "🗑️  FASE 3: Arquivos locais de auditoria (não git)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in AUDITORIA_SEGURANCA_2026-02-05.md auditoria-ouvify.md audit-evidence.tgz; do
    if [ -f "$file" ]; then
        size=$(du -sh "$file" | cut -f1)
        echo "🗑️  $file ($size)"
    fi
done
echo ""

echo "📁 Diretórios a remover:"
for dir in audit/ tmp/ audit-reports/backend/; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        files=$(find "$dir" -type f 2>/dev/null | wc -l)
        echo "🗑️  $dir ($size, $files arquivos)"
    fi
done
echo ""

# FASE 4: Build artifacts
echo "🔨 FASE 4: Build artifacts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pycache_count=$(find apps/backend -type d -name '__pycache__' 2>/dev/null | wc -l)
echo "🐍 __pycache__ directories: $pycache_count"

pyc_count=$(find . -type f -name '*.pyc' 2>/dev/null | wc -l)
echo "🐍 *.pyc files: $pyc_count"

if [ -d "apps/frontend/.next" ]; then
    next_size=$(du -sh apps/frontend/.next 2>/dev/null | cut -f1)
    echo "⚛️  .next/ directory: $next_size"
fi

if [ -d "apps/frontend/test-results" ]; then
    test_results_size=$(du -sh apps/frontend/test-results 2>/dev/null | cut -f1)
    echo "🧪 test-results/ directory: $test_results_size"
fi
echo ""

# RESUMO
echo "📊 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tamanhos atuais:"
du -sh .venv node_modules apps/backend/.venv 2>/dev/null | while read size dir; do
    echo "  $dir: $size"
done
echo ""

total_audit_size=0
if [ -d "audit/" ]; then
    audit_kb=$(du -sk audit/ | cut -f1)
    total_audit_size=$((total_audit_size + audit_kb))
fi
if [ -d "tmp/" ]; then
    tmp_kb=$(du -sk tmp/ | cut -f1)
    total_audit_size=$((total_audit_size + tmp_kb))
fi
if [ -d "audit-reports/backend/" ]; then
    backend_kb=$(du -sk audit-reports/backend/ | cut -f1)
    total_audit_size=$((total_audit_size + backend_kb))
fi

total_audit_mb=$(echo "scale=2; $total_audit_size / 1024" | bc)
echo "💾 Total a remover (audit outputs): ~${total_audit_mb}MB"
echo ""

echo "✅ DRY RUN concluído!"
echo ""
echo "Para executar a limpeza real, execute:"
echo "  bash cleanup.sh"
