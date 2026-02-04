"""Cliente simples para o REST API do ROMA-DSPy.

Contrato mínimo exigido:
- create_task(goal, context)
- get_task_status(id)
- get_task_result(id)

O ROMA-DSPy (como está hoje) não possui um campo REST explícito chamado
"context" no SolveRequest. Para manter o comportamento esperado, este
cliente:
- compõe goal + context em um único texto (full_goal)
- e também persiste um resumo em metadata (para rastreabilidade)

Endpoints base (ROMA):
- POST   /api/v1/executions
- GET    /api/v1/executions/{id}/status
- GET    /api/v1/executions/{id}/lm-traces

Dica: confira a OpenAPI do ROMA em: http://localhost:8000/docs
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Dict, List, Optional, Union

import requests


def _ensure_repo_root_on_sys_path() -> None:
    """Garante que o root do repo esteja no sys.path quando rodando como script.

    Motivo: em devcontainers é comum executar este arquivo a partir de outra pasta
    (ex.: `.roma/ROMA/`), o que impede `import scripts...` em snippets/REPL.

    Não é executado em import normal (evita efeitos colaterais).
    """
    import sys
    from pathlib import Path

    repo_root = Path(__file__).resolve().parents[2]
    repo_root_str = str(repo_root)
    if repo_root_str not in sys.path:
        sys.path.insert(0, repo_root_str)


DEFAULT_INSTRUCTIONS = """
Você é o ROMA atuando como auditor técnico do monorepo Ouvify.

Regras:
- Trabalhe com precisão: sempre cite arquivos/pastas/rotas quando possível.
- Priorize gaps críticos (segurança, auth, multi-tenant, integrações API, testes).
- Compare código vs documentação (AUDIT_REPORT, ACTION_PLAN, LAUNCH_CHECKLIST, SECURITY, API, DATABASE, ARCHITECTURE).

