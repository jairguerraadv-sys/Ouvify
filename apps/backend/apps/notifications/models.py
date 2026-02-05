"""
Modelos do sistema de notificações push
Inclui: PushSubscription (Web Push), Notification (histórico)
"""

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

from apps.tenants.models import Client

User = get_user_model()


class PushSubscription(models.Model):
    """
    Subscription de Web Push por usuário/dispositivo

    Armazena os dados necessários para enviar notificações push via Web Push API:
    - endpoint: URL do push service do browser
    - p256dh: Chave pública para criptografia
    - auth: Secret de autenticação
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
        verbose_name="Usuário",
    )
    tenant = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
        verbose_name="Tenant",
    )

    # Dados da subscription (vindos do browser)
    endpoint = models.TextField(
        verbose_name="Endpoint", help_text="URL do Push Service"
    )
    p256dh = models.CharField(
        max_length=255, verbose_name="P256DH Key", help_text="Chave pública ECDH P-256"
    )
    auth = models.CharField(
        max_length=255, verbose_name="Auth Secret", help_text="Secret de autenticação"
    )

    # Metadados do dispositivo
    user_agent = models.TextField(blank=True, default="", verbose_name="User Agent")
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, verbose_name="IP de Registro"
    )

    # Controle de estado
    active = models.BooleanField(
        default=True, verbose_name="Ativo", help_text="Se a subscription ainda é válida"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    last_used = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Último uso",
        help_text="Quando foi enviada a última notificação",
    )

    class Meta:
        verbose_name = "Subscription Push"
        verbose_name_plural = "Subscriptions Push"
        unique_together = ["user", "endpoint"]
        indexes = [
            models.Index(fields=["user", "active"]),
            models.Index(fields=["tenant", "active"]),
            models.Index(fields=["endpoint"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} - {self.endpoint[:50]}..."

    def mark_as_used(self) -> None:
        """Atualiza timestamp de último uso"""
        self.last_used = timezone.now()
        self.save(update_fields=["last_used"])

    def deactivate(self) -> None:
        """Desativa subscription (ex: quando recebe 410 Gone)"""
        self.active = False
        self.save(update_fields=["active"])


class Notification(models.Model):
    """
    Histórico de notificações enviadas

    Armazena todas as notificações enviadas para auditoria,
    controle de leitura e estatísticas de entrega.
    """

    class TipoNotificacao(models.TextChoices):
        FEEDBACK_NOVO = "FEEDBACK_NOVO", "Novo Feedback"
        FEEDBACK_ATUALIZADO = "FEEDBACK_ATUALIZADO", "Feedback Atualizado"
        FEEDBACK_COMENTARIO = "FEEDBACK_COMENTARIO", "Novo Comentário"
        FEEDBACK_RESOLVIDO = "FEEDBACK_RESOLVIDO", "Feedback Resolvido"
        SISTEMA = "SISTEMA", "Notificação do Sistema"
        ALERTA = "ALERTA", "Alerta Importante"

    tenant = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name="Tenant",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
        verbose_name="Usuário",
        help_text="Null = broadcast para todos do tenant",
    )

    # Conteúdo da notificação
    tipo = models.CharField(
        max_length=50,
        choices=TipoNotificacao.choices,
        default=TipoNotificacao.SISTEMA,
        verbose_name="Tipo",
    )
    title = models.CharField(max_length=255, verbose_name="Título")
    body = models.TextField(
        verbose_name="Corpo", help_text="Texto principal da notificação"
    )
    icon = models.URLField(
        blank=True, default="", verbose_name="Ícone", help_text="URL do ícone a exibir"
    )
    url = models.CharField(
        max_length=500,
        blank=True,
        default="",
        verbose_name="URL de Destino",
        help_text="URL para abrir ao clicar na notificação",
    )

    # Dados adicionais (metadados JSON)
    data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Dados Extras",
        help_text="Dados adicionais em formato JSON",
    )

    # Controle de estado e interação
    sent_at = models.DateTimeField(auto_now_add=True, verbose_name="Enviada em")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Lida em")
    clicked_at = models.DateTimeField(null=True, blank=True, verbose_name="Clicada em")

    # Estatísticas de entrega
    delivery_success = models.BooleanField(
        default=False, verbose_name="Entrega bem-sucedida"
    )
    delivery_error = models.TextField(
        blank=True, default="", verbose_name="Erro de Entrega"
    )
    push_sent_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Pushes Enviados",
        help_text="Quantidade de dispositivos que receberam",
    )

    class Meta:
        verbose_name = "Notificação"
        verbose_name_plural = "Notificações"
        ordering = ["-sent_at"]
        indexes = [
            models.Index(fields=["tenant", "user", "-sent_at"]),
            models.Index(fields=["user", "read_at"]),
            models.Index(fields=["tipo", "-sent_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.get_tipo_display()} - {self.title}"

    @property
    def is_read(self) -> bool:
        """Verifica se foi lida"""
        return self.read_at is not None

    @property
    def is_clicked(self) -> bool:
        """Verifica se foi clicada"""
        return self.clicked_at is not None

    def mark_as_read(self) -> None:
        """Marca notificação como lida"""
        if not self.read_at:
            self.read_at = timezone.now()
            self.save(update_fields=["read_at"])

    def mark_as_clicked(self) -> None:
        """Marca notificação como clicada (também marca como lida)"""
        now = timezone.now()
        update_fields = ["clicked_at"]

        self.clicked_at = now

        if not self.read_at:
            self.read_at = now
            update_fields.append("read_at")

        self.save(update_fields=update_fields)

    def record_delivery(
        self, success: bool, error: str = "", push_count: int = 0
    ) -> None:
        """Registra resultado da entrega"""
        self.delivery_success = success
        self.delivery_error = error
        self.push_sent_count = push_count
        self.save(
            update_fields=["delivery_success", "delivery_error", "push_sent_count"]
        )


class NotificationPreference(models.Model):
    """
    Preferências de notificação por usuário
    Permite ao usuário controlar quais tipos de notificação deseja receber
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
        verbose_name="Usuário",
    )

    # Preferências por tipo
    notify_feedback_novo = models.BooleanField(
        default=True, verbose_name="Novos Feedbacks"
    )
    notify_feedback_atualizado = models.BooleanField(
        default=True, verbose_name="Feedbacks Atualizados"
    )
    notify_feedback_comentario = models.BooleanField(
        default=True, verbose_name="Novos Comentários"
    )
    notify_sistema = models.BooleanField(
        default=True, verbose_name="Notificações do Sistema"
    )

    # Horário de silêncio (não perturbe)
    quiet_hours_enabled = models.BooleanField(
        default=False, verbose_name="Modo Silencioso"
    )
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Início do Silêncio",
        help_text="Horário para parar de enviar notificações",
    )
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fim do Silêncio",
        help_text="Horário para voltar a enviar notificações",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Preferência de Notificação"
        verbose_name_plural = "Preferências de Notificação"

    def __str__(self) -> str:
        return f"Preferências de {self.user.email}"

    def should_notify(self, tipo: str) -> bool:
        """Verifica se deve notificar baseado no tipo e preferências"""
        preference_map = {
            "FEEDBACK_NOVO": self.notify_feedback_novo,
            "FEEDBACK_ATUALIZADO": self.notify_feedback_atualizado,
            "FEEDBACK_COMENTARIO": self.notify_feedback_comentario,
            "FEEDBACK_RESOLVIDO": self.notify_feedback_atualizado,
            "SISTEMA": self.notify_sistema,
            "ALERTA": True,  # Alertas sempre são enviados
        }
        return preference_map.get(tipo, True)

    def is_quiet_hours(self) -> bool:
        """Verifica se está no horário de silêncio"""
        if not self.quiet_hours_enabled:
            return False

        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False

        now = timezone.localtime().time()

        if self.quiet_hours_start <= self.quiet_hours_end:
            # Período normal (ex: 22:00 - 07:00 do mesmo dia)
            return self.quiet_hours_start <= now <= self.quiet_hours_end
        else:
            # Período que atravessa meia-noite (ex: 22:00 - 07:00)
            return now >= self.quiet_hours_start or now <= self.quiet_hours_end
