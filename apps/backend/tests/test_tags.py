"""
Testes para sistema de Tags de categorização de Feedbacks.
"""
import pytest
from apps.feedbacks.models import Tag, Feedback
from apps.core.utils import set_current_tenant, clear_current_tenant


@pytest.mark.django_db
class TestTagSystem:
    """Testes para o sistema de Tags."""

    def test_create_tag(self, user_factory, tenant_factory):
        """Testa criação de uma tag."""
        user = user_factory()
        tenant = tenant_factory()
        set_current_tenant(tenant)
        
        try:
            tag = Tag.objects.create(
                nome="Bug",
                cor="#FF0000",
                descricao="Reportes de bugs",
                criado_por=user,
                client=tenant
            )
            
            assert tag.nome == "Bug"
            assert tag.cor == "#FF0000"
            assert tag.criado_por == user
            assert tag.client == tenant
        finally:
            clear_current_tenant()

    def test_tag_feedback_count(self, user_factory, tenant_factory):
        """Testa contagem de feedbacks associados."""
        user = user_factory()
        tenant = tenant_factory()
        set_current_tenant(tenant)
        
        try:
            tag = Tag.objects.create(
                nome="Urgente",
                cor="#FFA500",
                criado_por=user,
                client=tenant
            )
            
            # Criar 3 feedbacks com esta tag
            for i in range(3):
                feedback = Feedback.objects.create(
                    tipo='SUGESTAO',
                    titulo=f"Feedback {i}",
                    descricao=f"Descrição {i}",
                    status='pendente',
                    client=tenant
                )
                feedback.tags.add(tag)
            
            # Verificar contagem
            assert tag.feedbacks.count() == 3
        finally:
            clear_current_tenant()

    def test_feedback_with_multiple_tags(self, user_factory, tenant_factory):
        """Testa feedback com múltiplas tags."""
        user = user_factory()
        tenant = tenant_factory()
        set_current_tenant(tenant)
        
        try:
            tag1 = Tag.objects.create(
                nome="Bug",
                cor="#FF0000",
                criado_por=user,
                client=tenant
            )
            tag2 = Tag.objects.create(
                nome="Urgente",
                cor="#FFA500",
                criado_por=user,
                client=tenant
            )
            
            feedback = Feedback.objects.create(
                tipo='SUGESTAO',
                titulo="Feedback Teste",
                descricao="Descrição",
                status='pendente',
                client=tenant
            )
            feedback.tags.add(tag1, tag2)
            
            # Verificar contagem e nomes
            assert feedback.tags.count() == 2
            tag_names = list(feedback.tags.values_list('nome', flat=True))
            assert "Bug" in tag_names
            assert "Urgente" in tag_names
        finally:
            clear_current_tenant()
