"""
Filtros para API de Feedbacks.

Provê filtros avançados para queries, incluindo:
- Atribuição (assigned_to, assigned_to_me, unassigned)
- Status e tipo
- Datas de criação
"""

from django_filters import rest_framework as filters
from .models import Feedback


class FeedbackFilter(filters.FilterSet):
    """
    Filtros para Feedback API.
    
    Uso:
    - GET /api/feedbacks/?assigned_to=123
    - GET /api/feedbacks/?assigned_to_me=true
    - GET /api/feedbacks/?unassigned=true
    - GET /api/feedbacks/?status=pendente,em_analise
    """
    
    assigned_to = filters.NumberFilter(
        field_name='assigned_to',
        help_text='Filtrar por ID do TeamMember atribuído'
    )
    
    assigned_to_me = filters.BooleanFilter(
        method='filter_assigned_to_me',
        help_text='true = apenas feedbacks atribuídos ao usuário logado'
    )
    
    unassigned = filters.BooleanFilter(
        method='filter_unassigned',
        help_text='true = apenas feedbacks não atribuídos'
    )
    
    def filter_assigned_to_me(self, queryset, name, value):
        """Filtra feedbacks atribuídos ao usuário atual."""
        if not value:
            return queryset
        
        user = self.request.user
        tenant = self.request.tenant
        
        # Obter TeamMember do usuário
        try:
            from apps.tenants.models import TeamMember
            team_member = TeamMember.objects.get(
                user=user,
                client=tenant,
                status=TeamMember.ACTIVE
            )
            return queryset.filter(assigned_to=team_member)
        except TeamMember.DoesNotExist:
            return queryset.none()
    
    def filter_unassigned(self, queryset, name, value):
        """Filtra feedbacks sem atribuição."""
        if not value:
            return queryset
        return queryset.filter(assigned_to__isnull=True)
    
    class Meta:
        model = Feedback
        fields = {
            'status': ['exact', 'in'],
            'tipo': ['exact', 'in'],
            'data_criacao': ['gte', 'lte'],
        }
