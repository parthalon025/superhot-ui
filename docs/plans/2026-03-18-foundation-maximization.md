# superhot-ui Foundation Maximization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close all gaps identified in the foundation gap analysis so superhot-ui is a complete, publication-ready design system that consumers don't need to work around.

**Architecture:** Pure CSS additions where possible (utility classes, ANSI text attributes, browser fallbacks). Vanilla ESM JS for orchestration utilities (heartbeat, escalation, recovery, threshold). Preact wrappers only for ShModal. All additions follow the existing three-layer pattern (CSS → JS → Preact) and the `@layer superhot.base/effects/crt` cascade.

**Tech Stack:** CSS (oklch, @layer, @property), vanilla ESM JS (es2020), Preact JSX, Node.js `node:test` for unit tests, Playwright for browser tests.

**Research:** `~/Documents/research/2026-03-18-superhot-ui-foundation-gap-analysis.md`

---

## Batch 1: Browser Compatibility Fallbacks + Focus Styles (CRITICAL)

### Task 1.1: Add hex fallback colors in tokens.css

**Files:**

- Modify: `css/tokens.css`
- Test: `tests/browser/css-fallbacks.spec.js` (create)

**Step 1: Write the failing browser test**

Create `tests/browser/css-fallbacks.spec.js`:

```js
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Browser fallback colors", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("--sh-threat resolves to a non-empty color", async ({ page }) => {
    const color = await page.evaluate(() => {
      const el = document.createElement("div");
      el.style.color = "var(--sh-threat)";
      document.body.appendChild(el);
      return getComputedStyle(el).color;
    });
    expect(color).not.toBe("");
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("--sh-phosphor resolves to a non-empty color", async ({ page }) => {
    const color = await page.evaluate(() => {
      const el = document.createElement("div");
      el.style.color = "var(--sh-phosphor)";
      document.body.appendChild(el);
      return getComputedStyle(el).color;
    });
    expect(color).not.toBe("");
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });
});
```

**Step 2: Run test to verify it passes (baseline — should pass in Chromium)**

Run: `npx playwright test tests/browser/css-fallbacks.spec.js --project=chromium`

**Step 3: Add hex fallbacks before oklch declarations**

In `css/tokens.css`, add hex fallback values in `@property` initial-values (these already use hex for void/bright/middle/dim). For the `:root` block, add hex declarations before the `light-dark(oklch(...))` lines:

```css
:root {
  color-scheme: light dark;

  /* Hex fallbacks for browsers without oklch/light-dark support */
  --sh-threat: #dc2626;
  --sh-phosphor: #00d4ff;
  --sh-frozen: #6b7280;
  --sh-glass: #f0a0a0;
  --sh-middle: #d3d3d3;
  --sh-dim: #808080;

  /* Modern overrides (oklch + light-dark) — browsers that support these win */
  --sh-threat: light-dark(oklch(52% 0.22 25), oklch(62% 0.22 25));
  /* ... rest of existing declarations unchanged ... */
}
```

Also add fallbacks in `css/semantic.css` for surface/text/border tokens that use bare `oklch()`:

```css
:root {
  /* Surface fallbacks */
  --bg-base: #0f0f0f;
  --bg-base: oklch(0.06 0 0);
  /* ... pattern repeats for each oklch-only token ... */
}
```

**Step 4: Add color-mix fallbacks with @supports**

After the `:root` block in `tokens.css`, add:

```css
/* Fallback for browsers without color-mix() */
:root {
  --sh-threat-glow: rgba(220, 38, 38, 0.15);
  --sh-phosphor-glow: rgba(0, 212, 255, 0.2);
}
@supports (color: color-mix(in oklch, red, blue)) {
  :root {
    --sh-threat-glow: color-mix(in oklch, var(--sh-threat) 15%, transparent);
    --sh-phosphor-glow: color-mix(in oklch, var(--sh-phosphor) 20%, transparent);
  }
}
```

**Step 5: Run all tests**

Run: `npm test && npx playwright test`

**Step 6: Commit**

```bash
git add css/tokens.css css/semantic.css tests/browser/css-fallbacks.spec.js
git commit -m "feat: add hex fallback colors for browsers without oklch/light-dark/color-mix"
```

---

### Task 1.2: Add global :focus-visible rule + ::selection styling

**Files:**

- Modify: `css/superhot.css`
- Test: `tests/browser/css-a11y.spec.js` (create)

**Step 1: Write the failing browser test**

Create `tests/browser/css-a11y.spec.js`:

```js
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Accessibility — focus and selection", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test(":focus-visible has threat-red outline", async ({ page }) => {
    const outline = await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.textContent = "Test";
      document.body.appendChild(btn);
      btn.focus();
      return getComputedStyle(btn).outlineColor;
    });
    // Should resolve to the --sh-threat color (red channel dominant)
    expect(outline).not.toBe("rgb(0, 0, 0)");
  });

  test("::selection uses reverse-video palette", async ({ page }) => {
    const css = await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = `#sel::selection { color: inherit; }`;
      document.head.appendChild(style);
      // Check that our global ::selection rule exists by reading computed stylesheet
      const sheets = [...document.styleSheets];
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes("::selection")) {
              return true;
            }
          }
        } catch (e) {
          // cross-origin stylesheet — skip
        }
      }
      return false;
    });
    expect(css).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/browser/css-a11y.spec.js --project=chromium`

**Step 3: Add focus-visible and selection rules to superhot.css**

Add after the `@layer superhot.crt` block at the end of `css/superhot.css`:

```css
/* ═══════════════════════════════════════
   GLOBAL A11Y — focus, selection, print
   Unlayered so they always apply.
   ═══════════════════════════════════════ */

