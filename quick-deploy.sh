#!/bin/bash

# 🚀 Quick Deploy - Commit e Push para Main
# Uso: ./quick-deploy.sh "mensagem do commit"

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se tem mensagem de commit
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Uso: ./quick-deploy.sh \"mensagem do commit\"${NC}"
    exit 1
fi

COMMIT_MSG="$1"
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🚀 Quick Deploy to Production${NC}\n"

# 1. Add & Commit na branch atual
echo -e "${BLUE}📦 Commit: ${YELLOW}${COMMIT_MSG}${NC}"
git add -A
git commit -m "$COMMIT_MSG" || echo "Nada para commitar"
git push origin "$CURRENT_BRANCH"
echo -e "${GREEN}✅ Pushed para ${CURRENT_BRANCH}${NC}\n"

# 2. Merge direto para main
echo -e "${BLUE}📦 Merge para main...${NC}"
git checkout main
git pull origin main
git merge "$CURRENT_BRANCH" --no-ff -m "Deploy: $COMMIT_MSG"
git push origin main
echo -e "${GREEN}✅ Pushed para main${NC}\n"

# 3. Voltar para branch original
git checkout "$CURRENT_BRANCH"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOY COMPLETO!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}🚀 Railway iniciará deploy automático${NC}\n"
