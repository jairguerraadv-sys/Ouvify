"""
Export/Import Tests - Ouvy SaaS
Sprint 5 - Feature 5.3: Export/Import de Dados
"""
import json
import uuid
from unittest.mock import patch, Mock

import pytest
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.tenants.models import Client
from apps.feedbacks.models import Feedback
from apps.feedbacks.export_service import ExportService, ImportService


# Mock do webhook para evitar conexão Redis durante testes
@patch('apps.webhooks.services.process_webhook_event.delay', Mock())
class ExportServiceTest(TestCase):
    """Testes do serviço de exportação."""
    
    def setUp(self):
        """Configura dados de teste."""
        self.client_obj = Client.objects.create(
            nome='Empresa Teste',
            subdominio=f'empresa-teste-{uuid.uuid4().hex[:8]}'
        )
        
        # Criar alguns feedbacks de teste
        with patch('apps.webhooks.services.process_webhook_event.delay'):
            for i in range(5):
                Feedback.objects.create(
                    client=self.client_obj,
                    tipo='sugestao',
                    titulo=f'Feedback Teste {i}',
                    descricao=f'Descrição do feedback {i}',
                    status='aberto',
                    prioridade='media',
                )
    
    def test_export_csv(self):
        """Teste exportação CSV."""
        response = ExportService.export_feedbacks(
            tenant=self.client_obj,
            format='csv'
        )
        
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        self.assertIn('attachment', response['Content-Disposition'])
        self.assertIn('.csv', response['Content-Disposition'])
        
        # Verificar conteúdo
        content = response.content.decode('utf-8-sig')
        self.assertIn('Protocolo', content)
        self.assertIn('Feedback Teste', content)
    
    def test_export_json(self):
        """Teste exportação JSON."""
        response = ExportService.export_feedbacks(
            tenant=self.client_obj,
            format='json'
        )
        
        self.assertEqual(response['Content-Type'], 'application/json; charset=utf-8')
        self.assertIn('.json', response['Content-Disposition'])
        
        # Verificar conteúdo JSON
        data = json.loads(response.content.decode('utf-8'))
        self.assertIn('meta', data)
        self.assertIn('feedbacks', data)
        self.assertEqual(data['meta']['total_records'], 5)
        self.assertEqual(len(data['feedbacks']), 5)
    
    def test_export_with_filters(self):
        """Teste exportação com filtros."""
        # Criar feedback com tipo diferente
        Feedback.objects.create(
            client=self.client_obj,
            tipo='reclamacao',
            titulo='Reclamação Teste',
            status='aberto',
        )
        
        response = ExportService.export_feedbacks(
            tenant=self.client_obj,
            format='json',
            filters={'tipo': 'reclamacao'}
        )
        
        data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(data['meta']['total_records'], 1)
        self.assertEqual(data['feedbacks'][0]['titulo'], 'Reclamação Teste')
    
    def test_export_invalid_format(self):
        """Teste formato inválido."""
        with self.assertRaises(ValueError):
            ExportService.export_feedbacks(
                tenant=self.client_obj,
                format='pdf'
            )


