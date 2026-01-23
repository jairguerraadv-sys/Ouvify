"""
URLs para API de busca global
"""
from django.urls import path
from .views import GlobalSearchView, AutocompleteView, SearchByProtocolView

app_name = 'search'

urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('search/autocomplete/', AutocompleteView.as_view(), name='autocomplete'),
    path('search/protocol/<str:protocolo>/', SearchByProtocolView.as_view(), name='search-by-protocol'),
]
