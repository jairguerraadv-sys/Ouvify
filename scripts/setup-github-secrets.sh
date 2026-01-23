#!/bin/bash
# Script para configurar GitHub Secrets necessários para deploy

echo "🔐 Configuração de GitHub Secrets para Deploy"
echo "=============================================="
echo ""

# Verificar se gh está autenticado
if ! /usr/local/bin/gh auth status &>/dev/null; then
    echo "❌ GitHub CLI não autenticado. Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI autenticado"
echo ""

# Valores do Vercel (já obtidos do .vercel/project.json)
VERCEL_ORG_ID="team_MqOalurprZES6xMdet3KaDlL"
VERCEL_PROJECT_ID="prj_eHGEP1W0ZlExy5vAALswSnE8djvx"

echo "📋 Secrets necessários:"
echo ""
echo "1. RAILWAY_TOKEN - Token de API do Railway"
echo "   → Obter em: https://railway.com/account/tokens"
echo ""
echo "2. VERCEL_TOKEN - Token de API do Vercel"  
echo "   → Obter em: https://vercel.com/account/tokens"
echo ""
echo "3. VERCEL_ORG_ID = $VERCEL_ORG_ID"
echo "4. VERCEL_PROJECT_ID = $VERCEL_PROJECT_ID"
echo ""

# Configurar os valores fixos (org e project ID)
echo "Configurando VERCEL_ORG_ID..."
echo "$VERCEL_ORG_ID" | /usr/local/bin/gh secret set VERCEL_ORG_ID

echo "Configurando VERCEL_PROJECT_ID..."
echo "$VERCEL_PROJECT_ID" | /usr/local/bin/gh secret set VERCEL_PROJECT_ID

echo ""
echo "✅ VERCEL_ORG_ID e VERCEL_PROJECT_ID configurados!"
echo ""
echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo ""
echo "1. Obtenha o RAILWAY_TOKEN em: https://railway.com/account/tokens"
echo "   Depois execute:"
echo "   echo 'SEU_TOKEN' | gh secret set RAILWAY_TOKEN"
echo ""
echo "2. Obtenha o VERCEL_TOKEN em: https://vercel.com/account/tokens"
echo "   Depois execute:"
echo "   echo 'SEU_TOKEN' | gh secret set VERCEL_TOKEN"
echo ""
echo "Ou use o dashboard do GitHub:"
echo "https://github.com/jairguerraadv-sys/ouvy-saas/settings/secrets/actions"
