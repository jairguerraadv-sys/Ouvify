# Parte 1 (continuação) — Varredura sistemática

Gerado em: 2026-02-03T10:52:24.354375+00:00

## Duplicações (>= 20 linhas)

Notas:

- Heurística por blocos idênticos (normalização leve).

- Para manter o tempo razoável, esta execução ignora arquivos > 350KB ou > 6000 linhas.


```
Blocos duplicados (min-lines=20):
================================================================================

[1] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:22
  - apps/backend/tests/test_analytics.py:26
  - apps/backend/tests/test_automations.py:22
  --- trecho (primeiras 5 linhas) ---
  from apps.core.utils import set_current_tenant
  
  
  @pytest.fixture(autouse=True)
  def skip_celery_tasks(monkeypatch):

[2] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:23
  - apps/backend/tests/test_analytics.py:27
  - apps/backend/tests/test_automations.py:23
  --- trecho (primeiras 5 linhas) ---
  
  
  @pytest.fixture(autouse=True)
  def skip_celery_tasks(monkeypatch):
      """Mocka tasks Celery."""

[3] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:24
  - apps/backend/tests/test_analytics.py:28
  - apps/backend/tests/test_automations.py:24
  --- trecho (primeiras 5 linhas) ---
  
  @pytest.fixture(autouse=True)
  def skip_celery_tasks(monkeypatch):
      """Mocka tasks Celery."""
      monkeypatch.setenv('CELERY_TASK_ALWAYS_EAGER', 'True')

[4] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:25
  - apps/backend/tests/test_analytics.py:29
  - apps/backend/tests/test_automations.py:25
  --- trecho (primeiras 5 linhas) ---
  @pytest.fixture(autouse=True)
  def skip_celery_tasks(monkeypatch):
      """Mocka tasks Celery."""
      monkeypatch.setenv('CELERY_TASK_ALWAYS_EAGER', 'True')
  

[5] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:26
  - apps/backend/tests/test_analytics.py:30
  - apps/backend/tests/test_automations.py:26
  --- trecho (primeiras 5 linhas) ---
  def skip_celery_tasks(monkeypatch):
      """Mocka tasks Celery."""
      monkeypatch.setenv('CELERY_TASK_ALWAYS_EAGER', 'True')
  
      import apps.notifications.tasks as notif_tasks

[6] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:27
  - apps/backend/tests/test_analytics.py:31
  - apps/backend/tests/test_automations.py:27
  --- trecho (primeiras 5 linhas) ---
      """Mocka tasks Celery."""
      monkeypatch.setenv('CELERY_TASK_ALWAYS_EAGER', 'True')
  
      import apps.notifications.tasks as notif_tasks
      monkeypatch.setattr(notif_tasks, 'send_feedback_created_push', MagicMock())

[7] Repetições: 3 | Arquivos: 3
  - apps/backend/tests/test_api_keys.py:28
  - apps/backend/tests/test_analytics.py:32
  - apps/backend/tests/test_automations.py:28
  --- trecho (primeiras 5 linhas) ---
      monkeypatch.setenv('CELERY_TASK_ALWAYS_EAGER', 'True')
  
      import apps.notifications.tasks as notif_tasks
      monkeypatch.setattr(notif_tasks, 'send_feedback_created_push', MagicMock())
      monkeypatch.setattr(notif_tasks, 'send_status_update_push', MagicMock())

[8] Repetições: 2 | Arquivos: 2
  - apps/frontend/__tests__/dashboard.test.tsx:23
  - apps/frontend/__tests__/feedbacks-page.test.tsx:23
  --- trecho (primeiras 5 linhas) ---
    useSearchParams: jest.fn(() => new URLSearchParams()),
  }));
  
  jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({

[9] Repetições: 2 | Arquivos: 2
  - apps/frontend/__tests__/dashboard.test.tsx:24
  - apps/frontend/__tests__/feedbacks-page.test.tsx:24
  --- trecho (primeiras 5 linhas) ---
  }));
  
  jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
      isAuthenticated: true,

[10] Repetições: 2 | Arquivos: 2
  - apps/frontend/__tests__/dashboard.test.tsx:25
  - apps/frontend/__tests__/feedbacks-page.test.tsx:25
  --- trecho (primeiras 5 linhas) ---
  
  jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
      isAuthenticated: true,
      isLoading: false,

[11] Repetições: 2 | Arquivos: 2
  - apps/backend/tests/test_analytics.py:33
  - apps/backend/tests/test_automations.py:29
  --- trecho (primeiras 5 linhas) ---
  
      import apps.notifications.tasks as notif_tasks
      monkeypatch.setattr(notif_tasks, 'send_feedback_created_push', MagicMock())
      monkeypatch.setattr(notif_tasks, 'send_status_update_push', MagicMock())
      monkeypatch.setattr(notif_tasks, 'send_push_notification', MagicMock())
```

## Potencialmente não referenciados (heurística)

Notas:

- Isto NÃO prova que o arquivo está morto (Next/Django podem referenciar por convenção, strings, settings, roteamento).

