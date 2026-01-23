"""
WSGI config wrapper for monorepo structure.
"""
import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change working directory to backend
os.chdir(backend_path)

# Import WSGI application from backend
from config.wsgi import application  # noqa: F401

__all__ = ['application']
