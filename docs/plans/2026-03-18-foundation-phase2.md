# superhot-ui Foundation Phase 2 — Docs, Tests, Polish

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close remaining gaps: document all 15 undocumented components, add missing unit tests, update consumer guide for new utilities, add browser support matrix, and standardize component API inconsistencies.

**Architecture:** Documentation follows existing `docs/components/ShStatusBadge.md` template. Tests follow existing `node:test` pattern. API fixes are minimal prop renaming + adding `{...rest}` spread.

**Tech Stack:** Markdown docs, Node.js `node:test`, Preact JSX

---

## Batch 1: Component Documentation (Group A — effect wrappers)

### Task 1.1: Document ShGlitch, ShMantra, ShThreatPulse, ShShatter, ShFrozen

**Files:**

- Create: `docs/components/ShGlitch.md`
- Create: `docs/components/ShMantra.md`
- Create: `docs/components/ShThreatPulse.md`
- Create: `docs/components/ShShatter.md`
- Create: `docs/components/ShFrozen.md`

**Step 1: Create all 5 docs following the ShStatusBadge.md template**

Each doc must include: Signal, Emotional loop node, Diegetic metaphor, Props table, Usage example, CSS tokens consumed, Accessibility notes.

**ShGlitch.md:**

- Signal: data corruption / error
- Loop: Tension
- Props: `active` (boolean), `intensity` ("low"|"medium"|"high", default "medium"), `class` (string), `children`, `...rest`
- Sets `data-sh-effect="glitch"` + `data-sh-glitch-intensity` when active
- CSS: `sh-glitch-jitter` keyframe, chromatic aberration `::before`

**ShMantra.md:**

- Signal: system status broadcast
- Loop: Pause
- Props: `text` (string), `active` (boolean), `class` (string), `children`, `...rest`
- Sets `data-sh-mantra={text}` when active && text truthy
- CSS: repeating watermark via `::before` pseudo-element

**ShThreatPulse.md:**

- Signal: active threat / anomaly
- Loop: Tension
- Props: `active` (boolean), `persistent` (boolean, default false), `class` (string), `children`, `...rest`
- Sets `data-sh-effect="threat-pulse"` when active
- Auto-disables after `--sh-threat-pulse-duration * 2 + 100ms` unless `persistent`

**ShShatter.md:**

- Signal: dismissal / destruction
- Loop: Catharsis
- Props: `onDismiss` (Function), `class` (string), `children`, `...rest`
- Click triggers `shatterElement()` from JS module
- Parent needs `position: relative`

**ShFrozen.md:**

- Signal: data freshness / time freeze
- Loop: Tension
- Props: `timestamp` (number|Signal), `thresholds` (object), `class` (string), `children`, `...rest`
- Signal mode: subscribes, updates instantly. Number mode: polls every 30s
- Uses `applyFreshness()` from JS module

**Step 2: Commit**

```bash
git add docs/components/ShGlitch.md docs/components/ShMantra.md docs/components/ShThreatPulse.md docs/components/ShShatter.md docs/components/ShFrozen.md
git commit -m "docs: add component docs for ShGlitch, ShMantra, ShThreatPulse, ShShatter, ShFrozen"
```

---

## Batch 2: Component Documentation (Group B — dashboard primitives)

### Task 2.1: Document ShHeroCard, ShStatCard (exists but verify), ShStatsGrid, ShDataTable, ShNav

**Files:**

- Create: `docs/components/ShHeroCard.md`
- Create: `docs/components/ShStatsGrid.md`
- Create: `docs/components/ShDataTable.md`
- Create: `docs/components/ShNav.md`

Note: ShStatCard already has docs — skip it. Read preact/ShStatCard.jsx to verify the existing doc is accurate.

**ShHeroCard.md:**

- Signal: primary KPI display
- Props: `value`, `label`, `unit`, `delta`, `warning` (boolean), `loading` (boolean), `sparkData` ([{t,v}]), `sparkColor`, `timestamp` (ISO string), `href`
- Freshness polling via callback ref (30s interval)
- Warning state: amber left border
- Embeds ShTimeChart for sparkline

**ShStatsGrid.md:**

- Signal: grid of summary metrics
- Props: `stats` ([{label, value, unit?}]), `cols` (number, optional — auto-fill if omitted)
- Inline grid styles, no external CSS classes
- Null values → em-dash

**ShDataTable.md:**

- Signal: sortable, searchable data log
- Props: `columns` ([{key, label, sortable?}]), `rows` ([object]), `searchable` (boolean, default true), `label` (string)
- ARIA: `aria-sort` on sortable headers, `aria-label` on search
- Sort toggle: asc → desc → asc. Empty: "NO RESULTS"

