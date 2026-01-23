"""
Config module wrapper for monorepo structure.
Imports all settings from apps/backend/config.
"""
import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import everything from backend config
from apps.backend.config.settings import *  # noqa: F401, F403
