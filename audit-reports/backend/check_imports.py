#!/usr/bin/env python3
"""Verifica imports em arquivos Python do backend."""
import ast
import sys
from pathlib import Path

def check_file_imports(file_path):
    """Tenta parsear arquivo e retorna erros."""
    try:
        code = file_path.read_text(encoding='utf-8')
        ast.parse(code, filename=str(file_path))
        return None
    except SyntaxError as e:
        return f"SyntaxError: {e}"
    except Exception as e:
        return f"Error: {e}"

def main():
    backend_root = Path(__file__).parent.parent
    apps_dir = backend_root / "apps"
    
    print(f"Scanning: {apps_dir}")
    errors = []
    
    for py_file in apps_dir.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        
        error = check_file_imports(py_file)
        if error:
            errors.append((str(py_file.relative_to(backend_root)), error))
    
    if errors:
        print(f"\n❌ {len(errors)} arquivos com erros:")
        for file, error in errors:
            print(f"  - {file}: {error}")
        return 1
    else:
        print(f"\n✅ Todos os arquivos parsearam com sucesso")
        return 0

if __name__ == "__main__":
    sys.exit(main())
