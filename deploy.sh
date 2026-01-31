#!/bin/bash

# 🚀 Script de Deploy Automatizado - Ouvify
# Data: 14 de Janeiro de 2026

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Verificar se estamos no diretório correto
if [ ! -d "ouvify_saas" ] || [ ! -d "ouvify_frontend" ]; then
    print_error "Execute este script no diretório raiz do projeto!"
    exit 1
fi

print_header "🚀 DEPLOY OUVIFY"

# Verificar Git
print_info "Verificando Git..."
if ! command -v git &> /dev/null; then
    print_error "Git não instalado!"
    exit 1
fi
print_success "Git instalado"

# Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não instalado!"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION instalado"

# Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não instalado!"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION instalado"

# Menu principal
print_header "OPÇÕES DE DEPLOY"
echo "1) Deploy Backend (Railway)"
echo "2) Deploy Frontend (Vercel)"
echo "3) Deploy Completo (Backend + Frontend)"
echo "4) Configurar Variáveis de Ambiente"
echo "5) Testar Integrações"
echo "6) Ver Status dos Deploys"
echo "7) Ver Logs"
echo "8) Sair"
echo ""
read -p "Escolha uma opção (1-8): " choice

case $choice in
    1)
        print_header "DEPLOY BACKEND (RAILWAY)"
        
        # Verificar se Railway CLI está instalada
        print_info "Verificando Railway CLI..."
        if ! command -v railway &> /dev/null; then
            print_warning "Railway CLI não encontrada. Instalando..."
            npm install -g @railway/cli || {
                print_error "Falha ao instalar Railway CLI"
                print_info "Tente: curl -fsSL https://railway.app/install.sh | sh"
                exit 1
            }
        fi
        print_success "Railway CLI disponível"
        
        # Login Railway
        print_info "Fazendo login no Railway..."
        railway login || {
            print_error "Falha no login do Railway"
            exit 1
        }
        print_success "Login Railway realizado"
        
        # Navegar para pasta backend
        cd ouvify_saas
        
        # Link ou criar projeto
        print_info "Configurando projeto Railway..."
        if [ -f ".railway" ]; then
            print_info "Projeto já linkado"
        else
            print_warning "Projeto não linkado. Execute:"
            print_info "railway link  (para linkar projeto existente)"
            print_info "railway init  (para criar novo projeto)"
            read -p "Deseja criar um novo projeto? (y/n): " create_new
            if [ "$create_new" = "y" ]; then
                railway init
            else
                railway link
            fi
        fi
        
        # Configurar variáveis de ambiente
        print_info "Configurando variáveis de ambiente..."
        print_warning "Certifique-se de que as seguintes variáveis estão configuradas:"
        echo "  - SECRET_KEY"
        echo "  - DEBUG=False"
        echo "  - ALLOWED_HOSTS"
        echo "  - CORS_ALLOWED_ORIGINS"
        echo "  - DATABASE_URL (criada automaticamente pelo PostgreSQL)"
        echo ""
        read -p "Variáveis configuradas? (y/n): " vars_configured
        
        if [ "$vars_configured" != "y" ]; then
            print_info "Configure as variáveis manualmente:"
            print_info "railway variables set SECRET_KEY=\"sua-secret-key-aqui\""
            print_info "railway variables set DEBUG=\"False\""
            print_info "railway variables set ALLOWED_HOSTS=\".railway.app\""
            exit 0
        fi
        
        # Deploy
        print_info "Iniciando deploy do backend..."
        railway up || {
            print_error "Falha no deploy do backend"
            exit 1
        }
        
        print_success "Backend deployed com sucesso!"
        
        # Obter URL
        print_info "Obtendo URL do backend..."
        railway status
        
        cd ..
        ;;
        
    2)
        print_header "DEPLOY FRONTEND (VERCEL)"
        
        # Verificar se Vercel CLI está instalada
        print_info "Verificando Vercel CLI..."
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI não encontrada. Instalando..."
            npm install -g vercel || {
                print_error "Falha ao instalar Vercel CLI"
                exit 1
            }
        fi
        print_success "Vercel CLI disponível"
        
        # Login Vercel
        print_info "Fazendo login no Vercel..."
        vercel login || {
            print_error "Falha no login do Vercel"
            exit 1
        }
        print_success "Login Vercel realizado"
        
        # Navegar para pasta frontend
        cd ouvify_frontend
        
        # Perguntar URL do backend
        print_warning "Digite a URL do backend Railway:"
        read -p "URL (ex: https://ouvify-saas-production.up.railway.app): " backend_url
        
        if [ -z "$backend_url" ]; then
            print_error "URL do backend é obrigatória!"
            exit 1
        fi
        
        # Configurar variável de ambiente
        print_info "Configurando NEXT_PUBLIC_API_URL..."
        vercel env add NEXT_PUBLIC_API_URL << EOF
