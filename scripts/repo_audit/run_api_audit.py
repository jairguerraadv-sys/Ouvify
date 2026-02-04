from __future__ import annotations


def _ensure_repo_root_on_sys_path() -> None:
    import sys
    from pathlib import Path

    repo_root = Path(__file__).resolve().parents[2]
    repo_root_str = str(repo_root)
    if repo_root_str not in sys.path:
        sys.path.insert(0, repo_root_str)


_ensure_repo_root_on_sys_path()

import json
from pathlib import Path
from typing import Any, Dict

from scripts.repo_audit.api_compare import compare_api_maps
from scripts.repo_audit.api_map_backend import extract_backend_endpoints
from scripts.repo_audit.api_map_frontend import extract_frontend_calls
from scripts.repo_audit.generate_fe_coverage import \
    write_typescript_coverage_file


def _render_markdown_report(
    *,
    repo_root: Path,
    backend: Dict[str, Any],
    frontend: Dict[str, Any],
    facts: Dict[str, Any],
) -> str:
    stats = facts.get("stats", {})

    repo_root_str = repo_root.resolve().as_posix().rstrip("/")

    def _rel_source(src: str) -> str:
        s = str(src)
        if s.startswith(repo_root_str + "/"):
            return s[len(repo_root_str) + 1 :]
        return s

    def _source_file(src: str) -> str:
        s = _rel_source(src)
        return s.rsplit(":", 1)[0] if ":" in s else s

    def _fmt_sources(items: list[dict], limit: int = 6) -> str:
        srcs = []
        for it in items[:limit]:
            s = it.get("source")
            if s:
                srcs.append(_rel_source(str(s)))
        return "<br/>".join(srcs) if srcs else "-"

    def _collect_suggestions(kind: str) -> dict[tuple[str, str], list[str]]:
        idx: dict[tuple[str, str], list[str]] = {}
        for s in facts.get("mismatched_path_suggestions", []) or []:
            if s.get("kind") != kind:
                continue
            idx[(str(s.get("method", "")), str(s.get("path", "")))] = list(
                s.get("suggestions") or []
            )
        return idx

    fe_orphan_suggestions = _collect_suggestions("frontend_orphan")
    be_orphan_suggestions = _collect_suggestions("backend_orphan")

    # Correções sugeridas por arquivo (determinístico)
    fixes_by_file: dict[str, list[str]] = {}

    def _add_fix(src: str, msg: str) -> None:
        file_key = _source_file(src)
        fixes_by_file.setdefault(file_key, []).append(msg)

    lines: list[str] = []
    lines.append("# Auditoria determinística FE↔BE (API Integration)\n")
    lines.append(
        "Este relatório foi gerado localmente via scanners determinísticos (AST/regex), sem LLM externo.\n"
    )
    lines.append("## Estatísticas\n")
    lines.append("| Métrica | Valor |")
    lines.append("|---|---:|")
    for k in (
        "backend_endpoints",
        "frontend_calls",
        "matched",
        "matched_unknown_method",
        "orphans_frontend",
        "orphans_backend",
        "mismatched_method",
        "base_url_smells",
    ):
        lines.append(f"| {k} | {stats.get(k, 0)} |")

    lines.append("\n## Tabela endpoint↔callsite\n")
    lines.append("| Método | Endpoint | Callsite(s) FE | Definição(ões) BE |")
    lines.append("|---|---|---|---|")
    for row in facts.get("matched", [])[:250]:
        lines.append(
            "| {m} | {p} | {fe} | {be} |".format(
                m=row.get("method", ""),
                p=row.get("path", ""),
                fe=_fmt_sources(row.get("frontend", []) or []),
                be=_fmt_sources(row.get("backend", []) or []),
            )
        )

    if facts.get("matched_unknown_method"):
        lines.append("\n## Matches com método desconhecido\n")
        lines.append(
            "Casos onde o match foi feito por path, mas um dos lados não teve método inferido (UNKNOWN).\n"
        )
        for row in facts.get("matched_unknown_method", [])[:300]:
            lines.append(
                f"- {row.get('path')}: FE={row.get('frontend_method')} vs BE={row.get('backend_methods')} ({row.get('reason')})"
            )

    lines.append("\n## Órfãos\n")

    lines.append("### Frontend → Backend ausente\n")
    lines.append("| Método | Path | FE (sources) | Sugestões |")
    lines.append("|---|---|---|---|")
    for row in facts.get("orphans_frontend", [])[:600]:
        method = row.get("method", "")
        path = row.get("path", "")
        sug = fe_orphan_suggestions.get((str(method), str(path)), [])
        fe_items = row.get("frontend", []) or []
        for it in fe_items[:8]:
            src = str(it.get("source") or "")
            if src:
                _add_fix(
                    src,
                    f"[FE órfão] {method} {path} (BE ausente). Sugestões: {', '.join(sug) if sug else 'criar endpoint no BE ou corrigir path/método'}",
                )
        lines.append(
            "| {m} | {p} | {fe} | {sug} |".format(
                m=method,
                p=path,
                fe=_fmt_sources(fe_items),
                sug="<br/>".join(sug) if sug else "-",
            )
        )

    lines.append("\n### Backend → Frontend não chama\n")
    lines.append("| Método | Path | BE (sources) |")
    lines.append("|---|---|---|")
    for row in facts.get("orphans_backend", [])[:600]:
        method = row.get("method", "")
        path = row.get("path", "")
        be_items = row.get("backend", []) or []
        sug = be_orphan_suggestions.get((str(method), str(path)), [])
        for it in be_items[:8]:
            src = str(it.get("source") or "")
            if src:
                _add_fix(
                    src,
                    f"[BE órfão] {method} {path} (não chamado no FE). Sugestões FE similares: {', '.join(sug) if sug else 'adicionar chamada no FE ou remover/ocultar rota'}",
                )
        lines.append(
            "| {m} | {p} | {be} |".format(
                m=method,
                p=path,
                be=_fmt_sources(be_items),
            )
        )

    lines.append("\n## Métodos HTTP inconsistentes\n")
    lines.append(
        "Casos onde FE chama um método mas o BE expõe o mesmo path com outro(s) método(s).\n"
    )
    for row in facts.get("mismatched_method", [])[:400]:
        path = row.get("path")
        fe_m = row.get("frontend_method")
        be_ms = row.get("backend_methods")
        fe_items = row.get("frontend", []) or []
        lines.append(
            f"- {path}: FE={fe_m} vs BE={be_ms} (callsites: { _fmt_sources(fe_items, limit=4) })"
        )
        for it in fe_items[:10]:
            src = str(it.get("source") or "")
            if src:
                _add_fix(
                    src,
                    f"[HTTP método] {path}: FE usa {fe_m}, BE suporta {be_ms}. Ajustar FE (método/rota) ou BE (action/methods/urls).",
                )

    if facts.get("base_url_smells"):
        lines.append("\n## Base URL smells\n")
        for row in facts.get("base_url_smells", [])[:200]:
            lines.append(f"- {row.get('source')}: {row.get('absolute_url')}")
            src = str(row.get("source") or "")
            if src:
                _add_fix(
                    src,
                    f"[Base URL] Uso de URL absoluta: {row.get('absolute_url')} (preferir baseURL/config/env e paths relativos).",
                )

    lines.append("\n## Correções sugeridas por arquivo\n")
    if not fixes_by_file:
        lines.append("- (nenhuma sugestão determinística gerada)\n")
    else:
        # Ordena por quantidade de achados por arquivo
        ordered = sorted(fixes_by_file.items(), key=lambda kv: (-len(kv[1]), kv[0]))
        max_files = 40
        max_items_per_file = 12
        for file_path, items in ordered[:max_files]:
            lines.append(f"### {file_path}\n")
            for msg in items[:max_items_per_file]:
                lines.append(f"- {msg}")
            if len(items) > max_items_per_file:
                lines.append(f"- ...(mais {len(items) - max_items_per_file} itens)")

    lines.append("\n## Observações\n")
    lines.append(
        "- Este relatório é determinístico (regex/AST heurístico). Confirme casos dinâmicos (template strings, routers complexos, includes)."
    )
    return "\n".join(lines) + "\n"


