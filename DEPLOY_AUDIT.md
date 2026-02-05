# 📋 Auditoria de Deploy - Ouvify

**Data:** 05/02/2026  
**Status:** 454 deployments ativos, configurações fragmentadas

---

## 🎯 Resumo Executivo

### Problemas Críticos Identificados

1. **454 deployments acumulados** no GitHub (47 Preview >7 dias)
2. **7 environments diferentes** com nomenclatura inconsistente
3. **3 plataformas configuradas** (Vercel, Railway, Render) mas uso indefinido
4. **Configurações duplicadas** de deploy
5. **Deployments não deletáveis** via API (criados por integração Vercel)

---

## 📊 Análise Detalhada

### 1. Deployments Atuais (últimos 20)

```
Environment        | Count | % do Total
-------------------|-------|------------
Preview            | 10    | 50%
Production         | 8     | 40%
main-ouvify-backend| 1     | 5%
main-ouvify-db     | 1     | 5%
```

**Total Histórico:** 454 deployments  
**Preview Antigos (>7 dias):** 47 deployments

### 2. GitHub Environments Configurados

```
✓ Preview                           [Vercel - Ativo]
✓ Production                        [Vercel - Ativo]
✓ main - ouvify-backend            [Railway - Ativo]
✓ main - ouvify-db                 [Railway - Ativo]
? Ouvify / production              [Origem desconhecida - Duplicado?]
? ouvy-saas / production           [Origem desconhecida - Legacy?]
? imaginative-learning / production [Origem desconhecida - Legacy?]
```

**Problema:** Múltiplos environments de "production" causando confusão.

### 3. Plataformas de Deploy

#### 🟢 Vercel (Frontend) - ATIVO

- **Arquivos:** `/vercel.json` + `/apps/frontend/vercel.json`
- **Região:** gru1 (São Paulo, Brasil)
- **Integração:** GitHub Auto-Deploy habilitado
- **Deploy:** Automático em TODOS os branches (causa dos 454 deployments)
- **Homepage:** https://frontend-six-rose-76.vercel.app
- **CSP:** Configurado com headers de segurança ✅
- **Proxy:** Backend → `https://ouvify-production.up.railway.app`

**Configuração atual:**

```json
{
  "github": {
    "enabled": true,
    "autoAlias": true, // ← Gera deploy em cada push
    "silent": false
  }
}
```

#### 🟢 Railway (Backend) - ATIVO

- **Integração:** GitHub Actions (`.github/workflows/backend-ci.yml`)
- **Deploy:** Automático APENAS na branch `main` ✅
- **URL:** https://ouvify-production.up.railway.app
- **Trigger:** Push para `main` após CI passar

**Configuração atual:**

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

#### 🟡 Render (Backend) - CONFIGURADO MAS INATIVO?

- **Arquivo:** `/render.yaml`
- **Branch:** `main`
- **Região:** Oregon (USA)
- **Status:** Configuração presente, mas sem evidência de uso
- **Serviços:** `ouvify-backend` + `ouvify-db`

**⚠️ Problema:** Arquivo `railway.json` está em `/apps/frontend/` mas deveria estar no backend.

### 4. GitHub Actions CI/CD

#### Backend CI/CD (`.github/workflows/backend-ci.yml`)

```yaml
on:
  push:
    branches: [main, develop]
    paths: ["apps/backend/**"]
  pull_request:
    branches: [main, develop]

jobs:
  - lint            ✓
  - security        ✓
  - test (3.11+3.12)✓
  - deploy          ✓ (só main)
```

#### Frontend CI/CD (`.github/workflows/frontend-ci.yml`)

```yaml
on:
  push:
    branches: [main, develop]
    paths: ["apps/frontend/**"]
  pull_request:
    branches: [main, develop]

jobs:
  - lint       ✓
  - security   ✓
  - test       ✓
  - build      ✓
  - e2e        ✓ (só PRs)
  - deploy     ✗ (Vercel faz via integração)
```

---

## 🔧 Plano de Consolidação

### Fase 1: Limpeza Imediata ⚡

#### 1.1. Remover Environments Legacy

```bash
# Deletar environments duplicados/órfãos
gh api -X DELETE /repos/jairguerraadv-sys/Ouvify/environments/imaginative-learning%20%2F%20production
gh api -X DELETE /repos/jairguerraadv-sys/Ouvify/environments/ouvy-saas%20%2F%20production
gh api -X DELETE /repos/jairguerraadv-sys/Ouvify/environments/Ouvify%20%2F%20production
```

#### 1.2. Mover `railway.json` para local correto

```bash
mv apps/frontend/railway.json apps/backend/railway.json
```

#### 1.3. Decidir sobre Render

- **Opção A:** Remover `render.yaml` (se não usado)
- **Opção B:** Documentar como alternativa de disaster recovery

