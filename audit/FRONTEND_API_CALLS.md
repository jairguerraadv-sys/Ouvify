# 📋 Inventário de Chamadas de API do Frontend

**Data da Auditoria:** 2026-01-23  
**Projeto:** Ouvy SaaS  
**Frontend:** Next.js 16.1.1 + React 19 + TypeScript

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Chamadas de API** | 31 |
| **Arquivos com Chamadas** | 18 |
| **Endpoints Únicos** | 24 |
| **Métodos GET** | 11 |
| **Métodos POST** | 12 |
| **Métodos PATCH** | 5 |
| **Métodos DELETE** | 2 |

---

## 📁 Chamadas de API por Arquivo

### 1. **lib/api.ts** (Core)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 1 | `/api/token/refresh/` | POST | Refresh de JWT token |

### 2. **lib/auth.ts** (Autenticação)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 2 | `/api/logout/` | POST | Logout e invalidação de token |

### 3. **lib/branding-upload.ts** (White-label)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 3 | `/api/upload-branding/` | POST | Upload de logo/favicon |
| 4 | `/api/tenant-info/` | PATCH | Atualização de branding |

### 4. **contexts/AuthContext.tsx** (Autenticação)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 5 | `/api/token/` | POST | Login (obter JWT) |
| 6 | `/api/logout/` | POST | Logout |
| 7 | `/api/register-tenant/` | POST | Registro de novo tenant |
| 8 | `/api/auth/me/` | PATCH | Atualização do perfil |

### 5. **hooks/use-dashboard.ts** (Dashboard)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 9 | `/api/feedbacks/dashboard-stats/` | GET | Estatísticas do dashboard |
| 10 | `/api/feedbacks/` | GET | Listar feedbacks (paginado) |
| 11 | `/api/feedbacks/{protocolo}/` | GET | Detalhes de feedback |
| 12 | `/api/feedbacks/{protocolo}/` | PATCH | Atualizar feedback |
| 13 | `/api/feedbacks/` | POST | Criar feedback |
| 14 | `/api/feedbacks/categorias/` | GET | Listar categorias |
| 15 | `/api/feedbacks/consultar-protocolo/` | GET | Consulta por protocolo |
| 16 | `/api/feedbacks/{id}/` | DELETE | Excluir feedback |

### 6. **hooks/use-feedback-details.ts** (Detalhes)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 17 | `/api/feedbacks/` | GET | Listar para busca |
| 18 | `/api/feedbacks/{id}/` | GET | Detalhes do feedback |
| 19 | `/api/feedbacks/{id}/adicionar-interacao/` | POST | Adicionar interação |

### 7. **hooks/use-tenant-theme.ts** (Multi-tenant)
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 20 | `/api/tenant-info/` | GET | Informações do tenant |

### 8. **app/login/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 21 | `/api-token-auth/` | POST | Login (legacy authtoken) |
| 22 | `/api/tenant-info/` | GET | Info do tenant após login |

### 9. **app/cadastro/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 23 | `/api/check-subdominio/` | GET | Verificar disponibilidade |
| 24 | `/api/register-tenant/` | POST | Registrar novo tenant |

### 10. **app/enviar/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 25 | `/api/feedbacks/` | POST | Enviar novo feedback |

### 11. **app/acompanhar/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 26 | `/api/feedbacks/consultar-protocolo/` | GET | Consultar status |
| 27 | `/api/feedbacks/responder-protocolo/` | POST | Responder feedback |

### 12. **app/precos/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 28 | `/api/tenants/subscribe/` | POST | Iniciar checkout Stripe |

### 13. **app/dashboard/assinatura/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 29 | `/api/tenants/subscription/` | GET | Status da assinatura |
| 30 | `/api/tenants/subscription/` | POST | Cancelar assinatura |
| 31 | `/api/tenants/subscription/reactivate/` | POST | Reativar assinatura |

### 14. **app/dashboard/relatorios/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 32 | `/api/feedbacks/export/` | GET | Exportar CSV/JSON |

### 15. **app/dashboard/feedbacks/[protocolo]/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 33 | `/api/feedbacks/{id}/upload-arquivo/` | POST | Upload de arquivo |

