# Topology Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the topology section in 44 ways — full spec compliance with reference docs plus ASCII/SUPERHOT terminal aesthetic across `ShPipeline`, `pipeline.css`, `topology-graph.md`, and new utilities.

**Architecture:** One module per function (`js/revealLabel.js`, `js/scrambleLabel.js`) following the existing barrel-via-stdin esbuild pattern. ShPipeline.jsx gains SVG defs, animations, ASCII aesthetics, a11y, and reduced-motion gating. Docs updated to match experience-design and atmosphere-guide specs.

**Tech Stack:** Preact 10, `preact/hooks`, SVG `<animate>`/`<animateTransform>`, `node:test`, esbuild 0.25, vanilla ESM.

---

## Pre-flight

**Branch:** Already on `feature/atmosphere-utilities`. All work goes here.

**Run baseline tests before touching anything:**

```bash
cd ~/Documents/projects/superhot-ui
npm run build && node --test 'tests/*.test.js'
```

Expected: all pass. If failures exist, stop and investigate.

---

## Task 1: `js/revealLabel.js` — TDD

**Files:**

- Create: `js/revealLabel.js`
- Create: `tests/revealLabel.test.js`

### Step 1: Write the failing test

```js
// tests/revealLabel.test.js
import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";

function mockEl() {
  return { textContent: "" };
}

describe("revealLabel", () => {
  beforeEach(() => {
    // Ensure no window in scope (Node environment baseline)
    delete globalThis.window;
  });

  it("sets textContent immediately when window is undefined", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "QUEUE", 0);
    assert.equal(el.textContent, "QUEUE");
  });

  it("sets textContent immediately when prefers-reduced-motion is active", async () => {
    globalThis.window = {
      matchMedia: () => ({ matches: true }),
    };
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "QUEUE");
    assert.equal(el.textContent, "QUEUE");
    delete globalThis.window;
  });

  it("resolves to finalText when duration is 0", async () => {
    globalThis.window = {
      matchMedia: () => ({ matches: false }),
    };
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "ARIA", 0);
    // duration=0 means all setInterval callbacks fire synchronously in Node
    assert.equal(el.textContent, "ARIA");
    delete globalThis.window;
  });

  it("handles null element gracefully", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    assert.doesNotThrow(() => revealLabel(null, "ARIA"));
  });

  it("handles empty string", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "", 0);
    assert.equal(el.textContent, "");
  });
});
```

### Step 2: Run to verify it fails

```bash
node --test tests/revealLabel.test.js
```

Expected: `ERR_MODULE_NOT_FOUND` — `js/revealLabel.js` doesn't exist yet.

### Step 3: Implement `js/revealLabel.js`

```js
/**
 * Character-scramble entrance for node labels.
 * Resolves left-to-right across 8 frames — piOS "system identifying target" effect.
 *
 * @param {Element|null} el - DOM element whose textContent to animate
 * @param {string} finalText - The text to resolve to
 * @param {number} [duration=300] - Total animation duration in ms
 */
export function revealLabel(el, finalText, duration = 300) {
  if (!el) return;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    el.textContent = finalText;
    return;
  }
  const chars = "!@#$%^&*?><|/\\[]";
  const steps = 8;
  let frame = 0;
  const interval = setInterval(() => {
    const resolved = finalText.slice(0, Math.floor((frame / steps) * finalText.length));
    const noise = Array.from(
      { length: finalText.length - resolved.length },
      () => chars[(Math.random() * chars.length) | 0],
    ).join("");
    el.textContent = resolved + noise;
    if (++frame > steps) {
      el.textContent = finalText;
      clearInterval(interval);
    }
  }, duration / steps);
}
```

### Step 4: Run to verify it passes

```bash
node --test tests/revealLabel.test.js
```

Expected: all 5 pass.

### Step 5: Commit

```bash
git add js/revealLabel.js tests/revealLabel.test.js
git commit -m "feat: add revealLabel JS utility (character-scramble entrance)"
```

---

## Task 2: `js/scrambleLabel.js` — TDD

**Files:**

- Create: `js/scrambleLabel.js`
- Create: `tests/scrambleLabel.test.js`

### Step 1: Write the failing test

```js
// tests/scrambleLabel.test.js
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

function mockEl() {
  return { textContent: "" };
}

describe("scrambleLabel", () => {
  beforeEach(() => {
    delete globalThis.window;
  });

  it("sets textContent immediately when window is undefined", async () => {
    const { scrambleLabel } = await import("../js/scrambleLabel.js");
    const el = mockEl();
    scrambleLabel(el, "ARIA");
    assert.equal(el.textContent, "ARIA");
  });

  it("sets textContent immediately when prefers-reduced-motion is active", async () => {
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    const { scrambleLabel } = await import("../js/scrambleLabel.js");
    const el = mockEl();
    scrambleLabel(el, "ARIA");
    assert.equal(el.textContent, "ARIA");
    delete globalThis.window;
  });

  it("eventually resolves to finalText", async () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const { scrambleLabel } = await import("../js/scrambleLabel.js");
    const el = mockEl();
    // Use a Promise to wait for the animation to finish (5 * 40ms = 200ms + margin)
    await new Promise((resolve) => {
      scrambleLabel(el, "HUB");
      setTimeout(resolve, 300);
    });
    assert.equal(el.textContent, "HUB");
    delete globalThis.window;
  });

  it("handles null element gracefully", async () => {
    const { scrambleLabel } = await import("../js/scrambleLabel.js");
    assert.doesNotThrow(() => scrambleLabel(null, "ARIA"));
  });

  it("scrambles text length matches finalText length", async () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const { scrambleLabel } = await import("../js/scrambleLabel.js");
    const el = mockEl();
    const lengths = new Set();
    const orig = el;
    // Capture first 3 textContent values during scramble
    let callCount = 0;
    Object.defineProperty(el, "textContent", {
      set(v) {
        lengths.add(v.length);
        callCount++;
      },
      get() {
        return "";
      },
    });
    scrambleLabel(el, "QUEUE");
    await new Promise((r) => setTimeout(r, 300));
    // All scrambled values should match 'QUEUE'.length = 5
    for (const len of lengths) assert.equal(len, 5);
    delete globalThis.window;
  });
});
```

### Step 2: Run to verify it fails

```bash
node --test tests/scrambleLabel.test.js
```

Expected: `ERR_MODULE_NOT_FOUND`.

### Step 3: Implement `js/scrambleLabel.js`

