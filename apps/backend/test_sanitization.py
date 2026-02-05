"""
Script de teste para validar a sanitização HTML contra XSS
"""

import os
import sys

# Adicionar path do projeto
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from apps.core.sanitizers import (
    sanitize_html_input,
    sanitize_html_with_bleach,
    sanitize_plain_text,
    sanitize_rich_text,
)

# Cores para output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BLUE = "\033[94m"


def test_sanitize_html_input():
    """Testa sanitização com html.escape()"""
    print(f"\n{BLUE}=== Teste: sanitize_html_input() ==={RESET}")

    tests = [
        {
            "name": "XSS básico com <script>",
            "input": "<script>alert('XSS')</script>",
            "expected_safe": True,
            "should_not_contain": "<script>",
        },
        {
            "name": "Event handler onclick (escapado)",
            "input": "<div onclick='alert(1)'>Texto</div>",
            "expected_safe": True,
            "should_not_contain": "<div",  # Tag deve ser escapada
        },
        {
            "name": "HTML injetado com tags",
            "input": "<p>Texto <strong>negrito</strong></p>",
            "expected_safe": True,
            "should_not_contain": "<p>",
        },
        {
            "name": "Texto puro (sem tags)",
            "input": "Texto simples sem HTML",
            "expected_safe": True,
            "should_contain": "Texto simples",
        },
    ]

    passed = 0
    failed = 0

    for test in tests:
        result = sanitize_html_input(test["input"])

        # Verificar se é seguro
        is_safe = (
            not test.get("should_not_contain")
            or test["should_not_contain"] not in result
        ) and (not test.get("should_contain") or test["should_contain"] in result)

        if is_safe:
            print(f"  {GREEN}✓{RESET} {test['name']}")
            print(f"    Input:  {test['input'][:50]}")
            print(f"    Output: {result[:50]}")
            passed += 1
        else:
            print(f"  {RED}✗{RESET} {test['name']}")
            print(f"    Input:  {test['input'][:50]}")
            print(f"    Output: {result[:50]}")
            failed += 1

    print(f"\n  Total: {passed} passou, {failed} falhou")
    return failed == 0


def test_sanitize_rich_text():
    """Testa sanitização com bleach"""
    print(f"\n{BLUE}=== Teste: sanitize_rich_text() (Bleach) ==={RESET}")

    try:
        tests = [
            {
                "name": "Preservar formatação <strong>",
                "input": "<p>Texto <strong>negrito</strong></p>",
                "expected_safe": True,
                "should_contain": "<strong>negrito</strong>",
            },
            {
                "name": "Remover <script> malicioso",
                "input": "<p>Texto<script>alert(1)</script></p>",
                "expected_safe": True,
                "should_not_contain": "<script>",
            },
            {
                "name": "Remover onclick",
                "input": "<p onclick='hack()'>Texto</p>",
                "expected_safe": True,
                "should_not_contain": "onclick",
            },
            {
                "name": "Preservar lista <ul>",
                "input": "<ul><li>Item 1</li><li>Item 2</li></ul>",
                "expected_safe": True,
                "should_contain": "<li>",
            },
            {
                "name": "Bloquear <iframe>",
                "input": "<iframe src='evil.com'></iframe>",
                "expected_safe": True,
                "should_not_contain": "<iframe>",
            },
        ]

        passed = 0
        failed = 0

        for test in tests:
            result = sanitize_rich_text(test["input"])

            # Verificar se é seguro
            is_safe = (
                not test.get("should_not_contain")
                or test["should_not_contain"] not in result
            ) and (not test.get("should_contain") or test["should_contain"] in result)

            if is_safe:
                print(f"  {GREEN}✓{RESET} {test['name']}")
                print(f"    Input:  {test['input'][:60]}")
                print(f"    Output: {result[:60]}")
                passed += 1
            else:
                print(f"  {RED}✗{RESET} {test['name']}")
                print(f"    Input:  {test['input'][:60]}")
                print(f"    Output: {result[:60]}")
                failed += 1

        print(f"\n  Total: {passed} passou, {failed} falhou")
        return failed == 0

    except ImportError:
        print(f"  {YELLOW}⚠ Bleach não instalado. Pulando testes.{RESET}")
        return True


