#!/bin/bash

echo "🔍 AUDITORIA - PORTAS E CONECTIVIDADE"
echo "====================================="

cd "$(dirname "$0")/.."

# Testar portas principais
declare -A PORTS
PORTS=(
    ["5432"]="PostgreSQL"
    ["6379"]="Redis"
    ["9200"]="ElasticSearch"
    ["8000"]="Django Backend"
    ["3000"]="Next.js Frontend"
    ["1025"]="Mailhog SMTP"
    ["8025"]="Mailhog Web"
)

for port in "${!PORTS[@]}"; do
    name="${PORTS[$port]}"
    echo -n "Testando $name (porta $port)... "
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "✅ ACESSÍVEL"
    else
        echo "⚠️  INACESSÍVEL"
    fi
done

echo ""
echo "✅ AUDITORIA DE PORTAS CONCLUÍDA"
