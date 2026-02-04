from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "subdominio",
        "plano",
        "subscription_status",
        "ativo",
        "data_criacao",
    )
    search_fields = ("nome", "subdominio", "owner__email")
    list_filter = ("ativo", "plano", "subscription_status", "data_criacao")
    ordering = ("nome",)
    readonly_fields = (
        "data_criacao",
        "data_atualizacao",
        "stripe_customer_id",
        "stripe_subscription_id",
    )
    date_hierarchy = "data_criacao"
    list_per_page = 25
    raw_id_fields = ["owner"]

    fieldsets = (
        ("Informações Básicas", {"fields": ("nome", "subdominio", "owner", "ativo")}),
        (
            "White Label",
            {
                "fields": ("logo", "cor_primaria"),
                "description": "Customize a aparência da plataforma para esta empresa",
            },
        ),
        (
            "Assinatura",
            {
                "fields": ("plano", "subscription_status", "data_fim_assinatura"),
                "description": "Configurações de plano e assinatura",
            },
        ),
        (
            "Stripe",
            {
                "fields": ("stripe_customer_id", "stripe_subscription_id"),
                "classes": ("collapse",),
                "description": "IDs do Stripe (somente leitura)",
            },
        ),
        (
            "Timestamps",
            {"fields": ("data_criacao", "data_atualizacao"), "classes": ("collapse",)},
        ),
    )

    actions = ["ativar_tenants", "desativar_tenants"]

    @admin.action(description="Ativar tenants selecionados")
    def ativar_tenants(self, request, queryset):
        updated = queryset.update(ativo=True)
        self.message_user(request, f"{updated} tenant(s) ativado(s).")

    @admin.action(description="Desativar tenants selecionados")
    def desativar_tenants(self, request, queryset):
        updated = queryset.update(ativo=False)
        self.message_user(request, f"{updated} tenant(s) desativado(s).")
