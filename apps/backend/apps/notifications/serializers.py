"""
Serializers do sistema de notificações
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PushSubscription, Notification, NotificationPreference

User = get_user_model()


class PushSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer para criar/atualizar subscriptions de push"""
    
    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'p256dh', 'auth', 'active', 'created_at', 'last_used']
        read_only_fields = ['id', 'created_at', 'last_used', 'active']
    
    def create(self, validated_data):
        """Cria ou atualiza subscription (upsert por endpoint)"""
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Usuário não autenticado")
        
        # Obter tenant do usuário
        tenant = getattr(request.user, 'tenant', None)
        if not tenant:
            raise serializers.ValidationError("Usuário não possui tenant associado")
        
        # Adicionar metadados
        validated_data['user'] = request.user
        validated_data['tenant'] = tenant
        validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        validated_data['ip_address'] = self._get_client_ip(request)
        validated_data['active'] = True
        
        # Upsert: atualizar se já existir, criar se não
        subscription, created = PushSubscription.objects.update_or_create(
            user=validated_data['user'],
            endpoint=validated_data['endpoint'],
            defaults={
                'tenant': validated_data['tenant'],
                'p256dh': validated_data['p256dh'],
                'auth': validated_data['auth'],
                'user_agent': validated_data['user_agent'],
                'ip_address': validated_data['ip_address'],
                'active': True,
            }
        )
        
        return subscription
    
    def _get_client_ip(self, request) -> str:
        """Obtém IP real do cliente (considera proxy)"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer para listar notificações"""
    
    is_read = serializers.BooleanField(read_only=True)
    is_clicked = serializers.BooleanField(read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'tipo', 'tipo_display', 'title', 'body', 'icon', 'url',
            'data', 'sent_at', 'read_at', 'is_read', 'is_clicked', 'time_ago'
        ]
        read_only_fields = fields
    
    def get_time_ago(self, obj) -> str:
        """Retorna tempo decorrido de forma amigável"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.sent_at
        
        if diff < timedelta(minutes=1):
            return "agora"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"há {minutes} min"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"há {hours}h"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"há {days}d"
        else:
            return obj.sent_at.strftime('%d/%m/%Y')


class NotificationCreateSerializer(serializers.Serializer):
    """Serializer para criar notificações (admin)"""
    
    title = serializers.CharField(max_length=255)
    body = serializers.CharField()
    url = serializers.CharField(max_length=500, required=False, allow_blank=True)
    icon = serializers.URLField(required=False, allow_blank=True)
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        help_text="Lista de IDs de usuários. Vazio = broadcast para todos."
    )
    data = serializers.JSONField(required=False, default=dict)
    
    def validate_user_ids(self, value):
        """Valida que os IDs existem e pertencem ao tenant"""
        if not value:
            return value
        
        request = self.context.get('request')
        tenant = getattr(request.user, 'tenant', None) if request else None
        
        if tenant:
            valid_ids = User.objects.filter(
                id__in=value,
                tenant=tenant,
                is_active=True
            ).values_list('id', flat=True)
            
            invalid_ids = set(value) - set(valid_ids)
            if invalid_ids:
                raise serializers.ValidationError(
                    f"IDs de usuário inválidos ou não pertencem ao tenant: {invalid_ids}"
                )
        
        return value


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer para preferências de notificação"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'notify_feedback_novo',
            'notify_feedback_atualizado',
            'notify_feedback_comentario',
            'notify_sistema',
            'quiet_hours_enabled',
            'quiet_hours_start',
            'quiet_hours_end',
        ]
    
    def validate(self, data):
        """Valida que quiet_hours tem início e fim se habilitado"""
        quiet_enabled = data.get('quiet_hours_enabled', False)
        quiet_start = data.get('quiet_hours_start')
        quiet_end = data.get('quiet_hours_end')
        
        if quiet_enabled and (not quiet_start or not quiet_end):
            raise serializers.ValidationError({
                'quiet_hours': 'Horário de início e fim são obrigatórios quando modo silencioso está ativo'
            })
        
        return data


class UnreadCountSerializer(serializers.Serializer):
    """Serializer para contagem de não lidas"""
    unread_count = serializers.IntegerField()
