#!/bin/bash
set -e

echo "🔍 AUDITORIA - BACKEND DJANGO"
echo "=============================="

cd "$(dirname "$0")/.."

# 1. Django Check
echo "2.1 Executando django check..."
docker compose exec -T backend python manage.py check 2>&1 || echo "  ⚠️  Alguns warnings encontrados"

# 2. Verificar migrations
echo ""
echo "2.2 Verificando estado das migrations..."
docker compose exec -T backend python manage.py showmigrations 2>&1 | head -30

# 3. Verificar se há migrations pendentes
echo ""
echo -n "2.3 Migrations pendentes... "
PENDING=$(docker compose exec -T backend python manage.py showmigrations 2>&1 | grep -c "\[ \]" || echo "0")
if [ "$PENDING" -eq 0 ]; then
    echo "✅ Nenhuma pendente"
else
    echo "⚠️  $PENDING migrations pendentes"
fi

# 4. Testar collectstatic
echo ""
echo "2.4 Testando collectstatic (dry-run)..."
docker compose exec -T backend python manage.py collectstatic --noinput --dry-run 2>&1 | tail -5 || echo "  ⚠️  Erro no collectstatic"

# 5. Verificar apps instalados
echo ""
echo "2.5 Apps Django instalados:"
docker compose exec -T backend python -c "
from django.conf import settings
for app in settings.INSTALLED_APPS:
    if 'apps.' in app:
        print(f'  ✅ {app}')
" 2>&1 || echo "  ⚠️  Erro ao listar apps"

# 6. Verificar importações críticas
echo ""
echo "2.6 Testando importações críticas..."
docker compose exec -T backend python << 'PYTHON'
import sys
errors = []

try:
    from apps.core.middleware import TenantMiddleware
    print("  ✅ TenantMiddleware")
except ImportError as e:
    errors.append(f"TenantMiddleware: {e}")
    print(f"  ⚠️  TenantMiddleware: {e}")

try:
    from apps.feedbacks.models import Feedback
    print("  ✅ Feedback Model")
except ImportError as e:
    errors.append(f"Feedback: {e}")
    print(f"  ⚠️  Feedback Model: {e}")

try:
    from apps.tenants.models import Tenant
    print("  ✅ Tenant Model")
except ImportError as e:
    errors.append(f"Tenant: {e}")
    print(f"  ⚠️  Tenant Model: {e}")

try:
    from apps.notifications.models import Notification
    print("  ✅ Notification Model")
except ImportError as e:
    errors.append(f"Notification: {e}")
    print(f"  ⚠️  Notification Model: {e}")

try:
    from apps.auditlog.models import AuditLog
    print("  ✅ AuditLog Model")
except ImportError as e:
    errors.append(f"AuditLog: {e}")
    print(f"  ⚠️  AuditLog Model: {e}")

if errors:
    print(f"\n⚠️  {len(errors)} importação(ões) com problemas")
else:
    print("\n✅ Todas as importações OK")
PYTHON

echo ""
echo "✅ AUDITORIA DE BACKEND CONCLUÍDA"
