#!/usr/bin/env python3
"""
🧹 SCRIPT DE LIMPEZA DE DEBUG - Ouvy SaaS
Detecta console.log, print(), TODO, FIXME, etc
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

class DebugCleaner:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas")
        self.issues: Dict[str, List] = {
            "console.log": [],
            "console.error": [],
            "console.warn": [],
            "debugger": [],
            "print": [],
            "pdb": [],
            "TODO": [],
            "FIXME": [],
            "HACK": [],
            "XXX": [],
        }

    def scan_javascript_files(self):
        """Escanear arquivos TypeScript/JavaScript"""
        print(f"{BOLD}Escaneando arquivos TypeScript/JavaScript...{RESET}")
        
        patterns = {
            "console.log": r"console\.log\s*\(",
            "console.error": r"console\.error\s*\(",
            "console.warn": r"console\.warn\s*\(",
            "debugger": r"^\s*debugger\s*;",
        }

        for ts_file in self.root.glob("**/*.{ts,tsx,js,jsx}"):
            if "node_modules" in str(ts_file):
                continue

            content = ts_file.read_text()
            lines = content.split("\n")

            for pattern_name, pattern in patterns.items():
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line):
                        self.issues[pattern_name].append({
                            "file": str(ts_file.relative_to(self.root)),
                            "line": i,
                            "code": line.strip()
                        })

    def scan_python_files(self):
        """Escanear arquivos Python"""
        print(f"{BOLD}Escaneando arquivos Python...{RESET}")
        
        patterns = {
            "print": r"^\s*print\s*\(",
            "pdb": r"import\s+pdb|from\s+pdb|pdb\.set_trace",
        }

        for py_file in self.root.glob("**/*.py"):
            if "venv" in str(py_file) or "__pycache__" in str(py_file):
                continue

            content = py_file.read_text()
            lines = content.split("\n")

            # Verificar se é um arquivo de teste/config (exceções)
            is_test_file = "test_" in py_file.name
            is_startup_config = py_file.name == "settings.py"

            for pattern_name, pattern in patterns.items():
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line):
                        # print() é OK em settings.py (startup logging)
                        if pattern_name == "print" and is_startup_config:
                            continue
                        
                        self.issues[pattern_name].append({
                            "file": str(py_file.relative_to(self.root)),
                            "line": i,
                            "code": line.strip()
                        })

    def scan_comments(self):
        """Procurar por TODO, FIXME, HACK"""
        print(f"{BOLD}Escaneando comentários...{RESET}")
        
        patterns = {
            "TODO": r"#\s*TODO|//\s*TODO",
            "FIXME": r"#\s*FIXME|//\s*FIXME",
            "HACK": r"#\s*HACK|//\s*HACK",
            "XXX": r"#\s*XXX|//\s*XXX",
        }

        for code_file in self.root.glob("**/*.{py,ts,tsx,js,jsx}"):
            if "node_modules" in str(code_file) or "venv" in str(code_file):
                continue

            content = code_file.read_text()
            lines = content.split("\n")

            for pattern_name, pattern in patterns.items():
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line, re.IGNORECASE):
                        self.issues[pattern_name].append({
                            "file": str(code_file.relative_to(self.root)),
                            "line": i,
                            "code": line.strip()
                        })

    def print_report(self):
        """Gerar relatório"""
        print(f"\n{BOLD}{'='*70}{RESET}")
        print(f"{BOLD}RELATÓRIO DE LIMPEZA DE DEBUG{RESET}\n")

        total_issues = sum(len(v) for v in self.issues.values())

        if total_issues == 0:
            print(f"{GREEN}{BOLD}✅ NENHUM DEBUG ENCONTRADO - Código limpo!{RESET}\n")
            return 0

        print(f"{YELLOW}{BOLD}🧹 ENCONTRADOS {total_issues} ITENS PARA LIMPEZA:{RESET}\n")

        for category, items in self.issues.items():
            if not items:
                continue

            print(f"{BOLD}{category} ({len(items)} ocorrências):{RESET}")
            for item in items[:5]:  # Mostrar os 5 primeiros
                print(f"  📍 {item['file']}:{item['line']}")
                print(f"     {item['code'][:80]}")
            
            if len(items) > 5:
                print(f"  ... e mais {len(items) - 5} ocorrências")
            print()

        print(f"{BOLD}{'='*70}{RESET}")
        
        if any(self.issues.get(k) for k in ["console.log", "debugger", "pdb"]):
            print(f"{RED}{BOLD}❌ STATUS: Limpar antes de merge{RESET}\n")
            return 1
        else:
            print(f"{GREEN}{BOLD}✅ STATUS: Comentários encontrados (revisar){RESET}\n")
            return 0

    def run(self):
        """Executar todas as varreduras"""
        print(f"\n{BOLD}{BLUE}🧹 SCANNER DE DEBUG - Ouvy SaaS{RESET}\n")
        
        self.scan_javascript_files()
        self.scan_python_files()
        self.scan_comments()

        return self.print_report()

if __name__ == "__main__":
    cleaner = DebugCleaner()
    exit_code = cleaner.run()
    sys.exit(exit_code)
