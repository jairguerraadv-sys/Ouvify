/**
 * Script para detectar duplicações de classes CSS
 * 
 * Uso: npx tsx scripts/detect-duplicate-styles.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ClassUsage {
  classes: string;
  files: string[];
  count: number;
}

function isMeaningfulClassBlock(classes: string) {
  const tokens = classes.split(/\s+/).filter(Boolean);
  // Heurística: evitar contar padrões muito “atômicos” (baixo sinal),
  // comuns e esperados em Tailwind (ex.: `flex items-center gap-2`).
  if (tokens.length < 5) return false;
  if (classes.length < 30) return false;
  return true;
}

async function detectDuplicates() {
  console.log('\n🔍 Detectando duplicações de estilos CSS/Tailwind...\n');
  
  // Encontrar todos os arquivos TSX e CSS
  const files = await glob('app/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', '**/*.test.*', '**/*.spec.*'],
    cwd: process.cwd(),
  });

  const componentFiles = await glob('components/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', '**/*.test.*', '**/*.spec.*'],
    cwd: process.cwd(),
  });

  const allFiles = [...files, ...componentFiles];
  console.log(`📁 Analisando ${allFiles.length} arquivos...\n`);

  const classUsage = new Map<string, string[]>();
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Extrair classes de className="..." e className={cn(...)} e className={`...`}
      const classPatterns = [
        /className="([^"]+)"/g,
        /className=\{cn\([^)]+\)\}/g,
        /className=\{`([^`]+)`\}/g,
      ];

      for (const pattern of classPatterns) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          const classes = match[1]?.trim();
          
          if (!classes) continue;
          
          // Normalizar (ordenar classes para detectar equivalentes)
          const normalizedClasses = classes
            .split(/\s+/)
            .filter(Boolean)
            .sort()
            .join(' ');

          if (!isMeaningfulClassBlock(normalizedClasses)) continue;
          
          if (!classUsage.has(normalizedClasses)) {
            classUsage.set(normalizedClasses, []);
          }
          
          const fileList = classUsage.get(normalizedClasses)!;
          if (!fileList.includes(file)) {
            fileList.push(file);
          }
        }
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
  }
  
  // Encontrar duplicações (mesmas classes em múltiplos arquivos)
  const duplicates: ClassUsage[] = Array.from(classUsage.entries())
    .filter(([_, files]) => files.length >= 2) // Usado em 2+ lugares
    .map(([classes, files]) => ({
      classes,
      files,
      count: files.length,
    }))
    .sort((a, b) => b.count - a.count);
  
  // Relatório de duplicações
  console.log('═'.repeat(60));
  console.log('📊 RELATÓRIO DE DUPLICAÇÕES DE ESTILOS');
  console.log('═'.repeat(60));
  
  if (duplicates.length === 0) {
    console.log('\n✅ Nenhuma duplicação significativa encontrada!');
    return;
  }
  
  console.log(`\n⚠️  Encontradas ${duplicates.length} combinações de classes duplicadas\n`);
  
  // Top 20 duplicações
  const topDuplicates = duplicates.slice(0, 20);
  
  console.log('🔝 TOP 20 CLASSES MAIS DUPLICADAS:\n');
  
  topDuplicates.forEach((dup, index) => {
    console.log(`\n${index + 1}. Usado em ${dup.count} arquivos:`);
    console.log(`   Classes: "${dup.classes.substring(0, 80)}${dup.classes.length > 80 ? '...' : ''}"`);
    console.log('   Arquivos:');
    dup.files.slice(0, 5).forEach(f => console.log(`     - ${f}`));
    if (dup.files.length > 5) {
      console.log(`     ... e mais ${dup.files.length - 5} arquivo(s)`);
    }
  });
  
  // Sugestões de componentes
  console.log('\n' + '═'.repeat(60));
  console.log('💡 SUGESTÕES DE COMPONENTIZAÇÃO');
  console.log('═'.repeat(60));
  
  const suggestions = duplicates
    .filter(d => d.count >= 3)
    .slice(0, 10);
  
  if (suggestions.length > 0) {
    console.log('\nClasses usadas 3+ vezes que podem virar componentes:\n');
    suggestions.forEach((s, i) => {
      // Tentar identificar o tipo de componente
      const classes = s.classes.toLowerCase();
      let componentType = 'Component';
      
      if (classes.includes('flex') && classes.includes('items-center')) {
        componentType = 'FlexRow ou FlexCenter';
      } else if (classes.includes('grid')) {
        componentType = 'Grid';
      } else if (classes.includes('rounded') && classes.includes('shadow')) {
        componentType = 'Card ou Container';
      } else if (classes.includes('text-') && classes.includes('font-')) {
        componentType = 'Typography (Text/Heading)';
      } else if (classes.includes('bg-') && classes.includes('p-')) {
        componentType = 'Section ou Box';
      }
      
      console.log(`${i + 1}. Sugestão: ${componentType}`);
      console.log(`   Usado em: ${s.count} lugares`);
      console.log(`   Classes: ${s.classes.substring(0, 60)}...`);
      console.log('');
    });
  } else {
    console.log('\n✅ Nenhuma duplicação crítica para componentizar!');
  }
  
  // Resumo final
  console.log('═'.repeat(60));
  console.log('📈 RESUMO');
  console.log('═'.repeat(60));
  console.log(`\nTotal de arquivos analisados: ${allFiles.length}`);
  console.log(`Total de padrões de classes únicos: ${classUsage.size}`);
  console.log(`Padrões duplicados (2+ usos): ${duplicates.length}`);
  console.log(`Candidatos a componentização (3+ usos): ${duplicates.filter(d => d.count >= 3).length}`);
  console.log(`Candidatos críticos (5+ usos): ${duplicates.filter(d => d.count >= 5).length}`);
  
  // Status geral
  const criticalCount = duplicates.filter(d => d.count >= 5).length;
  if (criticalCount === 0) {
    console.log('\n✅ STATUS: Codebase bem componentizado!');
  } else if (criticalCount < 5) {
    console.log('\n⚠️  STATUS: Algumas oportunidades de refatoração');
  } else {
    console.log('\n❌ STATUS: Refatoração recomendada');
  }
  
  console.log('\n');
}

// Executar
detectDuplicates().catch(console.error);
