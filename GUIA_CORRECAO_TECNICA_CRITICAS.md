# 🔧 GUIA DE CORREÇÃO TÉCNICA - VULNERABILIDADES CRÍTICAS

## Vulnerabilidade #1: SECRET_KEY Exposa em `.env`

### Problema
```python
# .env (repositório público)
SECRET_KEY=j&x@uaqy(nonobld$%sf-%9*m-#5&m2hp#u5%dl0cl-&5c*-!#
```

### Impacto
- 🔴 Qualquer pessoa com acesso ao repositório consegue a chave
- Comprometimento de todas as sessões de usuário
- Possível forjar CSRF tokens
- Roubo de dados de sessão

### Solução Passo a Passo

#### Step 1: Remover do Git (Hoje)
```bash
cd /Users/jairneto/Desktop/ouvy_saas

# Remover do histórico (CUIDADO: reescreve commits)
git filter-branch --tree-filter 'rm -f .env' HEAD

# OU (mais seguro)
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: remove .env from version control"
git push origin main --force  # ⚠️ Apenas em repositório privado
```

#### Step 2: Gerar Nova SECRET_KEY
```bash
python3 << 'EOF'
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
EOF

# Exemplo de saída:
# ax9#z$%m&1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0z1x2c3v4b5n
```

#### Step 3: Setar em Railway
```bash
# Railway Dashboard → Project → Environment → Add Variable

SECRET_KEY = ax9#z$%m&1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0z1x2c3v4b5n

# Alternativa via CLI
railway link
railway environment add SECRET_KEY="<nova_chave>"
```

#### Step 4: Remover Fallback em settings.py
```python
# config/settings.py - ANTES
SECRET_KEY = SECRET_KEY_ENV or 'r0FpXcqiJeBmF7EPR2AhEAsI0L8HV1dNMDueS7DP1PE9vENXI'

# DEPOIS
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if not DEBUG:
        raise SystemExit("❌ ERRO CRÍTICO: SECRET_KEY não configurada em produção!")
    # Em dev, permitir fallback (apenas local)
    SECRET_KEY = 'dev-insecure-key-only-for-local-testing'
```

#### Step 5: Testar Localmente
```bash
# Copiar .env de exemplo
cp .env.example .env

# Setar valor temporário em dev
echo "SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" >> .env

# Testar
python manage.py shell
>>> from django.conf import settings
>>> len(settings.SECRET_KEY)
50  # ✅ Carregou com sucesso
```

---

## Vulnerabilidade #2: DEBUG=True em Produção

### Problema
```python
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')
# ❌ Se a variável DEBUG não existir, padrão é 'False' (string)
# ❌ Qualquer um pode habilitar DEBUG via env
```

### Impacto
- 🔴 Stack traces expostos com código-fonte
- Variáveis de ambiente visíveis em erro
- Endpoints de debug ativos (/\_\_debug\_\_/)
- Queries SQL expostas em templates

### Solução

#### Option 1: Validação Rigorosa (Recomendado)
```python
# config/settings.py
import sys

DEBUG = os.getenv('DEBUG', '').lower() in ('true', '1', 'yes')

# Em produção: DEBUG SEMPRE False
if not DEBUG and 'railway' in sys.argv:
    # Railway deploy detectado
    if os.getenv('DEBUG'):
        raise SystemExit("❌ ERRO: DEBUG habilitado em produção!")

# Em produção sem SECRET_KEY
if not DEBUG and not os.getenv('SECRET_KEY'):
    raise SystemExit("❌ ERRO: SECRET_KEY obrigatória em produção!")

# Bloquear hosts inseguros em produção
if not DEBUG:
    insecure_hosts = ['localhost', '127.0.0.1', '0.0.0.0']
    for host in insecure_hosts:
        if host in ALLOWED_HOSTS:
            raise SystemExit(f"❌ ERRO: Host inseguro '{host}' em produção!")
```

#### Option 2: Railway Environment (Simples)
```bash
# Railway Dashboard → Environment
# Remover variável DEBUG completamente
# Padrão será False sempre

# Ou setar explicitamente
DEBUG = false  # Railway reconhece valores booleanos
```

#### Step 3: Testar
```bash
# Localmente: DEBUG habilitado
DEBUG=true python manage.py runserver

# Staging (sem SECRET_KEY): deve falhar
# → SystemExit("SECRET_KEY obrigatória em produção")

# Com SECRET_KEY + DEBUG=false: OK
SECRET_KEY=xxx DEBUG=false python manage.py runserver
```

---

## Vulnerabilidade #3: Rate Limiting em Password Reset

### Problema
```python
# ANTES - Sem proteção
class PasswordResetView(APIView):
    permission_classes = [AllowAny]  # ❌ Sem throttle!
    
    def post(self, request):
        email = request.data['email']
        user = User.objects.get(email=email)  # ✅ Confirma que existe
        send_reset_email(user)
        return Response({'detail': 'Email enviado'})
```

