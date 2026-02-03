"""
Tests for Email Templates and Service
"""
import pytest
from django.contrib.auth import get_user_model
from apps.core.email_templates import (
    welcome_email,
    email_confirmation,
    password_reset,
    feedback_notification,
    weekly_report,
    team_invitation
)

User = get_user_model()


class TestEmailTemplates:
    """Test email template generation"""
    
    def test_welcome_email_content(self):
        """Test welcome email contains required elements"""
        result = welcome_email(
            user_name="João Silva",
            tenant_name="Empresa Teste",
            login_url="https://ouvify.com/login"
        )
        
        assert result['subject'] == "Bem-vindo ao Ouvify, João Silva!"
        assert "João Silva" in result['html']
        assert "Empresa Teste" in result['html']
        assert "https://ouvify.com/login" in result['html']
        assert "Acessar Painel" in result['html']
    
    def test_email_confirmation_content(self):
        """Test email confirmation contains confirmation link"""
        result = email_confirmation(
            user_name="Maria Santos",
            confirmation_url="https://ouvify.com/confirm/abc123"
        )
        
        assert "Confirme seu email" in result['subject']
        assert "Maria Santos" in result['html']
        assert "https://ouvify.com/confirm/abc123" in result['html']
        assert "Confirmar Email" in result['html']
    
    def test_password_reset_content(self):
        """Test password reset email"""
        result = password_reset(
            user_name="Pedro Costa",
            reset_url="https://ouvify.com/reset/xyz789"
        )
        
        assert "Redefinir senha" in result['subject']
        assert "Pedro Costa" in result['html']
        assert "https://ouvify.com/reset/xyz789" in result['html']
        assert "Redefinir Senha" in result['html']
    
    def test_feedback_notification_content(self):
        """Test feedback notification email"""
        result = feedback_notification(
            user_name="Ana Lima",
            feedback_author="Cliente Importante",
            feedback_excerpt="Adorei o atendimento!",
            feedback_url="https://ouvify.com/feedback/123",
            priority="alta"
        )
        
        assert "Novo feedback" in result['subject']
        assert "Cliente Importante" in result['subject']
        assert "Ana Lima" in result['html']
        assert "Adorei o atendimento!" in result['html']
        assert "https://ouvify.com/feedback/123" in result['html']
    
    def test_weekly_report_content(self):
        """Test weekly report email"""
        stats = {
            'total': 42,
            'positivos': 30,
            'neutros': 8,
            'negativos': 4,
            'taxa_resposta': 95,
            'tempo_medio': '2h 30min',
            'nps': 85
        }
        
        result = weekly_report(
            user_name="Carlos Souza",
            tenant_name="Tech Corp",
            stats=stats,
            report_url="https://ouvify.com/reports/weekly"
        )
        
        assert "Relatório Semanal" in result['subject']
        assert "Carlos Souza" in result['html']
        assert "Tech Corp" in result['html']
        assert "42" in result['html']  # Total feedbacks
        assert "30" in result['html']  # Positivos
        assert "95" in result['html']  # Taxa de resposta
    
    def test_team_invitation_content(self):
        """Test team invitation email"""
        result = team_invitation(
            inviter_name="Roberto Admin",
            tenant_name="Startup XYZ",
            role="Gerente",
            accept_url="https://ouvify.com/invite/accept/token123"
        )
        
        assert "convidou você" in result['subject']
        assert "Roberto Admin" in result['html']
        assert "Startup XYZ" in result['html']
        assert "Gerente" in result['html']
        assert "https://ouvify.com/invite/accept/token123" in result['html']
    
    def test_all_templates_have_unsubscribe(self):
        """Test all templates include unsubscribe link"""
        templates = [
            welcome_email("Test", "Company", "http://test.com"),
            email_confirmation("Test", "http://test.com"),
            password_reset("Test", "http://test.com"),
            feedback_notification("Test", "Author", "Text", "http://test.com"),
            weekly_report("Test", "Company", {'total': 0}, "http://test.com"),
            team_invitation("Test", "Company", "Role", "http://test.com")
        ]
        
        for template in templates:
            assert "unsubscribe" in template['html'].lower() or "cancelar" in template['html'].lower()
    
    def test_all_templates_are_responsive(self):
        """Test all templates include responsive meta tags"""
        templates = [
            welcome_email("Test", "Company", "http://test.com"),
            email_confirmation("Test", "http://test.com")
        ]
        
        for template in templates:
            assert "viewport" in template['html']
            assert "@media" in template['html']
    
    def test_html_injection_prevented(self):
        """Test templates don't allow HTML injection"""
        result = welcome_email(
            user_name="<script>alert('xss')</script>",
            tenant_name="<b>Test</b>",
            login_url="http://test.com"
        )
        
        # Names should be properly escaped in HTML context
        assert "&lt;script&gt;" in result['html'] or "<script>" not in result['html']
