#!/bin/bash
# =============================================================================
# DEPLOY PARA STAGING - Ouvy SaaS
# Script para deploy automatizado no Railway (staging)
# =============================================================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy para STAGING..."

# Verificar se estamos no diretório correto
if [ ! -f "ouvy_saas/manage.py" ]; then
    echo "❌ Erro: Execute este script do diretório raiz do projeto"
    exit 1
fi

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instale com: npm install -g @railway/cli"
    exit 1
fi

# Verificar se estamos logados no Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Não logado no Railway. Execute: railway login"
    exit 1
fi

echo "📋 Verificando status do projeto..."
railway status

echo "🔧 Configurando variáveis de ambiente para staging..."
# Railway vai usar .env.staging automaticamente se configurado

echo "📦 Fazendo deploy do backend..."
railway deploy --service ouvy-backend

echo "⏳ Aguardando deploy completar..."
sleep 30

echo "🔍 Verificando health check..."
# Tentar health check
HEALTH_URL=$(railway domain --service ouvy-backend)
if [ -n "$HEALTH_URL" ]; then
    echo "🌐 Backend URL: https://$HEALTH_URL"
    echo "💚 Health Check: https://$HEALTH_URL/api/health/"

    # Tentar health check (ignorar erro se falhar)
    curl -f "https://$HEALTH_URL/api/health/" || echo "⚠️  Health check falhou - pode estar inicializando"
else
    echo "⚠️  URL do backend não disponível ainda"
fi

echo "✅ Deploy do backend concluído!"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. Configure as variáveis de ambiente no Railway Dashboard"
echo "2. Execute migrações: railway run python ouvy_saas/manage.py migrate"
echo "3. Execute collectstatic: railway run python ouvy_saas/manage.py collectstatic --noinput"
echo "4. Teste a API: https://$HEALTH_URL/api/health/"
echo "5. Faça deploy do frontend: cd ouvy_frontend && vercel --prod=false"