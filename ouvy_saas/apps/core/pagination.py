"""
Custom pagination classes for the Ouvy SaaS API.
Provides consistent pagination across all endpoints.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict


class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginação padrão para listagens da API.
    
    Configurações:
    - page_size: 20 itens por página (padrão)
    - page_size_query_param: 'page_size' (permite ao cliente customizar)
    - max_page_size: 100 itens (limite máximo)
    
    Uso:
    GET /api/feedbacks/?page=2
    GET /api/feedbacks/?page=1&page_size=50
    
    Resposta:
    {
        "count": 150,
        "next": "http://example.com/api/feedbacks/?page=3",
        "previous": "http://example.com/api/feedbacks/?page=1",
        "results": [...]
    }
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Customiza a resposta de paginação com informações adicionais.
        """
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('page_size', self.get_page_size(self.request)),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('results', data)
        ]))


class LargeResultsSetPagination(PageNumberPagination):
    """
    Paginação para listagens grandes (exports, relatórios).
    
    Configurações:
    - page_size: 100 itens por página
    - max_page_size: 500 itens
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


class SmallResultsSetPagination(PageNumberPagination):
    """
    Paginação para listagens pequenas (dashboards, widgets).
    
    Configurações:
    - page_size: 10 itens por página
    - max_page_size: 50 itens
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
