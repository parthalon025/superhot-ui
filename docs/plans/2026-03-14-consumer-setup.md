# Consumer Setup Script Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship `scripts/setup.js` that consumers run once to fix integration friction and inject superhot-ui design rules into their CLAUDE.md automatically.

**Architecture:** Pure functions exported from `scripts/setup.js` handle each job (symlink fix, CLAUDE.md inject, package.json patch, esbuild detect). A `main()` shell calls them with `process.cwd()`. Pure functions accept `consumerRoot` as a param — fully testable without process mocking. CLAUDE.md block lives in `docs/consumer-claude-md.md` as the source of truth; setup.js reads it at runtime.

**Tech Stack:** Node.js ESM (`node:fs`, `node:path`, `node:url`), `node:test` for unit tests, temp dirs for isolation.

---

### Task 1: Create `docs/consumer-claude-md.md`

**Files:**

- Create: `docs/consumer-claude-md.md`

**Step 1: Write the file**

```markdown
## superhot-ui Design System

This project consumes superhot-ui for all visual effects and UI components.
**Read these docs before implementing any UI in this project.**

### Reference Docs

- Integration: `node_modules/superhot-ui/docs/consumer-guide.md`
- Design philosophy: `node_modules/superhot-ui/docs/design-philosophy.md`
- Experience design: `node_modules/superhot-ui/docs/experience-design.md`
- Component docs: `node_modules/superhot-ui/docs/components/`

### Key Rules

**Typography — terminal voice, not web UI**

- Labels: UPPERCASE, `--tracking-widest`, `--text-muted`
- Values: numeric or terse — never prose
- Status text: lowercase monospace codes (`healthy`, `error`, `warning`)
- System messages: UPPERCASE authoritative (`SYSTEM DEGRADED` not "Some services are down")
- Empty states: never apologetic (`NO ACTIVE JOBS` not "No jobs found")

**Navigation — places, not functions**

- `TOPOLOGY` not "Graph", `SYSTEMS` not "Services", `QUEUE` not "Job Queue"
- Active route: phosphor left border — never filled highlight or background
- No hover tooltips — if a label needs one, it's too long

**Interface health states — whole interface changes at once**

- Operational: phosphor calm, no pulse, CRT scanlines only
- Degraded: ShThreatPulse + ShGlitch on affected surfaces, Incident HUD surfaces
- Critical: ShMantra on layout root, header pulses, all failed nodes pulse
- Rule: health state changes the whole interface simultaneously — never card by card

**Failure theater — 6 coordinated surfaces**

1. Graph node — `ShThreatPulse persistent`, color shifts to `--sh-threat`
2. Stat card — `status="error"` + `ShThreatPulse`
3. Sidebar — indicator dot pulses threat red
4. Incident HUD — `ShThreatPulse` + `ShMantra text="SYSTEM DEGRADED"`
5. Toast — `ShToast type="error" duration={0}` (persistent)
6. Layout root (critical only) — `ShMantra` watermarks entire interface

**Time-freeze discipline — data age is visible**

- Every data surface that can go stale wraps in `<ShFrozen timestamp={...}>` — no exceptions
- Fresh: 0–5min (full color), Cooling: 5–30min (desaturated), Frozen: 30–60min (grey), Stale: 60+min (ghost + NO DATA mantra)
- Header "last updated": `applyFreshness(el, timestamp)`

**Emotional arc — every session follows this loop**
Tension → Pause → Plan → Execute → Catharsis

- Page load: `ShSkeleton` everywhere (Tension → Pause)
- Data stale: `ShFrozen` activates, mantra appears (Tension)
- Service failure: `ShThreatPulse` + `ShGlitch` + `ShMantra` broadcast (Tension)
- Command palette opens: glitch burst — "I'm taking action" (Plan)
- Recovery: `ShGlitch` burst then phosphor calm (Catharsis)
- Job complete: `playSfx('complete')` if audio enabled (Catharsis)

**Interaction feedback — no silent actions**
| Action | Response |
|--------|----------|
| Open command palette | `ShCommandPalette` opens with glitch burst |
| Dismiss alert | `shatterElement` on the element |
| Job submitted | `ShToast type="info"` + `playSfx('complete')` |
| Job failed | `ShToast type="error" duration={0}` + `playSfx('error')` |
| Navigate route | `@starting-style` entrance on incoming content |
| Data refreshed | `ShGlitch` micro-burst on "last updated" timestamp |
| Service recovers | `ShGlitch` burst on node, then phosphor calm |

**Component rules**

- Every effect communicates exactly one signal — not "status plus action"
- Effects use only four palette colors: white (`--sh-bright`), black (`--sh-void`), red (`--sh-threat`), cyan (`--sh-phosphor`)
- New UI patterns go in superhot-ui first — never build a DS component directly in this project
- Components are diegetic — no decorative animation (no bounce, wiggle, idle flip)
- Layout components (grids, sidebars, nav) live in the consuming project, not superhot-ui

### Gotchas

- Never use `h` or `Fragment` as callback param names in JSX — esbuild injects `h` as JSX factory, shadowing it causes silent render crashes
- `shatterElement` requires `position: relative` on the parent element
- `--sh-fill` in `.sh-vram-bar` is a unitless number 0–100, not a percentage string (`72` not `"72%"`)
- `ShAudio.enabled` defaults to `false` — always set from user preference, never automatically
- `@import 'superhot-ui/css'` fails silently inside inline `<style>` blocks (no base URL) — inject as separate `<style>` elements
- esbuild + `file:` dep: pin all Preact imports in `esbuild.config.mjs` to avoid dual-Preact crash (see consumer-guide.md)
```

