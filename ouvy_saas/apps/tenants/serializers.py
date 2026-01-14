from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client
from apps.core.validators import validate_subdomain, validate_strong_password
from apps.core.utils import is_reserved_subdomain
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
        """Verifica se o email já está em uso e valida domínio."""
        value = value.lower().strip()
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        
        # Validação básica de formato
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Formato de email inválido.")
        
        # Validar contra domínios temporários/descartáveis
        disposable_domains = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org',
            'fakeinbox.com', 'yopmail.com', 'maildrop.cc'
        ]
        domain = value.split('@')[1].lower()
        if domain in disposable_domains:
            raise serializers.ValidationError(
                "Email temporário não permitido. Use um email permanente."
            )
        
        return value
    
    def validate_subdominio_desejado(self, value):
        """Valida o formato e disponibilidade do subdomínio."""
        value = value.lower().strip()
        
        # Usar validator do core
        try:
            validate_subdomain(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        # Verificar se já existe
        if Client.objects.filter(subdominio=value).exists():
            raise serializers.ValidationError("Este subdomínio já está em uso.")
        
        return value
    
    def validate_senha(self, value):
        """Valida a força da senha usando validator do core."""
        try:
            validate_strong_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value
    
    def validate_nome(self, value):
        """Valida o nome do usuário."""
        value = value.strip()
        
        if len(value) < 3:
            raise serializers.ValidationError("Nome deve ter no mínimo 3 caracteres.")
        
        # Verificar se tem pelo menos nome e sobrenome
        parts = value.split()
        if len(parts) < 2:
            raise serializers.ValidationError("Por favor, informe nome e sobrenome.")
        
        return value
    
    def validate_nome_empresa(self, value):
        """Valida o nome da empresa."""
        value = value.strip()
        
        if len(value) < 3:
            raise serializers.ValidationError("Nome da empresa deve ter no mínimo 3 caracteres.")
        
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

