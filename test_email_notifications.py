"""
Script de Teste: Sistema de Notificações por Email
==================================================

Testa o envio automático de emails quando feedbacks são criados.

Uso:
    python test_email_notifications.py
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenants.models import Client
from django.contrib.auth import get_user_model
from apps.feedbacks.models import Feedback, FeedbackInteracao

User = get_user_model()
from apps.feedbacks.signals import (
    notificacoes_estao_ativas,
    desativar_notificacoes_temporariamente,
    reativar_notificacoes
)


def print_header(title):
    """Imprime cabeçalho formatado."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def test_notification_status():
    """Testa se notificações estão ativas."""
    print_header("1. Verificando Status das Notificações")
    
    if notificacoes_estao_ativas():
        print("✅ Notificações estão ATIVAS")
    else:
        print("🔕 Notificações estão DESATIVADAS")
        print("   Reativando...")
        reativar_notificacoes()
        print("✅ Notificações reativadas")


def test_create_feedback():
    """Testa criação de feedback com notificação."""
    print_header("2. Testando Notificação de Novo Feedback")
    
    # Buscar tenant com owner
    tenant = Client.objects.filter(owner__isnull=False).first()
    
    if not tenant:
        print("❌ Nenhum tenant com owner encontrado")
        print("   Criando tenant de teste...")
        
        # Criar usuário owner
        owner = User.objects.create_user(
            email="teste@ouvy.com.br",
            username="teste_owner",
            first_name="Teste",
            password="senha123"
        )
        
        # Criar tenant
        tenant = Client.objects.create(
            nome="Empresa Teste",
            subdominio="teste",
            owner=owner
        )
        print(f"✅ Tenant criado: {tenant.nome}")
    
    print(f"📧 Owner: {tenant.owner.email}")
    print(f"🏢 Tenant: {tenant.nome}")
    
    # Criar feedback (deve disparar notificação)
    feedback = Feedback.objects.create(
        client=tenant,
        titulo="Teste de Notificação por Email",
        descricao="Este é um feedback de teste para verificar se o email é enviado automaticamente.",
        tipo="SUGESTAO"
    )
    
    print(f"\n✅ Feedback criado: {feedback.protocolo}")
    print(f"📬 Email deve ter sido enviado para: {tenant.owner.email}")
    print(f"   Tipo: {feedback.get_tipo_display()}")
    print(f"   Título: {feedback.titulo}")
    
    return feedback


def test_status_change(feedback):
    """Testa notificação de mudança de status."""
    print_header("3. Testando Notificação de Mudança de Status")
    
    print(f"📋 Feedback: {feedback.protocolo}")
    print(f"   Status atual: {feedback.get_status_display()}")
    
    # Alterar status
    feedback.status = "EM_ANALISE"
    feedback.save()
    
    print(f"✅ Status alterado para: {feedback.get_status_display()}")
    print(f"📬 Email de mudança de status deve ter sido enviado")
    
    # Testar rate limiting
    print("\n⏱️  Testando rate limiting...")
    print("   (Alterando status novamente em menos de 5 minutos)")
    
    feedback.status = "RESOLVIDO"
    feedback.save()
    
    print(f"✅ Status alterado para: {feedback.get_status_display()}")
    print(f"🚫 Email NÃO deve ter sido enviado (rate limit ativo)")


def test_disable_notifications():
    """Testa desativação temporária de notificações."""
    print_header("4. Testando Desativação Temporária")
    
    # Desativar por 10 segundos
    print("🔕 Desativando notificações por 10 segundos...")
    desativar_notificacoes_temporariamente(10)
    
    if not notificacoes_estao_ativas():
        print("✅ Notificações desativadas com sucesso")
    else:
        print("❌ Erro ao desativar notificações")
    
    # Criar feedback sem notificação
    tenant = Client.objects.filter(owner__isnull=False).first()
    feedback = Feedback.objects.create(
        client=tenant,
        titulo="Feedback sem notificação",
        descricao="Este feedback não deve gerar email",
        tipo="BUG"
    )
    
    print(f"✅ Feedback criado: {feedback.protocolo}")
    print(f"🚫 Email NÃO deve ter sido enviado (notificações desativadas)")
    
    # Reativar
    print("\n🔔 Reativando notificações...")
    reativar_notificacoes()
    
    if notificacoes_estao_ativas():
        print("✅ Notificações reativadas com sucesso")


def check_email_config():
    """Verifica configuração de email."""
    print_header("0. Verificando Configuração de Email")
    
    from django.conf import settings
    
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"BASE_URL: {settings.BASE_URL}")
    
    # Verificar se está em modo console (desenvolvimento)
    if 'console' in settings.EMAIL_BACKEND.lower():
        print("\n⚠️  Modo CONSOLE ativo (desenvolvimento)")
        print("   Emails serão impressos no terminal, não enviados via SMTP")
    else:
        print("\n✅ Modo SMTP ativo (produção)")
        print("   Emails serão enviados via SMTP")


def main():
    """Função principal."""
    print("\n" + "=" * 70)
    print("  TESTE DO SISTEMA DE NOTIFICAÇÕES POR EMAIL")
    print("=" * 70)
    
    try:
        # 0. Verificar configuração
        check_email_config()
        
        # 1. Verificar status
        test_notification_status()
        
        # 2. Criar feedback (notificação automática)
        feedback = test_create_feedback()
        
        # 3. Mudar status (notificação + rate limiting)
        test_status_change(feedback)
        
        # 4. Testar desativação temporária
        test_disable_notifications()
        
        # Resumo final
        print_header("✅ Testes Concluídos")
        print("Verificar:")
        print("1. Se emails foram impressos no console (modo dev)")
        print("2. Se logs mostram '✅ Notificação enviada'")
        print("3. Se rate limiting funcionou (2ª mudança de status)")
        print("4. Se desativação temporária funcionou")
        
        print("\n📧 Para testar envio real via SMTP:")
        print("   1. Configure EMAIL_HOST_PASSWORD no .env")
        print("   2. Defina DEBUG=False")
        print("   3. Execute novamente este script")
        
    except Exception as e:
        print(f"\n❌ Erro durante teste: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
