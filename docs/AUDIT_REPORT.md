# 📋 Relatório de Auditoria - Estrutura do Projeto Ouvy
**Data:** 23 de Janeiro de 2026  
**Auditor:** GitHub Copilot (Claude Sonnet 4.5)

## 🗂️ Estrutura Atual Identificada

### node_modules encontrados:
- ✅ `/ouvy_frontend/node_modules/` (1.0GB)
- ❌ Múltiplos node_modules nested dentro de packages (problema!)
- ✅ Nenhum node_modules na raiz (correto por enquanto)

### package.json encontrados:
- ✅ `/package.json` (raiz - workspace root)
- ✅ `/ouvy_frontend/package.json` (app frontend)
- ⚠️  `/ouvy_frontend/.next/package.json` (gerado pelo build)
- ❌ Nenhum `/ouvy_saas/package.json` (não necessário para Python)

### Lockfiles encontrados:
- ✅ `/package-lock.json` (raiz)
- ⚠️  Possível lockfile duplicado em ouvy_frontend

### .gitignore encontrados:
- ✅ `/.gitignore` (raiz)
- ✅ `/ouvy_frontend/.gitignore` (redundante)
- ⚠️  `/.pytest_cache/.gitignore` (gerado automaticamente)
- ⚠️  `/venv/.gitignore` (venv local - deve estar em .gitignore)

### Arquivos Python Redundantes:
- ❌ **802 diretórios __pycache__** (CRÍTICO!)
- ⚠️  Estimativa: ~3000+ arquivos *.pyc

### Tamanho dos Diretórios:
```
Total:          1.5GB
Frontend:       1.0GB (67% do total)
Backend:        210MB (14% do total)
Outros:         ~290MB (cache, builds, etc)
```

## 🔍 Problemas Identificados

### ❌ Críticos (Resolver Imediatamente):

1. **802 diretórios __pycache__** 
   - Impacto: Aumenta tamanho do repo, lentidão no git
   - Solução: Remover todos e adicionar ao .gitignore

2. **venv/ no repositório**
   - Impacto: Ambiente virtual no git (não deveria estar)
   - Solução: Adicionar ao .gitignore e remover do git

3. **Estrutura não está em monorepo real**
   - Impacto: `ouvy_saas` e `ouvy_frontend` na raiz
   - Solução: Mover para `apps/backend` e `apps/frontend`

### ⚠️  Médios (Resolver esta Semana):

1. **Múltiplos .gitignore**
   - `/ouvy_frontend/.gitignore` duplica regras da raiz
   - Solução: Consolidar em um único .gitignore

2. **Falta estrutura de packages compartilhados**
   - Não existe `packages/types`, `packages/ui`, etc.
   - Solução: Criar estrutura de packages

3. **Turborepo não está totalmente configurado**
   - `turbo.json` existe mas não está otimizado
   - Solução: Revisar e otimizar configuração

### ℹ️  Baixos (Melhorias):

1. **Documentação dispersa**
   - Docs em vários locais
   - Solução: Consolidar em `docs/`

2. **Scripts não estão organizados**
   - Scripts em raiz e subdiretórios
   - Solução: Mover todos para `scripts/`

## ✅ Estrutura Ideal Recomendada

```
ouvy-saas/
├── package.json              # Workspace root
├── package-lock.json         # Lockfile único
├── turbo.json                # Turborepo config
├── .gitignore                # Consolidado
├── docker-compose.yml
├── Makefile
├── README.md
│
├── apps/
│   ├── backend/             # Django (mover de ouvy_saas/)
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── apps/
│   │   └── config/
│   │
│   └── frontend/            # Next.js (mover de ouvy_frontend/)
│       ├── package.json
│       ├── app/
│       ├── components/
│       └── lib/
│
├── packages/               # Código compartilhado
│   ├── types/             # @ouvy/types
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   │
│   ├── ui/                # @ouvy/ui (componentes)
│   │   ├── package.json
│   │   └── src/
│   │
│   └── config/            # @ouvy/config
│       ├── package.json
│       └── src/
│
├── docs/                  # Documentação consolidada
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
│
├── scripts/               # Scripts organizados
│   ├── cleanup.sh
│   ├── restructure.sh
│   ├── validate-migration.sh
│   └── update-references.sh
│
├── monitoring/            # Prometheus/Grafana (já existe)
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
│
└── .husky/               # Git hooks (já existe)
    ├── pre-commit
    ├── commit-msg
    └── pre-push
```

