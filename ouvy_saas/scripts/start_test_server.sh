#!/bin/bash

# Script para iniciar o servidor Django em modo de teste E2E
# Remove rate limiting e outras proteções que bloqueiam testes automatizados

echo "🧪 Iniciando servidor Django em MODO DE TESTE"
echo "⚠️  Rate limiting DESABILITADO"
echo "⚠️  CSRF verificação DESABILITADA"
echo ""

# Setar variável de ambiente
export TESTING=true
export DJANGO_SETTINGS_MODULE=config.settings

# Garantir que migrações estão aplicadas
echo "📦 Aplicando migrações..."
python3 manage.py migrate --noinput

# Criar superuser de teste se não existir
echo "👤 Criando usuário de teste..."
python3 manage.py shell << EOF
from django.contrib.auth import get_user_model
from apps.tenants.models import Client

User = get_user_model()

# Criar tenant de teste
if not Client.objects.filter(subdominio='test-tenant').exists():
    tenant = Client.objects.create(
        nome='Test Tenant',
        subdominio='test-tenant',
        ativo=True
    )
    print(f"✅ Tenant de teste criado: {tenant.subdominio}")

# Criar usuário de teste
if not User.objects.filter(username='testuser').exists():
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    print(f"✅ Usuário de teste criado: {user.username}")
EOF

# Iniciar servidor
echo ""
echo "🚀 Iniciando servidor em http://127.0.0.1:8000"
echo "📍 Modo: TESTING"
echo ""

python3 manage.py runserver 0.0.0.0:8000