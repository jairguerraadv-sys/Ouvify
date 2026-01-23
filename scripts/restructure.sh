#!/bin/bash

echo "🏗️  Reestruturando projeto para Monorepo..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ] || [ ! -d "ouvy_saas" ] || [ ! -d "ouvy_frontend" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto ouvy_saas${NC}"
    exit 1
fi

# Criar nova estrutura
echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"

mkdir -p apps/backend
mkdir -p apps/frontend
mkdir -p packages/types/src
mkdir -p packages/ui/src
mkdir -p packages/config/src
mkdir -p docs
mkdir -p scripts

echo -e "${GREEN}✓ Estrutura criada${NC}"

# Mover backend
echo -e "\n${YELLOW}🔄 Movendo backend (Django)...${NC}"
if [ -d "ouvy_saas" ]; then
    if [ ! "$(ls -A apps/backend 2>/dev/null)" ]; then
        echo "  Copiando ouvy_saas → apps/backend..."
        rsync -a --info=progress2 ouvy_saas/ apps/backend/ \
            --exclude='__pycache__' \
            --exclude='*.pyc' \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='venv' \
            --exclude='.pytest_cache' \
            --exclude='staticfiles' \
            --exclude='media'
        echo -e "${GREEN}✓ Backend movido para apps/backend${NC}"
    else
        echo -e "${YELLOW}⚠️  apps/backend não está vazio, pulando...${NC}"
    fi
else
    echo -e "${RED}❌ ouvy_saas não encontrado${NC}"
fi

# Mover frontend
echo -e "\n${YELLOW}🔄 Movendo frontend (Next.js)...${NC}"
if [ -d "ouvy_frontend" ]; then
    if [ ! "$(ls -A apps/frontend 2>/dev/null)" ]; then
        echo "  Copiando ouvy_frontend → apps/frontend..."
        rsync -a --info=progress2 ouvy_frontend/ apps/frontend/ \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='.git' \
            --exclude='dist' \
            --exclude='build'
        echo -e "${GREEN}✓ Frontend movido para apps/frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  apps/frontend não está vazio, pulando...${NC}"
    fi
else
    echo -e "${RED}❌ ouvy_frontend não encontrado${NC}"
fi

# Mover documentação
echo -e "\n${YELLOW}📚 Movendo documentação...${NC}"
if [ -f "CONTRIBUTING.md" ]; then
    mv CONTRIBUTING.md docs/ 2>/dev/null || true
fi
if [ -d "monitoring" ] && [ ! -d "docs/monitoring" ]; then
    # Manter monitoring na raiz mas criar link em docs
    ln -s ../monitoring docs/monitoring 2>/dev/null || true
fi

# Mover scripts se houver
if [ -d "scripts" ]; then
    echo -e "${GREEN}✓ Scripts já estão organizados${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Reestruturação concluída!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. NÃO delete ouvy_saas e ouvy_frontend ainda"
echo "2. Valide se tudo foi copiado corretamente:"
echo "   diff -r ouvy_saas apps/backend"
echo "   diff -r ouvy_frontend apps/frontend"
echo "3. Execute: scripts/update-references.sh"
echo "4. Teste com: npm install && npm run dev"
echo "5. Após validação total, execute: scripts/finalize-migration.sh"
