# ARIA Design Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract all design patterns from ARIA's dashboard layer into superhot-ui as first-class `sh-*` CSS classes and `Sh*` Preact components, making ARIA a pure consumer.

**Architecture:** Four phases (CSS primitives → Preact components → Nav shell → Charts/Pipeline). Each batch is independently releasable. All CSS follows `@layer superhot.effects` convention. Preact components follow the existing `findByClass` vnode-test pattern.

**Tech Stack:** Vanilla CSS (`@layer`, `@keyframes`, CSS custom properties), Preact 10 + `@preact/signals`, uPlot (Phase 4 only), Node `--test` runner, Playwright for browser tests.

**Source reference:** ARIA patterns live in `~/Documents/projects/ha-aria/aria/dashboard/spa/src/index.css` and `src/components/`. Read them for exact CSS values before implementing each task.

---

## Batch 1: New tokens + frame CSS

### Task 1: Add 5 new tokens to `css/semantic.css`

**Files:**

- Modify: `css/semantic.css` (append to `:root` block)

**Step 1: Add tokens after the existing MISC SPA TOKENS section**

```css
/* ─────────────────────────────────────────
     TERMINAL / CRT TOKENS
     ───────────────────────────────────────── */

--bg-terminal: var(--bg-base); /* terminal surface — consumers override */
--scan-line: oklch(0 0 0 / 0.015); /* CRT stripe color */

/* Warm accent (orange) — T3 alerts, warning borders */
--accent-warm: var(--status-warning);
--accent-warm-glow: var(--status-warning-glow);

/* KPI display size — larger than --type-display for hero metrics */
--type-hero: 2.5rem;
```

**Step 2: Verify build passes**

```bash
cd ~/Documents/projects/superhot-ui && npm run build
```

Expected: `dist/superhot.css` updated, no errors.

**Step 3: Commit**

```bash
git add css/semantic.css
git commit -m "feat: add terminal/CRT tokens and type-hero to semantic.css"
```

---

### Task 2: Create `css/components/frame.css`

**Files:**

- Create: `css/components/frame.css`
- Modify: `css/superhot.css` (add import)

**Step 1: Write failing CSS content test**

```js
// tests/frame.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/frame.css", "utf8");

describe("frame.css", () => {
  it("defines .sh-frame with data-label pseudo-header", () => {
    assert.ok(css.includes(".sh-frame"), "missing .sh-frame");
    assert.ok(css.includes("attr(data-label)"), "missing data-label attr");
    assert.ok(css.includes("attr(data-footer)"), "missing data-footer attr");
  });
  it("hides ::before when data-label absent", () => {
    assert.ok(css.includes(":not([data-label])"), "missing no-label guard");
  });
  it("defines .sh-bracket with pseudo brackets", () => {
    assert.ok(css.includes(".sh-bracket"), "missing .sh-bracket");
    assert.ok(css.includes("'['"), "missing [ bracket");
    assert.ok(css.includes("']'"), "missing ] bracket");
  });
  it("defines .sh-status-pill with variants", () => {
    assert.ok(css.includes(".sh-status-pill"), "missing .sh-status-pill");
    assert.ok(css.includes("--healthy"), "missing healthy variant");
    assert.ok(css.includes("--warning"), "missing warning variant");
    assert.ok(css.includes("--error"), "missing error variant");
  });
  it("defines .sh-cursor-active, working, idle", () => {
    assert.ok(css.includes(".sh-cursor-active"), "missing cursor-active");
    assert.ok(css.includes(".sh-cursor-working"), "missing cursor-working");
    assert.ok(css.includes(".sh-cursor-idle"), "missing cursor-idle");
  });
  it("defines .sh-terminal-bg", () => {
    assert.ok(css.includes(".sh-terminal-bg"), "missing sh-terminal-bg");
    assert.ok(css.includes("repeating-linear-gradient"), "missing CRT stripe");
  });
  it("defines .sh-card and .sh-callout", () => {
    assert.ok(css.includes(".sh-card"), "missing .sh-card");
    assert.ok(css.includes(".sh-callout"), "missing .sh-callout");
  });
  it("cursor blink respects prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing motion media query");
  });
});
```

**Step 2: Run test — expect FAIL**

```bash
cd ~/Documents/projects/superhot-ui && node --test tests/frame.test.js
```

Expected: FAIL — file not found.

**Step 3: Create `css/components/frame.css`**

```css
/* sh-frame — ASCII terminal frame system
 * Signal: structured data container with labeled header/footer
 * Source: ARIA .t-frame, .t-bracket, .t-status, cursor system
 */

@keyframes sh-cursor-blink {
  0%,
  49.9% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@layer superhot.effects {
  /* ── Frame container ── */
  .sh-frame {
    position: relative;
    background: var(--bg-surface);
    border-radius: var(--radius);
    padding: 16px 20px;
    box-shadow: var(--card-shadow);
    transition: box-shadow var(--duration-normal) var(--ease-default);
  }

  .sh-frame::before {
    content: attr(data-label);
    display: block;
    font-family: var(--font-mono);
    font-size: var(--type-label);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .sh-frame::after {
    content: attr(data-footer);
    display: block;
    font-family: var(--font-mono);
    font-size: var(--type-micro);
    color: var(--text-tertiary);
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid var(--border-subtle);
    text-align: right;
  }

  .sh-frame:not([data-label])::before {
    display: none;
  }
  .sh-frame:not([data-footer])::after {
    display: none;
  }

  .sh-frame:hover {
    box-shadow: var(--card-shadow-hover);
  }

  /* ── Base card (simpler than sh-frame — no label system) ── */
  .sh-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    transition:
      background var(--duration-normal) ease,
      border-color var(--duration-normal) ease,
      box-shadow var(--duration-normal) ease,
      transform var(--duration-normal) ease;
  }

  .sh-card:hover {
    border-color: var(--border-primary);
    box-shadow: var(--card-shadow-hover);
  }

  /* ── Callout / info box ── */
  .sh-callout {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-left: 4px solid var(--accent);
    border-radius: var(--radius);
    color: var(--text-secondary);
    box-shadow: var(--card-shadow);
  }

  /* ── Bracket labels — wraps content in [value] ── */
  .sh-bracket {
    font-family: var(--font-mono);
    font-size: var(--type-label);
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  .sh-bracket::before {
    content: "[";
    color: var(--text-tertiary);
  }
  .sh-bracket::after {
    content: "]";
    color: var(--text-tertiary);
  }

  /* ── Status pill — monospace uppercase with left border ── */
  .sh-status-pill {
    font-family: var(--font-mono);
    font-size: var(--type-label);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: var(--radius);
    background: var(--bg-surface-raised);
  }

  .sh-status-pill--healthy {
    color: var(--status-healthy);
    border-left: 3px solid var(--status-healthy);
  }
  .sh-status-pill--warning {
    color: var(--status-warning);
    border-left: 3px solid var(--status-warning);
  }
  .sh-status-pill--error {
    color: var(--status-error);
    border-left: 3px solid var(--status-error);
  }
  .sh-status-pill--waiting {
    color: var(--status-waiting);
    border-left: 3px solid var(--status-waiting);
  }
  .sh-status-pill--active {
    color: var(--status-active);
    border-left: 3px solid var(--status-active);
  }

  /* ── Section header — scan-sweep animated bottom border ── */
  .sh-section-header {
    position: relative;
    overflow: hidden;
    border-bottom: 2px solid var(--border-subtle);
  }

  .sh-section-header::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: sh-t1-scan-sweep-kf 4s ease-in-out infinite;
  }

  /* ── Terminal background texture — CRT scan lines ── */
  .sh-terminal-bg {
    background-color: var(--bg-terminal);
    background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      var(--scan-line) 2px,
      var(--scan-line) 4px
    );
    background-size: 100% 4px;
  }

  /* ── Clickable data affordance — terminal-style hover ── */
  .sh-clickable {
    cursor: pointer;
    transition:
      background var(--duration-fast) ease,
      border-color var(--duration-fast) ease;
    border-left: 2px solid transparent;
    padding-left: 4px;
  }

  .sh-clickable:hover {
    background: var(--bg-surface-raised);
    border-left-color: var(--accent);
  }

  /* ── Cursor system — state indicators ── */

  .sh-cursor-active::after {
    content: "\2588"; /* █ full block */
    font-family: var(--font-mono);
    color: var(--text-primary);
    margin-left: 2px;
    animation: sh-cursor-blink 1s step-end infinite;
  }

  .sh-cursor-working::after {
    content: "\258A"; /* ▊ left 3/4 block */
    font-family: var(--font-mono);
    color: var(--text-primary);
    margin-left: 2px;
    animation: sh-cursor-blink 0.5s step-end infinite;
  }

  .sh-cursor-idle::after {
    content: "_";
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    margin-left: 2px;
    animation: sh-cursor-blink 2s step-end infinite;
  }

  /* Phone: smaller cursors, hide idle */
  @media (max-width: 639px) {
    .sh-frame {
      padding: 12px 16px;
      border-radius: 0;
    }
    .sh-frame::before {
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .sh-frame::after {
      padding-top: 8px;
      margin-top: 8px;
    }
    .sh-terminal-bg {
      background-image: none;
    }
    .sh-cursor-active::after,
    .sh-cursor-working::after,
    .sh-cursor-idle::after {
      font-size: 0.75em;
    }
    .sh-cursor-idle::after {
      display: none;
    }
  }

  /* Tablet: no terminal texture except section headers */
  @media (min-width: 640px) and (max-width: 1023px) {
    .sh-terminal-bg:not(.sh-section-header) {
      background-image: none;
    }
  }

  /* Reduced motion: static symbols, no blink */
  @media (prefers-reduced-motion: reduce) {
    .sh-cursor-active::after,
    .sh-cursor-working::after,
    .sh-cursor-idle::after {
      animation: none;
      opacity: 1;
    }
    .sh-section-header::after {
      animation: none;
    }
  }
}
```

