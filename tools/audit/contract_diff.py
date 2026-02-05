#!/usr/bin/env python3
"""
contract_diff.py - Compara contratos frontend vs backend
Identifica MISSING, ORPHAN e DIVERGENT endpoints
"""

import json
from pathlib import Path
from typing import List, Dict, Set, Tuple

REPO_ROOT = Path(__file__).parent.parent.parent
FE_FILE = REPO_ROOT / "audit" / "evidence" / "frontend_endpoints.json"
BE_FILE = REPO_ROOT / "audit" / "evidence" / "backend_endpoints.json"
OUTPUT_FILE = REPO_ROOT / "audit" / "CONTRACT_MATRIX.md"

CRITICAL_PATHS = [
    '/api/tenant-info/',
    '/api/token/',
    '/api/check-subdominio/',
    '/api/register-tenant/',
    '/enviar',
]

def normalize_path(path: str) -> str:
    """Normaliza path para comparação"""
    # Remover trailing slash para comparação
    path = path.rstrip('/')
    
    # Normalizar parâmetros {id}, <int:id>, :id para {param}
    import re
    path = re.sub(r'<[^>]+>', '{param}', path)
    path = re.sub(r':[a-zA-Z0-9_]+', '{param}', path)
    
    return path

def load_contracts() -> Tuple[Dict, Dict]:
    """Carrega contratos frontend e backend"""
    with open(FE_FILE, 'r', encoding='utf-8') as f:
        fe_data = json.load(f)
    
    with open(BE_FILE, 'r', encoding='utf-8') as f:
        be_data = json.load(f)
    
    # Normalizar para dicts indexados por method:path
    fe_endpoints = {}
    for ep in fe_data['endpoints']:
        key = f"{ep['method']}:{normalize_path(ep['path'])}"
        fe_endpoints[key] = ep
    
    be_endpoints = {}
    for ep in be_data['endpoints']:
        if ep['method'] == 'ANY':
            # Expandir ANY para todos os métodos
            for method in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']:
                key = f"{method}:{normalize_path(ep['path'])}"
                be_endpoints[key] = {**ep, 'method': method}
        else:
            key = f"{ep['method']}:{normalize_path(ep['path'])}"
            be_endpoints[key] = ep
    
    return fe_endpoints, be_endpoints

def is_critical(path: str) -> bool:
    """Verifica se é um endpoint crítico"""
    norm_path = normalize_path(path)
    for critical in CRITICAL_PATHS:
        if normalize_path(critical) in norm_path or norm_path in normalize_path(critical):
            return True
    return False

def analyze_contracts(fe_endpoints: Dict, be_endpoints: Dict) -> Dict:
    """Analisa diferenças entre contratos"""
    missing = []  # FE chama, BE não tem
    orphan = []   # BE tem, FE não usa
    matched = []  # Ambos têm
    
    # FE → BE
    for key, fe_ep in fe_endpoints.items():
        if key in be_endpoints:
            matched.append({
                'method': fe_ep['method'],
                'path': fe_ep['path'],
                'frontend_calls': fe_ep['count'],
                'backend_type': be_endpoints[key]['type'],
                'severity': 'P2',  # Matched não é problema
            })
        else:
            # MISSING - frontend chama mas backend não tem
            severity = 'P0' if is_critical(fe_ep['path']) else 'P1'
            missing.append({
                'method': fe_ep['method'],
                'path': fe_ep['path'],
                'frontend_calls': fe_ep['count'],
                'frontend_files': [f['file'] for f in fe_ep['files'][:3]],  # Top 3
                'severity': severity,
                'issue': 'MISSING',
                'description': f'Frontend chama {fe_ep["count"]}× mas backend não implementa',
            })
    
    # BE → FE (orphans)
    for key, be_ep in be_endpoints.items():
        if key not in fe_endpoints:
            # ORPHAN - backend tem mas frontend não usa
            orphan.append({
                'method': be_ep['method'],
                'path': be_ep['path'],
                'backend_type': be_ep['type'],
                'backend_files': [f['file'] for f in be_ep['files'][:2]],
                'severity': 'P2',  # Orphan é menos crítico
                'issue': 'ORPHAN',
                'description': 'Backend implementa mas frontend não usa (pode ser legacy)',
            })
    
    return {
        'missing': sorted(missing, key=lambda x: (x['severity'], x['path'])),
        'orphan': sorted(orphan, key=lambda x: x['path']),
        'matched': sorted(matched, key=lambda x: x['path']),
    }

