from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlparse


@dataclass(frozen=True)
class FrontendCall:
    method: str
    path: str
    source: str
    raw: str
    absolute_url: Optional[str] = None


def _posix(p: Path) -> str:
    return p.as_posix()


def _normalize_path(url_or_path: str) -> Tuple[str, Optional[str]]:
    """Normaliza uma URL/path para comparação.

    - Remove domínio (quando URL absoluta)
    - Remove query/fragment
    - Converte template literals e params dinâmicos em {param}
    - Normaliza / e trailing slash

    Retorna: (path_normalizado, absolute_url_se_existir)
    """

    raw = url_or_path.strip()
    if not raw:
        return ("/", None)

    absolute_url: Optional[str] = None

    # Se for URL absoluta
    if raw.startswith("http://") or raw.startswith("https://"):
        absolute_url = raw
        parsed = urlparse(raw)
        raw = parsed.path or "/"

    # Remove query/fragment se presente em string literal
    raw = raw.split("?", 1)[0].split("#", 1)[0]

    # Em template strings, troca ${...} por {param}
    raw = re.sub(r"\$\{[^}]+\}", "{param}", raw)

    # Troca interpolação comum de ids ("/" + id)
    raw = re.sub(r"/\+\s*[a-zA-Z_$][\w$]*", "/{param}", raw)

    # Troca parâmetros tipo :id
    raw = re.sub(r"/:[^/]+", "/{param}", raw)

    # Garante começar com /
    if not raw.startswith("/"):
        # tenta achar um /api ou / no meio
        idx = raw.find("/")
        raw = raw[idx:] if idx >= 0 else "/" + raw

    raw = re.sub(r"//+", "/", raw)

    if raw != "/" and raw.endswith("/"):
        raw = raw[:-1]

    return (raw, absolute_url)


_CONST_ASSIGN_RE = re.compile(
    r"\b(?:const|let)\s+([a-zA-Z_$][\w$]*)\s*=\s*([`\"'])(.+?)\2",
    re.IGNORECASE | re.DOTALL,
)


def _extract_literal_constants(text: str) -> Dict[str, str]:
    """Extrai constantes simples do tipo `const X = '/api/foo'`.

    Usado para resolver template strings como `${BASE_URL}/...`.
    """

    out: Dict[str, str] = {}
    for m in _CONST_ASSIGN_RE.finditer(text):
        name = m.group(1)
        value = (m.group(3) or "").strip()
        if not name or not value:
            continue
        # Apenas valores "estáveis" (path relativo) para evitar confundir com URLs/navegação.
        if value.startswith("/"):
            out[name] = value
    return out


def _extract_string_assignment_spans(text: str) -> List[Tuple[str, str, int]]:
    """Extrai atribuições (nome, valor, offset) para lookup por proximidade."""

    out: List[Tuple[str, str, int]] = []
    for m in _CONST_ASSIGN_RE.finditer(text):
        name = m.group(1)
        value = m.group(3)
        if not name or not value:
            continue
        out.append((name, value, m.start()))
    return out


def _lookup_recent_assignment(
    var_name: str,
    *,
    call_offset: int,
    assignments: List[Tuple[str, str, int]],
    max_chars_back: int = 12000,
) -> Optional[str]:
    """Retorna a atribuição mais recente de `var_name` antes do callsite.

    Heurística evita colisões tipo `api.get(url)` (param) vs `const url = ...` mais abaixo.
    """

    best: Optional[Tuple[str, str, int]] = None
    for name, value, offset in assignments:
        if name != var_name:
            continue
        if offset >= call_offset:
            continue
        if call_offset - offset > max_chars_back:
            continue
        if best is None or offset > best[2]:
            best = (name, value, offset)
    return best[1] if best else None


def _resolve_known_template_vars(raw: str, assignments: Dict[str, str]) -> str:
    """Substitui `${VAR}` por valores conhecidos extraídos do mesmo arquivo."""

    def repl(m: re.Match[str]) -> str:
        var_name = m.group(1)
        if var_name in assignments:
            return assignments[var_name]
        return m.group(0)

    return re.sub(r"\$\{\s*([a-zA-Z_$][\w$]*)\s*\}", repl, raw)


