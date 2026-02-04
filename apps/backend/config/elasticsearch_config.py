"""
Configuração do ElasticSearch para busca global
Integração com django-elasticsearch-dsl
"""

# Configuração de conexão com ElasticSearch
ELASTICSEARCH_DSL = {
    "default": {
        "hosts": ["elasticsearch:9200"],
        "http_auth": ("elastic", "changeme"),  # Alterar em produção
        "timeout": 30,
        "retry_on_timeout": True,
        "max_retries": 3,
    },
}

# Configurações de índice
ELASTICSEARCH_INDEX_NAMES = {
    "apps.feedbacks.documents": "feedbacks",
}

# Configuração de análise para português
ELASTICSEARCH_ANALYSIS = {
    "analyzer": {
        "portuguese_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
                "lowercase",
                "portuguese_stop",
                "portuguese_stemmer",
                "asciifolding",
            ],
        },
        "autocomplete": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
                "lowercase",
                "asciifolding",
                "edge_ngram_filter",
            ],
        },
    },
    "filter": {
        "portuguese_stop": {"type": "stop", "stopwords": "_portuguese_"},
        "portuguese_stemmer": {"type": "stemmer", "language": "portuguese"},
        "edge_ngram_filter": {"type": "edge_ngram", "min_gram": 2, "max_gram": 20},
    },
}
