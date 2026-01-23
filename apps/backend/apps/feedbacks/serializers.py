from rest_framework import serializers
from .models import Feedback, FeedbackInteracao, FeedbackArquivo
from django.utils import timezone
from django.conf import settings
from .constants import InteracaoTipo
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


class FeedbackArquivoSerializer(serializers.ModelSerializer):
    """
    Serializer para arquivos anexados a feedbacks.
    """
    url = serializers.SerializerMethodField()
    tamanho_mb = serializers.ReadOnlyField()
    enviado_por_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = FeedbackArquivo
        fields = [
            'id',
            'nome_original',
            'tipo_mime',
            'tamanho_bytes',
            'tamanho_mb',
            'url',
            'interno',
            'data_envio',
            'enviado_por_nome',
        ]
        read_only_fields = ['id', 'data_envio', 'tamanho_mb']
    
    def get_url(self, obj) -> str:
        """Retorna URL pública do arquivo."""
        return obj.url_publica
    
    def get_enviado_por_nome(self, obj) -> str:
        """Retorna nome de quem enviou (ou 'Anônimo')."""
        if obj.enviado_por:
            return obj.enviado_por.get_full_name() or obj.enviado_por.get_username()
        return 'Denunciante'


class FeedbackArquivoUploadSerializer(serializers.Serializer):
    """
    Serializer para upload de arquivo.
    Usado em multipart/form-data requests.
    """
    arquivo = serializers.FileField(
        required=True,
        help_text='Arquivo a ser anexado (máx 10MB)',
        allow_empty_file=False
    )
    protocolo = serializers.CharField(
        required=False,
        help_text='Protocolo do feedback (obrigatório se anônimo)',
        allow_blank=True
    )
    interno = serializers.BooleanField(
        required=False,
        default=False,
        help_text='Se True, arquivo só é visível para empresa'
    )
    
    def validate_arquivo(self, value):
        """Valida tipo e tamanho do arquivo."""
        # Validar tamanho
        if value.size > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
            raise serializers.ValidationError(
                f'Arquivo muito grande. Máximo permitido: {max_mb}MB'
            )
        
        # Validar tipo MIME
        if value.content_type not in settings.ALLOWED_FILE_TYPES:
            tipos_permitidos = ', '.join([
                t.split('/')[-1].upper() for t in settings.ALLOWED_FILE_TYPES
            ])
            raise serializers.ValidationError(
                f'Tipo de arquivo não permitido. Tipos aceitos: {tipos_permitidos}'
            )
        
        return value


class FeedbackDetailSerializer(FeedbackSerializer):
    interacoes = serializers.SerializerMethodField()
    arquivos = serializers.SerializerMethodField()

    class Meta(FeedbackSerializer.Meta):
        fields = FeedbackSerializer.Meta.fields + ['interacoes', 'arquivos']

    def get_interacoes(self, obj):
        # Ordenar por data desc
        qs = obj.interacoes.order_by('-data')
        return FeedbackInteracaoSerializer(qs, many=True).data
    
    def get_arquivos(self, obj):
        """Retorna arquivos do feedback (filtra internos se necessário)."""
        request = self.context.get('request')
        
        # Se request não existe ou user não autenticado, mostrar só públicos
        if not request or not request.user.is_authenticated:
            qs = obj.arquivos.filter(interno=False)
        else:
            # User autenticado vê todos
            qs = obj.arquivos.all()
        
        return FeedbackArquivoSerializer(qs, many=True).data


class FeedbackConsultaSerializer(serializers.ModelSerializer):
    """
    Serializador público para consulta de protocolo.
    Retorna apenas informações não sensíveis do feedback.
    """
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    interacoes = serializers.SerializerMethodField()
    arquivos = serializers.SerializerMethodField()
    
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
            'arquivos',
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
            'arquivos',
        ]

    def get_interacoes(self, obj):
        allowed_public = InteracaoTipo.public_values()
        qs = obj.interacoes.filter(tipo__in=allowed_public).order_by('data')
        return FeedbackInteracaoSerializer(qs, many=True).data
    
    def get_arquivos(self, obj):
        """Retorna apenas arquivos públicos (não internos)."""
        qs = obj.arquivos.filter(interno=False).order_by('-data_envio')
        return FeedbackArquivoSerializer(qs, many=True).data
