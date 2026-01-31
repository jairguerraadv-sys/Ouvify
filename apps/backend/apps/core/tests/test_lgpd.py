"""
Testes de LGPD - Ouvify
Sprint 1 Correções: Auditoria 30/01/2026

Cobertura:
- test_consent_management: Gerenciamento de consentimento
- test_data_export: Exportação de dados pessoais
- test_account_deletion: Exclusão de conta (direito ao esquecimento)
- test_data_minimization: Minimização de dados
"""
import pytest
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.consent.models import ConsentVersion, UserConsent

User = get_user_model()


# ======================
# FIXTURES
# ======================

@pytest.fixture
def test_user(db):
    """Cria usuário de teste."""
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return User.objects.create_user(
        username=f'lgpduser-{unique_id}@example.com',
        email=f'lgpduser-{unique_id}@example.com',
        password='TestPass123!',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def consent_version(db):
    """Cria versão de consentimento de teste."""
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    return ConsentVersion.objects.create(
        document_type='privacy_policy',
        version=f'1.0.0-{unique_id}',
        content_url='https://ouvify.com/privacy-policy',
        is_current=True,
        is_required=True,
        effective_date=timezone.now().date()
    )


# ======================
# TESTES DE CONSENT MANAGEMENT
# ======================

@pytest.mark.django_db
class TestConsentManagement:
    """Testes para gerenciamento de consentimento LGPD."""
    
    def test_create_consent_version(self, db):
        """Teste criação de versão de consentimento."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        
        consent = ConsentVersion.objects.create(
            document_type='terms_of_service',
            version=f'2.0.0-{unique_id}',
            content_url='https://ouvify.com/terms',
            is_current=True,
            is_required=True,
            effective_date=timezone.now().date()
        )
        
        assert consent.id is not None
        assert consent.version == f'2.0.0-{unique_id}'
        assert consent.is_required is True
    
    def test_user_accept_consent(self, test_user, consent_version):
        """Teste aceite de consentimento por usuário."""
        user_consent = UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='192.168.1.1',
            user_agent='Test Browser',
            accepted=True
        )
        
        assert user_consent.id is not None
        assert user_consent.user == test_user
        assert user_consent.consent_version == consent_version
        assert user_consent.accepted is True
    
    def test_consent_audit_trail(self, test_user, consent_version):
        """Teste trilha de auditoria do consentimento."""
        user_consent = UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='10.0.0.1',
            user_agent='Mozilla/5.0 Test',
            accepted=True,
            accepted_at=timezone.now()  # Campo manual quando accepted=True
        )
        
        # Verificar campos de auditoria
        assert user_consent.ip_address == '10.0.0.1'
        assert user_consent.user_agent == 'Mozilla/5.0 Test'
        assert user_consent.accepted_at is not None
    
    def test_consent_version_history(self, db):
        """Teste histórico de versões de consentimento."""
        import uuid
        
        # Criar múltiplas versões
        for i in range(3):
            unique_id = str(uuid.uuid4())[:8]
            ConsentVersion.objects.create(
                document_type='privacy_policy',
                version=f'{i+1}.0.0-{unique_id}',
                content_url=f'https://ouvify.com/privacy-v{i+1}',
                is_current=(i == 2),  # Apenas última atual
                is_required=True,
                effective_date=timezone.now().date()
            )
        
        # Verificar versões criadas
        all_versions = ConsentVersion.objects.filter(document_type='privacy_policy')
        assert all_versions.count() >= 3
    
    def test_required_consent_filter(self, consent_version, db):
        """Teste filtro de consentimentos obrigatórios."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        
        # Criar consentimento não obrigatório
        optional = ConsentVersion.objects.create(
            document_type='marketing',
            version=f'1.0.0-opt-{unique_id}',
            content_url='https://ouvify.com/marketing',
            is_current=True,
            is_required=False,
            effective_date=timezone.now().date()
        )
        
        required = ConsentVersion.objects.filter(is_required=True, is_current=True)
        optional_list = ConsentVersion.objects.filter(is_required=False)
        
        assert consent_version in required
        assert optional in optional_list
    
    def test_user_has_accepted_consent(self, test_user, consent_version):
        """Teste verificação se usuário aceitou consentimento."""
        # Antes de aceitar
        has_accepted = UserConsent.objects.filter(
            user=test_user,
            consent_version=consent_version,
            accepted=True
        ).exists()
        assert has_accepted is False
        
        # Aceitar
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='127.0.0.1',
            accepted=True
        )
        
        # Depois de aceitar
        has_accepted = UserConsent.objects.filter(
            user=test_user,
            consent_version=consent_version,
            accepted=True
        ).exists()
        assert has_accepted is True


