# 📋 SPRINT 2 PLANNING GUIDE - WORKFLOW & NOTIFICATIONS

## 🎯 CONTEXTO

**Período:** 03/02 → 14/02/2026 (12 dias úteis)  
**Objetivo:** Habilitar colaboração efetiva entre membros da equipe  
**Capacidade:** 12 dias × 4h/dia = 48 horas disponíveis

---

## 🎯 METAS DO SPRINT 2

### Objetivo Principal
Transformar o sistema de feedbacks em uma ferramenta colaborativa onde múltiplos membros podem:
- Atribuir feedbacks entre si
- Receber notificações por email
- Organizar feedbacks com tags
- Priorizar trabalho
- Acompanhar SLAs

### Resultados Esperados
- ✅ Admin pode atribuir feedback para qualquer membro
- ✅ Membros recebem email quando feedback é atribuído
- ✅ Filtro "Meus Feedbacks" funciona
- ✅ Tags podem ser criadas e aplicadas
- ✅ Prioridade visual (badges coloridos)
- ✅ Dashboard mostra SLA compliance

---

## 📦 BACKLOG SPRINT 2

### FEATURE 1: Atribuição de Feedbacks (6 horas)

**User Story:**
> Como Admin/Moderator, eu quero atribuir feedbacks para membros específicos da equipe, para que cada pessoa saiba quais feedbacks são de sua responsabilidade.

**Critérios de Aceite:**
- [ ] Campo `assigned_to` adicionado ao model Feedback
- [ ] Endpoint `POST /api/feedbacks/{id}/assign/` funcional
- [ ] Apenas Admin/Moderator pode atribuir
- [ ] Filtro `?assigned_to=me` retorna feedbacks do usuário logado
- [ ] UI mostra quem está atribuído (avatar + nome)
- [ ] Dropdown de seleção de membro

**Tarefas Técnicas:**

#### Backend (3h)
1. **Adicionar campo ao model** (1h)
   ```python
   # apps/backend/apps/feedbacks/models.py
   class Feedback(models.Model):
       # ... campos existentes
       assigned_to = models.ForeignKey(
           'tenants.TeamMember',
           on_delete=models.SET_NULL,
           null=True, blank=True,
           related_name='assigned_feedbacks'
       )
       assigned_at = models.DateTimeField(null=True, blank=True)
   ```

2. **Criar endpoint de atribuição** (1h)
   ```python
   # apps/backend/apps/feedbacks/views.py
   @action(detail=True, methods=['post'])
   @require_permission('manage_feedbacks')
   def assign(self, request, pk=None):
       feedback = self.get_object()
       team_member_id = request.data.get('team_member_id')
       # ... lógica de atribuição
   ```

3. **Adicionar filtro** (30min)
   ```python
   # apps/backend/apps/feedbacks/filters.py
   class FeedbackFilter(filters.FilterSet):
       assigned_to = filters.NumberFilter()
       assigned_to_me = filters.BooleanFilter(method='filter_assigned_to_me')
   ```

4. **Migration** (30min)
   ```bash
   python manage.py makemigrations feedbacks --name add_assignment
   python manage.py migrate
   ```

#### Frontend (3h)
1. **Atualizar interface Feedback** (1h)
   - Adicionar campo TypeScript: `assigned_to?: TeamMember`
   - Atualizar `FeedbackCard.tsx` para mostrar avatar

2. **Criar AssignDialog component** (1h)
   ```typescript
   // components/feedbacks/AssignDialog.tsx
   - Select com lista de team members
   - Botão "Atribuir"
   - API call para /api/feedbacks/{id}/assign/
   ```

3. **Adicionar filtro "Meus Feedbacks"** (1h)
   ```typescript
   // app/dashboard/feedbacks/page.tsx
   - Tabs: Todos | Meus | Não atribuídos
   - Query param: ?assigned_to=me
   ```

**Estimativa:** 6 horas  
**Prioridade:** MUST HAVE

---

### FEATURE 2: Email Notifications (6 horas)

**User Story:**
> Como membro da equipe, eu quero receber notificações por email quando um feedback for atribuído para mim, para que eu possa responder rapidamente.

