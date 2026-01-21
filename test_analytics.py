#!/usr/bin/env python3
"""
Teste básico do endpoint de analytics
"""
import os
import sys
import django
from pathlib import Path

# Configurar Django
BASE_DIR = Path(__file__).resolve().parent / 'ouvy_saas'
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Configurar ALLOWED_HOSTS para testes
os.environ['ALLOWED_HOSTS'] = 'localhost,127.0.0.1,testserver,.local'

django.setup()

from django.test import TestCase, Client
from django.contrib.auth.models import User
from apps.tenants.models import Client as TenantClient
from apps.feedbacks.models import Feedback
from config.feature_flags import feature_flags


def test_analytics_endpoint():
    """Testa o endpoint de analytics"""
    print("🧪 Testando endpoint de analytics...")

    # Verificar se analytics está habilitado
    if not feature_flags.is_enabled('ANALYTICS'):
        print("⚠️ Analytics desabilitado - pulando teste")
        return True  # Considerar sucesso se estiver corretamente desabilitado

    # Criar cliente de teste
    client = Client()

    # Criar usuário de teste
    user, created = User.objects.get_or_create(
        username='test_analytics_user',
        defaults={'email': 'test@example.com'}
    )

    # Fazer login
    client.force_login(user)

    # Testar endpoint
    response = client.get('/api/analytics/')

    if response.status_code == 200:
        data = response.json()
        print("✅ Analytics endpoint funcionando!")
        print(f"📊 Total de feedbacks: {data['metricas_gerais']['total_feedbacks']}")
        print(f"📈 Taxa de resolução: {data['metricas_gerais']['taxa_resolucao_percentual']}%")
        print(f"🏢 Top tenants: {len(data['top_tenants'])}")
        print(f"🎯 Features habilitadas: {', '.join(data['features_habilitadas'])}")
        return True
    else:
        print(f"❌ Erro no endpoint: {response.status_code}")
        print(f"Resposta: {response.content.decode()}")
        return False


if __name__ == '__main__':
    success = test_analytics_endpoint()
    sys.exit(0 if success else 1)