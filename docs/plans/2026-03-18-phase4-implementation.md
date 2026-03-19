# Phase 4: Quality Investments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close final gaps: 5 integration recipes, accessibility tests, responsive breakpoint tests, and dist CSS flattening.

**Architecture:** Recipes are standalone markdown tutorials. A11y and responsive tests use Playwright. Dist CSS flattening uses esbuild CSS bundling instead of file copy.

**Tech Stack:** Markdown, Playwright, esbuild CSS

---

## Batch 1: Integration Recipes (5 tutorials)

### Task 1.1: Create monitoring dashboard recipe

**Files:**

- Create: `docs/recipes/monitoring-dashboard.md`

**Content:** End-to-end example of building a monitoring dashboard using superhot-ui. Covers:

- Layout: ShNav (sidebar) + ShPageBanner (header) + content area
- Hero card: ShHeroCard with sparkline, freshness polling, warning state
- Stats grid: ShStatsGrid with 4-6 KPIs
- Status badges: ShStatusBadge for service health
- Threshold bar: `.sh-threshold-bar` + `applyThreshold()` for resource metrics
- Polling heartbeat: `heartbeat()` on each fetch cycle
- Failure escalation: `EscalationTimer` wired to ShMantra + ShIncidentHUD
- Recovery: `recoverySequence()` on service restoration
- CRT mode: ShCrtToggle with localStorage persistence
- Hardware downgrade: `applyCapability(detectCapability())` at init

Include complete JSX code blocks with imports. Show the full component tree. Reference atmosphere-guide rules where relevant.

**Step 1: Commit**

```bash
git add docs/recipes/monitoring-dashboard.md
git commit -m "docs: add monitoring dashboard integration recipe"
```

---

### Task 1.2: Create data table recipe

**Files:**

- Create: `docs/recipes/data-table-with-state.md`

**Content:** Complete example of ShDataTable with:

- Column definitions (sortable and non-sortable)
- Row data from a polling API
- Status badge in a table cell (custom render via column value)
- Search filtering behavior
- Empty state ("NO RESULTS")
- ShFrozen wrapping the table for freshness indication
- Sorting persistence via localStorage
- Integration with ShToast for row actions

Include: full column/row shape, JSX, polling pattern, piOS voice for empty/error states.

**Step 1: Commit**

```bash
git add docs/recipes/data-table-with-state.md
git commit -m "docs: add data table integration recipe"
```

---

### Task 1.3: Create responsive navigation recipe

**Files:**

- Create: `docs/recipes/responsive-navigation.md`

**Content:** Complete ShNav setup across all 3 breakpoints:

- Item definitions (path, label, icon component, system flag)
- Hash-based routing with `currentPath` signal
- Phone: bottom tab bar with 4 primary items + More sheet for system items
- Tablet: collapsible icon rail (56px ↔ 240px)
- Desktop: fixed 240px sidebar with system section
- Logo slot for tablet/desktop
- Footer slot for version/settings
- Integration with ShPageBanner (page title updates on route change)
- CSS breakpoint details (639px, 1023px)

Include: full items array, router setup, JSX tree.

**Step 1: Commit**

```bash
git add docs/recipes/responsive-navigation.md
git commit -m "docs: add responsive navigation integration recipe"
```

---

### Task 1.4: Create error handling recipe

**Files:**

- Create: `docs/recipes/error-handling-flow.md`

**Content:** End-to-end error handling with superhot-ui effects:

- ShErrorState for page-level errors (role="alert")
- ShToast for transient errors (auto-dismiss warnings, persistent errors)
- ShThreatPulse on affected cards during errors
- ShGlitch burst on error onset
- ShMantra watermark for persistent failures ("BACKEND OFFLINE")
- EscalationTimer: component → sidebar → section mantra → layout mantra
- recoverySequence: glitch → border → pulse stop → toast RESTORED
- ShIncidentHUD for system-wide incidents
- Audio: playSfx("error") on fault, playSfx("recovery") on restore
- Signal degradation on unreliable data sources

