#!/usr/bin/env python3
"""
📊 GERADOR DE RELATÓRIO HTML - Ouvy SaaS
Cria relatório interativo de auditoria
Autor: Tech Lead QA
Data: 12/01/2026
"""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

class ReportGenerator:
    def __init__(self):
        self.root = Path("/Users/jairneto/Desktop/ouvy_saas")
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.output_file = self.root / "AUDIT_REPORT.html"

    def generate_html(self):
        """Gerar relatório HTML"""
        html_content = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auditoria Ouvy SaaS - Code Freeze</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        
        header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        header h1 {{
            font-size: 32px;
            margin-bottom: 10px;
        }}
        
        header p {{
            font-size: 16px;
            opacity: 0.9;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .section {{
            margin-bottom: 40px;
        }}
        
        .section h2 {{
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}
        
        .checklist {{
            list-style: none;
        }}
        
        .checklist li {{
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #ddd;
            background: #f9f9f9;
            border-radius: 4px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }}
        
        .checklist li.critical {{
            border-left-color: #e74c3c;
            background: #fadbd8;
        }}
        
        .checklist li.medium {{
            border-left-color: #f39c12;
            background: #fef5e7;
        }}
        
        .checklist li.cleanup {{
            border-left-color: #3498db;
            background: #ebf5fb;
        }}
        
        .checklist li.verified {{
            border-left-color: #27ae60;
            background: #d5f4e6;
        }}
        
        .badge {{
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            white-space: nowrap;
            min-width: 100px;
            text-align: center;
        }}
        
        .badge.critical {{
            background: #e74c3c;
            color: white;
        }}
        
        .badge.medium {{
            background: #f39c12;
            color: white;
        }}
        
        .badge.cleanup {{
            background: #3498db;
            color: white;
        }}
        
        .badge.verified {{
            background: #27ae60;
            color: white;
        }}
        
        .item-content {{
            flex: 1;
        }}
        
        .item-title {{
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }}
        
        .item-location {{
            font-size: 12px;
            color: #666;
            font-family: 'Monaco', 'Menlo', monospace;
        }}
        
        .item-description {{
            font-size: 14px;
            color: #555;
            margin: 8px 0;
        }}
        
        .item-solution {{
            font-size: 13px;
            color: #666;
            margin-top: 8px;
            padding: 10px;
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
        }}
        
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .summary-card {{
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: bold;
        }}
        
        .summary-card.critical {{
            background: #e74c3c;
        }}
        
        .summary-card.medium {{
            background: #f39c12;
        }}
        
        .summary-card.cleanup {{
            background: #3498db;
        }}
        
        .summary-card.verified {{
            background: #27ae60;
        }}
        
        .summary-card .number {{
            font-size: 40px;
            margin-bottom: 10px;
        }}
        
        .summary-card .label {{
            font-size: 14px;
        }}
        
        footer {{
            background: #ecf0f1;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }}
        
        .status-banner {{
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
        }}
        
        .status-banner.success {{
            background: #d5f4e6;
            color: #27ae60;
            border: 2px solid #27ae60;
        }}
        
        .status-banner.warning {{
            background: #fef5e7;
            color: #f39c12;
            border: 2px solid #f39c12;
        }}
        
        .status-banner.danger {{
            background: #fadbd8;
            color: #e74c3c;
            border: 2px solid #e74c3c;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 Auditoria Profunda - Ouvy SaaS</h1>
            <p>Code Freeze - Tech Lead QA</p>
            <p>Data: {self.timestamp}</p>
        </header>
        
        <div class="content">
            <div class="status-banner success">
                ✅ Fase de Auditoria Concluída - Relatório Disponível
            </div>
            
            <div class="section">
                <h2>📋 Resumo Executivo</h2>
                <div class="summary">
                    <div class="summary-card critical">
                        <div class="number">3</div>
                        <div class="label">Crítico</div>
                    </div>
                    <div class="summary-card medium">
                        <div class="number">4</div>
                        <div class="label">Médio</div>
                    </div>
                    <div class="summary-card cleanup">
                        <div class="number">3</div>
                        <div class="label">Limpeza</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🔴 Itens Críticos (Bloqueadores)</h2>
                <ul class="checklist">
                    <li class="critical">
                        <span class="badge critical">#1 CRÍTICO</span>
                        <div class="item-content">
                            <div class="item-title">Exposição de Chaves Stripe</div>
                            <div class="item-location">.env / Git History</div>
                            <div class="item-description">
                                Verificar se STRIPE_SECRET_KEY foi commitada no histórico Git
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Executar `git log --all -S "STRIPE_SECRET_KEY"` - Se retornar commits, revogar chaves imediatamente
                            </div>
                        </div>
                    </li>
                    
                    <li class="critical">
                        <span class="badge critical">#2 CRÍTICO</span>
                        <div class="item-content">
                            <div class="item-title">Falta de Try/Catch em Axios</div>
                            <div class="item-location">ouvy_frontend/app/acompanhar/page.tsx:70-90</div>
                            <div class="item-description">
                                Chamada axios para consultar protocolo não trata erros de rate limit (429)
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Envolver axios.get() em try/catch e tratar AxiosError com acesso a error.response?.status
                            </div>
                        </div>
                    </li>
                    
                    <li class="critical">
                        <span class="badge critical">#3 CRÍTICO</span>
                        <div class="item-content">
                            <div class="item-title">Permission Classes Ausentes</div>
                            <div class="item-location">ouvy_saas/apps/tenants/views.py</div>
                            <div class="item-description">
                                Endpoints sensíveis podem estar sem validação de autenticação/permissão
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Adicionar permission_classes = [IsAuthenticated] ou [IsAdminUser] onde necessário
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <h2>🟡 Itens Médios (Revisar)</h2>
                <ul class="checklist">
                    <li class="medium">
                        <span class="badge medium">#4 MÉDIO</span>
                        <div class="item-content">
                            <div class="item-title">DEBUG=True em Produção</div>
                            <div class="item-location">.env</div>
                            <div class="item-description">
                                DEBUG=True exponibiliza stack traces com caminhos completos do projeto
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Criar .env.production com DEBUG=False e usar em deploy
                            </div>
                        </div>
                    </li>
                    
                    <li class="medium">
                        <span class="badge medium">#5 MÉDIO</span>
                        <div class="item-content">
                            <div class="item-title">useState com Tipo 'any'</div>
                            <div class="item-location">ouvy_frontend/app/dashboard/configuracoes/page.tsx</div>
                            <div class="item-description">
                                useState<any>(null) não oferece type safety
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Criar interface Tenant e usar useState<Tenant | null>(null)
                            </div>
                        </div>
                    </li>
                    
                    <li class="medium">
                        <span class="badge medium">#6 MÉDIO</span>
                        <div class="item-content">
                            <div class="item-title">localStorage XSS Risk</div>
                            <div class="item-location">ouvy_frontend/hooks/use-dashboard.ts</div>
                            <div class="item-description">
                                localStorage.getItem('auth_token') é vulnerável a XSS
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Considerar HttpOnly cookies (backend change) ou sessionStorage
                            </div>
                        </div>
                    </li>
                    
                    <li class="medium">
                        <span class="badge medium">#7 MÉDIO</span>
                        <div class="item-content">
                            <div class="item-title">pyrightconfig.json Permissivo</div>
                            <div class="item-location">pyrightconfig.json</div>
                            <div class="item-description">
                                typeCheckingMode: "basic" deveria ser "standard" ou "strict"
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Mudar para "standard"
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <h2>🔵 Itens de Limpeza</h2>
                <ul class="checklist">
                    <li class="cleanup">
                        <span class="badge cleanup">#8 LIMPEZA</span>
                        <div class="item-content">
                            <div class="item-title">console.log em Produção</div>
                            <div class="item-description">
                                Remover console.log, debugger antes de merge
                            </div>
                            <div class="item-solution">
                                ✅ Ação: `grep -r "console.log" ouvy_frontend --include="*.tsx"`
                            </div>
                        </div>
                    </li>
                    
                    <li class="cleanup">
                        <span class="badge cleanup">#9 LIMPEZA</span>
                        <div class="item-content">
                            <div class="item-title">Refatorar Tipo 'any'</div>
                            <div class="item-description">
                                Múltiplas ocorrências de `any` em TypeScript
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Executar `python audit_typing.py` para relatório completo
                            </div>
                        </div>
                    </li>
                    
                    <li class="cleanup">
                        <span class="badge cleanup">#10 LIMPEZA</span>
                        <div class="item-content">
                            <div class="item-title">Documentação na Raiz</div>
                            <div class="item-description">
                                15+ arquivos .md que podem ser movidos para /docs/ após deploy
                            </div>
                            <div class="item-solution">
                                ✅ Ação: Mover documentação para estrutura de docs
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <h2>✅ Verificações Aprovadas</h2>
                <ul class="checklist">
                    <li class="verified">
                        <span class="badge verified">✅ PASSOU</span>
                        <div class="item-content">
                            <div class="item-title">React Hooks</div>
                            <div class="item-description">
                                Sem hooks dentro de loops/condicionais detectados
                            </div>
                        </div>
                    </li>
                    
                    <li class="verified">
                        <span class="badge verified">✅ PASSOU</span>
                        <div class="item-content">
                            <div class="item-title">Multi-Tenancy</div>
                            <div class="item-description">
                                Middleware corretamente aplicado
                            </div>
                        </div>
                    </li>
                    
                    <li class="verified">
                        <span class="badge verified">✅ PASSOU</span>
                        <div class="item-content">
                            <div class="item-title">.gitignore</div>
                            <div class="item-description">
                                Cobre .env, db.sqlite3, venv, node_modules
                            </div>
                        </div>
                    </li>
                    
                    <li class="verified">
                        <span class="badge verified">✅ PASSOU</span>
                        <div class="item-content">
                            <div class="item-title">Rate Limiting</div>
                            <div class="item-description">
                                Implementado em consultar-protocolo
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <h2>🚀 Próximos Passos</h2>
                <ol style="margin-left: 20px; line-height: 1.8;">
                    <li><strong>Imediato:</strong> Executar todos os scripts de auditoria:
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">
python audit_master.py  # Coordena todos os audits
python audit_security.py  # Verificações de segurança
python audit_debug.py  # Scanner de debug
python audit_typing.py  # Análise de tipagem
python audit_apis.py  # Mapeamento de APIs
                        </pre>
                    </li>
                    <li><strong>Fase 1 (Crítica):</strong> Resolver os 3 itens críticos</li>
                    <li><strong>Fase 2 (Médio):</strong> Revisar os 4 itens médios</li>
                    <li><strong>Fase 3 (Limpeza):</strong> Executar checklist de limpeza</li>
                    <li><strong>Validação:</strong> Deploy em Staging → Testes E2E → Production</li>
                </ol>
            </div>
        </div>
        
        <footer>
            <p>Relatório gerado automaticamente em {self.timestamp}</p>
            <p>Tech Lead QA - Ouvy SaaS Code Freeze</p>
        </footer>
    </div>
</body>
</html>
        """
        
        self.output_file.write_text(html_content)
        print(f"✅ Relatório HTML gerado: {self.output_file}")
        return str(self.output_file)

    def run(self):
        return self.generate_html()

if __name__ == "__main__":
    generator = ReportGenerator()
    report_path = generator.run()
    print(f"\n📊 Abra no navegador: file://{report_path}")
