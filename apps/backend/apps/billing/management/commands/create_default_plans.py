"""
Create Default Plans Command - Ouvify
Sprint 4 - Feature 4.1: Integração Stripe

Cria os planos padrão do sistema.
"""
from django.core.management.base import BaseCommand
from apps.billing.models import Plan


class Command(BaseCommand):
    help = 'Cria os planos padrão do sistema'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Free',
                'slug': 'free',
                'price_cents': 0,
                'description': 'Perfeito para começar. Funcionalidades básicas para pequenas empresas.',
                'features': {
                    'basic_feedbacks': True,
                    'email_notifications': True,
                    'dashboard': True,
                    'analytics': False,
                    'automations': False,
                    'api_access': False,
                    'custom_branding': False,
                    'priority_support': False,
                    'sla_tracking': False,
                },
                'limits': {
                    'feedbacks_per_month': 100,
                    'team_members': 2,
                    'storage_mb': 100,
                    'api_calls_per_day': 0,
                },
                'trial_days': 0,
                'display_order': 1,
                'is_popular': False,
            },
            {
                'name': 'Starter',
                'slug': 'starter',
                'price_cents': 4900,  # R$ 49,00
                'description': 'Para pequenas empresas em crescimento. Mais recursos e suporte.',
                'features': {
                    'basic_feedbacks': True,
                    'email_notifications': True,
                    'dashboard': True,
                    'analytics': True,
                    'automations': False,
                    'api_access': False,
                    'custom_branding': True,
                    'priority_support': False,
                    'sla_tracking': True,
                },
                'limits': {
                    'feedbacks_per_month': 500,
                    'team_members': 5,
                    'storage_mb': 500,
                    'api_calls_per_day': 100,
                },
                'trial_days': 14,
                'display_order': 2,
                'is_popular': False,
            },
            {
                'name': 'Professional',
                'slug': 'professional',
                'price_cents': 9900,  # R$ 99,00
                'description': 'Para empresas médias. Automações e integrações avançadas.',
                'features': {
                    'basic_feedbacks': True,
                    'email_notifications': True,
                    'dashboard': True,
                    'analytics': True,
                    'automations': True,
                    'api_access': True,
                    'custom_branding': True,
                    'priority_support': True,
                    'sla_tracking': True,
                },
                'limits': {
                    'feedbacks_per_month': 2000,
                    'team_members': 15,
                    'storage_mb': 2000,
                    'api_calls_per_day': 1000,
                },
                'trial_days': 14,
                'display_order': 3,
                'is_popular': True,
            },
            {
                'name': 'Enterprise',
                'slug': 'enterprise',
                'price_cents': 29900,  # R$ 299,00
                'description': 'Para grandes empresas. Recursos ilimitados e suporte dedicado.',
                'features': {
                    'basic_feedbacks': True,
                    'email_notifications': True,
                    'dashboard': True,
                    'analytics': True,
                    'automations': True,
                    'api_access': True,
                    'custom_branding': True,
                    'priority_support': True,
                    'sla_tracking': True,
                    'dedicated_support': True,
                    'custom_integrations': True,
                    'sso': True,
                },
                'limits': {
                    'feedbacks_per_month': None,  # Unlimited
                    'team_members': None,  # Unlimited
                    'storage_mb': 10000,
                    'api_calls_per_day': None,  # Unlimited
                },
                'trial_days': 14,
                'display_order': 4,
                'is_popular': False,
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for plan_data in plans:
            plan, created = Plan.objects.update_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Plano criado: {plan.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'🔄 Plano atualizado: {plan.name}')
                )
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'Concluído: {created_count} planos criados, {updated_count} atualizados'
            )
        )
