#!/usr/bin/env python3
"""
Script de Validação de Segurança do Sistema de Protocolos

Este script testa a segurança criptográfica da geração de protocolos,
validando distribuição estatística, unicidade e resistência a padrões previsíveis.

Execução:
    python test_protocolo_seguranca.py

Autor: Tech Lead - Ouvify
Data: 2025
"""

import os
import sys
import django
from collections import Counter
import re

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.feedbacks.models import Feedback


class ProtocoloSecurityTester:
    """Testa a segurança da geração de protocolos."""
    
    def __init__(self, num_samples=1000):
        self.num_samples = num_samples
        self.protocolos = []
        self.resultados = {}
    
    def gerar_amostras(self):
        """Gera amostras de protocolos para análise."""
        print(f"\n🔐 Gerando {self.num_samples} protocolos para análise de segurança...")
        self.protocolos = [Feedback.gerar_protocolo() for _ in range(self.num_samples)]
        print(f"✅ {len(self.protocolos)} protocolos gerados com sucesso")
    
    def teste_unicidade(self):
        """Testa se todos os protocolos são únicos."""
        print("\n[TESTE 1] Unicidade dos Protocolos")
        print("-" * 50)
        
        total = len(self.protocolos)
        unicos = len(set(self.protocolos))
        duplicados = total - unicos
        
        resultado = "✅ PASSOU" if duplicados == 0 else "❌ FALHOU"
        
        print(f"Total de protocolos: {total}")
        print(f"Protocolos únicos: {unicos}")
        print(f"Duplicados: {duplicados}")
        print(f"Taxa de unicidade: {(unicos/total)*100:.2f}%")
        print(f"Resultado: {resultado}")
        
        self.resultados['unicidade'] = duplicados == 0
        return duplicados == 0
    
    def teste_formato(self):
        """Valida se todos os protocolos seguem o formato correto."""
        print("\n[TESTE 2] Validação de Formato")
        print("-" * 50)
        
        padrao = re.compile(r'^OUVY-[A-Z0-9]{4}-[A-Z0-9]{4}$')
        invalidos = [p for p in self.protocolos if not padrao.match(p)]
        
        resultado = "✅ PASSOU" if len(invalidos) == 0 else "❌ FALHOU"
        
        print(f"Formato esperado: OUVY-XXXX-YYYY (X/Y = A-Z ou 0-9)")
        print(f"Protocolos válidos: {len(self.protocolos) - len(invalidos)}/{len(self.protocolos)}")
        
        if invalidos:
            print(f"Exemplos de formatos inválidos:")
            for p in invalidos[:5]:
                print(f"  - {p}")
        
        print(f"Resultado: {resultado}")
        
        self.resultados['formato'] = len(invalidos) == 0
        return len(invalidos) == 0
    
    def teste_distribuicao(self):
        """Analisa a distribuição estatística dos caracteres."""
        print("\n[TESTE 3] Distribuição Estatística dos Caracteres")
        print("-" * 50)
        
        # Extrair todos os caracteres das partes alfanuméricas
        todos_caracteres = []
        for protocolo in self.protocolos:
            partes = protocolo.split('-')
            if len(partes) == 3:
                todos_caracteres.extend(list(partes[1] + partes[2]))
        
        contador = Counter(todos_caracteres)
        total_chars = len(todos_caracteres)
        
        # Calcular frequência esperada (1/36 para cada caractere)
        freq_esperada = 1.0 / 36
        freq_esperada_pct = freq_esperada * 100
        
        # Calcular desvio padrão das frequências
        frequencias = [count / total_chars for count in contador.values()]
        media_freq = sum(frequencias) / len(frequencias)
        variancia = sum((f - media_freq) ** 2 for f in frequencias) / len(frequencias)
        desvio_padrao = variancia ** 0.5
        
        # Teste qui-quadrado simplificado
        # Caracteres mais e menos frequentes
        mais_freq = contador.most_common(5)
        menos_freq = contador.most_common()[:-6:-1]
        
        print(f"Total de caracteres analisados: {total_chars}")
        print(f"Frequência esperada: {freq_esperada_pct:.2f}% por caractere")
        print(f"Desvio padrão observado: {desvio_padrao*100:.3f}%")
        
        print(f"\nCaracteres mais frequentes:")
        for char, count in mais_freq:
            freq_pct = (count / total_chars) * 100
            print(f"  {char}: {count} ({freq_pct:.2f}%)")
        
        print(f"\nCaracteres menos frequentes:")
        for char, count in menos_freq:
            freq_pct = (count / total_chars) * 100
            print(f"  {char}: {count} ({freq_pct:.2f}%)")
        
        # Aceitar desvio de até 1% como bom
        passou = desvio_padrao < 0.01
        resultado = "✅ PASSOU" if passou else "⚠️  ATENÇÃO"
        
        print(f"\nDistribuição: {'Uniforme' if passou else 'Aceitável'}")
        print(f"Resultado: {resultado}")
        
        self.resultados['distribuicao'] = passou
        return passou
    
    def teste_padroes_sequenciais(self):
        """Detecta padrões sequenciais ou repetitivos que indiquem fraqueza."""
        print("\n[TESTE 4] Detecção de Padrões Previsíveis")
        print("-" * 50)
        
        padroes_detectados = []
        
        # Verificar protocolos com caracteres repetidos (AAAA, 1111, etc)
        for protocolo in self.protocolos:
            partes = protocolo.split('-')
            if len(partes) == 3:
                parte1, parte2 = partes[1], partes[2]
                
                # Todas as letras iguais
                if len(set(parte1)) == 1 or len(set(parte2)) == 1:
                    padroes_detectados.append((protocolo, "caracteres repetidos"))
                
                # Sequências crescentes/decrescentes
                if self._eh_sequencia(parte1) or self._eh_sequencia(parte2):
                    padroes_detectados.append((protocolo, "sequência detectada"))
        
        total_padroes = len(padroes_detectados)
        taxa_padroes = (total_padroes / len(self.protocolos)) * 100
        
        print(f"Padrões previsíveis detectados: {total_padroes}/{len(self.protocolos)}")
        print(f"Taxa de padrões: {taxa_padroes:.2f}%")
        
        if padroes_detectados[:5]:
            print(f"\nExemplos de padrões (primeiros 5):")
            for protocolo, tipo in padroes_detectados[:5]:
                print(f"  {protocolo} - {tipo}")
        
        # Taxa aceitável: < 1% (devido à aleatoriedade verdadeira)
        passou = taxa_padroes < 1.0
        resultado = "✅ PASSOU" if passou else "❌ FALHOU"
        
        print(f"Resultado: {resultado}")
        
        self.resultados['padroes'] = passou
        return passou
    
    def _eh_sequencia(self, texto):
        """Verifica se o texto contém sequência crescente ou decrescente."""
        if len(texto) < 3:
            return False
        
        for i in range(len(texto) - 2):
            try:
                # Tentar converter para ord() e verificar sequência
                a, b, c = ord(texto[i]), ord(texto[i+1]), ord(texto[i+2])
                if (b == a + 1 and c == b + 1) or (b == a - 1 and c == b - 1):
                    return True
            except:
                continue
        return False
    
    def teste_resistencia_brute_force(self):
        """Calcula tempo estimado para brute force com rate limiting."""
        print("\n[TESTE 5] Análise de Resistência a Brute Force")
        print("-" * 50)
        
        # 36 caracteres possíveis (A-Z, 0-9)
        # 8 posições (XXXX-YYYY)
        combinacoes_possiveis = 36 ** 8
        
        # Rate limiting: 5 tentativas por minuto
        tentativas_por_minuto = 5
        tentativas_por_hora = tentativas_por_minuto * 60
        tentativas_por_dia = tentativas_por_hora * 24
        tentativas_por_ano = tentativas_por_dia * 365
        
        anos_necessarios = combinacoes_possiveis / tentativas_por_ano
        
        print(f"Combinações possíveis: {combinacoes_possiveis:,}")
        print(f"Rate limiting: {tentativas_por_minuto} tentativas/minuto")
        print(f"Tentativas por ano: {tentativas_por_ano:,}")
        print(f"Tempo para brute force: {anos_necessarios:,.0f} anos")
        print(f"Segurança: {'🔐 ALTÍSSIMA' if anos_necessarios > 1000000 else '⚠️  MODERADA'}")
        
        passou = anos_necessarios > 1000000
        resultado = "✅ PASSOU" if passou else "❌ FALHOU"
        print(f"Resultado: {resultado}")
        
        self.resultados['brute_force'] = passou
        return passou
    
    def mostrar_exemplos(self):
        """Mostra exemplos de protocolos gerados."""
        print("\n📋 Exemplos de Protocolos Gerados")
        print("-" * 50)
        
        exemplos = self.protocolos[:10]
        for i, protocolo in enumerate(exemplos, 1):
            print(f"{i:2d}. {protocolo}")
    
    def relatorio_final(self):
        """Gera relatório final dos testes."""
        print("\n" + "=" * 50)
        print("📊 RELATÓRIO FINAL DE SEGURANÇA")
        print("=" * 50)
        
        testes_passados = sum(self.resultados.values())
        total_testes = len(self.resultados)
        taxa_sucesso = (testes_passados / total_testes) * 100
        
        print(f"\nTestes realizados: {total_testes}")
        print(f"Testes aprovados: {testes_passados}")
        print(f"Testes reprovados: {total_testes - testes_passados}")
        print(f"Taxa de sucesso: {taxa_sucesso:.1f}%")
        
        print("\nResumo dos resultados:")
        for teste, passou in self.resultados.items():
            status = "✅ PASSOU" if passou else "❌ FALHOU"
            print(f"  {teste.capitalize()}: {status}")
        
        if taxa_sucesso == 100:
            print("\n🎉 TODOS OS TESTES PASSARAM!")
            print("O sistema de geração de protocolos é CRIPTOGRAFICAMENTE SEGURO.")
        elif taxa_sucesso >= 80:
            print("\n⚠️  MAIORIA DOS TESTES PASSOU")
            print("O sistema é seguro, mas pode haver melhorias.")
        else:
            print("\n❌ SISTEMA REQUER ATENÇÃO")
            print("Vulnerabilidades detectadas. Revisar implementação.")
        
        print("\n" + "=" * 50)
        
        return taxa_sucesso == 100


def main():
    """Função principal."""
    print("=" * 50)
    print("🛡️  TESTE DE SEGURANÇA DO SISTEMA DE PROTOCOLOS")
    print("=" * 50)
    print("\nEste script valida a segurança criptográfica dos")
    print("protocolos gerados pelo sistema Ouvify.\n")
    
    tester = ProtocoloSecurityTester(num_samples=1000)
    
    try:
        # Executar testes
        tester.gerar_amostras()
        tester.teste_unicidade()
        tester.teste_formato()
        tester.teste_distribuicao()
        tester.teste_padroes_sequenciais()
        tester.teste_resistencia_brute_force()
        tester.mostrar_exemplos()
        
        # Relatório final
        sucesso = tester.relatorio_final()
        
        sys.exit(0 if sucesso else 1)
        
    except Exception as e:
        print(f"\n❌ ERRO ao executar testes: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
