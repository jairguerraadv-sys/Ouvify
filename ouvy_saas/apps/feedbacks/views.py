from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Feedback, FeedbackInteracao
from .serializers import (
    FeedbackSerializer,
    FeedbackConsultaSerializer,
    FeedbackDetailSerializer,
)
from .serializers import FeedbackInteracaoSerializer
from .throttles import ProtocoloConsultaThrottle
import logging

logger = logging.getLogger(__name__)


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Feedbacks.
    
    O isolamento de dados acontece automaticamente graças ao TenantAwareModel.
    Cada tenant só consegue ver/editar seus próprios feedbacks.
    
    Endpoints disponíveis:
    - POST /api/feedbacks/ - Criar novo feedback (retorna protocolo)
    - GET /api/feedbacks/ - Listar feedbacks do tenant (autenticado)
    - GET /api/feedbacks/{id}/ - Detalhes de um feedback (autenticado)
    - GET /api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY - Consulta pública
    """
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Permite público apenas nos endpoints explícitos de protocolo."""
        if getattr(self, 'action', None) in ['create', 'consultar_protocolo', 'responder_protocolo']:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]
    
    def get_queryset(self):
        """
        Retorna o queryset filtrado por tenant.
        Este método é chamado em CADA requisição, garantindo que o filtro
        seja aplicado com o tenant correto do contexto atual.
        """
        return Feedback.objects.all()

    def get_serializer_class(self):
        if getattr(self, 'action', None) in ['retrieve']:
            return FeedbackDetailSerializer
        return super().get_serializer_class()
    
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
            feedback = self.get_queryset().get(pk=pk)
        except Feedback.DoesNotExist:
            return Response({"error": "Feedback não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        mensagem = (request.data.get('mensagem') or '').strip()
        tipo = (request.data.get('tipo') or '').strip().upper()
        novo_status = (request.data.get('novo_status') or request.data.get('status') or '').strip()

        if not mensagem:
            return Response({"error": "Campo 'mensagem' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        if tipo not in ['MENSAGEM_PUBLICA', 'NOTA_INTERNA', 'MUDANCA_STATUS']:
            return Response({"error": "Tipo inválido"}, status=status.HTTP_400_BAD_REQUEST)

        if tipo == 'MUDANCA_STATUS':
            if not novo_status:
                return Response({"error": "Campo 'novo_status' é obrigatório para mudanças de status"}, status=status.HTTP_400_BAD_REQUEST)
            # Validar novo_status contra choices do modelo
            status_values = [s[0] for s in Feedback.STATUS_CHOICES]
            if novo_status not in status_values:
                return Response({"error": "Status inválido"}, status=status.HTTP_400_BAD_REQUEST)

        # Criar interação
        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            autor=request.user if request.user and request.user.is_authenticated else None,
            mensagem=mensagem,
            tipo=tipo,
        )

        # Atualizar status se necessário
        if tipo == 'MUDANCA_STATUS':
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
        ```json
        {
            "total": 150,
            "pendentes": 12,
            "resolvidos": 98,
            "hoje": 5,
            "taxa_resolucao": "65.3%"
        }
        ```
        
        **Observações:**
        - Filtra automaticamente pelo tenant atual (via TenantAwareModel)
        - Não requer autenticação (público para o tenant)
        - Otimizado para performance (usa agregações do Django ORM)
        """
        # Obter queryset já filtrado pelo tenant
        queryset = self.get_queryset()
        
        # Calcular timestamp de 24h atrás
        hoje_inicio = timezone.now() - timedelta(hours=24)
        
        # Estatísticas usando agregação eficiente
        total = queryset.count()
        pendentes = queryset.filter(status='pendente').count()
        resolvidos = queryset.filter(status='resolvido').count()
        hoje = queryset.filter(data_criacao__gte=hoje_inicio).count()
        
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
        
        **⚠️ PROTEÇÃO CONTRA FORÇA BRUTA:**
        - Rate limit: 5 requisições por minuto por IP
        - Logs de tentativas excessivas
        - Erro 429 quando limite é excedido
        
        **Uso:**
        GET /api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY
        
        **Parâmetros:**
        - codigo (required): Código do protocolo (ex: OUVY-A3B9-K7M2)
        
        **Resposta de Sucesso (200):**
        ```json
        {
            "protocolo": "OUVY-A3B9-K7M2",
            "tipo": "denuncia",
            "tipo_display": "Denúncia",
            "status": "em_analise",
            "status_display": "Em Análise",
            "titulo": "Título do feedback",
            "resposta_empresa": "A empresa está analisando...",
            "data_resposta": "2026-01-15T10:30:00Z",
            "data_criacao": "2026-01-10T14:20:00Z",
            "data_atualizacao": "2026-01-15T10:30:00Z"
        }
        ```
        
        **Resposta de Erro (429) - Rate Limit:**
        ```json
        {
            "error": "Limite de consultas excedido",
            "detail": "Aguarde 45 segundos e tente novamente.",
            "wait_seconds": 45,
            "tip": "Este limite protege o sistema contra uso abusivo."
        }
        ```
        
        **Observações:**
        - Não requer autenticação
        - Não expõe dados sensíveis (email, descrição completa)
        - Funciona independente do tenant (busca global por protocolo)
        - Limitado a 5 consultas por minuto por IP
        """
        codigo = request.query_params.get('codigo', '').strip().upper()
        
        if not codigo:
            logger.warning(
                f"⚠️ Tentativa de consulta sem código | "
                f"IP: {request.META.get('REMOTE_ADDR')}"
            )
            return Response(
                {
                    "error": "Parâmetro 'codigo' é obrigatório",
                    "exemplo": "/api/feedbacks/consultar-protocolo/?codigo=OUVY-XXXX-YYYY"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar em TODOS os tenants (all_tenants) pois protocolo é único globalmente
            feedback = Feedback.objects.all_tenants().get(protocolo=codigo)
            
            # Log de consulta bem-sucedida
            logger.info(
                f"🔍 Consulta de protocolo | "
                f"Código: {codigo} | "
                f"IP: {request.META.get('REMOTE_ADDR')} | "
                f"Tenant: {feedback.client.nome}"
            )
            
            # Serializar apenas dados públicos
            serializer = FeedbackConsultaSerializer(feedback)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Feedback.DoesNotExist:
            # Log de tentativa com protocolo inválido
            logger.info(
                f"❌ Protocolo não encontrado | "
                f"Código: {codigo} | "
                f"IP: {request.META.get('REMOTE_ADDR')}"
            )
            
            return Response(
                {
                    "error": "Protocolo não encontrado",
                    "codigo": codigo,
                    "dica": "Verifique se o código foi digitado corretamente"
                },
                status=status.HTTP_404_NOT_FOUND
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
        
        Este é um endpoint PÚBLICO protegido apenas por rate limiting.
        Qualquer pessoa que possua um protocolo válido pode enviar mensagens.
        O autor será null (anônimo) e as mensagens são sempre do tipo MENSAGEM_PUBLICA.

        **Proteções:**
        - Rate limit: 5 requisições por minuto por IP (ProtocoloConsultaThrottle)
        - Validação: protocolo deve existir no banco de dados
        
        **Body esperado:**
        - protocolo: string (obrigatório) - Código OUVY-XXXX-YYYY
        - mensagem: string (obrigatório) - Texto da mensagem

        **Retorna:** A interação criada (serializada com FeedbackInteracaoSerializer)
        
        **Exemplo:**
        ```json
        POST /api/feedbacks/responder-protocolo/
        {
            "protocolo": "OUVY-A3B9-K7M2",
            "mensagem": "Obrigado pela resposta!"
        }
        ```
        """
        protocolo = (request.data.get('protocolo') or '').strip().upper()
        mensagem = (request.data.get('mensagem') or '').strip()

        if not protocolo:
            return Response({"error": "Campo 'protocolo' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        if not mensagem:
            return Response({"error": "Campo 'mensagem' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            feedback = Feedback.objects.all_tenants().get(protocolo=protocolo)
        except Feedback.DoesNotExist:
            return Response({"error": "Protocolo não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Definir client explicitamente pois este endpoint é público
        # (não há tenant no contexto da requisição)
        interacao = FeedbackInteracao.objects.create(
            feedback=feedback,
            client=feedback.client,  # Herdar do feedback original para manter isolamento
            autor=None,  # Mensagem anônima do denunciante
            tipo='MENSAGEM_PUBLICA',
            mensagem=mensagem,
        )

        logger.info(
            f"💬 Resposta pública adicionada | Protocolo: {protocolo} | Tenant: {feedback.client.nome}"
        )

        serializer = FeedbackInteracaoSerializer(interacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
