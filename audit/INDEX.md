# 📚 Índice de Documentação - Ouvify

**Última atualização:** 05/02/2026  
**Status:** Documentação MVP Completa ✅

---

## 🎯 Início Rápido

### Para Desenvolvedores
1. Comece por [AUDIT_REPORT.md](AUDIT_REPORT.md) - visão geral completa do sistema
2. Veja [MVP_BACKLOG.md](MVP_BACKLOG.md) - o que precisa ser feito antes do MVP
3. Consulte [/docs/RUNBOOK.md](../docs/RUNBOOK.md) - operações do dia-a-dia

### Para Usuários Finais
1. [Guia do Usuário](../docs/USER_GUIDE_END_USER.md) - como enviar e acompanhar feedbacks

### Para Administradores de Empresas
1. [Guia do Admin](../docs/USER_GUIDE_COMPANY_ADMIN.md) - gerenciar sua conta, equipe e feedbacks

---

## 📊 Auditoria e Relatórios

### Relatórios Principais

| Documento | Descrição | Status | Linhas |
|-----------|-----------|--------|--------|
| **[AUDIT_REPORT.md](AUDIT_REPORT.md)** | Relatório completo da auditoria ROMA | ✅ Completo | 650+ |
| **[MVP_BACKLOG.md](MVP_BACKLOG.md)** | Backlog priorizado P0/P1/P2/P3 | ✅ Completo | 400+ |
| **[AUDIT_PLAN.md](AUDIT_PLAN.md)** | Plano de auditoria ROMA (atomização) | ✅ Completo | 200+ |

### Evidence Logs (Dados Brutos)

| Arquivo | Descrição | Data | Linhas |
|---------|-----------|------|--------|
| **[evidence/inventory.log](evidence/inventory.log)** | Inventário completo do monorepo | 05/02/26 | 262 |
| **[evidence/integrity.log](evidence/integrity.log)** | Análise de duplicações, dead code | 05/02/26 | 180+ |
| **[evidence/backend.log](evidence/backend.log)** | Auditoria backend (Django apps) | 05/02/26 | 195 |
| **[evidence/frontend.log](evidence/frontend.log)** | Auditoria frontend (Next.js) | 05/02/26 | 150+ |
| **[evidence/security.log](evidence/security.log)** | Testes de segurança (parcial) | 05/02/26 | 80+ |

---

## 📖 Documentação Técnica

### Arquitetura e Design

| Documento | Descrição | Localização |
|-----------|-----------|-------------|
| **ARCHITECTURE.md** | Visão geral da arquitetura | [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) |
| **DATABASE.md** | Schema do PostgreSQL | [/docs/DATABASE.md](../docs/DATABASE.md) |
| **API.md** | Endpoints REST da API | [/docs/API.md](../docs/API.md) |
| **SECURITY.md** | Práticas de segurança | [/docs/SECURITY.md](../docs/SECURITY.md) |

### Operações (DevOps/SRE)

| Documento | Descrição | Localização | Status |
|-----------|-----------|-------------|--------|
| **RUNBOOK.md** | Operações, monitoramento, incidentes | [/docs/RUNBOOK.md](../docs/RUNBOOK.md) | ✅ Novo |
| **DEPLOYMENT.md** | Procedimentos de deploy | [/docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) | - |
| **SETUP.md** | Setup local e de produção | [/docs/SETUP.md](../docs/SETUP.md) | - |

### Guias do Usuário

| Documento | Audiência | Localização | Status |
|-----------|-----------|-------------|--------|
| **USER_GUIDE_END_USER.md** | Usuários finais (enviar feedback) | [/docs/USER_GUIDE_END_USER.md](../docs/USER_GUIDE_END_USER.md) | ✅ Novo |
| **USER_GUIDE_COMPANY_ADMIN.md** | Admins de empresas | [/docs/USER_GUIDE_COMPANY_ADMIN.md](../docs/USER_GUIDE_COMPANY_ADMIN.md) | ✅ Novo |

---

## 🛠️ Scripts de Auditoria

### Scripts Disponíveis

Todos em [/tools/audit/](../../tools/audit/)

