# Atmosphere Guide Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement CSS utilities, JS helpers, and a Preact component that make the 20 atmosphere rules in `docs/atmosphere-guide.md` actionable for consumers — not just documented but built into the library.

**Architecture:** Six new deliverables across three layers (CSS → JS → Preact). CSS adds glow hierarchy, empty-state, and CRT preset classes. JS adds an effect density tracker, shatter presets, and CRT presets. Preact adds ShEmptyState. All wired through existing build pipeline (esbuild) and import structure.

**Tech Stack:** Pure CSS (oklch, custom properties), vanilla ESM (node:test), Preact JSX (no hooks in new components where possible), Playwright for CSS tests.

---

## Batch 1: CSS Atmosphere Utilities (parallel — no dependencies between tasks)

### Task 1: Glow Hierarchy Classes

**Files:**

- Create: `css/components/glow.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/browser/css-glow.spec.js`

**Step 1: Write the Playwright test**

```javascript
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Glow hierarchy", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("sh-glow-ambient applies 4px phosphor glow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-ambient";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
    expect(shadow).toContain("4px");
  });

  test("sh-glow-standard applies 8px phosphor glow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-standard";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
    expect(shadow).toContain("8px");
  });

  test("sh-glow-critical applies 16px threat glow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-critical";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
    expect(shadow).toContain("16px");
  });

  test("sh-glow-none removes glow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-none";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).toBe("none");
  });

  test("reduced motion preserves glow (static, not animated)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-critical";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && npx playwright test tests/browser/css-glow.spec.js`
Expected: FAIL — class not found, box-shadow is "none"

**Step 3: Write implementation**

Create `css/components/glow.css`:

```css
/* Glow hierarchy — atmosphere-guide.md Rule 6
   Three intensity levels for visual priority.
   Phosphor (cyan) by default, threat (red) via modifier. */

.sh-glow-ambient {
  box-shadow: 0 0 4px var(--sh-phosphor-glow, oklch(0.72 0.15 195 / 0.1));
}

.sh-glow-standard {
  box-shadow: 0 0 8px var(--sh-phosphor-glow, oklch(0.72 0.15 195 / 0.25));
}

.sh-glow-critical {
  box-shadow: 0 0 16px var(--sh-threat-glow, oklch(0.58 0.25 25 / 0.5));
}

.sh-glow-none {
  box-shadow: none;
}

/* Threat-specific overrides (red glow at each level) */
.sh-glow-ambient--threat {
  box-shadow: 0 0 4px oklch(0.58 0.25 25 / 0.1);
}

.sh-glow-standard--threat {
  box-shadow: 0 0 8px oklch(0.58 0.25 25 / 0.25);
}
```

Then add to `css/superhot.css` import list (after existing component imports):

```css
@import "./components/glow.css" layer(superhot.effects);
```

**Step 4: Run test to verify it passes**

