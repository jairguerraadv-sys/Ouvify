from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    verbose_name = 'Notificações Push'
    
    def ready(self):
        # Importar signals para registrar handlers
        try:
            import apps.notifications.signals  # noqa: F401
        except ImportError:
            pass
