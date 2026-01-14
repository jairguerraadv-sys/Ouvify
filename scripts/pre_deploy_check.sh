#!/bin/bash
# =============================================================================
# Script de Verificação Pré-Deploy - Ouvy SaaS Backend
# Execute: ./scripts/pre_deploy_check.sh
# =============================================================================

set -e

echo "======================================================================"
echo "🔍 VERIFICAÇÃO PRÉ-DEPLOY - Ouvy SaaS Backend"
echo "======================================================================"

cd "$(dirname "$0")/.."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# 1. Verificar Python
echo -e "\n${YELLOW}1. Verificando Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python3 não encontrado${NC}"
    ((ERRORS++))
fi

# 2. Verificar variáveis de ambiente críticas
echo -e "\n${YELLOW}2. Verificando variáveis de ambiente...${NC}"

check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${YELLOW}⚠️  $1 não definida (necessária em produção)${NC}"
    else
        echo -e "${GREEN}✅ $1 configurada${NC}"
    fi
}

# Carregar .env se existir
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Arquivo .env carregado${NC}"
fi

check_env "SECRET_KEY"
check_env "DATABASE_URL"
check_env "STRIPE_SECRET_KEY"

# 3. Verificar dependências
echo -e "\n${YELLOW}3. Verificando dependências...${NC}"
if [ -f requirements.txt ]; then
    echo -e "${GREEN}✅ requirements.txt encontrado${NC}"
    pip3 check 2>/dev/null || echo -e "${YELLOW}⚠️  Algumas dependências podem ter conflitos${NC}"
else
    echo -e "${RED}❌ requirements.txt não encontrado${NC}"
    ((ERRORS++))
fi

# 4. Verificar sintaxe Python
echo -e "\n${YELLOW}4. Verificando sintaxe Python...${NC}"
cd ouvy_saas
python3 -m py_compile config/settings.py 2>/dev/null && echo -e "${GREEN}✅ settings.py OK${NC}" || echo -e "${RED}❌ Erro em settings.py${NC}"
python3 -m py_compile config/urls.py 2>/dev/null && echo -e "${GREEN}✅ urls.py OK${NC}" || echo -e "${RED}❌ Erro em urls.py${NC}"
cd ..

# 5. Verificar Django check
echo -e "\n${YELLOW}5. Executando Django check...${NC}"
cd ouvy_saas
if python3 manage.py check --deploy 2>/dev/null; then
    echo -e "${GREEN}✅ Django check passou${NC}"
else
    echo -e "${YELLOW}⚠️  Django check com avisos (verifique manualmente)${NC}"
fi
cd ..

# 6. Verificar migrações pendentes
echo -e "\n${YELLOW}6. Verificando migrações...${NC}"
cd ouvy_saas
if python3 manage.py showmigrations --plan 2>/dev/null | grep -q '\[ \]'; then
    echo -e "${YELLOW}⚠️  Existem migrações pendentes${NC}"
else
    echo -e "${GREEN}✅ Todas as migrações aplicadas${NC}"
fi
cd ..

# 7. Verificar arquivos estáticos
echo -e "\n${YELLOW}7. Verificando arquivos estáticos...${NC}"
if [ -d "ouvy_saas/staticfiles" ]; then
    echo -e "${GREEN}✅ Pasta staticfiles existe${NC}"
else
    echo -e "${YELLOW}⚠️  Execute 'python manage.py collectstatic' antes do deploy${NC}"
fi

# 8. Verificar Procfile
echo -e "\n${YELLOW}8. Verificando Procfile...${NC}"
if [ -f "Procfile" ]; then
    echo -e "${GREEN}✅ Procfile encontrado${NC}"
    cat Procfile
else
    echo -e "${RED}❌ Procfile não encontrado${NC}"
    ((ERRORS++))
fi

# Resultado final
echo -e "\n======================================================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VERIFICAÇÃO CONCLUÍDA - Pronto para deploy!${NC}"
else
    echo -e "${RED}❌ VERIFICAÇÃO FALHOU - $ERRORS erro(s) encontrado(s)${NC}"
fi
echo "======================================================================"

exit $ERRORS