Run: `cd /home/justin/Documents/projects/superhot-ui && npm run build && npx playwright test tests/browser/css-glow.spec.js`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add css/components/glow.css css/superhot.css tests/browser/css-glow.spec.js
git commit -m "feat: add glow hierarchy utility classes (atmosphere rule 6)"
```

---

### Task 2: Empty State Styling

**Files:**

- Create: `css/components/empty-state.css`
- Modify: `css/superhot.css` (add import)
- Test: `tests/browser/css-empty-state.spec.js`

**Step 1: Write the Playwright test**

```javascript
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Empty state", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("sh-empty-state centers content with tertiary color", async ({ page }) => {
    const styles = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-empty-state";
      el.textContent = "STANDBY";
      document.body.appendChild(el);
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        textTransform: cs.textTransform,
      };
    });
    expect(styles.display).toBe("flex");
    expect(styles.alignItems).toBe("center");
    expect(styles.justifyContent).toBe("center");
    expect(styles.textTransform).toBe("uppercase");
  });

  test("sh-empty-state has minimum height", async ({ page }) => {
    const minH = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-empty-state";
      document.body.appendChild(el);
      return getComputedStyle(el).minHeight;
    });
    expect(parseInt(minH)).toBeGreaterThanOrEqual(200);
  });

  test("sh-empty-state__mantra uses muted headline styling", async ({ page }) => {
    const styles = await page.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.className = "sh-empty-state";
      const mantra = document.createElement("div");
      mantra.className = "sh-empty-state__mantra";
      mantra.textContent = "STANDBY";
      wrapper.appendChild(mantra);
      document.body.appendChild(wrapper);
      const cs = getComputedStyle(mantra);
      return { fontSize: cs.fontSize };
    });
    const size = parseFloat(styles.fontSize);
    expect(size).toBeGreaterThanOrEqual(18);
  });

  test("sh-empty-state__hint uses disabled-level text", async ({ page }) => {
    const styles = await page.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.className = "sh-empty-state";
      const hint = document.createElement("div");
      hint.className = "sh-empty-state__hint";
      hint.textContent = "Ctrl+K";
      wrapper.appendChild(hint);
      document.body.appendChild(wrapper);
      return { fontSize: getComputedStyle(hint).fontSize };
    });
    const size = parseFloat(styles.fontSize);
    expect(size).toBeLessThan(14);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && npx playwright test tests/browser/css-empty-state.spec.js`
Expected: FAIL

**Step 3: Write implementation**

Create `css/components/empty-state.css`:

```css
/* Empty state — atmosphere-guide.md Rule 9 (The Quiet World)
   Purposeful void, not broken emptiness. */

.sh-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--space-8, 2rem);
  color: var(--text-tertiary, oklch(0.52 0 0));
  font-family: var(--sh-font, monospace);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest, 0.1em);
}

.sh-empty-state__mantra {
  font-size: var(--type-headline, 1.25rem);
  font-weight: 700;
  color: var(--text-muted, oklch(0.4 0 0));
  letter-spacing: 0.2em;
}

.sh-empty-state__hint {
  font-size: var(--type-micro, 0.6875rem);
  color: var(--text-disabled, oklch(0.3 0 0));
  margin-top: var(--space-4, 1rem);
}
```

Add to `css/superhot.css` imports:

```css
@import "./components/empty-state.css" layer(superhot.base);
```

**Step 4: Run test to verify it passes**

Run: `cd /home/justin/Documents/projects/superhot-ui && npm run build && npx playwright test tests/browser/css-empty-state.spec.js`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add css/components/empty-state.css css/superhot.css tests/browser/css-empty-state.spec.js
git commit -m "feat: add empty state styling (atmosphere rule 9)"
```

---

### Task 3: CRT Presets + Rest-Frame Tokens

**Files:**

- Modify: `js/crt.js` (add presets + setCrtPreset)
- Modify: `css/semantic.css` (add rest-frame tokens)
- Test: `tests/crt.test.js` (add preset tests)
- Test: `tests/browser/css-semantic.spec.js` (add rest-frame token tests — if file exists, else new)

**Step 1: Write the unit test for CRT presets**

Add to `tests/crt.test.js` (append to existing file):

```javascript
describe("CRT_PRESETS", () => {
  it("exports four named presets", () => {
    assert.ok(CRT_PRESETS.data);
    assert.ok(CRT_PRESETS.status);
    assert.ok(CRT_PRESETS.immersive);
    assert.ok(CRT_PRESETS.off);
  });

  it("data preset disables scanline and flicker", () => {
    assert.equal(CRT_PRESETS.data.stripe, true);
    assert.equal(CRT_PRESETS.data.scanline, false);
    assert.equal(CRT_PRESETS.data.flicker, false);
  });

  it("status preset enables scanline, disables flicker", () => {
    assert.equal(CRT_PRESETS.status.stripe, true);
    assert.equal(CRT_PRESETS.status.scanline, true);
    assert.equal(CRT_PRESETS.status.flicker, false);
  });

  it("immersive preset enables everything", () => {
    assert.equal(CRT_PRESETS.immersive.stripe, true);
    assert.equal(CRT_PRESETS.immersive.scanline, true);
    assert.equal(CRT_PRESETS.immersive.flicker, true);
  });

  it("off preset disables everything", () => {
    assert.equal(CRT_PRESETS.off.stripe, false);
    assert.equal(CRT_PRESETS.off.scanline, false);
    assert.equal(CRT_PRESETS.off.flicker, false);
  });
});

describe("setCrtPreset", () => {
  let root;

  beforeEach(() => {
    root = mockDocumentElement();
    globalThis.document = { documentElement: root };
  });

  afterEach(() => {
    delete globalThis.document;
  });

  it("applies the data preset", () => {
    setCrtPreset("data");
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("applies the status preset", () => {
    setCrtPreset("status");
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "block");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("throws on unknown preset", () => {
    assert.throws(() => setCrtPreset("nope"), /Unknown CRT preset/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/crt.test.js`
