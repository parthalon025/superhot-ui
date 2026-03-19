/** @jsxImportSource preact */

// Layout constants
const NODE_W = 120;
const NODE_H = 40;
const H_GAP = 60;
const V_GAP = 24;

const NODE_W_COMPACT = 120;
const NODE_H_COMPACT = 28;
const V_GAP_COMPACT = 16;

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
}) {
  const nodeH = compact ? NODE_H_COMPACT : NODE_H;
  const vGap = compact ? V_GAP_COMPACT : V_GAP;

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
        <desc>{nodes.map((n) => `${n.label}: ${n.status || "idle"}`).join(", ")}</desc>
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
            return (
              <path
                key={idx}
                class={`sh-pipeline-edge sh-pipeline-edge--${targetStatus}`}
                d={edgePath(sx, sy, tx, ty)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g class="sh-pipeline-nodes">
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const status = node.status || "idle";
            return (
              <g
                key={node.id}
                class={`sh-pipeline-node sh-pipeline-node--${status}`}
                transform={`translate(${pos.x},${pos.y})`}
              >
                <rect width={NODE_W} height={nodeH} rx="2" />
                <text x={NODE_W / 2} y={nodeH / 2} dominant-baseline="middle" text-anchor="middle">
                  {node.label}
                </text>
                {!compact && node.detail && (
                  <text
                    class="sh-pipeline-detail"
                    x={NODE_W / 2}
                    y={nodeH - 6}
                    text-anchor="middle"
                  >
                    {node.detail}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
