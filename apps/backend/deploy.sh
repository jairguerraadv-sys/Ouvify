#!/bin/bash

# Deploy script for Railway
# This script runs migrations and collects static files before starting the server

set -e

echo "🚀 Starting Ouvify Backend Deploy..."

# Run database migrations
echo "📊 Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start Gunicorn server
echo "✅ Starting Gunicorn server..."
exec gunicorn config.wsgi --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