```js
/**
 * State-change label scramble — cycles through random ASCII for 5 frames then resolves.
 * Communicates "node status changed" — shorter than revealLabel (no directional reveal).
 *
 * @param {Element|null} el - DOM element whose textContent to animate
 * @param {string} finalText - The text to resolve to
 */
export function scrambleLabel(el, finalText) {
  if (!el) return;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    el.textContent = finalText;
    return;
  }
  const chars = "!@#$%^&*?><|/\\[]";
  let count = 0;
  const interval = setInterval(() => {
    if (count >= 5) {
      el.textContent = finalText;
      clearInterval(interval);
      return;
    }
    el.textContent = Array.from(
      { length: finalText.length },
      () => chars[(Math.random() * chars.length) | 0],
    ).join("");
    count++;
  }, 40);
}
```

### Step 4: Run to verify it passes

```bash
node --test tests/scrambleLabel.test.js
```

Expected: all 5 pass.

### Step 5: Commit

```bash
git add js/scrambleLabel.js tests/scrambleLabel.test.js
git commit -m "feat: add scrambleLabel JS utility (state-change scramble)"
```

---

## Task 3: Register utilities in the esbuild barrel

**Files:**

- Modify: `esbuild.config.mjs`

### Step 1: Add both exports to the JS barrel stdin

Open `esbuild.config.mjs`. In the `jsConfig.stdin.contents` array (after the existing `atmosphere.js` and `crt.js` lines), add:

```js
"export { revealLabel } from './js/revealLabel.js';",
"export { scrambleLabel } from './js/scrambleLabel.js';",
```

The full updated `contents` array becomes:

```js
contents: [
  "export { applyFreshness } from './js/freshness.js';",
  "export { shatterElement } from './js/shatter.js';",
  "export { glitchText } from './js/glitch.js';",
  "export { applyMantra, removeMantra } from './js/mantra.js';",
  "export { ShAudio, playSfx } from './js/audio.js';",
  "export { setCrtMode } from './js/crt.js';",
  "export { trackEffect, activeEffectCount, isOverBudget, MAX_EFFECTS } from './js/atmosphere.js';",
  "export { CRT_PRESETS, setCrtPreset } from './js/crt.js';",
  "export { SHATTER_PRESETS } from './js/shatter.js';",
  "export { revealLabel } from './js/revealLabel.js';",
  "export { scrambleLabel } from './js/scrambleLabel.js';",
].join("\n"),
```

### Step 2: Verify build succeeds

```bash
npm run build
```

Expected: `dist/superhot.js` and `dist/superhot.preact.js` emitted with no errors.

### Step 3: Verify exports are accessible from the bundle

```bash
node -e "import('./dist/superhot.js').then(m => { console.log(typeof m.revealLabel, typeof m.scrambleLabel); })"
```

Expected: `function function`

### Step 4: Commit

```bash
git add esbuild.config.mjs
git commit -m "feat: register revealLabel and scrambleLabel in esbuild barrel"
```

---

## Task 4: `pipeline.css` — keyframes, glow, dither, reticle, reduced-motion

**Files:**

- Modify: `css/components/pipeline.css`

No unit tests for CSS. Verify via build. Visual verification via `examples/demo.html`.

### Step 1: Add animated edge flow keyframe

In `css/components/pipeline.css`, inside the existing `@layer superhot.effects {` block, add after the last existing rule:

```css
@keyframes sh-pipeline-edge-flow {
  to {
    stroke-dashoffset: -18;
  }
}

@keyframes sh-pipeline-threat-pulse {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes sh-pipeline-heartbeat {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.25;
  }
}

@keyframes sh-pipeline-ring-rotate {
  to {
    transform: rotate(360deg);
  }
}
```

### Step 2: Add glow utility classes

Still inside `@layer superhot.effects {`:

```css
/* Glow hierarchy (atmosphere rule 6) */
.sh-pipeline-glow-ambient {
  filter: drop-shadow(0 0 4px var(--sh-phosphor-glow));
}

.sh-pipeline-glow-standard {
  filter: drop-shadow(0 0 8px var(--sh-phosphor-glow));
}

.sh-pipeline-glow-critical {
  filter: drop-shadow(0 0 16px var(--sh-threat-glow));
}
```

### Step 3: Add dither fill classes

```css
/* Dither fills for frozen/failed nodes — applied via SVG pattern */
.sh-pipeline-node--frozen rect {
  fill: url(#sh-pipeline-dither-frozen);
}

.sh-pipeline-node--failed rect {
  fill: url(#sh-pipeline-dither-failed);
}
```

### Step 4: Add targeting reticle class

```css
/* Targeting reticle — orthogonal lines on selected node */
.sh-pipeline-reticle {
  stroke: var(--sh-phosphor);
  stroke-width: 0.5;
  opacity: 0.2;
  pointer-events: none;
}
```

### Step 5: Add reduced-motion block

Add **outside** the `@layer` block (reduced-motion overrides should not be layered):

```css
@media (prefers-reduced-motion: reduce) {
  .sh-pipeline-node--running circle,
  .sh-pipeline-node--failed circle {
    animation: none;
  }

  .sh-pipeline-edge animate {
    display: none;
  }

  .sh-pipeline-node--failed rect {
    stroke: var(--sh-threat);
    stroke-width: 2;
  }

  .sh-pipeline-node--running rect {
    stroke: var(--sh-phosphor);
  }
}
```

### Step 6: Verify build

```bash
npm run build
```

Expected: no errors. `dist/superhot.css` updated.

### Step 7: Commit

```bash
git add css/components/pipeline.css
git commit -m "feat: update pipeline.css — keyframes, glow classes, dither fills, reticle, reduced-motion"
```

---

## Task 5: `ShPipeline.jsx` — extend test suite for new behaviors

Write all new tests **before** touching the component. They should all fail against the current build.

**Files:**

- Modify: `tests/pipeline.test.js`

### Step 1: Add new test cases after the existing ones

Open `tests/pipeline.test.js`. After the last existing `it()` block, add:

