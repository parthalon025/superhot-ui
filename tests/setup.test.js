import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  readlinkSync,
  lstatSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixSymlink, injectClaudeBlock, patchPackageJson, detectEsbuild } from '../scripts/setup.js';

// ─── fixSymlink ───────────────────────────────────────────────────────────────

describe('fixSymlink', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  test('rewrites relative symlink to absolute', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-fixsym-'));
    const nodeModules = join(tmpDir, 'node_modules');
    mkdirSync(nodeModules);

    // Create a fake superhot-ui target directory alongside consumer
    const targetDir = join(tmpDir, 'superhot-ui-source');
    mkdirSync(targetDir);

    // Create a relative symlink pointing to the target via a relative path
    const symlinkPath = join(nodeModules, 'superhot-ui');
    symlinkSync('../superhot-ui-source', symlinkPath);

    const result = fixSymlink(tmpDir, targetDir);

    assert.equal(result.status, 'fixed');
    // Must still be a symlink, now pointing to the absolute target
    assert.equal(readlinkSync(symlinkPath), targetDir);
    assert.ok(lstatSync(join(nodeModules, 'superhot-ui')).isSymbolicLink(), 'should still be a symlink after fix');
  });

  test('no-ops if node_modules/superhot-ui does not exist', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-fixsym-'));
    const nodeModules = join(tmpDir, 'node_modules');
    mkdirSync(nodeModules);

    const result = fixSymlink(tmpDir, '/some/absolute/path');

    assert.equal(result.status, 'skip');
  });

  test('no-ops if already an absolute symlink to correct target', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-fixsym-'));
    const nodeModules = join(tmpDir, 'node_modules');
    mkdirSync(nodeModules);

    const targetDir = join(tmpDir, 'superhot-ui-source');
    mkdirSync(targetDir);

    const symlinkPath = join(nodeModules, 'superhot-ui');
    symlinkSync(targetDir, symlinkPath);

    const result = fixSymlink(tmpDir, targetDir);

    assert.equal(result.status, 'already-absolute');
  });

  test('rewrites absolute symlink pointing to wrong target', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-fixsym-'));
    const nodeModules = join(tmpDir, 'node_modules');
    mkdirSync(nodeModules, { recursive: true });
    const wrongTarget = join(tmpDir, 'wrong-target');
    mkdirSync(wrongTarget);
    const correctTarget = join(tmpDir, 'correct-target');
    mkdirSync(correctTarget);
    symlinkSync(wrongTarget, join(nodeModules, 'superhot-ui'));

    const result = fixSymlink(tmpDir, correctTarget);

    assert.equal(result.status, 'fixed');
    assert.equal(result.target, correctTarget);
    assert.ok(lstatSync(join(nodeModules, 'superhot-ui')).isSymbolicLink());
    assert.equal(readlinkSync(join(nodeModules, 'superhot-ui')), correctTarget);
  });
});

// ─── injectClaudeBlock ────────────────────────────────────────────────────────

