# Topology Improvements Design

**Date:** 2026-03-18
**Scope:** `ShPipeline`, `pipeline.css`, `topology-graph.md`, new `topology-guide.md`, new JS utilities
**Branch:** `feature/topology-improvements`
**Total improvements:** 44

---

## Goal

Bring the topology section (both the packaged `ShPipeline` DAG component and the consumer-side
`topology-graph.md` reference pattern) to full compliance with the experience-design, atmosphere,
and design-philosophy reference docs, while adding the ASCII/SUPERHOT terminal aesthetic that
makes the graph feel like a piOS world — not a generic diagram.

---

## Artifacts

| File                                | Action | Commit |
| ----------------------------------- | ------ | ------ |
| `css/components/pipeline.css`       | Modify | 3      |
| `preact/ShPipeline.jsx`             | Modify | 2      |
| `docs/components/topology-graph.md` | Modify | 4      |
| `docs/topology-guide.md`            | Create | 5      |
| `js/revealLabel.js`                 | Create | 1      |
| `js/scrambleLabel.js`               | Create | 1      |
| `esbuild.config.mjs`                | Modify | 1      |

---

## Commit Sequence

1. `feat: add revealLabel and scrambleLabel JS utilities`
2. `feat: enhance ShPipeline — animated edges, heartbeat, a11y, ASCII aesthetics`
3. `feat: update pipeline.css — glow keyframes, dither pattern, reduced-motion`
4. `docs: update topology-graph.md — 14 improvements`
5. `docs: create topology-guide.md`

---

## JS Modules (Commit 1)

### `js/revealLabel.js`

Exports: `revealLabel(el, finalText, duration = 300)`

Character scramble entrance — el's textContent cycles through random ASCII chars before resolving
to finalText. Resolves left-to-right across 8 frames at `duration / 8` ms intervals. Used by
ShPipeline on first mount and by consumer SystemGraph on node entry.

Char pool: `!@#$%^&*?><|/\\[]` (printable non-alphanumeric — stays in piOS vocabulary).
Respects `prefers-reduced-motion`: if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`,
sets textContent directly without animation.

```js
export function revealLabel(el, finalText, duration = 300) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

### `js/scrambleLabel.js`

Exports: `scrambleLabel(el, finalText)`

State-change scramble — cycles through 5 random chars at 40ms each, then sets finalText. Used
when a node transitions status (running→failed, failed→running). Shorter than revealLabel —
communicates "state changed" not "node appeared."

Also respects `prefers-reduced-motion`.

### `esbuild.config.mjs` additions

Add to JS barrel stdin:

```js
"export { revealLabel } from './js/revealLabel.js';",
"export { scrambleLabel } from './js/scrambleLabel.js';",
```

---

## ShPipeline.jsx Improvements (Commit 2)

22 improvements total. Grouped by concern:

### SVG Defs (new `<defs>` block)

- `<filter id="sh-pipeline-glow">` — feGaussianBlur stdDeviation=4, feComposite over
- `<filter id="sh-pipeline-glow-strong">` — stdDeviation=8 for failed nodes
- `<pattern id="sh-pipeline-dither-failed">` — `░▒▓` block char rects at increasing density
- `<pattern id="sh-pipeline-dither-frozen">` — `░` light block char pattern
- `<marker id="sh-pipeline-arrow">` — SVG arrowhead, `--sh-phosphor` fill, orient="auto"

### Background

- Replace current `M 40 0 L 0 0 0 40` line grid with dot-matrix pattern: `<circle r=0.5>` at
  every 40px intersection. `opacity=0.15`. Feels like terminal character cells, not a diagram grid.

### Edges

- Add animated flow: second `<path>` per edge with `stroke-dasharray="6 12"` and
  `<animate attributeName="stroke-dashoffset" from="0" to="-18" dur={staggeredDur} repeatCount="indefinite"/>`
- Stagger per edge: `dur = (0.8 + idx * 0.15) + 's'`
- Add `marker-end="url(#sh-pipeline-arrow)"` to each edge path (directional `→`)
- Failed edges: dashoffset animation stops, opacity drops to 0.25

### Nodes — structural

