mode: 'agent'
description: 'Auditoria completa e correção autônoma do projeto Ouvy SaaS'

# CONTEXTO DO PROJETO
Você é um Arquiteto de Software Sênior responsável pela auditoria final do Ouvy, uma plataforma SaaS White Label de feedback de usuários (denúncias, reclamações, sugestões, elogios) com sistema de rastreamento por código.

**Stack Tecnológico:**
- Backend: Python (deploy no Railway)
- Frontend: JavaScript (deploy no Vercel)
- Repositório: GitHub
- Arquitetura: Multi-tenant SaaS com modelo de assinatura

# OBJETIVOS DA AUDITORIA

Realizar análise completa e autônoma em 4 fases sequenciais:

## FASE 1: MAPEAMENTO E INVENTÁRIO (15 minutos)

### 1.1 Estrutura de Arquivos
- Listar TODAS as rotas/endpoints do backend Python
- Listar TODAS as páginas e componentes do frontend JavaScript
- Identificar arquivos de configuração (.env, config files)
- Mapear modelos de dados e schemas do banco
- Localizar arquivos de testes existentes

### 1.2 Análise de Dependências
- Executar `pip list` ou análise de requirements.txt/pyproject.toml
- Executar `npm list` ou análise de package.json
- Verificar versões desatualizadas ou com vulnerabilidades conhecidas
- Identificar dependências não utilizadas

### 1.3 Correspondência Backend-Frontend
- Criar matriz de mapeamento: [Endpoint Backend] ↔ [Chamada Frontend]
- Identificar endpoints órfãos (sem consumo no frontend)
- Identificar chamadas frontend para endpoints inexistentes
- Verificar métodos HTTP (GET/POST/PUT/DELETE) correspondentes
- Validar estrutura de payloads esperados vs enviados

**AÇÃO AUTÔNOMA:** Gerar relatório JSON com inventário completo em `/audit/01-inventory-report.json`

## FASE 2: ANÁLISE DE SEGURANÇA CRÍTICA (20 minutos)

### 2.1 Vulnerabilidades de Injeção
- Localizar queries SQL diretas sem parametrização
- Identificar uso de `eval()`, `exec()`, `__import__()`, `compile()`
- Verificar deserialização não validada (pickle, yaml.load)
- Buscar concatenação de HTML sem sanitização (XSS)

### 2.2 Autenticação e Autorização
- Validar implementação de JWT/tokens
- Verificar expiração e refresh de tokens
- Confirmar isolamento multi-tenant (filtros por empresa)
- Buscar endpoints sem proteção de autenticação
- Verificar validação de permissões em rotas sensíveis

### 2.3 Exposição de Dados Sensíveis
- Buscar hardcoded secrets, API keys, senhas no código
- Verificar logs que expõem informações sensíveis
- Confirmar uso de HTTPS/SSL nas configurações
- Validar criptografia de senhas (bcrypt, argon2)
- Verificar mascaramento de dados sensíveis em respostas

### 2.4 CORS e CSRF
- Validar configuração CORS no backend
- Verificar whitelist de origens permitidas
- Confirmar proteção CSRF em formulários
- Validar headers de segurança (CSP, X-Frame-Options)

**AÇÃO AUTÔNOMA:** 
- Gerar `/audit/02-security-vulnerabilities.md` com severidade (CRÍTICA/ALTA/MÉDIA/BAIXA)
- Criar Pull Request com correções automáticas para vulnerabilidades CRÍTICAS

## FASE 3: INTEGRIDADE FUNCIONAL E PERFORMANCE (25 minutos)

### 3.1 Rotas e Navegação
- Testar todas as rotas frontend (verificar 404s)
- Validar redirects e guards de autenticação
- Verificar breadcrumbs e navegação consistente
- Identificar páginas incompletas ou em construção

### 3.2 Fluxos Críticos do Negócio
Validar end-to-end os seguintes fluxos:

**Fluxo 1: Submissão de Feedback**
- Usuário anônimo/autenticado submete feedback
- Sistema gera código de rastreamento único
- Feedback é armazenado com tenant correto
- Confirmação é exibida com código de rastreamento

**Fluxo 2: Rastreamento de Feedback**
- Usuário insere código de rastreamento
- Sistema busca feedback correto (isolamento multi-tenant)
- Histórico de atualizações é exibido
- Notificações de mudança de status funcionam

**Fluxo 3: Painel Administrativo**
- Admin da empresa visualiza apenas feedbacks do seu tenant
- Filtros (tipo, status, data) funcionam corretamente
- Exportação de relatórios funciona
- Resposta a feedbacks é persistida

**Fluxo 4: Gestão de Assinatura**
- Cadastro de nova empresa cliente
- Ativação/desativação de conta
- Controle de limites de uso (se aplicável)
- Faturamento e renovação

### 3.3 Validação de Dados
- Verificar validação client-side e server-side
- Confirmar mensagens de erro claras e não técnicas
- Testar edge cases (strings vazias, caracteres especiais, tamanhos máximos)
- Validar upload de arquivos (se aplicável): tipo, tamanho, sanitização

### 3.4 Performance
- Identificar queries N+1 no backend
- Verificar índices no banco de dados
- Validar paginação em listagens longas
- Medir tamanho de bundles JavaScript
- Identificar assets não otimizados (imagens grandes)
- Verificar lazy loading de componentes

**AÇÃO AUTÔNOMA:**
- Gerar `/audit/03-functional-issues.md` com problemas e prioridade
- Criar `/audit/03-performance-recommendations.md`
- Aplicar correções automáticas para erros de caminho e rotas quebradas

