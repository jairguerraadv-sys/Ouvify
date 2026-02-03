# Workflows desabilitados

Esta pasta existe para manter workflows antigos **fora do diretório `.github/workflows`**, evitando execução acidental.

## Por que existem?
- Alguns deploys foram substituídos pelo workflow unificado [../workflows/backend-ci.yml](../workflows/backend-ci.yml).
- Para o frontend, o deploy pode ocorrer via integração nativa do Vercel (Git) ou via pipeline separado.

## Como reabilitar
- Se fizer sentido para o seu processo, mova o arquivo desejado para `.github/workflows/` e revise:
  - secrets necessários (`RAILWAY_TOKEN`, `VERCEL_TOKEN`, etc.)
  - paths/working-directory
  - dependências/requirements (ver [../../apps/backend/requirements/](../../apps/backend/requirements/))

## Nota
Antes de reabilitar, valide se haverá duplicidade com pipelines existentes.