**Step 2: Commit**

```bash
git add docs/consumer-claude-md.md
git commit -m "docs: add consumer CLAUDE.md block template"
```

---

### Task 2: Write failing tests for `scripts/setup.js`

**Files:**

- Create: `tests/setup.test.js`

**Step 1: Write the test file**

```javascript
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  symlinkSync,
  lstatSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { rmSync } from "node:fs";

// Import the pure functions under test
import {
  fixSymlink,
  injectClaudeBlock,
  patchPackageJson,
  detectEsbuild,
} from "../scripts/setup.js";

// Helper: create isolated temp dir
function tempDir() {
  return mkdtempSync(join(tmpdir(), "sh-setup-"));
}

// ── fixSymlink ──────────────────────────────────────────────────────────────

describe("fixSymlink", () => {
  test("rewrites relative symlink to absolute", () => {
    const consumer = tempDir();
    const target = tempDir();
    const nmDir = join(consumer, "node_modules");
    mkdirSync(nmDir);
    // create relative symlink
    symlinkSync("../some-relative-path", join(nmDir, "superhot-ui"));

    fixSymlink(consumer, target);

    const stat = lstatSync(join(nmDir, "superhot-ui"));
    assert.ok(stat.isSymbolicLink());
    // readlink should now be the absolute target
    import("node:fs").then(({ readlinkSync }) => {
      assert.equal(readlinkSync(join(nmDir, "superhot-ui")), target);
    });
    rmSync(consumer, { recursive: true });
    rmSync(target, { recursive: true });
  });

  test("no-ops if node_modules/superhot-ui does not exist", () => {
    const consumer = tempDir();
    mkdirSync(join(consumer, "node_modules"));
    const result = fixSymlink(consumer, "/some/path");
    assert.equal(result.status, "skip");
    rmSync(consumer, { recursive: true });
  });

  test("no-ops if already an absolute symlink to correct target", () => {
    const consumer = tempDir();
    const target = tempDir();
    const nmDir = join(consumer, "node_modules");
    mkdirSync(nmDir);
    symlinkSync(target, join(nmDir, "superhot-ui"));

    const result = fixSymlink(consumer, target);
    assert.equal(result.status, "already-absolute");
    rmSync(consumer, { recursive: true });
    rmSync(target, { recursive: true });
  });
});

// ── injectClaudeBlock ───────────────────────────────────────────────────────

const BLOCK = "## superhot-ui Design System\n\nsome rules here\n";
const VERSION = "0.1.0";
const MARKER = `<!-- superhot-ui ${VERSION} -->`;

describe("injectClaudeBlock", () => {
  test("creates CLAUDE.md if absent", () => {
    const consumer = tempDir();
    const result = injectClaudeBlock(consumer, BLOCK, VERSION);
    assert.equal(result.status, "created");
    const content = readFileSync(join(consumer, "CLAUDE.md"), "utf8");
    assert.ok(content.includes(MARKER));
    assert.ok(content.includes("## superhot-ui Design System"));
    rmSync(consumer, { recursive: true });
  });

  test("appends to existing CLAUDE.md that has no superhot-ui section", () => {
    const consumer = tempDir();
    writeFileSync(join(consumer, "CLAUDE.md"), "# My Project\n\nsome content\n");
    const result = injectClaudeBlock(consumer, BLOCK, VERSION);
    assert.equal(result.status, "injected");
    const content = readFileSync(join(consumer, "CLAUDE.md"), "utf8");
    assert.ok(content.includes("# My Project"));
    assert.ok(content.includes(MARKER));
    rmSync(consumer, { recursive: true });
  });

  test("skips if version marker matches current version", () => {
    const consumer = tempDir();
    writeFileSync(join(consumer, "CLAUDE.md"), `# My Project\n\n${MARKER}\n${BLOCK}`);
    const result = injectClaudeBlock(consumer, BLOCK, VERSION);
    assert.equal(result.status, "up-to-date");
    rmSync(consumer, { recursive: true });
  });

  test("replaces block if version marker is outdated", () => {
    const consumer = tempDir();
    const oldMarker = "<!-- superhot-ui 0.0.9 -->";
    writeFileSync(
      join(consumer, "CLAUDE.md"),
      `# My Project\n\n${oldMarker}\n${BLOCK}\n## Other Section\n\nstuff\n`,
    );
    const result = injectClaudeBlock(consumer, BLOCK, VERSION);
    assert.equal(result.status, "updated");
    const content = readFileSync(join(consumer, "CLAUDE.md"), "utf8");
    assert.ok(!content.includes("0.0.9"));
    assert.ok(content.includes(MARKER));
    assert.ok(content.includes("## Other Section"));
    rmSync(consumer, { recursive: true });
  });
});