- Wrap all labels in `[` `]` brackets: render `[${node.label}]` not `{node.label}`
- Replace status-dot `<circle>` with role glyph `<text>`: `◆` center, `▸` running, `▪` idle/other
- Add `[!]` badge: `<text>` element at top-right of failed node body (Rule 31 — label not icon)
- Add ASCII health gauge: replace `3/5 svc` with `██░░░` block chars computed from
  `running/total` ratio. Formula: `Math.round((running/total) * 5)` filled blocks.

### Nodes — animation

- Healthy heartbeat: `<animate>` on outer ring circle, r+4→r+10→r+4, 3s, opacity 0.1→0.25
  (running nodes only, not failed)
- Threat pulse: `<animate>` on outer ring, r+8→r+16→r+8, 1.8s, opacity 0.25→0.6 (failed only)
- Selection ring: dashed `<circle>` with `<animateTransform type="rotate" from="0" to="360" dur="8s">`
- Targeting reticle: on `selectedNode`, render 4 thin `<line>` elements from node center extending
  to SVG bounding box edges. `stroke="var(--sh-phosphor)"`, `stroke-width=0.5`, `opacity=0.2`.
  Signals: "this node is targeted."

### ASCII entrance

- On mount, call `revealLabel(textEl, finalLabel)` for each node via `useEffect([], [])`
- On status change, call `scrambleLabel(textEl, finalLabel)` via `useEffect([node.status])`
- Store text element refs via SVG `ref` on each `<text>` node label element

### Accessibility

- All node `<g>` elements: `role="button"`, `tabIndex={0}`, `aria-label="{label} - {status}"`
- `onKeyDown`: Enter/Space → `handleNode(id, e)`
- Ring circles: `role="button"`, `tabIndex={0}`, `aria-label="Zoom to ring {i+1}"`, Enter/Space → `handleRing`

### Reduced-motion

- At component top: `const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches`
- Gate all `<animate>` and `<animateTransform>` elements: `{!reducedMotion && <animate .../>}`
- Gate revealLabel / scrambleLabel: passed through to the utilities (they check internally)
- Static fallbacks: failed nodes get `stroke="var(--sh-threat)"` border without pulse animation

---

## pipeline.css Improvements (Commit 3)

8 improvements total:

### Keyframes

```css
@keyframes sh-pipeline-edge-flow {
  to {
    stroke-dashoffset: -18;
  }
}

@keyframes sh-pipeline-heartbeat {
  0%,
  100% {
    r: attr(data-r-base number);
    opacity: 0.1;
  }
  50% {
    opacity: 0.25;
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

@keyframes sh-pipeline-ring-rotate {
  to {
    transform: rotate(360deg);
  }
}
```

### Glow classes

