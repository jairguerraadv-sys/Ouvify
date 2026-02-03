#!/usr/bin/env python3
"""Heurística simples para detectar blocos de código duplicados.

Objetivo:
- Ajudar a auditoria a identificar duplicações relevantes (>= N linhas) entre arquivos.

Características:
- Busca blocos de linhas *exatas* (após normalização leve) repetidos em arquivos diferentes.
- Ignora pastas comuns de build/cache e arquivos grandes/gerados.

Uso:
  python scripts/audit/find_duplicates.py --min-lines 20 --ext py ts tsx js jsx

Observação:
- Não substitui ferramentas dedicadas (ex.: jscpd), mas é útil quando você quer
  um detector local sem dependências.
"""

from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_EXCLUDES = {
    ".git",
    ".next",
    ".turbo",
    "node_modules",
    "dist",
    "build",
    "staticfiles",
    "playwright-report",
    "test-results",
    "__pycache__",
    ".pytest_cache",
}

DEFAULT_SKIP_FILES = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
}


@dataclass(frozen=True)
class Occurrence:
    file: Path
    start_line: int


def iter_files(root: Path, exts: set[str], excludes: set[str]) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        # prune
        dirnames[:] = [d for d in dirnames if d not in excludes]

        for name in filenames:
            if name in DEFAULT_SKIP_FILES:
                continue
            path = Path(dirpath) / name
            if path.suffix.lstrip(".") in exts:
                yield path


def normalize_lines(lines: list[str]) -> list[str]:
    out: list[str] = []
    for line in lines:
        # normalização leve: remove whitespace no fim e colapsa linhas vazias múltiplas
        out.append(line.rstrip())
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Raiz do repositório")
    parser.add_argument("--min-lines", type=int, default=20, help="Tamanho mínimo do bloco")
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=0,
        help="Ignora arquivos maiores que este tamanho (0 = sem limite)",
    )
    parser.add_argument(
        "--max-lines",
        type=int,
        default=0,
        help="Ignora arquivos com mais linhas que este número (0 = sem limite)",
    )
    parser.add_argument(
        "--ext",
        nargs="+",
        default=["py", "ts", "tsx", "js", "jsx"],
        help="Extensões a considerar",
    )
    parser.add_argument(
        "--exclude",
        nargs="+",
        default=sorted(DEFAULT_EXCLUDES),
        help="Pastas a ignorar",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    min_lines: int = args.min_lines
    max_bytes: int = args.max_bytes
    max_lines: int = args.max_lines
    exts = {e.lstrip(".") for e in args.ext}
    excludes = set(args.exclude)

    # índice: tuple(bloco) -> [ocorrências]
    blocks: dict[tuple[str, ...], list[Occurrence]] = {}

    for path in iter_files(root, exts, excludes):
        if max_bytes and path.exists():
            try:
                if path.stat().st_size > max_bytes:
                    continue
            except OSError:
                continue
        try:
            raw = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except Exception:
            continue

        if max_lines and len(raw) > max_lines:
            continue

        lines = normalize_lines(raw)
        if len(lines) < min_lines:
            continue

        # janela deslizante simples
        for start in range(0, len(lines) - min_lines + 1):
            block = tuple(lines[start : start + min_lines])

            # ignorar blocos muito "vazios" (evita falsos positivos)
            non_empty = sum(1 for l in block if l.strip())
            if non_empty < max(3, min_lines // 4):
                continue

            blocks.setdefault(block, []).append(Occurrence(file=path, start_line=start + 1))

    # filtrar duplicados entre arquivos diferentes
    duplicates = [(blk, occs) for blk, occs in blocks.items() if len({o.file for o in occs}) > 1]

    # ordenar por número de ocorrências desc
    duplicates.sort(key=lambda item: len(item[1]), reverse=True)

    if not duplicates:
        print("Nenhum bloco duplicado encontrado (min-lines=%d)." % min_lines)
        return 0

    print("Blocos duplicados (min-lines=%d):" % min_lines)
    print("=" * 80)

    max_show = 50
    for idx, (blk, occs) in enumerate(duplicates[:max_show], start=1):
        print(f"\n[{idx}] Repetições: {len(occs)} | Arquivos: {len({o.file for o in occs})}")
        for o in occs[:10]:
            rel = o.file.relative_to(root)
            print(f"  - {rel}:{o.start_line}")
        if len(occs) > 10:
            print(f"  ... (+{len(occs) - 10} ocorrências)")

        print("  --- trecho (primeiras 5 linhas) ---")
        for l in blk[:5]:
            print("  " + l)

    if len(duplicates) > max_show:
        print(f"\n... (+{len(duplicates) - max_show} grupos não exibidos)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
