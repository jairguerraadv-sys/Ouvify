"""
Conftest root - seta variáveis de ambiente ANTES do Django carregar
"""
import os

# CRÍTICO: Definir TESTING antes de qualquer import do Django
os.environ['TESTING'] = 'True'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
