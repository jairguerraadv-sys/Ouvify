# OUVY SaaS - Testes de Performance e Carga

Este diretório contém ferramentas para testes de performance e carga do OUVY SaaS usando Locust.

## 📋 Visão Geral

O sistema de testes de carga foi implementado para validar a performance da aplicação sob diferentes cenários de uso, garantindo que o OUVY SaaS possa lidar com o tráfego esperado em produção.

## 🛠️ Componentes

### Arquivos Principais

- **`locustfile.py`** - Configuração principal do Locust com cenários de teste
- **`run_load_tests.py`** - Script interativo para executar diferentes tipos de teste
- **`load_test_config.py`** - Configurações de cenários e métricas esperadas
- **`test_server_manager.py`** - Gerenciador automático do servidor Django
- **`requirements_load_testing.txt`** - Dependências para testes de carga

### Diretórios

- **`results/`** - Resultados dos testes em formato CSV

## 🚀 Como Usar

### 1. Instalação das Dependências

```bash
pip install -r requirements_load_testing.txt
```

### 2. Executar Testes Interativos

```bash
python run_load_tests.py
```

O script oferece as seguintes opções:
- **Teste Básico**: 10 usuários por 30 segundos
- **Teste de Stress**: 50 usuários por 1 minuto
- **Teste de Endurance**: 20 usuários por 5 minutos
- **Teste de Spike**: Simula picos de carga
- **Teste de Escalabilidade**: Aumento gradual de 5-100 usuários
- **Executar Todos**: Roda todos os cenários sequencialmente

### 3. Executar Testes Direto com Locust

```bash
# Teste básico
locust -f locustfile.py --host http://localhost:8000 --users 10 --spawn-rate 2 --run-time 30s --headless

# Com interface web (para análise detalhada)
locust -f locustfile.py --host http://localhost:8000
```

### 4. Executar Testes Programaticamente

```python
from run_load_tests import run_stress_test, run_endurance_test

# Executar teste de stress
success = run_stress_test()

# Executar teste de endurance
success = run_endurance_test()
```

## 📊 Cenários de Teste

### 1. Teste de Fumaça
- **Objetivo**: Verificar funcionamento básico
- **Carga**: 5 usuários, 1/s, 10 segundos
- **Métricas Esperadas**: < 1% falhas, < 1000ms resposta

### 2. Carga Básica
- **Objetivo**: Performance em condições normais
- **Carga**: 20 usuários, 2/s, 1 minuto
- **Métricas Esperadas**: < 5% falhas, < 2000ms resposta, > 25 RPS

### 3. Teste de Stress
- **Objetivo**: Encontrar limites da aplicação
- **Carga**: 100 usuários, 10/s, 2 minutos
- **Métricas Esperadas**: < 10% falhas, < 5000ms resposta, > 50 RPS

### 4. Teste de Endurance
- **Objetivo**: Performance em carga prolongada
- **Carga**: 30 usuários, 3/s, 10 minutos
- **Métricas Esperadas**: < 3% falhas, < 3000ms resposta, > 30 RPS

### 5. Teste de Spike
- **Objetivo**: Simular picos repentinos de tráfego
- **Carga**: 10→200→20 usuários em fases
- **Métricas Esperadas**: < 15% falhas, < 8000ms resposta, > 100 RPS

### 6. Teste de Escalabilidade
- **Objetivo**: Validar crescimento gradual de carga
- **Carga**: 5→10→25→50→75→100 usuários
- **Métricas Esperadas**: < 8% falhas, < 4000ms resposta, > 75 RPS

## 🎯 Endpoints Testados

| Endpoint | Peso | Crítico | Tempo Máx (ms) | Taxa Sucesso (%) |
|----------|------|---------|----------------|------------------|
| `/health/` | 3 | ✅ | 500 | 99.9 |
| `/api/tenant-info/` | 2 | ✅ | 1000 | 99.5 |
| `/api/analytics/` | 1 | ❌ | 3000 | 95.0 |
| `/api/feedbacks/` | 2 | ✅ | 2000 | 98.0 |
| `/api/feedbacks/protocolo/` | 1 | ✅ | 1500 | 99.0 |

