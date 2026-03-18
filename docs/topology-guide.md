# Topology Graph Orchestration Guide

Rules for building and orchestrating the topology graph in a superhot-ui dashboard.
This document governs _when_ and _how_ effects happen — the component template is in
`docs/components/topology-graph.md`.

---

## 1. Purpose — The Graph Is the World

The topology graph IS the dashboard. It is the crystalline world you inhabit — not a
diagram you read, not a panel you consult. The graph occupies the dominant viewport area
and is never buried in a tab, a collapsible, or a secondary route.

Every node is a real entity with physical presence. Every edge is a live dependency
channel — data flowing, not lines connecting boxes. The visual state of the graph _is_
the state of the system.

**Pipeline DAG vs topology graph:**

| Concern   | ShPipeline                          | Topology Graph                             |
| --------- | ----------------------------------- | ------------------------------------------ |
| Structure | Linear DAG — step-by-step data flow | Radial architecture — ring-based hierarchy |
| Semantic  | "What happens to one job"           | "What exists in the system"                |
| Layout    | Left-to-right or top-to-bottom      | Center-hub with concentric rings           |
| Animation | Step progress indicators            | Heartbeat, threat pulse, edge flow         |
| Entry     | Stagger by pipeline step            | Boot scan mantra → full reveal             |
| Component | `<ShPipeline>`                      | Consumer-side SVG (not packaged)           |

The graph is never decorative. Removing a node requires `shatterElement` — entities are
destroyed, not hidden. Adding a node requires `revealLabel` — entities materialize, not
appear.

---

## 2. Entry Choreography

Atmosphere rule 10 governs stagger order. For the topology graph, the boot sequence
communicates "system scanning" before revealing the world.

| Time    | What happens                                          |
| ------- | ----------------------------------------------------- |
| 0ms     | Container structure renders (border, background grid) |
| 0–800ms | `ShMantra text="TOPOLOGY SCAN..."` watermark active   |
| 800ms   | Mantra clears, graph data renders into the SVG        |
| 800ms   | `revealLabel()` fires on each node (300ms scramble)   |
| 1100ms  | Edge dash animations activate                         |
| 1200ms  | Heartbeat pulses activate on running nodes            |

**Implementation:**

```js
import { revealLabel } from "superhot-ui";

// Inside the graph component
const [scanning, setScanning] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setScanning(false), 800);
  return () => clearTimeout(timer);
}, []);

// In JSX:
// {scanning && <ShMantra text="TOPOLOGY SCAN..." active />}
// {!scanning && <TopologyNodes onMount={(labelEl, text) => revealLabel(labelEl, text, 300)} />}
```

The 800ms scan period is not arbitrary — it sits between "instant" (no drama) and "slow"
(user thinks something broke). The mantra watermark fills the void while the world
assembles behind it.

---

## 3. Exit Choreography

When a node is removed from the topology, it does not disappear. It shatters.

**Sequence:**

1. `shatterElement(nodeEl, { fragments: 6 })` fires on the node container
2. After shatter duration (600ms), the node element is removed from the DOM
3. Connected edges fade to `opacity: 0` over 300ms concurrent with the shatter

```js
import { shatterElement } from "superhot-ui";

function removeNode(nodeEl, connectedEdgeEls) {
  // Fade connected edges
  for (const edge of connectedEdgeEls) {
    edge.style.transition = "opacity 300ms ease";
    edge.style.opacity = "0";
  }

  // Shatter the node
  shatterElement(nodeEl, {
    fragments: 6,
    onComplete: () => {
      // DOM cleanup happens in onComplete — shatterElement removes nodeEl
      for (const edge of connectedEdgeEls) {
        edge.remove();
      }
    },
  });
}
```

For SVG nodes: shatter operates on HTML elements. Wrap the exit in an HTML overlay at
the node's screen position, run the shatter there, then remove the SVG `<g>`. The user
sees fragments; the SVG stays clean.

---

## 4. Recovery Choreography

When a node transitions from `failed` to `running`, the recovery sequence communicates
"threat resolved" through a five-step cadence.

**Sequence:**

