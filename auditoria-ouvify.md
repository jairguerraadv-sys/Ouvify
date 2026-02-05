


estou desenvolvendo um projeto que será uma White label como SaaS, de canal de Feedback de usuários, como um canal de denuncia, reclamações, sugestões, elogios, com código de rastreio da interação para acompanhamento pelo usuário. o cliente-empresa paga mensalidade pra usar. a plataforma se chama Ouvify. Preciso que crie um plano de auditoria geral a fim de você entender o status atual do projeto, verificar a integridade, duplicações e redundâncias entre versões antigas e atuais, paginas faltantes, erros de caminho, segurança, performance e conformidade do sistema Ouvify, bem como o que falta para finalizarmos o projeto dentro das funcionalidades necessárias para o produto, garantindo que todas as funcionalidades estejam operacionais e livres de vulnerabilidades críticas. considerando que o projeto é monorepo, esta em repositório github, e foi feito deploy do backend (python) no render e do frontend (java script) no vercel .escreva um prompt para o copilot, IA do VS Studio Code, fazer essa auditoria completa, bem como para elaborar toda a documentação necessária e tutorias de uso, use o framework Sentient‑AGI/ROMA que já está configurado e habilitado, mas sem nenhuma chave de API externa (sem OpenAI, Gemini, etc.). Use apenas recursos locais (Docker, Python, HTTP) e o próprio Copilot no VS Code
auditoria-ouvify.md
Arquivo gerado

Agora vou criar um segundo documento com prompts específicos otimizados para o Copilot executar tarefas concretas:

ok
Concluído
Perfeito! Vou criar agora um documento complementar com prompts específicos e otimizados para o Copilot executar cada fase da auditoria, além de incluir um script de automação para processar os resultados localmente com ROMA Framework.

ok
Perfeito! Agora vou criar um documento complementar super detalhado com:

✅ Prompts específicos e prontos para copiar/colar no Copilot

✅ Scripts de automação Python para processar resultados com ROMA Framework

✅ Templates de documentação (README, ARCHITECTURE, API_DOCS, etc.)

✅ Guia de execução interativa passo-a-passo

auditoria-ouvify.md
📋 PLANO DE AUDITORIA COMPLETA - OUVIFY
Informações do Projeto
Nome: Ouvify

Tipo: White Label SaaS - Canal de Feedback de Usuários

Funcionalidades: Denúncias, Reclamações, Sugestões, Elogios

Modelo de Negócio: Mensalidade por cliente-empresa

Arquitetura: Monorepo (GitHub)

Backend: Python (Deploy: Render)

Frontend: JavaScript (Deploy: Vercel)

Framework de Auditoria: Sentient-AGI/ROMA (Local)

📊 ESCOPO DA AUDITORIA
1. ANÁLISE ESTRUTURAL DO CÓDIGO
 Verificar duplicações de código entre versões

 Identificar redundâncias de funcionalidades

 Mapear dependências circulares

 Analisar organização de pastas

 Validar convenções de nomenclatura

2. INTEGRIDADE DO SISTEMA
 Verificar routing correto (erros de caminho)

 Validar endpoints de API

 Testar fluxos de dados

 Verificar ligação entre componentes

 Confirmar variables de ambiente

3. FUNCIONALIDADES CRÍTICAS
 Sistema de Feedback (criar, ler, atualizar, deletar)

 Código de Rastreio/Tracking

 Autenticação e Autorização

 Multi-tenancy (isolamento de dados por empresa)

 Notificações e Alertas

 Relatórios e Análises

 Gestão de Usuários

 Gestão de Permissões

4. SEGURANÇA
 Validação de entrada (OWASP Top 10)

 Proteção contra SQL Injection

 CSRF Token Validation

 Autenticação (JWT, Sessions)

 Autorização (RBAC)

 Criptografia de dados sensíveis

 Rate Limiting

 Logs de segurança

 Variáveis de ambiente sensíveis (não expostas)

 Versionamento de API com segurança

5. PERFORMANCE
 Otimização de queries do banco de dados

 Cache (Redis/Memcached)

 Lazy loading de componentes

 Compressão de assets

 CDN para arquivos estáticos

 Paginação em listagens

 Time-outs apropriados

 Monitoramento de performance

