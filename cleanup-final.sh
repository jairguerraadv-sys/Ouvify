#!/bin/bash
# cleanup-final.sh - Limpeza final otimizada

set -e

echo "🧹 ====================================="
echo "🧹 Limpeza Final - Apenas Essenciais"
echo "🧹 ====================================="
echo ""

# FASE 1: Remover venv obsoleto
echo "🗑️  FASE 1: Remover venv obsoleto..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/workspaces/Ouvify/apps/backend/venv" ]; then
    size=$(du -sh /workspaces/Ouvify/apps/backend/venv | cut -f1)
    echo "⚠️  apps/backend/venv/ existe ($size)"
    echo "   Este venv SEM PONTO é obsoleto (use apps/backend/.venv)"
    echo ""
    read -p "Remover apps/backend/venv/? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf /workspaces/Ouvify/apps/backend/venv/
        echo "✅ apps/backend/venv/ removido"
    else
        echo "⏭️  Pulado"
    fi
else
    echo "✅ apps/backend/venv/ não existe"
fi
echo ""

# FASE 2: Limpar arquivos .pyc
echo "🐍 FASE 2: Limpar arquivos .pyc..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pyc_count=$(find /workspaces/Ouvify -path '*/.venv/*' -prune -o -path '*/node_modules/*' -prune -o -path '*/venv/*' -prune -o -type f -name '*.pyc' -print 2>/dev/null | wc -l)
echo "🔍 Encontrados: $pyc_count arquivos .pyc (fora de deps)"

if [ "$pyc_count" -gt 0 ]; then
    echo ""
    read -p "Remover $pyc_count arquivos .pyc? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find /workspaces/Ouvify -path '*/.venv/*' -prune -o -path '*/node_modules/*' -prune -o -path '*/venv/*' -prune -o -type f -name '*.pyc' -delete 2>/dev/null
        echo "✅ $pyc_count arquivos .pyc removidos"
    else
        echo "⏭️  Pulado"
    fi
else
    echo "✅ Nenhum arquivo .pyc fora de deps"
fi
echo ""

# FASE 3: Limpar __pycache__ directories
echo "📦 FASE 3: Limpar __pycache__ directories..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pycache_count=$(find /workspaces/Ouvify/apps -type d -name '__pycache__' 2>/dev/null | wc -l)
echo "🔍 Encontrados: $pycache_count diretórios __pycache__ em apps/"

if [ "$pycache_count" -gt 0 ]; then
    echo ""
    read -p "Remover $pycache_count diretórios __pycache__? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find /workspaces/Ouvify/apps -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
        echo "✅ $pycache_count diretórios __pycache__ removidos"
    else
        echo "⏭️  Pulado"
    fi
else
    echo "✅ Nenhum __pycache__ em apps/"
fi
echo ""

# FASE 4: Limpar frontend artifacts
echo "⚛️  FASE 4: Limpar frontend artifacts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
frontend_artifacts=(.next test-results playwright-report)
removed=0

for artifact in "${frontend_artifacts[@]}"; do
    path="/workspaces/Ouvify/apps/frontend/$artifact"
    if [ -d "$path" ]; then
        size=$(du -sh "$path" 2>/dev/null | cut -f1)
        echo "🗑️  $artifact/ ($size)"
        rm -rf "$path"
        removed=$((removed + 1))
    fi
done

if [ $removed -gt 0 ]; then
    echo "✅ $removed frontend artifacts removidos"
else
    echo "✅ Frontend artifacts já limpos"
fi
echo ""

# FASE 5: Limpar pytest cache
echo "🧪 FASE 5: Limpar pytest cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pytest_count=$(find /workspaces/Ouvify -name '.pytest_cache' -type d 2>/dev/null | wc -l)
if [ "$pytest_count" -gt 0 ]; then
    find /workspaces/Ouvify -name '.pytest_cache' -type d -exec rm -rf {} + 2>/dev/null || true
    echo "✅ $pytest_count .pytest_cache removidos"
else
    echo "✅ Nenhum .pytest_cache"
fi
echo ""

# RESUMO
echo "📊 RESUMO FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Virtual Environments (mantidos):"
du -sh /workspaces/Ouvify/.venv /workspaces/Ouvify/apps/backend/.venv /workspaces/Ouvify/apps/frontend/.venv 2>/dev/null | while read size dir; do
    echo "  $dir: $size"
done
echo ""

# Verificar se venv obsoleto ainda existe
if [ -d "/workspaces/Ouvify/apps/backend/venv" ]; then
    echo "⚠️  apps/backend/venv/ ainda existe (não foi removido)"
else
    echo "✅ apps/backend/venv/ removido com sucesso"
fi
echo ""

echo "✅ Limpeza final concluída!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Validar backend: cd apps/backend && make audit-backend"
echo "  2. Validar frontend: cd apps/frontend && npm run build"
echo "  3. Commit: git add -A && git commit -m 'chore: cleanup artifacts'"
