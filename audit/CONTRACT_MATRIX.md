# 🔍 Contract Matrix - Frontend ↔ Backend

**Data:** 2026-02-05 21:24:25

## 📊 Sumário Executivo

- ❌ **MISSING (P0/P1):** 83 endpoints - Frontend chama, Backend não tem
- ⚠️  **ORPHAN (P2):** 315 endpoints - Backend tem, Frontend não usa
- ✅ **MATCHED:** 11 endpoints - Contrato OK

---

## 🚨 P0 - CRÍTICO (Bloqueia Release)

Endpoints **obrigatórios** que frontend chama mas backend não implementa:

| Método | Path | Chamadas | Arquivos Frontend | Ação Requerida |
|----|----|----|----|----|
| `GET` | `/` | 5× | apps/frontend/playwright.config.ts, apps/frontend/playwright.config.ts +1 | **Implementar no Backend** |
| `GET` | `/a` | 3× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js, apps/frontend/.next/static/chunks/a6dad97d9634a72d.js +1 | **Implementar no Backend** |
| `DELETE` | `/a` | 1× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js | **Implementar no Backend** |
| `GET` | `/api/check-subdominio/` | 3× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_cadastro_page_tsx_35150b5a._.js, apps/frontend/.next/static/chunks/4860d255f179982c.js +1 | **Implementar no Backend** |
| `DELETE` | `/c` | 1× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js | **Implementar no Backend** |
| `GET` | `/token` | 4× | apps/frontend/.next/server/chunks/ssr/_26cef6ca._.js, apps/frontend/.next/static/chunks/d6df4dc7ef7a25ef.js +1 | **Implementar no Backend** |

---

## ⚠️  P1 - Alta Prioridade

Endpoints que frontend chama mas backend não implementa:

