from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['nome', 'subdominio', 'cor_primaria', 'ativo', 'data_criacao']
    list_filter = ['ativo', 'data_criacao']
    search_fields = ['nome', 'subdominio']
    readonly_fields = ['data_criacao', 'data_atualizacao']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'subdominio', 'ativo')
        }),
        ('White Label', {
            'fields': ('logo', 'cor_primaria')
        }),
        ('Datas', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