// ── patchPackageJson ────────────────────────────────────────────────────────

describe("patchPackageJson", () => {
  test("adds postinstall entry if absent", () => {
    const consumer = tempDir();
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({ name: "test", scripts: { build: "npm run build" } }, null, 2),
    );
    const result = patchPackageJson(consumer);
    assert.equal(result.status, "patched");
    const pkg = JSON.parse(readFileSync(join(consumer, "package.json"), "utf8"));
    assert.ok(pkg.scripts.postinstall.includes("superhot-ui"));
    rmSync(consumer, { recursive: true });
  });

  test("adds scripts object if absent", () => {
    const consumer = tempDir();
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "test" }, null, 2));
    patchPackageJson(consumer);
    const pkg = JSON.parse(readFileSync(join(consumer, "package.json"), "utf8"));
    assert.ok(pkg.scripts.postinstall.includes("superhot-ui"));
    rmSync(consumer, { recursive: true });
  });

  test("skips if postinstall already references superhot-ui", () => {
    const consumer = tempDir();
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify(
        {
          name: "test",
          scripts: { postinstall: "node node_modules/superhot-ui/scripts/setup.js" },
        },
        null,
        2,
      ),
    );
    const result = patchPackageJson(consumer);
    assert.equal(result.status, "already-configured");
    rmSync(consumer, { recursive: true });
  });

  test("skips if no package.json", () => {
    const consumer = tempDir();
    const result = patchPackageJson(consumer);
    assert.equal(result.status, "skip");
    rmSync(consumer, { recursive: true });
  });
});

// ── detectEsbuild ───────────────────────────────────────────────────────────

