from rest_framework import serializers
from .models import Feedback, FeedbackInteracao
from django.utils import timezone
from apps.core.sanitizers import (
    sanitize_html_input,        # Método atual (html.escape)
    sanitize_plain_text,
    sanitize_rich_text,          # ✅ NOVO: Método com bleach
)


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializador para converter dados do Feedback entre Django ORM e JSON.
    Usa os nomes em português conforme definido no modelo.
    """
    
    class Meta:
        model = Feedback
        fields = [
            'id',
            'protocolo',
            'tipo',
            'titulo',
            'descricao',
            'status',
            'anonimo',
            'email_contato',
            'data_criacao',
            'data_atualizacao',
        ]
        
        # Campos somente leitura
        read_only_fields = ['id', 'protocolo', 'data_criacao', 'data_atualizacao']
    
    def validate_titulo(self, value):
        """
        Sanitiza o título contra XSS.
        
        ✅ MÉTODO: sanitize_plain_text()
        - Remove TODAS as tags HTML
        - Permite apenas caracteres alfanuméricos seguros
        - Ideal para títulos (texto curto)
        """
        return sanitize_plain_text(value, max_length=200)
    
    def validate_descricao(self, value):
        """
        Sanitiza a descrição contra XSS.
        
        ⚙️ MÉTODO CONFIGURÁVEL:
        - ATUAL: sanitize_html_input() - Escapa HTML (mais seguro)
        - ALTERNATIVO: sanitize_rich_text() - Permite formatação (requer bleach)
        
        Para habilitar rich text:
        1. Instalar: pip install bleach
        2. Descomentar linha abaixo
        """
        # Método atual (padrão) - Escapa HTML
        return sanitize_html_input(value, max_length=5000)
        
        # Método alternativo (descomente se precisar rich text)
        # return sanitize_rich_text(value, allow_links=False)


class FeedbackInteracaoSerializer(serializers.ModelSerializer):
    autor_nome = serializers.SerializerMethodField()
    data_formatada = serializers.SerializerMethodField()

    class Meta:
        model = FeedbackInteracao
        fields = [
            'id',
            'tipo',
            'mensagem',
            'data',
            'data_formatada',
            'autor_nome',
        ]
        read_only_fields = ['id', 'data', 'data_formatada', 'autor_nome']

    def get_autor_nome(self, obj):
        return obj.autor.get_full_name() or obj.autor.get_username() if obj.autor else 'Anónimo'

    def get_data_formatada(self, obj):
        # Formatação legível (ex.: 11/01/2026 14:32)
        return timezone.localtime(obj.data).strftime('%d/%m/%Y %H:%M')
    
    def validate_mensagem(self, value):
        """
        Sanitiza mensagem de interação contra XSS.
        
        ⚙️ MÉTODO CONFIGURÁVEL (mesmo que validate_descricao)
        """
        return sanitize_html_input(value, max_length=2000)
        # Ou: return sanitize_rich_text(value, allow_links=False)


class FeedbackDetailSerializer(FeedbackSerializer):
    interacoes = serializers.SerializerMethodField()

    class Meta(FeedbackSerializer.Meta):
        fields = FeedbackSerializer.Meta.fields + ['interacoes']

    def get_interacoes(self, obj):
        # Ordenar por data desc
        qs = obj.interacoes.order_by('-data')
        return FeedbackInteracaoSerializer(qs, many=True).data


class FeedbackConsultaSerializer(serializers.ModelSerializer):
    """
    Serializador público para consulta de protocolo.
    Retorna apenas informações não sensíveis do feedback.
    """
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    interacoes = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'protocolo',
            'tipo',
            'tipo_display',
            'status',
            'status_display',
            'titulo',
            'resposta_empresa',
            'data_resposta',
            'data_criacao',
            'data_atualizacao',
            'interacoes',
        ]
        read_only_fields = [
            'protocolo',
            'tipo',
            'tipo_display',
            'status',
            'status_display',
            'titulo',
            'resposta_empresa',
            'data_resposta',
            'data_criacao',
            'data_atualizacao',
            'interacoes',
        ]

    def get_interacoes(self, obj):
        # Apenas interações públicas: mensagens públicas e mudanças de status
        qs = obj.interacoes.filter(tipo__in=['MENSAGEM_PUBLICA', 'MUDANCA_STATUS']).order_by('data')
        return FeedbackInteracaoSerializer(qs, many=True).data
