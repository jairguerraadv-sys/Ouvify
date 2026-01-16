#!/usr/bin/env python
"""
Script para criar dados de teste via Django shell.
"""
import os
import sys
import django

sys.path.insert(0, '/Users/jairneto/Desktop/ouvy_saas/ouvy_saas')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.feedbacks.constants import FeedbackStatus

print("🔧 Criando dados de teste...\n")

# Tenant FREE
tenant_free, created = Client.objects.get_or_create(
    subdominio='test-free',
    defaults={
        'nome': 'Tenant FREE',
        'plano': 'free',
        'ativo': True
    }
)
print(f"{'✅ Criado' if created else '✓ Existente'}: Tenant FREE (ID: {tenant_free.id}, Plano: {tenant_free.plano})")

# Tenant PRO
tenant_pro, created = Client.objects.get_or_create(
    subdominio='test-pro',
    defaults={
        'nome': 'Tenant PRO',
        'plano': 'pro',
        'ativo': True
    }
)
print(f"{'✅ Criado' if created else '✓ Existente'}: Tenant PRO (ID: {tenant_pro.id}, Plano: {tenant_pro.plano})")

# Tenant STARTER
tenant_starter, created = Client.objects.get_or_create(
    subdominio='test-starter',
    defaults={
        'nome': 'Tenant STARTER',
        'plano': 'starter',
        'ativo': True
    }
)
print(f"{'✅ Criado' if created else '✓ Existente'}: Tenant STARTER (ID: {tenant_starter.id}, Plano: {tenant_starter.plano})")

# Usuários
user_free, created = User.objects.get_or_create(
    username='user_free',
    defaults={'email': 'user_free@test.com'}
)
user_free.set_password('test123')
user_free.save()
tenant_free.owner = user_free
tenant_free.save()
print(f"{'✅ Criado' if created else '✓ Existente'}: User FREE ({user_free.username})")

user_pro, created = User.objects.get_or_create(
    username='user_pro',
    defaults={'email': 'user_pro@test.com'}
)
user_pro.set_password('test123')
user_pro.save()
tenant_pro.owner = user_pro
tenant_pro.save()
print(f"{'✅ Criado' if created else '✓ Existente'}: User PRO ({user_pro.username})")

user_starter, created = User.objects.get_or_create(
    username='user_starter',
    defaults={'email': 'user_starter@test.com'}
)
user_starter.set_password('test123')
user_starter.save()
tenant_starter.owner = user_starter
tenant_starter.save()
print(f"{'✅ Criado' if created else '✓ Existente'}: User STARTER ({user_starter.username})")

# Tokens
token_free, _ = Token.objects.get_or_create(user=user_free)
token_pro, _ = Token.objects.get_or_create(user=user_pro)
token_starter, _ = Token.objects.get_or_create(user=user_starter)

print(f"\n🔑 TOKENS:")
print(f"  FREE:    {token_free.key}")
print(f"  PRO:     {token_pro.key}")
print(f"  STARTER: {token_starter.key}")

# Feedbacks
feedback_free, created = Feedback.objects.get_or_create(
    client=tenant_free,
    titulo='Feedback FREE Test',
    defaults={
        'descricao': 'Teste de feedback para tenant FREE',
        'tipo': 'sugestao',
        'status': FeedbackStatus.PENDENTE,
        'categoria': 'geral',
        'anonimo': False
    }
)
print(f"\n{'✅ Criado' if created else '✓ Existente'}: Feedback FREE")
print(f"   ID: {feedback_free.id}")
print(f"   Protocolo: {feedback_free.protocolo}")

feedback_pro, created = Feedback.objects.get_or_create(
    client=tenant_pro,
    titulo='Feedback PRO Test',
    defaults={
        'descricao': 'Teste de feedback para tenant PRO',
        'tipo': 'sugestao',
        'status': FeedbackStatus.PENDENTE,
        'categoria': 'geral',
        'anonimo': False
    }
)
print(f"{'✅ Criado' if created else '✓ Existente'}: Feedback PRO")
print(f"   ID: {feedback_pro.id}")
print(f"   Protocolo: {feedback_pro.protocolo}")

feedback_starter, created = Feedback.objects.get_or_create(
    client=tenant_starter,
    titulo='Feedback STARTER Test',
    defaults={
        'descricao': 'Teste de feedback para tenant STARTER',
        'tipo': 'sugestao',
        'status': FeedbackStatus.PENDENTE,
        'categoria': 'geral',
        'anonimo': False
    }
)
print(f"{'✅ Criado' if created else '✓ Existente'}: Feedback STARTER")
print(f"   ID: {feedback_starter.id}")
print(f"   Protocolo: {feedback_starter.protocolo}")

print("\n✅ Dados de teste criados com sucesso!")

# Salvar em arquivo para usar nos testes curl
with open('/tmp/test_data.sh', 'w') as f:
    f.write(f"""#!/bin/bash
# Dados de teste gerados automaticamente

export TOKEN_FREE="{token_free.key}"
export TOKEN_PRO="{token_pro.key}"
export TOKEN_STARTER="{token_starter.key}"

export TENANT_FREE_ID="{tenant_free.id}"
export TENANT_PRO_ID="{tenant_pro.id}"
export TENANT_STARTER_ID="{tenant_starter.id}"

export FEEDBACK_FREE_ID="{feedback_free.id}"
export FEEDBACK_PRO_ID="{feedback_pro.id}"
export FEEDBACK_STARTER_ID="{feedback_starter.id}"

export FEEDBACK_FREE_PROTOCOLO="{feedback_free.protocolo}"
export FEEDBACK_PRO_PROTOCOLO="{feedback_pro.protocolo}"
export FEEDBACK_STARTER_PROTOCOLO="{feedback_starter.protocolo}"
""")

print("\n📝 Variáveis exportadas para: /tmp/test_data.sh")
print("   Execute: source /tmp/test_data.sh")