```js
it("wraps node labels in brackets", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes("[Fetch]"), "label should be wrapped in brackets");
});

it("includes arrowhead marker definition", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes("sh-pipeline-arrow"), "should define arrowhead marker");
});

it("includes glow filter defs", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes("sh-pipeline-glow"), "should define glow filter");
});

it("applies role=button to node groups", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes('"role":"button"'), "node groups should have role=button");
});

it("applies tabIndex to node groups", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes('"tabIndex":0'), "node groups should have tabIndex=0");
});

it("includes animate element for running node", () => {
  const runningNodes = [{ id: "a", label: "Run", status: "running" }];
  const result = ShPipeline({ nodes: runningNodes, edges: [] });
  const str = JSON.stringify(result);
  assert.ok(str.includes("animate"), "running node should include animate element");
});

it("includes role glyph for running node", () => {
  const runningNodes = [{ id: "a", label: "Run", status: "running" }];
  const result = ShPipeline({ nodes: runningNodes, edges: [] });
  const str = JSON.stringify(result);
  // ▸ is the running glyph
  assert.ok(str.includes("▸"), "running node should include ▸ glyph");
});

it("includes [!] badge for failed node", () => {
  const failedNodes = [{ id: "a", label: "Fail", status: "error" }];
  const result = ShPipeline({ nodes: failedNodes, edges: [] });
  const str = JSON.stringify(result);
  assert.ok(str.includes("[!]"), "failed/error node should include [!] badge");
});

it("renders ASCII health gauge when stats provided", () => {
  const nodesWithStats = [{ id: "a", label: "A", status: "running", running: 3, total: 5 }];
  const result = ShPipeline({ nodes: nodesWithStats, edges: [] });
  const str = JSON.stringify(result);
  assert.ok(str.includes("█") || str.includes("░"), "should render health gauge chars");
});

it("edge paths include marker-end for arrowhead", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes("marker-end"), "edge paths should reference arrowhead marker");
});

it("includes dot-matrix background pattern", () => {
  const result = ShPipeline({ nodes, edges });
  const str = JSON.stringify(result);
  assert.ok(str.includes("sh-pipeline-grid"), "should include grid background pattern");
});
```

### Step 2: Build and run to verify all new tests fail

```bash
npm run build && node --test tests/pipeline.test.js
```

Expected: the 11 new tests fail, existing 8 pass. Confirm this before proceeding.

---

## Task 6: `ShPipeline.jsx` — SVG defs + dot-matrix background

**Files:**

- Modify: `preact/ShPipeline.jsx`

### Step 1: Add hooks import and utility imports

Replace the first line of `ShPipeline.jsx`:

```js
/** @jsxImportSource preact */
```

with:

```js
/** @jsxImportSource preact */
import { useEffect, useRef } from "preact/hooks";
import { revealLabel } from "../js/revealLabel.js";
import { scrambleLabel } from "../js/scrambleLabel.js";
```

### Step 2: Add helper functions after the existing `edgePath` function

```js
/** ASCII health gauge: '███░░' from running/total ratio, width=5 blocks */
function healthGauge(running, total, width = 5) {
  if (!total) return "";
  const filled = Math.round((running / total) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

/** Role glyph: single char representing node role/status */
function roleGlyph(status) {
  if (status === "running" || status === "ok") return "▸";
  if (status === "error" || status === "failed") return "▪";
  return "▪";
}

/** True if prefers-reduced-motion is active */
function isReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
```

### Step 3: Add SVG `<defs>` block inside the `<svg>` element

In the `return` JSX, immediately after the opening `<svg ...>` tag and before the edges `<g>`, add:

```jsx
<defs>
  {/* Phosphor glow filter — standard */}
  <filter id="sh-pipeline-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
    <feComposite in="SourceGraphic" in2="blur" operator="over" />
  </filter>

  {/* Phosphor glow filter — strong (threat nodes) */}
  <filter id="sh-pipeline-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
    <feComposite in="SourceGraphic" in2="blur" operator="over" />
  </filter>

  {/* Dither pattern — light (frozen nodes) */}
  <pattern id="sh-pipeline-dither-frozen" width="8" height="8" patternUnits="userSpaceOnUse">
    <rect width="8" height="8" fill="var(--bg-surface)" />
    <text
      x="0"
      y="7"
      font-size="8"
      font-family="monospace"
      fill="var(--sh-phosphor)"
      opacity="0.12"
    >
      ░
    </text>
  </pattern>

  {/* Dither pattern — heavy (failed nodes) */}
  <pattern id="sh-pipeline-dither-failed" width="8" height="8" patternUnits="userSpaceOnUse">
    <rect width="8" height="8" fill="var(--bg-surface)" />
    <text x="0" y="7" font-size="8" font-family="monospace" fill="var(--sh-threat)" opacity="0.18">
      ▒
    </text>
  </pattern>

  {/* Arrowhead marker — directional edge terminus */}
  <marker
    id="sh-pipeline-arrow"
    markerWidth="6"
    markerHeight="6"
    refX="5"
    refY="3"
    orient="auto"
    markerUnits="strokeWidth"
  >
    <path d="M0,0 L0,6 L6,3 z" fill="var(--sh-phosphor)" opacity="0.7" />
  </marker>
</defs>
```

### Step 4: Replace the current line-grid background rect with a dot-matrix pattern

In the `<defs>` block, add the grid pattern before the closing `</defs>`:

```jsx
{
  /* Dot-matrix background — terminal character-cell feel */
}
<pattern id="sh-pipeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
  <circle cx="0" cy="0" r="0.5" fill="var(--border-subtle)" />
  <circle cx="40" cy="0" r="0.5" fill="var(--border-subtle)" />
  <circle cx="0" cy="40" r="0.5" fill="var(--border-subtle)" />
  <circle cx="40" cy="40" r="0.5" fill="var(--border-subtle)" />
  <circle cx="20" cy="20" r="0.5" fill="var(--border-subtle)" />
</pattern>;
```

After the closing `</defs>`, add the background rect (replacing the line-grid if one exists, or adding new):

```jsx
{
  /* Dot-matrix background */
}
<rect width={svgWidth} height={svgHeight} fill="url(#sh-pipeline-grid)" opacity="0.3" />;
```

### Step 5: Build and run targeted tests

```bash
npm run build && node --test tests/pipeline.test.js 2>&1 | grep -E "(pass|fail|▶)"
```

Expected: `sh-pipeline-arrow`, `sh-pipeline-glow`, `sh-pipeline-grid` tests now pass. Others still fail.

---

## Task 7: `ShPipeline.jsx` — animated edges with arrowheads and bracket labels

**Files:**

- Modify: `preact/ShPipeline.jsx`

### Step 1: Update the edges render block

Replace the current edges map (the `{edges.map((edge, idx) => {` block) with:

