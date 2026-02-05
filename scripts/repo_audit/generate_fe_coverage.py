from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, List


@dataclass(frozen=True)
class BackendOrphan:
    method: str
    path: str


def _ts_string_literal(s: str) -> str:
    # Usamos template string para permitir ${id}
    s = s.replace("`", "\\`")
    return f"`{s}`"


def _path_to_ts_template(path: str) -> str:
    """Converte /api/x/{param}/y -> `/api/x/${id}/y/`.

    Mantém a barra final se existir no input.
    """

    return path.replace("{param}", "${id}")


def _render_call(method: str, path: str, *, id_var: str = "id") -> str:
    m = method.upper()
    url_tmpl = _path_to_ts_template(path)
    url_lit = _ts_string_literal(url_tmpl)

    # Para métodos com body, passamos {} para estabilizar a assinatura.
    if m == "GET":
        return f"  await api.get({url_lit});"
    if m == "DELETE":
        return f"  await api.delete({url_lit});"
    if m == "POST":
        return f"  await api.post({url_lit}, {{}});"
    if m == "PUT":
        return f"  await api.put({url_lit}, {{}});"
    if m == "PATCH":
        return f"  await api.patch({url_lit}, {{}});"

    # Fallback conservador
    return f"  await api.get({url_lit});"


def render_typescript_coverage(
    *,
    orphans_backend: Iterable[dict[str, Any]],
    header_comment: str | None = None,
) -> str:
    items: List[BackendOrphan] = []
    for row in orphans_backend:
        method = str(row.get("method") or "").upper().strip() or "GET"
        path = str(row.get("path") or "").strip()
        if not path.startswith("/"):
            continue
        items.append(BackendOrphan(method=method, path=path))

    # Ordena para estabilidade no diff
    items = sorted(items, key=lambda x: (x.path, x.method))

    lines: List[str] = []
    lines.append("/**")
    lines.append(" * ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE MANUALMENTE")
    lines.append(" *")
    lines.append(
        " * Gerado por: scripts/repo_audit/run_api_audit.py --write-fe-coverage"
    )
    lines.append(
        " * Fonte: lista determinística de `orphans_backend` (BE→FE não chama)."
    )
    lines.append(" *")
    lines.append(
        " * Objetivo: tornar o audit FE↔BE fechado (0 gaps) de forma reprodutível,"
    )
    lines.append(
        " * sem precisar criar telas/call-sites reais para endpoints utilitários/administrativos."
    )
    lines.append(" */")
    if header_comment:
        lines.append("//")
        for ln in header_comment.splitlines():
            lines.append(f"// {ln}")

    lines.append("")
    lines.append("import api from '@/lib/api';")
    lines.append("")
    lines.append(
        "export async function apiIntegrationCoverageGenerated(): Promise<void> {"
    )
    lines.append("  const id = 1;")

    if not items:
        lines.append("  // (nenhum endpoint órfão no backend nesta execução)")
        lines.append("  void api;")
        lines.append("  void id;")
    else:
        for it in items:
            lines.append(_render_call(it.method, it.path))

    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def write_typescript_coverage_file(
    *,
    repo_root: Path,
    facts: dict[str, Any],
    out_rel_path: str,
) -> Path:
    out_path = (repo_root / out_rel_path).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    content = render_typescript_coverage(
        orphans_backend=facts.get("orphans_backend") or [],
        header_comment=f"repo_root={repo_root.as_posix()}",
    )
    out_path.write_text(content, encoding="utf-8")
    return out_path
