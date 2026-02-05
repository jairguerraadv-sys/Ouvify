import json
import logging
from datetime import timedelta

from django.db.models import Prefetch, Q, QuerySet
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.core.decorators import require_feature
from apps.core.exceptions import FeatureNotAvailableError
from apps.core.pagination import StandardResultsSetPagination

# ✅ CORREÇÃO DE SEGURANÇA (2026-02-05): Importar permissions customizadas RBAC
from apps.core.permissions import CanModifyFeedback
from apps.core.sanitizers import sanitize_html_input, sanitize_protocol_code
from apps.core.throttling import FeedbackSubmissionThrottle, ProtocolLookupThrottle
from apps.core.utils import get_client_ip, get_current_tenant
from apps.core.utils.privacy import anonymize_ip

from .constants import MAX_INTERACAO_MENSAGEM_LENGTH, FeedbackStatus, InteracaoTipo
from .filters import FeedbackFilter
from .models import Feedback, FeedbackArquivo, FeedbackInteracao, ResponseTemplate, Tag
from .serializers import (
    FeedbackArquivoSerializer,
    FeedbackArquivoUploadSerializer,
    FeedbackConsultaSerializer,
    FeedbackDetailSerializer,
    FeedbackInteracaoSerializer,
    FeedbackSerializer,
    ResponseTemplateRenderSerializer,
    ResponseTemplateSerializer,
    TagSerializer,
)

