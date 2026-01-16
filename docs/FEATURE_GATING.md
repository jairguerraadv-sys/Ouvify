# Feature Gating - Sistema de Planos e Funcionalidades

## 📋 Visão Geral

O sistema de feature gating implementa restrições de funcionalidades com base no plano contratado pelo cliente. Cada plano (free, starter, pro, enterprise) tem acesso a um conjunto específico de features.

## 🏗️ Arquitetura

### 1. **PlanFeatures** (`apps/tenants/plans.py`)

Classe centralizadora que define:
- **PLAN_LIMITS**: Dicionário com features de cada plano
- **get_plan_features()**: Retorna features de um plano
- **has_feature()**: Verifica se um plano tem uma feature
- **get_upgrade_message()**: Mensagem customizada de upgrade

### 2. **Client Model Methods** (`apps/tenants/models.py`)

Métodos adicionados ao modelo `Client`:
- `has_feature(feature: str) -> bool`: Verifica acesso genérico
- `has_feature_internal_notes() -> bool`: Acesso a notas internas
- `has_feature_attachments() -> bool`: Acesso a anexos
- `has_feature_custom_branding() -> bool`: Customização de marca
- `has_feature_api_access() -> bool`: Acesso à API REST
- `has_feature_webhooks() -> bool`: Webhooks
- `has_feature_integrations() -> bool`: Integrações avançadas
- `get_storage_limit_gb() -> float`: Limite de armazenamento
- `get_max_feedbacks_per_month() -> int`: Limite de feedbacks/mês
- `get_max_users() -> int`: Limite de usuários
- `get_support_tier() -> str`: Nível de suporte
- `get_upgrade_message(feature: str) -> str`: Mensagem de upgrade

### 3. **FeatureNotAvailableError** (`apps/core/exceptions.py`)

Exceção lançada quando cliente tenta acessar feature bloqueada:
```python
raise FeatureNotAvailableError(
    feature='allow_internal_notes',
    plan='free',
    message=None  # Auto-gerada se None
)
```

Atributos:
- `feature`: Nome da feature bloqueada
- `plan`: Plano atual do cliente
- `message`: Mensagem customizada para o usuário

### 4. **Custom Exception Handler** (`apps/core/exceptions.py`)

O handler intercepta `FeatureNotAvailableError` e retorna:
```json
{
  "error": "Recurso não disponível no seu plano",
  "detail": "Faça upgrade para o plano Starter para usar Notas Internas.",
  "feature": "allow_internal_notes",
  "current_plan": "free",
  "action": "Faça upgrade do seu plano para acessar allow_internal_notes"
}
```

**Status HTTP:** 403 Forbidden

## 📊 Matriz de Features

```
┌─────────────┬───────┬─────────┬─────┬────────────┐
│ Feature     │ Free  │ Starter │ Pro │ Enterprise │
├─────────────┼───────┼─────────┼─────┼────────────┤
│ Notes       │  ❌   │   ✅    │ ✅  │     ✅     │
│ Attachments │  ❌   │   ❌    │ ✅  │     ✅     │
│ Branding    │  ❌   │   ✅    │ ✅  │     ✅     │
│ API         │  ❌   │   ❌    │ ✅  │     ✅     │
│ Webhooks    │  ❌   │   ❌    │ ✅  │     ✅     │
│ Storage     │  1GB  │  10GB   │100GB│  Unlimited │
│ Feedbacks   │  50/m │ 500/m   │ ∞   │     ∞      │
│ Users       │  1    │   5     │ ∞   │     ∞      │
│ Support     │Comm.  │ Email   │Prior│   24/7     │
└─────────────┴───────┴─────────┴─────┴────────────┘
```

## 🔌 Integração

### FeedbackViewSet - adicionar_interacao

O endpoint `/api/feedbacks/{id}/adicionar-interacao/` valida features:

```python
# Plano FREE tenta criar NOTA_INTERNA
POST /api/feedbacks/1/adicionar-interacao/
Authorization: Token xxx
X-Tenant-ID: 1

{
  "mensagem": "Nota interna",
  "tipo": "NOTA_INTERNA"
}

# Resposta (403 Forbidden):
{
  "error": "Recurso não disponível no seu plano",
  "detail": "Faça upgrade para o plano Starter...",
  "feature": "allow_internal_notes",
  "current_plan": "free"
}
```

### Validação de Features

No código:
```python
if tipo == InteracaoTipo.NOTA_INTERNA:
    if not tenant.has_feature_internal_notes():
        raise FeatureNotAvailableError(
            feature='allow_internal_notes',
            plan=tenant.plano,
            message=tenant.get_upgrade_message('allow_internal_notes')
        )
```

## 🧪 Testes

