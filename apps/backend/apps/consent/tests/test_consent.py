"""
Testes de Consent - Ouvify
Sprint 2 Correções: Auditoria 30/01/2026

Cobertura:
- test_consent_version: Gerenciamento de versões de consent
- test_user_consent: Aceite e revogação de consentimento
- test_consent_audit: Trilha de auditoria de consentimentos
"""

import pytest
from apps.consent.models import ConsentVersion, UserConsent
from django.utils import timezone


@pytest.fixture
def test_user(db):
    """Cria usuário de teste."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    return User.objects.create_user(
        username="consent_test@example.com",
        email="consent_test@example.com",
        password="TestPass123!",
    )


@pytest.fixture
def terms_consent(db):
    """Cria versão de termos de uso."""
    return ConsentVersion.objects.create(
        document_type="terms",
        version="1.0",
        content_url="/terms/v1",
        is_current=True,
        is_required=True,
    )


@pytest.fixture
def privacy_consent(db):
    """Cria versão de política de privacidade."""
    return ConsentVersion.objects.create(
        document_type="privacy",
        version="1.0",
        content_url="/privacy/v1",
        is_current=True,
        is_required=True,
    )


@pytest.fixture
def marketing_consent(db):
    """Cria versão de consentimento de marketing (opcional)."""
    return ConsentVersion.objects.create(
        document_type="marketing",
        version="1.0",
        content_url="/marketing/v1",
        is_current=True,
        is_required=False,
    )


# ======================
# TESTES DE CONSENT VERSION MODEL
# ======================


@pytest.mark.django_db
class TestConsentVersionModel:
    """Testes unitários para modelo ConsentVersion."""

    def test_create_consent_version(self, db):
        """Criar versão de consentimento."""
        version = ConsentVersion.objects.create(
            document_type="lgpd", version="1.0", content_url="/lgpd/v1", is_current=True
        )

        assert version.id is not None
        assert version.document_type == "lgpd"
        assert version.is_current is True

    def test_only_one_current_version_per_type(self, db):
        """Apenas uma versão atual por tipo de documento."""
        v1 = ConsentVersion.objects.create(
            document_type="terms",
            version="1.0",
            content_url="/terms/v1",
            is_current=True,
        )

        v2 = ConsentVersion.objects.create(
            document_type="terms",
            version="2.0",
            content_url="/terms/v2",
            is_current=True,
        )

        # v1 deve ter sido desmarcado como current
        v1.refresh_from_db()
        assert v1.is_current is False
        assert v2.is_current is True

    def test_consent_version_str(self, terms_consent):
        """Teste representação string."""
        assert "Termos" in str(terms_consent) or "terms" in str(terms_consent).lower()
        assert "1.0" in str(terms_consent)


# ======================
# TESTES DE USER CONSENT MODEL
# ======================


@pytest.mark.django_db
class TestUserConsentModel:
    """Testes unitários para modelo UserConsent."""

    def test_create_user_consent(self, test_user, terms_consent):
        """Criar consentimento de usuário."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            context="signup",
        )

        assert consent.id is not None
        assert consent.accepted is False

    def test_accept_consent(self, test_user, terms_consent):
        """Aceitar consentimento."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            context="signup",
            accepted=True,
            accepted_at=timezone.now(),
        )

        assert consent.accepted is True
        assert consent.accepted_at is not None
        assert consent.revoked is False

    def test_revoke_consent(self, test_user, marketing_consent):
        """Revogar consentimento."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=marketing_consent,
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            context="settings",
            accepted=True,
            accepted_at=timezone.now(),
        )
        consent.revoke()

        assert consent.revoked is True
        assert consent.revoked_at is not None

    def test_anonymous_consent(self, terms_consent):
        """Consentimento de usuário anônimo (por email)."""
        consent = UserConsent.objects.create(
            email="anonymous@test.com",
            consent_version=terms_consent,
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
            context="feedback",
        )

        assert consent.user is None
        assert consent.email == "anonymous@test.com"


# ======================
# TESTES DE CONSENT AUDIT TRAIL
# ======================


