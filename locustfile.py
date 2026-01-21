#!/usr/bin/env python3
"""
Locust load testing configuration for OUVY SaaS
Tests critical endpoints under load to validate performance
"""
import os
import sys
from pathlib import Path
from locust import HttpUser, task, between, events
from locust.env import Environment
from locust.stats import print_stats
import json
import time

# Configurar Django para acesso aos modelos
BASE_DIR = Path(__file__).resolve().parent / 'ouvy_saas'
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Configurar ALLOWED_HOSTS para testes
os.environ['ALLOWED_HOSTS'] = 'localhost,127.0.0.1,testserver,.local'

import django
django.setup()

from django.contrib.auth.models import User
from apps.tenants.models import Client as TenantClient
from apps.feedbacks.models import Feedback


class OUVYSaaSUser(HttpUser):
    """
    Simula usuários interagindo com o OUVY SaaS
    """
    wait_time = between(1, 3)  # Tempo entre requisições: 1-3 segundos

    def on_start(self):
        """Executado quando o usuário virtual inicia"""
        # Criar ou obter usuário de teste
        self.user, created = User.objects.get_or_create(
            username=f'load_test_user_{self.__class__.__name__}_{id(self)}',
            defaults={'email': f'load_test_{id(self)}@example.com'}
        )

        # Fazer login via API (se necessário)
        # Por enquanto, vamos usar force_login no teste direto

    @task(3)  # Peso 3 - endpoint mais acessado
    def test_health_check(self):
        """Testa endpoint de health check"""
        with self.client.get("/health/", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(2)  # Peso 2
    def test_tenant_info(self):
        """Testa endpoint de informações do tenant"""
        headers = {'HTTP_HOST': 'empresaa.local'}
        with self.client.get("/api/tenant-info/", headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Tenant info failed: {response.status_code}")

    @task(1)  # Peso 1 - menos frequente
    def test_analytics(self):
        """Testa endpoint de analytics (requer autenticação)"""
        # Simular autenticação
        if hasattr(self, 'user'):
            self.client.force_login(self.user)

        with self.client.get("/api/analytics/", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Authentication required for analytics")
            else:
                response.failure(f"Analytics failed: {response.status_code}")

    @task(2)  # Peso 2
    def test_feedback_creation(self):
        """Testa criação de feedback"""
        headers = {'HTTP_HOST': 'empresaa.local'}
        feedback_data = {
            "titulo": f"Feedback de teste - Load {time.time()}",
            "descricao": "Teste de carga automatizado",
            "categoria": "performance",
            "prioridade": "media",
            "status": "aberto"
        }

        with self.client.post(
            "/api/feedbacks/",
            json=feedback_data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code in [201, 200]:
                response.success()
            else:
                response.failure(f"Feedback creation failed: {response.status_code}")

    @task(1)  # Peso 1
    def test_protocolo_consulta(self):
        """Testa consulta de protocolo (endpoint crítico)"""
        headers = {'HTTP_HOST': 'empresaa.local'}
        # Usar um protocolo que pode existir
        protocolo = "PROTO-TEST-001"

        with self.client.get(
            f"/api/feedbacks/protocolo/{protocolo}/",
            headers=headers,
            catch_response=True
        ) as response:
            # 200 = encontrado, 404 = não encontrado (ambos válidos)
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Protocolo consulta failed: {response.status_code}")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Executado quando o teste começa"""
    print("🚀 Iniciando testes de carga do OUVY SaaS")
    print(f"📊 Usuários virtuais: {environment.parsed_options.num_users}")
    print(f"⏱️  Tempo de subida: {environment.parsed_options.spawn_rate} usuários/segundo")
    print(f"🕐 Duração: {environment.parsed_options.run_time} segundos")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Executado quando o teste termina"""
    print("✅ Testes de carga finalizados")
    print("📈 Estatísticas finais:")
    print_stats(environment.stats)


def run_load_test():
    """
    Executa teste de carga programaticamente
    """
    # Configuração do teste
    env = Environment(user_classes=[OUVYSaaSUser])

    # Configurações de teste
    env.create_local_runner()

    # Executar teste
    env.runner.start(10, spawn_rate=2)  # 10 usuários, 2 por segundo
    time.sleep(30)  # 30 segundos de teste
    env.runner.stop()

    # Exibir resultados
    print("\n" + "="*60)
    print("📊 RESULTADOS DO TESTE DE CARGA")
    print("="*60)
    print_stats(env.stats)


if __name__ == "__main__":
    # Executar teste quando chamado diretamente
    run_load_test()