### Ataque
```bash
# Enumerar emails válidos
for email in $(cat wordlist.txt); do
    curl -X POST https://api/password-reset/ \
         -d "{\"email\":\"$email\"}" \
         -H "Content-Type: application/json"
    
    # Se responder em 200ms → email existe
    # Se responder em 2000ms → email não existe (DB lookup)
done
```

### Solução

#### Step 1: Criar Throttle
```python
# apps/core/throttles.py (arquivo novo)
from rest_framework.throttling import AnonRateThrottle

class PasswordResetThrottle(AnonRateThrottle):
    """
    Limita tentativas de reset de senha.
    - 3 tentativas por hora por IP
    - Previne enumeração de emails
    - Previne ataque de reset loop
    """
    scope = 'password_reset'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            # Para usuários anônimos, usar IP
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
```

#### Step 2: Configurar Rate Limit em settings.py
```python
# config/settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'password_reset': '3/hour',  # ← Adicionar
        'protocolo_consulta': '10/min',
    }
}
```

#### Step 3: Aplicar ao View
```python
# apps/core/password_reset.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.core.throttles import PasswordResetThrottle  # ← Novo

class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]  # ← Adicionar
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        
        if not email:
            return Response(
                {'detail': 'Email é obrigatório'},
                status=400
            )
        
        try:
            user = User.objects.get(email=email)
            send_reset_email(user)
        except User.DoesNotExist:
            # ✅ Responder igual (não revela se existe)
            pass
        
        # Sempre retornar mensagem genérica
        return Response({
            'detail': 'Se o email existir, enviaremos um link de recuperação'
        })
```

#### Step 4: Testar
```bash
# Teste 1: Verificar rate limit
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/password-reset/ \
       -d '{"email":"test@example.com"}' \
       -H "Content-Type: application/json"
  
  # Respostas 1-3: 200 OK
  # Respostas 4-5: 429 Too Many Requests
  echo "Tentativa $i"
done

# Teste 2: Verificar mensagem genérica
curl -X POST http://localhost:8000/api/password-reset/ \
     -d '{"email":"naoexiste@example.com"}' \
     -H "Content-Type: application/json"

# Retorna: 'Se o email existir...' (mesmo email válido/inválido)
```

---

## Vulnerabilidade #4: Logs Expõem Tokens de Reset

### Problema
```python
# apps/core/password_reset.py
def reset_password(user):
    token = generate_token(user)
    reset_link = f"https://ouvy.com/reset?token={token}"
    
    logger.info(f"🔗 Link de recuperação: {reset_link}")  # ❌ EXPÕE TOKEN!
    
    send_email(user, reset_link)
```

### Impacto
- 🔴 Se logs vazarem, atacante consegue resetar conta
- Qualquer pessoa com acesso aos logs consegue acessar a conta
- LGPD: exposição indevida de dados pessoais

### Solução
```python
# apps/core/password_reset.py
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def reset_password(user):
    token = generate_token(user)
    reset_link = f"https://ouvy.com/reset?token={token}"
    
    if settings.DEBUG:
        # ✅ Em desenvolvimento, logar completo para debug
        logger.debug(f"🔗 Reset link: {reset_link}")
    else:
        # ✅ Em produção, logar apenas token hash
        import hashlib
        token_hash = hashlib.sha256(token.encode()).hexdigest()[:8]
        logger.info(
            f"✅ Password reset solicitado | "
            f"User: {user.username} | "
            f"Token hash: {token_hash}"
        )
    
    send_email(user, reset_link)
    
    return True
```

---

## Vulnerabilidade #5: Validação de Senha Fraca

### Problema
```python
# apps/core/validators.py - ATUAL (FRACO)
def validate_strong_password(value):
    if len(value) < 8:
        raise ValidationError("Mínimo 8 caracteres")
    # Fim. Qualquer coisa com 8+ chars passa!

# Senhas que PASSAM (perigosas):
# "12345678" ← Sequência numérica
# "aaaaaaaa" ← Repetição
# "password" ← Palavra comum
# "12345678" ← Cracking instant (1 bilhão de tentativas/seg)
```

### Impacto
- 🔴 Contas vulneráveis a força bruta
- Dicionário de senhas comuns funciona
- Padrões sequenciais rastreáveis

