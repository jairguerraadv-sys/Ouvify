from django.http import HttpResponse
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
    
    # Aqui está a mágica do White Label: Usamos a cor do banco de dados no CSS!
    html = f"""
    <html>
        <head>
            <meta charset="UTF-8">
            <title>{tenant.nome} - Ouvy</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; margin: 0;">
            <div style="background-color: {tenant.cor_primaria}; color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1>🎯 Bem-vindo à {tenant.nome}</h1>
                <p>Este é um canal exclusivo e personalizado</p>
            </div>
            <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                <p><strong>Subdomínio:</strong> {tenant.subdominio}</p>
                <p><strong>Cor Primária:</strong> {tenant.cor_primaria}</p>
                <p><strong>Status:</strong> {'✅ Ativo' if tenant.ativo else '❌ Inativo'}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">
                <a href="http://localhost:8000" style="color: #667eea; text-decoration: none;">← Voltar à página pública</a>
            </p>
        </body>
    </html>
    """
    return HttpResponse(html)