**Critérios de Aceite:**
- [ ] Email enviado ao atribuir feedback
- [ ] Email enviado quando novo feedback é criado (para admins)
- [ ] Template HTML bonito e profissional
- [ ] Link direto para o feedback
- [ ] Async via Celery (não bloqueia request)

**Tarefas Técnicas:**

#### Backend (4h)
1. **Criar template de email** (1h)
   ```html
   <!-- apps/backend/templates/emails/feedback_assigned.html -->
   - Header com logo
   - Mensagem: "Você foi atribuído ao feedback #123"
   - Detalhes: título, cliente, prioridade
   - CTA: "Ver Feedback"
   - Footer
   ```

2. **Criar signal** (1h)
   ```python
   # apps/backend/apps/feedbacks/signals.py
   from django.db.models.signals import post_save
   from django.dispatch import receiver
   
   @receiver(post_save, sender=Feedback)
   def send_assignment_email(sender, instance, **kwargs):
       if instance.assigned_to:
           send_email_task.delay(
               template='feedback_assigned',
               to=instance.assigned_to.user.email,
               context={'feedback': instance}
           )
   ```

3. **Configurar Celery** (1h)
   ```python
   # apps/backend/apps/feedbacks/tasks.py
   from celery import shared_task
   from django.core.mail import send_mail
   
   @shared_task
   def send_email_task(template, to, context):
       # ... lógica de envio
   ```

4. **Adicionar preferências de email** (1h)
   ```python
   # Permitir usuário desabilitar notificações
   # apps/backend/apps/tenants/models.py
   class TeamMember:
       email_notifications = models.BooleanField(default=True)
   ```

#### Frontend (2h)
1. **Página de preferências** (2h)
   ```typescript
   // app/dashboard/configuracoes/notificacoes/page.tsx
   - Toggle: Receber emails de atribuição
   - Toggle: Receber emails de novos feedbacks
   - Botão Salvar
   ```

**Estimativa:** 6 horas  
**Prioridade:** MUST HAVE

---

### FEATURE 3: Tags/Labels (8 horas)

**User Story:**
> Como usuário, eu quero organizar feedbacks com tags (ex: "bug", "feature", "urgente"), para facilitar a busca e categorização.

**Critérios de Aceite:**
- [ ] Tags podem ser criadas
- [ ] Tags podem ser aplicadas a feedbacks
- [ ] Cores diferentes para cada tag
- [ ] Filtro por tag funciona
- [ ] Autocompletar ao digitar tag

**Tarefas Técnicas:**

#### Backend (4h)
1. **Criar model Tag** (1h)
   ```python
   class Tag(models.Model):
       client = models.ForeignKey('tenants.Client')
       name = models.CharField(max_length=50)
       color = models.CharField(max_length=7)  # hex color
       created_at = models.DateTimeField(auto_now_add=True)
   ```

2. **ManyToMany com Feedback** (1h)
   ```python
   class Feedback(models.Model):
       # ...
       tags = models.ManyToManyField(Tag, blank=True)
   ```

3. **CRUD API** (2h)
   ```python
   class TagViewSet(viewsets.ModelViewSet):
       # GET /api/tags/
       # POST /api/tags/
       # DELETE /api/tags/{id}/
   ```

#### Frontend (4h)
1. **TagPicker component** (2h)
   ```typescript
   // components/feedbacks/TagPicker.tsx
   - Input com autocompletar
   - Lista de tags selecionadas
   - Botão criar nova tag
   - Color picker
   ```

2. **Integrar no FeedbackCard** (1h)
   - Mostrar badges de tags
   - Clicar na tag filtra por ela

3. **Filtro por tag** (1h)
   - Sidebar com lista de tags
   - Query param: ?tags=bug,feature

**Estimativa:** 8 horas  
**Prioridade:** SHOULD HAVE

---

### FEATURE 4: Prioridade (4 horas)

**User Story:**
> Como moderator, eu quero marcar feedbacks com prioridade (baixa, média, alta, urgente), para saber o que precisa ser feito primeiro.

**Critérios de Aceite:**
- [ ] Campo prioridade adicionado
- [ ] 4 níveis: BAIXA, MEDIA, ALTA, URGENTE
- [ ] Badges coloridos (cinza, azul, laranja, vermelho)
- [ ] Filtro por prioridade funciona
- [ ] Ordenação por prioridade