6. CONFORMIDADE E REGULAMENTAÇÃO
 LGPD (Lei Geral de Proteção de Dados)

 GDPR (Regulamento Geral sobre Proteção de Dados)

 Política de Privacidade implementada

 Direito ao esquecimento (right to be forgotten)

 Consentimento de dados

 Auditoria de acessos

 Backup e Disaster Recovery

7. FUNCIONALIDADES FALTANTES
 Features críticas vs. MVP

 Features nice-to-have não implementadas

 Integrações externas necessárias

 Webhooks (se aplicável)

 API Pública para clientes (se aplicável)

8. TESTES E QUALIDADE
 Testes unitários cobertura

 Testes de integração

 Testes de API

 Testes de performance/carga

 Testes de segurança

 Documentação de testes

9. DOCUMENTAÇÃO
 README.md completo

 Arquitetura do sistema

 Guia de Setup (Frontend + Backend)

 Documentação de API (Swagger/OpenAPI)

 Guia do usuário final

 Guia do administrador

 Troubleshooting

10. DEPLOY E DEVOPS
 Variáveis de ambiente (prod vs. dev)

 CI/CD Pipeline

 Versionamento de releases

 Logs centralizados

 Monitoramento de saúde (health checks)

 Rollback strategy

🤖 PROMPT PARA COPILOT (VS Code)
Instruções Gerais
Copie este prompt e execute no painel Copilot Chat do VS Code:

text
Tu és um auditor especializado em projetos SaaS com foco em segurança, 
performance e conformidade. Vou te fornecer o repositório completo do projeto 
Ouvify (monorepo) para que realizes uma auditoria técnica exhaustiva.

IMPORTANTE: Use APENAS recursos locais disponíveis (Docker, Python, HTTP) 
e o framework Sentient-AGI/ROMA que já está configurado. NÃO utilize chaves 
de API externas (OpenAI, Gemini, etc.).

TAREFA 1: ANÁLISE ESTRUTURAL
========================
1. Mapeie a estrutura completa do monorepo
2. Identifique pastas duplicadas e código redundante
3. Liste todas as dependências (requirements.txt, package.json)
4. Verifique conformidade com padrões de projeto (MVC, componentes, etc.)
5. Gere um diagrama da arquitetura em Mermaid

TAREFA 2: VALIDAÇÃO DE INTEGRIDADE
========================
1. Verifique se todas as rotas/endpoints existem e funcionam
2. Confirme que não há erros de import/require
3. Valide se as variáveis de ambiente estão sendo usadas corretamente
4. Teste fluxos críticos (criar feedback → registrar tracking → enviar notificação)
5. Crie um relatório de "broken links" ou endpoints mortos

TAREFA 3: ANÁLISE DE SEGURANÇA
========================
1. Verifique validação de entrada em todas as rotas
2. Busque por SQL Injection, XSS ou CSRF vulnerabilities
3. Valide autenticação JWT/Sessions
4. Verifique isolamento de dados por tenant (multi-tenancy)
5. Procure por credenciais ou chaves expostas no código
6. Analise proteção de rotas (autenticação/autorização)
7. Gere relatório de vulnerabilidades críticas

TAREFA 4: PERFORMANCE
========================
1. Analise queries de banco de dados (procure por N+1 problems)
2. Identifique pontos de gargalo no backend
3. Verifique se há caching implementado
4. Analise tamanho de bundler do frontend
5. Procure por memória leaks potenciais
6. Gere relatório de otimizações recomendadas

TAREFA 5: CONFORMIDADE (LGPD/GDPR)
========================
1. Verifique se há policy de privacidade implementada
2. Valide consentimento de dados (cookies, termos)
3. Procure por implementação de "direito ao esquecimento"
4. Valide logs de auditoria de acessos
5. Verifique backup e disaster recovery
6. Gere checklist de conformidade

TAREFA 6: FUNCIONALIDADES CRÍTICAS
========================
1. Liste todas as funcionalidades implementadas
2. Identifique quais estão operacionais vs. em desenvolvimento
3. Mapeie funcionalidades faltantes (do MVP/roadmap)
4. Verifique se o sistema de rastreamento de feedback funciona
5. Valide geração de código de tracking único
6. Gere relatório de features completeness