1. **Glitch burst** (0ms) — `glitchText(labelEl, { duration: 200, intensity: 'low' })`
2. **Color transition** (200ms) — stroke shifts from `--sh-threat` to `--sh-phosphor`
3. **Threat pulse stops** — SVG `<animate>` elements removed on re-render
4. **Toast** — `[HH:MM:SS] NODE_ID RESTORED`
5. **Phosphor calm** (400ms) — heartbeat pulse re-activates (3s cycle)

```js
import { glitchText, playSfx } from "superhot-ui";

function handleRecovery(nodeId, labelEl) {
  // 1. GLITCH BURST
  glitchText(labelEl, { duration: 200, intensity: "low" });

  // 2. COLOR TRANSITION (after glitch resolves)
  setTimeout(() => {
    // Status update triggers re-render — stroke becomes --sh-phosphor
    updateNodeStatus(nodeId, "running");
  }, 200);

  // 3. Threat pulse stops automatically (hasFailed becomes false)
  // 4. TOAST
  const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
  showToast(`[${ts}] ${nodeId.toUpperCase()} RESTORED`, "success");

  // 5. Heartbeat re-activates via conditional render (isRunning === true)
  playSfx("complete");
}
```

The low-intensity glitch is deliberate — recovery is relief, not alarm. High-intensity
glitch would make the user think something broke again.

---

## 5. Freshness Discipline

Freshness governs how "alive" the graph feels as data ages. Two layers operate
independently.

### Container-Level: ShFrozen

Wrap the entire graph route in `<ShFrozen timestamp={lastUpdated}>`. This is a coarse
signal — when the whole data source goes stale, the entire graph surface desaturates
and the dither overlay activates.

**Do NOT** apply `ShFrozen` per-node. The graph refreshes as a unit; per-node freshness
creates visual noise and implies granularity that does not exist in the data source.

### Per-Node: Edge Speed

Individual node freshness is communicated through edge animation speed — faster flow
means fresher data.

| Freshness state | Edge `dur` | Signal                         |
| --------------- | ---------- | ------------------------------ |
| `fresh`         | 0.8s       | Data flowing actively          |
| `cooling`       | 1.5s       | Recent but aging               |
| `frozen`        | 3s         | Data is old, system may be out |
| `stale`         | 6s         | Effectively dead               |

### Per-Node: Border Desaturation

As freshness degrades, node border color shifts:

- `fresh` / `cooling` — `--sh-phosphor` (full saturation)
- `frozen` — `--text-tertiary` (desaturated)
- `stale` — `--text-tertiary` + dither pattern activates

The dither pattern is the CSS `data-sh-state="frozen"` / `data-sh-state="stale"` overlay
from the freshness system. Apply it to the node's HTML overlay or foreignObject wrapper,
not to the SVG circle directly.

---

## 6. Failure Escalation Cadence

Atmosphere rule 12: never jump straight to critical. Escalation builds over time.

| Elapsed | Response                                                      |
| ------- | ------------------------------------------------------------- |
| 0–5s    | Threat pulse + `[!]` badge + toast on the affected node       |
| 5–15s   | Connected edges dim to `opacity: 0.15`, sidebar indicator lit |
| 15–60s  | `ShMantra` `NODE_ID OFFLINE` appears on the graph section     |
| 60s+    | If core node: `ShMantra` `SYSTEM DEGRADED` on layout root     |

**The escalation itself is the drama.** Watching the interface progressively darken
creates more tension than an instant full-screen alert.

```js
import { useEffect, useRef, useState } from "preact/hooks";

function useFailureEscalation(nodeId, isFailed) {
  const [level, setLevel] = useState(0); // 0=none, 1=pulse, 2=dim, 3=mantra, 4=critical
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isFailed) {
      setLevel(0);
      clearTimeout(timerRef.current);
      return;
    }

    // LEVEL 1: immediate — threat pulse + badge + toast
    setLevel(1);

    // LEVEL 2: 5s — edges dim, sidebar indicator
    timerRef.current = setTimeout(() => {
      setLevel(2);

      // LEVEL 3: 15s — section mantra
      timerRef.current = setTimeout(() => {
        setLevel(3);

        // LEVEL 4: 60s — layout-root mantra (core nodes only)
        timerRef.current = setTimeout(() => {
          setLevel(4);
        }, 45_000);
      }, 10_000);
    }, 5_000);

    return () => clearTimeout(timerRef.current);
  }, [nodeId, isFailed]);

  return level;
}

// Usage:
// level >= 1 → show [!] badge, activate threat pulse, fire toast
// level >= 2 → dim connected edges to 0.15, light sidebar indicator
// level >= 3 → <ShMantra text={`${nodeId.toUpperCase()} OFFLINE`} active />
// level >= 4 → <ShMantra text="SYSTEM DEGRADED" active /> on layout root
```

