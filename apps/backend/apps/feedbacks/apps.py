"""
Configuração da aplicação Feedbacks.
"""

from django.apps import AppConfig


class FeedbacksConfig(AppConfig):
    """
    Configuração da aplicação de Feedbacks.

    Registra os signals para notificações automáticas por email.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.feedbacks"
    verbose_name = "Feedbacks e Interações"

    def ready(self):
        """
        Importa os signals quando a aplicação está pronta.

        Isso garante que os receivers sejam registrados corretamente
        antes de qualquer operação no banco de dados.
        """
        # Importa signals para registrar os receivers
        import apps.feedbacks.signals  # noqa: F401
