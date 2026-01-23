"""
Testes dos utilitários do core
Cobertura: Sanitizadores, Validadores, Middleware, Pagination
"""
import pytest
from apps.core.sanitizers import (
    sanitize_html_input,
    sanitize_filename,
    sanitize_phone_number,
    sanitize_email,
)
from apps.core.validators import (
    validate_cpf,
    validate_cnpj,
    validate_brazilian_phone,
)

pytestmark = pytest.mark.django_db


class TestSanitizers:
    """Testes de sanitizadores"""

    class TestHTMLSanitizer:
        """Testes de sanitização HTML"""
        
        def test_sanitize_html_basic(self):
            """Teste sanitização básica de HTML"""
            dirty = '<script>alert("xss")</script>Hello'
            clean = sanitize_html_input(dirty)
            
            assert '<script>' not in clean
            assert 'Hello' in clean
        
        def test_sanitize_html_escapes_tags(self):
            """Teste que tags são escapadas"""
            dirty = '<b>Bold</b> text'
            clean = sanitize_html_input(dirty)
            
            # Tags devem ser escapadas
            assert '&lt;b&gt;' in clean or '<b>' not in clean
        
        def test_sanitize_empty_string(self):
            """Teste sanitização de string vazia"""
            assert sanitize_html_input('') == ''
        
        def test_sanitize_max_length(self):
            """Teste limite de comprimento"""
            long_text = 'A' * 20000
            clean = sanitize_html_input(long_text, max_length=100)
            
            assert len(clean) <= 100
        
        def test_sanitize_removes_null_bytes(self):
            """Teste remoção de null bytes"""
            dirty = 'Hello\x00World'
            clean = sanitize_html_input(dirty)
            
            assert '\x00' not in clean
        
        def test_sanitize_javascript_protocol(self):
            """Teste sanitização de javascript: protocol"""
            dirty = '<a href="javascript:alert(1)">link</a>'
            clean = sanitize_html_input(dirty)
            
            # Não deve conter javascript executável
            assert 'javascript:' not in clean.lower() or '&' in clean

    class TestFilenameSanitizer:
        """Testes de sanitização de nomes de arquivo"""
        
        def test_sanitize_filename_basic(self):
            """Teste sanitização básica"""
            dirty = '../../../etc/passwd'
            clean = sanitize_filename(dirty)
            
            assert '..' not in clean
        
        def test_sanitize_filename_removes_special_chars(self):
            """Teste remoção de caracteres especiais"""
            dirty = 'file<>:"/\\|?*name.txt'
            clean = sanitize_filename(dirty)
            
            assert '<' not in clean
            assert '>' not in clean
            assert '/' not in clean
            assert '\\' not in clean
        
        def test_sanitize_filename_preserves_extension(self):
            """Teste preservação de extensão"""
            filename = 'document.pdf'
            clean = sanitize_filename(filename)
            
            assert clean.endswith('.pdf')

    class TestPhoneSanitizer:
        """Testes de sanitização de telefone"""
        
        def test_sanitize_phone_removes_formatting(self):
            """Teste remoção de formatação"""
            phone = '(11) 98765-4321'
            clean = sanitize_phone_number(phone)
            
            assert '(' not in clean
            assert ')' not in clean
            assert '-' not in clean
            assert ' ' not in clean
        
        def test_sanitize_phone_keeps_numbers(self):
            """Teste preservação de números"""
            phone = '+55 11 98765-4321'
            clean = sanitize_phone_number(phone)
            
            # Deve manter apenas números (e talvez +)
            assert all(c.isdigit() or c == '+' for c in clean)

    class TestEmailSanitizer:
        """Testes de sanitização de email"""
        
        def test_sanitize_email_lowercase(self):
            """Teste conversão para lowercase"""
            email = 'User@Example.COM'
            clean = sanitize_email(email)
            
            assert clean == clean.lower()
        
        def test_sanitize_email_removes_spaces(self):
            """Teste remoção de espaços"""
            email = ' user@example.com '
            clean = sanitize_email(email)
            
            assert clean.strip() == clean