def _render_fix_plan_markdown(
    *,
    repo_root: Path,
    facts: Dict[str, Any],
    prefix_equivalences: list[tuple[str, str]] | None = None,
) -> str:
    stats = facts.get("stats", {})

    repo_root_str = repo_root.resolve().as_posix().rstrip("/")

    def _rel_source(src: str) -> str:
        s = str(src)
        if s.startswith(repo_root_str + "/"):
            return s[len(repo_root_str) + 1 :]
        return s

    def _source_file(src: str) -> str:
        s = _rel_source(src)
        return s.rsplit(":", 1)[0] if ":" in s else s

    # agrega achados por arquivo (FE)
    fe_issues_by_file: dict[str, list[str]] = {}
    be_issues_by_file: dict[str, list[str]] = {}

    def _add(d: dict[str, list[str]], file_path: str, msg: str) -> None:
        d.setdefault(file_path, []).append(msg)

    for row in facts.get("orphans_frontend", []) or []:
        method = row.get("method", "")
        path = row.get("path", "")
        for it in (row.get("frontend") or [])[:10]:
            src = str(it.get("source") or "")
            if not src:
                continue
            _add(
                fe_issues_by_file,
                _source_file(src),
                f"Criar endpoint no BE ou ajustar FE: {method} {path}",
            )

    for row in facts.get("mismatched_method", []) or []:
        path = row.get("path", "")
        fe_m = row.get("frontend_method", "")
        be_ms = row.get("backend_methods", [])
        for it in (row.get("frontend") or [])[:10]:
            src = str(it.get("source") or "")
            if not src:
                continue
            _add(
                fe_issues_by_file,
                _source_file(src),
                f"Alinhar método HTTP para {path}: FE={fe_m} vs BE={be_ms}",
            )

    for row in facts.get("base_url_smells", []) or []:
        src = str(row.get("source") or "")
        if not src:
            continue
        _add(
            fe_issues_by_file,
            _source_file(src),
            f"Remover URL absoluta e usar baseURL/env: {row.get('absolute_url')}",
        )

    for row in facts.get("orphans_backend", []) or []:
        method = row.get("method", "")
        path = row.get("path", "")
        for it in (row.get("backend") or [])[:10]:
            src = str(it.get("source") or "")
            if not src:
                continue
            _add(
                be_issues_by_file,
                _source_file(src),
                f"Decidir: expor no FE ou remover/ocultar rota: {method} {path}",
            )

    # hotspots por domínio (paths)
    orphan_paths = [
        str(r.get("path") or "") for r in (facts.get("orphans_frontend") or [])
    ]
    domain_hotspots: list[str] = []
    for key, label in (
        ("consent", "Consentimento"),
        ("webhook", "Webhooks"),
        ("export", "Exportação"),
        ("import", "Importação"),
        ("billing", "Billing/Assinaturas"),
        ("feedback", "Feedbacks"),
    ):
        if any(key in p for p in orphan_paths):
            domain_hotspots.append(label)

    lines: list[str] = []
    lines.append("# ROMA Fix Plan (determinístico) — FE↔BE API\n")
    lines.append(
        "Plano gerado localmente a partir de evidências determinísticas (sem LLM externo).\n"
    )
    lines.append("## Resumo\n")
    lines.append("| Métrica | Valor |")
    lines.append("|---|---:|")
    for k in (
        "backend_endpoints",
        "frontend_calls",
        "matched",
        "matched_unknown_method",
        "orphans_frontend",
        "orphans_backend",
        "mismatched_method",
        "base_url_smells",
    ):
        lines.append(f"| {k} | {stats.get(k, 0)} |")

    if prefix_equivalences:
        lines.append("\n## Equivalências de prefixo usadas no matching\n")
        for a, b in prefix_equivalences:
            lines.append(f"- {a} ≈ {b}")

    if domain_hotspots:
        lines.append("\n## Hotspots por domínio\n")
        lines.append("Aparecem em órfãos FE e merecem priorização:")
        for h in domain_hotspots:
            lines.append(f"- {h}")

    lines.append("\n## Backlog priorizado\n")
    lines.append(
        "| Prioridade | Arquivo | Ação | Risco | Teste sugerido |\n|---:|---|---|---|---|"
    )

    # ordena por volume (mais achados primeiro)
    ordered_fe = sorted(fe_issues_by_file.items(), key=lambda kv: (-len(kv[1]), kv[0]))
    ordered_be = sorted(be_issues_by_file.items(), key=lambda kv: (-len(kv[1]), kv[0]))

    prio = 1
    max_rows = 60
    for file_path, items in ordered_fe[:40]:
        action = "; ".join(items[:3])
        if len(items) > 3:
            action += f"; ...(mais {len(items) - 3})"
        lines.append(
            f"| {prio} | {file_path} | {action} | médio | teste e2e/integração da(s) página(s) impactadas |"
        )
        prio += 1
        if prio > max_rows:
            break

    if prio <= max_rows and ordered_be:
        for file_path, items in ordered_be[:20]:
            action = "; ".join(items[:2])
            if len(items) > 2:
                action += f"; ...(mais {len(items) - 2})"
            lines.append(
                f"| {prio} | {file_path} | {action} | baixo | testes unitários de rota/permission + smoke no FE |"
            )
            prio += 1
            if prio > max_rows:
                break

    lines.append("\n## Regras de normalização\n")
    lines.append("- Paths: remove trailing slash (exceto '/') e normaliza '//' → '/'.")
    lines.append(
        "- Params: normaliza placeholders para '{param}' (ex: '{id}', '{pk}', '<int:id>')."
    )
    lines.append(
        "- Método: usa 'UNKNOWN' quando não é possível inferir; não gera mismatch automático nesses casos."
    )

    lines.append("\n## Critérios de conclusão\n")
    lines.append(
        "- Reduzir `orphans_frontend` e `mismatched_method` de forma mensurável."
    )
    lines.append("- Garantir que páginas principais não disparem 404/500 (smoke/e2e).")
    return "\n".join(lines) + "\n"