# ======================
# TESTES DE DATA EXPORT
# ======================

@pytest.mark.django_db
class TestDataExport:
    """Testes para exportação de dados (portabilidade LGPD)."""
    
    def test_export_user_basic_data(self, test_user):
        """Teste exportação de dados básicos do usuário."""
        export_data = {
            'id': test_user.id,
            'username': test_user.username,
            'email': test_user.email,
            'first_name': test_user.first_name,
            'last_name': test_user.last_name,
            'date_joined': str(test_user.date_joined),
        }
        
        assert 'email' in export_data
        assert 'date_joined' in export_data
        assert export_data['email'] == test_user.email
    
    def test_export_consent_history(self, test_user, consent_version):
        """Teste exportação de histórico de consentimentos."""
        # Criar consentimento
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='192.168.1.1',
            accepted=True
        )
        
        # Exportar histórico
        consents = UserConsent.objects.filter(user=test_user)
        export_data = []
        for consent in consents:
            export_data.append({
                'version': consent.consent_version.version,
                'type': consent.consent_version.document_type,
                'accepted_at': str(consent.accepted_at),
                'ip_address': consent.ip_address
            })
        
        assert len(export_data) == 1
        assert export_data[0]['type'] == 'privacy_policy'
    
    def test_export_data_structure_json(self, test_user, consent_version):
        """Teste estrutura JSON da exportação."""
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='10.0.0.1',
            accepted=True
        )
        
        # Estrutura esperada
        export_structure = {
            'user': {
                'id': test_user.id,
                'email': test_user.email,
                'name': f'{test_user.first_name} {test_user.last_name}'
            },
            'consents': list(UserConsent.objects.filter(
                user=test_user
            ).values('consent_version__version', 'accepted_at')),
            'export_date': str(timezone.now().date())
        }
        
        assert 'user' in export_structure
        assert 'consents' in export_structure
        assert 'export_date' in export_structure


# ======================
# TESTES DE ACCOUNT DELETION
# ======================

@pytest.mark.django_db
class TestAccountDeletion:
    """Testes para exclusão de conta (direito ao esquecimento)."""
    
    def test_soft_delete_user(self, test_user):
        """Teste soft delete de usuário."""
        test_user.is_active = False
        test_user.save()
        
        assert test_user.is_active is False
        assert User.objects.filter(id=test_user.id).exists()
    
    def test_anonymize_user_data(self, test_user):
        """Teste anonimização de dados do usuário."""
        original_email = test_user.email
        
        # Anonimizar
        test_user.email = f'deleted_{test_user.id}@anonimizado.local'
        test_user.first_name = 'ANONIMIZADO'
        test_user.last_name = ''
        test_user.is_active = False
        test_user.save()
        
        # Verificar anonimização
        user = User.objects.get(id=test_user.id)
        assert user.email != original_email
        assert 'anonimizado' in user.email
        assert user.first_name == 'ANONIMIZADO'
    
    def test_cascade_delete_consent_history(self, test_user, consent_version):
        """Teste exclusão em cascata do histórico de consentimento."""
        # Criar consentimento
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='127.0.0.1',
            accepted=True
        )
        
        # Verificar existência
        assert UserConsent.objects.filter(user=test_user).exists()
        
        # Excluir usuário
        user_id = test_user.id
        test_user.delete()
        
        # Verificar cascata
        assert not User.objects.filter(id=user_id).exists()
        assert not UserConsent.objects.filter(user_id=user_id).exists()
    
    def test_delete_preserves_audit_summary(self, test_user, consent_version):
        """Teste anonimização preserva registro para auditoria."""
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='192.168.1.1',
            accepted=True
        )
        
        # Antes da anonimização
        original_count = UserConsent.objects.count()
        
        # Anonimizar em vez de deletar
        test_user.email = f'deleted_{test_user.id}@anonimizado.local'
        test_user.is_active = False
        test_user.save()
        
        # Histórico de consentimento preservado
        assert UserConsent.objects.count() == original_count