### Fase 2: Reduzir Preview Deployments 📉

#### 2.1. Configurar Vercel Dashboard

**Ação Manual Necessária:**

1. Acessar: https://vercel.com/jairguerraadv-sys-projects/frontend/settings/git
2. Configurar:
   ```
   Production Branch: main
   Preview Deployments: Only for Pull Requests (não branch pushes)
   ```

#### 2.2. Atualizar `vercel.json`

Adicionar controle mais granular:

```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false,
    "deploymentEnabled": {
      "main": true, // Production
      "develop": false, // Sem deploy automático
      "*": false // Outros branches: só via PR
    }
  }
}
```

### Fase 3: Padronização 📐

#### 3.1. Nomenclatura de Environments

```
Production  → Vercel Production (Frontend main branch)
Preview     → Vercel Preview (Frontend PRs only)
Railway     → Backend Production (Railway main branch)
```

#### 3.2. Unificar configurações Vercel

- **Manter apenas:** `/vercel.json` (raiz)
- **Remover:** `/apps/frontend/vercel.json` (redundante, só 4 linhas)
- **Migrar:** Configs úteis do frontend para raiz

### Fase 4: Automação de Limpeza 🤖

#### 4.1. GitHub Action para Cleanup

Criar `.github/workflows/deployment-cleanup.yml`:

```yaml
name: Deployment Cleanup

on:
  schedule:
    - cron: "0 2 * * 0" # Domingo 2AM
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete old inactive deployments
        # Nota: Só funciona para deployments criados via GitHub Actions
        # Vercel deployments devem ser gerenciados via Vercel API
```

#### 4.2. Vercel API Integration (Opcional)

Se necessário controle programático dos deployments Vercel:

```bash
# Configurar VERCEL_TOKEN secret
# Script para deletar deployments Preview >14 dias via Vercel API
```

---

## 📝 Checklist de Execução

### Imediato (Hoje)

- [ ] 1. Deletar environments órfãos do GitHub
- [ ] 2. Mover `railway.json` para backend
- [ ] 3. Decidir sobre `render.yaml` (manter ou remover)
- [ ] 4. Unificar `vercel.json` (remover do frontend)

### Configuração Manual (Requer acesso Vercel Dashboard)

- [ ] 5. Configurar Preview Deployments = "Only PRs"
- [ ] 6. Confirmar Production Branch = "main"

### Documentação

- [ ] 7. Atualizar `docs/DEPLOYMENT.md` com estratégia final
- [ ] 8. Documentar processo de deploy para novos devs
- [ ] 9. Adicionar seção troubleshooting

### Opcional/Futuro

- [ ] 10. Criar workflow de cleanup automático
- [ ] 11. Configurar Vercel API para limpeza programática
- [ ] 12. Implementar branch protection rules

---

## 🎯 Estado Desejado Final

### Ambientes

```
┌─────────────────────────────────────────────────┐
│ PRODUCTION (Branch: main)                       │
├─────────────────────────────────────────────────┤
│ Frontend: Vercel Production                     │
│   URL: https://ouvify.vercel.app                │
│   Auto-deploy: Push to main                     │
│                                                  │
│ Backend: Railway Production                     │
│   URL: https://ouvify-production.up.railway.app │
│   Auto-deploy: CI/CD on main                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PREVIEW (Pull Requests Only)                    │
├─────────────────────────────────────────────────┤
│ Frontend: Vercel Preview                        │
│   URL: https://ouvify-{pr-id}.vercel.app        │
│   Auto-deploy: Apenas em PRs                    │
│   Retention: Auto-delete após merge/close       │
│                                                  │
│ Backend: Railway (usa Production)               │
│   URL: https://ouvify-production.up.railway.app │
└─────────────────────────────────────────────────┘
```

### Fluxo de Deploy

```
Feature Branch → PR → Preview Deploy (Vercel) → Review → Merge
                          ↓
                      Tests Pass
                          ↓
                      Merge to main
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
     Frontend Deploy           Backend Deploy
        (Vercel)                 (Railway)
              ↓                       ↓
        Production               Production
```

---

## 🚨 Limitações Conhecidas

### Deployments Vercel não podem ser deletados via GitHub API

**Causa:** Deployments criados por integração GitHub-Vercel pertencem à app Vercel.  
**Solução:** Usar Vercel Dashboard ou Vercel API diretamente.

**Comando Vercel CLI para limpeza:**

```bash
# Listar deployments
vercel list

# Deletar deployment específico
vercel remove [deployment-url] --yes
```

---

## 📚 Referências

- [Vercel Git Integration Docs](https://vercel.com/docs/deployments/git)
- [Railway Deployments](https://docs.railway.app/deploy/deployments)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
