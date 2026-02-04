#!/usr/bin/env bash
set -euo pipefail

# Sobe o ROMA-DSPy em Docker, copiando o profile 'ouvify_auditor' para o local esperado.
#
# Uso:
#   ROMA_API_PORT=8000 scripts/roma/roma_up.sh
#   ROMA_API_PORT=8001 scripts/roma/roma_up.sh
#
# Requisitos:
# - docker + docker compose
# - para modos determinísticos (RepoAudit/RepoFixPlan), nenhuma chave externa é necessária.
# - opcional: se você quiser habilitar um LLM *local* (OpenAI-compatible), configure isso no .env do ROMA.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROMA_PARENT_DIR="${ROOT_DIR}/.roma"
ROMA_DIR="${ROMA_PARENT_DIR}/ROMA"
PROFILE_SRC="${ROOT_DIR}/roma/profiles/ouvify_auditor.yaml"

COMPOSE_FILE_BASE="${ROMA_DIR}/docker-compose.yaml"
COMPOSE_FILE_OVERRIDE="${ROMA_DIR}/docker-compose.ouvify.override.yaml"

ROMA_API_PORT="${ROMA_API_PORT:-8000}"

mkdir -p "${ROMA_PARENT_DIR}"

if [[ ! -d "${ROMA_DIR}/.git" ]]; then
  echo "[roma_up] Clonando sentient-agi/ROMA em ${ROMA_DIR}..."
  git clone --depth 1 https://github.com/sentient-agi/ROMA.git "${ROMA_DIR}"
else
  echo "[roma_up] ROMA já clonado em ${ROMA_DIR}"
fi

if [[ ! -f "${ROMA_DIR}/.env" ]]; then
  echo "[roma_up] Criando .env a partir do .env.example..."
  cp "${ROMA_DIR}/.env.example" "${ROMA_DIR}/.env"
fi

# Garante que o profile existe no local que o ROMA espera.
if [[ ! -f "${PROFILE_SRC}" ]]; then
  echo "[roma_up] ERRO: profile não encontrado: ${PROFILE_SRC}" >&2
  exit 1
fi

mkdir -p "${ROMA_DIR}/config/profiles"
cp "${PROFILE_SRC}" "${ROMA_DIR}/config/profiles/ouvify_auditor.yaml"

# Ajusta porta do API no .env (sem depender de edição manual)
if grep -q '^API_PORT=' "${ROMA_DIR}/.env"; then
  sed -i "s/^API_PORT=.*/API_PORT=${ROMA_API_PORT}/" "${ROMA_DIR}/.env"
else
  echo "API_PORT=${ROMA_API_PORT}" >> "${ROMA_DIR}/.env"
fi

# Override: rodar com 1 worker.
# Motivo: em alguns ambientes Docker, o modo multi-worker pode crashar em loop,
# deixando o serviço inacessível (healthcheck falha). Com 1 worker fica estável.
cat >"${COMPOSE_FILE_OVERRIDE}" <<'YAML'
services:
  roma-api:
    command: ["roma-dspy", "server", "start", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
YAML

cat <<EOF
[roma_up] Configuração:
  ${ROMA_DIR}/.env

Modos determinísticos (recomendado para 100% local/offline):
- Não exigem chave externa.

Opcional (LLM local OpenAI-compatible):
- Configure a base URL e uma chave dummy conforme o provider do seu ambiente.

Observação sobre porta:
- Este script vai subir o ROMA em http://localhost:${ROMA_API_PORT}
- Ouvify backend (docker-compose.yml) também usa 8000 por padrão.
  Se o backend estiver rodando, use ROMA_API_PORT=8001, ou pare o backend.
EOF

echo "[roma_up] Subindo serviços do ROMA via docker compose..."
cd "${ROMA_DIR}"

docker compose -f "${COMPOSE_FILE_BASE}" -f "${COMPOSE_FILE_OVERRIDE}" up -d --build

echo "[roma_up] Aguardando healthcheck..."
for i in {1..40}; do
  if curl -fsS "http://localhost:${ROMA_API_PORT}/health" >/dev/null 2>&1; then
    echo "[roma_up] OK: ROMA saudável em http://localhost:${ROMA_API_PORT}/docs"
    exit 0
  fi
  sleep 2
done

echo "[roma_up] ERRO: ROMA não ficou saudável a tempo. Veja logs:" >&2

docker compose -f "${COMPOSE_FILE_BASE}" -f "${COMPOSE_FILE_OVERRIDE}" logs --tail=200 roma-api >&2 || true
exit 1
