# ShTopologyGraph (Consumer-Side Pattern)

Reference component pattern for SVG topology graphs in superhot-ui dashboards.
This is **not** a packaged component — topology graphs are too project-specific for
the design system. This document provides the canonical implementation pattern,
including all SVG adapters for effects that are HTML/CSS-only in superhot-ui.

For orchestration rules, read `docs/topology-guide.md` first.

---

## What the Design System Provides

| Concern            | Provided by                                    | How                     |
| ------------------ | ---------------------------------------------- | ----------------------- |
| Node status colors | `--sh-phosphor`, `--sh-threat`, `--text-muted` | CSS tokens              |
| Background surface | `--bg-surface`, `--bg-inset`                   | CSS tokens              |
| Glow filter        | `<filter id="graph-glow">`                     | SVG defs (see template) |
| Failure pulse      | SVG `<animate>` adapter                        | See template            |
| Healthy heartbeat  | SVG `<animate>` adapter                        | See template            |
| Selection ring     | SVG `<animateTransform>`                       | See template            |
| Edge flow          | `stroke-dashoffset` `<animate>`                | See template            |
| Grid background    | SVG `<pattern>`                                | See template            |
| Font               | `var(--font-data)`                             | CSS token               |

**Not provided:** layout algorithm, edge paths, ring structure, zoom logic —
these are project-specific.

---

## File Conventions

```
spa/components/SystemGraph.jsx   ← main component (renders SVG)
spa/components/NodeDetail.jsx    ← optional detail panel (HTML overlay)
```

The SVG owns the visual world. The detail panel is HTML positioned absolutely
over the graph container. Never mix SVG and HTML layout concerns.

---

## Template

