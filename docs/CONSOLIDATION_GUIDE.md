# 🚀 Guia de Consolidação do Monorepo - Ouvify

## 📋 Visão Geral

Este guia fornece o passo a passo completo para consolidar a estrutura do projeto Ouvify de uma estrutura dispersa para um monorepo bem organizado.

## 🎯 Objetivos

- ✅ Reduzir 802 → 0 diretórios `__pycache__`
- ✅ Economizar ~200MB de espaço em disco
- ✅ Implementar estrutura de monorepo padrão
- ✅ Consolidar código compartilhado em `packages/`
- ✅ Melhorar Developer Experience (DX)
- ✅ Preparar para escalabilidade futura

## 📊 Situação Atual vs Desejada

### Atual (Problemática)
```
ouvy_saas/               # 1.5GB total
├── ouvy_saas/          # Backend disperso (210MB)
├── ouvy_frontend/      # Frontend disperso (1.0GB)
├── 802 __pycache__/    # 200MB de cache desnecessário
├── venv/               # Não deveria estar no git
└── 4 .gitignore        # Fragmentado
```

### Desejada (Organizada)
```
ouvy_saas/               # Reduzido
├── apps/
│   ├── backend/        # Django 6.0
│   └── frontend/       # Next.js 16
├── packages/
│   ├── types/          # TypeScript types
│   ├── ui/             # Componentes compartilhados
│   └── config/         # Configs compartilhados
├── docs/               # Documentação centralizada
├── monitoring/         # Prometheus, Grafana
└── scripts/            # Scripts de automação
```

## 📝 Scripts Disponíveis

Todos os scripts estão em `/scripts/` e são executáveis:

| Script | Função | Tempo | Destrutivo |
|--------|--------|-------|------------|
| `cleanup.sh` | Limpar cache, builds, backups | 30min | ⚠️ Sim |
| `restructure.sh` | Mover para apps/ | 2h | ⚠️ Sim |
| `update-references.sh` | Atualizar paths | 1h | ⚠️ Sim |
| `validate-migration.sh` | Validar migração | 30min | ❌ Não |
| `finalize-migration.sh` | Remover diretórios antigos | 30min | ⚠️ Sim |

## 🔄 Processo Completo (5 horas)

### ⚠️ PRÉ-REQUISITOS

```bash
# 1. Certifique-se de estar na branch correta
git checkout -b consolidate-monorepo

# 2. Commit ou stash todas as mudanças pendentes
git status
git add -A && git commit -m "chore: save work before consolidation"

# 3. Verificar espaço em disco (precisa ~2GB livre)
df -h .

# 4. Criar backup manual (opcional, mas recomendado)
tar -czf backup-manual-$(date +%Y%m%d).tar.gz \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    .
```

### 📍 FASE 1: Limpeza (30 minutos)

```bash
# Executar script de limpeza
./scripts/cleanup.sh

# O script irá:
# ✓ Criar backup automático (backup-YYYYMMDD_HHMMSS.tar.gz)
# ✓ Listar node_modules (não remove ainda)
# ✓ Remover 802 __pycache__/ (~200MB)
# ✓ Remover .next, dist, build, .turbo
# ✓ Remover venv/ do git (manter local)
# ✓ Atualizar .gitignore

# Verificar resultado
du -sh .
find . -name "__pycache__" -type d | wc -l  # Deve ser 0
```

**Commit:**
```bash
git add -A
git commit -m "chore: cleanup caches and build artifacts

- Remove 802 __pycache__ directories (~200MB)
- Clean .next, dist, build, .turbo
- Remove venv/ from git tracking
- Update .gitignore"
```

### 📍 FASE 2: Reestruturação (2 horas)

```bash
# Executar script de reestruturação
./scripts/restructure.sh

# O script irá:
# ✓ Criar apps/backend, apps/frontend
# ✓ Criar packages/types, packages/ui, packages/config
# ✓ Copiar ouvy_saas → apps/backend (com rsync)
# ✓ Copiar ouvy_frontend → apps/frontend (com rsync)
# ✓ Mover documentação para docs/

# Validar cópias
diff -r ouvy_saas apps/backend --brief
diff -r ouvy_frontend apps/frontend --brief
```

**⚠️ IMPORTANTE:** NÃO delete `ouvy_saas` e `ouvy_frontend` ainda!

### 📍 FASE 3: Atualização de Referências (1 hora)

```bash
# Executar script de atualização
./scripts/update-references.sh

# O script irá atualizar:
# ✓ docker-compose.yml (context, volumes)
# ✓ Makefile (comandos)
# ✓ README.md (paths)
# ✓ .github/workflows/*.yml (CI/CD)
# ✓ turbo.json (pipelines)

# Verificar mudanças
git diff docker-compose.yml
git diff Makefile
```

**Validar Docker Compose:**
```bash
docker-compose config  # Deve rodar sem erros
```

### 📍 FASE 4: Validação (30 minutos)

```bash
# Executar validação completa
./scripts/validate-migration.sh

# O script verifica:
# ✓ Estrutura de diretórios (apps/, packages/, docs/)
# ✓ Arquivos essenciais (package.json, docker-compose.yml)
# ✓ Diretórios antigos (ouvy_saas, ouvy_frontend)
# ✓ node_modules (idealmente 1 na raiz)
# ✓ __pycache__ (deve ser 0)
# ✓ Sintaxe de configs (docker-compose.yml, package.json)
# ✓ Ferramentas (npm, node, python)

# Deve terminar com: ✅ Validação concluída com sucesso!
```

