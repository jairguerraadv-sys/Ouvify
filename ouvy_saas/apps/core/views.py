from django.http import HttpResponse
from django.utils.html import escape
from apps.core.utils import get_current_tenant


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
                <title>Ouvy - Plataforma White Label</title>
            </head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; margin: 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; border-radius: 10px;">
                    <h1>🎉 Bem-vindo ao Ouvy</h1>
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
            <title>{tenant_nome} - Ouvy</title>
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