**Tarefas Técnicas:**

#### Backend (2h)
1. **Adicionar campo** (1h)
   ```python
   class Feedback(models.Model):
       PRIORIDADE_CHOICES = [
           ('BAIXA', 'Baixa'),
           ('MEDIA', 'Média'),
           ('ALTA', 'Alta'),
           ('URGENTE', 'Urgente'),
       ]
       prioridade = models.CharField(
           max_length=10,
           choices=PRIORIDADE_CHOICES,
           default='MEDIA'
       )
   ```

2. **Filtro e ordenação** (1h)
   ```python
   class FeedbackFilter:
       prioridade = filters.ChoiceFilter(choices=Feedback.PRIORIDADE_CHOICES)
   ```

#### Frontend (2h)
1. **PriorityBadge component** (1h)
   ```typescript
   const getPriorityColor = (priority) => {
     const colors = {
       BAIXA: 'gray',
       MEDIA: 'blue',
       ALTA: 'orange',
       URGENTE: 'red',
     };
     return colors[priority];
   };
   ```

2. **Select de prioridade** (1h)
   - No form de criar/editar feedback
   - Filtro na sidebar

**Estimativa:** 4 horas  
**Prioridade:** SHOULD HAVE

---

### FEATURE 5: SLA Tracking (12 horas)

**User Story:**
> Como gestor, eu quero acompanhar se os feedbacks estão sendo respondidos dentro do prazo esperado (SLA), para manter a qualidade do atendimento.

**Critérios de Aceite:**
- [ ] SLA definido por prioridade e tipo
- [ ] Tempo decorrido calculado automaticamente
- [ ] Alerta visual quando SLA violado
- [ ] Dashboard de compliance (% dentro do SLA)
- [ ] Relatório exportável

**Tarefas Técnicas:**

#### Backend (6h)
1. **Criar model SLA** (2h)
   ```python
   class SLAConfiguration(models.Model):
       client = models.ForeignKey('tenants.Client')
       prioridade = models.CharField()
       tipo_feedback = models.CharField()
       tempo_resposta_horas = models.IntegerField()  # SLA primeira resposta
       tempo_resolucao_horas = models.IntegerField()  # SLA resolução
   ```

2. **Calcular tempo decorrido** (2h)
   ```python
   class Feedback(models.Model):
       @property
       def tempo_decorrido(self):
           # Calcular considerando apenas horário comercial
           # Descontar finais de semana
   
       @property
       def sla_status(self):
           # 'OK', 'WARNING', 'VIOLATED'
   ```

3. **Endpoint de métricas** (2h)
   ```python
   GET /api/analytics/sla/
   {
     "compliance_rate": 85.5,  # %
     "by_priority": {...},
     "violations_count": 12
   }
   ```

#### Frontend (6h)
1. **SLA config page** (2h)
   ```typescript
   // app/dashboard/configuracoes/sla/page.tsx
   - Form para definir SLAs
   - Tabela com configurações atuais
   ```

2. **SLA indicator** (2h)
   ```typescript
   // components/feedbacks/SLAIndicator.tsx
   - Progressbar de tempo
   - Cores: verde (OK), amarelo (WARNING), vermelho (VIOLATED)
   ```

3. **Dashboard de SLA** (2h)
   ```typescript
   // app/dashboard/analytics/sla/page.tsx
   - Gráfico de compliance ao longo do tempo
   - Lista de violações recentes
   - Filtros por período
   ```

**Estimativa:** 12 horas  
**Prioridade:** SHOULD HAVE

---

## 📊 RESUMO DO BACKLOG

| Feature | Estimativa | Prioridade | Dependências |
|---------|-----------|-----------|--------------|
| Atribuição | 6h | MUST | Multi-user (Sprint 1) |
| Notifications | 6h | MUST | Atribuição, SMTP |
| Tags | 8h | SHOULD | - |
| Prioridade | 4h | SHOULD | - |
| SLA Tracking | 12h | SHOULD | Prioridade |
| **Testes** | 6h | MUST | Todas features |
| **Docs** | 4h | SHOULD | - |
| **Buffer** | 2h | - | - |
| **TOTAL** | **48h** | | |

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### Semana 1 (03-07/02)
**Foco:** Features MUST HAVE + fundação