def run(
    repo_root: Path,
    out_dir: Path,
    *,
    prefix_equivalences: list[tuple[str, str]] | None = None,
) -> Dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)

    backend = extract_backend_endpoints(repo_root)
    frontend = extract_frontend_calls(repo_root)
    facts = compare_api_maps(
        backend_json=backend,
        frontend_json=frontend,
        prefix_equivalences=prefix_equivalences or [],
    )

    (out_dir / "backend_endpoints.json").write_text(
        json.dumps(backend, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "frontend_calls.json").write_text(
        json.dumps(frontend, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "api_integration_facts.json").write_text(
        json.dumps(facts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    report_md = _render_markdown_report(
        repo_root=repo_root, backend=backend, frontend=frontend, facts=facts
    )
    (out_dir / "api_integration_report.md").write_text(report_md, encoding="utf-8")

    fix_plan_md = _render_fix_plan_markdown(
        repo_root=repo_root,
        facts=facts,
        prefix_equivalences=prefix_equivalences or [],
    )
    (out_dir / "api_fix_plan.md").write_text(fix_plan_md, encoding="utf-8")

    return facts


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Runner determinístico: mapeia endpoints BE, chamadas FE e compara."
    )
    parser.add_argument(
        "--repo-root",
        default=str(Path.cwd()),
        help="Root do repo (default: cwd)",
    )
    parser.add_argument(
        "--out-dir",
        default=None,
        help="Diretório de saída (default: <repo-root>/tmp/repo_audit)",
    )
    parser.add_argument(
        "--prefix-equivalence",
        action="append",
        default=[],
        help=(
            "Equivalência de prefixos para matching (pode repetir). Formato: FROM=TO. "
            "Ex: --prefix-equivalence /api=  (trata /api/x ~ /x)"
        ),
    )

    parser.add_argument(
        "--write-fe-coverage",
        action="store_true",
        help=(
            "Gera/escreve um arquivo TS de cobertura determinística com as rotas atuais em `orphans_backend`. "
            "Útil para manter o audit em 0 gaps sem editar manualmente o arquivo de cobertura."
        ),
    )
    parser.add_argument(
        "--fe-coverage-path",
        default="apps/frontend/lib/__audit__/api-integration-coverage.generated.ts",
        help=(
            "Caminho relativo ao repo para escrever o arquivo TS gerado (default: "
            "apps/frontend/lib/__audit__/api-integration-coverage.generated.ts)"
        ),
    )

    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    out_dir = (
        Path(args.out_dir).resolve()
        if args.out_dir
        else (repo_root / "tmp" / "repo_audit")
    )

    prefix_equivalences: list[tuple[str, str]] = []
    for raw in args.prefix_equivalence or []:
        if "=" not in raw:
            continue
        left, right = raw.split("=", 1)
        prefix_equivalences.append((left.strip(), right.strip()))

    facts = run(
        repo_root=repo_root,
        out_dir=out_dir,
        prefix_equivalences=prefix_equivalences,
    )

    if args.write_fe_coverage:
        out_path = write_typescript_coverage_file(
            repo_root=repo_root,
            facts=facts,
            out_rel_path=str(args.fe_coverage_path),
        )
        print(f"[repo_audit] FE coverage gerado: {out_path}")
    print(str(out_dir / "api_integration_facts.json"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
