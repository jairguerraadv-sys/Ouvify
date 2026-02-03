#!/usr/bin/env python3
"""Roda a Parte 1 (continuação): duplicações (>=20 linhas) e "não referenciados".

Este runner existe para ser executável sem depender do terminal da sessão
(quando há problemas como ENOPRO), e para gerar um artefato único em Markdown.

Uso:
  python scripts/audit/run_part1_continuation.py

Saída:
  - scripts/audit/PART1_CONTINUATION_RESULTS.md
"""

from __future__ import annotations

import io
import sys
from contextlib import redirect_stdout
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(".").resolve()
OUT_PATH = REPO_ROOT / "scripts/audit/PART1_CONTINUATION_RESULTS.md"


def run_duplicates() -> str:
    # Import local (sem depender de instalação)
    from scripts.audit import find_duplicates

    buf = io.StringIO()
    # Rodar com limites para manter tempo razoável
    argv_backup = sys.argv[:]
    try:
        sys.argv = [
            "find_duplicates.py",
            "--min-lines",
            "20",
            "--ext",
            "py",
            "ts",
            "tsx",
            "js",
            "jsx",
            "--max-bytes",
            str(350_000),
            "--max-lines",
            str(6000),
        ]
        with redirect_stdout(buf):
            find_duplicates.main()
    finally:
        sys.argv = argv_backup

    return buf.getvalue().strip() + "\n"


def run_unreferenced() -> tuple[str, str]:
    from scripts.audit.find_unreferenced import (
        find_unreferenced_backend,
        find_unreferenced_frontend,
    )

    backend = find_unreferenced_backend(REPO_ROOT)
    frontend = find_unreferenced_frontend(REPO_ROOT)

    def fmt(title: str, items) -> str:
        lines = [title, "-" * len(title), ""]
        if not items:
            return "\n".join(lines + ["Nenhum achado (pela heurística).", ""]) 
        lines.append(f"Total (suspeitos): {len(items)}")
        lines.append("")
        for f in items[:200]:
            lines.append(f"- {f.path}: {f.reason}")
        if len(items) > 200:
            lines.append(f"... (+{len(items) - 200} não exibidos)")
        lines.append("")
        return "\n".join(lines)

    return (
        fmt("Backend: arquivos potencialmente não referenciados", backend),
        fmt("Frontend: arquivos potencialmente não referenciados", frontend),
    )


def main() -> int:
    now = datetime.now(timezone.utc).astimezone()

    dup_out = run_duplicates()
    backend_out, frontend_out = run_unreferenced()

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        "\n".join(
            [
                "# Parte 1 (continuação) — Varredura sistemática\n",
                f"Gerado em: {now.isoformat()}\n",
                "## Duplicações (>= 20 linhas)\n",
                "Notas:\n",
                "- Heurística por blocos idênticos (normalização leve).\n",
                "- Para manter o tempo razoável, esta execução ignora arquivos > 350KB ou > 6000 linhas.\n",
                "\n```\n" + dup_out + "```\n",
                "## Potencialmente não referenciados (heurística)\n",
                "Notas:\n",
                "- Isto NÃO prova que o arquivo está morto (Next/Django podem referenciar por convenção, strings, settings, roteamento).\n",
                "- Use como fila de revisão manual (ex.: remover/arquivar ou adicionar referência explícita).\n",
                "\n```\n" + backend_out + "```\n",
                "\n```\n" + frontend_out + "```\n",
            ]
        ),
        encoding="utf-8",
    )

    print(f"OK: gerado {OUT_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