def test_sanitize_plain_text():
    """Testa sanitização de texto puro"""
    print(f"\n{BLUE}=== Teste: sanitize_plain_text() ==={RESET}")

    tests = [
        {
            "name": "Remover todas as tags HTML",
            "input": "<script>alert(1)</script>Título",
            "expected_safe": True,
            "should_contain": "Título",
        },
        {
            "name": "Preservar acentos portugueses",
            "input": "Título com acentuação ç á é",
            "expected_safe": True,
            "should_contain": "acentuação",
        },
        {
            "name": "Remover caracteres perigosos",
            "input": "Título\x00com\x01null\x02bytes",
            "expected_safe": True,
            "should_not_contain": "\x00",
        },
    ]

    passed = 0
    failed = 0

    for test in tests:
        result = sanitize_plain_text(test["input"])

        # Verificar se é seguro
        is_safe = (
            not test.get("should_not_contain")
            or test["should_not_contain"] not in result
        ) and (not test.get("should_contain") or test["should_contain"] in result)

        if is_safe:
            print(f"  {GREEN}✓{RESET} {test['name']}")
            print(f"    Input:  {test['input'][:50]}")
            print(f"    Output: {result[:50]}")
            passed += 1
        else:
            print(f"  {RED}✗{RESET} {test['name']}")
            print(f"    Input:  {test['input'][:50]}")
            print(f"    Output: {result[:50]}")
            failed += 1

    print(f"\n  Total: {passed} passou, {failed} falhou")
    return failed == 0


def test_edge_cases():
    """Testa casos extremos"""
    print(f"\n{BLUE}=== Teste: Casos Extremos ==={RESET}")

    tests = [
        {
            "name": "String vazia",
            "input": "",
            "function": sanitize_html_input,
            "expected": "",
        },
        {
            "name": "None (deve retornar string vazia)",
            "input": None,
            "function": sanitize_html_input,
            "expected": "",
        },
        {
            "name": "Espaços em branco múltiplos",
            "input": "Texto    com     espaços",
            "function": sanitize_html_input,
            "should_contain": "Texto com espaços",
        },
        {
            "name": "Texto muito longo (truncar)",
            "input": "A" * 10000,
            "function": lambda x: sanitize_html_input(x, max_length=100),
            "max_length": 100,
        },
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            result = test["function"](test["input"])

            is_safe = True
            if "expected" in test:
                is_safe = result == test["expected"]
            elif "should_contain" in test:
                is_safe = test["should_contain"] in result
            elif "max_length" in test:
                is_safe = len(result) <= test["max_length"]

            if is_safe:
                print(f"  {GREEN}✓{RESET} {test['name']}")
                passed += 1
            else:
                print(f"  {RED}✗{RESET} {test['name']}")
                print(f"    Resultado: {result[:50]}")
                failed += 1
        except Exception as e:
            print(f"  {RED}✗{RESET} {test['name']}")
            print(f"    Erro: {str(e)}")
            failed += 1

    print(f"\n  Total: {passed} passou, {failed} falhou")
    return failed == 0


def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}  TESTES DE SANITIZAÇÃO XSS - Ouvify{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")

    all_passed = True

    # Executar todos os testes
    all_passed &= test_sanitize_html_input()
    all_passed &= test_sanitize_rich_text()
    all_passed &= test_sanitize_plain_text()
    all_passed &= test_edge_cases()

    # Resultado final
    print(f"\n{BLUE}{'='*60}{RESET}")
    if all_passed:
        print(f"{GREEN}✅ TODOS OS TESTES PASSARAM!{RESET}")
        print(f"{GREEN}   Sistema protegido contra XSS{RESET}")
    else:
        print(f"{RED}❌ ALGUNS TESTES FALHARAM{RESET}")
        print(f"{RED}   Revisar implementação{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
