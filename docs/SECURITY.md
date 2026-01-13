# 🔒 Guia de Segurança - Ouvy SaaS

## Configuração de Ambiente

### Desenvolvimento

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis básicas no `.env`:
   ```
   SECRET_KEY=sua-chave-aqui
   DEBUG=True
   DB_ENGINE=sqlite
   ```

3. Valide as configurações:
   ```bash
   python3 check_env.py
   ```

### Produção

#### SECRET_KEY

**CRÍTICO**: Nunca use a SECRET_KEY padrão em produção!

Gerar nova SECRET_KEY:
```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Configure no `.env`:
```
SECRET_KEY=sua-chave-unica-min-50-caracteres
```

#### DEBUG

**CRÍTICO**: Sempre desabilite DEBUG em produção!

```
DEBUG=False
```

#### ALLOWED_HOSTS

Configure apenas os domínios que hospedarão a aplicação:

```
ALLOWED_HOSTS=ouvy.com,www.ouvy.com,api.ouvy.com
```

**NUNCA** use `ALLOWED_HOSTS=*` em produção!

#### Banco de Dados

Use PostgreSQL em produção:

```
DB_ENGINE=postgresql
DB_NAME=ouvy_production
DB_USER=ouvy_user
DB_PASSWORD=senha-super-segura-aqui
DB_HOST=seu-servidor-postgres.com
DB_PORT=5432
```

#### CORS

Configure apenas as origens do seu frontend:

```
CORS_ALLOWED_ORIGINS=https://app.ouvy.com,https://www.ouvy.com
```

## Checklist de Segurança

### Antes do Deploy

- [ ] SECRET_KEY única gerada
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS configurado (sem *)
- [ ] PostgreSQL configurado
- [ ] Credenciais do banco seguras
- [ ] CORS configurado (sem *)
- [ ] SSL/HTTPS ativado
- [ ] Arquivo .env no .gitignore
- [ ] Backup do banco configurado
- [ ] Logs de erro configurados

### Pós-Deploy

- [ ] Testar acesso com domínios configurados
- [ ] Verificar logs de erro
- [ ] Validar isolamento de tenants
- [ ] Testar rate limiting
- [ ] Revisar permissões de usuários

## Variáveis de Ambiente Obrigatórias

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| SECRET_KEY | Opcional | **OBRIGATÓRIO** | Chave secreta Django |
| DEBUG | True | **False** | Modo debug |
| ALLOWED_HOSTS | .local,localhost | **domínios reais** | Hosts permitidos |
| DB_ENGINE | sqlite | **postgresql** | Engine do banco |
| DB_PASSWORD | - | **OBRIGATÓRIO** | Senha do banco |
| CORS_ALLOWED_ORIGINS | localhost:3000 | **URLs reais** | Origens CORS |

## Gerar SECRET_KEY Segura

```bash
# Método 1: Django
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Método 2: OpenSSL
openssl rand -base64 50
```

## Verificar Configurações

```bash
# Validar arquivo .env
python3 check_env.py

# Testar servidor
bash run_server.sh
```

## Migração SQLite → PostgreSQL

```bash
# 1. Exportar dados SQLite
python3 manage.py dumpdata > backup.json

# 2. Configurar PostgreSQL no .env
DB_ENGINE=postgresql
DB_NAME=ouvy_db
DB_USER=postgres
DB_PASSWORD=sua_senha

# 3. Criar banco PostgreSQL
createdb ouvy_db

# 4. Aplicar migrations
python3 manage.py migrate

# 5. Importar dados
python3 manage.py loaddata backup.json
```

## Contato de Segurança

Para reportar vulnerabilidades de segurança:
- **Não divulgue vulnerabilidades publicamente**
- Entre em contato diretamente com a equipe

---

**Última atualização:** 11 de Janeiro de 2026
