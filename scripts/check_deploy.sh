#!/bin/bash

# 🔍 SCRIPT DE VERIFICAÇÃO DE DEPLOY
# Verifica status e saúde de Backend (Railway) e Frontend (Vercel)

echo "======================================"
echo "🔍 VERIFICAÇÃO DE DEPLOY - OUVY SAAS"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
BACKEND_URL="https://ouvify-saas-production.up.railway.app"
FRONTEND_URL="https://ouvify-frontend.vercel.app"

echo "📊 1. VERIFICANDO BACKEND (Railway)..."
echo "--------------------------------------"

# Health check do backend
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health/ 2>/dev/null)

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend UP${NC} - Status: $BACKEND_HEALTH"
else
    echo -e "${RED}❌ Backend DOWN${NC} - Status: $BACKEND_HEALTH"
fi

# Verificar Swagger
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/docs/ 2>/dev/null)
if [ "$SWAGGER_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Swagger UP${NC} - $BACKEND_URL/api/docs/"
else
    echo -e "${YELLOW}⚠️  Swagger não acessível${NC} - Status: $SWAGGER_STATUS"
fi

# Verificar API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/tenant-info/ 2>/dev/null)
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API Endpoints UP${NC}"
else
    echo -e "${YELLOW}⚠️  API Status${NC}: $API_STATUS"
fi

echo ""
echo "🌐 2. VERIFICANDO FRONTEND (Vercel)..."
echo "--------------------------------------"

# Health check do frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL 2>/dev/null)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend UP${NC} - Status: $FRONTEND_STATUS"
else
    echo -e "${RED}❌ Frontend DOWN${NC} - Status: $FRONTEND_STATUS"
fi

# Verificar página de login
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/login 2>/dev/null)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Página de Login UP${NC}"
else
    echo -e "${YELLOW}⚠️  Login Status${NC}: $LOGIN_STATUS"
fi

# Verificar dashboard (deve redirecionar se não autenticado)
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/dashboard 2>/dev/null)
if [ "$DASHBOARD_STATUS" = "200" ] || [ "$DASHBOARD_STATUS" = "307" ] || [ "$DASHBOARD_STATUS" = "308" ]; then
    echo -e "${GREEN}✅ Dashboard com proteção ativa${NC} - Status: $DASHBOARD_STATUS"
else
    echo -e "${YELLOW}⚠️  Dashboard Status${NC}: $DASHBOARD_STATUS"
fi

echo ""
echo "🔗 3. VERIFICANDO CONECTIVIDADE..."
echo "--------------------------------------"

# Verificar CORS
CORS_CHECK=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -X OPTIONS $BACKEND_URL/api/tenant-info/ -I 2>/dev/null | grep -i "access-control-allow-origin")

if [ -n "$CORS_CHECK" ]; then
    echo -e "${GREEN}✅ CORS configurado${NC}"
else
    echo -e "${YELLOW}⚠️  CORS pode não estar configurado corretamente${NC}"
fi

echo ""
echo "📋 4. INFORMAÇÕES DE DEPLOY..."
echo "--------------------------------------"

# Git info
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null)

echo "Branch: $CURRENT_BRANCH"
echo "Último commit: $LAST_COMMIT"

# Railway CLI
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✅ Railway CLI instalado${NC}"
    cd ouvify_saas 2>/dev/null && railway status 2>/dev/null && cd .. 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Railway CLI não encontrado${NC}"
fi

# Vercel CLI
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado${NC}"
fi

echo ""
echo "======================================"
echo "🏁 VERIFICAÇÃO CONCLUÍDA"
echo "======================================"
echo ""
echo "📊 URLs de Acesso:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Swagger:  $BACKEND_URL/api/docs/"
echo "   Admin:    $BACKEND_URL/admin/"
echo ""
echo "🔧 Comandos úteis:"
echo "   railway logs          # Ver logs do backend"
echo "   vercel logs           # Ver logs do frontend"
echo "   ./check_deploy.sh     # Executar esta verificação"
echo ""
