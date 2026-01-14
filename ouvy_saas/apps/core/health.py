"""
Health check endpoint para monitoramento de infraestrutura.
Utilizado por ferramentas como Railway, Kubernetes, Load Balancers.
"""
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Endpoint simples de health check.
    
    GET /health/
    
    Retorna:
        200 OK: Sistema funcionando normalmente
        503 Service Unavailable: Problema detectado
    
    Verifica:
    - Conexão com banco de dados
    - Status do DEBUG mode
    """
    try:
        # Verificar conexão com banco de dados
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            db_status = "ok" if result == (1,) else "error"
        
        response_data = {
            "status": "healthy",
            "database": db_status,
            "debug_mode": settings.DEBUG
        }
        
        logger.debug("✅ Health check passed")
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        return JsonResponse({
            "status": "unhealthy",
            "database": "error",
            "error": str(e) if settings.DEBUG else "Database connection failed"
        }, status=503)


def readiness_check(request):
    """
    Endpoint de readiness check (mais completo que health).
    
    GET /ready/
    
    Usado por orquestradores para saber se o serviço está pronto
    para receber tráfego (ex: após deploy).
    """
    try:
        from apps.tenants.models import Client
        
        # Verificar se consegue fazer uma query simples
        tenant_count = Client.objects.count()
        
        # Verificar variáveis de ambiente críticas
        critical_vars = {
            "SECRET_KEY": bool(settings.SECRET_KEY),
            "DATABASE_URL": bool(settings.DATABASES.get('default', {}).get('NAME')),
        }
        
        all_ok = all(critical_vars.values()) and tenant_count >= 0
        
        response_data = {
            "status": "ready" if all_ok else "not_ready",
            "database": "ok",
            "tenant_count": tenant_count,
            "environment_vars": critical_vars
        }
        
        status_code = 200 if all_ok else 503
        return JsonResponse(response_data, status=status_code)
        
    except Exception as e:
        logger.error(f"❌ Readiness check failed: {str(e)}")
        return JsonResponse({
            "status": "not_ready",
            "error": str(e) if settings.DEBUG else "Service not ready"
        }, status=503)
