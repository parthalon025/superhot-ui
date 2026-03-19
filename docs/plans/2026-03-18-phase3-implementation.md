# Phase 3: Advanced Effects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 advanced terminal effects, 4 audio types, hardware auto-downgrade, ShThresholdBar, ShIncidentHUD, and sourcemap fix.

**Architecture:** CSS effects in `css/components/advanced-effects.css`, JS utilities as separate modules, Preact components for ShMatrixRain and ShIncidentHUD. All follow existing three-layer pattern.

**Tech Stack:** CSS (oklch, @layer), vanilla ESM JS, Preact JSX, canvas API (matrix rain), Web Audio API (new SFX), Node.js `node:test`

**Design:** `docs/plans/2026-03-18-advanced-effects-design.md`

---

## Batch 1: CSS Effects (signal degradation, interlace, burn-in, threshold bar)

### Task 1.1: Create advanced-effects.css with all 4 CSS effects + hardware capability

**Files:**

- Create: `css/components/advanced-effects.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/advanced-effects.test.js` (create)

**Step 1: Write the failing test**

Create `tests/advanced-effects.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/advanced-effects.css", "utf8");

describe("advanced-effects.css", () => {
  it("defines signal degradation class", () => {
    assert.ok(css.includes(".sh-signal-degraded"), "missing signal-degraded");
  });
  it("signal degradation has jitter keyframe", () => {
    assert.ok(css.includes("sh-signal-jitter"), "missing jitter keyframe");
  });
  it("defines interlace class", () => {
    assert.ok(css.includes(".sh-interlace"), "missing interlace");
  });
  it("interlace uses repeating-linear-gradient", () => {
    assert.ok(css.includes("repeating-linear-gradient"), "missing gradient");
  });
  it("defines burn-in attribute selector", () => {
    assert.ok(css.includes("data-sh-burn-in"), "missing burn-in");
  });
  it("burn-in uses mix-blend-mode: screen", () => {
    assert.ok(
      css.includes("mix-blend-mode: screen") || css.includes("mix-blend-mode:screen"),
      "missing screen blend",
    );
  });
  it("defines threshold bar class", () => {
    assert.ok(css.includes(".sh-threshold-bar"), "missing threshold-bar");
  });
  it("threshold bar uses --sh-fill", () => {
    assert.ok(css.includes("--sh-fill"), "missing fill variable");
  });
  it("respects prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
  it("defines hardware capability selectors", () => {
    assert.ok(css.includes("data-sh-capability"), "missing capability selectors");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/advanced-effects.test.js`

**Step 3: Create advanced-effects.css**

Create `css/components/advanced-effects.css` with:

- `.sh-signal-degraded` — filter (brightness/saturate/contrast) + `sh-signal-jitter` keyframe animation + SVG noise `::after` overlay with `mix-blend-mode: overlay`
- `.sh-interlace` — `::after` pseudo with `repeating-linear-gradient(to bottom, transparent 0-1px, oklch(0 0 0 / 0.12) 1-2px)`, `pointer-events: none`, z-index 2
- `[data-sh-burn-in]` — `::before` with `content: attr(data-sh-burn-in)`, centered, opacity 0.05, `filter: sepia(0.4) blur(1px)`, `mix-blend-mode: screen`, color `--sh-dim`
- `.sh-threshold-bar` — 6px height bar with `::before` using `width: calc(var(--sh-fill, 0) * 1%)`, color responds to `.sh-glow-ambient/standard/critical` classes (phosphor/warning/threat)
- `[data-sh-capability="low"]` and `[data-sh-capability="minimal"]` — disable T1/T2 animations and overlays
- Reduced motion: signal degradation static filter only, no jitter/overlay
- Forced colors: signal degradation gets dashed border, overlays hidden

All inside `@layer superhot.effects`. Jitter keyframe outside the layer.

**Step 4: Add import to superhot.css** before @layer line.

**Step 5: Run tests**

Run: `node --test tests/advanced-effects.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/advanced-effects.css css/superhot.css tests/advanced-effects.test.js
git commit -m "feat: add signal degradation, interlace, burn-in, threshold bar, hardware capability CSS"
```

---

## Batch 2: Audio Types + Hardware Utility

### Task 2.1: Add 4 new SFX types to audio.js

**Files:**

- Modify: `js/audio.js`
- Test: `tests/audio-extended.test.js` (create)

**Step 1: Write the failing test**

Create `tests/audio-extended.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("js/audio.js", "utf8");

describe("audio.js extended SFX", () => {
  it("defines boot sound type", () => {
    assert.ok(src.includes("boot"), "missing boot SFX");
  });
  it("defines static sound type", () => {
    assert.ok(src.includes("static"), "missing static SFX");
  });
  it("defines warning sound type", () => {
    assert.ok(src.includes("warning"), "missing warning SFX");
  });
  it("defines recovery sound type", () => {
    assert.ok(src.includes("recovery"), "missing recovery SFX");
  });
});
```

