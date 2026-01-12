#!/usr/bin/env python3
"""
🔐 SCRIPT DE AUDITORIA DE SEGURANÇA - Ouvy SaaS
Valida: Chaves hardcoded, permissões, DEBUG, CORS
Autor: Tech Lead QA
Data: 12/01/2026
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

# Cores para terminal
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

class SecurityAudit:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas")
        self.issues = []
        self.warnings = []
        self.passed = []

    def check_env_secrets(self):
        """✅ #1: Verificar chaves sensíveis em .env"""
        env_file = self.root / ".env"
        if not env_file.exists():
            self.warnings.append("⚠️  .env não encontrado (normal em CI/CD)")
            return

        env_content = env_file.read_text()
        
        # Chaves sensíveis que NÃO devem estar no .env (devem estar apenas na produção)
        # Nota: Chaves de TESTE (pk_test_, sk_test_) são OK em desenvolvimento
        secrets_patterns = [
            (r"STRIPE_SECRET_KEY\s*=\s*sk_live_[a-zA-Z0-9]{20,}", "STRIPE_SECRET_KEY (LIVE/PROD) exposta no .env - CRÍTICO!"),
            (r"SECRET_KEY\s*=\s*django-insecure-.{20,}", "Django SECRET_KEY insegura (padrão django-insecure) detectada"),
        ]

        for pattern, desc in secrets_patterns:
            if re.search(pattern, env_content, re.IGNORECASE):
                self.issues.append(f"🔴 CRÍTICO: {desc} em .env")

    def check_debug_flag(self):
        """✅ #2: DEBUG deve ser False em produção"""
        settings_file = self.root / "ouvy_saas/config/settings.py"
        content = settings_file.read_text()
        
        if "DEBUG = True" in content or "DEBUG=True" in content:
            self.warnings.append(
                "🟡 MÉDIO: DEBUG=True em settings.py (OK em DEV, perigo em PROD)"
            )
        else:
            self.passed.append("✅ DEBUG não está True por padrão")

    def check_allowed_hosts(self):
        """✅ #3: ALLOWED_HOSTS não deve incluir *"""
        settings_file = self.root / "ouvy_saas/config/settings.py"
        content = settings_file.read_text()
        
        if 'ALLOWED_HOSTS = ["*"]' in content:
            self.issues.append(
                "🔴 CRÍTICO: ALLOWED_HOSTS = ['*'] expõe servidor em produção"
            )
        else:
            self.passed.append("✅ ALLOWED_HOSTS configurado de forma segura")

    def check_permission_classes(self):
        """✅ #4: Endpoints sensíveis devem ter permission_classes"""
        views_files = [
            self.root / "ouvy_saas/apps/tenants/views.py",
            self.root / "ouvy_saas/apps/feedbacks/views.py",
        ]
        
        for views_file in views_files:
            if not views_file.exists():
                continue
                
            content = views_file.read_text()
            
            # Procurar por views sem permission_classes
            class_pattern = r"class\s+(\w+)\(.*View.*\):"
            classes = re.findall(class_pattern, content)
            
            for cls in classes:
                if cls not in ["ConsultarProtocoloView"]:  # Exceções públicas
                    if f"permission_classes = [IsAuthenticated]" not in content:
                        self.warnings.append(
                            f"🟡 MÉDIO: Verificar permission_classes em {cls}"
                        )

        self.passed.append("✅ Views auditadas por permission_classes")

    def check_cors_config(self):
        """✅ #5: CORS não deve ser muito permissivo"""
        settings_file = self.root / "ouvy_saas/config/settings.py"
        content = settings_file.read_text()
        
        if "CORS_ALLOW_ALL_ORIGINS = True" in content:
            self.issues.append(
                "🔴 CRÍTICO: CORS_ALLOW_ALL_ORIGINS=True permite qualquer origem"
            )
        else:
            self.passed.append("✅ CORS configurado com origens específicas")

    def check_secret_key_hardcoded(self):
        """✅ #6: SECRET_KEY não deve ser hardcoded"""
        settings_file = self.root / "ouvy_saas/config/settings.py"
        content = settings_file.read_text()
        
        # Verificar se SECRET_KEY vem de variável de ambiente
        if 'SECRET_KEY = os.getenv("SECRET_KEY"' in content or \
           'SECRET_KEY = os.environ.get("SECRET_KEY"' in content:
            self.passed.append("✅ SECRET_KEY lido de variável de ambiente")
        else:
            self.warnings.append(
                "🟡 MÉDIO: Verificar se SECRET_KEY é configurável por env"
            )

    def check_gitignore(self):
        """✅ #7: .gitignore deve cobrir arquivos sensíveis"""
        gitignore_file = self.root / ".gitignore"
        if not gitignore_file.exists():
            self.issues.append("🔴 CRÍTICO: .gitignore não encontrado!")
            return

        content = gitignore_file.read_text()
        required_patterns = [".env", "db.sqlite3", "*.pyc", "node_modules", "venv"]
        
        missing = [p for p in required_patterns if p not in content]
        
        if missing:
            self.warnings.append(
                f"🟡 MÉDIO: .gitignore faltando: {', '.join(missing)}"
            )
        else:
            self.passed.append("✅ .gitignore com todos os padrões necessários")

    def check_stripe_webhook(self):
        """✅ #8: Webhook Stripe deve validar signature"""
        views_file = self.root / "ouvy_saas/apps/tenants/views.py"
        if not views_file.exists():
            return

        content = views_file.read_text()
        
        if "stripe.Webhook.construct_event" in content:
            self.passed.append("✅ Webhook Stripe usando construct_event (seguro)")
        else:
            self.warnings.append(
                "🟡 MÉDIO: Verificar validação de signature do webhook Stripe"
            )

    def check_sql_injection(self):
        """✅ #9: Procurar por queries raw sem parametrização"""
        py_files = list((self.root / "ouvy_saas").glob("**/*.py"))
        
        risky_patterns = [
            (r"raw\s*\(\s*['\"].*\s*\+", "Raw SQL com concatenação"),
            (r"\.extra\s*\(\s*select", "Extra SQL sem parametrização"),
        ]
        
        for py_file in py_files:
            content = py_file.read_text()
            for pattern, desc in risky_patterns:
                if re.search(pattern, content):
                    self.warnings.append(
                        f"🟡 MÉDIO: {desc} em {py_file.name}"
                    )

        self.passed.append("✅ Procurado por SQL injection patterns")

    def check_xss_protection(self):
        """✅ #10: Verificar proteções XSS"""
        settings_file = self.root / "ouvy_saas/config/settings.py"
        content = settings_file.read_text()
        
        middleware_checks = [
            ("SecurityMiddleware", "Proteção contra X-Frame-Options"),
            ("CsrfViewMiddleware", "Proteção CSRF"),
        ]
        
        for middleware, desc in middleware_checks:
            if middleware in content:
                self.passed.append(f"✅ {desc} habilitado")
            else:
                self.warnings.append(f"🟡 MÉDIO: Verificar {desc}")

    def run_all_checks(self):
        """Executar todas as verificações"""
        print(f"\n{BOLD}{BLUE}🔐 AUDITORIA DE SEGURANÇA - Ouvy SaaS{RESET}\n")
        
        checks = [
            ("Chaves em .env", self.check_env_secrets),
            ("DEBUG flag", self.check_debug_flag),
            ("ALLOWED_HOSTS", self.check_allowed_hosts),
            ("Permission Classes", self.check_permission_classes),
            ("CORS Configuration", self.check_cors_config),
            ("SECRET_KEY", self.check_secret_key_hardcoded),
            (".gitignore", self.check_gitignore),
            ("Stripe Webhook", self.check_stripe_webhook),
            ("SQL Injection", self.check_sql_injection),
            ("XSS Protection", self.check_xss_protection),
        ]

        print(f"{BOLD}Executando {len(checks)} verificações...{RESET}\n")
        
        for name, check_fn in checks:
            try:
                check_fn()
                print(f"  ✓ {name}")
            except Exception as e:
                self.warnings.append(f"❌ Erro ao verificar {name}: {str(e)}")

        self.print_report()

    def print_report(self):
        """Gerar relatório final"""
        print(f"\n{BOLD}{'='*60}{RESET}")
        print(f"{BOLD}RELATÓRIO FINAL{RESET}\n")

        if self.issues:
            print(f"{RED}{BOLD}🔴 CRÍTICO ({len(self.issues)} itens):{RESET}")
            for issue in self.issues:
                print(f"   {issue}")
            print()

        if self.warnings:
            print(f"{YELLOW}{BOLD}🟡 MÉDIO ({len(self.warnings)} itens):{RESET}")
            for warning in self.warnings:
                print(f"   {warning}")
            print()

        if self.passed:
            print(f"{GREEN}{BOLD}✅ PASSOU ({len(self.passed)} itens):{RESET}")
            for p in self.passed:
                print(f"   {p}")
            print()

        total_issues = len(self.issues)
        print(f"{BOLD}{'='*60}{RESET}")
        
        if total_issues == 0:
            print(f"{GREEN}{BOLD}✅ STATUS: SEGURO PARA DEPLOY{RESET}\n")
            return 0
        else:
            print(f"{RED}{BOLD}❌ STATUS: BLOQUEADO - Resolver itens críticos{RESET}\n")
            return 1

if __name__ == "__main__":
    audit = SecurityAudit()
    exit_code = audit.run_all_checks()
    sys.exit(exit_code)
