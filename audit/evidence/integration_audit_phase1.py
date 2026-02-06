#!/usr/bin/env python3
"""
FASE 1: Auditoria de Integração Backend ↔ Frontend
Análise de Gaps de Rotas vs Chamadas de API

Executor: Ouvify Auditor (ROMA)
Data: 05/02/2026
"""

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set

# ========== ROTAS DO BACKEND ==========

# URLs principais (config/urls.py)
BACKEND_ROUTES = {
    # Rotas estáticas
    "/": "home_view",
    "/health/": "health_check",
    "/ready/": "readiness_check",
    "/painel-admin-ouvify-2026/": "admin_panel",
    
    # Tenant & Branding
    "/api/tenant-info/": "TenantInfoView",
    "/api/upload-branding/": "UploadBrandingView",
    "/api/register-tenant/": "RegisterTenantView",
    "/api/check-subdominio/": "CheckSubdominioView",
    
    # Pagamentos (Stripe)
    "/api/tenants/subscribe/": "CreateCheckoutSessionView",
    "/api/tenants/webhook/": "StripeWebhookView",
    "/api/tenants/subscription/": "ManageSubscriptionView",
    "/api/tenants/subscription/reactivate/": "ReactivateSubscriptionView",
    
    # Analytics
    "/api/analytics/": "AnalyticsView",
    "/api/v1/analytics/dashboard/": "AnalyticsDashboardView",
    
    # Auth & Logout
    "/api/auth/logout/": "LogoutView",
    "/api/auth/logout/all/": "LogoutAllDevicesView",
    "/api/logout/": "LogoutView",
    "/api/logout/all/": "LogoutAllDevicesView",
    
    # JWT
    "/api/token/": "CustomTokenObtainPairView",
    "/api/token/refresh/": "TokenRefreshView",
    "/api/token/verify/": "TokenVerifyView",
    
    # Perfil
    "/api/auth/me/": "UserProfileUpdateView",
    "/api/users/me/": "UserMeView",
    
    # Password Reset
    "/api/password-reset/request/": "PasswordResetRequestView",
    "/api/password-reset/confirm/": "PasswordResetConfirmView",
    
    # LGPD
    "/api/account/": "AccountDeletionView",
    "/api/export-data/": "DataExportView",
    
    # CSP
    "/api/csp-report/": "csp_report",
}

