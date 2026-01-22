"""
Testes para JWT Authentication
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import time

User = get_user_model()


class JWTAuthTestCase(TestCase):
    """Testes de autenticação JWT"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_obtain_token_pair(self):
        """Testa obtenção de access + refresh token"""
        response = self.client.post(
            '/api/token/',
            {
                'username': 'testuser',
                'password': 'testpass123',
            },
            format='json'  # Importante: usar JSON, não multipart
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        # Validar estrutura de resposta do user
        user_data = response.data['user']
        self.assertEqual(user_data['email'], 'test@example.com')
        self.assertEqual(user_data['username'], 'testuser')
    
    def test_token_refresh(self):
        """Testa renovação de access token"""
        refresh = RefreshToken.for_user(self.user)
        
        response = self.client.post(
            '/api/token/refresh/',
            {'refresh': str(refresh)},
            format='json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
    
    def test_token_verify(self):
        """Testa verificação de token"""
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        response = self.client.post(
            '/api/token/verify/',
            {'token': access_token},
            format='json'
        )
        
        self.assertEqual(response.status_code, 200)
    
    def test_authenticated_request_with_jwt(self):
        """Testa requisição autenticada com JWT"""
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        # Fazer requisição autenticada
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/users/me/')
        
        self.assertEqual(response.status_code, 200)
    
    def test_invalid_credentials(self):
        """Testa login com credenciais inválidas"""
        response = self.client.post(
            '/api/token/',
            {
                'username': 'testuser',
                'password': 'wrongpassword',
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, 401)
    
    def test_expired_token_rejected(self):
        """Testa que token expirado é rejeitado"""
        # Criar token com tempo de vida muito curto
        from datetime import timedelta
        from django.conf import settings
        
        # Salvar configuração original
        original_lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        
        # Configurar para expirar em 1 segundo
        settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(seconds=1)
        
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        # Aguardar expiração
        time.sleep(2)
        
        # Tentar usar token expirado
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/users/me/')
        
        self.assertEqual(response.status_code, 401)
        
        # Restaurar configuração original
        settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = original_lifetime
    
    def test_legacy_token_auth_still_works(self):
        """Testa que autenticação legacy (Token) ainda funciona para backward compatibility"""
        from rest_framework.authtoken.models import Token
        
        token = Token.objects.create(user=self.user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/users/me/')
        
        self.assertEqual(response.status_code, 200)
