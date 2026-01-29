# 📘 Tutorial: Adicionar Novo Endpoint na API

> **Tempo estimado:** 30 minutos  
> **Nível:** Intermediário  
> **Última atualização:** Janeiro 2026

## 📋 O que você vai aprender

Neste tutorial, vamos criar um endpoint completo:
- `POST /api/feedbacks/{id}/comments/` - Adicionar comentário em feedback

Você aprenderá:
1. Criar Model Django
2. Criar Migration
3. Criar Serializer
4. Criar View/Action
5. Configurar URL
6. Documentar com Swagger
7. Escrever Testes
8. Fazer commit semântico

---

## 🎯 Caso de Uso

> **Como** um membro da equipe  
> **Eu quero** adicionar comentários em feedbacks  
> **Para** registrar atualizações e comunicação interna

---

## 📁 Estrutura Final

Ao final, você terá criado/modificado:

```
apps/backend/
├── apps/feedbacks/
│   ├── models.py          # + FeedbackComment
│   ├── serializers.py     # + FeedbackCommentSerializer
│   ├── views.py           # + action add_comment
│   └── migrations/
│       └── 00XX_add_feedback_comments.py
└── tests/
    └── test_feedback_comments.py
```

---

## 🚀 Passo 1: Criar Model (5 min)

Abra `apps/backend/apps/feedbacks/models.py` e adicione:

```python
# apps/backend/apps/feedbacks/models.py

# ... imports existentes ...

class FeedbackComment(models.Model):
    """
    Comentário interno em um feedback.
    
    Usado para comunicação da equipe sobre o feedback,
    registrar atualizações e histórico de atendimento.
    """
    
    feedback = models.ForeignKey(
        'Feedback',
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Feedback'
    )
    author = models.ForeignKey(
        'tenants.TeamMember',
        on_delete=models.SET_NULL,
        null=True,
        related_name='feedback_comments',
        verbose_name='Autor'
    )
    text = models.TextField(
        verbose_name='Comentário'
    )
    is_internal = models.BooleanField(
        default=True,
        verbose_name='Interno',
        help_text='Comentários internos não são visíveis para o autor do feedback'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    class Meta:
        db_table = 'feedback_comments'
        ordering = ['-created_at']
        verbose_name = 'Comentário de Feedback'
        verbose_name_plural = 'Comentários de Feedback'
    
    def __str__(self):
        return f"Comentário de {self.author} em {self.feedback}"
```

### Conceitos importantes:

| Campo | Tipo | Por quê? |
|-------|------|----------|
| `feedback` | ForeignKey | Relaciona com o feedback pai |
| `author` | ForeignKey | Quem escreveu (SET_NULL preserva histórico) |
| `text` | TextField | Conteúdo sem limite de caracteres |
| `is_internal` | BooleanField | Controle de visibilidade |
| `related_name` | string | Permite `feedback.comments.all()` |

---

## 🔄 Passo 2: Criar Migration (2 min)

```bash
cd apps/backend

# Gerar migration
python manage.py makemigrations feedbacks --name add_feedback_comments

# Verificar o que será criado
python manage.py sqlmigrate feedbacks 00XX_add_feedback_comments

# Aplicar
python manage.py migrate
```

Output esperado:
```
Migrations for 'feedbacks':
  apps/feedbacks/migrations/00XX_add_feedback_comments.py
    - Create model FeedbackComment
```

---

## 📦 Passo 3: Criar Serializer (5 min)

Abra `apps/backend/apps/feedbacks/serializers.py` e adicione:

```python
# apps/backend/apps/feedbacks/serializers.py

# ... imports existentes ...

class FeedbackCommentSerializer(serializers.ModelSerializer):
    """Serializer para comentários de feedback."""
    
    author_name = serializers.CharField(
        source='author.user.get_full_name',
        read_only=True
    )
    author_email = serializers.EmailField(
        source='author.user.email',
        read_only=True
    )
    
    class Meta:
        model = FeedbackComment
        fields = [
            'id',
            'text',
            'is_internal',
            'author',
            'author_name',
            'author_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'author',
            'created_at',
            'updated_at',
        ]
    
    def validate_text(self, value):
        """Validar texto do comentário."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "O comentário não pode estar vazio."
            )
        if len(value) > 5000:
            raise serializers.ValidationError(
                "O comentário não pode ter mais de 5000 caracteres."
            )
        return value.strip()


class FeedbackCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para criação."""
    
    class Meta:
        model = FeedbackComment
        fields = ['text', 'is_internal']
    
    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "O comentário não pode estar vazio."
            )
        return value.strip()
```

