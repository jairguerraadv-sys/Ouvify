#!/bin/bash

echo "📊 GERANDO RELATÓRIO DE AUDITORIA"
echo "================================="

cd "$(dirname "$0")/.."

REPORT_FILE="AUDIT_REPORT_$(date +%Y%m%d_%H%M%S).md"
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
BRANCH=$(git branch --show-current 2>/dev/null || echo "N/A")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")

cat > "$REPORT_FILE" << EOF
# 📋 RELATÓRIO DE AUDITORIA PÓS-CONSOLIDAÇÃO

**Data:** $CURRENT_DATE
**Branch:** $BRANCH
**Commit:** $COMMIT

---

## ✅ RESULTADOS DA AUDITORIA

### 1. Infraestrutura Docker
| Item | Status |
|------|--------|
| docker-compose.yml válido | ⬜ |
| Paths atualizados (apps/) | ⬜ |
| PostgreSQL | ⬜ |
| Redis | ⬜ |
| ElasticSearch | ⬜ |
| Backend Django | ⬜ |
| Frontend Next.js | ⬜ |
| Celery Worker | ⬜ |
| Celery Beat | ⬜ |
| Mailhog | ⬜ |

### 2. Backend Django
| Item | Status |
|------|--------|
| Django check | ⬜ |
| Migrations aplicadas | ⬜ |
| Collectstatic | ⬜ |
| Importações críticas | ⬜ |
| API endpoints | ⬜ |
| Testes passando | ⬜ |

### 3. Frontend Next.js
| Item | Status |
|------|--------|
| npm install | ⬜ |
| ESLint | ⬜ |
| TypeScript | ⬜ |
| Build | ⬜ |
| Estrutura de pastas | ⬜ |

### 4. Integrações
| Item | Status |
|------|--------|
| Redis cache | ⬜ |
| PostgreSQL queries | ⬜ |
| ElasticSearch search | ⬜ |
| Celery tasks | ⬜ |
| Email (Mailhog) | ⬜ |

### 5. Performance
| Endpoint | Tempo |
|----------|-------|
| /health/ | ⬜ ms |
| /api/v1/feedbacks/ | ⬜ ms |
| Frontend / | ⬜ ms |

### 6. Segurança
| Item | Status |
|------|--------|
| .env não commitado | ⬜ |
| Secrets protegidos | ⬜ |
| .gitignore configurado | ⬜ |
| npm audit | ⬜ |

---

## 📈 MÉTRICAS PÓS-CONSOLIDAÇÃO

| Métrica | Valor |
|---------|-------|
| Tamanho do repositório | $(du -sh . 2>/dev/null | cut -f1 || echo "N/A") |
| Arquivos Python | $(find apps -name "*.py" 2>/dev/null | wc -l | tr -d ' ') |
| Arquivos TypeScript | $(find apps -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ') |
| Arquivos __pycache__ | $(find . -name "__pycache__" 2>/dev/null | wc -l | tr -d ' ') |

---

## 🚨 PROBLEMAS ENCONTRADOS

_Execute os scripts de auditoria para preencher esta seção_

---

## ✅ CONCLUSÃO

**Status:** ⬜ APROVADO / ⬜ REPROVADO

**Próximos Passos:**
- [ ] Corrigir problemas identificados
- [ ] Re-executar auditoria
- [ ] Mergear PR de consolidação
- [ ] Iniciar próxima fase

---
**Gerado automaticamente por:** scripts/generate-audit-report.sh
EOF

echo "✅ Relatório gerado: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
