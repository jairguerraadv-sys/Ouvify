# Views do app core
from .analytics import AnalyticsView
from .home import home
from .csp import csp_report
from .search_views import GlobalSearchView, AutocompleteView, SearchByProtocolView
from .two_factor_views import (
    TwoFactorSetupView,
    TwoFactorConfirmView,
    TwoFactorVerifyView,
    TwoFactorDisableView,
    TwoFactorStatusView,
    TwoFactorRegenerateBackupCodesView,
)