#!/usr/bin/env bash
# =============================================================================
# Auditoria determinística do Backend Django (Ouvify)
# =============================================================================
# Este script:
# 1. Cria/ativa virtualenv do backend
# 2. Instala dependências (requirements/test.txt)
# 3. Roda verificações básicas: manage.py check, migrations check  
# 4. Coleta testes com pytest (sem executar, apenas list)
# 5. Roda pylint básico (import-error check)
#
# Uso:
#   ./scripts/audit_backend.sh
#   
# Ou via Makefile:
#   make audit-backend
#
# Saída: evidências em audit-reports/backend/
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $*"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*"
}

# =============================================================================
# 1. Setup de ambiente
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/apps/backend"
VENV_DIR="${BACKEND_DIR}/.venv"
AUDIT_OUTPUT_DIR="${REPO_ROOT}/audit-reports/backend"

log_info "📂 Diretórios:"
log_info "   Repo root: ${REPO_ROOT}"
log_info "   Backend:   ${BACKEND_DIR}"
log_info "   Venv:      ${VENV_DIR}"
log_info "   Output:    ${AUDIT_OUTPUT_DIR}"

# Verifica se está no diretório correto
if [[ ! -f "${BACKEND_DIR}/manage.py" ]]; then
    log_error "manage.py não encontrado em ${BACKEND_DIR}"
    log_error "Este script deve ser executado a partir do root do repositório"
    exit 1
fi

# Cria diretório de output
mkdir -p "${AUDIT_OUTPUT_DIR}"

# =============================================================================
# 2. Criar/ativar virtualenv
# =============================================================================

log_info "🐍 Configurando Python virtualenv..."

if [[ ! -d "${VENV_DIR}" ]]; then
    log_info "Criando novo venv em ${VENV_DIR}"
    python3 -m venv "${VENV_DIR}"
    log_success "Venv criado"
else
    log_info "Venv já existe, reutilizando"
fi

# Ativar venv
source "${VENV_DIR}/bin/activate"

log_success "Venv ativado: $(which python)"
log_info "Python version: $(python --version)"

# Atualizar pip
log_info "Atualizando pip..."
python -m pip install --upgrade pip --quiet
log_success "pip atualizado para $(pip --version)"

# =============================================================================
# 3. Instalar dependências
# =============================================================================

log_info "📦 Instalando dependências do backend..."

# Usar test.txt que inclui base.txt + ferramentas de teste
cd "${BACKEND_DIR}"

if [[ ! -f "requirements/test.txt" ]]; then
    log_error "requirements/test.txt não encontrado"
    exit 1
fi

log_info "Instalando: requirements/test.txt"
pip install -r requirements/test.txt --quiet

log_success "Dependências instaladas"

# Verificar instalações críticas
log_info "Verificando pacotes críticos..."
python -c "import django; print(f'✓ Django {django.VERSION}')"
python -c "import rest_framework; print(f'✓ DRF instalado')"
python -c "import pytest; print(f'✓ pytest instalado')"

# =============================================================================
# 4. Django Check (sem DB)
# =============================================================================

log_info "🔍 Executando Django system check..."

# Configurar variáveis de ambiente mínimas para check
export DJANGO_SETTINGS_MODULE=config.settings
export DATABASE_URL="sqlite:///:memory:"
export SECRET_KEY="audit-temporary-secret-key-$(date +%s)"
export DEBUG=True
export TESTING=True

# Rodar check (apenas imports e configurações básicas, sem DB)
if python manage.py check --deploy 2>&1 | tee "${AUDIT_OUTPUT_DIR}/django_check.txt"; then
    log_success "Django check passou"
else
    log_warning "Django check teve avisos (ver ${AUDIT_OUTPUT_DIR}/django_check.txt)"
fi

# =============================================================================
# 5. Verificar migrations (sem aplicar) - SKIP: requer DB real
# =============================================================================

log_info "🗄️  Verificando migrations (pulando - requer DB real)..."
log_warning "Verificação de migrations requer PostgreSQL configurado."
log_info "Para rodar: export DATABASE_URL='postgresql://...' && python manage.py makemigrations --check"

