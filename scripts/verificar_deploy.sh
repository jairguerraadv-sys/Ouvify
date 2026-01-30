#!/bin/bash
# Script de verificação pré-deploy
# Execute este script antes de fazer o deploy final

echo "=============================================="
echo "🔍 VERIFICAÇÃO PRÉ-DEPLOY - OUVY SAAS"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
PROBLEMS=0

# 1. Verificar se está na branch main
echo "📍 Verificando branch..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Você está na branch '$BRANCH', não 'main'${NC}"
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ Branch: main${NC}"
fi
echo ""

# 2. Verificar se há mudanças não commitadas
echo "📝 Verificando mudanças não commitadas..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas:${NC}"
    git status -s
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ Nenhuma mudança pendente${NC}"
fi
echo ""

# 3. Verificar SECRET_NOTES.md não está no git
echo "🔒 Verificando arquivos sensíveis..."
if git ls-files | grep -q "SECURITY_NOTES.md"; then
    echo -e "${RED}❌ SECURITY_NOTES.md está no git! Remova imediatamente!${NC}"
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ SECURITY_NOTES.md não está versionado${NC}"
fi
echo ""

# 4. Verificar .env não está no git
if git ls-files | grep -q "^.env$"; then
    echo -e "${RED}❌ .env está no git! Remova imediatamente!${NC}"
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ .env não está versionado${NC}"
fi
echo ""

# 5. Verificar se há migrações pendentes
echo "🗄️  Verificando migrações..."
cd ouvify_saas
if python3 manage.py showmigrations 2>/dev/null | grep -q "\[ \]"; then
    echo -e "${YELLOW}⚠️  Há migrações não aplicadas${NC}"
    echo "Execute: python manage.py migrate"
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ Todas migrações aplicadas${NC}"
fi
cd ..
echo ""

# 6. Verificar requirements.txt
echo "📦 Verificando dependências..."
if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}✅ requirements.txt existe${NC}"
else
    echo -e "${RED}❌ requirements.txt não encontrado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 7. Verificar documentação essencial
echo "📚 Verificando documentação..."
DOCS=("AUDITORIA_PRE_DEPLOY_2026.md" "CHECKLIST_DEPLOY_FINAL.md" "RELATORIO_AUDITORIA_EXECUTIVO.md" "README.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc${NC}"
    else
        echo -e "${RED}❌ $doc não encontrado${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
done
echo ""

# 8. Verificar .env.example
echo "⚙️  Verificando template de ambiente..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example existe${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example não encontrado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 9. Verificar estrutura de apps Django
echo "🏗️  Verificando estrutura Django..."
APPS=("ouvify_saas/apps/core" "ouvify_saas/apps/tenants" "ouvify_saas/apps/feedbacks")
for app in "${APPS[@]}"; do
    if [ -d "$app" ]; then
        echo -e "${GREEN}✅ $app${NC}"
    else
        echo -e "${RED}❌ $app não encontrado${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
done
echo ""

# 10. Verificar estrutura Next.js
echo "⚛️  Verificando estrutura Next.js..."
if [ -d "ouvify_frontend/app" ]; then
    echo -e "${GREEN}✅ ouvify_frontend/app${NC}"
else
    echo -e "${RED}❌ ouvify_frontend/app não encontrado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# Resultado final
echo "=============================================="
if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO OK! Pronto para deploy!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Commit e push das mudanças"
    echo "2. Deploy no Railway (backend)"
    echo "3. Deploy no Vercel (frontend)"
    echo "4. Configurar webhook Stripe"
    echo "5. Testar em produção"
else
    echo -e "${RED}❌ $PROBLEMS problema(s) encontrado(s)${NC}"
    echo "Resolva os problemas antes de fazer deploy!"
fi
echo "=============================================="
