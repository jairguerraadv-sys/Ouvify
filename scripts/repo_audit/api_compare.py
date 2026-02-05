from __future__ import annotations

import difflib
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


def _load_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


_METHOD_KNOWN = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}


def _normalize_method(method: str) -> str:
    m = (method or "").upper().strip()
    if not m or m == "ANY":
        return "UNKNOWN"
    if m in _METHOD_KNOWN:
        return m
    return "UNKNOWN"


def _canonicalize_path(path: str) -> str:
    p = (path or "").strip()
    if not p:
        return "/"

    if not p.startswith("/"):
        idx = p.find("/")
        p = p[idx:] if idx >= 0 else "/" + p

    p = re.sub(r"//+", "/", p)

    # trailing slash: /x ≈ /x/
    if p != "/" and p.endswith("/"):
        p = p[:-1]

    # placeholder: {id} ≈ {pk} ≈ {param}
    p = re.sub(r"\{[^}]+\}", "{param}", p)
    p = re.sub(r"<[^>]+>", "{param}", p)

    return p


def _apply_prefix_rewrite(path: str, from_prefix: str, to_prefix: str) -> Optional[str]:
    fp = from_prefix.rstrip("/")
    tp = to_prefix.rstrip("/")
    if not fp.startswith("/"):
        fp = "/" + fp
    if tp and not tp.startswith("/"):
        tp = "/" + tp

    if path == fp:
        return tp or "/"
    if path.startswith(fp + "/"):
        rest = path[len(fp) :]
        if not tp:
            return rest or "/"
        return _canonicalize_path(tp + rest)
    return None


def _path_variants(path: str, prefix_equivalences: List[Tuple[str, str]]) -> List[str]:
    base = _canonicalize_path(path)
    variants = {base}
    for from_p, to_p in prefix_equivalences:
        v = _apply_prefix_rewrite(base, from_p, to_p)
        if v:
            variants.add(_canonicalize_path(v))
        # também tenta inverso (equivalência)
        v2 = _apply_prefix_rewrite(base, to_p, from_p)
        if v2:
            variants.add(_canonicalize_path(v2))
    return sorted(variants)


def _key(method: str, path: str) -> Tuple[str, str]:
    return (_normalize_method(method), _canonicalize_path(path))


def _best_path_suggestions(
    target: str, candidates: List[str], limit: int = 5
) -> List[str]:
    scored: List[Tuple[float, str]] = []
    for c in candidates:
        ratio = difflib.SequenceMatcher(a=target, b=c).ratio()
        scored.append((ratio, c))
    scored.sort(reverse=True, key=lambda x: x[0])
    return [c for r, c in scored[:limit] if r >= 0.55]