# Mock do webhook para evitar conexão Redis durante testes
@patch('apps.webhooks.services.process_webhook_event.delay', Mock())
class ImportServiceTest(TestCase):
    """Testes do serviço de importação."""
    
    def setUp(self):
        """Configura dados de teste."""
        self.client_obj = Client.objects.create(
            nome='Empresa Teste',
            subdominio=f'empresa-teste-{uuid.uuid4().hex[:8]}'
        )
    
    @patch('apps.webhooks.services.process_webhook_event.delay')
    def test_import_csv(self, mock_webhook):
        """Teste importação CSV."""
        csv_content = b"""Protocolo,Tipo,T\xc3\xadtulo,Descri\xc3\xa7\xc3\xa3o,Status,Prioridade,An\xc3\xb4nimo
,Sugest\xc3\xa3o,Novo Feedback 1,Descri\xc3\xa7\xc3\xa3o 1,Aberto,M\xc3\xa9dia,N\xc3\xa3o
,Reclama\xc3\xa7\xc3\xa3o,Novo Feedback 2,Descri\xc3\xa7\xc3\xa3o 2,Aberto,Alta,Sim
"""
        
        result = ImportService.import_feedbacks(
            tenant=self.client_obj,
            file_content=csv_content,
            format='csv'
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['created'], 2)
        self.assertEqual(result['updated'], 0)
        self.assertEqual(result['skipped'], 0)
        
        # Verificar feedbacks criados (usando all_tenants para evitar filtro automático)
        feedbacks = Feedback.objects.all_tenants().filter(client=self.client_obj)
        self.assertEqual(feedbacks.count(), 2)
    
    @patch('apps.webhooks.services.process_webhook_event.delay')
    def test_import_json(self, mock_webhook):
        """Teste importação JSON."""
        json_content = json.dumps({
            'feedbacks': [
                {'titulo': 'Feedback JSON 1', 'tipo': 'sugestao', 'descricao': 'Desc 1'},
                {'titulo': 'Feedback JSON 2', 'tipo': 'elogio', 'descricao': 'Desc 2'},
            ]
        }).encode('utf-8')
        
        result = ImportService.import_feedbacks(
            tenant=self.client_obj,
            file_content=json_content,
            format='json'
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['created'], 2)
    
    @patch('apps.webhooks.services.process_webhook_event.delay')
    def test_import_skip_existing(self, mock_webhook):
        """Teste que pula feedbacks existentes."""
        # Criar feedback existente
        existing = Feedback.objects.create(
            client=self.client_obj,
            tipo='sugestao',
            titulo='Existente',
        )
        
        json_content = json.dumps({
            'feedbacks': [
                {'protocolo': existing.protocolo, 'titulo': 'Atualizado'},
                {'titulo': 'Novo'},
            ]
        }).encode('utf-8')
        
        result = ImportService.import_feedbacks(
            tenant=self.client_obj,
            file_content=json_content,
            format='json',
            update_existing=False
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['created'], 1)
        self.assertEqual(result['skipped'], 1)
        
        # Verificar que existente não foi alterado
        existing.refresh_from_db()
        self.assertEqual(existing.titulo, 'Existente')
    
    @patch('apps.webhooks.services.process_webhook_event.delay')
    def test_import_update_existing(self, mock_webhook):
        """Teste que atualiza feedbacks existentes."""
        existing = Feedback.objects.create(
            client=self.client_obj,
            tipo='sugestao',
            titulo='Título Original',
        )
        
        json_content = json.dumps({
            'feedbacks': [
                {'protocolo': existing.protocolo, 'titulo': 'Título Atualizado'},
            ]
        }).encode('utf-8')
        
        result = ImportService.import_feedbacks(
            tenant=self.client_obj,
            file_content=json_content,
            format='json',
            update_existing=True
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['updated'], 1)
        
        existing.refresh_from_db()
        self.assertEqual(existing.titulo, 'Título Atualizado')
    
    def test_import_invalid_json(self):
        """Teste JSON inválido."""
        result = ImportService.import_feedbacks(
            tenant=self.client_obj,
            file_content=b'invalid json',
            format='json'
        )
        
        self.assertFalse(result['success'])
        self.assertTrue(any('JSON inválido' in e for e in result['errors']))
    
    def test_normalize_tipo(self):
        """Teste normalização de tipos."""
        self.assertEqual(ImportService._normalize_tipo('Reclamação'), 'reclamacao')
        self.assertEqual(ImportService._normalize_tipo('sugestão'), 'sugestao')
        self.assertEqual(ImportService._normalize_tipo('ELOGIO'), 'elogio')
        self.assertEqual(ImportService._normalize_tipo('invalido'), 'sugestao')
    
    def test_normalize_status(self):
        """Teste normalização de status."""
        self.assertEqual(ImportService._normalize_status('em análise'), 'em_analise')
        self.assertEqual(ImportService._normalize_status('Em Andamento'), 'em_andamento')
        self.assertEqual(ImportService._normalize_status('RESOLVIDO'), 'resolvido')
        self.assertEqual(ImportService._normalize_status('invalido'), 'aberto')
    
    def test_normalize_prioridade(self):
        """Teste normalização de prioridades."""
        self.assertEqual(ImportService._normalize_prioridade('Média'), 'media')
        self.assertEqual(ImportService._normalize_prioridade('ALTA'), 'alta')
        self.assertEqual(ImportService._normalize_prioridade('Crítica'), 'critica')
        self.assertEqual(ImportService._normalize_prioridade('invalida'), 'media')
