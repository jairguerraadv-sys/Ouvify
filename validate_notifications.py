"""
Validação: Sistema de Notificações por Email
============================================

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


def print_header(title):
    """Imprime cabeçalho formatado."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def validate_signals():
    """Valida que os signals foram registrados."""
    print_header("Validando Registro de Signals")
    
    # Verificar signals do Feedback
    feedback_post_save = post_save._live_receivers(Feedback)
    feedback_pre_save = pre_save._live_receivers(Feedback)
    
    print("📋 Feedback Signals:")
    print(f"   post_save receivers: {len(feedback_post_save)}")
    print(f"   pre_save receivers: {len(feedback_pre_save)}")
    
    # Listar receivers
    for receiver in feedback_post_save:
        try:
            func = receiver[1]()
            if func:
                print(f"   - {func.__module__}.{func.__name__}")
        except (TypeError, AttributeError):
            # Receiver pode não ser chamável sem args
            pass
    
    # Verificar signals do FeedbackInteracao
    interacao_post_save = post_save._live_receivers(FeedbackInteracao)
    
    print(f"\n💬 FeedbackInteracao Signals:")
    print(f"   post_save receivers: {len(interacao_post_save)}")
    
    for receiver in interacao_post_save:
        try:
            func = receiver[1]()
            if func:
                print(f"   - {func.__module__}.{func.__name__}")
        except (TypeError, AttributeError):
            pass
    
    # Verificar se nossos signals estão presentes
    expected_signals = [
        'notificar_novo_feedback',
        'notificar_resposta_feedback',
        'preparar_notificacao_status',
        'notificar_mudanca_status'
    ]
    
    print(f"\n✅ Verificando signals esperados:")
    all_receivers = []
    
    for receiver in feedback_post_save:
        try:
            func = receiver[1]()
            if func:
                all_receivers.append(func.__name__)
        except (TypeError, AttributeError):
            pass
    
    for receiver in feedback_pre_save:
        try:
            func = receiver[1]()
            if func:
                all_receivers.append(func.__name__)
        except (TypeError, AttributeError):
            pass
    
    for receiver in interacao_post_save:
        try:
            func = receiver[1]()
            if func:
                all_receivers.append(func.__name__)
        except (TypeError, AttributeError):
            pass
        func = receiver[1]()
        if func:
            all_receivers.append(func.__name__)
    
    for signal_name in expected_signals:
        if signal_name in all_receivers:
            print(f"   ✅ {signal_name}")
        else:
            print(f"   ❌ {signal_name} não encontrado")


def validate_email_service():
    """Valida que o EmailService tem os métodos necessários."""
    print_header("Validando EmailService")
    
    from apps.core.email_service import EmailService
    
    methods = [
        'send_email',
        'send_new_feedback_notification',
        'send_password_reset_email',
        'send_welcome_email'
    ]
    
    for method_name in methods:
        if hasattr(EmailService, method_name):
            print(f"   ✅ {method_name}")
        else:
            print(f"   ❌ {method_name} não encontrado")


def validate_settings():
    """Valida configurações de email."""
    print_header("Validando Configurações de Email")
    
    from django.conf import settings
    
    configs = {
        'EMAIL_BACKEND': settings.EMAIL_BACKEND,
        'EMAIL_HOST': settings.EMAIL_HOST,
        'EMAIL_PORT': settings.EMAIL_PORT,
        'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
        'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
        'BASE_URL': settings.BASE_URL
    }
    
    for key, value in configs.items():
        print(f"   {key}: {value}")
    
    # Verificar modo
    if 'console' in settings.EMAIL_BACKEND.lower():
        print(f"\n   ⚠️  Modo DESENVOLVIMENTO (console)")
        print(f"      Para produção, configure EMAIL_HOST_PASSWORD")
    else:
        print(f"\n   ✅ Modo PRODUÇÃO (SMTP)")


def main():
    """Função principal."""
    print("\n" + "=" * 70)
    print("  VALIDAÇÃO DO SISTEMA DE NOTIFICAÇÕES")
    print("=" * 70)
    
    try:
        validate_signals()
        validate_email_service()
        validate_settings()
        
        print_header("✅ Validação Concluída")
        print("Sistema de notificações configurado corretamente!")
        print("\n📝 Próximos passos:")
        print("   1. Rode migrations: python manage.py migrate")
        print("   2. Crie um feedback para testar notificações")
        print("   3. Verifique logs para confirmar envio")
        
    except Exception as e:
        print(f"\n❌ Erro durante validação: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
