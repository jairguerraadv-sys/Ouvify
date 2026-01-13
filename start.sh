#!/bin/bash
set -e

cd ouvy_saas

echo "🔄 Executando migrações..."
python manage.py migrate --noinput

echo "👤 Verificando superusuário..."
python manage.py shell <<'PYEOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ouvy.com', 'Admin@Ouvy2026Temp!')
    print("✅ Superusuário criado!")
else:
    print("✅ Superusuário já existe!")
PYEOF

echo "🚀 Iniciando Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