### Boas práticas de Serializers:

1. **Separar Read/Write** - Use serializers diferentes para criar vs listar
2. **Campos read_only** - IDs, timestamps, dados calculados
3. **Validação** - Sempre validar entrada do usuário
4. **Source** - Acessar dados relacionados sem queries extras

---

## 👁️ Passo 4: Criar View/Action (10 min)

Abra `apps/backend/apps/feedbacks/views.py` e adicione o action:

```python
# apps/backend/apps/feedbacks/views.py

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

# ... imports existentes ...

from .models import Feedback, FeedbackComment
from .serializers import (
    FeedbackSerializer,
    FeedbackCommentSerializer,
    FeedbackCommentCreateSerializer,
)


class FeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de feedbacks."""
    
    # ... código existente ...
    
    # =========================================================================
    # COMMENTS
    # =========================================================================
    
    @extend_schema(
        summary="Listar comentários do feedback",
        description="""
        Retorna todos os comentários de um feedback específico.
        
        **Permissões:**
        - Usuário deve estar autenticado
        - Usuário deve ter acesso ao tenant do feedback
        
        **Ordenação:** Mais recentes primeiro
        """,
        responses={
            200: FeedbackCommentSerializer(many=True),
            404: {"description": "Feedback não encontrado"},
        },
        tags=['Feedbacks - Comentários']
    )
    @action(detail=True, methods=['get'], url_path='comments')
    def list_comments(self, request, pk=None):
        """Listar comentários de um feedback."""
        feedback = self.get_object()
        comments = feedback.comments.select_related(
            'author__user'
        ).all()
        
        serializer = FeedbackCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Adicionar comentário ao feedback",
        description="""
        Adiciona um novo comentário a um feedback.
        
        **Campos:**
        - `text` (obrigatório): Texto do comentário (max 5000 caracteres)
        - `is_internal` (opcional): Se true, visível apenas para equipe (default: true)
        
        **Comportamento:**
        - O autor é automaticamente definido como o usuário logado
        - Notificação é enviada para membros atribuídos ao feedback
        """,
        request=FeedbackCommentCreateSerializer,
        responses={
            201: FeedbackCommentSerializer,
            400: {"description": "Dados inválidos"},
            404: {"description": "Feedback não encontrado"},
        },
        examples=[
            OpenApiExample(
                'Comentário interno',
                summary='Adicionar comentário interno',
                description='Comentário visível apenas para a equipe',
                value={
                    'text': 'Entrei em contato com o cliente por telefone.',
                    'is_internal': True
                },
                request_only=True,
            ),
            OpenApiExample(
                'Comentário público',
                summary='Adicionar comentário público',
                description='Comentário visível para o autor do feedback',
                value={
                    'text': 'Sua solicitação está sendo analisada.',
                    'is_internal': False
                },
                request_only=True,
            ),
        ],
        tags=['Feedbacks - Comentários']
    )
    @action(detail=True, methods=['post'], url_path='comments')
    def add_comment(self, request, pk=None):
        """Adicionar comentário a um feedback."""
        feedback = self.get_object()
        
        serializer = FeedbackCommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obter TeamMember do usuário logado
        try:
            team_member = request.user.team_memberships.get(
                client=feedback.client
            )
        except Exception:
            return Response(
                {'detail': 'Você não é membro deste tenant.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Criar comentário
        comment = FeedbackComment.objects.create(
            feedback=feedback,
            author=team_member,
            text=serializer.validated_data['text'],
            is_internal=serializer.validated_data.get('is_internal', True),
        )
        
        # TODO: Enviar notificação async
        # notify_new_comment.delay(comment.id)
        
        output_serializer = FeedbackCommentSerializer(comment)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Deletar comentário",
        description="""
        Remove um comentário de um feedback.
        
        **Permissões:**
        - Apenas o autor do comentário pode deletar
        - Admins podem deletar qualquer comentário
        """,
        responses={
            204: {"description": "Comentário deletado"},
            403: {"description": "Sem permissão"},
            404: {"description": "Comentário não encontrado"},
        },
        tags=['Feedbacks - Comentários']
    )
    @action(
        detail=True,
        methods=['delete'],
        url_path='comments/(?P<comment_id>[^/.]+)'
    )
    def delete_comment(self, request, pk=None, comment_id=None):
        """Deletar um comentário específico."""
        feedback = self.get_object()
        
        try:
            comment = feedback.comments.get(id=comment_id)
        except FeedbackComment.DoesNotExist:
            return Response(
                {'detail': 'Comentário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar permissão
        team_member = request.user.team_memberships.filter(
            client=feedback.client
        ).first()
        
        is_author = comment.author == team_member
        is_admin = team_member and team_member.role in ['OWNER', 'ADMIN']
        
        if not (is_author or is_admin):
            return Response(
                {'detail': 'Sem permissão para deletar este comentário.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Anatomia de uma Action:

```python
@extend_schema(...)           # Documentação Swagger
@action(
    detail=True,              # True = /feedbacks/{id}/comments
    methods=['post'],         # Métodos HTTP permitidos
    url_path='comments'       # URL customizada
)
def add_comment(self, request, pk=None):
    feedback = self.get_object()  # Busca feedback pelo pk
    # ... lógica
