# 🔒 Plano de Correção de Vulnerabilidades de Segurança - Ouvify

**Data de Criação:** 2026-02-05  
**Baseline Auditoria:** `AUDITORIA_SEGURANCA_2026-02-05.md`  
**Status Geral:** 🟡 EM PROGRESSO (Fase 2/6 - 1/21 concluída)

---

## 📋 Tabela de Vulnerabilidades e Correções

|     ID     | Severidade | Categoria          | Arquivo/Rota                                                        | Problema                                                        | Correção Necessária                                                                                             | Teste                                                                           | Status         |
| :--------: | :--------- | :----------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :------------- |
| **CR-001** | 🔴 CRÍTICA | Multi-Tenancy      | `apps/feedbacks/views.py:consultar_protocolo`                       | Vazamento cross-tenant (sem validação de tenant)                | Validar X-Tenant-ID ou subdomínio; filtrar feedback por tenant+protocolo; usar serializer público               | Sem header→400; tenant inválido→404; protocolo de outro tenant→404; sucesso→200 | ✅ COMPLETED   |
| **AL-001** | 🔴 ALTA    | Rate Limiting      | `apps/core/views.py:TokenObtainPairView`                            | Brute force de login (throttle genérico 1000/dia)               | Criar LoginRateThrottle (5/hora); aplicar na view                                                               | Disparar 6 reqs em 1min → 429                                                   | ⏳ NOT STARTED |
| **AL-002** | 🔴 ALTA    | Rate Limiting      | `apps/core/views/two_factor_views.py:TwoFactorVerifyView`           | Brute force de 2FA (throttle genérico 1000/dia)                 | Criar TwoFactorVerifyThrottle (10/hora); aplicar na view                                                        | Disparar 11 reqs em 1min → 429                                                  | ⏳ NOT STARTED |
| **AL-003** | 🔴 ALTA    | Rate Limiting      | `apps/core/views.py:PasswordResetConfirmView`                       | Brute force de token reset (throttle genérico 1000/dia)         | Criar PasswordResetConfirmThrottle (10/hora); aplicar na view                                                   | Disparar 11 reqs em 1min → 429                                                  | ⏳ NOT STARTED |
| **AL-004** | 🔴 ALTA    | Rate Limiting      | `apps/tenants/views.py:RegisterTenantView`                          | Criação massiva de tenants (throttle genérico 1000/dia)         | Criar TenantRegistrationThrottle (3/dia); aplicar na view                                                       | Disparar 4 reqs em 1 dia → 429                                                  | ⏳ NOT STARTED |
| **AL-005** | 🔴 ALTA    | Rate Limiting      | `apps/feedbacks/views.py:FeedbackViewSet.create`                    | Spam de feedbacks (sem rate limit específico)                   | Criar FeedbackSubmissionThrottle (5/hora); aplicar em get_throttles()                                           | Disparar 6 reqs em 1min → 429                                                   | ⏳ NOT STARTED |
| **AL-006** | 🔴 ALTA    | Rate Limiting      | `apps/feedbacks/views.py:consultar_protocolo`                       | Enumeração de protocolos (sem rate limit específico)            | Criar ProtocolLookupThrottle (20/hora); aplicar na action                                                       | Disparar 21 reqs em 1min → 429                                                  | ⏳ NOT STARTED |
| **AL-007** | 🔴 ALTA    | RBAC               | `apps/feedbacks/views.py:FeedbackViewSet`                           | Sem validação de role (VIEWER pode modificar)                   | Criar IsOwner, IsOwnerOrAdmin, CanModifyFeedback em permissions.py; aplicar CanModifyFeedback                   | VIEWER não consegue PATCH/DELETE; MODERATOR consegue; OWNER consegue            | ⏳ NOT STARTED |
| **AL-008** | 🔴 ALTA    | RBAC               | `apps/tenants/team_views.py:TeamMemberViewSet`                      | Sem validação de role (qualquer membro pode editar)             | Criar IsOwnerOrAdmin; aplicar na view                                                                           | VIEWER não consegue PATCH; MODERATOR não consegue PATCH; ADMIN consegue         | ⏳ NOT STARTED |
| **AL-009** | 🔴 ALTA    | RBAC               | `apps/webhooks/views.py:WebhookEndpointViewSet`                     | Sem validação de role (qualquer membro pode gerenciar)          | Criar IsOwnerOrAdmin; aplicar na view                                                                           | VIEWER não consegue criar/listar; ADMIN consegue                                | ⏳ NOT STARTED |
| **AL-010** | 🔴 ALTA    | 2FA                | `apps/core/account_views.py:DeleteAccountView`                      | Sem exigência de 2FA para operação sensível                     | Criar Requires2FAForSensitiveOperation; aplicar em permission_classes; armazenar timestamp de verify em session | Sem 2FA→403; com 2FA mas sem verify recente→403; com verify recente→200         | ⏳ NOT STARTED |
| **AL-011** | 🔴 ALTA    | 2FA                | `apps/core/views.py:PasswordResetConfirmView`                       | Sem exigência de 2FA para operação sensível (fluxo autenticado) | Criar Requires2FAForSensitiveOperation; aplicar em permission_classes                                           | Mesmo como AL-010                                                               | ⏳ NOT STARTED |
| **AL-012** | 🔴 ALTA    | 2FA                | `apps/tenants/team_views.py:TeamMemberViewSet.update (role change)` | Sem exigência de 2FA ao editar roles (sensível)                 | Criar Requires2FAForSensitiveOperation; aplicar em permission_classes ou @action                                | Mesmo como AL-010                                                               | ⏳ NOT STARTED |
| **MD-001** | 🟡 MÉDIA   | Autenticação       | `apps/backend/config/settings.py:SECRET_KEY`                        | Secret key em variável (sem rotação)                            | Suportar JWT_SECRET_KEY_PRIMARY + JWT_SECRET_KEY_SECONDARY; validar na startup                                  | Verificar que app inicia com ambas configuradas                                 | ⏳ NOT STARTED |
| **MD-002** | 🟡 MÉDIA   | RBAC               | `apps/tenants/models.py:TeamMember`                                 | 2FA não obrigatório para OWNER/ADMIN                            | Criar requires_2fa() e enforce_2fa_enabled() nos models; middleware para forçar                                 | OWNER sem 2FA → bloqueado em operações sensíveis                                | ⏳ NOT STARTED |
| **MD-003** | 🟡 MÉDIA   | Input Sanitization | `apps/feedbacks/serializers.py:FeedbackSerializer`                  | Campos titulo/descricao não sanitizados                         | Adicionar validate_titulo() e validate_descricao() com sanitize_string()                                        | POST com XSS no título → sanitizado                                             | ⏳ NOT STARTED |
| **MD-004** | 🟡 MÉDIA   | Input Sanitization | `apps/tenants/serializers.py:ClientSerializer`                      | Campos de nome/descrição não sanitizados                        | Adicionar validate_nome() com sanitize_string()                                                                 | POST com XSS no nome → sanitizado                                               | ⏳ NOT STARTED |
| **MD-005** | 🟡 MÉDIA   | CORS               | `apps/backend/config/settings.py:CORS validation`                   | Validação incompleta (não valida IPs privados, http://)         | Adicionar validação rigorosa de CORS_ALLOWED_ORIGINS em startup                                                 | app falha se origem é http:// ou IP privado                                     | ⏳ NOT STARTED |
| **MD-006** | 🟡 MÉDIA   | Multi-Tenancy      | `apps/feedbacks/views.py:adicionar_interacao`                       | Lógica dual complexa (auth vs anon)                             | Refatorar em 2 endpoints separados (autenticado vs público)                                                     | auth endpoint requer user; public requer X-Tenant-ID                            | ⏳ NOT STARTED |
| **BX-001** | 🟠 BAIXA   | File Upload        | `apps/backend/config/settings.py:ALLOWED_FILE_TYPES`                | Validação apenas de MIME type (facilmente forjável)             | Criar validate_file_content() com python-magic para detectar tipo real                                          | Upload de .exe com MIME type image/jpeg → rejeitado                             | ⏳ NOT STARTED |
| **BX-002** | 🟠 BAIXA   | Admin              | `apps/backend/config/urls.py:admin path`                            | URL do Django admin previsível ("painel-admin-ouvify-2026")     | Adicionar DJANGO_ADMIN_PATH em variável de env; gerar slug aleatório                                            | app inicia com DJANGO_ADMIN_PATH customizado                                    | ⏳ NOT STARTED |
| **BX-003** | 🟠 BAIXA   | Autenticação       | `apps/backend/config/settings.py:SIMPLE_JWT`                        | Sem rotação automática de JWT secret                            | Suportar múltiplas secrets para rotação sem downtime                                                            | app consegue verificar tokens com múltiplas secrets                             | ⏳ NOT STARTED |

---

## 🔄 Fases de Execução

### ✅ Fase 1 — Plano Executável (CONCLUÍDO)

- [x] Criar tabela de vulnerabilidades
- [x] Mapear arquivos e rotas afetadas
- [x] Definir testes e critérios de sucesso

### ✅ Fase 2 — Fix CRÍTICO #1 (Consultar-Protocolo) (CONCLUÍDO)

- [x] Alterar `consultar_protocolo` para validar tenant
- [x] Implementar FeedbackConsultaSerializer público
- [x] Adicionar testes de segurança
- [x] Commits: `fix(security): prevent cross-tenant leak in protocol lookup (CR-001)` + `test(security): add protocol lookup cross-tenant security tests (CR-001)`

### ⏳ Fase 3 — Fix CRÍTICO/ALTO #2 (Rate Limiting) - PRÓXIMA

- [ ] Criar throttles específicos
- [ ] Aplicar em views
- [ ] Atualizar REST_FRAMEWORK settings
- [ ] Adicionar testes

### ⏳ Fase 4 — Fix ALTO #3 (RBAC Permissions)

- [ ] Criar permissions.py
- [ ] Aplicar em FeedbackViewSet, TeamMemberViewSet, WebhookEndpointViewSet
- [ ] Adicionar testes

### ⏳ Fase 5 — Fix ALTO #4 (2FA em Ops Sensíveis)

- [ ] Criar Requires2FAForSensitiveOperation
- [ ] Aplicar em DeleteAccountView, PasswordResetConfirmView, TeamMemberViewSet
- [ ] Implementar session timestamp strategy
- [ ] Adicionar testes

### ⏳ Fase 6 — Fixes MÉDIOS/BAIXOS + Revalidação

- [ ] Correções de input sanitization
- [ ] Validação CORS
- [ ] File upload validation
- [ ] ROMA re-auditoria

---

## 📊 Sumário Executivo

| Severidade | Total  | Completadas | Restantes | % Completo |
| :--------- | :----: | :---------: | :-------: | :--------: |
| 🔴 CRÍTICA |   1    |      1      |     0     |    100%    |
| 🔴 ALTA    |   11   |      0      |    11     |     0%     |
| 🟡 MÉDIA   |   6    |      0      |     6     |     0%     |
| 🟠 BAIXA   |   3    |      0      |     3     |     0%     |
| **TOTAL**  | **21** |    **1**    |  **20**   |  **4.8%**  |

---

## 🎯 Próximos Passos

1. **✅ FASE 2 COMPLETADA:** Validação de tenant em `consultar-protocolo` (CRÍTICA) - Cross-tenant leak eliminado
2. **⏳ EXECUTAR FASE 3:** Implementar rate limiting específico (6 throttles) - AL-001 a AL-006
3. **⏳ EXECUTAR FASE 4:** Criar e aplicar RBAC permissions (3 views) - AL-007 a AL-009
4. **⏳ EXECUTAR FASE 5:** Exigir 2FA em operações sensíveis (3 endpoints) - AL-010 a AL-012
5. **⏳ EXECUTAR FASE 6:** Fixes MÉDIOS/BAIXOS + Re-Auditoria com ROMA - MD-001 a BX-003

---

**Atualizado:** 2026-02-05  
**Responsável:** Backend Security Team  
**Próxima Revisão:** Após conclusão de cada fase
