"""
Views da API de Notificações Push
Endpoints para gerenciar subscriptions e notificações
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.throttling import UserRateThrottle
from django.utils import timezone
from django.contrib.auth import get_user_model
import logging

from .models import PushSubscription, Notification, NotificationPreference
from .serializers import (
    PushSubscriptionSerializer,
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationPreferenceSerializer,
    UnreadCountSerializer,
)
from .tasks import send_push_notification

logger = logging.getLogger(__name__)
User = get_user_model()


class PushSubscriptionRateThrottle(UserRateThrottle):
    """Rate limit para subscriptions: 20/hora"""
    rate = '20/hour'


class PushSubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar subscriptions de Web Push
    
    Endpoints:
    - GET /subscriptions/ - Listar minhas subscriptions
    - POST /subscriptions/subscribe/ - Criar/atualizar subscription
    - POST /subscriptions/unsubscribe/ - Desativar subscription
    - DELETE /subscriptions/{id}/ - Remover subscription
    """
    
    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [PushSubscriptionRateThrottle]
    http_method_names = ['get', 'post', 'delete']
    
    def get_queryset(self):
        """Filtra subscriptions do usuário atual"""
        return PushSubscription.objects.filter(
            user=self.request.user,
            active=True
        ).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """
        Criar ou atualizar subscription de push
        
        Body:
        {
            "endpoint": "https://push.service.url/...",
            "p256dh": "base64_public_key",
            "auth": "base64_auth_secret"
        }
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        
        logger.info(f"Push subscription criada/atualizada para {request.user.email}")
        
        return Response({
            'message': 'Notificações ativadas com sucesso',
            'subscription_id': subscription.id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """
        Desativar subscription por endpoint
        
        Body:
        {
            "endpoint": "https://push.service.url/..."
        }
        """
        endpoint = request.data.get('endpoint')
        
        if not endpoint:
            return Response(
                {'error': 'Endpoint é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = PushSubscription.objects.filter(
            user=request.user,
            endpoint=endpoint
        ).update(active=False)
        
        logger.info(f"{count} subscription(s) desativada(s) para {request.user.email}")
        
        return Response({
            'message': f'{count} subscription(s) desativada(s)'
        })
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Retorna status das notificações do usuário"""
        subscriptions_count = self.get_queryset().count()
        
        return Response({
            'enabled': subscriptions_count > 0,
            'subscriptions_count': subscriptions_count,
        })


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e gerenciar notificações do usuário
    
    Endpoints:
    - GET /notifications/ - Listar notificações
    - GET /notifications/{id}/ - Detalhes de uma notificação
    - GET /notifications/unread_count/ - Contar não lidas
    - POST /notifications/{id}/mark_read/ - Marcar como lida
    - POST /notifications/mark_all_read/ - Marcar todas como lidas
    - POST /notifications/send/ - Enviar notificação (admin)
    """
    
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra notificações do usuário atual"""
        queryset = Notification.objects.filter(
            user=self.request.user
        ).order_by('-sent_at')
        
        # Filtrar por tipo se especificado
        tipo = self.request.query_params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        # Filtrar por status de leitura
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            if is_read.lower() in ('true', '1'):
                queryset = queryset.filter(read_at__isnull=False)
            else:
                queryset = queryset.filter(read_at__isnull=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Retorna contagem de notificações não lidas"""
        count = Notification.objects.filter(
            user=request.user,
            read_at__isnull=True
        ).count()
        
        serializer = UnreadCountSerializer({'unread_count': count})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marca notificação como lida"""
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({'message': 'Notificação marcada como lida'})
    
    @action(detail=True, methods=['post'])
    def mark_clicked(self, request, pk=None):
        """Marca notificação como clicada"""
        notification = self.get_object()
        notification.mark_as_clicked()
        
        return Response({'message': 'Notificação marcada como clicada'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marca todas as notificações como lidas"""
        count = Notification.objects.filter(
            user=request.user,
            read_at__isnull=True
        ).update(read_at=timezone.now())
        
        return Response({
            'message': f'{count} notificações marcadas como lidas'
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def send(self, request):
        """
        Enviar notificação para usuários (apenas admins)
        
        Body:
        {
            "title": "Título da notificação",
            "body": "Corpo da mensagem",
            "url": "/destino-opcional",
            "user_ids": [1, 2, 3]  // Vazio = broadcast
        }
        """
        serializer = NotificationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        tenant = getattr(request.user, 'tenant', None)
        
        if not tenant:
            return Response(
                {'error': 'Usuário não possui tenant'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determinar destinatários
        user_ids = data.get('user_ids', [])
        if not user_ids:
            # Broadcast para todos os usuários ativos do tenant
            users = User.objects.filter(tenant=tenant, is_active=True)
        else:
            users = User.objects.filter(id__in=user_ids, tenant=tenant, is_active=True)
        
        # Criar notificações
        notifications = []
        for user in users:
            notification = Notification.objects.create(
                tenant=tenant,
                user=user,
                tipo='SISTEMA',
                title=data['title'],
                body=data['body'],
                url=data.get('url', ''),
                icon=data.get('icon', ''),
                data=data.get('data', {})
            )
            notifications.append(notification)
            
            # Enviar push assíncrono
            send_push_notification.delay(notification.id)  # type: ignore[attr-defined]
        
        logger.info(f"Admin {request.user.email} enviou {len(notifications)} notificações")
        
        return Response({
            'message': f'{len(notifications)} notificações enviadas',
            'notification_ids': [n.id for n in notifications]
        }, status=status.HTTP_201_CREATED)


class NotificationPreferenceViewSet(viewsets.GenericViewSet):
    """
    ViewSet para gerenciar preferências de notificação
    
    Endpoints:
    - GET /preferences/ - Obter preferências atuais
    - PUT /preferences/ - Atualizar preferências
    """
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Obtém ou cria preferências do usuário"""
        preferences, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Obter ou atualizar minhas preferências"""
        preferences = self.get_object()
        
        if request.method == 'GET':
            serializer = self.get_serializer(preferences)
            return Response(serializer.data)
        
        # PUT ou PATCH
        partial = request.method == 'PATCH'
        serializer = self.get_serializer(
            preferences,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
