from __future__ import annotations

import ast
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

_HTTP_METHODS_VIEWSET_LIST = ["GET", "POST"]
_HTTP_METHODS_VIEWSET_DETAIL = ["GET", "PUT", "PATCH", "DELETE"]


@dataclass(frozen=True)
class ActionRoute:
    detail: bool
    methods: Tuple[str, ...]
    url_path: str


@dataclass(frozen=True)
class Endpoint:
    method: str
    path: str
    source: str


def _posix(p: Path) -> str:
    return p.as_posix()


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _normalize_path(path: str) -> str:
    path = path.strip()
    if not path:
        return "/"

    # Django path() geralmente não começa com '/'
    if not path.startswith("/"):
        path = "/" + path

    # Troca parâmetros de path converters: <int:id> -> {id}
    path = re.sub(r"<[^:>]+:([^>]+)>", r"{\1}", path)
    path = re.sub(r"<([^>]+)>", r"{\1}", path)

    # Normaliza barras
    path = re.sub(r"//+", "/", path)

    # Mantém sem trailing slash, exceto raiz
    if path != "/" and path.endswith("/"):
        path = path[:-1]

    return path


def _safe_literal_str(node: ast.AST) -> Optional[str]:
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    return None


def _get_call_name(node: ast.AST) -> Optional[str]:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return None


def _resolve_module_to_file(repo_root: Path, module: str) -> Optional[Path]:
    """Resolve um módulo Python (dotted) para um arquivo dentro do backend.

    Suporta includes como:
    - config.urls -> apps/backend/config/urls.py
    - apps.consent.urls -> apps/backend/apps/consent/urls.py
    - apps.core.search_urls -> apps/backend/apps/core/search_urls.py
    """
    module = (module or "").strip()
    if not module:
        return None

    backend_root = repo_root / "apps" / "backend"
    backend_apps_root = backend_root / "apps"

    candidates: List[Path] = []

    def _add(mod: str, *, prefer_apps_root: bool = False) -> None:
        rel = Path(*mod.split(".")).with_suffix(".py")
        if prefer_apps_root:
            candidates.append(backend_apps_root / rel)
        candidates.append(backend_root / rel)
        candidates.append(backend_apps_root / rel)

    # tentativa direta
    _add(module)

    # convenção do projeto: imports começam com "apps." mas os arquivos estão em apps/backend/apps/
    if module.startswith("apps."):
        _add(module[len("apps.") :], prefer_apps_root=True)

    for c in candidates:
        if c.exists() and c.is_file():
            return c

    return None


def _extract_router_registrations(
    tree: ast.AST,
) -> Dict[str, List[Tuple[str, Optional[str], int]]]:
    """Retorna router_var -> [(prefix, viewset_symbol_name, lineno), ...]"""
    regs: Dict[str, List[Tuple[str, Optional[str], int]]] = {}

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if not isinstance(node.func, ast.Attribute):
            continue
        if node.func.attr != "register":
            continue

        router_var = None
        if isinstance(node.func.value, ast.Name):
            router_var = node.func.value.id
        if not router_var:
            continue

        if not node.args:
            continue

        prefix = _safe_literal_str(node.args[0])
        if not prefix:
            continue

        viewset_symbol: Optional[str] = None
        if len(node.args) >= 2 and isinstance(node.args[1], ast.Name):
            viewset_symbol = node.args[1].id

        regs.setdefault(router_var, []).append(
            (prefix, viewset_symbol, getattr(node, "lineno", 1))
        )

    return regs


def _decorator_is_action(dec: ast.AST) -> bool:
    if not isinstance(dec, ast.Call):
        return False
    name = _get_call_name(dec.func)
    return name == "action"


def _safe_literal_bool(node: ast.AST) -> Optional[bool]:
    if isinstance(node, ast.Constant) and isinstance(node.value, bool):
        return node.value
    return None


def _safe_literal_list_str(node: ast.AST) -> Optional[List[str]]:
    if isinstance(node, (ast.List, ast.Tuple)):
        out: List[str] = []
        for elt in node.elts:
            s = _safe_literal_str(elt)
            if not s:
                return None
            out.append(s)
        return out
    return None


def _resolve_importfrom_to_file(
    *, repo_root: Path, current_file: Path, module: Optional[str], level: int
) -> Optional[Path]:
    if module is None:
        return None
    if level and level > 0:
        base = current_file.parent
        for _ in range(level - 1):
            base = base.parent
        rel = Path(*module.split(".")).with_suffix(".py")
        cand = (base / rel).resolve()
        if cand.exists() and cand.is_file():
            return cand
        return None

    return _resolve_module_to_file(repo_root, module)