```

---

## 🔗 Passo 5: Verificar URLs (2 min)

As URLs são geradas automaticamente pelo router do DRF.

Verifique em `apps/backend/apps/feedbacks/urls.py`:

```python
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet

router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')

urlpatterns = router.urls
```

**URLs geradas automaticamente:**

| Método | URL | Action |
|--------|-----|--------|
| GET | `/api/feedbacks/{id}/comments/` | list_comments |
| POST | `/api/feedbacks/{id}/comments/` | add_comment |
| DELETE | `/api/feedbacks/{id}/comments/{comment_id}/` | delete_comment |

---

## 📖 Passo 6: Verificar Documentação (2 min)

1. Rode o servidor: `python manage.py runserver`
2. Acesse: http://localhost:8000/api/docs/
3. Procure por "Feedbacks - Comentários"
4. Verifique se os endpoints aparecem com descrições

---

## 🧪 Passo 7: Escrever Testes (15 min)

Crie `apps/backend/tests/test_feedback_comments.py`:

```python
# apps/backend/tests/test_feedback_comments.py

import pytest
from django.urls import reverse
from rest_framework import status
from apps.feedbacks.models import Feedback, FeedbackComment


@pytest.mark.django_db
class TestFeedbackComments:
    """Testes para endpoint de comentários em feedbacks."""
    
    # =========================================================================
    # LIST COMMENTS
    # =========================================================================
    
    def test_list_comments_success(self, api_client, feedback, team_member):
        """Listar comentários de um feedback."""
        # Arrange
        api_client.force_authenticate(user=team_member.user)
        FeedbackComment.objects.create(
            feedback=feedback,
            author=team_member,
            text='Comentário de teste'
        )
        
        # Act
        url = reverse('feedback-list-comments', args=[feedback.id])
        response = api_client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['text'] == 'Comentário de teste'
    
    def test_list_comments_empty(self, api_client, feedback, team_member):
        """Listar comentários quando não há nenhum."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list-comments', args=[feedback.id])
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0
    
    def test_list_comments_unauthorized(self, api_client, feedback):
        """Listar comentários sem autenticação falha."""
        url = reverse('feedback-list-comments', args=[feedback.id])
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # =========================================================================
    # ADD COMMENT
    # =========================================================================
    
    def test_add_comment_success(self, api_client, feedback, team_member):
        """Adicionar comentário com sucesso."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-add-comment', args=[feedback.id])
        data = {
            'text': 'Este é um comentário de teste.',
            'is_internal': True
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert FeedbackComment.objects.count() == 1
        
        comment = FeedbackComment.objects.first()
        assert comment.text == 'Este é um comentário de teste.'
        assert comment.author == team_member
        assert comment.is_internal is True
    
    def test_add_comment_empty_text_fails(self, api_client, feedback, team_member):
        """Adicionar comentário com texto vazio falha."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-add-comment', args=[feedback.id])
        data = {'text': '', 'is_internal': True}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'text' in response.data
    
    def test_add_comment_whitespace_only_fails(self, api_client, feedback, team_member):
        """Adicionar comentário apenas com espaços falha."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-add-comment', args=[feedback.id])
        data = {'text': '   ', 'is_internal': True}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_add_comment_default_is_internal(self, api_client, feedback, team_member):
        """is_internal deve ser True por padrão."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-add-comment', args=[feedback.id])
        data = {'text': 'Comentário sem is_internal'}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['is_internal'] is True
    
    def test_add_comment_unauthorized(self, api_client, feedback):
        """Adicionar comentário sem autenticação falha."""
        url = reverse('feedback-add-comment', args=[feedback.id])
        data = {'text': 'Tentativa sem auth'}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_add_comment_feedback_not_found(self, api_client, team_member):
        """Adicionar comentário em feedback inexistente falha."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-add-comment', args=[99999])
        data = {'text': 'Comentário'}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # =========================================================================
    # DELETE COMMENT
    # =========================================================================
    
    def test_delete_comment_as_author(self, api_client, feedback, team_member):
        """Autor pode deletar próprio comentário."""
        api_client.force_authenticate(user=team_member.user)
        
        comment = FeedbackComment.objects.create(
            feedback=feedback,
            author=team_member,
            text='Comentário para deletar'
        )
        
        url = reverse('feedback-delete-comment', args=[feedback.id, comment.id])
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert FeedbackComment.objects.count() == 0
    
    def test_delete_comment_not_author_fails(
        self, api_client, feedback, team_member, other_team_member
    ):
        """Não-autor não pode deletar comentário de outro."""
        # Criar comentário de outro membro
        comment = FeedbackComment.objects.create(
            feedback=feedback,
            author=other_team_member,
            text='Comentário de outro'
        )
        
        # Tentar deletar como team_member (não é autor nem admin)
        team_member.role = 'VIEWER'
        team_member.save()
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-delete-comment', args=[feedback.id, comment.id])
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert FeedbackComment.objects.count() == 1
    
    def test_delete_comment_as_admin(
        self, api_client, feedback, team_member, other_team_member
    ):
        """Admin pode deletar qualquer comentário."""
        # Criar comentário de outro membro
        comment = FeedbackComment.objects.create(
            feedback=feedback,
            author=other_team_member,
            text='Comentário de outro'
        )
        
        # Deletar como admin
        team_member.role = 'ADMIN'
        team_member.save()
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-delete-comment', args=[feedback.id, comment.id])
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    def test_delete_comment_not_found(self, api_client, feedback, team_member):
        """Deletar comentário inexistente retorna 404."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-delete-comment', args=[feedback.id, 99999])
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
```

### Rodar os testes:

```bash
# Apenas este arquivo
pytest tests/test_feedback_comments.py -v

# Com cobertura
pytest tests/test_feedback_comments.py --cov=apps/feedbacks -v

# Verbose com print statements
pytest tests/test_feedback_comments.py -v -s
```

Output esperado:
```
tests/test_feedback_comments.py::TestFeedbackComments::test_list_comments_success PASSED
tests/test_feedback_comments.py::TestFeedbackComments::test_add_comment_success PASSED
tests/test_feedback_comments.py::TestFeedbackComments::test_delete_comment_as_author PASSED
...

==================== 12 passed in 2.34s ====================
```

---

## ✅ Passo 8: Commit Semântico

```bash
git add -A
git status  # Verificar arquivos

git commit -m "feat(feedbacks): adicionar endpoint de comentários

- Model FeedbackComment com relacionamento
- Endpoints: list, create, delete comments
- Serializers com validação
- Documentação Swagger completa
- Testes: 12/12 passando

Refs: #123"
```

### Convenção de Commits:

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Apenas documentação |
| `test` | Apenas testes |
| `chore` | Manutenção (configs, deps) |

---

## ✅ Checklist Final

| Item | Status |
|------|--------|
| Model criado | ⬜ |
| Migration aplicada | ⬜ |
| Serializers implementados | ⬜ |
| View com @action decorator | ⬜ |
| URLs funcionando | ⬜ |
| Swagger docs visível | ⬜ |
| Testes passando (10+) | ⬜ |
| Commit semântico | ⬜ |

---

## 🎓 Conceitos Avançados

### Usando Signals para Notificações

```python
# apps/backend/apps/feedbacks/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import FeedbackComment
from .tasks import notify_new_comment

@receiver(post_save, sender=FeedbackComment)
def on_comment_created(sender, instance, created, **kwargs):
    if created:
        notify_new_comment.delay(instance.id)
```

### Task Celery para Notificação

```python
# apps/backend/apps/feedbacks/tasks.py

from celery import shared_task

@shared_task
def notify_new_comment(comment_id):
    from .models import FeedbackComment
    
    comment = FeedbackComment.objects.select_related(
        'feedback', 'author__user'
    ).get(id=comment_id)
    
    # Notificar assignee do feedback
    if comment.feedback.assigned_to:
        send_notification(
            user=comment.feedback.assigned_to.user,
            title="Novo comentário",
            message=f"{comment.author.user.email} comentou no feedback #{comment.feedback.codigo_rastreio}"
        )
```

---

## 🔗 Próximos Passos

1. **[Tutorial: Adicionar Página Frontend](./add-frontend-page.md)**
2. **[Tutorial: Guia de Testes](./testing-guide.md)**
3. **[Arquitetura](../ARCHITECTURE.md)**

---

*Última atualização: 29/01/2026*
