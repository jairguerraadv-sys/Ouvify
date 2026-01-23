from django.apps import AppConfig


class AuditlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auditlog'
    verbose_name = 'Audit Log'

    def ready(self):
        """Importar signals quando o app estiver pronto."""
        import apps.auditlog.signals  # noqa
