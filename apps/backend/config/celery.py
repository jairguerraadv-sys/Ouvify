"""
Configuração do Celery para tarefas assíncronas
"""

import os

from celery import Celery

# Definir módulo de settings do Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Criar instância do Celery
app = Celery("ouvify_saas")

# Configurar usando namespace 'CELERY' das settings do Django
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-descobrir tasks em todos os apps instalados
app.autodiscover_tasks()

# Configurações do Celery
app.conf.update(
    # Broker (Redis)
    broker_url=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    result_backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    # Serialização
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Timezone
    timezone="America/Sao_Paulo",
    enable_utc=True,
    # Task settings
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutos
    task_soft_time_limit=25 * 60,  # 25 minutos (soft limit)
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    # Retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Result settings
    result_expires=60 * 60 * 24,  # 24 horas
    # Rate limiting
    task_default_rate_limit="100/m",
    # Beat schedule (tarefas agendadas)
    beat_schedule={
        "cleanup-expired-tokens": {
            "task": "apps.core.tasks.cleanup_expired_tokens",
            "schedule": 60 * 60 * 6,  # A cada 6 horas
        },
        "send-daily-digest": {
            "task": "apps.core.tasks.send_daily_digest",
            "schedule": {
                "hour": 8,
                "minute": 0,
            },
        },
        "update-analytics-cache": {
            "task": "apps.core.tasks.update_analytics_cache",
            "schedule": 60 * 15,  # A cada 15 minutos
        },
        "cleanup-old-sessions": {
            "task": "apps.core.tasks.cleanup_old_sessions",
            "schedule": 60 * 60 * 24,  # A cada 24 horas
        },
        # P2-004: Tarefas LGPD
        "cleanup-old-archived-feedbacks": {
            "task": "feedbacks.cleanup_old_archived_feedbacks",
            "schedule": {"hour": 3, "minute": 0},  # Diariamente às 03:00 UTC
        },
    },
)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Task de debug para testar Celery"""
    print(f"Request: {self.request!r}")
