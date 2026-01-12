#!/bin/bash

# 🎯 SCRIPT SHELL - Orquestrador de Auditoria
# Facilita execução dos audits de QA
# Uso: ./run_audit.sh [comando]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/jairneto/Desktop/ouvy_saas"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Cores para imprimir
print_header() {
    echo -e "${CYAN}${BOLD}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}${BOLD}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
check_directory() {
    if [ "$PWD" != "$PROJECT_ROOT" ]; then
        print_error "Você deve estar em $PROJECT_ROOT"
        echo "Comando: cd $PROJECT_ROOT"
        exit 1
    fi
}

# Verificar se Python está disponível
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 não encontrado"
        exit 1
    fi
    print_success "Python 3 encontrado: $(python3 --version)"
}

# Listar todos os comandos disponíveis
show_help() {
    echo ""
    print_header "🎯 ORQUESTRADOR DE AUDITORIA - Ouvy SaaS"
    echo ""
    echo "USO: ./run_audit.sh [COMANDO]"
    echo ""
    echo "${CYAN}COMANDOS:${NC}"
    echo ""
    echo "  ${GREEN}all${NC}                    Executa todos os audits (RECOMENDADO)"
    echo "  ${GREEN}security${NC}               Auditoria de segurança"
    echo "  ${GREEN}debug${NC}                  Scanner de debug code"
    echo "  ${GREEN}typing${NC}                 Auditoria de tipagem TypeScript"
    echo "  ${GREEN}apis${NC}                   Mapeamento de APIs"
    echo "  ${GREEN}report${NC}                 Gera relatório HTML"
    echo "  ${GREEN}clean${NC}                  Remove arquivos gerados"
    echo "  ${GREEN}help${NC}                   Mostra esta mensagem"
    echo ""
    echo "${CYAN}EXEMPLOS:${NC}"
    echo "  ./run_audit.sh all                 # Executa tudo"
    echo "  ./run_audit.sh security            # Apenas segurança"
    echo "  ./run_audit.sh debug               # Apenas debug"
    echo ""
    echo "${CYAN}ARQUIVOS GERADOS:${NC}"
    echo "  • audit_security.py                # Script de segurança"
    echo "  • audit_debug.py                   # Script de debug"
    echo "  • audit_typing.py                  # Script de tipagem"
    echo "  • audit_apis.py                    # Script de APIs"
    echo "  • audit_master.py                  # Script maestro"
    echo "  • audit_report.py                  # Gerador de HTML"
    echo "  • AUDIT_REPORT.html                # Relatório final"
    echo "  • AUDIT_README.md                  # Documentação"
    echo ""
}

# Executar auditoria de segurança
audit_security() {
    print_header "🔐 AUDITORIA DE SEGURANÇA"
    python3 "$PROJECT_ROOT/audit_security.py"
    return $?
}

# Executar scanner de debug
audit_debug() {
    print_header "🧹 SCANNER DE DEBUG"
    python3 "$PROJECT_ROOT/audit_debug.py"
    return $?
}

# Executar auditoria de tipagem
audit_typing() {
    print_header "📝 AUDITORIA DE TIPAGEM"
    python3 "$PROJECT_ROOT/audit_typing.py"
    return $?
}

# Executar mapeamento de APIs
audit_apis() {
    print_header "🔗 MAPEAMENTO DE APIS"
    python3 "$PROJECT_ROOT/audit_apis.py"
    return $?
}

# Executar todos os audits
audit_all() {
    print_header "🎯 AUDITORIA COMPLETA - CODE FREEZE"
    python3 "$PROJECT_ROOT/audit_master.py"
    return $?
}

# Gerar relatório HTML
generate_report() {
    print_header "📊 GERANDO RELATÓRIO HTML"
    python3 "$PROJECT_ROOT/audit_report.py"
    print_success "Abra o relatório: file://$PROJECT_ROOT/AUDIT_REPORT.html"
    
    # Tentar abrir no navegador (apenas em macOS)
    if command -v open &> /dev/null; then
        open "file://$PROJECT_ROOT/AUDIT_REPORT.html"
        print_success "Relatório aberto no navegador"
    fi
    return 0
}

# Limpar arquivos gerados
clean_files() {
    print_header "🧹 LIMPANDO ARQUIVOS GERADOS"
    rm -f "$PROJECT_ROOT/AUDIT_REPORT.html"
    print_success "Arquivos removidos"
    return 0
}

# Main
main() {
    check_directory
    check_python
    
    command="${1:-help}"
    
    case "$command" in
        all)
            audit_all
            ;;
        security)
            audit_security
            ;;
        debug)
            audit_debug
            ;;
        typing)
            audit_typing
            ;;
        apis)
            audit_apis
            ;;
        report)
            generate_report
            ;;
        clean)
            clean_files
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $command"
            show_help
            exit 1
            ;;
    esac
    
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        print_success "Auditoria concluída com sucesso"
    else
        echo ""
        print_error "Auditoria concluída com avisos (exit code: $exit_code)"
    fi
    
    exit $exit_code
}

# Executar
main "$@"