**De-escalation reverses the cadence:** layout mantra clears first, then section mantra,
then individual threat pulse resolves with the recovery choreography (section 4).

---

## 7. Focus Mode

Click a node to enter focus mode. The world recedes — only the selected entity and its
direct connections remain vivid.

**Behavior:**

- Clicked node + directly connected nodes: full opacity
- All other nodes: `opacity: 0.2` (300ms transition)
- Connected edges: full opacity
- All other edges: `opacity: 0.05`
- Click the same node again or click the SVG background to exit
- Tab through nodes with keyboard, Enter/Space selects

```js
// Focus mode opacity helpers — used in node/edge render
function nodeOpacity(nodeId, focusedNode, connectedIds) {
  if (!focusedNode) return 1;
  return connectedIds.has(nodeId) ? 1 : 0.2;
}

function edgeOpacity(srcId, tgtId, baseOpacity, focusedNode, connectedIds) {
  if (!focusedNode) return baseOpacity;
  return connectedIds.has(srcId) && connectedIds.has(tgtId) ? baseOpacity : 0.05;
}

// Build connected set from edges
function getConnectedIds(focusedNode, edges) {
  const ids = new Set([focusedNode]);
  for (const e of edges) {
    if (e.source === focusedNode) ids.add(e.target);
    if (e.target === focusedNode) ids.add(e.source);
  }
  return ids;
}
```

Focus mode is a **Plan** loop action — the operator is reasoning about one entity.
The world recedes to reduce cognitive load, not to hide information. Dimmed nodes
remain visible at 0.2 — never 0 (that feels broken).

---

## 8. Sound Integration

Audio is off by default, gated behind user preference (`ShAudio.enabled`).

| Event                 | Sound                 | Trigger                  |
| --------------------- | --------------------- | ------------------------ |
| Node failure detected | `playSfx('error')`    | Once per failure event   |
| Node recovery         | `playSfx('complete')` | Once per recovery event  |
| Boot scan complete    | No sound              | Silent — routine startup |

```js
import { ShAudio, playSfx } from "superhot-ui";

// Gate behind user preference — stored in localStorage
ShAudio.enabled = localStorage.getItem("sh-audio") === "on";

// On failure detection (fire once, not on every re-render)
if (prevStatus !== "failed" && currentStatus === "failed") {
  playSfx("error");
}

// On recovery (fire once)
if (prevStatus === "failed" && currentStatus === "running") {
  playSfx("complete");
}
```

Sound fires **once** per state transition. If a node is already failed and re-renders,
no sound. The transition itself is the event, not the state.

---

## 9. Implementation Checklist

17 items. All must pass before the topology graph ships.

- [ ] `ShFrozen` wraps graph at the route level (not per-node)
- [ ] Boot scan mantra runs for 800ms before graph data renders
- [ ] `revealLabel` fires on each node label at first load
- [ ] `scrambleLabel` fires on node labels when status changes
- [ ] `[BRACKET]` notation used for all status codes and system messages
- [ ] `[!]` badge + threat pulse + dither overlay on failed nodes
- [ ] Edge animation speed varies by freshness (0.8s / 1.5s / 3s / 6s)
- [ ] Arrowheads present on non-failed edges (data flow direction)
- [ ] Targeting reticle (rotating dashed ring) on selected node
- [ ] ASCII health gauge in node detail panel
- [ ] `shatterElement` called before DOM removal of any node
- [ ] Recovery choreography (glitch burst + color shift + toast + heartbeat)
- [ ] Failure escalation cadence (4 levels over 60s, never jump to critical)
- [ ] Focus mode dims non-connected nodes to 0.2, edges to 0.05
- [ ] `localStorage` persistence for zoom level + selected node
- [ ] `prefers-reduced-motion` gates all animation (static indicators remain)
- [ ] `playSfx` fires on failure and recovery transitions (audio off by default)
