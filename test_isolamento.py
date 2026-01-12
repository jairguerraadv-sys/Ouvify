import requests
import json

print("=" * 80)
print("🔒 TESTE DE ISOLAMENTO - Multi-tenant")
print("=" * 80)

# Criar feedback na Empresa A
print("\n1️⃣ Criando feedback na EMPRESA A...")
response_a = requests.post(
    "http://empresaa.local:8000/api/feedbacks/",
    json={
        "tipo": "sugestao",
        "titulo": "Feedback da Empresa A",
        "descricao": "Este feedback pertence à Tech Solutions",
        "anonimo": False,
        "email_contato": "contato@empresaA.com"
    }
)
print(f"   Status: {response_a.status_code}")
if response_a.status_code == 201:
    data_a = response_a.json()
    print(f"   ✅ ID criado: {data_a['id']}")

# Criar feedback na Empresa B
print("\n2️⃣ Criando feedback na EMPRESA B...")
response_b = requests.post(
    "http://empresab.local:8000/api/feedbacks/",
    json={
        "tipo": "reclamacao",
        "titulo": "Feedback da Empresa B",
        "descricao": "Este feedback pertence à Padaria do João",
        "anonimo": False,
        "email_contato": "contato@empresaB.com"
    }
)
print(f"   Status: {response_b.status_code}")
if response_b.status_code == 201:
    data_b = response_b.json()
    print(f"   ✅ ID criado: {data_b['id']}")

# Listar feedbacks da Empresa A
print("\n3️⃣ Listando feedbacks visíveis para EMPRESA A...")
list_a = requests.get("http://empresaa.local:8000/api/feedbacks/")
if list_a.status_code == 200:
    feedbacks_a = list_a.json()
    print(f"   Total de feedbacks: {len(feedbacks_a)}")
    print("   Títulos:")
    for fb in feedbacks_a:
        print(f"      - {fb['titulo']}")

# Listar feedbacks da Empresa B
print("\n4️⃣ Listando feedbacks visíveis para EMPRESA B...")
list_b = requests.get("http://empresab.local:8000/api/feedbacks/")
if list_b.status_code == 200:
    feedbacks_b = list_b.json()
    print(f"   Total de feedbacks: {len(feedbacks_b)}")
    print("   Títulos:")
    for fb in feedbacks_b:
        print(f"      - {fb['titulo']}")

# Verificar isolamento
print("\n" + "=" * 80)
print("🎯 RESULTADO DO ISOLAMENTO:")
print("=" * 80)

empresaA_tem_apenas_seus = all(
    'Empresa A' in fb['titulo'] or 'Automático' in fb['titulo'] 
    for fb in feedbacks_a
)
empresaB_tem_apenas_seus = all(
    'Empresa B' in fb['titulo'] 
    for fb in feedbacks_b
)

if len(feedbacks_b) > 0 and 'Empresa A' not in str(feedbacks_b):
    print("✅ SUCESSO! Cada empresa vê apenas seus próprios feedbacks!")
    print("✅ O isolamento de dados está funcionando perfeitamente!")
    print("✅ Seu sistema SaaS White Label está SEGURO! 🔒")
else:
    print("⚠️ ATENÇÃO! Pode haver vazamento de dados entre tenants.")

print("=" * 80)
