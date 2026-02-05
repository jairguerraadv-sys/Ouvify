"""
Views para conformidade com LGPD/GDPR.

Endpoints:
- DELETE /api/account/ - Exclusão de conta (direito ao esquecimento)
- GET /api/export-data/ - Exportação de dados pessoais (portabilidade)
"""

import logging
from datetime import datetime

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.decorators import require_2fa_verification  # P1-001: 2FA enforcement
from apps.feedbacks.models import Feedback, FeedbackInteracao
from apps.tenants.models import Client

logger = logging.getLogger(__name__)


class AccountDeletionView(APIView):
    """
    Exclui a conta do usuário e todos os dados associados (direito ao esquecimento).

    DELETE /api/account/
    Headers: Authorization: Bearer <jwt_access_token>
    Body (opcional): {
        "confirm": true,
        "reason": "Motivo da exclusão" (opcional)
    }

    IMPORTANTE: Esta ação é irreversível!
    - Exclui o usuário
    - Exclui o tenant (empresa) se for owner
    - Exclui todos os feedbacks do tenant
    - Anonimiza interações (mantém histórico sem dados pessoais)
    """

    permission_classes = [IsAuthenticated]

    @require_2fa_verification  # P1-001: Requer 2FA se usuário tem habilitado
    def delete(self, request):
        confirm = request.data.get("confirm", False)
        reason = request.data.get("reason", "Não informado")

        if not confirm:
            return Response(
                {
                    "detail": "Você deve confirmar a exclusão enviando {'confirm': true}",
                    "warning": "Esta ação é IRREVERSÍVEL. Todos os seus dados serão excluídos permanentemente.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        try:
            with transaction.atomic():
                # Buscar tenant do usuário
                tenant = Client.objects.filter(owner=user).first()

                if tenant:
                    # Log antes de excluir
                    logger.info(
                        f"🗑️ Iniciando exclusão de conta | "
                        f"User: {user.email} | "
                        f"Tenant: {tenant.nome} | "
                        f"Motivo: {reason}"
                    )

                    # Contar dados que serão excluídos
                    feedback_count = Feedback.objects.filter(client=tenant).count()
                    interacao_count = FeedbackInteracao.objects.filter(
                        client=tenant
                    ).count()

                    # Excluir feedbacks (cascade deleta interações)
                    Feedback.objects.filter(client=tenant).delete()

                    # Excluir tenant
                    tenant_nome = tenant.nome
                    tenant.delete()

                    logger.info(
                        f"✅ Dados do tenant excluídos | "
                        f"Feedbacks: {feedback_count} | "
                        f"Interações: {interacao_count}"
                    )
                else:
                    tenant_nome = "N/A"
                    logger.info(f"🗑️ Exclusão de conta sem tenant | User: {user.email}")

                # Guardar email para log antes de excluir
                user_email = user.email

                # Excluir usuário
                user.delete()

                logger.info(
                    f"✅ Conta excluída com sucesso | "
                    f"Email: {user_email} | "
                    f"Tenant: {tenant_nome}"
                )

                return Response(
                    {
                        "detail": "Sua conta foi excluída com sucesso.",
                        "message": "Todos os seus dados foram removidos permanentemente.",
                        "deleted": {
                            "user": user_email,
                            "tenant": tenant_nome if tenant else None,
                        },
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"❌ Erro ao excluir conta: {str(e)}")
            return Response(
                {
                    "detail": "Erro ao excluir conta. Tente novamente ou entre em contato com o suporte.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DataExportView(APIView):
    """
    Exporta todos os dados pessoais do usuário (direito à portabilidade).

    GET /api/export-data/
    Headers: Authorization: Bearer <jwt_access_token>
    Query params:
        - format: 'json' (padrão) ou 'csv'

    Retorna um arquivo JSON/CSV com todos os dados do usuário e tenant.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        export_format = request.query_params.get("format", "json").lower()
        user = request.user

        try:
            # Coletar dados do usuário
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "date_joined": user.date_joined.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
            }

            # Coletar dados do tenant
            tenant = Client.objects.filter(owner=user).first()
            tenant_data = None
            feedbacks_data = []

            if tenant:
                tenant_data = {
                    "id": tenant.pk,
                    "nome": tenant.nome,
                    "subdominio": tenant.subdominio,
                    "logo": tenant.logo,
                    "cor_primaria": tenant.cor_primaria,
                    "plano": tenant.plano,
                    "subscription_status": tenant.subscription_status,
                    "data_criacao": tenant.data_criacao.isoformat(),
                    "data_atualizacao": tenant.data_atualizacao.isoformat(),
                }

                # Coletar feedbacks
                feedbacks = Feedback.objects.filter(client=tenant).prefetch_related(
                    "interacoes"
                )

                for feedback in feedbacks:
                    feedback_item = {
                        "protocolo": feedback.protocolo,
                        "tipo": feedback.tipo,
                        "titulo": feedback.titulo,
                        "descricao": feedback.descricao,
                        "status": feedback.status,
                        "anonimo": feedback.anonimo,
                        "email_contato": feedback.email_contato,
                        "resposta_empresa": feedback.resposta_empresa,
                        "data_criacao": feedback.data_criacao.isoformat(),
                        "data_atualizacao": feedback.data_atualizacao.isoformat(),
                        "interacoes": [],
                    }

                    # Usar getattr para evitar erro de type checking
                    interacoes = getattr(feedback, "interacoes", None)
                    if interacoes:
                        for interacao in interacoes.all():
                            feedback_item["interacoes"].append(
                                {
                                    "tipo": interacao.tipo,
                                    "mensagem": interacao.mensagem,
                                    "visivel_usuario": getattr(
                                        interacao, "visivel_usuario", True
                                    ),
                                    "data_criacao": interacao.data.isoformat(),
                                }
                            )

                    feedbacks_data.append(feedback_item)

            # Montar objeto de exportação
            export_data = {
                "export_info": {
                    "generated_at": datetime.now().isoformat(),
                    "format": export_format,
                    "platform": "Ouvify",
                    "version": "1.0",
                },
                "user": user_data,
                "tenant": tenant_data,
                "feedbacks": feedbacks_data,
                "feedbacks_count": len(feedbacks_data),
            }

            logger.info(
                f"📦 Exportação de dados realizada | "
                f"User: {user.email} | "
                f"Feedbacks: {len(feedbacks_data)}"
            )

            if export_format == "csv":
                # Retornar como CSV
                import csv

                from django.http import HttpResponse

                response = HttpResponse(content_type="text/csv")
                response["Content-Disposition"] = (
                    f'attachment; filename="ouvify_export_{user.username}_{datetime.now().strftime("%Y%m%d")}.csv"'
                )

                writer = csv.writer(response)

                # Header de usuário
                writer.writerow(["=== DADOS DO USUÁRIO ==="])
                writer.writerow(["Campo", "Valor"])
                for key, value in user_data.items():
                    writer.writerow([key, value])

                writer.writerow([])

                # Header de tenant
                if tenant_data:
                    writer.writerow(["=== DADOS DA EMPRESA ==="])
                    writer.writerow(["Campo", "Valor"])
                    for key, value in tenant_data.items():
                        writer.writerow([key, value])

                    writer.writerow([])

                    # Feedbacks
                    writer.writerow(["=== FEEDBACKS ==="])
                    if feedbacks_data:
                        writer.writerow(
                            ["Protocolo", "Tipo", "Título", "Status", "Data Criação"]
                        )
                        for fb in feedbacks_data:
                            writer.writerow(
                                [
                                    fb["protocolo"],
                                    fb["tipo"],
                                    fb["titulo"],
                                    fb["status"],
                                    fb["data_criacao"],
                                ]
                            )

                return response

            else:
                # Retornar como JSON
                response = Response(export_data, status=status.HTTP_200_OK)
                response["Content-Disposition"] = (
                    f'attachment; filename="ouvify_export_{user.username}_{datetime.now().strftime("%Y%m%d")}.json"'
                )
                return response

        except Exception as e:
            logger.error(f"❌ Erro na exportação de dados: {str(e)}")
            return Response(
                {"detail": "Erro ao exportar dados. Tente novamente.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
