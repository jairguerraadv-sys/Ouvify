"""
URLs para API de Two-Factor Authentication (2FA)
"""
from django.urls import path
from .views.two_factor_views import (
    TwoFactorSetupView,
    TwoFactorConfirmView,
    TwoFactorVerifyView,
    TwoFactorDisableView,
    TwoFactorStatusView,
    TwoFactorRegenerateBackupCodesView,
)

app_name = '2fa'

urlpatterns = [
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/confirm/', TwoFactorConfirmView.as_view(), name='2fa-confirm'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),
    path('2fa/status/', TwoFactorStatusView.as_view(), name='2fa-status'),
    path('2fa/backup-codes/regenerate/', TwoFactorRegenerateBackupCodesView.as_view(), name='2fa-regenerate-backup'),
]