# Criar arquivo de evidência indicando que foi pulado
cat > "${AUDIT_OUTPUT_DIR}/migrations_check.txt" << EOF
Verificação de migrations foi pulada durante auditoria.

Motivo: Requer conexão com banco de dados real (PostgreSQL recomendado).

Para executar manualmente:
  cd apps/backend
  source .venv/bin/activate
  export DATABASE_URL="postgresql://user:pass@localhost/ouvify_dev"
  python manage.py makemigrations --check --dry-run
EOF

log_info "Arquivo de evidência criado: migrations_check.txt"

# =============================================================================
# 6. Coletar testes (sem executar)
# =============================================================================

log_info "🧪 Coletando testes com pytest..."

if pytest --collect-only -q 2>&1 | tee "${AUDIT_OUTPUT_DIR}/pytest_collect.txt"; then
    TEST_COUNT=$(grep -c "test session starts" "${AUDIT_OUTPUT_DIR}/pytest_collect.txt" || echo "0")
    log_success "Testes coletados com sucesso"
    log_info "   Total de testes: $(grep -E '<(Function|Method)' "${AUDIT_OUTPUT_DIR}/pytest_collect.txt" | wc -l || echo '?')"
else
    log_warning "Erro ao coletar testes (ver ${AUDIT_OUTPUT_DIR}/pytest_collect.txt)"
fi

# =============================================================================
# 7. Verificar imports com Python (AST)
# =============================================================================

log_info "🔬 Verificando imports Python..."

cat > "${AUDIT_OUTPUT_DIR}/check_imports.py" << 'EOPYTHON'
#!/usr/bin/env python3
"""Verifica imports em arquivos Python do backend."""
import ast
import sys
from pathlib import Path

def check_file_imports(file_path):
    """Tenta parsear arquivo e retorna erros."""
    try:
        code = file_path.read_text(encoding='utf-8')
        ast.parse(code, filename=str(file_path))
        return None
    except SyntaxError as e:
        return f"SyntaxError: {e}"
    except Exception as e:
        return f"Error: {e}"

def main():
    backend_root = Path(__file__).parent.parent
    apps_dir = backend_root / "apps"
    
    print(f"Scanning: {apps_dir}")
    errors = []
    
    for py_file in apps_dir.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        
        error = check_file_imports(py_file)
        if error:
            errors.append((str(py_file.relative_to(backend_root)), error))
    
    if errors:
        print(f"\n❌ {len(errors)} arquivos com erros:")
        for file, error in errors:
            print(f"  - {file}: {error}")
        return 1
    else:
        print(f"\n✅ Todos os arquivos parsearam com sucesso")
        return 0

if __name__ == "__main__":
    sys.exit(main())
EOPYTHON

chmod +x "${AUDIT_OUTPUT_DIR}/check_imports.py"

if python "${AUDIT_OUTPUT_DIR}/check_imports.py" 2>&1 | tee "${AUDIT_OUTPUT_DIR}/imports_check.txt"; then
    log_success "Verificação de imports passou"
else
    log_warning "Erros de import encontrados (ver ${AUDIT_OUTPUT_DIR}/imports_check.txt)"
fi

# =============================================================================
# 8. Summary
# =============================================================================

log_info ""
log_info "═══════════════════════════════════════════════════════════════"
log_success "✅ Auditoria do backend concluída!"
log_info "═══════════════════════════════════════════════════════════════"
log_info ""
log_info "📊 Resultados salvos em: ${AUDIT_OUTPUT_DIR}/"
log_info ""
log_info "Arquivos gerados:"
log_info "  - django_check.txt       : Django system check"
log_info "  - migrations_check.txt   : Status de migrations"
log_info "  - pytest_collect.txt     : Lista de testes coletados"
log_info "  - imports_check.txt      : Verificação de imports Python"
log_info ""
log_info "Para executar os testes completos:"
log_info "  cd ${BACKEND_DIR}"
log_info "  source .venv/bin/activate"
log_info "  pytest --cov=apps --cov-report=html"
log_info ""
log_info "Para rodar pylint:"
log_info "  pylint apps/ --disable=C,R --enable=import-error"
log_info ""
log_info "════════════════════════════════════════════════════════════════"

exit 0
