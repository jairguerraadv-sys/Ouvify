#!/usr/bin/env python3
"""
audit_contract_backend.py - Extrai rotas do backend Django
Varre o código backend e extrai todas as rotas registradas
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Set

REPO_ROOT = Path(__file__).parent.parent.parent
BACKEND_DIR = REPO_ROOT / "apps" / "backend"
OUTPUT_FILE = REPO_ROOT / "audit" / "evidence" / "backend_endpoints.json"

# Adicionar backend ao path para imports
sys.path.insert(0, str(BACKEND_DIR))

def extract_from_urlpatterns(file_path: Path) -> List[Dict]:
    """Extrai rotas de urls.py"""
    endpoints = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Padrão para path() ou re_path()
        patterns = [
            r'path\([\'"]([^\'"]+)[\'"]',  # path('route/', ...)
            r're_path\(r[\'"]([^\'"]+)[\'"]',  # re_path(r'^route/$', ...)
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.MULTILINE)
            for match in matches:
                route = match.group(1)
                
                # Normalizar
                if route.startswith('^'):
                    route = route[1:]
                if route.endswith('$'):
                    route = route[:-1]
                if not route.startswith('/'):
                    route = '/' + route
                if not route.endswith('/') and route != '/':
                    route = route + '/'
                
                endpoints.append({
                    'file': str(file_path.relative_to(REPO_ROOT)),
                    'method': 'ANY',  # Django não especifica método no URL
                    'path': route,
                    'type': 'urlpattern',
                })
    
    except Exception as e:
        print(f"⚠️  Erro ao escanear {file_path}: {e}")
    
    return endpoints

def extract_from_viewsets(file_path: Path) -> List[Dict]:
    """Extrai rotas de ViewSets DRF"""
    endpoints = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Padrão para ViewSets
        viewset_pattern = r'class\s+(\w+)\(.*ViewSet.*\):'
        matches = re.finditer(viewset_pattern, content, re.MULTILINE)
        
        for match in matches:
            viewset_name = match.group(1)
            
            # Inferir basename (simplificado)
            basename = viewset_name.replace('ViewSet', '').lower()
            
            # ViewSets geram múltiplos endpoints
            routes = [
                {'method': 'GET', 'path': f'/{basename}/', 'action': 'list'},
                {'method': 'POST', 'path': f'/{basename}/', 'action': 'create'},
                {'method': 'GET', 'path': f'/{basename}/{{id}}/', 'action': 'retrieve'},
                {'method': 'PUT', 'path': f'/{basename}/{{id}}/', 'action': 'update'},
                {'method': 'PATCH', 'path': f'/{basename}/{{id}}/', 'action': 'partial_update'},
                {'method': 'DELETE', 'path': f'/{basename}/{{id}}/', 'action': 'destroy'},
            ]
            
            for route in routes:
                endpoints.append({
                    'file': str(file_path.relative_to(REPO_ROOT)),
                    'method': route['method'],
                    'path': route['path'],
                    'type': 'viewset',
                    'viewset': viewset_name,
                    'action': route['action'],
                })
    
    except Exception as e:
        print(f"⚠️  Erro ao escanear {file_path}: {e}")
    
    return endpoints

def extract_from_apiviews(file_path: Path) -> List[Dict]:
    """Extrai rotas de APIView"""
    endpoints = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Padrão para APIView
        apiview_pattern = r'class\s+(\w+)\(.*APIView.*\):'
        matches = re.finditer(apiview_pattern, content, re.MULTILINE)
        
        for match in matches:
            view_name = match.group(1)
            
            # Buscar métodos HTTP definidos
            view_start = match.start()
            # Pegar próximos 1000 caracteres (aprox.)
            view_content = content[view_start:view_start + 1000]
            
            methods = []
            for http_method in ['get', 'post', 'put', 'patch', 'delete']:
                if re.search(rf'def\s+{http_method}\s*\(', view_content, re.IGNORECASE):
                    methods.append(http_method.upper())
            
            if not methods:
                methods = ['GET']  # Default
            
            # Inferir path (simplificado)
            path = f'/{view_name.lower().replace("view", "")}/'
            
            for method in methods:
                endpoints.append({
                    'file': str(file_path.relative_to(REPO_ROOT)),
                    'method': method,
                    'path': path,
                    'type': 'apiview',
                    'view': view_name,
                })
    
    except Exception as e:
        print(f"⚠️  Erro ao escanear {file_path}: {e}")
    
    return endpoints

def scan_backend() -> List[Dict]:
    """Escaneia todo o backend"""
    print(f"🔍 Escaneando backend em: {BACKEND_DIR}")
    
    all_endpoints = []
    
    # 1. Escanear urls.py
    print("\n📋 Escaneando urls.py...")
    for url_file in BACKEND_DIR.rglob('urls.py'):
        if 'migrations' not in str(url_file):
            endpoints = extract_from_urlpatterns(url_file)
            all_endpoints.extend(endpoints)
            if endpoints:
                print(f"  📄 {url_file.relative_to(BACKEND_DIR)}: {len(endpoints)} rotas")
    
    # 2. Escanear views.py (ViewSets e APIViews)
    print("\n📋 Escaneando views.py...")
    for view_file in BACKEND_DIR.rglob('views.py'):
        if 'migrations' not in str(view_file):
            endpoints_vs = extract_from_viewsets(view_file)
            endpoints_av = extract_from_apiviews(view_file)
            all_endpoints.extend(endpoints_vs)
            all_endpoints.extend(endpoints_av)
            total = len(endpoints_vs) + len(endpoints_av)
            if total:
                print(f"  📄 {view_file.relative_to(BACKEND_DIR)}: {total} endpoints")
    
    print(f"\n✅ Total de endpoints encontrados: {len(all_endpoints)}")
    
    return all_endpoints

def deduplicate_endpoints(endpoints: List[Dict]) -> List[Dict]:
    """Remove duplicatas"""
    unique = {}
    
    for ep in endpoints:
        key = f"{ep['method']}:{ep['path']}"
        if key not in unique:
            unique[key] = {
                'method': ep['method'],
                'path': ep['path'],
                'type': ep['type'],
                'files': [],
                'count': 0,
            }
        
        unique[key]['files'].append({
            'file': ep['file'],
            'details': {k: v for k, v in ep.items() if k not in ['file', 'method', 'path', 'type']}
        })
        unique[key]['count'] += 1
    
    return list(unique.values())

def main():
    print("=" * 60)
    print("🔍 Backend Contract Audit - Ouvify (Django/DRF)")
    print("=" * 60)
    print()
    
    # Escanear
    endpoints = scan_backend()
    
    # Deduplicate
    unique_endpoints = deduplicate_endpoints(endpoints)
    
    print(f"\n📊 Endpoints únicos: {len(unique_endpoints)}")
    
    # Salvar JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'total_routes': len(endpoints),
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
    
    # Sumário por tipo
    types = {}
    for ep in unique_endpoints:
        types[ep['type']] = types.get(ep['type'], 0) + 1
    
    print("\n📈 Distribuição por tipo:")
    for typ, count in sorted(types.items()):
        print(f"  {typ}: {count}")

if __name__ == '__main__':
    main()
