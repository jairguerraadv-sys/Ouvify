#!/bin/bash
set -e

echo "🚀 Starting Ouvy SaaS Backend..."
echo "📁 Working directory: $(pwd)"
echo "📁 Listing /app:"
ls -la /app/
echo "📁 Checking apps/backend:"
ls -la /app/apps/backend/ 2>/dev/null || echo "apps/backend not found!"

cd /app/apps/backend

echo "🔄 Running migrations..."
/opt/venv/bin/python manage.py migrate --noinput

echo "📦 Collecting static files..."
/opt/venv/bin/python manage.py collectstatic --noinput

echo "🟢 Starting Gunicorn..."
exec /opt/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 3 --timeout 120
