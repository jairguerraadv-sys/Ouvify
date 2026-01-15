# 🚀 Quick Start - Backend Refatorado

## Comandos Rápidos para Desenvolvimento

### 1️⃣ Iniciar Servidor

```bash
cd ouvy_saas

# Ativar ambiente virtual
source venv/bin/activate  # Mac/Linux
# ou
venv\Scripts\activate  # Windows

# Rodar servidor
python manage.py runserver
```

### 2️⃣ Testar Validações

```bash
python manage.py shell

# Testar validators
from apps.core.validators import *

# Subdomain
validate_subdomain('empresa123')  # ✅ OK
validate_subdomain('minha-empresa')  # ✅ OK

# Senha forte
validate_strong_password('senha123')  # ✅ OK

# CNPJ (testar com CNPJ real)
validate_cnpj('11.222.333/0001-81')  # ✅ ou ❌
```

### 3️⃣ Verificar Queries (Debug)

```bash
# No shell
python manage.py shell

from apps.feedbacks.models import Feedback
from django.db import connection
from django.test.utils import override_settings

# Resetar contador de queries
connection.queries = []

# Executar query otimizada
feedbacks = Feedback.objects.select_related('client', 'autor')[:10]
list(feedbacks)

# Ver queries executadas
print(f"Total queries: {len(connection.queries)}")
# Deve mostrar: Total queries: 1
```

### 4️⃣ Testar Paginação

```bash
# Com curl
curl "http://localhost:8000/api/feedbacks/" \
  -H "Authorization: Token YOUR_TOKEN" \
  | jq

# Deve retornar:
# {
#   "count": 150,
#   "next": "...",
#   "previous": null,
#   "page_size": 20,
#   "total_pages": 8,
#   "current_page": 1,
#   "results": [...]
# }
```

### 5️⃣ Testar Exception Handler

```bash
# Endpoint com erro proposital
curl -X GET "http://localhost:8000/api/feedbacks/consultar-protocolo/" | jq

# Deve retornar:
# {
#   "error": "Parâmetro 'codigo' é obrigatório",
#   "exemplo": "/api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY"
# }
```

### 6️⃣ Ver Logs em Tempo Real

```bash
# Terminal 1: Rodar servidor
python manage.py runserver

# Terminal 2: Monitorar logs
tail -f logs/django.log

# Fazer requisições e ver logs aparecerem com emojis:
# ✅ Feedback criado
# 🔍 Consulta de protocolo
# ⚠️ Tentativa suspeita
# ❌ Erro crítico
```

### 7️⃣ Verificar Configurações

```bash
# Ver todas as configurações
python manage.py diffsettings

# Ver apenas REST_FRAMEWORK
python manage.py shell
>>> from django.conf import settings
>>> settings.REST_FRAMEWORK
```

### 8️⃣ Security Check

```bash
# Verificar configurações de segurança
python manage.py check --deploy

# Verificar vulnerabilidades (instalar safety primeiro)
pip install safety
safety check
```

### 9️⃣ Database Migrations

```bash
# Criar migrations (se necessário)
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Ver status das migrations
python manage.py showmigrations
```

### 🔟 Criar Superuser

```bash
python manage.py createsuperuser

# Acessar admin
# http://localhost:8000/admin/
```

---

## 🧪 Testes Manuais

### Testar Validators

```python
python manage.py shell

from apps.core.validators import *

# 1. Subdomain
print("🔍 Testando subdomain...")
validate_subdomain('empresa123')  # OK
try:
    validate_subdomain('www')  # Deve falhar
except ValueError as e:
    print(f"✅ Bloqueou: {e}")

# 2. Senha
print("\n🔍 Testando senha...")
validate_strong_password('senha123')  # OK
try:
    validate_strong_password('123')  # Deve falhar
except ValueError as e:
    print(f"✅ Bloqueou: {e}")

# 3. CNPJ
print("\n🔍 Testando CNPJ...")
try:
    validate_cnpj('11.222.333/0001-81')
    print("✅ CNPJ válido")
except ValueError as e:
    print(f"❌ CNPJ inválido: {e}")
```

### Testar Utils

```python
python manage.py shell

from apps.core.utils import *

# 1. IP Extraction (simular request)
class MockRequest:
    META = {'HTTP_X_FORWARDED_FOR': '192.168.1.1, 10.0.0.1'}

request = MockRequest()
ip = get_client_ip(request)
print(f"IP extraído: {ip}")  # 192.168.1.1

# 2. Subdomain Validation
print(f"empresa123 é válido? {is_valid_subdomain('empresa123')}")
print(f"www é reservado? {is_reserved_subdomain('www')}")

# 3. Time Range
from datetime import datetime
hoje = get_time_range('hoje')
print(f"Hoje: {hoje[0]} até {hoje[1]}")
```

### Testar Query Optimization

