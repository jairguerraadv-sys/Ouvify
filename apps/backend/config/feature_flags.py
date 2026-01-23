# =============================================================================
# FEATURE GATING - Ouvy SaaS
# Controle de funcionalidades por ambiente
# =============================================================================

from django.conf import settings
import os

class FeatureFlags:
    """
    Sistema de feature flags para controle de funcionalidades
    por ambiente (desenvolvimento, staging, produção)
    """

    # Features disponíveis
    FEATURES = {
        'EMAIL_NOTIFICATIONS': {
            'description': 'Envio de notificações por email',
            'default': False,
            'staging': False,
            'production': True,
        },
        'WEBHOOKS': {
            'description': 'Envio de webhooks para sistemas externos',
            'default': False,
            'staging': False,
            'production': True,
        },
        'ANALYTICS': {
            'description': 'Dashboard de analytics e métricas',
            'default': True,
            'staging': True,
            'production': True,
        },
        'EXPORT_CSV': {
            'description': 'Exportação de feedbacks em CSV',
            'default': True,
            'staging': True,
            'production': True,
        },
        'RATE_LIMITING': {
            'description': 'Limitação de taxa de requisições',
            'default': True,
            'staging': True,
            'production': True,
        },
        'MULTI_TENANT': {
            'description': 'Isolamento multi-tenant',
            'default': True,
            'staging': True,
            'production': True,
        },
    }

    @classmethod
    def is_enabled(cls, feature_name):
        """
        Verifica se uma feature está habilitada para o ambiente atual
        """
        if feature_name not in cls.FEATURES:
            return False

        # Primeiro, verificar variável de ambiente específica
        env_var = f'FEATURE_{feature_name}'
        env_value = os.getenv(env_var)

        if env_value is not None:
            return env_value.lower() in ('true', '1', 'yes', 'on')

        # Determinar ambiente
        if settings.DEBUG:
            env = 'default'
        elif 'staging' in getattr(settings, 'ALLOWED_HOSTS', []):
            env = 'staging'
        else:
            env = 'production'

        # Retornar valor do ambiente
        return cls.FEATURES[feature_name].get(env, cls.FEATURES[feature_name]['default'])

    @classmethod
    def get_enabled_features(cls):
        """
        Retorna lista de features habilitadas
        """
        return [feature for feature in cls.FEATURES.keys() if cls.is_enabled(feature)]

    @classmethod
    def get_feature_info(cls):
        """
        Retorna informações sobre todas as features
        """
        info = {}
        for feature_name, config in cls.FEATURES.items():
            info[feature_name] = {
                'description': config['description'],
                'enabled': cls.is_enabled(feature_name),
                'default': config['default'],
                'staging': config['staging'],
                'production': config['production'],
            }
        return info


# Instância global para uso fácil
feature_flags = FeatureFlags()