#!/bin/bash

echo "🔍 AUDITORIA - SEGURANÇA"
echo "========================"

cd "$(dirname "$0")/.."

# 1. Verificar .env não está no git
echo -n "7.1 .env no git... "
if git ls-files 2>/dev/null | grep -qE "^\.env$"; then
    echo "❌ .env está commitado!"
else
    echo "✅ .env não está no git"
fi

# 2. Verificar secrets hardcoded
echo ""
echo "7.2 Verificando secrets hardcoded..."
SECRETS_FOUND=$(grep -rE "SECRET_KEY\s*=\s*['\"][^'\"]+['\"]" apps/ --include="*.py" 2>/dev/null | grep -v "os.getenv\|os.environ\|env(" | head -3 || echo "")
if [ -n "$SECRETS_FOUND" ]; then
    echo "  ⚠️  Possíveis secrets hardcoded encontrados:"
    echo "$SECRETS_FOUND" | head -3
else
    echo "  ✅ Nenhum secret hardcoded"
fi

# 3. Verificar .gitignore
echo ""
echo "7.3 Verificando .gitignore..."
echo -n "  .env listado... "
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "✅"
else
    echo "⚠️  Não encontrado"
fi

echo -n "  __pycache__ listado... "
if grep -q "__pycache__" .gitignore 2>/dev/null; then
    echo "✅"
else
    echo "⚠️  Não encontrado"
fi

echo -n "  node_modules listado... "
if grep -q "node_modules" .gitignore 2>/dev/null; then
    echo "✅"
else
    echo "⚠️  Não encontrado"
fi

# 4. Verificar arquivos sensíveis
echo ""
echo "7.4 Arquivos sensíveis:"
echo -n "  .env.example existe... "
[ -f "apps/frontend/.env.example" ] && echo "✅" || echo "⚠️  Não encontrado"

# 5. Verificar dependências com vulnerabilidades (npm)
echo ""
echo "7.5 Audit de dependências (npm)..."
if [ -d "apps/frontend/node_modules" ]; then
    cd apps/frontend
    npm audit --audit-level=high 2>&1 | tail -10 || echo "  ⚠️  Erros no audit"
    cd ../..
else
    echo "  ⚠️  node_modules não encontrado"
fi

echo ""
echo "✅ AUDITORIA DE SEGURANÇA CONCLUÍDA"
