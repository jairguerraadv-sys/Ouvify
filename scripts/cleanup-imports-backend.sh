#!/bin/bash
# Remove imports não utilizados do código Python
# Usa autoflake para limpar código

set -e

echo "🧹 Removendo imports não utilizados (Python)..."

cd apps/backend

# Verificar se autoflake está instalado
if ! python -c "import autoflake" 2>/dev/null; then
    echo "📦 Instalando autoflake..."
    pip install autoflake
fi

# Executar em modo dry-run primeiro
echo "📋 Prévia das mudanças:"
autoflake --remove-all-unused-imports --remove-unused-variables --recursive apps/ config/ | head -50

# Confirmar mudanças
read -p "⚠️ Aplicar mudanças? (s/N): " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

# Aplicar mudanças
echo "🔧 Aplicando mudanças..."
autoflake --remove-all-unused-imports --remove-unused-variables --in-place --recursive apps/ config/

echo "✅ Imports removidos com sucesso!"

# Verificar com flake8
if command -v flake8 &> /dev/null; then
    echo "🔍 Verificando com flake8..."
    flake8 apps/ config/ --count --select=F401 --show-source --statistics || true
fi

echo ""
echo "✅ Limpeza concluída! Execute 'pytest' para validar."
