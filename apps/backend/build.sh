#!/usr/bin/env bash
# Build script for Render.com deployment
# Exit on error
set -o errexit

echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements/prod.txt

echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

echo "🗃️ Running migrations..."
python manage.py migrate --no-input

echo "✅ Build complete!"