Expected: FAIL — CRT_PRESETS and setCrtPreset not exported

**Step 3: Add CRT presets to js/crt.js**

Add before the `setCrtMode` function:

```javascript
export const CRT_PRESETS = {
  data: { stripe: true, scanline: false, flicker: false },
  status: { stripe: true, scanline: true, flicker: false },
  immersive: { stripe: true, scanline: true, flicker: true },
  off: { stripe: false, scanline: false, flicker: false },
};

export function setCrtPreset(preset) {
  const config = CRT_PRESETS[preset];
  if (!config) throw new Error(`Unknown CRT preset: ${preset}`);
  setCrtMode(config);
}
```

**Step 4: Add rest-frame tokens to css/semantic.css**

Add a new section in the Motion tokens area:

```css
/* Rest-frame tokens — atmosphere-guide.md Rule 7 */
--rest-after-shatter: 300ms;
--rest-after-glitch: 200ms;
--rest-after-state-change: 500ms;
--rest-after-navigation: 200ms;
```

**Step 5: Update CRT test import**

Ensure the test file imports `CRT_PRESETS` and `setCrtPreset` from `../js/crt.js`.

**Step 6: Run tests**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/crt.test.js`
Expected: PASS (existing + 7 new)

**Step 7: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add js/crt.js css/semantic.css tests/crt.test.js
git commit -m "feat: add CRT presets + rest-frame tokens (atmosphere rules 7, 14)"
```

---

## Batch 2: JS Atmosphere Utilities (parallel — no dependencies between tasks)

### Task 4: Effect Density Tracker

**Files:**

- Create: `js/atmosphere.js`
- Test: `tests/atmosphere.test.js`

**Step 1: Write the unit test**

```javascript
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  trackEffect,
  activeEffectCount,
  isOverBudget,
  resetEffects,
  MAX_EFFECTS,
} from "../js/atmosphere.js";

describe("Effect density tracker", () => {
  beforeEach(() => {
    resetEffects();
  });

  it("starts with zero active effects", () => {
    assert.equal(activeEffectCount(), 0);
  });

  it("trackEffect increments count and returns cleanup", () => {
    const cleanup = trackEffect("pulse-1");
    assert.equal(activeEffectCount(), 1);
    cleanup();
    assert.equal(activeEffectCount(), 0);
  });

  it("tracks multiple effects independently", () => {
    const c1 = trackEffect("pulse-1");
    const c2 = trackEffect("glitch-1");
    const c3 = trackEffect("mantra-1");
    assert.equal(activeEffectCount(), 3);
    c2();
    assert.equal(activeEffectCount(), 2);
    c1();
    c3();
    assert.equal(activeEffectCount(), 0);
  });

  it("isOverBudget returns false at MAX_EFFECTS", () => {
    for (let i = 0; i < MAX_EFFECTS; i++) trackEffect(`e-${i}`);
    assert.equal(isOverBudget(), false);
  });

  it("isOverBudget returns true above MAX_EFFECTS", () => {
    for (let i = 0; i <= MAX_EFFECTS; i++) trackEffect(`e-${i}`);
    assert.equal(isOverBudget(), true);
  });

  it("double-cleanup is safe (no negative count)", () => {
    const cleanup = trackEffect("pulse-1");
    cleanup();
    cleanup();
    assert.equal(activeEffectCount(), 0);
  });

  it("MAX_EFFECTS is 3", () => {
    assert.equal(MAX_EFFECTS, 3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/atmosphere.test.js`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `js/atmosphere.js`:

