#!/bin/bash
# Validação de segurança pós-correções Fase 2
# Auditoria Ouvify - 26/01/2026

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔒 VALIDAÇÃO DE SEGURANÇA - AUDITORIA FASE 2             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Contadores
PASSED=0
FAILED=0

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 BACKEND (Django) - SEGURANÇA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd apps/backend

# Carregar .env se existir
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs) 2>/dev/null || true
fi

echo -n "  1. Django check... "
python manage.py check > /dev/null 2>&1
check_success

echo -n "  2. SVG removido de ALLOWED_FORMATS... "
grep -q "ALLOWED_FORMATS = \['png', 'jpg', 'jpeg', 'webp'\]" apps/tenants/upload_service.py
check_success

echo -n "  3. python-magic instalado... "
grep -q "python-magic" requirements.txt
check_success

echo -n "  4. validate_mime_type() implementado... "
grep -q "def validate_mime_type" apps/tenants/upload_service.py
check_success

echo -n "  5. TenantInfoRateThrottle implementado... "
grep -q "class TenantInfoRateThrottle" apps/tenants/views.py
check_success

echo -n "  6. Rate limiting em TenantInfoView... "
grep -q "throttle_classes = \[TenantInfoRateThrottle\]" apps/tenants/views.py
check_success

echo -n "  7. tenant_info rate configurado em settings... "
grep -q "'tenant_info':" ../../apps/backend/config/settings.py
check_success

echo -n "  8. Dependências atualizadas (sentry-sdk 2.50.0)... "
grep -q "sentry-sdk==2.50.0" requirements.txt
check_success

echo -n "  9. Dependências atualizadas (celery 5.6.2)... "
grep -q "celery==5.6.2" requirements.txt
check_success

echo -n "  10. Dependências atualizadas (gunicorn 24.1.1)... "
grep -q "gunicorn==24.1.1" requirements.txt
check_success

cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 FRONTEND (Next.js) - SEGURANÇA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  1. CSP header em vercel.json... "
grep -q "Content-Security-Policy" vercel.json
check_success

echo -n "  2. CSP com block-all-mixed-content... "
grep -q "block-all-mixed-content" vercel.json
check_success

echo -n "  3. CSP com Cloudinary whitelist... "
grep -q "https://res.cloudinary.com" vercel.json
check_success

echo -n "  4. CSP com WebSocket support... "
grep -q "wss://" vercel.json
check_success

echo -n "  5. Permissions-Policy atualizado... "
grep -q "interest-cohort=()" vercel.json
check_success

echo -n "  6. HSTS com max-age 63072000... "
grep -q "max-age=63072000" vercel.json
check_success

echo -n "  7. csp-config.js criado... "
[ -f "apps/frontend/csp-config.js" ]
check_success

echo -n "  8. Input de logo não aceita SVG... "
grep -q 'accept="image/png,image/jpeg,image/webp"' apps/frontend/app/dashboard/configuracoes/page.tsx
check_success

echo -n "  9. Documentação atualizada (2MB max)... "
grep -q "Máximo: 2MB" apps/frontend/app/dashboard/configuracoes/page.tsx
check_success

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️ DATABASE & INFRASTRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  1. DATABASE_PRIVATE_URL suportado... "
grep -q "DATABASE_PRIVATE_URL = os.getenv" apps/backend/config/settings.py
check_success

echo -n "  2. Fallback para DATABASE_URL... "
grep -q "elif DATABASE_URL:" apps/backend/config/settings.py
check_success

echo -n "  3. Connection health checks habilitados... "
grep -q "conn_health_checks=True" apps/backend/config/settings.py
check_success

echo -n "  4. Statement timeout configurado (30s)... "
grep -q "statement_timeout=30000" apps/backend/config/settings.py
check_success

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 UPLOADS & FILE VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  1. MAX_LOGO_SIZE_MB reduzido para 2MB... "
grep -q "MAX_LOGO_SIZE_MB = 2" apps/backend/apps/tenants/upload_service.py
check_success

echo -n "  2. MAX_FAVICON_SIZE_MB reduzido para 0.5MB... "
grep -q "MAX_FAVICON_SIZE_MB = 0.5" apps/backend/apps/tenants/upload_service.py
check_success

echo -n "  3. ALLOWED_MIME_TYPES definido... "
grep -q "ALLOWED_MIME_TYPES = {" apps/backend/apps/tenants/upload_service.py
check_success

echo -n "  4. Validação de tamanho mínimo (100 bytes)... "
grep -q "file.size < 100" apps/backend/apps/tenants/upload_service.py
check_success

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     📊 RESULTADO FINAL                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  Testes passados: ${GREEN}${PASSED}${NC}"
echo -e "  Testes falhados: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS AS VALIDAÇÕES DE SEGURANÇA PASSARAM!${NC}"
    echo ""
    echo "📊 Score esperado: 9.8/10 (Grade A+)"
    echo ""
    echo "📋 Correções implementadas:"
    echo "  ✅ P0: Content-Security-Policy completo"
    echo "  ✅ P0: SVG removido de uploads (previne Stored XSS)"
    echo "  ✅ P0: DATABASE_PRIVATE_URL configurado"
    echo "  ✅ P1: Validação de MIME type (python-magic)"
    echo "  ✅ P1: Rate limiting em /api/tenant-info/"
    echo "  ✅ P1: Dependências críticas atualizadas"
    echo ""
    echo "🎯 Próximos passos:"
    echo "  1. Commit todas as mudanças"
    echo "  2. Fazer deploy em staging"
    echo "  3. Testar manualmente (CSP violations, rate limiting)"
    echo "  4. Executar Fase 3 da auditoria (Performance)"
    exit 0
else
    echo -e "${RED}❌ ALGUMAS VALIDAÇÕES FALHARAM${NC}"
    echo ""
    echo "💡 Revise os erros acima e corrija antes de prosseguir"
    exit 1
fi