$backend_url
production
preview
development
EOF
        
        # Deploy
        print_info "Iniciando deploy do frontend..."
        print_warning "Para deploy de produção, execute: vercel --prod"
        
        read -p "Deploy para produção agora? (y/n): " deploy_prod
        if [ "$deploy_prod" = "y" ]; then
            vercel --prod || {
                print_error "Falha no deploy do frontend"
                exit 1
            }
        else
            vercel || {
                print_error "Falha no deploy do frontend"
                exit 1
            }
        fi
        
        print_success "Frontend deployed com sucesso!"
        
        cd ..
        ;;
        
    3)
        print_header "DEPLOY COMPLETO"
        print_info "Executando deploy do backend primeiro..."
        bash "$0" 1
        
        print_info "Aguardando 10 segundos..."
        sleep 10
        
        print_info "Executando deploy do frontend..."
        bash "$0" 2
        
        print_success "Deploy completo finalizado!"
        ;;
        
    4)
        print_header "CONFIGURAR VARIÁVEIS DE AMBIENTE"
        
        echo "Escolha o serviço:"
        echo "1) Backend (Railway)"
        echo "2) Frontend (Vercel)"
        read -p "Opção: " service_choice
        
        case $service_choice in
            1)
                print_info "Configurando variáveis do Backend..."
                cd ouvify_saas
                
                print_info "Configurações necessárias:"
                echo ""
                echo "railway variables set SECRET_KEY=\"j&x@uaqy(nonobld\$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#\""
                echo "railway variables set DEBUG=\"False\""
                echo "railway variables set ALLOWED_HOSTS=\".railway.app,.up.railway.app\""
                echo "railway variables set CORS_ALLOWED_ORIGINS=\"https://seu-frontend.vercel.app\""
                echo ""
                
                read -p "Executar configuração automática? (y/n): " auto_config
                if [ "$auto_config" = "y" ]; then
                    railway variables set SECRET_KEY="j&x@uaqy(nonobld\$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#"
                    railway variables set DEBUG="False"
                    railway variables set ALLOWED_HOSTS=".railway.app,.up.railway.app"
                    
                    print_warning "Digite a URL do frontend Vercel:"
                    read -p "URL: " frontend_url
                    railway variables set CORS_ALLOWED_ORIGINS="$frontend_url"
                    
                    print_success "Variáveis configuradas!"
                fi
                
                cd ..
                ;;
            2)
                print_info "Configurando variáveis do Frontend..."
                cd ouvify_frontend
                
                print_warning "Digite a URL do backend Railway:"
                read -p "URL: " backend_url
                
                vercel env add NEXT_PUBLIC_API_URL
                
                cd ..
                ;;
        esac
        ;;
        
    5)
        print_header "TESTAR INTEGRAÇÕES"
        
        print_warning "Digite a URL do backend:"
        read -p "Backend URL: " backend_url
        
        print_info "Testando health check..."
        curl -s "${backend_url}/health/" | jq . || {
            print_error "Health check falhou"
        }
        
        print_info "Testando tenant info..."
        curl -s "${backend_url}/api/tenant-info/" | jq . || {
            print_error "Tenant info falhou"
        }
        
        print_success "Testes básicos completos!"
        ;;
        
    6)
        print_header "STATUS DOS DEPLOYS"
        
        echo "1) Backend (Railway)"
        echo "2) Frontend (Vercel)"
        echo "3) Ambos"
        read -p "Opção: " status_choice
        
        case $status_choice in
            1)
                cd ouvify_saas
                railway status
                cd ..
                ;;
            2)
                cd ouvify_frontend
                vercel list
                cd ..
                ;;
            3)
                print_info "Status Backend:"
                cd ouvify_saas
                railway status
                cd ..
                
                print_info "Status Frontend:"
                cd ouvify_frontend
                vercel list
                cd ..
                ;;
        esac
        ;;
        
    7)
        print_header "VER LOGS"
        
        echo "1) Backend (Railway)"
        echo "2) Frontend (Vercel)"
        read -p "Opção: " logs_choice
        
        case $logs_choice in
            1)
                cd ouvify_saas
                railway logs -f
                cd ..
                ;;
            2)
                cd ouvify_frontend
                vercel logs
                cd ..
                ;;
        esac
        ;;
        
    8)
        print_success "Saindo..."
        exit 0
        ;;
        
    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

print_success "Operação concluída!"
echo ""
print_info "Execute novamente para mais opções"