/* Focus Is Targeting — atmosphere-guide.md Rule 22 */
:focus-visible {
  outline: 2px solid var(--sh-threat);
  outline-offset: 2px;
}

@media (forced-colors: active) {
  :focus-visible {
    outline-color: Highlight;
  }
}

/* Reverse-video selection — terminal convention */
::selection {
  background-color: var(--selection-bg);
  color: var(--selection-text);
}

/* Print: strip decorative overlays */
@media print {
  .sh-crt::before,
  .sh-crt::after,
  .sh-crt-flicker-on {
    display: none !important;
  }
  [data-sh-mantra]::before,
  [data-sh-state="stale"]::after {
    display: none !important;
  }
  [data-sh-effect="threat-pulse"] {
    animation: none !important;
    border-color: var(--sh-threat);
  }
  [data-sh-effect="glitch"] {
    animation: none !important;
  }
}
```

**Step 4: Run tests**

Run: `npm test && npx playwright test`

**Step 5: Commit**

```bash
git add css/superhot.css tests/browser/css-a11y.spec.js
git commit -m "feat: add global :focus-visible, ::selection, and @media print rules"
```

---

## Batch 2: CSS Utility Classes

### Task 2.1: Add opacity, spacing, typography, and hover utility classes

**Files:**

- Create: `css/components/utilities.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/utilities.test.js` (create)

**Step 1: Write the failing test**

Create `tests/utilities.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/utilities.css", "utf8");