```jsx
{
  edges.map((edge, idx) => {
    const src = positions[edge.from];
    const tgt = positions[edge.to];
    if (!src || !tgt) return null;
    const sx = src.x + NODE_W;
    const sy = src.y + nodeH / 2;
    const tx = tgt.x;
    const ty = tgt.y + nodeH / 2;
    const targetStatus = statusById[edge.to] || "idle";
    const d = edgePath(sx, sy, tx, ty);
    const dur = `${0.8 + idx * 0.15}s`;
    const failed = targetStatus === "error" || targetStatus === "failed";
    const edgeColor = failed ? "var(--sh-threat)" : "var(--sh-phosphor)";
    return (
      <g key={idx}>
        {/* Base path */}
        <path
          class={`sh-pipeline-edge sh-pipeline-edge--${targetStatus}`}
          d={d}
          stroke={edgeColor}
          stroke-width={failed ? 1 : 1.5}
          opacity={failed ? 0.25 : 0.35}
          marker-end={failed ? undefined : "url(#sh-pipeline-arrow)"}
        />
        {/* Animated flow dashes — march toward target */}
        {!isReducedMotion() && !failed && (
          <path
            d={d}
            fill="none"
            stroke={edgeColor}
            stroke-width={1.5}
            stroke-dasharray="6 12"
            opacity={0.65}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-18"
              dur={dur}
              repeatCount="indefinite"
            />
          </path>
        )}
      </g>
    );
  });
}
```

### Step 2: Build and run targeted tests

```bash
npm run build && node --test tests/pipeline.test.js 2>&1 | grep -E "(pass|fail|marker-end|arrowhead)"
```

Expected: `edge paths include marker-end for arrowhead` now passes.

---

## Task 8: `ShPipeline.jsx` — node animations, ASCII aesthetics, a11y

**Files:**

- Modify: `preact/ShPipeline.jsx`

### Step 1: Replace the nodes render block

Replace the current `{nodes.map((node) => {` block entirely with:

