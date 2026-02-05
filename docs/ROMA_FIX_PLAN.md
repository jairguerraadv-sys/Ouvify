# ROMA Fix Plan (determinístico) — FE↔BE API

Plano gerado localmente a partir de evidências determinísticas (sem LLM externo).

## Resumo

| Métrica                | Valor |
| ---------------------- | ----: |
| backend_endpoints      |    82 |
| frontend_calls         |    43 |
| matched                |    12 |
| matched_unknown_method |    11 |
| orphans_frontend       |    17 |
| orphans_backend        |     8 |
| mismatched_method      |     0 |
| base_url_smells        |     0 |

## Hotspots por domínio

Aparecem em órfãos FE e merecem priorização:

- Consentimento
- Webhooks
- Exportação
- Importação
- Billing/Assinaturas
- Feedbacks

## Backlog priorizado

| Prioridade | Arquivo                                                     | Ação                                                                                                                                                                                                                 | Risco | Teste sugerido                                    |
| ---------: | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------- |
|          1 | apps/frontend/app/dashboard/configuracoes/webhooks/page.tsx | Criar endpoint no BE ou ajustar FE: GET /webhooks/endpoints; Criar endpoint no BE ou ajustar FE: POST /webhooks/endpoints; Criar endpoint no BE ou ajustar FE: GET /webhooks/endpoints/available_events; ...(mais 6) | médio | teste e2e/integração da(s) página(s) impactadas   |
|          2 | apps/frontend/components/ConsentModal.tsx                   | Criar endpoint no BE ou ajustar FE: POST /api/consent/user-consents/accept; Criar endpoint no BE ou ajustar FE: GET /api/consent/user-consents/pending                                                               | médio | teste e2e/integração da(s) página(s) impactadas   |
|          3 | apps/frontend/components/data/ExportImport.tsx              | Criar endpoint no BE ou ajustar FE: GET /api/feedbacks/export-advanced; Criar endpoint no BE ou ajustar FE: POST /api/feedbacks/import                                                                               | médio | teste e2e/integração da(s) página(s) impactadas   |
|          4 | apps/frontend/app/convite/[token]/page.tsx                  | Criar endpoint no BE ou ajustar FE: POST /api/team/invitations/accept                                                                                                                                                | médio | teste e2e/integração da(s) página(s) impactadas   |
|          5 | apps/frontend/app/dashboard/equipe/page.tsx                 | Criar endpoint no BE ou ajustar FE: GET /api/team/members/stats                                                                                                                                                      | médio | teste e2e/integração da(s) página(s) impactadas   |
|          6 | apps/frontend/app/dashboard/relatorios/page.tsx             | Criar endpoint no BE ou ajustar FE: GET /api/feedbacks/export                                                                                                                                                        | médio | teste e2e/integração da(s) página(s) impactadas   |
|          7 | apps/frontend/hooks/use-billing.ts                          | Criar endpoint no BE ou ajustar FE: POST /api/v1/billing/subscription/cancel                                                                                                                                         | médio | teste e2e/integração da(s) página(s) impactadas   |
|          8 | apps/backend/config/urls.py                                 | Decidir: expor no FE ou remover/ocultar rota: GET /api/admin/tenants; Decidir: expor no FE ou remover/ocultar rota: POST /api/admin/tenants; ...(mais 6)                                                             | baixo | testes unitários de rota/permission + smoke no FE |

## Regras de normalização

- Paths: remove trailing slash (exceto '/') e normaliza '//' → '/'.
- Params: normaliza placeholders para '{param}' (ex: '{id}', '{pk}', '<int:id>').
- Método: usa 'UNKNOWN' quando não é possível inferir; não gera mismatch automático nesses casos.

## Critérios de conclusão

- Reduzir `orphans_frontend` e `mismatched_method` de forma mensurável.
- Garantir que páginas principais não disparem 404/500 (smoke/e2e).