- Use como fila de revisão manual (ex.: remover/arquivar ou adicionar referência explícita).


```
Backend: arquivos potencialmente não referenciados
--------------------------------------------------

Total (suspeitos): 23

- apps/backend/apps/auditlog/serializers.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/auditlog/tests/test_auditlog.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/auditlog/views.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/feature_gating.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/management/commands/create_default_plans.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/serializers.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/stripe_service.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/tasks.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/tests.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/tests/test_billing.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/billing/views.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/consent/management/commands/populate_consent_versions.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/consent/serializers.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/consent/tests/test_consent.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/consent/views.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/notifications/management/commands/generate_vapid_keys.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/notifications/serializers.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/notifications/tests/test_notifications.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/notifications/views.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/webhooks/serializers.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/webhooks/signals.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/webhooks/tests.py: não importado por heurística (pode ser usado via Django wiring/strings)
- apps/backend/apps/webhooks/views.py: não importado por heurística (pode ser usado via Django wiring/strings)
```


```
Frontend: arquivos potencialmente não referenciados
---------------------------------------------------

Total (suspeitos): 52

- apps/frontend/components/ConsentModal.tsx: não importado por heurística
- apps/frontend/components/ErrorBoundary.tsx: não importado por heurística
- apps/frontend/components/SafeText.tsx: não importado por heurística
- apps/frontend/components/StructuredData.tsx: não importado por heurística
- apps/frontend/components/audit/AnalyticsDashboard.tsx: não importado por heurística
- apps/frontend/components/audit/AuditLogTable.tsx: não importado por heurística
- apps/frontend/components/audit/SecurityAlertsCard.tsx: não importado por heurística
- apps/frontend/components/billing/SubscriptionManager.tsx: não importado por heurística
- apps/frontend/components/billing/index.ts: não importado por heurística
- apps/frontend/components/brand/index.ts: não importado por heurística
- apps/frontend/components/dashboard/LazyCharts.tsx: não importado por heurística
- apps/frontend/components/dashboard/index.ts: não importado por heurística
- apps/frontend/components/data/ExportImport.tsx: não importado por heurística
- apps/frontend/components/feedback/ResponseTemplates.tsx: não importado por heurística
- apps/frontend/components/layout/PageHeader.tsx: não importado por heurística
- apps/frontend/components/layout/Section.tsx: não importado por heurística
- apps/frontend/components/layout/index.ts: não importado por heurística
- apps/frontend/components/notifications/NotificationCenter.tsx: não importado por heurística
- apps/frontend/components/notifications/NotificationPermissionPrompt.tsx: não importado por heurística
- apps/frontend/components/notifications/index.ts: não importado por heurística
- apps/frontend/components/theme/ThemeProvider.tsx: não importado por heurística
- apps/frontend/components/theme/ThemeToggle.tsx: não importado por heurística
- apps/frontend/components/ui/ActionFeedback.tsx: não importado por heurística
- apps/frontend/components/ui/LoadingOverlay.tsx: não importado por heurística
- apps/frontend/components/ui/accessibility.tsx: não importado por heurística
- apps/frontend/components/ui/breadcrumb.tsx: não importado por heurística
- apps/frontend/components/ui/divider.tsx: não importado por heurística
- apps/frontend/components/ui/elements.tsx: não importado por heurística
- apps/frontend/components/ui/form-field.tsx: não importado por heurística
- apps/frontend/components/ui/loading-state.tsx: não importado por heurística
- apps/frontend/components/ui/page-layout.tsx: não importado por heurística
- apps/frontend/components/ui/sections.tsx: não importado por heurística
- apps/frontend/components/ui/stats-card.tsx: não importado por heurística
- apps/frontend/components/ui/status-badge.tsx: não importado por heurística
- apps/frontend/components/ui/toast-system.tsx: não importado por heurística
- apps/frontend/csp-config.js: não importado por heurística
- apps/frontend/hooks/index.ts: não importado por heurística
- apps/frontend/hooks/use-user-profile.ts: não importado por heurística
- apps/frontend/hooks/useAuth.ts: não importado por heurística
- apps/frontend/hooks/useCSPNonce.ts: não importado por heurística
- apps/frontend/hooks/useConfirm.ts: não importado por heurística
- apps/frontend/hooks/useFormState.ts: não importado por heurística
- apps/frontend/hooks/useNotification.ts: não importado por heurística
- apps/frontend/jest.config.ts: não importado por heurística
- apps/frontend/jest.setup.ts: não importado por heurística
- apps/frontend/playwright.config.ts: não importado por heurística
- apps/frontend/public/sw.js: não importado por heurística
- apps/frontend/sentry.client.config.js: não importado por heurística
- apps/frontend/sentry.server.config.js: não importado por heurística
- apps/frontend/styles/spacing.ts: não importado por heurística
- apps/frontend/styles/typography.ts: não importado por heurística
- apps/frontend/tailwind.config.ts: não importado por heurística
```
