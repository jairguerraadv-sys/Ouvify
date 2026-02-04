#!/usr/bin/env python
"""
Script de teste para validar as correções de segurança implementadas.
Executa validações nas seguintes áreas:
1. Geração criptograficamente segura de protocolos
2. Isolamento de tenant nos endpoints públicos
"""

import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import inspect

from django.contrib.auth.models import User

from apps.core.utils import get_current_tenant, set_current_tenant
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client


def test_protocolo_generation():
    """Testa se a geração de protocolo usa secrets"""
    print("\n" + "=" * 80)
    print("🔐 TESTE 1: GERAÇÃO CRIPTOGRÁFICA DE PROTOCOLOS")
    print("=" * 80)

    # Verificar se o código fonte usa secrets (apenas em linhas de código executável)
    source = inspect.getsource(Feedback.gerar_protocolo)

    # Separar linhas e filtrar apenas código executável (não comentários)
    lines = source.split("\n")
    code_lines = [
        line.strip()
        for line in lines
        if line.strip() and not line.strip().startswith("#")
    ]

    # Juntar linhas de código
    executable_code = "\n".join(code_lines)

    uses_secrets = "secrets.choice" in executable_code
    uses_random = "random.choice" in executable_code

    print(f"\n✓ Usa secrets.choice(): {'✅ SIM' if uses_secrets else '❌ NÃO'}")
    print(f"✓ Usa random.choice(): {'❌ SIM (INSEGURO)' if uses_random else '✅ NÃO'}")

    # Gerar 20 protocolos e verificar unicidade
    protocolos = [Feedback.gerar_protocolo() for _ in range(20)]
    unicos = len(set(protocolos))

    print(f"\n✓ Protocolos gerados: {len(protocolos)}")
    print(f"✓ Protocolos únicos: {unicos}")
    print(
        f"✓ Formato correto: {'✅ SIM' if all(p.startswith('OUVY-') and len(p) == 14 for p in protocolos) else '❌ NÃO'}"
    )

    # Exemplos
    print(f"\n📝 Exemplos gerados:")
    for i, p in enumerate(protocolos[:5], 1):
        print(f"   {i}. {p}")

    if uses_secrets and not uses_random and unicos == len(protocolos):
        print("\n✅ TESTE PASSOU: Geração de protocolo está segura!")
        return True
    else:
        print("\n❌ TESTE FALHOU: Geração de protocolo tem problemas de segurança!")
        return False


def test_tenant_isolation_in_views():
    """Testa se os endpoints validam tenant corretamente"""
    print("\n" + "=" * 80)
    print("🔐 TESTE 2: ISOLAMENTO DE TENANT NOS ENDPOINTS")
    print("=" * 80)

    # Verificar código fonte dos endpoints críticos
    from apps.feedbacks import views

    consultar_source = inspect.getsource(views.FeedbackViewSet.consultar_protocolo)
    responder_source = inspect.getsource(views.FeedbackViewSet.responder_protocolo)

    # Remover comentários para análise mais precisa
    import re

    consultar_clean = re.sub(r"#.*", "", consultar_source)
    responder_clean = re.sub(r"#.*", "", responder_source)

    # Checks de segurança
    checks = {
        "consultar_protocolo": {
            "get_current_tenant": "get_current_tenant()" in consultar_source,
            "filter_by_tenant": "client=tenant" in consultar_source,
            "no_all_tenants": "all_tenants()" not in consultar_clean,
        },
        "responder_protocolo": {
            "get_current_tenant": "get_current_tenant()" in responder_source,
            "filter_by_tenant": "client=tenant" in responder_source,
            "no_all_tenants": "all_tenants()" not in responder_clean,
        },
    }

    print("\n📋 ENDPOINT: consultar_protocolo")
    all_passed = True
    for check_name, check_result in checks["consultar_protocolo"].items():
        status = "✅" if check_result else "❌"
        print(f"   {status} {check_name.replace('_', ' ').title()}: {check_result}")
        if not check_result:
            all_passed = False

    print("\n📋 ENDPOINT: responder_protocolo")
    for check_name, check_result in checks["responder_protocolo"].items():
        status = "✅" if check_result else "❌"
        print(f"   {status} {check_name.replace('_', ' ').title()}: {check_result}")
        if not check_result:
            all_passed = False

    if all_passed:
        print("\n✅ TESTE PASSOU: Isolamento de tenant está implementado!")
        return True
    else:
        print("\n❌ TESTE FALHOU: Faltam validações de tenant!")
        return False