| Método | Path | Chamadas | Arquivos Frontend | Ação Requerida |
|----|----|----|----|----|
| `GET` | `/${s.default.env.NEXT_PUBLIC_API_URL}/api/feedbacks/` | 1× | apps/frontend/.next/static/chunks/e8084b2625be5df3.js | Implementar ou remover chamada FE |
| `GET` | `/);i=` | 2× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js | Implementar ou remover chamada FE |
| `DELETE` | `/Cache-Control` | 2× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js | Implementar ou remover chamada FE |
| `GET` | `/Content-Disposition` | 1× | apps/frontend/components/data/ExportImport.tsx | Implementar ou remover chamada FE |
| `GET` | `/DashboardLayout` | 4× | apps/frontend/.next/server/chunks/ssr/_cac60839._.js, apps/frontend/.next/server/chunks/ssr/_fe0c1256._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/Location` | 4× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/Star` | 1× | apps/frontend/.next/static/chunks/294b671af6697878.js | Implementar ou remover chamada FE |
| `GET` | `/X-Request-URL` | 1× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js | Implementar ou remover chamada FE |
| `GET` | `/api/auditlog/sessions/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/auditlog/sessions/active/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/auditlog/sessions/stats/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/auditlog/summaries/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/auditlog/summaries/by_date/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/` | 6× | apps/frontend/components/dashboard/OnboardingChecklist.tsx, apps/frontend/.next/server/chunks/ssr/_f44cd052._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/analytics/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/consultar-protocolo/` | 6× | apps/frontend/.next/server/chunks/ssr/_9e5525fb._.js, apps/frontend/.next/server/chunks/ssr/apps_frontend_app_acompanhar_page_tsx_45d0908b._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/export-csv/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/import/` | 1× | apps/frontend/components/data/ExportImport.tsx | Implementar ou remover chamada FE |
| `GET` | `/api/feedbacks/responder-protocolo/` | 3× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_acompanhar_page_tsx_45d0908b._.js, apps/frontend/.next/static/chunks/da697766cde6ef91.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/logout/all/` | 16× | apps/frontend/lib/auth.ts, apps/frontend/.next/server/chunks/ssr/_cac60839._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/password-reset/confirm/` | 4× | apps/frontend/.next/server/chunks/ssr/_26cef6ca._.js, apps/frontend/.next/static/chunks/d6df4dc7ef7a25ef.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/password-reset/request/` | 4× | apps/frontend/.next/server/chunks/ssr/_4fb8ee44._.js, apps/frontend/.next/static/chunks/d324109414d3feb9.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/push/notifications/mark_all_read/` | 1× | apps/frontend/components/notifications/NotificationCenter.tsx | Implementar ou remover chamada FE |
| `POST` | `/api/push/notifications/send/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `POST` | `/api/push/preferences/me/` | 2× | apps/frontend/lib/__audit__/api-integration-coverage.ts, apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `PATCH` | `/api/push/preferences/me/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `PUT` | `/api/push/subscriptions/` | 2× | apps/frontend/lib/__audit__/api-integration-coverage.ts, apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `POST` | `/api/push/subscriptions/status/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/push/subscriptions/subscribe/` | 2× | apps/frontend/public/sw.js, apps/frontend/components/notifications/NotificationPermissionPrompt.tsx | Implementar ou remover chamada FE |
| `POST` | `/api/push/subscriptions/unsubscribe/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `PUT` | `/api/response-templates/` | 1× | apps/frontend/components/feedback/ResponseTemplates.tsx | Implementar ou remover chamada FE |
| `PUT` | `/api/response-templates/stats/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `PUT` | `/api/tags/` | 2× | apps/frontend/lib/__audit__/api-integration-coverage.ts, apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `POST` | `/api/tags/stats/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/team/invitations/` | 8× | apps/frontend/.next/server/chunks/ssr/_9670547f._.js, apps/frontend/.next/server/chunks/ssr/_9670547f._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/team/invitations/accept/` | 4× | apps/frontend/.next/server/chunks/ssr/_40b902ce._.js, apps/frontend/.next/static/chunks/675237c45679de05.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/team/members/` | 4× | apps/frontend/.next/server/chunks/ssr/_9670547f._.js, apps/frontend/.next/static/chunks/ef57f59cb10a4f2e.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/team/members/stats/` | 4× | apps/frontend/.next/server/chunks/ssr/_9670547f._.js, apps/frontend/.next/static/chunks/ef57f59cb10a4f2e.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/tenants/subscription/` | 4× | apps/frontend/.next/server/chunks/ssr/_5cc505e8._.js, apps/frontend/.next/static/chunks/7cc56a5c5389466f.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/tenants/subscription/reactivate/` | 4× | apps/frontend/.next/server/chunks/ssr/_5cc505e8._.js, apps/frontend/.next/static/chunks/7cc56a5c5389466f.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/v1/billing/subscription/cancel/` | 1× | apps/frontend/hooks/use-billing.ts | Implementar ou remover chamada FE |
| `GET` | `/api/v1/billing/subscription/checkout/` | 3× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_(marketing)_precos_page_tsx_34e5c77f._.js, apps/frontend/.next/static/chunks/8cc8b44bae084799.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/v1/webhooks/deliveries/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/api/v1/webhooks/endpoints/` | 8× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_dashboard_configuracoes_webhooks_page_tsx_45c0cdde._.js, apps/frontend/.next/server/chunks/ssr/apps_frontend_app_dashboard_configuracoes_webhooks_page_tsx_45c0cdde._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/v1/webhooks/endpoints/available_events/` | 4× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_dashboard_configuracoes_webhooks_page_tsx_45c0cdde._.js, apps/frontend/.next/static/chunks/a887a2389a97ccf6.js +1 | Implementar ou remover chamada FE |
| `GET` | `/api/v1/webhooks/endpoints/stats/` | 4× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_dashboard_configuracoes_webhooks_page_tsx_45c0cdde._.js, apps/frontend/.next/static/chunks/a887a2389a97ccf6.js +1 | Implementar ou remover chamada FE |
| `POST` | `/api/v1/webhooks/events/` | 1× | apps/frontend/lib/__audit__/api-integration-coverage.ts | Implementar ou remover chamada FE |
| `GET` | `/authorization` | 6× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/server/chunks/ssr/_e841f2c2._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/b` | 1× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js | Implementar ou remover chamada FE |
| `DELETE` | `/b` | 2× | apps/frontend/.next/static/chunks/a6dad97d9634a72d.js, apps/frontend/.next/static/chunks/a6dad97d9634a72d.js | Implementar ou remover chamada FE |
| `GET` | `/cn` | 3× | apps/frontend/.next/server/chunks/ssr/_e841f2c2._.js, apps/frontend/.next/static/chunks/e8f93618cb6f2b65.js +1 | Implementar ou remover chamada FE |
| `GET` | `/content-length` | 5× | apps/frontend/.next/server/chunks/ssr/_e841f2c2._.js, apps/frontend/.next/server/chunks/ssr/_74bed9df._.js +1 | Implementar ou remover chamada FE |
| `POST` | `/content-type` | 5× | apps/frontend/.next/server/chunks/ssr/_e841f2c2._.js, apps/frontend/.next/server/chunks/ssr/_74bed9df._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/content-type` | 6× | apps/frontend/.next/server/chunks/ssr/_06b72d64._.js, apps/frontend/.next/static/chunks/a6dad97d9634a72d.js +1 | Implementar ou remover chamada FE |
| `GET` | `/cookie` | 10× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/dashboard` | 2× | apps/frontend/__tests__/seo.test.ts, apps/frontend/__tests__/seo.test.ts | Implementar ou remover chamada FE |
| `GET` | `/default` | 12× | apps/frontend/.next/server/chunks/ssr/apps_frontend_app_dashboard_page_tsx_23d8eaf2._.js, apps/frontend/.next/static/chunks/0c1a330cbf80ae2f.js +1 | Implementar ou remover chamada FE |
| `GET` | `/favicon.ico` | 3× | apps/frontend/app/layout.tsx, apps/frontend/.next/server/chunks/ssr/[root-of-the-server]__de9428af._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/http://localhost:8000/api` | 2× | apps/frontend/tests/e2e/fixtures.ts, apps/frontend/tests/e2e/fixtures.ts | Implementar ou remover chamada FE |
| `GET` | `/https://ouvify.com` | 4× | apps/frontend/components/StructuredData.tsx, apps/frontend/app/layout.tsx +1 | Implementar ou remover chamada FE |
| `GET` | `/https://ouvify.com.br` | 4× | apps/frontend/components/landing/StructuredData.tsx, apps/frontend/.next/server/chunks/ssr/apps_frontend_app_(marketing)_page_tsx_96dc83c4._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/invalidateVerificationCache` | 2× | apps/frontend/.next/server/chunks/ssr/_42ac1365._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/chunks/ssr/_42ac1365._.js | Implementar ou remover chamada FE |
| `GET` | `/next.route` | 70× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/server/chunks/ssr/_d08cf6fe._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/next.span_type` | 140× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/redirect` | 2× | apps/frontend/.next/static/chunks/5879f6f1a40be18c.js, apps/frontend/app/login/page.tsx | Implementar ou remover chamada FE |
| `GET` | `/rsc` | 2× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js | Implementar ou remover chamada FE |
| `GET` | `/set-cookie` | 21× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/settings` | 1× | apps/frontend/__tests__/seo.test.ts | Implementar ou remover chamada FE |
| `GET` | `/uid` | 4× | apps/frontend/.next/server/chunks/ssr/_26cef6ca._.js, apps/frontend/.next/static/chunks/d6df4dc7ef7a25ef.js +1 | Implementar ou remover chamada FE |
| `GET` | `/user-agent` | 2× | apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/chunks/[root-of-the-server]__d4f4b455._.js | Implementar ou remover chamada FE |
| `GET` | `/vary` | 2× | apps/frontend/.next/static/chunks/4ccb45f2b5f50f22.js, apps/frontend/.next/static/chunks/4ccb45f2b5f50f22.js | Implementar ou remover chamada FE |
| `GET` | `/x-action-redirect` | 1× | apps/frontend/.next/static/chunks/4ccb45f2b5f50f22.js | Implementar ou remover chamada FE |
| `GET` | `/x-action-revalidated` | 1× | apps/frontend/.next/static/chunks/4ccb45f2b5f50f22.js | Implementar ou remover chamada FE |
| `DELETE` | `/x-middleware-override-headers` | 2× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js | Implementar ou remover chamada FE |
| `GET` | `/x-middleware-rewrite` | 2× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js | Implementar ou remover chamada FE |
| `GET` | `/x-nonce` | 3× | apps/frontend/app/layout.tsx, apps/frontend/.next/server/chunks/ssr/[root-of-the-server]__de9428af._.js +1 | Implementar ou remover chamada FE |
| `GET` | `/x-prerender-revalidate` | 2× | apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js, apps/frontend/.next/standalone/apps/frontend/.next/server/edge/chunks/[root-of-the-server]__3e8bd9ef._.js | Implementar ou remover chamada FE |

