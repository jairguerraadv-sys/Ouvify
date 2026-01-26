#!/bin/bash
# Valida se todas as variáveis de ambiente necessárias estão configuradas
# Uso: ./scripts/validate-env.sh

set -e

echo "🔍 Validando variáveis de ambiente..."

REQUIRED_VARS=(
    "SECRET_KEY"
    "DATABASE_URL"
    "REDIS_URL"
    "CLOUDINARY_CLOUD_NAME"
    "STRIPE_SECRET_KEY"
    "EMAIL_HOST_USER"
    "SENTRY_DSN"
    "VAPID_PUBLIC_KEY"
)

missing=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        missing+=("$var")
    fi
done

if [ ${#missing[@]} -eq 0 ]; then
    echo "✅ Todas as variáveis obrigatórias estão configuradas"
    exit 0
else
    echo "❌ Variáveis faltantes:"
    printf '   - %s\n' "${missing[@]}"
    echo ""
    echo "💡 Dica: Copie .env.example para .env e preencha os valores"
    exit 1
fi