```jsx
import { useEffect, useRef, useState } from "preact/hooks";
import { ShSkeleton, ShErrorState, ShMantra, ShToast } from "superhot-ui/preact";
import { revealLabel, scrambleLabel } from "superhot-ui";
import { computeFreshness } from "superhot-ui/js/freshness.js";
import { glitchText } from "superhot-ui/js/glitch.js";
import { projects } from "../store/signals.js"; // adjust import per project
import { fetchGraph } from "../lib/api.js";

// --- Constants ---

const CX = 400; // SVG center X
const CY = 300; // SVG center Y
const RING_RADII = [0, 120, 220, 300];
const DEFAULT_VIEWBOX = "0 0 800 600";
const RING_VIEWBOXES = {
  1: "200 100 400 400",
  2: "100 0 600 600",
  3: "0 0 800 600",
};

// Ring-based node radius — ring 1 nodes larger than ring 2/3
const nodeRadius = (ring) => (ring === 1 ? 28 : 22);

// Quadratic Bézier curving toward graph center
function edgePath(src, tgt) {
  const mx = (src.x + tgt.x) / 2;
  const my = (src.y + tgt.y) / 2;
  return `M ${src.x} ${src.y} Q ${mx + (CX - mx) * 0.3} ${my + (CY - my) * 0.3} ${tgt.x} ${tgt.y}`;
}

// --- Main Component ---

export function SystemGraph() {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedNode, setFocusedNode] = useState(null);
  const [zoomRing, setZoomRing] = useState(3);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  // Refs for character-reveal label animation
  const labelRefs = useRef(new Map());
  const prevStatuses = useRef({});

  // Re-fetch when topology changes (project names or service statuses)
  const topologyKey =
    projects.value?.projects
      ?.map((p) => `${p.id}:${(p.services ?? []).map((s) => s.status).join(",")}`)
      .join("|") ?? "";

  useEffect(() => {
    let cancelled = false;
    fetchGraph()
      .then((data) => {
        if (!cancelled) setGraphData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [topologyKey]);

  // Boot scan — 800ms delay before revealing graph
  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Character-reveal on first data load
  useEffect(() => {
    if (!graphData) return;
    labelRefs.current.forEach((el) => {
      revealLabel(el, { duration: 400, charset: "hex" });
    });
  }, [!!graphData]);

  // Scramble labels on status change
  useEffect(() => {
    if (!graphData) return;
    const { center, nodes } = graphData;
    const allNodes = [center, ...nodes];
    for (const node of allNodes) {
      const prev = prevStatuses.current[node.id];
      if (prev && prev !== node.status) {
        const el = labelRefs.current.get(node.id);
        if (el) scrambleLabel(el, { duration: 300 });
      }
      prevStatuses.current[node.id] = node.status;
    }
  }, [graphData]);

  // Build live service stats from projects signal — keyed by node ID
  const serviceStats = new Map(
    (projects.value?.projects ?? []).map((p) => {
      const svcs = p.services ?? [];
      return [
        p.id,
        { running: svcs.filter((s) => s.status === "running").length, total: svcs.length },
      ];
    }),
  );

  if (error)
    return (
      <div class="system-graph">
        <ShErrorState title="TOPOLOGY ERROR" message={error} />
      </div>
    );
  if (!graphData)
    return (
      <div class="system-graph">
        <ShSkeleton rows={4} />
      </div>
    );
  if (scanning)
    return (
      <div class="system-graph">
        <ShMantra text="TOPOLOGY SCAN..." />
      </div>
    );

  const { center, nodes, edges } = graphData;
  const allNodes = [center, ...nodes];
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const failedIds = new Set(nodes.filter((n) => n.status === "failed").map((n) => n.id));

  // Focus mode
  let connectedIds = null;
  if (focusedNode) {
    connectedIds = new Set([focusedNode]);
    for (const e of edges) {
      if (e.source === focusedNode) connectedIds.add(e.target);
      if (e.target === focusedNode) connectedIds.add(e.source);
    }
  }
  const nodeOpacity = (id) => (!connectedIds || connectedIds.has(id) ? 1 : 0.2);
  const edgeOpacity = (src, tgt, base) =>
    !connectedIds || (connectedIds.has(src) && connectedIds.has(tgt)) ? base : 0.05;

  const handleNode = (id, e) => {
    e.stopPropagation();
    setFocusedNode((p) => (p === id ? null : id));
    setSelectedNode((p) => (p === id ? null : id));
  };
  const handleSvgBg = (e) => {
    if (e.target === e.currentTarget) {
      setFocusedNode(null);
      setSelectedNode(null);
    }
  };
  const handleRing = (i, e) => {
    e.stopPropagation();
    setZoomRing((p) => (p === i + 1 ? 3 : i + 1));
  };

  const viewBox = RING_VIEWBOXES[zoomRing] ?? DEFAULT_VIEWBOX;

  return (
    <div class="system-graph">
      {zoomRing !== 3 && (
        <button class="system-graph-reset" onClick={() => setZoomRing(3)} aria-label="Reset zoom">
          RESET ZOOM
        </button>
      )}

      <svg
        viewBox={viewBox}
        class="system-graph-svg"
        role="img"
        aria-label="System architecture graph showing project interconnections"
        onClick={handleSvgBg}
      >
        <defs>
          {/* Subtle background grid */}
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--border-subtle)"
              stroke-width="0.5"
            />
          </pattern>

          {/* Phosphor glow — standard */}
          <filter id="graph-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Phosphor glow — strong (center node) */}
          <filter id="graph-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid background — makes it feel like a space, not a diagram */}
        <rect width="800" height="600" fill="url(#graph-grid)" opacity="0.25" />

        {/* Ring guides — spatial scaffold, not UI */}
        {RING_RADII.slice(1).map((r, i) => (
          <circle
            key={r}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="var(--border-subtle)"
            stroke-width={zoomRing === i + 1 ? 1.5 : 0.5}
            stroke-dasharray="4 8"
            opacity={zoomRing === i + 1 ? 0.5 : 0.25 - i * 0.05}
            style="cursor:pointer"
            onClick={(e) => handleRing(i, e)}
            role="button"
            tabIndex={0}
            aria-label={`Zoom to ring ${i + 1}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRing(i, e);
              }
            }}
          />
        ))}

        {/* Edges */}
        {edges.map((edge, idx) => {
          const src = nodeMap.get(edge.source);
          const tgt = nodeMap.get(edge.target);
          if (!src || !tgt) return null;
          const d = edgePath(src, tgt);
          const failed = failedIds.has(edge.source) || failedIds.has(edge.target);
          const color = failed ? "var(--sh-threat)" : "var(--sh-phosphor)";
          const opacity = edgeOpacity(edge.source, edge.target, 1);
          const dur = `${1.0 + idx * 0.15}s`; // stagger edge animation timing
          return (
            <g key={`e${idx}`} style={`opacity:${opacity};transition:opacity 0.3s ease`}>
              {/* Base path */}
              <path
                d={d}
                fill="none"
                stroke={color}
                stroke-width={failed ? 1 : 1.5}
                opacity={failed ? 0.25 : 0.35}
              />
              {/* Animated flow dashes — march toward target (data dependency direction) */}
              <path
                d={d}
                fill="none"
                stroke={color}
                stroke-width={1.5}
                stroke-dasharray="6 12"
                opacity={failed ? 0.3 : 0.65}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-18"
                  dur={dur}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          );
        })}

        {/* Center node — always --sh-phosphor, rotated-square shape */}
        {(() => {
          const stats = serviceStats.get(center.id);
          return (
            <g
              transform={`translate(${center.x},${center.y})`}
              style={`opacity:${nodeOpacity(center.id)};cursor:pointer;transition:opacity 0.3s ease`}
              onClick={(e) => handleNode(center.id, e)}
              role="button"
              tabIndex={0}
              aria-label={`${center.label} - center hub`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNode(center.id, e);
                }
              }}
            >
              <circle
                r={32}
                fill="none"
                stroke="var(--sh-phosphor)"
                stroke-width={1}
                opacity={0.3}
                filter="url(#graph-glow-strong)"
              />
              <rect
                x={-22}
                y={-22}
                width={44}
                height={44}
                rx={4}
                fill="var(--bg-surface)"
                stroke="var(--sh-phosphor)"
                stroke-width={2}
                transform="rotate(45)"
                opacity={0.9}
              />
              <rect
                x={-18}
                y={-18}
                width={36}
                height={36}
                rx={3}
                fill="var(--bg-surface)"
                stroke="var(--sh-phosphor)"
                stroke-width={1}
                transform="rotate(45)"
                opacity={0.5}
              />
              <text
                y={2}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="9"
                fill="var(--sh-phosphor)"
              >
                {center.id.slice(0, 4).toUpperCase()}
              </text>
              {stats?.total > 0 && (
                <text
                  y={12}
                  text-anchor="middle"
                  font-family="var(--font-data)"
                  font-size="7"
                  fill="var(--sh-phosphor)"
                  opacity={0.7}
                >
                  {stats.running}/{stats.total}
                </text>
              )}
              <text
                y={48}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="9"
                letter-spacing="2"
                fill="var(--text-secondary)"
                ref={(el) => {
                  if (el) labelRefs.current.set(center.id, el);
                }}
              >
                {`[${center.label}]`}
              </text>
            </g>
          );
        })()}

        {/* Peripheral nodes */}
        {nodes.map((node) => {
          const hasFailed = node.status === "failed";
          const isRunning = node.status === "running";
          const isSelected = node.id === selectedNode;
          const r = nodeRadius(node.ring);
          const stats = serviceStats.get(node.id);
          const statusColor = hasFailed
            ? "var(--sh-threat)"
            : isRunning
              ? "var(--sh-phosphor)"
              : "var(--text-muted)";

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={`opacity:${nodeOpacity(node.id)};cursor:pointer;transition:opacity 0.3s ease`}
              onClick={(e) => handleNode(node.id, e)}
              role="button"
              tabIndex={0}
              aria-label={`${node.label} - ${node.status}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNode(node.id, e);
                }
              }}
            >
              {/* Healthy heartbeat — slow 3s pulse, very subtle (running nodes only) */}
              {isRunning && !hasFailed && (
                <circle
                  r={r + 4}
                  fill="none"
                  stroke="var(--sh-phosphor)"
                  stroke-width={0.5}
                  opacity={0.1}
                >
                  <animate
                    attributeName="r"
                    values={`${r + 4};${r + 10};${r + 4}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.1;0.25;0.1"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Threat pulse — 1.8s radial pulse on failed nodes (SVG adapter for ShThreatPulse) */}
              <circle
                r={r + 8}
                fill="none"
                stroke={statusColor}
                stroke-width={1}
                opacity={0.25}
                filter="url(#graph-glow)"
              >
                {hasFailed && (
                  <>
                    <animate
                      attributeName="r"
                      values={`${r + 8};${r + 16};${r + 8}`}
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.25;0.6;0.25"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </>
                )}
              </circle>

              {/* Selection ring — slow rotation (8s) signals sustained attention */}
              {isSelected && (
                <circle
                  r={r + 12}
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
              )}

              {/* Node body */}
              <circle r={r} fill="var(--bg-surface)" stroke={statusColor} stroke-width={2} />

              {/* Status dot — top-right, always visible */}
              <circle cx={r - 4} cy={-(r - 4)} r={4} fill={statusColor} />

              {/* [!] badge — failed nodes only */}
              {hasFailed && (
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
              )}

              {/* Primary label — [BRACKET] format, centered or shifted up if showing stat */}
              <text
                y={stats?.total > 0 ? -2 : 4}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="8"
                letter-spacing="0.5"
                fill="var(--sh-phosphor)"
                opacity={0.9}
                ref={(el) => {
                  if (el) labelRefs.current.set(node.id, el);
                }}
              >
                {`[${node.label.length > 10 ? node.label.slice(0, 9) + "…" : node.label}]`}
              </text>

              {/* Live service stat — ASCII block gauge */}
              {stats?.total > 0 && (
                <text
                  y={9}
                  text-anchor="middle"
                  font-family="var(--font-data)"
                  font-size="7"
                  fill={statusColor}
                  opacity={0.8}
                >
                  {(() => {
                    const filled = Math.round((stats.running / stats.total) * 5);
                    return "\u2588".repeat(filled) + "\u2591".repeat(5 - filled);
                  })()}
                </text>
              )}

              {/* Role badge — bottom of node, [BRACKET] format */}
              <text
                y={r + 14}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="8"
                letter-spacing="1"
                fill="var(--text-muted)"
              >
                {`[${node.label}]`}
              </text>
            </g>
          );
        })}

        {/* Targeting reticle — crosshair lines on selected node */}
        {selectedNode &&
          nodeMap.get(selectedNode) &&
          (() => {
            const sn = nodeMap.get(selectedNode);
            return (
              <g
                opacity={0.3}
                stroke="var(--sh-phosphor)"
                stroke-width={0.5}
                stroke-dasharray="2 6"
              >
                <line x1={sn.x} y1={0} x2={sn.x} y2={600} />
                <line x1={0} y1={sn.y} x2={800} y2={sn.y} />
              </g>
            );
          })()}

        {/* Edge annotations on focus — show latency labels on adjacent edges */}
        {focusedNode &&
          edges.map((edge, idx) => {
            if (edge.source !== focusedNode && edge.target !== focusedNode) return null;
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;
            const mx = (src.x + tgt.x) / 2;
            const my = (src.y + tgt.y) / 2;
            const label = edge.latency
              ? `${edge.latency}ms`
              : edge.weight
                ? `w:${edge.weight}`
                : null;
            if (!label) return null;
            return (
              <text
                key={`ann${idx}`}
                x={mx}
                y={my - 6}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="7"
                fill="var(--sh-phosphor)"
                opacity={0.8}
              >
                {label}
              </text>
            );
          })}
      </svg>

      {/* Node detail panel — HTML overlay, positioned absolute over graph */}
      {selectedNode && nodeMap.get(selectedNode) && (
        <NodeDetail
          node={nodeMap.get(selectedNode)}
          stats={serviceStats.get(selectedNode)}
          onClose={() => {
            setSelectedNode(null);
            setFocusedNode(null);
          }}
        />
      )}
    </div>
  );
}

