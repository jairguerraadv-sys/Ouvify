#!/bin/bash

# 🚀 Deploy Feature to Production - Ouvify
# Fluxo: feature-branch → develop → main → Railway auto-deploy

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 DEPLOY FEATURE TO PRODUCTION${NC}"
echo -e "${BLUE}================================${NC}\n"

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch atual: ${YELLOW}${CURRENT_BRANCH}${NC}\n"

# Confirmar com usuário
echo -e "${YELLOW}Este script irá:${NC}"
echo "1. Fazer merge da feature branch para develop"
echo "2. Fazer merge de develop para main"
echo "3. Push para main (Railway deploy automático)"
echo ""
read -p "Continuar? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 1
fi

# 1. Merge para develop
echo -e "\n${BLUE}📦 Step 1: Merge para develop${NC}"
git checkout develop
git pull origin develop
git merge "$CURRENT_BRANCH" --no-ff -m "Merge ${CURRENT_BRANCH} into develop"
git push origin develop
echo -e "${GREEN}✅ Merged para develop${NC}"

# 2. Merge para main
echo -e "\n${BLUE}📦 Step 2: Merge para main (produção)${NC}"
git checkout main
git pull origin main
git merge develop --no-ff -m "Release: merge develop into main"
git push origin main
echo -e "${GREEN}✅ Pushed para main${NC}"

# 3. Voltar para feature branch
git checkout "$CURRENT_BRANCH"

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOY COMPLETO!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${BLUE}🚀 Railway detectará o push em main e fará deploy automático${NC}"
echo -e "${BLUE}📊 Acompanhe: https://railway.app/dashboard${NC}\n"
