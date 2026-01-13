#!/bin/bash

cd ouvy_saas

echo "🔄 Executando migrações..."
python manage.py migrate --noinput

echo "👤 Verificando superusuário..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ouvy.com', 'Admin@Ouvy2026Temp!')
    print('✅ Superusuário criado!')
else:
    print('✅ Superusuário já existe!')
"

echo "🚀 Iniciando Gunicorn no PORT=${PORT}..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
