#!/bin/bash
# Kill List - Remove Ouvy SaaS Test/Dev Artifacts

# 1. Deletar scripts de auditoria e lixo
rm -f audit_*.py run_audit.sh check_env.py create_superuser.py \
      gerar_protocolos_existentes.py railway_setup.sh audit_backend.sh \
      audit_full.py /tmp/railway_smoke.sh

# 2. Deletar relatórios
rm -f AUDIT_*.txt AUDIT_*.html INDEX_AUDIT_FILES.txt LEIA_ME_PRIMEIRO.md

# 3. Criar pasta docs/ e mover documentação
mkdir -p docs
mv CONTEXTO_OUVY.md docs/01-CONTEXTO_OUVY.md 2>/dev/null || true
mv CONTEXTO_FRONTEND.md docs/02-CONTEXTO_FRONTEND.md 2>/dev/null || true
mv DEPLOY_RAILWAY.md docs/DEPLOY_RAILWAY.md 2>/dev/null || true
mv DEPLOY_VERCEL.md docs/DEPLOY_VERCEL.md 2>/dev/null || true
mv GUIA_COMPLETO_DEPLOYMENT.md docs/GUIA_DEPLOYMENT.md 2>/dev/null || true
mv DOCUMENTACAO_COMPLETA.md docs/DOCUMENTACAO.md 2>/dev/null || true
mv QUICK_REFERENCE.md docs/QUICK_REFERENCE.md 2>/dev/null || true
mv QUICK_START.txt docs/QUICK_START.txt 2>/dev/null || true
mv SECURITY.md docs/SECURITY.md 2>/dev/null || true
mv REFATORACAO_SEGURANCA.md docs/REFATORACAO_SEGURANCA.md 2>/dev/null || true
mv README_MULTITENANCY.md docs/README_MULTITENANCY.md 2>/dev/null || true
mv RATE_LIMITING_IMPLEMENTADO.md docs/RATE_LIMITING.md 2>/dev/null || true
mv INTEGRACAO_CADASTRO.md docs/INTEGRACAO_CADASTRO.md 2>/dev/null || true
mv RESUMO_EXECUTIVO.md docs/RESUMO_EXECUTIVO.md 2>/dev/null || true
mv HOTFIX_SEGURANCA_PRODUCAO.md docs/HOTFIX_SEGURANCA.md 2>/dev/null || true
mv RAILWAY_DATABASE_SETUP.md docs/RAILWAY_DATABASE_SETUP.md 2>/dev/null || true
mv DEPLOYMENT_CHECKLIST.md docs/DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
mv ERRO_PRODUCAO_RESOLVIDO.txt docs/ERRO_PRODUCAO.txt 2>/dev/null || true
mv TESTE_INTEGRACAO_SUCESSO.md docs/TESTE_INTEGRACAO.md 2>/dev/null || true
mv TESTE_PAGAMENTO.md docs/TESTE_PAGAMENTO.md 2>/dev/null || true
mv UPLOAD_COMPLETE.txt docs/UPLOAD_COMPLETE.txt 2>/dev/null || true

# 4. Limpar cache Python
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name ".DS_Store" -delete 2>/dev/null || true

echo "✅ Limpeza concluída!"
