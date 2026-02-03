"""
Email Templates - Ouvify
Base template with responsive design and consistent branding
"""

def get_base_template(content: str, preheader: str = "") -> str:
    """Base HTML template for all emails"""
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Ouvify</title>
    <style>
        /* Reset */
        body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
        table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
        img {{ -ms-interpolation-mode: bicubic; }}
        
        /* Body */
        body {{
            margin: 0;
            padding: 0;
            width: 100% !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f6f9fc;
        }}
        
        /* Container */
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }}
        
        /* Header */
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }}
        
        .logo {{
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
        }}
        
        /* Content */
        .content {{
            padding: 40px 30px;
            color: #1f2937;
            line-height: 1.6;
        }}
        
        .content h1 {{
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #111827;
        }}
        
        .content p {{
            margin: 0 0 16px 0;
            font-size: 16px;
            color: #4b5563;
        }}
        
        /* Button */
        .button {{
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }}
        
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }}
        
        /* Info Box */
        .info-box {{
            background-color: #f3f4f6;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        
        .info-box p {{
            margin: 0;
            font-size: 14px;
        }}
        
        /* Footer */
        .footer {{
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }}
        
        .footer a {{
            color: #667eea;
            text-decoration: none;
        }}
        
        .footer-links {{
            margin: 20px 0;
        }}
        
        .footer-links a {{
            margin: 0 10px;
            color: #6b7280;
        }}
        
        /* Responsive */
        @media only screen and (max-width: 600px) {{
            .content {{
                padding: 30px 20px !important;
            }}
            .content h1 {{
                font-size: 20px !important;
            }}
            .button {{
                display: block;
                text-align: center;
            }}
        }}
    </style>
</head>
<body>
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center">
    <tr><td>
    <![endif]-->
    
    <!-- Preheader -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        {preheader}
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <a href="https://ouvify.com" class="logo">Ouvify</a>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content">
                            {content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <div class="footer-links">
                                <a href="https://ouvify.com">Site</a>
                                <a href="https://ouvify.com/ajuda">Ajuda</a>
                                <a href="https://ouvify.com/privacidade">Privacidade</a>
                                <a href="https://ouvify.com/termos">Termos</a>
                            </div>
                            <p>
                                © 2026 Ouvify. Todos os direitos reservados.<br>
                                São Paulo, Brasil
                            </p>
                            <p style="font-size: 12px; margin-top: 20px;">
                                Você está recebendo este email porque se cadastrou no Ouvify.<br>
                                <a href="{{{{unsubscribe_url}}}}">Cancelar inscrição</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
</body>
</html>
"""


def welcome_email(user_name: str, tenant_name: str, login_url: str) -> dict:
    """Email de boas-vindas após cadastro"""
    content = f"""
        <h1>Bem-vindo ao Ouvify, {user_name}! 🎉</h1>
        <p>
            Estamos muito felizes em ter você e a <strong>{tenant_name}</strong> conosco!
        </p>
        <p>
            O Ouvify é a plataforma completa para gestão de feedbacks que vai transformar
            a forma como você se comunica com seus clientes.
        </p>
        
        <div class="info-box">
            <p><strong>Primeiros passos:</strong></p>
            <p>✓ Configure seu perfil e preferências<br>
               ✓ Personalize o widget de feedback<br>
               ✓ Convide sua equipe<br>
               ✓ Comece a coletar feedbacks</p>
        </div>
        
        <a href="{login_url}" class="button">Acessar Painel</a>
        
        <p>
            Se precisar de ajuda, nossa equipe está sempre disponível. Basta responder
            este email ou acessar nossa <a href="https://ouvify.com/ajuda">Central de Ajuda</a>.
        </p>
        
        <p>
            Até logo,<br>
            <strong>Equipe Ouvify</strong>
        </p>
    """
    
    return {
        'subject': f'Bem-vindo ao Ouvify, {user_name}!',
        'html': get_base_template(content, f"Comece a transformar feedbacks em resultados com o Ouvify"),
        'preheader': 'Comece a transformar feedbacks em resultados'
    }


def email_confirmation(user_name: str, confirmation_url: str, expires_in: str = "24 horas") -> dict:
    """Email de confirmação de cadastro"""
    content = f"""
        <h1>Confirme seu email, {user_name}</h1>
        <p>
            Obrigado por se cadastrar no Ouvify! Para começar a usar a plataforma,
            precisamos confirmar seu endereço de email.
        </p>
        
        <a href="{confirmation_url}" class="button">Confirmar Email</a>
        
        <div class="info-box">
            <p>
                <strong>Este link expira em {expires_in}.</strong><br>
                Se você não solicitou este cadastro, pode ignorar este email com segurança.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="{confirmation_url}" style="color: #667eea; word-break: break-all;">{confirmation_url}</a>
        </p>
    """
    
    return {
        'subject': 'Confirme seu email - Ouvify',
        'html': get_base_template(content, "Confirme seu email para acessar o Ouvify"),
        'preheader': 'Confirme seu email para começar'
    }


def password_reset(user_name: str, reset_url: str, expires_in: str = "1 hora") -> dict:
    """Email de recuperação de senha"""
    content = f"""
        <h1>Redefinir sua senha</h1>
        <p>Olá, {user_name}!</p>
        <p>
            Recebemos uma solicitação para redefinir a senha da sua conta no Ouvify.
            Clique no botão abaixo para criar uma nova senha:
        </p>
        
        <a href="{reset_url}" class="button">Redefinir Senha</a>
        
        <div class="info-box">
            <p>
                <strong>Este link expira em {expires_in}.</strong><br>
                Se você não solicitou esta alteração, ignore este email.
                Sua senha permanecerá inalterada.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
        </p>
        
        <p style="margin-top: 30px;">
            Por segurança, nunca compartilhe este link com ninguém.
        </p>
    """
    
    return {
        'subject': 'Redefinir senha - Ouvify',
        'html': get_base_template(content, "Redefina sua senha do Ouvify"),
        'preheader': 'Solicitação de redefinição de senha'
    }


def feedback_notification(user_name: str, feedback_author: str, feedback_excerpt: str, 
                         feedback_url: str, priority: str = "média") -> dict:
    """Notificação de novo feedback recebido"""
    priority_colors = {
        'baixa': '#10b981',
        'média': '#f59e0b',
        'alta': '#ef4444',
        'crítica': '#dc2626'
    }
    
    priority_color = priority_colors.get(priority.lower(), '#6b7280')
    
    content = f"""
        <h1>Novo feedback recebido 📬</h1>
        <p>Olá, {user_name}!</p>
        <p>
            Você recebeu um novo feedback de <strong>{feedback_author}</strong>:
        </p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid {priority_color}; 
                    padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1f2937; font-size: 15px;">
                "{feedback_excerpt}"
            </p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
                Prioridade: <span style="color: {priority_color}; font-weight: 600;">{priority.upper()}</span>
            </p>
        </div>
        
        <a href="{feedback_url}" class="button">Ver Feedback Completo</a>
        
        <p style="margin-top: 30px;">
            Responda rapidamente para manter seus clientes satisfeitos! 🚀
        </p>
    """
    
    return {
        'subject': f'Novo feedback de {feedback_author} - Ouvify',
        'html': get_base_template(content, f"Você recebeu um novo feedback de {feedback_author}"),
        'preheader': f'Novo feedback de {feedback_author}'
    }


def weekly_report(user_name: str, tenant_name: str, stats: dict, report_url: str) -> dict:
    """Relatório semanal de feedbacks"""
    content = f"""
        <h1>Seu relatório semanal 📊</h1>
        <p>Olá, {user_name}!</p>
        <p>
            Aqui está um resumo dos feedbacks da <strong>{tenant_name}</strong> na última semana:
        </p>
        
        <table style="width: 100%; margin: 30px 0;" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding: 20px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                    <div style="font-size: 36px; font-weight: bold; color: #667eea;">
                        {stats.get('total', 0)}
                    </div>
                    <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">
                        Total de feedbacks
                    </div>
                </td>
            </tr>
        </table>
        
        <table style="width: 100%; margin: 20px 0;" cellspacing="0" cellpadding="10">
            <tr>
                <td style="background-color: #ecfdf5; padding: 15px; border-radius: 4px;">
                    <strong style="color: #059669;">↑ {stats.get('positivos', 0)}</strong> Positivos
                </td>
                <td style="background-color: #fef3c7; padding: 15px; border-radius: 4px;">
                    <strong style="color: #d97706;">→ {stats.get('neutros', 0)}</strong> Neutros
                </td>
                <td style="background-color: #fee2e2; padding: 15px; border-radius: 4px;">
                    <strong style="color: #dc2626;">↓ {stats.get('negativos', 0)}</strong> Negativos
                </td>
            </tr>
        </table>
        
        <div class="info-box">
            <p>
                <strong>Taxa de resposta:</strong> {stats.get('taxa_resposta', 0)}%<br>
                <strong>Tempo médio de resposta:</strong> {stats.get('tempo_medio', 'N/A')}<br>
                <strong>NPS da semana:</strong> {stats.get('nps', 'N/A')}
            </p>
        </div>
        
        <a href="{report_url}" class="button">Ver Relatório Completo</a>
        
        <p style="margin-top: 30px;">
            Continue assim! Cada feedback é uma oportunidade de melhorar. 🎯
        </p>
    """
    
    return {
        'subject': f'Relatório Semanal - {tenant_name}',
        'html': get_base_template(content, f"Seu resumo semanal de feedbacks: {stats.get('total', 0)} feedbacks recebidos"),
        'preheader': f"{stats.get('total', 0)} feedbacks esta semana"
    }


def team_invitation(inviter_name: str, tenant_name: str, role: str, accept_url: str) -> dict:
    """Convite para participar da equipe"""
    content = f"""
        <h1>Convite para equipe 🤝</h1>
        <p>
            <strong>{inviter_name}</strong> convidou você para participar da equipe
            <strong>{tenant_name}</strong> no Ouvify!
        </p>
        
        <div class="info-box">
            <p>
                <strong>Cargo:</strong> {role}<br>
                <strong>Organização:</strong> {tenant_name}
            </p>
        </div>
        
        <p>
            Aceite o convite para começar a colaborar na gestão de feedbacks e
            ajudar a melhorar a experiência dos clientes.
        </p>
        
        <a href="{accept_url}" class="button">Aceitar Convite</a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Se você não esperava este convite ou não deseja participar,
            pode ignorar este email com segurança.
        </p>
    """
    
    return {
        'subject': f'{inviter_name} convidou você para {tenant_name} - Ouvify',
        'html': get_base_template(content, f"Convite de {inviter_name} para participar de {tenant_name}"),
        'preheader': f'Convite para participar de {tenant_name}'
    }