def compare_api_maps(
    *,
    backend_json: Dict[str, Any],
    frontend_json: Dict[str, Any],
    prefix_equivalences: Optional[List[Tuple[str, str]]] = None,
) -> Dict[str, Any]:
    prefix_equivalences = prefix_equivalences or []
    backend = backend_json.get("backend_endpoints", [])
    frontend = frontend_json.get("frontend_calls", [])

    # Indexa por path (com variantes) e por (method,path)
    be_by_path: Dict[str, List[Dict[str, Any]]] = {}
    be_by_key: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
    be_paths: List[str] = []

    for e in backend:
        method = _normalize_method(e.get("method", "UNKNOWN"))
        for p in _path_variants(e.get("path", ""), prefix_equivalences):
            be_by_path.setdefault(p, []).append(e)
            be_by_key.setdefault((method, p), []).append(e)
            be_paths.append(p)

    fe_by_path: Dict[str, List[Dict[str, Any]]] = {}
    fe_by_key: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
    fe_paths: List[str] = []

    for c in frontend:
        method = _normalize_method(c.get("method", "UNKNOWN"))
        for p in _path_variants(c.get("path", ""), prefix_equivalences):
            fe_by_path.setdefault(p, []).append(c)
            fe_by_key.setdefault((method, p), []).append(c)
            fe_paths.append(p)

    be_paths = sorted(set(be_paths))
    fe_paths = sorted(set(fe_paths))

    matched: List[Dict[str, Any]] = []
    matched_unknown_method: List[Dict[str, Any]] = []
    orphans_frontend: List[Dict[str, Any]] = []
    orphans_backend: List[Dict[str, Any]] = []
    mismatched_method: List[Dict[str, Any]] = []
    mismatched_path_suggestions: List[Dict[str, Any]] = []
    base_url_smells: List[Dict[str, Any]] = []

    # ----------------------------
    # FE -> BE (prioridade: orphans_frontend)
    # ----------------------------
    for (fe_method, fe_path), fe_items in fe_by_key.items():
        # base url smells
        for item in fe_items:
            abs_url = item.get("absolute_url")
            if abs_url:
                base_url_smells.append(
                    {
                        "source": item.get("source"),
                        "absolute_url": abs_url,
                        "raw": item.get("raw"),
                    }
                )

        if fe_method != "UNKNOWN" and (fe_method, fe_path) in be_by_key:
            matched.append(
                {
                    "method": fe_method,
                    "path": fe_path,
                    "frontend": fe_items,
                    "backend": be_by_key[(fe_method, fe_path)],
                }
            )
            continue

        # Se BE tem path mas método UNKNOWN, considera "matched" (sem mismatch automático)
        if fe_method != "UNKNOWN" and ("UNKNOWN", fe_path) in be_by_key:
            matched_unknown_method.append(
                {
                    "path": fe_path,
                    "frontend_method": fe_method,
                    "backend_methods": ["UNKNOWN"],
                    "reason": "backend_method_unknown",
                    "frontend": fe_items,
                    "backend": be_by_key[("UNKNOWN", fe_path)],
                }
            )
            continue

        # Se FE não conseguiu inferir o método, tenta casar por path (qualquer método)
        if fe_method == "UNKNOWN" and fe_path in be_by_path:
            backend_methods = sorted(
                {
                    _normalize_method(it.get("method", "UNKNOWN"))
                    for it in be_by_path.get(fe_path, [])
                }
            )
            matched_unknown_method.append(
                {
                    "path": fe_path,
                    "frontend_method": "UNKNOWN",
                    "backend_methods": backend_methods,
                    "reason": "frontend_method_unknown",
                    "frontend": fe_items,
                    "backend": be_by_path.get(fe_path, []),
                }
            )
            continue

        # mismatch de método: mesmo path, métodos conhecidos diferentes
        if fe_method != "UNKNOWN" and fe_path in be_by_path:
            backend_methods = sorted(
                {
                    _normalize_method(it.get("method", "UNKNOWN"))
                    for it in be_by_path.get(fe_path, [])
                    if _normalize_method(it.get("method", "UNKNOWN")) != "UNKNOWN"
                }
            )
            if backend_methods:
                mismatched_method.append(
                    {
                        "path": fe_path,
                        "frontend_method": fe_method,
                        "backend_methods": backend_methods,
                        "frontend": fe_items,
                    }
                )
                continue

        # orphan_frontend
        orphans_frontend.append(
            {"method": fe_method, "path": fe_path, "frontend": fe_items}
        )
        suggestions = _best_path_suggestions(fe_path, be_paths)
        if suggestions:
            mismatched_path_suggestions.append(
                {
                    "kind": "frontend_orphan",
                    "method": fe_method,
                    "path": fe_path,
                    "suggestions": suggestions,
                }
            )

    # ----------------------------
    # BE -> FE (orphans_backend, ignorando UNKNOWN para reduzir falsos positivos)
    # ----------------------------
    for (be_method, be_path), be_items in be_by_key.items():
        if be_method == "UNKNOWN":
            continue

        if (be_method, be_path) in fe_by_key:
            continue

        # Se FE tem o path mas método UNKNOWN, não conta como órfão (incerto)
        if ("UNKNOWN", be_path) in fe_by_key:
            continue

        # Se FE tem o path com outro método conhecido, já é coberto em mismatched_method (no lado FE)
        if be_path in fe_by_path:
            fe_methods_same_path = sorted(
                {
                    _normalize_method(it.get("method", "UNKNOWN"))
                    for it in fe_by_path.get(be_path, [])
                    if _normalize_method(it.get("method", "UNKNOWN")) != "UNKNOWN"
                }
            )
            if fe_methods_same_path:
                continue

        orphans_backend.append(
            {"method": be_method, "path": be_path, "backend": be_items}
        )
        suggestions = _best_path_suggestions(be_path, fe_paths)
        if suggestions:
            mismatched_path_suggestions.append(
                {
                    "kind": "backend_orphan",
                    "method": be_method,
                    "path": be_path,
                    "suggestions": suggestions,
                }
            )

    return {
        "matched": matched,
        "matched_unknown_method": matched_unknown_method,
        "orphans_frontend": orphans_frontend,
        "orphans_backend": orphans_backend,
        "mismatched_method": mismatched_method,
        "mismatched_path_suggestions": mismatched_path_suggestions,
        "base_url_smells": base_url_smells,
        "stats": {
            "backend_endpoints": len(backend),
            "frontend_calls": len(frontend),
            "matched": len(matched),
            "matched_unknown_method": len(matched_unknown_method),
            "orphans_frontend": len(orphans_frontend),
            "orphans_backend": len(orphans_backend),
            "mismatched_method": len(mismatched_method),
            "base_url_smells": len(base_url_smells),
        },
    }


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Compara mapa de API do FE vs BE.")
    parser.add_argument("--backend", required=True, help="backend_endpoints.json")
    parser.add_argument("--frontend", required=True, help="frontend_calls.json")
    parser.add_argument("--out", required=True, help="Arquivo JSON final")

    args = parser.parse_args()

    backend_json = _load_json(Path(args.backend))
    frontend_json = _load_json(Path(args.frontend))

    facts = compare_api_maps(backend_json=backend_json, frontend_json=frontend_json)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(facts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
