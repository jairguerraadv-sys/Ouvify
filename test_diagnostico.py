"""
Script para verificar o estado atual dos feedbacks no banco de dados
e diagnosticar o problema de isolamento.
"""
import os
import sys
import django

# Configurar Django
sys.path.insert(0, '/Users/jairneto/Desktop/ouvy_saas/ouvy_saas')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.core.utils import set_current_tenant, clear_current_tenant

print("=" * 80)
print("🔍 DIAGNÓSTICO DO BANCO DE DADOS")
print("=" * 80)

# 1. Verificar empresas
print("\n1️⃣ Empresas no banco de dados:")
empresas = Client.objects.all()
for emp in empresas:
    print(f"   - ID: {emp.id}, Nome: {emp.nome}, Subdomínio: {emp.subdominio}")

# 2. Verificar todos os feedbacks (sem filtro)
print("\n2️⃣ Todos os feedbacks no banco (SEM filtro de tenant):")
all_feedbacks = Feedback.objects.all_tenants()  # Método especial que pula o filtro
print(f"   Total: {all_feedbacks.count()}")
for fb in all_feedbacks:
    print(f"   - ID: {fb.id}, Client ID: {fb.client_id}, Título: {fb.titulo}")

# 3. Testar filtro com contexto da Empresa A
print("\n3️⃣ Testando filtro COM contexto da Empresa A:")
try:
    empresa_a = Client.objects.get(subdominio__iexact='empresaA')
    set_current_tenant(empresa_a)
    feedbacks_a = Feedback.objects.all()
    print(f"   Tenant ativo: {empresa_a.nome} (ID: {empresa_a.id})")
    print(f"   Feedbacks retornados: {feedbacks_a.count()}")
    for fb in feedbacks_a:
        print(f"   - ID: {fb.id}, Título: {fb.titulo}")
    clear_current_tenant()
except Client.DoesNotExist:
    print("   ❌ Empresa A não encontrada!")

# 4. Testar filtro com contexto da Empresa B
print("\n4️⃣ Testando filtro COM contexto da Empresa B:")
try:
    empresa_b = Client.objects.get(subdominio__iexact='empresaB')
    set_current_tenant(empresa_b)
    feedbacks_b = Feedback.objects.all()
    print(f"   Tenant ativo: {empresa_b.nome} (ID: {empresa_b.id})")
    print(f"   Feedbacks retornados: {feedbacks_b.count()}")
    for fb in feedbacks_b:
        print(f"   - ID: {fb.id}, Título: {fb.titulo}")
    clear_current_tenant()
except Client.DoesNotExist:
    print("   ❌ Empresa B não encontrada!")

# 5. Verificar contexto durante requisição GET
print("\n5️⃣ Simulando requisição GET:")
print("   Quando a API recebe uma requisição, o middleware deve:")
print("   - Detectar o subdomínio")
print("   - Buscar o Client")
print("   - Chamar set_current_tenant()")
print("   - O ViewSet usa Feedback.objects.all() que aplica o filtro automaticamente")

print("\n" + "=" * 80)
print("🎯 CONCLUSÃO:")
print("=" * 80)
print("Se houver feedbacks no passo 2 mas não nos passos 3 e 4,")
print("o problema está no filtro ou no contexto do tenant.")
print("=" * 80)