```jsx
{
  nodes.map((node) => {
    const pos = positions[node.id];
    if (!pos) return null;
    const status = node.status || "idle";
    const isRunning = status === "running" || status === "ok";
    const isFailed = status === "error" || status === "failed";
    const statusColor = isFailed
      ? "var(--sh-threat)"
      : isRunning
        ? "var(--sh-phosphor)"
        : "var(--text-tertiary)";

    const bracketLabel = `[${node.label}]`;
    const gauge =
      node.running != null && node.total != null ? healthGauge(node.running, node.total) : null;

    return (
      <g
        key={node.id}
        class={`sh-pipeline-node sh-pipeline-node--${status}`}
        transform={`translate(${pos.x},${pos.y})`}
        role="button"
        tabIndex={0}
        aria-label={`${node.label} — ${status}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
        }}
      >
        {/* Healthy heartbeat ring — running nodes only */}
        {isRunning && !isReducedMotion() && (
          <circle
            cx={NODE_W / 2}
            cy={nodeH / 2}
            r={nodeH / 2 + 4}
            fill="none"
            stroke="var(--sh-phosphor)"
            stroke-width={0.5}
            opacity={0.1}
          >
            <animate
              attributeName="opacity"
              values="0.1;0.25;0.1"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Threat pulse ring — failed nodes only */}
        {isFailed && !isReducedMotion() && (
          <circle
            cx={NODE_W / 2}
            cy={nodeH / 2}
            r={nodeH / 2 + 8}
            fill="none"
            stroke="var(--sh-threat)"
            stroke-width={1}
            opacity={0.25}
            filter="url(#sh-pipeline-glow)"
          >
            <animate
              attributeName="opacity"
              values="0.25;0.6;0.25"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${nodeH / 2 + 8};${nodeH / 2 + 14};${nodeH / 2 + 8}`}
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Node body */}
        <rect width={NODE_W} height={nodeH} rx="2" />

        {/* Role glyph — top-left, replaces status dot */}
        <text
          x={5}
          y={nodeH / 2 + 1}
          dominant-baseline="middle"
          font-family="var(--sh-font, monospace)"
          font-size="9"
          fill={statusColor}
          opacity={0.9}
        >
          {roleGlyph(status)}
        </text>

        {/* [!] badge — failed nodes only (Rule 31: label not icon) */}
        {isFailed && (
          <text
            x={NODE_W - 6}
            y={9}
            text-anchor="end"
            font-family="var(--sh-font, monospace)"
            font-size="8"
            fill="var(--sh-threat)"
            font-weight="bold"
          >
            [!]
          </text>
        )}

        {/* Primary label — bracketed */}
        <text
          ref={(el) => {
            if (el) labelRefs.current.set(node.id, el);
          }}
          x={NODE_W / 2}
          y={gauge ? nodeH / 2 - 3 : nodeH / 2}
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="var(--sh-font, monospace)"
          font-size="9"
          letter-spacing="0.5"
        >
          {bracketLabel}
        </text>

        {/* ASCII health gauge */}
        {gauge && !compact && (
          <text
            x={NODE_W / 2}
            y={nodeH / 2 + 9}
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="var(--sh-font, monospace)"
            font-size="8"
            fill={statusColor}
            opacity={0.7}
          >
            {gauge}
          </text>
        )}

        {/* Detail text (existing compact logic) */}
        {!compact && node.detail && (
          <text
            class="sh-pipeline-detail"
            x={NODE_W / 2}
            y={nodeH - 6}
            text-anchor="middle"
            font-family="var(--sh-font, monospace)"
            font-size="8"
          >
            {node.detail}
          </text>
        )}
      </g>
    );
  });
}
```

### Step 2: Add `labelRefs` and `prevStatuses` refs to the component

At the top of the `ShPipeline` function body, after the existing constant declarations, add:

```js
const labelRefs = useRef(new Map());
const prevStatuses = useRef({});
const reducedMotion = isReducedMotion();
```

### Step 3: Add character-reveal and scramble effects

After the refs, add:

```js
// Character-reveal on first mount
useEffect(() => {
  for (const [id, el] of labelRefs.current) {
    const node = nodes.find((n) => n.id === id);
    if (node) revealLabel(el, `[${node.label}]`);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Scramble on status change
useEffect(() => {
  for (const node of nodes) {
    const prev = prevStatuses.current[node.id];
    if (prev !== undefined && prev !== node.status) {
      const el = labelRefs.current.get(node.id);
      if (el) scrambleLabel(el, `[${node.label}]`);
    }
    prevStatuses.current[node.id] = node.status;
  }
});
```

### Step 4: Add targeting reticle for selected nodes

The current `ShPipeline` doesn't track selection state. Add a `selectedId` prop (optional):

Update the function signature:

```js
export function ShPipeline({
  nodes = [],
  edges = [],
  compact = false,
  className = '',
  ariaLabel = 'Pipeline diagram',
  selectedId = null,
}) {
```

Then, after the nodes render block, add the targeting reticle:

```jsx
{
  /* Targeting reticle — orthogonal lines from selected node center */
}
{
  selectedId &&
    positions[selectedId] &&
    (() => {
      const pos = positions[selectedId];
      const cx = pos.x + NODE_W / 2;
      const cy = pos.y + nodeH / 2;
      return (
        <g class="sh-pipeline-reticle" aria-hidden="true">
          <line x1={0} y1={cy} x2={svgWidth} y2={cy} />
          <line x1={cx} y1={0} x2={cx} y2={svgHeight} />
        </g>
      );
    })();
}
```

### Step 5: Build and run full test suite

```bash
npm run build && node --test tests/pipeline.test.js
```

Expected: all 19 tests pass (8 original + 11 new).

### Step 6: Run full test suite

```bash
node --test 'tests/*.test.js'
```

Expected: all tests pass. Investigate any failures before proceeding.

### Step 7: Commit

```bash
git add preact/ShPipeline.jsx
git commit -m "feat: enhance ShPipeline — animated edges, heartbeat, ASCII aesthetics, a11y"
```

---

## Task 9: `topology-graph.md` — improvements 1–7

**Files:**

- Modify: `docs/components/topology-graph.md`

No tests for doc changes. Verify by reading the output.

### Step 1: Update the top-level description

Replace the opening paragraph:

```
Reference component pattern for SVG topology graphs in superhot-ui dashboards.
This is **not** a packaged component — topology graphs are too project-specific for
the design system. This document provides the canonical implementation pattern,
including all SVG adapters for effects that are HTML/CSS-only in superhot-ui.

For orchestration rules, read `docs/topology-guide.md` first.
```

with:

```
Reference component pattern for SVG topology graphs in superhot-ui dashboards.
This is **not** a packaged component — topology graphs are too project-specific for
the design system. This document provides the canonical implementation pattern,
including all SVG adapters for effects that are HTML/CSS-only in superhot-ui.

**Before implementing:** read `docs/topology-guide.md` for orchestration rules,
entry/exit choreography, and failure escalation cadence.
```

### Step 2: Add boot scan sequence

In the `SystemGraph` component, after the `const [error, setError] = useState(null);` line, add:

```jsx
const [scanning, setScanning] = useState(true);

useEffect(() => {
  const t = setTimeout(() => setScanning(false), 800);
  return () => clearTimeout(t);
}, []);
```

Then in the render, wrap the main content:

```jsx
if (scanning) {
  return (
    <div class="system-graph">
      <ShMantra text="TOPOLOGY SCAN..." />
    </div>
  );
}
```

Place this check after the `error` and `!graphData` checks.

### Step 3: Add character-reveal entrance and scramble

Add to imports:

```js
import { revealLabel, scrambleLabel } from "superhot-ui";
```

Add refs at the top of `SystemGraph`:

```js
const labelRefs = useRef(new Map());
const prevStatuses = useRef({});
```

After the `graphData` loads, add:

```js
// Reveal on first load
useEffect(() => {
  if (!graphData) return;
  for (const [id, el] of labelRefs.current) {
    const node = [...allNodes].find((n) => n.id === id);
    if (node) revealLabel(el, `[${node.label}]`);
  }
}, [!!graphData]); // runs once when data arrives

// Scramble on status change
useEffect(() => {
  for (const node of nodes) {
    const prev = prevStatuses.current[node.id];
    if (prev !== undefined && prev !== node.status) {
      const el = labelRefs.current.get(node.id);
      if (el) scrambleLabel(el, `[${node.label}]`);
    }
    prevStatuses.current[node.id] = node.status;
  }
});
```

Add `ref` callback to each node label `<text>`:

```jsx
ref={(el) => { if (el) labelRefs.current.set(node.id, el); }}
```

### Step 4: Update all node label renders to bracket notation

In both the center node and peripheral nodes render, change all `{node.label}` / `{center.label}` text elements to `[${node.label}]` / `[${center.label}]`. This applies to:

- Center node primary label text (`font-size="9"`)
- All peripheral node primary label text (`font-size="8"`)
- The role badge text below peripheral nodes (leave as-is — it's a secondary identifier)

### Step 5: Add `[!]` badge to failed nodes

In the peripheral nodes render, after the status dot `<circle>`, add:

```jsx
{
  hasFailed && (
    <text
      x={r - 2}
      y={-(r - 2)}
      text-anchor="end"
      font-family="var(--font-data)"
      font-size="8"
      fill="var(--sh-threat)"
      font-weight="bold"
    >
      [!]
    </text>
  );
}
```

### Step 6: Replace service stat with ASCII health gauge

Replace the `{stats.running}/{stats.total} svc` text element with:

```jsx
{
  stats?.total > 0 &&
    (() => {
      const filled = Math.round((stats.running / stats.total) * 5);
      const gauge = "█".repeat(filled) + "░".repeat(5 - filled);
      return (
        <text
          y={9}
          text-anchor="middle"
          font-family="var(--font-data)"
          font-size="7"
          fill={statusColor}
          opacity={0.8}
        >
          {gauge}
        </text>
      );
    })();
}
```

Apply the same pattern to the center node's service stat.

### Step 7: Add targeting reticle

In the `SystemGraph` render, after the peripheral nodes map, add:

```jsx
{
  /* Targeting reticle — orthogonal crosshair on selected node */
}
{
  selectedNode &&
    nodeMap.get(selectedNode) &&
    (() => {
      const n = nodeMap.get(selectedNode);
      return (
        <g aria-hidden="true" style="pointer-events:none">
          <line
            x1={0}
            y1={n.y}
            x2={800}
            y2={n.y}
            stroke="var(--sh-phosphor)"
            stroke-width={0.5}
            opacity={0.15}
          />
          <line
            x1={n.x}
            y1={0}
            x2={n.x}
            y2={600}
            stroke="var(--sh-phosphor)"
            stroke-width={0.5}
            opacity={0.15}
          />
        </g>
      );
    })();
}
```

### Step 8: Commit

```bash
git add docs/components/topology-graph.md
git commit -m "docs: update topology-graph.md — boot scan, reveal, brackets, gauge, reticle, [!] badge"
```

---

## Task 10: `topology-graph.md` — improvements 8–14

**Files:**

- Modify: `docs/components/topology-graph.md`

### Step 1: Add recovery sequence section

After the `## Template` section, add a new section:

````markdown
## Recovery Sequence

When a node transitions from `failed` → `running`, show the system healing:

```js
import { glitchText, playSfx } from "superhot-ui";

function onNodeRecovered(nodeId, labelEl) {
  // 1. Glitch burst — catharsis (atmosphere rule 37)
  glitchText(labelEl, { duration: 200, intensity: "low" });

  // 2. After burst: transition border color threat → phosphor
  setTimeout(() => {
    const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeEl) nodeEl.setAttribute("data-sh-state", "recovered");
  }, 200);

  // 3. Confirm recovery with toast (piOS voice — Rule 13)
  const ts = new Date().toTimeString().slice(0, 8);
  ShToast({ type: "info", message: `[${ts}] ${nodeId.toUpperCase()} RESTORED` });

  // 4. Phosphor calm returns automatically as threat pulse stops
}
```
````

### Step 2: Add freshness-based edge speed section

After the recovery section, add:

````markdown
## Freshness-Based Edge Animation Speed

Edge pulse speed communicates data recency (atmosphere rule 18).
Derive edge `dur` from the source node's `lastChecked` timestamp:

```js
import { computeFreshness } from "superhot-ui";

function edgeDuration(sourceNode) {
  const state = computeFreshness(sourceNode.lastChecked);
  return { fresh: "0.8s", cooling: "1.5s", frozen: "3s", stale: "6s" }[state] ?? "1.5s";
}

// In the edge render:
<animate
  attributeName="stroke-dashoffset"
  from="0"
  to="-18"
  dur={edgeDuration(nodeMap.get(edge.source))}
  repeatCount="indefinite"
/>;
```
````

### Step 3: Add localStorage persistence section

````markdown
## Persistence (Rule 38 — The Interface Has Memory)

Zoom ring and selected node survive page reload:

```js
// Read on mount
const [zoomRing, setZoomRingRaw] = useState(() =>
  parseInt(localStorage.getItem("sh-topology-zoom") ?? "3", 10),
);
const [selectedNode, setSelectedNodeRaw] = useState(
  () => localStorage.getItem("sh-topology-selected") ?? null,
);

// Write on change
function setZoomRing(v) {
  localStorage.setItem("sh-topology-zoom", String(v));
  setZoomRingRaw(v);
}
function setSelectedNode(v) {
  if (v) localStorage.setItem("sh-topology-selected", v);
  else localStorage.removeItem("sh-topology-selected");
  setSelectedNodeRaw(v);
}
```
````

### Step 4: Update NodeDetail to use piOS voice

In the `NodeDetail` component, update all status text to uppercase and apply monospace tracking:

```jsx
// Replace:
<span class="system-graph-detail-status" style={`color:${statusColor}`}>
  {node.status}
</span>
<span class="system-graph-detail-ring">RING {node.ring}</span>

// With:
<span
  class="system-graph-detail-status"
  style={`color:${statusColor};font-family:var(--font-data);letter-spacing:var(--tracking-widest)`}
>
  {node.status.toUpperCase()}
</span>
<span
  class="system-graph-detail-ring"
  style="font-family:var(--font-data);letter-spacing:var(--tracking-widest)"
>
  RING {node.ring}
</span>
```

### Step 5: Add prefers-reduced-motion section

````markdown
## Reduced Motion (Atmosphere Rule 15)

All animated effects must have static fallbacks. Check once at mount:

```js
const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

| Animated                    | Static fallback                       |
| --------------------------- | ------------------------------------- |
| Heartbeat `<animate>`       | Remove — phosphor border only         |
| Threat pulse `<animate>`    | Remove — static `--sh-threat` border  |
| Edge `stroke-dashoffset`    | Remove — static dashed path           |
| Character reveal            | `el.textContent = finalText` directly |
| Selection ring rotation     | Static dashed circle, no rotation     |
| `ShShatter` on node removal | `display: none` instantly             |

Gate all `<animate>` and `<animateTransform>` behind `{!reducedMotion && <animate .../>}`.
````

### Step 6: Add edge annotation on focus section

````markdown
## Edge Annotations on Focus

When a node is focused, show inline labels on adjacent edges:

```jsx
{edges.map((edge, idx) => {
  const showAnnotation = focusedNode === edge.source || focusedNode === edge.target;
  const src = nodeMap.get(edge.source);
  const tgt = nodeMap.get(edge.target);
  if (!src || !tgt) return null;
  const d = edgePath(src, tgt);
  const midX = (src.x + tgt.x) / 2;
  const midY = (src.y + tgt.y) / 2;
  return (
    <g key={`e${idx}`}>
      <path d={d} ... />
      {showAnnotation && edge.latency && (
        <text
          x={midX} y={midY - 6}
          text-anchor="middle"
          font-family="var(--font-data)"
          font-size="8"
          fill="var(--text-tertiary)"
        >
          {edge.latency}ms
        </text>
      )}
    </g>
  );
})}
```
````

### Step 7: Update the checklist to 15 items

Replace the existing 8-item checklist with:

```markdown
## Checklist

- [ ] `<defs>` includes `graph-grid`, `graph-glow`, `graph-glow-strong`, arrowhead `<marker>`
- [ ] Grid background uses dot-matrix pattern (not line grid)
- [ ] All node labels use `[BRACKET]` notation
- [ ] Running nodes: 3s heartbeat pulse (opacity 0.1→0.25) — gated by `reducedMotion`
- [ ] Failed nodes: 1.8s threat pulse + r expansion — gated by `reducedMotion`
- [ ] Failed nodes: `[!]` badge rendered (text label, not icon)
- [ ] Edge flow: `stroke-dashoffset` toward target, staggered timing per edge
- [ ] Edge flow speed derived from source node freshness (`computeFreshness`)
- [ ] Arrowheads on non-failed edges via `marker-end="url(#sh-pipeline-arrow)"`
- [ ] Role glyph (`◆`/`▸`/`▪`) replaces color-only status dot
- [ ] ASCII health gauge (`██░░░`) for service running/total ratio
- [ ] Targeting reticle rendered on `selectedNode`
- [ ] Boot scan: `ShMantra text="TOPOLOGY SCAN..."` for 800ms before graph renders
- [ ] `revealLabel` called on first mount; `scrambleLabel` called on status change
- [ ] `localStorage` persistence for zoom ring and selected node
- [ ] `reducedMotion` check gates all `<animate>` and `<animateTransform>` elements
```

### Step 8: Commit

```bash
git add docs/components/topology-graph.md
git commit -m "docs: update topology-graph.md — recovery, freshness speed, persistence, piOS voice, reduced-motion, annotations, 16-item checklist"
```

---

## Task 11: Create `docs/topology-guide.md`

**Files:**

- Create: `docs/topology-guide.md`

### Step 1: Write the file

````markdown
# Topology Graph Orchestration Guide

Rules for building and orchestrating the topology graph in a superhot-ui dashboard.
This document governs _when_ and _how_ effects happen — the component template is in
`docs/components/topology-graph.md`.

---

## Purpose: The Graph Is the World

The topology graph is not a feature of the dashboard. It IS the dashboard — the
crystalline world you inhabit (`experience-design.md` § The World Metaphor). Every
other element (stat cards, toasts, navs) is HUD projected onto it.

**Design implication:** the graph occupies the dominant viewport area. It is never
buried in a tab or collapsed by default. If screen space is limited, other elements
collapse before the graph does.

Pipeline DAG (`ShPipeline`) vs. topology graph: pipeline shows step-by-step data flow
(CI/CD, queue stages). Topology shows system architecture (service mesh, project
interdependencies). They use the same design tokens but serve different semantic roles.

---

## Entry Choreography

When the topology view mounts, the world materializes in sequence (atmosphere rule 10):

| Delay   | What appears                                                |
| ------- | ----------------------------------------------------------- |
| 0ms     | Container structure (border, background grid)               |
| 0–800ms | `ShMantra text="TOPOLOGY SCAN..."` watermark                |
| 800ms   | Mantra clears, graph data renders                           |
| 800ms   | `revealLabel()` fires on each node (300ms character reveal) |
| 1100ms  | Edge animations activate                                    |
| 1200ms  | Heartbeat pulses activate on running nodes                  |

**Implementation:** use a `scanning` boolean state, cleared with `setTimeout(800)` on mount.
Do not skip the boot scan — it establishes the piOS world before data arrives.

---

## Exit Choreography

When a node is removed from the graph (service decommissioned, project archived):

1. Call `shatterElement(nodeEl, { fragments: 6 })` before removing from DOM
2. After the shatter duration (`--sh-shatter-duration`, default 600ms), remove the node
3. Any edges connected to the removed node fade to `opacity: 0` over 300ms

**Never** remove a node by setting `display: none` or re-rendering without the shatter.
The shatter is the signal: "this entity no longer exists." Without it, the user
cannot distinguish "not rendered yet" from "actively removed."

```js
import { shatterElement } from "superhot-ui";

async function removeNode(nodeId, nodeEl) {
  shatterElement(nodeEl, { fragments: 6 });
  await new Promise((r) => setTimeout(r, 650)); // wait for shatter
  setGraphData((prev) => ({
    ...prev,
    nodes: prev.nodes.filter((n) => n.id !== nodeId),
    edges: prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  }));
}
```
````

---

## Recovery Choreography

When a node transitions from `failed` → `running`:

1. **Glitch burst** (catharsis signal): `glitchText(labelEl, { duration: 200, intensity: 'low' })`
2. **Color transition** (200ms after glitch): border transitions from `--sh-threat` to `--sh-phosphor`
3. **Threat pulse stops**: `<animate>` elements on the node deactivate
4. **Toast** (piOS voice): `[HH:MM:SS] NODE_ID RESTORED`
5. **Phosphor calm**: heartbeat pulse re-activates at 3s interval

```js
import { glitchText, playSfx } from "superhot-ui";

function onNodeRecovered(nodeId, labelEl) {
  glitchText(labelEl, { duration: 200, intensity: "low" });
  setTimeout(() => {
    // Update status in state — component re-renders with phosphor color
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, status: "running" } : n)),
    }));
    const ts = new Date().toTimeString().slice(0, 8);
    // Caller is responsible for rendering ShToast
    onToast({ type: "info", message: `[${ts}] ${nodeId.toUpperCase()} RESTORED` });
  }, 210);
}
```

---

## Freshness Discipline

The graph uses TWO freshness mechanisms operating at different scales:

**Container-level freshness** (`ShFrozen`): wraps the entire graph route component.
When the topology data fetch is stale (graph JSON not refreshed), the whole graph
goes frozen. This is the coarse signal: "this view is old."

```jsx
<ShFrozen timestamp={graphData?.fetchedAt}>
  <SystemGraph />