---

## 📦 P2 - Orphan Endpoints (Cleanup Recomendado)

Backend implementa mas frontend não usa (pode ser legacy/documentação/testes):

<details>
<summary>Ver lista completa de orphans</summary>

| Método | Path | Tipo | Arquivos Backend |
|----|----|----|----| 
| `GET` | `/<path:url>/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/django/contrib/flatpages/urls.py |
| `POST` | `/<path:url>/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/django/contrib/flatpages/urls.py |
| `PUT` | `/<path:url>/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/django/contrib/flatpages/urls.py |
| `PATCH` | `/<path:url>/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/django/contrib/flatpages/urls.py |
| `DELETE` | `/<path:url>/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/django/contrib/flatpages/urls.py |
| `GET` | `/api-auth/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/tutorial/urls.py |
| `POST` | `/api-auth/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/tutorial/urls.py |
| `PUT` | `/api-auth/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/tutorial/urls.py |
| `PATCH` | `/api-auth/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/tutorial/urls.py |
| `DELETE` | `/api-auth/` | urlpattern | apps/backend/.venv/lib/python3.12/site-packages/tutorial/urls.py |
| `GET` | `/api/` | urlpattern | apps/backend/config/urls.py, apps/backend/config/urls.py |
| `POST` | `/api/` | urlpattern | apps/backend/config/urls.py, apps/backend/config/urls.py |
| `PUT` | `/api/` | urlpattern | apps/backend/config/urls.py, apps/backend/config/urls.py |
| `PATCH` | `/api/` | urlpattern | apps/backend/config/urls.py, apps/backend/config/urls.py |
| `DELETE` | `/api/` | urlpattern | apps/backend/config/urls.py, apps/backend/config/urls.py |
| `POST` | `/api/account/` | urlpattern | apps/backend/config/urls.py |
| `PUT` | `/api/account/` | urlpattern | apps/backend/config/urls.py |
| `PATCH` | `/api/account/` | urlpattern | apps/backend/config/urls.py |
| `DELETE` | `/api/account/` | urlpattern | apps/backend/config/urls.py |
| `POST` | `/api/analytics/` | urlpattern | apps/backend/config/urls.py |
| ... | ... | ... | *+295 endpoints* |

</details>

---

## ✅ Matched Endpoints

Total de 11 endpoints com contrato OK (Frontend ↔ Backend).

<details>
<summary>Ver lista completa</summary>

| Método | Path | Chamadas FE | Tipo BE |
|----|----|----|----|
| `GET` | `/api/account/` | 4× | urlpattern |
| `GET` | `/api/analytics/` | 3× | urlpattern |
| `GET` | `/api/auth/me/` | 4× | urlpattern |
| `GET` | `/api/export-data/` | 4× | urlpattern |
| `POST` | `/api/logout/` | 16× | urlpattern |
| `GET` | `/api/logout/` | 4× | urlpattern |
| `GET` | `/api/register-tenant/` | 6× | urlpattern |
| `GET` | `/api/tenant-info/` | 4× | urlpattern |
| `GET` | `/api/token/` | 3× | urlpattern |
| `GET` | `/api/upload-branding/` | 3× | urlpattern |
| `GET` | `/api/users/me/` | 3× | urlpattern |

</details>
