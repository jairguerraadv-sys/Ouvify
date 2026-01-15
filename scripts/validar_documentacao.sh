#!/bin/bash

# Validar estrutura da documentação reorganizada

echo "🔍 VALIDANDO ESTRUTURA DA DOCUMENTAÇÃO"
echo "======================================"
echo ""

# Contador de erros
ERRORS=0

# Função para verificar arquivo
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "✅ $file"
        return 0
    else
        echo "❌ $file NÃO ENCONTRADO"
        ((ERRORS++))
        return 1
    fi
}

# Função para verificar pasta
check_dir() {
    local dir=$1
    if [ -d "$dir" ]; then
        local count=$(find "$dir" -maxdepth 1 -type f | wc -l | tr -d ' ')
        echo "✅ $dir ($count arquivos)"
        return 0
    else
        echo "❌ $dir NÃO ENCONTRADO"
        ((ERRORS++))
        return 1
    fi
}

echo "📂 Verificando pastas criadas..."
echo ""
check_dir "docs/reports"
check_dir "docs/audits"
check_dir "docs/guides"
check_dir "docs/checklists"
check_dir "docs/deploy"

echo ""
echo "📝 Verificando índices criados..."
echo ""
check_file "INDICE_DOCUMENTACAO.md"
check_file "docs/README.md"

echo ""
echo "🔧 Verificando script de reorganização..."
echo ""
check_file "scripts/reorganizar_documentacao.sh"

echo ""
echo "📊 Verificando arquivos críticos movidos..."
echo ""
check_file "docs/reports/VALIDACAO_FINAL.txt"
check_file "docs/reports/NOTIFICACOES_EMAIL_IMPLEMENTADO.md"
check_file "docs/audits/AUDITORIA_PRE_DEPLOY_2026.md"
check_file "docs/guides/START_HERE.md"
check_file "docs/checklists/CHECKLIST_DEPLOY_FINAL.md"

echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ VALIDAÇÃO COMPLETA: Tudo OK!"
    echo "   Todos os arquivos e pastas estão no lugar correto."
    echo ""
    echo "📊 Resumo:"
    echo "   • $(find docs/reports -maxdepth 1 -type f | wc -l | tr -d ' ') arquivos em reports/"
    echo "   • $(find docs/audits -maxdepth 1 -type f | wc -l | tr -d ' ') arquivos em audits/"
    echo "   • $(find docs/guides -maxdepth 1 -type f | wc -l | tr -d ' ') arquivos em guides/"
    echo "   • $(find docs/checklists -maxdepth 1 -type f | wc -l | tr -d ' ') arquivos em checklists/"
    echo "   • $(find docs/deploy -maxdepth 1 -type f | wc -l | tr -d ' ') arquivo em deploy/"
    exit 0
else
    echo "❌ VALIDAÇÃO FALHOU: $ERRORS erro(s) encontrado(s)"
    echo "   Por favor, execute novamente: ./scripts/reorganizar_documentacao.sh"
    exit 1
fi
