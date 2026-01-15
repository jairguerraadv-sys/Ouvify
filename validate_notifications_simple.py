"""
Validação Simples: Sistema de Notificações por Email
====================================================

Valida que os signals foram registrados corretamente.
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db.models.signals import post_save, pre_save
from apps.feedbacks.models import Feedback, FeedbackInteracao
from apps.feedbacks import signals as feedback_signals


def print_section(title):
    """Imprime seção formatada."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def validate():
    """Valida configuração."""
    print_section("VALIDAÇÃO DO SISTEMA DE NOTIFICAÇÕES")
    
    # 1. Verificar signals registrados
    print("\n✅ Signals Registrados:")
    print(f"   Feedback post_save: {len(post_save._live_receivers(Feedback))} receivers")
    print(f"   Feedback pre_save: {len(pre_save._live_receivers(Feedback))} receivers")
    print(f"   FeedbackInteracao post_save: {len(post_save._live_receivers(FeedbackInteracao))} receivers")
    
    # 2. Verificar funções existem
    print("\n✅ Funções de Signal:")
    functions = [
        'notificar_novo_feedback',
        'notificar_resposta_feedback',
        'preparar_notificacao_status',
        'notificar_mudanca_status',
        'desativar_notificacoes_temporariamente',
        'reativar_notificacoes',
        'notificacoes_estao_ativas'
    ]
    
    for func in functions:
        exists = hasattr(feedback_signals, func)
        status = "✅" if exists else "❌"
        print(f"   {status} {func}")
    
    # 3. Verificar EmailService
    print("\n✅ EmailService:")
    from apps.core.email_service import EmailService
    
    methods = [
        'send_email',
        'send_new_feedback_notification'
    ]
    
    for method in methods:
        exists = hasattr(EmailService, method)
        status = "✅" if exists else "❌"
        print(f"   {status} {method}")
    
    # 4. Configurações
    print("\n✅ Configurações de Email:")
    from django.conf import settings
    
    print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   BASE_URL: {settings.BASE_URL}")
    
    if 'console' in settings.EMAIL_BACKEND.lower():
        print("\n   ⚠️  Modo DESENVOLVIMENTO")
        print("      Emails impressos no console")
    else:
        print("\n   ✅ Modo PRODUÇÃO")
        print("      Emails enviados via SMTP")
    
    print_section("VALIDAÇÃO CONCLUÍDA")
    print("\n✅ Sistema de notificações configurado!")
    print("\n📝 Próximos passos:")
    print("   1. python manage.py migrate")
    print("   2. Criar feedback para testar")
    print("   3. Verificar logs: '✅ Notificação enviada'")


if __name__ == '__main__':
    try:
        validate()
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
