from django.urls import path

from .views import ConsentVersionViewSet, UserConsentViewSet

app_name = "consent"

# Definir URLs manualmente para evitar conflito com format_suffix_patterns
consent_version_list = ConsentVersionViewSet.as_view({"get": "list"})
consent_version_detail = ConsentVersionViewSet.as_view({"get": "retrieve"})
consent_version_required = ConsentVersionViewSet.as_view({"get": "required"})

user_consent_list = UserConsentViewSet.as_view({"get": "list", "post": "create"})
user_consent_detail = UserConsentViewSet.as_view(
    {"get": "retrieve", "put": "update", "delete": "destroy"}
)
user_consent_accept = UserConsentViewSet.as_view({"post": "accept"})
user_consent_accept_anonymous = UserConsentViewSet.as_view({"post": "accept_anonymous"})
user_consent_revoke = UserConsentViewSet.as_view({"post": "revoke"})
user_consent_pending = UserConsentViewSet.as_view({"get": "pending"})

urlpatterns = [
    # Consent Versions
    path("versions/", consent_version_list, name="consent-versions-list"),
    path("versions/<int:pk>/", consent_version_detail, name="consent-versions-detail"),
    path(
        "versions/required/", consent_version_required, name="consent-versions-required"
    ),
    # User Consents
    path("user-consents/", user_consent_list, name="user-consents-list"),
    path("user-consents/<int:pk>/", user_consent_detail, name="user-consents-detail"),
    path("user-consents/accept/", user_consent_accept, name="user-consents-accept"),
    path(
        "user-consents/accept_anonymous/",
        user_consent_accept_anonymous,
        name="user-consents-accept-anonymous",
    ),
    path(
        "user-consents/<int:pk>/revoke/",
        user_consent_revoke,
        name="user-consents-revoke",
    ),
    path("user-consents/pending/", user_consent_pending, name="user-consents-pending"),
]
