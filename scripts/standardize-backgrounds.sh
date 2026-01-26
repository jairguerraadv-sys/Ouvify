#!/bin/bash

echo "🎨 Padronizando backgrounds e componentes..."
echo ""

cd "$(dirname "$0")/../apps/frontend"

# Backup
BACKUP_DIR=".backups/standardization_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Criando backup em: $BACKUP_DIR"
cp -r app components "$BACKUP_DIR/"

echo ""
echo "🔄 Aplicando transformações..."
echo ""

# Contador de mudanças
CHANGES=0

# 1. Remover gradientes de background em sections/pages (manter apenas em spans/textos)
echo "1️⃣  Removendo gradientes de background de sections..."
find app -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  if grep -q "bg-gradient-to" "$file"; then
    # Substituir bg-gradient-to-* em sections/divs por bg-white
    sed -i '' -E 's/(className="[^"]*)(bg-gradient-to-[a-z]+ from-[a-z]+-[0-9]+ (via-[a-z]+-[0-9]+ )?to-[a-z]+-[0-9]+)([^"]*")/\1bg-white\4/g' "$file"
    ((CHANGES++))
  fi
done

# 2. Substituir backgrounds escuros por branco
echo "2️⃣  Substituindo backgrounds escuros por branco..."
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  if grep -qE "bg-(gray|slate)-(900|800)" "$file"; then
    sed -i '' -E 's/bg-(gray|slate)-(900|800)/bg-white/g' "$file"
    ((CHANGES++))
  fi
done

# 3. Substituir fundos coloridos primários/secundários por branco
echo "3️⃣  Substituindo fundos coloridos por branco..."
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  if grep -qE "bg-(primary|secondary)-(900|800)" "$file"; then
    sed -i '' -E 's/bg-(primary|secondary)-(900|800)/bg-white/g' "$file"
    ((CHANGES++))
  fi
done

# 4. Atualizar textos escuros para cinza em fundos brancos
echo "4️⃣  Atualizando cores de texto..."
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  # text-white em headers/sections (não em buttons)
  if grep -q "text-white" "$file" && ! grep -q "Button" "$file"; then
    sed -i '' -E 's/([^-])text-white([^-])/\1text-gray-900\2/g' "$file"
    ((CHANGES++))
  fi
  
  # text-gray-100/200 para cores mais escuras
  if grep -qE "text-gray-(100|200)" "$file"; then
    sed -i '' -E 's/text-gray-100/text-gray-900/g' "$file"
    sed -i '' -E 's/text-gray-200/text-gray-700/g' "$file"
    ((CHANGES++))
  fi
done

# 5. Atualizar border-gray-800 para border-gray-200
echo "5️⃣  Atualizando cores de bordas..."
find app components -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  if grep -qE "border-(gray|slate)-(800|900)" "$file"; then
    sed -i '' -E 's/border-(gray|slate)-(800|900)/border-gray-200/g' "$file"
    ((CHANGES++))
  fi
done

echo ""
echo "✅ Padronização concluída!"
echo ""
echo "📊 Estatísticas:"
echo "   Arquivos modificados: $CHANGES"
echo "   Backup salvo em: $BACKUP_DIR"
echo ""
echo "📋 Próximos passos:"
echo "1. Revisar mudanças: git diff"
echo "2. Testar: npm run dev"
echo "3. Ajustes manuais (se necessário)"
echo "4. Commit: git add -A && git commit -m 'feat: standardize backgrounds and components'"
echo ""
