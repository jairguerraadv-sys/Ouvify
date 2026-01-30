"""
Webhooks App Config - Ouvify
Sprint 5 - Feature 5.2: Integrações (Webhooks)
"""
from django.apps import AppConfig


class WebhooksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.webhooks'
    verbose_name = 'Webhooks & Integrações'

    def ready(self):
        try:
            from . import signals  # noqa
        except ImportError:
            pass