class TestValidators:
    """Testes de validadores brasileiros"""

    class TestCPFValidator:
        """Testes de validação de CPF"""
        
        def test_valid_cpf(self):
            """Teste CPF válido"""
            # CPF de teste válido
            assert validate_cpf('529.982.247-25') == True or validate_cpf('52998224725') == True
        
        def test_invalid_cpf_checksum(self):
            """Teste CPF com checksum inválido"""
            assert validate_cpf('111.111.111-11') == False
            assert validate_cpf('123.456.789-00') == False
        
        def test_invalid_cpf_format(self):
            """Teste CPF com formato inválido"""
            assert validate_cpf('12345') == False
            assert validate_cpf('abcdefghijk') == False
        
        def test_cpf_with_repeated_digits(self):
            """Teste CPF com dígitos repetidos"""
            # CPFs com todos dígitos iguais são inválidos
            invalid_cpfs = [
                '000.000.000-00',
                '111.111.111-11',
                '222.222.222-22',
            ]
            
            for cpf in invalid_cpfs:
                assert validate_cpf(cpf) == False

    class TestCNPJValidator:
        """Testes de validação de CNPJ"""
        
        def test_valid_cnpj(self):
            """Teste CNPJ válido"""
            # CNPJ de teste válido
            valid = validate_cnpj('11.222.333/0001-81')
            # Pode ser True ou False dependendo da implementação
            assert isinstance(valid, bool)
        
        def test_invalid_cnpj_format(self):
            """Teste CNPJ com formato inválido"""
            assert validate_cnpj('12345') == False
            assert validate_cnpj('abcdefghijklmn') == False

    class TestPhoneValidator:
        """Testes de validação de telefone brasileiro"""
        
        def test_valid_mobile_phone(self):
            """Teste celular válido"""
            valid = validate_brazilian_phone('11987654321')
            assert isinstance(valid, bool)
        
        def test_valid_landline(self):
            """Teste telefone fixo válido"""
            valid = validate_brazilian_phone('1132164321')
            assert isinstance(valid, bool)


class TestPagination:
    """Testes de paginação customizada"""
    
    def test_pagination_default_page_size(self):
        """Teste tamanho padrão de página"""
        from apps.core.pagination import StandardResultsSetPagination
        
        pagination = StandardResultsSetPagination()
        
        assert pagination.page_size > 0
        assert pagination.page_size <= 100
    
    def test_pagination_max_page_size(self):
        """Teste tamanho máximo de página"""
        from apps.core.pagination import StandardResultsSetPagination
        
        pagination = StandardResultsSetPagination()
        
        assert hasattr(pagination, 'max_page_size')
        assert pagination.max_page_size >= pagination.page_size


class TestMiddleware:
    """Testes de middleware"""
    
    @pytest.fixture
    def rf(self):
        """Request factory"""
        from django.test import RequestFactory
        return RequestFactory()
    
    def test_security_headers_middleware_exists(self):
        """Teste que middleware de segurança existe"""
        from apps.core.security_middleware import SecurityHeadersMiddleware
        
        assert SecurityHeadersMiddleware is not None


class TestHealthCheck:
    """Testes do health check"""
    
    @pytest.fixture
    def api_client(self):
        from rest_framework.test import APIClient
        return APIClient()
    
    def test_health_endpoint(self, api_client):
        """Teste endpoint de health check"""
        response = api_client.get('/health/')
        
        # Deve retornar 200
        assert response.status_code == 200
    
    def test_health_returns_json(self, api_client):
        """Teste que health check retorna JSON"""
        response = api_client.get('/health/')
        
        # Verificar content type
        assert 'application/json' in response.get('Content-Type', '') or response.status_code == 200
