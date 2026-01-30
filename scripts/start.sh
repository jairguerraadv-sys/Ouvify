#!/bin/bash

cd ouvify_saas

echo "========== INÍCIO DO SCRIPT =========="
echo "🔄 Executando migrações..."
python manage.py migrate --noinput
echo "✅ Migrações concluídas"

echo "👤 Verificando superusuário..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ouvify.com', 'Admin@Ouvy2026Temp!')
    print('✅ Superusuário criado!')
else:
    print('✅ Superusuário já existe!')
"
echo "✅ Verificação de superusuário concluída"

echo "========== INICIANDO GUNICORN =========="
echo "PORT=${PORT}"
echo "BIND=0.0.0.0:${PORT}"
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
