from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def home(request):
    """
    Rota raiz para teste de multi-tenancy.
    Retorna informações básicas do sistema.
    """
    return Response(
        {
            "message": "Ouvify SaaS - API Online",
            "version": "1.0.0",
            "status": "operational",
            "tenant_mode": "enabled",
        }
    )
