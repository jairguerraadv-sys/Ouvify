# Ouvify - Sistema Multi-tenant SaaS

## ✅ Estrutura Criada

A arquitetura multi-tenant foi implementada com sucesso usando o padrão **Shared Database, Shared Schema**.

### Estrutura de Apps

```
apps/
├── tenants/          # Gestão de clientes (tenants)
│   ├── models.py     # Modelo Client
│   └── admin.py      # Admin do Django
├── feedbacks/        # Sistema de feedbacks
│   ├── models.py     # Modelo Feedback (herda TenantAwareModel)
│   └── admin.py      # Admin do Django
└── core/             # Utilitários e middleware
    ├── utils.py      # Thread-local para tenant atual
    ├── middleware.py # TenantMiddleware
    └── models.py     # TenantAwareModel (classe abstrata)
```

## 🚀 Como Usar

### 1. Aplicar Migrações

```bash
cd /Users/jairneto/Desktop/ouvify_saas/ouvy_saas
python manage.py makemigrations
python manage.py migrate
```

### 2. Criar Superusuário

```bash
python manage.py createsuperuser
```

### 3. Criar Tenants de Teste

```bash
python manage.py shell
```

Dentro do shell Python:

```python
from apps.tenants.models import Client

# Criar tenants de exemplo
empresaA = Client.objects.create(
    nome="Empresa A",
    subdominio="empresaa",
    cor_primaria="#3B82F6"
)

empresaB = Client.objects.create(
    nome="Empresa B",
    subdominio="empresab",
    cor_primaria="#10B981"
)

print("Tenants criados com sucesso!")
```

### 4. Configurar /etc/hosts (para desenvolvimento local)

Adicione ao arquivo `/etc/hosts`:

```
127.0.0.1 empresaa.localhost
127.0.0.1 empresab.localhost
```

### 5. Iniciar o Servidor

```bash
python manage.py runserver
```

### 6. Acessar os Tenants

- **Empresa A**: http://empresaa.localhost:8000
- **Empresa B**: http://empresab.localhost:8000
- **Admin**: http://localhost:8000/admin

## 🏗️ Arquitetura Multi-tenant

### Como Funciona

1. **TenantMiddleware** intercepta cada requisição
2. Extrai o subdomínio do host (ex: `empresaa.localhost`)
3. Busca o `Client` correspondente no banco de dados
4. Armazena o tenant no **thread-local** via `set_current_tenant()`
5. Todos os modelos que herdam de `TenantAwareModel` são automaticamente filtrados

### Isolamento Automático

Modelos que herdam `TenantAwareModel` têm:

- ✅ Campo `client` (ForeignKey para Client)
- ✅ Filtro automático por tenant no `objects.all()`
- ✅ Salvamento automático com tenant atual
- ✅ Proteção contra vazamento de dados entre tenants

### Exemplo de Uso

```python
from apps.feedbacks.models import Feedback
from apps.core.utils import get_current_tenant

# Dentro de uma view ou API (após passar pelo middleware)
def criar_feedback(request):
    # O tenant já está definido pelo middleware
    tenant_atual = get_current_tenant()
    print(f"Tenant atual: {tenant_atual.nome}")
    
    # Criar feedback - tenant é definido automaticamente
    feedback = Feedback.objects.create(
        tipo='sugestao',
        titulo='Minha sugestão',
        descricao='Detalhes da sugestão'
    )
    
    # Listar feedbacks - apenas do tenant atual
    feedbacks = Feedback.objects.all()  # Filtra automaticamente!
    
    return {"success": True}
```

## 📝 Próximos Passos

### Para Produção

1. **Configurar PostgreSQL** (descomentar em `settings.py`)
2. **Configurar ALLOWED_HOSTS** com domínios reais
3. **Adicionar validação de domínios** no middleware
4. **Implementar caching** para lookup de tenants
5. **Configurar CORS** se usar frontend separado

### Funcionalidades Adicionais

1. **APIs REST** com Django REST Framework
2. **Sistema de autenticação** por tenant
3. **Painel administrativo** personalizado por tenant
4. **Temas dinâmicos** baseados em `cor_primaria`
5. **Métricas e analytics** por tenant

## 🔒 Segurança

### Isolamento de Dados

- ✅ Cada tenant só acessa seus próprios dados
- ✅ Validação automática no nível do ORM
- ✅ Proteção contra queries cross-tenant
- ✅ Tenant inválido retorna 404

### Admin do Django

No admin, use `all_tenants()` para ver dados de todos os clientes:

```python
# Em FeedbackAdmin
def get_queryset(self, request):
    return Feedback.objects.all_tenants()
```

## 📚 Referências

- **Thread-local**: `apps/core/utils.py`
- **Middleware**: `apps/core/middleware.py`
- **Modelo base**: `apps/core/models.py` (TenantAwareModel)
- **Exemplo de uso**: `apps/feedbacks/models.py` (Feedback)

---

**Desenvolvido com Django 4.x + Python 3**
