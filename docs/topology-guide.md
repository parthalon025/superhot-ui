# superhot-ui Topology Graph Guide

Rules for implementing a topology graph in a superhot-ui dashboard. The topology view is
the most SUPERHOT element of any dashboard — it is the **world you inhabit**, not a diagram
you read. Design it accordingly.

Read `experience-design.md` § "Graph as World" before this document. This guide extends
those rules with specific implementation patterns.

---

## The World Metaphor

The graph is the literal space of the system. Nodes are entities with physical presence.
Edges are live dependency channels — data flowing, not lines connecting boxes.

**Implications:**

- The graph is never decorative. Every node is a real entity. Every edge is a real dependency.
- The visual state of the graph _is_ the state of the system — not a representation of it.
- Nodes glow when healthy. They pulse threat red when failing. Time-frozen when stale.
- Removing a node requires `shatterElement` — entities are destroyed, not hidden.

---

## Color Palette

Strict four-color rule applies. No amber, no green, no blue.

| State        | Color token       | Signal                    |
| ------------ | ----------------- | ------------------------- |
| Healthy      | `--sh-phosphor`   | Entity is alive and well  |
| Failed       | `--sh-threat`     | Entity is broken/missing  |
| Inactive     | `--text-muted`    | Entity exists, not active |
| Selected     | `--sh-phosphor`   | Operator has focused here |
| Edge healthy | `--sh-phosphor`   | Data flow active          |
| Edge failed  | `--sh-threat`     | Flow path is broken       |
| Background   | `--bg-surface`    | Node fill                 |
| Ring guides  | `--border-subtle` | Spatial scaffold, not UI  |

---

## Node Shapes

### Center Hub (singular)

The central authority of the graph. Distinct shape signals its role.

```
Rotated square (45° rect) with double border
  Outer rect: 44×44, rx=4, stroke-width=2, --sh-phosphor, opacity=0.9
  Inner rect: 36×36, rx=3, stroke-width=1, --sh-phosphor, opacity=0.5
  Glow ring:  r=32, no fill, stroke-width=1, opacity=0.3, filter=graph-glow-strong
  Label:      SHORT_ID centered at (0,5), font-data, size=10, --sh-phosphor
  Full label: below at y=48, font-data, size=9, letter-spacing=2, --text-secondary
```

The center node is **always** `--sh-phosphor` — it does not change color on failure of
peripheral nodes. It represents the infrastructure hub, not a service.

### Peripheral Nodes (ring 1–3)

```
Ring 1 (primary):  r=28
Ring 2 (secondary): r=22
Ring 3 (tertiary):  r=22

  Glow ring:         r=nodeRadius+8, no fill, stroke-width=1, statusColor, opacity=0.25, filter=graph-glow
  Node body:         r=nodeRadius, fill=--bg-surface, stroke=statusColor, stroke-width=2
  Status dot:        r=4, fill=statusColor, position=(nodeRadius-4, -(nodeRadius-4)) (top-right)
  Label:             below at y=nodeRadius+14, font-data, size=9, letter-spacing=1, --text-secondary
```

**Status dot** is the primary health signal — it must be visible at all zoom levels.
Never omit it even if space is tight.

---

## Edge / Dependency Lines

Each edge renders as a two-layer path:

```
Layer 1 — base path:
  stroke=statusColor, stroke-width=1.5 (healthy) / 1 (failed), opacity=0.4

Layer 2 — animated dash overlay (data flow direction):
  stroke=statusColor, stroke-width=1.5, stroke-dasharray="6 12"
  <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2–3s" repeatCount="indefinite" />
```

**Direction:** `from="0" to="-18"` moves dashes **toward** the target node — dashes flow in
the direction of data dependency (source → target = A depends on B = flow goes to B).

**Edge path:** quadratic Bézier curving toward center:

