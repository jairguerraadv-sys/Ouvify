"""Testes de segurança para convites e branding (PARTE 2).

Cobertura:
- Aceite de convite não pode autenticar usuário existente sem senha correta.
- Atualização de branding deve ser restrita a OWNER/ADMIN.
"""

from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.tenants.models import Client, TeamInvitation, TeamMember

pytestmark = pytest.mark.django_db

User = get_user_model()


class TestTeamInvitationAcceptSecurity:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def tenant(self):
        return Client.objects.create(
            nome="Tenant Convites",
            subdominio="tenantconvites",
            plano="pro",
            ativo=True,
        )

    @pytest.fixture
    def inviter(self):
        return User.objects.create_user(
            username="inviter@example.com",
            email="inviter@example.com",
            password="InviterPass123!",
        )

    def test_accept_invitation_existing_user_requires_correct_password(
        self, api_client, tenant, inviter
    ):
        existing_user = User.objects.create_user(
            username="member@example.com",
            email="member@example.com",
            password="RightPass123!",
        )

        invitation = TeamInvitation.objects.create(
            client=tenant,
            invited_by=inviter,
            email=existing_user.email,
            role=TeamMember.VIEWER,
            expires_at=timezone.now() + timedelta(days=7),
        )

        # Senha incorreta: deve falhar e NÃO aceitar convite.
        resp = api_client.post(
            "/api/team/invitations/accept/",
            {
                "token": invitation.token,
                "first_name": "Membro",
                "last_name": "Existente",
                "password": "WrongPass123!",
                "password_confirm": "WrongPass123!",
            },
            format="json",
        )
        assert resp.status_code == 400
        invitation.refresh_from_db()
        assert invitation.status == TeamInvitation.PENDING
        assert not TeamMember.objects.filter(
            user=existing_user, client=tenant, status=TeamMember.ACTIVE
        ).exists()

        # Senha correta: deve aceitar e criar/ativar membership.
        resp_ok = api_client.post(
            "/api/team/invitations/accept/",
            {
                "token": invitation.token,
                "first_name": "Membro",
                "last_name": "Existente",
                "password": "RightPass123!",
                "password_confirm": "RightPass123!",
            },
            format="json",
        )
        assert resp_ok.status_code == 201
        invitation.refresh_from_db()
        assert invitation.status == TeamInvitation.ACCEPTED
        assert TeamMember.objects.filter(
            user=existing_user, client=tenant, status=TeamMember.ACTIVE
        ).exists()


class TestBrandingAuthorization:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def owner(self):
        return User.objects.create_user(
            username="owner@brand.com",
            email="owner@brand.com",
            password="OwnerPass123!",
        )

    @pytest.fixture
    def tenant(self, owner):
        return Client.objects.create(
            nome="Tenant Branding",
            subdominio="tenantbranding",
            plano="pro",
            ativo=True,
            owner=owner,
        )

    @pytest.fixture
    def viewer(self):
        return User.objects.create_user(
            username="viewer@brand.com",
            email="viewer@brand.com",
            password="ViewerPass123!",
        )

    @pytest.fixture
    def viewer_membership(self, tenant, viewer, owner):
        return TeamMember.objects.create(
            user=viewer,
            client=tenant,
            role=TeamMember.VIEWER,
            status=TeamMember.ACTIVE,
            invited_by=owner,
            joined_at=timezone.now(),
        )

    def test_viewer_cannot_patch_tenant_info_branding(
        self, api_client, tenant, viewer_membership, viewer
    ):
        access = str(RefreshToken.for_user(viewer).access_token)
        api_client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access}",
            HTTP_HOST=f"{tenant.subdominio}.localhost",
        )

        resp = api_client.patch(
            "/api/tenant-info/",
            {"cor_primaria": "#FF5722"},
            format="json",
        )
        assert resp.status_code == 403

    def test_owner_can_patch_tenant_info_branding(self, api_client, tenant, owner):
        access = str(RefreshToken.for_user(owner).access_token)
        api_client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access}",
            HTTP_HOST=f"{tenant.subdominio}.localhost",
        )

        resp = api_client.patch(
            "/api/tenant-info/",
            {"cor_primaria": "#FF5722"},
            format="json",
        )
        assert resp.status_code in (200, 400)
        if resp.status_code == 200:
            tenant.refresh_from_db()
            assert tenant.cor_primaria == "#FF5722"