def _build_viewset_symbol_table(
    *, repo_root: Path, file_path: Path, tree: ast.AST
) -> Dict[str, Tuple[Path, str]]:
    """Mapeia símbolos usados em router.register para (arquivo_da_classe, nome_da_classe)."""
    module_alias_to_file: Dict[str, Path] = {}
    symbol_to_class: Dict[str, Tuple[Path, str]] = {}

    # 1) ImportFrom: resolve módulos e símbolos
    for node in tree.body:
        if not isinstance(node, ast.ImportFrom):
            continue

        resolved_module_file = _resolve_importfrom_to_file(
            repo_root=repo_root,
            current_file=file_path,
            module=node.module,
            level=getattr(node, "level", 0) or 0,
        )

        for alias in node.names:
            local_name = alias.asname or alias.name

            # ex: from apps.feedbacks import views as feedback_views
            if alias.name == "views" and node.module:
                views_mod = f"{node.module}.views"
                views_file = _resolve_importfrom_to_file(
                    repo_root=repo_root,
                    current_file=file_path,
                    module=views_mod,
                    level=getattr(node, "level", 0) or 0,
                )
                if views_file:
                    module_alias_to_file[local_name] = views_file
                continue

            # ex: from .views import WebhookEndpointViewSet
            if (
                resolved_module_file is not None
                and alias.name
                and alias.name[0].isupper()
            ):
                symbol_to_class[local_name] = (resolved_module_file, alias.name)

    # 2) Assign: resolve alias = module_alias.ClassName
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue

        if not node.targets or not isinstance(node.targets[0], ast.Name):
            continue
        target = node.targets[0].id

        # FeedbackViewSet = feedback_views.FeedbackViewSet
        if (
            isinstance(node.value, ast.Attribute)
            and isinstance(node.value.value, ast.Name)
            and node.value.value.id in module_alias_to_file
        ):
            symbol_to_class[target] = (
                module_alias_to_file[node.value.value.id],
                node.value.attr,
            )

    return symbol_to_class


def _find_class_def(tree: ast.AST, class_name: str) -> Optional[ast.ClassDef]:
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name == class_name:
            return node
    return None


def _infer_viewset_kind(class_def: ast.ClassDef) -> Optional[str]:
    """Retorna 'model', 'readonly' ou None (desconhecido)."""
    base_names: List[str] = []
    for b in class_def.bases:
        if isinstance(b, ast.Name):
            base_names.append(b.id)
        elif isinstance(b, ast.Attribute):
            base_names.append(b.attr)
    if any(n.endswith("ReadOnlyModelViewSet") for n in base_names):
        return "readonly"
    if any(n.endswith("ModelViewSet") for n in base_names):
        return "model"
    return None


_VIEWSET_PARSE_CACHE: Dict[
    Tuple[str, str], Tuple[Optional[str], Tuple[ActionRoute, ...]]
] = {}


def _get_viewset_routes(
    viewset_file: Path, class_name: str
) -> Tuple[Optional[str], Tuple[ActionRoute, ...]]:
    cache_key = (_posix(viewset_file.resolve()), class_name)
    if cache_key in _VIEWSET_PARSE_CACHE:
        return _VIEWSET_PARSE_CACHE[cache_key]

    text = _read_text(viewset_file)
    try:
        tree = ast.parse(text)
    except SyntaxError:
        _VIEWSET_PARSE_CACHE[cache_key] = (None, tuple())
        return _VIEWSET_PARSE_CACHE[cache_key]

    class_def = _find_class_def(tree, class_name)
    if class_def is None:
        _VIEWSET_PARSE_CACHE[cache_key] = (None, tuple())
        return _VIEWSET_PARSE_CACHE[cache_key]

    kind = _infer_viewset_kind(class_def)

    actions: List[ActionRoute] = []
    for item in class_def.body:
        if not isinstance(item, ast.FunctionDef):
            continue
        for dec in item.decorator_list or []:
            if not _decorator_is_action(dec):
                continue

            detail = None
            methods: Optional[List[str]] = None
            url_path: Optional[str] = None
            for kw in dec.keywords or []:
                if kw.arg == "detail":
                    detail = _safe_literal_bool(kw.value)
                elif kw.arg == "methods":
                    methods = _safe_literal_list_str(kw.value)
                elif kw.arg == "url_path":
                    url_path = _safe_literal_str(kw.value)

            if detail is None:
                # DRF exige 'detail', mas não inferimos se não for literal
                continue

            if not methods:
                # Se methods não for literal, cai para UNKNOWN (não gera endpoint)
                continue

            url_path_final = url_path or item.name
            actions.append(
                ActionRoute(
                    detail=detail,
                    methods=tuple(m.upper() for m in methods if isinstance(m, str)),
                    url_path=url_path_final,
                )
            )

    _VIEWSET_PARSE_CACHE[cache_key] = (kind, tuple(actions))
    return _VIEWSET_PARSE_CACHE[cache_key]


