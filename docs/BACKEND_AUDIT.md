# Auditoria do Backend - Guia de Execução

## Visão Geral

Este documento descreve como executar a auditoria determinística do backend Django do Ouvify em um ambiente limpo (CI ou local), garantindo que todas as dependências sejam instaladas corretamente antes de executar verificações.

## Pré-requisitos

- Python 3.12+
- Git
- Acesso ao repositório Ouvify

## Execução Rápida

### Método 1: Via Makefile (Recomendado)

```bash
cd /caminho/para/Ouvify
make audit-backend
```

### Método 2: Execução Direta do Script

```bash
cd /caminho/para/Ouvify
bash scripts/audit_backend.sh
```

## O que o Script Faz

O script `audit_backend.sh` executa as seguintes etapas automaticamente:

### 1. **Configuração do Ambiente**
   - Cria ou reutiliza um virtualenv em `apps/backend/.venv`
   - Atualiza o pip para a versão mais recente
   - Instala todas as dependências de `requirements/test.txt` (inclui base + ferramentas de teste)

### 2. **Django System Check**
   - Executa `python manage.py check --deploy`
   - Valida configurações básicas do Django sem precisar de banco de dados completo
   - Usa SQLite em memória para testes rápidos

### 3. **Verificação de Migrations**
   - Executa `python manage.py makemigrations --check --dry-run`
   - Identifica se há migrations pendentes que precisam ser criadas
   - **Nota:** Pode falhar em SQLite devido a limitações do driver, mas passa em PostgreSQL

### 4. **Coleta de Testes**
   - Executa `pytest --collect-only`
   - Lista todos os testes disponíveis sem executá-los
   - Verifica se os imports dos testes estão corretos

### 5. **Verificação de Imports**
   - Parseia todos os arquivos Python com AST
   - Detecta erros de sintaxe ou imports quebrados
   - Não executa código, apenas valida a estrutura

## Saídas Geradas

Todos os resultados são salvos em: `audit-reports/backend/`

```
audit-reports/backend/
├── django_check.txt         # Resultado do system check
├── migrations_check.txt     # Status de migrations
├── pytest_collect.txt       # Lista de testes coletados
├── imports_check.txt        # Verificação de imports Python
└── check_imports.py         # Script auxiliar gerado
```

## Interpretando os Resultados

### ✅ Sucesso Completo
```
[✓] Venv ativado
[✓] Dependências instaladas
[✓] Django check passou
[✓] Sem migrations pendentes
[✓] Testes coletados com sucesso
[✓] Verificação de imports passou
```

### ⚠️ Avisos Esperados

#### Django Check
- **drf_spectacular warnings**: warnings sobre schemas OpenAPI são comuns e não críticos
- **security.W003, W004, W008**: avisos de segurança para deployment (normais em dev/test)
- **security.W009**: SECRET_KEY temporária (esperado em auditoria)

#### Migrations Check
- **SQLite connect_timeout**: erro conhecido do SQLite, não afeta funcionalidade
- Para validar migrations corretamente, use PostgreSQL:
  ```bash
  export DATABASE_URL="postgresql://user:pass@localhost/db"
  bash scripts/audit_backend.sh
  ```

### ❌ Erros Críticos

#### Import Errors
Se houver erros no `imports_check.txt`:
```
❌ 3 arquivos com erros:
  - apps/core/views.py: SyntaxError: invalid syntax
  - apps/feedbacks/serializers.py: ModuleNotFoundError: No module named 'typo'
```

**Ação:** Corrigir os imports/typos nos arquivos listados.

#### Pytest Collection Failures
Se pytest não conseguir coletar os testes:
```
ERROR: import errors... ModuleNotFoundError
```

**Ação:** Verificar se todas as dependências estão em `requirements/test.txt`.

## Executando Testes Completos

Após a auditoria passar, você pode executar os testes:

```bash
cd apps/backend
source .venv/bin/activate
pytest --cov=apps --cov-report=html
```

