#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📚 REORGANIZAÇÃO DA DOCUMENTAÇÃO - OUVY SAAS          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se estamos na raiz do projeto
if [ ! -f "README.md" ]; then
    echo -e "${YELLOW}⚠️  Execute este script da raiz do projeto!${NC}"
    exit 1
fi

# Função para mover arquivo com verificação
move_file() {
    local file=$1
    local dest=$2
    
    if [ -f "$file" ]; then
        mv "$file" "$dest"
        echo -e "   ${GREEN}✅${NC} $file → $dest"
        return 0
    else
        echo -e "   ${YELLOW}⚠️${NC}  $file não encontrado (pode já estar movido)"
        return 1
    fi
}

# Mover relatórios
echo -e "${GREEN}📊 Movendo relatórios...${NC}"
move_file "VALIDACAO_FINAL.txt" "docs/reports/"
move_file "ALTERACOES_APLICADAS.md" "docs/reports/"
move_file "RESUMO_EXECUTIVO_FINAL.md" "docs/reports/"
move_file "RELATORIO_AUDITORIA_EXECUTIVO.md" "docs/reports/"
move_file "RELATORIO_CONFIGURACOES.md" "docs/reports/"
move_file "FASE1_CORRECOES_APLICADAS.txt" "docs/reports/"
move_file "NOTIFICACOES_EMAIL_IMPLEMENTADO.md" "docs/reports/"
move_file "CORREÇÕES_DASHBOARD_REAL.md" "docs/reports/"
move_file "RESUMO_IMPLEMENTACAO.md" "docs/reports/"

# Mover auditorias
echo ""
echo -e "${GREEN}🔍 Movendo auditorias...${NC}"
move_file "AUDITORIA_PRE_DEPLOY_2026.md" "docs/audits/"
move_file "SECURITY_FIXES_REPORT.md" "docs/audits/"
move_file "SECURITY_NOTES.md" "docs/audits/"

# Mover guias
echo ""
echo -e "${GREEN}📖 Movendo guias...${NC}"
move_file "PROXIMOS_PASSOS.md" "docs/guides/"
move_file "START_HERE.md" "docs/guides/"
move_file "PRODUTO_OUVY_GUIA_COMPLETO.md" "docs/guides/"
move_file "PLANO_ACAO_CORRECOES.md" "docs/guides/"
move_file "PROBLEMAS_PRODUTO.md" "docs/guides/"

# Mover checklists
echo ""
echo -e "${GREEN}✅ Movendo checklists...${NC}"
move_file "CHECKLIST_DEPLOY_FINAL.md" "docs/checklists/"
move_file "ANALISE_ROTAS_INTEGRACAO.md" "docs/checklists/"

# Mover configurações de deploy
echo ""
echo -e "${GREEN}🚀 Movendo documentos de deploy...${NC}"
move_file "CONFIGURAR_STRIPE.md" "docs/deploy/"

# Resumo final
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ REORGANIZAÇÃO CONCLUÍDA COM SUCESSO                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📂 Nova estrutura:${NC}"
echo ""
ls -lR docs/ | grep -E "^d|\.md$|\.txt$" | head -30
echo ""
echo -e "${YELLOW}📌 Próximos passos:${NC}"
echo "   1. Revisar docs/README.md"
echo "   2. Revisar INDICE_DOCUMENTACAO.md"
echo "   3. Commitar as mudanças:"
echo ""
echo "      git add docs/ INDICE_DOCUMENTACAO.md"
echo "      git commit -m 'docs: reorganizar documentação em estrutura hierárquica'"
echo ""