def test_database_indices():
    """Verifica se os índices necessários estão configurados"""
    print("\n" + "=" * 80)
    print("🔐 TESTE 3: ÍNDICES DE PERFORMANCE E SEGURANÇA")
    print("=" * 80)

    feedback_meta = Feedback._meta

    # Verificar campo protocolo
    protocolo_field = feedback_meta.get_field("protocolo")

    print(f"\n📋 Campo 'protocolo':")
    print(
        f"   ✓ db_index: {'✅ SIM' if getattr(protocolo_field, 'db_index', False) else '❌ NÃO'}"
    )
    print(
        f"   ✓ unique: {'✅ SIM' if getattr(protocolo_field, 'unique', False) else '❌ NÃO'}"
    )
    print(
        f"   ✓ editable: {'❌ SIM (problema)' if getattr(protocolo_field, 'editable', True) else '✅ NÃO'}"
    )

    # Verificar índices compostos
    indices = [str(idx) for idx in feedback_meta.indexes]
    print(f"\n📋 Índices compostos: {len(indices)}")
    for idx in indices[:5]:  # Mostrar primeiros 5
        print(f"   • {idx[:80]}...")

    has_db_index = getattr(protocolo_field, "db_index", False)
    is_unique = getattr(protocolo_field, "unique", False)
    is_editable = getattr(protocolo_field, "editable", True)

    if has_db_index and is_unique and not is_editable:
        print("\n✅ TESTE PASSOU: Índices e configurações estão corretos!")
        return True
    else:
        print("\n❌ TESTE FALHOU: Problemas de configuração detectados!")
        return False


def main():
    """Executa todos os testes"""
    print("\n" + "=" * 80)
    print("🛡️  VALIDAÇÃO DE CORREÇÕES DE SEGURANÇA - OUVIFY SAAS")
    print("=" * 80)
    print("Data: 27 de Janeiro de 2026")
    print("Versão: 1.0.0")

    results = []

    try:
        results.append(("Geração de Protocolos", test_protocolo_generation()))
    except Exception as e:
        print(f"\n❌ ERRO no teste de geração: {e}")
        results.append(("Geração de Protocolos", False))

    try:
        results.append(("Isolamento de Tenant", test_tenant_isolation_in_views()))
    except Exception as e:
        print(f"\n❌ ERRO no teste de isolamento: {e}")
        results.append(("Isolamento de Tenant", False))

    try:
        results.append(("Índices de Banco", test_database_indices()))
    except Exception as e:
        print(f"\n❌ ERRO no teste de índices: {e}")
        results.append(("Índices de Banco", False))

    # Resultado final
    print("\n" + "=" * 80)
    print("📊 RESUMO DOS TESTES")
    print("=" * 80)

    for test_name, passed in results:
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        print(f"{status} - {test_name}")

    total = len(results)
    passed = sum(1 for _, p in results if p)

    print("\n" + "=" * 80)
    print(f"🎯 RESULTADO FINAL: {passed}/{total} testes passaram")

    if passed == total:
        print("✅ TODAS AS CORREÇÕES DE SEGURANÇA FORAM IMPLEMENTADAS COM SUCESSO!")
    else:
        print("⚠️ ALGUMAS CORREÇÕES PRECISAM SER REVISADAS!")

    print("=" * 80 + "\n")

    return passed == total


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)
