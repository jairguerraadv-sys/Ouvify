"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import SimpleRouter
from apps.tenants import views as tenant_views  # type: ignore[import-not-found]
from apps.tenants.subscription_management import ManageSubscriptionView, ReactivateSubscriptionView  # type: ignore[import-not-found]
from apps.tenants.team_views import TeamMemberViewSet, TeamInvitationViewSet  # type: ignore[import-not-found]
from apps.feedbacks import views as feedback_views  # type: ignore[import-not-found]
from apps.core import views as core_views
from apps.core.views.csp import csp_report
from apps.core.password_reset import PasswordResetRequestView, PasswordResetConfirmView  # type: ignore[import-not-found]
from apps.core.health import health_check as health_check_view, readiness_check  # type: ignore[import-not-found]
from apps.tenants.logout_views import LogoutView, LogoutAllDevicesView  # type: ignore[import-not-found]
from apps.core.lgpd_views import AccountDeletionView, DataExportView  # type: ignore[import-not-found]
from apps.core.profile_views import UserProfileUpdateView  # type: ignore[import-not-found]
from apps.core.views.analytics import AnalyticsView, AnalyticsDashboardView  # type: ignore[import-not-found]
from config.swagger import swagger_urlpatterns

# JWT Views
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from apps.tenants.jwt_views import CustomTokenObtainPairView

# Expor referências para Pylance
FeedbackViewSet = feedback_views.FeedbackViewSet  # type: ignore[attr-defined]
TagViewSet = feedback_views.TagViewSet  # type: ignore[attr-defined]
ResponseTemplateViewSet = feedback_views.ResponseTemplateViewSet  # type: ignore[attr-defined]
TenantInfoView = tenant_views.TenantInfoView  # type: ignore[attr-defined]
UploadBrandingView = tenant_views.UploadBrandingView  # type: ignore[attr-defined]
RegisterTenantView = tenant_views.RegisterTenantView  # type: ignore[attr-defined]
CheckSubdominioView = tenant_views.CheckSubdominioView  # type: ignore[attr-defined]
TenantAdminViewSet = tenant_views.TenantAdminViewSet  # type: ignore[attr-defined]
CreateCheckoutSessionView = tenant_views.CreateCheckoutSessionView  # type: ignore[attr-defined]
StripeWebhookView = tenant_views.StripeWebhookView  # type: ignore[attr-defined]
UserMeView = tenant_views.UserMeView  # type: ignore[attr-defined]
SubscriptionView = tenant_views.SubscriptionView  # type: ignore[attr-defined]



# Router DRF - Gera automaticamente rotas REST + actions customizadas
router = SimpleRouter()

# FeedbackViewSet gera as seguintes rotas:
# - GET/POST    /api/feedbacks/                          (list, create)
# - GET/PUT     /api/feedbacks/{id}/                     (retrieve, update)
# - GET         /api/feedbacks/consultar-protocolo/      (action pública)
# - POST        /api/feedbacks/responder-protocolo/      (action pública)
# - GET         /api/feedbacks/dashboard-stats/          (action stats)
# - POST        /api/feedbacks/{id}/adicionar-interacao/ (action autenticada)
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')

# TagViewSet gera rotas para gerenciar tags de categorização:
# - GET/POST    /api/tags/                               (list, create)
# - GET/PUT     /api/tags/{id}/                          (retrieve, update, delete)
# - GET         /api/tags/stats/                         (tag usage statistics)
router.register(r'tags', TagViewSet, basename='tag')

# ResponseTemplateViewSet gera rotas para templates de resposta:
# - GET/POST    /api/response-templates/                 (list, create)
# - GET/PUT     /api/response-templates/{id}/            (retrieve, update, delete)
# - POST        /api/response-templates/render/          (render with feedback data)
# - GET         /api/response-templates/by-category/     (grouped by category)
# - GET         /api/response-templates/stats/           (usage statistics)
router.register(r'response-templates', ResponseTemplateViewSet, basename='response-template')

# TenantAdminViewSet gera rotas administrativas (apenas superusuários):
# - GET/PATCH   /api/admin/tenants/                      (list, partial_update)
router.register(r'admin/tenants', TenantAdminViewSet, basename='admin-tenants')

