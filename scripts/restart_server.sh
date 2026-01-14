#!/bin/bash

# Script para reiniciar o servidor Django com limpeza de cache

echo "🔄 Limpando cache do Django..."

cd /Users/jairneto/Desktop/ouvy_saas/ouvy_saas

# Remover arquivos de cache Python
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo "✅ Cache limpo"
echo ""
echo "🚀 Reiniciando servidor..."
echo ""

/Users/jairneto/Desktop/ouvy_saas/venv/bin/python manage.py runserver