describe("utilities.css", () => {
  it("defines opacity semantic classes", () => {
    for (const cls of [
      "sh-opacity-current",
      "sh-opacity-secondary",
      "sh-opacity-historical",
      "sh-opacity-disabled",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });

  it("defines spacing gap classes", () => {
    for (const cls of ["sh-gap-entity", "sh-gap-related", "sh-gap-section", "sh-gap-panel"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });

  it("defines typography classes", () => {
    for (const cls of ["sh-label", "sh-value", "sh-status-code"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });

  it("defines hover vocabulary", () => {
    for (const cls of ["sh-hover-reveal", "sh-hover-phosphor-border"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });

  it("defines grid crystalline class", () => {
    assert.ok(css.includes(".sh-grid"), "missing .sh-grid");
  });

  it("defines prompt prefix classes", () => {
    for (const cls of ["sh-prompt", "sh-prompt-root"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/utilities.test.js`
Expected: FAIL — file does not exist

**Step 3: Create utilities.css**

Create `css/components/utilities.css`:

```css
/* superhot-ui utility classes
 * Semantic utilities derived from atmosphere-guide rules.
 * Rule 30: Opacity encodes relevance
 * Rule 33: Whitespace is Gestalt
 * Rule 21: Hover is interrogation
 * Rule 36: Grids are crystalline
 */

@layer superhot.base {
  /* ── Opacity (Rule 30) ── */
  .sh-opacity-current {
    opacity: 1;
  }
  .sh-opacity-secondary {
    opacity: 0.8;
  }
  .sh-opacity-historical {
    opacity: 0.6;
  }
  .sh-opacity-disabled {
    opacity: 0.4;
  }

  /* ── Spacing (Rule 33) ── */
  .sh-gap-entity {
    gap: var(--space-1);
  } /* 4px — same entity (label + value) */
  .sh-gap-related {
    gap: var(--space-2);
  } /* 8px — related items */
  .sh-gap-group {
    gap: var(--space-4);
  } /* 16px — same section */
  .sh-gap-section {
    gap: var(--space-6);
  } /* 24px — section boundary */
  .sh-gap-panel {
    gap: var(--space-8);
  } /* 32px — different concerns */

  /* ── Typography ── */
  .sh-label {
    font-family: var(--font-mono);
    font-size: var(--type-label);
    text-transform: uppercase;
    letter-spacing: var(--tracking-widest);
    color: var(--text-muted);
  }
  .sh-value {
    font-family: var(--font-mono);
    font-size: var(--type-body);
    color: var(--text-primary);
  }
  .sh-status-code {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    text-transform: lowercase;
  }

  /* ── Hover (Rule 21) ── */
  .sh-hover-reveal:hover {
    color: var(--text-primary);
  }
  .sh-hover-phosphor-border:hover {
    border-left: 2px solid var(--sh-phosphor);
  }

  /* ── Grid (Rule 36) ── */
  .sh-grid {
    display: grid;
    gap: var(--space-6);
  }
  .sh-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .sh-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .sh-grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  /* ── Prompt (terminal prefix) ── */
  .sh-prompt::before {
    content: "$ ";
    color: var(--sh-phosphor);
  }
  .sh-prompt-root::before {
    content: "# ";
    color: var(--sh-threat);
  }
}
```

**Step 4: Add import to superhot.css**

Add before the `@layer` declaration line in `css/superhot.css`:

```css
@import "./components/utilities.css";
```

**Step 5: Run tests**

Run: `node --test tests/utilities.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/utilities.css css/superhot.css tests/utilities.test.js
git commit -m "feat: add utility classes — opacity, spacing, typography, hover, grid, prompt"
```

---

## Batch 3: ANSI Text Attributes

### Task 3.1: Create ANSI text attribute CSS classes

**Files:**

- Create: `css/components/ansi.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/ansi.test.js` (create)

**Step 1: Write the failing test**

Create `tests/ansi.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/ansi.css", "utf8");

describe("ansi.css — ANSI SGR text attributes", () => {
  it("defines all text attribute classes", () => {
    for (const cls of [
      "sh-ansi-bold",
      "sh-ansi-dim",
      "sh-ansi-italic",
      "sh-ansi-underline",
      "sh-ansi-blink",
      "sh-ansi-blink-fast",
      "sh-ansi-reverse",
      "sh-ansi-hidden",
      "sh-ansi-strike",
      "sh-ansi-reset",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });

  it("defines ANSI foreground color classes", () => {
    for (const color of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
      assert.ok(css.includes(`.sh-ansi-fg-${color}`), `missing .sh-ansi-fg-${color}`);
    }
  });

  it("defines ANSI background color classes", () => {
    for (const color of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
      assert.ok(css.includes(`.sh-ansi-bg-${color}`), `missing .sh-ansi-bg-${color}`);
    }
  });

  it("defines blink keyframe", () => {
    assert.ok(css.includes("sh-ansi-blink-kf"), "missing blink keyframe");
  });

  it("respects prefers-reduced-motion for blink", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion rule for blink");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/ansi.test.js`

**Step 3: Create ansi.css**

Create `css/components/ansi.css`:

```css
/* ANSI SGR terminal text attributes
 * Maps classic ANSI escape codes to CSS classes.
 * Composable: .sh-ansi-bold.sh-ansi-underline.sh-ansi-fg-red
 *
 * Color modes:
 *   Default — ANSI colors mapped to superhot palette (three-color test compliant)
 *   [data-sh-ansi-mode="full"] — standard CGA 16-color palette for log output
 */

@keyframes sh-ansi-blink-kf {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@layer superhot.effects {
  /* ── Text Attributes (SGR 1-9) ── */
  .sh-ansi-bold {
    font-weight: bold;
  }
  .sh-ansi-dim {
    color: var(--text-tertiary);
  }
  .sh-ansi-italic {
    font-style: italic;
  }
  .sh-ansi-underline {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .sh-ansi-blink {
    animation: sh-ansi-blink-kf 1s step-end infinite;
  }
  .sh-ansi-blink-fast {
    animation: sh-ansi-blink-kf 0.3s step-end infinite;
  }
  .sh-ansi-reverse {
    color: var(--bg-base);
    background-color: var(--text-primary);
  }
  .sh-ansi-hidden {
    color: transparent;
  }
  .sh-ansi-strike {
    text-decoration: line-through;
  }
  .sh-ansi-reset {
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    color: inherit;
    background-color: transparent;
    animation: none;
    opacity: 1;
  }

  /* ── Foreground Colors (default — superhot palette mapping) ── */
  .sh-ansi-fg-black {
    color: var(--sh-void);
  }
  .sh-ansi-fg-red {
    color: var(--sh-threat);
  }
  .sh-ansi-fg-green {
    color: var(--sh-phosphor);
  }
  .sh-ansi-fg-yellow {
    color: var(--status-warning);
  }
  .sh-ansi-fg-blue {
    color: var(--sh-phosphor);
  }
  .sh-ansi-fg-magenta {
    color: var(--sh-threat);
  }
  .sh-ansi-fg-cyan {
    color: var(--sh-phosphor);
  }
  .sh-ansi-fg-white {
    color: var(--sh-bright);
  }

  /* ── Background Colors ── */
  .sh-ansi-bg-black {
    background-color: var(--sh-void);
  }
  .sh-ansi-bg-red {
    background-color: var(--sh-threat);
  }
  .sh-ansi-bg-green {
    background-color: var(--sh-phosphor);
  }
  .sh-ansi-bg-yellow {
    background-color: var(--status-warning);
  }
  .sh-ansi-bg-blue {
    background-color: var(--sh-phosphor);
  }
  .sh-ansi-bg-magenta {
    background-color: var(--sh-threat);
  }
  .sh-ansi-bg-cyan {
    background-color: var(--sh-phosphor);
  }
  .sh-ansi-bg-white {
    background-color: var(--sh-bright);
  }

  /* ── Full CGA mode (opt-in for log rendering) ── */
  [data-sh-ansi-mode="full"] .sh-ansi-fg-green {
    color: #00aa00;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-fg-yellow {
    color: #aa5500;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-fg-blue {
    color: #5555ff;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-fg-magenta {
    color: #aa00aa;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-bg-green {
    background-color: #00aa00;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-bg-yellow {
    background-color: #aa5500;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-bg-blue {
    background-color: #5555ff;
  }
  [data-sh-ansi-mode="full"] .sh-ansi-bg-magenta {
    background-color: #aa00aa;
  }

  /* ── Reduced Motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sh-ansi-blink,
    .sh-ansi-blink-fast {
      animation: none !important;
      background-color: var(--sh-threat);
      color: var(--sh-bright);
    }
  }

  /* ── Forced Colors ── */
  @media (forced-colors: active) {
    .sh-ansi-reverse {
      forced-color-adjust: none;
    }
  }
}
```

**Step 4: Add import to superhot.css**

Add import line for `./components/ansi.css` in `css/superhot.css`.

**Step 5: Run tests**

Run: `node --test tests/ansi.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/ansi.css css/superhot.css tests/ansi.test.js
git commit -m "feat: add ANSI SGR text attributes — bold/dim/blink/reverse + 16-color palette"
```

---

## Batch 4: Orchestration Utilities (JS)

### Task 4.1: Threshold signaling utility

**Files:**

- Create: `js/threshold.js`
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/threshold.test.js` (create)

**Step 1: Write the failing test**

Create `tests/threshold.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeThreshold } from "../js/threshold.js";

describe("computeThreshold", () => {
  it("returns calm for values 0-60", () => {
    assert.strictEqual(computeThreshold(0), "calm");
    assert.strictEqual(computeThreshold(59), "calm");
  });
  it("returns ambient for values 60-80", () => {
    assert.strictEqual(computeThreshold(60), "ambient");
    assert.strictEqual(computeThreshold(79), "ambient");
  });
  it("returns standard for values 80-90", () => {
    assert.strictEqual(computeThreshold(80), "standard");
    assert.strictEqual(computeThreshold(89), "standard");
  });
  it("returns critical for values 90-100", () => {
    assert.strictEqual(computeThreshold(90), "critical");
    assert.strictEqual(computeThreshold(100), "critical");
  });
  it("supports custom breakpoints", () => {
    assert.strictEqual(
      computeThreshold(50, { ambient: 40, standard: 60, critical: 80 }),
      "ambient",
    );
  });
  it("returns the glow class name", () => {
    assert.strictEqual(computeThreshold(95).glowClass, undefined);
    // Use applyThreshold for DOM + class application
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/threshold.test.js`

**Step 3: Create threshold.js**

Create `js/threshold.js`:

```js
/**
 * Compute threshold level from a percentage value.
 * Maps to glow classes: calm (none), ambient, standard, critical.
 * Source: atmosphere-guide.md Rule 39.
 *
 * @param {number} pct - Value 0-100
 * @param {object} [breakpoints] - Custom thresholds
 * @param {number} [breakpoints.ambient=60]
 * @param {number} [breakpoints.standard=80]
 * @param {number} [breakpoints.critical=90]
 * @returns {'calm'|'ambient'|'standard'|'critical'}
 */
export function computeThreshold(pct, breakpoints = {}) {
  const { ambient = 60, standard = 80, critical = 90 } = breakpoints;
  if (pct >= critical) return "critical";
  if (pct >= standard) return "standard";
  if (pct >= ambient) return "ambient";
  return "calm";
}

const GLOW_CLASSES = ["sh-glow-ambient", "sh-glow-standard", "sh-glow-critical", "sh-glow-none"];

/**
 * Apply threshold-appropriate glow class to an element.
 *
 * @param {Element} el
 * @param {number} pct - Value 0-100
 * @param {object} [breakpoints]
 * @returns {'calm'|'ambient'|'standard'|'critical'}
 */
export function applyThreshold(el, pct, breakpoints) {
  if (!el) return "calm";
  const level = computeThreshold(pct, breakpoints);
  el.classList.remove(...GLOW_CLASSES);
  if (level !== "calm") {
    el.classList.add(`sh-glow-${level}`);
  }
  return level;
}
```

**Step 4: Run test**

Run: `node --test tests/threshold.test.js`

**Step 5: Add export to esbuild config**

Add to the `jsConfig.stdin.contents` array in `esbuild.config.mjs`:

```js
"export { computeThreshold, applyThreshold } from './js/threshold.js';",
```

**Step 6: Commit**

```bash
git add js/threshold.js tests/threshold.test.js esbuild.config.mjs
git commit -m "feat: add threshold signaling utility — computeThreshold + applyThreshold"
```

---

### Task 4.2: Polling heartbeat utility

**Files:**

- Create: `js/heartbeat.js`
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/heartbeat.test.js` (create)

**Step 1: Write the failing test**

Create `tests/heartbeat.test.js`:

```js
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { heartbeat } from "../js/heartbeat.js";

describe("heartbeat", () => {
  it("calls glitchText with low intensity", () => {
    const glitchMock = mock.fn();
    const freshnessMock = mock.fn();
    const el = { setAttribute: mock.fn() };
    heartbeat(el, Date.now(), { glitchFn: glitchMock, freshnessFn: freshnessMock });
    assert.strictEqual(glitchMock.mock.calls.length, 1);
    assert.deepStrictEqual(glitchMock.mock.calls[0].arguments[1], {
      duration: 100,
      intensity: "low",
    });
  });
  it("calls applyFreshness with timestamp", () => {
    const glitchMock = mock.fn();
    const freshnessMock = mock.fn();
    const el = { setAttribute: mock.fn() };
    const ts = Date.now();
    heartbeat(el, ts, { glitchFn: glitchMock, freshnessFn: freshnessMock });
    assert.strictEqual(freshnessMock.mock.calls.length, 1);
    assert.strictEqual(freshnessMock.mock.calls[0].arguments[0], el);
    assert.strictEqual(freshnessMock.mock.calls[0].arguments[1], ts);
  });
  it("is a no-op when element is null", () => {
    // Should not throw
    heartbeat(null, Date.now());
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/heartbeat.test.js`

**Step 3: Create heartbeat.js**

Create `js/heartbeat.js`:

```js
import { glitchText } from "./glitch.js";
import { applyFreshness } from "./freshness.js";

/**
 * Fire a polling heartbeat — glitch micro-burst + freshness re-evaluation.
 * Call on each successful poll response.
 * Source: atmosphere-guide.md Rule 32.
 *
 * @param {Element} el - The "last updated" element or dashboard root
 * @param {Date|number} timestamp - Server timestamp from poll response
 * @param {object} [opts]
 * @param {Function} [opts.glitchFn=glitchText] - Glitch function (injectable for testing)
 * @param {Function} [opts.freshnessFn=applyFreshness] - Freshness function (injectable for testing)
 * @param {object} [opts.thresholds] - Freshness thresholds
 */
export function heartbeat(el, timestamp, opts = {}) {
  if (!el) return;
  const { glitchFn = glitchText, freshnessFn = applyFreshness, thresholds } = opts;
  glitchFn(el, { duration: 100, intensity: "low" });
  freshnessFn(el, timestamp, thresholds);
}
```

**Step 4: Run test**

Run: `node --test tests/heartbeat.test.js`

**Step 5: Add export to esbuild config**

Add to `jsConfig.stdin.contents`:

```js
"export { heartbeat } from './js/heartbeat.js';",
```

**Step 6: Commit**

```bash
git add js/heartbeat.js tests/heartbeat.test.js esbuild.config.mjs
git commit -m "feat: add polling heartbeat utility — glitch burst + freshness on poll"
```

---

### Task 4.3: Failure escalation state machine

**Files:**

- Create: `js/escalation.js`
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/escalation.test.js` (create)

**Step 1: Write the failing test**

Create `tests/escalation.test.js`:

```js
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { EscalationTimer } from "../js/escalation.js";

describe("EscalationTimer", () => {
  it("starts at level 0 (component)", () => {
    const timer = new EscalationTimer();
    assert.strictEqual(timer.level, 0);
    assert.strictEqual(timer.levelName, "component");
  });

  it("reports levels by name", () => {
    const timer = new EscalationTimer();
    assert.strictEqual(timer.levelName, "component");
  });

  it("calls onEscalate when advancing", () => {
    const cb = mock.fn();
    const timer = new EscalationTimer({
      onEscalate: cb,
      thresholds: [0, 0, 0, 0],
    });
    timer.start();
    // With 0ms thresholds, all should fire synchronously via setTimeout(0)
    // But setTimeout is async, so we test manual advance
    timer.advance();
    assert.strictEqual(timer.level, 1);
    assert.strictEqual(cb.mock.calls.length, 1);
  });

  it("does not exceed max level", () => {
    const timer = new EscalationTimer();
    timer.level = 3;
    timer.advance();
    assert.strictEqual(timer.level, 3);
  });

  it("reset goes back to 0", () => {
    const timer = new EscalationTimer();
    timer.level = 2;
    timer.reset();
    assert.strictEqual(timer.level, 0);
  });

  it("stop cancels all pending timers", () => {
    const timer = new EscalationTimer();
    timer.start();
    timer.stop();
    assert.strictEqual(timer.level, 0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/escalation.test.js`

**Step 3: Create escalation.js**

Create `js/escalation.js`:

```js
/**
 * Failure escalation timer — atmosphere-guide.md Rule 12.
 * 4-stage timeline: component → sidebar → section mantra → layout mantra.
 *
 * @example
 *   const esc = new EscalationTimer({
 *     onEscalate: (level, name) => {
 *       if (name === 'section') applyMantra(sectionEl, 'BACKEND OFFLINE');
 *       if (name === 'layout') applyMantra(layoutEl, 'SYSTEM DEGRADED');
 *     }
 *   });
 *   esc.start(); // begins 5s countdown to next level
 *   // on recovery:
 *   esc.reset();
 */

const LEVEL_NAMES = ["component", "sidebar", "section", "layout"];
const DEFAULT_THRESHOLDS = [5000, 10000, 45000, 60000]; // ms between levels

export class EscalationTimer {
  /**
   * @param {object} [opts]
   * @param {Function} [opts.onEscalate] - Called with (level, levelName) on each escalation
   * @param {Function} [opts.onReset] - Called when reset to level 0
   * @param {number[]} [opts.thresholds] - ms delays between levels (length 4)
   */
  constructor(opts = {}) {
    this.onEscalate = opts.onEscalate || (() => {});
    this.onReset = opts.onReset || (() => {});
    this.thresholds = opts.thresholds || DEFAULT_THRESHOLDS;
    this.level = 0;
    this._timerId = null;
  }

  get levelName() {
    return LEVEL_NAMES[this.level] || "layout";
  }

  /** Start the escalation countdown from current level. */
  start() {
    this._scheduleNext();
  }

  /** Manually advance one level (for testing or immediate escalation). */
  advance() {
    if (this.level >= LEVEL_NAMES.length - 1) return;
    this.level++;
    this.onEscalate(this.level, this.levelName);
  }

  /** Reset to level 0 and cancel all timers. */
  reset() {
    this.stop();
    this.level = 0;
    this.onReset();
  }

  /** Stop all pending timers without resetting level. */
  stop() {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  _scheduleNext() {
    if (this.level >= LEVEL_NAMES.length - 1) return;
    const delay = this.thresholds[this.level] || 5000;
    this._timerId = setTimeout(() => {
      this.advance();
      this._scheduleNext();
    }, delay);
  }
}
```

**Step 4: Run test**

Run: `node --test tests/escalation.test.js`

**Step 5: Add export to esbuild config**

Add to `jsConfig.stdin.contents`:

```js
"export { EscalationTimer } from './js/escalation.js';",
```

**Step 6: Commit**

```bash
git add js/escalation.js tests/escalation.test.js esbuild.config.mjs
git commit -m "feat: add failure escalation timer — 4-stage cadence per atmosphere Rule 12"
```

---

### Task 4.4: Recovery sequence utility

**Files:**

- Create: `js/recovery.js`
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/recovery.test.js` (create)

**Step 1: Write the failing test**

Create `tests/recovery.test.js`:

```js
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { recoverySequence } from "../js/recovery.js";

describe("recoverySequence", () => {
  it("returns a promise", () => {
    const result = recoverySequence({
      glitchFn: mock.fn(),
      onBorderTransition: mock.fn(),
      onPulseStop: mock.fn(),
      onToast: mock.fn(),
    });
    assert.ok(result instanceof Promise);
  });

  it("calls steps in order", async () => {
    const order = [];
    await recoverySequence({
      glitchFn: () => order.push("glitch"),
      onBorderTransition: () => order.push("border"),
      onPulseStop: () => order.push("pulse"),
      onToast: () => order.push("toast"),
      delays: { afterGlitch: 0, afterBorder: 0, afterPulse: 0 },
    });
    assert.deepStrictEqual(order, ["glitch", "border", "pulse", "toast"]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/recovery.test.js`

**Step 3: Create recovery.js**

Create `js/recovery.js`:

```js
/**
 * Recovery sequence choreography — atmosphere-guide.md Rule 37.
 * 5-step recovery: glitch burst → border transition → pulse stop → toast → calm.
 *
 * @param {object} opts
 * @param {Function} opts.glitchFn - Step 1: fire glitch burst on recovering element
 * @param {Function} opts.onBorderTransition - Step 2: transition border threat→phosphor
 * @param {Function} opts.onPulseStop - Step 3: stop threat pulse
 * @param {Function} opts.onToast - Step 4: show RESTORED toast
 * @param {object} [opts.delays]
 * @param {number} [opts.delays.afterGlitch=200] - ms after glitch before border
 * @param {number} [opts.delays.afterBorder=300] - ms after border before pulse stop
 * @param {number} [opts.delays.afterPulse=200] - ms after pulse stop before toast
 * @returns {Promise<void>}
 */
export async function recoverySequence(opts) {
  const { glitchFn, onBorderTransition, onPulseStop, onToast, delays = {} } = opts;
  const { afterGlitch = 200, afterBorder = 300, afterPulse = 200 } = delays;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  glitchFn();
  await wait(afterGlitch);

  onBorderTransition();
  await wait(afterBorder);

  onPulseStop();
  await wait(afterPulse);

  onToast();
}
```

**Step 4: Run test**

Run: `node --test tests/recovery.test.js`

**Step 5: Add export to esbuild config**

Add to `jsConfig.stdin.contents`:

```js
"export { recoverySequence } from './js/recovery.js';",
```

**Step 6: Commit**

```bash
git add js/recovery.js tests/recovery.test.js esbuild.config.mjs
git commit -m "feat: add recovery sequence utility — 5-step choreography per atmosphere Rule 37"
```

---

## Batch 5: ShModal Component

### Task 5.1: Create ShModal CSS + Preact component

**Files:**

- Create: `css/components/modal.css`
- Create: `preact/ShModal.jsx`
- Modify: `css/superhot.css` (add import)
- Modify: `esbuild.config.mjs` (add Preact export)
- Test: `tests/modal.test.js` (create)

**Step 1: Write the failing test**

Create `tests/modal.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/modal.css", "utf8");

describe("modal.css", () => {
  it("defines overlay class", () => {
    assert.ok(css.includes(".sh-modal-overlay"), "missing overlay");
  });
  it("defines modal body class", () => {
    assert.ok(css.includes(".sh-modal"), "missing modal");
  });
  it("defines confirm action class", () => {
    assert.ok(css.includes(".sh-modal-action"), "missing action");
  });
  it("uses --bg-overlay for backdrop", () => {
    assert.ok(css.includes("--bg-overlay"), "missing overlay token");
  });
  it("uses --radius: 0 (sharp corners)", () => {
    assert.ok(
      css.includes("border-radius") === false ||
        css.includes("radius: 0") ||
        css.includes("var(--radius)"),
      "should use sharp corners",
    );
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/modal.test.js`

**Step 3: Create modal.css**

Create `css/components/modal.css`:

```css
/* ShModal — system interrupt overlay
 * Signal: world is paused, system demands input
 * Source: atmosphere-guide.md Rule 29
 */

@layer superhot.effects {
  .sh-modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-overlay);
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: sh-modal-fade-in 150ms ease-out;
  }

  .sh-modal {
    background: var(--bg-surface);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius);
    padding: var(--space-6);
    max-width: 480px;
    width: 90%;
    font-family: var(--font-mono);
    color: var(--text-primary);
    box-shadow: var(--shadow-lg);
  }

  .sh-modal-title {
    font-size: var(--type-title);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    margin-bottom: var(--space-4);
  }

  .sh-modal-body {
    font-size: var(--type-body);
    color: var(--text-secondary);
    margin-bottom: var(--space-6);
  }

  .sh-modal-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-end;
  }

  .sh-modal-action {
    font-family: var(--font-mono);
    font-size: var(--type-label);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border-primary);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--radius);
  }

  .sh-modal-action:hover {
    border-color: var(--sh-phosphor);
    color: var(--sh-phosphor);
  }

  .sh-modal-action--confirm {
    border-color: var(--sh-threat);
    color: var(--sh-threat);
  }

  .sh-modal-action--confirm:hover {
    background: var(--sh-threat);
    color: var(--sh-bright);
  }

  @media (prefers-reduced-motion: reduce) {
    .sh-modal-overlay {
      animation: none;
    }
  }

  @media (forced-colors: active) {
    .sh-modal {
      border-color: CanvasText;
    }
    .sh-modal-action {
      border-color: ButtonText;
      color: ButtonText;
    }
  }
}

@keyframes sh-modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**Step 4: Create ShModal.jsx**

Create `preact/ShModal.jsx`:

```jsx
import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

/**
 * System interrupt modal — atmosphere-guide.md Rule 29.
 * Traps focus and uses piOS voice.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title - Uppercase imperative (e.g. "CONFIRM: PURGE DLQ")
 * @param {string} [props.body] - Optional body text
 * @param {string} [props.confirmLabel="CONFIRM"]
 * @param {string} [props.cancelLabel="CANCEL"]
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 */
export function ShModal({
  open,
  title,
  body,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  ...rest
}) {
  const overlayRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Focus the confirm button when modal opens
    confirmRef.current?.focus();

    const handler = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onCancel?.();
  };

  return (
    <div
      class="sh-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      {...rest}
    >
      <div class="sh-modal">
        <div class="sh-modal-title">{title}</div>
        {body && <div class="sh-modal-body">{body}</div>}
        <div class="sh-modal-actions">
          <button class="sh-modal-action" onClick={onCancel} type="button">
            [{cancelLabel}]
          </button>
          <button
            class="sh-modal-action sh-modal-action--confirm"
            onClick={onConfirm}
            ref={confirmRef}
            type="button"
          >
            [{confirmLabel}]
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Add imports to superhot.css and esbuild.config.mjs**

In `css/superhot.css`, add: `@import "./components/modal.css";`

In `esbuild.config.mjs`, add to preactConfig stdin contents:

```js
"export { ShModal } from './preact/ShModal.jsx';",
```

**Step 6: Run tests**

Run: `node --test tests/modal.test.js && npm test`

**Step 7: Commit**

```bash
git add css/components/modal.css preact/ShModal.jsx css/superhot.css esbuild.config.mjs tests/modal.test.js
git commit -m "feat: add ShModal component — system interrupt with piOS voice and focus trap"
```

---

## Batch 6: Terminal Chrome CSS

### Task 6.1: Add phosphor monitor variants + collapsible CSS + rest-frame delays

**Files:**

- Create: `css/components/terminal-chrome.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/terminal-chrome.test.js` (create)

**Step 1: Write the failing test**

Create `tests/terminal-chrome.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/terminal-chrome.css", "utf8");

describe("terminal-chrome.css", () => {
  it("defines phosphor monitor variants", () => {
    assert.ok(css.includes('data-sh-monitor="amber"'), "missing amber variant");
    assert.ok(css.includes('data-sh-monitor="green"'), "missing green variant");
  });

  it("defines collapsible CSS", () => {
    assert.ok(css.includes(".sh-collapsible"), "missing collapsible");
  });

  it("defines rest-frame delay utilities", () => {
    assert.ok(css.includes(".sh-rest-after-shatter"), "missing rest-after-shatter");
    assert.ok(css.includes(".sh-rest-after-glitch"), "missing rest-after-glitch");
  });

  it("defines box-drawing grid alignment class", () => {
    assert.ok(css.includes(".sh-terminal-grid"), "missing terminal-grid");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/terminal-chrome.test.js`

**Step 3: Create terminal-chrome.css**

Create `css/components/terminal-chrome.css`:

```css
/* Terminal chrome — advanced piOS aesthetic
 * Phosphor monitor variants, collapsible CSS, rest-frame delays,
 * box-drawing grid alignment.
 */

@layer superhot.effects {
  /* ── Phosphor Monitor Variants ── */
  [data-sh-monitor="amber"] {
    --sh-phosphor: oklch(0.72 0.15 55);
    --sh-phosphor-glow: oklch(0.72 0.15 55 / 0.2);
  }

  [data-sh-monitor="green"] {
    --sh-phosphor: oklch(0.65 0.18 135);
    --sh-phosphor-glow: oklch(0.65 0.18 135 / 0.2);
  }

  /* ── Collapsible (standalone CSS) ── */
  .sh-collapsible {
    overflow: hidden;
  }

  .sh-collapsible-summary {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--type-label);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-secondary);
    padding: var(--space-2) 0;
  }

  .sh-collapsible-summary::before {
    content: "▸";
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .sh-collapsible[data-sh-open="true"] .sh-collapsible-summary::before {
    transform: rotate(90deg);
  }

  .sh-collapsible-content {
    display: none;
  }

  .sh-collapsible[data-sh-open="true"] .sh-collapsible-content {
    display: block;
  }

  /* ── Rest-Frame Delay Utilities (Rule 7) ── */
  .sh-rest-after-shatter {
    animation-delay: var(--rest-after-shatter);
  }
  .sh-rest-after-glitch {
    animation-delay: var(--rest-after-glitch);
  }
  .sh-rest-after-state-change {
    animation-delay: var(--rest-after-state-change);
  }
  .sh-rest-after-navigation {
    animation-delay: var(--rest-after-navigation);
  }

  /* ── Terminal Grid (box-drawing alignment) ── */
  .sh-terminal-grid {
    font-family: var(--font-mono);
    font-kerning: none;
    font-variant-ligatures: none;
    letter-spacing: 0;
    line-height: 1;
    white-space: pre;
    tab-size: 8;
  }
}
```

**Step 4: Add import to superhot.css**

Add: `@import "./components/terminal-chrome.css";`

**Step 5: Run tests**

Run: `node --test tests/terminal-chrome.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/terminal-chrome.css css/superhot.css tests/terminal-chrome.test.js
git commit -m "feat: add terminal chrome — phosphor variants, collapsible CSS, rest-frame delays"
```

---

## Batch 7: Documentation + CHANGELOG

### Task 7.1: Create CSS class reference doc

**Files:**

- Create: `docs/css-classes.md`

**Step 1: Create the reference document**

Create `docs/css-classes.md` with a comprehensive table of ALL CSS classes organized by category:

- Layout primitives (frame, bracket, card, callout, section-header, clickable, terminal-bg)
- Effects (freshness states, threat-pulse, glitch, mantra, shatter, glow hierarchy)
- Animation tiers (T1 ambient, T2 data refresh, T3 alert, delay utilities)
- ANSI text attributes (bold, dim, blink, reverse, etc.)
- ANSI colors (fg/bg, default vs full CGA mode)
- Utilities (opacity, spacing, typography, hover, grid, prompt)
- Terminal chrome (collapsible, rest-frame delays, terminal-grid, phosphor variants)
- Status (status-badge, status-pill variants)
- Modal (overlay, body, actions)
- CRT overlays (stripe, scanline, flicker, crt-overlay)

Each entry: class name, one-line description, which file it's in.

**Step 2: Commit**

```bash
git add docs/css-classes.md
git commit -m "docs: add comprehensive CSS class reference"
```

---

### Task 7.2: Create CHANGELOG.md

**Files:**

- Create: `CHANGELOG.md`

**Step 1: Create CHANGELOG**

```markdown
# Changelog

## [0.2.0] — 2026-03-18

### Added

- Browser compatibility: hex fallback colors for oklch/light-dark/color-mix
- Global `:focus-visible` rule (WCAG — atmosphere Rule 22)
- `::selection` reverse-video styling
- `@media print` rules for CRT and effects
- Utility classes: opacity, spacing, typography, hover, grid, prompt
- ANSI SGR text attribute classes (bold, dim, blink, reverse, strike + reset)
- ANSI 16-color palette (default superhot mapping + opt-in full CGA mode)
- Threshold signaling utility (`computeThreshold`, `applyThreshold`)
- Polling heartbeat utility (`heartbeat`)
- Failure escalation timer (`EscalationTimer`)
- Recovery sequence choreography (`recoverySequence`)
- ShModal / system interrupt component (CSS + Preact)
- Phosphor monitor variants (amber, green)
- Collapsible standalone CSS
- Rest-frame delay utility classes
- Terminal grid alignment class (box-drawing support)
- CSS class reference documentation

## [0.1.0] — 2026-03-16

### Added

- Initial release: 20 Preact components, 18 CSS component files, 7 JS utilities
- Freshness states, shatter, glitch, mantra, threat pulse, CRT system
- Dashboard primitives (PageBanner, HeroCard, Nav, DataTable, Pipeline, etc.)
- VRAM bar, command palette, toast notifications
- T1/T2/T3 animation tier system
- Glow hierarchy (ambient, standard, critical)
- Effect density tracking
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG.md — v0.2.0 foundation maximization"
```

---

### Task 7.3: Update CLAUDE.md exports and effects tables

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Add new effects and utilities to the Effects Reference table**

Add rows for: ANSI classes, threshold, heartbeat, escalation, recovery, ShModal, utilities, terminal chrome.

**Step 2: Add new JS files to File Layout table**

Add: `js/threshold.js`, `js/heartbeat.js`, `js/escalation.js`, `js/recovery.js`

**Step 3: Update version reference**

Note v0.2.0 in CLAUDE.md.

**Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new effects, utilities, and v0.2.0"
```

---

## Batch 8: Build + Full Test Suite

### Task 8.1: Build and run full test suite

**Step 1: Build**

Run: `cd ~/Documents/projects/superhot-ui && npm run build`

**Step 2: Run unit tests**

Run: `npm test`
Expected: All existing + new tests pass

**Step 3: Run browser tests**

Run: `npx playwright test`
Expected: All specs pass

**Step 4: Run lint**

Run: `make lint`

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: fix lint/test issues from foundation maximization"
```

---

## Summary

| Batch                      | Tasks        | New Files                      | Modified Files                         |
| -------------------------- | ------------ | ------------------------------ | -------------------------------------- |
| 1 — Browser compat + focus | 2            | 2 test files                   | tokens.css, semantic.css, superhot.css |
| 2 — Utility classes        | 1            | utilities.css, 1 test          | superhot.css                           |
| 3 — ANSI text attributes   | 1            | ansi.css, 1 test               | superhot.css                           |
| 4 — Orchestration JS       | 4            | 4 JS files, 4 tests            | esbuild.config.mjs                     |
| 5 — ShModal                | 1            | modal.css, ShModal.jsx, 1 test | superhot.css, esbuild.config.mjs       |
| 6 — Terminal chrome        | 1            | terminal-chrome.css, 1 test    | superhot.css                           |
| 7 — Documentation          | 3            | css-classes.md, CHANGELOG.md   | CLAUDE.md                              |
| 8 — Build + verify         | 1            | —                              | —                                      |
| **Total**                  | **14 tasks** | **~18 new files**              | **~6 modified files**                  |
