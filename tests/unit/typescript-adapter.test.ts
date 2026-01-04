import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TypeScriptAdapter } from '../../src/languages/typescript.js';

describe('TypeScriptAdapter', () => {
  let testDir: string;
  let adapter: TypeScriptAdapter;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'pi-agent-scip-ts-'));
    adapter = new TypeScriptAdapter();
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('has correct name and extensions', () => {
    expect(adapter.name).toBe('typescript');
    expect(adapter.extensions).toContain('.ts');
    expect(adapter.extensions).toContain('.tsx');
    expect(adapter.extensions).toContain('.js');
    expect(adapter.extensions).toContain('.jsx');
  });

  it('reports indexer as available (bundled via npm)', async () => {
    // scip-typescript is bundled with the package
    const available = await adapter.isIndexerAvailable(testDir);
    expect(available).toBe(true);
  });

  it('returns version string', async () => {
    const version = await adapter.getIndexerVersion(testDir);
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('installIndexer succeeds without confirm callback', async () => {
    // Should not throw
    await adapter.installIndexer(testDir);
  });

  it('installIndexer succeeds with confirm returning true', async () => {
    await adapter.installIndexer(testDir, {
      confirm: async () => true,
    });
  });

  it('installIndexer throws when confirm returns false', async () => {
    await expect(
      adapter.installIndexer(testDir, {
        confirm: async () => false,
      })
    ).rejects.toThrow('cancelled');
  });
});
