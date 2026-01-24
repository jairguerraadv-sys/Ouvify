from django.contrib import admin
from .models import ConsentVersion, UserConsent, ConsentLog


@admin.register(ConsentVersion)
class ConsentVersionAdmin(admin.ModelAdmin):
    list_display = ['document_type', 'version', 'is_current', 'is_required', 'created_at']
    list_filter = ['document_type', 'is_current', 'is_required']
    search_fields = ['document_type', 'version']
    ordering = ['-created_at']


@admin.register(UserConsent)
class UserConsentAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'consent_version', 'accepted', 'revoked', 'accepted_at']
    list_filter = ['accepted', 'revoked', 'context', 'consent_version__document_type']
    search_fields = ['user__email', 'email']
    raw_id_fields = ['user', 'consent_version']
    ordering = ['-accepted_at']


@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    list_display = ['user_consent', 'action', 'timestamp', 'ip_address']
    list_filter = ['action']
    search_fields = ['user_consent__user__email', 'user_consent__email']
    ordering = ['-timestamp']