function NodeDetail({ node, stats, onClose }) {
  const statusColor =
    node.status === "failed"
      ? "var(--sh-threat)"
      : node.status === "running"
        ? "var(--sh-phosphor)"
        : "var(--text-muted)";

  return (
    <div class="system-graph-detail">
      <div class="system-graph-detail-header">
        <span class="system-graph-detail-label">{node.label}</span>
        <button class="system-graph-detail-close" onClick={onClose} aria-label="Close details">
          x
        </button>
      </div>
      <div class="system-graph-detail-body">
        <span
          class="system-graph-detail-status"
          style={`color:${statusColor};letter-spacing:var(--tracking-widest)`}
        >
          {node.status.toUpperCase()}
        </span>
        <span class="system-graph-detail-ring">RING {node.ring}</span>
        {node.role && node.role !== "unknown" && (
          <span class="system-graph-detail-role">{node.role}</span>
        )}
        {stats?.total > 0 && (
          <span
            style={`color:${statusColor};letter-spacing:var(--tracking-wide);font-family:var(--font-data);font-size:var(--type-micro)`}
          >
            {stats.running}/{stats.total} svc
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Recovery Sequence

When a node transitions from `failed` back to `running`, play a recovery sequence
to draw attention to the restored service. Pattern: glitch burst, color transition,
then a confirmation toast.

```jsx
// In a useEffect watching node status changes:
useEffect(() => {
  if (!graphData) return;
  const { nodes } = graphData;
  for (const node of nodes) {
    const prev = prevStatuses.current[node.id];
    if (prev === "failed" && node.status === "running") {
      // 1. Glitch burst on the label element
      const el = labelRefs.current.get(node.id);
      if (el) glitchText(el, { duration: 400, intensity: 0.8 });

      // 2. Color transition — CSS handles via data-sh-state change
      //    The node's statusColor switches from --sh-threat to --sh-phosphor,
      //    and the SVG stroke transition property handles the interpolation.

      // 3. Confirmation toast
      ShToast.show({
        type: "success",
        message: `[${node.label}] RESTORED`,
        duration: 3000,
      });
    }
  }
}, [graphData]);
```

**Sequence timing:** glitch (0-400ms) overlaps with color transition (CSS `transition: stroke 0.6s`),
toast appears at 400ms and auto-dismisses at 3400ms. The overlap is intentional — the glitch
masks the color change, making the transition feel like a system reboot rather than a state swap.

---

## Freshness-Based Edge Animation Speed

Edge flow speed can reflect how recently data moved through a connection.
Use `computeFreshness` to derive animation duration from the source node's
last-updated timestamp — fresh connections pulse faster, stale ones crawl.

```jsx
import { computeFreshness } from "superhot-ui/js/freshness.js";

// Inside the edges.map() block, replace the static dur calculation:
const srcNode = nodeMap.get(edge.source);
const freshness = computeFreshness(srcNode?.lastUpdated);
// Fresh = 0.6s (fast), cooling = 1.2s, frozen = 2.5s, stale = 4.0s
const durMap = { fresh: 0.6, cooling: 1.2, frozen: 2.5, stale: 4.0 };
const dur = `${durMap[freshness] ?? 1.5}s`;
```

**Effect:** edges connected to recently-active nodes have visibly faster dash flow,
creating a natural visual hierarchy where attention follows activity. Stale edges
slow to a crawl, reinforcing that the connection is idle without removing it from view.

---

## localStorage Persistence (Rule 38)

Preserve user-selected zoom ring and selected node across page reloads.
Wrap `zoomRing` and `selectedNode` in `localStorage` read/write to maintain
operator state between sessions.

```jsx
// Read initial state from localStorage
const [zoomRing, setZoomRing] = useState(() => {
  const saved = localStorage.getItem("topology-zoom-ring");
  return saved ? parseInt(saved, 10) : 3;
});
const [selectedNode, setSelectedNode] = useState(() => {
  return localStorage.getItem("topology-selected-node") || null;
});

// Persist on change
useEffect(() => {
  localStorage.setItem("topology-zoom-ring", String(zoomRing));
}, [zoomRing]);

useEffect(() => {
  if (selectedNode) {
    localStorage.setItem("topology-selected-node", selectedNode);
  } else {
    localStorage.removeItem("topology-selected-node");
  }
}, [selectedNode]);
```

**Note:** Only persist UI state that the operator would expect to survive a reload.
Transient states like `focusedNode` and `scanning` should reset on mount.

---

## Edge Annotations on Focus

When a node is focused (clicked), show latency or weight labels at the midpoint
of each adjacent edge. This surfaces connection metadata without cluttering the
default view.

```jsx
{
  /* Edge annotations on focus — show latency labels on adjacent edges */
}
{
  focusedNode &&
    edges.map((edge, idx) => {
      if (edge.source !== focusedNode && edge.target !== focusedNode) return null;
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return null;
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      // Prefer latency if available, fall back to weight
      const label = edge.latency ? `${edge.latency}ms` : edge.weight ? `w:${edge.weight}` : null;
      if (!label) return null;
      return (
        <text
          key={`ann${idx}`}
          x={mx}
          y={my - 6}
          text-anchor="middle"
          font-family="var(--font-data)"
          font-size="7"
          fill="var(--sh-phosphor)"
          opacity={0.8}
        >
          {label}
        </text>
      );
    });
}
```

**Data contract:** edges should include optional `latency` (number, ms) and/or `weight`
(number) fields. If neither is present on an edge, no annotation renders.

---

## prefers-reduced-motion Fallbacks

All graph animations must degrade gracefully when `prefers-reduced-motion: reduce` is active.
The SVG `<animate>` and `<animateTransform>` elements do not respect the CSS media query
natively — consumers must check and conditionally render them.

```jsx
// At the top of SystemGraph, before any JSX:
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Then gate every animation on `!reduceMotion`. The static fallbacks:

| Animated Effect                  | Reduced-Motion Fallback                             |
| -------------------------------- | --------------------------------------------------- |
| Heartbeat pulse (3s)             | Static ring at `r + 4`, `opacity: 0.15`             |
| Threat pulse (1.8s)              | Static ring at `r + 8`, `opacity: 0.4`              |
| Selection ring rotation (8s)     | Static dashed ring (no `<animateTransform>`)        |
| Edge flow dash march             | Static dashed stroke (no `<animate>`)               |
| Boot scan (`ShMantra`)           | Instant reveal (skip `scanning` state entirely)     |
| Character reveal (`revealLabel`) | Set text content directly (no animation)            |
| Scramble on status change        | Set text content directly (no animation)            |
| Recovery glitch burst            | Skip `glitchText` call, show toast only             |
| Targeting reticle                | Static crosshair lines (already non-animated)       |
| Freshness-based edge speed       | All edges use uniform `dur="1.5s"` or static dashes |
| Node opacity focus transition    | Instant opacity change (`transition: none`)         |
| `ShToast` slide-in               | Instant appear/disappear                            |

**Implementation:** wrap each `<animate>` / `<animateTransform>` in `{!reduceMotion && ...}`.
For the JS utilities (`revealLabel`, `scrambleLabel`, `glitchText`), pass `{ duration: 0 }`
or skip the call entirely.

---

## Checklist

See `docs/topology-guide.md` for the full checklist. Quick reference:

- [ ] `<defs>` includes `graph-grid` pattern, `graph-glow`, `graph-glow-strong` filters
- [ ] Grid background rect with `opacity=0.25`
- [ ] Running nodes: 3s heartbeat pulse (subtle — `opacity 0.1->0.25`)
- [ ] Failed nodes: 1.8s threat pulse (urgent — `opacity 0.25->0.6`, `r` expands)
- [ ] Edge flow: `stroke-dashoffset` toward target, staggered timing per edge
- [ ] Status dot present on all peripheral nodes
- [ ] `serviceStats` map cross-references live project data
- [ ] `ShFrozen` wraps the graph at the route level (not per-node)
- [ ] Boot scan: `ShMantra` shown for 800ms before graph reveals
- [ ] Character-reveal: `revealLabel` on first load, `scrambleLabel` on status change
- [ ] All node labels in `[BRACKET]` format
- [ ] `[!]` badge rendered on failed nodes (after status dot)
- [ ] ASCII block gauge replaces `running/total svc` text
- [ ] Targeting reticle crosshair lines on selected node
- [ ] Edge annotations (latency/weight) shown on focused node's adjacent edges
- [ ] `prefers-reduced-motion` gates all `<animate>`/`<animateTransform>` elements
