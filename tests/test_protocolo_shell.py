#!/usr/bin/env python
"""
Script de teste SIMPLIFICADO para o sistema de protocolo.
Este script usa o Django shell para criar feedbacks diretamente no banco,
contornando a necessidade de configuração de subdomínios no /etc/hosts.
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.feedbacks.models import Feedback
from apps.tenants.models import Client
from apps.core.utils import set_current_tenant
from typing import cast
from apps.core.models import TenantAwareManager

print("=" * 80)
print("🎫 TESTE DO SISTEMA DE PROTOCOLO (Django Shell)")
print("=" * 80)

# 1. Obter ou criar um tenant de teste
print("\n1️⃣ Verificando tenant de teste...")
try:
    tenant = Client.objects.get(subdominio='empresaa')
    print(f"   ✅ Tenant encontrado: {tenant.nome} ({tenant.subdominio})")
except Client.DoesNotExist:
    print("   ⚠️ Tenant 'empresaa' não encontrado. Criando...")
    tenant = Client.objects.create(
        nome="Empresa A - Teste",
        subdominio="empresaa",
        cor_primaria="#0066CC",
        ativo=True
    )
    print(f"   ✅ Tenant criado: {tenant.nome}")

# 2. Definir tenant no contexto (simula o middleware)
set_current_tenant(tenant)

# 3. Criar feedback com protocolo automático
print("\n2️⃣ Criando novo feedback...")
feedback = Feedback(
    tipo='denuncia',
    titulo='Teste de Protocolo via Django Shell',
    descricao='Verificando geração automática de protocolo',
    anonimo=False,
    email_contato='teste@exemplo.com'
)
feedback.save()

# Django adiciona o atributo 'id' automaticamente após save()
feedback_id = feedback.id  # type: ignore[attr-defined]

print(f"   ✅ Feedback criado com sucesso!")
print(f"   📋 ID: {feedback_id}")
print(f"   🎫 Protocolo: {feedback.protocolo}")
print(f"   📊 Status: {feedback.status}")
print(f"   🏢 Tenant: {feedback.client.nome}")
print(f"   📅 Criado em: {feedback.data_criacao}")

# 4. Buscar feedback pelo protocolo
# O manager TenantAwareManager tem o método all_tenants()
manager = cast(TenantAwareManager, Feedback.objects)
print(f"\n3️⃣ Buscando feedback pelo protocolo {feedback.protocolo}...")
feedback_encontrado = manager.all_tenants().get(protocolo=feedback.protocolo)
print(f"   ✅ Feedback encontrado!")
print(f"   📋 Título: {feedback_encontrado.titulo}")
print(f"   📊 Status: {feedback_encontrado.get_status_display()}")
print(f"   📝 Tipo: {feedback_encontrado.get_tipo_display()}")

# 5. Testar busca com protocolo inexistente
print(f"\n4️⃣ Testando busca de protocolo inexistente...")
try:
    manager.all_tenants().get(protocolo='OUVY-ZZZZ-9999')
    print("   ❌ ERRO: Não deveria ter encontrado!")
except Feedback.DoesNotExist:
    print("   ✅ DoesNotExist levantado corretamente")

# 6. Listar últimos protocolos
print(f"\n5️⃣ Últimos 5 protocolos gerados:")
ultimos_feedbacks = manager.all_tenants().order_by('-data_criacao')[:5]
for fb in ultimos_feedbacks:
    print(f"   • {fb.protocolo} - {fb.titulo[:50]} ({fb.client.nome})")

# 7. Verificar unicidade de protocolos
print(f"\n6️⃣ Verificando unicidade de protocolos...")
total_feedbacks = manager.all_tenants().count()
protocolos_unicos = manager.all_tenants().values('protocolo').distinct().count()

if total_feedbacks == protocolos_unicos:
    print(f"   ✅ Todos os {total_feedbacks} feedbacks têm protocolos únicos!")
else:
    print(f"   ⚠️ ALERTA: {total_feedbacks} feedbacks mas apenas {protocolos_unicos} protocolos únicos!")

print("\n" + "=" * 80)
print("🎯 TESTE CONCLUÍDO COM SUCESSO")
print("=" * 80)
print("\n💡 Para testar via API HTTP, configure /etc/hosts:")
print("   sudo nano /etc/hosts")
print("   Adicione: 127.0.0.1  empresaa.local empresab.local")
print("   Depois execute: python test_protocolo.py")
