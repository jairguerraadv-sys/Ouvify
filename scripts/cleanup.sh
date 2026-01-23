#!/bin/bash

echo "🧹 Iniciando limpeza profunda do projeto Ouvy..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para confirmar
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# 1. Backup
echo -e "${YELLOW}📦 Criando backup...${NC}"
BACKUP_FILE="backup-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.pyc' \
    --exclude='venv' \
    --exclude='.pytest_cache' \
    . 2>/dev/null

echo -e "${GREEN}✓ Backup criado: $BACKUP_FILE${NC}"

# 2. Listar node_modules
echo -e "\n${YELLOW}📂 node_modules encontrados:${NC}"
find . -name "node_modules" -type d -maxdepth 3 | while read dir; do
    size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    echo "  - $dir ($size)"
done

# Não remover node_modules por enquanto (está em uso)
echo -e "${YELLOW}ℹ️  node_modules será reinstalado após reestruturação${NC}"

# 3. Limpar Python cache
echo -e "\n${YELLOW}🐍 Limpando cache Python...${NC}"
PYCACHE_COUNT=$(find . -type d -name "__pycache__" 2>/dev/null | wc -l | tr -d ' ')
PYC_COUNT=$(find . -type f -name "*.pyc" 2>/dev/null | wc -l | tr -d ' ')
echo "  - __pycache__: $PYCACHE_COUNT diretórios"
echo "  - *.pyc: $PYC_COUNT arquivos"

if confirm "Remover cache Python?"; then
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
    find . -type f -name "*.pyc" -delete 2>/dev/null
    find . -type f -name "*.pyo" -delete 2>/dev/null
    echo -e "${GREEN}✓ Cache Python removido${NC}"
fi

# 4. Limpar builds
echo -e "\n${YELLOW}🔨 Limpando builds...${NC}"
DIRS_TO_CLEAN=(".next" "dist" "build" "out" ".turbo" "staticfiles" "media" ".pytest_cache")

for dir in "${DIRS_TO_CLEAN[@]}"; do
    found=$(find . -type d -name "$dir" -maxdepth 3 2>/dev/null | wc -l | tr -d ' ')
    if [ "$found" -gt 0 ]; then
        echo "  - $dir: $found encontrado(s)"
    fi
done

if confirm "Remover diretórios de build?"; then
    for dir in "${DIRS_TO_CLEAN[@]}"; do
        find . -type d -name "$dir" -maxdepth 3 -prune -exec rm -rf {} + 2>/dev/null
    done
    echo -e "${GREEN}✓ Builds removidos${NC}"
fi

# 5. Listar lockfiles
echo -e "\n${YELLOW}🔒 Lockfiles encontrados:${NC}"
find . -maxdepth 2 -name "package-lock.json" -o -name "yarn.lock" -o -name "pnpm-lock.yaml" 2>/dev/null | while read file; do
    echo "  - $file"
done

# 6. Verificar venv
echo -e "\n${YELLOW}🐍 Verificando venv...${NC}"
if [ -d "venv" ]; then
    echo -e "${RED}⚠️  venv/ encontrado na raiz (não deveria estar no git)${NC}"
    if confirm "Adicionar venv/ ao .gitignore e remover do git?"; then
        # Verificar se já está no .gitignore
        if ! grep -q "^venv/$" .gitignore 2>/dev/null; then
            echo "venv/" >> .gitignore
            echo -e "${GREEN}✓ venv/ adicionado ao .gitignore${NC}"
        fi
        # Remover do git (mas manter localmente)
        git rm -r --cached venv 2>/dev/null || true
        echo -e "${GREEN}✓ venv/ removido do índice do git${NC}"
    fi
fi

# 7. Relatório de espaço economizado
echo -e "\n${YELLOW}📊 Calculando espaço...${NC}"
CURRENT_SIZE=$(du -sh . 2>/dev/null | cut -f1)

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Limpeza concluída!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Tamanho atual: $CURRENT_SIZE"
echo "Backup salvo em: $BACKUP_FILE"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo "1. Revisar AUDIT_REPORT.md"
echo "2. git add -A && git commit -m 'chore: cleanup caches and builds'"
echo "3. Executar scripts/restructure.sh"