# ViewSets com router (geram múltiplas rotas automaticamente)
BACKEND_VIEWSETS = {
    # Feedbacks ViewSet
    "feedbacks": {
        "basename": "feedback",
        "viewset": "FeedbackViewSet",
        "routes": [
            "GET /api/feedbacks/",
            "POST /api/feedbacks/",
            "GET /api/feedbacks/{id}/",
            "PUT /api/feedbacks/{id}/",
            "PATCH /api/feedbacks/{id}/",
            "DELETE /api/feedbacks/{id}/",
            "GET /api/feedbacks/consultar-protocolo/",
            "POST /api/feedbacks/responder-protocolo/",
            "GET /api/feedbacks/dashboard-stats/",
            "POST /api/feedbacks/{id}/adicionar-interacao/",
            "GET /api/feedbacks/export/",  # Export endpoint
            "POST /api/feedbacks/{id}/upload-arquivo/",  # Upload endpoint
            "GET /api/feedbacks/analytics/",
            "GET /api/feedbacks/export-csv/",
            "POST /api/feedbacks/{id}/assign/",
            "POST /api/feedbacks/{id}/unassign/",
        ],
    },
    # Tags ViewSet
    "tags": {
        "basename": "tag",
        "viewset": "TagViewSet",
        "routes": [
            "GET /api/tags/",
            "POST /api/tags/",
            "GET /api/tags/{id}/",
            "PUT /api/tags/{id}/",
            "PATCH /api/tags/{id}/",
            "DELETE /api/tags/{id}/",
            "GET /api/tags/stats/",
        ],
    },
    # Response Templates ViewSet
    "response-templates": {
        "basename": "response-template",
        "viewset": "ResponseTemplateViewSet",
        "routes": [
            "GET /api/response-templates/",
            "POST /api/response-templates/",
            "GET /api/response-templates/{id}/",
            "PUT /api/response-templates/{id}/",
            "PATCH /api/response-templates/{id}/",
            "DELETE /api/response-templates/{id}/",
            "POST /api/response-templates/render/",
            "GET /api/response-templates/by-category/",
            "GET /api/response-templates/stats/",
        ],
    },
    # Admin Tenants ViewSet
    "admin-tenants": {
        "basename": "admin-tenants",
        "viewset": "TenantAdminViewSet",
        "routes": [
            "GET /api/admin/tenants/",
            "PATCH /api/admin/tenants/{id}/",
            "GET /api/admin/tenants/metrics/",
            "POST /api/admin/tenants/{id}/impersonate/",
            "GET /api/admin/tenants/{id}/",
            "GET /api/admin/tenants/{id}/activity-logs/",
        ],
    },
    # Team Members ViewSet
    "team-members": {
        "basename": "team-members",
        "viewset": "TeamMemberViewSet",
        "routes": [
            "GET /api/team/members/",
            "GET /api/team/members/{id}/",
            "PATCH /api/team/members/{id}/",
            "DELETE /api/team/members/{id}/",
            "POST /api/team/members/{id}/suspend/",
            "POST /api/team/members/{id}/activate/",
            "GET /api/team/members/stats/",
        ],
    },
    # Team Invitations ViewSet
    "team-invitations": {
        "basename": "team-invitations",
        "viewset": "TeamInvitationViewSet",
        "routes": [
            "POST /api/team/invitations/",
            "GET /api/team/invitations/",
            "DELETE /api/team/invitations/{id}/",
            "POST /api/team/invitations/accept/",
            "POST /api/team/invitations/{id}/resend/",
        ],
    },
}

