#!/usr/bin/env python3
"""
Configurações de cenários de teste de carga para OUVY SaaS
"""
import os
from typing import Dict, List

# Configurações base
BASE_CONFIG = {
    "host": "http://localhost:8000",
    "results_dir": "results",
    "csv_prefix": "load_test_results"
}

# Cenários de teste pré-definidos
TEST_SCENARIOS = {
    "smoke_test": {
        "name": "Teste de Fumaça",
        "description": "Teste rápido para verificar se a aplicação está funcionando",
        "users": 5,
        "spawn_rate": 1,
        "run_time": "10s",
        "expected_rps": 10,  # requests per second esperados
        "max_response_time": 1000,  # ms
        "max_failures_percent": 1.0
    },

    "basic_load": {
        "name": "Carga Básica",
        "description": "Teste de carga normal para validar performance",
        "users": 20,
        "spawn_rate": 2,
        "run_time": "1m",
        "expected_rps": 25,
        "max_response_time": 2000,
        "max_failures_percent": 5.0
    },

    "stress_test": {
        "name": "Teste de Stress",
        "description": "Teste de alta carga para encontrar limites",
        "users": 100,
        "spawn_rate": 10,
        "run_time": "2m",
        "expected_rps": 50,
        "max_response_time": 5000,
        "max_failures_percent": 10.0
    },

    "endurance_test": {
        "name": "Teste de Endurance",
        "description": "Teste prolongado com carga moderada",
        "users": 30,
        "spawn_rate": 3,
        "run_time": "10m",
        "expected_rps": 30,
        "max_response_time": 3000,
        "max_failures_percent": 3.0
    },

    "spike_test": {
        "name": "Teste de Spike",
        "description": "Simula picos repentinos de tráfego",
        "phases": [
            {"users": 10, "spawn_rate": 2, "duration": "30s"},
            {"users": 200, "spawn_rate": 50, "duration": "1m"},
            {"users": 20, "spawn_rate": 10, "duration": "1m"}
        ],
        "expected_rps": 100,
        "max_response_time": 8000,
        "max_failures_percent": 15.0
    },

    "scalability_test": {
        "name": "Teste de Escalabilidade",
        "description": "Teste gradual de aumento de carga",
        "user_steps": [5, 10, 25, 50, 75, 100],
        "spawn_rate_multiplier": 0.5,  # spawn_rate = users * multiplier
        "step_duration": "30s",
        "expected_rps": 75,
        "max_response_time": 4000,
        "max_failures_percent": 8.0
    }
}

# Métricas críticas por endpoint
ENDPOINT_METRICS = {
    "/health/": {
        "critical": True,
        "max_response_time": 500,  # ms
        "expected_success_rate": 99.9
    },
    "/api/tenant-info/": {
        "critical": True,
        "max_response_time": 1000,
        "expected_success_rate": 99.5
    },
    "/api/analytics/": {
        "critical": False,
        "max_response_time": 3000,
        "expected_success_rate": 95.0
    },
    "/api/feedbacks/": {
        "critical": True,
        "max_response_time": 2000,
        "expected_success_rate": 98.0
    },
    "/api/feedbacks/protocolo/": {
        "critical": True,
        "max_response_time": 1500,
        "expected_success_rate": 99.0
    }
}

# Configurações de ambiente
ENV_CONFIGS = {
    "development": {
        "host": "http://localhost:8000",
        "database": "sqlite",
        "cache": "local",
        "expected_performance_multiplier": 1.0
    },
    "staging": {
        "host": os.getenv("STAGING_URL", "https://ouvy-staging.railway.app"),
        "database": "postgresql",
        "cache": "redis",
        "expected_performance_multiplier": 0.8
    },
    "production": {
        "host": os.getenv("PRODUCTION_URL", "https://ouvy-saas.com"),
        "database": "postgresql",
        "cache": "redis",
        "expected_performance_multiplier": 0.9
    }
}

def get_scenario_config(scenario_name: str) -> Dict:
    """Retorna configuração de um cenário específico"""
    return TEST_SCENARIOS.get(scenario_name, TEST_SCENARIOS["basic_load"])

def get_endpoint_config(endpoint: str) -> Dict:
    """Retorna configuração de métricas para um endpoint"""
    return ENDPOINT_METRICS.get(endpoint, {
        "critical": False,
        "max_response_time": 5000,
        "expected_success_rate": 90.0
    })

def get_env_config(env: str = "development") -> Dict:
    """Retorna configuração para um ambiente específico"""
    return ENV_CONFIGS.get(env, ENV_CONFIGS["development"])

def validate_test_results(stats, scenario_config):
    """
    Valida se os resultados do teste atendem aos critérios esperados

    Args:
        stats: Estatísticas do Locust
        scenario_config: Configuração do cenário

    Returns:
        tuple: (passed: bool, issues: List[str])
    """
    issues = []
    passed = True

    # Verificar taxa de falha
    failure_rate = (stats.num_failures / stats.num_requests) * 100 if stats.num_requests > 0 else 0
    if failure_rate > scenario_config.get("max_failures_percent", 5.0):
        passed = False
        issues.append(".1f")

    # Verificar tempo médio de resposta
    avg_response_time = stats.avg_response_time
    if avg_response_time > scenario_config.get("max_response_time", 5000):
        passed = False
        issues.append(".1f")

    # Verificar RPS mínimo esperado
    actual_rps = stats.total_rps
    expected_rps = scenario_config.get("expected_rps", 10)
    if actual_rps < expected_rps * 0.5:  # Pelo menos 50% do esperado
        passed = False
        issues.append(".1f")

    return passed, issues