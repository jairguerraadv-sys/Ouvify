#!/bin/bash
set -e

cd ouvy_saas

echo "🔄 Executando migrações..."
python manage.py migrate --noinput

echo "👤 Verificando superusuário..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ouvy.com', 'Admin@Ouvy2026Temp!')
    print("✅ Superusuário 'admin' criado! Senha temporária: Admin@Ouvy2026Temp!")
    print("⚠️  TROQUE A SENHA em /admin/ imediatamente!")
else:
    print("✅ Superusuário 'admin' já existe")
EOF

echo "🚀 Iniciando Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
