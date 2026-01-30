#!/bin/bash

echo "🎯 Finalizando migração de monorepo..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Confirmar
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá:${NC}"
echo "  1. Remover diretórios ouvify_saas e ouvify_frontend"
echo "  2. Remover backups antigos"
echo "  3. Fazer commit final"
echo ""
echo -e "${RED}Esta ação é IRREVERSÍVEL!${NC}"
echo ""
read -p "Você executou todos os testes e validações? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada${NC}"
    exit 1
fi

# Verificar se apps/backend e apps/frontend existem
if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ]; then
    echo -e "${RED}❌ apps/backend ou apps/frontend não encontrados!${NC}"
    echo "Execute scripts/restructure.sh primeiro"
    exit 1
fi

# Remover diretórios antigos
echo -e "\n${YELLOW}🗑️  Removendo diretórios antigos...${NC}"
if [ -d "ouvify_saas" ]; then
    echo "  Removendo ouvify_saas..."
    rm -rf ouvify_saas
    echo -e "  ${GREEN}✓${NC} ouvify_saas removido"
fi

if [ -d "ouvify_frontend" ]; then
    echo "  Removendo ouvify_frontend..."
    rm -rf ouvify_frontend
    echo -e "  ${GREEN}✓${NC} ouvify_frontend removido"
fi

# Limpar backups antigos
echo -e "\n${YELLOW}🗑️  Limpando backups...${NC}"
find . -maxdepth 1 -name "*.backup-*" -type f -delete 2>/dev/null
echo -e "  ${GREEN}✓${NC} Backups antigos removidos"

# Atualizar .gitignore
echo -e "\n${YELLOW}📝 Atualizando .gitignore...${NC}"
cat > .gitignore << 'EOL'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.pytest_cache/
.coverage
htmlcov/
.tox/
*.egg-info/
dist/
build/

# Django
*.log
db.sqlite3
db.sqlite3-journal
/staticfiles/
/media/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm

# Next.js
/.next/
/out/
.vercel

# Turborepo
.turbo/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
/coverage/
/test-results/
/playwright-report/

# Monitoring
/monitoring/data/
/monitoring/logs/

# Build artifacts
dist/
build/
*.tar.gz
backup-*.tar.gz
EOL
echo -e "  ${GREEN}✓${NC} .gitignore atualizado"

# Commit final
echo -e "\n${YELLOW}📝 Commitando mudanças...${NC}"
git add -A
git status --short

echo ""
read -p "Fazer commit? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "refactor: complete monorepo restructure

- Move backend: ouvify_saas → apps/backend
- Move frontend: ouvify_frontend → apps/frontend
- Create packages/ structure for shared code
- Update all references (docker-compose, Makefile, CI/CD)
- Consolidate .gitignore
- Remove 802 __pycache__ directories
- Clean build artifacts

BREAKING CHANGE: All paths updated to new monorepo structure"
    
    echo -e "\n${GREEN}================================${NC}"
    echo -e "${GREEN}✅ Migração concluída!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Estrutura final:"
    tree -L 2 -I 'node_modules|__pycache__|.next|dist|build'
    echo ""
    echo "Próximos passos:"
    echo "1. git push origin <branch>"
    echo "2. Abrir Pull Request"
    echo "3. Deployar em staging"
    echo "4. Testar em produção"
else
    echo -e "${YELLOW}Commit cancelado. Faça manualmente quando estiver pronto.${NC}"
fi
