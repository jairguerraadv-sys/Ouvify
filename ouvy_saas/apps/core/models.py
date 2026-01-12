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
    
    client = models.ForeignKey(
        'tenants.Client',
        on_delete=models.CASCADE,
        verbose_name='Cliente',
        related_name='%(class)s_set',
        help_text='Cliente (tenant) ao qual este registro pertence'
    )
    
    # Manager padrão com filtro por tenant
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """
        Sobrescreve o save para definir automaticamente o tenant atual
        se não estiver definido.
        """
        if not self.pk and not self.client_id:
            # Apenas define o tenant na criação do objeto
            tenant = get_current_tenant()
            if tenant is None:
                raise ValueError(
                    f"Não é possível salvar {self.__class__.__name__} sem um tenant ativo. "
                    "Certifique-se de que a requisição passou pelo TenantMiddleware."
                )
            self.client = tenant
        
        super().save(*args, **kwargs)
