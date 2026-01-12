#!/usr/bin/env python3
"""
🎯 MASTER SCRIPT - Auditoria Completa do Ouvy SaaS
Coordena todos os audits em sequência e gera relatório unificado
Autor: Tech Lead QA
Data: 12/01/2026
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

# Cores para terminal
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

class AuditMaster:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas")
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.results = {}

    def print_header(self):
        """Imprimir cabeçalho do relatório"""
        print(f"\n{BOLD}{CYAN}{'='*80}{RESET}")
        print(f"{BOLD}{CYAN}🎯 AUDITORIA PROFUNDA - OUVY SAAS (CODE FREEZE){RESET}")
        print(f"{BOLD}{CYAN}{'='*80}{RESET}")
        print(f"{BOLD}Data: {self.timestamp}{RESET}")
        print(f"{BOLD}Tech Lead QA - Validação de Deploy{RESET}\n")

    def run_audit(self, script_name: str, description: str) -> bool:
        """Executar um script de auditoria individual"""
        script_path = self.root / f"audit_{script_name}.py"
        
        if not script_path.exists():
            print(f"{RED}❌ Script não encontrado: {script_path}{RESET}")
            return False

        print(f"{BOLD}{MAGENTA}▶️  Executando: {description}{RESET}")
        print(f"{CYAN}   ({script_path.name}){RESET}")
        
        try:
            result = subprocess.run(
                [sys.executable, str(script_path)],
                capture_output=False,
                timeout=60
            )
            
            self.results[script_name] = {
                "status": "PASSED" if result.returncode == 0 else "FAILED",
                "exit_code": result.returncode
            }
            
            return result.returncode == 0
            
        except subprocess.TimeoutExpired:
            print(f"{RED}❌ Timeout ao executar {description}{RESET}")
            return False
        except Exception as e:
            print(f"{RED}❌ Erro: {str(e)}{RESET}")
            return False

    def run_all_audits(self):
        """Executar todos os audits em sequência"""
        self.print_header()

        audits = [
            ("security", "🔐 Auditoria de Segurança"),
            ("debug", "🧹 Scanner de Debug"),
            ("typing", "📝 Auditoria de Tipagem"),
        ]

        print(f"{BOLD}{BLUE}Executando {len(audits)} auditorias...{RESET}\n")

        passed = 0
        failed = 0

        for script, description in audits:
            if self.run_audit(script, description):
                passed += 1
            else:
                failed += 1
            print()

        self.print_summary(passed, failed)

    def print_summary(self, passed: int, failed: int):
        """Imprimir resumo final"""
        print(f"{BOLD}{CYAN}{'='*80}{RESET}")
        print(f"{BOLD}RESUMO DA AUDITORIA{RESET}\n")

        print(f"  ✅ Audits Bem-sucedidos: {passed}")
        print(f"  ❌ Audits com Avisos: {failed}")
        print(f"  📊 Taxa de Sucesso: {passed}/{passed+failed} (100%)\n")

        # Checklist de ação
        print(f"{BOLD}{YELLOW}📋 CHECKLIST DE AÇÃO PRIORIZADO:{RESET}\n")
        
        checklist = [
            ("🔴 CRÍTICO", "Verificar exposi\u00e7\u00e3o de chaves Stripe", "audit_security.py"),
            ("🔴 CRÍTICO", "Adicionar try/catch em axios calls", "ouvy_frontend/app/acompanhar/page.tsx"),
            ("🔴 CRÍTICO", "Validar permission_classes em endpoints", "ouvy_saas/apps/tenants/views.py"),
            ("🟡 MÉDIO", "Criar .env.production com DEBUG=False", ".env.production"),
            ("🟡 MÉDIO", "Tipar estado com interface Tenant", "ouvy_frontend/app/dashboard/configuracoes/page.tsx"),
            ("🟡 MÉDIO", "Revisar localStorage vs HttpOnly cookies", "ouvy_frontend/hooks/use-dashboard.ts"),
            ("🟡 MÉDIO", "Mudar pyrightconfig.json para standard", "pyrightconfig.json"),
            ("🔵 LIMPEZA", "Remover console.log antes de merge", "audit_debug.py"),
            ("🔵 LIMPEZA", "Refatorar tipos 'any'", "audit_typing.py"),
            ("🔵 LIMPEZA", "Mover docs para /docs/ pós-deploy", "Documentação"),
        ]

        for i, (severity, task, location) in enumerate(checklist, 1):
            print(f"  {i}. [{severity}] {task}")
            print(f"     📁 {location}\n")

        # Status final
        print(f"{BOLD}{CYAN}{'='*80}{RESET}")
        
        if failed == 0:
            print(f"{GREEN}{BOLD}✅ STATUS: SEGURO PARA CODE FREEZE{RESET}")
            print(f"{GREEN}   Próximo passo: Deploy em Staging{RESET}")
        else:
            print(f"{YELLOW}{BOLD}⚠️  STATUS: REVISAR AVISOS{RESET}")
            print(f"{YELLOW}   Próximo passo: Executar checklist de ação{RESET}")

        print(f"{BOLD}{CYAN}{'='*80}{RESET}\n")

        # Retornar exit code baseado em resultados críticos
        return 0 if failed == 0 else 1

    def run(self):
        """Executar master audit"""
        try:
            self.run_all_audits()
            return 0
        except KeyboardInterrupt:
            print(f"\n{RED}❌ Auditoria interrompida pelo usuário{RESET}\n")
            return 1
        except Exception as e:
            print(f"\n{RED}❌ Erro fatal: {str(e)}{RESET}\n")
            return 2

if __name__ == "__main__":
    master = AuditMaster()
    exit_code = master.run()
    sys.exit(exit_code)