```js
const mx = (src.x + tgt.x) / 2;
const my = (src.y + tgt.y) / 2;
const cx = mx + (center.x - mx) * 0.3;
const cy = my + (center.y - my) * 0.3;
// "M src.x src.y Q cx cy tgt.x tgt.y"
```

**Failed edge:** when either endpoint is failed, edge dims (`opacity=0.3`/`0.4`) and color
shifts to `--sh-threat`. The flow looks broken — not absent.

---

## State Transitions

### Healthy → Failed

Applied immediately when `node.status === "failed"`:

1. **Node body** — stroke shifts to `--sh-threat`
2. **Status dot** — fill shifts to `--sh-threat`
3. **Glow ring** — stroke shifts to `--sh-threat`, pulse animation added (see SVG Threat Pulse below)
4. **Connected edges** — color shifts to `--sh-threat`, reduced opacity

### Failed → Recovering

When `node.status` transitions from `failed` → `running`:

1. Remove pulse animation (status update re-renders node)
2. Colors return to `--sh-phosphor`
3. Apply `ShGlitch` burst via JS on the SVG node's label element:
   ```js
   import { glitchText } from "superhot-ui";
   glitchText(labelRef.current, { duration: 600, intensity: "medium" });
   ```
   _Note: `glitchText` works on HTML elements. Attach a `<foreignObject>` label for this
   or use a sibling HTML overlay that matches node position. See "SVG Adapter Patterns" below._

---

## SVG Threat Pulse (SVG adapter for ShThreatPulse)

`ShThreatPulse` is an HTML/CSS component — it cannot be applied directly to SVG nodes.
Use this SVG-native equivalent on the glow ring of any failed node:

```jsx
{
  hasFailed && (
    <circle
      r={nodeRadius + 8}
      fill="none"
      stroke="var(--sh-threat)"
      stroke-width={1}
      opacity={0.25}
      filter="url(#graph-glow)"
    >
      <animate
        attributeName="r"
        values={`${nodeRadius + 8};${nodeRadius + 16};${nodeRadius + 8}`}
        dur="1.8s"
        repeatCount="indefinite"
      />
      <animate attributeName="opacity" values="0.25;0.6;0.25" dur="1.8s" repeatCount="indefinite" />
    </circle>
  );
}
```

This produces the same radial pulse as `ShThreatPulse` but entirely in SVG. Timing
(`1.8s`) matches `--duration-slow` × 3 — slow enough to be ominous, fast enough to
communicate urgency.

---

## Focus Mode

When an operator clicks a node, the graph enters focus mode:

- **Focused node + connected nodes:** full opacity
- **All other nodes:** `opacity=0.2`
- **Connected edges:** full opacity
- **All other edges:** `opacity=0.05`

Transition: `transition: opacity 0.3s ease` on every node and edge `<g>`.

Click the same node to exit. Click the SVG background to exit. This is a **Plan** loop
action — the operator is reasoning about one entity, the world recedes.

---

## Selection Ring

When a node is selected, add a rotating dashed ring outside the node:

```jsx
<circle
  r={nodeRadius + 12}
  fill="none"
  stroke="var(--sh-phosphor)"
  stroke-width={1.5}
  stroke-dasharray="4 4"
  opacity={0.6}
>
  <animateTransform
    attributeName="transform"
    type="rotate"
    from="0"
    to="360"
    dur="8s"
    repeatCount="indefinite"
  />
</circle>
```

Slow rotation (`8s`) communicates _sustained attention_, not frantic activity.

---

## Ring Structure

Three rings define dependency proximity to the center hub:

| Ring | Radius | Role                              |
| ---- | ------ | --------------------------------- |
| 1    | 120px  | Direct integrations (talk to hub) |
| 2    | 220px  | Second-order dependencies         |
| 3    | 300px  | Peripheral / monitoring           |

Ring guides: dashed circles (`stroke-dasharray="4 8"`), `--border-subtle`, opacity 0.3.
**Not UI elements** — they are spatial scaffolding. Clickable for zoom as a secondary
affordance, but never the primary navigation mechanism.

