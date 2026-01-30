#!/bin/bash

echo "✅ VALIDAÇÃO DE LOGO"
echo "===================="
echo ""

cd /Users/jairneto/Desktop/ouvify_saas/apps/frontend

# 1. Verificar se componente Logo existe
echo "1. Componente Logo:"
if [ -f "components/ui/logo.tsx" ]; then
  echo "   ✅ Componente logo.tsx criado"
else
  echo "   ❌ Componente logo.tsx não encontrado"
fi

echo ""

# 2. Verificar exports do componente
echo "2. Exports do componente Logo:"
if grep -q "export const LogoHeader" components/ui/logo.tsx 2>/dev/null; then
  echo "   ✅ LogoHeader exportado"
else
  echo "   ❌ LogoHeader não encontrado"
fi

if grep -q "export const LogoFooter" components/ui/logo.tsx 2>/dev/null; then
  echo "   ✅ LogoFooter exportado"
else
  echo "   ❌ LogoFooter não encontrado"
fi

if grep -q "export const LogoAuth" components/ui/logo.tsx 2>/dev/null; then
  echo "   ✅ LogoAuth exportado"
else
  echo "   ❌ LogoAuth não encontrado"
fi

if grep -q "export const LogoError" components/ui/logo.tsx 2>/dev/null; then
  echo "   ✅ LogoError exportado"
else
  echo "   ❌ LogoError não encontrado"
fi

echo ""

# 3. Verificar uso no Header
echo "3. Header:"
if grep -q "LogoHeader" components/layout/Header.tsx 2>/dev/null; then
  echo "   ✅ Header usando LogoHeader"
else
  echo "   ⚠️  Header não está usando LogoHeader"
fi

echo ""

# 4. Verificar uso no Footer
echo "4. Footer:"
if grep -q "LogoFooter" components/ui/footer.tsx 2>/dev/null || \
   grep -q "LogoFooter" components/layout/Footer.tsx 2>/dev/null; then
  echo "   ✅ Footer usando LogoFooter"
else
  echo "   ⚠️  Footer não está usando LogoFooter"
fi

echo ""

# 5. Verificar páginas de auth
echo "5. Páginas de autenticação:"
AUTH_WITH_LOGO=$(grep -rl "LogoAuth" app --include="*.tsx" 2>/dev/null | wc -l | xargs)
if [ "$AUTH_WITH_LOGO" -ge 1 ]; then
  echo "   ✅ $AUTH_WITH_LOGO página(s) usando LogoAuth"
  grep -l "LogoAuth" app/login/page.tsx app/cadastro/page.tsx 2>/dev/null | sed 's/^/      - /'
else
  echo "   ⚠️  Nenhuma página usando LogoAuth"
fi

echo ""

# 6. Verificar páginas de erro
echo "6. Páginas de erro:"
if [ -f "app/not-found.tsx" ]; then
  if grep -q "LogoError" app/not-found.tsx 2>/dev/null; then
    echo "   ✅ 404 usando LogoError"
  else
    echo "   ⚠️  404 não usa LogoError"
  fi
else
  echo "   ⚠️  app/not-found.tsx não encontrado"
fi

if [ -f "app/error.tsx" ]; then
  if grep -q "LogoError" app/error.tsx 2>/dev/null; then
    echo "   ✅ Error page usando LogoError"
  else
    echo "   ⚠️  Error page não usa LogoError"
  fi
else
  echo "   ⚠️  app/error.tsx não encontrado"
fi

echo ""
echo "===================="
echo "🎯 VALIDAÇÃO CONCLUÍDA"
echo ""
echo "📋 Resumo:"
TOTAL_CHECK=7
PASSED=0

[ -f "components/ui/logo.tsx" ] && PASSED=$((PASSED+1))
grep -q "LogoHeader" components/ui/logo.tsx 2>/dev/null && PASSED=$((PASSED+1))
grep -q "LogoHeader" components/layout/Header.tsx 2>/dev/null && PASSED=$((PASSED+1))
grep -q "LogoFooter" components/ui/footer.tsx 2>/dev/null && PASSED=$((PASSED+1))
grep -q "LogoAuth" app/login/page.tsx 2>/dev/null && PASSED=$((PASSED+1))
grep -q "LogoError" app/not-found.tsx 2>/dev/null && PASSED=$((PASSED+1))
grep -q "LogoError" app/error.tsx 2>/dev/null && PASSED=$((PASSED+1))

echo "   ✅ $PASSED/$TOTAL_CHECK verificações passaram"
echo ""

if [ "$PASSED" -eq "$TOTAL_CHECK" ]; then
  echo "🎉 PADRÃO DE LOGO 100% IMPLEMENTADO!"
else
  echo "⚠️  Algumas verificações falharam. Revisar acima."
fi
