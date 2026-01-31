"""
Views para logout com invalidação de token.

ATUALIZADO: Auditoria 30/01/2026
- Adicionado blacklist de JWT (simplejwt)
- Invalida tanto DRF Token quanto JWT
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
import logging

logger = logging.getLogger(__name__)


class LogoutView(APIView):
    """
    Endpoint para logout com invalidação de token no servidor.
    
    DELETE /api/logout/
    POST /api/logout/
    
    Headers: 
        Authorization: Token <token>
        ou
        Authorization: Bearer <jwt_access_token>
    
    Body (opcional para JWT):
        {
            "refresh": "<refresh_token>"
        }
    
    ATUALIZADO: Auditoria 30/01/2026
    - Agora invalida DRF Token E adiciona JWT à blacklist
    - Suporta invalidação de todos os tokens do usuário
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout via POST"""
        user = request.user
        errors = []
        success_messages = []
        
        try:
            # 1. Invalidar DRF Token (se existir)
            try:
                token = Token.objects.get(user=user)
                token.delete()
                success_messages.append("DRF Token invalidado")
                logger.info(f"✅ DRF Token deletado | User: {user.username}")
            except Token.DoesNotExist:
                pass  # Usuário pode estar usando apenas JWT
            
            # 2. Blacklist JWT Refresh Token (se fornecido)
            refresh_token = request.data.get('refresh')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                    success_messages.append("JWT Refresh Token adicionado à blacklist")
                    logger.info(f"✅ JWT Refresh Token blacklisted | User: {user.username}")
                except Exception as e:
                    errors.append(f"Erro ao invalidar refresh token: {str(e)}")
                    logger.warning(f"⚠️ Erro ao blacklist JWT | User: {user.username} | Error: {e}")
            
            # 3. Opção: Invalidar TODOS os tokens do usuário
            invalidate_all = request.data.get('invalidate_all', False)
            if invalidate_all:
                try:
                    # Buscar todos os outstanding tokens do usuário
                    outstanding_tokens = OutstandingToken.objects.filter(user=user)
                    blacklisted_count = 0
                    
                    for outstanding_token in outstanding_tokens:
                        # Verificar se já está na blacklist
                        if not BlacklistedToken.objects.filter(token=outstanding_token).exists():
                            BlacklistedToken.objects.create(token=outstanding_token)
                            blacklisted_count += 1
                    
                    if blacklisted_count > 0:
                        success_messages.append(f"{blacklisted_count} tokens adicionados à blacklist")
                        logger.info(f"✅ {blacklisted_count} tokens blacklisted | User: {user.username}")
                    
                except Exception as e:
                    errors.append(f"Erro ao invalidar todos os tokens: {str(e)}")
                    logger.error(f"❌ Erro ao invalidar todos tokens | User: {user.username} | Error: {e}")
            
            # Resposta de sucesso
            logger.info(f"✅ Logout realizado com sucesso | User: {user.username}")
            
            return Response(
                {
                    "message": "Logout realizado com sucesso",
                    "details": success_messages,
                    "warnings": errors if errors else None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"❌ Erro ao fazer logout | User: {user.username} | Error: {str(e)}")
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


class LogoutAllDevicesView(APIView):
    """
    Endpoint para logout de todos os dispositivos.
    
    POST /api/logout/all/
    
    Invalida TODOS os tokens (DRF e JWT) do usuário,
    forçando re-login em todos os dispositivos.
    
    NOVO: Auditoria 30/01/2026
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout de todos os dispositivos."""
        user = request.user
        
        try:
            # 1. Deletar DRF Token
            Token.objects.filter(user=user).delete()
            
            # 2. Blacklist todos os JWT tokens
            outstanding_tokens = OutstandingToken.objects.filter(user=user)
            blacklisted_count = 0
            
            for outstanding_token in outstanding_tokens:
                if not BlacklistedToken.objects.filter(token=outstanding_token).exists():
                    BlacklistedToken.objects.create(token=outstanding_token)
                    blacklisted_count += 1
            
            logger.info(
                f"✅ Logout de todos os dispositivos | "
                f"User: {user.username} | "
                f"Tokens blacklisted: {blacklisted_count}"
            )
            
            return Response(
                {
                    "message": "Logout realizado em todos os dispositivos",
                    "tokens_invalidated": blacklisted_count
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"❌ Erro no logout de todos dispositivos | User: {user.username} | Error: {e}")
            return Response(
                {
                    "detail": "Erro ao fazer logout",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