**Step 4: Add import to `css/superhot.css`** (after existing component imports)

```css
@import "./components/frame.css";
```

**Step 5: Run test — expect PASS**

```bash
node --test tests/frame.test.js
```

**Step 6: Build and commit**

```bash
npm run build
git add css/components/frame.css css/superhot.css tests/frame.test.js
git commit -m "feat: add sh-frame, sh-bracket, sh-status-pill, sh-cursor, sh-terminal-bg"
```

---

## Batch 2: Banner + CRT overlay

### Task 3: Create `css/components/banner.css`

**Files:**

- Create: `css/components/banner.css`
- Modify: `css/superhot.css`

**Step 1: Write failing test**

```js
// tests/banner.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/banner.css", "utf8");

describe("banner.css", () => {
  it("defines .sh-page-banner", () => {
    assert.ok(css.includes(".sh-page-banner"), "missing .sh-page-banner");
  });
  it("has scan beam animation via ::after", () => {
    assert.ok(css.includes("sh-banner-scan"), "missing sh-banner-scan keyframe");
  });
  it("has phosphor glow animation", () => {
    assert.ok(css.includes("sh-banner-glow"), "missing sh-banner-glow keyframe");
  });
  it("disables animations under prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion rule");
  });
});
```

**Step 2: Run — expect FAIL**

```bash
node --test tests/banner.test.js
```

**Step 3: Create `css/components/banner.css`**

```css
/* sh-page-banner — ASCII terminal page header
 * Signal: page identity / navigation wayfinding
 * Aesthetic: piOS Norton Commander — CRT phosphor, scan beam, flicker
 * Source: ARIA .page-banner-sh
 */

@keyframes sh-banner-scan {
  0% {
    left: -20%;
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    left: 120%;
    opacity: 0;
  }
}

@keyframes sh-banner-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 2px var(--accent)) drop-shadow(0 0 0 transparent);
  }
  50% {
    filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 12px var(--accent-glow));
  }
}

@keyframes sh-banner-flicker {
  0% {
    opacity: 0.97;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.98;
  }
}

@layer superhot.effects {
  .sh-page-banner {
    position: relative;
    overflow: hidden;
    padding: 0.75rem 1rem;
    background: var(--bg-terminal);
    border: 1px solid var(--border-subtle);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius);
    animation: sh-banner-flicker 4s ease-in-out infinite;
  }

  /* CRT scan-line stripes overlay */
  .sh-page-banner::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      var(--scan-line) 2px,
      var(--scan-line) 4px
    );
    pointer-events: none;
    z-index: 2;
  }

  /* Horizontal scan beam sweep */
  .sh-page-banner::after {
    content: "";
    position: absolute;
    top: 0;
    left: -20%;
    width: 8%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
    opacity: 0;
    pointer-events: none;
    z-index: 3;
    animation: sh-banner-scan 6s linear infinite;
  }

  /* SVG pixel text — phosphor glow */
  .sh-page-banner svg {
    position: relative;
    z-index: 1;
    animation: sh-banner-glow 4s ease-in-out infinite;
  }

  /* Subtitle */
  .sh-page-banner p {
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
    position: relative;
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .sh-page-banner {
      animation: none;
    }
    .sh-page-banner svg {
      animation: none;
      filter: drop-shadow(0 0 4px var(--accent));
    }
    .sh-page-banner::after {
      animation: none;
      display: none;
    }
  }
}
```

**Step 4: Add import to `css/superhot.css`**

```css
@import "./components/banner.css";
```

**Step 5: Run test — expect PASS, then build and commit**

```bash
node --test tests/banner.test.js && npm run build
git add css/components/banner.css css/superhot.css tests/banner.test.js
git commit -m "feat: add sh-page-banner with scan beam and phosphor glow"
```

---

### Task 4: Create `css/components/crt-overlay.css`

**Files:**

- Create: `css/components/crt-overlay.css`
- Modify: `css/superhot.css`

**Step 1: Create `css/components/crt-overlay.css`**

```css
/* sh-crt-overlay — full-page CRT scanline overlay
 * Signal: global terminal aesthetic context
 * Usage: add <div class="sh-crt-overlay"></div> as first child of body
 * Source: ARIA .crt-overlay
 */

@layer superhot.crt {
  .sh-crt-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      var(--scan-line) 2px,
      var(--scan-line) 4px
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .sh-crt-overlay {
      display: none;
    }
  }
}
```

**Step 2: Add import to `css/superhot.css`**

```css
@import "./components/crt-overlay.css";
```

**Step 3: Build and commit**

```bash
npm run build
git add css/components/crt-overlay.css css/superhot.css
git commit -m "feat: add sh-crt-overlay full-page scanline"
```

---

## Batch 3: Animation tiers

### Task 5: Create `css/components/animations.css`

**Files:**

- Create: `css/components/animations.css`
- Modify: `css/superhot.css`

**Step 1: Write failing test**

```js
// tests/animations.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/animations.css", "utf8");

describe("animations.css", () => {
  it("defines all T1 ambient classes", () => {
    for (const cls of [
      "sh-t1-scan-sweep",
      "sh-t1-grid-pulse",
      "sh-t1-border-shimmer",
      "sh-t1-data-stream",
      "sh-t1-scan-line",
      "sh-t1-pulse-ring",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines all T2 data refresh classes", () => {
    for (const cls of ["sh-t2-typewriter", "sh-t2-tick-flash", "sh-t2-bar-grow"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines all T3 alert classes", () => {
    for (const cls of [
      "sh-t3-orange-pulse",
      "sh-t3-border-alert",
      "sh-t3-badge-appear",
      "sh-t3-counter-bump",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines utility classes", () => {
    assert.ok(css.includes(".sh-animate-page-enter"), "missing page-enter");
    assert.ok(css.includes(".sh-animate-data-refresh"), "missing data-refresh");
    assert.ok(css.includes(".sh-stagger-children"), "missing stagger-children");
  });
  it("T1 disabled on phone", () => {
    assert.ok(css.includes("max-width: 639px"), "missing phone breakpoint");
  });
  it("all tiers off under prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});
```

**Step 2: Run — expect FAIL**

```bash
node --test tests/animations.test.js
```

**Step 3: Create `css/components/animations.css`**

