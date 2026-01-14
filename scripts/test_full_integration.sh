#!/bin/bash

# Script de Teste de Integração Completa
# Testa: Criação de Feedback → Consulta de Protocolo

echo "🧪 TESTE DE INTEGRAÇÃO COMPLETA - OUVY SAAS"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
BACKEND="http://localhost:8000"
FRONTEND="http://localhost:3000"

echo "📡 1. Verificando servidores..."
echo "-------------------------------"

# Verifica Backend
if curl -s "$BACKEND/api/feedbacks/" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend Django respondendo em $BACKEND"
else
    echo -e "${RED}✗${NC} Backend Django não está respondendo"
    echo "   Execute: bash run_server.sh"
    exit 1
fi

# Verifica Frontend
if curl -s "$FRONTEND" > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend Next.js respondendo em $FRONTEND"
else
    echo -e "${RED}✗${NC} Frontend Next.js não está respondendo"
    echo "   Execute: cd ouvy_frontend && npm run dev"
    exit 1
fi

echo ""
echo "📝 2. Criando Feedback de Teste..."
echo "-----------------------------------"

# Payload do feedback
PAYLOAD='{
  "tipo": "elogio",
  "titulo": "Teste de Integração Automática",
  "descricao": "Teste de integração automático - Excelente atendimento!",
  "email": "teste@integration.com",
  "nome_completo": "Teste Integração",
  "anonimo": false
}'

# Envia feedback
RESPONSE=$(curl -s -X POST "$BACKEND/api/feedbacks/" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Extrai protocolo
PROTOCOLO=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('protocolo', ''))" 2>/dev/null)

if [ -z "$PROTOCOLO" ]; then
    echo -e "${RED}✗${NC} Falha ao criar feedback"
    echo "   Resposta: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Feedback criado com sucesso!"
echo "   Protocolo: ${YELLOW}$PROTOCOLO${NC}"
echo "   Tipo: elogio"
echo "   Status: pendente"

echo ""
echo "🔍 3. Consultando Protocolo..."
echo "-------------------------------"

# Consulta protocolo
CONSULTA=$(curl -s "$BACKEND/api/feedbacks/consultar-protocolo/?protocolo=$PROTOCOLO")

# Verifica resultado
STATUS=$(echo "$CONSULTA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

if [ -z "$STATUS" ]; then
    echo -e "${RED}✗${NC} Falha ao consultar protocolo"
    echo "   Resposta: $CONSULTA"
    exit 1
fi

echo -e "${GREEN}✓${NC} Protocolo encontrado!"
echo ""
echo "📊 Resultado da Consulta:"
echo "$CONSULTA" | python3 -m json.tool 2>/dev/null

echo ""
echo "=========================================="
echo -e "${GREEN}✅ INTEGRAÇÃO COMPLETA FUNCIONANDO!${NC}"
echo "=========================================="
echo ""
echo "📌 Próximos passos:"
echo "   1. Acesse: $FRONTEND"
echo "   2. Preencha o formulário de feedback"
echo "   3. Copie o protocolo gerado: $PROTOCOLO"
echo "   4. Acesse: $FRONTEND/acompanhar"
echo "   5. Cole o protocolo para rastrear"
echo ""
