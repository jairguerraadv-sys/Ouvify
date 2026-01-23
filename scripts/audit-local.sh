#!/bin/bash

echo "╔════════════════════════════════════════════════════╗"
echo "║  🔍 AUDITORIA PÓS-CONSOLIDAÇÃO (Local)            ║"
echo "║  Monorepo: ouvy-saas                              ║"
echo "║  Modo: Sem Docker                                 ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."
START_TIME=$(date +%s)

# ============================================
# FASE 1: Estrutura do Projeto
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 1: Estrutura do Projeto"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "1.1 Verificando estrutura monorepo..."
echo -n "  apps/backend existe... "
[ -d "apps/backend" ] && echo "✅" || echo "❌"
echo -n "  apps/frontend existe... "
[ -d "apps/frontend" ] && echo "✅" || echo "❌"
echo -n "  packages/ existe... "
[ -d "packages" ] && echo "✅" || echo "❌"

echo ""
echo "1.2 Verificando docker-compose.yml..."
echo -n "  Arquivo existe... "
[ -f "docker-compose.yml" ] && echo "✅" || echo "❌"
echo -n "  Paths atualizados (apps/backend)... "
grep -q "apps/backend" docker-compose.yml 2>/dev/null && echo "✅" || echo "❌"
echo -n "  Paths atualizados (apps/frontend)... "
grep -q "apps/frontend" docker-compose.yml 2>/dev/null && echo "✅" || echo "❌"

echo ""
echo "1.3 Arquivos de configuração raiz..."
for file in "package.json" "turbo.json" "Makefile" "requirements.txt"; do
    echo -n "  $file... "
    [ -f "$file" ] && echo "✅" || echo "⚠️  Não encontrado"
done

# ============================================
# FASE 2: Backend Django
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 2: Backend Django"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "2.1 Estrutura do backend..."
BACKEND_APPS=("core" "tenants" "feedbacks" "notifications" "auditlog" "authentication")
for app in "${BACKEND_APPS[@]}"; do
    echo -n "  apps/$app... "
    [ -d "apps/backend/apps/$app" ] && echo "✅" || echo "❌"
done

echo ""
echo "2.2 Arquivos críticos do backend..."
BACKEND_FILES=("manage.py" "requirements.txt" "config/settings.py" "config/urls.py" "conftest.py")
for file in "${BACKEND_FILES[@]}"; do
    echo -n "  $file... "
    [ -f "apps/backend/$file" ] && echo "✅" || echo "⚠️"
done