| Script | Descrição | Uso |
|--------|-----------|-----|
| **run_all.sh** | Executa todas as auditorias | `./tools/audit/run_all.sh` |
| **audit_inventory.sh** | Inventário do monorepo | `./tools/audit/audit_inventory.sh` |
| **audit_integrity.sh** | Duplicações, dead code | `./tools/audit/audit_integrity.sh` |
| **audit_security.sh** | CVEs, secrets, SAST | `./tools/audit/audit_security.sh` |
| **audit_backend.sh** | Auditoria backend (Django) | `./tools/audit/audit_backend.sh` |
| **audit_frontend.sh** | Auditoria frontend (Next.js) | `./tools/audit/audit_frontend.sh` |
| **audit_performance.sh** | Performance, bundle size | `./tools/audit/audit_performance.sh` |
| **roma_bootstrap.sh** | Subir ROMA server local | `./tools/audit/roma_bootstrap.sh` |

### Como Executar

```bash
# Navegar até a raiz do monorepo
cd /workspaces/Ouvify

# Dar permissão de execução (primeira vez)
chmod +x tools/audit/*.sh

# Executar auditoria completa
./tools/audit/run_all.sh

# Ou executar individual
./tools/audit/audit_security.sh

# Ver logs em tempo real
tail -f audit/evidence/*.log
```

---

## 📋 Documentos Adicionais

### Auditorias Antigas (Referência)

| Arquivo | Data | Descrição |
|---------|------|-----------|
| AUDIT_REPORT_2026-01-31.md | 31/01/26 | Auditoria anterior (pré-ROMA) |
| AUDITORIA_SEGURANCA_2026-02-05.md | 05/02/26 | Foco em segurança |
| DESIGN_AUDIT_REPORT.md | - | Auditoria de UI/UX |
| FINALIZATION_REPORT.md | - | Relatório de finalização |

### Planos e Checklists

| Arquivo | Descrição |
|---------|-----------|
| ACTION_PLAN.md | Plano de ação geral |
| LAUNCH_CHECKLIST.md | Checklist para lançamento |
| DEPLOY_AUDIT.md | Auditoria de deploy |
| SECURITY_FIX_PLAN.md | Plano de correções de segurança |

---

## 🔍 Descobrir Documentação

### Por Tópico

