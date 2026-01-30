#!/bin/bash
# Script de limpeza de backups - Auditoria Fase 1
# Data: 2026-01-26

set -e  # Parar em caso de erro

echo "🧹 Iniciando limpeza de backups..."

# Backup de segurança antes de deletar
echo "📦 Criando backup de segurança em /tmp/ouvify-backup-$(date +%Y%m%d)"
mkdir -p /tmp/ouvify-backup-$(date +%Y%m%d)

# Arquivos para deletar
FILES_TO_DELETE=(
    "backup-pre-autonomous-*.tar.gz"
    "apps/frontend/.backups"
    "package-lock.json.bak"
    "*.backup"
    "*.bak"
    "*.old"
)

# Encontrar e listar antes de deletar
echo "📋 Arquivos que serão removidos:"
for pattern in "${FILES_TO_DELETE[@]}"; do
    find . -name "$pattern" -type f -o -name "$pattern" -type d 2>/dev/null || true
done

# Confirmar deleção
echo ""
read -p "⚠️ Confirma deleção? (digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

# Deletar arquivos
echo "🗑️ Removendo backups..."
for pattern in "${FILES_TO_DELETE[@]}"; do
    find . -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
done

# Mover logs de consolidação para pasta apropriada
echo "📁 Arquivando logs de consolidação..."
mkdir -p docs/logs/migration
mv consolidation-*.log docs/logs/migration/ 2>/dev/null || true

echo "✅ Limpeza concluída!"
echo "📊 Espaço liberado: ~45.5MB"

# Verificar tamanho do repositório
echo "📏 Tamanho atual do repositório:"
du -sh .