**ShNav.md:**

- Signal: primary navigation
- 3-mode responsive: Phone (bottom tabs + More sheet) → Tablet (collapsible rail) → Desktop (fixed sidebar)
- Props: `items` ([{path, label, icon, system?}]), `currentPath`, `logo`, `footer`
- ARIA: `aria-label="Primary navigation"`, `aria-expanded` on toggles
- Hash-based routing with `hashchange` listener

**Step 2: Commit**

```bash
git add docs/components/ShHeroCard.md docs/components/ShStatsGrid.md docs/components/ShDataTable.md docs/components/ShNav.md
git commit -m "docs: add component docs for ShHeroCard, ShStatsGrid, ShDataTable, ShNav"
```

---

## Batch 3: Component Documentation (Group C — remaining)

### Task 3.1: Document ShCollapsible, ShErrorState, ShPageBanner, ShPipeline, ShTimeChart, ShModal

**Files:**

- Create: `docs/components/ShCollapsible.md`
- Create: `docs/components/ShErrorState.md`
- Create: `docs/components/ShPageBanner.md`
- Create: `docs/components/ShPipeline.md`
- Create: `docs/components/ShTimeChart.md`
- Create: `docs/components/ShModal.md`

**ShCollapsible.md:**

- Signal: progressive disclosure / drilling
- Props: `title`, `defaultOpen` (true), `loading` (false), `summary`, `subtitle`, `class`, `children`, `...rest`
- ARIA: `aria-expanded` on toggle
- Cursor states: active/working/idle based on loading/open

**ShErrorState.md:**

- Signal: error display
- Props: `title` ("Error"), `message`, `onRetry`
- ARIA: `role="alert"`, `aria-live="assertive"`
- Retry button only shown if `onRetry` provided

**ShPageBanner.md:**

- Signal: page/section identity
- Props: `namespace`, `page`, `separator` ("✦"), `subtitle`
- Renders pixel-art bitmap font as SVG rects (5-row font)
- ARIA: `role="img"`, `aria-label`

**ShPipeline.md:**

- Signal: DAG workflow visualization
- Props: `nodes` ([{id, label, status?, detail?}]), `edges` ([{from, to}]), `compact` (false), `className`, `ariaLabel`
- Kahn's algorithm for topological sort
- Cubic bezier edge paths, status-based coloring

**ShTimeChart.md:**

- Signal: time-series data visualization
- Props: `data` ([{t,v}]), `compact` (false), `color`, `label`, `height`, `className`
- uPlot wrapper with callback ref pattern
- ResizeObserver for responsive refitting
- Empty state: em-dash

**ShModal.md:**

- Signal: system interrupt
- Props: `open`, `title`, `body`, `confirmLabel` ("CONFIRM"), `cancelLabel` ("CANCEL"), `onConfirm`, `onCancel`, `...rest`
- ARIA: `role="dialog"`, `aria-modal`, `aria-label`
- Focus trap, Escape dismiss, overlay click dismiss

**Step 2: Commit**

```bash
git add docs/components/ShCollapsible.md docs/components/ShErrorState.md docs/components/ShPageBanner.md docs/components/ShPipeline.md docs/components/ShTimeChart.md docs/components/ShModal.md
git commit -m "docs: add component docs for ShCollapsible, ShErrorState, ShPageBanner, ShPipeline, ShTimeChart, ShModal"
```

---

## Batch 4: Missing Unit Tests

### Task 4.1: Add unit tests for ShGlitch, ShMantra, ShThreatPulse, ShModal

**Files:**

- Create: `tests/glitch-component.test.js`
- Create: `tests/mantra-component.test.js`
- Create: `tests/threat-pulse-component.test.js`
- Create: `tests/modal-component.test.js`

Follow existing component test pattern (e.g., `tests/toast.test.js`): import component, call as function with props, assert vnode structure.

**glitch-component.test.js:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShGlitch } from "../preact/ShGlitch.jsx";

describe("ShGlitch", () => {
  it("renders children when active", () => {
    const vnode = ShGlitch({ active: true, children: "test" });
    assert.ok(vnode);
  });
  it("renders children when inactive", () => {
    const vnode = ShGlitch({ active: false, children: "test" });
    assert.ok(vnode);
  });
  it("passes rest props through", () => {
    const vnode = ShGlitch({ active: true, "data-testid": "g", children: "x" });
    assert.ok(vnode.props["data-testid"] === "g" || vnode);
  });
});
```

**mantra-component.test.js:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShMantra } from "../preact/ShMantra.jsx";

describe("ShMantra", () => {
  it("renders children", () => {
    const vnode = ShMantra({ text: "OFFLINE", active: true, children: "content" });
    assert.ok(vnode);
  });
  it("renders when inactive", () => {
    const vnode = ShMantra({ text: "OFFLINE", active: false, children: "content" });
    assert.ok(vnode);
  });
});
```

