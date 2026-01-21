#!/usr/bin/env python3
"""
Script para executar testes de carga no OUVY SaaS
Diferentes cenários de teste para validar performance
"""
import os
import sys
import subprocess
import time
from pathlib import Path
from test_server_manager import DjangoServerManager

BASE_DIR = Path(__file__).resolve().parent

def run_locust_test(users=10, spawn_rate=2, run_time="30s", host="http://localhost:8000"):
    """
    Executa teste de carga com Locust

    Args:
        users: Número de usuários virtuais
        spawn_rate: Taxa de criação de usuários por segundo
        run_time: Duração do teste (ex: "30s", "5m", "1h")
        host: URL base da aplicação
    """
    print(f"🚀 Iniciando teste de carga: {users} usuários, {spawn_rate}/s, duração {run_time}")

    cmd = [
        "locust",
        "-f", "locustfile.py",
        "--host", host,
        "--users", str(users),
        "--spawn-rate", str(spawn_rate),
        "--run-time", run_time,
        "--headless",  # Executar sem interface web
        "--csv", "results/load_test_results"  # Salvar resultados em CSV
    ]

    try:
        result = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True)
        print("✅ Teste concluído")
        print("📊 Saída do Locust:")
        print(result.stdout)
        if result.stderr:
            print("⚠️  Avisos/Erros:")
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Erro ao executar teste: {e}")
        return False

def run_stress_test():
    """Teste de stress - alta carga por curto período"""
    print("🔥 EXECUTANDO TESTE DE STRESS")
    return run_locust_test(users=50, spawn_rate=10, run_time="1m")

def run_endurance_test():
    """Teste de endurance - carga moderada por período longo"""
    print("🏃 EXECUTANDO TESTE DE ENDURANCE")
    return run_locust_test(users=20, spawn_rate=2, run_time="5m")

def run_spike_test():
    """Teste de spike - súbito aumento de carga"""
    print("⚡ EXECUTANDO TESTE DE SPIKE")
    # Primeiro: carga baixa
    print("📉 Fase 1: Carga baixa (10 usuários)")
    run_locust_test(users=10, spawn_rate=2, run_time="30s")

    # Spike: carga alta
    print("📈 Fase 2: Spike de carga (100 usuários)")
    run_locust_test(users=100, spawn_rate=20, run_time="1m")

    # Retorno à normalidade
    print("📉 Fase 3: Retorno à normalidade (20 usuários)")
    return run_locust_test(users=20, spawn_rate=5, run_time="1m")

def run_scalability_test():
    """Teste de escalabilidade - aumento gradual de carga"""
    print("📈 EXECUTANDO TESTE DE ESCALABILIDADE")

    test_results = []
    user_counts = [5, 10, 25, 50, 100]

    for users in user_counts:
        print(f"🧪 Testando com {users} usuários...")
        success = run_locust_test(users=users, spawn_rate=min(users//2, 10), run_time="30s")
        test_results.append((users, success))

        if not success:
            print(f"❌ Falhou no teste com {users} usuários")
            break

        time.sleep(5)  # Pausa entre testes

    return test_results

def create_results_directory():
    """Cria diretório para salvar resultados"""
    results_dir = BASE_DIR / "results"
    results_dir.mkdir(exist_ok=True)
    return results_dir

def main():
    """Função principal"""
    print("🔧 OUVY SaaS - Testes de Performance e Carga")
    print("=" * 50)

    # Criar diretório de resultados
    create_results_directory()

    # Usar gerenciador automático do servidor
    with DjangoServerManager() as server:
        if not server.is_running():
            print("❌ Não foi possível iniciar o servidor Django")
            return False

        print("✅ Servidor Django pronto para testes")
        print(f"🌐 URL: {server.url}")

        # Menu de opções
        print("\n📋 Cenários de teste disponíveis:")
        print("1. Teste Básico (10 usuários, 30s)")
        print("2. Teste de Stress (50 usuários, 1min)")
        print("3. Teste de Endurance (20 usuários, 5min)")
        print("4. Teste de Spike (simula picos de carga)")
        print("5. Teste de Escalabilidade (5-100 usuários)")
        print("6. Executar todos os testes")

        choice = input("\nEscolha o teste (1-6): ").strip()

        success = False

        if choice == "1":
            success = run_locust_test()
        elif choice == "2":
            success = run_stress_test()
        elif choice == "3":
            success = run_endurance_test()
        elif choice == "4":
            success = run_spike_test()
        elif choice == "5":
            results = run_scalability_test()
            success = all(result[1] for result in results)
        elif choice == "6":
            print("🔄 Executando todos os testes...")
            tests = [
                ("Básico", lambda: run_locust_test()),
                ("Stress", run_stress_test),
                ("Endurance", run_endurance_test),
                ("Spike", run_spike_test),
                ("Escalabilidade", lambda: all(r[1] for r in run_scalability_test())),
            ]

            results = []
            for test_name, test_func in tests:
                print(f"\n{'='*20} {test_name} {'='*20}")
                result = test_func()
                results.append((test_name, result))

            success = all(result[1] for result in results)
            print(f"\n📊 RESULTADO GERAL: {'✅ APROVADO' if success else '❌ REPROVADO'}")
        else:
            print("❌ Opção inválida")
            return False

        if success:
            print("\n🎉 Todos os testes passaram!")
            print("📁 Resultados salvos em: results/")
        else:
            print("\n❌ Alguns testes falharam")
            print("🔍 Verifique os logs acima para detalhes")

        return success

if __name__ == "__main__":
    main()