from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('nome', 'subdominio', 'ativo', 'data_criacao')
    search_fields = ('nome', 'subdominio')
    list_filter = ('ativo', 'data_criacao')
    ordering = ('nome',)
    readonly_fields = ('data_criacao', 'data_atualizacao')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'subdominio', 'ativo')
        }),
        ('White Label', {
            'fields': ('logo', 'cor_primaria'),
            'description': 'Customize a aparência da plataforma para esta empresa'
        }),
        ('Timestamps', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
