#!/bin/bash
# fix-hardcoded-colors.sh
# Substitui cores hardcoded por classes do Design System

set -e

cd "$(dirname "$0")"

echo "🎨 Iniciando substituição de cores hardcoded..."
echo ""

# Backup
echo "📦 Criando backup..."
BACKUP_DIR=".backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r app components "$BACKUP_DIR/"
echo "✅ Backup criado em: $BACKUP_DIR"
echo ""

# Contador
CHANGES=0

# 1. Substituir blue-* por primary-*
echo "🔵 Substituindo cores azuis (blue-*) por primary-*..."
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  if grep -q "bg-blue-\|text-blue-\|border-blue-\|from-blue-\|to-blue-\|hover:bg-blue-\|hover:text-blue-" "$file"; then
    sed -i '' \
      -e 's/bg-blue-50/bg-primary-50/g' \
      -e 's/bg-blue-100/bg-primary-100/g' \
      -e 's/bg-blue-200/bg-primary-200/g' \
      -e 's/bg-blue-300/bg-primary-300/g' \
      -e 's/bg-blue-400/bg-primary-400/g' \
      -e 's/bg-blue-500/bg-primary-500/g' \
      -e 's/bg-blue-600/bg-primary-600/g' \
      -e 's/bg-blue-700/bg-primary-700/g' \
      -e 's/bg-blue-800/bg-primary-800/g' \
      -e 's/bg-blue-900/bg-primary-900/g' \
      -e 's/text-blue-50/text-primary-50/g' \
      -e 's/text-blue-100/text-primary-100/g' \
      -e 's/text-blue-200/text-primary-200/g' \
      -e 's/text-blue-300/text-primary-300/g' \
      -e 's/text-blue-400/text-primary-400/g' \
      -e 's/text-blue-500/text-primary-500/g' \
      -e 's/text-blue-600/text-primary-600/g' \
      -e 's/text-blue-700/text-primary-700/g' \
      -e 's/text-blue-800/text-primary-800/g' \
      -e 's/text-blue-900/text-primary-900/g' \
      -e 's/border-blue-50/border-primary-50/g' \
      -e 's/border-blue-100/border-primary-100/g' \
      -e 's/border-blue-200/border-primary-200/g' \
      -e 's/border-blue-300/border-primary-300/g' \
      -e 's/border-blue-600/border-primary-600/g' \
      -e 's/from-blue-50/from-primary-50/g' \
      -e 's/from-blue-600/from-primary-600/g' \
      -e 's/from-blue-900/from-primary-900/g' \
      -e 's/to-blue-100/to-primary-100/g' \
      -e 's/to-blue-600/to-primary-600/g' \
      -e 's/to-blue-800/to-primary-800/g' \
      -e 's/hover:bg-blue-50/hover:bg-primary-50/g' \
      -e 's/hover:bg-blue-600/hover:bg-primary-600/g' \
      -e 's/hover:bg-blue-700/hover:bg-primary-700/g' \
      -e 's/hover:text-blue-600/hover:text-primary-600/g' \
      -e 's/hover:text-blue-700/hover:text-primary-700/g' \
      "$file"
    CHANGES=$((CHANGES + 1))
    echo "  ✓ $file"
  fi
done
echo ""

