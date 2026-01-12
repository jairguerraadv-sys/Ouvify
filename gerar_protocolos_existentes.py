#!/usr/bin/env python
"""
Script para gerar protocolos para feedbacks existentes que não possuem.
Executar após a migração inicial do campo protocolo.
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.feedbacks.models import Feedback

def gerar_protocolos_faltantes():
    """Gera protocolos para todos os feedbacks que ainda não possuem."""
    
    feedbacks_sem_protocolo = Feedback.objects.all_tenants().filter(
        protocolo__isnull=True
    ) | Feedback.objects.all_tenants().filter(protocolo='')
    
    total = feedbacks_sem_protocolo.count()
    
    if total == 0:
        print("✅ Todos os feedbacks já possuem protocolo!")
        return
    
    print(f"🔄 Gerando protocolos para {total} feedback(s)...")
    
    for i, feedback in enumerate(feedbacks_sem_protocolo, 1):
        protocolo = Feedback.gerar_protocolo()
        feedback.protocolo = protocolo
        feedback.save(update_fields=['protocolo'])
        print(f"  [{i}/{total}] Protocolo {protocolo} gerado para Feedback ID {feedback.id}")
    
    print(f"\n✅ {total} protocolos gerados com sucesso!")

if __name__ == '__main__':
    gerar_protocolos_faltantes()