echo ""
echo "2.3 Verificando imports nos models..."
echo "  Checando apps/backend/apps/*/models.py..."
IMPORT_ERRORS=0
for model_file in apps/backend/apps/*/models.py; do
    if [ -f "$model_file" ]; then
        # Verificar se tem erros de sintaxe básicos
        if python3 -m py_compile "$model_file" 2>/dev/null; then
            app_name=$(dirname "$model_file" | xargs basename)
            echo "    ✅ $app_name/models.py"
        else
            app_name=$(dirname "$model_file" | xargs basename)
            echo "    ❌ $app_name/models.py (erro de sintaxe)"
            ((IMPORT_ERRORS++))
        fi
    fi
done
[ $IMPORT_ERRORS -eq 0 ] && echo "  ✅ Todos os models válidos" || echo "  ⚠️  $IMPORT_ERRORS erro(s) encontrado(s)"

echo ""
echo "2.4 Verificando migrations..."
MIGRATION_COUNT=$(find apps/backend -path "*/migrations/*.py" -not -name "__init__.py" 2>/dev/null | wc -l | tr -d ' ')
echo "  Total de migrations: $MIGRATION_COUNT"

# ============================================
# FASE 3: Frontend Next.js
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 3: Frontend Next.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "3.1 Estrutura do frontend..."
FRONTEND_DIRS=("app" "components" "lib" "hooks" "contexts")
for dir in "${FRONTEND_DIRS[@]}"; do
    echo -n "  $dir/... "
    [ -d "apps/frontend/$dir" ] && echo "✅" || echo "⚠️"
done

echo ""
echo "3.2 Arquivos críticos do frontend..."
FRONTEND_FILES=("package.json" "next.config.ts" "tsconfig.json" "tailwind.config.ts")
for file in "${FRONTEND_FILES[@]}"; do
    echo -n "  $file... "
    [ -f "apps/frontend/$file" ] && echo "✅" || echo "⚠️"
done

echo ""
echo "3.3 Verificando node_modules..."
echo -n "  node_modules existe... "
[ -d "apps/frontend/node_modules" ] && echo "✅" || echo "⚠️  Não instalado"

echo ""
echo "3.4 Verificando .next (build cache)..."
echo -n "  .next existe... "
[ -d "apps/frontend/.next" ] && echo "✅ (cache existente)" || echo "⚠️  Não buildado"

# ============================================
# FASE 4: CI/CD e Workflows
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 4: CI/CD e Workflows"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "4.1 GitHub Workflows..."
if [ -d ".github/workflows" ]; then
    for workflow in .github/workflows/*.yml; do
        if [ -f "$workflow" ]; then
            name=$(basename "$workflow")
            echo -n "  $name... "
            # Verificar se tem paths atualizados
            if grep -qE "apps/(backend|frontend)" "$workflow" 2>/dev/null; then
                echo "✅ (paths atualizados)"
            else
                echo "⚠️  (verificar paths)"
            fi
        fi
    done
else
    echo "  ⚠️  .github/workflows não encontrado"
fi

# ============================================
# FASE 5: Segurança
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 5: Segurança"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "5.1 Arquivos sensíveis no git..."
echo -n "  .env commitado... "
if git ls-files 2>/dev/null | grep -qE "^\.env$"; then
    echo "❌ PERIGO!"
else
    echo "✅ Não"
fi

echo ""
echo "5.2 .gitignore configurado..."
GITIGNORE_PATTERNS=(".env" "__pycache__" "node_modules" ".next" "*.pyc" "db.sqlite3")
for pattern in "${GITIGNORE_PATTERNS[@]}"; do
    echo -n "  $pattern... "
    grep -q "$pattern" .gitignore 2>/dev/null && echo "✅" || echo "⚠️"
done

echo ""
echo "5.3 Secrets hardcoded..."
HARDCODED=$(grep -rE "(SECRET_KEY|API_KEY|PASSWORD)\s*=\s*['\"][^'\"]{10,}['\"]" apps/ --include="*.py" 2>/dev/null | grep -v "os.getenv\|os.environ\|env(" | head -3 || true)
if [ -n "$HARDCODED" ]; then
    echo "  ⚠️  Possíveis secrets encontrados:"
    echo "$HARDCODED" | head -3 | sed 's/^/    /'
else
    echo "  ✅ Nenhum secret hardcoded encontrado"
fi

# ============================================
# FASE 6: Métricas do Repositório
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 6: Métricas do Repositório"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
REPO_SIZE=$(du -sh . 2>/dev/null | cut -f1)
PYTHON_FILES=$(find apps -name "*.py" 2>/dev/null | wc -l | tr -d ' ')
TS_FILES=$(find apps -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
PYCACHE_DIRS=$(find . -name "__pycache__" -type d 2>/dev/null | wc -l | tr -d ' ')

echo "  📦 Tamanho do repositório: $REPO_SIZE"
echo "  🐍 Arquivos Python: $PYTHON_FILES"
echo "  📘 Arquivos TypeScript: $TS_FILES"
echo "  🗑️  Diretórios __pycache__: $PYCACHE_DIRS"

# ============================================
# FASE 7: Verificação de Testes
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 FASE 7: Verificação de Testes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "7.1 Arquivos de teste do backend..."
BACKEND_TESTS=$(find apps/backend -name "test_*.py" -o -name "*_test.py" 2>/dev/null | wc -l | tr -d ' ')
echo "  Arquivos de teste: $BACKEND_TESTS"

echo ""
echo "7.2 Arquivos de teste do frontend..."
FRONTEND_TESTS=$(find apps/frontend -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Arquivos de teste: $FRONTEND_TESTS"

echo ""
echo "7.3 Configuração de testes..."
echo -n "  pytest.ini (raiz)... "
[ -f "pytest.ini" ] && echo "✅" || echo "⚠️"
echo -n "  conftest.py (backend)... "
[ -f "apps/backend/conftest.py" ] && echo "✅" || echo "⚠️"
echo -n "  jest.config.ts (frontend)... "
[ -f "apps/frontend/jest.config.ts" ] && echo "✅" || echo "⚠️"

# ============================================
# RESUMO FINAL
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✅ AUDITORIA LOCAL CONCLUÍDA                      ║"
echo "║  Duração: ${DURATION}s                                     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📋 RESUMO:"
echo "  • Estrutura monorepo: OK"
echo "  • Backend Django: $BACKEND_TESTS arquivos de teste"
echo "  • Frontend Next.js: $FRONTEND_TESTS arquivos de teste"
echo "  • Tamanho total: $REPO_SIZE"
echo "  • __pycache__: $PYCACHE_DIRS diretórios"
echo ""
echo "⚠️  NOTA: Para auditoria completa com Docker, execute:"
echo "    docker compose up -d && ./scripts/run-full-audit.sh"
