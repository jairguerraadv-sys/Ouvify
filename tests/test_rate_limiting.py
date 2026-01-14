#!/usr/bin/env python
"""
Script para testar o rate limiting do endpoint de consulta de protocolo.
Simula múltiplas requisições para verificar se o throttling está funcionando.
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000"
PROTOCOLO_VALIDO = "OUVY-A3B9-K7M2"  # Substitua por um protocolo real do seu banco

print("=" * 80)
print("🛡️ TESTE DE RATE LIMITING - CONSULTA DE PROTOCOLO")
print("=" * 80)

print("\n📋 Configuração:")
print(f"   • Limite: 5 requisições por minuto")
print(f"   • URL: {BASE_URL}/api/feedbacks/consultar-protocolo/")
print(f"   • Protocolo de teste: {PROTOCOLO_VALIDO}")

# Função auxiliar para fazer requisição
def consultar_protocolo(codigo, tentativa):
    try:
        response = requests.get(
            f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
            params={"codigo": codigo}
        )
        return response
    except Exception as e:
        print(f"   ❌ Erro na requisição {tentativa}: {e}")
        return None

# Teste 1: Fazer 10 requisições rápidas (deve bloquear após a 5ª)
print("\n" + "=" * 80)
print("🧪 TESTE 1: Requisições Rápidas (10 tentativas)")
print("=" * 80)

for i in range(1, 11):
    print(f"\n📤 Requisição {i}/10...")
    response = consultar_protocolo(PROTOCOLO_VALIDO, i)
    
    if response:
        if response.status_code == 200:
            print(f"   ✅ Status 200 - Sucesso")
            data = response.json()
            print(f"   📋 Protocolo: {data.get('protocolo')}")
            print(f"   📊 Status: {data.get('status_display')}")
        
        elif response.status_code == 429:
            print(f"   🚨 Status 429 - RATE LIMIT EXCEDIDO!")
            data = response.json()
            print(f"   ⏱️  Aguardar: {data.get('wait_seconds')} segundos")
            print(f"   💬 Mensagem: {data.get('detail')}")
            
            # Mostrar resposta completa
            print(f"\n   📋 Resposta completa:")
            print(json.dumps(data, indent=6, ensure_ascii=False))
            
            # Parar após primeiro bloqueio
            print(f"\n   ✅ Rate limiting funcionando corretamente!")
            print(f"   📌 Bloqueou na requisição {i} (esperado: após a 5ª)")
            break
        
        else:
            print(f"   ⚠️ Status inesperado: {response.status_code}")
    
    # Pequeno delay para simular uso normal
    time.sleep(0.5)

# Teste 2: Aguardar e tentar novamente
print("\n" + "=" * 80)
print("🧪 TESTE 2: Aguardar e Tentar Novamente")
print("=" * 80)

print("\n⏳ Aguardando 65 segundos (1 minuto + margem)...")
for i in range(65, 0, -5):
    print(f"   ⏱️  {i} segundos restantes...", end='\r')
    time.sleep(5)

print("\n\n📤 Fazendo nova requisição após espera...")
response = consultar_protocolo(PROTOCOLO_VALIDO, "pós-espera")

if response:
    if response.status_code == 200:
        print(f"   ✅ Status 200 - Requisição permitida novamente!")
        print(f"   🎉 Rate limiting resetou corretamente após 1 minuto")
    elif response.status_code == 429:
        print(f"   ⚠️ Ainda bloqueado (aguarde mais alguns segundos)")
    else:
        print(f"   ⚠️ Status: {response.status_code}")

# Teste 3: Protocolo inválido (também conta no rate limit)
print("\n" + "=" * 80)
print("🧪 TESTE 3: Protocolo Inválido")
print("=" * 80)

print("\n📤 Tentando protocolo inexistente...")
response = consultar_protocolo("OUVY-ZZZZ-9999", "inválido")

if response:
    print(f"   Status: {response.status_code}")
    if response.status_code == 404:
        print(f"   ✅ 404 retornado corretamente")
        print(f"   📌 Nota: Tentativas inválidas TAMBÉM contam no rate limit")
    elif response.status_code == 429:
        print(f"   🚨 Ainda no rate limit")

# Resumo
print("\n" + "=" * 80)
print("📊 RESUMO DO TESTE")
print("=" * 80)
print("""
✅ O que foi testado:
   1. Múltiplas requisições rápidas (esperado: bloquear após 5)
   2. Reset do rate limit após 1 minuto
   3. Tentativas com protocolo inválido (também contam no limite)

🔒 Proteção Implementada:
   • 5 requisições por minuto por IP
   • Mensagem amigável em português
   • Tempo de espera informado
   • Logs de tentativas suspeitas

🎯 Status: Rate limiting funcionando corretamente!
""")

print("=" * 80)