describe("detectEsbuild", () => {
  test("returns needs-config if esbuild.config.mjs exists without alias", () => {
    const consumer = tempDir();
    writeFileSync(
      join(consumer, "esbuild.config.mjs"),
      "import esbuild from 'esbuild';\n// no alias\n",
    );
    const result = detectEsbuild(consumer);
    assert.equal(result.status, "needs-config");
    assert.ok(result.snippet.includes("'preact'"));
    rmSync(consumer, { recursive: true });
  });

  test("returns already-configured if alias exists", () => {
    const consumer = tempDir();
    writeFileSync(
      join(consumer, "esbuild.config.mjs"),
      "alias: { 'preact': path.resolve('./node_modules/preact') }",
    );
    const result = detectEsbuild(consumer);
    assert.equal(result.status, "already-configured");
    rmSync(consumer, { recursive: true });
  });

  test("returns skip if no esbuild.config.mjs", () => {
    const consumer = tempDir();
    const result = detectEsbuild(consumer);
    assert.equal(result.status, "skip");
    rmSync(consumer, { recursive: true });
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd ~/Documents/projects/superhot-ui
node --test tests/setup.test.js 2>&1 | head -30
```

Expected: import error — `setup.js` doesn't exist yet.

**Step 3: Commit failing tests**

```bash
git add tests/setup.test.js
git commit -m "test: add failing tests for setup.js"
```

---

### Task 3: Implement `scripts/setup.js`

**Files:**

- Create: `scripts/setup.js`

**Step 1: Write the implementation**

```javascript
// scripts/setup.js
// Consumer setup script for superhot-ui.
// Run from consumer project root: node node_modules/superhot-ui/scripts/setup.js

import {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  unlinkSync,
  symlinkSync,
  mkdirSync,
  readlinkSync,
} from "node:fs";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Pure functions (exported for testing) ──────────────────────────────────

/**
 * Fix node_modules/superhot-ui symlink to use absolute path.
 * @param {string} consumerRoot - consumer project root
 * @param {string} superhotAbsPath - absolute path to superhot-ui package
 * @returns {{ status: 'fixed'|'already-absolute'|'skip', target?: string }}
 */
export function fixSymlink(consumerRoot, superhotAbsPath) {
  const symlinkPath = resolve(consumerRoot, "node_modules", "superhot-ui");
  if (!existsSync(symlinkPath)) return { status: "skip", reason: "not installed as file: dep" };

  const stat = lstatSync(symlinkPath);
  if (!stat.isSymbolicLink()) return { status: "skip", reason: "not a symlink" };

  const currentTarget = readlinkSync(symlinkPath);
  if (isAbsolute(currentTarget) && currentTarget === superhotAbsPath) {
    return { status: "already-absolute" };
  }

  unlinkSync(symlinkPath);
  symlinkSync(superhotAbsPath, symlinkPath);
  return { status: "fixed", target: superhotAbsPath };
}

/**
 * Inject or update the ## superhot-ui block in consumer's CLAUDE.md.
 * @param {string} consumerRoot
 * @param {string} blockTemplate - content of docs/consumer-claude-md.md
 * @param {string} version - package version string e.g. "0.1.0"
 * @returns {{ status: 'created'|'injected'|'up-to-date'|'updated' }}
 */
export function injectClaudeBlock(consumerRoot, blockTemplate, version) {
  const claudePath = resolve(consumerRoot, "CLAUDE.md");
  const marker = `<!-- superhot-ui ${version} -->`;
  const block = `${marker}\n${blockTemplate}`;

  if (!existsSync(claudePath)) {
    writeFileSync(claudePath, block);
    return { status: "created" };
  }

  const content = readFileSync(claudePath, "utf8");
  const hasMarker = /<!-- superhot-ui [\d.]+ -->/.test(content);

  if (!hasMarker) {
    const separator = content.endsWith("\n") ? "\n" : "\n\n";
    writeFileSync(claudePath, content + separator + block);
    return { status: "injected" };
  }

  if (content.includes(marker)) {
    return { status: "up-to-date" };
  }

  // Outdated version — replace the block
  const updated = content.replace(/<!-- superhot-ui [\d.]+ -->[\s\S]*?(?=\n## |\n# |$)/, block);
  writeFileSync(claudePath, updated);
  return { status: "updated" };
}

/**
 * Add postinstall entry to consumer's package.json.
 * @param {string} consumerRoot
 * @returns {{ status: 'patched'|'already-configured'|'skip' }}
 */
export function patchPackageJson(consumerRoot) {
  const pkgPath = resolve(consumerRoot, "package.json");
  if (!existsSync(pkgPath)) return { status: "skip", reason: "no package.json" };

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.scripts?.postinstall?.includes("superhot-ui")) {
    return { status: "already-configured" };
  }

  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.postinstall = "node node_modules/superhot-ui/scripts/setup.js";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  return { status: "patched" };
}

const PREACT_ALIAS_SNIPPET = `alias: {
  'preact': path.resolve('./node_modules/preact'),
  'preact/hooks': path.resolve('./node_modules/preact/hooks'),
  'preact/jsx-runtime': path.resolve('./node_modules/preact/jsx-runtime'),
}`;

/**
 * Detect esbuild config and check Preact alias.
 * @param {string} consumerRoot
 * @returns {{ status: 'needs-config'|'already-configured'|'skip', snippet?: string }}
 */
export function detectEsbuild(consumerRoot) {
  const esbuildPath = resolve(consumerRoot, "esbuild.config.mjs");
  if (!existsSync(esbuildPath)) return { status: "skip" };

  const content = readFileSync(esbuildPath, "utf8");
  if (content.includes("'preact': path.resolve")) {
    return { status: "already-configured" };
  }

  return { status: "needs-config", snippet: PREACT_ALIAS_SNIPPET };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const consumerRoot = process.cwd();
  const superhotAbsPath = resolve(__dirname, "..");
  const version = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8")).version;

  // Don't run inside the superhot-ui package itself
  if (resolve(consumerRoot) === superhotAbsPath) {
    console.log("[superhot-ui setup] skipping: running inside package root");
    return;
  }

  const blockTemplate = readFileSync(resolve(__dirname, "../docs/consumer-claude-md.md"), "utf8");

  console.log("\n[superhot-ui setup]\n");

  // 1. Fix symlink
  const symlink = fixSymlink(consumerRoot, superhotAbsPath);
  if (symlink.status === "fixed") console.log(`  ✓ symlink → ${symlink.target}`);
  else if (symlink.status === "already-absolute") console.log("  ✓ symlink already absolute");
  else console.log(`  · symlink: ${symlink.reason ?? "skipped"}`);

  // 2. Inject CLAUDE.md block
  const claude = injectClaudeBlock(consumerRoot, blockTemplate, version);
  if (claude.status === "created") console.log("  ✓ CLAUDE.md created with superhot-ui block");
  else if (claude.status === "injected") console.log("  ✓ CLAUDE.md — superhot-ui block injected");
  else if (claude.status === "updated")
    console.log(`  ✓ CLAUDE.md — superhot-ui block updated to v${version}`);
  else console.log(`  ✓ CLAUDE.md — up to date (v${version})`);

  // 3. Patch package.json
  const pkg = patchPackageJson(consumerRoot);
  if (pkg.status === "patched") console.log("  ✓ package.json — postinstall entry added");
  else if (pkg.status === "already-configured")
    console.log("  ✓ package.json — postinstall already configured");
  else console.log(`  · package.json: ${pkg.reason ?? "skipped"}`);

  // 4. esbuild check
  const esbuild = detectEsbuild(consumerRoot);
  if (esbuild.status === "needs-config") {
    console.log(
      "\n  ⚠ esbuild.config.mjs detected — add Preact alias to prevent dual-Preact crash:",
    );
    console.log(
      "\n" +
        esbuild.snippet
          .split("\n")
          .map((l) => "    " + l)
          .join("\n"),
    );
  } else if (esbuild.status === "already-configured") {
    console.log("  ✓ esbuild — Preact alias configured");
  }

  console.log("\n  Done. See node_modules/superhot-ui/docs/ for full design docs.\n");
}

main();
```

**Step 2: Run tests**

```bash
cd ~/Documents/projects/superhot-ui
node --test tests/setup.test.js 2>&1
```

Expected: all tests pass.

**Step 3: Run the script against itself (self-test — should detect it's in package root and skip)**

```bash
node scripts/setup.js
```

Expected output: `[superhot-ui setup] skipping: running inside package root`

**Step 4: Run the script against project-hub**

```bash
cd ~/Documents/projects/project-hub
node node_modules/superhot-ui/scripts/setup.js
```

Expected:

- symlink line shows fixed or already-absolute
- CLAUDE.md injected or up-to-date
- package.json postinstall patched
- esbuild line (configured or snippet printed)

**Step 5: Verify CLAUDE.md was updated in project-hub**

```bash
grep -A 3 "superhot-ui" ~/Documents/projects/project-hub/CLAUDE.md | head -20
```

Expected: version marker + `## superhot-ui Design System` block present.

**Step 6: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add scripts/setup.js
git commit -m "feat: add consumer setup script (symlink fix + CLAUDE.md inject + postinstall patch)"
```

---

### Task 4: Update `docs/consumer-guide.md`

**Files:**

- Modify: `docs/consumer-guide.md` (Install section)

**Step 1: Replace the Install section**

Find the existing `## Install` section and replace with:

````markdown
## Install

```bash
npm install file:../superhot-ui
```
````

Or if the project is nested deeper:

```bash
npm install file:../../superhot-ui
```

**First-time setup** — run once after installing:

```bash
node node_modules/superhot-ui/scripts/setup.js
```

This script:

- Fixes the `node_modules/superhot-ui` symlink to an absolute path (worktree compatibility)
- Injects the superhot-ui design rules block into your `CLAUDE.md`
- Adds a `postinstall` entry to your `package.json` so setup re-runs automatically on `npm install`
- Prints the esbuild Preact alias snippet if your config needs it

**After that**, every `npm install` runs setup automatically via the patched postinstall.

**esbuild dual-Preact crash:** If setup prints an alias snippet, add it to your `esbuild.config.mjs`
bundle options. `file:` deps with their own `node_modules/preact` cause two Preact instances —
silent render failures.

````

**Step 2: Commit**

```bash
git add docs/consumer-guide.md
git commit -m "docs: update consumer-guide with setup script instructions"
````

---

### Task 5: Update `README.md` Installation section

**Files:**

- Modify: `README.md` (Installation section)

**Step 1: Find the current Installation section**

Look for the `## Installation` heading. It currently shows:

```markdown
**As a local package (sibling repo):**
...
**Worktree gotcha:**
...
**esbuild dual-Preact crash:**
...
```

**Step 2: Replace with simplified version**

````markdown
## Installation

**As a local package (sibling repo):**

```bash
npm install file:../superhot-ui
node node_modules/superhot-ui/scripts/setup.js
```
````

The setup script handles: symlink fix for worktrees, CLAUDE.md design rules injection, postinstall wiring, and esbuild Preact alias detection. Run it once — after that `npm install` keeps it updated automatically.

**CSS only (no build step):**

```html
<link rel="stylesheet" href="../superhot-ui/css/superhot.css" />
```

**After cloning:**

```bash
npm install
npm run build   # produces dist/superhot.css, dist/superhot.js, dist/superhot.preact.js
```

````

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: simplify README installation — setup script handles friction"
````

---

### Task 6: Update project-hub to use the new postinstall

**Files:**

- Modify: `~/Documents/projects/project-hub/package.json`
- Modify: `~/Documents/projects/project-hub/scripts/fix-symlinks.cjs` (superseded — check if still needed)

**Step 1: Check current project-hub postinstall**

```bash
cat ~/Documents/projects/project-hub/package.json | grep -A 3 '"postinstall"'
cat ~/Documents/projects/project-hub/scripts/fix-symlinks.cjs
```

**Step 2: Evaluate overlap**

If `fix-symlinks.cjs` only fixes the symlink and does nothing else, it is superseded by `setup.js`. The setup script now handles everything fix-symlinks did, plus CLAUDE.md injection.

If project-hub's postinstall already has `superhot-ui` in it (from Task 3 Step 4 above), the script self-detected. If the old `fix-symlinks.cjs` postinstall is still there:

```bash
cd ~/Documents/projects/project-hub
node node_modules/superhot-ui/scripts/setup.js
```

Then verify `package.json` has the new postinstall. If both exist, consolidate to just the superhot-ui setup script (remove or fold fix-symlinks.cjs).

**Step 3: Commit project-hub changes**

```bash
cd ~/Documents/projects/project-hub
git add package.json
git commit -m "chore: replace fix-symlinks.cjs postinstall with superhot-ui setup script"
```

---

### Task 7: Final verification

**Step 1: Run all superhot-ui tests**

```bash
cd ~/Documents/projects/superhot-ui
node --test tests/**/*.test.js 2>&1 | tail -20
```

Expected: all tests pass, including new `tests/setup.test.js`.

**Step 2: Simulate a fresh consumer install**

```bash
# Create a temp consumer project
mkdir /tmp/test-consumer && cd /tmp/test-consumer
echo '{"name":"test-consumer","scripts":{}}' > package.json
echo "# Test Consumer" > CLAUDE.md
mkdir -p node_modules
ln -s ~/Documents/projects/superhot-ui node_modules/superhot-ui

# Run setup
node node_modules/superhot-ui/scripts/setup.js
```

Expected:

- Output shows symlink check, CLAUDE.md injected, postinstall patched
- `cat CLAUDE.md` shows `<!-- superhot-ui 0.1.0 -->` + full rules block
- `cat package.json` shows postinstall entry

**Step 3: Re-run setup (idempotent check)**

```bash
node node_modules/superhot-ui/scripts/setup.js
```

Expected: all lines show "already configured" / "up to date" — no duplicate writes.

**Step 4: Cleanup**

```bash
rm -rf /tmp/test-consumer
```

**Step 5: Final commit in superhot-ui**

```bash
cd ~/Documents/projects/superhot-ui
git add .
git commit -m "chore: verify setup script integration"
```

---

## Execution

Plan saved to `docs/plans/2026-03-14-consumer-setup.md`.