```css
/* ARIA Animation Tier System
 * T1: Ambient — always-on decorative, lowest energy
 * T2: Data Refresh — one-shot triggered by data update
 * T3: Status Alert — strongest attention, auto-expires
 *
 * Usage: add/remove class on element. JS removes after animationend for T2/T3.
 * Source: ARIA index.css animation tier system
 */

/* ── Keyframes ── */

@keyframes sh-t1-scan-sweep-kf {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes sh-t1-grid-pulse-kf {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes sh-t1-border-shimmer-kf {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes sh-t1-data-stream-kf {
  0% {
    transform: translateY(8px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-8px);
    opacity: 0;
  }
}

@keyframes sh-t1-scan-line-kf {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100%);
  }
}

@keyframes sh-t1-pulse-ring-kf {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  50% {
    box-shadow: 0 0 0 4px oklch(0 0 0 / 0);
  }
}

@keyframes sh-t2-typewriter-kf {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sh-t2-tick-flash-kf {
  0% {
    background-color: var(--accent-glow);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes sh-t2-bar-grow-kf {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@keyframes sh-t3-orange-pulse-kf {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--accent-warm-glow);
  }
  50% {
    box-shadow: 0 0 0 6px var(--accent-warm-glow);
  }
}

@keyframes sh-t3-border-alert-kf {
  0% {
    border-left-color: var(--accent-warm);
  }
  50% {
    border-left-color: var(--accent);
  }
  100% {
    border-left-color: var(--border-subtle);
  }
}

@keyframes sh-t3-badge-appear-kf {
  0% {
    opacity: 0;
    transform: translateX(12px);
  }
  70% {
    transform: translateX(-2px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes sh-t3-counter-bump-kf {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes sh-page-enter-kf {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sh-data-refresh-kf {
  0% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  50% {
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  100% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
}

@keyframes sh-fade-in-up-kf {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Tier 1: Ambient ── */

@layer superhot.effects {
  .sh-t1-scan-sweep {
    animation: sh-t1-scan-sweep-kf 6s ease-in-out infinite;
  }
  .sh-t1-grid-pulse {
    animation: sh-t1-grid-pulse-kf 8s ease-in-out infinite;
  }
  .sh-t1-border-shimmer {
    background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
    background-size: 200% 100%;
    animation: sh-t1-border-shimmer-kf 3s ease-in-out infinite;
  }
  .sh-t1-data-stream {
    animation: sh-t1-data-stream-kf 2s ease-in-out infinite;
  }
  .sh-t1-scan-line {
    animation: sh-t1-scan-line-kf 3s linear infinite;
  }
  .sh-t1-pulse-ring {
    animation: sh-t1-pulse-ring-kf 3s ease-in-out infinite;
  }

  /* ── Tier 2: Data Refresh ── */

  .sh-t2-typewriter {
    animation: sh-t2-typewriter-kf 0.3s ease-out;
  }
  .sh-t2-tick-flash {
    animation: sh-t2-tick-flash-kf 0.4s ease-out;
  }
  .sh-t2-bar-grow {
    animation: sh-t2-bar-grow-kf 0.5s ease-out;
    transform-origin: bottom;
  }

  /* ── Tier 3: Status Alert ── */

  .sh-t3-orange-pulse {
    animation: sh-t3-orange-pulse-kf 0.6s ease-out 3;
  }
  .sh-t3-border-alert {
    animation: sh-t3-border-alert-kf 1s ease-out forwards;
    border-left: 3px solid var(--accent-warm);
  }
  .sh-t3-badge-appear {
    animation: sh-t3-badge-appear-kf 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .sh-t3-counter-bump {
    animation: sh-t3-counter-bump-kf 0.3s ease-out;
  }

  /* ── Utilities ── */

  .sh-animate-page-enter {
    animation: sh-page-enter-kf 0.25s ease-out both;
  }
  .sh-animate-data-refresh {
    animation: sh-data-refresh-kf 0.3s ease-out;
  }

  /* Stagger children — parent receives this class; 10 child slots */
  .sh-stagger-children > * {
    opacity: 0;
    animation: sh-fade-in-up-kf 0.4s ease-out forwards;
  }
  .sh-stagger-children > *:nth-child(1) {
    animation-delay: 0.05s;
  }
  .sh-stagger-children > *:nth-child(2) {
    animation-delay: 0.1s;
  }
  .sh-stagger-children > *:nth-child(3) {
    animation-delay: 0.15s;
  }
  .sh-stagger-children > *:nth-child(4) {
    animation-delay: 0.2s;
  }
  .sh-stagger-children > *:nth-child(5) {
    animation-delay: 0.25s;
  }
  .sh-stagger-children > *:nth-child(6) {
    animation-delay: 0.3s;
  }
  .sh-stagger-children > *:nth-child(7) {
    animation-delay: 0.35s;
  }
  .sh-stagger-children > *:nth-child(8) {
    animation-delay: 0.4s;
  }
  .sh-stagger-children > *:nth-child(9) {
    animation-delay: 0.45s;
  }
  .sh-stagger-children > *:nth-child(10) {
    animation-delay: 0.5s;
  }

  /* Animation delay utilities */
  .sh-delay-100 {
    animation-delay: 0.1s;
  }
  .sh-delay-200 {
    animation-delay: 0.2s;
  }
  .sh-delay-300 {
    animation-delay: 0.3s;
  }
  .sh-delay-400 {
    animation-delay: 0.4s;
  }
  .sh-delay-500 {
    animation-delay: 0.5s;
  }
  .sh-delay-600 {
    animation-delay: 0.6s;
  }
  .sh-delay-700 {
    animation-delay: 0.7s;
  }
  .sh-delay-800 {
    animation-delay: 0.8s;
  }

  /* ── Responsive: phone — T1 off ── */
  @media (max-width: 639px) {
    .sh-t1-scan-sweep,
    .sh-t1-grid-pulse,
    .sh-t1-border-shimmer,
    .sh-t1-data-stream,
    .sh-t1-scan-line,
    .sh-t1-pulse-ring {
      animation: none;
    }
  }

  /* Tablet — reduce T1 */
  @media (min-width: 640px) and (max-width: 1023px) {
    .sh-t1-grid-pulse,
    .sh-t1-border-shimmer,
    .sh-t1-data-stream {
      animation: none;
    }
  }

  /* Reduced motion — T1 + T2 off; T3 degrades to static color */
  @media (prefers-reduced-motion: reduce) {
    [class*="sh-t1-"],
    [class*="sh-t2-"],
    .sh-animate-page-enter,
    .sh-animate-data-refresh,
    .sh-stagger-children > * {
      animation: none !important;
      opacity: 1 !important;
    }

    .sh-t3-orange-pulse {
      animation: none;
      box-shadow: 0 0 0 4px var(--accent-warm-glow);
    }
    .sh-t3-border-alert {
      animation: none;
      border-left-color: var(--accent-warm);
    }
    .sh-t3-badge-appear {
      animation: none;
      opacity: 1;
    }
    .sh-t3-counter-bump {
      animation: none;
    }
  }
}
```

**Step 4: Add import to `css/superhot.css`**

```css
@import "./components/animations.css";
```

**Step 5: Run tests — expect PASS, build, commit**

```bash
node --test tests/animations.test.js && npm run build
git add css/components/animations.css css/superhot.css tests/animations.test.js
git commit -m "feat: add T1/T2/T3 animation tiers with responsive and reduced-motion rules"
```

---

## Batch 4: ShPageBanner component

### Task 6: Create `preact/ShPageBanner.jsx`

**Files:**

- Create: `preact/ShPageBanner.jsx`
- Create: `tests/banner-component.test.js`

**Step 1: Write failing test**

```js
// tests/banner-component.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShPageBanner } from "../dist/superhot.preact.js";

function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const children = vnode.props?.children;
  const kids = Array.isArray(children) ? children : children ? [children] : [];
  for (const c of kids) results.push(...findByType(c, type));
  return results;
}

describe("ShPageBanner", () => {
  it("renders .sh-page-banner wrapper", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    assert.ok(v.props?.class?.includes("sh-page-banner"), "missing sh-page-banner class");
  });
  it("renders an svg element", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    const svgs = findByType(v, "svg");
    assert.ok(svgs.length > 0, "no svg rendered");
  });
  it("renders subtitle p when subtitle provided", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME", subtitle: "test" });
    const ps = findByType(v, "p");
    assert.ok(ps.length > 0, "no subtitle p rendered");
  });
  it("renders no subtitle p when not provided", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    const ps = findByType(v, "p");
    assert.equal(ps.length, 0, "unexpected subtitle p rendered");
  });
  it("uses custom separator", () => {
    const v = ShPageBanner({ namespace: "SH", page: "TEST", separator: "+" });
    const svgs = findByType(v, "svg");
    assert.ok(svgs.length > 0, "svg not rendered with custom separator");
  });
});
```

**Step 2: Run — expect FAIL (build then test)**

```bash
npm run build && node --test tests/banner-component.test.js
```

**Step 3: Create `preact/ShPageBanner.jsx`**

```jsx
/**
 * ShPageBanner — pixel-art SVG page header.
 * Renders "NAMESPACE ✦ PAGE" in a 5-row bitmap pixel font.
 * Wraps in .sh-page-banner with CRT scan effects.
 *
 * @param {Object} props
 * @param {string} props.namespace  Left word (e.g. "ARIA")
 * @param {string} props.page       Right word (e.g. "HOME")
 * @param {string} [props.separator="✦"]  Center separator character
 * @param {string} [props.subtitle] Optional subtitle text below banner
 */
import { useMemo } from "preact/hooks";

// 5-row pixel font — each char as array of binary row strings
const FONT = {
  A: ["01110", "11011", "11111", "11011", "11011"],
  B: ["11110", "11011", "11110", "11011", "11110"],
  C: ["0111", "1100", "1100", "1100", "0111"],
  D: ["11110", "11011", "11011", "11011", "11110"],
  E: ["1111", "1100", "1110", "1100", "1111"],
  F: ["1111", "1100", "1110", "1100", "1100"],
  G: ["01110", "11000", "11011", "11011", "01110"],
  H: ["11011", "11011", "11111", "11011", "11011"],
  I: ["1", "1", "1", "1", "1"],
  J: ["0111", "0011", "0011", "1011", "0110"],
  K: ["11001", "11010", "11100", "11010", "11001"],
  L: ["1100", "1100", "1100", "1100", "1111"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001"],
  O: ["01110", "11011", "11011", "11011", "01110"],
  P: ["11110", "11011", "11110", "11000", "11000"],
  Q: ["01110", "11011", "11011", "11010", "01101"],
  R: ["11111", "11011", "11110", "11010", "11001"],
  S: ["0111", "1100", "0110", "0011", "1110"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  U: ["11011", "11011", "11011", "11011", "01110"],
  V: ["10001", "10001", "01010", "01010", "00100"],
  W: ["10001", "10001", "10101", "10101", "01010"],
  X: ["10001", "01010", "00100", "01010", "10001"],
  Y: ["10001", "01010", "00100", "00100", "00100"],
  Z: ["11111", "00010", "00100", "01000", "11111"],
  " ": ["00", "00", "00", "00", "00"],
};

// Cross/plus separator
const SEP_PATTERN = ["000", "010", "111", "010", "000"];

const UNIT = 10;
const GAP = 2;
const SIZE = UNIT - GAP;
const RX = 1;
const LETTER_GAP = 2;
const WORD_GAP = 3;

function layoutText(text) {
  let cursor = 0;
  const pixels = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toUpperCase();
    const pattern = FONT[ch];
    if (!pattern) continue;
    const width = pattern[0].length;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < width; col++) {
        if (pattern[row][col] === "1") pixels.push([cursor + col, row]);
      }
    }
    cursor += width + LETTER_GAP;
  }
  return { pixels, endX: cursor > 0 ? cursor - LETTER_GAP : 0 };
}

function layoutSep(offsetX) {
  const pixels = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      if (SEP_PATTERN[row][col] === "1") pixels.push([offsetX + col, row]);
    }
  }
  return { pixels, endX: offsetX + 3 };
}

export function ShPageBanner({ namespace = "", page = "", separator, subtitle }) {
  const layout = useMemo(() => {
    const ns = layoutText(namespace);
    const sepStart = ns.endX + WORD_GAP;
    const sep = layoutSep(sepStart);
    const pgStart = sep.endX + WORD_GAP;
    const pg = layoutText(page);
    const pgPixels = pg.pixels.map(([c, r]) => [c + pgStart, r]);
    const totalWidth = (pgStart + pg.endX) * UNIT + UNIT;
    return { nsPixels: ns.pixels, sepPixels: sep.pixels, pgPixels, totalWidth };
  }, [namespace, page]);

  return (
    <div class="sh-page-banner" style="margin-bottom: 1.5rem">
      <svg
        viewBox={`0 0 ${layout.totalWidth} ${5 * UNIT}`}
        style="height: 2rem; max-width: 100%; width: auto; display: block;"
        role="img"
        aria-label={`${namespace} ${page}`}
      >
        {layout.nsPixels.map(([c, r], i) => (
          <rect
            key={`n${i}`}
            x={c * UNIT + GAP / 2}
            y={r * UNIT + GAP / 2}
            width={SIZE}
            height={SIZE}
            rx={RX}
            fill="var(--accent)"
          />
        ))}
        {layout.sepPixels.map(([c, r], i) => (
          <rect
            key={`s${i}`}
            x={c * UNIT + GAP / 2}
            y={r * UNIT + GAP / 2}
            width={SIZE}
            height={SIZE}
            rx={RX}
            fill="var(--text-tertiary)"
          />
        ))}
        {layout.pgPixels.map(([c, r], i) => (
          <rect
            key={`p${i}`}
            x={c * UNIT + GAP / 2}
            y={r * UNIT + GAP / 2}
            width={SIZE}
            height={SIZE}
            rx={RX}
            fill="var(--text-primary)"
          />
        ))}
      </svg>
      {subtitle && (
        <p style="margin-top: 0.5rem; font-size: var(--type-label); color: var(--text-secondary)">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default ShPageBanner;
```

