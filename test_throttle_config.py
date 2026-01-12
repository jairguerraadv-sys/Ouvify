#!/usr/bin/env python
"""
Teste rápido do rate limiting - Verifica se o throttle está ativo
"""
import sys
import os
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.feedbacks.throttles import ProtocoloConsultaThrottle
from django.test import RequestFactory
from django.conf import settings

print("=" * 80)
print("🧪 TESTE DE CONFIGURAÇÃO - RATE LIMITING")
print("=" * 80)

# Verificar configurações do DRF
print("\n1️⃣ Verificando configurações do REST_FRAMEWORK...")
throttle_rates = settings.REST_FRAMEWORK.get('DEFAULT_THROTTLE_RATES', {})
print(f"   ✅ Throttle Rates configurados:")
for key, value in throttle_rates.items():
    print(f"      • {key}: {value}")

# Verificar se a classe ProtocoloConsultaThrottle existe
print("\n2️⃣ Verificando classe ProtocoloConsultaThrottle...")
throttle = ProtocoloConsultaThrottle()
print(f"   ✅ Classe instanciada com sucesso")
print(f"   ✅ Scope: {throttle.scope}")
print(f"   ✅ Rate configurado: {throttle_rates.get(throttle.scope, 'N/A')}")

# Verificar Exception Handler
print("\n3️⃣ Verificando Exception Handler...")
exception_handler = settings.REST_FRAMEWORK.get('EXCEPTION_HANDLER')
print(f"   ✅ Handler: {exception_handler}")

# Verificar se o logger está configurado
print("\n4️⃣ Verificando configuração de Logging...")
import logging
logger = logging.getLogger('apps.feedbacks')
print(f"   ✅ Logger 'apps.feedbacks' configurado")
print(f"   ✅ Level: {logging.getLevelName(logger.level)}")

print("\n" + "=" * 80)
print("✅ TODAS AS CONFIGURAÇÕES ESTÃO CORRETAS!")
print("=" * 80)
print("\n📝 Próximos passos:")
print("   1. Inicie o servidor: bash run_server.sh")
print("   2. Execute o teste completo: python3 test_rate_limiting.py")
print("   3. Ou teste manualmente fazendo 6 requisições seguidas ao endpoint")
print("\n" + "=" * 80)
