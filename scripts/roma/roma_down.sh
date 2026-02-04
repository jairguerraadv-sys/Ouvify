#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROMA_DIR="${ROOT_DIR}/.roma/ROMA"
COMPOSE_FILE_BASE="${ROMA_DIR}/docker-compose.yaml"
COMPOSE_FILE_OVERRIDE="${ROMA_DIR}/docker-compose.ouvify.override.yaml"

if [[ ! -d "${ROMA_DIR}" ]]; then
  echo "[roma_down] ROMA não encontrado em ${ROMA_DIR} (nada a fazer)"
  exit 0
fi

cd "${ROMA_DIR}"
if [[ -f "${COMPOSE_FILE_OVERRIDE}" ]]; then
  docker compose -f "${COMPOSE_FILE_BASE}" -f "${COMPOSE_FILE_OVERRIDE}" down
else
  docker compose -f "${COMPOSE_FILE_BASE}" down
fi

echo "[roma_down] ROMA desligado"
