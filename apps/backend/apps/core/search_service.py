"""
Service de busca global com ElasticSearch
Suporta busca multi-tenant com isolamento de dados
"""
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from elasticsearch_dsl import Q, Search
from django.conf import settings

try:
    from apps.feedbacks.documents import FeedbackDocument
    ELASTICSEARCH_AVAILABLE = True
except ImportError:
    ELASTICSEARCH_AVAILABLE = False
    # Create a placeholder class for type checking
    class FeedbackDocument:  # type: ignore[no-redef]
        @classmethod
        def search(cls):
            raise RuntimeError("ElasticSearch not available")
        
        def update(self, obj):
            raise RuntimeError("ElasticSearch not available")


@dataclass
class SearchResult:
    """Estrutura de resultado de busca"""
    id: int
    protocolo: str
    titulo: str
    descricao: str
    tipo: str
    status: str
    score: float
    highlight: Dict[str, List[str]]


@dataclass
class SearchResponse:
    """Resposta paginada de busca"""
    results: List[SearchResult]
    total: int
    page: int
    page_size: int
    took_ms: int
    query: str


class GlobalSearchService:
    """
    Service de busca global usando ElasticSearch
    
    Features:
    - Busca full-text em português
    - Autocomplete
    - Filtros por tipo, status, data
    - Isolamento multi-tenant
    - Highlighting de resultados
    """
    
    def __init__(self, tenant_id: int):
        """
        Inicializa o service com isolamento de tenant
        
        Args:
            tenant_id: ID do tenant para isolamento de dados
        """
        self.tenant_id = tenant_id
        self._validate_elasticsearch()
    
    def _validate_elasticsearch(self) -> None:
        """Valida se ElasticSearch está disponível"""
        if not ELASTICSEARCH_AVAILABLE:
            raise RuntimeError(
                "ElasticSearch não está disponível. "
                "Instale django-elasticsearch-dsl: pip install django-elasticsearch-dsl"
            )
    
    def search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        page_size: int = 20,
        highlight: bool = True
    ) -> SearchResponse:
        """
        Executa busca full-text com filtros
        
        Args:
            query: Termo de busca
            filters: Dicionário de filtros (tipo, status, data_inicio, data_fim)
            page: Página atual (1-indexed)
            page_size: Tamanho da página
            highlight: Se deve retornar highlights
            
        Returns:
            SearchResponse com resultados paginados
        """
        # Criar busca base com filtro de tenant
        s = FeedbackDocument.search()
        s = s.filter('term', tenant_id=self.tenant_id)
        
        # Aplicar busca full-text se houver query
        if query and query.strip():
            # Multi-match em campos de texto
            s = s.query(
                'multi_match',
                query=query,
                fields=[
                    'titulo^3',       # Título tem peso 3x
                    'titulo.autocomplete',
                    'descricao^2',    # Descrição tem peso 2x
                    'protocolo^5',    # Protocolo tem peso 5x (busca exata)
                    'email_contato',
                ],
                type='best_fields',
                fuzziness='AUTO',
                minimum_should_match='75%'
            )
        
        # Aplicar filtros
        if filters:
            s = self._apply_filters(s, filters)
        
        # Configurar paginação
        start = (page - 1) * page_size
        s = s[start:start + page_size]
        
        # Configurar highlighting
        if highlight:
            s = s.highlight(
                'titulo',
                'descricao',
                fragment_size=150,
                pre_tags=['<mark>'],
                post_tags=['</mark>'],
                number_of_fragments=3
            )
        
        # Ordenar por relevância (score) e data
        s = s.sort('_score', '-created_at')
        
        # Executar busca
        response = s.execute()
        
        # Processar resultados
        results = self._process_results(response)
        
        return SearchResponse(
            results=results,
            total=response.hits.total.value,
            page=page,
            page_size=page_size,
            took_ms=response.took,
            query=query
        )
    
    def autocomplete(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """
        Retorna sugestões de autocomplete
        
        Args:
            query: Termo parcial para autocomplete
            limit: Número máximo de sugestões
            
        Returns:
            Lista de sugestões com id, titulo e protocolo
        """
        s = FeedbackDocument.search()
        s = s.filter('term', tenant_id=self.tenant_id)
        
        # Busca em campos de autocomplete
        s = s.query(
            'multi_match',
            query=query,
            fields=['titulo.autocomplete', 'protocolo'],
            type='phrase_prefix'
        )
        
        s = s[:limit]
        s = s.source(['id', 'titulo', 'protocolo'])
        
        response = s.execute()
        
        return [
            {
                'id': hit.meta.id,
                'titulo': hit.titulo,
                'protocolo': hit.protocolo
            }
            for hit in response
        ]
    
    def search_by_protocol(self, protocol: str) -> Optional[SearchResult]:
        """
        Busca feedback por protocolo exato
        
        Args:
            protocol: Protocolo do feedback (ex: OUVY-1234-5678)
            
        Returns:
            SearchResult ou None se não encontrado
        """
        s = FeedbackDocument.search()
        s = s.filter('term', tenant_id=self.tenant_id)
        s = s.filter('term', protocolo=protocol.upper())
        
        response = s.execute()
        
        if response.hits:
            hit = response.hits[0]
            return SearchResult(
                id=int(hit.meta.id),
                protocolo=hit.protocolo,
                titulo=hit.titulo,
                descricao=getattr(hit, 'descricao', ''),
                tipo=hit.tipo,
                status=hit.status,
                score=hit.meta.score,
                highlight={}
            )
        
        return None
    
    def _apply_filters(self, search: Search, filters: Dict[str, Any]) -> Search:
        """Aplica filtros à busca"""
        
        if 'tipo' in filters and filters['tipo']:
            search = search.filter('term', tipo=filters['tipo'])
        
        if 'status' in filters and filters['status']:
            search = search.filter('term', status=filters['status'])
        
        if 'categoria' in filters and filters['categoria']:
            search = search.filter('term', categoria=filters['categoria'])
        
        if 'data_inicio' in filters and filters['data_inicio']:
            search = search.filter('range', created_at={'gte': filters['data_inicio']})
        
        if 'data_fim' in filters and filters['data_fim']:
            search = search.filter('range', created_at={'lte': filters['data_fim']})
        
        if 'anonimo' in filters:
            search = search.filter('term', anonimo=filters['anonimo'])
        
        return search
    
    def _process_results(self, response) -> List[SearchResult]:
        """Processa hits do ElasticSearch em SearchResults"""
        results = []
        
        for hit in response:
            # Extrair highlights
            highlight = {}
            if hasattr(hit.meta, 'highlight'):
                for field, fragments in hit.meta.highlight.to_dict().items():
                    highlight[field] = fragments
            
            results.append(SearchResult(
                id=int(hit.meta.id),
                protocolo=hit.protocolo,
                titulo=hit.titulo,
                descricao=getattr(hit, 'descricao', ''),
                tipo=hit.tipo,
                status=hit.status,
                score=hit.meta.score,
                highlight=highlight
            ))
        
        return results
    
    def rebuild_index(self) -> int:
        """
        Reconstrói índice do tenant
        
        Returns:
            Número de documentos indexados
        """
        from apps.feedbacks.models import Feedback
        
        # Buscar feedbacks do tenant
        feedbacks = Feedback.objects.filter(client_id=self.tenant_id)
        
        # Reindexar em batch
        count = 0
        for feedback in feedbacks.iterator(chunk_size=100):
            FeedbackDocument().update(feedback)
            count += 1
        
        return count


# Função helper para uso em views
def get_search_service(request) -> GlobalSearchService:
    """
    Retorna instância do SearchService para o tenant atual
    
    Args:
        request: HttpRequest com tenant resolvido
        
    Returns:
        GlobalSearchService configurado para o tenant
    """
    tenant_id = getattr(request, 'tenant_id', None)
    
    if not tenant_id:
        # Tentar obter do usuário autenticado
        if hasattr(request, 'user') and hasattr(request.user, 'tenant_id'):
            tenant_id = request.user.tenant_id
        else:
            raise ValueError("Tenant não identificado na requisição")
    
    return GlobalSearchService(tenant_id=tenant_id)