def _iter_url_files(repo_root: Path) -> List[Path]:
    backend_root = repo_root / "apps" / "backend"
    url_files = list(backend_root.glob("apps/**/urls.py"))

    config_urls = backend_root / "config" / "urls.py"
    if config_urls.exists():
        url_files.append(config_urls)

    # Dedup
    uniq: Dict[str, Path] = {_posix(p.resolve()): p for p in url_files}
    return sorted(uniq.values(), key=lambda p: _posix(p))


def _is_include_call(node: ast.AST) -> bool:
    return isinstance(node, ast.Call) and _get_call_name(node.func) == "include"


def _parse_urlpatterns_from_tree(
    *,
    repo_root: Path,
    file_path: Path,
    prefix: str,
    visited: Set[str],
) -> List[Endpoint]:
    text = _read_text(file_path)
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return []

    router_regs = _extract_router_registrations(tree)
    viewset_symbols = _build_viewset_symbol_table(
        repo_root=repo_root, file_path=file_path, tree=tree
    )

    endpoints: List[Endpoint] = []

    # Localiza a atribuição urlpatterns = [...]
    urlpatterns_node: Optional[ast.AST] = None
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "urlpatterns":
                    urlpatterns_node = node.value
                    break

    # Se não achou, tenta procurar por append/extend em urlpatterns (heurístico)
    items: List[ast.AST] = []
    if isinstance(urlpatterns_node, (ast.List, ast.Tuple)):
        items.extend(list(urlpatterns_node.elts))

    # Coleta chamadas: path(...), re_path(...)
    for item in items:
        if not isinstance(item, ast.Call):
            continue
        call_name = _get_call_name(item.func)
        if call_name not in {"path", "re_path", "url"}:
            continue

        if not item.args:
            continue

        raw_path = _safe_literal_str(item.args[0])
        if raw_path is None:
            continue

        # prefix + raw_path
        full_path = _normalize_path(prefix + "/" + raw_path)
        source = f"{_posix(file_path)}:{getattr(item, 'lineno', 1)}"

        # include()
        if len(item.args) >= 2 and _is_include_call(item.args[1]):
            include_call: ast.Call = item.args[1]  # type: ignore[assignment]
            include_arg = include_call.args[0] if include_call.args else None

            # include("module.urls")
            module = _safe_literal_str(include_arg) if include_arg is not None else None
            if module:
                included_file = _resolve_module_to_file(repo_root, module)
                if included_file is not None:
                    key = _posix(included_file.resolve())
                    if key not in visited:
                        visited.add(key)
                        endpoints.extend(
                            _parse_urlpatterns_from_tree(
                                repo_root=repo_root,
                                file_path=included_file,
                                prefix=full_path,
                                visited=visited,
                            )
                        )
                    continue

            # include(router.urls)
            if (
                isinstance(include_arg, ast.Attribute)
                and include_arg.attr == "urls"
                and isinstance(include_arg.value, ast.Name)
            ):
                router_name = include_arg.value.id
                for reg_prefix, viewset_symbol, reg_line in router_regs.get(
                    router_name, []
                ):
                    base = _normalize_path(full_path + "/" + reg_prefix)

                    viewset_ref = (
                        viewset_symbols.get(viewset_symbol or "")
                        if viewset_symbol
                        else None
                    )

                    # ViewSet routes (mais conservador): só gera CRUD padrão quando inferível
                    if viewset_ref is not None:
                        vs_file, vs_class = viewset_ref
                        kind, actions = _get_viewset_routes(vs_file, vs_class)

                        if kind == "model":
                            list_methods = ("GET", "POST")
                            detail_methods = ("GET", "PUT", "PATCH", "DELETE")
                        elif kind == "readonly":
                            list_methods = ("GET",)
                            detail_methods = ("GET",)
                        else:
                            list_methods = tuple()
                            detail_methods = tuple()

                        for m in list_methods:
                            endpoints.append(
                                Endpoint(
                                    method=m,
                                    path=base,
                                    source=f"{_posix(file_path)}:{reg_line}",
                                )
                            )
                        for m in detail_methods:
                            endpoints.append(
                                Endpoint(
                                    method=m,
                                    path=_normalize_path(base + "/{id}"),
                                    source=f"{_posix(file_path)}:{reg_line}",
                                )
                            )

                        # Actions (@action)
                        for a in actions:
                            if not a.url_path:
                                continue
                            if a.detail:
                                action_path = _normalize_path(
                                    base + "/{id}/" + a.url_path
                                )
                            else:
                                action_path = _normalize_path(base + "/" + a.url_path)
                            for m in a.methods:
                                if not m:
                                    continue
                                endpoints.append(
                                    Endpoint(
                                        method=m,
                                        path=action_path,
                                        source=f"{_posix(vs_file)}:{reg_line}",
                                    )
                                )
                    else:
                        # fallback heurístico (sem resolução de classe)
                        for m in _HTTP_METHODS_VIEWSET_LIST:
                            endpoints.append(
                                Endpoint(
                                    method=m,
                                    path=base,
                                    source=f"{_posix(file_path)}:{reg_line}",
                                )
                            )
                        for m in _HTTP_METHODS_VIEWSET_DETAIL:
                            endpoints.append(
                                Endpoint(
                                    method=m,
                                    path=_normalize_path(base + "/{id}"),
                                    source=f"{_posix(file_path)}:{reg_line}",
                                )
                            )
                continue

            # fallback: include dinâmico (não resolvido)
            endpoints.append(Endpoint(method="UNKNOWN", path=full_path, source=source))
            continue

        # view direto: sem include
        # método é difícil de inferir sem DRF; tenta heurística simples
        view_expr = item.args[1] if len(item.args) >= 2 else None

        method = "UNKNOWN"
        if isinstance(view_expr, ast.Attribute) and view_expr.attr == "as_view":
            # class-based view: qualquer método
            method = "UNKNOWN"
        elif (
            isinstance(view_expr, ast.Call)
            and isinstance(view_expr.func, ast.Attribute)
            and view_expr.func.attr == "as_view"
        ):
            method = "UNKNOWN"

        endpoints.append(Endpoint(method=method, path=full_path, source=source))

    return endpoints


