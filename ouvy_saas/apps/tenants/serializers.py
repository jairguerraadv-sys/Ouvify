from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client
import re


class ClientPublicSerializer(serializers.ModelSerializer):
    """
    Serializer público para informações do tenant.
    Retorna apenas dados seguros e necessários para o frontend.
    """
    class Meta:
        model = Client
        fields = ['nome', 'subdominio', 'cor_primaria', 'logo']
        # Todos os campos são apenas leitura (read-only)


class RegisterTenantSerializer(serializers.Serializer):
    """
    Serializer para registro de novo tenant (empresa) + usuário proprietário.
    """
    # Dados do Usuário
    nome = serializers.CharField(max_length=150, help_text="Nome completo do usuário")
    email = serializers.EmailField(help_text="Email corporativo")
    senha = serializers.CharField(
        write_only=True, 
        min_length=8,
        help_text="Senha (mínimo 8 caracteres)"
    )
    
    # Dados da Empresa
    nome_empresa = serializers.CharField(max_length=100, help_text="Nome da empresa")
    subdominio_desejado = serializers.SlugField(
        max_length=63,
        help_text="Subdomínio desejado (ex: minhaempresa)"
    )
    
    def validate_email(self, value):
        """Verifica se o email já está em uso."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value.lower()
    
    def validate_subdominio_desejado(self, value):
        """Valida o formato e disponibilidade do subdomínio."""
        # Validar formato
        if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', value):
            raise serializers.ValidationError(
                "Subdomínio deve conter apenas letras minúsculas, números e hífens. "
                "Não pode começar ou terminar com hífen."
            )
        
        # Verificar subdomínios reservados
        reserved = ['www', 'api', 'admin', 'app', 'dashboard', 'mail', 'smtp', 'ftp']
        if value in reserved:
            raise serializers.ValidationError(f"O subdomínio '{value}' está reservado.")
        
        # Verificar se já existe
        if Client.objects.filter(subdominio=value).exists():
            raise serializers.ValidationError("Este subdomínio já está em uso.")
        
        return value.lower()
    
    def validate_senha(self, value):
        """Valida a força da senha."""
        if len(value) < 8:
            raise serializers.ValidationError("A senha deve ter no mínimo 8 caracteres.")
        
        # Verificar se contém pelo menos uma letra e um número
        if not re.search(r'[A-Za-z]', value) or not re.search(r'\d', value):
            raise serializers.ValidationError(
                "A senha deve conter pelo menos uma letra e um número."
            )
        
        return value


class ClientSerializer(serializers.ModelSerializer):
    """Serializer para retornar dados do tenant."""
    
    class Meta:
        model = Client
        fields = ['id', 'nome', 'subdominio', 'logo', 'cor_primaria', 'data_criacao']
        read_only_fields = ['id', 'data_criacao']


class UserSerializer(serializers.ModelSerializer):
    """Serializer para retornar dados do usuário."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']


class TenantAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id',
            'nome',
            'subdominio',
            'ativo',
            'data_criacao',
        ]
        read_only_fields = ['id', 'data_criacao']

