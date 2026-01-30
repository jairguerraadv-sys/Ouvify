from django.http import HttpResponse, JsonResponse
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.exceptions import SuspiciousOperation
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import json
import logging
from apps.core.utils import get_current_tenant
from .models import CSPViolation


def home(request):
    """
    View de teste que demonstra o White Label funcionando.
    A cor de fundo muda baseado na empresa (tenant) acessada.
    """
    tenant = get_current_tenant()
    
    if not tenant:
        return HttpResponse("""
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Ouvify - Plataforma White Label</title>
            </head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; margin: 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; border-radius: 10px;">
                    <h1>🎉 Bem-vindo ao Ouvify</h1>
                    <p>Plataforma White Label SaaS Multi-tenant</p>
                </div>
                <p style="margin-top: 30px; color: #666;">
                    Acesse via subdomínio para ver o White Label em ação!<br>
                    Exemplos: <code>empresaA.local:8000</code> ou <code>empresaB.local:8000</code>
                </p>
                <p style="margin-top: 20px;">
                    <a href="http://localhost:8000/admin" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Acessar Painel Admin
                    </a>
                </p>
            </body>
        </html>
        """)
    
    # IMPORTANTE: Escapar dados do banco para prevenir XSS
    tenant_nome = escape(tenant.nome)
    tenant_subdominio = escape(tenant.subdominio)
    tenant_cor = escape(tenant.cor_primaria) if tenant.cor_primaria else '#667eea'
    
    # Validar que cor_primaria é um hex válido (prevenir injeção CSS)
    import re
    if not re.match(r'^#[0-9A-Fa-f]{6}$', tenant_cor):
        tenant_cor = '#667eea'  # Fallback seguro
    
    # Aqui está a mágica do White Label: Usamos a cor do banco de dados no CSS!
    html = f"""
    <html>
        <head>
            <meta charset="UTF-8">
            <title>{tenant_nome} - Ouvify</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; margin: 0;">
            <div style="background-color: {tenant_cor}; color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1>🎯 Bem-vindo à {tenant_nome}</h1>
                <p>Este é um canal exclusivo e personalizado</p>
            </div>
            <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                <p><strong>Subdomínio:</strong> {tenant_subdominio}</p>
                <p><strong>Cor Primária:</strong> {tenant_cor}</p>
                <p><strong>Status:</strong> {'✅ Ativo' if tenant.ativo else '❌ Inativo'}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">
                <a href="http://localhost:8000" style="color: #667eea; text-decoration: none;">← Voltar à página pública</a>
            </p>
        </body>
    </html>
    """
    return HttpResponse(html)


@csrf_exempt
@require_POST
def csp_report(request):
    """
    Endpoint para coletar violações de Content Security Policy.
    
    Recebe reports do navegador quando CSP bloqueia recursos.
    Dados são sanitizados para evitar vazamento de PII.
    """
    try:
        # Parse do JSON do report
        report_data = json.loads(request.body)
        
        # Extrair dados do report CSP
        csp_report = report_data.get('csp-report', {})
        
        # Rate limiting básico por IP (simples, pode ser melhorado)
        client_ip = request.META.get('HTTP_X_FORWARDED_FOR', 
                                   request.META.get('HTTP_X_REAL_IP', 
                                                  request.META.get('REMOTE_ADDR', '')))
        
        # Verificar se já teve muitas violações recentes deste IP (básico)
        recent_violations = CSPViolation.objects.filter(
            ip_address=client_ip,
            created_at__gte=timezone.now() - timedelta(minutes=5)
        ).count()
        
        if recent_violations >= 10:  # Max 10 violações por 5 minutos por IP
            logger.warning(f"CSP Report rate limit exceeded for IP: {client_ip}")
            return JsonResponse({'status': 'rate_limited'}, status=429)
        
        # Obter tenant atual
        tenant = get_current_tenant()
        if not tenant:
            logger.warning("CSP Report received without tenant context")
            return JsonResponse({'status': 'no_tenant'}, status=400)
        
        # Criar registro de violação com dados sanitizados
        violation = CSPViolation.objects.create(
            client=tenant,
            document_uri=CSPViolation.sanitize_uri(csp_report.get('document-uri', '')),
            violated_directive=csp_report.get('violated-directive', '')[:100],
            effective_directive=csp_report.get('effective-directive', '')[:100],
            original_policy=csp_report.get('original-policy', '')[:1000],  # Truncar se muito longo
            blocked_uri=CSPViolation.sanitize_uri(csp_report.get('blocked-uri', '')),
            source_file=CSPViolation.sanitize_uri(csp_report.get('source-file', '')),
            line_number=csp_report.get('line-number'),
            user_agent=CSPViolation.truncate_user_agent(request.META.get('HTTP_USER_AGENT', '')),
            ip_address=client_ip,
        )
        
        # Log estruturado para monitoramento
        logger.info(
            "CSP Violation recorded",
            extra={
                'violation_id': violation.id,
                'tenant': tenant.name,
                'directive': violation.violated_directive,
                'document_uri': violation.document_uri,
                'blocked_uri': violation.blocked_uri,
                'ip': client_ip,
            }
        )
        
        return JsonResponse({'status': 'recorded'})
        
    except json.JSONDecodeError:
        logger.warning("Invalid JSON in CSP report")
        return JsonResponse({'error': 'invalid_json'}, status=400)
    except Exception as e:
        logger.error(f"Error processing CSP report: {e}")
        return JsonResponse({'error': 'processing_error'}, status=500)

