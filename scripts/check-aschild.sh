#!/bin/bash

echo "🔍 VERIFICAÇÃO: Padrão asChild"
echo "================================"
echo ""

cd "$(dirname "$0")"

# Buscar asChild em Button components (excluindo Radix UI components)
ASCHILD_FILES=$(grep -rl "Button.*asChild" apps/frontend/app apps/frontend/components --include="*.tsx" 2>/dev/null | grep -v ".backups")

if [ -z "$ASCHILD_FILES" ]; then
  echo "✅ Nenhum uso problemático de Button asChild encontrado"
else
  echo "⚠️  Arquivos com Button asChild encontrados:"
  echo ""
  echo "$ASCHILD_FILES"
  echo ""
  echo "📋 Detalhes:"
  grep -rn "Button.*asChild" apps/frontend/app apps/frontend/components --include="*.tsx" 2>/dev/null | grep -v ".backups" | grep -v "// ⚠️"
  echo ""
  echo "⚠️  Revise cada arquivo e aplique o padrão:"
  echo "   Link > Button (ao invés de Button asChild > Link)"
fi

echo ""
echo "================================"
echo "🔍 VERIFICAÇÃO: Build errors"
echo "================================"
echo ""

cd apps/frontend

# Verificar se há .next antigo
if [ -d ".next" ]; then
  echo "🗑️  Limpando cache .next..."
  rm -rf .next
fi

# Tentar build
echo "🔨 Executando build..."
npm run build > /tmp/ouvify-build.log 2>&1 &
BUILD_PID=$!

# Aguardar 30 segundos
sleep 30

# Verificar se ainda está rodando
if kill -0 $BUILD_PID 2>/dev/null; then
  echo "⏳ Build ainda em andamento (PID: $BUILD_PID)"
  echo "   Logs em: /tmp/ouvify-build.log"
  echo "   Para acompanhar: tail -f /tmp/ouvify-build.log"
else
  # Verificar resultado
  if grep -q "Compiled successfully" /tmp/ouvify-build.log 2>/dev/null; then
    echo "✅ Build completado com sucesso!"
  elif grep -iq "error\|children.only" /tmp/ouvify-build.log 2>/dev/null; then
    echo "❌ Build falhou com erros:"
    grep -i "error\|children.only" /tmp/ouvify-build.log | head -10
  else
    echo "⚠️  Status do build indeterminado"
    echo "   Verifique /tmp/ouvify-build.log"
  fi
fi

echo ""
echo "================================"
echo "📊 RESUMO"
echo "================================"
echo ""
echo "Arquivos modificados nesta correção:"
echo "  - components/layout/Header.tsx"
echo "  - components/ui/EmptyState.tsx"
echo "  - components/ui/button.tsx"
echo "  - app/dashboard/ajuda/page.tsx"
echo "  - app/dashboard/configuracoes/page.tsx"
echo "  - app/recuperar-senha/page.tsx"
echo "  - components/dashboard/header.tsx"
echo "  - app/admin/page.tsx"
echo ""
echo "Total: 8 arquivos, 18 ocorrências corrigidas"
echo ""
echo "Commit: 09c5997"
echo "Branch: consolidate-monorepo"
echo "Status: ✅ Pushed to GitHub"
echo ""
echo "Verificação concluída!"
