#!/bin/bash
# =============================================================================
# DEPLOY FRONTEND PARA STAGING - Ouvify
# Script para deploy automatizado no Vercel (staging)
# =============================================================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do frontend para STAGING..."

# Verificar se estamos no diretório do frontend
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
    echo "❌ Erro: Execute este script do diretório ouvify_frontend"
    exit 1
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instale com: npm install -g vercel"
    exit 1
fi

# Verificar se estamos logados no Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Não logado no Vercel. Execute: vercel login"
    exit 1
fi

echo "📦 Instalando dependências..."
npm ci

echo "🔧 Verificando build..."
npm run build

echo "🚀 Fazendo deploy para staging (preview)..."
# Deploy para staging (preview deployment)
VERCEL_URL=$(vercel --prod=false)

echo "✅ Deploy do frontend concluído!"
echo "🌐 Frontend URL: $VERCEL_URL"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. Configure as variáveis de ambiente no Vercel Dashboard"
echo "2. Teste a aplicação: $VERCEL_URL"
echo "3. Para produção: vercel --prod"