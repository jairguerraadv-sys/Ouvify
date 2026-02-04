"""
Configuração do OpenAPI/Swagger para documentação da API
Usa drf-spectacular para geração automática de schema OpenAPI 3.0
"""

from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# URLs para documentação da API
swagger_urlpatterns = [
    # Schema OpenAPI 3.0 em JSON
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Swagger UI (interface interativa)
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    # ReDoc (documentação elegante)
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