def _iter_ts_files(repo_root: Path) -> List[Path]:
    fe_root = repo_root / "apps" / "frontend"
    files = list(fe_root.rglob("*.ts")) + list(fe_root.rglob("*.tsx"))

    # Filtra build outputs e diretórios pesados
    filtered: List[Path] = []
    for p in files:
        s = _posix(p)
        if any(
            part in s
            for part in (
                "/node_modules/",
                "/.next/",
                "/dist/",
                "/coverage/",
                "/playwright-report/",
                "/test-results/",
                "/.venv/",
            )
        ):
            continue
        filtered.append(p)

    return sorted(filtered, key=lambda p: _posix(p))


_FETCH_RE = re.compile(r"\bfetch\(\s*([`\"'])(.+?)\1", re.IGNORECASE | re.DOTALL)
_AXIOS_DOT_RE = re.compile(
    r"\b(axios|api|apiClient)\.(get|post|put|patch|delete)\s*(?:<[^()]*?>)?\s*\(\s*([`\"'])(.+?)\3",
    re.IGNORECASE | re.DOTALL,
)
_AXIOS_DOT_VAR_RE = re.compile(
    r"\b(axios|api|apiClient)\.(get|post|put|patch|delete)\s*(?:<[^()]*?>)?\s*\(\s*([a-zA-Z_$][\w$]*)\b",
    re.IGNORECASE | re.DOTALL,
)
_AXIOS_OBJ_START_RE = re.compile(r"\baxios\(\s*\{", re.IGNORECASE)
_API_REQUEST_OBJ_START_RE = re.compile(
    r"\bapiRequest\s*(?:<[^()]*?>)?\s*\(\s*\{",
    re.IGNORECASE | re.DOTALL,
)
_URL_PROP_RE = re.compile(r"\burl\s*:\s*([`\"'])(.+?)\1", re.IGNORECASE)
_METHOD_PROP_RE = re.compile(
    r"\bmethod\s*:\s*([`\"'])(GET|POST|PUT|PATCH|DELETE)\1", re.IGNORECASE
)
_SWR_RE = re.compile(
    r"\buseSWR\s*(?:<[^()]*?>)?\s*\(\s*([`\"'])(.+?)\1", re.IGNORECASE | re.DOTALL
)


def _detect_fetch_method_from_window(window: str) -> str:
    # fetch default GET; procura por method em um pequeno window após o match
    m = re.search(
        r"\bmethod\s*:\s*['\"](GET|POST|PUT|PATCH|DELETE)['\"]",
        window,
        re.IGNORECASE,
    )
    return m.group(1).upper() if m else "GET"