### Executar Suite de Testes
```bash
cd ouvy_saas
python manage.py test apps.tenants.tests.test_feature_gating -v 2
```

### Testes Inclusos

**PlanFeaturesTestCase** (7 testes)
- Estrutura de planos
- Métodos get_plan_features, has_feature, get_upgrade_message
- Limites de storage e suporte

**ClientPlanMethodsTestCase** (8 testes)
- Métodos has_feature_* para cada feature
- Limites de armazenamento, feedbacks, usuários
- Tiers de suporte
- Mensagens de upgrade

**FeatureNotAvailableErrorTestCase** (2 testes)
- Criação de exceção
- Mensagens customizadas

**FeedbackViewSetFeatureGatingTestCase** (3 testes)
- Free plan não pode criar NOTA_INTERNA
- Starter plan pode criar NOTA_INTERNA
- Respostas anônimas não são bloqueadas

**FeatureGatingExceptionHandlerTestCase** (1 teste)
- Verifica resposta 403 com campos corretos

### Teste Manual
```bash
bash scripts/test_feature_gating_manual.sh
```

## 🚀 Fluxo de Uso

### 1. Cliente cria feedback
```bash
POST /api/feedbacks/
{
  "titulo": "Bug encontrado",
  "descricao": "...",
  "tipo": "BUG"
}
# Retorna: protocolo OUVY-XXXX-YYYY
```

### 2. Empresa adiciona pergunta (qualquer plano)
```bash
POST /api/feedbacks/{id}/adicionar-interacao/
Authorization: Token xxx
{
  "mensagem": "Poderia detalhar mais?",
  "tipo": "PERGUNTA_EMPRESA"
}
# Retorna: 201 Created
```

### 3. Empresa tenta adicionar NOTA_INTERNA (somente starter+)
```bash
POST /api/feedbacks/{id}/adicionar-interacao/
Authorization: Token xxx
{
  "mensagem": "Nota interna para o time",
  "tipo": "NOTA_INTERNA"
}
# Se FREE: 403 Forbidden com mensagem de upgrade
# Se STARTER+: 201 Created
```

### 4. Cliente responde anonimamente (qualquer plano)
```bash
POST /api/feedbacks/{id}/adicionar-interacao/
{
  "mensagem": "Respondendo à pergunta...",
  "protocolo": "OUVY-XXXX-YYYY"
}
# Retorna: 201 Created
# Tipo: RESPOSTA_USUARIO
```

## 🔄 Escalabilidade

### Adicionar Nova Feature

1. **Editar `apps/tenants/plans.py`:**
```python
PLAN_LIMITS = {
    'free': {
        # ...
        'allow_new_feature': False,  # ← Adicionar
    },
    'starter': {
        # ...
        'allow_new_feature': True,
    },
    # ...
}
```

2. **Adicionar método ao Client:**
```python
def has_feature_new_feature(self) -> bool:
    return self.has_feature('allow_new_feature')
```

3. **Validar em endpoint:**
```python
if not tenant.has_feature_new_feature():
    raise FeatureNotAvailableError(
        feature='allow_new_feature',
        plan=tenant.plano
    )
```

4. **Adicionar testes:**
```python
def test_has_feature_new_feature(self):
    self.assertFalse(self.client_free.has_feature_new_feature())
    self.assertTrue(self.client_starter.has_feature_new_feature())
```

## 📝 Logging

O sistema registra tentativas de acesso bloqueado:

```
⚠️ Exceção capturada: FeatureNotAvailableError | Status: 403 | View: FeedbackViewSet | Mensagem: Faça upgrade para o plano Starter para usar Notas Internas.
```

## 🔐 Considerações de Segurança

1. **Feature Gating no Backend:** Todas as validações ocorrem no servidor
2. **Exception Handling:** Exceções são capturadas e retornam 403 Forbidden (não 500)
3. **Logging Detalhado:** Todas as tentativas são registradas para auditoria
4. **No Frontend Bypass:** Frontend não confia em validação local; backend é autoridade

## 🎯 Funcionalidades Futuras

- [ ] Quotas de rate limiting por plano
- [ ] Armazenamento de arquivos com limite por plano
- [ ] API tokens com limites de taxa por plano
- [ ] Webhooks com limite de eventos por plano
- [ ] Custom branding completo (CSS, templates) para starter+
- [ ] SSO para enterprise
- [ ] Integração com Stripe para gerenciar upgrades automaticamente
- [ ] Dashboard de uso para mostrar quotas ao cliente

## 📞 Suporte

Para dúvidas sobre feature gating:
1. Verificar `apps/tenants/plans.py` para matriz de features
2. Executar testes: `python manage.py test apps.tenants.tests.test_feature_gating`
3. Consultar logs: `tail -f ouvy_saas/logs/*.log`