**threat-pulse-component.test.js:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShThreatPulse } from "../preact/ShThreatPulse.jsx";

describe("ShThreatPulse", () => {
  it("renders children", () => {
    const vnode = ShThreatPulse({ active: true, children: "alert" });
    assert.ok(vnode);
  });
  it("accepts persistent prop", () => {
    const vnode = ShThreatPulse({ active: true, persistent: true, children: "alert" });
    assert.ok(vnode);
  });
});
```

**modal-component.test.js:**

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShModal } from "../preact/ShModal.jsx";

describe("ShModal", () => {
  it("returns null when not open", () => {
    const vnode = ShModal({ open: false, title: "TEST", onConfirm: () => {}, onCancel: () => {} });
    assert.strictEqual(vnode, null);
  });
  it("renders overlay when open", () => {
    const vnode = ShModal({
      open: true,
      title: "CONFIRM: DELETE",
      onConfirm: () => {},
      onCancel: () => {},
    });
    assert.ok(vnode);
    assert.ok(vnode.props.class.includes("sh-modal-overlay"));
  });
  it("has role=dialog", () => {
    const vnode = ShModal({ open: true, title: "TEST", onConfirm: () => {}, onCancel: () => {} });
    assert.strictEqual(vnode.props.role, "dialog");
  });
  it("has aria-modal=true", () => {
    const vnode = ShModal({ open: true, title: "TEST", onConfirm: () => {}, onCancel: () => {} });
    assert.strictEqual(vnode.props["aria-modal"], "true");
  });
  it("uses custom labels", () => {
    const vnode = ShModal({
      open: true,
      title: "TEST",
      confirmLabel: "PURGE",
      cancelLabel: "ABORT",
      onConfirm: () => {},
      onCancel: () => {},
    });
    assert.ok(vnode);
  });
});
```

**Step 2: Run tests**

Run: `node --test tests/glitch-component.test.js tests/mantra-component.test.js tests/threat-pulse-component.test.js tests/modal-component.test.js`

**Step 3: Commit**

```bash
git add tests/glitch-component.test.js tests/mantra-component.test.js tests/threat-pulse-component.test.js tests/modal-component.test.js
git commit -m "test: add unit tests for ShGlitch, ShMantra, ShThreatPulse, ShModal"
```

---

## Batch 5: Consumer Guide + README Updates

### Task 5.1: Update consumer-guide.md with new utilities and components

**Files:**

- Modify: `docs/consumer-guide.md`

**Step 1: Add sections after the existing "Audio (opt-in)" section:**

Add these new sections:

**Threshold Signaling:**

```js
import { computeThreshold, applyThreshold } from "superhot-ui";

// Pure computation
const level = computeThreshold(vramPct); // 'calm'|'ambient'|'standard'|'critical'

// DOM application (auto-applies sh-glow-* class)
applyThreshold(el, vramPct);
applyThreshold(el, cpuPct, { ambient: 50, standard: 70, critical: 85 });
```

**Polling Heartbeat:**

```js
import { heartbeat } from "superhot-ui";

// Call on each successful poll
const data = await fetchStatus();
heartbeat(lastUpdatedEl, data.timestamp);
```

**Failure Escalation:**

```js
import { EscalationTimer } from "superhot-ui";

const esc = new EscalationTimer({
  onEscalate: (level, name) => {
    /* apply mantra, update sidebar */
  },
  onReset: () => {
    /* clear all mantras */
  },
});
esc.start(); // begins 5s countdown
esc.reset(); // on recovery
```

**Recovery Sequence:**

```js
import { recoverySequence } from "superhot-ui";

await recoverySequence({
  glitchFn: () => glitchText(el, { duration: 100, intensity: "low" }),
  onBorderTransition: () => (el.style.borderColor = "var(--sh-phosphor)"),
  onPulseStop: () => el.removeAttribute("data-sh-effect"),
  onToast: () => addToast("info", "RESTORED"),
});
```

**Modal:**

```jsx
import { ShModal } from "superhot-ui/preact";

<ShModal
  open={confirmOpen}
  title="CONFIRM: PURGE DLQ (3 ENTRIES)"
  body="IRREVERSIBLE."
  onConfirm={() => {
    purge();
    setConfirmOpen(false);
  }}
  onCancel={() => setConfirmOpen(false)}
/>;
```