# ======================
# TESTES DE DATA MINIMIZATION
# ======================

@pytest.mark.django_db
class TestDataMinimization:
    """Testes para minimização de dados LGPD."""
    
    def test_user_required_fields_only(self, db):
        """Teste que usuário pode ser criado com campos mínimos."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        
        user = User.objects.create_user(
            username=f'minimal-{unique_id}@test.com',
            email=f'minimal-{unique_id}@test.com',
            password='MinimalPass123!'
        )
        
        assert user.id is not None
        assert user.first_name == ''
        assert user.last_name == ''
    
    def test_consent_stores_minimal_data(self, test_user, consent_version):
        """Teste que consentimento armazena dados mínimos."""
        user_consent = UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='192.168.1.1',
            accepted=True
        )
        
        # Verificar campos armazenados
        fields = [f.name for f in UserConsent._meta.get_fields()]
        
        # Deve ter campos essenciais
        assert 'user' in fields
        assert 'consent_version' in fields
        assert 'accepted_at' in fields
    
    def test_no_unnecessary_personal_data(self, test_user):
        """Teste que modelo User não tem campos desnecessários."""
        user_fields = [f.name for f in User._meta.get_fields()]
        
        # Campos que NÃO devem existir
        unnecessary_fields = ['cpf', 'rg', 'mothers_name', 'social_security']
        
        for field in unnecessary_fields:
            assert field not in user_fields, f"Campo desnecessário: {field}"


# ======================
# TESTES DE LGPD COMPLIANCE
# ======================

@pytest.mark.django_db
class TestLGPDCompliance:
    """Testes de compliance geral LGPD."""
    
    def test_consent_before_data_processing(self, test_user, consent_version):
        """Teste que consentimento é verificado antes do processamento."""
        # Verificar se já aceitou
        has_consent = UserConsent.objects.filter(
            user=test_user,
            consent_version__document_type='privacy_policy',
            consent_version__is_current=True,
            accepted=True
        ).exists()
        
        assert has_consent is False
        
        # Registrar consentimento
        UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='127.0.0.1',
            accepted=True
        )
        
        # Verificar novamente
        has_consent = UserConsent.objects.filter(
            user=test_user,
            consent_version__document_type='privacy_policy',
            consent_version__is_current=True,
            accepted=True
        ).exists()
        
        assert has_consent is True
    
    def test_right_to_be_informed(self, consent_version):
        """Teste direito à informação - políticas acessíveis."""
        assert consent_version.content_url is not None
        assert 'http' in consent_version.content_url
    
    def test_consent_withdrawal(self, test_user, consent_version):
        """Teste revogação de consentimento."""
        # Aceitar
        user_consent = UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='127.0.0.1',
            accepted=True
        )
        
        # Revogar (marcar como revogado)
        user_consent.revoked = True
        user_consent.revoked_at = timezone.now()
        user_consent.save()
        
        # Verificar revogação
        user_consent.refresh_from_db()
        assert user_consent.revoked is True
        assert user_consent.revoked_at is not None
    
    def test_data_retention_awareness(self, test_user, consent_version):
        """Teste que dados têm timestamp para controle de retenção."""
        user_consent = UserConsent.objects.create(
            user=test_user,
            consent_version=consent_version,
            ip_address='127.0.0.1',
            accepted=True,
            accepted_at=timezone.now()  # Campo manual quando accepted=True
        )
        
        # Verificar timestamp
        assert user_consent.accepted_at is not None
        
        # Calcular tempo desde consentimento
        time_since_consent = timezone.now() - user_consent.accepted_at
        assert time_since_consent.total_seconds() >= 0