# Rotas de apps incluídos (apps/*/urls.py)
BACKEND_APP_ROUTES = {
    # Search (apps/core/search_urls.py)
    "search": [
        "GET /api/search/",
        "GET /api/search/autocomplete/",
        "GET /api/search/protocol/{protocolo}/",
    ],
    # Two-Factor Auth (apps/core/two_factor_urls.py)
    "2fa": [
        "POST /api/auth/2fa/setup/",
        "POST /api/auth/2fa/confirm/",
        "POST /api/auth/2fa/verify/",
        "POST /api/auth/2fa/disable/",
        "GET /api/auth/2fa/status/",
        "POST /api/auth/2fa/backup-codes/regenerate/",
    ],
    # Push Notifications (apps/notifications/urls.py)
    "push": [
        "GET /api/push/subscriptions/",
        "POST /api/push/subscriptions/",
        "GET /api/push/subscriptions/{id}/",
        "PUT /api/push/subscriptions/{id}/",
        "PATCH /api/push/subscriptions/{id}/",
        "DELETE /api/push/subscriptions/{id}/",
        "GET /api/push/subscriptions/status/",
        "POST /api/push/subscriptions/unsubscribe/",
        "GET /api/push/notifications/",
        "POST /api/push/notifications/",
        "GET /api/push/notifications/{id}/",
        "PUT /api/push/notifications/{id}/",
        "PATCH /api/push/notifications/{id}/",
        "DELETE /api/push/notifications/{id}/",
        "POST /api/push/notifications/send/",
        "GET /api/push/preferences/",
        "POST /api/push/preferences/",
        "GET /api/push/preferences/{id}/",
        "PUT /api/push/preferences/{id}/",
        "PATCH /api/push/preferences/{id}/",
        "DELETE /api/push/preferences/{id}/",
        "GET /api/push/preferences/me/",
        "PUT /api/push/preferences/me/",
        "PATCH /api/push/preferences/me/",
    ],
    # Audit Log (apps/auditlog/urls.py)
    "auditlog": [
        "GET /api/auditlog/logs/",
        "POST /api/auditlog/logs/",
        "GET /api/auditlog/logs/{id}/",
        "GET /api/auditlog/summaries/",
        "GET /api/auditlog/summaries/{id}/",
        "GET /api/auditlog/summaries/by_date/",
        "GET /api/auditlog/sessions/",
        "GET /api/auditlog/sessions/{id}/",
        "GET /api/auditlog/sessions/active/",
        "GET /api/auditlog/sessions/stats/",
    ],
    # Consent Management (apps/consent/urls.py)
    "consent": [
        "GET /api/consent/versions/",
        "GET /api/consent/versions/{id}/",
        "GET /api/consent/versions/required/",
        "GET /api/consent/user-consents/",
        "POST /api/consent/user-consents/",
        "GET /api/consent/user-consents/{id}/",
        "PUT /api/consent/user-consents/{id}/",
        "DELETE /api/consent/user-consents/{id}/",
        "POST /api/consent/user-consents/accept/",
        "POST /api/consent/user-consents/accept_anonymous/",
        "POST /api/consent/user-consents/{id}/revoke/",
        "GET /api/consent/user-consents/pending/",
    ],
    # Billing (apps/billing/urls.py)
    "billing": [
        "GET /api/v1/billing/plans/",
        "POST /api/v1/billing/plans/",
        "GET /api/v1/billing/plans/{id}/",
        "PUT /api/v1/billing/plans/{id}/",
        "PATCH /api/v1/billing/plans/{id}/",
        "DELETE /api/v1/billing/plans/{id}/",
        "GET /api/v1/billing/subscription/",
        "POST /api/v1/billing/subscription/",
        "GET /api/v1/billing/subscription/{id}/",
        "GET /api/v1/billing/subscription/status/",
        "POST /api/v1/billing/subscription/checkout/",
        "POST /api/v1/billing/subscription/portal/",
        "POST /api/v1/billing/subscription/cancel/",
        "GET /api/v1/billing/invoices/",
        "GET /api/v1/billing/invoices/{id}/",
        "POST /api/v1/billing/webhook/",
    ],
    # Webhooks (apps/webhooks/urls.py)
    "webhooks": [
        "GET /api/v1/webhooks/endpoints/",
        "POST /api/v1/webhooks/endpoints/",
        "GET /api/v1/webhooks/endpoints/{id}/",
        "PUT /api/v1/webhooks/endpoints/{id}/",
        "PATCH /api/v1/webhooks/endpoints/{id}/",
        "DELETE /api/v1/webhooks/endpoints/{id}/",
        "GET /api/v1/webhooks/endpoints/stats/",
        "GET /api/v1/webhooks/endpoints/available_events/",
        "GET /api/v1/webhooks/endpoints/{id}/deliveries/",
        "POST /api/v1/webhooks/endpoints/{id}/test/",
        "POST /api/v1/webhooks/endpoints/{id}/regenerate_secret/",
        "GET /api/v1/webhooks/events/",
        "GET /api/v1/webhooks/events/{id}/",
        "GET /api/v1/webhooks/deliveries/",
        "GET /api/v1/webhooks/deliveries/{id}/",
        "POST /api/v1/webhooks/deliveries/{id}/retry/",
    ],
}

# ========== CHAMADAS DO FRONTEND ==========