## Executando Pylint

Para análise estática mais profunda:

```bash
cd apps/backend
source .venv/bin/activate

# Verificar apenas erros de import
pylint apps/ --disable=all --enable=import-error

# Análise completa (pode ser verboso)
pylint apps/ --disable=C,R
```

## Integração com CI/CD

### GitHub Actions Example
```yaml
name: Backend Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      
      - name: Run Backend Audit
        run: bash scripts/audit_backend.sh
      
      - name: Upload Audit Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: audit-reports
          path: audit-reports/backend/
```

### GitLab CI Example
```yaml
backend-audit:
  image: python:3.12
  script:
    - bash scripts/audit_backend.sh
  artifacts:
    when: always
    paths:
      - audit-reports/backend/
    expire_in: 7 days
```

## Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'django'"

**Causa:** Script executado sem instalar dependências.

**Solução:** O script `audit_backend.sh` já cuida disso. Se o erro persistir:
```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/test.txt
```

### Problema: "SECRET_KEY not configured"

**Causa:** Variável de ambiente ausente em produção.

**Solução:** O script já configura uma SECRET_KEY temporária. Para produção real:
```bash
export SECRET_KEY="seu-secret-key-aqui"
bash scripts/audit_backend.sh
```

### Problema: Imports com typos (ex: `from restframework import ...`)

**Causa:** Nome incorreto do pacote (correto é `rest_framework`).

**Solução:** O script detectará isso no `imports_check.txt`. Corrigir manualmente:
```python
# ❌ Errado
from restframework import viewsets

# ✅ Correto
from rest_framework import viewsets
```

### Problema: "pytest: command not found"

**Causa:** Venv não foi ativado ou dependências não instaladas.

**Solução:** O script já ativa o venv automaticamente. Se executar manualmente:
```bash
cd apps/backend
source .venv/bin/activate
pip install pytest pytest-django pytest-cov
```

## Comandos de Atalho

```bash
# Auditoria completa
make audit-backend

# Apenas Django check
cd apps/backend && source .venv/bin/activate && python manage.py check

# Apenas coletar testes
cd apps/backend && source .venv/bin/activate && pytest --collect-only

# Executar testes de verdade
cd apps/backend && source .venv/bin/activate && pytest -xvs

# Coverage HTML
cd apps/backend && source .venv/bin/activate && pytest --cov=apps --cov-report=html
# Abrir: apps/backend/htmlcov/index.html
```

## Arquitetura do Backend

```
apps/backend/
├── manage.py              # Django management
├── config/                # Settings e URLs
│   ├── settings.py
│   ├── settings_test.py
│   └── urls.py
├── apps/                  # Aplicações Django
│   ├── core/             # Funcionalidades centrais
│   ├── tenants/          # Multi-tenancy
│   ├── feedbacks/        # Feedbacks/denúncias
│   ├── consent/          # LGPD compliance
│   └── ...
├── requirements/          # Dependências
│   ├── base.txt          # Produção
│   ├── dev.txt           # Desenvolvimento
│   ├── test.txt          # Testes
│   └── prod.txt          # Produção otimizada
├── tests/                # Testes globais
├── .venv/                # Virtualenv (criado pelo script)
└── htmlcov/              # Coverage HTML (após pytest --cov)
```

## Referências

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/)
- [Django REST Framework Testing](https://www.django-rest-framework.org/api-guide/testing/)
- [Pytest Django Plugin](https://pytest-django.readthedocs.io/)
- [Pylint Django Plugin](https://github.com/pylint-dev/pylint-django)

## Changelog

- **2026-02-05**: Criação do script de auditoria determinística
  - Suporte a venv automático
  - Instalação de dependências via requirements/test.txt
  - Verificações básicas sem DB completo
  - Detecção de imports quebrados

---

**Manutenção:** Este documento deve ser atualizado quando houver mudanças significativas no processo de auditoria ou na estrutura do backend.