# 2. Substituir purple-* por secondary-*
echo "🟣 Substituindo cores roxas (purple-*) por secondary-*..."
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  if grep -q "bg-purple-\|text-purple-\|border-purple-\|from-purple-\|to-purple-\|hover:bg-purple-" "$file"; then
    sed -i '' \
      -e 's/bg-purple-50/bg-secondary-50/g' \
      -e 's/bg-purple-100/bg-secondary-100/g' \
      -e 's/bg-purple-200/bg-secondary-200/g' \
      -e 's/bg-purple-300/bg-secondary-300/g' \
      -e 's/bg-purple-400/bg-secondary-400/g' \
      -e 's/bg-purple-500/bg-secondary-500/g' \
      -e 's/bg-purple-600/bg-secondary-600/g' \
      -e 's/bg-purple-700/bg-secondary-700/g' \
      -e 's/bg-purple-800/bg-secondary-800/g' \
      -e 's/bg-purple-900/bg-secondary-900/g' \
      -e 's/text-purple-50/text-secondary-50/g' \
      -e 's/text-purple-100/text-secondary-100/g' \
      -e 's/text-purple-200/text-secondary-200/g' \
      -e 's/text-purple-300/text-secondary-300/g' \
      -e 's/text-purple-400/text-secondary-400/g' \
      -e 's/text-purple-500/text-secondary-500/g' \
      -e 's/text-purple-600/text-secondary-600/g' \
      -e 's/text-purple-700/text-secondary-700/g' \
      -e 's/text-purple-800/text-secondary-800/g' \
      -e 's/text-purple-900/text-secondary-900/g' \
      -e 's/border-purple-50/border-secondary-50/g' \
      -e 's/border-purple-100/border-secondary-100/g' \
      -e 's/border-purple-200/border-secondary-200/g' \
      -e 's/border-purple-300/border-secondary-300/g' \
      -e 's/from-purple-600/from-secondary-600/g' \
      -e 's/from-purple-900/from-secondary-900/g' \
      -e 's/to-purple-800/to-secondary-800/g' \
      -e 's/to-purple-900/to-secondary-900/g' \
      -e 's/hover:bg-purple-50/hover:bg-secondary-50/g' \
      -e 's/hover:bg-purple-600/hover:bg-secondary-600/g' \
      -e 's/hover:bg-purple-700/hover:bg-secondary-700/g' \
      "$file"
    CHANGES=$((CHANGES + 1))
    echo "  ✓ $file"
  fi
done
echo ""

# 3. Substituir brand-primary-* por primary-*
echo "🔄 Removendo prefixo brand-..."
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  if grep -q "brand-primary-\|brand-secondary-" "$file"; then
    sed -i '' \
      -e 's/brand-primary-/primary-/g' \
      -e 's/brand-secondary-/secondary-/g' \
      "$file"
    CHANGES=$((CHANGES + 1))
    echo "  ✓ $file"
  fi
done
echo ""

# 4. Substituir cyan-* por info-*
echo "🔵 Substituindo cyan por info..."
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  if grep -q "bg-cyan-\|text-cyan-\|border-cyan-" "$file"; then
    sed -i '' \
      -e 's/bg-cyan-/bg-info-/g' \
      -e 's/text-cyan-/text-info-/g' \
      -e 's/border-cyan-/border-info-/g' \
      "$file"
    CHANGES=$((CHANGES + 1))
    echo "  ✓ $file"
  fi
done
echo ""

echo "✅ Substituição concluída! Total de arquivos modificados: $CHANGES"
echo ""

# 5. Verificar cores restantes
echo "🔍 Verificando se restam cores hardcoded..."
BLUE_COUNT=$(grep -r "bg-blue-\|text-blue-\|border-blue-" app components --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
PURPLE_COUNT=$(grep -r "bg-purple-\|text-purple-" app components --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
BRAND_COUNT=$(grep -r "brand-primary-\|brand-secondary-" app components --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')

echo "  • Cores blue-*: $BLUE_COUNT instâncias restantes"
echo "  • Cores purple-*: $PURPLE_COUNT instâncias restantes"
echo "  • Prefixo brand-*: $BRAND_COUNT instâncias restantes"
echo ""

if [ "$BLUE_COUNT" -gt 0 ] || [ "$PURPLE_COUNT" -gt 0 ] || [ "$BRAND_COUNT" -gt 0 ]; then
  echo "⚠️  Ainda existem cores hardcoded. Execute o script novamente ou revise manualmente."
else
  echo "✅ Nenhuma cor hardcoded encontrada!"
fi

echo ""
echo "📦 Backup salvo em: $BACKUP_DIR"
echo ""
echo "⚠️  Próximos passos:"
echo "  1. Revisar mudanças: git diff"
echo "  2. Testar: npm run dev"
echo "  3. Verificar visualmente: http://localhost:3000"
echo "  4. Commit: git add -A && git commit -m 'fix: unify color system'"
echo ""
echo "🎉 Script finalizado!"
