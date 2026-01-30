#!/bin/bash
# ============================================================
# Ouvify Rebrand Script
# Converte todas as referências de "Ouvy" para "Ouvify"
# ============================================================

set -e

echo "🔄 Iniciando rebrand: Ouvy → Ouvify"
echo "=================================================="

WORKSPACE="/Users/jairneto/Desktop/ouvy_saas"
cd "$WORKSPACE"

TOTAL_FILES=0

# Função para contar e substituir
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo ""
    echo "📝 $description"
    
    # Encontrar arquivos com o padrão
    files=$(find . -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/.venv/*" \
        -not -path "*/__pycache__/*" \
        -not -path "*/.next/*" \
        -not -path "*/.git/*" \
        -not -path "*/staticfiles/*" \
        -not -path "*/.vercel/*" \
        -not -path "*/coverage/*" \
        -not -path "*/test-results/*" \
        -not -path "*/playwright-report/*" \
        -not -path "*/.swc/*" \
        -not -name "*.pyc" \
        -not -name "*.pyo" \
        -not -name "*.ico" \
        -not -name "*.png" \
        -not -name "*.jpg" \
        -not -name "*.jpeg" \
        -not -name "*.gif" \
        -not -name "*.svg" \
        -not -name "*.woff" \
        -not -name "*.woff2" \
        -not -name "*.ttf" \
        -not -name "*.eot" \
        -not -name "*.db" \
        -not -name "*.sqlite3" \
        -not -name "package-lock.json" \
        -not -name "rebrand-to-ouvify.sh" \
        \( -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.css" -o -name "*.txt" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name "*.sh" -o -name "*.env*" -o -name "Dockerfile*" -o -name "Makefile" -o -name "Procfile" -o -name "*.xml" -o -name "*.toml" \) \
        -exec grep -l "$pattern" {} \; 2>/dev/null || true)
    
    if [ -n "$files" ]; then
        count=0
        for file in $files; do
            # Usar sed para substituir (macOS compatível)
            sed -i '' "s/$pattern/$replacement/g" "$file"
            echo "  ✓ $file"
            ((count++))
        done
        echo "  Total: $count arquivos"
        TOTAL_FILES=$((TOTAL_FILES + count))
    else
        echo "  Nenhum arquivo encontrado"
    fi
}

# ============================================================
# 1. SUBSTITUIÇÕES PRINCIPAIS
# ============================================================

# 1.1 Nomes e Títulos
replace_in_files "Ouvy SaaS" "Ouvify" "Substituindo 'Ouvy SaaS' → 'Ouvify'..."
replace_in_files "Ouvy - " "Ouvify - " "Substituindo 'Ouvy - ' → 'Ouvify - '..."
replace_in_files " Ouvy" " Ouvify" "Substituindo ' Ouvy' → ' Ouvify'..."
replace_in_files "\"Ouvy\"" "\"Ouvify\"" "Substituindo '\"Ouvy\"' → '\"Ouvify\"'..."
replace_in_files "'Ouvy'" "'Ouvify'" "Substituindo \"'Ouvy'\" → \"'Ouvify'\"..."

# 1.2 Prefixo de protocolo (OUVY- permanece por compatibilidade com dados existentes)
# Apenas atualizar documentação
replace_in_files "OUVY SaaS" "OUVIFY" "Substituindo 'OUVY SaaS' → 'OUVIFY' (uppercase)..."

# 1.3 URLs e Emails
replace_in_files "@ouvy\\.com" "@ouvify.com" "Substituindo '@ouvy.com' → '@ouvify.com'..."
replace_in_files "@ouvy\\.app" "@ouvify.app" "Substituindo '@ouvy.app' → '@ouvify.app'..."
replace_in_files "ouvy\\.com" "ouvify.com" "Substituindo 'ouvy.com' → 'ouvify.com'..."

# 1.4 Docker containers e networks
replace_in_files "ouvy_" "ouvify_" "Substituindo 'ouvy_' → 'ouvify_' (containers)..."
replace_in_files "ouvy-" "ouvify-" "Substituindo 'ouvy-' → 'ouvify-' (networks)..."

# 1.5 User-Agent e Headers
replace_in_files "Ouvy-" "Ouvify-" "Substituindo 'Ouvy-' → 'Ouvify-' (headers)..."
replace_in_files "X-Ouvy-" "X-Ouvify-" "Substituindo 'X-Ouvy-' → 'X-Ouvify-' (headers)..."

# 1.6 Classes e variáveis Python/TypeScript
replace_in_files "OuvyUser" "OuvifyUser" "Substituindo 'OuvyUser' → 'OuvifyUser'..."
replace_in_files "OuvyAnonymous" "OuvifyAnonymous" "Substituindo 'OuvyAnonymous' → 'OuvifyAnonymous'..."

# 1.7 Paths de upload
replace_in_files "ouvy\\/feedback" "ouvify/feedback" "Substituindo 'ouvy/feedback' → 'ouvify/feedback'..."
replace_in_files "ouvy\\/tenants" "ouvify/tenants" "Substituindo 'ouvy/tenants' → 'ouvify/tenants'..."

# 1.8 Referências restantes
replace_in_files "do Ouvy" "do Ouvify" "Substituindo 'do Ouvy' → 'do Ouvify'..."
replace_in_files "no Ouvy" "no Ouvify" "Substituindo 'no Ouvy' → 'no Ouvify'..."
replace_in_files "ao Ouvy" "ao Ouvify" "Substituindo 'ao Ouvy' → 'ao Ouvify'..."

echo ""
echo "=================================================="
echo "✅ Rebrand completo!"
echo "📊 Total de arquivos modificados: $TOTAL_FILES"
echo ""
echo "⚠️  NOTA: O prefixo de protocolo 'OUVY-' foi mantido para"
echo "   compatibilidade com dados existentes no banco de dados."
echo ""
echo "🔍 Execute 'git diff' para revisar as alterações"
echo "=================================================="
