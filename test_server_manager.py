#!/usr/bin/env python3
"""
Script para iniciar servidor Django automaticamente durante testes de carga
"""
import os
import sys
import subprocess
import time
import signal
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent / 'ouvy_saas'

class DjangoServerManager:
    """Gerenciador do servidor Django para testes"""

    def __init__(self, host="localhost", port=8000):
        self.host = host
        self.port = port
        self.url = f"http://{host}:{port}"
        self.process = None

    def start_server(self, timeout=30):
        """Inicia o servidor Django"""
        print(f"🚀 Iniciando servidor Django em {self.url}...")

        # Mudar para diretório do projeto
        os.chdir(BASE_DIR)

        # Comando para iniciar servidor
        cmd = [
            sys.executable, "manage.py", "runserver",
            f"{self.host}:{self.port}",
            "--noreload",  # Evitar processo filho
            "--verbosity=0"  # Menos verbose
        ]

        try:
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid  # Criar novo grupo de processo
            )

            # Aguardar servidor iniciar
            print("⏳ Aguardando servidor iniciar...")
            start_time = time.time()

            while time.time() - start_time < timeout:
                try:
                    response = requests.get(f"{self.url}/health/", timeout=2)
                    if response.status_code == 200:
                        print("✅ Servidor Django iniciado com sucesso!")
                        return True
                except:
                    pass

                time.sleep(1)

            print("❌ Timeout: Servidor não iniciou dentro do tempo limite")
            self.stop_server()
            return False

        except Exception as e:
            print(f"❌ Erro ao iniciar servidor: {e}")
            return False

    def stop_server(self):
        """Para o servidor Django"""
        if self.process:
            print("🛑 Parando servidor Django...")
            try:
                # Terminar grupo de processo
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                self.process.wait(timeout=10)
                print("✅ Servidor parado")
            except subprocess.TimeoutExpired:
                print("⚠️  Servidor não respondeu, forçando parada...")
                os.killpg(os.getpgid(self.process.pid), signal.SIGKILL)
            except Exception as e:
                print(f"⚠️  Erro ao parar servidor: {e}")
            finally:
                self.process = None

    def is_running(self):
        """Verifica se o servidor está rodando"""
        try:
            response = requests.get(f"{self.url}/health/", timeout=2)
            return response.status_code == 200
        except:
            return False

    def __enter__(self):
        self.start_server()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop_server()


def run_tests_with_server(test_function, server_host="localhost", server_port=8000):
    """
    Executa testes com servidor Django automático

    Args:
        test_function: Função que executa os testes
        server_host: Host do servidor
        server_port: Porta do servidor
    """
    with DjangoServerManager(server_host, server_port) as server:
        if server.is_running():
            print("🧪 Executando testes...")
            return test_function()
        else:
            print("❌ Não foi possível iniciar o servidor para testes")
            return False


if __name__ == "__main__":
    # Exemplo de uso
    def example_test():
        print("✅ Teste executado com servidor automático!")
        return True

    success = run_tests_with_server(example_test)
    print(f"Resultado: {'✅ Sucesso' if success else '❌ Falha'}")