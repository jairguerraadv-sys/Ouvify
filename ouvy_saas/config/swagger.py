"""
Configuração do Swagger/OpenAPI para documentação da API
"""

from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Ouvy API",
      default_version='v1',
      description="""
# Ouvy - API de Ouvidoria Digital

API RESTful completa para gerenciamento de feedbacks, denúncias e sugestões.

## Funcionalidades

- **Autenticação**: Token-based authentication
- **Multi-tenancy**: Suporte para múltiplos tenants isolados
- **Feedbacks**: CRUD completo de manifestações
- **Protocolos**: Sistema de rastreamento único
- **Rate Limiting**: Proteção contra abuso
- **LGPD Compliant**: Anonimização e privacidade

## Autenticação

A maioria dos endpoints requer autenticação via Token.

```bash
# Login
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "senha123"
}

# Resposta
{
  "token": "abc123...",
  "user": {...}
}

# Usar token nos requests
curl -H "Authorization: Token abc123..." /api/feedbacks/
```

## Rate Limiting

- **Anônimo**: 10 requests/min
- **Autenticado**: 100 requests/min

## Paginação

Resultados paginados com 20 items por página.

```json
{
  "count": 100,
  "next": "http://api/feedbacks/?page=2",
  "previous": null,
  "results": [...]
}
```
      """,
      terms_of_service="https://ouvy.com/terms/",
      contact=openapi.Contact(email="support@ouvy.com"),
      license=openapi.License(name="Proprietary"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

# URLs para documentação
swagger_urlpatterns = [
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]