</ShFrozen>
```

**Per-node freshness**: individual nodes have their own `lastChecked` timestamp from
the health monitoring system. This drives:

- Edge animation speed: fresh = 0.8s, cooling = 1.5s, frozen = 3s, stale = 6s
- Node border desaturation: interpolates `--sh-phosphor` → `--text-tertiary`
- Dither pattern: activates at frozen/stale state

Do not apply `ShFrozen` per-node — it creates visual noise. Use border desaturation
and edge speed instead. Reserve `ShFrozen` for the container.

---

## Failure Escalation Cadence

When a node transitions to `failed`, the response escalates over time (atmosphere rule 12):

| Time since failure | Response                                                                     |
| ------------------ | ---------------------------------------------------------------------------- |
| 0–5s               | Threat pulse on node + `[!]` badge. Toast `NODE_ID FAULT` (auto-dismiss 3s). |
| 5–15s              | Edges to/from failed node dim to `opacity: 0.15`. Sidebar indicator pulses.  |
| 15–60s             | `ShMantra text="NODE_ID OFFLINE"` on the graph section.                      |
| 60s+               | If core node: `ShMantra text="SYSTEM DEGRADED"` on layout root.              |

**Never jump straight to critical.** The escalation IS the drama — each step amplifies
the tension before the user must act. Implement with a timer:

```js
useEffect(() => {
  if (node.status !== "failed") return;
  const t1 = setTimeout(() => dimEdges(node.id), 5000);
  const t2 = setTimeout(() => showSectionMantra(node.id), 15000);
  const t3 = node.isCritical ? setTimeout(showLayoutMantra, 60000) : null;
  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
    if (t3) clearTimeout(t3);
  };
}, [node.status]);
```

De-escalation reverses in the same order, with the recovery choreography at each step.

---

## Focus Mode

When a node is clicked/selected:

1. Non-connected nodes: `opacity → 0.2` (transition 300ms)
2. Non-connected edges: `opacity → 0.05`
3. Connected nodes and their edges: remain at `opacity: 1`
4. Targeting reticle appears on selected node
5. `NodeDetail` panel renders

Clicking the SVG background (not a node) clears focus. Tab key moves focus through
nodes in DOM order; Enter/Space selects.

```js
const nodeOpacity = (id) => (!connectedIds || connectedIds.has(id) ? 1 : 0.2);
const edgeOpacity = (src, tgt) =>
  !connectedIds || (connectedIds.has(src) && connectedIds.has(tgt)) ? 1 : 0.05;