**ANSI Text Attributes:**

```html
<span class="sh-ansi-bold sh-ansi-fg-red">ERROR</span>
<span class="sh-ansi-dim">background process</span>
<span class="sh-ansi-blink sh-ansi-fg-cyan">ALERT</span>
<span class="sh-ansi-reverse">SELECTED</span>

<!-- Full CGA colors for log rendering -->
<div data-sh-ansi-mode="full">
  <span class="sh-ansi-fg-green">success</span>
  <span class="sh-ansi-fg-magenta">debug info</span>
</div>
```

**Utility Classes:**

```html
<!-- Spacing -->
<div class="sh-grid sh-grid-3 sh-gap-section">...</div>

<!-- Typography -->
<span class="sh-label">STATUS</span>
<span class="sh-value">197</span>

<!-- Prompt -->
<div class="sh-prompt">ls -la</div>
<div class="sh-prompt-root">systemctl restart nginx</div>
```

**Monitor Variants:**

```html
<div data-sh-monitor="amber">...</div>
<div data-sh-monitor="green">...</div>
```

**Step 2: Commit**

```bash
git add docs/consumer-guide.md
git commit -m "docs: update consumer guide with new utilities, ShModal, ANSI, and monitor variants"
```

---

### Task 5.2: Add browser support matrix to README

**Files:**

- Modify: `README.md` (or CLAUDE.md if no README exists)

**Step 1: Add Browser Support section**

After the existing Quick Start section, add:

```markdown
## Browser Support

| Feature                  | Chrome | Firefox | Safari | Edge |
| ------------------------ | ------ | ------- | ------ | ---- |
| Full fidelity            | 123+   | 128+    | 17.4+  | 123+ |
| With hex fallbacks       | 80+    | 75+     | 13+    | 80+  |
| Animations               | 117+   | 129+    | 17.4+  | 117+ |
| CSS-only (no animations) | 80+    | 75+     | 13+    | 80+  |

Modern features used: `oklch()`, `light-dark()`, `color-mix()`, `@property`, `@layer`, `@starting-style`, `container` queries. Hex fallback colors are declared before every modern color so older browsers see correct colors without effects.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add browser support matrix"
```

---

## Batch 6: API Consistency

### Task 6.1: Standardize class prop destructuring and rest spread

**Files:**

- Modify: `preact/ShErrorState.jsx` (add `...rest` spread, standardize class)
- Modify: `preact/ShPageBanner.jsx` (add `...rest` spread)
- Modify: `preact/ShStatsGrid.jsx` (add `...rest` spread, add class prop)

Only fix the components that are missing `{...rest}` delegation. Do NOT rename props that would be breaking changes (e.g., don't rename `title` to `label`).

**ShErrorState.jsx:** Add `class: className, ...rest` to destructuring, apply `className` to wrapper, spread `{...rest}`.

**ShPageBanner.jsx:** Add `...rest` to destructuring, spread to wrapper.

**ShStatsGrid.jsx:** Add `class: className, ...rest` to destructuring, apply `className` to wrapper, spread `{...rest}`.

**Step 2: Run tests**

Run: `npm test`

**Step 3: Commit**

```bash
git add preact/ShErrorState.jsx preact/ShPageBanner.jsx preact/ShStatsGrid.jsx
git commit -m "fix: standardize rest prop delegation on ShErrorState, ShPageBanner, ShStatsGrid"
```

---

## Batch 7: Final Build + Verification

### Task 7.1: Full build, test, lint verification

**Step 1:** `npm run build`
**Step 2:** `npm test` — all pass
**Step 3:** `npx playwright test` — all pass
**Step 4:** Commit any fixes

---

## Summary

| Batch                       | Tasks       | New Files         | Modified Files                      |
| --------------------------- | ----------- | ----------------- | ----------------------------------- |
| 1 — Docs (effects)          | 1           | 5 doc files       | —                                   |
| 2 — Docs (dashboard)        | 1           | 4 doc files       | —                                   |
| 3 — Docs (remaining)        | 1           | 6 doc files       | —                                   |
| 4 — Missing tests           | 1           | 4 test files      | —                                   |
| 5 — Consumer guide + README | 2           | —                 | consumer-guide.md, README/CLAUDE.md |
| 6 — API consistency         | 1           | —                 | 3 JSX files                         |
| 7 — Final verify            | 1           | —                 | —                                   |
| **Total**                   | **8 tasks** | **~19 new files** | **~4 modified files**               |
