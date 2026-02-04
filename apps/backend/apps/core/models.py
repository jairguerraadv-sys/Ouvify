from typing import Optional

from django.db import models

from .utils import get_current_tenant


class TenantAwareManager(models.Manager):
    """
    Manager customizado que filtra automaticamente os resultados
    baseado no tenant atual armazenado no thread-local.
    """

    def get_queryset(self):
        """
        Sobrescreve o queryset padrão para incluir filtro por tenant.
        """
        queryset = super().get_queryset()
        tenant = get_current_tenant()

        if tenant is not None:
            # Filtra apenas dados do tenant atual
            return queryset.filter(client=tenant)

        # Se não houver tenant, retorna queryset vazio por segurança
        # Isso evita vazamento de dados entre tenants
        return queryset.none()

    def all_tenants(self):
        """
        Método para obter dados de todos os tenants.
        Use com cautela e apenas em contextos administrativos.
        """
        return super().get_queryset()


class TenantAwareModel(models.Model):
    """
    Modelo abstrato que adiciona isolamento automático por tenant.

    Todos os modelos que herdam desta classe:
    1. Terão um campo ForeignKey para Client (tenant)
    2. Usarão o TenantAwareManager que filtra automaticamente por tenant
    3. Salvam automaticamente com o tenant atual

    Usage:
        class Feedback(TenantAwareModel):
            titulo = models.CharField(max_length=200)
            descricao = models.TextField()
    """

    # Hint para Pylance/typing: atributo implícito criado pelo Django
    client_id: Optional[int]

    client = models.ForeignKey(
        "tenants.Client",
        on_delete=models.CASCADE,
        verbose_name="Cliente",
        related_name="%(class)s_set",
        help_text="Cliente (tenant) ao qual este registro pertence",
    )

    # Manager padrão com filtro por tenant
    objects = TenantAwareManager()  # type: ignore[assignment]

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Sobrescreve o save para definir automaticamente o tenant atual
        se não estiver definido.
        """
        # Verifica se é criação nova E client não está definido
        current_client_id: Optional[int] = getattr(self, "client_id", None)
        if not self.pk and current_client_id is None:
            # Apenas define o tenant na criação do objeto
            tenant = get_current_tenant()
            if tenant is None:
                raise ValueError(
                    f"Não é possível salvar {self.__class__.__name__} sem um tenant ativo. "
                    "Certifique-se de que a requisição passou pelo TenantMiddleware."
                )
            self.client = tenant

        super().save(*args, **kwargs)


class CSPViolation(models.Model):
    """
    Modelo para armazenar violações de Content Security Policy.
    Dados são normalizados para evitar vazamento de PII.
    """

    client = models.ForeignKey(
        "tenants.Client",
        on_delete=models.CASCADE,
        related_name="csp_violations",
        help_text="Tenant que reportou a violação",
    )

    # Dados normalizados da violação (sem PII)
    document_uri = models.URLField(
        max_length=500, help_text="URI do documento que violou CSP (normalizada)"
    )
    violated_directive = models.CharField(
        max_length=100, help_text="Diretiva CSP que foi violada"
    )
    effective_directive = models.CharField(
        max_length=100, help_text="Diretiva efetiva que foi violada"
    )
    original_policy = models.TextField(help_text="Política CSP original")

    # Dados opcionais (sanitizados)
    blocked_uri = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URI bloqueada (sanitizada, sem query params)",
    )
    source_file = models.CharField(
        max_length=500, blank=True, null=True, help_text="Arquivo fonte (sanitizado)"
    )
    line_number = models.PositiveIntegerField(
        blank=True, null=True, help_text="Número da linha onde ocorreu a violação"
    )

    # Metadados
    user_agent = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="User agent truncado (primeiros 200 chars)",
    )
    ip_address = models.GenericIPAddressField(
        help_text="IP do cliente (para rate limiting)"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["client", "created_at"]),
            models.Index(fields=["violated_directive"]),
            models.Index(fields=["ip_address"]),
        ]

    def __str__(self):
        return f"CSP Violation: {self.violated_directive} on {self.document_uri}"

    @staticmethod
    def sanitize_uri(uri: str) -> str:
        """
        Sanitiza URI removendo query parameters e fragmentos para evitar PII.
        """
        if not uri:
            return uri

        # Remove query parameters e fragmentos
        uri = uri.split("?")[0].split("#")[0]

        # Limita comprimento
        return uri[:500] if len(uri) > 500 else uri

    @staticmethod
    def truncate_user_agent(user_agent: str) -> str:
        """
        Trunca user agent para primeiros 200 caracteres.
        """
        return user_agent[:200] if user_agent else ""


# Importar APIKey para que Django detecte o modelo
