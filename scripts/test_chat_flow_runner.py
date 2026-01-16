import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'ouvy_saas'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
import django; django.setup()
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from apps.tenants.models import Client
from apps.feedbacks.models import Feedback

client_obj = Client.objects.first()
user, _ = User.objects.get_or_create(username='empresa_teste', defaults={'email':'empresa@test.com'})
Token.objects.get_or_create(user=user)
fb = Feedback.objects.create(client=client_obj, tipo='denuncia', titulo='Chat Anon Flow', descricao='Teste fluxo bidirecional', status='pendente', anonimo=True)
print('feedback_id', fb.id, 'protocolo', fb.protocolo, 'tenant', fb.client_id)

api = APIClient()
from rest_framework.authtoken.models import Token
tok = Token.objects.get(user=user)
api.credentials(HTTP_AUTHORIZATION=f'Token {tok.key}', HTTP_X_TENANT_ID=str(fb.client_id))
resp_empresa = api.post(f'/api/feedbacks/{fb.id}/adicionar-interacao/', {'mensagem':'Pergunta da empresa'}, format='json')
print('empresa_status', resp_empresa.status_code)
api.credentials(HTTP_X_TENANT_ID=str(fb.client_id))
resp_anon = api.post(f'/api/feedbacks/{fb.id}/adicionar-interacao/', {'protocolo': fb.protocolo, 'mensagem':'Resposta anônima'}, format='json')
print('anon_status', resp_anon.status_code)
resp_consulta = api.get('/api/feedbacks/consultar-protocolo/', {'codigo': fb.protocolo})
print('consulta_status', resp_consulta.status_code)
print('consulta_tipos', [i['tipo'] for i in resp_consulta.data.get('interacoes', [])])