Entrega esperada:
- Um relatório em Markdown com lista numerada de achados.
- Cada achado deve ter: ID, descrição, localização, impacto, correção sugerida.
- Inclua também uma tabela de integração Frontend↔Backend (endpoints x chamadas).
""".strip()


class RomaClientError(RuntimeError):
    pass


@dataclass(frozen=True)
class RomaTask:
    execution_id: str
    status: str
    initial_goal: str


class RomaClient:
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        config_profile: str = "ouvify_auditor",
        max_depth: int = 4,
        timeout_seconds: int = 30,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.config_profile = config_profile
        self.max_depth = max_depth
        self.timeout_seconds = timeout_seconds

    def create_task(self, goal: str, context: Union[str, Dict[str, Any]]) -> RomaTask:
        full_goal = self._compose_full_goal(goal=goal, context=context)

        payload: Dict[str, Any] = {
            "goal": full_goal,
            "max_depth": self.max_depth,
            "config_profile": self.config_profile,
            "metadata": {
                "client": "ouvify/roma_client.py",
                "created_at": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "context_kind": "dict" if isinstance(context, dict) else "text",
            },
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/v1/executions",
                json=payload,
                timeout=self.timeout_seconds,
            )
        except requests.RequestException as exc:
            raise RomaClientError(
                f"Falha ao conectar no ROMA em {self.base_url}: {exc}"
            ) from exc

        if response.status_code not in (200, 202):
            raise RomaClientError(
                f"Erro ao criar execução no ROMA (HTTP {response.status_code}): {response.text}"
            )

        data = response.json()
        return RomaTask(
            execution_id=data["execution_id"],
            status=data.get("status", "unknown"),
            initial_goal=data.get("initial_goal", ""),
        )

    def get_task_status(self, execution_id: str) -> Dict[str, Any]:
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions/{execution_id}/status",
                timeout=self.timeout_seconds,
            )
        except requests.RequestException as exc:
            raise RomaClientError(f"Falha ao consultar status no ROMA: {exc}") from exc

        if response.status_code != 200:
            raise RomaClientError(
                f"Erro ao consultar status (HTTP {response.status_code}): {response.text}"
            )

        return response.json()

    def get_task_result(self, execution_id: str) -> Dict[str, Any]:
        """Retorna um dicionário com o melhor 'resultado final' disponível.

        Observação: no ROMA atual, o campo final_result existe no banco,
        mas não é exposto diretamente na ExecutionResponse.

        Estratégia:
        1) Verifica status (completed/failed/cancelled)
        2) Busca LM traces do módulo 'aggregator' e pega a resposta mais recente
        3) Fallback: executor
        """

        status = self.get_task_status(execution_id)
        exec_status = status.get("status")

        if exec_status not in {"completed", "failed", "cancelled"}:
            return {
                "execution_id": execution_id,
                "status": exec_status,
                "result": None,
                "source": None,
            }

        aggregator = self._get_latest_lm_response(
            execution_id, module_name="aggregator"
        )
        if aggregator:
            return {
                "execution_id": execution_id,
                "status": exec_status,
                "result": aggregator["response"],
                "source": "lm-traces:aggregator",
                "trace": aggregator,
            }

        executor = self._get_latest_lm_response(execution_id, module_name="executor")
        if executor:
            return {
                "execution_id": execution_id,
                "status": exec_status,
                "result": executor["response"],
                "source": "lm-traces:executor",
                "trace": executor,
            }

        checkpoint_root = self._get_checkpoint_root_result(execution_id)
        if checkpoint_root is not None:
            return {
                "execution_id": execution_id,
                "status": exec_status,
                "result": checkpoint_root,
                "source": "checkpoint:root_task",
            }

        return {
            "execution_id": execution_id,
            "status": exec_status,
            "result": None,
            "source": None,
        }

    def _get_checkpoint_root_result(self, execution_id: str) -> Optional[Any]:
        """Obtém o resultado do task root via endpoint /checkpoint.

        Útil quando a execução finaliza de forma determinística (sem LLM), e portanto
        não existe lm-trace para recuperar o texto final.
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions/{execution_id}/checkpoint",
                timeout=self.timeout_seconds,
            )
        except requests.RequestException as exc:
            raise RomaClientError(f"Falha ao buscar checkpoint no ROMA: {exc}") from exc

        if response.status_code != 200:
            return None

        payload = response.json() or {}
        tasks = payload.get("tasks") or {}
        if not isinstance(tasks, dict) or not tasks:
            return None

        # Prefer root (parent_id ausente/None) e menor depth.
        candidates = []
        for _task_id, t in tasks.items():
            if not isinstance(t, dict):
                continue
            parent_id = t.get("parent_id")
            depth = t.get("depth")
            result = t.get("result")
            if result is None:
                continue
            is_root = parent_id in (None, "")
            try:
                depth_int = int(depth) if depth is not None else 999
            except (TypeError, ValueError):
                depth_int = 999
            candidates.append((0 if is_root else 1, depth_int, result))

        if not candidates:
            return None

        candidates.sort(key=lambda x: (x[0], x[1]))
        return candidates[0][2]

    def _get_latest_lm_response(
        self, execution_id: str, module_name: str
    ) -> Optional[Dict[str, Any]]:
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions/{execution_id}/lm-traces",
                params={"module_name": module_name, "limit": 1000},
                timeout=self.timeout_seconds,
            )
        except requests.RequestException as exc:
            raise RomaClientError(f"Falha ao buscar lm-traces no ROMA: {exc}") from exc

        if response.status_code != 200:
            raise RomaClientError(
                f"Erro ao buscar lm-traces (HTTP {response.status_code}): {response.text}"
            )

        traces: List[Dict[str, Any]] = response.json()
        # O endpoint não garante ordenação; usamos created_at.
        traces = [t for t in traces if t.get("response")]
        if not traces:
            return None

        def _key(t: Dict[str, Any]) -> str:
            # ISO 8601 string comparável lexicograficamente
            return t.get("created_at") or ""

        latest = sorted(traces, key=_key)[-1]
        return latest

    def _compose_full_goal(self, goal: str, context: Union[str, Dict[str, Any]]) -> str:
        if isinstance(context, dict):
            # Mantém determinístico e fácil de ler.
            lines = []
            for key in sorted(context.keys()):
                value = context[key]
                if value is None:
                    continue
                if isinstance(value, (list, tuple)):
                    rendered = "\n".join(f"- {v}" for v in value)
                    lines.append(f"## {key}\n{rendered}")
                else:
                    lines.append(f"## {key}\n{value}")
            context_text = "\n\n".join(lines)
        else:
            context_text = context

        return "\n\n".join(
            [
                DEFAULT_INSTRUCTIONS,
                "# Goal",
                goal.strip(),
                "# Context",
                context_text.strip(),
            ]
        ).strip()


