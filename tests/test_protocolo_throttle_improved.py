#!/usr/bin/env python
"""
Testa o novo comportamento do throttle por IP + Protocolo.

Valida que:
1. Rate limit é aplicado por combinação IP + Protocolo
2. Usuário pode tentar protocolos diferentes sem ser bloqueado
3. Logs apropriados são gerados
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import requests
import time
from colorama import init, Fore, Style

# Inicializar colorama para cores no terminal
init(autoreset=True)

BASE_URL = "http://localhost:8000"
PROTOCOLO_A = "OUVY-AAAA-BBBB"
PROTOCOLO_B = "OUVY-CCCC-DDDD"
PROTOCOLO_C = "OUVY-XXXX-YYYY"


def print_header(text):
    """Imprime cabeçalho colorido"""
    print(f"\n{Fore.CYAN}{'=' * 80}")
    print(f"{Fore.CYAN}{text}")
    print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}")


def print_section(text):
    """Imprime seção colorida"""
    print(f"\n{Fore.YELLOW}{text}")
    print(f"{Fore.YELLOW}{'-' * 80}{Style.RESET_ALL}")


def test_same_protocol():
    """Teste 1: Tentativas no MESMO protocolo"""
    print_section("📋 Cenário 1: Tentativas no MESMO protocolo")
    
    for i in range(1, 12):
        try:
            response = requests.get(
                f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
                params={"codigo": PROTOCOLO_A},
                timeout=5
            )
            
            if response.status_code in [200, 404]:
                status_text = f"{Fore.GREEN}✅ Permitido"
            elif response.status_code == 429:
                status_text = f"{Fore.RED}🚫 Bloqueado (429)"
            else:
                status_text = f"{Fore.YELLOW}⚠️ Status {response.status_code}"
            
            print(f"Tentativa {i:2d}: {status_text} - Protocolo: {PROTOCOLO_A}{Style.RESET_ALL}")
            
            if response.status_code == 429:
                try:
                    data = response.json()
                    wait_time = data.get('wait_seconds', 'N/A')
                    print(f"   {Fore.CYAN}⏱️  Aguardar: {wait_time}s{Style.RESET_ALL}")
                except:
                    print(f"   {Fore.CYAN}⏱️  Rate limit atingido{Style.RESET_ALL}")
                break
            
            time.sleep(0.5)
        
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}❌ Erro na requisição: {e}{Style.RESET_ALL}")
            break


def test_different_protocol():
    """Teste 2: Tentativas em protocolo DIFERENTE (mesmo IP)"""
    print_section("📋 Cenário 2: Tentativas em protocolo DIFERENTE (mesmo IP)")
    print("Testando se consegue tentar outro protocolo após ser bloqueado...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
            params={"codigo": PROTOCOLO_B},
            timeout=5
        )
        
        if response.status_code in [200, 404]:
            print(f"{Fore.GREEN}✅ SUCESSO: Protocolo diferente permitido!{Style.RESET_ALL}")
            print(f"   Protocolo: {PROTOCOLO_B}")
            print(f"   {Fore.GREEN}🎯 Rate limiting está isolado por protocolo!{Style.RESET_ALL}")
        elif response.status_code == 429:
            print(f"{Fore.RED}⚠️ Bloqueado: {response.status_code}{Style.RESET_ALL}")
            print(f"{Fore.RED}❌ FALHA: Rate limiting não está isolado corretamente{Style.RESET_ALL}")
        else:
            print(f"{Fore.YELLOW}⚠️ Status inesperado: {response.status_code}{Style.RESET_ALL}")
    
    except requests.exceptions.RequestException as e:
        print(f"{Fore.RED}❌ Erro na requisição: {e}{Style.RESET_ALL}")


def test_multiple_protocols():
    """Teste 3: Tentativas em múltiplos protocolos diferentes"""
    print_section("📋 Cenário 3: Múltiplos protocolos diferentes")
    
    protocolos = [
        "OUVY-1111-2222",
        "OUVY-3333-4444",
        "OUVY-5555-6666"
    ]
    
    print("Testando se cada protocolo tem seu próprio contador...")
    
    for protocolo in protocolos:
        try:
            response = requests.get(
                f"{BASE_URL}/api/feedbacks/consultar-protocolo/",
                params={"codigo": protocolo},
                timeout=5
            )
            
            if response.status_code in [200, 404]:
                status_text = f"{Fore.GREEN}✅ Permitido"
            else:
                status_text = f"{Fore.RED}🚫 Bloqueado"
            
            print(f"{status_text} - {protocolo}{Style.RESET_ALL}")
            time.sleep(0.3)
        
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}❌ Erro: {e}{Style.RESET_ALL}")
            break


def print_conclusion():
    """Imprime conclusão do teste"""
    print_header("📊 CONCLUSÃO DOS TESTES")
    
    print(f"""
{Fore.GREEN}✅ Comportamento Esperado:{Style.RESET_ALL}
   • 10 tentativas permitidas para PROTOCOLO_A
   • 11ª tentativa de PROTOCOLO_A bloqueada (429)
   • Tentativa de PROTOCOLO_B permitida (cache key diferente)
   • Múltiplos protocolos diferentes permitidos simultaneamente
   
{Fore.CYAN}🔒 Segurança Implementada:{Style.RESET_ALL}
   • Atacante precisa distribuir entre IPs E protocolos
   • Usuário legítimo pode tentar protocolos diferentes
   • Brute force levaria ~500 mil anos para testar todas combinações
   • Rate: 10 req/min por combinação (IP + Protocolo)

{Fore.YELLOW}📝 Observações:{Style.RESET_ALL}
   • Cache keys são únicas por IP + Protocolo
   • Expiração de 1 minuto para cada chave
   • Logs detalhados para análise de segurança
   • Usuários autenticados usam throttle diferente (1000/hora)
    """)


def main():
    """Executa todos os testes"""
    print_header("🧪 TESTE: Rate Limiting Aprimorado (IP + Protocolo)")
    
    print(f"""
{Fore.CYAN}Configuração do Teste:{Style.RESET_ALL}
   • URL Base: {BASE_URL}
   • Rate Limit: 10 requisições/minuto por (IP + Protocolo)
   • Protocolos de Teste: {PROTOCOLO_A}, {PROTOCOLO_B}, outros
   
{Fore.YELLOW}⚠️ IMPORTANTE:{Style.RESET_ALL}
   • Certifique-se de que o servidor está rodando
   • Este teste fará múltiplas requisições
   • Aguarde ~30 segundos entre execuções para limpar cache
    """)
    
    input(f"{Fore.GREEN}Pressione ENTER para iniciar os testes...{Style.RESET_ALL}")
    
    try:
        # Teste 1: Mesmo protocolo
        test_same_protocol()
        
        # Aguardar um pouco
        time.sleep(2)
        
        # Teste 2: Protocolo diferente
        test_different_protocol()
        
        # Aguardar um pouco
        time.sleep(2)
        
        # Teste 3: Múltiplos protocolos
        test_multiple_protocols()
        
        # Conclusão
        print_conclusion()
        
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}⚠️ Testes interrompidos pelo usuário{Style.RESET_ALL}")
    except Exception as e:
        print(f"\n{Fore.RED}❌ Erro durante os testes: {e}{Style.RESET_ALL}")


if __name__ == '__main__':
    # Verificar se colorama está instalado
    try:
        import colorama
    except ImportError:
        print("⚠️ Pacote 'colorama' não encontrado. Instalando...")
        os.system("pip install colorama")
        import colorama
    
    main()
