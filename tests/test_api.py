import requests
import json

# Configuration
BASE_URL = "http://empresaa.local:8000"
ENDPOINT = f"{BASE_URL}/api/feedbacks/"

# Payload for creating a feedback
payload = {
    "tipo": "denuncia",
    "titulo": "Teste Automático via Copilot",
    "descricao": "Verificando se o backend aceita conexões corretamente.",
    "anonimo": True,
}

# Headers
headers = {
    "Content-Type": "application/json",
}

print("=" * 80)
print("🚀 TESTE DE API - Criação de Feedback")
print("=" * 80)
print(f"\n📍 URL: {ENDPOINT}")
print(f"📦 Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}\n")

try:
    # Make POST request
    response = requests.post(ENDPOINT, json=payload, headers=headers, timeout=10)
    
    # Print results
    print(f"✅ Status Code: {response.status_code}")
    print(f"\n📋 Response Headers:")
    for key, value in response.headers.items():
        print(f"   {key}: {value}")
    
    print(f"\n📄 Response Body:")
    try:
        response_json = response.json()
        print(json.dumps(response_json, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print(response.text)
    
    # Determine success
    if 200 <= response.status_code < 300:
        print(f"\n✨ Sucesso! Feedback criado com status {response.status_code}")
    else:
        print(f"\n⚠️ Erro na requisição. Status: {response.status_code}")

except requests.exceptions.ConnectionError:
    print(f"❌ Erro de conexão: Não foi possível conectar a {ENDPOINT}")
    print("   Verifique se:")
    print("   - O servidor Django está rodando")
    print("   - O domínio 'empresaa.local' está configurado em /etc/hosts")
    print("   - A porta 8000 está disponível")
except requests.exceptions.Timeout:
    print("❌ Timeout: A requisição demorou muito tempo")
except Exception as e:
    print(f"❌ Erro inesperado: {type(e).__name__}: {str(e)}")

print("\n" + "=" * 80)