Include: complete error boundary component, escalation wiring, recovery flow.

**Step 1: Commit**

```bash
git add docs/recipes/error-handling-flow.md
git commit -m "docs: add error handling flow integration recipe"
```

---

### Task 1.5: Create loading states recipe

**Files:**

- Create: `docs/recipes/loading-states.md`

**Content:** Loading patterns with superhot-ui:

- ShSkeleton: shape-matched placeholders (stat card, table row, hero card, graph)
- Stagger entry: `.sh-stagger-children` for choreographed appearance (Rule 10)
- Boot sequence: `bootSequence()` for app initialization
- ShFrozen: freshness states for loaded data (fresh → cooling → frozen → stale)
- ShEmptyState: quiet world for no-data state ("STANDBY", Ctrl+K hint)
- Matrix rain: ShMatrixRain during heavy computation
- Transition from skeleton → content (opacity 0→1, translateY -4px→0)
- Rest frames between animations (Rule 7)

Include: skeleton shape examples matching each component, stagger timing, JSX.

**Step 1: Commit**

```bash
git add docs/recipes/loading-states.md
git commit -m "docs: add loading states integration recipe"
```

---

## Batch 2: Accessibility Tests

### Task 2.1: Create keyboard navigation Playwright tests

**Files:**

- Create: `tests/browser/a11y-keyboard.spec.js`

**Content:** Playwright tests for keyboard interaction:

```js
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Keyboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test(":focus-visible outline applied on Tab", async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.textContent = "Test";
      btn.id = "btn";
      document.body.appendChild(btn);
    });
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      return getComputedStyle(el).outlineStyle;
    });
    expect(outline).toBe("solid");
  });

  test("ShModal closes on Escape", async ({ page }) => {
    const closed = await page.evaluate(() => {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "sh-modal-overlay";
        overlay.setAttribute("role", "dialog");
        document.body.appendChild(overlay);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") resolve(true);
        });
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });
    });
    expect(closed).toBe(true);
  });

  test("ShCollapsible toggle has aria-expanded", async ({ page }) => {
    await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "sh-collapsible";
      div.setAttribute("data-sh-open", "true");
      const btn = document.createElement("button");
      btn.setAttribute("aria-expanded", "true");
      btn.className = "sh-collapsible-toggle";
      div.appendChild(btn);
      document.body.appendChild(div);
    });
    const expanded = await page.evaluate(() => {
      return document.querySelector(".sh-collapsible-toggle").getAttribute("aria-expanded");
    });
    expect(expanded).toBe("true");
  });
});
```

**Step 1: Run test**

Run: `npx playwright test tests/browser/a11y-keyboard.spec.js --project=chromium`

**Step 2: Commit**

```bash
git add tests/browser/a11y-keyboard.spec.js
git commit -m "test: add keyboard navigation accessibility tests"
```

---

### Task 2.2: Create ARIA and screen reader Playwright tests

**Files:**

- Create: `tests/browser/a11y-aria.spec.js`

**Content:** Tests for ARIA attributes and roles:

- ShToast has `role="status"` or `role="alert"` and `aria-live`
- ShErrorState has `role="alert"` and `aria-live="assertive"`
- ShModal overlay has `role="dialog"` and `aria-modal="true"`
- ShCommandPalette input has `aria-label`
- ShPipeline SVG has `role="img"` and `aria-label`
- ShPageBanner SVG has `role="img"` and `aria-label`
- ShIncidentHUD has `role="alert"`
- ShMatrixRain canvas has `aria-hidden="true"`
- Focus ring color is non-transparent (threat red)

Each test: create minimal DOM with the required attributes/classes, verify computed ARIA values.

**Step 1: Run test**

Run: `npx playwright test tests/browser/a11y-aria.spec.js --project=chromium`

**Step 2: Commit**

