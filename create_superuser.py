#!/usr/bin/env python
import os
import sys
import django

# Adiciona o diretório ouvy_saas ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Verificar se admin já existe
if User.objects.filter(username='admin').exists():
    print("✅ Usuário 'admin' já existe!")
    admin = User.objects.get(username='admin')
    print(f"   Email: {admin.email}")
    print(f"   Is superuser: {admin.is_superuser}")
else:
    # Criar superusuário
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@ouvy.com',
        password='Admin@Ouvy2026Temp!'
    )
    print("🎉 Superusuário criado com sucesso!")
    print(f"   Username: {admin.username}")
    print(f"   Email: {admin.email}")
    print("⚠️  IMPORTANTE: Acesse /admin/ e troque a senha imediatamente!")
    print("⚠️  IMPORTANTE: Acesse /admin/ e troque a senha imediatamente!")