**Segurança:**
- [AUDIT_REPORT.md](AUDIT_REPORT.md#7-segurança) - Seção 7
- [/docs/SECURITY.md](../docs/SECURITY.md)
- [evidence/security.log](evidence/security.log)
- [MVP_BACKLOG.md](MVP_BACKLOG.md) - P1-001, P1-003

**Performance:**
- [AUDIT_REPORT.md](AUDIT_REPORT.md#8-performance) - Seção 8
- [MVP_BACKLOG.md](MVP_BACKLOG.md) - P2-001

**LGPD/Privacidade:**
- [AUDIT_REPORT.md](AUDIT_REPORT.md#9-lgpd) - Seção 9
- [USER_GUIDE_END_USER.md](../docs/USER_GUIDE_END_USER.md#7-privacidade-e-segurança)
- [MVP_BACKLOG.md](MVP_BACKLOG.md) - P2-005

**Deploy/DevOps:**
- [/docs/RUNBOOK.md](../docs/RUNBOOK.md)
- [AUDIT_REPORT.md](AUDIT_REPORT.md#10-deploy) - Seção 10
- [/docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

**Multi-tenancy:**
- [AUDIT_REPORT.md](AUDIT_REPORT.md#3-inventário) - Seção 3.2
- [/apps/backend/README_MULTITENANCY.md](../../apps/backend/README_MULTITENANCY.md)

### Por Persona

**👨‍💻 Sou Desenvolvedor:**
1. [AUDIT_REPORT.md](AUDIT_REPORT.md) - entender o sistema
2. [MVP_BACKLOG.md](MVP_BACKLOG.md) - ver o que precisa ser feito
3. [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - arquitetura detalhada
4. [/docs/DATABASE.md](../docs/DATABASE.md) - schema do banco
5. [/docs/API.md](../docs/API.md) - endpoints disponíveis

**🔧 Sou SRE/DevOps:**
1. [/docs/RUNBOOK.md](../docs/RUNBOOK.md) - operações do dia-a-dia
2. [AUDIT_REPORT.md](AUDIT_REPORT.md) - visão geral de saúde do sistema
3. [/docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) - deploy
4. [evidence/*.log](evidence/) - logs de auditoria

**📊 Sou Product Manager:**
1. [AUDIT_REPORT.md](AUDIT_REPORT.md) - status geral (88% → 92% completo)
2. [MVP_BACKLOG.md](MVP_BACKLOG.md) - o que falta para MVP (P0/P1/P2/P3)
3. [USER_GUIDE_*.md](../docs/) - documentação para usuários

**👤 Sou Usuário Final:**
1. [USER_GUIDE_END_USER.md](../docs/USER_GUIDE_END_USER.md) - como usar o sistema

**👨‍💼 Sou Admin de Empresa:**
1. [USER_GUIDE_COMPANY_ADMIN.md](../docs/USER_GUIDE_COMPANY_ADMIN.md) - gerenciar conta

---

## 📊 Estatísticas da Documentação

### Métricas Gerais

- **Total de documentos:** 20+ (incluindo logs)
- **Total de linhas:** ~5000+
- **Cobertura:** 95% dos fluxos principais documentados
- **Idioma:** Português (PT-BR)
- **Formato:** Markdown (.md)

### Por Categoria

| Categoria | Documentos | Status |
|-----------|------------|--------|
| **Auditoria** | 6 | ✅ Completo |
| **Técnica** | 8 | ⚠️ Parcial (faltam ADRs) |
| **Operacional** | 3 | ✅ Completo |
| **Usuário** | 2 | ✅ Completo |
| **Scripts** | 8 | ✅ Completo |

### Completude por Seção (AUDIT_REPORT.md)

| Seção | Completude |
|-------|------------|
| 1. Inventário | 100% ✅ |
| 2. Integridade | 100% ✅ |
| 3. Backend | 95% ✅ |
| 4. Frontend | 95% ✅ |
| 5. Deploy | 90% ✅ |
| 6. Testes | 85% ⚠️ |
| 7. Segurança | 90% ✅ |
| 8. Performance | 85% ⚠️ |
| 9. LGPD | 95% ✅ |
| 10. Documentação | 95% ✅ |

---

## 🚀 Próximos Passos

### Para MVP (1-2 semanas)

Veja [MVP_BACKLOG.md](MVP_BACKLOG.md) para detalhes completos.

**P1 (Bloqueadores suaves):**
1. ~~Documentação completa~~ ✅ **FEITO**
2. 2FA em operações sensíveis (1 dia)
3. Rate limiting abrangente (4h)
4. Dependency audit (2h)

**P2 (Melhorias importantes):**
1. Otimizações de DB (1 dia)
2. Connection pooling PostgreSQL (2h)
3. httpOnly para tokens (30min)
4. LGPD retention automation (1 dia)
5. E2E tests CI (1 dia)

**P3 (Nice to have):**
1. Cleanup de .pyc e arquivos não usados (2h)
2. APM integration (4h)

---

## 📞 Suporte e Manutenção

### Atualizar Documentação

```bash
# 1. Editar documento relevante
vim docs/RUNBOOK.md

# 2. Atualizar data no cabeçalho
# **Última atualização:** DD/MM/YYYY

# 3. Commit com mensagem descritiva
git add docs/RUNBOOK.md
git commit -m "docs: atualizar procedimento de rollback no RUNBOOK"
git push origin main
```

### Re-executar Auditorias

```bash
# Auditoria completa (leva ~10-15min)
./tools/audit/run_all.sh

# Ou módulos individuais (mais rápido)
./tools/audit/audit_security.sh
./tools/audit/audit_performance.sh
```

### Contato

- **Equipe de Desenvolvimento:** dev@ouvify.com
- **SRE/DevOps:** sre@ouvify.com
- **Documentação Bug Reports:** GitHub Issues

---

**Última atualização deste índice:** 05/02/2026 20:20 UTC  
**Versão:** 1.0  
**Mantedor:** Time Ouvify