```bash
git add tests/browser/a11y-aria.spec.js
git commit -m "test: add ARIA role and attribute accessibility tests"
```

---

## Batch 3: Responsive Breakpoint Tests

### Task 3.1: Create responsive CSS tests

**Files:**

- Create: `tests/browser/responsive.spec.js`

**Content:** Playwright tests with viewport resizing:

```js
import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Responsive breakpoints", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("T1 animations disabled at phone width (< 640px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-t1-scan-sweep";
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).toBe("none");
  });

  test("T1 animations active at desktop width (>= 1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-t1-scan-sweep";
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).not.toBe("none");
  });

  test("glitch reduced to color-only at tablet width (640-1023px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-sh-effect", "glitch");
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).toBe("none");
  });

  test("CRT scanlines render at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-crt";
      el.id = "crt";
      el.style.width = "200px";
      el.style.height = "200px";
      document.body.appendChild(el);
    });
    const display = await page.evaluate(
      () => getComputedStyle(document.getElementById("crt"), "::before").display,
    );
    // CRT stripe defaults to block
    expect(display).not.toBe("none");
  });
});
```

**Step 1: Run test**

Run: `npx playwright test tests/browser/responsive.spec.js --project=chromium`

**Step 2: Commit**

```bash
git add tests/browser/responsive.spec.js
git commit -m "test: add responsive breakpoint tests for animation tiers and CRT"
```

---

## Batch 4: Dist CSS Flattening + Final Build

### Task 4.1: Replace CSS copy with esbuild CSS bundling

**Files:**

- Modify: `esbuild.config.mjs`

**Step 1:** Read esbuild.config.mjs. Currently it does `copyFileSync("css/superhot.css", "dist/superhot.css")` which copies the file with `@import` statements still in it. Replace with esbuild CSS bundling that resolves all imports into a single flat file.

Replace the copyFileSync line with an esbuild CSS build:

```js
// CSS bundle (resolves @import into single file)
const cssConfig = {
  ...shared,
  entryPoints: ["css/superhot.css"],
  outfile: "dist/superhot.css",
  bundle: true,
  loader: { ".css": "css" },
};
```

Then add `cssConfig` to both the watch and build paths:

```js
if (isWatch) {
  const [jsCtx, preactCtx, cssCtx] = await Promise.all([
    context(jsConfig),
    context(preactConfig),
    context(cssConfig),
  ]);
  await Promise.all([jsCtx.watch(), preactCtx.watch(), cssCtx.watch()]);
} else {
  await Promise.all([build(jsConfig), build(preactConfig), build(cssConfig)]);
}
```

Remove the `copyFileSync` and its `console.log` line.

**Step 2:** Run: `npm run build`

Verify `dist/superhot.css` is a single flat file with no `@import` statements:

```bash
grep -c "@import" dist/superhot.css  # should be 0
```

**Step 3:** Run: `npm test && npx playwright test`

**Step 4:** Commit:

```bash
git add esbuild.config.mjs
git commit -m "fix: flatten dist CSS via esbuild bundling — no more nested @imports"
```

---

### Task 4.2: Final build verification + version bump

**Step 1:** Run full suite:

```bash
npm run build && npm test && npx playwright test
```

**Step 2:** Bump version in package.json to 0.3.0 (matching CHANGELOG):

```bash
npm version 0.3.0 --no-git-tag-version
```

**Step 3:** Commit:

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to 0.3.0"
```

---

## Summary

| Batch                  | Tasks        | New Files       | Modified Files                   |
| ---------------------- | ------------ | --------------- | -------------------------------- |
| 1 — Recipes            | 5            | 5 recipe docs   | —                                |
| 2 — A11y tests         | 2            | 2 test specs    | —                                |
| 3 — Responsive tests   | 1            | 1 test spec     | —                                |
| 4 — Dist CSS + version | 2            | —               | esbuild.config.mjs, package.json |
| **Total**              | **10 tasks** | **8 new files** | **2 modified files**             |
