from rest_framework import serializers
from .models import Feedback, FeedbackInteracao
from django.utils import timezone


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
