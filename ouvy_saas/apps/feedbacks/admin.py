from django.contrib import admin
from .models import Feedback, FeedbackInteracao


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['protocolo', 'titulo', 'tipo', 'status', 'client', 'anonimo', 'data_criacao']
    list_filter = ['tipo', 'status', 'anonimo', 'data_criacao', 'client']
    search_fields = ['protocolo', 'titulo', 'descricao', 'email_contato']
    readonly_fields = ['protocolo', 'data_criacao', 'data_atualizacao', 'client']
    date_hierarchy = 'data_criacao'
    list_per_page = 25
    
    fieldsets = (
        ('Rastreamento', {
            'fields': ('protocolo', 'client')
        }),
        ('Informações do Feedback', {
            'fields': ('tipo', 'titulo', 'descricao', 'status')
        }),
        ('Contato', {
            'fields': ('anonimo', 'email_contato')
        }),
        ('Resposta da Empresa', {
            'fields': ('resposta_empresa', 'data_resposta'),
            'description': 'Posicionamento oficial da empresa sobre o feedback'
        }),
        ('Sistema', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Sobrescreve para usar all_tenants() no admin,
        permitindo que super admin veja todos os feedbacks.
        """
        qs = super().get_queryset(request)
        # No admin, use all_tenants() para visualizar todos
        if hasattr(qs.model.objects, 'all_tenants'):
            return qs.model.objects.all_tenants()
        return qs
    
    def get_readonly_fields(self, request, obj=None):
        """Impede edição do client e protocolo após criação"""
        readonly = [field for field in self.readonly_fields if isinstance(field, str)]
        if obj:  # Se estiver editando
            readonly.append('tipo')
        return readonly


@admin.register(FeedbackInteracao)
class FeedbackInteracaoAdmin(admin.ModelAdmin):
    list_display = ['id', 'feedback', 'tipo', 'autor', 'data']
    list_filter = ['tipo', 'data']
    search_fields = ['mensagem', 'feedback__protocolo']
    readonly_fields = ['data', 'client']
    raw_id_fields = ['feedback', 'autor']
    list_per_page = 50
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(qs.model.objects, 'all_tenants'):
            return qs.model.objects.all_tenants()
        return qs