### 16. **app/dashboard/feedbacks/[protocolo]/edit/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 34 | `/api/feedbacks/consultar-protocolo/` | GET | Buscar para editar |
| 35 | `/api/feedbacks/{id}/` | PATCH | Salvar edições |

### 17. **app/dashboard/perfil/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 36 | `/api/export-data/` | GET | Exportar dados (LGPD) |
| 37 | `/api/account/` | DELETE | Excluir conta (LGPD) |

### 18. **app/admin/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 38 | `/api/admin/tenants/` | GET | Listar tenants |
| 39 | `/api/admin/tenants/{id}/` | PATCH | Ativar/desativar tenant |

### 19. **app/recuperar-senha/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 40 | `/api/password-reset/request/` | POST | Solicitar reset |

### 20. **app/recuperar-senha/confirmar/page.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 41 | `/api/password-reset/confirm/` | POST | Confirmar reset |

### 21. **components/dashboard/OnboardingChecklist.tsx**
| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 42 | `/api/feedbacks/` | GET (fetch) | Verificar feedbacks |

---

## 🔍 Endpoints Únicos Consolidados

| # | Endpoint | Métodos Usados | Status |
|---|----------|----------------|--------|
| 1 | `/api/token/` | POST | ✅ Verificar |
| 2 | `/api/token/refresh/` | POST | ✅ Verificar |
| 3 | `/api-token-auth/` | POST | ✅ Verificar (Legacy) |
| 4 | `/api/logout/` | POST | ✅ Verificar |
| 5 | `/api/register-tenant/` | POST | ✅ Verificar |
| 6 | `/api/check-subdominio/` | GET | ✅ Verificar |
| 7 | `/api/tenant-info/` | GET, PATCH | ✅ Verificar |
| 8 | `/api/upload-branding/` | POST | ✅ Verificar |
| 9 | `/api/auth/me/` | PATCH | ✅ Verificar |
| 10 | `/api/users/me/` | GET | ❓ Verificar uso |
| 11 | `/api/feedbacks/` | GET, POST | ✅ Verificar |
| 12 | `/api/feedbacks/{id}/` | GET, PATCH, DELETE | ✅ Verificar |
| 13 | `/api/feedbacks/dashboard-stats/` | GET | ✅ Verificar |
| 14 | `/api/feedbacks/consultar-protocolo/` | GET | ✅ Verificar |
| 15 | `/api/feedbacks/responder-protocolo/` | POST | ✅ Verificar |
| 16 | `/api/feedbacks/{id}/adicionar-interacao/` | POST | ✅ Verificar |
| 17 | `/api/feedbacks/{id}/upload-arquivo/` | POST | ✅ Verificar |
| 18 | `/api/feedbacks/export/` | GET | ✅ Verificar |
| 19 | `/api/feedbacks/categorias/` | GET | ❓ Verificar se existe |
| 20 | `/api/tenants/subscribe/` | POST | ✅ Verificar |
| 21 | `/api/tenants/subscription/` | GET, POST | ✅ Verificar |
| 22 | `/api/tenants/subscription/reactivate/` | POST | ✅ Verificar |
| 23 | `/api/admin/tenants/` | GET | ✅ Verificar |
| 24 | `/api/admin/tenants/{id}/` | PATCH | ✅ Verificar |
| 25 | `/api/password-reset/request/` | POST | ✅ Verificar |
| 26 | `/api/password-reset/confirm/` | POST | ✅ Verificar |
| 27 | `/api/export-data/` | GET | ✅ Verificar |
| 28 | `/api/account/` | DELETE | ✅ Verificar |
| 29 | `/api/analytics/` | GET | ❌ **NÃO USADO** |

---

## 🚨 Observações Importantes

### ⚠️ Endpoints com Potenciais Issues

1. **`/api/feedbacks/categorias/`** - Precisa verificar se existe no backend
2. **`/api/users/me/`** - Endpoint existe mas uso no frontend precisa ser confirmado
3. **`/api/analytics/`** - **ENDPOINT BACKEND EXISTE MAS FRONTEND NÃO USA**

### ✅ Boas Práticas Identificadas

- Uso consistente de `api.get()`, `api.post()`, `api.patch()`, `api.delete()`
- Interceptor de refresh token configurado
- Headers de autenticação configurados automaticamente
- Tratamento de erros centralizado

---

*Auditoria gerada em 2026-01-23*