```

---

## Sound Integration

| Event                 | Sound                                                        |
| --------------------- | ------------------------------------------------------------ |
| Node failure detected | `playSfx('error')` — plays once, not on each escalation step |
| Node recovery         | `playSfx('complete')`                                        |
| Boot scan complete    | No sound — silence is the system coming online               |

Audio is `ShAudio.enabled = false` by default. Always gate behind user preference.
Never play sound on initial load — only on state changes.

---

## Implementation Checklist

Before shipping a topology graph implementation:

- [ ] `ShFrozen` wraps the entire graph at the route level (not per-node)
- [ ] Boot scan mantra plays for 800ms on mount
- [ ] `revealLabel()` called on first data load for every node label
- [ ] `scrambleLabel()` called when node status changes
- [ ] All node labels use `[BRACKET]` notation
- [ ] Failed nodes: `[!]` badge + threat pulse + dither pattern
- [ ] Edge speed derived from source node `lastChecked` freshness
- [ ] Arrowheads on non-failed edges
- [ ] Targeting reticle renders on selected node
- [ ] ASCII health gauge for service ratios
- [ ] Shatter fires before any node DOM removal
- [ ] Recovery choreography: glitch → color transition → toast
- [ ] Failure escalation uses timer-based cadence (not immediate critical)
- [ ] Focus mode dims non-connected nodes to `opacity: 0.2`
- [ ] `localStorage` persistence for zoom and selection
- [ ] `reducedMotion` gates all `<animate>` elements
- [ ] `playSfx('error')` on first failure, `playSfx('complete')` on recovery

````

### Step 2: Verify the file exists and renders correctly

```bash
wc -l docs/topology-guide.md
````

