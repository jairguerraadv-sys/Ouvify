"""
Documentos ElasticSearch para indexação de feedbacks
Multi-tenant aware - cada tenant tem seus próprios dados isolados
"""
from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry
from apps.feedbacks.models import Feedback
from apps.tenants.models import Client

# Configuração do índice
feedbacks_index = Index('feedbacks')
feedbacks_index.settings(
    number_of_shards=1,
    number_of_replicas=1,
    analysis={
        'analyzer': {
            'portuguese_analyzer': {
                'type': 'custom',
                'tokenizer': 'standard',
                'filter': [
                    'lowercase',
                    'portuguese_stop',
                    'portuguese_stemmer',
                    'asciifolding',
                ]
            },
            'autocomplete': {
                'type': 'custom',
                'tokenizer': 'standard',
                'filter': [
                    'lowercase',
                    'asciifolding',
                    'edge_ngram_filter',
                ]
            }
        },
        'filter': {
            'portuguese_stop': {
                'type': 'stop',
                'stopwords': '_portuguese_'
            },
            'portuguese_stemmer': {
                'type': 'stemmer',
                'language': 'portuguese'
            },
            'edge_ngram_filter': {
                'type': 'edge_ngram',
                'min_gram': 2,
                'max_gram': 20
            }
        }
    }
)


@registry.register_document
@feedbacks_index.doc_type
class FeedbackDocument(Document):
    """
    Documento ElasticSearch para Feedback
    Suporta busca full-text com análise em português
    """
    
    # Campo para isolamento multi-tenant
    tenant_id = fields.IntegerField(attr='client_id')
    
    # Campos de texto com análise em português
    titulo = fields.TextField(
        analyzer='portuguese_analyzer',
        fields={
            'raw': fields.KeywordField(),
            'autocomplete': fields.TextField(analyzer='autocomplete')
        }
    )
    
    descricao = fields.TextField(
        analyzer='portuguese_analyzer',
        fields={
            'raw': fields.KeywordField()
        }
    )
    
    # Campos keyword para filtros exatos
    protocolo = fields.KeywordField()
    tipo = fields.KeywordField()
    status = fields.KeywordField()
    categoria = fields.KeywordField()
    
    # Campos de data
    created_at = fields.DateField()
    updated_at = fields.DateField()
    
    # Campo de email (para busca exata)
    email_contato = fields.KeywordField()
    
    # Campo booleano
    anonimo = fields.BooleanField()
    
    # Campos nested para tenant info
    tenant = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'nome': fields.TextField(),
        'subdominio': fields.KeywordField(),
    })

    class Index:
        name = 'feedbacks'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 1,
        }

    class Django:
        model = Feedback
        fields = []  # Todos os campos definidos explicitamente acima
        
        # Campos do modelo a ignorar
        ignore_signals = False
        auto_refresh = True
        
        # Definir related models para reindexação automática
        related_models = [Client]

    def get_queryset(self):
        """
        Queryset customizado para incluir relacionamentos
        """
        return super().get_queryset().select_related('client')

    def get_instances_from_related(self, related_instance):
        """
        Retorna instâncias de Feedback quando um Client relacionado muda
        """
        if isinstance(related_instance, Client):
            return related_instance.feedbacks.all()
        return []

    def prepare_tenant(self, instance):
        """
        Prepara dados do tenant para indexação
        """
        if instance.client:
            return {
                'id': instance.client.id,
                'nome': instance.client.nome,
                'subdominio': instance.client.subdominio,
            }
        return None