**Testes adicionais:**
```bash
# 1. Instalar dependências
npm install

# 2. Testar builds
npm run build

# 3. Testar Docker
docker-compose up -d
docker-compose ps

# 4. Testar backend
cd apps/backend
python manage.py check
python manage.py test

# 5. Testar frontend
cd apps/frontend
npm run build
npm run start
```

### 📍 FASE 5: Finalização (30 minutos)

```bash
# ⚠️ ATENÇÃO: Esta fase é IRREVERSÍVEL
# Execute SOMENTE após validação completa

# Executar finalização
./scripts/finalize-migration.sh

# O script irá:
# ✓ Remover ouvy_saas/
# ✓ Remover ouvy_frontend/
# ✓ Remover backups .backup-*
# ✓ Atualizar .gitignore consolidado
# ✓ Fazer commit final

# Commit será:
# refactor: complete monorepo restructure
# 
# - Move backend: ouvy_saas → apps/backend
# - Move frontend: ouvy_frontend → apps/frontend
# - Create packages/ structure
# - Update all references
# - Consolidate .gitignore
# - Remove 802 __pycache__
# 
# BREAKING CHANGE: All paths updated
```

**Push e PR:**
```bash
git push origin consolidate-monorepo

# Abrir PR no GitHub/GitLab
# Título: "refactor: Complete Monorepo Restructure"
# Labels: breaking-change, refactor, infrastructure
```

## 🧪 Checklist de Validação

Use este checklist durante FASE 4:

### Estrutura
- [ ] `apps/backend/` existe e contém código Django
- [ ] `apps/frontend/` existe e contém código Next.js
- [ ] `packages/types/` criado
- [ ] `packages/ui/` criado
- [ ] `packages/config/` criado
- [ ] `docs/` contém CONTRIBUTING.md, ARCHITECTURE.md
- [ ] `monitoring/` contém Prometheus, Grafana
- [ ] `scripts/` contém scripts de consolidação

### Arquivos
- [ ] `package.json` na raiz (workspace)
- [ ] `turbo.json` configurado
- [ ] `docker-compose.yml` com paths corretos
- [ ] `Makefile` com comandos atualizados
- [ ] `.gitignore` consolidado
- [ ] `.github/workflows/` com paths corretos

### Limpeza
- [ ] 0 diretórios `__pycache__`
- [ ] 0 arquivos `.pyc`
- [ ] `venv/` fora do git
- [ ] `node_modules/` apenas na raiz (ou 1 em apps/frontend)

### Funcionalidade
- [ ] `npm install` roda sem erros
- [ ] `npm run build` roda sem erros
- [ ] `docker-compose config` roda sem erros
- [ ] `docker-compose up` sobe todos os serviços
- [ ] Backend responde em http://localhost:8000
- [ ] Frontend responde em http://localhost:3000
- [ ] Testes do backend passam
- [ ] Testes do frontend passam

### Git
- [ ] Branch `consolidate-monorepo` criada
- [ ] Commits bem descritos
- [ ] Sem arquivos grandes no histórico
- [ ] `.gitignore` funciona corretamente

## 🚨 Troubleshooting

### Problema: `docker-compose config` falha

**Solução:**
```bash
# Verificar sintaxe YAML
yamllint docker-compose.yml

# Verificar paths
grep -n "ouvy_saas\|ouvy_frontend" docker-compose.yml

# Deve retornar vazio (ou apenas comentários)
```

### Problema: `npm install` falha

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Problema: Testes falhando

**Solução:**
```bash
# Backend
cd apps/backend
python manage.py check
python manage.py migrate
python manage.py test --verbosity=2

# Frontend
cd apps/frontend
npm run test -- --verbose
```

### Problema: "Diretório não vazio" ao finalizar

**Solução:**
```bash
# Verificar diferenças
diff -r ouvy_saas apps/backend --brief
diff -r ouvy_frontend apps/frontend --brief

# Se tudo copiado, forçar remoção
rm -rf ouvy_saas ouvy_frontend
```

## 📈 Benefícios Esperados

Após conclusão:

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Diretórios __pycache__ | 802 | 0 | 100% |
| Tamanho do projeto | 1.5GB | ~1.2GB | -20% |
| Estrutura | Dispersa | Monorepo | ✨ |
| node_modules | 3+ | 1 | -67% |
| .gitignore | 4 | 1 | -75% |
| DX Score | 60/100 | 90/100 | +50% |

## 📚 Documentação Relacionada

- `AUDIT_REPORT.md` - Relatório completo da auditoria
- `docs/ARCHITECTURE.md` - Arquitetura do sistema
- `CONTRIBUTING.md` - Guia de contribuição
- `README.md` - Documentação principal

## 🆘 Suporte

Se encontrar problemas:

1. **Consultar AUDIT_REPORT.md** - Seção "Troubleshooting"
2. **Verificar logs** - `docker-compose logs -f`
3. **Reverter mudanças** - `git reset --hard HEAD~1`
4. **Restaurar backup** - `tar -xzf backup-YYYYMMDD_HHMMSS.tar.gz`

## ✅ Conclusão

Após executar todas as fases:

- ✅ Estrutura de monorepo implementada
- ✅ 802 __pycache__ removidos
- ✅ ~200MB economizados
- ✅ Código compartilhado em packages/
- ✅ CI/CD atualizado
- ✅ Docker funcionando
- ✅ Testes passando
- ✅ Documentação atualizada

**Próximos passos:**
1. Deploy em staging
2. Testar em produção
3. Monitorar métricas (Grafana)
4. Compartilhar com time

---

**Autor:** GitHub Copilot  
**Data:** $(date +%Y-%m-%d)  
**Versão:** 1.0.0