**Step 4: Build, run tests — expect PASS**

```bash
npm run build && node --test tests/banner-component.test.js
```

**Step 5: Commit**

```bash
git add preact/ShPageBanner.jsx tests/banner-component.test.js
git commit -m "feat: add ShPageBanner — pixel-art SVG terminal page header"
```

---

## Batch 5: ShHeroCard + ShCollapsible

### Task 7: Create `preact/ShHeroCard.jsx`

**Files:**

- Create: `preact/ShHeroCard.jsx`
- Create: `css/components/hero-card.css`
- Modify: `css/superhot.css`

**Step 1: Write failing test**

```js
// tests/hero-card.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShHeroCard } from "../dist/superhot.preact.js";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  const c = vnode.props?.class ?? vnode.props?.className ?? "";
  if (c.includes(cls)) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const child of arr) results.push(...findByClass(child, cls));
  return results;
}

describe("ShHeroCard", () => {
  it("renders .sh-frame wrapper", () => {
    const v = ShHeroCard({ value: "42", label: "Anomalies" });
    const frames = findByClass(v, "sh-frame");
    assert.ok(frames.length > 0, "missing sh-frame");
  });
  it("applies cursor-active class when not loading", () => {
    const v = ShHeroCard({ value: "42", label: "Test" });
    const frames = findByClass(v, "sh-cursor-active");
    assert.ok(frames.length > 0, "expected sh-cursor-active");
  });
  it("applies cursor-working class when loading", () => {
    const v = ShHeroCard({ value: null, label: "Test", loading: true });
    const frames = findByClass(v, "sh-cursor-working");
    assert.ok(frames.length > 0, "expected sh-cursor-working");
  });
  it("renders value when provided", () => {
    const v = ShHeroCard({ value: "99", label: "Test" });
    const str = JSON.stringify(v);
    assert.ok(str.includes("99"), "value not rendered");
  });
  it("renders em-dash when value is null", () => {
    const v = ShHeroCard({ value: null, label: "Test" });
    const str = JSON.stringify(v);
    assert.ok(str.includes("\\u2014") || str.includes("—"), "missing em-dash for null value");
  });
  it("wraps in anchor when href provided", () => {
    const v = ShHeroCard({ value: "5", label: "Test", href: "#/test" });
    assert.equal(v.type, "a", "expected anchor wrapper");
    assert.equal(v.props.href, "#/test");
  });
});
```

**Step 2: Run — expect FAIL**

```bash
npm run build && node --test tests/hero-card.test.js
```

**Step 3: Create `css/components/hero-card.css`**

```css
/* sh-hero-card — KPI metric card with freshness and sparkline
 * Built on sh-frame — inherits all frame styles
 */
@layer superhot.effects {
  .sh-hero-value {
    font-family: var(--font-mono);
    font-size: var(--type-hero);
    font-weight: 600;
    color: var(--accent);
    line-height: 1;
  }

  .sh-hero-unit {
    font-family: var(--font-mono);
    font-size: var(--type-headline);
    color: var(--text-tertiary);
  }

  .sh-hero-delta {
    font-size: var(--type-label);
    color: var(--text-secondary);
    margin-top: 8px;
    font-family: var(--font-mono);
  }

  .sh-hero-card--warning .sh-hero-value {
    color: var(--status-warning);
  }
}
```

**Step 4: Add import to `css/superhot.css`**

```css
@import "./components/hero-card.css";
```

**Step 5: Create `preact/ShHeroCard.jsx`**

```jsx
/**
 * ShHeroCard — KPI metric card with data freshness and optional sparkline.
 * Uses .sh-frame with cursor system and data-sh-state for staleness.
 *
 * @param {Object} props
 * @param {*}       props.value      Display value (null → em-dash)
 * @param {string}  props.label      Frame header label
 * @param {string}  [props.unit]     Unit suffix (e.g. "%", "kW")
 * @param {string}  [props.delta]    Trend text below value
 * @param {boolean} [props.warning]  Warning state — amber value + border
 * @param {boolean} [props.loading]  Loading state — cursor-working
 * @param {Array}   [props.sparkData] uPlot data for sparkline
 * @param {string}  [props.sparkColor] Sparkline color token
 * @param {string}  [props.timestamp] ISO timestamp for freshness
 * @param {string}  [props.href]     Wraps card in <a> when provided
 */
import { useEffect, useRef } from "preact/hooks";
import { computeFreshness } from "../js/freshness.js";

export function ShHeroCard({
  value,
  label,
  unit,
  delta,
  warning,
  loading,
  sparkData,
  sparkColor,
  timestamp,
  href,
}) {
  const cursorClass = loading ? "sh-cursor-working" : "sh-cursor-active";
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    function update() {
      const state = timestamp ? computeFreshness(timestamp) : null;
      if (state) ref.current.setAttribute("data-sh-state", state);
      else ref.current.removeAttribute("data-sh-state");
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [timestamp]);

  // Lazy-load ShTimeChart — avoids hard dep if uPlot not installed
  const hasSparkline = sparkData && Array.isArray(sparkData[0]) && sparkData[0].length > 1;

  const cardContent = (
    <div
      ref={ref}
      class={`sh-frame ${cursorClass}${warning ? " sh-hero-card--warning" : ""}`}
      data-label={label}
      style={warning ? "border-left: 3px solid var(--status-warning);" : ""}
    >
      <div style="display: flex; align-items: baseline; gap: 8px; justify-content: space-between;">
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span class="sh-hero-value">{value ?? "\u2014"}</span>
          {unit && <span class="sh-hero-unit">{unit}</span>}
        </div>
        {hasSparkline && (
          <div style="width: 80px; height: 32px; flex-shrink: 0;" aria-hidden="true" />
        )}
      </div>
      {delta && <div class="sh-hero-delta">{delta}</div>}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        class="sh-clickable"
        style="display: block; text-decoration: none; color: inherit;"
      >
        {cardContent}
      </a>
    );
  }
  return cardContent;
}

export default ShHeroCard;
```

**Note:** Sparkline slot is reserved (80×32px div). Wire `ShTimeChart` into it after Phase 4.

**Step 6: Export from preact barrel** — open `preact/` and confirm `ShHeroCard` is picked up by esbuild stdin barrel (check `esbuild.config.mjs` for the barrel pattern; add an explicit import if needed).

**Step 7: Build, run tests — expect PASS**

```bash
npm run build && node --test tests/hero-card.test.js
```

**Step 8: Commit**

```bash
git add preact/ShHeroCard.jsx css/components/hero-card.css css/superhot.css tests/hero-card.test.js
git commit -m "feat: add ShHeroCard — KPI card with freshness and cursor state"
```

---

### Task 8: Create `preact/ShCollapsible.jsx`

**Files:**

- Create: `preact/ShCollapsible.jsx`
- Create: `tests/collapsible.test.js`

**Step 1: Write failing test**

```js
// tests/collapsible.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShCollapsible } from "../dist/superhot.preact.js";

function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const c of arr) results.push(...findByType(c, type));
  return results;
}

describe("ShCollapsible", () => {
  it("renders a button toggle", () => {
    const v = ShCollapsible({ title: "Section" });
    const btns = findByType(v, "button");
    assert.ok(btns.length > 0, "no button rendered");
  });
  it("button has aria-expanded", () => {
    const v = ShCollapsible({ title: "Section", defaultOpen: true });
    const btns = findByType(v, "button");
    assert.ok(btns[0].props["aria-expanded"] !== undefined, "missing aria-expanded");
  });
  it("renders title text", () => {
    const v = ShCollapsible({ title: "My Section" });
    assert.ok(JSON.stringify(v).includes("My Section"), "title not rendered");
  });
});
```

**Step 2: Create `preact/ShCollapsible.jsx`**

