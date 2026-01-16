"""
FEATURE GATING - Definição de Planos e Funcionalidades

Este arquivo centraliza todas as regras de negócio relacionadas a planos.
Qualquer mudança de limite, feature ou preço deve ser feita aqui.

📊 MATRIZ DE FEATURES:

┌─────────────┬───────┬─────────┬─────┬────────────┐
│ Feature     │ Free  │ Starter │ Pro │ Enterprise │
├─────────────┼───────┼─────────┼─────┼────────────┤
│ Notes       │  ❌   │   ✅    │ ✅  │     ✅     │
│ Attachments │  ❌   │   ❌    │ ✅  │     ✅     │
│ Branding    │  ❌   │   ✅    │ ✅  │     ✅     │
│ API         │  ❌   │   ❌    │ ✅  │     ✅     │
│ Webhooks    │  ❌   │   ❌    │ ✅  │     ✅     │
│ Storage     │  1GB  │  10GB   │100GB│  Ilimitado │
└─────────────┴───────┴─────────┴─────┴────────────┘
"""


class PlanFeatures:
    """Define quais features estão disponíveis em cada plano."""
    
    # Mapa de planos -> features habilitadas
    PLAN_LIMITS = {
        'free': {
            'max_feedbacks_per_month': 50,
            'max_users': 1,
            'allow_internal_notes': False,
            'allow_attachments': False,
            'allow_custom_branding': False,
            'allow_api_access': False,
            'allow_webhooks': False,
            'allow_integrations': False,
            'support_tier': 'community',  # community, email, priority, 24/7
            'storage_gb': 1,
        },
        'starter': {
            'max_feedbacks_per_month': 500,
            'max_users': 5,
            'allow_internal_notes': True,  # ✅ NOVO: Notas internas
            'allow_attachments': False,  # ❌ Não incluso
            'allow_custom_branding': True,
            'allow_api_access': False,
            'allow_webhooks': False,
            'allow_integrations': False,
            'support_tier': 'email',
            'storage_gb': 10,
        },
        'pro': {
            'max_feedbacks_per_month': None,  # Ilimitado
            'max_users': None,
            'allow_internal_notes': True,
            'allow_attachments': True,  # ✅ NOVO: Anexos
            'allow_custom_branding': True,
            'allow_api_access': True,
            'allow_webhooks': True,
            'allow_integrations': True,
            'support_tier': 'priority',
            'storage_gb': 100,
        },
        'enterprise': {
            'max_feedbacks_per_month': None,
            'max_users': None,
            'allow_internal_notes': True,
            'allow_attachments': True,
            'allow_custom_branding': True,
            'allow_api_access': True,
            'allow_webhooks': True,
            'allow_integrations': True,
            'support_tier': '24/7',
            'storage_gb': None,  # Ilimitado
        },
    }
    
    @classmethod
    def get_plan_features(cls, plan: str) -> dict:
        """
        Retorna as features de um plano específico.
        
        Args:
            plan: Nome do plano ('free', 'starter', 'pro', 'enterprise')
        
        Returns:
            Dicionário com as features habilitadas
        
        Raises:
            ValueError: Se o plano não existir
        """
        if plan not in cls.PLAN_LIMITS:
            raise ValueError(f"Plano inválido: {plan}. Use um de: {list(cls.PLAN_LIMITS.keys())}")
        return cls.PLAN_LIMITS[plan]
    
    @classmethod
    def has_feature(cls, plan: str, feature: str) -> bool:
        """
        Verifica se um plano tem uma feature específica habilitada.
        
        Args:
            plan: Nome do plano
            feature: Nome da feature (ex: 'allow_internal_notes')
        
        Returns:
            True se a feature está habilitada, False caso contrário
        """
        try:
            features = cls.get_plan_features(plan)
            return features.get(feature, False)
        except ValueError:
            return False
    
    @classmethod
    def get_upgrade_message(cls, plan: str, feature: str) -> str:
        """
        Retorna mensagem customizada para upgrade.
        
        Args:
            plan: Plano atual
            feature: Feature bloqueada
        
        Returns:
            Mensagem descritiva
        """
        feature_names = {
            'allow_internal_notes': 'Notas Internas',
            'allow_attachments': 'Anexos e Evidências',
            'allow_custom_branding': 'Customização de Marca',
            'allow_api_access': 'Acesso à API REST',
            'allow_webhooks': 'Webhooks',
            'allow_integrations': 'Integrações Avançadas',
        }
        
        feature_display = feature_names.get(feature, feature)
        
        upgrade_map = {
            'free': {
                'allow_internal_notes': 'Faça upgrade para o plano Starter para usar Notas Internas.',
                'allow_attachments': 'Faça upgrade para o plano Pro para enviar Anexos.',
                'allow_custom_branding': 'Faça upgrade para o plano Starter para customizar sua marca.',
                'allow_api_access': 'Faça upgrade para o plano Pro para acessar a API REST.',
            },
            'starter': {
                'allow_attachments': 'Faça upgrade para o plano Pro para enviar Anexos.',
                'allow_api_access': 'Faça upgrade para o plano Pro para acessar a API REST.',
                'allow_webhooks': 'Faça upgrade para o plano Pro para usar Webhooks.',
            },
        }
        
        if plan in upgrade_map and feature in upgrade_map[plan]:
            return upgrade_map[plan][feature]
        
        return f'Seu plano atual ({plan}) não suporta {feature_display}. Faça upgrade para acessar este recurso.'