# Team Management - Multi-User System (Sprint 1)
# TeamMemberViewSet gera:
# - GET         /api/team/members/                       (list members)
# - GET         /api/team/members/{id}/                  (retrieve member)
# - PATCH       /api/team/members/{id}/                  (update role)
# - DELETE      /api/team/members/{id}/                  (remove member)
# - POST        /api/team/members/{id}/suspend/          (suspend member)
# - POST        /api/team/members/{id}/activate/         (reactivate member)
# - GET         /api/team/members/stats/                 (team statistics)
router.register(r'team/members', TeamMemberViewSet, basename='team-members')

# TeamInvitationViewSet gera:
# - POST        /api/team/invitations/                   (create invitation)
# - GET         /api/team/invitations/                   (list invitations)
# - DELETE      /api/team/invitations/{id}/              (revoke invitation)
# - POST        /api/team/invitations/accept/            (accept - public)
# - POST        /api/team/invitations/{id}/resend/       (resend email)
router.register(r'team/invitations', TeamInvitationViewSet, basename='team-invitations')

urlpatterns = [
    path('', core_views.home, name='home'),  # Rota raiz para teste de multi-tenancy
    path('health/', health_check_view, name='health-check'),  # Health check endpoint
    path('ready/', readiness_check, name='readiness-check'),  # Readiness check endpoint
    
    # Admin Django - URL obscurecida para segurança (não usar /admin/)
    path('painel-admin-ouvify-2026/', admin.site.urls),
    
    # Endpoint público para informações do tenant atual
    path('api/tenant-info/', TenantInfoView.as_view(), name='tenant-info'),
    
    # Endpoint para upload de imagens de branding (logo, favicon)
    path('api/upload-branding/', UploadBrandingView.as_view(), name='upload-branding'),
    
    # Endpoint de registro de novo tenant (SaaS Signup)
    path('api/register-tenant/', RegisterTenantView.as_view(), name='register-tenant'),
    
    # Endpoint para verificar disponibilidade de subdomínio
    path('api/check-subdominio/', CheckSubdominioView.as_view(), name='check-subdominio'),
    
    # Endpoints de Pagamento (Stripe)
    path('api/tenants/subscribe/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('api/tenants/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    
    # Endpoints de Gestão de Assinaturas
    path('api/tenants/subscription/', ManageSubscriptionView.as_view(), name='manage-subscription'),
    path('api/tenants/subscription/reactivate/', ReactivateSubscriptionView.as_view(), name='reactivate-subscription'),
    
    # Analytics e Métricas
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),

    # Analytics v1 (compat com frontend)
    path('api/v1/analytics/dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    
    # Busca Global (ElasticSearch)
    path('api/', include('apps.core.search_urls')),
    
    # Logout aliases (compat com clientes antigos)
    path('api/auth/logout/', LogoutView.as_view(), name='api-auth-logout'),
    path('api/auth/logout/all/', LogoutAllDevicesView.as_view(), name='api-auth-logout-all-devices'),

    # Two-Factor Authentication (2FA)
    path('api/auth/', include('apps.core.two_factor_urls')),
    
    # Push Notifications
    path('api/push/', include('apps.notifications.urls')),
    
    # Audit Log & Analytics
    path('api/auditlog/', include('apps.auditlog.urls')),
    
    # LGPD Consent Management
    path('api/consent/', include('apps.consent.urls')),
    
    # Billing & Subscriptions (Sprint 4)
    path('api/v1/billing/', include('apps.billing.urls')),
    
    # Webhooks & Integrações (Sprint 5)
    path('api/v1/webhooks/', include('apps.webhooks.urls')),
    
    path('api/', include(router.urls)),  # API REST endpoints
    
    # JWT Authentication (Principal)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Auth token (DRF authtoken) - LEGACY - manter para backward compatibility
    
    # Logout com invalidação de token
    # ATUALIZADO: Auditoria 30/01/2026 - Adicionado blacklist JWT
    path('api/logout/', LogoutView.as_view(), name='api-logout'),
    path('api/logout/all/', LogoutAllDevicesView.as_view(), name='api-logout-all-devices'),
    
    # Perfil do Usuário
    path('api/auth/me/', UserProfileUpdateView.as_view(), name='user-profile'),
    
    # Novo endpoint: Dados completos do usuário
    path('api/users/me/', UserMeView.as_view(), name='user-me'),
    
    # Password Reset
    path('api/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # LGPD/GDPR - Exclusão e Exportação de Dados
    path('api/account/', AccountDeletionView.as_view(), name='account-deletion'),
    path('api/export-data/', DataExportView.as_view(), name='data-export'),
    
    # CSP Violation Reports
    path('api/csp-report/', csp_report, name='csp-report'),
]

# Adicionar URLs do Swagger
urlpatterns += swagger_urlpatterns

