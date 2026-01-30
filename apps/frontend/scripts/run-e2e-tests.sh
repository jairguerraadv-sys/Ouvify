#!/bin/bash

# Script para rodar testes E2E com backend e frontend
# Gerencia lifecycle completo dos servidores

set -e

echo "🧪 Preparando ambiente para testes E2E..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretórios
BACKEND_DIR="../ouvify_saas"
FRONTEND_DIR="."

# Funções de cleanup
cleanup() {
    echo -e "\n${YELLOW}🧹 Limpando processos...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup EXIT INT TERM

# 1. Iniciar backend em modo teste
echo -e "${GREEN}📦 Iniciando backend Django (modo teste)...${NC}"
cd $BACKEND_DIR
export TESTING=true
export DJANGO_SETTINGS_MODULE=config.settings
python3 manage.py migrate --noinput > /dev/null 2>&1
python3 manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &
BACKEND_PID=$!

# Aguardar backend ficar disponível
echo "⏳ Aguardando backend..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/api/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend disponível${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend não respondeu em 30s${NC}"
        exit 1
    fi
done

# 2. Build do frontend (se necessário)
echo -e "${GREEN}🏗️  Verificando build do frontend...${NC}"
cd $FRONTEND_DIR
if [ ! -d ".next" ]; then
    echo "Building frontend..."
    npm run build
fi

# 3. Iniciar frontend
echo -e "${GREEN}🚀 Iniciando frontend Next.js...${NC}"
npm run start > /dev/null 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend ficar disponível
echo "⏳ Aguardando frontend..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend disponível${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend não respondeu em 30s${NC}"
        exit 1
    fi
done

# 4. Rodar testes Playwright
echo -e "\n${GREEN}🎭 Executando testes E2E com Playwright...${NC}\n"
npx playwright test "$@"

TEST_EXIT_CODE=$?

# 5. Mostrar resultado
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    echo -e "${YELLOW}💡 Para ver relatório: npx playwright show-report${NC}"
fi

exit $TEST_EXIT_CODE