```jsx
/**
 * ShCollapsible — collapsible section with cursor-as-toggle affordance.
 * Cursor IS the expand/collapse indicator:
 *   sh-cursor-active (█ 1s blink) = expanded
 *   sh-cursor-working (▊ 0.5s blink) = loading
 *   sh-cursor-idle (_ 2s blink) = collapsed
 *
 * @param {Object}  props
 * @param {string}  props.title
 * @param {string}  [props.subtitle]    Shown when expanded
 * @param {string}  [props.summary]     Shown in bracket label when collapsed
 * @param {boolean} [props.defaultOpen] Default true
 * @param {boolean} [props.loading]     Disables toggle, shows working cursor
 * @param {*}       props.children
 */
import { useState } from "preact/hooks";

export function ShCollapsible({
  title,
  subtitle,
  summary,
  defaultOpen = true,
  loading = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  let cursorClass = "sh-cursor-idle";
  if (loading) cursorClass = "sh-cursor-working";
  else if (open) cursorClass = "sh-cursor-active";

  function toggle() {
    if (!loading) setOpen(!open);
  }

  return (
    <section>
      <button
        type="button"
        onClick={toggle}
        class={cursorClass}
        style="width: 100%; text-align: left; display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; background: none; border: none; border-bottom: 1px solid var(--border-subtle);"
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
      >
        <div style="flex: 1; min-width: 0;">
          <span style="font-size: var(--type-headline); color: var(--text-primary); font-family: var(--font-mono); font-weight: 700;">
            {title}
          </span>
          {!open && summary && (
            <span class="sh-bracket" style="margin-left: 8px;">
              {summary}
            </span>
          )}
          {open && subtitle && (
            <p style="font-size: var(--type-label); color: var(--text-tertiary); margin-top: 2px;">
              {subtitle}
            </p>
          )}
        </div>
      </button>
      {open && (
        <div class="sh-animate-page-enter" style="padding-top: 12px;">
          {children}
        </div>
      )}
    </section>
  );
}

export default ShCollapsible;
```

**Step 3: Build, run tests, commit**

```bash
npm run build && node --test tests/collapsible.test.js
git add preact/ShCollapsible.jsx tests/collapsible.test.js
git commit -m "feat: add ShCollapsible — cursor-as-toggle collapsible section"
```

---

## Batch 6: ShErrorState + ShStatsGrid + ShDataTable

### Task 9: Create `preact/ShErrorState.jsx`

```jsx
/**
 * ShErrorState — terminal-styled error fallback.
 * @param {Object}   props
 * @param {string}   [props.title="Error"]
 * @param {string}   [props.message]
 * @param {Function} [props.onRetry]
 */
export function ShErrorState({ title = "Error", message, onRetry }) {
  return (
    <div class="sh-frame" role="alert" aria-live="assertive">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="color: var(--status-error); font-family: var(--font-mono); font-weight: 700;">
          ✕ {title}
        </span>
      </div>
      {message && (
        <p style="font-family: var(--font-mono); font-size: var(--type-label); color: var(--text-secondary); margin-bottom: 12px;">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style="background: var(--bg-surface-raised); color: var(--text-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: 4px 12px; font-family: var(--font-mono); font-size: var(--type-label); cursor: pointer;"
        >
          RETRY
        </button>
      )}
    </div>
  );
}

export default ShErrorState;
```

### Task 10: Create `preact/ShStatsGrid.jsx`

```jsx
/**
 * ShStatsGrid — labeled value grid for key metrics.
 * @param {Object}   props
 * @param {Array}    props.stats  Array of { label, value, unit? }
 * @param {number}   [props.cols] Grid columns — default auto (2 phone, 3 tablet+)
 */
export function ShStatsGrid({ stats = [], cols }) {
  const gridStyle = cols
    ? `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 12px;`
    : "display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;";

  return (
    <div style={gridStyle}>
      {stats.map((stat, i) => (
        <div key={i} style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-family: var(--font-mono); font-size: var(--type-label); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">
            {stat.label}
          </span>
          <span style="font-family: var(--font-mono); font-size: var(--type-headline); font-weight: 600; color: var(--text-primary);">
            {stat.value ?? "\u2014"}
            {stat.unit && (
              <span style="font-size: var(--type-label); color: var(--text-secondary); margin-left: 3px;">
                {stat.unit}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ShStatsGrid;
```

### Task 11: Create `preact/ShDataTable.jsx` + `css/components/data-table.css`

**`css/components/data-table.css`:**

```css
/* sh-data-table — searchable/sortable data table */
@layer superhot.effects {
  .sh-data-table {
    width: 100%;
  }
  .sh-data-table-search {
    width: 100%;
    background: var(--bg-inset);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--type-label);
    padding: 6px 10px;
    margin-bottom: 12px;
    box-sizing: border-box;
  }
  .sh-data-table-search:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }
  .sh-data-table table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: var(--type-label);
  }
  .sh-data-table th {
    text-align: left;
    padding: 6px 10px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-subtle);
    cursor: default;
    white-space: nowrap;
    user-select: none;
  }
  .sh-data-table th[data-sortable="true"] {
    cursor: pointer;
  }
  .sh-data-table th[data-sortable="true"]:hover {
    color: var(--text-primary);
  }
  .sh-data-table th[data-sort-active="true"] {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  .sh-data-table td {
    padding: 6px 10px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }
  .sh-data-table tr:hover td {
    background: var(--table-row-hover-bg);
  }
  .sh-data-table-empty {
    text-align: center;
    padding: 24px;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: var(--type-label);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  @media (max-width: 639px) {
    .sh-data-table td,
    .sh-data-table th {
      padding: 4px 8px;
    }
  }
}
```

**`preact/ShDataTable.jsx`:**

```jsx
/**
 * ShDataTable — searchable, sortable data table.
 * No pagination (v1). Scrollable container for large datasets.
 *
 * @param {Object}   props
 * @param {Array}    props.columns  [{ key, label, sortable? }]
 * @param {Array}    props.rows     Array of row objects
 * @param {boolean}  [props.searchable=true]
 * @param {string}   [props.label]  sh-frame data-label
 */
import { useState, useMemo } from "preact/hooks";

export function ShDataTable({ columns = [], rows = [], searchable = true, label }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    let result = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, query, sortKey, sortDir, columns]);

  function handleSort(key) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div class="sh-frame sh-data-table" data-label={label || undefined}>
      {searchable && (
        <input
          type="search"
          class="sh-data-table-search"
          placeholder="SEARCH..."
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          aria-label="Search table"
        />
      )}
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  data-sortable={col.sortable ? "true" : "false"}
                  data-sort-active={sortKey === col.key ? "true" : "false"}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colspan={columns.length} class="sh-data-table-empty">
                  NO RESULTS
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} title={String(row[col.key] ?? "")}>
                      {row[col.key] ?? "\u2014"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShDataTable;
```

**Add to `css/superhot.css`:**

```css
@import "./components/data-table.css";
```

**Write tests for all three:**

```js
// tests/stats-error-table.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShErrorState, ShStatsGrid, ShDataTable } from "../dist/superhot.preact.js";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  const c = vnode.props?.class ?? vnode.props?.className ?? "";
  if (c.includes(cls)) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const ch of arr) results.push(...findByClass(ch, cls));
  return results;
}
function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const c of arr) results.push(...findByType(c, type));
  return results;
}

describe("ShErrorState", () => {
  it("renders sh-frame with role=alert", () => {
    const v = ShErrorState({ title: "Oops", message: "Something failed" });
    assert.equal(v.props.role, "alert");
    assert.ok(v.props.class?.includes("sh-frame"), "missing sh-frame");
  });
  it("renders retry button when onRetry provided", () => {
    const v = ShErrorState({ onRetry: () => {} });
    const btns = findByType(v, "button");
    assert.ok(btns.length > 0, "no retry button");
  });
  it("renders no retry button when onRetry absent", () => {
    const v = ShErrorState({});
    const btns = findByType(v, "button");
    assert.equal(btns.length, 0, "unexpected retry button");
  });
});

describe("ShStatsGrid", () => {
  it("renders one div per stat", () => {
    const v = ShStatsGrid({
      stats: [
        { label: "A", value: 1 },
        { label: "B", value: 2 },
      ],
    });
    const str = JSON.stringify(v);
    assert.ok(str.includes('"A"') && str.includes('"B"'), "stat labels not rendered");
  });
  it("renders em-dash for null values", () => {
    const v = ShStatsGrid({ stats: [{ label: "X", value: null }] });
    const str = JSON.stringify(v);
    assert.ok(str.includes("\\u2014") || str.includes("—"), "missing em-dash for null");
  });
});

describe("ShDataTable", () => {
  it("renders table element", () => {
    const v = ShDataTable({ columns: [{ key: "id", label: "ID" }], rows: [] });
    const tables = findByType(v, "table");
    assert.ok(tables.length > 0, "no table element");
  });
  it("renders NO RESULTS when rows empty", () => {
    const v = ShDataTable({ columns: [{ key: "id", label: "ID" }], rows: [] });
    assert.ok(JSON.stringify(v).includes("NO RESULTS"), "missing empty state");
  });
  it("renders search input by default", () => {
    const v = ShDataTable({ columns: [], rows: [] });
    const inputs = findByType(v, "input");
    assert.ok(inputs.length > 0, "missing search input");
  });
  it("hides search when searchable=false", () => {
    const v = ShDataTable({ columns: [], rows: [], searchable: false });
    const inputs = findByType(v, "input");
    assert.equal(inputs.length, 0, "unexpected search input");
  });
});
```

**Build, run, commit:**

```bash
npm run build && node --test tests/stats-error-table.test.js
git add preact/ShErrorState.jsx preact/ShStatsGrid.jsx preact/ShDataTable.jsx \
  css/components/data-table.css css/superhot.css tests/stats-error-table.test.js
git commit -m "feat: add ShErrorState, ShStatsGrid, ShDataTable"
```

---

## Batch 7: ShNav + nav.css

### Task 12: Create `css/components/nav.css`

**Files:**

- Create: `css/components/nav.css`
- Modify: `css/superhot.css`

**Create `css/components/nav.css`:**