TAREFA 7: TESTES
========================
1. Localize testes existentes (unitários, integração, API)
2. Calcule cobertura de testes
3. Identifique áreas críticas sem testes
4. Procure por testes de segurança
5. Recomende testes que faltam

TAREFA 8: GERAÇÃO DE DOCUMENTAÇÃO
========================
1. Crie README.md completo com:
   - Descrição do projeto
   - Setup local (Backend + Frontend)
   - Variáveis de ambiente necessárias
   - Como rodar testes
   - Como fazer deploy

2. Crie ARCHITECTURE.md com:
   - Diagrama da arquitetura
   - Fluxo de dados
   - Decisões arquiteturais
   - Padrões de projeto utilizados

3. Crie API_DOCUMENTATION.md com:
   - Todos os endpoints
   - Métodos HTTP
   - Parâmetros de entrada
   - Respostas esperadas
   - Códigos de erro

4. Crie USER_GUIDE.md com:
   - Como usar a plataforma
   - Como criar feedback
   - Como rastrear feedback
   - Como gerar relatórios

5. Crie ADMIN_GUIDE.md com:
   - Como gerenciar tenants
   - Como gerenciar usuários
   - Como configurar permissões
   - Como gerar backups

6. Crie TROUBLESHOOTING.md com:
   - Problemas comuns
   - Soluções passo-a-passo
   - Logs de erro explicados
   - Contato para suporte

7. Crie SECURITY.md com:
   - Política de segurança
   - Como reportar vulnerabilidades
   - Boas práticas para desenvolvedores
   - Checklist de segurança

TAREFA 9: RELATÓRIO FINAL
========================
Gere um relatório executivo contendo:
1. Status geral do projeto (% completo)
2. Vulnerabilidades críticas encontradas
3. Performance issues
4. Funcionalidades faltantes
5. Bugs identificados
6. Recomendações de priorização
7. Próximos passos para finalização

ENTREGA ESPERADA:
- Arquivo JSON estruturado com todos os resultados
- Documentação em Markdown
- Diagramas em Mermaid (embarcados em MD)
- Checklist interativo para remediação

FRAMEWORK: Use Sentient-AGI/ROMA (HTTP local + Python)
RECURSOS: Apenas Docker, Python, HTTP - SEM APIs externas
🔧 EXECUÇÃO PASSO-A-PASSO
Passo 1: Preparar o Copilot (VS Code)
bash
# Abra VS Code na pasta raiz do monorepo
cd /caminho/para/ouvify

# Pressione: Ctrl+Shift+P (ou Cmd+Shift+P no Mac)
# Busque: "Copilot: Open Chat"
# Ou clique no ícone do Copilot na barra lateral
Passo 2: Executar Análise em Etapas
Dividir em múltiplos prompts para melhor processamento:

Prompt 1 - Estrutura e Integridade
text
AUDITORIA OUVIFY - ETAPA 1: ESTRUTURA

Analisar o repositório e fornecer:
1. Árvore de pastas estruturada
2. Arquivos duplicados ou redundantes
3. Dependências não utilizadas (dead code)
4. Erros de import/require
5. Arquivo JSON com mapeamento completo

Formato de saída: JSON estruturado
Prompt 2 - Segurança
text
AUDITORIA OUVIFY - ETAPA 2: SEGURANÇA

Fazer scan de segurança:
1. Validação de entrada (todas as rotas)
2. Vulnerabilidades OWASP Top 10
3. Credenciais ou tokens expostos
4. Rate limiting implementado?
5. CORS configurado corretamente?
6. SQL Injection vulnerabilities
7. XSS vulnerabilities

Criticidade: CRÍTICA, ALTA, MÉDIA, BAIXA
Prompt 3 - Performance
text
AUDITORIA OUVIFY - ETAPA 3: PERFORMANCE

Analisar performance:
1. N+1 Query Problems
2. Índices de banco de dados
3. Caching strategy
4. Bundle size do frontend
5. Lazy loading implementado?
6. Gargalos identificados

Recomendações para otimização
Prompt 4 - Funcionalidades
text
AUDITORIA OUVIFY - ETAPA 4: FUNCIONALIDADES

Mapear features:
1. CRUD de Feedback (Status: ✓/✗)
2. Sistema de Rastreamento (Status: ✓/✗)
3. Autenticação (Status: ✓/✗)
4. Multi-tenancy (Status: ✓/✗)
5. Notificações (Status: ✓/✗)
6. Relatórios (Status: ✓/✗)
7. Gestão de permissões (Status: ✓/✗)

