from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Prefetch, Q, QuerySet
from datetime import timedelta
from typing import Any
from .models import Feedback, FeedbackInteracao, FeedbackArquivo
from .serializers import (
    FeedbackSerializer,
    FeedbackConsultaSerializer,
    FeedbackDetailSerializer,
    FeedbackInteracaoSerializer,
    FeedbackArquivoSerializer,
    FeedbackArquivoUploadSerializer,
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
from apps.core.exceptions import FeatureNotAvailableError
from apps.core.decorators import require_feature, require_active_tenant
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
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_permissions(self):
        """Permite público apenas nos endpoints explícitos de protocolo."""
        if getattr(self, 'action', None) in ['create', 'consultar_protocolo', 'responder_protocolo', 'upload_arquivo']:
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
                ),
                'arquivos'  # ✅ OTIMIZAÇÃO: Pré-carregar arquivos anexados
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
        
        Valida limite de feedbacks por plano antes de criar.
        """
        tenant = get_current_tenant()
        
        # Validar limite de feedbacks
        if tenant and not tenant.can_create_feedback():
            raise FeatureNotAvailableError(
                feature='feedback_limit',
                message=(
                    f"Limite de {tenant.get_feedback_limit()} feedbacks atingido para plano {tenant.plano.upper()}. "
                    f"Você já possui {tenant.get_current_feedback_count()} feedbacks. "
                    f"Faça upgrade para continuar criando feedbacks."
                )
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
        methods=['post'],
        permission_classes=[permissions.AllowAny],
        url_path='adicionar-interacao'
    )
    def adicionar_interacao(self, request, pk=None):
        """
        Adiciona uma interação ao feedback.

        - Empresa autenticada: cria PERGUNTA_EMPRESA (ou MUDANCA_STATUS / NOTA_INTERNA / MENSAGEM_AUTOMATICA).
        - Denunciante anônimo: valida protocolo e cria RESPOSTA_USUARIO.
        """
        tenant = get_current_tenant()
        if not tenant:
            return Response({"error": "Tenant não identificado"}, status=status.HTTP_400_BAD_REQUEST)

        mensagem = (request.data.get('mensagem') or '').strip()
        if not mensagem:
            return Response({"error": "Campo 'mensagem' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        mensagem = sanitize_html_input(mensagem, max_length=MAX_INTERACAO_MENSAGEM_LENGTH)

        is_company = bool(request.user and request.user.is_authenticated)
        tipo_request = (request.data.get('tipo') or '').strip().upper()
        novo_status = (request.data.get('novo_status') or request.data.get('status') or '').strip()

        if is_company:
            try:
                feedback = self.get_queryset().select_related('client').get(pk=pk, client=tenant)
            except Feedback.DoesNotExist:
                logger.warning(
                    f"⚠️ Tentativa de adicionar interação em feedback inexistente | "
                    f"ID: {pk} | Tenant: {tenant.nome} | IP: {get_client_ip(request)}"
                )
                return Response({"error": "Feedback não encontrado"}, status=status.HTTP_404_NOT_FOUND)

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
                    {"error": f"Tipo inválido. Use um de: {sorted(allowed_company_types)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ FEATURE GATING: Validar se o tenant pode criar notas internas
            if tipo == InteracaoTipo.NOTA_INTERNA:
                if not tenant.has_feature_internal_notes():
                    raise FeatureNotAvailableError(
                        feature='allow_internal_notes',
                        plan=tenant.plano,
                        message=tenant.get_upgrade_message('allow_internal_notes')
                    )

            if tipo == InteracaoTipo.MUDANCA_STATUS:
                valid_status = FeedbackStatus.values()
                if not novo_status or novo_status not in valid_status:
                    return Response(
                        {"error": f"Status inválido. Use um de: {valid_status}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            autor = request.user
        else:
            protocolo = sanitize_protocol_code((request.data.get('protocolo') or '').strip().upper())
            if not protocolo:
                return Response({"error": "Campo 'protocolo' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

            feedback = Feedback.objects.filter(client=tenant, protocolo=protocolo).select_related('client', 'autor').first()
            if not feedback:
                logger.warning(
                    f"⚠️ Protocolo não encontrado para resposta anônima | "
                    f"Código: {protocolo} | Tenant: {tenant.nome} | IP: {get_client_ip(request)}"
                )
                return Response({"error": "Protocolo não encontrado"}, status=status.HTTP_404_NOT_FOUND)

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
            feedback.save(update_fields=['status', 'data_atualizacao'])

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
        methods=['post'],
        permission_classes=[permissions.AllowAny],
        parser_classes=[MultiPartParser, FormParser],
        url_path='upload-arquivo'
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
                {"error": "Tenant não identificado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ VALIDAÇÃO CRÍTICA: Verificar se tenant tem feature de anexos
        if not tenant.has_feature_attachments():
            from apps.tenants.plans import PlanFeatures
            upgrade_msg = PlanFeatures.get_upgrade_message(tenant.plano, 'allow_attachments')
            
            logger.warning(
                f"🚫 Tentativa de upload sem feature | "
                f"Tenant: {tenant.nome} | Plano: {tenant.plano}"
            )
            
            raise FeatureNotAvailableError(
                feature='allow_attachments',
                plan=tenant.plano,
                message=upgrade_msg
            )
        
        # Validar input
        serializer = FeedbackArquivoUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Type hints para Pylance
        validated_data = serializer.validated_data
        arquivo = validated_data['arquivo']
        protocolo = str(validated_data.get('protocolo', '')).strip().upper()
        interno = bool(validated_data.get('interno', False))
        
        # Determinar se é empresa ou denunciante
        is_company = bool(request.user and request.user.is_authenticated)
        
        if is_company:
            # Empresa autenticada: buscar feedback por ID
            try:
                feedback = self.get_queryset().select_related('client').get(pk=pk, client=tenant)
            except Feedback.DoesNotExist:
                logger.warning(
                    f"⚠️ Tentativa de upload em feedback inexistente | "
                    f"ID: {pk} | Tenant: {tenant.nome}"
                )
                return Response(
                    {"error": "Feedback não encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            enviado_por = request.user
            
            # Empresa pode enviar arquivos internos
            if interno and not tenant.has_feature_internal_notes():
                return Response(
                    {"error": "Seu plano não permite arquivos internos"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        else:
            # Denunciante anônimo: validar protocolo
            if not protocolo:
                return Response(
                    {"error": "Campo 'protocolo' é obrigatório para envio anônimo"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            protocolo = sanitize_protocol_code(protocolo)
            
            feedback = Feedback.objects.filter(
                client=tenant,
                protocolo=protocolo
            ).select_related('client', 'autor').first()
            
            if not feedback:
                logger.warning(
                    f"⚠️ Protocolo não encontrado para upload | "
                    f"Código: {protocolo} | Tenant: {tenant.nome}"
                )
                return Response(
                    {"error": "Protocolo não encontrado"},
                    status=status.HTTP_404_NOT_FOUND
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
                interno=interno
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
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
    
    def _set_tenant_from_request(self, request):
        """
        Define o tenant atual baseado no header X-Tenant-ID ou subdomínio.
        Usado para endpoints exempt no middleware (como consultar-protocolo).
        """
        from apps.tenants.models import Client
        from apps.core.utils import set_current_tenant
        
        # Tentar via header X-Tenant-ID primeiro
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            try:
                tenant = Client.objects.get(id=tenant_id, ativo=True)
                set_current_tenant(tenant)
                request.tenant = tenant
                return
            except (Client.DoesNotExist, ValueError):
                pass
        
        # Tentar via subdomínio
        host = request.get_host()
        host_without_port = host.split(':')[0]
        parts = host_without_port.split('.')
        
        if len(parts) > 1:
            subdomain = parts[0]
            if subdomain not in ['www', 'api', 'admin']:
                try:
                    tenant = Client.objects.get(
                        subdominio__iexact=subdomain,
                        ativo=True
                    )
                    set_current_tenant(tenant)
                    request.tenant = tenant
                    return
                except Client.DoesNotExist:
                    pass
    
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
        GET /api/feedbacks/consultar-protocolo/?protocolo=OUVY-XXXX-YYYY
        Headers: X-Tenant-ID: 123
        
        **Parâmetros:**
        - protocolo (required): Código do protocolo (ex: OUVY-A3B9-K7M2)
        
        **Observações:**
        - Não requer autenticação (público para o tenant)
        - Não expõe dados sensíveis (email, descrição completa)
        - Retorna apenas dados seguros via FeedbackConsultaSerializer
        """
        # ✅ IMPORTANTE: Esta URL é exempt no middleware, então precisamos
        # definir o tenant manualmente aqui
        if not get_current_tenant():
            self._set_tenant_from_request(request)
        
        codigo = request.query_params.get('protocolo', '').strip().upper()
        
        if not codigo:
            client_ip = get_client_ip(request)
            logger.warning(
                f"⚠️ Tentativa de consulta sem código | IP: {client_ip}"
            )
            return Response(
                {
                    "error": "Parâmetro 'protocolo' é obrigatório",
                    "exemplo": "/api/feedbacks/consultar-protocolo/?protocolo=OUVY-XXXX-YYYY"
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
            ).select_related('client', 'autor').first()
            
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
            ).select_related('client', 'autor').first()
            
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

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='export'
    )
    @require_feature('export')  # ✅ Feature gating: requer plano STARTER ou PRO
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
        from django.http import HttpResponse
        from datetime import datetime
        
        format_type = request.query_params.get('format', 'csv').lower()
        tipo_filter = request.query_params.get('tipo')
        status_filter = request.query_params.get('status')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        queryset = self.get_queryset()
        
        if tipo_filter:
            queryset = queryset.filter(tipo=tipo_filter)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if data_inicio:
            queryset = queryset.filter(data_criacao__date__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_criacao__date__lte=data_fim)
        
        if format_type == 'json':
            data = list(queryset.values(
                'protocolo', 'tipo', 'titulo', 'descricao', 'status', 
                'anonimo', 'email_contato', 'data_criacao', 'data_atualizacao'
            ))
            response = HttpResponse(
                json.dumps(data, default=str, ensure_ascii=False),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="feedbacks_export_{datetime.now().strftime("%Y%m%d")}.json"'
            return response
        
        # CSV export
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="feedbacks_export_{datetime.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Protocolo', 'Tipo', 'Título', 'Descrição', 'Status', 'Anônimo', 'Email Contato', 'Data Criação', 'Data Atualização'])
        
        for feedback in queryset:
            writer.writerow([
                feedback.protocolo,
                feedback.tipo,
                feedback.titulo,
                feedback.descricao,
                feedback.status,
                'Sim' if feedback.anonimo else 'Não',
                feedback.email_contato or '',
                feedback.data_criacao.strftime('%Y-%m-%d %H:%M:%S'),
                feedback.data_atualizacao.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        logger.info(f"📊 Export realizado | Tenant: {request.tenant.nome} | Formato: {format_type} | Registros: {queryset.count()}")
        return response