```css
/* sh-nav — responsive navigation shell
 * Three modes: phone bottom bar | tablet icon rail | desktop sidebar
 * Source: ARIA Sidebar.jsx
 */

@layer superhot.effects {
  /* ── Phone bottom bar ── */
  .sh-nav-phone {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    min-height: 56px;
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  /* ── Tablet icon rail ── */
  .sh-nav-rail {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 56px;
    z-index: var(--z-dropdown);
    background: var(--bg-surface);
    border-right: 1px solid var(--border-subtle);
    box-shadow: 2px 0 8px oklch(0 0 0 / 0.06);
    transition: width 0.2s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sh-nav-rail--expanded {
    width: 240px;
  }

  /* ── Desktop sidebar ── */
  .sh-nav-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 240px;
    z-index: var(--z-dropdown);
    background: var(--bg-surface);
    border-right: 1px solid var(--border-subtle);
    box-shadow: 2px 0 8px oklch(0 0 0 / 0.06);
    display: flex;
    flex-direction: column;
  }

  /* ── Nav items ── */
  .sh-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    font-size: var(--type-label);
    font-weight: 500;
    text-decoration: none;
    color: var(--text-tertiary);
    border-left: 2px solid transparent;
    transition:
      background var(--duration-fast) ease,
      color var(--duration-fast) ease;
    border-radius: var(--radius);
    cursor: pointer;
    background: none;
    border-top: none;
    border-right: none;
    border-bottom: none;
    width: 100%;
    white-space: nowrap;
  }

  .sh-nav-item:hover {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
  }

  .sh-nav-item--active {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    border-left-color: var(--accent);
  }

  .sh-nav-item--icon {
    width: 56px;
    height: 44px;
    padding: 0;
    justify-content: center;
    border-radius: 0;
  }

  .sh-nav-item--icon.sh-nav-item--active {
    border-left-color: var(--accent);
  }

  /* ── Section label ── */
  .sh-nav-section-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    padding: 14px 16px 4px;
    border-top: 1px solid var(--border-subtle);
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: none;
    border-left: none;
    border-right: none;
    border-bottom: none;
    width: 100%;
    cursor: pointer;
  }

  /* ── More sheet (phone) ── */
  .sh-nav-sheet {
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-dropdown) + 1);
  }

  .sh-nav-sheet-backdrop {
    position: absolute;
    inset: 0;
    background: oklch(0 0 0 / 0.5);
  }

  .sh-nav-sheet-content {
    position: absolute;
    bottom: 56px;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0 -4px 20px oklch(0 0 0 / 0.15);
    max-height: 60vh;
    overflow-y: auto;
  }

  .sh-nav-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-subtle);
  }

  /* ── Content layout helpers — offset for nav ── */
  .sh-nav-content-phone {
    padding-bottom: 72px;
  }
  .sh-nav-content-tablet {
    padding-left: 56px;
  }
  .sh-nav-content-desktop {
    padding-left: 240px;
  }
}
```

**Add import, build, commit:**

```bash
# Add to css/superhot.css:
# @import "./components/nav.css";
npm run build
git add css/components/nav.css css/superhot.css
git commit -m "feat: add sh-nav CSS — phone/rail/sidebar layout system"
```

---

### Task 13: Create `preact/ShNav.jsx`

**Files:**

- Create: `preact/ShNav.jsx`
- Create: `tests/nav.test.js`

**Write `tests/nav.test.js`:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShNav } from "../dist/superhot.preact.js";

describe("ShNav", () => {
  const items = [
    { path: "/", label: "Home", icon: () => null },
    { path: "/about", label: "About", icon: () => null },
    { path: "/settings", label: "Settings", icon: () => null, system: true },
  ];

  it("renders without error", () => {
    const v = ShNav({ items, currentPath: "/" });
    assert.ok(v !== null && v !== undefined, "ShNav returned null");
  });

  it("renders nav element", () => {
    const v = ShNav({ items, currentPath: "/" });
    const str = JSON.stringify(v);
    assert.ok(str.includes('"nav"') || str.includes('"div"'), "no nav container found");
  });
});
```

**Write `preact/ShNav.jsx`:**

```jsx
/**
 * ShNav — responsive 3-mode navigation shell.
 * Phone: fixed bottom tab bar (primary items + More sheet).
 * Tablet: collapsible left icon rail (56px ↔ 240px).
 * Desktop: fixed left sidebar (240px, sh-terminal-bg).
 *
 * @param {Object}   props
 * @param {Array}    props.items        [{path, label, icon, system?}]
 * @param {string}   props.currentPath  Active route path
 * @param {*}        [props.logo]       JSX for brand/logo slot
 * @param {*}        [props.footer]     JSX for footer slot
 */
import { useState, useEffect } from "preact/hooks";

