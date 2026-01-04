import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, utimesSync, closeSync, openSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ScipIndexer } from '../../src/core/indexer.js';

describe('ScipIndexer', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'pi-agent-scip-indexer-'));
    mkdirSync(join(projectRoot, 'src'));
    writeFileSync(join(projectRoot, 'src', 'main.py'), 'def foo():\n    return 1\n');
  });

  afterEach(() => {
    try {
      rmSync(projectRoot, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('is constructed with index path in .scip/index.scip', () => {
    const indexer = new ScipIndexer(projectRoot);
    expect(indexer.getIndexPath()).toBe(join(projectRoot, '.scip', 'index.scip'));
  });

  it('reports needsReindex when index is older than sources', async () => {
    const indexer = new ScipIndexer(projectRoot);
    const indexPath = indexer.getIndexPath();

    // Create .scip directory and empty index file
    mkdirSync(join(projectRoot, '.scip'), { recursive: true });
    closeSync(openSync(indexPath, 'w'));

    // Ensure the source file is newer than the index file
    const srcPath = join(projectRoot, 'src', 'main.py');
    const now = new Date();
    const past = new Date(now.getTime() - 60_000);
    utimesSync(indexPath, past, past);
    utimesSync(srcPath, now, now);

    expect(await indexer.needsReindex()).toBe(true);
  });

  it('does not require reindex when index is newer than sources', async () => {
    const indexer = new ScipIndexer(projectRoot);
    const indexPath = indexer.getIndexPath();

    mkdirSync(join(projectRoot, '.scip'), { recursive: true });
    closeSync(openSync(indexPath, 'w'));

    const srcPath = join(projectRoot, 'src', 'main.py');
    const now = new Date();
    const past = new Date(now.getTime() - 60_000);
    utimesSync(srcPath, past, past);
    utimesSync(indexPath, now, now);

    expect(await indexer.needsReindex()).toBe(false);
  });

  it('reports needsReindex when no index exists', async () => {
    const indexer = new ScipIndexer(projectRoot);
    expect(await indexer.needsReindex()).toBe(true);
  });

  it('reports no reindex needed when no source files exist', async () => {
    // Create empty project with just an index
    const emptyRoot = mkdtempSync(join(tmpdir(), 'pi-agent-scip-empty-'));
    const indexer = new ScipIndexer(emptyRoot);
    const indexPath = indexer.getIndexPath();

    mkdirSync(join(emptyRoot, '.scip'), { recursive: true });
    closeSync(openSync(indexPath, 'w'));

    // No .py files → should not need reindex
    expect(await indexer.needsReindex()).toBe(false);

    rmSync(emptyRoot, { recursive: true, force: true });
  });

  it('ignores node_modules and .venv when scanning for sources', async () => {
    const indexer = new ScipIndexer(projectRoot);
    const indexPath = indexer.getIndexPath();

    // Create index
    mkdirSync(join(projectRoot, '.scip'), { recursive: true });
    closeSync(openSync(indexPath, 'w'));

    // Make index newer than src/main.py
    const now = new Date();
    const past = new Date(now.getTime() - 60_000);
    utimesSync(join(projectRoot, 'src', 'main.py'), past, past);
    utimesSync(indexPath, now, now);

    // Add a newer file inside node_modules (should be ignored)
    mkdirSync(join(projectRoot, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(projectRoot, 'node_modules', 'pkg', 'mod.py'), '# ignored');
    const future = new Date(now.getTime() + 60_000);
    utimesSync(join(projectRoot, 'node_modules', 'pkg', 'mod.py'), future, future);

    // Add a newer file inside .venv (should be ignored)
    mkdirSync(join(projectRoot, '.venv', 'lib'), { recursive: true });
    writeFileSync(join(projectRoot, '.venv', 'lib', 'site.py'), '# ignored');
    utimesSync(join(projectRoot, '.venv', 'lib', 'site.py'), future, future);

    // Should still not need reindex because ignored dirs are skipped
    expect(await indexer.needsReindex()).toBe(false);
  });

  it('detects changes in nested directories', async () => {
    const indexer = new ScipIndexer(projectRoot);
    const indexPath = indexer.getIndexPath();

    // Create index
    mkdirSync(join(projectRoot, '.scip'), { recursive: true });
    closeSync(openSync(indexPath, 'w'));

    // Make index newer than existing source
    const now = new Date();
    const past = new Date(now.getTime() - 60_000);
    utimesSync(join(projectRoot, 'src', 'main.py'), past, past);
    utimesSync(indexPath, now, now);

    expect(await indexer.needsReindex()).toBe(false);

    // Add a new file in a nested directory that is newer
    mkdirSync(join(projectRoot, 'src', 'pkg', 'sub'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'pkg', 'sub', 'deep.py'), '# new');
    const future = new Date(now.getTime() + 60_000);
    utimesSync(join(projectRoot, 'src', 'pkg', 'sub', 'deep.py'), future, future);

    expect(await indexer.needsReindex()).toBe(true);
  });
});
