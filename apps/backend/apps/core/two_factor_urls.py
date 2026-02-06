"""
URLs para API de Two-Factor Authentication (2FA)
"""

from django.urls import path

from .views.two_factor_views import (
    TwoFactorConfirmView,
    TwoFactorDisableView,
    TwoFactorRegenerateBackupCodesView,
    TwoFactorSetupView,
    TwoFactorStatusView,
    TwoFactorVerifyView,
)

app_name = "2fa"

urlpatterns = [
    path("setup/", TwoFactorSetupView.as_view(), name="2fa-setup"),
    path("confirm/", TwoFactorConfirmView.as_view(), name="2fa-confirm"),
    path("verify/", TwoFactorVerifyView.as_view(), name="2fa-verify"),
    path("disable/", TwoFactorDisableView.as_view(), name="2fa-disable"),
    path("status/", TwoFactorStatusView.as_view(), name="2fa-status"),
    path(
        "backup-codes/regenerate/",
        TwoFactorRegenerateBackupCodesView.as_view(),
        name="2fa-regenerate-backup",
    ),
]
