"""
Views da API de busca global
"""

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

try:
    from apps.core.search_service import (GlobalSearchService,
                                          get_search_service)

    SEARCH_AVAILABLE = True
except ImportError:
    SEARCH_AVAILABLE = False
    GlobalSearchService = None  # type: ignore[assignment,misc]
    get_search_service = None  # type: ignore[assignment]


class SearchRateThrottle(UserRateThrottle):
    """Rate limit para buscas: 60/min"""

    rate = "60/min"


class GlobalSearchView(APIView):
    """
    API de busca global com ElasticSearch

    Suporta busca full-text em feedbacks com:
    - Análise em português
    - Autocomplete
    - Filtros por tipo, status e data
    - Highlighting de resultados
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    @extend_schema(
        operation_id="global_search",
        summary="Busca global em feedbacks",
        description="Executa busca full-text com filtros e paginação",
        parameters=[
            OpenApiParameter(
                name="q",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Termo de busca",
                required=True,
            ),
            OpenApiParameter(
                name="tipo",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filtro por tipo (reclamacao, sugestao, elogio, denuncia)",
                required=False,
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filtro por status (novo, em_andamento, resolvido)",
                required=False,
            ),
            OpenApiParameter(
                name="data_inicio",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Data inicial (YYYY-MM-DD)",
                required=False,
            ),
            OpenApiParameter(
                name="data_fim",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Data final (YYYY-MM-DD)",
                required=False,
            ),
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Página (default: 1)",
                required=False,
            ),
            OpenApiParameter(
                name="page_size",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Tamanho da página (default: 20, max: 100)",
                required=False,
            ),
        ],
        responses={
            200: {
                "description": "Resultados da busca",
                "content": {
                    "application/json": {
                        "example": {
                            "results": [
                                {
                                    "id": 1,
                                    "protocolo": "OUVY-1234-5678",
                                    "titulo": "Feedback sobre atendimento",
                                    "descricao": "Descrição do feedback...",
                                    "tipo": "reclamacao",
                                    "status": "novo",
                                    "score": 12.5,
                                    "highlight": {
                                        "titulo": [
                                            "Feedback sobre <mark>atendimento</mark>"
                                        ]
                                    },
                                }
                            ],
                            "total": 42,
                            "page": 1,
                            "page_size": 20,
                            "took_ms": 15,
                            "query": "atendimento",
                        }
                    }
                },
            },
            400: {"description": "Parâmetros inválidos"},
            503: {"description": "ElasticSearch não disponível"},
        },
        tags=["Busca"],
    )
    def get(self, request):
        """Executa busca global"""

        # Verificar se ElasticSearch está disponível
        if not SEARCH_AVAILABLE:
            return Response(
                {"error": "Serviço de busca não disponível"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Extrair parâmetros
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {"error": 'Parâmetro "q" é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Filtros
        filters = {}

        if request.query_params.get("tipo"):
            filters["tipo"] = request.query_params.get("tipo")

        if request.query_params.get("status"):
            filters["status"] = request.query_params.get("status")

        if request.query_params.get("data_inicio"):
            filters["data_inicio"] = request.query_params.get("data_inicio")

        if request.query_params.get("data_fim"):
            filters["data_fim"] = request.query_params.get("data_fim")

        # Paginação
        try:
            page = int(request.query_params.get("page", 1))
            page_size = min(int(request.query_params.get("page_size", 20)), 100)
        except ValueError:
            return Response(
                {"error": "Parâmetros de paginação inválidos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Obter service para o tenant
            assert get_search_service is not None  # Type guard
            search_service = get_search_service(request)

            # Executar busca
            response = search_service.search(
                query=query,
                filters=filters if filters else None,
                page=page,
                page_size=page_size,
            )

            # Serializar resposta
            return Response(
                {
                    "results": [
                        {
                            "id": r.id,
                            "protocolo": r.protocolo,
                            "titulo": r.titulo,
                            "descricao": (
                                r.descricao[:200] + "..."
                                if len(r.descricao) > 200
                                else r.descricao
                            ),
                            "tipo": r.tipo,
                            "status": r.status,
                            "score": r.score,
                            "highlight": r.highlight,
                        }
                        for r in response.results
                    ],
                    "total": response.total,
                    "page": response.page,
                    "page_size": response.page_size,
                    "took_ms": response.took_ms,
                    "query": response.query,
                }
            )

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {"error": "Erro ao executar busca"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AutocompleteView(APIView):
    """
    API de autocomplete para busca
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    @extend_schema(
        operation_id="autocomplete",
        summary="Autocomplete para busca",
        description="Retorna sugestões de autocomplete baseado no termo digitado",
        parameters=[
            OpenApiParameter(
                name="q",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Termo parcial para autocomplete",
                required=True,
            ),
            OpenApiParameter(
                name="limit",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Número máximo de sugestões (default: 10)",
                required=False,
            ),
        ],
        responses={
            200: {
                "description": "Sugestões de autocomplete",
                "content": {
                    "application/json": {
                        "example": {
                            "suggestions": [
                                {
                                    "id": "1",
                                    "titulo": "Feedback sobre atendimento",
                                    "protocolo": "OUVY-1234-5678",
                                },
                                {
                                    "id": "2",
                                    "titulo": "Feedback sobre produto",
                                    "protocolo": "OUVY-2345-6789",
                                },
                            ]
                        }
                    }
                },
            }
        },
        tags=["Busca"],
    )
    def get(self, request):
        """Retorna sugestões de autocomplete"""

        if not SEARCH_AVAILABLE:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)

        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response({"suggestions": []})

        try:
            limit = min(int(request.query_params.get("limit", 10)), 20)
        except ValueError:
            limit = 10

        try:
            assert get_search_service is not None  # Type guard
            search_service = get_search_service(request)
            suggestions = search_service.autocomplete(query=query, limit=limit)

            return Response({"suggestions": suggestions})

        except Exception:
            return Response({"suggestions": []})


class SearchByProtocolView(APIView):
    """
    Busca por protocolo específico
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="search_by_protocol",
        summary="Busca por protocolo",
        description="Busca feedback por número de protocolo exato",
        parameters=[
            OpenApiParameter(
                name="protocolo",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="Número do protocolo (ex: OUVY-1234-5678)",
                required=True,
            ),
        ],
        responses={
            200: {"description": "Feedback encontrado"},
            404: {"description": "Feedback não encontrado"},
        },
        tags=["Busca"],
    )
    def get(self, request, protocolo):
        """Busca feedback por protocolo"""

        if not SEARCH_AVAILABLE:
            # Fallback para busca no banco
            from apps.feedbacks.models import Feedback

            try:
                feedback = Feedback.objects.get(
                    protocolo=protocolo.upper(), client__owner=request.user
                )
                return Response(
                    {
                        "id": feedback.id,
                        "protocolo": feedback.protocolo,
                        "titulo": feedback.titulo,
                        "tipo": feedback.tipo,
                        "status": feedback.status,
                    }
                )
            except Feedback.DoesNotExist:
                return Response(
                    {"error": "Feedback não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        try:
            assert get_search_service is not None  # Type guard
            search_service = get_search_service(request)
            result = search_service.search_by_protocol(protocolo)

            if result:
                return Response(
                    {
                        "id": result.id,
                        "protocolo": result.protocolo,
                        "titulo": result.titulo,
                        "descricao": result.descricao,
                        "tipo": result.tipo,
                        "status": result.status,
                    }
                )

            return Response(
                {"error": "Feedback não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception:
            return Response(
                {"error": "Erro ao buscar feedback"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
