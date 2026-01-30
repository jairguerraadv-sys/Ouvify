#!/bin/bash

echo "🔍 VALIDAÇÃO DE PADRONIZAÇÃO UI/UX"
echo "======================================"
echo ""

cd /Users/jairneto/Desktop/ouvify_saas/apps/frontend

# 1. Verificar gradientes de fundo (DEVE SER 0)
echo "1. Gradientes de fundo (deve ser 0):"
GRADIENTS=$(grep -r "bg-gradient" app --include="*.tsx" 2>/dev/null | grep -v "text-gradient" | wc -l | xargs)
if [ "$GRADIENTS" -eq 0 ]; then
  echo "   ✅ Nenhum gradiente de fundo encontrado"
else
  echo "   ❌ $GRADIENTS gradientes de fundo encontrados:"
  grep -rn "bg-gradient" app --include="*.tsx" 2>/dev/null | grep -v "text-gradient" | head -5
fi

echo ""

# 2. Verificar backgrounds coloridos
echo "2. Backgrounds coloridos (deve ser mínimo):"
BG_COLORED=$(grep -rE "bg-(blue|purple|violet|indigo)-[0-9]" app --include="*.tsx" 2>/dev/null | grep -v "Button" | wc -l | xargs)
if [ "$BG_COLORED" -eq 0 ]; then
  echo "   ✅ Nenhum background colorido encontrado"
else
  echo "   ⚠️  $BG_COLORED backgrounds coloridos (verificar se são buttons/badges)"
fi

echo ""

# 3. Verificar backgrounds escuros
echo "3. Backgrounds escuros (deve ser 0):"
BG_DARK=$(grep -rE "bg-(gray|slate)-(800|900)" app --include="*.tsx" 2>/dev/null | wc -l | xargs)
if [ "$BG_DARK" -eq 0 ]; then
  echo "   ✅ Nenhum background escuro encontrado"
else
  echo "   ❌ $BG_DARK backgrounds escuros encontrados"
  grep -rn -E "bg-(gray|slate)-(800|900)" app --include="*.tsx" 2>/dev/null | head -5
fi

echo ""

# 4. Verificar textos brancos fora de botões
echo "4. Textos brancos (deve estar apenas em botões):"
WHITE_TEXT=$(grep -r "text-white" app --include="*.tsx" 2>/dev/null | grep -v "Button\|button\|btn\|Badge" | wc -l | xargs)
if [ "$WHITE_TEXT" -eq 0 ]; then
  echo "   ✅ Textos brancos apenas em botões"
else
  echo "   ⚠️  $WHITE_TEXT textos brancos fora de botões (revisar)"
fi

echo ""

# 5. Verificar Header
echo "5. Header (deve ter bg-white):"
if grep -q 'className.*bg-white' components/layout/Header.tsx 2>/dev/null; then
  echo "   ✅ Header com fundo branco"
else
  echo "   ⚠️  Header precisa verificação"
fi

echo ""

# 6. Verificar Footer
echo "6. Footer (deve ter bg-white):"
if grep -q 'className.*bg-white' components/ui/footer.tsx 2>/dev/null || \
   grep -q 'className.*bg-white' components/layout/Footer.tsx 2>/dev/null; then
  echo "   ✅ Footer com fundo branco"
else
  echo "   ⚠️  Footer precisa verificação"
fi

echo ""
echo "======================================"
echo "🎯 VALIDAÇÃO CONCLUÍDA"
echo ""
echo "📋 Páginas críticas para testar manualmente:"
echo "   - http://localhost:3000 (Homepage)"
echo "   - http://localhost:3000/cadastro"
echo "   - http://localhost:3000/login"
echo "   - http://localhost:3000/precos"
echo "   - http://localhost:3000/recursos"
echo "   - http://localhost:3000/dashboard"
echo ""
echo "🧪 Para testar:"
echo "   cd /Users/jairneto/Desktop/ouvify_saas/apps/frontend"
echo "   npm run dev"