def generate_markdown_report(analysis: Dict) -> str:
    """Gera relatório em Markdown"""
    lines = [
        "# 🔍 Contract Matrix - Frontend ↔ Backend",
        "",
        f"**Data:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## 📊 Sumário Executivo",
        "",
        f"- ❌ **MISSING (P0/P1):** {len(analysis['missing'])} endpoints - Frontend chama, Backend não tem",
        f"- ⚠️  **ORPHAN (P2):** {len(analysis['orphan'])} endpoints - Backend tem, Frontend não usa",
        f"- ✅ **MATCHED:** {len(analysis['matched'])} endpoints - Contrato OK",
        "",
        "---",
        "",
    ]
    
    # P0 - Críticos
    p0_issues = [m for m in analysis['missing'] if m['severity'] == 'P0']
    if p0_issues:
        lines.extend([
            "## 🚨 P0 - CRÍTICO (Bloqueia Release)",
            "",
            "Endpoints **obrigatórios** que frontend chama mas backend não implementa:",
            "",
            "| Método | Path | Chamadas | Arquivos Frontend | Ação Requerida |",
            "|----|----|----|----|----|",
        ])
        
        for issue in p0_issues:
            files_str = ", ".join(issue['frontend_files'][:2])
            if len(issue['frontend_files']) > 2:
                files_str += f" +{len(issue['frontend_files']) - 2}"
            
            lines.append(
                f"| `{issue['method']}` | `{issue['path']}` | {issue['frontend_calls']}× | {files_str} | **Implementar no Backend** |"
            )
        
        lines.extend(["", "---", ""])
    
    # P1 - Alta Prioridade
    p1_issues = [m for m in analysis['missing'] if m['severity'] == 'P1']
    if p1_issues:
        lines.extend([
            "## ⚠️  P1 - Alta Prioridade",
            "",
            "Endpoints que frontend chama mas backend não implementa:",
            "",
            "| Método | Path | Chamadas | Arquivos Frontend | Ação Requerida |",
            "|----|----|----|----|----|",
        ])
        
        for issue in p1_issues:
            files_str = ", ".join(issue['frontend_files'][:2])
            if len(issue['frontend_files']) > 2:
                files_str += f" +{len(issue['frontend_files']) - 2}"
            
            lines.append(
                f"| `{issue['method']}` | `{issue['path']}` | {issue['frontend_calls']}× | {files_str} | Implementar ou remover chamada FE |"
            )
        
        lines.extend(["", "---", ""])
    
    # P2 - Orphans
    if analysis['orphan']:
        lines.extend([
            "## 📦 P2 - Orphan Endpoints (Cleanup Recomendado)",
            "",
            "Backend implementa mas frontend não usa (pode ser legacy/documentação/testes):",
            "",
            "<details>",
            "<summary>Ver lista completa de orphans</summary>",
            "",
            "| Método | Path | Tipo | Arquivos Backend |",
            "|----|----|----|----| ",
        ])
        
        for orphan in analysis['orphan'][:20]:  # Limitar a 20
            files_str = ", ".join(orphan['backend_files'][:2])
            lines.append(
                f"| `{orphan['method']}` | `{orphan['path']}` | {orphan['backend_type']} | {files_str} |"
            )
        
        if len(analysis['orphan']) > 20:
            lines.append(f"| ... | ... | ... | *+{len(analysis['orphan']) - 20} endpoints* |")
        
        lines.extend(["", "</details>", "", "---", ""])
    
    # Matched
    lines.extend([
        "## ✅ Matched Endpoints",
        "",
        f"Total de {len(analysis['matched'])} endpoints com contrato OK (Frontend ↔ Backend).",
        "",
        "<details>",
        "<summary>Ver lista completa</summary>",
        "",
        "| Método | Path | Chamadas FE | Tipo BE |",
        "|----|----|----|----|",
    ])
    
    for match in analysis['matched'][:30]:  # Limitar a 30
        lines.append(
            f"| `{match['method']}` | `{match['path']}` | {match['frontend_calls']}× | {match['backend_type']} |"
        )
    
    if len(analysis['matched']) > 30:
        lines.append(f"| ... | ... | ... | *+{len(analysis['matched']) - 30} endpoints* |")
    
    lines.extend(["", "</details>", ""])
    
    return "\n".join(lines)

def main():
    print("=" * 60)
    print("🔍 Contract Diff - Frontend ↔ Backend")
    print("=" * 60)
    print()
    
    # Carregar contratos
    print("📥 Carregando contratos...")
    fe_endpoints, be_endpoints = load_contracts()
    
    print(f"  Frontend: {len(fe_endpoints)} endpoints únicos")
    print(f"  Backend:  {len(be_endpoints)} endpoints únicos")
    print()
    
    # Analisar
    print("🔍 Analisando diferenças...")
    analysis = analyze_contracts(fe_endpoints, be_endpoints)
    
    # Gerar relatório
    print("📝 Gerando CONTRACT_MATRIX.md...")
    report = generate_markdown_report(analysis)
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(report, encoding='utf-8')
    
    print(f"✅ Relatório salvo em: {OUTPUT_FILE.relative_to(REPO_ROOT)}")
    print()
    
    # Sumário
    print("📊 SUMÁRIO:")
    print(f"  ❌ MISSING (P0): {len([m for m in analysis['missing'] if m['severity'] == 'P0'])}")
    print(f"  ⚠️  MISSING (P1): {len([m for m in analysis['missing'] if m['severity'] == 'P1'])}")
    print(f"  📦 ORPHAN (P2): {len(analysis['orphan'])}")
    print(f"  ✅ MATCHED: {len(analysis['matched'])}")
    print()
    
    # Alertas P0
    p0_issues = [m for m in analysis['missing'] if m['severity'] == 'P0']
    if p0_issues:
        print("🚨 ALERTA P0 - Endpoints críticos faltando:")
        for issue in p0_issues:
            print(f"  - {issue['method']} {issue['path']}")
        print()
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
