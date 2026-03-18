/** @jsxImportSource preact */

// Layout constants
const NODE_W = 120;
const NODE_H = 40;
const H_GAP = 60;
const V_GAP = 24;

const NODE_W_COMPACT = 120;
const NODE_H_COMPACT = 28;
const V_GAP_COMPACT = 16;

/** ASCII health gauge: '███░░' from running/total ratio */
function healthGauge(running, total, width = 5) {
  if (!total) return "";
  const filled = Math.round((running / total) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
}

/** Role glyph: single char representing node status */
function roleGlyph(status) {
  if (status === "running" || status === "ok") return "\u25B8";
  return "\u25AA";
}

/** True if prefers-reduced-motion is active */
function isReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Kahn's algorithm — assign a level (column index) to each node.
 * Returns a map of { nodeId -> level }.
 */
function computeLevels(nodes, edges) {
  const inDegree = {};
  const children = {};
  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    children[node.id] = [];
  });
  edges.forEach((edge) => {
    if (inDegree[edge.to] !== undefined) inDegree[edge.to]++;
    if (children[edge.from] !== undefined) children[edge.from].push(edge.to);
  });

  const queue = nodes.filter((node) => inDegree[node.id] === 0).map((node) => node.id);
  const levels = {};
  let level = 0;

  while (queue.length) {
    const next = [];
    queue.forEach((id) => {
      levels[id] = level;
      (children[id] || []).forEach((childId) => {
        inDegree[childId]--;
        if (inDegree[childId] === 0) next.push(childId);
      });
    });
    queue.length = 0;
    queue.push(...next);
    if (next.length) level++;
  }

  // Assign cycle nodes (never dequeued) to a separate column
  const maxLevel = level;
  nodes.forEach((node) => {
    if (levels[node.id] === undefined) levels[node.id] = maxLevel + 1;
  });

  return levels;
}

/**
 * SVG cubic bezier path from right-center of source to left-center of target.
 */
function edgePath(sx, sy, tx, ty) {
  const cx = (sx + tx) / 2;
  return `M${sx},${sy} C${cx},${sy} ${cx},${ty} ${tx},${ty}`;
}

export function ShPipeline({
  nodes = [],
  edges = [],
  compact = false,
  className = "",
  ariaLabel = "Pipeline diagram",
  selectedId = null,
}) {
  const nodeH = compact ? NODE_H_COMPACT : NODE_H;
  const vGap = compact ? V_GAP_COMPACT : V_GAP;
  const reducedMotion = isReducedMotion();

  // Build level map and group by level
  const levels = computeLevels(nodes, edges);
  const byLevel = {};
  nodes.forEach((node) => {
    const lvl = levels[node.id] ?? 0;
    if (!byLevel[lvl]) byLevel[lvl] = [];
    byLevel[lvl].push(node.id);
  });

  const levelCount = Object.keys(byLevel).length;
  const maxNodesInLevel = Math.max(1, ...Object.values(byLevel).map((arr) => arr.length));

  const totalW = levelCount * (NODE_W + H_GAP) - H_GAP + 16;
  const totalH = maxNodesInLevel * (nodeH + vGap) - vGap + 16;

  // Compute x/y positions for each node
  const positions = {};
  Object.entries(byLevel).forEach(([lvl, ids]) => {
    const lvlNum = parseInt(lvl, 10);
    const x = lvlNum * (NODE_W + H_GAP) + 8;
    const colHeight = ids.length * (nodeH + vGap) - vGap;
    const offset = (totalH - colHeight) / 2;
    ids.forEach((id, idx) => {
      positions[id] = {
        x,
        y: offset + idx * (nodeH + vGap),
      };
    });
  });

  // Build a lookup from node id → status for edge coloring
  const statusById = {};
  nodes.forEach((node) => {
    statusById[node.id] = node.status || "idle";
  });

  const compactClass = compact ? " sh-pipeline--compact" : "";
  const extraClass = className ? ` ${className}` : "";

  const svgWidth = nodes.length === 0 ? 16 : totalW;
  const svgHeight = nodes.length === 0 ? 16 : totalH;

  return (
    <div class={`sh-pipeline${compactClass}${extraClass}`}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        role="img"
        aria-label={ariaLabel}
      >
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
          <pattern
            id="sh-pipeline-dither-frozen"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="var(--bg-surface)" />
            <text
              x="0"
              y="7"
              font-size="8"
              font-family="monospace"
              fill="var(--sh-phosphor)"
              opacity="0.12"
            >
              {"\u2591"}
            </text>
          </pattern>

          {/* Dither pattern — heavy (failed nodes) */}
          <pattern
            id="sh-pipeline-dither-failed"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="var(--bg-surface)" />
            <text
              x="0"
              y="7"
              font-size="8"
              font-family="monospace"
              fill="var(--sh-threat)"
              opacity="0.18"
            >
              {"\u2592"}
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

          {/* Dot-matrix background — terminal character-cell feel */}
          <pattern id="sh-pipeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.5" fill="var(--border-subtle)" />
            <circle cx="40" cy="0" r="0.5" fill="var(--border-subtle)" />
            <circle cx="0" cy="40" r="0.5" fill="var(--border-subtle)" />
            <circle cx="40" cy="40" r="0.5" fill="var(--border-subtle)" />
            <circle cx="20" cy="20" r="0.5" fill="var(--border-subtle)" />
          </pattern>
        </defs>

        {/* Dot-matrix background */}
        <rect width={svgWidth} height={svgHeight} fill="url(#sh-pipeline-grid)" opacity="0.3" />

        {/* Edges rendered first (behind nodes) */}
        <g class="sh-pipeline-edges">
          {edges.map((edge, idx) => {
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
                {!reducedMotion && !failed && (
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
          })}
        </g>

        {/* Nodes */}
        <g class="sh-pipeline-nodes">
          {nodes.map((node) => {
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
              node.running != null && node.total != null
                ? healthGauge(node.running, node.total)
                : null;

            return (
              <g
                key={node.id}
                class={`sh-pipeline-node sh-pipeline-node--${status}`}
                transform={`translate(${pos.x},${pos.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${node.label} \u2014 ${status}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
                }}
              >
                {/* Healthy heartbeat ring — running nodes only */}
                {isRunning && !reducedMotion && (
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
                {isFailed && !reducedMotion && (
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
          })}
        </g>

        {/* Targeting reticle — orthogonal lines from selected node center */}
        {selectedId &&
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
          })()}
      </svg>
    </div>
  );
}
