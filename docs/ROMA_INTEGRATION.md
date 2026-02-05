# Integração do ROMA (Sentient‑AGI) com o Ouvify

Este documento explica como subir o **ROMA-DSPy** (framework Sentient‑AGI/ROMA) localmente via Docker e como chamar o cliente `romaClient` do monorepo **Ouvify**.

## Visão geral

- ROMA roda como um servidor **FastAPI** e expõe uma REST API (OpenAPI) em:
  - `http://localhost:8000/docs`
  - healthcheck: `http://localhost:8000/health`
- O Ouvify usa o ROMA como **auditor inteligente** para gerar relatórios e planos de correção a partir de:
  - documentos (AUDIT_REPORT, ACTION_PLAN, LAUNCH_CHECKLIST etc.)
  - e, opcionalmente, leitura do código (montagem de volume/arquivos no container do ROMA via FileToolkit)

## Importante: conflito de porta com o backend do Ouvify

O `docker-compose.yml` do Ouvify sobe o backend Django em `localhost:8000`.

Você tem duas opções:

1. **Rodar ROMA na 8000** (requisito padrão do ROMA) e **parar o backend** enquanto audita.
2. Rodar ROMA em outra porta, por exemplo `8001`, e apontar o `RomaClient` para essa base URL.

Os scripts abaixo suportam `ROMA_API_PORT`.

## FASE 1 — Subir o ROMA em Docker

### Pré-requisitos

- `docker` e `docker compose`
- Para auditorias **determinísticas** (RepoAudit/RepoFixPlan), nenhuma chave externa é necessária.
- Opcional: para rodar com LLM, use um provider **local** OpenAI-compatible e configure o `.env` do ROMA para apontar para ele.

### Subir

Na raiz do monorepo Ouvify:

```bash
# Porta padrão (8000). Se o backend do Ouvify estiver rodando, vai conflitar.
./scripts/roma/roma_up.sh

# Alternativa para evitar conflito:
ROMA_API_PORT=8001 ./scripts/roma/roma_up.sh
```

O script vai:

- clonar o repo `sentient-agi/ROMA` em `.roma/ROMA`
- criar `.roma/ROMA/.env` a partir do `.env.example` (se necessário)
- copiar o profile `ouvify_auditor` para `.roma/ROMA/config/profiles/ouvify_auditor.yaml`
- aplicar um override de `--workers 1` (evita crash-loop em alguns ambientes Docker)
- subir o stack via `docker compose` e esperar o `/health`

### Configurar LLM (opcional)

Edite o arquivo:

- `.roma/ROMA/.env`

Se você for usar um LLM local OpenAI-compatible, configure a base URL e uma chave dummy (se exigida pelo cliente). Os modos determinísticos não precisam disso.

### Desligar

```bash
./scripts/roma/roma_down.sh
```

## Profile: `ouvify_auditor`

O profile fica no Ouvify em:

- `roma/profiles/ouvify_auditor.yaml`

Ao subir, o script copia esse profile para dentro do clone do ROMA em:

- `.roma/ROMA/config/profiles/ouvify_auditor.yaml`

Observação: profiles do ROMA configuram **modelos e toolkits**. As instruções específicas de auditoria do Ouvify ("ler AUDIT_REPORT...", "cruzar frontend↔backend" etc.) são enviadas como parte do `goal/context` pelo `RomaClient`.

## Cliente Python: `romaClient`

Arquivo:

- `scripts/roma/roma_client.py`

### Exemplo de uso (rápido)

```python
from scripts.roma.roma_client import RomaClient

client = RomaClient(base_url="http://localhost:8000", config_profile="ouvify_auditor", max_depth=4)

task = client.create_task(
    goal="Auditar o monorepo Ouvify e gerar um relatório de gaps acionável.",
    context={
        "repo_root": "/workspaces/Ouvify",
        "docs": ["AUDIT_REPORT.md", "ACTION_PLAN.md", "LAUNCH_CHECKLIST.md"],
    },
)

status = client.get_task_status(task.execution_id)
print(status)

result = client.get_task_result(task.execution_id)
print(result["result"])
```

## Próximo passo

A FASE 2 adiciona o script `scripts/run_roma_audit.py` para ler os documentos, resumir contexto, disparar o ROMA e salvar `AUDIT_REPORT_ROMA.md`.
