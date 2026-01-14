#!/usr/bin/env python
"""
Script de teste para validar o sistema de protocolo de rastreamento.
Testa:
1. Criação de feedback com geração automática de protocolo
2. Consulta pública usando o código do protocolo
3. Tratamento de erros para protocolos inválidos

⚠️ IMPORTANTE: Este teste requer que o servidor esteja rodando E que você tenha
configurado o /etc/hosts conforme documentado em README_MULTITENANCY.md:

    127.0.0.1  empresaa.local
    127.0.0.1  empresab.local

Alternativamente, use localhost com port 8000 e defina TENANT_ID manualmente.
"""

import requests
import json

# Usar subdomínio empresaa.local (requer configuração no /etc/hosts)
BASE_URL = "http://empresaa.local:8000"

print("=" * 80)
print("🎫 TESTE DO SISTEMA DE PROTOCOLO DE RASTREAMENTO")
print("=" * 80)

# 1. Criar um novo feedback
print("\n1️⃣ Criando novo feedback...")
response_create = requests.post(
    f"{BASE_URL}/api/feedbacks/",
    json={
        "tipo": "denuncia",
        "titulo": "Teste de Protocolo Automático",
        "descricao": "Verificando se o protocolo é gerado corretamente.",
        "anonimo": False,
        "email_contato": "teste@exemplo.com"
    }
)

if response_create.status_code == 201:
    feedback_data = response_create.json()
    protocolo = feedback_data.get('protocolo')
    
    print(f"   ✅ Feedback criado com sucesso!")
    print(f"   📋 ID: {feedback_data.get('id')}")
    print(f"   🎫 Protocolo: {protocolo}")
    print(f"   📊 Status: {feedback_data.get('status')}")
    print(f"   📅 Criado em: {feedback_data.get('data_criacao')}")
    
    # 2. Consultar usando o protocolo (endpoint público)
    print(f"\n2️⃣ Consultando protocolo {protocolo}...")
    response_consulta = requests.get(
        f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
        params={"codigo": protocolo}
    )
    
    if response_consulta.status_code == 200:
        consulta_data = response_consulta.json()
        print(f"   ✅ Consulta bem-sucedida!")
        print(f"   📋 Dados retornados:")
        print(json.dumps(consulta_data, indent=4, ensure_ascii=False))
    else:
        print(f"   ❌ Erro na consulta: {response_consulta.status_code}")
        print(f"   {response_consulta.text}")
    
    # 3. Testar consulta com protocolo inválido
    print(f"\n3️⃣ Testando protocolo inválido...")
    response_invalido = requests.get(
        f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
        params={"codigo": "OUVY-ZZZZ-9999"}
    )
    
    if response_invalido.status_code == 404:
        print(f"   ✅ Erro 404 retornado corretamente para protocolo inexistente")
        print(f"   📋 Resposta: {json.dumps(response_invalido.json(), indent=4, ensure_ascii=False)}")
    else:
        print(f"   ⚠️ Status inesperado: {response_invalido.status_code}")
    
    # 4. Testar sem parâmetro codigo
    print(f"\n4️⃣ Testando requisição sem código...")
    response_sem_codigo = requests.get(
        f"{BASE_URL}/api/feedbacks/consultar-protocolo/"
    )
    
    if response_sem_codigo.status_code == 400:
        print(f"   ✅ Erro 400 retornado corretamente para requisição sem código")
        print(f"   📋 Resposta: {json.dumps(response_sem_codigo.json(), indent=4, ensure_ascii=False)}")
    else:
        print(f"   ⚠️ Status inesperado: {response_sem_codigo.status_code}")
    
    # 5. Listar feedbacks e verificar se todos têm protocolo
    print(f"\n5️⃣ Listando feedbacks do tenant...")
    response_list = requests.get(f"{BASE_URL}/api/feedbacks/")
    
    if response_list.status_code == 200:
        feedbacks = response_list.json()
        print(f"   ✅ Total de feedbacks: {len(feedbacks)}")
        
        sem_protocolo = [f for f in feedbacks if not f.get('protocolo')]
        if sem_protocolo:
            print(f"   ⚠️ {len(sem_protocolo)} feedbacks sem protocolo encontrados!")
        else:
            print(f"   ✅ Todos os feedbacks possuem protocolo!")
            
        # Mostrar últimos 3 protocolos
        print(f"\n   📋 Últimos protocolos gerados:")
        for fb in feedbacks[:3]:
            print(f"      • {fb.get('protocolo')} - {fb.get('titulo')[:40]}...")

else:
    print(f"   ❌ Erro ao criar feedback: {response_create.status_code}")
    print(f"   {response_create.text}")

print("\n" + "=" * 80)
print("🎯 TESTE CONCLUÍDO")
print("=" * 80)