logger = logging.getLogger(__name__)


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Feedbacks.

    O isolamento de dados acontece automaticamente graças ao TenantAwareModel.
    Cada tenant só consegue ver/editar seus próprios feedbacks.

    🔒 RBAC (2026-02-05):
    - VIEWER: Apenas leitura (GET)
    - MODERATOR: Pode modificar feedbacks não-internos
    - ADMIN/OWNER: Acesso total

    Endpoints disponíveis:
    - POST /api/feedbacks/ - Criar novo feedback (retorna protocolo)
    - GET /api/feedbacks/ - Listar feedbacks do tenant (autenticado, paginado)
    - GET /api/feedbacks/{id}/ - Detalhes de um feedback (autenticado)
    - GET /api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY - Consulta pública
    - POST /api/feedbacks/{id}/assign/ - Atribuir feedback para team member
    - POST /api/feedbacks/{id}/unassign/ - Remover atribuição

    Paginação:
    - 20 itens por página (padrão)
    - Customizável com ?page_size=50 (max 100)
    - Usa StandardResultsSetPagination
    """

    serializer_class = FeedbackSerializer
    # ✅ CORREÇÃO RBAC (2026-02-05): VIEWER não pode modificar, apenas ler
    permission_classes = [permissions.IsAuthenticated, CanModifyFeedback]
    pagination_class = StandardResultsSetPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filterset_class = FeedbackFilter

    def get_permissions(self):
        """Permite público apenas nos endpoints explícitos de protocolo."""
        if getattr(self, "action", None) in [
            "create",
            "consultar_protocolo",
            "responder_protocolo",
            "upload_arquivo",
        ]:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self) -> QuerySet[Feedback]:  # type: ignore[override]
        """
        Retorna o queryset filtrado por tenant com otimizações.

        Otimizações aplicadas (Auditoria Fase 3):
        - select_related('client', 'autor'): Reduz N+1 queries em ForeignKeys
        - prefetch_related('interacoes', 'arquivos'): Pré-carrega relações reversas
        - Ordenação por data_criacao descendente (com índice)

        Performance:
        - ANTES: 1 + N + N queries (201 queries para 100 feedbacks)
        - DEPOIS: 3 queries (feedback + interacoes + arquivos)
        - REDUÇÃO: 98.5% em queries
        """
        queryset = Feedback.objects.filter(client__isnull=False)

        # ✅ OTIMIZAÇÃO FASE 3: Eager loading de ForeignKeys
        # Sempre trazer client e autor em uma única query (JOINs)
        queryset = queryset.select_related("client", "autor")

        # ✅ OTIMIZAÇÃO FASE 3: Prefetch relações reversas (SEMPRE, não só no retrieve)
        # CORREÇÃO: Aplicar prefetch também em list action para evitar N+1
        queryset = queryset.prefetch_related(
            Prefetch(
                "interacoes",
                queryset=FeedbackInteracao.objects.select_related("autor").order_by(
                    "data"
                ),
            ),
            "arquivos",  # Pré-carregar arquivos anexados
        )

        # Aplicar filtros de busca se fornecidos
        search = self.request.query_params.get("search", "").strip()  # type: ignore[attr-defined]
        if search:
            queryset = queryset.filter(
                Q(protocolo__icontains=search)
                | Q(titulo__icontains=search)
                | Q(email_contato__icontains=search)
            )

        # Filtro por status
        status_filter = self.request.query_params.get("status", "").strip()  # type: ignore[attr-defined]
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filtro por tipo
        tipo_filter = self.request.query_params.get("tipo", "").strip()  # type: ignore[attr-defined]
        if tipo_filter:
            queryset = queryset.filter(tipo=tipo_filter)

        # ✅ OTIMIZAÇÃO FASE 3: Ordenação com índice composto
        # Índice: (client_id, status, data_criacao DESC)
        return queryset.order_by("-data_criacao")

    def get_serializer_class(self) -> type[FeedbackSerializer | FeedbackDetailSerializer]:  # type: ignore[override]
        if getattr(self, "action", None) in ["retrieve"]:
            return FeedbackDetailSerializer
        return super().get_serializer_class()

    def get_throttles(self):
        """
        Aplica throttle específico dependendo da action.

        - create: FeedbackSubmissionThrottle (5/hora por tenant) - FASE 3: AL-005
        - consultar_protocolo: ProtocolLookupThrottle (20/hora por IP) - FASE 3: AL-006
        - outros: throttles padrão do DRF
        """
        if self.action == "create":
            return [FeedbackSubmissionThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        """
        Sobrescreve o método de criação para garantir que o tenant
        seja preenchido automaticamente via TenantAwareModel.
        O protocolo também é gerado automaticamente no save() do modelo.

        Valida limite de feedbacks por plano antes de criar.
        """
        tenant = get_current_tenant()

        # Validar limite de feedbacks
        if tenant and not tenant.can_create_feedback():
            raise FeatureNotAvailableError(
                feature="feedback_limit",
                message=(
                    f"Limite de {tenant.get_feedback_limit()} feedbacks atingido para plano {tenant.plano.upper()}. "
                    f"Você já possui {tenant.get_current_feedback_count()} feedbacks. "
                    f"Faça upgrade para continuar criando feedbacks."
                ),
            )

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
        methods=["post"],
        permission_classes=[permissions.AllowAny],
        url_path="adicionar-interacao",
    )
    def adicionar_interacao(self, request, pk=None):
        """
        Adiciona uma interação ao feedback.

        - Empresa autenticada: cria PERGUNTA_EMPRESA (ou MUDANCA_STATUS / NOTA_INTERNA / MENSAGEM_AUTOMATICA).
        - Denunciante anônimo: valida protocolo e cria RESPOSTA_USUARIO.
        """
        tenant = get_current_tenant()
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        mensagem = (request.data.get("mensagem") or "").strip()
        if not mensagem:
            return Response(
                {"error": "Campo 'mensagem' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        mensagem = sanitize_html_input(
            mensagem, max_length=MAX_INTERACAO_MENSAGEM_LENGTH
        )

        is_company = bool(request.user and request.user.is_authenticated)
        tipo_request = (request.data.get("tipo") or "").strip().upper()
        if tipo_request == "RESPOSTA":
            tipo_request = InteracaoTipo.MENSAGEM_PUBLICA
        novo_status = (
            request.data.get("novo_status") or request.data.get("status") or ""
        ).strip()

        if is_company:
            try:
                feedback = (
                    self.get_queryset()
                    .select_related("client")
                    .get(pk=pk, client=tenant)
                )
            except Feedback.DoesNotExist:
                logger.warning(
                    f"⚠️ Tentativa de adicionar interação em feedback inexistente | "
                    f"ID: {pk} | Tenant: {tenant.nome} | IP: {anonymize_ip(get_client_ip(request))}"
                )
                return Response(
                    {"error": "Feedback não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            allowed_company_types = {
                InteracaoTipo.MENSAGEM_PUBLICA,
                InteracaoTipo.PERGUNTA_EMPRESA,
                InteracaoTipo.MUDANCA_STATUS,
                InteracaoTipo.NOTA_INTERNA,
                InteracaoTipo.MENSAGEM_AUTOMATICA,
            }
            tipo = tipo_request or InteracaoTipo.PERGUNTA_EMPRESA
            if tipo not in allowed_company_types:
                return Response(
                    {
                        "error": f"Tipo inválido. Use um de: {sorted(allowed_company_types)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ✅ FEATURE GATING: Validar se o tenant pode criar notas internas
            if tipo == InteracaoTipo.NOTA_INTERNA:
                if not tenant.has_feature_internal_notes():
                    raise FeatureNotAvailableError(
                        feature="allow_internal_notes",
                        plan=tenant.plano,
                        message=tenant.get_upgrade_message("allow_internal_notes"),
                    )

            if tipo == InteracaoTipo.MUDANCA_STATUS:
                valid_status = FeedbackStatus.values()
                if not novo_status or novo_status not in valid_status:
                    return Response(
                        {"error": f"Status inválido. Use um de: {valid_status}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            autor = request.user
        else:
            protocolo = sanitize_protocol_code(
                (request.data.get("protocolo") or "").strip().upper()
            )
            if not protocolo:
                return Response(
                    {"error": "Campo 'protocolo' é obrigatório"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            feedback = (
                Feedback.objects.filter(client=tenant, protocolo=protocolo)
                .select_related("client", "autor")
                .first()
            )
            if not feedback:
                logger.warning(
                    f"⚠️ Protocolo não encontrado para resposta anônima | "
                    f"Código: {protocolo} | Tenant: {tenant.nome} | IP: {anonymize_ip(get_client_ip(request))}"
                )
                return Response(
                    {"error": "Protocolo não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            tipo = InteracaoTipo.RESPOSTA_USUARIO
            autor = None
            novo_status = None

        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            client=feedback.client,
            autor=autor,
            tipo=tipo,
            mensagem=mensagem,
        )

        if is_company and tipo == InteracaoTipo.MUDANCA_STATUS and novo_status:
            feedback.status = novo_status
            feedback.save(update_fields=["status", "data_atualizacao"])

        logger.info(
            f"🗨️ Interação adicionada | Feedback: {feedback.protocolo} | Tipo: {tipo} | Autor: "
            f"{autor.get_username() if autor else 'Anônimo'}"
        )

        if is_company:
            serializer = FeedbackDetailSerializer(feedback)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        serializer = FeedbackInteracaoSerializer(interacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
        parser_classes=[MultiPartParser, FormParser],
        url_path="upload-arquivo",
    )
    def upload_arquivo(self, request, pk=None):
        """
        Upload de arquivo anexado a um feedback.

        🔒 FEATURE GATING: Requer plano PRO ou superior.

        **Permissões:**
        - Empresa autenticada: valida `has_feature_attachments()`
        - Denunciante anônimo: valida protocolo + feature do tenant

        **Body (multipart/form-data):**
        - arquivo: File (obrigatório) - Arquivo a ser anexado
        - protocolo: string (obrigatório se anônimo) - Código OUVY-XXXX-YYYY
        - interno: boolean (opcional) - Se True, só empresa vê

        **Limites:**
        - Tamanho máximo: 10MB
        - Tipos permitidos: imagens, PDF, documentos Office

        **Retorna:**
        - 201: Arquivo criado com URL
        - 403: Feature bloqueada ou permissão negada
        - 400: Validação falhou
        """
        tenant = get_current_tenant()
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ VALIDAÇÃO CRÍTICA: Verificar se tenant tem feature de anexos
        if not tenant.has_feature_attachments():
            from apps.tenants.plans import PlanFeatures

            upgrade_msg = PlanFeatures.get_upgrade_message(
                tenant.plano, "allow_attachments"
            )

            logger.warning(
                f"🚫 Tentativa de upload sem feature | "
                f"Tenant: {tenant.nome} | Plano: {tenant.plano}"
            )

            raise FeatureNotAvailableError(
                feature="allow_attachments", plan=tenant.plano, message=upgrade_msg
            )

        # Validar input
        serializer = FeedbackArquivoUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Type hints para Pylance
        validated_data = serializer.validated_data
        arquivo = validated_data["arquivo"]
        protocolo = str(validated_data.get("protocolo", "")).strip().upper()
        interno = bool(validated_data.get("interno", False))

        # Determinar se é empresa ou denunciante
        is_company = bool(request.user and request.user.is_authenticated)

        if is_company:
            # Empresa autenticada: buscar feedback por ID
            try:
                feedback = (
                    self.get_queryset()
                    .select_related("client")
                    .get(pk=pk, client=tenant)
                )
            except Feedback.DoesNotExist:
                logger.warning(
                    f"⚠️ Tentativa de upload em feedback inexistente | "
                    f"ID: {pk} | Tenant: {tenant.nome}"
                )
                return Response(
                    {"error": "Feedback não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            enviado_por = request.user

            # Empresa pode enviar arquivos internos
            if interno and not tenant.has_feature_internal_notes():
                return Response(
                    {"error": "Seu plano não permite arquivos internos"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        else:
            # Denunciante anônimo: validar protocolo
            if not protocolo:
                return Response(
                    {"error": "Campo 'protocolo' é obrigatório para envio anônimo"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            protocolo = sanitize_protocol_code(protocolo)

            feedback = (
                Feedback.objects.filter(client=tenant, protocolo=protocolo)
                .select_related("client", "autor")
                .first()
            )

            if not feedback:
                logger.warning(
                    f"⚠️ Protocolo não encontrado para upload | "
                    f"Código: {protocolo} | Tenant: {tenant.nome}"
                )
                return Response(
                    {"error": "Protocolo não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            enviado_por = None
            interno = False  # Denunciante não envia arquivos internos

        # Criar registro de arquivo
        try:
            feedback_arquivo = FeedbackArquivo.objects.create(
                feedback=feedback,
                client=feedback.client,
                arquivo=arquivo,
                nome_original=arquivo.name,
                tipo_mime=arquivo.content_type,
                tamanho_bytes=arquivo.size,
                enviado_por=enviado_por,
                interno=interno,
            )

            logger.info(
                f"📎 Arquivo anexado | "
                f"Feedback: {feedback.protocolo} | "
                f"Arquivo: {arquivo.name} | "
                f"Tamanho: {feedback_arquivo.tamanho_mb}MB | "
                f"Enviado por: {enviado_por.get_username() if enviado_por else 'Anônimo'} | "
                f"Interno: {interno}"
            )

            serializer = FeedbackArquivoSerializer(feedback_arquivo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"❌ Erro ao fazer upload de arquivo: {str(e)}")
            return Response(
                {"error": "Erro ao processar upload. Tente novamente."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="dashboard-stats",
    )
    def dashboard_stats(self, request):
        """
        Endpoint leve para estatísticas do dashboard com cache.

        Retorna KPIs do tenant atual:
        - Total de feedbacks
        - Pendentes (status='pendente')
        - Resolvidos (status='resolvido')
        - Criados nas últimas 24 horas

        **Uso:**
        GET /api/feedbacks/dashboard-stats/

        **Resposta (200):**
        {"total": 150, "pendentes": 12, "resolvidos": 98, "hoje": 5, "taxa_resolucao": "65.3%", "cached": true}

        **Observações:**
        - Filtra automaticamente pelo tenant atual (via TenantAwareModel)
        - Cache de 5 minutos (invalidado ao criar/editar/deletar feedback)
        - Otimizado: 1 query (agregação) vs 4 queries (antes da Fase 3)

        **Performance (Auditoria Fase 3):**
        - ANTES: 4 queries separadas (COUNT por status)
        - DEPOIS: 1 query com aggregate + cache de 5min
        - REDUÇÃO: 99.9% de carga no DB (1 query/5min vs 1 query/request)
        """
        # ✅ OTIMIZAÇÃO FASE 3: Cache de 5 minutos
        from django.core.cache import cache

        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        cache_key = f"dashboard_stats:{tenant.id}"

        # Tentar buscar do cache primeiro
        cached_stats = cache.get(cache_key)
        if cached_stats:
            cached_stats["cached"] = True  # Indicar que veio do cache
            logger.debug(f"📊 Dashboard stats (CACHE HIT) | Tenant: {tenant.nome}")
            return Response(cached_stats, status=status.HTTP_200_OK)

        # Se não tem cache, calcular
        queryset = self.get_queryset()
        hoje_inicio = timezone.now() - timedelta(hours=24)

        # ✅ OTIMIZAÇÃO FASE 3: Agregação em 1 única query
        from django.db.models import Count, Q

        stats = queryset.aggregate(
            total=Count("id"),
            pendentes=Count("id", filter=Q(status="pendente")),
            resolvidos=Count("id", filter=Q(status="resolvido")),
            hoje=Count("id", filter=Q(data_criacao__gte=hoje_inicio)),
        )

        total = stats["total"]
        pendentes = stats["pendentes"]
        resolvidos = stats["resolvidos"]
        hoje = stats["hoje"]

        # Calcular taxa de resolução
        taxa_resolucao = f"{(resolvidos / total * 100):.1f}%" if total > 0 else "0%"

        response_data = {
            "total": total,
            "pendentes": pendentes,
            "resolvidos": resolvidos,
            "hoje": hoje,
            "taxa_resolucao": taxa_resolucao,
            "cached": False,  # Indicar que é dado fresco
        }

        # ✅ Cachear por 5 minutos (300 segundos)
        cache.set(cache_key, response_data, timeout=300)

        logger.info(
            f"📊 Dashboard stats (CALCULADO) | "
            f"Tenant: {tenant.nome} | "
            f"Total: {total} | Pendentes: {pendentes} | "
            f"Resolvidos: {resolvidos} | Hoje: {hoje}"
        )

        return Response(response_data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="analytics",
    )
    def analytics(self, request):
        """
        Endpoint de analytics avançado com métricas de SLA.

        Sprint 3 - Dashboard Analytics (8h)

        **Parâmetros:**
        - periodo: 7, 30, 90 dias (default: 30)

        **Resposta:**
        {
            "periodo": {"inicio": "2026-01-01", "fim": "2026-01-27", "dias": 30},
            "resumo": {"total": 150, "resolvidos": 98, "pendentes": 12, "em_andamento": 40},
            "sla": {
                "primeira_resposta": {"dentro": 85, "fora": 13, "taxa_cumprimento": "86.7%"},
                "resolucao": {"dentro": 70, "fora": 28, "taxa_cumprimento": "71.4%"},
                "tempo_medio_resposta": "4h 32m",
                "tempo_medio_resolucao": "18h 45m"
            },
            "por_prioridade": {"baixa": 30, "media": 80, "alta": 35, "critica": 5},
            "por_tipo": {"reclamacao": 50, "sugestao": 40, "denuncia": 30, "elogio": 30},
            "por_status": {"novo": 10, "pendente": 12, "em_andamento": 40, "resolvido": 98},
            "tendencia": [{"data": "2026-01-20", "criados": 5, "resolvidos": 3}, ...],
            "top_tags": [{"nome": "Bug", "count": 25}, {"nome": "UX", "count": 18}]
        }
        """
        from django.core.cache import cache
        from django.db.models import Avg, Count, Q
        from django.db.models.functions import TruncDate

        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Período de análise (default: 30 dias)
        periodo_dias = int(request.query_params.get("periodo", 30))
        if periodo_dias not in [7, 30, 90]:
            periodo_dias = 30

        cache_key = f"analytics:{tenant.id}:{periodo_dias}"

        # Tentar cache primeiro
        cached_data = cache.get(cache_key)
        if cached_data:
            cached_data["cached"] = True
            return Response(cached_data, status=status.HTTP_200_OK)

        # Calcular datas
        data_fim = timezone.now()
        data_inicio = data_fim - timedelta(days=periodo_dias)

        # Queryset filtrado pelo período
        queryset = self.get_queryset().filter(data_criacao__gte=data_inicio)

        # ===========================================
        # 1. RESUMO GERAL
        # ===========================================
        resumo = queryset.aggregate(
            total=Count("id"),
            resolvidos=Count("id", filter=Q(status="resolvido")),
            pendentes=Count("id", filter=Q(status="pendente")),
            em_andamento=Count("id", filter=Q(status="em_andamento")),
            novos=Count("id", filter=Q(status="novo")),
        )

        # ===========================================
        # 2. MÉTRICAS DE SLA
        # ===========================================
        sla_stats = queryset.filter(data_primeira_resposta__isnull=False).aggregate(
            sla_resposta_dentro=Count("id", filter=Q(sla_primeira_resposta=True)),
            sla_resposta_fora=Count("id", filter=Q(sla_primeira_resposta=False)),
            tempo_medio_resposta=Avg("tempo_primeira_resposta"),
        )

        resolucao_stats = queryset.filter(data_resolucao__isnull=False).aggregate(
            sla_resolucao_dentro=Count("id", filter=Q(sla_resolucao=True)),
            sla_resolucao_fora=Count("id", filter=Q(sla_resolucao=False)),
            tempo_medio_resolucao=Avg("tempo_resolucao"),
        )

        # Calcular taxas de cumprimento
        total_com_resposta = (sla_stats["sla_resposta_dentro"] or 0) + (
            sla_stats["sla_resposta_fora"] or 0
        )
        total_resolvidos = (resolucao_stats["sla_resolucao_dentro"] or 0) + (
            resolucao_stats["sla_resolucao_fora"] or 0
        )

        taxa_sla_resposta = (
            f"{(sla_stats['sla_resposta_dentro'] / total_com_resposta * 100):.1f}%"
            if total_com_resposta > 0
            else "N/A"
        )
        taxa_sla_resolucao = (
            f"{(resolucao_stats['sla_resolucao_dentro'] / total_resolvidos * 100):.1f}%"
            if total_resolvidos > 0
            else "N/A"
        )

        # Formatar tempos médios
        def format_duration(td):
            if not td:
                return "N/A"
            total_seconds = int(td.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            return f"{hours}h {minutes}m"

        sla_data = {
            "primeira_resposta": {
                "dentro": sla_stats["sla_resposta_dentro"] or 0,
                "fora": sla_stats["sla_resposta_fora"] or 0,
                "taxa_cumprimento": taxa_sla_resposta,
            },
            "resolucao": {
                "dentro": resolucao_stats["sla_resolucao_dentro"] or 0,
                "fora": resolucao_stats["sla_resolucao_fora"] or 0,
                "taxa_cumprimento": taxa_sla_resolucao,
            },
            "tempo_medio_resposta": format_duration(sla_stats["tempo_medio_resposta"]),
            "tempo_medio_resolucao": format_duration(
                resolucao_stats["tempo_medio_resolucao"]
            ),
        }

        # ===========================================
        # 3. POR PRIORIDADE
        # ===========================================
        por_prioridade = dict(
            queryset.values("prioridade")
            .annotate(count=Count("id"))
            .values_list("prioridade", "count")
        )

        # ===========================================
        # 4. POR TIPO
        # ===========================================
        por_tipo = dict(
            queryset.values("tipo")
            .annotate(count=Count("id"))
            .values_list("tipo", "count")
        )

        # ===========================================
        # 5. POR STATUS
        # ===========================================
        por_status = dict(
            queryset.values("status")
            .annotate(count=Count("id"))
            .values_list("status", "count")
        )

        # ===========================================
        # 6. TENDÊNCIA (criados vs resolvidos por dia)
        # ===========================================
        tendencia_criados = (
            queryset.annotate(data=TruncDate("data_criacao"))
            .values("data")
            .annotate(criados=Count("id"))
            .order_by("data")
        )

        tendencia_resolvidos = (
            queryset.filter(data_resolucao__isnull=False)
            .annotate(data=TruncDate("data_resolucao"))
            .values("data")
            .annotate(resolvidos=Count("id"))
            .order_by("data")
        )

        # Combinar tendências
        tendencia_dict = {}
        for item in tendencia_criados:
            data_str = item["data"].isoformat() if item["data"] else None
            if data_str:
                tendencia_dict[data_str] = {
                    "data": data_str,
                    "criados": item["criados"],
                    "resolvidos": 0,
                }

        for item in tendencia_resolvidos:
            data_str = item["data"].isoformat() if item["data"] else None
            if data_str:
                if data_str in tendencia_dict:
                    tendencia_dict[data_str]["resolvidos"] = item["resolvidos"]
                else:
                    tendencia_dict[data_str] = {
                        "data": data_str,
                        "criados": 0,
                        "resolvidos": item["resolvidos"],
                    }

        tendencia = sorted(tendencia_dict.values(), key=lambda x: x["data"])

        # ===========================================
        # 7. TOP TAGS
        # ===========================================
        from .models import Tag

        top_tags = list(
            Tag.objects.filter(client=tenant)
            .annotate(
                count=Count(
                    "feedbacks", filter=Q(feedbacks__data_criacao__gte=data_inicio)
                )
            )
            .filter(count__gt=0)
            .order_by("-count")
            .values("nome", "count")[:10]
        )

        # ===========================================
        # RESPONSE
        # ===========================================
        response_data = {
            "periodo": {
                "inicio": data_inicio.date().isoformat(),
                "fim": data_fim.date().isoformat(),
                "dias": periodo_dias,
            },
            "resumo": resumo,
            "sla": sla_data,
            "por_prioridade": por_prioridade,
            "por_tipo": por_tipo,
            "por_status": por_status,
            "tendencia": tendencia,
            "top_tags": top_tags,
            "cached": False,
        }

        # Cachear por 10 minutos
        cache.set(cache_key, response_data, timeout=600)

        logger.info(
            f"📊 Analytics (CALCULADO) | Tenant: {tenant.nome} | "
            f"Período: {periodo_dias}d | Total: {resumo['total']}"
        )

        return Response(response_data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="export-csv",
    )
    def export_csv(self, request):
        """
        Exporta feedbacks para CSV.

        Sprint 3 - Relatórios Exportáveis

        **Parâmetros:**
        - periodo: 7, 30, 90, all (default: 30)
        - status: filtrar por status
        - prioridade: filtrar por prioridade
        """
        import csv

        from django.http import HttpResponse

        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Período
        periodo = request.query_params.get("periodo", "30")
        queryset = self.get_queryset()

        if periodo != "all":
            try:
                dias = int(periodo)
                data_inicio = timezone.now() - timedelta(days=dias)
                queryset = queryset.filter(data_criacao__gte=data_inicio)
            except ValueError:
                pass

        # Filtros adicionais
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        prioridade_filter = request.query_params.get("prioridade")
        if prioridade_filter:
            queryset = queryset.filter(prioridade=prioridade_filter)

        # Gerar CSV
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = (
            f'attachment; filename="feedbacks_{tenant.subdominio}_{timezone.now().strftime("%Y%m%d")}.csv"'
        )

        # BOM para Excel reconhecer UTF-8
        response.write("\ufeff")

        writer = csv.writer(response)
        writer.writerow(
            [
                "Protocolo",
                "Tipo",
                "Título",
                "Status",
                "Prioridade",
                "Data Criação",
                "Data Resolução",
                "Tempo Resposta (h)",
                "Tempo Resolução (h)",
                "SLA Resposta",
                "SLA Resolução",
                "Atribuído Para",
                "Tags",
            ]
        )

        for fb in queryset.select_related("assigned_to__user").prefetch_related("tags"):
            tempo_resposta = ""
            if fb.tempo_primeira_resposta:
                tempo_resposta = (
                    f"{fb.tempo_primeira_resposta.total_seconds() / 3600:.1f}"
                )

            tempo_resolucao = ""
            if fb.tempo_resolucao:
                tempo_resolucao = f"{fb.tempo_resolucao.total_seconds() / 3600:.1f}"

            assigned_name = ""
            if fb.assigned_to and fb.assigned_to.user:
                assigned_name = (
                    fb.assigned_to.user.get_full_name() or fb.assigned_to.user.username
                )

            tags = ", ".join([t.nome for t in fb.tags.all()])

            sla_resposta = ""
            if fb.sla_primeira_resposta is not None:
                sla_resposta = "Sim" if fb.sla_primeira_resposta else "Não"

            sla_resolucao = ""
            if fb.sla_resolucao is not None:
                sla_resolucao = "Sim" if fb.sla_resolucao else "Não"

            writer.writerow(
                [
                    fb.protocolo,
                    (
                        fb.get_tipo_display()
                        if hasattr(fb, "get_tipo_display")
                        else fb.tipo
                    ),
                    fb.titulo,
                    (
                        fb.get_status_display()
                        if hasattr(fb, "get_status_display")
                        else fb.status
                    ),
                    (
                        fb.get_prioridade_display()
                        if hasattr(fb, "get_prioridade_display")
                        else fb.prioridade
                    ),
                    fb.data_criacao.strftime("%Y-%m-%d %H:%M"),
                    (
                        fb.data_resolucao.strftime("%Y-%m-%d %H:%M")
                        if fb.data_resolucao
                        else ""
                    ),
                    tempo_resposta,
                    tempo_resolucao,
                    sla_resposta,
                    sla_resolucao,
                    assigned_name,
                    tags,
                ]
            )

        logger.info(
            f"📤 CSV exportado | Tenant: {tenant.nome} | Registros: {queryset.count()}"
        )

        return response

    def _set_tenant_from_request(self, request):
        """
        🔒 CORREÇÃO DE SEGURANÇA (2026-02-05):
        Define o tenant atual APENAS via subdomínio (não aceita X-Tenant-ID).

        ⚠️ CRITICAL FIX: Removido suporte a X-Tenant-ID para endpoints públicos
        para prevenir ataques de enumeração cross-tenant.

        X-Tenant-ID só é aceito em:
        - Requisições autenticadas (middleware valida)
        - Contextos administrativos

        Endpoints públicos (como consultar-protocolo) devem usar APENAS subdomínio,
        pois subdomínio vem do DNS e não pode ser forjado pelo cliente.

        Usado para endpoints exempt no middleware (como consultar-protocolo).
        """
        from apps.core.utils import set_current_tenant
        from apps.tenants.models import Client

        # ⚠️ IMPORTANTE: X-Tenant-ID foi REMOVIDO de endpoints públicos
        # Aceitar X-Tenant-ID permitia ataques de enumeração:
        # curl -H "X-Tenant-ID: 1" /api/feedbacks/consultar-protocolo?protocolo=X
        # curl -H "X-Tenant-ID: 2" /api/feedbacks/consultar-protocolo?protocolo=X
        # ... atacante pode enumerar TODOS os tenants
        # ✅ SOLUÇÃO: Apenas subdomínio via DNS (não forjável)
        host = request.get_host()
        host_without_port = host.split(":")[0]
        parts = host_without_port.split(".")

        # Validar que não é domínio raiz (precisa de subdomínio)
        if len(parts) < 2:
            logger.warning(
                f"🚨 SEGURANÇA: Tentativa de acesso público sem subdomínio | "
                f"Host: {host} | Path: {request.path}"
            )
            return  # Sem tenant, endpoint retornará 404

        subdomain = parts[0]

        # Rejeitar subdomínios reservados do sistema
        if subdomain in ["www", "api", "admin", "app", "platform", "staging", "prod"]:
            logger.warning(
                f"🚨 SEGURANÇA: Tentativa de usar subdomínio reservado | "
                f"Subdomínio: {subdomain} | Path: {request.path}"
            )
            return  # Sem tenant, endpoint retornará 404

        try:
            tenant = Client.objects.only("id", "nome", "subdominio", "ativo").get(
                subdominio__iexact=subdomain,
                ativo=True,
            )
            set_current_tenant(tenant)
            request.tenant = tenant
            logger.info(
                f"✅ Tenant identificado via subdomínio | "
                f"Tenant: {tenant.nome} (ID: {tenant.pk}) | "
                f"Subdomínio: {subdomain}"
            )
        except Client.DoesNotExist:
            logger.warning(
                f"⚠️ Subdomínio não encontrado ou inativo | "
                f"Subdomínio: {subdomain} | "
                f"Path: {request.path}"
            )
            # Sem tenant, endpoint retornará 404 genérico

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.AllowAny],
        throttle_classes=[
            ProtocolLookupThrottle
        ],  # FASE 3: AL-006 - 20 req/hora para prevenir enumeração
        url_path="consultar-protocolo",
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
        GET /api/feedbacks/consultar-protocolo/?protocolo=OUVY-XXXX-YYYY
        Headers: X-Tenant-ID: 123

        **Parâmetros:**
        - protocolo (required): Código do protocolo (ex: OUVY-A3B9-K7M2)

        **Observações:**
        - Não requer autenticação (público para o tenant)
        - Não expõe dados sensíveis (email, descrição completa)
        - Retorna apenas dados seguros via FeedbackConsultaSerializer
        """
        # Este endpoint é público e deve evitar vazamento de informação.
        # Quando não conseguimos identificar o tenant, retornamos 404 genérico.
        if not get_current_tenant():
            self._set_tenant_from_request(request)

        codigo = request.query_params.get("protocolo", "").strip().upper()

        if not codigo:
            client_ip = get_client_ip(request)
            logger.warning(f"⚠️ Tentativa de consulta sem código | IP: {client_ip}")
            return Response(
                {
                    "error": "Parâmetro 'protocolo' é obrigatório",
                    "exemplo": "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-XXXX-YYYY",
                },
                status=status.HTTP_400_BAD_REQUEST,
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
                {"error": "Protocolo não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        # Sanitizar input contra injeção
        codigo = sanitize_protocol_code(codigo)

        try:
            # ✅ CORREÇÃO CRÍTICA: Filtrar EXPLICITAMENTE por tenant + protocolo
            # ANTES: Feedback.objects.all_tenants().get(protocolo=codigo)  # ❌ VULNERÁVEL
            # AGORA: Filtra por tenant E protocolo
            feedback = (
                Feedback.objects.filter(client=tenant, protocolo=codigo)
                .select_related("client", "autor")
                .first()
            )

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
                        "dica": "Verifique se o código foi digitado corretamente",
                    },
                    status=status.HTTP_404_NOT_FOUND,
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
                    "detail": "Ocorreu um erro inesperado. Por favor, tente novamente.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
        throttle_classes=[ProtocoloConsultaThrottle],
        url_path="responder-protocolo",
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
        protocolo = (request.data.get("protocolo") or "").strip().upper()
        mensagem = (request.data.get("mensagem") or "").strip()

        if not protocolo:
            return Response(
                {"error": "Campo 'protocolo' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not mensagem:
            return Response(
                {"error": "Campo 'mensagem' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ CORREÇÃO: Validar tenant
        tenant = get_current_tenant()
        if not tenant:
            client_ip = get_client_ip(request)
            logger.error(
                f"🚨 SEGURANÇA: Tentativa de resposta sem tenant identificado | "
                f"Protocolo: {protocolo} | IP: {client_ip}"
            )
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Sanitizar inputs contra XSS
        protocolo = sanitize_protocol_code(protocolo)
        mensagem = sanitize_html_input(
            mensagem, max_length=MAX_INTERACAO_MENSAGEM_LENGTH
        )

        try:
            # ✅ CORREÇÃO: Filtrar por tenant + protocolo
            feedback = (
                Feedback.objects.filter(client=tenant, protocolo=protocolo)
                .select_related("client", "autor")
                .first()
            )

            if not feedback:
                client_ip = get_client_ip(request)
                logger.warning(
                    f"⚠️ Tentativa de resposta com protocolo inválido | "
                    f"Código: {protocolo} | Tenant: {tenant.nome} | IP: {client_ip}"
                )
                return Response(
                    {"error": "Protocolo não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        except Exception as e:
            logger.error(f"❌ Erro ao buscar protocolo: {str(e)}")
            return Response(
                {"error": "Erro ao processar requisição"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Criar interação pública
        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            client=feedback.client,
            autor=None,  # Mensagem anônima do denunciante
            tipo="MENSAGEM_PUBLICA",
            mensagem=mensagem,
        )

        logger.info(
            f"💬 Resposta pública adicionada | Protocolo: {protocolo} | Tenant: {tenant.nome}"
        )

        serializer = FeedbackInteracaoSerializer(interacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="export",
    )
    @require_feature("export")  # ✅ Feature gating: requer plano STARTER ou PRO
    def export_feedbacks(self, request):
        """
        Exporta feedbacks do tenant em CSV ou JSON.

        🔒 FEATURE GATING: Requer plano STARTER ou PRO.

        GET /api/feedbacks/export/?format=csv&tipo=denuncia&status=pendente

        Parâmetros:
        - format: csv ou json (padrão: csv)
        - tipo: filtro por tipo (opcional)
        - status: filtro por status (opcional)
        - data_inicio: YYYY-MM-DD (opcional)
        - data_fim: YYYY-MM-DD (opcional)
        """
        import csv
        from datetime import datetime

        from django.http import HttpResponse

        format_type = request.query_params.get("format", "csv").lower()
        tipo_filter = request.query_params.get("tipo")
        status_filter = request.query_params.get("status")
        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")

        queryset = self.get_queryset()

        if tipo_filter:
            queryset = queryset.filter(tipo=tipo_filter)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if data_inicio:
            queryset = queryset.filter(data_criacao__date__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_criacao__date__lte=data_fim)

        if format_type == "json":
            data = list(
                queryset.values(
                    "protocolo",
                    "tipo",
                    "titulo",
                    "descricao",
                    "status",
                    "anonimo",
                    "email_contato",
                    "data_criacao",
                    "data_atualizacao",
                )
            )
            response = HttpResponse(
                json.dumps(data, default=str, ensure_ascii=False),
                content_type="application/json",
            )
            response["Content-Disposition"] = (
                f'attachment; filename="feedbacks_export_{datetime.now().strftime("%Y%m%d")}.json"'
            )
            return response

        # CSV export
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="feedbacks_export_{datetime.now().strftime("%Y%m%d")}.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "Protocolo",
                "Tipo",
                "Título",
                "Descrição",
                "Status",
                "Anônimo",
                "Email Contato",
                "Data Criação",
                "Data Atualização",
            ]
        )

        for feedback in queryset:
            writer.writerow(
                [
                    feedback.protocolo,
                    feedback.tipo,
                    feedback.titulo,
                    feedback.descricao,
                    feedback.status,
                    "Sim" if feedback.anonimo else "Não",
                    feedback.email_contato or "",
                    feedback.data_criacao.strftime("%Y-%m-%d %H:%M:%S"),
                    feedback.data_atualizacao.strftime("%Y-%m-%d %H:%M:%S"),
                ]
            )

        logger.info(
            f"📊 Export realizado | Tenant: {request.tenant.nome} | Formato: {format_type} | Registros: {queryset.count()}"
        )
        return response

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="export-advanced",
    )
    @require_feature("export")
    def export_advanced(self, request):
        """
        Exporta feedbacks com opções avançadas (CSV, JSON, XLSX).

        🔒 FEATURE GATING: Requer plano STARTER ou PRO.

        GET /api/feedbacks/export-advanced/?format=xlsx&periodo=30

        Parâmetros:
        - format: csv, json, xlsx (padrão: csv)
        - periodo: 7, 30, 90, all (padrão: 30)
        - tipo, status, prioridade: filtros opcionais
        - data_inicio, data_fim: YYYY-MM-DD (opcional)
        """
        from .export_service import ExportService

        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        format_type = request.query_params.get("format", "csv").lower()

        if format_type not in ExportService.EXPORT_FORMATS:
            return Response(
                {"error": f"Formato inválido. Opções: {ExportService.EXPORT_FORMATS}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filters = {
            "periodo": request.query_params.get("periodo", "30"),
            "tipo": request.query_params.get("tipo"),
            "status": request.query_params.get("status"),
            "prioridade": request.query_params.get("prioridade"),
            "data_inicio": request.query_params.get("data_inicio"),
            "data_fim": request.query_params.get("data_fim"),
        }

        return ExportService.export_feedbacks(tenant, format_type, filters)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="import",
    )
    @require_feature("export")  # Import usa mesma feature de export
    def import_feedbacks_endpoint(self, request):
        """
        Importa feedbacks de arquivo CSV ou JSON.

        🔒 FEATURE GATING: Requer plano STARTER ou PRO.

        POST /api/feedbacks/import/

        Form Data:
        - file: arquivo CSV ou JSON
        - format: csv ou json (detectado automaticamente se não fornecido)
        - update_existing: true/false (padrão: false)
        """
        from .export_service import ImportService

        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response(
                {"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "Arquivo não fornecido"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Detectar formato
        format_type = request.data.get("format", "").lower()
        if not format_type:
            filename = file.name.lower()
            if filename.endswith(".json"):
                format_type = "json"
            else:
                format_type = "csv"

        if format_type not in ImportService.IMPORT_FORMATS:
            return Response(
                {"error": f"Formato inválido. Opções: {ImportService.IMPORT_FORMATS}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_existing = request.data.get("update_existing", "false").lower() == "true"

        try:
            file_content = file.read()
            result = ImportService.import_feedbacks(
                tenant, file_content, format_type, update_existing
            )

            return Response(
                result,
                status=(
                    status.HTTP_200_OK
                    if result["success"]
                    else status.HTTP_400_BAD_REQUEST
                ),
            )

        except Exception as e:
            logger.error(f"Erro na importação: {e}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """
        Atribui feedback para um team member.

        POST /api/feedbacks/{id}/assign/

        Body:
        {
            "team_member_id": 123  // ID do TeamMember
        }

        Returns:
        {
            "id": 1,
            "assigned_to": {
                "id": 123,
                "user": {"full_name": "João Silva"},
                "role": "MODERATOR"
            },
            "assigned_at": "2026-02-03T10:30:00Z",
            "assigned_by_name": "Admin User"
        }
        """
        from apps.tenants.models import TeamMember

        from .tasks import send_assignment_email

        feedback = self.get_object()
        team_member_id = request.data.get("team_member_id")

        # Validação
        if not team_member_id:
            return Response(
                {"detail": "team_member_id é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar se team member existe e é do mesmo tenant
        try:
            team_member = TeamMember.objects.get(
                id=team_member_id, client=request.tenant, status=TeamMember.ACTIVE
            )
        except TeamMember.DoesNotExist:
            return Response(
                {"detail": "Team member não encontrado ou inativo"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Atribuir
        feedback.assigned_to = team_member
        feedback.assigned_at = timezone.now()
        feedback.assigned_by = request.user
        feedback.save()

        # Enviar email async
        send_assignment_email.delay(feedback.id, team_member.id)

        logger.info(
            f"✅ Feedback {feedback.protocolo} atribuído para {team_member.user.get_full_name()} por {request.user.get_full_name()}"
        )

        serializer = self.get_serializer(feedback)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def unassign(self, request, pk=None):
        """Remove atribuição do feedback."""
        feedback = self.get_object()
        old_assignee = (
            feedback.assigned_to.user.get_full_name() if feedback.assigned_to else None
        )

        feedback.assigned_to = None
        feedback.assigned_at = None
        feedback.save()

        if old_assignee:
            logger.info(
                f"✅ Feedback {feedback.protocolo} desatribuído de {old_assignee} por {request.user.get_full_name()}"
            )

        serializer = self.get_serializer(feedback)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Tags de categorização de feedbacks.

    Endpoints:
    - GET /api/tags/ - Listar todas as tags do tenant
    - POST /api/tags/ - Criar nova tag
    - GET /api/tags/{id}/ - Detalhes da tag
    - PUT /api/tags/{id}/ - Atualizar tag
    - DELETE /api/tags/{id}/ - Deletar tag
    - GET /api/tags/stats/ - Estatísticas de uso das tags
    """

    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Retorna apenas tags do tenant atual, ordenadas por nome."""
        return Tag.objects.prefetch_related("feedbacks").order_by("nome")

    def perform_create(self, serializer):
        """Salva a tag associando ao usuário criador."""
        serializer.save(criado_por=self.request.user)
        logger.info(
            f"✅ Tag '{serializer.instance.nome}' criada por {self.request.user.get_full_name()}"
        )

    def destroy(self, request, *args, **kwargs):
        """Permite deletar tag apenas se não estiver em uso."""
        tag = self.get_object()
        feedback_count = tag.feedbacks.count()

        if feedback_count > 0:
            return Response(
                {
                    "detail": f"Não é possível deletar. Tag está em uso por {feedback_count} feedback(s).",
                    "feedback_count": feedback_count,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        tag_name = tag.nome
        self.perform_destroy(tag)
        logger.info(f"🗑️  Tag '{tag_name}' deletada por {request.user.get_full_name()}")

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Retorna estatísticas de uso das tags."""
        from django.db.models import Count

        tags = (
            self.get_queryset()
            .annotate(feedback_count=Count("feedbacks"))
            .order_by("-feedback_count")
        )

        stats = {
            "total_tags": tags.count(),
            "tags_in_use": tags.filter(feedback_count__gt=0).count(),
            "tags_unused": tags.filter(feedback_count=0).count(),
            "most_used": TagSerializer(tags[:5], many=True).data,
        }

        return Response(stats)


class ResponseTemplateViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Templates de Resposta pré-definidos.

    Permite criar, listar, editar e usar templates para agilizar
    respostas em feedbacks. Cada tenant tem seus próprios templates.

    Endpoints:
    - GET /api/response-templates/ - Listar templates do tenant
    - POST /api/response-templates/ - Criar novo template
    - GET /api/response-templates/{id}/ - Detalhes do template
    - PUT /api/response-templates/{id}/ - Atualizar template
    - DELETE /api/response-templates/{id}/ - Deletar template
    - POST /api/response-templates/render/ - Renderizar template com dados de feedback
    - GET /api/response-templates/by-category/ - Listar por categoria
    """

    serializer_class = ResponseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Retorna apenas templates do tenant atual."""
        queryset = ResponseTemplate.objects.select_related("criado_por").order_by(
            "categoria", "nome"
        )

        # Filtrar por categoria se especificado
        categoria = self.request.query_params.get("categoria")
        if categoria:
            queryset = queryset.filter(categoria=categoria)

        # Filtrar por ativo se especificado
        ativo = self.request.query_params.get("ativo")
        if ativo is not None:
            queryset = queryset.filter(ativo=ativo.lower() == "true")

        # Filtrar por tipo de feedback aplicável
        tipo_feedback = self.request.query_params.get("tipo_feedback")
        if tipo_feedback:
            queryset = queryset.filter(
                Q(tipos_aplicaveis__contains=[tipo_feedback]) | Q(tipos_aplicaveis=[])
            )

        return queryset

    def perform_create(self, serializer):
        """Salva o template associando ao usuário criador."""
        serializer.save(criado_por=self.request.user)
        logger.info(
            f"✅ Template '{serializer.instance.nome}' criado por {self.request.user.get_full_name()}"
        )

    def destroy(self, request, *args, **kwargs):
        """Permite soft-delete (desativar) ou hard-delete se não usado."""
        template = self.get_object()

        if template.uso_count > 0:
            # Soft delete - apenas desativa
            template.ativo = False
            template.save(update_fields=["ativo"])
            logger.info(
                f"🔒 Template '{template.nome}' desativado (em uso {template.uso_count}x)"
            )
            return Response(
                {
                    "detail": "Template desativado pois já foi utilizado.",
                    "uso_count": template.uso_count,
                }
            )

        template_name = template.nome
        self.perform_destroy(template)
        logger.info(f"🗑️  Template '{template_name}' deletado")

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def render(self, request):
        """
        Renderiza um template com dados de um feedback específico.

        Body:
        {
            "template_id": 1,
            "feedback_id": 123
        }

        Retorna:
        {
            "rendered_content": "Texto renderizado com variáveis substituídas",
            "assunto": "Assunto do email (se definido)",
            "template_nome": "Nome do template"
        }
        """
        serializer = ResponseTemplateRenderSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        template = serializer.validated_data["template"]
        feedback = serializer.validated_data["feedback"]

        # Renderizar template
        rendered_content = template.render(feedback)

        # Incrementar contador de uso
        template.increment_usage()

        logger.info(
            f"📝 Template '{template.nome}' renderizado para feedback {feedback.protocolo}"
        )

        return Response(
            {
                "rendered_content": rendered_content,
                "assunto": template.assunto,
                "template_nome": template.nome,
                "categoria": template.categoria,
            }
        )

    @action(detail=False, methods=["get"], url_path="by-category")
    def by_category(self, request):
        """
        Retorna templates agrupados por categoria.

        Útil para exibir em dropdown/menu organizado.
        """

        templates = self.get_queryset().filter(ativo=True)

        # Agrupar por categoria
        categorias = {}
        for template in templates:
            cat = template.get_categoria_display()
            if cat not in categorias:
                categorias[cat] = {
                    "categoria": template.categoria,
                    "categoria_display": cat,
                    "templates": [],
                }
            categorias[cat]["templates"].append(
                {
                    "id": template.id,
                    "nome": template.nome,
                    "uso_count": template.uso_count,
                }
            )

        return Response(list(categorias.values()))

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Retorna estatísticas de uso dos templates."""
        from django.db.models import Avg, Sum

        templates = self.get_queryset()

        stats = {
            "total_templates": templates.count(),
            "templates_ativos": templates.filter(ativo=True).count(),
            "templates_inativos": templates.filter(ativo=False).count(),
            "uso_total": templates.aggregate(total=Sum("uso_count"))["total"] or 0,
            "media_uso": templates.aggregate(media=Avg("uso_count"))["media"] or 0,
            "mais_usados": ResponseTemplateSerializer(
                templates.order_by("-uso_count")[:5], many=True
            ).data,
        }

        return Response(stats)
