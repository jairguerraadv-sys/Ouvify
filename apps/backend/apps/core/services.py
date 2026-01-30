from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from apps.tenants.models import Client as TenantClient
from apps.feedbacks.models import Feedback
from config.feature_flags import feature_flags
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Serviço para envio de emails relacionados a feedbacks"""

    @staticmethod
    def send_feedback_notification(feedback: Feedback):
        """
        Envia notificação de novo feedback para a empresa

        Args:
            feedback: Instância do feedback criado
        """
        try:
            tenant = feedback.client

            # Verificar se feature de notificações por email está habilitada
            if not feature_flags.is_enabled('EMAIL_NOTIFICATIONS'):
                logger.info(f"📧 Notificações por email desabilitadas | Tenant: {tenant.nome} | Protocolo: {feedback.protocolo}")
                return

            # Verificar se o tenant tem email configurado
            if not hasattr(tenant, 'email_contato') or not tenant.email_contato:
                logger.warning(f"Tenant {tenant.nome} não tem email configurado para notificações")
                return

            # Preparar contexto do email
            context = {
                'tenant': tenant,
                'feedback': feedback,
                'protocolo': feedback.protocolo,
                'tipo_display': feedback.get_tipo_display(),
                'dashboard_url': f"https://{tenant.subdominio}.localhost:8000/dashboard/feedbacks/{feedback.protocolo}",
                'data_criacao': timezone.localtime(feedback.data_criacao).strftime('%d/%m/%Y %H:%M'),
            }

            # Renderizar template do email
            subject = f"Novo feedback recebido - {feedback.protocolo}"
            html_message = render_to_string('emails/novo_feedback.html', context)
            plain_message = render_to_string('emails/novo_feedback.txt', context)

            # Enviar email
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[tenant.email_contato],
                html_message=html_message,
                fail_silently=False,
            )

            logger.info(f"✅ Notificação de feedback enviada para {tenant.email_contato} | Protocolo: {feedback.protocolo}")

        except Exception as e:
            logger.error(f"❌ Erro ao enviar notificação de feedback: {str(e)}")

    @staticmethod
    def send_feedback_status_update(feedback: Feedback, old_status: str):
        """
        Envia notificação quando o status do feedback é alterado

        Args:
            feedback: Instância do feedback atualizado
            old_status: Status anterior
        """
        try:
            tenant = feedback.client

            # Verificar se feature de notificações por email está habilitada
            if not feature_flags.is_enabled('EMAIL_NOTIFICATIONS'):
                logger.info(f"📧 Notificações por email desabilitadas | Tenant: {tenant.nome} | Protocolo: {feedback.protocolo}")
                return

            if not hasattr(tenant, 'email_contato') or not tenant.email_contato:
                return

            # Só enviar se foi uma mudança significativa
            significant_changes = [
                ('pendente', 'em_analise'),
                ('em_analise', 'resolvido'),
                ('em_analise', 'fechado'),
                ('resolvido', 'fechado'),
            ]

            if (old_status, feedback.status) not in significant_changes:
                return

            context = {
                'tenant': tenant,
                'feedback': feedback,
                'protocolo': feedback.protocolo,
                'status_anterior': old_status,
                'status_atual': feedback.status,
                'status_display': feedback.get_status_display(),
                'dashboard_url': f"https://{tenant.dominio}/dashboard/feedbacks/{feedback.protocolo}",
                'data_atualizacao': timezone.localtime(feedback.data_atualizacao).strftime('%d/%m/%Y %H:%M'),
            }

            subject = f"Status atualizado - {feedback.protocolo}"
            html_message = render_to_string('emails/status_atualizado.html', context)
            plain_message = render_to_string('emails/status_atualizado.txt', context)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[tenant.email_contato],
                html_message=html_message,
                fail_silently=False,
            )

            logger.info(f"✅ Notificação de status enviada para {tenant.email_contato} | Protocolo: {feedback.protocolo}")

        except Exception as e:
            logger.error(f"❌ Erro ao enviar notificação de status: {str(e)}")

    @staticmethod
    def send_weekly_report(tenant: TenantClient):
        """
        Envia relatório semanal de feedbacks para a empresa

        Args:
            tenant: Instância do tenant
        """
        try:
            # Para MVP, não enviar relatórios por email - apenas log
            logger.info(f"📊 Relatório semanal seria enviado para tenant {tenant.nome}")
            return

            if not hasattr(tenant, 'email_contato') or not tenant.email_contato:
                return

            # Calcular estatísticas da semana
            from django.db.models import Count, Q
            from datetime import timedelta

            semana_atras = timezone.now() - timedelta(days=7)

            stats = tenant.feedbacks.filter(data_criacao__gte=semana_atras).aggregate(
                total=Count('id'),
                pendentes=Count('id', filter=Q(status='pendente')),
                resolvidos=Count('id', filter=Q(status='resolvido')),
                elogios=Count('id', filter=Q(tipo='elogio')),
                denuncias=Count('id', filter=Q(tipo='denuncia')),
                reclamacoes=Count('id', filter=Q(tipo='reclamacao')),
                sugestoes=Count('id', filter=Q(tipo='sugestao')),
            )

            context = {
                'tenant': tenant,
                'stats': stats,
                'semana': f"{semana_atras.strftime('%d/%m')} - {timezone.now().strftime('%d/%m/%Y')}",
                'dashboard_url': f"https://{tenant.dominio}/dashboard/relatorios",
            }

            subject = f"Relatório semanal - Ouvify ({tenant.nome})"
            html_message = render_to_string('emails/relatorio_semanal.html', context)
            plain_message = render_to_string('emails/relatorio_semanal.txt', context)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[tenant.email_contato],
                html_message=html_message,
                fail_silently=False,
            )

            logger.info(f"✅ Relatório semanal enviado para {tenant.email_contato} | Tenant: {tenant.nome}")

        except Exception as e:
            logger.error(f"❌ Erro ao enviar relatório semanal: {str(e)}")


class WebhookService:
    """Serviço para envio de webhooks"""

    @staticmethod
    def send_feedback_webhook(feedback: Feedback, event_type: str = 'feedback.created'):
        """
        Envia webhook quando um feedback é criado ou atualizado

        Args:
            feedback: Instância do feedback
            event_type: Tipo do evento (feedback.created, feedback.updated, etc.)
        """
        try:
            tenant = feedback.client

            # Verificar se feature de webhooks está habilitada
            if not feature_flags.is_enabled('WEBHOOKS'):
                logger.info(f"🔗 Webhooks desabilitados | Tenant: {tenant.nome} | Evento: {event_type} | Protocolo: {feedback.protocolo}")
                return

            if not hasattr(tenant, 'webhook_url') or not tenant.webhook_url:
                return

            import requests
            from django.utils.crypto import get_random_string

            payload = {
                'event': event_type,
                'timestamp': timezone.now().isoformat(),
                'tenant': {
                    'id': tenant.pk,
                    'nome': tenant.nome,
                    'subdominio': tenant.subdominio,
                },
                'feedback': {
                    'id': feedback.pk,
                    'protocolo': feedback.protocolo,
                    'tipo': feedback.tipo,
                    'titulo': feedback.titulo,
                    'status': feedback.status,
                    'anonimo': feedback.anonimo,
                    'data_criacao': feedback.data_criacao.isoformat(),
                    'data_atualizacao': feedback.data_atualizacao.isoformat(),
                }
            }

            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Ouvify-Webhook/1.0',
                'X-Ouvify-Signature': get_random_string(32),  # Em produção, implementar HMAC
            }

            response = requests.post(
                tenant.webhook_url,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                logger.info(f"✅ Webhook enviado com sucesso | URL: {tenant.webhook_url} | Evento: {event_type}")
            else:
                logger.warning(f"⚠️ Webhook falhou | Status: {response.status_code} | URL: {tenant.webhook_url}")

        except Exception as e:
            logger.error(f"❌ Erro ao enviar webhook: {str(e)}")