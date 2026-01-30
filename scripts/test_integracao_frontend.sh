#!/bin/bash

echo "🧪 TESTE DE INTEGRAÇÃO FRONTEND + BACKEND"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se o backend está rodando
echo -e "\n${YELLOW}1️⃣ Verificando backend Django...${NC}"
if curl -s http://localhost:8000/api/feedbacks/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Backend está respondendo${NC}"
else
    echo -e "${RED}   ❌ Backend não está acessível${NC}"
    echo -e "${YELLOW}   Execute: cd ouvify_saas && bash run_server.sh${NC}"
    exit 1
fi

# 2. Verificar se o frontend está rodando
echo -e "\n${YELLOW}2️⃣ Verificando frontend Next.js...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Frontend está respondendo${NC}"
else
    echo -e "${RED}   ❌ Frontend não está acessível${NC}"
    echo -e "${YELLOW}   Execute: cd ouvify_frontend && npm run dev${NC}"
    exit 1
fi

# 3. Verificar estrutura de arquivos
echo -e "\n${YELLOW}3️⃣ Verificando arquivos criados...${NC}"

FILES=(
    "ouvify_frontend/app/page.tsx"
    "ouvify_frontend/app/acompanhar/page.tsx"
    "ouvify_frontend/components/SuccessCard.tsx"
    "ouvify_frontend/.env.local"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}   ✅ $file${NC}"
    else
        echo -e "${RED}   ❌ $file não encontrado${NC}"
    fi
done

# 4. Testar criação de feedback via API
echo -e "\n${YELLOW}4️⃣ Testando criação de feedback via API...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:8000/api/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "denuncia",
    "titulo": "Teste de Integração Frontend",
    "descricao": "Testando fluxo completo do sistema",
    "anonimo": false,
    "email_contato": "teste@exemplo.com"
  }')

if echo "$RESPONSE" | grep -q "protocolo"; then
    PROTOCOLO=$(echo "$RESPONSE" | grep -o '"protocolo":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}   ✅ Feedback criado com sucesso!${NC}"
    echo -e "${GREEN}   🎫 Protocolo: $PROTOCOLO${NC}"
    
    # 5. Testar consulta de protocolo
    echo -e "\n${YELLOW}5️⃣ Testando consulta de protocolo...${NC}"
    CONSULTA=$(curl -s "http://localhost:8000/api/feedbacks/consultar-protocolo/?codigo=$PROTOCOLO")
    
    if echo "$CONSULTA" | grep -q "$PROTOCOLO"; then
        echo -e "${GREEN}   ✅ Consulta de protocolo funcionando!${NC}"
    else
        echo -e "${RED}   ❌ Erro na consulta de protocolo${NC}"
    fi
else
    echo -e "${RED}   ❌ Erro ao criar feedback${NC}"
    echo "$RESPONSE"
fi

# Resumo final
echo -e "\n=========================================="
echo -e "${GREEN}✅ INTEGRAÇÃO PRONTA PARA TESTES!${NC}"
echo -e "=========================================="
echo ""
echo "📝 Próximos passos:"
echo "   1. Acesse: http://localhost:3000"
echo "   2. Preencha e envie um feedback"
echo "   3. Copie o protocolo exibido"
echo "   4. Acesse: http://localhost:3000/acompanhar"
echo "   5. Cole o protocolo e consulte o status"
echo ""
echo "🎯 URLs Importantes:"
echo "   • Frontend Home: http://localhost:3000"
echo "   • Acompanhamento: http://localhost:3000/acompanhar"
echo "   • API Backend: http://localhost:8000/api/feedbacks/"
echo "   • Django Admin: http://localhost:8000/admin"
echo ""
