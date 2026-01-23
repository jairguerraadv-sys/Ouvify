"""
JWT Views Customizadas para Ouvy SaaS
Adiciona dados extras do usuário e tenant aos tokens JWT
"""

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer JWT customizado que adiciona dados extras do usuário e tenant
    na resposta do token.
    """
    
    def validate(self, attrs):
        # Obter tokens padrão (access + refresh)
        data = super().validate(attrs)
        
        # Adicionar dados do usuário na resposta
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        
        # Adicionar dados do tenant se existir
        # Verifica se usuário é owner de algum tenant
        if hasattr(self.user, 'client_owner'):
            tenant = self.user.client_owner.first()
            if tenant:
                data['tenant'] = {
                    'id': tenant.id,
                    'nome': tenant.nome,
                    'subdominio': tenant.subdominio,
                    'plano': tenant.plano,
                    'ativo': tenant.ativo,
                    'logo': tenant.logo.url if tenant.logo else None,
                    'cor_primaria': tenant.cor_primaria,
                }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View JWT customizada que usa o serializer customizado.
    
    Endpoint: POST /api/token/
    Body: {"username": "email@example.com", "password": "senha123"}
    Response: {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "user": {...},
        "tenant": {...}
    }
    """
    serializer_class = CustomTokenObtainPairSerializer
