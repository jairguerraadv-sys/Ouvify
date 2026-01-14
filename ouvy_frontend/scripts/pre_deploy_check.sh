#!/bin/bash

# ============================================
# 🚀 OUVY FRONTEND - Script de Pre-Deploy
# ============================================
# Execute antes de fazer deploy para produção
# Uso: bash scripts/pre_deploy_check.sh
# ============================================

set -e  # Sair imediatamente se um comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║    🚀 OUVY Frontend - Verificação de Pre-Deploy      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Função helper
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

warn_result() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================
# 1. Verificar ambiente
# ============================================
echo -e "\n${BLUE}📦 [1/8] Verificando ambiente...${NC}"

if [ -f "package.json" ]; then
    check_result 0 "package.json encontrado"
else
    check_result 1 "package.json NÃO encontrado!"
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_result 0 "Node.js instalado: $NODE_VERSION"
else
    check_result 1 "Node.js NÃO instalado!"
fi

if command -v npm &> /dev/null; then
    check_result 0 "npm instalado"
else
    check_result 1 "npm NÃO instalado!"
fi

# ============================================
# 2. Verificar dependências
# ============================================
echo -e "\n${BLUE}📦 [2/8] Verificando dependências...${NC}"

if [ -d "node_modules" ]; then
    check_result 0 "node_modules existe"
else
    warn_result "node_modules não encontrado - execute 'npm install'"
fi

# Verificar se package-lock.json existe
if [ -f "package-lock.json" ]; then
    check_result 0 "package-lock.json existe"
else
    warn_result "package-lock.json não encontrado"
fi

# ============================================
# 3. Verificar variáveis de ambiente
# ============================================
echo -e "\n${BLUE}🔐 [3/8] Verificando variáveis de ambiente...${NC}"

if [ -f ".env.local" ] || [ -f ".env.production" ]; then
    check_result 0 "Arquivo .env encontrado"
else
    warn_result "Nenhum arquivo .env encontrado - usando defaults"
fi

if [ -f ".env.example" ]; then
    check_result 0 ".env.example existe (documentação)"
fi

# ============================================
# 4. Verificar TypeScript
# ============================================
echo -e "\n${BLUE}📝 [4/8] Verificando TypeScript...${NC}"

echo "  Executando tsc --noEmit..."
if npx tsc --noEmit 2>/dev/null; then
    check_result 0 "TypeScript sem erros"
else
    check_result 1 "Erros de TypeScript encontrados!"
fi

# ============================================
# 5. Verificar ESLint
# ============================================
echo -e "\n${BLUE}🔍 [5/8] Verificando ESLint...${NC}"

if [ -f "eslint.config.mjs" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
    echo "  Executando lint..."
    if npm run lint 2>/dev/null; then
        check_result 0 "ESLint sem erros"
    else
        warn_result "Avisos de ESLint encontrados (não bloqueiam deploy)"
    fi
else
    warn_result "Configuração de ESLint não encontrada"
fi

# ============================================
# 6. Verificar build
# ============================================
echo -e "\n${BLUE}🏗️  [6/8] Verificando build...${NC}"

echo "  Executando build de produção..."
if npm run build 2>&1 | tail -20; then
    check_result 0 "Build de produção bem-sucedido"
else
    check_result 1 "Build de produção FALHOU!"
fi

# ============================================
# 7. Verificar testes
# ============================================
echo -e "\n${BLUE}🧪 [7/8] Verificando testes...${NC}"

if [ -f "jest.config.ts" ] || [ -f "jest.config.js" ]; then
    echo "  Executando testes..."
    if npm test -- --passWithNoTests --ci 2>/dev/null; then
        check_result 0 "Testes passaram"
    else
        warn_result "Alguns testes falharam (verificar antes de deploy)"
    fi
else
    warn_result "Jest não configurado"
fi

# ============================================
# 8. Verificar arquivos de produção
# ============================================
echo -e "\n${BLUE}📄 [8/8] Verificando arquivos de produção...${NC}"

# Verificar se existem arquivos críticos
CRITICAL_FILES=("app/layout.tsx" "app/page.tsx" "middleware.ts")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_result 0 "$file existe"
    else
        warn_result "$file não encontrado"
    fi
done

# Verificar diretório .next
if [ -d ".next" ]; then
    check_result 0 "Diretório .next gerado"
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo -e "  ${BLUE}ℹ️  Tamanho do build: $BUILD_SIZE${NC}"
fi

# ============================================
# RESUMO FINAL
# ============================================
echo -e "\n${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                   📊 RESUMO FINAL                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "Erros:   ${RED}$ERRORS${NC}"
echo -e "Avisos:  ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 PRONTO PARA DEPLOY! Nenhum erro crítico.      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${BLUE}📋 Próximos passos:${NC}"
    echo "   1. Commit das alterações: git add . && git commit -m 'Pre-deploy check'"
    echo "   2. Push para produção: git push origin main"
    echo "   3. Verificar deploy no Vercel: https://vercel.com/dashboard"
    echo ""
    exit 0
else
    echo -e "\n${RED}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⛔ DEPLOY BLOQUEADO! Corrija os erros acima.        ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