function ChevronIcon({ down }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <polyline points={down ? "6 9 12 15 18 9" : "6 15 12 9 18 15"} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PhoneNav({ items, currentPath, footer }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = items.filter((it) => !it.system).slice(0, 4);
  const systemItems = items.filter((it) => it.system);

  useEffect(() => {
    setMoreOpen(false);
  }, [currentPath]);

  return (
    <nav class="sh-nav-phone" aria-label="Primary navigation">
      {moreOpen && (
        <div class="sh-nav-sheet">
          <div class="sh-nav-sheet-backdrop" onClick={() => setMoreOpen(false)} />
          <div class="sh-nav-sheet-content">
            <div class="sh-nav-sheet-header">
              <span style="font-size: var(--type-label); font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                More
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px;"
              >
                <CloseIcon />
              </button>
            </div>
            <div style="padding: 8px 0;">
              {systemItems.map((item) => {
                const active = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                    style="padding: 12px 20px; font-size: 14px;"
                  >
                    <item.icon />
                    {item.label}
                  </a>
                );
              })}
              {footer && (
                <div style="padding: 12px 20px; border-top: 1px solid var(--border-subtle); margin-top: 4px;">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {primaryItems.map((item) => {
        const active = currentPath === item.path;
        return (
          <a
            key={item.path}
            href={`#${item.path}`}
            style={`display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 48px; min-height: 48px; font-size: 10px; font-weight: 500; text-decoration: none; gap: 2px; border-top: 2px solid ${active ? "var(--accent)" : "transparent"}; color: ${active ? "var(--accent)" : "var(--text-tertiary)"}; margin-top: -2px;`}
            aria-label={item.label}
          >
            <item.icon />
            <span>{item.label}</span>
          </a>
        );
      })}

      {systemItems.length > 0 && (
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          style={`display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 48px; min-height: 48px; font-size: 10px; font-weight: 500; gap: 2px; background: none; border: none; border-top: 2px solid ${moreOpen ? "var(--accent)" : "transparent"}; color: ${moreOpen ? "var(--accent)" : "var(--text-tertiary)"}; margin-top: -2px; cursor: pointer;`}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
        >
          <MoreIcon />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}

function TabletNav({ items, currentPath, logo, footer }) {
  const [expanded, setExpanded] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
  const primaryItems = items.filter((it) => !it.system);

  useEffect(() => {
    setExpanded(false);
  }, [currentPath]);

  return (
    <>
      {expanded && (
        <div style="position: fixed; inset: 0; z-index: 29;" onClick={() => setExpanded(false)} />
      )}
      <nav
        class={`sh-nav-rail${expanded ? " sh-nav-rail--expanded" : ""}`}
        aria-label="Primary navigation"
      >
        <button
          class="sh-nav-item sh-nav-item--icon"
          style="flex-shrink: 0; height: 56px; width: 56px;"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
        >
          {expanded ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div style="flex: 1; overflow-y: auto; padding: 4px 0;">
          {expanded ? (
            <>
              {primaryItems.map((item) => {
                const active = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                    style="padding-left: 14px;"
                    aria-label={item.label}
                  >
                    <item.icon />
                    {item.label}
                  </a>
                );
              })}
              {items.some((it) => it.system) && (
                <>
                  <button
                    class="sh-nav-section-label"
                    onClick={() => setSystemOpen(!systemOpen)}
                    aria-expanded={systemOpen}
                  >
                    <span>System</span>
                    <ChevronIcon down={systemOpen} />
                  </button>
                  {systemOpen &&
                    items
                      .filter((it) => it.system)
                      .map((item) => {
                        const active = currentPath === item.path;
                        return (
                          <a
                            key={item.path}
                            href={`#${item.path}`}
                            class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                            style="padding-left: 14px;"
                            aria-label={item.label}
                          >
                            <item.icon />
                            {item.label}
                          </a>
                        );
                      })}
                </>
              )}
            </>
          ) : (
            primaryItems.map((item) => {
              const active = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  class={`sh-nav-item sh-nav-item--icon${active ? " sh-nav-item--active" : ""}`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <item.icon />
                </a>
              );
            })
          )}
        </div>

        {footer && (
          <div style="border-top: 1px solid var(--border-subtle); padding: 4px 0; flex-shrink: 0;">
            {footer}
          </div>
        )}
      </nav>
    </>
  );
}

function DesktopNav({ items, currentPath, logo, footer }) {
  const [systemOpen, setSystemOpen] = useState(false);
  const primaryItems = items.filter((it) => !it.system);

  return (
    <nav class="sh-nav-sidebar sh-terminal-bg" aria-label="Primary navigation">
      {logo && <div style="padding: 20px;">{logo}</div>}

      <div style="flex: 1; padding: 12px; overflow-y: auto;">
        {primaryItems.map((item) => {
          const active = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
              aria-label={item.label}
            >
              <item.icon />
              {item.label}
            </a>
          );
        })}

        {items.some((it) => it.system) && (
          <>
            <button
              class="sh-nav-section-label"
              onClick={() => setSystemOpen(!systemOpen)}
              aria-expanded={systemOpen}
            >
              <span>System</span>
              <ChevronIcon down={systemOpen} />
            </button>
            {systemOpen &&
              items
                .filter((it) => it.system)
                .map((item) => {
                  const active = currentPath === item.path;
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                      aria-label={item.label}
                    >
                      <item.icon />
                      {item.label}
                    </a>
                  );
                })}
          </>
        )}
      </div>

      {footer && (
        <div style="padding: 12px; border-top: 1px solid var(--border-subtle); flex-shrink: 0;">
          {footer}
        </div>
      )}
    </nav>
  );
}

export function ShNav({ items = [], currentPath = "/", logo, footer }) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    function onHash() {
      const hash = window.location.hash || "#/";
      const p = hash.replace(/^#/, "") || "/";
      setPath(p.includes("?") ? p.slice(0, p.indexOf("?")) : p);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Sync external currentPath prop
  useEffect(() => {
    setPath(currentPath);
  }, [currentPath]);

  return (
    <>
      {/* Phone — visible < 640px */}
      <div class="sm:hidden">
        <PhoneNav items={items} currentPath={path} footer={footer} />
      </div>
      {/* Tablet — visible 640px–1023px */}
      <div class="hidden sm:block lg:hidden">
        <TabletNav items={items} currentPath={path} logo={logo} footer={footer} />
      </div>
      {/* Desktop — visible 1024px+ */}
      <div class="hidden lg:block">
        <DesktopNav items={items} currentPath={path} logo={logo} footer={footer} />
      </div>
    </>
  );
}

export default ShNav;
```

**Note:** The `sm:hidden`, `hidden sm:block lg:hidden`, `hidden lg:block` classes require Tailwind. For non-Tailwind consumers, use `@media` CSS in nav.css — add `.sh-nav-phone-wrapper`, `.sh-nav-rail-wrapper`, `.sh-nav-sidebar-wrapper` responsive visibility classes. Add these to `css/components/nav.css`:

```css
/* Breakpoint visibility wrappers for non-Tailwind consumers */
.sh-nav-phone-wrapper {
  display: block;
}
.sh-nav-rail-wrapper {
  display: none;
}
.sh-nav-sidebar-wrapper {
  display: none;
}

@media (min-width: 640px) {
  .sh-nav-phone-wrapper {
    display: none;
  }
  .sh-nav-rail-wrapper {
    display: block;
  }
}
@media (min-width: 1024px) {
  .sh-nav-rail-wrapper {
    display: none;
  }
  .sh-nav-sidebar-wrapper {
    display: block;
  }
}
```

**Build, run tests, commit:**

```bash
npm run build && node --test tests/nav.test.js
git add preact/ShNav.jsx tests/nav.test.js
git commit -m "feat: add ShNav — responsive 3-mode navigation (phone/tablet/desktop)"
```

---

## Batch 8: ShTimeChart + uPlot

### Task 14: Add uPlot dependency

**Files:**

- Modify: `package.json`

```bash
cd ~/Documents/projects/superhot-ui && npm install --save-dev uplot
```

Then add to `package.json` peerDependencies:

```json
"peerDependencies": {
  "@preact/signals": "^2.0.0",
  "preact": ">=10.0.0",
  "uplot": ">=1.6.0"
}
```

```bash
git add package.json package-lock.json
git commit -m "chore: add uplot as peer dependency (charts)"
```

---

### Task 15: Create `css/components/chart.css` + `preact/ShTimeChart.jsx`

**Files:**

- Create: `css/components/chart.css`
- Create: `preact/ShTimeChart.jsx`
- Modify: `css/superhot.css`

**`css/components/chart.css`:**

```css
/* uPlot theme overrides — SUPERHOT palette */
@layer superhot.effects {
  .u-wrap {
    background: transparent !important;
  }
  .u-legend {
    font-family: var(--font-mono) !important;
    font-size: 11px !important;
    color: var(--text-tertiary) !important;
  }
  .u-cursor-x,
  .u-cursor-y {
    border-color: var(--border-primary) !important;
  }
  .u-select {
    background: var(--accent-glow) !important;
  }
}
```

**`preact/ShTimeChart.jsx`:**

```jsx
/**
 * ShTimeChart — uPlot time-series chart, SUPERHOT themed.
 * Compact mode: sparkline (no axes, 32px height).
 * Full mode: axes + grid + optional legend.
 *
 * Requires uPlot peer dependency.
 *
 * @param {Object}   props
 * @param {Array}    props.data    uPlot format: [timestamps[], ...series[]]
 * @param {Array}    props.series  [{label, color, width?}]
 * @param {number}   [props.height] Default: compact=32, full=120
 * @param {string}   [props.class]
 * @param {boolean}  [props.compact=false] Sparkline mode
 */
import { useRef, useEffect } from "preact/hooks";

export function ShTimeChart({ data, series, height, class: className, compact = false }) {
  const h = height ?? (compact ? 32 : 120);
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.length || !series?.length) return;
    if (!Array.isArray(data[0]) || data[0].length === 0) return;

    let uPlot;
    try {
      uPlot = require("uplot");
      // ESM fallback
      if (uPlot.default) uPlot = uPlot.default;
    } catch {
      return; // uPlot not installed — silently no-op
    }

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue("--text-tertiary").trim();
    const gridColor = styles.getPropertyValue("--border-subtle").trim();
    const fontMono = styles.getPropertyValue("--font-mono").trim() || "monospace";

    function resolveColor(c) {
      if (!c || !c.startsWith("var(")) return c || "#888";
      return styles.getPropertyValue(c.slice(4, -1)).trim() || c;
    }

    const opts = {
      width: containerRef.current.clientWidth,
      height: h,
      cursor: compact ? { show: false } : { show: true, drag: { x: false, y: false } },
      legend: { show: false },
      padding: compact ? [0, 0, 0, 0] : undefined,
      axes: compact
        ? [{ show: false }, { show: false }]
        : [
            {
              stroke: textColor,
              grid: { stroke: gridColor, width: 1 },
              font: `10px ${fontMono}`,
              ticks: { stroke: gridColor },
            },
            {
              stroke: textColor,
              grid: { stroke: gridColor, width: 1 },
              font: `10px ${fontMono}`,
              ticks: { stroke: gridColor },
              size: 50,
            },
          ],
      series: [
        {},
        ...series.map((s) => {
          const stroke = resolveColor(s.color);
          return {
            label: s.label,
            stroke,
            width: s.width ?? 2,
            fill: compact ? undefined : stroke + "15",
          };
        }),
      ],
    };

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new uPlot(opts, data, containerRef.current);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, series, h, compact]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.setSize({ width: containerRef.current.clientWidth, height: h });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [h]);

  const label =
    data?.length > 1
      ? `${compact ? "Sparkline" : "Chart"}: ${series?.map((s) => s.label).join(", ")}`
      : `${compact ? "Sparkline" : "Chart"} loading`;

  if (compact) {
    return <div ref={containerRef} class={className || ""} role="img" aria-label={label} />;
  }

  return (
    <figure>
      <div ref={containerRef} class={className || ""} role="img" aria-label={label} />
      {data?.length > 1 && (
        <figcaption class="sr-only">
          {series?.map((s) => s.label).join(", ")} — {data[0].length} data points
        </figcaption>
      )}
    </figure>
  );
}

export default ShTimeChart;
```

**Wire sparkline into ShHeroCard** — open `preact/ShHeroCard.jsx` and replace the placeholder sparkline div:

```jsx
// Replace the aria-hidden div placeholder with:
import { ShTimeChart } from "./ShTimeChart.jsx";

// In render, replace:
// {hasSparkline && (<div style="width: 80px; height: 32px; flex-shrink: 0;" aria-hidden="true" />)}
// With:
{
  hasSparkline && (
    <div style="width: 80px; height: 32px; flex-shrink: 0;">
      <ShTimeChart
        data={sparkData}
        series={[{ label: label || "trend", color: sparkColor || "var(--accent)", width: 1.5 }]}
        compact
      />
    </div>
  );
}
```

**Add import to `css/superhot.css`**:

```css
@import "./components/chart.css";
```

**Write `tests/time-chart.test.js`:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShTimeChart } from "../dist/superhot.preact.js";

describe("ShTimeChart", () => {
  it("renders a div container", () => {
    const v = ShTimeChart({
      data: [
        [1, 2],
        [3, 4],
      ],
      series: [{ label: "val", color: "red" }],
    });
    // compact=false → figure element
    assert.ok(v !== null && v !== undefined, "ShTimeChart returned nothing");
  });
  it("compact mode renders div not figure", () => {
    const v = ShTimeChart({
      data: [
        [1, 2],
        [3, 4],
      ],
      series: [{ label: "val", color: "red" }],
      compact: true,
    });
    assert.equal(v.type, "div", "compact mode should render div");
  });
  it("renders with aria-label", () => {
    const v = ShTimeChart({
      data: [
        [1, 2],
        [3, 4],
      ],
      series: [{ label: "temp", color: "red" }],
      compact: true,
    });
    assert.ok(
      v.props["aria-label"]?.includes("temp") || v.props["aria-label"]?.includes("Sparkline"),
      "missing aria-label",
    );
  });
});
```

**Build, run, commit:**

```bash
npm run build && node --test tests/time-chart.test.js
git add preact/ShTimeChart.jsx preact/ShHeroCard.jsx css/components/chart.css css/superhot.css tests/time-chart.test.js
git commit -m "feat: add ShTimeChart uPlot wrapper; wire sparkline into ShHeroCard"
```

---

## Batch 9: ShPipeline

### Task 16: Create `css/components/pipeline.css` + `preact/ShPipeline.jsx`

**Files:**

- Create: `css/components/pipeline.css`
- Create: `preact/ShPipeline.jsx`
- Modify: `css/superhot.css`

**`css/components/pipeline.css`:**

```css
/* sh-pipeline — generic node/edge flow visualization */
@layer superhot.effects {
  .sh-pipeline-flow-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    overflow-x: auto;
  }
}
```

**`preact/ShPipeline.jsx`:**

```jsx
/**
 * ShPipeline — generic DAG flow visualization with status coloring.
 * Left-to-right layout. Nodes colored by status. Healthy edges animate.
 *
 * @param {Object}    props
 * @param {Array}     props.nodes  [{id, label, status:'healthy'|'warning'|'error'|'idle', detail?}]
 * @param {Array}     props.edges  [{from, to}]
 * @param {Function}  [props.onNodeClick]
 */
export function ShPipeline({ nodes = [], edges = [], onNodeClick }) {
  if (!nodes.length) return null;

  const NODE_W = 100;
  const NODE_H = 40;
  const COL_GAP = 60;
  const ROW_GAP = 20;

  // Simple left-to-right layout: assign columns by topological depth
  const depth = {};
  nodes.forEach((n) => {
    depth[n.id] = 0;
  });
  edges.forEach(({ from, to }) => {
    depth[to] = Math.max(depth[to] || 0, (depth[from] || 0) + 1);
  });

  const cols = {};
  nodes.forEach((n) => {
    const d = depth[n.id] || 0;
    if (!cols[d]) cols[d] = [];
    cols[d].push(n);
  });

  const nodePos = {};
  Object.entries(cols).forEach(([col, ns]) => {
    const x = parseInt(col) * (NODE_W + COL_GAP);
    ns.forEach((n, row) => {
      nodePos[n.id] = { x, y: row * (NODE_H + ROW_GAP) };
    });
  });

  const numCols = Object.keys(cols).length;
  const maxRows = Math.max(...Object.values(cols).map((c) => c.length));
  const svgW = numCols * (NODE_W + COL_GAP) - COL_GAP + 20;
  const svgH = maxRows * (NODE_H + ROW_GAP) - ROW_GAP + 20;

  function statusColor(s) {
    switch (s) {
      case "healthy":
        return "var(--status-healthy)";
      case "warning":
        return "var(--status-warning)";
      case "error":
        return "var(--status-error)";
      default:
        return "var(--text-tertiary)";
    }
  }

  return (
    <div class="sh-pipeline-flow-bar">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style="width: 100%; max-width: 100%; font-family: var(--font-mono);"
        role="img"
        aria-label="Pipeline flow diagram"
      >
        {/* Edges */}
        {edges.map(({ from, to }, i) => {
          const fp = nodePos[from];
          const tp = nodePos[to];
          if (!fp || !tp) return null;
          const x1 = fp.x + NODE_W + 10;
          const y1 = fp.y + NODE_H / 2;
          const x2 = tp.x + 10;
          const y2 = tp.y + NODE_H / 2;
          const fromNode = nodes.find((n) => n.id === from);
          const healthy = fromNode?.status === "healthy";
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={healthy ? "var(--accent)" : "var(--border-primary)"}
              stroke-width="1.5"
              stroke-dasharray={healthy ? "4 4" : undefined}
              style={healthy ? "animation: sh-t1-scan-sweep-kf 1.2s linear infinite" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePos[node.id];
          if (!pos) return null;
          const color = statusColor(node.status);
          return (
            <g
              key={node.id}
              style={onNodeClick ? "cursor: pointer;" : undefined}
              onClick={onNodeClick ? () => onNodeClick(node) : undefined}
              role={onNodeClick ? "button" : undefined}
              aria-label={`${node.label}: ${node.status || "idle"}`}
              tabIndex={onNodeClick ? 0 : undefined}
            >
              <rect
                x={pos.x + 10}
                y={pos.y}
                width={NODE_W - 20}
                height={NODE_H}
                rx="2"
                fill="var(--bg-surface-raised)"
                stroke={color}
                stroke-width="1.5"
              />
              <text
                x={pos.x + NODE_W / 2}
                y={pos.y + NODE_H / 2 + 1}
                text-anchor="middle"
                dominant-baseline="middle"
                fill={color}
                font-size="10"
                font-weight="600"
              >
                {node.label}
              </text>
              {node.detail && (
                <text
                  x={pos.x + NODE_W / 2}
                  y={pos.y + NODE_H / 2 + 13}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill="var(--text-tertiary)"
                  font-size="8"
                >
                  {node.detail}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ShPipeline;
```

**Add import to `css/superhot.css`**:

```css
@import "./components/pipeline.css";
```

**Write `tests/pipeline.test.js`:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShPipeline } from "../dist/superhot.preact.js";

function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const c of arr) results.push(...findByType(c, type));
  return results;
}

