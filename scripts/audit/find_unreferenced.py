#!/usr/bin/env python3
"""Heurística para listar arquivos potencialmente não referenciados.

Objetivo:
- Apoiar auditoria identificando código possivelmente morto/órfão.

Importante:
- Em monorepos Next.js + Django há várias formas indiretas de referência
  (framework entrypoints, strings, templates, settings, import dinâmico).
  Portanto, este script classifica como **SUSPEITO** (não “garantidamente morto”).

Uso:
  python scripts/audit/find_unreferenced.py frontend
  python scripts/audit/find_unreferenced.py backend

Saída:
- Imprime um relatório texto.
- Retorna código 0 sempre (para uso em auditoria sem quebrar CI).
"""

from __future__ import annotations

import ast
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


EXCLUDES = {
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

FRONTEND_ROOT = Path("apps/frontend")
BACKEND_ROOT = Path("apps/backend")


@dataclass(frozen=True)
class Finding:
    path: Path
    reason: str


def walk_files(root: Path, suffixes: tuple[str, ...]) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDES]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix in suffixes:
                yield p


def frontend_entrypoints(path: Path) -> bool:
    name = path.name
    if name in {"middleware.ts", "middleware.js"}:
        return True
    if name in {"next.config.js", "next.config.mjs"}:
        return True
    # Next App Router
    if name in {"page.tsx", "page.jsx", "layout.tsx", "layout.jsx", "route.ts", "route.js", "loading.tsx", "error.tsx", "not-found.tsx"}:
        return True
    # scripts/ executáveis
    if "apps/frontend/scripts" in str(path.as_posix()):
        return True
    return False


IMPORT_RE = re.compile(
    r"(?:"
    r"import\s+(?:type\s+)?[\s\S]*?\sfrom\s+['\"]([^'\"]+)['\"]"
    r"|import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"
    r"|require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"
    r")",
    re.MULTILINE,
)


def frontend_collect_references(frontend_root: Path) -> set[Path]:
    referenced: set[Path] = set()

    for file in walk_files(frontend_root, (".ts", ".tsx", ".js", ".jsx")):
        try:
            text = file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        for match in IMPORT_RE.findall(text):
            spec = next((m for m in match if m), "")
            if not spec:
                continue
            # alias @/ -> apps/frontend/
            if spec.startswith("@/"):
                rel = spec[2:]
                base = frontend_root / rel
            elif spec.startswith("./") or spec.startswith("../"):
                base = (file.parent / spec).resolve()
                # normalizar para dentro do frontend_root se possível
                try:
                    base = base.relative_to(frontend_root.resolve())
                    base = frontend_root / base
                except Exception:
                    pass
            else:
                # pacote externo
                continue

            candidates = [
                base,
                base.with_suffix(".ts"),
                base.with_suffix(".tsx"),
                base.with_suffix(".js"),
                base.with_suffix(".jsx"),
                base / "index.ts",
                base / "index.tsx",
                base / "index.js",
                base / "index.jsx",
            ]
            for c in candidates:
                if c.exists():
                    referenced.add(c.resolve())

    return referenced


def find_unreferenced_frontend(repo_root: Path) -> list[Finding]:
    frontend_root = (repo_root / FRONTEND_ROOT).resolve()
    referenced = frontend_collect_references(frontend_root)

    findings: list[Finding] = []
    for file in walk_files(frontend_root, (".ts", ".tsx", ".js", ".jsx")):
        if "__tests__" in file.parts or "tests" in file.parts or "e2e" in file.parts:
            continue
        if frontend_entrypoints(file):
            continue
        if file.name.startswith("."):
            continue
        if file.resolve() not in referenced:
            findings.append(Finding(path=file.relative_to(repo_root), reason="não importado por heurística"))

    return sorted(findings, key=lambda f: str(f.path))


def backend_entrypoints(path: Path) -> bool:
    # entrypoints Django
    if path.name in {"manage.py", "wsgi.py", "asgi.py", "celery.py", "urls.py", "settings.py"}:
        return True
    if path.name in {"apps.py", "admin.py"}:
        return True
    # migrations nunca são importadas diretamente
    if "migrations" in path.parts:
        return True
    return False


def parse_imports_py(path: Path) -> set[str]:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return set()

    try:
        tree = ast.parse(text)
    except SyntaxError:
        return set()

    mods: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                mods.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                mods.add(node.module)
    return mods


def find_unreferenced_backend(repo_root: Path) -> list[Finding]:
    backend_root = (repo_root / BACKEND_ROOT).resolve()

    # Mapear módulos internos por caminho
    internal_files: list[Path] = [p for p in walk_files(backend_root, (".py",)) if p.name != "__init__.py"]

    # Coletar imports de todos os arquivos do backend
    imported_modules: set[str] = set()
    for file in internal_files:
        imported_modules |= parse_imports_py(file)

    # Construir mapa module->file (apenas para apps/backend/apps/**)
    apps_root = backend_root / "apps"
    module_to_file: dict[str, Path] = {}
    for file in walk_files(apps_root, (".py",)):
        if file.name == "__init__.py":
            continue
        rel = file.relative_to(backend_root)
        module = ".".join(rel.with_suffix("").parts)
        module_to_file[module] = file

    referenced_files: set[Path] = set()
    # Resolver imports que começam com "apps."
    for mod in imported_modules:
        if mod.startswith("apps."):
            # mod pode apontar para pacote; tentamos resolver arquivo direto
            if mod in module_to_file:
                referenced_files.add(module_to_file[mod].resolve())
            else:
                # tentar resolver como pacote/__init__ ou módulo parcial
                # aqui é heurístico: só marca arquivos que casam prefixos exatos
                for k, v in module_to_file.items():
                    if k.startswith(mod + "."):
                        referenced_files.add(v.resolve())

    findings: list[Finding] = []
    for file in module_to_file.values():
        if backend_entrypoints(file):
            continue
        if file.resolve() not in referenced_files:
            findings.append(
                Finding(
                    path=file.relative_to(repo_root),
                    reason="não importado por heurística (pode ser usado via Django wiring/strings)",
                )
            )

    return sorted(findings, key=lambda f: str(f.path))


def print_report(title: str, findings: list[Finding], limit: int = 200) -> None:
    print(title)
    print("=" * len(title))
    if not findings:
        print("Nenhum achado (pela heurística).")
        return

    for f in findings[:limit]:
        print(f"- {f.path}: {f.reason}")

    if len(findings) > limit:
        print(f"... (+{len(findings) - limit} não exibidos)")


def main(argv: list[str]) -> int:
    mode = (argv[1] if len(argv) > 1 else "").strip().lower()
    repo_root = Path(".").resolve()

    if mode == "frontend":
        findings = find_unreferenced_frontend(repo_root)
        print_report("Frontend: arquivos potencialmente não referenciados", findings)
        return 0

    if mode == "backend":
        findings = find_unreferenced_backend(repo_root)
        print_report("Backend: arquivos potencialmente não referenciados", findings)
        return 0

    print("Uso: python scripts/audit/find_unreferenced.py [frontend|backend]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
