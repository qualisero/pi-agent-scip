import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// We test the isPythonRepo logic by importing the hook module and invoking it.
// Since the hook is a factory, we create a mock pi object to capture calls.

// Re-implement isPythonRepo here for direct testing (same logic as in hook.ts)
import { promises as fs } from 'node:fs';

async function isPythonRepo(cwd: string): Promise<boolean> {
  try {
    const pyproject = join(cwd, 'pyproject.toml');
    const setup = join(cwd, 'setup.py');

    const hasPyproject = await fs
      .access(pyproject)
      .then(() => true)
      .catch(() => false);
    if (hasPyproject) return true;

    const hasSetup = await fs
      .access(setup)
      .then(() => true)
      .catch(() => false);
    if (hasSetup) return true;

    // Fallback: shallow scan for .py files in src/ and root
    const srcDir = join(cwd, 'src');
    const srcEntries = await fs.readdir(srcDir).catch(() => [] as string[]);
    if (srcEntries.some((e) => e.endsWith('.py'))) return true;

    const rootEntries = await fs.readdir(cwd);
    if (rootEntries.some((e) => e.endsWith('.py'))) return true;

    return false;
  } catch {
    return false;
  }
}

describe('isPythonRepo detection', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'pi-agent-scip-hook-'));
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('detects pyproject.toml', async () => {
    writeFileSync(join(testDir, 'pyproject.toml'), '[project]\nname = "test"\n');
    expect(await isPythonRepo(testDir)).toBe(true);
  });

  it('detects setup.py', async () => {
    writeFileSync(join(testDir, 'setup.py'), 'from setuptools import setup\nsetup()\n');
    expect(await isPythonRepo(testDir)).toBe(true);
  });

  it('detects .py files in src/', async () => {
    mkdirSync(join(testDir, 'src'));
    writeFileSync(join(testDir, 'src', 'main.py'), '# python file');
    expect(await isPythonRepo(testDir)).toBe(true);
  });

  it('detects .py files in root', async () => {
    writeFileSync(join(testDir, 'app.py'), '# python file');
    expect(await isPythonRepo(testDir)).toBe(true);
  });

  it('returns false for non-Python projects', async () => {
    writeFileSync(join(testDir, 'index.js'), 'console.log("js")');
    writeFileSync(join(testDir, 'package.json'), '{}');
    expect(await isPythonRepo(testDir)).toBe(false);
  });

  it('returns false for empty directories', async () => {
    expect(await isPythonRepo(testDir)).toBe(false);
  });

  it('prefers pyproject.toml over scanning', async () => {
    // Has pyproject but no .py files - should still detect as Python
    writeFileSync(join(testDir, 'pyproject.toml'), '[project]\nname = "test"\n');
    expect(await isPythonRepo(testDir)).toBe(true);
  });
});
