import pytest
from django.contrib.auth.models import User

from apps.tenants.models import Client, TeamInvitation, TeamMember


@pytest.mark.django_db
class TestTeamMember:
    def test_create_team_member(self):
        user = User.objects.create_user("test@example.com", password="pass123")
        client = Client.objects.create(nome="Test", subdominio="test")

        member = TeamMember.objects.create(
            user=user, client=client, role=TeamMember.ADMIN
        )

        assert member.role == TeamMember.ADMIN
        assert member.status == TeamMember.ACTIVE

    def test_owner_has_all_permissions(self):
        user = User.objects.create_user("owner@test.com", password="pass")
        client = Client.objects.create(nome="Test", subdominio="test")
        owner = TeamMember.objects.create(
            user=user, client=client, role=TeamMember.OWNER
        )

        assert owner.has_permission("manage_team") == True
        assert owner.has_permission("manage_billing") == True
        assert owner.has_permission("delete_tenant") == True

    def test_viewer_has_limited_permissions(self):
        user = User.objects.create_user("viewer@test.com", password="pass")
        client = Client.objects.create(nome="Test", subdominio="test")
        viewer = TeamMember.objects.create(
            user=user, client=client, role=TeamMember.VIEWER
        )

        assert viewer.has_permission("view_analytics") == True
        assert viewer.has_permission("manage_feedbacks") == False
        assert viewer.has_permission("manage_team") == False


@pytest.mark.django_db
class TestTeamInvitation:
    def test_create_invitation_with_token(self):
        admin = User.objects.create_user("admin@test.com", password="pass")
        client = Client.objects.create(nome="Test", subdominio="test")

        invitation = TeamInvitation.objects.create(
            client=client,
            invited_by=admin,
            email="newuser@test.com",
            role=TeamMember.MODERATOR,
        )

        assert invitation.token is not None
        assert len(invitation.token) > 40
        assert invitation.is_valid == True

    def test_accept_invitation_creates_team_member(self):
        admin = User.objects.create_user("admin@test.com", password="pass")
        client = Client.objects.create(nome="Test", subdominio="test")

        invitation = TeamInvitation.objects.create(
            client=client,
            invited_by=admin,
            email="newuser@test.com",
            role=TeamMember.MODERATOR,
        )

        new_user = User.objects.create_user("newuser@test.com", password="pass")
        team_member = invitation.accept(new_user)

        assert team_member.role == TeamMember.MODERATOR
        assert team_member.status == TeamMember.ACTIVE
        assert invitation.status == TeamInvitation.ACCEPTED


@pytest.mark.django_db
class TestClientTeamLimits:
    def test_free_plan_limit(self):
        client = Client.objects.create(nome="Free", subdominio="free", plano="free")
        assert client.get_team_members_limit() == 1

    def test_starter_plan_limit(self):
        client = Client.objects.create(
            nome="Starter", subdominio="starter", plano="starter"
        )
        assert client.get_team_members_limit() == 5

    def test_pro_plan_limit(self):
        client = Client.objects.create(nome="Pro", subdominio="pro", plano="pro")
        assert client.get_team_members_limit() == 15
