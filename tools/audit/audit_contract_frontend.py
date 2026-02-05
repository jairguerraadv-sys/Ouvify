#!/usr/bin/env python3
"""
audit_contract_frontend.py - Extrai endpoints do frontend
Varre o código frontend (Next.js/React) e extrai todas as chamadas de API
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Set

REPO_ROOT = Path(__file__).parent.parent.parent
FRONTEND_DIR = REPO_ROOT / "apps" / "frontend"
OUTPUT_FILE = REPO_ROOT / "audit" / "evidence" / "frontend_endpoints.json"

# Patterns para detectar chamadas de API
PATTERNS = [
    r'fetch\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # fetch('url')
    r'axios\.\w+\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # axios.get('url')
    r'\.get\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # .get('url')
    r'\.post\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # .post('url')
    r'\.put\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # .put('url')
    r'\.delete\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # .delete('url')
    r'\.patch\s*\(\s*[\'"`]([^\'"` ]+)[\'"`]',  # .patch('url')
    r'url:\s*[\'"`]([^\'"` ]+)[\'"`]',  # url: 'url'
    r'baseURL\s*:\s*[\'"`]([^\'"` ]+)[\'"`]',  # baseURL: 'url'
    r'NEXT_PUBLIC_API_URL.*[\'"`]([^\'"` ]+)[\'"`]',  # env vars
]

def extract_method_from_context(content: str, url_pos: int) -> str:
    """Tenta extrair o método HTTP do contexto"""
    # Pegar 200 caracteres antes da URL
    context = content[max(0, url_pos - 200):url_pos]
    
    if re.search(r'\.post\s*\(', context, re.IGNORECASE):
        return 'POST'
    elif re.search(r'\.put\s*\(', context, re.IGNORECASE):
        return 'PUT'
    elif re.search(r'\.delete\s*\(', context, re.IGNORECASE):
        return 'DELETE'
    elif re.search(r'\.patch\s*\(', context, re.IGNORECASE):
        return 'PATCH'
    elif re.search(r'method:\s*[\'"`]POST[\'"`]', context, re.IGNORECASE):
        return 'POST'
    elif re.search(r'method:\s*[\'"`]PUT[\'"`]', context, re.IGNORECASE):
        return 'PUT'
    elif re.search(r'method:\s*[\'"`]DELETE[\'"`]', context, re.IGNORECASE):
        return 'DELETE'
    else:
        return 'GET'

def normalize_endpoint(url: str, base_url: str = "") -> Dict[str, str]:
    """Normaliza endpoint removendo base URL e query strings"""
    # Remover base URLs conhecidas
    for prefix in [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://ouvify.vercel.app',
        'https://ouvify-backend.onrender.com',
        base_url,
        '${process.env.NEXT_PUBLIC_API_URL}',
        '${API_URL}',
        '${baseURL}',
    ]:
        if url.startswith(prefix):
            url = url[len(prefix):]
    
    # Remover query strings
    if '?' in url:
        url = url.split('?')[0]
    
    # Garantir que começa com /
    if not url.startswith('/'):
        url = '/' + url
    
    return url

def scan_file(file_path: Path, base_url: str = "") -> List[Dict]:
    """Escaneia um arquivo em busca de endpoints"""
    endpoints = []
    
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        for pattern in PATTERNS:
            matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                url = match.group(1)
                
                # Pular URLs externas não relevantes e assets
                if any(skip in url for skip in ['http://', 'https://', 'mailto:', 'tel:', '.css', '.js', '.png', '.jpg', '.svg', '${', '{', '...']):
                    if not any(domain in url for domain in ['localhost', '127.0.0.1', 'ouvify', '.onrender.com', 'NEXT_PUBLIC']):
                        continue
                
                # Normalizar
                normalized = normalize_endpoint(url, base_url)
                
                # Extrair método
                method = extract_method_from_context(content, match.start())
                
                endpoints.append({
                    'file': str(file_path.relative_to(REPO_ROOT)),
                    'line': content[:match.start()].count('\n') + 1,
                    'method': method,
                    'path': normalized,
                    'raw_url': url,
                })
    
    except Exception as e:
        print(f"⚠️  Erro ao escanear {file_path}: {e}")
    
    return endpoints

def scan_frontend() -> List[Dict]:
    """Escaneia todo o frontend"""
    print(f"🔍 Escaneando frontend em: {FRONTEND_DIR}")
    
    all_endpoints = []
    file_count = 0
    
    # Extensões relevantes
    extensions = {'.ts', '.tsx', '.js', '.jsx'}
    
    for file_path in FRONTEND_DIR.rglob('*'):
        if file_path.suffix in extensions and 'node_modules' not in str(file_path):
            endpoints = scan_file(file_path)
            all_endpoints.extend(endpoints)
            if endpoints:
                file_count += 1
                print(f"  📄 {file_path.relative_to(FRONTEND_DIR)}: {len(endpoints)} endpoints")
    
    print(f"\n✅ Escaneados {file_count} arquivos")
    print(f"✅ Encontrados {len(all_endpoints)} endpoints")
    
    return all_endpoints

def deduplicate_endpoints(endpoints: List[Dict]) -> List[Dict]:
    """Remove duplicatas mantendo metadados agregados"""
    unique = {}
    
    for ep in endpoints:
        key = f"{ep['method']}:{ep['path']}"
        if key not in unique:
            unique[key] = {
                'method': ep['method'],
                'path': ep['path'],
                'files': [],
                'count': 0,
            }
        
        unique[key]['files'].append({
            'file': ep['file'],
            'line': ep['line'],
            'raw_url': ep['raw_url'],
        })
        unique[key]['count'] += 1
    
    return list(unique.values())

def main():
    print("=" * 60)
    print("🔍 Frontend Contract Audit - Ouvify")
    print("=" * 60)
    print()
    
    # Escanear
    endpoints = scan_frontend()
    
    # Deduplicate
    unique_endpoints = deduplicate_endpoints(endpoints)
    
    print(f"\n📊 Endpoints únicos: {len(unique_endpoints)}")
    
    # Salvar JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'total_calls': len(endpoints),
            'unique_endpoints': len(unique_endpoints),
            'endpoints': unique_endpoints,
            'scan_date': __import__('datetime').datetime.now().isoformat(),
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Relatório salvo em: {OUTPUT_FILE.relative_to(REPO_ROOT)}")
    
    # Sumário por método
    methods = {}
    for ep in unique_endpoints:
        methods[ep['method']] = methods.get(ep['method'], 0) + 1
    
    print("\n📈 Distribuição por método:")
    for method, count in sorted(methods.items()):
        print(f"  {method}: {count}")
    
    # Top 10 mais chamados
    print("\n🔥 Top 10 endpoints mais usados:")
    top_endpoints = sorted(unique_endpoints, key=lambda x: x['count'], reverse=True)[:10]
    for i, ep in enumerate(top_endpoints, 1):
        print(f"  {i}. {ep['method']} {ep['path']} ({ep['count']}× chamadas)")

if __name__ == '__main__':
    main()
