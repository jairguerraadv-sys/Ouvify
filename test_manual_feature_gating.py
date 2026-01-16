#!/usr/bin/env python
"""
Script de teste manual para validar feature gating de anexos e notas internas.
Executa testes diretos nos endpoints sem depender de testes automatizados.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/jairneto/Desktop/ouvy_saas/ouvy_saas')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.feedbacks.constants import FeedbackStatus
import json

def criar_ambiente_teste():
    """Cria tenants e usuários para teste."""
    print("\n🔧 CONFIGURANDO AMBIENTE DE TESTE\n")
    
    # Tenant FREE
    tenant_free, _ = Client.objects.get_or_create(
        subdominio='test-free',
        defaults={
            'nome': 'Tenant FREE',
            'email': 'free@test.com',
            'plano': 'free',
            'ativo': True
        }
    )
    
    # Tenant PRO
    tenant_pro, _ = Client.objects.get_or_create(
        subdominio='test-pro',
        defaults={
            'nome': 'Tenant PRO',
            'email': 'pro@test.com',
            'plano': 'pro',
            'ativo': True
        }
    )
    
    # Tenant STARTER
    tenant_starter, _ = Client.objects.get_or_create(
        subdominio='test-starter',
        defaults={
            'nome': 'Tenant STARTER',
            'email': 'starter@test.com',
            'plano': 'starter',
            'ativo': True
        }
    )
    
    # Usuários
    user_free, _ = User.objects.get_or_create(
        username='user_free',
        defaults={'email': 'user_free@test.com'}
    )
    user_free.set_password('test123')
    user_free.save()
    
    user_pro, _ = User.objects.get_or_create(
        username='user_pro',
        defaults={'email': 'user_pro@test.com'}
    )
    user_pro.set_password('test123')
    user_pro.save()
    
    user_starter, _ = User.objects.get_or_create(
        username='user_starter',
        defaults={'email': 'user_starter@test.com'}
    )
    user_starter.set_password('test123')
    user_starter.save()
    
    # Tokens
    token_free, _ = Token.objects.get_or_create(user=user_free)
    token_pro, _ = Token.objects.get_or_create(user=user_pro)
    token_starter, _ = Token.objects.get_or_create(user=user_starter)
    
    # Feedbacks
    feedback_free, _ = Feedback.objects.get_or_create(
        client=tenant_free,
        titulo='Feedback FREE',
        defaults={
            'descricao': 'Teste',
            'tipo': 'sugestao',
            'status': FeedbackStatus.PENDENTE,
            'categoria': 'geral'
        }
    )
    
    feedback_pro, _ = Feedback.objects.get_or_create(
        client=tenant_pro,
        titulo='Feedback PRO',
        defaults={
            'descricao': 'Teste',
            'tipo': 'sugestao',
            'status': FeedbackStatus.PENDENTE,
            'categoria': 'geral'
        }
    )
    
    feedback_starter, _ = Feedback.objects.get_or_create(
        client=tenant_starter,
        titulo='Feedback STARTER',
        defaults={
            'descricao': 'Teste',
            'tipo': 'sugestao',
            'status': FeedbackStatus.PENDENTE,
            'categoria': 'geral'
        }
    )
    
    print(f"✅ Tenant FREE: {tenant_free.subdominio} (plano: {tenant_free.plano})")
    print(f"✅ Tenant PRO: {tenant_pro.subdominio} (plano: {tenant_pro.plano})")
    print(f"✅ Tenant STARTER: {tenant_starter.subdominio} (plano: {tenant_starter.plano})")
    print(f"✅ Tokens gerados")
    
    return {
        'tenant_free': tenant_free,
        'tenant_pro': tenant_pro,
        'tenant_starter': tenant_starter,
        'token_free': token_free.key,
        'token_pro': token_pro.key,
        'token_starter': token_starter.key,
        'feedback_free': feedback_free,
        'feedback_pro': feedback_pro,
        'feedback_starter': feedback_starter,
    }

def testar_nota_interna(env):
    """Testa criação de nota interna com diferentes planos."""
    print("\n" + "="*80)
    print("🔒 TESTE 1: NOTAS INTERNAS")
    print("="*80 + "\n")
    
    client = APIClient()
    
    # Teste 1: FREE (deve bloquear)
    print("📋 Teste 1.1: Plano FREE tentando criar NOTA_INTERNA")
    client.credentials(HTTP_AUTHORIZATION=f'Token {env["token_free"]}')
    response = client.post(
        f'/api/feedbacks/{env["feedback_free"].id}/adicionar-interacao/',
        {
            'mensagem': 'Esta é uma nota interna de teste',
            'tipo': 'NOTA_INTERNA'
        },
        format='json'
    )
    
    if response.status_code == 403:
        print(f"✅ PASSOU: Status 403 (bloqueado)")
        print(f"   Mensagem: {response.data.get('detail', 'N/A')}")
    else:
        print(f"❌ FALHOU: Status {response.status_code} (esperado 403)")
        print(f"   Response: {response.data}")
    
    # Teste 2: STARTER (deve permitir)
    print("\n📋 Teste 1.2: Plano STARTER tentando criar NOTA_INTERNA")
    client.credentials(HTTP_AUTHORIZATION=f'Token {env["token_starter"]}')
    response = client.post(
        f'/api/feedbacks/{env["feedback_starter"].id}/adicionar-interacao/',
        {
            'mensagem': 'Esta é uma nota interna de teste',
            'tipo': 'NOTA_INTERNA'
        },
        format='json'
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ PASSOU: Status {response.status_code} (permitido)")
    else:
        print(f"❌ FALHOU: Status {response.status_code} (esperado 200/201)")
        print(f"   Response: {response.data}")
    
    # Teste 3: PRO (deve permitir)
    print("\n📋 Teste 1.3: Plano PRO tentando criar NOTA_INTERNA")
    client.credentials(HTTP_AUTHORIZATION=f'Token {env["token_pro"]}')
    response = client.post(
        f'/api/feedbacks/{env["feedback_pro"].id}/adicionar-interacao/',
        {
            'mensagem': 'Esta é uma nota interna de teste',
            'tipo': 'NOTA_INTERNA'
        },
        format='json'
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ PASSOU: Status {response.status_code} (permitido)")
    else:
        print(f"❌ FALHOU: Status {response.status_code} (esperado 200/201)")
        print(f"   Response: {response.data}")

def testar_upload_arquivo(env):
    """Testa upload de arquivo com diferentes planos."""
    print("\n" + "="*80)
    print("📎 TESTE 2: UPLOAD DE ARQUIVOS")
    print("="*80 + "\n")
    
    client = APIClient()
    
    # Criar arquivo temporário
    import tempfile
    import io
    
    # Teste 1: FREE (deve bloquear)
    print("📋 Teste 2.1: Plano FREE tentando fazer upload")
    client.credentials(HTTP_AUTHORIZATION=f'Token {env["token_free"]}')
    
    file_content = b'Teste de arquivo PDF fake'
    file = io.BytesIO(file_content)
    file.name = 'test.pdf'
    
    response = client.post(
        f'/api/feedbacks/{env["feedback_free"].id}/upload-arquivo/',
        {
            'arquivo': file,
            'interno': False
        },
        format='multipart'
    )
    
    if response.status_code == 403:
        print(f"✅ PASSOU: Status 403 (bloqueado)")
        print(f"   Mensagem: {response.data.get('detail', 'N/A')}")
    else:
        print(f"❌ FALHOU: Status {response.status_code} (esperado 403)")
        print(f"   Response: {response.data}")
    
    # Teste 2: PRO (deve permitir)
    print("\n📋 Teste 2.2: Plano PRO tentando fazer upload")
    client.credentials(HTTP_AUTHORIZATION=f'Token {env["token_pro"]}')
    
    file_content = b'Teste de arquivo PDF fake para PRO'
    file = io.BytesIO(file_content)
    file.name = 'test_pro.pdf'
    
    response = client.post(
        f'/api/feedbacks/{env["feedback_pro"].id}/upload-arquivo/',
        {
            'arquivo': file,
            'interno': False
        },
        format='multipart'
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ PASSOU: Status {response.status_code} (permitido)")
    else:
        print(f"❌ FALHOU: Status {response.status_code} (esperado 200/201)")
        print(f"   Response: {response.data}")

def testar_serializer_publico(env):
    """Testa se serializer público filtra NOTA_INTERNA."""
    print("\n" + "="*80)
    print("🔍 TESTE 3: SERIALIZER PÚBLICO (Vazamento de NOTA_INTERNA)")
    print("="*80 + "\n")
    
    from apps.feedbacks.models import FeedbackInteracao
    from apps.feedbacks.constants import InteracaoTipo
    
    # Criar uma NOTA_INTERNA no feedback PRO
    nota_interna = FeedbackInteracao.objects.create(
        feedback=env['feedback_pro'],
        tipo=InteracaoTipo.NOTA_INTERNA,
        mensagem='ESTA É UMA NOTA SECRETA QUE NÃO DEVE VAZAR',
        autor=User.objects.get(username='user_pro')
    )
    
    print(f"✅ Nota interna criada: ID {nota_interna.id}")
    
    # Tentar acessar via consulta pública (sem autenticação)
    client = APIClient()
    response = client.get(
        f'/api/feedbacks/consultar-protocolo/?codigo={env["feedback_pro"].protocolo}'
    )
    
    print(f"\n📋 Teste 3.1: Consulta pública do protocolo {env['feedback_pro'].protocolo}")
    
    if response.status_code == 200:
        data = response.data
        interacoes = data.get('interacoes', [])
        
        # Verificar se NOTA_INTERNA aparece
        tipos_retornados = [i.get('tipo') for i in interacoes]
        
        if 'NOTA_INTERNA' in tipos_retornados:
            print(f"❌ FALHOU: NOTA_INTERNA foi vazada para consulta pública!")
            print(f"   Tipos retornados: {tipos_retornados}")
            print(f"   VULNERABILIDADE DE SEGURANÇA CRÍTICA!")
        else:
            print(f"✅ PASSOU: NOTA_INTERNA não aparece na consulta pública")
            print(f"   Tipos retornados: {tipos_retornados}")
        
        # Testar arquivos internos também
        print(f"\n📋 Teste 3.2: Verificar filtro de arquivos internos")
        arquivos = data.get('arquivos', [])
        arquivos_internos = [a for a in arquivos if a.get('interno', False)]
        
        if arquivos_internos:
            print(f"❌ FALHOU: Arquivos internos vazados: {len(arquivos_internos)}")
        else:
            print(f"✅ PASSOU: Nenhum arquivo interno vazado")
    else:
        print(f"⚠️  Status {response.status_code}: {response.data}")

def main():
    """Executa todos os testes."""
    print("\n" + "="*80)
    print("🧪 TESTE MANUAL DE FEATURE GATING - ANEXOS E NOTAS INTERNAS")
    print("="*80)
    
    try:
        env = criar_ambiente_teste()
        testar_nota_interna(env)
        testar_upload_arquivo(env)
        testar_serializer_publico(env)
        
        print("\n" + "="*80)
        print("✅ TESTES CONCLUÍDOS")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERRO DURANTE TESTES: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
