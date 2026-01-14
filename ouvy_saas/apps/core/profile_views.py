"""
Views para gerenciamento de perfil do usuário.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserUpdateSerializer
import logging

logger = logging.getLogger(__name__)


class UserProfileUpdateView(APIView):
    """
    API para gerenciar perfil do usuário autenticado.
    
    GET /api/auth/me/
    - Retorna dados do usuário atual
    
    PATCH /api/auth/me/
    - Atualiza dados do usuário
    - Body: { "nome": "João Silva", "telefone": "(11) 98765-4321", "cargo": "Gerente" }
    
    Permissões:
    - IsAuthenticated (apenas usuários logados)
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna dados do usuário atual.
        
        Response:
        {
            "id": 1,
            "nome": "João Silva",
            "email": "joao@empresa.com",
            "telefone": "(11) 98765-4321",
            "cargo": "Gerente"
        }
        """
        serializer = UserUpdateSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """
        Atualiza dados do usuário.
        
        Campos atualizáveis:
        - nome (obrigatório, mínimo 3 caracteres)
        - telefone (opcional, formato brasileiro)
        - cargo (opcional)
        
        Email NÃO pode ser alterado por segurança.
        """
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True  # Permite atualização parcial
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"Perfil atualizado com sucesso: {request.user.email}",
                extra={
                    'user_id': request.user.id,
                    'updated_fields': list(request.data.keys())
                }
            )
            return Response(serializer.data)
        
        logger.warning(
            f"Erro ao atualizar perfil: {request.user.email}",
            extra={
                'user_id': request.user.id,
                'errors': serializer.errors
            }
        )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