```python
python manage.py shell

from apps.feedbacks.models import Feedback
from django.db import connection, reset_queries
import time

# SEM otimização
reset_queries()
start = time.time()
feedbacks = list(Feedback.objects.all()[:20])
for f in feedbacks:
    _ = f.client.nome  # Acessa client
    if f.autor:
        _ = f.autor.username  # Acessa autor
sem_otim_time = time.time() - start
sem_otim_queries = len(connection.queries)

# COM otimização
reset_queries()
start = time.time()
feedbacks = list(Feedback.objects.select_related('client', 'autor')[:20])
for f in feedbacks:
    _ = f.client.nome
    if f.autor:
        _ = f.autor.username
com_otim_time = time.time() - start
com_otim_queries = len(connection.queries)

print(f"\n📊 Comparação:")
print(f"SEM otimização: {sem_otim_queries} queries em {sem_otim_time:.3f}s")
print(f"COM otimização: {com_otim_queries} queries em {com_otim_time:.3f}s")
print(f"Ganho: {((sem_otim_queries - com_otim_queries) / sem_otim_queries * 100):.1f}%")
```

---

## 📡 Endpoints para Testar

### 1. Dashboard Stats (Autenticado)

```bash
curl "http://localhost:8000/api/feedbacks/dashboard-stats/" \
  -H "Authorization: Token YOUR_TOKEN" \
  | jq
```

### 2. Listar Feedbacks (Paginado)

```bash
# Página 1 (20 itens)
curl "http://localhost:8000/api/feedbacks/" \
  -H "Authorization: Token YOUR_TOKEN" \
  | jq

# Página 2
curl "http://localhost:8000/api/feedbacks/?page=2" \
  -H "Authorization: Token YOUR_TOKEN" \
  | jq

# Com filtros
curl "http://localhost:8000/api/feedbacks/?status=pendente&search=teste" \
  -H "Authorization: Token YOUR_TOKEN" \
  | jq
```

### 3. Consultar Protocolo (Público)

```bash
curl "http://localhost:8000/api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY" \
  | jq
```

### 4. Criar Feedback (Público)

```bash
curl -X POST "http://localhost:8000/api/feedbacks/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "sugestao",
    "titulo": "Teste de feedback",
    "descricao": "Descrição do feedback",
    "email": "teste@exemplo.com"
  }' \
  | jq
```

---

## 🐛 Debug Comum

### Erro: "Tenant não encontrado"

```python
# Verificar middleware
python manage.py shell

from apps.core.utils import get_current_tenant
print(get_current_tenant())  # Deve ser None fora de request

# Em request real, verificar headers:
# - X-Tenant-Subdomain: empresa123
# - Host: empresa123.ouvy.com
```

### Erro: "N+1 queries"

```python
# Verificar se está usando select_related/prefetch_related
queryset = Feedback.objects.all()  # ❌ Causa N+1

queryset = Feedback.objects.select_related('client', 'autor')  # ✅ Otimizado
```

### Erro: "Paginação não funciona"

```python
# Verificar se viewset tem pagination_class
class FeedbackViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination  # ✅
```

---

## 📝 Arquivo de Teste Rápido

Criar `test_quick.py`:

```python
# test_quick.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.validators import *
from apps.core.utils import *

print("🧪 Testando validators...")

# Subdomain
try:
    validate_subdomain('empresa123')
    print("✅ Subdomain válido")
except ValueError as e:
    print(f"❌ {e}")

# Senha
try:
    validate_strong_password('senha123')
    print("✅ Senha válida")
except ValueError as e:
    print(f"❌ {e}")

print("\n🧪 Testando utils...")

# Subdomain reservado
if is_reserved_subdomain('www'):
    print("✅ www está reservado")

print("\n✅ Todos os testes passaram!")
```

Rodar:
```bash
python test_quick.py
```

---

## 🎯 Checklist de Desenvolvimento

Antes de commitar código:

- [ ] Código segue padrões (DRY, SOLID)
- [ ] Type hints adicionados
- [ ] Docstrings completas
- [ ] Testes manuais executados
- [ ] Validators testados
- [ ] Queries otimizadas (sem N+1)
- [ ] Logging apropriado
- [ ] Exception handling robusto
- [ ] Paginação funcionando
- [ ] Security check passou

---

## 📚 Referências Rápidas

- **Validators:** `apps/core/validators.py`
- **Utils:** `apps/core/utils.py`
- **Exceptions:** `apps/core/exceptions.py`
- **Pagination:** `apps/core/pagination.py`
- **Settings:** `config/settings.py`

---

## 🆘 Ajuda

Se algo não funcionar:

1. **Verificar logs:** `tail -f logs/django.log`
2. **Security check:** `python manage.py check --deploy`
3. **Migrations:** `python manage.py showmigrations`
4. **Ver erros:** `python manage.py check`

---

**Happy Coding! 🚀**
