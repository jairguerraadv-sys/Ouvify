from django.core.management.base import BaseCommand
from apps.consent.models import ConsentVersion


class Command(BaseCommand):
    help = 'Popula versões iniciais de consentimento'
    
    def handle(self, *args, **options):
        versions = [
            {
                'document_type': 'terms',
                'version': '1.0',
                'content_url': '/termos',
                'is_required': True,
            },
            {
                'document_type': 'privacy',
                'version': '1.0',
                'content_url': '/privacidade',
                'is_required': True,
            },
            {
                'document_type': 'lgpd',
                'version': '1.0',
                'content_url': '/lgpd',
                'is_required': True,
            },
            {
                'document_type': 'marketing',
                'version': '1.0',
                'content_url': '/privacidade',
                'is_required': False,
            },
        ]
        
        for version_data in versions:
            version, created = ConsentVersion.objects.get_or_create(
                document_type=version_data['document_type'],
                version=version_data['version'],
                defaults=version_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Criado: {version}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Já existe: {version}')
                )