describe("ShPipeline", () => {
  it("renders null for empty nodes", () => {
    const v = ShPipeline({ nodes: [], edges: [] });
    assert.equal(v, null, "expected null for empty nodes");
  });
  it("renders SVG with nodes", () => {
    const v = ShPipeline({
      nodes: [{ id: "a", label: "INPUT", status: "healthy" }],
      edges: [],
    });
    const svgs = findByType(v, "svg");
    assert.ok(
      svgs.length > 0 || v.type === "svg" || JSON.stringify(v).includes('"svg"'),
      "no SVG rendered",
    );
  });
  it("renders correct number of node groups", () => {
    const nodes = [
      { id: "a", label: "A", status: "healthy" },
      { id: "b", label: "B", status: "warning" },
    ];
    const v = ShPipeline({ nodes, edges: [{ from: "a", to: "b" }] });
    const str = JSON.stringify(v);
    assert.ok(str.includes('"A"') && str.includes('"B"'), "node labels not rendered");
  });
});
```

**Build, run, commit:**

```bash
npm run build && node --test tests/pipeline.test.js
git add preact/ShPipeline.jsx css/components/pipeline.css css/superhot.css tests/pipeline.test.js
git commit -m "feat: add ShPipeline — generic DAG flow visualization with status coloring"
```

---

## Batch 10: Barrel exports + esbuild + CLAUDE.md

### Task 17: Verify all components export correctly from dist

**Step 1: Check esbuild barrel pattern**

Open `esbuild.config.mjs`. The Preact barrel export likely uses a stdin glob or explicit import list. If explicit, add all new components:

```bash
cat ~/Documents/projects/superhot-ui/esbuild.config.mjs
```

If it uses a stdin that auto-discovers `preact/*.jsx`, no change needed. If explicit, add:

```js
import { ShPageBanner } from "./preact/ShPageBanner.jsx";
import { ShHeroCard } from "./preact/ShHeroCard.jsx";
import { ShCollapsible } from "./preact/ShCollapsible.jsx";
import { ShErrorState } from "./preact/ShErrorState.jsx";
import { ShStatsGrid } from "./preact/ShStatsGrid.jsx";
import { ShDataTable } from "./preact/ShDataTable.jsx";
import { ShNav } from "./preact/ShNav.jsx";
import { ShTimeChart } from "./preact/ShTimeChart.jsx";
import { ShPipeline } from "./preact/ShPipeline.jsx";
export {
  ShPageBanner,
  ShHeroCard,
  ShCollapsible,
  ShErrorState,
  ShStatsGrid,
  ShDataTable,
  ShNav,
  ShTimeChart,
  ShPipeline,
};
```

**Step 2: Run full test suite**

```bash
npm run build && node --test 'tests/*.test.js'
```

Expected: All tests pass.

**Step 3: Verify all new exports from dist**

```js
// Quick smoke test — run as inline node script:
node -e "
import('./dist/superhot.preact.js').then(m => {
  const required = ['ShPageBanner','ShHeroCard','ShCollapsible','ShErrorState','ShStatsGrid','ShDataTable','ShNav','ShTimeChart','ShPipeline'];
  const missing = required.filter(name => !m[name]);
  if (missing.length) { console.error('Missing exports:', missing); process.exit(1); }
  console.log('All exports present:', required.join(', '));
});
"
```

---

### Task 18: Update `CLAUDE.md` effects reference table

Open `CLAUDE.md` and append the new components to the Effects Reference table:

```markdown
| sh-frame | `.sh-frame[data-label][data-footer]` | — | — |
| sh-bracket | `.sh-bracket` | — | — |
| sh-status-pill | `.sh-status-pill--healthy\|warning\|error` | — | — |
| sh-cursor | `.sh-cursor-active\|working\|idle` | — | — |
| sh-terminal-bg | `.sh-terminal-bg` | — | — |
| sh-page-banner | `.sh-page-banner` | — | `<ShPageBanner>` |
| sh-crt-overlay | `.sh-crt-overlay` | — | — |
| T1 animations | `.sh-t1-*` | — | — |
| T2 animations | `.sh-t2-*` | — | — |
| T3 animations | `.sh-t3-*` | — | — |
| Hero Card | — | — | `<ShHeroCard>` |
| Collapsible | — | — | `<ShCollapsible>` |
| Error State | — | — | `<ShErrorState>` |
| Stats Grid | — | — | `<ShStatsGrid>` |
| Data Table | — | — | `<ShDataTable>` |
| Nav Shell | `.sh-nav-*` | — | `<ShNav>` |
| Time Chart | — | — | `<ShTimeChart>` |
| Pipeline | `.sh-pipeline-*` | — | `<ShPipeline>` |
```

**Step 4: Final full test run + commit**

```bash
node --test 'tests/*.test.js'
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with all new component exports and effects reference"
```

---

## Verification Checklist

After all batches:

```bash
# Build clean
npm run build

# All unit tests pass
node --test 'tests/*.test.js'

# Dist exports all new components
node -e "import('./dist/superhot.preact.js').then(m => console.log(Object.keys(m).filter(k => k.startsWith('Sh'))))"

# CSS dist contains new classes
grep -c 'sh-frame\|sh-cursor\|sh-t1\|sh-page-banner\|sh-nav\|sh-pipeline' dist/superhot.css
```

Expected: 9+ CSS component files imported, 20 total Preact components in barrel, all node tests green.
