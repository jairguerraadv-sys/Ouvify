#!/bin/bash

echo "🧹 LIMPEZA TOTAL DE BACKGROUNDS E CORES INCONSISTENTES"
echo "========================================================"
echo ""

cd /Users/jairneto/Desktop/ouvy_saas/apps/frontend

# Backup completo
BACKUP_DIR=".backups/total_cleanup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Criando backup em $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r app components "$BACKUP_DIR/"

echo ""
echo "🎨 FASE 1: Removendo gradientes de fundo..."

# Remover TODOS os gradientes de fundo
find app -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' -E 's/className="([^"]*)(bg-gradient-to-[a-z]+[[:space:]]+from-[a-z]+-[0-9]+[[:space:]]+to-[a-z]+-[0-9]+)([^"]*)"/className="\1bg-white\3"/g' "$file"
done

echo "✅ Gradientes de fundo removidos"

echo ""
echo "🎨 FASE 2: Convertendo backgrounds escuros para branco..."

# Backgrounds escuros → branco
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/className="\([^"]*\)bg-gray-900\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-gray-800\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-slate-900\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-slate-800\([^"]*\)"/className="\1bg-white\2"/g' \
    "$file"
done

echo "✅ Backgrounds escuros convertidos"

echo ""
echo "🎨 FASE 3: Removendo backgrounds coloridos..."

# Backgrounds coloridos (azul, roxo, violeta, índigo) → branco
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/className="\([^"]*\)bg-blue-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-purple-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-violet-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-indigo-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-primary-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    -e 's/className="\([^"]*\)bg-secondary-[0-9]\+\([^"]*\)"/className="\1bg-white\2"/g' \
    "$file"
done

echo "✅ Backgrounds coloridos removidos"

echo ""
echo "📝 FASE 4: Ajustando textos para contraste correto..."

# Textos brancos → cinza escuro (exceto em buttons/badges)
find app -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  # Usar perl para regex mais sofisticadas
  perl -i -pe 's/(className="[^"]*?)text-white(?![^"]*(?:Button|button|btn|Badge|badge))([^"]*?")/\1text-gray-900\2/g' "$file"
  perl -i -pe 's/(className="[^"]*?)text-gray-100(?![^"]*(?:Button|button))([^"]*?")/\1text-gray-900\2/g' "$file"
  perl -i -pe 's/(className="[^"]*?)text-gray-200(?![^"]*(?:Button|button))([^"]*?")/\1text-gray-700\2/g' "$file"
done

echo "✅ Textos ajustados para contraste"

echo ""
echo "🎨 FASE 5: Padronizando cores de texto..."

# Converter cores antigas para novas
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/text-blue-600/text-primary-600/g' \
    -e 's/text-blue-700/text-primary-700/g' \
    -e 's/text-purple-600/text-secondary-600/g' \
    -e 's/text-purple-700/text-secondary-700/g' \
    "$file"
done

echo "✅ Cores de texto padronizadas"

echo ""
echo "🔗 FASE 6: Ajustando bordas..."

# Padronizar bordas
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/border-blue-/border-primary-/g' \
    -e 's/border-purple-/border-secondary-/g' \
    -e 's/border-gray-800/border-gray-200/g' \
    -e 's/border-gray-900/border-gray-200/g' \
    "$file"
done

echo "✅ Bordas padronizadas"

echo ""
echo "📊 RELATÓRIO DE MUDANÇAS:"
echo "========================================================"

# Contar mudanças
TOTAL_FILES=$(find app components -type f -name "*.tsx" | wc -l | xargs)
CHANGED_FILES=$(git diff --name-only | wc -l | xargs)

echo "📁 Total de arquivos TSX: $TOTAL_FILES"
echo "✏️  Arquivos modificados: $CHANGED_FILES"
echo ""

# Verificar se ainda há problemas
echo "🔍 VERIFICANDO PROBLEMAS RESTANTES:"
echo ""

BG_GRADIENT=$(grep -r "bg-gradient" app components --include="*.tsx" 2>/dev/null | grep -v "text-gradient" | wc -l | xargs)
BG_COLORED=$(grep -rE "bg-(blue|purple|violet|indigo)-[0-9]" app --include="*.tsx" 2>/dev/null | grep -v "Button" | wc -l | xargs)
BG_DARK=$(grep -rE "bg-(gray|slate)-(800|900)" app --include="*.tsx" 2>/dev/null | wc -l | xargs)

echo "⚠️  Gradientes de fundo restantes: $BG_GRADIENT"
echo "⚠️  Backgrounds coloridos restantes: $BG_COLORED"
echo "⚠️  Backgrounds escuros restantes: $BG_DARK"

echo ""
echo "========================================================"
echo "✅ LIMPEZA CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Revisar mudanças: git diff"
echo "2. Testar visualmente: npm run dev"
echo "3. Ajustes manuais em hero sections (manter gradientes em TEXTOS)"
echo "4. Verificar páginas críticas: /, /cadastro, /login, /precos"
echo "5. Commit: git add -A && git commit -m 'feat: total UI standardization'"
echo ""
echo "📦 Backup salvo em: $BACKUP_DIR"
