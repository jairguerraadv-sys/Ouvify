#!/usr/bin/env python3
"""
🔗 SCRIPT DE MAPEAMENTO DE APIS - Ouvy SaaS
Valida consistência entre Frontend (axios) e Backend (Django URLs)
Autor: Tech Lead QA
Data: 12/01/2026
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Set

# Cores para terminal
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

class APIMapper:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas")
        self.frontend_calls: Dict[str, List[Dict]] = {}
        self.backend_endpoints: Dict[str, str] = {}
        self.mismatches = []
        self.verified = []

    def extract_frontend_api_calls(self):
        """Extrair chamadas axios/fetch do Frontend"""
        print(f"{BOLD}Escaneando chamadas Frontend...{RESET}")
        
        # Padrões de axios e fetch
        patterns = [
            (r'axios\.get\s*\(\s*["\']([^"\']+)["\']', "GET"),
            (r'axios\.post\s*\(\s*["\']([^"\']+)["\']', "POST"),
            (r'axios\.put\s*\(\s*["\']([^"\']+)["\']', "PUT"),
            (r'axios\.patch\s*\(\s*["\']([^"\']+)["\']', "PATCH"),
            (r'axios\.delete\s*\(\s*["\']([^"\']+)["\']', "DELETE"),
            (r'fetch\s*\(\s*["\']([^"\']+)["\']', "FETCH"),
        ]

        for ts_file in (self.root / "ouvy_frontend").glob("**/*.{ts,tsx}"):
            if "node_modules" in str(ts_file):
                continue

            content = ts_file.read_text()
            lines = content.split("\n")

            for pattern, method in patterns:
                for i, line in enumerate(lines, 1):
                    matches = re.findall(pattern, line)
                    for url in matches:
                        # Normalizar URL (remover http://localhost:8000)
                        clean_url = url.replace("http://127.0.0.1:8000", "").replace("http://localhost:8000", "")
                        
                        call_info = {
                            "method": method,
                            "url": clean_url,
                            "file": str(ts_file.relative_to(self.root)),
                            "line": i,
                            "raw": line.strip()[:80]
                        }

                        if clean_url not in self.frontend_calls:
                            self.frontend_calls[clean_url] = []
                        self.frontend_calls[clean_url].append(call_info)

    def extract_backend_endpoints(self):
        """Extrair endpoints do Django URLs"""
        print(f"{BOLD}Escaneando endpoints Backend...{RESET}")
        
        urls_file = self.root / "ouvy_saas/config/urls.py"
        if not urls_file.exists():
            print(f"{RED}❌ urls.py não encontrado{RESET}")
            return

        content = urls_file.read_text()
        
        # Padrão: path('api/...', view)
        pattern = r"path\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*([^,\)]+)"
        
        for match in re.finditer(pattern, content):
            endpoint = match.group(1)
            handler = match.group(2).strip()
            self.backend_endpoints[f"/api/{endpoint}"] = handler

    def validate_mapping(self):
        """Validar se Frontend chama exatamente os endpoints que Backend expõe"""
        print(f"{BOLD}Validando mapeamento...{RESET}")
        
        # Endpoints públicos que não requerem autenticação
        public_endpoints = [
            "/api/feedbacks/consultar-protocolo/",
        ]

        for frontend_url, calls in self.frontend_calls.items():
            # Encontrar endpoint correspondente no Backend
            found = False
            
            for backend_url in self.backend_endpoints:
                # Normalizar comparação (com/sem trailing slash)
                if frontend_url.rstrip("/") == backend_url.rstrip("/"):
                    found = True
                    self.verified.append({
                        "url": frontend_url,
                        "calls": len(calls),
                        "methods": list(set(c["method"] for c in calls))
                    })
                    break

            if not found and frontend_url not in public_endpoints:
                self.mismatches.append({
                    "type": "MISSING_BACKEND",
                    "url": frontend_url,
                    "detail": f"Frontend chama {frontend_url} mas Backend não expõe este endpoint",
                    "calls": calls
                })

    def print_report(self):
        """Gerar relatório"""
        print(f"\n{BOLD}{'='*80}{RESET}")
        print(f"{BOLD}RELATÓRIO DE MAPEAMENTO DE APIS{RESET}\n")

        print(f"{BOLD}Frontend chamadas encontradas: {len(self.frontend_calls)}{RESET}")
        print(f"{BOLD}Backend endpoints encontrados: {len(self.backend_endpoints)}{RESET}\n")

        if self.verified:
            print(f"{GREEN}{BOLD}✅ ENDPOINTS VERIFICADOS ({len(self.verified)}):{RESET}")
            for api in self.verified:
                print(f"  {api['url']}")
                print(f"     Métodos: {', '.join(api['methods'])}, {api['calls']} chamada(s)")
            print()

        if self.mismatches:
            print(f"{RED}{BOLD}❌ INCONSISTÊNCIAS ENCONTRADAS ({len(self.mismatches)}):{RESET}")
            for mismatch in self.mismatches:
                print(f"  ⚠️  {mismatch['type']}: {mismatch['url']}")
                print(f"     {mismatch['detail']}")
                print(f"     Chamadas em: {mismatch['calls'][0]['file']}:{mismatch['calls'][0]['line']}")
            print()
        else:
            print(f"{GREEN}{BOLD}✅ Todos os endpoints mapeados corretamente!{RESET}\n")

        print(f"{BOLD}{'='*80}{RESET}")
        return 0 if not self.mismatches else 1

    def run(self):
        """Executar mapeamento completo"""
        print(f"\n{BOLD}{BLUE}🔗 MAPEAMENTO DE APIS - Ouvy SaaS{RESET}\n")
        
        self.extract_frontend_api_calls()
        self.extract_backend_endpoints()
        self.validate_mapping()
        
        return self.print_report()

if __name__ == "__main__":
    mapper = APIMapper()
    exit_code = mapper.run()
    sys.exit(exit_code)