Funcionalidades faltantes com impacto
Prompt 5 - Documentação (Template)
text
AUDITORIA OUVIFY - ETAPA 5: DOCUMENTAÇÃO

Gerar documentação baseado no código:

1. README.md - Setup e overview
2. ARCHITECTURE.md - Diagrama e decisões
3. API_DOCUMENTATION.md - Todos os endpoints
4. USER_GUIDE.md - Como usar
5. ADMIN_GUIDE.md - Administração
6. TROUBLESHOOTING.md - Problemas comuns
7. SECURITY.md - Boas práticas

Use Markdown + Mermaid para diagramas
Passo 3: Integração com ROMA Framework
bash
# Crie uma pasta para reports
mkdir -p ./audit-reports

# Dentro da pasta, crie um script Python para processar resultados
cat > ./audit-reports/process_audit.py << 'EOF'
import json
import os
from datetime import datetime

class AuditProcessor:
    def __init__(self, audit_data):
        self.audit_data = audit_data
        self.timestamp = datetime.now().isoformat()
    
    def generate_report(self):
        report = {
            "timestamp": self.timestamp,
            "project": "Ouvify",
            "audit_results": self.audit_data,
            "recommendations": self.prioritize_issues()
        }
        return report
    
    def prioritize_issues(self):
        # Priorizar vulnerabilidades críticas
        critical = [issue for issue in self.audit_data 
                   if issue.get("severity") == "CRITICAL"]
        return sorted(critical, key=lambda x: x.get("impact", 0), reverse=True)
    
    def export_json(self, filename="audit_report.json"):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.generate_report(), f, indent=2, ensure_ascii=False)
        print(f"✓ Relatório exportado: {filename}")

# Uso:
# data = json.load(open("audit_data.json"))
# processor = AuditProcessor(data)
# processor.export_json()
EOF

python ./audit-reports/process_audit.py
📋 CHECKLIST DE EXECUÇÃO
Fase 1: Preparação
 Repository clonado localmente

 VS Code aberto na pasta raiz

 Copilot ativado e funcionando

 ROMA Framework verificado

Fase 2: Análise (Executar em ordem)
 Etapa 1: Estrutura e Integridade

 Etapa 2: Segurança

 Etapa 3: Performance

 Etapa 4: Funcionalidades

 Etapa 5: Conformidade

Fase 3: Documentação
 README.md gerado

 ARCHITECTURE.md gerado

 API_DOCUMENTATION.md gerado

 USER_GUIDE.md gerado

 ADMIN_GUIDE.md gerado

 TROUBLESHOOTING.md gerado

 SECURITY.md gerado

Fase 4: Relatórios
 JSON de resultados gerado

 Issues priorizadas

 Recomendações documentadas

 Checklist de remediação criado

🎯 RESULTADOS ESPERADOS
Após executar a auditoria completa, você terá:

1. Diagnóstico Técnico
Status de cada componente (funcional/não-funcional)

Vulnerabilidades críticas identificadas

Problemas de performance com impacto

Funcionalidades faltantes mapeadas

2. Documentação Completa
7 documentos Markdown estruturados

Diagramas de arquitetura (Mermaid)

Exemplos de uso

Guias passo-a-passo

3. Plano de Ação
Priorização de tarefas

Estimativa de esforço

Roadmap para finalização

KPIs de qualidade

4. Relatório Executivo
% de completude do projeto

Risco técnico (baixo/médio/alto)

Timeline estimada para produção

Recomendações estratégicas

🚀 PRÓXIMAS ETAPAS
Corrigir Vulnerabilidades Críticas (Segurança)

Implementar Features Faltantes (Funcionalidade)

Adicionar Testes (Qualidade)

Otimizar Performance (Performance)

Implementar Conformidade (LGPD/GDPR)

Preparar Produção (Deploy)

📞 SUPORTE
Se encontrar dúvidas:

Consulte TROUBLESHOOTING.md

Revise SECURITY.md para boas práticas

Analise ARCHITECTURE.md para decisões técnicas

Gerado em: Fevereiro 2026
Projeto: Ouvify White Label SaaS
Status: Plano de Auditoria Completa

