from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Prefetch, Q, QuerySet
from datetime import timedelta
from typing import Any
from .models import Feedback, FeedbackInteracao
from .serializers import (
    FeedbackSerializer,
    FeedbackConsultaSerializer,
    FeedbackDetailSerializer,
    FeedbackInteracaoSerializer,
)
from .throttles import ProtocoloConsultaThrottle, FeedbackCriacaoThrottle
from .constants import (
    InteracaoTipo,
    FeedbackStatus,
    MAX_INTERACAO_MENSAGEM_LENGTH,
)
from apps.core.utils import get_client_ip, build_search_query, get_current_tenant
from apps.core.sanitizers import sanitize_html_input, sanitize_protocol_code
from apps.core.pagination import StandardResultsSetPagination
import logging

logger = logging.getLogger(__name__)


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Feedbacks.
    
    O isolamento de dados acontece automaticamente graças ao TenantAwareModel.
    Cada tenant só consegue ver/editar seus próprios feedbacks.
    
    Endpoints disponíveis:
    - POST /api/feedbacks/ - Criar novo feedback (retorna protocolo)
    - GET /api/feedbacks/ - Listar feedbacks do tenant (autenticado, paginado)
    - GET /api/feedbacks/{id}/ - Detalhes de um feedback (autenticado)
    - GET /api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY - Consulta pública
    
    Paginação:
    - 20 itens por página (padrão)
    - Customizável com ?page_size=50 (max 100)
    - Usa StandardResultsSetPagination
    """
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_permissions(self):
        """Permite público apenas nos endpoints explícitos de protocolo."""
        if getattr(self, 'action', None) in ['create', 'consultar_protocolo', 'responder_protocolo']:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]
    
    def get_queryset(self) -> QuerySet[Feedback]:  # type: ignore[override]
        """
        Retorna o queryset filtrado por tenant com otimizações.
        
        Otimizações aplicadas:
        - select_related('client'): Reduz N+1 queries ao buscar feedbacks
        - prefetch_related('interacoes'): Pré-carrega interações para detail views
        - Ordenação por data_criacao descendente
        """
        queryset = Feedback.objects.filter(client__isnull=False)
        
        # Sempre trazer client em uma única query
        queryset = queryset.select_related('client', 'autor')
        
        # Se for detail view, pré-carregar interações
        if getattr(self, 'action', None) in ['retrieve', 'adicionar_interacao']:
            queryset = queryset.prefetch_related(
                Prefetch(
                    'interacoes',
                    queryset=FeedbackInteracao.objects.select_related('autor').order_by('data')
                )
            )
        
        # Aplicar filtros de busca se fornecidos
        search = self.request.query_params.get('search', '').strip()  # type: ignore[attr-defined]
        if search:
            queryset = queryset.filter(
                Q(protocolo__icontains=search) |
                Q(titulo__icontains=search) |
                Q(email_contato__icontains=search)
            )
        
        # Filtro por status
        status_filter = self.request.query_params.get('status', '').strip()  # type: ignore[attr-defined]
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtro por tipo
        tipo_filter = self.request.query_params.get('tipo', '').strip()  # type: ignore[attr-defined]
        if tipo_filter:
            queryset = queryset.filter(tipo=tipo_filter)
        
        return queryset.order_by('-data_criacao')
    
    def get_serializer_class(self) -> type[FeedbackSerializer | FeedbackDetailSerializer]:  # type: ignore[override]
        if getattr(self, 'action', None) in ['retrieve']:
            return FeedbackDetailSerializer
        return super().get_serializer_class()
    
    def get_throttles(self):
        """
        Aplica throttle específico dependendo da action.
        
        - create: FeedbackCriacaoThrottle (10/hora)
        - consultar_protocolo: ProtocoloConsultaThrottle (10/min por IP+Protocolo)
        - responder_protocolo: ProtocoloConsultaThrottle (10/min por IP+Protocolo)
        - outros: throttles padrão do DRF
        """
        if self.action == 'create':
            return [FeedbackCriacaoThrottle()]
        return super().get_throttles()
    
    def perform_create(self, serializer):
        """
        Sobrescreve o método de criação para garantir que o tenant
        seja preenchido automaticamente via TenantAwareModel.
        O protocolo também é gerado automaticamente no save() do modelo.
        """
        feedback = serializer.save()
        
        # Log de criação de feedback
        logger.info(
            f"✅ Feedback criado | "
            f"Protocolo: {feedback.protocolo} | "
            f"Tipo: {feedback.tipo} | "
            f"Tenant: {feedback.client.nome}"
        )

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='adicionar-interacao'
    )
    def adicionar_interacao(self, request, pk=None):
        """
        Adiciona uma interação ao feedback.

        Body esperado:
        - mensagem: string (obrigatório)
        - tipo: 'MENSAGEM_PUBLICA' | 'NOTA_INTERNA' | 'MUDANCA_STATUS' (obrigatório)
        - novo_status: string (opcional, obrigatório se tipo='MUDANCA_STATUS')
        """
        try:
            feedback = self.get_queryset().select_related('client').get(pk=pk)
        except Feedback.DoesNotExist:
            logger.warning(
                f"⚠️ Tentativa de adicionar interação em feedback inexistente | "
                f"ID: {pk} | IP: {get_client_ip(request)}"
            )
            return Response({"error": "Feedback não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        mensagem = (request.data.get('mensagem') or '').strip()
        tipo = (request.data.get('tipo') or '').strip().upper()
        novo_status = (request.data.get('novo_status') or request.data.get('status') or '').strip()

        if not mensagem:
            return Response({"error": "Campo 'mensagem' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Sanitizar mensagem contra XSS
        mensagem = sanitize_html_input(mensagem, max_length=MAX_INTERACAO_MENSAGEM_LENGTH)
        
        # Validar tipo usando constantes do modelo
        valid_tipos = InteracaoTipo.values()
        if tipo not in valid_tipos:
            return Response(
                {"error": f"Tipo inválido. Use um de: {valid_tipos}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if tipo == InteracaoTipo.MUDANCA_STATUS:
            if not novo_status:
                return Response(
                    {"error": "Campo 'novo_status' é obrigatório para mudanças de status"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Validar novo_status usando constantes
            valid_status = FeedbackStatus.values()
            if novo_status not in valid_status:
                return Response(
                    {"error": f"Status inválido. Use um de: {valid_status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Criar interação
        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            autor=request.user if request.user and request.user.is_authenticated else None,
            mensagem=mensagem,
            tipo=tipo,
        )

        # Atualizar status se necessário
        if tipo == InteracaoTipo.MUDANCA_STATUS:
            feedback.status = novo_status
            feedback.save(update_fields=['status', 'data_atualizacao'])

        logger.info(
            f"🗨️ Interação adicionada | Feedback: {feedback.protocolo} | Tipo: {tipo} | Autor: "
            f"{request.user.get_username() if request.user.is_authenticated else 'Anónimo'}"
        )

        # Retornar detalhes atualizados do feedback (inclui histórico)
        serializer = FeedbackDetailSerializer(feedback)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='dashboard-stats'
    )
    def dashboard_stats(self, request):
        """
        Endpoint leve para estatísticas do dashboard.
        
        Retorna KPIs do tenant atual:
        - Total de feedbacks
        - Pendentes (status='pendente')
        - Resolvidos (status='resolvido')
        - Criados nas últimas 24 horas
        
        **Uso:**
        GET /api/feedbacks/dashboard-stats/
        
        **Resposta (200):**
        {"total": 150, "pendentes": 12, "resolvidos": 98, "hoje": 5, "taxa_resolucao": "65.3%"}
        
        **Observações:**
        - Filtra automaticamente pelo tenant atual (via TenantAwareModel)
        - Não requer autenticação (público para o tenant)
        - Otimizado para performance (usa agregações do Django ORM)
        """
        # Obter queryset já filtrado pelo tenant
        queryset = self.get_queryset()
        
        # Calcular timestamp de 24h atrás
        hoje_inicio = timezone.now() - timedelta(hours=24)
        
        # Estatísticas usando agregação eficiente (1 query em vez de 4)
        from django.db.models import Count, Q
        
        stats = queryset.aggregate(
            total=Count('id'),
            pendentes=Count('id', filter=Q(status='pendente')),
            resolvidos=Count('id', filter=Q(status='resolvido')),
            hoje=Count('id', filter=Q(data_criacao__gte=hoje_inicio))
        )
        
        total = stats['total']
        pendentes = stats['pendentes']
        resolvidos = stats['resolvidos']
        hoje = stats['hoje']
        
        # Calcular taxa de resolução (evitar divisão por zero)
        taxa_resolucao = f"{(resolvidos / total * 100):.1f}%" if total > 0 else "0%"
        
        # Log da consulta de estatísticas
        tenant = getattr(request, 'tenant', None)
        tenant_nome = tenant.nome if tenant else 'Unknown'
        
        logger.info(
            f"📊 Dashboard stats consultado | "
            f"Tenant: {tenant_nome} | "
            f"Total: {total} | Pendentes: {pendentes} | "
            f"Resolvidos: {resolvidos} | Hoje: {hoje}"
        )
        
        return Response({
            "total": total,
            "pendentes": pendentes,
            "resolvidos": resolvidos,
            "hoje": hoje,
            "taxa_resolucao": taxa_resolucao
        }, status=status.HTTP_200_OK)
    
    @action(
        detail=False, 
        methods=['get'], 
        permission_classes=[permissions.AllowAny],
        throttle_classes=[ProtocoloConsultaThrottle],  # Rate limiting: 5 req/min
        url_path='consultar-protocolo'
    )
    def consultar_protocolo(self, request):
        """
        Endpoint público para consultar o status de um feedback usando o protocolo.
        
        ✅ CORREÇÃO DE SEGURANÇA (2026-01-27):
        - Adicionada validação EXPLÍCITA de tenant
        - Feedback agora é filtrado por tenant AND protocolo
        - Previne vazamento de dados entre tenants
        
        **⚠️ PROTEÇÃO CONTRA FORÇA BRUTA:**
        - Rate limit: 5 requisições por minuto por IP
        - Logs de tentativas excessivas
        - Erro 429 quando limite é excedido
        
        **🔒 PROTEÇÃO CONTRA VAZAMENTO DE DADOS:**
        - Requer identificação do tenant (header X-Tenant-ID ou subdomínio)
        - Filtra explicitamente por tenant + protocolo
        - Erro genérico 404 se não encontrar (não revela se protocolo existe)
        
        **Uso:**
        GET /api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY
        Headers: X-Tenant-ID: 123
        
        **Parâmetros:**
        - codigo (required): Código do protocolo (ex: OUVY-A3B9-K7M2)
        
        **Observações:**
        - Não requer autenticação (público para o tenant)
        - Não expõe dados sensíveis (email, descrição completa)
        - Retorna apenas dados seguros via FeedbackConsultaSerializer
        """
        codigo = request.query_params.get('codigo', '').strip().upper()
        
        if not codigo:
            client_ip = get_client_ip(request)
            logger.warning(
                f"⚠️ Tentativa de consulta sem código | IP: {client_ip}"
            )
            return Response(
                {
                    "error": "Parâmetro 'codigo' é obrigatório",
                    "exemplo": "/api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ CORREÇÃO CRÍTICA: Validar tenant antes de buscar feedback
        tenant = get_current_tenant()
        if not tenant:
            client_ip = get_client_ip(request)
            logger.error(
                f"🚨 SEGURANÇA: Tentativa de consulta sem tenant identificado | "
                f"Protocolo: {codigo} | IP: {client_ip}"
            )
            return Response(
                {
                    "error": "Tenant não identificado",
                    "detail": "É necessário identificar o tenant através do subdomínio ou header X-Tenant-ID"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sanitizar input contra injeção
        codigo = sanitize_protocol_code(codigo)
        
        try:
            # ✅ CORREÇÃO CRÍTICA: Filtrar EXPLICITAMENTE por tenant + protocolo
            # ANTES: Feedback.objects.all_tenants().get(protocolo=codigo)  # ❌ VULNERÁVEL
            # AGORA: Filtra por tenant E protocolo
            feedback = Feedback.objects.filter(
                client=tenant,
                protocolo=codigo
            ).select_related('client').first()
            
            if not feedback:
                # Log de tentativa com protocolo inválido ou de outro tenant
                client_ip = get_client_ip(request)
                logger.warning(
                    f"⚠️ Protocolo não encontrado ou acesso negado | "
                    f"Código: {codigo} | "
                    f"Tenant: {tenant.nome} (ID: {tenant.pk}) | "
                    f"IP: {client_ip}"
                )
                
                # ✅ IMPORTANTE: Erro genérico para não revelar se protocolo existe
                return Response(
                    {
                        "error": "Protocolo não encontrado",
                        "codigo": codigo,
                        "dica": "Verifique se o código foi digitado corretamente"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Log de consulta bem-sucedida
            client_ip = get_client_ip(request)
            logger.info(
                f"🔍 Consulta de protocolo autorizada | "
                f"Código: {codigo} | "
                f"Tenant: {tenant.nome} (ID: {tenant.pk}) | "
                f"IP: {client_ip}"
            )
            
            # Serializar apenas dados públicos
            serializer = FeedbackConsultaSerializer(feedback)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log de erro inesperado
            client_ip = get_client_ip(request)
            logger.error(
                f"❌ Erro ao consultar protocolo | "
                f"Código: {codigo} | "
                f"Tenant: {tenant.nome if tenant else 'N/A'} | "
                f"IP: {client_ip} | "
                f"Erro: {str(e)}"
            )
            
            return Response(
                {
                    "error": "Erro ao processar requisição",
                    "detail": "Ocorreu um erro inesperado. Por favor, tente novamente."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.AllowAny],
        throttle_classes=[ProtocoloConsultaThrottle],
        url_path='responder-protocolo'
    )
    def responder_protocolo(self, request):
        """
        Endpoint público para o denunciante enviar uma resposta usando o protocolo.
        
        ✅ CORREÇÃO DE SEGURANÇA (2026-01-27):
        - Adicionada validação de tenant (mesma correção que consultar_protocolo)
        
        Este é um endpoint PÚBLICO protegido apenas por rate limiting.
        Qualquer pessoa que possua um protocolo válido pode enviar mensagens.
        O autor será null (anônimo) e as mensagens são sempre do tipo MENSAGEM_PUBLICA.

        **Proteções:**
        - Rate limit: 5 requisições por minuto por IP (ProtocoloConsultaThrottle)
        - Validação: protocolo deve existir no banco de dados
        - Validação: tenant deve estar identificado
        
        **Body esperado:**
        - protocolo: string (obrigatório) - Código OUVY-XXXX-YYYY
        - mensagem: string (obrigatório) - Texto da mensagem

        **Retorna:** A interação criada (serializada com FeedbackInteracaoSerializer)
        """
        protocolo = (request.data.get('protocolo') or '').strip().upper()
        mensagem = (request.data.get('mensagem') or '').strip()

        if not protocolo:
            return Response({"error": "Campo 'protocolo' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        if not mensagem:
            return Response({"error": "Campo 'mensagem' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ CORREÇÃO: Validar tenant
        tenant = get_current_tenant()
        if not tenant:
            client_ip = get_client_ip(request)
            logger.error(
                f"🚨 SEGURANÇA: Tentativa de resposta sem tenant identificado | "
                f"Protocolo: {protocolo} | IP: {client_ip}"
            )
            return Response(
                {"error": "Tenant não identificado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sanitizar inputs contra XSS
        protocolo = sanitize_protocol_code(protocolo)
        mensagem = sanitize_html_input(mensagem, max_length=MAX_INTERACAO_MENSAGEM_LENGTH)

        try:
            # ✅ CORREÇÃO: Filtrar por tenant + protocolo
            feedback = Feedback.objects.filter(
                client=tenant,
                protocolo=protocolo
            ).select_related('client').first()
            
            if not feedback:
                client_ip = get_client_ip(request)
                logger.warning(
                    f"⚠️ Tentativa de resposta com protocolo inválido | "
                    f"Código: {protocolo} | Tenant: {tenant.nome} | IP: {client_ip}"
                )
                return Response({"error": "Protocolo não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"❌ Erro ao buscar protocolo: {str(e)}")
            return Response(
                {"error": "Erro ao processar requisição"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Criar interação pública
        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            client=feedback.client,
            autor=None,  # Mensagem anônima do denunciante
            tipo='MENSAGEM_PUBLICA',
            mensagem=mensagem,
        )

        logger.info(
            f"💬 Resposta pública adicionada | Protocolo: {protocolo} | Tenant: {tenant.nome}"
        )

        serializer = FeedbackInteracaoSerializer(interacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