### Zoom Viewboxes

```js
const RING_VIEWBOXES = {
  1: "200 100 400 400", // zoom into ring 1 area
  2: "100 0 600 600", // zoom into ring 2 area
  3: "0 0 800 600", // full view (default)
};
```

Show a `RESET ZOOM` button (`.system-graph-reset`) when zoomed in. Remove when at
default. Typography: `--font-data`, `--type-micro`, `--tracking-wide`.

---

## Node Detail Panel

The detail panel appears on node selection (`.system-graph-detail`).

```
Header:
  Label — font-data, type-small, text-primary, tracking-wide
  Close ×  — text-muted, no border

Body (stack of terse data lines):
  Status code — uppercase, statusColor, tracking-wide
  Ring info   — "RING N", text-muted, tracking-wide
  Role        — italic, text-muted (only if role !== "unknown")
```

**Content rules:**

- Status: lowercase monospace (`running`, `failed`, `inactive`) — matches ShStatusBadge convention
- No sentences, no prose, no "The service is currently..."
- If the node has service count data: show `N/M svc` in the same terse format

**Positioning:** absolute, top-right of the graph container. Never overlaps the center node.

---

## SVG Adapter Patterns

### Applying ShGlitch to SVG labels

`glitchText` requires an HTML element. To get glitch on recovery, use one of:

**Option A — foreignObject label (preferred for complex labels):**

```jsx
<foreignObject x={-40} y={nodeRadius + 6} width={80} height={16}>
  <span
    ref={labelRef}
    xmlns="http://www.w3.org/1999/xhtml"
    style="font-family:var(--font-data);font-size:9px;color:var(--text-secondary);
           display:block;text-align:center;letter-spacing:1px"
  >
    {node.label}
  </span>
</foreignObject>
```

**Option B — sibling HTML overlay (simpler, less precise):**
Track node SVG positions and render HTML `<span>` elements as absolute-positioned overlays
inside a `.system-graph` container with `position: relative`. Use `getBoundingClientRect`
to sync positions on resize.

### Applying ShFrozen to graph data

The graph as a whole should be wrapped in `<ShFrozen timestamp={lastUpdated}>` at the
route level — not per-node. Per-node freshness is not needed; the whole graph refreshes
together.

---

## Do / Don't

| Do                                                    | Don't                               |
| ----------------------------------------------------- | ----------------------------------- |
| Use only the four palette colors                      | Add amber/green for "warning" state |
| Pulse glow ring on failed nodes                       | Change node shape on failure        |
| Animate edges toward the target (data flow direction) | Static edges                        |
| Dim non-connected nodes in focus mode                 | Hide them (opacity=0 feels broken)  |
| Show status dot on every node                         | Omit dot to save space              |
| Label in `--font-data` uppercase short form           | Full descriptive names              |
| `shatterElement` when removing a node                 | Fade out or DOM remove silently     |
| Keep ring guides at opacity 0.3                       | Make rings prominent UI elements    |
| `RESET ZOOM` button in `--font-data`                  | Browser-native zoom controls        |
| Detail panel for selected node                        | Tooltip on hover                    |

---

## Checklist Before Shipping

- [ ] Failed nodes have SVG threat pulse (glow ring animate r + opacity)
- [ ] Failed edges shift to `--sh-threat` and dim
- [ ] Focus mode dims non-connected nodes to `opacity=0.2`
- [ ] Selection ring rotates at 8s (slow — sustained attention, not urgency)
- [ ] Edge animation flows toward target (data dependency direction)
- [ ] Center node always `--sh-phosphor` regardless of peripheral failures
- [ ] Detail panel uses only terse, terminal-voice content
- [ ] Graph wrapped in `ShFrozen` at route level
- [ ] `RESET ZOOM` only visible when zoomed in (not a permanent control)
- [ ] Status dot present on all peripheral nodes at all zoom levels
