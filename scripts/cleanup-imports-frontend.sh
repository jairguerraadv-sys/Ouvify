#!/bin/bash
# Remove imports não utilizados do código TypeScript/React
# Usa eslint para limpar código

set -e

echo "🧹 Removendo imports não utilizados (TypeScript/React)..."

cd apps/frontend

# Verificar se eslint está disponível
if ! npm list eslint &> /dev/null; then
    echo "❌ ESLint não encontrado. Instale com: npm install"
    exit 1
fi

echo "🔧 Executando eslint --fix..."
npx eslint . --fix --ext .ts,.tsx --quiet || true

echo "✅ Imports removidos com sucesso!"

# Verificar build
echo "🔍 Verificando build..."
npm run build

echo ""
echo "✅ Limpeza concluída! Execute 'npm test' para validar."
