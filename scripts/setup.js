/**
 * superhot-ui consumer setup script
 *
 * Run once after installing superhot-ui to:
 * 1. Fix node_modules/superhot-ui symlink (relative → absolute)
 * 2. Inject superhot-ui design rules into consumer's CLAUDE.md
 * 3. Add postinstall entry to consumer's package.json
 * 4. Detect esbuild.config.mjs and print Preact alias snippet if needed
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, symlinkSync, lstatSync, readlinkSync } from 'node:fs';
import { join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ─── fixSymlink ───────────────────────────────────────────────────────────────

/**
 * Rewrites node_modules/superhot-ui symlink from relative to absolute.
 *
 * @param {string} consumerRoot - Consumer project root directory
 * @param {string} superhotAbsPath - Absolute path to superhot-ui source
 * @returns {{ status: 'fixed'|'already-absolute'|'skip', target?: string, reason?: string }}
 */
export function fixSymlink(consumerRoot, superhotAbsPath) {
  const symlinkPath = join(consumerRoot, 'node_modules', 'superhot-ui');

  if (!existsSync(symlinkPath)) {
    return { status: 'skip', reason: 'not installed as file: dep' };
  }

  let stat;
  try {
    stat = lstatSync(symlinkPath);
  } catch {
    return { status: 'skip', reason: 'not installed as file: dep' };
  }

  if (!stat.isSymbolicLink()) {
    return { status: 'skip', reason: 'not a symlink' };
  }

  const currentTarget = readlinkSync(symlinkPath);

  if (isAbsolute(currentTarget) && currentTarget === superhotAbsPath) {
    return { status: 'already-absolute' };
  }

  // Rewrite to absolute
  unlinkSync(symlinkPath);
  symlinkSync(superhotAbsPath, symlinkPath);

  return { status: 'fixed', target: superhotAbsPath };
}

// ─── injectClaudeBlock ────────────────────────────────────────────────────────

/**
 * Injects or updates the superhot-ui design rules block in consumer's CLAUDE.md.
 *
 * @param {string} consumerRoot - Consumer project root directory
 * @param {string} blockTemplate - Content of the block to inject
 * @param {string} version - Current superhot-ui version
 * @returns {{ status: 'created'|'injected'|'up-to-date'|'updated' }}
 */
export function injectClaudeBlock(consumerRoot, blockTemplate, version) {
  const claudePath = join(consumerRoot, 'CLAUDE.md');
  const marker = `<!-- superhot-ui:${version} -->`;
  const fullBlock = `${marker}\n${blockTemplate}`;

  if (!existsSync(claudePath)) {
    writeFileSync(claudePath, fullBlock, 'utf8');
    return { status: 'created' };
  }

  const content = readFileSync(claudePath, 'utf8');

  // Check for existing marker (any version)
  const anyMarkerMatch = content.match(/<!-- superhot-ui:([\d.]+) -->/);

  if (!anyMarkerMatch) {
    // No marker — append block
    const separator = content.endsWith('\n') ? '\n' : '\n\n';
    writeFileSync(claudePath, content + separator + fullBlock, 'utf8');
    return { status: 'injected' };
  }

  const existingVersion = anyMarkerMatch[1];

  if (existingVersion === version) {
    return { status: 'up-to-date' };
  }

  // Different version — replace the block
  // Match from the marker through the block content, stopping before the next top-level section
  const replaceRegex = /<!-- superhot-ui:[\d.]+ -->[\s\S]*?(?=\n## |\n# |$)/;
  const newContent = content.replace(replaceRegex, fullBlock);
  writeFileSync(claudePath, newContent, 'utf8');
  return { status: 'updated' };
}

// ─── patchPackageJson ─────────────────────────────────────────────────────────

/**
 * Adds postinstall script to consumer's package.json.
 *
 * @param {string} consumerRoot - Consumer project root directory
 * @returns {{ status: 'patched'|'already-configured'|'skip', reason?: string }}
 */
export function patchPackageJson(consumerRoot) {
  const pkgPath = join(consumerRoot, 'package.json');

  if (!existsSync(pkgPath)) {
    return { status: 'skip', reason: 'no package.json' };
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  if (pkg.scripts && pkg.scripts.postinstall && pkg.scripts.postinstall.includes('superhot-ui')) {
    return { status: 'already-configured' };
  }

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  pkg.scripts.postinstall = 'node node_modules/superhot-ui/scripts/setup.js';

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  return { status: 'patched' };
}

// ─── detectEsbuild ────────────────────────────────────────────────────────────

const PREACT_ALIAS_SNIPPET = `// Add to your esbuild alias configuration:
alias: {
  'preact': path.resolve('./node_modules/preact'),
  'preact/hooks': path.resolve('./node_modules/preact/hooks'),
  'preact/compat': path.resolve('./node_modules/preact/compat'),
},`;

/**
 * Detects esbuild.config.mjs and checks for Preact alias configuration.
 *
 * @param {string} consumerRoot - Consumer project root directory
 * @returns {{ status: 'needs-config'|'already-configured'|'skip', snippet?: string }}
 */
export function detectEsbuild(consumerRoot) {
  const esbuildPath = join(consumerRoot, 'esbuild.config.mjs');

  if (!existsSync(esbuildPath)) {
    return { status: 'skip' };
  }

  const content = readFileSync(esbuildPath, 'utf8');

  if (content.includes("'preact': path.resolve")) {
    return { status: 'already-configured' };
  }

  return { status: 'needs-config', snippet: PREACT_ALIAS_SNIPPET };
}

// ─── main ─────────────────────────────────────────────────────────────────────

function main() {
  const consumerRoot = process.cwd();
  const superhotAbsPath = resolve(__dirname, '..');

  // Skip if running inside the superhot-ui package root itself
  if (consumerRoot === superhotAbsPath) {
    console.log('[superhot-ui setup] skipping: running inside package root');
    return;
  }

  // Read version from this package's package.json
  const pkgPath = join(superhotAbsPath, 'package.json');
  const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'));

  // Read block template
  const blockTemplate = readFileSync(join(superhotAbsPath, 'docs', 'consumer-claude-md.md'), 'utf8');

  // Run all steps and print results
  const symResult = fixSymlink(consumerRoot, superhotAbsPath);
  const symIcon = symResult.status === 'fixed' ? '✓' : '·';
  console.log(`${symIcon} symlink: ${symResult.status}${symResult.reason ? ` (${symResult.reason})` : ''}`);

  const claudeResult = injectClaudeBlock(consumerRoot, blockTemplate, version);
  const claudeIcon = claudeResult.status === 'up-to-date' ? '·' : '✓';
  console.log(`${claudeIcon} CLAUDE.md: ${claudeResult.status}`);

  const pkgResult = patchPackageJson(consumerRoot);
  const pkgIcon = pkgResult.status === 'patched' ? '✓' : '·';
  console.log(`${pkgIcon} package.json: ${pkgResult.status}${pkgResult.reason ? ` (${pkgResult.reason})` : ''}`);

  const esbuildResult = detectEsbuild(consumerRoot);
  const esbuildIcon = esbuildResult.status === 'needs-config' ? '✓' : '·';
  console.log(`${esbuildIcon} esbuild: ${esbuildResult.status}`);

  if (esbuildResult.status === 'needs-config') {
    console.log('  Add the following Preact alias to your esbuild config:');
    for (const line of esbuildResult.snippet.split('\n')) {
      console.log(`  ${line}`);
    }
  }

  console.log('\nDone. See node_modules/superhot-ui/docs/ for full design docs.');
}

main();
