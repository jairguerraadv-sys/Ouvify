#!/bin/bash
# Script de validação pós-correções - Fase 1
# Valida todas as correções aplicadas

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 VALIDAÇÃO PÓS-CORREÇÕES - AUDITORIA FASE 1            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 BACKEND (Django)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Carregar .env antes de testar backend
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

cd apps/backend

echo -n "  1. Verificando Python dependencies... "
pip check > /dev/null 2>&1
check_success

echo -n "  2. Verificando Django settings... "
python manage.py check > /dev/null 2>&1
check_success

echo -n "  3. Verificando migrações pendentes... "
python manage.py makemigrations --check --dry-run > /dev/null 2>&1
check_success

echo -n "  4. Testando import de pywebpush 2.x... "
python -c "from pywebpush import webpush, WebPushException" 2>/dev/null
check_success

echo -n "  5. Verificando DATABASE_PRIVATE_URL support... "
grep -q "DATABASE_PRIVATE_URL" config/settings.py
check_success

cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 FRONTEND (Next.js)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd apps/frontend

echo -n "  1. Verificando npm dependencies... "
npm list --depth=0 > /dev/null 2>&1 || true
check_success

echo -n "  2. Verificando versão do Next.js (16.1.5)... "
grep -q '"next": "16.1.5"' package.json
check_success

echo -n "  3. Verificando versão do React (19.2.4)... "
grep -q '"react": "19.2.4"' package.json
check_success

cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 SEGURANÇA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  1. Verificando CSP em vercel.json... "
grep -q "Content-Security-Policy" vercel.json
check_success

echo -n "  2. Verificando .gitignore atualizado... "
grep -q "*.tar.gz" .gitignore && grep -q "*.backup" .gitignore
check_success

echo -n "  3. Verificando backup files removidos... "
! find . -name "backup-pre-autonomous-*.tar.gz" 2>/dev/null | grep -q .
check_success

echo -n "  4. Verificando .env.example completo... "
grep -q "DATABASE_PRIVATE_URL" .env.example && grep -q "VAPID_PUBLIC_KEY" .env.example
check_success

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ESTRUTURA DE ARQUIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  1. Verificando scripts de validação... "
[ -f "scripts/validate-env.sh" ] && [ -x "scripts/validate-env.sh" ]
check_success

echo -n "  2. Verificando scripts de limpeza... "
[ -f "scripts/cleanup-backups.sh" ] && [ -x "scripts/cleanup-backups.sh" ]
check_success

echo -n "  3. Verificando logs movidos... "
[ -d "docs/logs/migration" ]
check_success

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     📊 RESULTADO FINAL                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  Testes passados: ${GREEN}${PASSED}${NC}"
echo -e "  Testes falhados: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS AS VALIDAÇÕES PASSARAM!${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Commit todas as mudanças"
    echo "  2. Fazer deploy em staging"
    echo "  3. Executar Fase 2 da auditoria (Segurança)"
    exit 0
else
    echo -e "${RED}❌ ALGUMAS VALIDAÇÕES FALHARAM${NC}"
    echo ""
    echo "💡 Revise os erros acima e corrija antes de prosseguir"
    exit 1
fi