def _line_no(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def _detect_axios_object_call(
    lines: List[str], start_idx: int
) -> Optional[Tuple[str, str]]:
    """Tenta extrair method+url de axios({ method, url, ...})"""
    window = "\n".join(lines[start_idx : min(len(lines), start_idx + 10)])
    m_method = _METHOD_PROP_RE.search(window)
    m_url = _URL_PROP_RE.search(window)
    if not m_url:
        return None
    method = m_method.group(2).upper() if m_method else "GET"
    return (method, m_url.group(2))


def extract_frontend_calls(repo_root: Path) -> Dict[str, Any]:
    calls: List[FrontendCall] = []

    for file_path in _iter_ts_files(repo_root):
        text = file_path.read_text(encoding="utf-8", errors="replace")
        lines = text.splitlines()

        # Para resolver template strings com constantes (ex.: `${BASE_URL}`)
        constants = _extract_literal_constants(text)
        assignment_spans = _extract_string_assignment_spans(text)

        # fetch("/path", { method: ... }) — suporta multi-linha
        for m in _FETCH_RE.finditer(text):
            raw_url = _resolve_known_template_vars(m.group(2), constants)
            window = text[m.end() : m.end() + 600]
            method = _detect_fetch_method_from_window(window)
            norm_path, abs_url = _normalize_path(raw_url)
            line_no = _line_no(text, m.start())
            snippet = text[m.start() : min(len(text), m.start() + 220)].replace(
                "\n", " "
            )
            calls.append(
                FrontendCall(
                    method=method,
                    path=norm_path,
                    source=f"{_posix(file_path)}:{line_no}",
                    raw=snippet.strip()[:400],
                    absolute_url=abs_url,
                )
            )

        # axios.get/post(...) ou api.get/post(...) — suporta multi-linha + generics
        for m in _AXIOS_DOT_RE.finditer(text):
            method = m.group(2).upper()
            raw_url = _resolve_known_template_vars(m.group(4), constants)
            norm_path, abs_url = _normalize_path(raw_url)
            line_no = _line_no(text, m.start())
            snippet = text[m.start() : min(len(text), m.start() + 220)].replace(
                "\n", " "
            )
            calls.append(
                FrontendCall(
                    method=method,
                    path=norm_path,
                    source=f"{_posix(file_path)}:{line_no}",
                    raw=snippet.strip()[:400],
                    absolute_url=abs_url,
                )
            )

        # axios/api/apiClient.<method>(urlVar) onde urlVar foi atribuído a string/template string
        for m in _AXIOS_DOT_VAR_RE.finditer(text):
            method = m.group(2).upper()
            var_name = m.group(3)
            if not var_name:
                continue
            resolved = _lookup_recent_assignment(
                var_name,
                call_offset=m.start(),
                assignments=assignment_spans,
            )
            if not resolved:
                continue
            raw_url = _resolve_known_template_vars(resolved, constants)
            norm_path, abs_url = _normalize_path(raw_url)
            line_no = _line_no(text, m.start())
            snippet = text[m.start() : min(len(text), m.start() + 220)].replace(
                "\n", " "
            )
            calls.append(
                FrontendCall(
                    method=method,
                    path=norm_path,
                    source=f"{_posix(file_path)}:{line_no}",
                    raw=snippet.strip()[:400],
                    absolute_url=abs_url,
                )
            )

        # useSWR("/path", ...) — suporta multi-linha + generics
        for m in _SWR_RE.finditer(text):
            raw_url = _resolve_known_template_vars(m.group(2), constants)
            norm_path, abs_url = _normalize_path(raw_url)
            line_no = _line_no(text, m.start())
            snippet = text[m.start() : min(len(text), m.start() + 220)].replace(
                "\n", " "
            )
            calls.append(
                FrontendCall(
                    method="GET",
                    path=norm_path,
                    source=f"{_posix(file_path)}:{line_no}",
                    raw=snippet.strip()[:400],
                    absolute_url=abs_url,
                )
            )

        # axios({ url: ..., method: ... }) / apiRequest({ url: ..., method: ... })
        # mantém heurística por janela de linhas
        for idx, line in enumerate(lines, start=1):
            if _AXIOS_OBJ_START_RE.search(line) or _API_REQUEST_OBJ_START_RE.search(
                line
            ):
                extracted = _detect_axios_object_call(lines, idx - 1)
                if extracted:
                    method, raw_url = extracted
                    raw_url = _resolve_known_template_vars(raw_url, constants)
                    norm_path, abs_url = _normalize_path(raw_url)
                    calls.append(
                        FrontendCall(
                            method=method,
                            path=norm_path,
                            source=f"{_posix(file_path)}:{idx}",
                            raw=line.strip()[:400],
                            absolute_url=abs_url,
                        )
                    )

    # Dedup por (method,path,source)
    uniq: Dict[Tuple[str, str, str], FrontendCall] = {}
    for c in calls:
        k = (c.method.upper(), c.path, c.source)
        uniq[k] = FrontendCall(
            method=c.method.upper(),
            path=c.path,
            source=c.source,
            raw=c.raw,
            absolute_url=c.absolute_url,
        )

    frontend_calls = [
        {
            "method": c.method,
            "path": c.path,
            "source": c.source,
            "raw": c.raw,
            **({"absolute_url": c.absolute_url} if c.absolute_url else {}),
        }
        for c in sorted(uniq.values(), key=lambda x: (x.path, x.method, x.source))
    ]

    return {"frontend_calls": frontend_calls}


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Extrai chamadas de API do frontend (TS/TSX)."
    )
    parser.add_argument(
        "--repo-root", default=str(Path.cwd()), help="Root do repo (default: cwd)"
    )
    parser.add_argument("--out", required=True, help="Arquivo JSON de saída")

    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()
    out_path = Path(args.out).resolve()

    data = extract_frontend_calls(repo_root)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
