#!/bin/bash

echo "🔍 Validando migração para monorepo..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Verificar estrutura de diretórios
echo -e "\n📁 Verificando estrutura..."
REQUIRED_DIRS=(
    "apps/backend"
    "apps/frontend"
    "packages"
    "docs"
    "scripts"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir existe"
    else
        echo -e "  ${RED}✗${NC} $dir NÃO ENCONTRADO"
        ((ERRORS++))
    fi
done

# Verificar arquivos essenciais
echo -e "\n📄 Verificando arquivos..."
REQUIRED_FILES=(
    "package.json"
    "turbo.json"
    ".gitignore"
    "docker-compose.yml"
    "apps/backend/requirements.txt"
    "apps/backend/manage.py"
    "apps/frontend/package.json"
    "apps/frontend/next.config.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file existe"
    else
        echo -e "  ${RED}✗${NC} $file NÃO ENCONTRADO"
        ((ERRORS++))
    fi
done

# Verificar se diretórios antigos ainda existem
echo -e "\n⚠️  Verificando diretórios antigos..."
if [ -d "ouvy_saas" ]; then
    SIZE=$(du -sh ouvy_saas 2>/dev/null | cut -f1)
    echo -e "  ${YELLOW}⚠️${NC}  ouvy_saas ainda existe ($SIZE)"
    echo "      → Após validação, remova com: rm -rf ouvy_saas"
    ((WARNINGS++))
fi
if [ -d "ouvy_frontend" ]; then
    SIZE=$(du -sh ouvy_frontend 2>/dev/null | cut -f1)
    echo -e "  ${YELLOW}⚠️${NC}  ouvy_frontend ainda existe ($SIZE)"
    echo "      → Após validação, remova com: rm -rf ouvy_frontend"
    ((WARNINGS++))
fi

# Verificar node_modules
echo -e "\n📦 Verificando node_modules..."
NODE_MODULES_COUNT=$(find . -name "node_modules" -type d -maxdepth 2 2>/dev/null | wc -l | tr -d ' ')
if [ "$NODE_MODULES_COUNT" -eq 0 ]; then
    echo -e "  ${YELLOW}ℹ️${NC}  Nenhum node_modules encontrado"
    echo "      → Execute: npm install"
elif [ "$NODE_MODULES_COUNT" -eq 1 ]; then
    echo -e "  ${GREEN}✓${NC} 1 node_modules (ideal para monorepo)"
else
    echo -e "  ${YELLOW}⚠️${NC}  $NODE_MODULES_COUNT node_modules encontrados"
    find . -name "node_modules" -type d -maxdepth 2 2>/dev/null
    ((WARNINGS++))
fi

# Verificar __pycache__
echo -e "\n🐍 Verificando cache Python..."
PYCACHE_COUNT=$(find . -name "__pycache__" -type d 2>/dev/null | wc -l | tr -d ' ')
if [ "$PYCACHE_COUNT" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Nenhum __pycache__ (limpo!)"
else
    echo -e "  ${YELLOW}⚠️${NC}  $PYCACHE_COUNT diretórios __pycache__"
    echo "      → Execute: find . -name '__pycache__' -exec rm -rf {} +"
    ((WARNINGS++))
fi

# Testar sintaxe de arquivos de config
echo -e "\n🧪 Testando configurações..."

# Docker Compose
if [ -f "docker-compose.yml" ]; then
    echo "  Validando docker-compose.yml..."
    if docker-compose config > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} docker-compose.yml válido"
    else
        echo -e "    ${RED}✗${NC} docker-compose.yml com erros"
        ((ERRORS++))
    fi
fi

# package.json
if [ -f "package.json" ]; then
    echo "  Validando package.json..."
    if node -e "require('./package.json')" 2>/dev/null; then
        echo -e "    ${GREEN}✓${NC} package.json válido"
    else
        echo -e "    ${RED}✗${NC} package.json com erros de sintaxe"
        ((ERRORS++))
    fi
fi

# Verificar se npm está instalado
echo -e "\n🔧 Verificando ferramentas..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ${GREEN}✓${NC} npm $NPM_VERSION instalado"
else
    echo -e "  ${RED}✗${NC} npm não encontrado"
    ((ERRORS++))
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} node $NODE_VERSION instalado"
else
    echo -e "  ${RED}✗${NC} node não encontrado"
    ((ERRORS++))
fi

if command -v python &> /dev/null || command -v python3 &> /dev/null; then
    PYTHON_CMD=$(command -v python3 || command -v python)
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "  ${GREEN}✓${NC} $PYTHON_VERSION instalado"
else
    echo -e "  ${RED}✗${NC} Python não encontrado"
    ((ERRORS++))
fi

# Relatório final
echo -e "\n================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Validação concluída com sucesso!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avisos encontrados${NC}"
    fi
    echo ""
    echo "Próximos passos:"
    echo "1. npm install (se ainda não instalou)"
    echo "2. npm run build (testar builds)"
    echo "3. docker-compose up (testar Docker)"
    echo "4. Após validação, remover diretórios antigos"
else
    echo -e "${RED}❌ Validação falhou com $ERRORS erros${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avisos encontrados${NC}"
    fi
fi
echo -e "================================\n"

exit $ERRORS