## 📝 Plano de Ação

### Fase 1: Backup e Limpeza (30min) ✅
- [x] Criar branch: `git checkout -b refactor/monorepo-consolidation`
- [ ] Backup: `tar -czf backup-pre-consolidation-$(date +%Y%m%d).tar.gz .`
- [ ] Remover __pycache__ (802 diretórios)
- [ ] Remover venv/ do git
- [ ] Commit checkpoint

### Fase 2: Criar Scripts (15min)
- [ ] `scripts/cleanup.sh`
- [ ] `scripts/restructure.sh`
- [ ] `scripts/update-references.sh`
- [ ] `scripts/validate-migration.sh`

### Fase 3: Reestruturação (2h)
- [ ] Criar estrutura `apps/` e `packages/`
- [ ] Mover `ouvy_saas/` → `apps/backend/`
- [ ] Mover `ouvy_frontend/` → `apps/frontend/`
- [ ] Criar `packages/types/`
- [ ] Consolidar .gitignore

### Fase 4: Atualizar Configurações (1h)
- [ ] Atualizar `docker-compose.yml`
- [ ] Atualizar `Makefile`
- [ ] Atualizar `turbo.json`
- [ ] Atualizar `package.json` raiz
- [ ] Atualizar CI/CD workflows

### Fase 5: Validação (30min)
- [ ] `npm install` (reinstalar dependências)
- [ ] `npm run build` (testar builds)
- [ ] `make up` (testar Docker)
- [ ] Executar testes
- [ ] Validar migration script

### Fase 6: Finalização (30min)
- [ ] Remover diretórios antigos (após validação)
- [ ] Atualizar documentação
- [ ] Commit final
- [ ] Abrir Pull Request

## 📊 Estimativas

| Fase | Tempo Estimado | Status |
|------|---------------|--------|
| Auditoria | 30min | ✅ COMPLETO |
| Limpeza | 30min | ⏳ Pendente |
| Reestruturação | 2h | ⏳ Pendente |
| Configuração | 1h | ⏳ Pendente |
| Validação | 30min | ⏳ Pendente |
| Finalização | 30min | ⏳ Pendente |
| **TOTAL** | **~5h** | **20% Completo** |

## 🎯 Benefícios Esperados

✅ **Redução de 802 → 0** diretórios __pycache__  
✅ **Redução ~200MB** de cache Python desnecessário  
✅ **Estrutura monorepo clara** (apps/ e packages/)  
✅ **Builds mais rápidos** com Turborepo otimizado  
✅ **Manutenção simplificada** (tudo organizado)  
✅ **Código compartilhado** entre apps (packages/)  
✅ **Melhor DX** (Developer Experience)

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebrar Docker | Média | Alto | Backup + validação antes |
| Perder arquivos | Baixa | Crítico | Backup completo + git |
| Referências quebradas | Alta | Médio | Script update-references.sh |
| CI/CD falhar | Média | Alto | Atualizar workflows |

## 📋 Checklist de Validação

### Antes de Merge:
- [ ] Todos os testes passam
- [ ] Docker sobe sem erros
- [ ] Frontend acessível (localhost:3000)
- [ ] Backend acessível (localhost:8000)
- [ ] API docs funcionam (/api/docs/)
- [ ] Admin Django funciona (/admin/)
- [ ] Nenhum __pycache__ presente
- [ ] Apenas 1 node_modules (na raiz)
- [ ] CI/CD pipeline passa

### Pós-Merge:
- [ ] Deploy staging funciona
- [ ] Monitoramento ativo
- [ ] Equipe notificada
- [ ] Documentação atualizada

---

**Próximo Passo:** Executar `scripts/cleanup.sh`