```css
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

### Dither fill classes

```css
.sh-pipeline-node--frozen rect {
  fill: url(#sh-pipeline-dither-frozen);
}
.sh-pipeline-node--failed rect {
  fill: url(#sh-pipeline-dither-failed);
}
```

### Targeting reticle

```css
.sh-pipeline-reticle {
  stroke: var(--sh-phosphor);
  stroke-width: 0.5;
  opacity: 0.2;
  pointer-events: none;
}
```

### Reduced-motion block

```css
@media (prefers-reduced-motion: reduce) {
  .sh-pipeline-node--running circle,
  .sh-pipeline-node--failed circle {
    animation: none;
  }
  .sh-pipeline-edge [class*="flow"] {
    animation: none;
  }
  .sh-pipeline-node--failed rect {
    stroke: var(--sh-threat);
    stroke-width: 2;
  }
}
```

---

## topology-graph.md Improvements (Commit 4)

14 improvements to the SystemGraph consumer reference pattern:

1. **Boot scan sequence** — `ShMantra text="TOPOLOGY SCAN..."` rendered for 800ms before graph
   data renders. Uses `useState(true)` `scanning` flag, `setTimeout` 800ms to clear.

2. **Character-reveal entrance** — `revealLabel()` called via `useEffect` after first data load.
   Import from `superhot-ui`: `import { revealLabel, scrambleLabel } from 'superhot-ui'`.

3. **State-change label scramble** — `useEffect([topologyKey])` calls `scrambleLabel()` on each
   node text ref when `topologyKey` changes (status changed).

4. **`[BRACKET]` labels** — update all `node.label` renders to `[${node.label}]` throughout template.

5. **`[!]` badge** — add `<text>` badge to failed nodes in the peripheral nodes render block.

6. **ASCII health gauge** — replace `{stats.running}/{stats.total} svc` with block char gauge.

7. **Targeting reticle** — on `selectedNode`, add 4 `<line>` elements from node center to SVG edges.

8. **Recovery sequence** — new section with full code example:

   ```js
   // On service recovery detected:
   glitchText(nodeLabelEl, { duration: 200, intensity: "low" });
   // After 200ms:
   // SVG: transition stroke from --sh-threat to --sh-phosphor
   ShToast({ type: "info", message: `[${timestamp}] ${nodeId.toUpperCase()} RESTORED` });
   ```

9. **Freshness-based edge speed** — edge `stroke-dashoffset` duration derived from node age:
   fresh (0-5min) = 0.8s, cooling (5-30min) = 1.5s, frozen (30min+) = 3s (near still).

10. **`localStorage` persistence** — `zoomRing` and `selectedNode` read/write `localStorage`
    on change. Key: `sh-topology-zoom`, `sh-topology-selected`.

11. **Edge annotations on focus** — when `focusedNode` is set, adjacent edge paths render a
    `<text>` element mid-path showing latency or weight from edge data if available.

12. **NodeDetail piOS voice** — status codes uppercase (`FAILED`, `RUNNING`, `IDLE`), ring label
    becomes `RING {n}` in `--tracking-widest` monospace.

13. **`prefers-reduced-motion` section** — table of all animated → static fallbacks:
    heartbeat off → static phosphor border, threat pulse off → static threat border,
    edge flow off → static dashed path, reveal off → direct text set.

14. **Updated 15-item checklist** replacing the current 8-item checklist. Includes all new
    items: brackets, glyphs, boot scan, reticle, gauge, scramble, persistence, recovery.

---

## topology-guide.md (Commit 5)

New file: `docs/topology-guide.md`. Sections:

1. **Purpose** — topology graph is the world hero; distinguishes it from pipeline DAG
2. **Entry choreography** — boot scan (800ms) → stagger nodes → heartbeat activation (400ms+)
3. **Exit choreography** — `shatterElement` on node before DOM removal
4. **Recovery choreography** — glitch burst → color transition → toast `RESTORED` → phosphor calm
5. **Freshness discipline** — `ShFrozen` wraps container, not per-node; per-node: edge speed +
   border desaturation; stale node: dither pattern activates
6. **Failure escalation** — maps Rule 12 cadence to graph: 0-5s (node pulse), 5-15s (edge dims,
   incident HUD), 15-60s (section mantra), 60s+ (layout root mantra)
7. **Focus mode** — click node → non-connected nodes fade to `opacity: 0.2`;
   click SVG background → restore all; keyboard: Tab through nodes, Enter to focus
8. **Sound integration** — `playSfx('error')` on first failure detection, `playSfx('complete')`
   on recovery
9. **The full 15-item implementation checklist**

---

## Design Constraints

- No new CSS color tokens beyond the four (white/black/red/cyan)
- No new peer dependencies
- `revealLabel` + `scrambleLabel` are pure DOM (no framework)
- All animations gated by `prefers-reduced-motion`
- Bracket labels `[NAME]` are rendered text, not styling — consumers can opt out by
  passing `labelFormat={id => id}` prop to ShPipeline
- ASCII health gauge uses Unicode block characters (`█`, `░`) — monospace-safe in `var(--sh-font)`

---

## Success Criteria

- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] `npm run lint` clean
- [ ] `revealLabel` and `scrambleLabel` exported from `import 'superhot-ui'`
- [ ] ShPipeline renders animated edges with arrowheads
- [ ] ShPipeline keyboard-navigable (Tab through nodes, Enter to select)
- [ ] `prefers-reduced-motion` disables all `<animate>` elements in ShPipeline
- [ ] topology-graph.md checklist has 15 items
- [ ] `docs/topology-guide.md` exists and covers all 9 sections
- [ ] No new colors beyond the four-color palette
