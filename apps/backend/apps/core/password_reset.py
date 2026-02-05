"""
Views para recuperação de senha.
"""

import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.core.throttling import PasswordResetConfirmThrottle

from .email_service import EmailService

logger = logging.getLogger(__name__)


class PasswordResetRateThrottle(AnonRateThrottle):
    """Rate limiting para password reset: 3 tentativas por hora por IP"""

    rate = "3/hour"


class PasswordResetRequestView(APIView):
    """
    Solicita reset de senha via email.

    POST /api/password-reset/request/
    Body: {
        "email": "usuario@example.com"
    }

    Rate Limit: 3 requisições por hora por IP (proteção contra força bruta)
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()

        if not email:
            return Response(
                {"detail": "Email é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email, is_active=True)

            # Gerar token de reset
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # URL do frontend para reset
            frontend_url = settings.BASE_URL
            reset_link = (
                f"{frontend_url}/recuperar-senha/confirmar?uid={uid}&token={token}"
            )

            # Enviar email usando o serviço centralizado
            email_sent = EmailService.send_password_reset(user, reset_link)

            # Mascarar email nos logs para segurança
            email_masked = f"{email[:3]}***@{email.split('@')[1]}"

            if email_sent:
                logger.info(f"✅ Email de recuperação enviado para {email_masked}")
            else:
                logger.warning(f"⚠️ Falha ao enviar email para {email_masked}")

        except User.DoesNotExist:
            # Por segurança, não revelar se o email existe ou não
            logger.warning(f"⚠️ Tentativa de reset para email não cadastrado: {email}")

        # Sempre retornar sucesso (por segurança)
        return Response(
            {
                "detail": "Se o email estiver cadastrado, você receberá instruções de recuperação.",
                "success": True,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    Confirma reset de senha com token.

    POST /api/password-reset/confirm/
    Body: {
        "uid": "encoded-user-id",
        "token": "password-reset-token",
        "new_password": "novaSenha123"
    }

    FASE 3: AL-003 - PasswordResetConfirmThrottle (10/hora) para prevenir brute force
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetConfirmThrottle]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not all([uid, token, new_password]):
            return Response(
                {"detail": "Todos os campos são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar senha com validadores do Django (strong password policy)
        try:
            validate_password(new_password)
        except DjangoValidationError as e:
            return Response(
                {
                    "detail": "Senha não atende aos requisitos de segurança",
                    "errors": list(e.messages),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Decodificar UID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)

            # Verificar token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"detail": "Token inválido ou expirado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Atualizar senha
            user.set_password(new_password)
            user.save()

            logger.info(f"✅ Senha resetada com sucesso para {user.email}")

            return Response(
                {"detail": "Senha alterada com sucesso!", "success": True},
                status=status.HTTP_200_OK,
            )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Link inválido ou expirado"},
                status=status.HTTP_400_BAD_REQUEST,
            )
