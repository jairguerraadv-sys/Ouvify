"""
Middleware de segurança customizado para adicionar headers adicionais.
"""
import os
import secrets
from django.conf import settings


class SecurityHeadersMiddleware:
    """
    Adiciona headers de segurança adicionais em todas as respostas.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Aplicar headers em produção OU quando FORCE_CSP=true (para testes)
        force_csp = os.getenv('FORCE_CSP', 'false').lower() == 'true'
        
        if not settings.DEBUG or force_csp:
            # Gerar nonce para CSP (Django 6.0+)
            nonce = secrets.token_urlsafe(16)
            request.csp_nonce = nonce

            # Determinar modo CSP (report-only ou enforce)
            csp_mode = getattr(settings, 'CSP_MODE', 'enforce')

            # Content Security Policy
            csp_parts = []
            if hasattr(settings, 'CSP_DEFAULT_SRC'):
                csp_parts.append(f"default-src {' '.join(settings.CSP_DEFAULT_SRC)}")
            if hasattr(settings, 'CSP_SCRIPT_SRC'):
                script_src = list(settings.CSP_SCRIPT_SRC)
                # Substituir NONCE pelo nonce real
                script_src = [nonce if src == 'NONCE' else src for src in script_src]
                csp_parts.append(f"script-src {' '.join(script_src)}")
            if hasattr(settings, 'CSP_STYLE_SRC'):
                csp_parts.append(f"style-src {' '.join(settings.CSP_STYLE_SRC)}")
            if hasattr(settings, 'CSP_IMG_SRC'):
                csp_parts.append(f"img-src {' '.join(settings.CSP_IMG_SRC)}")
            if hasattr(settings, 'CSP_FONT_SRC'):
                csp_parts.append(f"font-src {' '.join(settings.CSP_FONT_SRC)}")
            if hasattr(settings, 'CSP_CONNECT_SRC'):
                csp_parts.append(f"connect-src {' '.join(settings.CSP_CONNECT_SRC)}")
            if hasattr(settings, 'CSP_FRAME_SRC'):
                csp_parts.append(f"frame-src {' '.join(settings.CSP_FRAME_SRC)}")
            if hasattr(settings, 'CSP_OBJECT_SRC'):
                csp_parts.append(f"object-src {' '.join(settings.CSP_OBJECT_SRC)}")
            if hasattr(settings, 'CSP_BASE_URI'):
                csp_parts.append(f"base-uri {' '.join(settings.CSP_BASE_URI)}")
            if hasattr(settings, 'CSP_FORM_ACTION'):
                csp_parts.append(f"form-action {' '.join(settings.CSP_FORM_ACTION)}")

            if csp_parts:
                csp_header = '; '.join(csp_parts)
                if csp_mode == 'report-only':
                    response['Content-Security-Policy-Report-Only'] = csp_header + '; report-uri /api/csp-report/'
                else:
                    response['Content-Security-Policy'] = csp_header

            # Permissions Policy
            if hasattr(settings, 'PERMISSIONS_POLICY'):
                policy_parts = []
                for feature, origins in settings.PERMISSIONS_POLICY.items():
                    if origins:
                        policy_parts.append(f"{feature}=({' '.join(origins)})")
                    else:
                        policy_parts.append(f"{feature}=()")

                if policy_parts:
                    response['Permissions-Policy'] = ', '.join(policy_parts)

            # Referrer Policy
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

            # X-Content-Type-Options (redundante mas garantir)
            response['X-Content-Type-Options'] = 'nosniff'

            # X-Frame-Options (redundante mas garantir)
            response['X-Frame-Options'] = 'DENY'

        return response