- **Dia 1 (03/02):** Atribuição - Backend (3h)
- **Dia 2 (04/02):** Atribuição - Frontend (3h)
- **Dia 3 (05/02):** Notifications - Backend (4h)
- **Dia 4 (06/02):** Notifications - Frontend (2h) + Prioridade Backend (2h)
- **Dia 5 (07/02):** Prioridade Frontend (2h) + Tags Backend (2h)

### Semana 2 (10-14/02)
**Foco:** Features SHOULD HAVE + polish

- **Dia 6 (10/02):** Tags Frontend (4h)
- **Dia 7 (11/02):** SLA Backend (6h)
- **Dia 8 (12/02):** SLA Frontend (6h)
- **Dia 9 (13/02):** Testes (6h)
- **Dia 10 (14/02):** Review, Retro, Docs (4h)

---

## ✅ DEFINITION OF DONE

Cada feature só está completa quando:

### Backend
- [ ] Model criado com migrations
- [ ] API endpoint implementado
- [ ] Serializer com validação
- [ ] Permissions verificadas
- [ ] Testes unitários passando
- [ ] Documentação API atualizada

### Frontend
- [ ] Component criado
- [ ] Integração API funcional
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design
- [ ] Tipos TypeScript corretos

### QA
- [ ] Teste manual completo
- [ ] Teste de permissões
- [ ] Teste de edge cases
- [ ] Teste em diferentes navegadores
- [ ] Performance OK (< 2s load)

---

## 🚀 PREPARAÇÃO PARA SPRINT 2

### Pré-requisitos
- [x] Sprint 1 completo (100%)
- [x] Deploy staging funcionando
- [ ] SMTP configurado e testado
- [ ] Celery configurado
- [ ] Redis funcionando

### Setup Inicial (27-31/01)

#### 1. Configurar Celery (1h)

```bash
# Adicionar ao requirements.txt
celery==5.6.2
redis==7.1.0

# Criar celery.py
# apps/backend/config/celery.py
```

```python
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('ouvy')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

#### 2. Criar estrutura de emails (30min)

```bash
mkdir -p apps/backend/templates/emails
touch apps/backend/templates/emails/feedback_assigned.html
touch apps/backend/templates/emails/feedback_created.html
```

#### 3. Preparar testes (30min)

```bash
mkdir -p apps/backend/tests/integration
touch apps/backend/tests/integration/test_assignment_flow.py
touch apps/backend/tests/integration/test_email_notifications.py
```

---

## 📚 RECURSOS TÉCNICOS

### Django Signals
- Docs: https://docs.djangoproject.com/en/6.0/topics/signals/
- Tutorial: https://simpleisbetterthancomplex.com/tutorial/2016/07/28/how-to-create-django-signals.html

### Celery
- Docs: https://docs.celeryq.dev/en/stable/
- Django integration: https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html

### Django Email
- Docs: https://docs.djangoproject.com/en/6.0/topics/email/
- HTML emails: https://docs.djangoproject.com/en/6.0/topics/email/#sending-alternative-content-types

---

## 🎯 MÉTRICAS DE SUCESSO

### Sprint 2 será considerado bem-sucedido quando:

**Funcionalidades:**
- ✅ 100% das features MUST implementadas
- ✅ ≥80% das features SHOULD implementadas
- ✅ Emails sendo enviados corretamente
- ✅ Atribuição funcionando end-to-end

**Qualidade:**
- ✅ ≥80% cobertura de testes
- ✅ 0 bugs críticos
- ✅ Performance < 2s (p95)
- ✅ 100% testes passando

**Entrega:**
- ✅ Deploy em staging
- ✅ Demo para stakeholders
- ✅ Documentação atualizada
- ✅ Retrospective feita

---

**Criado em:** 26/01/2026  
**Sprint Start:** 03/02/2026  
**Sprint End:** 14/02/2026  
**Review:** 14/02/2026 16h

🚀 **Bora começar o Sprint 2!**
