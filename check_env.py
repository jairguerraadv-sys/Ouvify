#!/usr/bin/env python
"""
Script para validar as configurações de ambiente antes de iniciar o servidor.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

print("=" * 80)
print("🔍 VALIDAÇÃO DE CONFIGURAÇÕES DE AMBIENTE")
print("=" * 80)

errors = []
warnings = []

# Verificar SECRET_KEY
secret_key = os.getenv('SECRET_KEY', '')
if not secret_key:
    errors.append("❌ SECRET_KEY não está configurada!")
elif secret_key.startswith('django-insecure') and os.getenv('DEBUG', 'False').lower() == 'false':
    errors.append("❌ SECRET_KEY padrão detectada em modo de produção!")
elif len(secret_key) < 50:
    warnings.append("⚠️ SECRET_KEY muito curta (recomendado: 50+ caracteres)")
else:
    print("✅ SECRET_KEY configurada")

# Verificar DEBUG
debug = os.getenv('DEBUG', 'False')
if debug.lower() in ('true', '1', 'yes'):
    print("🟡 DEBUG=True (modo desenvolvimento)")
    if not secret_key.startswith('django-insecure'):
        warnings.append("⚠️ Usando SECRET_KEY de produção em modo debug")
else:
    print("🟢 DEBUG=False (modo produção)")

# Verificar ALLOWED_HOSTS
allowed_hosts = os.getenv('ALLOWED_HOSTS', '')
if not allowed_hosts:
    errors.append("❌ ALLOWED_HOSTS não configurado!")
else:
    hosts = allowed_hosts.split(',')
    print(f"✅ ALLOWED_HOSTS configurado ({len(hosts)} hosts)")
    if '*' in hosts and debug.lower() == 'false':
        errors.append("❌ ALLOWED_HOSTS='*' não é seguro em produção!")

# Verificar CORS
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if not cors_origins:
    errors.append("❌ CORS_ALLOWED_ORIGINS não configurado!")
else:
    origins = cors_origins.split(',')
    print(f"✅ CORS_ALLOWED_ORIGINS configurado ({len(origins)} origens)")

# Verificar banco de dados
db_engine = os.getenv('DB_ENGINE', 'sqlite').lower()
if db_engine == 'postgresql':
    print("✅ Usando PostgreSQL")
    
    if not os.getenv('DB_PASSWORD'):
        if debug.lower() == 'false':
            errors.append("❌ DB_PASSWORD não configurada em produção!")
        else:
            warnings.append("⚠️ DB_PASSWORD não configurada")
    
    db_name = os.getenv('DB_NAME', '')
    if not db_name:
        warnings.append("⚠️ DB_NAME não configurado (usando padrão)")
else:
    print("🟡 Usando SQLite (recomendado apenas para desenvolvimento)")
    if debug.lower() == 'false':
        warnings.append("⚠️ SQLite não é recomendado para produção")

# Verificar arquivo .env
env_file = BASE_DIR / '.env'
if not env_file.exists():
    errors.append("❌ Arquivo .env não encontrado!")
    print("\n💡 Dica: Copie .env.example para .env e configure as variáveis")
else:
    print("✅ Arquivo .env encontrado")

print("\n" + "=" * 80)

# Exibir avisos
if warnings:
    print("⚠️  AVISOS:")
    for warning in warnings:
        print(f"   {warning}")
    print()

# Exibir erros
if errors:
    print("❌ ERROS CRÍTICOS:")
    for error in errors:
        print(f"   {error}")
    print("\n🔴 Corrija os erros acima antes de continuar!")
    sys.exit(1)
else:
    print("✅ Todas as configurações estão corretas!")
    print("🚀 Servidor pronto para iniciar")

print("=" * 80)
