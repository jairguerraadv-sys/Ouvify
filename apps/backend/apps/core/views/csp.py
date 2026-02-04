import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from apps.core.models import CSPViolation
from apps.core.utils import get_current_tenant


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
        data = json.loads(request.body)

        # Extrair dados do report
        report_data = data.get("csp-report", {})

        # Sanitizar dados para evitar vazamento de PII
        sanitized_uri = CSPViolation.sanitize_uri(report_data.get("document-uri", ""))
        blocked_uri = CSPViolation.sanitize_uri(report_data.get("blocked-uri", ""))
        violated_directive = report_data.get("violated-directive", "")
        original_policy = report_data.get("original-policy", "")
        source_file = report_data.get("source-file", "")
        script_sample = report_data.get("script-sample", "")

        # Obter IP do cliente
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.META.get("REMOTE_ADDR", "")

        # Obter tenant atual
        tenant = get_current_tenant()

        # Obter user agent (truncado para evitar dados excessivos)
        user_agent = CSPViolation.truncate_user_agent(
            request.META.get("HTTP_USER_AGENT", "")
        )

        # Criar registro da violação
        violation = CSPViolation.objects.create(
            tenant=tenant,
            document_uri=sanitized_uri,
            violated_directive=violated_directive,
            blocked_uri=blocked_uri,
            original_policy=original_policy,
            source_file=source_file,
            script_sample=script_sample,
            user_agent=user_agent,
            client_ip=client_ip,
            raw_report=json.dumps(data),  # Guardar report completo para análise
        )

        # Log estruturado
        logger = logging.getLogger("csp_violations")
        logger.warning(
            "CSP Violation Detected",
            extra={
                "violation_id": violation.id,
                "tenant": tenant.subdominio if tenant else None,
                "directive": violated_directive,
                "document_uri": sanitized_uri,
                "blocked_uri": blocked_uri,
                "ip": client_ip,
            },
        )

        return JsonResponse({"status": "recorded"})

    except json.JSONDecodeError:
        logger = logging.getLogger("csp_violations")
        logger.warning("Invalid JSON in CSP report")
        return JsonResponse({"error": "invalid_json"}, status=400)
    except Exception as e:
        logger = logging.getLogger("csp_violations")
        logger.error(f"Error processing CSP report: {e}")
        return JsonResponse({"error": "processing_error"}, status=500)