FRONTEND_API_CALLS = [
    # Tenant & Auth
    "/api/tenant-info/",
    "/api/check-subdominio/",
    "/api/register-tenant/",
    "/api/token/",
    "/api/token/refresh/",
    "/api/logout/",
    
    # User profile
    "/api/users/me/",
    "/api/auth/me/",
    "/api/export-data/",
    "/api/account/",
    
    # Password reset
    "/api/password-reset/request/",
    "/api/password-reset/confirm/",
    
    # Feedbacks
    "/api/feedbacks/",
    "/api/feedbacks/{id}/",
    "/api/feedbacks/consultar-protocolo/",
    "/api/feedbacks/responder-protocolo/",
    "/api/feedbacks/dashboard-stats/",
    "/api/feedbacks/{id}/adicionar-interacao/",
    "/api/feedbacks/{id}/upload-arquivo/",
    "/api/feedbacks/export/",
    "/api/feedbacks/analytics/",
    "/api/feedbacks/export-csv/",
    "/api/feedbacks/{id}/assign/",
    "/api/feedbacks/{id}/unassign/",
    
    # Tags
    "/api/tags/",
    "/api/tags/{id}/",
    "/api/tags/stats/",
    
    # Response Templates
    "/api/response-templates/",
    "/api/response-templates/{id}/",
    "/api/response-templates/stats/",
    
    # Analytics
    "/api/analytics/",
    "/api/v1/analytics/dashboard/",
    
    # Admin
    "/api/admin/tenants/",
    "/api/admin/tenants/{id}/",
    "/api/admin/tenants/metrics/",
    "/api/admin/tenants/{id}/impersonate/",
    "/api/admin/tenants/{id}/activity-logs/",
    
    # Team management
    "/api/team/members/",
    "/api/team/members/{id}/",
    "/api/team/members/stats/",
    "/api/team/members/{id}/suspend/",
    "/api/team/members/{id}/activate/",
    "/api/team/invitations/",
    "/api/team/invitations/{id}/",
    "/api/team/invitations/accept/",
    "/api/team/invitations/{id}/resend/",
    
    # Subscription
    "/api/tenants/subscription/",
    "/api/tenants/subscription/reactivate/",
    
    # Billing (v1)
    "/api/v1/billing/plans/",
    "/api/v1/billing/plans/{id}/",
    "/api/v1/billing/subscription/status/",
    "/api/v1/billing/subscription/checkout/",
    "/api/v1/billing/subscription/portal/",
    "/api/v1/billing/subscription/cancel/",
    "/api/v1/billing/invoices/",
    "/api/v1/billing/invoices/{id}/",
    
    # Webhooks
    "/api/v1/webhooks/endpoints/",
    "/api/v1/webhooks/endpoints/{id}/",
    "/api/v1/webhooks/endpoints/stats/",
    "/api/v1/webhooks/endpoints/available_events/",
    "/api/v1/webhooks/endpoints/{id}/deliveries/",
    "/api/v1/webhooks/endpoints/{id}/test/",
    "/api/v1/webhooks/endpoints/{id}/regenerate_secret/",
    "/api/v1/webhooks/events/",
    "/api/v1/webhooks/events/{id}/",
    "/api/v1/webhooks/deliveries/",
    "/api/v1/webhooks/deliveries/{id}/",
    "/api/v1/webhooks/deliveries/{id}/retry/",
    
    # Push notifications (coverage file)
    "/api/push/subscriptions/",
    "/api/push/subscriptions/{id}/",
    "/api/push/subscriptions/status/",
    "/api/push/subscriptions/unsubscribe/",
    "/api/push/notifications/send/",
    "/api/push/notifications/{id}/",
    "/api/push/preferences/me/",
    
    # Audit log (coverage file)
    "/api/auditlog/sessions/",
    "/api/auditlog/sessions/{id}/",
    "/api/auditlog/sessions/active/",
    "/api/auditlog/sessions/stats/",
    "/api/auditlog/summaries/",
    "/api/auditlog/summaries/{id}/",
    "/api/auditlog/summaries/by_date/",
    
    # CSP (middleware)
    "/api/csp-report/",
]


def normalize_route(route: str) -> str:
    """Normaliza rotas removendo métodos HTTP e substituindo {id} por padrão genérico."""
    # Remove método HTTP (GET, POST, etc)
    route = re.sub(r"^(GET|POST|PUT|PATCH|DELETE)\s+", "", route)
    # Normaliza parâmetros de path
    route = re.sub(r"\{[^}]+\}", "{id}", route)
    route = re.sub(r"<[^>]+>", "{id}", route)
    return route


