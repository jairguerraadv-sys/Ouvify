#!/bin/bash

# Script para iniciar o servidor Django Ouvy
# Uso: ./run_server.sh

set -e

echo "🚀 Iniciando servidor Django Ouvy..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navegar para o diretório correto
cd "$(dirname "$0")/ouvy_saas"

echo -e "${BLUE}📍 Diretório atual:${NC} $(pwd)"
echo ""

# Ativar ambiente virtual
echo -e "${YELLOW}⏳ Ativando ambiente virtual...${NC}"
source ../venv/bin/activate

echo -e "${GREEN}✅ Ambiente virtual ativado${NC}"
echo ""

# Validar configurações de ambiente
if [ -f "../check_env.py" ]; then
    echo -e "${YELLOW}🔍 Validando configurações...${NC}"
    cd ..
    python3 check_env.py
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha na validação. Corrija os erros acima.${NC}"
        exit 1
    fi
    
    cd ouvy_saas
    echo ""
fi

# Executar o servidor
echo -e "${BLUE}🌐 Iniciando Django server...${NC}"
echo -e "${YELLOW}📡 Acesse em:${NC}"
echo -e "   - http://localhost:8000"
echo -e "   - http://empresaa.local:8000"
echo -e "   - http://empresab.local:8000"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"
echo ""

/Users/jairneto/Desktop/ouvy_saas/venv/bin/python manage.py runserver