**Step 2: Read js/audio.js** to understand the SOUNDS map pattern. Add 4 new entries following the existing pattern:

- `boot`: Two-tone oscillator (200Hz to 600Hz), 200ms, sine wave
- `static`: White noise via AudioBuffer, 150ms, bandpass filter at 2000Hz
- `warning`: Double-pulse oscillator (440Hz, 50ms on, 50ms off, 50ms on), square wave
- `recovery`: Descending oscillator (800Hz to 400Hz), 250ms, sine wave

**Step 3: Run tests**

Run: `node --test tests/audio-extended.test.js && npm test`

**Step 4: Commit**

```bash
git add js/audio.js tests/audio-extended.test.js
git commit -m "feat: add boot, static, warning, recovery SFX types"
```

---

### Task 2.2: Create hardware auto-downgrade utility

**Files:**

- Create: `js/hardware.js`
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/hardware.test.js` (create)

**Step 1: Write the failing test**

Create `tests/hardware.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectCapability } from "../js/hardware.js";

describe("detectCapability", () => {
  it("returns a valid tier string", () => {
    const tier = detectCapability();
    assert.ok(["minimal", "low", "medium", "full"].includes(tier));
  });
  it("returns string type", () => {
    assert.strictEqual(typeof detectCapability(), "string");
  });
});
```

**Step 2: Create js/hardware.js**

`detectCapability()` — checks `prefers-reduced-motion` (returns "minimal"), then `navigator.hardwareConcurrency` (<=2: "low", <=4: "medium", >4: "full"). Default to 4 cores if unavailable.

`applyCapability(tier)` — sets `data-sh-capability` attribute on `document.documentElement`.

**Step 3: Add export to esbuild.config.mjs** jsConfig:

```js
"export { detectCapability, applyCapability } from './js/hardware.js';",
```

**Step 4: Run tests**

Run: `node --test tests/hardware.test.js && npm test`

**Step 5: Commit**

```bash
git add js/hardware.js tests/hardware.test.js esbuild.config.mjs
git commit -m "feat: add hardware auto-downgrade — detectCapability + applyCapability"
```

---

## Batch 3: Boot Sequence JS Utility

### Task 3.1: Create boot sequence utility

**Files:**

- Create: `js/boot.js`
- Create: `css/components/boot.css`
- Modify: `css/superhot.css` (add import)
- Modify: `esbuild.config.mjs` (add export)
- Test: `tests/boot.test.js` (create)

**Step 1: Write the failing test**

Create `tests/boot.test.js`:

```js
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { bootSequence } from "../js/boot.js";

describe("bootSequence", () => {
  it("returns a cleanup function", () => {
    const el = {
      textContent: "",
      appendChild: mock.fn(),
      querySelectorAll: () => [],
    };
    const cleanup = bootSequence(el, ["LINE 1", "LINE 2"]);
    assert.strictEqual(typeof cleanup, "function");
    cleanup();
  });
  it("accepts empty lines array", () => {
    const el = {
      textContent: "",
      appendChild: mock.fn(),
      querySelectorAll: () => [],
    };
    const cleanup = bootSequence(el, []);
    assert.strictEqual(typeof cleanup, "function");
    cleanup();
  });
  it("calls onComplete callback", async () => {
    const cb = mock.fn();
    const el = {
      textContent: "",
      appendChild: mock.fn(),
      querySelectorAll: () => [],
    };
    const cleanup = bootSequence(el, ["DONE"], { lineDelay: 0, charSpeed: 0, onComplete: cb });
    await new Promise((r) => setTimeout(r, 50));
    assert.strictEqual(cb.mock.calls.length, 1);
    cleanup();
  });
});
```

**Step 2: Create css/components/boot.css**

Keyframe `sh-boot-typewriter` using `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)`.

Classes: `.sh-boot-container` (mono font, phosphor color, pre whitespace), `.sh-boot-line` (opacity 0), `.sh-boot-line--visible` (opacity 1 + typewriter animation using CSS custom properties `--sh-boot-chars` and `--sh-boot-char-duration`), `.sh-boot-line--complete` (static, no animation).

Reduced motion: `.sh-boot-line--visible` gets `animation: none; opacity: 1`.

**Step 3: Create js/boot.js**

`bootSequence(container, lines, opts)`:

- Clears container children using DOM methods (NOT innerHTML — use while loop removing firstChild)
- Creates `<span class="sh-boot-line">` per line using `document.createElement` + `textContent`
- Staggers visibility via `setTimeout` with delay = `i * (lineDelay + text.length * charSpeed)`
- Sets CSS custom properties `--sh-boot-chars` and `--sh-boot-char-duration` for the keyframe
- After typewriter duration, swaps `--visible` to `--complete` class
- Last line gets `.sh-cursor-active`
- Calls `onComplete` after final line
- Returns cleanup function that cancels all pending timeouts

**Step 4: Add import to superhot.css** and export to esbuild jsConfig.

**Step 5: Run tests**

Run: `node --test tests/boot.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/boot.css js/boot.js tests/boot.test.js css/superhot.css esbuild.config.mjs
git commit -m "feat: add boot sequence — progressive typewriter system initialization"
```

---

## Batch 4: Matrix Rain Preact Component

### Task 4.1: Create ShMatrixRain component

**Files:**

- Create: `preact/ShMatrixRain.jsx`
- Create: `css/components/matrix-rain.css`
- Modify: `css/superhot.css` (add import)
- Modify: `esbuild.config.mjs` (add Preact export)
- Test: `tests/matrix-rain.test.js` (create)

**Step 1: Write the failing test**

Create `tests/matrix-rain.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/matrix-rain.css", "utf8");

