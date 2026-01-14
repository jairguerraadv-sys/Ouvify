# Generated migration for adding autor field to Feedback model
# This file should be created by running: python manage.py makemigrations

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('feedbacks', '0004_feedback_feedbacks_f_client__975d9a_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='autor',
            field=models.ForeignKey(
                blank=True,
                help_text='Usuário que criou o feedback (para rastreabilidade)',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='feedbacks_criados',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Autor'
            ),
        ),
    ]
