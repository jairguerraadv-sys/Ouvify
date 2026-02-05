#!/usr/bin/env python3
from flask import Flask, jsonify, render_template_string
import json
import os
from pathlib import Path

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "ROMA Auditor"}), 200

@app.route('/api/audit', methods=['GET'])
def get_audit():
    try:
        with open('audit-reports/audit_report.json') as f:
            data = json.load(f)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "Audit report not found. Run audit first: python scripts/audit_ouvify.py ./ouvify-repo"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in report"}), 500

@app.route('/', methods=['GET'])
def dashboard():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ROMA Auditor - Ouvify</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 30px;
            }
            header {
                border-bottom: 3px solid #667eea;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            h1 { 
                color: #333; 
                font-size: 2.5em;
                margin-bottom: 5px;
            }
            .subtitle {
                color: #666;
                font-size: 1.1em;
            }
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .metric-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            .metric-label {
                font-size: 0.9em;
                opacity: 0.9;
                margin-bottom: 8px;
            }
            .metric-value {
                font-size: 2em;
                font-weight: bold;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            .section h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.5em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🔍 ROMA Auditor</h1>
                <p class="subtitle">Análise Automática do Projeto Ouvify</p>
            </header>
            
            <div id="audit-data">
                <div class="loading">⏳ Carregando relatório de auditoria...</div>
            </div>
        </div>
        
        <script>
            async function loadAudit() {
                try {
                    const response = await fetch('/api/audit');
                    const data = await response.json();
                    
                    if (!response.ok) {
                        document.getElementById('audit-data').innerHTML = `
                            <div style="background: #ffe0e0; color: #c92a2a; padding: 20px; border-radius: 8px;">
                                <strong>❌ Erro ao carregar relatório:</strong><br>
                                ${data.error}
                            </div>
                        `;
                        return;
                    }
                    
                    let html = '<div style="background: #d3f9d8; color: #2b8a3e; padding: 20px; border-radius: 8px;">✅ Relatório carregado!</div>';
                    
                    const status = data.status.toUpperCase();
                    html += '<div class="status-grid">';
                    html += `
                        <div class="metric-card">
                            <div class="metric-label">Status</div>
                            <div class="metric-value">${status}</div>
                        </div>
                    `;
                    html += '</div>';
                    
                    document.getElementById('audit-data').innerHTML = html;
                } catch (error) {
                    document.getElementById('audit-data').innerHTML = `
                        <div style="background: #ffe0e0; color: #c92a2a; padding: 20px; border-radius: 8px;">
                            <strong>❌ Erro ao conectar:</strong><br>
                            ${error.message}
                        </div>
                    `;
                }
            }
            
            loadAudit();
        </script>
    </body>
    </html>
    """
    return render_template_string(html)

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 ROMA Server iniciado!")
    print("=" * 70)
    print()
    print("📊 Dashboard: http://127.0.0.1:5000")
    print("🔄 Health check: http://127.0.0.1:5000/health")
    print("📋 API: http://127.0.0.1:5000/api/audit")
    print()
    print("Pressione Ctrl+C para parar")
    print()
    print("=" * 70)
    app.run(debug=True, port=5000, host='127.0.0.1')