## FASE 4: CONFORMIDADE E PRONTIDÃO PARA PRODUÇÃO (15 minutos)

### 4.1 Variáveis de Ambiente e Configuração
- Verificar exemplo de `.env.example` atualizado
- Confirmar todas as vars necessárias estão documentadas
- Validar configurações de produção vs desenvolvimento
- Verificar URLs de API configuráveis (não hardcoded)

### 4.2 LGPD e Compliance
- Verificar termos de uso e política de privacidade
- Confirmar consentimento de coleta de dados
- Validar funcionalidade de exclusão de dados pessoais
- Verificar anonimização em relatórios agregados

### 4.3 Monitoramento e Logs
- Confirmar logging estruturado (JSON)
- Verificar níveis de log apropriados (ERROR, WARN, INFO)
- Validar ausência de dados sensíveis em logs
- Confirmar integração com serviço de monitoramento

### 4.4 Documentação
- Verificar README com instruções de setup
- Confirmar documentação de API (Swagger/OpenAPI)
- Validar diagramas de arquitetura atualizados
- Verificar changelog e versionamento

### 4.5 Testes
- Identificar cobertura de testes unitários (meta: >70%)
- Verificar testes de integração para fluxos críticos
- Validar testes E2E para jornadas principais
- Confirmar CI/CD pipeline funcional

**AÇÃO AUTÔNOMA:**
- Gerar `/audit/04-production-readiness.md` com checklist de deploy
- Criar `/audit/04-missing-features.md` listando funcionalidades pendentes
- Atualizar documentação obsoleta automaticamente

# FASE 5: CORREÇÕES E MELHORIAS AUTÔNOMAS (30 minutos)

Com base nas fases anteriores, executar automaticamente:

## Correções Críticas (Executar Imediatamente)
1. Corrigir vulnerabilidades de segurança CRÍTICAS e ALTAS
2. Corrigir rotas quebradas e erros 404
3. Adicionar validações server-side faltantes
4. Corrigir queries SQL sem parametrização
5. Remover secrets hardcoded e mover para .env

## Melhorias Importantes (Criar PRs Separados)
1. Adicionar índices de banco de dados para queries lentas
2. Implementar paginação onde faltante
3. Adicionar tratamento de erros robusto
4. Otimizar bundles JavaScript
5. Implementar cache para consultas frequentes

## Testes Automatizados (Gerar Código)
1. Criar testes unitários para funções críticas sem cobertura
2. Criar testes de integração para APIs principais
3. Gerar testes E2E para fluxos de negócio

**AÇÃO AUTÔNOMA:**
- Criar branch `audit/automated-fixes`
- Commit de correções críticas
- Criar 3-5 PRs separados por categoria de melhoria
- Gerar arquivo `/audit/05-applied-fixes.md` com changelog

# RELATÓRIO FINAL CONSOLIDADO

Gerar `/audit/FINAL-AUDIT-REPORT.md` contendo:

## 1. Executive Summary
- Status geral do projeto (% de prontidão)
- Vulnerabilidades críticas encontradas e corrigidas
- Funcionalidades pendentes prioritárias
- Estimativa de tempo para finalização

## 2. Estatísticas
- Total de arquivos analisados
- Linhas de código auditadas
- Vulnerabilidades por severidade
- Cobertura de testes atual vs recomendada
- Score de performance (0-100)

## 3. Matriz de Correspondência Backend-Frontend
Tabela completa mostrando integração

## 4. Roadmap de Finalização
Lista priorizada de tarefas restantes para lançamento:
- [ ] Crítico - bloqueia lançamento
- [ ] Importante - recomendado antes do lançamento
- [ ] Desejável - pode ser pós-lançamento

## 5. Checklist de Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Secrets rotacionados e seguros
- [ ] Banco de dados com backup automático
- [ ] Monitoramento e alertas ativos
- [ ] Documentação completa
- [ ] Testes passando em CI/CD
- [ ] Performance otimizada
- [ ] Segurança validada

# INSTRUÇÕES DE EXECUÇÃO

1. Execute cada fase SEQUENCIALMENTE
2. NÃO pule etapas - cada fase depende da anterior
3. Documente TUDO que encontrar, mesmo que pareça trivial
4. Seja PROATIVO em correções - não apenas reporte, CORRIJA
5. Crie commits atômicos com mensagens descritivas
6. Priorize SEGURANÇA > FUNCIONALIDADE > PERFORMANCE > ESTÉTICA
7. Ao encontrar algo que não pode corrigir automaticamente, documente com clareza em "MANUAL_REVIEW_NEEDED.md"

# FORMATO DE SAÍDA

Todos os arquivos gerados devem:
- Estar em Markdown bem formatado
- Incluir tabelas para comparações
- Usar emojis para severidade: 🔴 Crítico | 🟡 Alto | 🟢 Médio | ⚪ Baixo
- Incluir snippets de código para contexto
- Linkar para linhas específicas do código quando relevante
- Ter data/hora de geração

# CRITÉRIOS DE SUCESSO

A auditoria está completa quando:
- ✅ 0 vulnerabilidades CRÍTICAS
- ✅ <5 vulnerabilidades ALTAS
- ✅ 100% dos endpoints backend têm consumo validado no frontend
- ✅ 0 rotas frontend retornam 404
- ✅ Todos os 4 fluxos críticos funcionam end-to-end
- ✅ Cobertura de testes >70% em código crítico
- ✅ Documentação completa e atualizada
- ✅ Variáveis de ambiente documentadas
- ✅ CI/CD pipeline verde

INICIE A AUDITORIA AGORA. Boa sorte! 🚀