```javascript
/**
 * Effect density tracker — atmosphere-guide.md Rule 8.
 * Tracks active animated effects per viewport to prevent cognitive overload.
 * Max 3 simultaneous animated effects recommended.
 */

export const MAX_EFFECTS = 3;

const _active = new Set();

/**
 * Register an active effect. Returns a cleanup function.
 * Call cleanup when the effect ends or the element unmounts.
 * @param {string} id — Unique identifier for this effect instance
 * @returns {() => void} cleanup function
 */
export function trackEffect(id) {
  _active.add(id);
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    _active.delete(id);
  };
}

/** Current number of active animated effects. */
export function activeEffectCount() {
  return _active.size;
}

/** True if active effects exceed the recommended budget. */
export function isOverBudget() {
  return _active.size > MAX_EFFECTS;
}

/** Reset all tracked effects (testing only). */
export function resetEffects() {
  _active.clear();
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/atmosphere.test.js`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add js/atmosphere.js tests/atmosphere.test.js
git commit -m "feat: add effect density tracker (atmosphere rule 8)"
```

---

### Task 5: Shatter Presets

**Files:**

- Modify: `js/shatter.js` (add SHATTER_PRESETS export, update shatterElement)
- Test: `tests/shatter.test.js` (add preset tests to existing file)

**Step 1: Write the unit test**

Add to existing `tests/shatter.test.js`:

```javascript
describe("SHATTER_PRESETS", () => {
  it("exports four named presets", () => {
    assert.ok(SHATTER_PRESETS.toast);
    assert.ok(SHATTER_PRESETS.cancel);
    assert.ok(SHATTER_PRESETS.alert);
    assert.ok(SHATTER_PRESETS.purge);
  });

  it("toast has 4 fragments", () => {
    assert.equal(SHATTER_PRESETS.toast.fragments, 4);
  });

  it("cancel has 6 fragments", () => {
    assert.equal(SHATTER_PRESETS.cancel.fragments, 6);
  });

  it("alert has 8 fragments", () => {
    assert.equal(SHATTER_PRESETS.alert.fragments, 8);
  });

  it("purge has 12 fragments", () => {
    assert.equal(SHATTER_PRESETS.purge.fragments, 12);
  });
});