## 📈 Métricas Monitoradas

### Principais Métricas
- **RPS (Requests per Second)**: Taxa de requisições processadas
- **Tempo Médio de Resposta**: Latência média das requisições
- **Taxa de Falha**: Percentual de requisições com erro
- **Percentis de Resposta**: P50, P95, P99

### Métricas por Endpoint
- Distribuição de tempo de resposta
- Taxa de sucesso por endpoint
- Número de requisições por segundo

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# URLs de diferentes ambientes
STAGING_URL=https://ouvy-staging.railway.app
PRODUCTION_URL=https://ouvy-saas.com

# Configurações do Locust
LOCUST_USERS=20
LOCUST_SPAWN_RATE=2
LOCUST_RUN_TIME=60s
```

### Personalização de Cenários

Edite `load_test_config.py` para:
- Adicionar novos cenários de teste
- Modificar métricas esperadas
- Configurar endpoints específicos
- Ajustar configurações por ambiente

## 📊 Análise de Resultados

### Arquivos de Saída
- **`results/load_test_results_stats.csv`**: Estatísticas gerais
- **`results/load_test_results_failures.csv`**: Requisições com falha
- **`results/load_test_results_exceptions.csv`**: Exceções ocorridas

### Interpretação
- **RPS Estável**: Aplicação mantendo performance
- **Tempo de Resposta Consistente**: Boa experiência do usuário
- **Baixa Taxa de Falha**: Sistema confiável
- **Escalabilidade Linear**: Boa arquitetura

## 🚨 Alertas e Limites

### Limites Críticos
- Taxa de falha > 10%
- Tempo médio > 5000ms
- RPS < 50% do esperado

### Ações Recomendadas
1. **Otimização de Queries**: Database tuning
2. **Cache Implementation**: Redis/Memcached
3. **Horizontal Scaling**: Load balancer
4. **CDN**: Para assets estáticos
5. **Database Indexing**: Índices apropriados

## 🔄 Integração com CI/CD

### GitHub Actions Example

```yaml
- name: Load Testing
  run: |
    pip install -r requirements_load_testing.txt
    python run_load_tests.py --scenario basic_load --fail-on-threshold
```

### Railway Deploy Hooks

```bash
# Pós-deploy: executar smoke test
python run_load_tests.py --scenario smoke_test --quiet
```

## 📝 Boas Práticas

### Antes dos Testes
1. **Ambiente Limpo**: Database com dados de teste consistentes
2. **Monitoramento**: Métricas de sistema (CPU, memória, I/O)
3. **Baseline**: Executar testes em ambiente conhecido

### Durante os Testes
1. **Monitoramento Contínuo**: Logs e métricas em tempo real
2. **Isolamento**: Testes não afetam produção
3. **Reprodutibilidade**: Mesmo ambiente para testes repetidos

### Após os Testes
1. **Análise de Resultados**: Identificar gargalos
2. **Relatórios**: Documentar descobertas
3. **Ações Corretivas**: Implementar melhorias
4. **Re-testes**: Validar correções

## 🐛 Troubleshooting

### Problemas Comuns

**Servidor não inicia:**
```bash
# Verificar porta ocupada
lsof -i :8000

# Usar porta alternativa
python run_load_tests.py --port 8001
```

**Testes falham com erros de conexão:**
```bash
# Verificar conectividade
curl http://localhost:8000/health/

# Verificar configurações de firewall
```

**Performance inferior ao esperado:**
- Verificar configuração do database
- Checar índices das tabelas
- Analisar queries N+1
- Considerar cache implementation

## 📚 Referências

- [Locust Documentation](https://docs.locust.io/)
- [Django Performance Tips](https://docs.djangoproject.com/en/stable/topics/performance/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)