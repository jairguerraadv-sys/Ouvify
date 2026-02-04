"""
Serializers para o app core.
"""

import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de perfil do usuário.

    Permite atualizar:
    - nome
    - telefone
    - cargo

    Email é read-only por questões de segurança.
    """

    class Meta:
        model = User
        fields = ["id", "nome", "email", "telefone", "cargo"]
        read_only_fields = ["id", "email"]  # Email não deve ser alterado

    def validate_telefone(self, value):
        """
        Valida formato de telefone brasileiro.
        Aceita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        """
        if not value:
            return value

        # Remove espaços extras
        value = value.strip()

        # Regex para telefone brasileiro
        pattern = r"^\(\d{2}\)\s\d{4,5}-\d{4}$"

        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX"
            )

        return value

    def validate_nome(self, value):
        """Valida que o nome não está vazio e tem tamanho mínimo."""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Nome deve ter pelo menos 3 caracteres")
        return value.strip()