describe("matrix-rain.css", () => {
  it("defines matrix rain container", () => {
    assert.ok(css.includes(".sh-matrix-rain"), "missing matrix-rain");
  });
  it("defines canvas overlay", () => {
    assert.ok(css.includes(".sh-matrix-rain-canvas"), "missing canvas class");
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});
```

**Step 2: Create css/components/matrix-rain.css**

Container `.sh-matrix-rain` (relative, overflow hidden). Canvas `.sh-matrix-rain-canvas` (absolute, inset 0, pointer-events none, z-index 1). Reduced motion + low capability: canvas hidden.

**Step 3: Create preact/ShMatrixRain.jsx**

Props: `active` (boolean), `density` ("low"|"medium"|"high", default "medium"), `class`, `children`, `...rest`.

Implementation:

- `useEffect` controlled by `active` + `density`
- Gets canvas 2d context, sizes to parent dimensions
- Column spacing from density map: low=40px, medium=24px, high=14px
- Drops array (Float32Array) with random initial positions
- `requestAnimationFrame` loop at 50ms intervals (20fps):
  - Fade previous frame with semi-transparent black rect
  - For each column: draw random character from glyph set at lead position (bright phosphor cyan), draw trail characters (dim)
  - Advance drop position, reset randomly when past bottom
- `ResizeObserver` to handle container resize
- Cleanup: cancel rAF, disconnect observer, clear canvas
- Canvas has `aria-hidden="true"`

IMPORTANT: Do NOT use `h` as any parameter name in callbacks.

**Step 4: Add imports** to superhot.css and esbuild preactConfig.

**Step 5: Run tests**

Run: `node --test tests/matrix-rain.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/matrix-rain.css preact/ShMatrixRain.jsx tests/matrix-rain.test.js css/superhot.css esbuild.config.mjs
git commit -m "feat: add ShMatrixRain — canvas-based falling character columns"
```

---

## Batch 5: ShIncidentHUD Component

### Task 5.1: Create ShIncidentHUD component

**Files:**

- Create: `css/components/incident-hud.css`
- Create: `preact/ShIncidentHUD.jsx`
- Modify: `css/superhot.css` (add import)
- Modify: `esbuild.config.mjs` (add Preact export)
- Test: `tests/incident-hud.test.js` (create)

**Step 1: Write the failing test**

Create `tests/incident-hud.test.js`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/incident-hud.css", "utf8");

describe("incident-hud.css", () => {
  it("defines incident HUD class", () => {
    assert.ok(css.includes(".sh-incident-hud"), "missing incident-hud");
  });
  it("defines warning severity", () => {
    assert.ok(css.includes("sh-incident-hud--warning"), "missing warning variant");
  });
  it("defines critical severity", () => {
    assert.ok(css.includes("sh-incident-hud--critical"), "missing critical variant");
  });
  it("uses z-index", () => {
    assert.ok(css.includes("z-index"), "missing z-index");
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});
```

**Step 2: Create css/components/incident-hud.css**

Fixed top bar, full width, z-index `var(--z-toast)`. Flex row: message (flex 1) + elapsed time + optional [ACK] button. Warning variant: amber bg/border. Critical variant: red bg/border + threat-pulse animation. Slide-in keyframe. Reduced motion: no animation. Forced colors: border fallback.

**Step 3: Create preact/ShIncidentHUD.jsx**

Props: `active`, `severity` ("warning"|"critical", default "warning"), `message`, `timestamp` (epoch ms), `onAcknowledge`, `class`, `...rest`.

Implementation:

- Returns null if `!active`
- `useEffect` with 1s interval updates elapsed time display from `timestamp`
- Format: <60s = "Xs", <3600s = "Xm Ys", else "Xh Xm"
- `role="alert"` + `aria-live="assertive"`
- [ACK] button only if `onAcknowledge` provided

IMPORTANT: Component uses hooks (useState, useEffect). Do NOT use `h` as parameter name.

**Step 4: Add imports** to superhot.css and esbuild preactConfig.

**Step 5: Run tests**

Run: `node --test tests/incident-hud.test.js && npm test`

**Step 6: Commit**

```bash
git add css/components/incident-hud.css preact/ShIncidentHUD.jsx tests/incident-hud.test.js css/superhot.css esbuild.config.mjs
git commit -m "feat: add ShIncidentHUD — system-wide incident banner with severity and elapsed time"
```

---

## Batch 6: Documentation + Sourcemap + Final Build

### Task 6.1: Update all documentation for Phase 3

**Files:**

- Create: `docs/components/ShMatrixRain.md`
- Create: `docs/components/ShIncidentHUD.md`
- Modify: `docs/css-classes.md` (add new classes)
- Modify: `CHANGELOG.md` (add v0.3.0 section)
- Modify: `CLAUDE.md` (add new effects to table + file layout)
- Modify: `docs/consumer-guide.md` (add new effect usage sections)

Follow existing doc patterns. Read each target file first.

**ShMatrixRain.md:** Signal "system is computing", Props table, usage with `active` toggle, canvas implementation note, density options.

**ShIncidentHUD.md:** Signal "active system-wide incident", Props table, severity variants, elapsed time auto-format, piOS voice.

**css-classes.md additions:** signal-degraded, interlace, burn-in (data-sh-burn-in), threshold-bar, boot-container/line, matrix-rain, incident-hud, hardware capability attributes.

**CHANGELOG v0.3.0:** All Phase 3 additions.

**CLAUDE.md:** Add rows to effects table for signal degradation, interlace, burn-in, boot sequence, matrix rain, incident HUD, threshold bar, hardware capability. Add boot.js and hardware.js to file layout.

**consumer-guide.md:** Add sections for boot sequence, signal degradation, interlace, burn-in, matrix rain, incident HUD, threshold bar, hardware auto-downgrade.

**Step 2: Commit**

```bash
git add docs/ CHANGELOG.md CLAUDE.md
git commit -m "docs: add Phase 3 effects to all documentation"
```

---

### Task 6.2: Fix sourcemaps + final build verification

**Files:**

- Modify: `esbuild.config.mjs`

**Step 1:** Change `sourcemap: isWatch` to `sourcemap: true` in the `shared` config object.

**Step 2:** Run: `npm run build`

**Step 3:** Run: `npm test && npx playwright test`

**Step 4:** Commit:

```bash
git add esbuild.config.mjs
git commit -m "fix: enable production sourcemaps"
```

---

## Phase 4: Deferred Quality Investments (separate plan — not this session)

### P4.1: Integration recipes (5 tutorial docs)

- `docs/recipes/monitoring-dashboard.md`
- `docs/recipes/data-table-with-state.md`
- `docs/recipes/responsive-navigation.md`
- `docs/recipes/error-handling-flow.md`
- `docs/recipes/loading-states.md`

### P4.2: Accessibility tests

- Keyboard nav for ShNav, ShCommandPalette, ShCollapsible, ShModal
- Focus trap for ShModal, ShCommandPalette
- Screen reader announcements for ShToast, ShIncidentHUD
- WCAG AA color contrast validation

### P4.3: Responsive breakpoint tests

- Phone (max-width: 639px) — T1 disabled, nav bottom tabs
- Tablet — ShNav rail mode
- Desktop — full sidebar

### P4.4: Dist CSS flattening

- Replace @import copy with esbuild CSS bundling
- Single flat dist/superhot.css

---

## Summary

| Batch                | Tasks       | New Files                                   | Modified Files                   |
| -------------------- | ----------- | ------------------------------------------- | -------------------------------- |
| 1 — CSS effects      | 1           | advanced-effects.css, 1 test                | superhot.css                     |
| 2 — Audio + hardware | 2           | hardware.js, 2 tests                        | audio.js, esbuild.config.mjs     |
| 3 — Boot sequence    | 1           | boot.js, boot.css, 1 test                   | superhot.css, esbuild.config.mjs |
| 4 — Matrix rain      | 1           | ShMatrixRain.jsx, matrix-rain.css, 1 test   | superhot.css, esbuild.config.mjs |
| 5 — Incident HUD     | 1           | ShIncidentHUD.jsx, incident-hud.css, 1 test | superhot.css, esbuild.config.mjs |
| 6 — Docs + sourcemap | 2           | 2 component docs                            | 4 doc files, esbuild.config.mjs  |
| **Total**            | **8 tasks** | **~14 new files**                           | **~8 modified files**            |
