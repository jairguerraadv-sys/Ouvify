"""
Views para logout com invalidação de token.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
import logging

logger = logging.getLogger(__name__)


class LogoutView(APIView):
    """
    Endpoint para logout com invalidação de token no servidor.
    
    DELETE /api/logout/
    Headers: Authorization: Token <token>
    
    Remove o token do banco de dados, garantindo que não possa ser reutilizado.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout via POST (mais comum em APIs REST)"""
        try:
            # Buscar e deletar o token do usuário atual
            token = Token.objects.get(user=request.user)
            token.delete()
            
            logger.info(f"✅ Logout realizado com sucesso | User: {request.user.username}")
            
            return Response(
                {
                    "message": "Logout realizado com sucesso",
                    "detail": "Token invalidado"
                },
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            # Token já foi removido anteriormente
            logger.warning(f"⚠️ Token já estava invalidado | User: {request.user.username}")
            return Response(
                {
                    "message": "Logout realizado",
                    "detail": "Token já estava invalidado"
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"❌ Erro ao fazer logout | User: {request.user.username} | Error: {str(e)}")
            return Response(
                {
                    "detail": "Erro ao fazer logout",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """Logout via DELETE (método alternativo)"""
        return self.post(request)