def extract_backend_endpoints(repo_root: Path) -> Dict[str, Any]:
    """Extrai endpoints do backend a partir do root urlconf (config/urls.py).

    Importante: NÃO varrer todos os apps/**/urls.py como roots independentes.
    Isso gera falsos positivos (rotas sem o prefixo correto) e impede a
    resolução de include(prefix) por causa do dedupe/visited.
    """

    visited: Set[str] = set()
    all_eps: List[Endpoint] = []

    config_urls = (repo_root / "apps" / "backend" / "config" / "urls.py").resolve()
    if config_urls.exists() and config_urls.is_file():
        visited.add(_posix(config_urls))
        all_eps.extend(
            _parse_urlpatterns_from_tree(
                repo_root=repo_root,
                file_path=config_urls,
                prefix="",
                visited=visited,
            )
        )
    else:
        # Fallback (repo incompleto): mantém comportamento antigo
        for url_file in _iter_url_files(repo_root):
            key = _posix(url_file.resolve())
            if key in visited:
                continue
            visited.add(key)
            all_eps.extend(
                _parse_urlpatterns_from_tree(
                    repo_root=repo_root,
                    file_path=url_file,
                    prefix="",
                    visited=visited,
                )
            )

    # Dedup (method+path+source)
    uniq: Dict[Tuple[str, str, str], Endpoint] = {}
    for ep in all_eps:
        k = (ep.method.upper(), ep.path, ep.source)
        uniq[k] = Endpoint(method=ep.method.upper(), path=ep.path, source=ep.source)

    backend_endpoints = [
        {"method": e.method, "path": e.path, "source": e.source}
        for e in sorted(uniq.values(), key=lambda x: (x.path, x.method, x.source))
    ]

    return {"backend_endpoints": backend_endpoints}


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Extrai endpoints do backend (Django/DRF) do monorepo."
    )
    parser.add_argument(
        "--repo-root", default=str(Path.cwd()), help="Root do repo (default: cwd)"
    )
    parser.add_argument("--out", required=True, help="Arquivo JSON de saída")

    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()
    out_path = Path(args.out).resolve()

    data = extract_backend_endpoints(repo_root)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
