#!/bin/bash
# Script para corrigir classes antigas de cores em todos os arquivos .tsx

set -e

echo "🔍 Procurando arquivos .tsx com classes antigas..."

# Muda para o diretório raiz
cd /workspaces/Ouvify

# Diretório base
BASE_DIR="/workspaces/Ouvify/apps/frontend/app"

# Contador
FIXED_COUNT=0

# Função para corrigir um arquivo
fix_file() {
    local file="$1"
    local original_content=$(cat "$file")
    local content="$original_content"
    
    # text-text-* → tokens corretos
    content=$(echo "$content" | sed 's/text-text-tertiary/text-muted-foreground/g')
    content=$(echo "$content" | sed 's/text-text-secondary/text-muted-foreground/g')
    content=$(echo "$content" | sed 's/text-text-primary/text-foreground/g')
    content=$(echo "$content" | sed 's/text-text-link/text-primary/g')
    
    # bg-background-* → tokens corretos  
    content=$(echo "$content" | sed 's/bg-background-tertiary/bg-muted/g')
    content=$(echo "$content" | sed 's/bg-background-secondary/bg-muted/g')
    
    # border-border-light → border-border
    content=$(echo "$content" | sed 's/border-border-light/border-border/g')
    
    # text-{color}-{number} → text-{color} (remove número)
    content=$(echo "$content" | sed -E 's/text-(primary|secondary|success|error|warning)-[0-9]{3}/text-\1/g')
    
    # bg-{color}-{50|100} → bg-{color}\/10
    content=$(echo "$content" | sed -E 's/bg-(primary|secondary|success|error|warning)-(50|100)/bg-\1\/10/g')
    content=$(echo "$content" | sed 's/bg-warning-light/bg-warning\/10/g')
    content=$(echo "$content" | sed 's/bg-success-light/bg-success\/10/g')
    
    # border-{color}-{number} → border-{color}
    content=$(echo "$content" | sed -E 's/border-(primary|secondary|success|error|warning)-[0-9]{3}/border-\1/g')
    
    # Verifica se o arquivo foi modificado
    if [ "$content" != "$original_content" ]; then
        echo "$content" > "$file"
        echo "✅ Fixed: $file"
        ((FIXED_COUNT++))
    fi
}

# Processa todos os arquivos .tsx
while IFS= read -r -d '' file; do
    fix_file "$file"
done < <(find "$BASE_DIR" -name "*.tsx" -type f -print0 2>/dev/null || true)

echo ""
echo "✨ Concluído! $FIXED_COUNT arquivos corrigidos."
