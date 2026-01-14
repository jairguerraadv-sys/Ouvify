"""
Views para recuperação de senha.
"""
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class PasswordResetRequestView(APIView):
    """
    Solicita reset de senha via email.
    
    POST /api/password-reset/request/
    Body: {
        "email": "usuario@example.com"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        
        if not email:
            return Response(
                {"detail": "Email é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Gerar token de reset
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # URL do frontend para reset
            frontend_url = settings.BASE_URL
            reset_link = f"{frontend_url}/recuperar-senha/confirmar?uid={uid}&token={token}"
            
            # Enviar email (implementar em produção com provedor real)
            try:
                # TODO: Configurar SMTP em produção
                subject = 'Recuperação de Senha - Ouvy'
                message = f"""
Olá {user.first_name or user.username},

Você solicitou a recuperação de senha da sua conta Ouvy.

Clique no link abaixo para criar uma nova senha:
{reset_link}

Este link expira em 24 horas.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Ouvy
                """
                
                # Em desenvolvimento, apenas log
                if settings.DEBUG:
                    logger.info(f"🔗 Link de recuperação: {reset_link}")
                    logger.info(f"📧 Email seria enviado para: {email}")
                else:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=False,
                    )
                
                logger.info(f"✅ Email de recuperação enviado para {email}")
                
            except Exception as e:
                logger.error(f"❌ Erro ao enviar email: {str(e)}")
                # Não revelar erro ao usuário por segurança
        
        except User.DoesNotExist:
            # Por segurança, não revelar se o email existe ou não
            logger.warning(f"⚠️ Tentativa de reset para email não cadastrado: {email}")
        
        # Sempre retornar sucesso (por segurança)
        return Response(
            {
                "detail": "Se o email estiver cadastrado, você receberá instruções de recuperação.",
                "success": True
            },
            status=status.HTTP_200_OK
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
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response(
                {"detail": "Todos os campos são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar senha
        if len(new_password) < 6:
            return Response(
                {"detail": "A senha deve ter no mínimo 6 caracteres"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decodificar UID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
            
            # Verificar token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"detail": "Token inválido ou expirado"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Atualizar senha
            user.set_password(new_password)
            user.save()
            
            logger.info(f"✅ Senha resetada com sucesso para {user.email}")
            
            return Response(
                {
                    "detail": "Senha alterada com sucesso!",
                    "success": True
                },
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Link inválido ou expirado"},
                status=status.HTTP_400_BAD_REQUEST
            )
