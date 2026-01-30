#!/bin/bash

echo "🔧 Atualizando referências de paths..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Lista de arquivos que precisam ser atualizados
FILES=(
    "docker-compose.yml"
    "Makefile"
    "README.md"
    ".github/workflows/backend-ci.yml"
    ".github/workflows/frontend-ci.yml"
    "turbo.json"
)

echo -e "${YELLOW}📝 Arquivos a atualizar:${NC}"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ⚠️  $file não encontrado"
    fi
done
echo ""

# Backup de segurança
echo -e "${YELLOW}💾 Criando backup de arquivos de configuração...${NC}"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$file.backup-$(date +%Y%m%d)" 2>/dev/null
    fi
done
echo -e "${GREEN}✓ Backups criados${NC}"

# Substituições
echo -e "\n${YELLOW}🔄 Atualizando referências...${NC}"

# docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo "  Atualizando docker-compose.yml..."
    sed -i.tmp 's|context: ./ouvify_saas|context: ./apps/backend|g' docker-compose.yml
    sed -i.tmp 's|context: ./ouvify_frontend|context: ./apps/frontend|g' docker-compose.yml
    sed -i.tmp 's|- ./ouvify_saas:/app|- ./apps/backend:/app|g' docker-compose.yml
    sed -i.tmp 's|- ./ouvify_frontend:/app|- ./apps/frontend:/app|g' docker-compose.yml
    rm -f docker-compose.yml.tmp
    echo -e "    ${GREEN}✓${NC}"
fi

# Makefile
if [ -f "Makefile" ]; then
    echo "  Atualizando Makefile..."
    sed -i.tmp 's|ouvify_saas|apps/backend|g' Makefile
    sed -i.tmp 's|ouvify_frontend|apps/frontend|g' Makefile
    rm -f Makefile.tmp
    echo -e "    ${GREEN}✓${NC}"
fi

# README.md
if [ -f "README.md" ]; then
    echo "  Atualizando README.md..."
    sed -i.tmp 's|ouvify_saas/|apps/backend/|g' README.md
    sed -i.tmp 's|ouvify_frontend/|apps/frontend/|g' README.md
    rm -f README.md.tmp
    echo -e "    ${GREEN}✓${NC}"
fi

# GitHub workflows
if [ -d ".github/workflows" ]; then
    echo "  Atualizando workflows..."
    find .github/workflows -name "*.yml" -exec sed -i.tmp 's|ouvify_saas|apps/backend|g' {} \;
    find .github/workflows -name "*.yml" -exec sed -i.tmp 's|ouvify_frontend|apps/frontend|g' {} \;
    find .github/workflows -name "*.tmp" -delete
    echo -e "    ${GREEN}✓${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Referências atualizadas${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo "1. Revisar arquivos atualizados"
echo "2. git diff (ver mudanças)"
echo "3. Testar Docker: docker-compose config"
echo "4. Executar: scripts/validate-migration.sh"