### Solução
```python
# apps/core/validators.py
import re
from django.core.exceptions import ValidationError
from django.conf import settings

# Lista de senhas comuns (em produção, usar arquivo externo)
COMMON_PASSWORDS = [
    'password', 'password123', '123456', 'admin', 'letmein',
    'welcome', 'qwerty', 'abc123', 'password1', '1234567890',
    'ouvy', 'ouvy123', 'feedback', 'denuncia',
]

def validate_strong_password(value):
    """
    Valida força da senha conforme NIST guidelines.
    
    Requisitos:
    - Mínimo 12 caracteres
    - Pelo menos 1 maiúscula
    - Pelo menos 1 número
    - Pelo menos 1 símbolo especial
    - Não pode ser senha comum
    - Não pode ter padrão sequencial
    """
    
    if len(value) < 12:
        raise ValidationError(
            "Senha deve ter no mínimo 12 caracteres"
        )
    
    if not re.search(r'[A-Z]', value):
        raise ValidationError(
            "Senha deve conter pelo menos 1 letra maiúscula"
        )
    
    if not re.search(r'[a-z]', value):
        raise ValidationError(
            "Senha deve conter pelo menos 1 letra minúscula"
        )
    
    if not re.search(r'[0-9]', value):
        raise ValidationError(
            "Senha deve conter pelo menos 1 número"
        )
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValidationError(
            "Senha deve conter pelo menos 1 símbolo especial"
        )
    
    # Verificar contra senhas comuns
    if value.lower() in [p.lower() for p in COMMON_PASSWORDS]:
        raise ValidationError(
            "Essa senha é muito comum. Escolha outra."
        )
    
    # Detectar padrões sequenciais
    if _has_sequential_pattern(value):
        raise ValidationError(
            "Senha não pode conter sequências (abc, 123, etc)"
        )
    
    # Detectar repetição
    if re.search(r'(.)\1{2,}', value):  # 3+ chars iguais seguidos
        raise ValidationError(
            "Senha não pode ter 3+ caracteres iguais seguidos"
        )

def _has_sequential_pattern(password):
    """Detecta padrões sequenciais: abc, 123, etc"""
    
    # Tabelas de sequência comum
    sequences = [
        'abcdefghijklmnopqrstuvwxyz',
        '0123456789',
        'qwertyuiopasdfghjklzxcvbnm',
    ]
    
    password_lower = password.lower()
    
    for seq in sequences:
        for i in range(len(seq) - 3):
            if seq[i:i+3] in password_lower:
                return True  # Encontrou padrão
    
    return False

# Testar
try:
    validate_strong_password("Ouvy@2026!")  # ❌ Falta 1 char (11 vs 12)
except ValidationError as e:
    print(e)

try:
    validate_strong_password("Ouvy@2026Secure")  # ✅ OK
except ValidationError:
    print("Senha não validou")
```

---

## Vulnerabilidade #6: Dockerfile Faltando

### Problema
```json
// railway.json
{ "build": { "builder": "dockerfile" } }
// Mas /Dockerfile não existe!
```

### Impacto
- 🔴 Railway não consegue fazer build
- Deploy falha
- Não consegue escalar

### Solução: Criar `/Dockerfile`
```dockerfile
# Dockerfile (na raiz do repositório)
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY ouvy_saas/requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY ouvy_saas/ .

# Variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health/')"

# Executar migrations + servidor
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"]
```

---

## Checklist de Implementação

```markdown
# Vulnerabilidades Críticas - Checklist

## 🔴 [HOJE - 2 horas]

- [ ] 1.1 Remover .env do git
  - [ ] `git rm --cached .env`
  - [ ] Adicionar ao `.gitignore`
  - [ ] Fazer commit

- [ ] 1.2 Gerar nova SECRET_KEY
  - [ ] `python3 -c '...'`
  - [ ] Copiar chave aleatória

- [ ] 1.3 Setar em Railway
  - [ ] Dashboard → Environment → Add Variable
  - [ ] `SECRET_KEY = <chave_nova>`

- [ ] 2.1 Remover fallback
  - [ ] Editar `config/settings.py`
  - [ ] Remover hardcoded SECRET_KEY
  - [ ] Adicionar validação

- [ ] 2.2 Setar DEBUG=False em Railway
  - [ ] Dashboard → Environment
  - [ ] `DEBUG = false`

- [ ] 6.1 Criar Dockerfile
  - [ ] Criar `/Dockerfile` na raiz
  - [ ] Testar localmente: `docker build .`

- [ ] 6.2 Deploy teste
  - [ ] `git push origin main`
  - [ ] Railway → Build logs
  - [ ] Verificar sucesso

## 🟡 [ESTA SEMANA - 4 horas]

- [ ] 3.1 Adicionar PasswordResetThrottle
  - [ ] Criar `apps/core/throttles.py`
  - [ ] Implementar classe

- [ ] 3.2 Aplicar a views
  - [ ] Editar `PasswordResetView`
  - [ ] Adicionar `throttle_classes`

- [ ] 4.1 Sanitizar logs
  - [ ] Editar `password_reset.py`
  - [ ] Hash de tokens em produção

- [ ] 5.1 Validação de senha forte
  - [ ] Editar `validators.py`
  - [ ] Implementar validações
  - [ ] Testar casos

- [ ] 6.3 Completar Railway Secrets
  - [ ] DATABASE_URL
  - [ ] ALLOWED_HOSTS
  - [ ] STRIPE_* keys
  - [ ] EMAIL_HOST_PASSWORD

## 🟢 [2 SEMANAS]

- [ ] Testar em staging
- [ ] Load test
- [ ] Security review final
- [ ] Deploy em produção
```

---

**Tempo total:** ~6 horas de desenvolvimento
**Risco residual:** Baixo (todos os P0 fixados)
