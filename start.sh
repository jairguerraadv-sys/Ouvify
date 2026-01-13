#!/bin/bash
set -e

cd ouvy_saas

echo "🔄 Executando migrações..."
python manage.py migrate --noinput

echo "👤 Verificando superusuário..."
python ../create_superuser.py

echo "🚀 Iniciando Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
