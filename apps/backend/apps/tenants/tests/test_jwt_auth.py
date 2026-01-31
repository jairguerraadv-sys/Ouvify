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
        from apps.tenants.models import Client
        
        self.client = APIClient()
        # Criar tenant de teste
        self.tenant = Client.objects.create(
            nome='Test Tenant',
            subdominio='testjwt',
            plano='pro',
            ativo=True
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.tenant.owner = self.user
        self.tenant.save()
        # Configurar HTTP_HOST para todas as requisições
        self.client.credentials(HTTP_HOST='testjwt.localhost')
    
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
        
        # Fazer requisição autenticada (incluir HTTP_HOST)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}',
            HTTP_HOST='testjwt.localhost'
        )
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
        from datetime import timedelta
        from django.utils import timezone

        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        # Forçar expiração no passado
        access.set_exp(from_time=timezone.now() - timedelta(seconds=2), lifetime=timedelta(seconds=1))
        access_token = str(access)
        
        # Tentar usar token expirado (incluir HTTP_HOST)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}',
            HTTP_HOST='testjwt.localhost'
        )
        response = self.client.get('/api/users/me/')
        
        self.assertEqual(response.status_code, 401)
    
    def test_token_auth_header_rejected(self):
        """TokenAuth legado foi removido; apenas Bearer JWT deve funcionar."""
        self.client.credentials(
            HTTP_AUTHORIZATION='Token not-a-real-token',
            HTTP_HOST='testjwt.localhost'
        )
        response = self.client.get('/api/users/me/')

        self.assertEqual(response.status_code, 401)
