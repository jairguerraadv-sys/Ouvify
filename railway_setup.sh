#!/usr/bin/env bash
# Script para configurar Railway após instalação da CLI

set -euo pipefail

echo "=== Railway Setup Helper ==="
echo

# Check CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrada."
    echo "Instale com: brew install railway"
    exit 1
fi

echo "✅ Railway CLI encontrada"
echo

# Login check
echo "Verificando autenticação..."
if ! railway whoami &> /dev/null; then
    echo "🔐 Fazendo login..."
    railway login
fi

echo "✅ Autenticado"
echo

# Link project
echo "Vinculando ao projeto..."
railway link

echo
echo "=== Configurando Variáveis ==="
railway variables set ALLOWED_HOSTS="ouvy-saas-production.up.railway.app,.railway.app"
echo "✅ ALLOWED_HOSTS configurado"

echo
echo "=== Criando Superusuário ==="
echo "Digite os dados do admin quando solicitado:"
railway run python ouvy_saas/manage.py createsuperuser

echo
echo "✅ Setup completo!"
echo
echo "Próximos passos:"
echo "1. Aguarde o redeploy terminar"
echo "2. Acesse: https://ouvy-saas-production.up.railway.app/admin/"
echo "3. Crie um tenant com subdomínio 'ouvy-saas-production'"
echo "4. Teste: curl -X POST https://ouvy-saas-production.up.railway.app/api/feedbacks/ -H 'Content-Type: application/json' -d '{...}'"
