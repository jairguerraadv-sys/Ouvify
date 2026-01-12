#!/usr/bin/env python3
"""
📝 SCRIPT DE AUDITORIA DE TIPAGEM - Ouvy SaaS
Detecta uso excessivo de 'any' no TypeScript
Autor: Tech Lead QA
Data: 12/01/2026
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict

# Cores para terminal
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

class TypeAudit:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas/ouvy_frontend")
        self.issues = []
        self.warnings = []
        self.passed = []

    def scan_any_usage(self):
        """Procurar por 'any' em arquivos TypeScript"""
        print(f"{BOLD}Escaneando uso de 'any'...{RESET}")
        
        any_pattern = r":\s*any\s*[=,;)\]}\n]|<any>|as\s+any"

        for ts_file in self.root.glob("**/*.{ts,tsx}"):
            if "node_modules" in str(ts_file):
                continue

            content = ts_file.read_text()
            lines = content.split("\n")

            for i, line in enumerate(lines, 1):
                if re.search(any_pattern, line):
                    # Ignorar linhas de comentário
                    if line.strip().startswith("//"):
                        continue

                    self.issues.append({
                        "file": str(ts_file.relative_to(self.root)),
                        "line": i,
                        "code": line.strip(),
                        "severity": "🟡 MÉDIO" if i < 100 else "🔵 LIMPEZA"
                    })

    def scan_untyped_props(self):
        """Procurar por props não tipadas em componentes React"""
        print(f"{BOLD}Escaneando props não tipadas...{RESET}")
        
        for tsx_file in self.root.glob("**/*.tsx"):
            if "node_modules" in str(tsx_file):
                continue

            content = tsx_file.read_text()
            
            # Procurar por: export default function Foo(props)
            if re.search(r"function\s+\w+\s*\(\s*props\s*\)", content):
                self.warnings.append({
                    "file": str(tsx_file.relative_to(self.root)),
                    "issue": "Props não tipadas em componente"
                })

    def scan_missing_return_types(self):
        """Procurar por funções sem tipo de retorno explícito"""
        print(f"{BOLD}Escaneando tipos de retorno...{RESET}")
        
        # Padrão: function foo() { sem type annotation
        pattern = r"(async\s+)?function\s+\w+\s*\([^)]*\)\s*\{"
        
        for ts_file in self.root.glob("**/*.{ts,tsx}"):
            if "node_modules" in str(ts_file):
                continue

            content = ts_file.read_text()
            
            # Ignorar arquivos com muitos tipos genéricos
            if content.count("<") > 10:
                continue

            lines = content.split("\n")
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line) and "Promise<" not in line and ": " not in line:
                    if not line.strip().startswith("//"):
                        self.warnings.append({
                            "file": str(ts_file.relative_to(self.root)),
                            "line": i,
                            "code": line.strip()[:60]
                        })

    def check_eslint_config(self):
        """Verificar configuração de ESLint"""
        eslint_config = self.root / "eslint.config.mjs"
        
        if not eslint_config.exists():
            self.warnings.append("⚠️  ESLint config não encontrado")
            return

        content = eslint_config.read_text()
        
        if "@typescript-eslint" in content:
            self.passed.append("✅ ESLint TypeScript rules habilitadas")
        else:
            self.warnings.append("🟡 MÉDIO: ESLint TypeScript rules não encontradas")

    def check_tsconfig(self):
        """Verificar configuração de TypeScript"""
        tsconfig_file = self.root / "tsconfig.json"
        
        if not tsconfig_file.exists():
            self.issues.append("🔴 CRÍTICO: tsconfig.json não encontrado")
            return

        import json
        try:
            with open(tsconfig_file) as f:
                config = json.load(f)
                
            compiler_options = config.get("compilerOptions", {})
            
            # Verificações de segurança
            checks = [
                ("strict", True, "Mode strict habilitado"),
                ("noImplicitAny", True, "noImplicitAny habilitado"),
                ("strictNullChecks", True, "strictNullChecks habilitado"),
            ]
            
            for option, expected, msg in checks:
                value = compiler_options.get(option, False)
                if value == expected:
                    self.passed.append(f"✅ {msg}")
                else:
                    self.warnings.append(f"🟡 MÉDIO: {option}={value} (recomendado: {expected})")
        except Exception as e:
            self.warnings.append(f"❌ Erro ao ler tsconfig: {e}")

    def print_report(self):
        """Gerar relatório"""
        print(f"\n{BOLD}{'='*70}{RESET}")
        print(f"{BOLD}RELATÓRIO DE TIPAGEM TYPESCRIPT{RESET}\n")

        total_any = len(self.issues)
        
        if self.issues:
            print(f"{YELLOW}{BOLD}Uso de 'any' ({total_any} ocorrências):{RESET}")
            for issue in self.issues[:10]:
                print(f"  {issue['severity']}: {issue['file']}:{issue['line']}")
                print(f"     {issue['code'][:70]}")
            
            if len(self.issues) > 10:
                print(f"  ... e mais {len(self.issues) - 10} ocorrências")
            print()

        if self.warnings:
            print(f"{YELLOW}{BOLD}⚠️  Avisos ({len(self.warnings)}):{RESET}")
            for warning in self.warnings:
                if isinstance(warning, dict) and "issue" in warning:
                    print(f"  🔹 {warning['file']}: {warning['issue']}")
                elif isinstance(warning, dict):
                    print(f"  🔹 {warning}")
                else:
                    print(f"  🔹 {warning}")
            print()

        if self.passed:
            print(f"{GREEN}{BOLD}✅ Passou ({len(self.passed)}):{RESET}")
            for p in self.passed:
                print(f"  {p}")
            print()

        print(f"{BOLD}{'='*70}{RESET}")

        # Status
        if total_any > 50:
            print(f"{RED}{BOLD}❌ STATUS: Muitos 'any' - Refatorar tipagem{RESET}\n")
            return 1
        elif total_any > 10:
            print(f"{YELLOW}{BOLD}⚠️  STATUS: Revisar uso de 'any'{RESET}\n")
            return 0
        else:
            print(f"{GREEN}{BOLD}✅ STATUS: Tipagem adequada{RESET}\n")
            return 0

    def run(self):
        """Executar auditoria completa"""
        print(f"\n{BOLD}{BLUE}📝 AUDITORIA DE TIPAGEM - Ouvy Frontend{RESET}\n")
        
        self.scan_any_usage()
        self.scan_untyped_props()
        self.scan_missing_return_types()
        self.check_eslint_config()
        self.check_tsconfig()

        return self.print_report()

if __name__ == "__main__":
    audit = TypeAudit()
    exit_code = audit.run()
    sys.exit(exit_code)
