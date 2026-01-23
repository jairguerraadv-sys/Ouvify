#!/bin/bash
set -e

echo "🔍 AUDITORIA - FRONTEND NEXT.JS"
echo "================================"

cd "$(dirname "$0")/../apps/frontend"

# 1. Verificar se node_modules existe
echo -n "3.1.1 node_modules... "
if [ -d "node_modules" ]; then
    echo "✅ Existe"
else
    echo "⚠️  Não existe, instalando..."
    npm install
fi

# 2. Verificar package.json
echo -n "3.1.2 package.json... "
if [ -f "package.json" ]; then
    echo "✅ Existe"
else
    echo "❌ Não encontrado!"
    exit 1
fi

# 3. Lint
echo ""
echo "3.1.3 Executando ESLint..."
npm run lint 2>&1 | tail -20 || echo "  ⚠️  Warnings/Erros no lint"

# 4. TypeScript Check
echo ""
echo "3.1.4 TypeScript Check..."
npx tsc --noEmit 2>&1 | tail -20 || echo "  ⚠️  Erros de TypeScript"

# 5. Verificar estrutura de pastas
echo ""
echo "3.1.5 Estrutura do projeto:"
echo -n "  app/... "
[ -d "app" ] && echo "✅" || echo "⚠️"
echo -n "  components/... "
[ -d "components" ] && echo "✅" || echo "⚠️"
echo -n "  lib/... "
[ -d "lib" ] && echo "✅" || echo "⚠️"
echo -n "  hooks/... "
[ -d "hooks" ] && echo "✅" || echo "⚠️"

echo ""
echo "✅ AUDITORIA DE FRONTEND CONCLUÍDA"
cd ../..
