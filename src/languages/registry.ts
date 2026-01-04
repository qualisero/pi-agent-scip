import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { LanguageAdapter } from './base.js';
import { PythonAdapter } from './python.js';

const DEFAULT_IGNORE = new Set(['.git', '.scip', 'node_modules', '.venv', '.poetry']);

export class LanguageRegistry {
  async detectLanguages(projectRoot: string): Promise<LanguageAdapter[]> {
    const adapters: LanguageAdapter[] = [];

    if (await this.hasFiles(projectRoot, '.py')) {
      adapters.push(new PythonAdapter());
    }

    return adapters;
  }

  private async hasFiles(root: string, extension: string): Promise<boolean> {
    const queue: string[] = [root];

    while (queue.length) {
      const current = queue.pop()!;
      let entries;
      try {
        entries = await fs.readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (DEFAULT_IGNORE.has(entry.name)) continue;

        const fullPath = join(current, entry.name);
        if (entry.isDirectory()) {
          queue.push(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          return true;
        }
      }
    }

    return false;
  }
}
