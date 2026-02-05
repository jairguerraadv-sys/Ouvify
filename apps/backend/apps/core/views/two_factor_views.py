"""
Views da API de Two-Factor Authentication (2FA)
"""

import logging

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.throttling import TwoFactorSetupThrottle, TwoFactorVerifyThrottle

from ..two_factor_service import TwoFactorAuthService

logger = logging.getLogger(__name__)


class TwoFactorSetupView(APIView):
    """
    Inicia configuração de 2FA para o usuário

    Retorna secret TOTP, QR code e códigos de backup
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [TwoFactorSetupThrottle]

    @extend_schema(
        operation_id="2fa_setup",
        summary="Iniciar configuração de 2FA",
        description="Gera secret TOTP, QR code para apps autenticadores e códigos de backup",
        responses={
            200: {
                "description": "Dados de configuração de 2FA",
                "content": {
                    "application/json": {
                        "example": {
                            "secret": "JBSWY3DPEHPK3PXP",
                            "qr_code": "data:image/png;base64,iVBORw0KGgo...",
                            "backup_codes": ["A1B2-C3D4", "E5F6-G7H8", "..."],
                            "message": "Escaneie o QR code com seu app autenticador",
                        }
                    }
                },
            },
            400: {"description": "2FA já está habilitado"},
        },
        tags=["2FA"],
    )
    def post(self, request):
        """Inicia configuração de 2FA"""
        user = request.user

        # Verificar se já tem 2FA habilitado
        if getattr(user, "two_factor_enabled", False):
            return Response(
                {
                    "error": "2FA já está habilitado. Desabilite primeiro para reconfigurar."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = TwoFactorAuthService(user)
            setup_result = service.setup_2fa()

            # Armazenar temporariamente o secret para confirmação
            # (não salvar no modelo até confirmar)
            request.session["pending_2fa_secret"] = setup_result.secret
            request.session["pending_2fa_backup_codes"] = setup_result.backup_codes

            return Response(
                {
                    "secret": setup_result.secret,
                    "qr_code": f"data:image/png;base64,{setup_result.qr_code_base64}",
                    "backup_codes": setup_result.backup_codes,
                    "message": "Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.)",
                }
            )

        except Exception as e:
            logger.error(f"Erro ao configurar 2FA: {e}")
            return Response(
                {"error": "Erro ao configurar 2FA"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TwoFactorConfirmView(APIView):
    """
    Confirma configuração de 2FA verificando o primeiro código
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [TwoFactorVerifyThrottle]

    @extend_schema(
        operation_id="2fa_confirm",
        summary="Confirmar configuração de 2FA",
        description="Verifica o primeiro código TOTP para ativar 2FA",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Código de 6 dígitos do app autenticador",
                        "example": "123456",
                    }
                },
                "required": ["code"],
            }
        },
        responses={
            200: {"description": "2FA habilitado com sucesso"},
            400: {"description": "Código inválido ou setup não iniciado"},
        },
        tags=["2FA"],
    )
    def post(self, request):
        """Confirma configuração de 2FA"""
        user = request.user
        code = request.data.get("code", "").strip()

        # Verificar se tem setup pendente
        pending_secret = request.session.get("pending_2fa_secret")
        pending_backup_codes = request.session.get("pending_2fa_backup_codes")

        if not pending_secret or not pending_backup_codes:
            return Response(
                {
                    "error": "Nenhuma configuração de 2FA pendente. Inicie o processo novamente."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar código
        if not code or len(code) != 6 or not code.isdigit():
            return Response(
                {"error": "Código inválido. Digite os 6 dígitos do app autenticador."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar código TOTP
        service = TwoFactorAuthService(user)
        result = service.verify_totp(code, pending_secret)

        if result.success:
            # Habilitar 2FA
            try:
                # Verificar se modelo tem campos de 2FA
                if hasattr(user, "two_factor_enabled"):
                    user.two_factor_enabled = True
                    user.two_factor_secret = pending_secret
                    user.two_factor_backup_codes = service.hash_backup_codes(
                        pending_backup_codes
                    )
                    user.two_factor_confirmed_at = timezone.now()
                    user.save()

                # Limpar sessão
                del request.session["pending_2fa_secret"]
                del request.session["pending_2fa_backup_codes"]

                logger.info(f"2FA habilitado para usuário {user.id}")

                return Response(
                    {
                        "message": "2FA habilitado com sucesso!",
                        "backup_codes_count": len(pending_backup_codes),
                    }
                )

            except AttributeError:
                # Modelo User não tem campos de 2FA ainda
                return Response(
                    {"error": "Campos de 2FA não configurados no modelo User"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(
            {"error": result.message, "remaining_attempts": result.remaining_attempts},
            status=status.HTTP_400_BAD_REQUEST,
        )


class TwoFactorVerifyView(APIView):
    """
    Verifica código 2FA durante login
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [TwoFactorVerifyThrottle]

    @extend_schema(
        operation_id="2fa_verify",
        summary="Verificar código 2FA",
        description="Verifica código TOTP ou backup durante login",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Código TOTP (6 dígitos) ou código de backup (XXXX-XXXX)",
                        "example": "123456",
                    }
                },
                "required": ["code"],
            }
        },
        responses={
            200: {"description": "Código verificado com sucesso"},
            400: {"description": "Código inválido"},
        },
        tags=["2FA"],
    )
    def post(self, request):
        """Verifica código 2FA"""
        user = request.user
        code = request.data.get("code", "").strip()

        if not code:
            return Response(
                {"error": "Código é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se 2FA está habilitado
        if not getattr(user, "two_factor_enabled", False):
            return Response(
                {
                    "message": "2FA não está habilitado para este usuário",
                    "two_factor_required": False,
                }
            )

        # Verificar código
        if hasattr(user, "verify_2fa_code"):
            result = user.verify_2fa_code(code)
        else:
            service = TwoFactorAuthService(user)

            # Tentar como TOTP
            if len(code) == 6 and code.isdigit():
                secret = getattr(user, "two_factor_secret", "")
                result = service.verify_totp(code, secret)
            else:
                # Tentar como backup code
                backup_codes = getattr(user, "two_factor_backup_codes", "")
                if backup_codes:
                    success, new_hash = service.verify_backup_code(code, backup_codes)
                    if success:
                        user.two_factor_backup_codes = new_hash
                        user.save(update_fields=["two_factor_backup_codes"])
                        result = type(
                            "obj",
                            (object,),
                            {"success": True, "message": "Código de backup verificado"},
                        )()
                    else:
                        result = type(
                            "obj",
                            (object,),
                            {
                                "success": False,
                                "message": "Código inválido",
                                "remaining_attempts": service._get_remaining_attempts(),
                            },
                        )()
                else:
                    result = type(
                        "obj",
                        (object,),
                        {"success": False, "message": "Código inválido"},
                    )()

        if result.success:
            return Response({"message": result.message, "verified": True})

        return Response(
            {
                "error": result.message,
                "verified": False,
                "remaining_attempts": getattr(result, "remaining_attempts", None),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class TwoFactorDisableView(APIView):
    """
    Desabilita 2FA para o usuário
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="2fa_disable",
        summary="Desabilitar 2FA",
        description="Desabilita 2FA após verificar a senha atual",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "password": {
                        "type": "string",
                        "description": "Senha atual para confirmar",
                        "example": "sua_senha_atual",
                    },
                    "code": {
                        "type": "string",
                        "description": "Código 2FA atual (TOTP ou backup)",
                        "example": "123456",
                    },
                },
                "required": ["password", "code"],
            }
        },
        responses={
            200: {"description": "2FA desabilitado com sucesso"},
            400: {"description": "Senha ou código inválido"},
        },
        tags=["2FA"],
    )
    def post(self, request):
        """Desabilita 2FA"""
        user = request.user
        password = request.data.get("password", "")
        code = request.data.get("code", "").strip()

        # Verificar se 2FA está habilitado
        if not getattr(user, "two_factor_enabled", False):
            return Response(
                {"error": "2FA não está habilitado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar senha
        if not user.check_password(password):
            return Response(
                {"error": "Senha incorreta"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar código 2FA
        service = TwoFactorAuthService(user)
        secret = getattr(user, "two_factor_secret", "")
        result = service.verify_totp(code, secret)

        if not result.success:
            # Tentar backup code
            backup_codes = getattr(user, "two_factor_backup_codes", "")
            if backup_codes:
                success, _ = service.verify_backup_code(code, backup_codes)
                if not success:
                    return Response(
                        {
                            "error": "Código inválido",
                            "remaining_attempts": result.remaining_attempts,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                return Response(
                    {
                        "error": result.message,
                        "remaining_attempts": result.remaining_attempts,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Desabilitar 2FA
        try:
            if hasattr(user, "disable_2fa"):
                user.disable_2fa()
            else:
                user.two_factor_enabled = False
                user.two_factor_secret = None
                user.two_factor_backup_codes = None
                user.two_factor_confirmed_at = None
                user.save()

            logger.info(f"2FA desabilitado para usuário {user.id}")

            return Response({"message": "2FA desabilitado com sucesso"})

        except Exception as e:
            logger.error(f"Erro ao desabilitar 2FA: {e}")
            return Response(
                {"error": "Erro ao desabilitar 2FA"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TwoFactorStatusView(APIView):
    """
    Retorna status de 2FA do usuário
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="2fa_status",
        summary="Status de 2FA",
        description="Retorna status atual de 2FA do usuário",
        responses={
            200: {
                "description": "Status de 2FA",
                "content": {
                    "application/json": {
                        "example": {
                            "enabled": True,
                            "confirmed_at": "2024-01-15T10:30:00Z",
                            "backup_codes_remaining": 8,
                        }
                    }
                },
            }
        },
        tags=["2FA"],
    )
    def get(self, request):
        """Retorna status de 2FA"""
        user = request.user

        enabled = getattr(user, "two_factor_enabled", False)
        confirmed_at = getattr(user, "two_factor_confirmed_at", None)

        # Contar códigos de backup restantes
        backup_codes_remaining = 0
        if enabled and hasattr(user, "two_factor_backup_codes"):
            if hasattr(user, "get_remaining_backup_codes_count"):
                backup_codes_remaining = user.get_remaining_backup_codes_count()
            elif user.two_factor_backup_codes:
                service = TwoFactorAuthService(user)
                try:
                    codes = service._decode_backup_codes(user.two_factor_backup_codes)
                    backup_codes_remaining = len([c for c in codes if c])
                except Exception:
                    pass

        return Response(
            {
                "enabled": enabled,
                "confirmed_at": confirmed_at.isoformat() if confirmed_at else None,
                "backup_codes_remaining": backup_codes_remaining,
            }
        )


class TwoFactorRegenerateBackupCodesView(APIView):
    """
    Regenera códigos de backup
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [TwoFactorSetupThrottle]

    @extend_schema(
        operation_id="2fa_regenerate_backup",
        summary="Regenerar códigos de backup",
        description="Gera novos códigos de backup (invalida os anteriores)",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Código 2FA atual para confirmar",
                        "example": "123456",
                    }
                },
                "required": ["code"],
            }
        },
        responses={
            200: {
                "description": "Novos códigos de backup gerados",
                "content": {
                    "application/json": {
                        "example": {
                            "backup_codes": ["A1B2-C3D4", "E5F6-G7H8", "..."],
                            "message": "Novos códigos gerados. Os anteriores foram invalidados.",
                        }
                    }
                },
            }
        },
        tags=["2FA"],
    )
    def post(self, request):
        """Regenera códigos de backup"""
        user = request.user
        code = request.data.get("code", "").strip()

        # Verificar se 2FA está habilitado
        if not getattr(user, "two_factor_enabled", False):
            return Response(
                {"error": "2FA não está habilitado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar código atual
        service = TwoFactorAuthService(user)
        secret = getattr(user, "two_factor_secret", "")
        result = service.verify_totp(code, secret)

        if not result.success:
            return Response(
                {
                    "error": result.message,
                    "remaining_attempts": result.remaining_attempts,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Gerar novos códigos
        new_codes = service.generate_backup_codes()

        # Salvar
        user.two_factor_backup_codes = service.hash_backup_codes(new_codes)
        user.save(update_fields=["two_factor_backup_codes"])

        logger.info(f"Códigos de backup regenerados para usuário {user.id}")

        return Response(
            {
                "backup_codes": new_codes,
                "message": "Novos códigos gerados. Guarde-os em local seguro. Os anteriores foram invalidados.",
            }
        )
