#!/bin/bash
#
# Manual Testing Script for Feature Gating
# =========================================
#
# Este script testa o sistema de feature gating usando curl.
# 
# Pré-requisitos:
# 1. Backend rodando em http://localhost:8000
# 2. Tenants e tokens criados conforme indicado
# 3. Feedbacks criados com protocolos válidos
#
# Executar: bash scripts/test_feature_gating_manual.sh
#

set -e

BASE_URL="http://localhost:8000/api"
TENANT_FREE_ID="1"
TENANT_STARTER_ID="2"
TOKEN_FREE="your-token-here"
TOKEN_STARTER="your-other-token-here"

echo "🧪 TESTE DE FEATURE GATING"
echo "============================"
echo ""

# ============================================
# 1. Plano FREE - Não pode criar NOTA_INTERNA
# ============================================
echo "📋 TESTE 1: Plano FREE tenta criar NOTA_INTERNA (deve retornar 403)"
echo ""

curl -X POST "$BASE_URL/feedbacks/1/adicionar-interacao/" \
  -H "Authorization: Token $TOKEN_FREE" \
  -H "X-Tenant-ID: $TENANT_FREE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "Esta é uma nota interna que deveria ser bloqueada",
    "tipo": "NOTA_INTERNA"
  }' \
  -w "\n📍 Status: %{http_code}\n\n"

# ============================================
# 2. Plano STARTER - Pode criar NOTA_INTERNA
# ============================================
echo "📋 TESTE 2: Plano STARTER cria NOTA_INTERNA (deve retornar 201)"
echo ""

curl -X POST "$BASE_URL/feedbacks/2/adicionar-interacao/" \
  -H "Authorization: Token $TOKEN_STARTER" \
  -H "X-Tenant-ID: $TENANT_STARTER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "Esta é uma nota interna autorizada",
    "tipo": "NOTA_INTERNA"
  }' \
  -w "\n📍 Status: %{http_code}\n\n"

# ============================================
# 3. Plano FREE - Pode criar PERGUNTA_EMPRESA
# ============================================
echo "📋 TESTE 3: Plano FREE cria PERGUNTA_EMPRESA (deve retornar 201)"
echo ""

curl -X POST "$BASE_URL/feedbacks/1/adicionar-interacao/" \
  -H "Authorization: Token $TOKEN_FREE" \
  -H "X-Tenant-ID: $TENANT_FREE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "Pergunta da empresa",
    "tipo": "PERGUNTA_EMPRESA"
  }' \
  -w "\n📍 Status: %{http_code}\n\n"

# ============================================
# 4. Anônimo - Pode responder mesmo em FREE
# ============================================
echo "📋 TESTE 4: Anônimo responde em plano FREE (deve retornar 201)"
echo ""

curl -X POST "$BASE_URL/feedbacks/1/adicionar-interacao/" \
  -H "X-Tenant-ID: $TENANT_FREE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "Resposta do denunciante",
    "protocolo": "OUVY-XXXX-YYYY"
  }' \
  -w "\n📍 Status: %{http_code}\n\n"

# ============================================
# 5. Verificar resposta de erro
# ============================================
echo "📋 TESTE 5: Verificar formato de resposta 403 (error + feature + current_plan)"
echo ""

curl -s -X POST "$BASE_URL/feedbacks/1/adicionar-interacao/" \
  -H "Authorization: Token $TOKEN_FREE" \
  -H "X-Tenant-ID: $TENANT_FREE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "Teste de erro",
    "tipo": "NOTA_INTERNA"
  }' | jq '.'

echo ""
echo "✅ Testes manuais concluídos!"
echo ""
echo "📊 Resultado esperado:"
echo "- TESTE 1: 403 Forbidden com 'não disponível no seu plano'"
echo "- TESTE 2: 201 Created (NOTA_INTERNA criada)"
echo "- TESTE 3: 201 Created (PERGUNTA_EMPRESA criada)"
echo "- TESTE 4: 201 Created (RESPOSTA_USUARIO criada)"
echo "- TESTE 5: JSON com campos: error, detail, feature, current_plan, action"