def compile_backend_routes() -> Set[str]:
    """Compila todas as rotas do backend em um set normalizado."""
    routes = set()
    
    # Adicionar rotas estáticas
    routes.update(BACKEND_ROUTES.keys())
    
    # Adicionar rotas de ViewSets
    for viewset_data in BACKEND_VIEWSETS.values():
        for route in viewset_data["routes"]:
            routes.add(normalize_route(route))
    
    # Adicionar rotas de apps
    for app_routes in BACKEND_APP_ROUTES.values():
        for route in app_routes:
            routes.add(normalize_route(route))
    
    return routes


def compile_frontend_calls() -> Set[str]:
    """Compila todas as chamadas de API do frontend."""
    return {normalize_route(call) for call in FRONTEND_API_CALLS}


def find_gaps() -> Dict[str, List[str]]:
    """Identifica gaps de integração entre backend e frontend."""
    backend = compile_backend_routes()
    frontend = compile_frontend_calls()
    
    orphan_backend = backend - frontend
    missing_backend = frontend - backend
    
    return {
        "orphan_backend": sorted(list(orphan_backend)),
        "missing_backend": sorted(list(missing_backend)),
        "total_backend": len(backend),
        "total_frontend": len(frontend),
        "matched": len(backend & frontend),
    }


def generate_report():
    """Gera relatório de auditoria de integração."""
    gaps = find_gaps()
    
    print("=" * 80)
    print("RELATÓRIO DE AUDITORIA - FASE 1: INTEGRAÇÃO BACKEND ↔ FRONTEND")
    print("=" * 80)
    print()
    
    print("📊 ESTATÍSTICAS GERAIS")
    print(f"  • Rotas no Backend: {gaps['total_backend']}")
    print(f"  • Chamadas no Frontend: {gaps['total_frontend']}")
    print(f"  • Rotas Correspondentes: {gaps['matched']}")
    print(f"  • Taxa de Cobertura: {gaps['matched'] / gaps['total_backend'] * 100:.1f}%")
    print()
    
    print("=" * 80)
    print("🔴 ROTAS ÓRFÃS NO BACKEND (Expostas mas não utilizadas no Frontend)")
    print("=" * 80)
    print(f"Total: {len(gaps['orphan_backend'])} rotas")
    print()
    
    for route in gaps["orphan_backend"]:
        print(f"  • {route}")
    
    print()
    print("=" * 80)
    print("🟡 CHAMADAS NO FRONTEND SEM ROTA NO BACKEND (Possíveis 404)")
    print("=" * 80)
    print(f"Total: {len(gaps['missing_backend'])} chamadas")
    print()
    
    for call in gaps["missing_backend"]:
        print(f"  • {call}")
    
    print()
    print("=" * 80)
    print("✅ RECOMENDAÇÕES")
    print("=" * 80)
    print()
    print("1. ROTAS ÓRFÃS:")
    print("   - Verificar se são endpoints administrativos/internos que não precisam")
    print("     de interface web (ex: webhooks, health checks)")
    print("   - Se não forem usados: considerar remover ou documentar como 'API-only'")
    print("   - Se planejados para uso futuro: adicionar no backlog MVP")
    print()
    print("2. CHAMADAS SEM BACKEND:")
    print("   - CRÍTICO: Verificar imediatamente - podem causar erros 404")
    print("   - Possíveis causas: typos, rotas renomeadas, endpoints não implementados")
    print("   - Ação: Corrigir no frontend ou implementar no backend")
    print()
    
    # Salvar em arquivo JSON
    output_file = Path("/workspaces/Ouvify/audit/evidence/integration_gaps.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, "w") as f:
        json.dump(gaps, f, indent=2)
    
    print(f"📄 Relatório JSON salvo em: {output_file}")
    print()


if __name__ == "__main__":
    generate_report()
