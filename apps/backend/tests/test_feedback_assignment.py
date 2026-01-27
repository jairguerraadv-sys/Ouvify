"""
Testes para sistema de atribuição de feedbacks.

Sprint 2 - Feature 1: Atribuição de Feedbacks
"""

import pytest
import uuid
from unittest import mock
from django.contrib.auth.models import User
from apps.tenants.models import Client, TeamMember
from apps.feedbacks.models import Feedback


@pytest.fixture(autouse=True)
def disable_celery_tasks():
    """Desabilita tasks Celery durante testes para evitar erro de conexão Redis."""
    with mock.patch('apps.notifications.tasks.send_feedback_created_push.delay'):
        with mock.patch('apps.notifications.tasks.send_status_update_push.delay'):
            yield


def get_unique_subdominio():
    """Gera subdomínio único para cada teste."""
    return f"testco-{uuid.uuid4().hex[:8]}"


@pytest.mark.django_db
class TestFeedbackAssignment:
    """Testes do sistema de atribuição de feedbacks."""
    
    def test_assign_feedback_to_team_member(self):
        """Admin pode atribuir feedback para team member."""
        from django.utils import timezone
        
        # Setup
        client = Client.objects.create(nome='Test Company', subdominio=get_unique_subdominio())
        admin_user = User.objects.create_user(f'admin-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        moderator_user = User.objects.create_user(f'mod-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        
        admin = TeamMember.objects.create(
            user=admin_user, client=client, role=TeamMember.ADMIN
        )
        moderator = TeamMember.objects.create(
            user=moderator_user, client=client, role=TeamMember.MODERATOR
        )
        
        feedback = Feedback.objects.create(
            client=client,
            titulo='Bug no Sistema',
            descricao='Sistema está lento',
            tipo='reclamacao'
        )
        
        # Atribuir
        feedback.assigned_to = moderator
        feedback.assigned_by = admin_user
        feedback.assigned_at = timezone.now()
        feedback.save()
        
        # Assert
        assert feedback.assigned_to == moderator
        assert feedback.assigned_by == admin_user
        assert feedback.assigned_at is not None
    
    def test_filter_assigned_to_me(self):
        """Filtro assigned_to_me retorna apenas feedbacks do usuário."""
        client = Client.objects.create(nome='Test', subdominio=get_unique_subdominio())
        user1 = User.objects.create_user(f'user1-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        user2 = User.objects.create_user(f'user2-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        
        member1 = TeamMember.objects.create(user=user1, client=client, role=TeamMember.MODERATOR)
        member2 = TeamMember.objects.create(user=user2, client=client, role=TeamMember.MODERATOR)
        
        feedback1 = Feedback.objects.create(
            client=client, 
            titulo='Feedback 1', 
            descricao='Descrição 1', 
            tipo='denuncia',
            assigned_to=member1
        )
        feedback2 = Feedback.objects.create(
            client=client, 
            titulo='Feedback 2', 
            descricao='Descrição 2', 
            tipo='denuncia',
            assigned_to=member2
        )
        
        # Usar all_tenants() para pegar todos os dados (necessário em testes sem context HTTP)
        my_feedbacks = Feedback.objects.all_tenants().filter(client=client, assigned_to=member1)
        
        assert my_feedbacks.count() == 1
        assert feedback1 in my_feedbacks
        assert feedback2 not in my_feedbacks
    
    def test_unassign_feedback(self):
        """Remover atribuição deve limpar campos."""
        client = Client.objects.create(nome='Test', subdominio=get_unique_subdominio())
        user = User.objects.create_user(f'user-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        member = TeamMember.objects.create(user=user, client=client, role=TeamMember.MODERATOR)
        
        feedback = Feedback.objects.create(
            client=client, 
            titulo='Test Feedback', 
            descricao='Test Description', 
            tipo='denuncia',
            assigned_to=member
        )
        
        # Desatribuir
        feedback.assigned_to = None
        feedback.save()
        
        assert feedback.assigned_to is None
    
    def test_filter_unassigned_feedbacks(self):
        """Filtro unassigned retorna apenas feedbacks sem atribuição."""
        client = Client.objects.create(nome='Test', subdominio=get_unique_subdominio())
        user = User.objects.create_user(f'user-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        member = TeamMember.objects.create(user=user, client=client, role=TeamMember.MODERATOR)
        
        feedback_assigned = Feedback.objects.create(
            client=client,
            titulo='Assigned',
            descricao='Has assignment',
            tipo='denuncia',
            assigned_to=member
        )
        
        feedback_unassigned = Feedback.objects.create(
            client=client,
            titulo='Unassigned',
            descricao='No assignment',
            tipo='sugestao'
        )
        
        # Usar all_tenants() para bypass do filtro tenant em testes
        unassigned = Feedback.objects.all_tenants().filter(client=client, assigned_to__isnull=True)
        
        assert unassigned.count() == 1
        assert feedback_unassigned in unassigned
        assert feedback_assigned not in unassigned
    
    def test_multiple_assignments_to_same_member(self):
        """Mesmo membro pode ter múltiplos feedbacks atribuídos."""
        client = Client.objects.create(nome='Test', subdominio=get_unique_subdominio())
        user = User.objects.create_user(f'user-{uuid.uuid4().hex[:8]}@test.com', password='Test@1234')
        member = TeamMember.objects.create(user=user, client=client, role=TeamMember.MODERATOR)
        
        feedback1 = Feedback.objects.create(
            client=client,
            titulo='Feedback 1',
            descricao='Description 1',
            tipo='denuncia',
            assigned_to=member
        )
        
        feedback2 = Feedback.objects.create(
            client=client,
            titulo='Feedback 2',
            descricao='Description 2',
            tipo='sugestao',
            assigned_to=member
        )
        
        # Usar all_tenants() em testes
        assigned = Feedback.objects.all_tenants().filter(client=client, assigned_to=member)
        assert assigned.count() == 2
        assert feedback1 in assigned
        assert feedback2 in assigned
