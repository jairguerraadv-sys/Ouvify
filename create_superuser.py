#!/usr/bin/env python
"""
Script para criar superusuário no Railway via manage.py shell
Execute no Railway Dashboard > Settings > Run Command:

cd ouvy_saas && python manage.py shell < ../create_superuser.py

Ou copie o conteúdo abaixo e execute via shell interativo.
"""

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
        password='Admin@Ouvy2026!'  # ⚠️ TROQUE ESTA SENHA DEPOIS!
    )
    print("🎉 Superusuário criado com sucesso!")
    print(f"   Username: {admin.username}")
    print(f"   Email: {admin.email}")
    print("⚠️  IMPORTANTE: Acesse /admin/ e troque a senha imediatamente!")