describe('injectClaudeBlock', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  test('creates CLAUDE.md if absent', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-claude-'));

    const result = injectClaudeBlock(tmpDir, '## superhot-ui\nSome usage notes.', '0.1.0');

    assert.equal(result.status, 'created');
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf8');
    assert.ok(content.includes('superhot-ui'));
    assert.ok(content.includes('0.1.0'));
  });

  test('appends to existing CLAUDE.md with no superhot-ui section', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-claude-'));
    const claudePath = join(tmpDir, 'CLAUDE.md');
    writeFileSync(claudePath, '# My Project\n\nExisting content here.\n');

    const result = injectClaudeBlock(tmpDir, '## superhot-ui\nUsage notes.', '0.1.0');

    assert.equal(result.status, 'injected');
    const content = readFileSync(claudePath, 'utf8');
    assert.ok(content.includes('My Project'));
    assert.ok(content.includes('Existing content here.'));
    assert.ok(content.includes('superhot-ui'));
  });

  test('skips if version marker matches current version', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-claude-'));
    const claudePath = join(tmpDir, 'CLAUDE.md');
    writeFileSync(
      claudePath,
      '# My Project\n\n<!-- superhot-ui:0.1.0 -->\n## superhot-ui\nUsage notes.\n'
    );

    const result = injectClaudeBlock(tmpDir, '## superhot-ui\nNew usage notes.', '0.1.0');

    assert.equal(result.status, 'up-to-date');
  });

  test('is idempotent — second call returns up-to-date', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-claude-'));
    const claudePath = join(tmpDir, 'CLAUDE.md');
    writeFileSync(claudePath, '# My Project\n\nsome content\n');

    injectClaudeBlock(tmpDir, '## superhot-ui\nSome usage notes.', '0.1.0'); // first call — injects
    const result = injectClaudeBlock(tmpDir, '## superhot-ui\nSome usage notes.', '0.1.0'); // second call

    assert.equal(result.status, 'up-to-date');
    // verify no duplicate markers
    const content = readFileSync(claudePath, 'utf8');
    const markerCount = (content.match(/<!-- superhot-ui/g) || []).length;
    assert.equal(markerCount, 1, 'should have exactly one marker');
  });

  test('replaces block if version marker is outdated', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-claude-'));
    const claudePath = join(tmpDir, 'CLAUDE.md');
    writeFileSync(
      claudePath,
      '# My Project\n\nOther section content.\n\n<!-- superhot-ui:0.0.1 -->\n## superhot-ui Design System\nOld usage notes.\n\n## Another Section\n\nStuff here.\n'
    );

    const result = injectClaudeBlock(tmpDir, '## superhot-ui Design System\nNew usage notes.', '0.1.0');

    assert.equal(result.status, 'updated');
    const content = readFileSync(claudePath, 'utf8');
    assert.ok(!content.includes('0.0.1'));
    assert.ok(content.includes('<!-- superhot-ui:0.1.0 -->'));
    assert.ok(content.includes('## Another Section'));
  });
});

// ─── patchPackageJson ─────────────────────────────────────────────────────────

describe('patchPackageJson', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  test('adds postinstall entry if absent', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-pkg-'));
    const pkgPath = join(tmpDir, 'package.json');
    writeFileSync(pkgPath, JSON.stringify({ name: 'my-app', scripts: { build: 'tsc' } }, null, 2));

    const result = patchPackageJson(tmpDir);

    assert.equal(result.status, 'patched');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.scripts.postinstall.includes('node_modules/superhot-ui/scripts/setup.js'), 'postinstall should point to setup.js');
  });

  test('adds scripts object if absent', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-pkg-'));
    const pkgPath = join(tmpDir, 'package.json');
    writeFileSync(pkgPath, JSON.stringify({ name: 'my-app' }, null, 2));

    const result = patchPackageJson(tmpDir);

    assert.equal(result.status, 'patched');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.scripts);
    assert.ok(pkg.scripts.postinstall.includes('node_modules/superhot-ui/scripts/setup.js'), 'postinstall should point to setup.js');
  });

  test('skips if postinstall already references superhot-ui', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-pkg-'));
    const pkgPath = join(tmpDir, 'package.json');
    writeFileSync(
      pkgPath,
      JSON.stringify(
        { name: 'my-app', scripts: { postinstall: 'node node_modules/superhot-ui/scripts/setup.js' } },
        null,
        2
      )
    );

    const result = patchPackageJson(tmpDir);

    assert.equal(result.status, 'already-configured');
  });

  test('skips if no package.json', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-pkg-'));

    const result = patchPackageJson(tmpDir);

    assert.equal(result.status, 'skip');
  });
});

// ─── detectEsbuild ────────────────────────────────────────────────────────────

describe('detectEsbuild', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  test('returns needs-config if esbuild.config.mjs exists without Preact alias', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-esbuild-'));
    writeFileSync(
      join(tmpDir, 'esbuild.config.mjs'),
      "import { build } from 'esbuild';\nawait build({ entryPoints: ['src/index.js'] });\n"
    );

    const result = detectEsbuild(tmpDir);

    assert.equal(result.status, 'needs-config');
    assert.ok(result.snippet.includes("'preact'"));
  });

  test('returns already-configured if alias exists', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-esbuild-'));
    writeFileSync(
      join(tmpDir, 'esbuild.config.mjs'),
      "import path from 'node:path';\nawait build({ alias: { 'preact': path.resolve('./node_modules/preact') } });\n"
    );

    const result = detectEsbuild(tmpDir);

    assert.equal(result.status, 'already-configured');
  });

  test('returns skip if no esbuild.config.mjs', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'superhot-esbuild-'));

    const result = detectEsbuild(tmpDir);

    assert.equal(result.status, 'skip');
  });
});