@pytest.mark.django_db
class TestConsentAuditTrail:
    """Testes para trilha de auditoria de consentimento."""

    def test_consent_records_ip_address(self, test_user, terms_consent):
        """Consentimento deve registrar IP."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="203.0.113.50",
            user_agent="Test Agent",
            context="signup",
        )

        assert consent.ip_address == "203.0.113.50"

    def test_consent_records_user_agent(self, test_user, terms_consent):
        """Consentimento deve registrar user agent."""
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent=ua,
            context="signup",
        )

        assert consent.user_agent == ua

    def test_consent_records_context(self, test_user, terms_consent):
        """Consentimento deve registrar contexto."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            context="account_creation",
        )

        assert consent.context == "account_creation"

    def test_consent_timestamps(self, test_user, terms_consent):
        """Consentimento deve ter timestamps corretos."""
        before = timezone.now()

        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            context="signup",
            accepted=True,
            accepted_at=timezone.now(),
        )

        after = timezone.now()

        # accepted_at deve estar entre before e after
        assert consent.accepted_at is not None
        assert consent.accepted_at >= before
        assert consent.accepted_at <= after


# ======================
# TESTES DE CONSENT VERSION MANAGEMENT
# ======================


@pytest.mark.django_db
class TestConsentVersionManagement:
    """Testes para gerenciamento de versões de consentimento."""

    def test_multiple_document_types(self, db):
        """Deve suportar múltiplos tipos de documento."""
        terms = ConsentVersion.objects.create(
            document_type="terms",
            version="1.0",
            content_url="/terms/v1",
            is_current=True,
        )

        privacy = ConsentVersion.objects.create(
            document_type="privacy",
            version="1.0",
            content_url="/privacy/v1",
            is_current=True,
        )

        # Ambos devem ser current (tipos diferentes)
        assert terms.is_current is True
        assert privacy.is_current is True

    def test_version_history(self, db):
        """Deve manter histórico de versões."""
        ConsentVersion.objects.create(
            document_type="terms",
            version="1.0",
            content_url="/terms/v1",
            is_current=True,
        )

        ConsentVersion.objects.create(
            document_type="terms",
            version="2.0",
            content_url="/terms/v2",
            is_current=True,
        )

        # v1 ainda deve existir (histórico)
        assert ConsentVersion.objects.filter(document_type="terms").count() == 2

        # Apenas v2 é current
        current = ConsentVersion.objects.filter(document_type="terms", is_current=True)
        assert current.count() == 1
        assert current.first().version == "2.0"

    def test_required_vs_optional_consent(self, terms_consent, marketing_consent):
        """Diferenciação entre consent obrigatório e opcional."""
        assert terms_consent.is_required is True
        assert marketing_consent.is_required is False


# ======================
# TESTES DE USER CONSENT QUERIES
# ======================


@pytest.mark.django_db
class TestUserConsentQueries:
    """Testes para queries de consentimento."""

    def test_filter_by_user(self, test_user, terms_consent, privacy_consent):
        """Filtrar consents por usuário."""
        UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test",
            context="signup",
            accepted=True,
            accepted_at=timezone.now(),
        )

        UserConsent.objects.create(
            user=test_user,
            consent_version=privacy_consent,
            ip_address="127.0.0.1",
            user_agent="Test",
            context="signup",
            accepted=True,
            accepted_at=timezone.now(),
        )

        user_consents = UserConsent.objects.filter(user=test_user)
        assert user_consents.count() == 2

    def test_filter_accepted_consents(
        self, test_user, terms_consent, marketing_consent
    ):
        """Filtrar apenas consents aceitos."""
        UserConsent.objects.create(
            user=test_user,
            consent_version=terms_consent,
            ip_address="127.0.0.1",
            user_agent="Test",
            context="signup",
            accepted=True,
            accepted_at=timezone.now(),
        )

        UserConsent.objects.create(
            user=test_user,
            consent_version=marketing_consent,
            ip_address="127.0.0.1",
            user_agent="Test",
            context="signup",
            accepted=False,
        )

        accepted = UserConsent.objects.filter(user=test_user, accepted=True)
        assert accepted.count() == 1

    def test_filter_revoked_consents(self, test_user, marketing_consent):
        """Filtrar consents revogados."""
        consent = UserConsent.objects.create(
            user=test_user,
            consent_version=marketing_consent,
            ip_address="127.0.0.1",
            user_agent="Test",
            context="settings",
            accepted=True,
            accepted_at=timezone.now(),
        )
        consent.revoke()

        revoked = UserConsent.objects.filter(user=test_user, revoked=True)
        assert revoked.count() == 1
