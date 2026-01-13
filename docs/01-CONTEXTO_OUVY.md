# PROJETO: Ouvy - Plataforma SaaS White Label (Python/Django)

## 1. Objetivo Técnico
Sistema de gestão de feedback Multi-tenant onde cada cliente (empresa) acessa seus dados de forma isolada via subdomínio (ex: `empresaA.site.com`).

## 2. Stack Tecnológica
* **OS:** macOS (Unix environment).
* **Backend:** Python 3 + Django 4.x + Django Rest Framework.
* **Database:** PostgreSQL.

## 3. Arquitetura Multi-tenancy (Crucial)
O sistema deve usar "Shared Database, Shared Schema".
1.  **Modelo Tenant:** Criar um app chamado `tenants` com um modelo `Client` (nome, subdominio, logo, cor_primaria).
2.  **Middleware:** Um middleware personalizado `TenantMiddleware` que:
    * Lê o `host` da requisição (ex: `clienteA.localhost:8000`).
    * Busca o `Client` no banco de dados correspondente ao subdomínio.
    * Salva esse cliente em uma variável global (thread-local) ou no `request`.
3.  **Isolamento:** Criar uma classe abstrata `TenantAwareModel` que sobrescreve o `objects` (Manager) para filtrar automaticamente dados baseados no Tenant detectado pelo Middleware.

## 4. Estrutura de Pastas Desejada
* `config/`: Settings e urls principais.
* `apps/tenants/`: Gestão das empresas clientes.
* `apps/feedbacks/`: Denúncias e sugestões (herdam de TenantAwareModel).
* `apps/core/`: Utilitários e Middlewares.

## 5. Tarefa para o Copilot
Como Arquiteto Python Sênior:
1.  Crie os comandos de terminal (bash/zsh) para criar os apps `tenants`, `feedbacks` e `core` dentro de uma pasta `apps` (certifique-se de incluir os arquivos `__init__.py`).
2.  Escreva o código do `apps/tenants/models.py` definindo o modelo da Empresa.
3.  Escreva o código do utilitário em `apps/core/utils.py` para gerenciar o "Thread Local" (para armazenar o tenant atual).
4.  Escreva o `TenantMiddleware` em `apps/core/middleware.py`.