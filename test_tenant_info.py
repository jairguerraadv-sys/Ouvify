import requests
import json

print("=" * 80)
print("🔍 TESTE DO ENDPOINT - Informações do Tenant")
print("=" * 80)

# Testar Empresa A
print("\n1️⃣ Testando EMPRESA A (empresaA.local)...")
try:
    response_a = requests.get("http://empresaa.local:8000/api/tenant-info/", timeout=5)
    print(f"   Status: {response_a.status_code}")
    
    if response_a.status_code == 200:
        data = response_a.json()
        print(f"   ✅ Dados recebidos:")
        print(f"      Nome: {data.get('nome')}")
        print(f"      Subdomínio: {data.get('subdominio')}")
        print(f"      Cor Primária: {data.get('cor_primaria')}")
        print(f"      Logo: {data.get('logo')}")
    else:
        print(f"   ❌ Erro: {response_a.text}")
except Exception as e:
    print(f"   ❌ Erro de conexão: {str(e)}")

# Testar Empresa B
print("\n2️⃣ Testando EMPRESA B (empresaB.local)...")
try:
    response_b = requests.get("http://empresab.local:8000/api/tenant-info/", timeout=5)
    print(f"   Status: {response_b.status_code}")
    
    if response_b.status_code == 200:
        data = response_b.json()
        print(f"   ✅ Dados recebidos:")
        print(f"      Nome: {data.get('nome')}")
        print(f"      Subdomínio: {data.get('subdominio')}")
        print(f"      Cor Primária: {data.get('cor_primaria')}")
        print(f"      Logo: {data.get('logo')}")
    else:
        print(f"   ❌ Erro: {response_b.text}")
except Exception as e:
    print(f"   ❌ Erro de conexão: {str(e)}")

# Testar domínio sem tenant (localhost)
print("\n3️⃣ Testando LOCALHOST (sem tenant)...")
try:
    response_local = requests.get("http://localhost:8000/api/tenant-info/", timeout=5)
    print(f"   Status: {response_local.status_code}")
    
    if response_local.status_code == 404:
        data = response_local.json()
        print(f"   ✅ Resposta esperada (404):")
        print(f"      Mensagem: {data.get('detail')}")
    else:
        print(f"   ⚠️ Status inesperado: {response_local.text}")
except Exception as e:
    print(f"   ❌ Erro de conexão: {str(e)}")

print("\n" + "=" * 80)
print("🎯 RESUMO:")
print("=" * 80)
print("✅ Se cada empresa retornou seus próprios dados, está perfeito!")
print("✅ O Frontend agora pode descobrir 'Quem sou eu?' automaticamente!")
print("=" * 80)
