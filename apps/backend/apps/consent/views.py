from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import ConsentLog, ConsentVersion, UserConsent
from .serializers import (
    AcceptConsentSerializer,
    ConsentVersionSerializer,
    UserConsentSerializer,
)


class ConsentVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """Endpoint para obter versões atuais dos termos"""

    queryset = ConsentVersion.objects.filter(is_current=True)
    serializer_class = ConsentVersionSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def required(self, request):
        """Retorna apenas os consentimentos obrigatórios"""
        required = self.queryset.filter(is_required=True)
        serializer = self.get_serializer(required, many=True)
        return Response(serializer.data)


class UserConsentViewSet(viewsets.ModelViewSet):
    """Endpoint para gerenciar consentimentos de usuário"""

    serializer_class = UserConsentSerializer

    def get_permissions(self):
        if self.action in ["accept_anonymous"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return UserConsent.objects.filter(user=self.request.user)
        return UserConsent.objects.none()

    @action(detail=False, methods=["post"])
    def accept(self, request):
        """Aceitar consentimentos (usuário autenticado)"""
        serializer = AcceptConsentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        consents_data = serializer.validated_data["consents"]
        accepted_consents = []

        for consent_data in consents_data:
            try:
                consent_version = ConsentVersion.objects.get(
                    document_type=consent_data["document_type"],
                    version=consent_data.get("version", "1.0"),
                    is_current=True,
                )

                # Criar ou atualizar consentimento
                user_consent, created = UserConsent.objects.get_or_create(
                    user=request.user,
                    consent_version=consent_version,
                    defaults={
                        "ip_address": self._get_client_ip(request),
                        "user_agent": request.META.get("HTTP_USER_AGENT", "")[:500],
                        "context": "signup",
                    },
                )

                # Se não foi criado agora, atualizar o context
                if not created:
                    user_consent.context = "update"
                    user_consent.save()

                user_consent.accept()

                # Log de auditoria
                ConsentLog.objects.create(
                    user_consent=user_consent,
                    action="accept",
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                )

                accepted_consents.append(user_consent)

            except ConsentVersion.DoesNotExist:
                continue

        serializer = UserConsentSerializer(accepted_consents, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def accept_anonymous(self, request):
        """Aceitar consentimentos (usuário anônimo - feedback)"""
        serializer = AcceptConsentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        consents_data = serializer.validated_data["consents"]
        accepted_consents = []

        for consent_data in consents_data:
            try:
                consent_version = ConsentVersion.objects.get(
                    document_type=consent_data["document_type"],
                    version=consent_data.get("version", "1.0"),
                    is_current=True,
                )

                user_consent = UserConsent.objects.create(
                    email=email,
                    consent_version=consent_version,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                    context="feedback",
                )

                user_consent.accept()

                # Log de auditoria
                ConsentLog.objects.create(
                    user_consent=user_consent,
                    action="accept",
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                )

                accepted_consents.append(user_consent)

            except ConsentVersion.DoesNotExist:
                continue

        serializer = UserConsentSerializer(accepted_consents, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        """Revogar consentimento"""
        user_consent = self.get_object()
        user_consent.revoke()

        # Log de auditoria
        ConsentLog.objects.create(
            user_consent=user_consent,
            action="revoke",
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        )

        serializer = self.get_serializer(user_consent)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Verificar se há consentimentos pendentes"""
        current_versions = ConsentVersion.objects.filter(
            is_current=True, is_required=True
        )

        pending = []
        for version in current_versions:
            has_consent = UserConsent.objects.filter(
                user=request.user, consent_version=version, accepted=True, revoked=False
            ).exists()

            if not has_consent:
                pending.append(version)

        serializer = ConsentVersionSerializer(pending, many=True)
        return Response(
            {"has_pending": len(pending) > 0, "pending_consents": serializer.data}
        )

    def _get_client_ip(self, request):
        """Obter IP do cliente"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR", "127.0.0.1")
        return ip
