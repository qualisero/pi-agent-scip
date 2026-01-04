import { promises as fs } from 'node:fs';
import { join } from 'node:path';

// Lightweight type definitions to avoid importing internal hook types at build time.
interface HookContextLite {
  cwd: string;
  tools?: { name?: string }[];
  addSystemMessage(message: string): void;
}

export type HookFactory = (pi: {
  on(event: 'session_start', handler: (event: unknown, ctx: HookContextLite) => void | Promise<void>): void;
}) => void;

interface DetectedLanguages {
  python: boolean;
  typescript: boolean;
}

async function detectLanguages(cwd: string): Promise<DetectedLanguages> {
  const result: DetectedLanguages = { python: false, typescript: false };

  try {
    // Check for Python
    const pyproject = join(cwd, 'pyproject.toml');
    const setup = join(cwd, 'setup.py');

    const hasPyproject = await fs.access(pyproject).then(() => true).catch(() => false);
    const hasSetup = await fs.access(setup).then(() => true).catch(() => false);

    if (hasPyproject || hasSetup) {
      result.python = true;
    } else {
      // Fallback: shallow scan for .py files in src/ and root
      const srcDir = join(cwd, 'src');
      const srcEntries = await fs.readdir(srcDir).catch(() => [] as string[]);
      if (srcEntries.some((e) => e.endsWith('.py'))) {
        result.python = true;
      } else {
        const rootEntries = await fs.readdir(cwd);
        if (rootEntries.some((e) => e.endsWith('.py'))) {
          result.python = true;
        }
      }
    }

    // Check for TypeScript/JavaScript
    const tsconfig = join(cwd, 'tsconfig.json');
    const jsconfig = join(cwd, 'jsconfig.json');
    const packageJson = join(cwd, 'package.json');

    const hasTsconfig = await fs.access(tsconfig).then(() => true).catch(() => false);
    const hasJsconfig = await fs.access(jsconfig).then(() => true).catch(() => false);

    if (hasTsconfig || hasJsconfig) {
      result.typescript = true;
    } else {
      // Check package.json for TypeScript dependency
      try {
        const content = await fs.readFile(packageJson, 'utf-8');
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['typescript']) {
          result.typescript = true;
        }
      } catch {
        // No package.json or invalid JSON
      }

      // Fallback: shallow scan for .ts/.tsx files
      if (!result.typescript) {
        const srcDir = join(cwd, 'src');
        const srcEntries = await fs.readdir(srcDir).catch(() => [] as string[]);
        if (srcEntries.some((e) => e.endsWith('.ts') || e.endsWith('.tsx'))) {
          result.typescript = true;
        } else {
          const rootEntries = await fs.readdir(cwd);
          if (rootEntries.some((e) => e.endsWith('.ts') || e.endsWith('.tsx'))) {
            result.typescript = true;
          }
        }
      }
    }
  } catch {
    // Ignore errors, return defaults
  }

  return result;
}

const factory: HookFactory = (pi) => {
  pi.on('session_start', async (_event, ctx) => {
    const languages = await detectLanguages(ctx.cwd);
    const hasAnyLanguage = languages.python || languages.typescript;
    if (!hasAnyLanguage) return;

    const tools = ctx.tools ?? [];
    const hasScip = tools.some((t) => t.name && t.name.startsWith('scip_'));
    if (!hasScip) return;

    const languageNames: string[] = [];
    if (languages.python) languageNames.push('Python');
    if (languages.typescript) languageNames.push('TypeScript/JavaScript');

    const languageList = languageNames.join(' and ');

    ctx.addSystemMessage(
      `For this ${languageList} project, prefer the scip_* tools from @qualisero/pi-agent-scip for code navigation and structure: ` +
        'use scip_find_definition, scip_find_references, scip_list_symbols, scip_search_symbols, and scip_project_tree ' +
        'instead of ad-hoc text search or manual file scanning.',
    );
  });
};

export default factory;
