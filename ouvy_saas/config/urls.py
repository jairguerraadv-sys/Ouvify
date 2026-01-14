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
from rest_framework.routers import DefaultRouter
from apps.tenants import views as tenant_views  # type: ignore[import-not-found]
from apps.tenants.subscription_management import ManageSubscriptionView, ReactivateSubscriptionView  # type: ignore[import-not-found]
from apps.feedbacks import views as feedback_views  # type: ignore[import-not-found]
from apps.core.views import home
from apps.core.password_reset import PasswordResetRequestView, PasswordResetConfirmView  # type: ignore[import-not-found]
from apps.core.health import health_check as health_check_view, readiness_check  # type: ignore[import-not-found]
from apps.core.lgpd_views import AccountDeletionView, DataExportView  # type: ignore[import-not-found]
from rest_framework.authtoken.views import obtain_auth_token
from config.swagger import swagger_urlpatterns

# Expor referências para Pylance
FeedbackViewSet = feedback_views.FeedbackViewSet  # type: ignore[attr-defined]
TenantInfoView = tenant_views.TenantInfoView  # type: ignore[attr-defined]
RegisterTenantView = tenant_views.RegisterTenantView  # type: ignore[attr-defined]
CheckSubdominioView = tenant_views.CheckSubdominioView  # type: ignore[attr-defined]
TenantAdminViewSet = tenant_views.TenantAdminViewSet  # type: ignore[attr-defined]
CreateCheckoutSessionView = tenant_views.CreateCheckoutSessionView  # type: ignore[attr-defined]
StripeWebhookView = tenant_views.StripeWebhookView  # type: ignore[attr-defined]



# Router DRF - Gera automaticamente rotas REST + actions customizadas
router = DefaultRouter()

# FeedbackViewSet gera as seguintes rotas:
# - GET/POST    /api/feedbacks/                          (list, create)
# - GET/PUT     /api/feedbacks/{id}/                     (retrieve, update)
# - GET         /api/feedbacks/consultar-protocolo/      (action pública)
# - POST        /api/feedbacks/responder-protocolo/      (action pública)
# - GET         /api/feedbacks/dashboard-stats/          (action stats)
# - POST        /api/feedbacks/{id}/adicionar-interacao/ (action autenticada)
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')

# TenantAdminViewSet gera rotas administrativas (apenas superusuários):
# - GET/PATCH   /api/admin/tenants/                      (list, partial_update)
router.register(r'admin/tenants', TenantAdminViewSet, basename='admin-tenants')

urlpatterns = [
    path('', home, name='home'),  # Rota raiz para teste de multi-tenancy
    path('health/', health_check_view, name='health-check'),  # Health check endpoint
    path('ready/', readiness_check, name='readiness-check'),  # Readiness check endpoint
    path('admin/', admin.site.urls),
    
    # Endpoint público para informações do tenant atual
    path('api/tenant-info/', TenantInfoView.as_view(), name='tenant-info'),
    
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
    
    path('api/', include(router.urls)),  # API REST endpoints
    # Auth token (DRF authtoken)
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    
    # Password Reset
    path('api/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # LGPD/GDPR - Exclusão e Exportação de Dados
    path('api/account/', AccountDeletionView.as_view(), name='account-deletion'),
    path('api/export-data/', DataExportView.as_view(), name='data-export'),
]

# Adicionar URLs do Swagger
urlpatterns += swagger_urlpatterns

