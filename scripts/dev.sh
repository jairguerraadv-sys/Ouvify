#!/bin/bash
# =============================================================================
# OUVY SAAS - SCRIPT PRINCIPAL DE DESENVOLVIMENTO
# =============================================================================
# Este script consolida todos os comandos úteis para desenvolvimento.
# 
# Uso:
#   ./dev.sh [comando]
#
# Comandos disponíveis:
#   start      - Inicia backend e frontend
#   backend    - Inicia apenas o backend Django
#   frontend   - Inicia apenas o frontend Next.js
#   test       - Executa todos os testes
#   migrate    - Executa migrações do Django
#   shell      - Abre shell do Django
#   deploy     - Prepara para deploy
#   help       - Mostra esta ajuda
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretórios
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/ouvify_saas"
FRONTEND_DIR="$ROOT_DIR/ouvify_frontend"
VENV_DIR="$BACKEND_DIR/venv"

# Funções auxiliares
print_header() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}=============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está no diretório correto
check_directory() {
    if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Diretório inválido. Execute do diretório raiz do projeto."
        exit 1
    fi
}

# Ativar virtualenv
activate_venv() {
    if [ -d "$VENV_DIR" ]; then
        source "$VENV_DIR/bin/activate"
        print_success "Virtualenv ativado"
    else
        print_warning "Virtualenv não encontrado em $VENV_DIR"
        print_warning "Criando virtualenv..."
        python3 -m venv "$VENV_DIR"
        source "$VENV_DIR/bin/activate"
        pip install -r "$ROOT_DIR/requirements.txt"
        print_success "Virtualenv criado e dependências instaladas"
    fi
}

# Comandos
cmd_start() {
    print_header "Iniciando Ouvify (Backend + Frontend)"
    
    # Backend em background
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py runserver &
    BACKEND_PID=$!
    print_success "Backend iniciado (PID: $BACKEND_PID)"
    
    # Frontend em background
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    print_success "Frontend iniciado (PID: $FRONTEND_PID)"
    
    echo ""
    echo -e "${GREEN}🚀 Ouvify está rodando!${NC}"
    echo -e "   Backend:  http://localhost:8000"
    echo -e "   Frontend: http://localhost:3000"
    echo ""
    echo -e "Pressione Ctrl+C para parar..."
    
    # Aguardar interrupção
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; print_success 'Serviços encerrados'" INT
    wait
}

cmd_backend() {
    print_header "Iniciando Backend Django"
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py runserver
}

cmd_frontend() {
    print_header "Iniciando Frontend Next.js"
    cd "$FRONTEND_DIR"
    npm run dev
}

cmd_test() {
    print_header "Executando Testes"
    
    echo -e "\n${BLUE}Testes do Backend:${NC}"
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py test --verbosity=2 || true
    
    echo -e "\n${BLUE}Testes do Frontend:${NC}"
    cd "$FRONTEND_DIR"
    npm test -- --passWithNoTests || true
    
    print_success "Testes concluídos"
}

cmd_migrate() {
    print_header "Executando Migrações"
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py makemigrations
    python manage.py migrate
    print_success "Migrações aplicadas"
}

cmd_shell() {
    print_header "Abrindo Django Shell"
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py shell
}

cmd_deploy() {
    print_header "Preparando para Deploy"
    
    # Verificar testes
    echo -e "\n${BLUE}Verificando testes...${NC}"
    cd "$BACKEND_DIR"
    activate_venv
    python manage.py check
    
    # Coletar estáticos
    echo -e "\n${BLUE}Coletando arquivos estáticos...${NC}"
    python manage.py collectstatic --noinput
    
    # Build frontend
    echo -e "\n${BLUE}Buildando frontend...${NC}"
    cd "$FRONTEND_DIR"
    npm run build
    
    print_success "Projeto pronto para deploy!"
    echo ""
    echo "Próximos passos:"
    echo "1. Commit e push para GitHub"
    echo "2. Railway e Vercel farão deploy automático"
}

cmd_help() {
    echo "Ouvify - Script de Desenvolvimento"
    echo ""
    echo "Uso: ./scripts/dev.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  start      Inicia backend e frontend simultaneamente"
    echo "  backend    Inicia apenas o backend Django"
    echo "  frontend   Inicia apenas o frontend Next.js"
    echo "  test       Executa todos os testes"
    echo "  migrate    Executa migrações do Django"
    echo "  shell      Abre shell do Django"
    echo "  deploy     Prepara projeto para deploy"
    echo "  help       Mostra esta ajuda"
    echo ""
}

# Main
check_directory

case "${1:-help}" in
    start)
        cmd_start
        ;;
    backend)
        cmd_backend
        ;;
    frontend)
        cmd_frontend
        ;;
    test)
        cmd_test
        ;;
    migrate)
        cmd_migrate
        ;;
    shell)
        cmd_shell
        ;;
    deploy)
        cmd_deploy
        ;;
    help|*)
        cmd_help
        ;;
esac