def _main() -> int:
    _ensure_repo_root_on_sys_path()

    import argparse
    import time
    from pathlib import Path

    parser = argparse.ArgumentParser(
        description="Executa uma tarefa no ROMA via REST (modo local/offline)."
    )
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8000",
        help="URL do ROMA API (default: http://127.0.0.1:8000)",
    )
    parser.add_argument(
        "--profile",
        default="local_tools_only",
        help="Config profile do ROMA (default: local_tools_only)",
    )
    parser.add_argument(
        "--max-depth",
        type=int,
        default=0,
        help="Profundidade máxima (default: 0 para execução direta)",
    )
    parser.add_argument(
        "--goal",
        required=True,
        help="Objetivo/tarefa (texto)",
    )
    parser.add_argument(
        "--context",
        default="",
        help="Contexto adicional (texto). Para contexto estruturado, use JSON via arquivo e rode seu próprio wrapper.",
    )
    parser.add_argument(
        "--repo-root",
        default=None,
        help="Root do monorepo visível pelo ROMA (ex.: /workspaces/Ouvify).",
    )
    parser.add_argument(
        "--deterministic",
        choices=("audit", "fix-plan"),
        default=None,
        help=(
            "Modo determinístico quando --repo-root é usado. "
            "audit -> RepoAudit: api_integration; fix-plan -> RepoFixPlan: api_integration. "
            "Se omitido, tenta inferir pelo --goal (default: audit)."
        ),
    )
    parser.add_argument(
        "--repo-prefix-equivalences",
        default=None,
        help=(
            "Equivalências de prefixo para o scanner (passado como RepoPrefixEquivalences). "
            "Formato: FROM=TO,FROM2=TO2 (ex: /api=,/v1=/api/v1)."
        ),
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Timeout HTTP em segundos (default: 30)",
    )
    parser.add_argument(
        "--poll-seconds",
        type=float,
        default=0.5,
        help="Intervalo de polling (default: 0.5)",
    )
    parser.add_argument(
        "--max-wait-seconds",
        type=int,
        default=120,
        help="Tempo máximo de espera por conclusão (default: 120)",
    )
    parser.add_argument(
        "--out",
        default=None,
        help="Caminho de saída para salvar o resultado (opcional).",
    )
    parser.add_argument(
        "--out-dir",
        default=None,
        help=(
            "Diretório de saída para salvar automaticamente o resultado como "
            "<execution_id>.(json|txt). Ignorado se --out for fornecido."
        ),
    )
    parser.add_argument(
        "--out-format",
        choices=("text", "json"),
        default="text",
        help="Formato do arquivo de saída quando --out é usado (default: text)",
    )
    parser.add_argument(
        "--print-json",
        action="store_true",
        help="Imprime o objeto completo do resultado em JSON no stdout (útil para pipes).",
    )
    parser.add_argument(
        "--no-print-result",
        action="store_true",
        help="Não imprime o resultado no stdout (ainda imprime execution_id).",
    )

    args = parser.parse_args()

    if args.out and args.out_dir:
        parser.error("Use apenas um entre --out e --out-dir.")

    client = RomaClient(
        base_url=args.base_url,
        config_profile=args.profile,
        max_depth=args.max_depth,
        timeout_seconds=args.timeout,
    )

    context_text = args.context
    if args.repo_root:
        # Linhas âncora para o hook determinístico no solver (RepoAuditToolkit)
        import re

        mode = args.deterministic
        if mode is None:
            if re.search(r"(?i)\b(plano|fix\s*plan|roma_fix_plan)\b", args.goal or ""):
                mode = "fix-plan"
            else:
                mode = "audit"

        anchor = (
            "RepoAudit: api_integration"
            if mode == "audit"
            else "RepoFixPlan: api_integration"
        )
        prefix_line = (
            f"RepoPrefixEquivalences: {args.repo_prefix_equivalences}\n"
            if args.repo_prefix_equivalences
            else ""
        )

        context_text = (
            f"RepoRoot: {args.repo_root}\n"
            + prefix_line
            + f"{anchor}\n"
            + (context_text or "")
        )

    task = client.create_task(goal=args.goal, context=context_text)
    print(task.execution_id)

    deadline = time.time() + args.max_wait_seconds
    while time.time() < deadline:
        st = client.get_task_status(task.execution_id).get("status")
        if st in {"completed", "failed", "cancelled"}:
            break
        time.sleep(args.poll_seconds)

    result = client.get_task_result(task.execution_id)
    out_path: Path | None = None
    if args.out:
        out_path = Path(args.out)
    elif args.out_dir:
        ext = "json" if args.out_format == "json" else "txt"
        out_path = Path(args.out_dir) / f"{task.execution_id}.{ext}"

    if out_path is not None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        if args.out_format == "json":
            out_path.write_text(
                json.dumps(result, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        else:
            out_path.write_text(
                (str(result.get("result")) if result.get("result") else "") + "\n",
                encoding="utf-8",
            )

    if args.print_json:
        print(json.dumps(result, ensure_ascii=False))
        return 0

    if not args.no_print_result:
        print("\n---\n")
        print(f"status: {result.get('status')}")
        print(f"source: {result.get('source')}")
        if result.get("result"):
            print("\n" + str(result["result"]))
        else:
            print("(sem resultado disponível via lm-traces)")

    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
