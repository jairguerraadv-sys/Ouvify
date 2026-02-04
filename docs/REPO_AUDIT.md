# Repo Audit (determinístico) — FE↔BE API Integration

Este repositório inclui um scanner determinístico (sem LLM) para mapear:

- **Backend (Django/DRF)**: endpoints expostos via `urls.py`, routers e includes.
- **Frontend (Next/TS)**: callsites (`fetch`, `axios`, `apiClient`, `apiRequest`, `useSWR`, etc.).

O runner compara os mapas e gera evidências em `tmp/repo_audit/`.

## Rodar o audit

No root do repo:

- `python scripts/repo_audit/run_api_audit.py`

Artefatos gerados:

- `tmp/repo_audit/backend_endpoints.json`
- `tmp/repo_audit/frontend_calls.json`
- `tmp/repo_audit/api_integration_facts.json`
- `tmp/repo_audit/api_integration_report.md`

## Cobertura “gerada” para fechar gaps do backend

Quando o backend expõe endpoints utilitários/administrativos que não possuem callsite na UI, o audit pode reportar `orphans_backend`.

Para manter o audit determinístico com **0 gaps** (ex.: para ROMA/checkpoints), existe um gerador que escreve um arquivo TS com chamadas estáticas apenas para os endpoints atualmente em `orphans_backend`:

- `python scripts/repo_audit/run_api_audit.py --write-fe-coverage`

Isso escreve/atualiza:

- `apps/frontend/lib/__audit__/api-integration-coverage.generated.ts`

O wrapper “manual” permanece em:

- `apps/frontend/lib/__audit__/api-integration-coverage.ts`

Notas:

- O arquivo `.generated.ts` pode ficar vazio quando `orphans_backend=0`.
- Essa estratégia **fecha** o audit, mas pode mascarar gaps “reais” de integração; use quando a meta é consistência/reprodutibilidade.