Expected: 160+ lines.

### Step 3: Commit

```bash
git add docs/topology-guide.md
git commit -m "docs: create topology-guide.md — orchestration rules, choreography, failure cadence, checklist"
```

---

## Task 12: Final verification + lint + PR

### Step 1: Full build

```bash
npm run build
```

Expected: clean build, no errors.

### Step 2: Full test suite

```bash
node --test 'tests/*.test.js'
```

Expected: all tests pass. If any fail, fix before continuing.

### Step 3: Lint

```bash
npm run lint
```

Fix any lint errors reported. Re-run until clean.

### Step 4: Verify new exports are accessible

```bash
node -e "
  import('./dist/superhot.js').then(m => {
    console.assert(typeof m.revealLabel === 'function', 'revealLabel missing');
    console.assert(typeof m.scrambleLabel === 'function', 'scrambleLabel missing');
    console.log('exports OK');
  });
"
```

Expected: `exports OK`

### Step 5: Verify ShPipeline renders bracket labels

```bash
node -e "
  import('./dist/superhot.preact.js').then(m => {
    const result = m.ShPipeline({ nodes: [{ id: 'a', label: 'ARIA', status: 'running' }], edges: [] });
    const str = JSON.stringify(result);
    console.assert(str.includes('[ARIA]'), 'bracket label missing');
    console.assert(str.includes('▸'), 'role glyph missing');
    console.assert(str.includes('sh-pipeline-arrow'), 'arrowhead marker missing');
    console.log('ShPipeline OK');
  });
"
```

Expected: `ShPipeline OK`

### Step 6: Verify docs reference is no longer broken

```bash
grep -n "topology-guide.md" docs/components/topology-graph.md
ls docs/topology-guide.md
```

Expected: the grep finds the reference, `ls` confirms the file exists.

### Step 7: Create PR

```bash
gh pr create \
  --title "feat: topology improvements — 44 changes across ShPipeline, pipeline.css, and topology docs" \
  --body "## Summary

44 improvements to the topology section across two parallel tracks:

**ShPipeline (packaged component):**
- Animated edge flow with directional arrowheads (\`→\`)
- Heartbeat pulse on running nodes, threat pulse on failed nodes
- Selection ring with slow rotation
- Targeting reticle (orthogonal crosshair on selected node)
- \`[BRACKET]\` labels + role glyphs (\`▸\`, \`▪\`) replacing color-only status dots
- \`[!]\` badge on failed nodes (Rule 31: label not icon)
- ASCII health gauge (\`██░░░\`) for service ratios
- Character-reveal entrance via \`revealLabel()\`
- State-change label scramble via \`scrambleLabel()\`
- Full keyboard a11y (\`tabIndex\`, \`role=button\`, \`onKeyDown\`)
- \`prefers-reduced-motion\` gating on all \`<animate>\` elements
- Dot-matrix background (terminal character-cell feel)
- SVG defs: glow filters, dither patterns, arrowhead marker

**pipeline.css:**
- Keyframes: edge flow, heartbeat, threat pulse, ring rotation
- Glow hierarchy classes (ambient/standard/critical)
- Dither fill classes for frozen/failed nodes
- Targeting reticle class
- \`@media (prefers-reduced-motion)\` block

**topology-graph.md (consumer reference pattern):**
- Boot scan sequence (\`TOPOLOGY SCAN...\` for 800ms)
- Character-reveal + scramble hooks
- Recovery sequence (glitch → color transition → toast \`RESTORED\`)
- Freshness-based edge animation speed
- \`localStorage\` persistence for zoom + selection
- \`[BRACKET]\` labels throughout
- ASCII health gauges
- Targeting reticle
- NodeDetail piOS voice (uppercase status codes)
- \`prefers-reduced-motion\` section + table
- Edge annotations on focus
- 16-item implementation checklist

**New files:**
- \`js/revealLabel.js\` + tests — character-scramble entrance
- \`js/scrambleLabel.js\` + tests — state-change scramble
- \`docs/topology-guide.md\` — orchestration rules, choreography, failure cadence

**Fixes:** resolves broken reference \`docs/topology-guide.md\` that was linked but missing.

## Test Coverage
- 5 tests for \`revealLabel\`
- 5 tests for \`scrambleLabel\`
- 11 new tests for \`ShPipeline\` (19 total)
- All existing tests pass"
```

---

## Reference

- Design doc: `docs/plans/2026-03-18-topology-improvements-design.md`
- Reference docs used: `docs/experience-design.md`, `docs/atmosphere-guide.md`, `docs/design-philosophy.md`
- Existing pattern: `js/freshness.js`, `js/atmosphere.js` (one function per module)
- Test pattern: `tests/freshness.test.js`, `tests/atmosphere.test.js` (node:test, object mocks)
