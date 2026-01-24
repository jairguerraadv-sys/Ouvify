from rest_framework import serializers
from .models import ConsentVersion, UserConsent


class ConsentVersionSerializer(serializers.ModelSerializer):
    """Serializer para versões de consentimento"""
    
    document_type_display = serializers.CharField(
        source='get_document_type_display',
        read_only=True
    )
    
    class Meta:
        model = ConsentVersion
        fields = [
            'id',
            'document_type',
            'document_type_display',
            'version',
            'content_url',
            'is_current',
            'is_required',
            'effective_date',
        ]


class UserConsentSerializer(serializers.ModelSerializer):
    """Serializer para consentimentos de usuário"""
    
    consent_version_details = ConsentVersionSerializer(
        source='consent_version',
        read_only=True
    )
    
    class Meta:
        model = UserConsent
        fields = [
            'id',
            'consent_version',
            'consent_version_details',
            'accepted',
            'accepted_at',
            'revoked',
            'revoked_at',
            'context',
        ]
        read_only_fields = ['accepted_at', 'revoked_at']


class AcceptConsentSerializer(serializers.Serializer):
    """Serializer para aceitar múltiplos consentimentos"""
    
    consents = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        required=True
    )
    email = serializers.EmailField(required=False, allow_null=True)
    
    def validate_consents(self, value):
        if not value:
            raise serializers.ValidationError("Pelo menos um consentimento é necessário")
        return value
