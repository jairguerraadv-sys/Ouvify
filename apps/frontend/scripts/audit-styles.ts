import { promises as fs } from 'node:fs';
import path from 'node:path';

type IssueType = 'inline-style' | 'hardcoded-color' | 'deprecated-class';

interface StyleIssue {
  file: string;
  line: number;
  type: IssueType;
  description: string;
}

const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'playwright-report',
  'test-results',
]);

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) return;
        files.push(...(await listFilesRecursively(fullPath)));
        return;
      }

      if (!entry.isFile()) return;
      if (!CODE_EXTS.has(path.extname(entry.name))) return;
      files.push(fullPath);
    })
  );

  return files;
}

function shouldIgnoreLineForColors(line: string) {
  // Ignore CSS variable HSL usage and common comments.
  if (line.includes('hsl(var(--')) return true;
  const trimmed = line.trim();
  if (trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) return true;
  return false;
}

async function auditStyles(workspaceRoot: string) {
  const issues: StyleIssue[] = [];

  const rootsToScan = ['app', 'components', 'contexts', 'hooks', 'lib', 'styles', 'tests'];
  const existingRoots: string[] = [];
  for (const root of rootsToScan) {
    const full = path.join(workspaceRoot, root);
    try {
      const stat = await fs.stat(full);
      if (stat.isDirectory()) existingRoots.push(full);
    } catch {
      // ignore
    }
  }

  const files = (
    await Promise.all(existingRoots.map((root) => listFilesRecursively(root)))
  ).flat();

  const colorRegex = /#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(/;
  const deprecatedClassTokens = [
    'bg-gray-',
    'text-gray-',
    'border-gray-',
    'bg-slate-',
    'text-slate-',
    'border-slate-',
  ];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const lines = raw.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';

      if (line.includes('style={{')) {
        issues.push({
          file: path.relative(workspaceRoot, file),
          line: i + 1,
          type: 'inline-style',
          description: 'Evitar inline styles; usar classes Tailwind/tokens.',
        });
      }

      if (!shouldIgnoreLineForColors(line) && colorRegex.test(line)) {
        issues.push({
          file: path.relative(workspaceRoot, file),
          line: i + 1,
          type: 'hardcoded-color',
          description: 'Encontrada cor hardcoded; preferir tokens do design system.',
        });
      }

      for (const token of deprecatedClassTokens) {
        if (line.includes(token)) {
          issues.push({
            file: path.relative(workspaceRoot, file),
            line: i + 1,
            type: 'deprecated-class',
            description: `Substituir "${token}" por tokens semânticos (ex: bg-background, text-text-secondary, border-border-light).`,
          });
          break;
        }
      }
    }
  }

  const grouped = issues.reduce(
    (acc, issue) => {
      (acc[issue.type] ||= []).push(issue);
      return acc;
    },
    {} as Record<IssueType, StyleIssue[]>
  );

  const total = issues.length;
  console.log(`\n🔍 Encontrados ${total} problemas de estilo\n`);
  (Object.keys(grouped) as IssueType[]).forEach((type) => {
    console.log(`- ${type}: ${grouped[type].length}`);
  });

  const outputPath = path.join(workspaceRoot, 'style-audit-report.json');
  await fs.writeFile(outputPath, JSON.stringify(issues, null, 2));
  console.log(`\n✅ Relatório salvo em ${path.relative(process.cwd(), outputPath)}\n`);
}

auditStyles(process.cwd()).catch((err) => {
  console.error('Erro ao auditar estilos:', err);
  process.exitCode = 1;
});
