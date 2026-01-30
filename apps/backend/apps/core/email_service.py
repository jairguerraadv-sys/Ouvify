"""
Serviço de Email centralizado para o Ouvify.

Suporta múltiplos provedores:
- SendGrid
- AWS SES
- Mailgun
- SMTP genérico

Configuração via variáveis de ambiente.
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags, escape
from typing import Optional, List
import logging
import re

logger = logging.getLogger(__name__)


def _sanitize_email_content(content: str) -> str:
    """Sanitiza conteúdo de email contra XSS em clientes de email."""
    if not content:
        return ''
    # Escapar caracteres HTML perigosos
    return escape(content)


def _validate_email(email: str) -> bool:
    """Valida formato de email."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


class EmailService:
    """
    Serviço centralizado para envio de emails.
    
    Uso:
        from apps.core.email_service import EmailService
        
        EmailService.send_password_reset(user, reset_link)
        EmailService.send_feedback_notification(tenant, feedback)
    """
    
    @staticmethod
    def send_email(
        subject: str,
        message: str,
        recipient_list: List[str],
        html_message: Optional[str] = None,
        from_email: Optional[str] = None,
        fail_silently: bool = False
    ) -> bool:
        """
        Envia um email.
        
        Args:
            subject: Assunto do email
            message: Corpo em texto puro
            recipient_list: Lista de destinatários
            html_message: Corpo em HTML (opcional)
            from_email: Remetente (usa DEFAULT_FROM_EMAIL se não informado)
            fail_silently: Se True, não levanta exceção em caso de erro
            
        Returns:
            bool: True se enviado com sucesso
        """
        from_email = from_email or settings.DEFAULT_FROM_EMAIL
        
        # Validar lista de destinatários
        valid_recipients = [email for email in recipient_list if _validate_email(email)]
        if not valid_recipients:
            logger.warning("⚠️ Nenhum email válido na lista de destinatários")
            return False
        
        try:
            if html_message:
                # Enviar email com versão HTML e texto
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,
                    from_email=from_email,
                    to=recipient_list
                )
                email.attach_alternative(html_message, "text/html")
                email.send(fail_silently=fail_silently)
            else:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=recipient_list,
                    fail_silently=fail_silently
                )
            
            logger.info(f"✅ Email enviado: {subject} para {len(recipient_list)} destinatário(s)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar email: {str(e)}")
            if not fail_silently:
                raise
            return False
    
    @staticmethod
    def send_password_reset(user, reset_link: str) -> bool:
        """
        Envia email de recuperação de senha.
        
        Args:
            user: Objeto User do Django
            reset_link: Link para reset de senha
            
        Returns:
            bool: True se enviado com sucesso
        """
        subject = "🔐 Recuperação de Senha - Ouvify"
        
        # Versão texto
        message = f"""
Olá {user.first_name or user.username},

Você solicitou a recuperação de senha da sua conta Ouvify.

Clique no link abaixo para criar uma nova senha:
{reset_link}

⚠️ Este link expira em 24 horas.

Se você não solicitou esta recuperação, ignore este email.
Sua conta permanece segura.

Atenciosamente,
Equipe Ouvify
---
Este é um email automático, não responda.
        """
        
        # Versão HTML
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperação de Senha</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px;">Olá <strong>{user.first_name or user.username}</strong>,</p>
        
        <p style="font-size: 16px;">Você solicitou a recuperação de senha da sua conta Ouvify.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;">
                Redefinir Minha Senha
            </a>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;"><strong>⚠️ Atenção:</strong> Este link expira em 24 horas.</p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">
            Se você não solicitou esta recuperação, ignore este email. Sua conta permanece segura.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Este é um email automático enviado pela plataforma Ouvify.<br>
            Por favor, não responda a este email.
        </p>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(
            subject=subject,
            message=message.strip(),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=True
        )
    
    @staticmethod
    def send_new_feedback_notification(tenant, feedback) -> bool:
        """
        Notifica o tenant sobre um novo feedback recebido.
        
        Args:
            tenant: Objeto Client (tenant)
            feedback: Objeto Feedback
            
        Returns:
            bool: True se enviado com sucesso
        """
        if not tenant.owner or not tenant.owner.email:
            logger.warning(f"⚠️ Tenant {tenant.nome} não possui owner com email")
            return False
        
        subject = f"📬 Novo Feedback Recebido - {feedback.get_tipo_display()}"
        
        message = f"""
Olá {tenant.owner.first_name or tenant.nome},

Um novo feedback foi registrado na sua plataforma Ouvify:

📋 Protocolo: {feedback.protocolo}
📌 Tipo: {feedback.get_tipo_display()}
📝 Título: {feedback.titulo}
📅 Data: {feedback.data_criacao.strftime('%d/%m/%Y às %H:%M')}

Acesse o painel para visualizar os detalhes:
{settings.BASE_URL}/dashboard/feedbacks/{feedback.protocolo}

Atenciosamente,
Equipe Ouvify
        """
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📬 Novo Feedback Recebido</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p>Olá <strong>{tenant.owner.first_name or tenant.nome}</strong>,</p>
        
        <p>Um novo feedback foi registrado:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📋 Protocolo:</strong> <code style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">{feedback.protocolo}</code></p>
            <p style="margin: 5px 0;"><strong>📌 Tipo:</strong> {feedback.get_tipo_display()}</p>
            <p style="margin: 5px 0;"><strong>📝 Título:</strong> {feedback.titulo}</p>
            <p style="margin: 5px 0;"><strong>📅 Data:</strong> {feedback.data_criacao.strftime('%d/%m/%Y às %H:%M')}</p>
        </div>
        
        <div style="text-align: center;">
            <a href="{settings.BASE_URL}/dashboard/feedbacks/{feedback.protocolo}" 
               style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ver Detalhes
            </a>
        </div>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(
            subject=subject,
            message=message.strip(),
            recipient_list=[tenant.owner.email],
            html_message=html_message,
            fail_silently=True
        )
    
    @staticmethod
    def send_feedback_response_notification(feedback, response_message: str) -> bool:
        """
        Notifica o usuário que enviou o feedback sobre uma resposta.
        
        Args:
            feedback: Objeto Feedback
            response_message: Mensagem de resposta
            
        Returns:
            bool: True se enviado com sucesso
        """
        if not feedback.email_contato:
            logger.info(f"ℹ️ Feedback {feedback.protocolo} não possui email de contato")
            return False
        
        subject = f"📩 Resposta ao seu Feedback - {feedback.protocolo}"
        
        message = f"""
Olá,

Sua solicitação (protocolo {feedback.protocolo}) recebeu uma atualização:

---
{response_message}
---

Acompanhe o status completo em:
{settings.BASE_URL}/acompanhar?protocolo={feedback.protocolo}

Atenciosamente,
{feedback.client.nome}
        """
        
        return EmailService.send_email(
            subject=subject,
            message=message.strip(),
            recipient_list=[feedback.email_contato],
            fail_silently=True
        )
    
    @staticmethod
    def send_welcome_email(user, tenant) -> bool:
        """
        Envia email de boas-vindas para novo cadastro.
        
        Args:
            user: Objeto User
            tenant: Objeto Client (tenant)
            
        Returns:
            bool: True se enviado com sucesso
        """
        subject = "🎉 Bem-vindo ao Ouvify!"
        
        message = f"""
Olá {user.first_name or user.username},

Seja bem-vindo ao Ouvify! Sua conta foi criada com sucesso.

🏢 Empresa: {tenant.nome}
🌐 Subdomínio: {tenant.subdominio}

Próximos passos:
1. Acesse seu painel: {settings.BASE_URL}/dashboard
2. Personalize sua página de feedbacks
3. Compartilhe o link com seus clientes

Precisa de ajuda? Acesse nossa documentação ou entre em contato.

Atenciosamente,
Equipe Ouvify
        """
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Bem-vindo ao Ouvify!</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 18px;">Olá <strong>{user.first_name or user.username}</strong>,</p>
        
        <p>Sua conta foi criada com sucesso! 🚀</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>🏢 Empresa:</strong> {tenant.nome}</p>
            <p style="margin: 5px 0;"><strong>🌐 Subdomínio:</strong> {tenant.subdominio}</p>
        </div>
        
        <h3>📋 Próximos passos:</h3>
        <ol>
            <li>Acesse seu painel de controle</li>
            <li>Personalize sua página de feedbacks</li>
            <li>Compartilhe o link com seus clientes</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{settings.BASE_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Acessar Meu Painel
            </a>
        </div>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(
            subject=subject,
            message=message.strip(),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=True
        )