describe("shatterElement with preset", () => {
  it("accepts a preset name string as second argument", () => {
    const el = mockElement();
    const cleanup = shatterElement(el, "toast");
    assert.equal(el.children.length, 4);
    cleanup();
  });

  it("falls back to default fragments when preset unknown", () => {
    const el = mockElement();
    const cleanup = shatterElement(el, { fragments: 5 });
    assert.equal(el.children.length, 5);
    cleanup();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/shatter.test.js`
Expected: FAIL — SHATTER_PRESETS not exported, string arg not handled

**Step 3: Add presets to js/shatter.js**

Add at top of file:

```javascript
export const SHATTER_PRESETS = {
  toast: { fragments: 4 },
  cancel: { fragments: 6 },
  alert: { fragments: 8 },
  purge: { fragments: 12 },
};
```

Update `shatterElement` signature to resolve preset names:

```javascript
export function shatterElement(element, optsOrPreset) {
  let opts = optsOrPreset;
  if (typeof optsOrPreset === "string") {
    opts = SHATTER_PRESETS[optsOrPreset] || {};
  }
  // ... rest of existing implementation unchanged
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/shatter.test.js`
Expected: PASS (existing + 7 new)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add js/shatter.js tests/shatter.test.js
git commit -m "feat: add shatter presets (atmosphere rule 11)"
```

---

## Batch 3: Integration + Preact (sequential — depends on Batch 1+2)

### Task 6: ShEmptyState Component

**Files:**

- Create: `preact/ShEmptyState.jsx`
- Test: `tests/empty-state-component.test.js`

**Step 1: Write the unit test**

```javascript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShEmptyState } from "../preact/ShEmptyState.jsx";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return null;
  const props = vnode.props || {};
  if ((props.class || "").includes(cls)) return vnode;
  const children = Array.isArray(props.children)
    ? props.children
    : props.children
      ? [props.children]
      : [];
  for (const child of children) {
    const found = findByClass(child, cls);
    if (found) return found;
  }
  return null;
}

describe("ShEmptyState", () => {
  it("renders with sh-empty-state class", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY" });
    assert.ok(vnode);
    assert.ok((vnode.props.class || "").includes("sh-empty-state"));
  });

  it("renders mantra text in mantra element", () => {
    const vnode = ShEmptyState({ mantra: "NO DATA" });
    const mantra = findByClass(vnode, "sh-empty-state__mantra");
    assert.ok(mantra);
    const children = Array.isArray(mantra.props.children)
      ? mantra.props.children
      : [mantra.props.children];
    assert.ok(children.includes("NO DATA"));
  });

  it("renders hint when provided", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY", hint: "Ctrl+K" });
    const hint = findByClass(vnode, "sh-empty-state__hint");
    assert.ok(hint);
  });

  it("omits hint element when not provided", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY" });
    const hint = findByClass(vnode, "sh-empty-state__hint");
    assert.equal(hint, null);
  });

  it("passes through additional class names", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY", class: "custom" });
    assert.ok(vnode.props.class.includes("custom"));
    assert.ok(vnode.props.class.includes("sh-empty-state"));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/empty-state-component.test.js`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `preact/ShEmptyState.jsx`:

```jsx
/**
 * ShEmptyState — the Quiet World (atmosphere-guide.md Rule 9).
 * Renders a centered void state with a mantra and optional hint.
 * No hooks — safe to call as plain function in tests.
 */
export function ShEmptyState({ mantra, hint, class: cls, ...rest }) {
  const className = ["sh-empty-state", cls].filter(Boolean).join(" ");
  return (
    <div class={className} {...rest}>
      <div class="sh-empty-state__mantra">{mantra}</div>
      {hint && <div class="sh-empty-state__hint">{hint}</div>}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/justin/Documents/projects/superhot-ui && node --test tests/empty-state-component.test.js`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add preact/ShEmptyState.jsx tests/empty-state-component.test.js
git commit -m "feat: add ShEmptyState component (atmosphere rule 9)"
```

---

### Task 7: Build Wiring + Exports

**Files:**

- Modify: `esbuild.config.mjs` (add ShEmptyState export, add atmosphere.js to JS barrel)
- Modify: `package.json` (add atmosphere.js to files if needed)

**Step 1: Add ShEmptyState to Preact barrel export**

In `esbuild.config.mjs`, find the Preact stdin contents and add:

```javascript
export { ShEmptyState } from "./preact/ShEmptyState.jsx";
```

**Step 2: Add atmosphere.js to JS barrel export**

In the JS stdin contents section, add:

```javascript
export { trackEffect, activeEffectCount, isOverBudget, MAX_EFFECTS } from "./js/atmosphere.js";
export { CRT_PRESETS, setCrtPreset } from "./js/crt.js";
export { SHATTER_PRESETS } from "./js/shatter.js";
```

Note: `setCrtMode` and `shatterElement` are already exported. Only add the new named exports.

**Step 3: Build and verify**

Run: `cd /home/justin/Documents/projects/superhot-ui && npm run build`
Expected: Build succeeds, `dist/superhot.js` includes new exports, `dist/superhot.preact.js` includes ShEmptyState

**Step 4: Run full test suite**

Run: `cd /home/justin/Documents/projects/superhot-ui && npm run test:all`
Expected: All tests pass (existing 132 + ~24 new unit tests + existing 20 + ~9 new browser tests)

**Step 5: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add esbuild.config.mjs
git commit -m "feat: wire atmosphere utilities into build exports"
```

---

### Task 8: Consumer Documentation Updates

**Files:**

- Modify: `docs/consumer-guide.md` (add atmosphere imports section)
- Modify: `docs/consumer-claude-md.md` (add atmosphere rules block)

**Step 1: Add atmosphere section to consumer-guide.md**

After the "Token Overrides" section, add:

````markdown
---

## Atmosphere Utilities

Read `docs/atmosphere-guide.md` for the full 20-rule guide. Key imports:

### Glow Hierarchy

```css
/* Apply to any element for visual priority levels */
.sh-glow-ambient    /* 4px phosphor — recedes */
.sh-glow-standard   /* 8px phosphor — standard focus */
.sh-glow-critical   /* 16px threat — demands attention */
.sh-glow-none       /* explicitly remove glow */
```
````

### Empty States

```jsx
import { ShEmptyState } from "superhot-ui/preact";

<ShEmptyState mantra="STANDBY" hint="Ctrl+K" />;
```

### CRT Presets

```js
import { setCrtPreset } from "superhot-ui";

setCrtPreset("data"); // stripe only — for tables/charts
setCrtPreset("status"); // stripe + scanline — for status dashboards
setCrtPreset("immersive"); // all three — for ambient displays
setCrtPreset("off"); // disable all CRT effects
```

### Effect Density

```js
import { trackEffect, isOverBudget } from "superhot-ui";

// Register when an effect starts
const cleanup = trackEffect("threat-pulse-card-3");

// Check budget before adding more
if (!isOverBudget()) {
  // safe to add another effect
}

// Call cleanup when effect ends
cleanup();
```

### Shatter Presets

```js
import { shatterElement } from "superhot-ui";

shatterElement(el, "toast"); // 4 fragments — quick dismissal
shatterElement(el, "cancel"); // 6 fragments — deliberate destruction
shatterElement(el, "alert"); // 8 fragments — dramatic catharsis
shatterElement(el, "purge"); // 12 fragments — overwhelming release
```

### Rest-Frame Tokens

```css
/* Use these between animations to let the interface breathe */
animation-delay: var(--rest-after-shatter); /* 300ms */
animation-delay: var(--rest-after-glitch); /* 200ms */
animation-delay: var(--rest-after-state-change); /* 500ms */
animation-delay: var(--rest-after-navigation); /* 200ms */
```

````

**Step 2: Add atmosphere rules to consumer-claude-md.md**

After the "Interaction feedback" section, add:

```markdown
**Atmosphere rules (key subset from atmosphere-guide.md)**
- Void ≥ 60% of viewport — if components cover more than 40%, the aesthetic collapses
- Red budget ≤ 10% of visible surface during healthy state — scarcity = power
- Max 3 simultaneous animated effects per viewport — use `trackEffect()` / `isOverBudget()`
- Rest frames between animations: 300ms after shatter, 200ms after glitch, 500ms after state change
- Glow hierarchy: ambient (4px), standard (8px), critical (16px) — one critical glow per viewport
- Empty states show `ShEmptyState` with piOS mantra (`STANDBY`, `NO DATA`) — never apologetic text
- CRT presets: `data` for tables, `status` for dashboards, `off` for mobile
- Shatter presets by emotion: `toast` (4), `cancel` (6), `alert` (8), `purge` (12)
````

**Step 3: Commit**

```bash
cd /home/justin/Documents/projects/superhot-ui
git add docs/consumer-guide.md docs/consumer-claude-md.md
git commit -m "docs: add atmosphere utilities to consumer guides"
```

---

## Summary

| Batch | Tasks | Parallel?       | New Files                                       | Modified Files                                               | New Tests                                                   |
| ----- | ----- | --------------- | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| 1     | 1–3   | Yes (3 agents)  | glow.css, empty-state.css                       | superhot.css, semantic.css, crt.js, crt.test.js              | css-glow.spec.js, css-empty-state.spec.js, crt preset tests |
| 2     | 4–5   | Yes (2 agents)  | atmosphere.js, atmosphere.test.js               | shatter.js, shatter.test.js                                  | atmosphere.test.js, shatter preset tests                    |
| 3     | 6–8   | No (sequential) | ShEmptyState.jsx, empty-state-component.test.js | esbuild.config.mjs, consumer-guide.md, consumer-claude-md.md | empty-state-component.test.js                               |

**Total new code:** 3 CSS files, 1 JS utility, 1 Preact component, ~5 test files
**Total modified:** 6 existing files (build config, superhot.css, semantic.css, crt.js, shatter.js, 2 docs)
**Estimated new tests:** ~30 (unit + browser)
