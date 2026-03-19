# ShPipeline

**Signal:** directed process flow with per-node status
**Emotional loop:** plan -> action (visualize system pipeline stages)
**Diegetic metaphor:** DAG wiring diagram with status-colored nodes and edges
**Palette:** maps to `--status-*` and `--accent` tokens per node status

## Props

| Prop        | Type        | Default              | Description                                      |
| ----------- | ----------- | -------------------- | ------------------------------------------------ |
| `nodes`     | Array<Node> | `[]`                 | Pipeline nodes (see Node shape below)            |
| `edges`     | Array<Edge> | `[]`                 | Directed edges between nodes (see Edge shape)    |
| `compact`   | boolean     | `false`              | Compact mode -- shorter nodes, hides detail text |
| `className` | string      | `""`                 | Additional CSS class                             |
| `ariaLabel` | string      | `"Pipeline diagram"` | Accessible label for the SVG                     |

### Node shape

| Field    | Type   | Required | Description                                         |
| -------- | ------ | -------- | --------------------------------------------------- |
| `id`     | string | yes      | Unique identifier                                   |
| `label`  | string | yes      | Display text inside the node                        |
| `status` | string | no       | One of: `ok`, `warn`, `error`, `running`, `idle`    |
| `detail` | string | no       | Secondary text below label (hidden in compact mode) |

### Edge shape

| Field  | Type   | Required | Description    |
| ------ | ------ | -------- | -------------- |
| `from` | string | yes      | Source node ID |
| `to`   | string | yes      | Target node ID |

## Usage

```jsx
import { ShPipeline } from 'superhot-ui/preact';

const nodes = [
  { id: 'fetch', label: 'FETCH', status: 'ok' },
  { id: 'parse', label: 'PARSE', status: 'running', detail: '12/50' },
  { id: 'store', label: 'STORE', status: 'idle' },
];

const edges = [
  { from: 'fetch', to: 'parse' },
  { from: 'parse', to: 'store' },
];

<ShPipeline nodes={nodes} edges={edges} />

<ShPipeline nodes={nodes} edges={edges} compact={true} />
```

## Layout Algorithm

Uses Kahn's topological sort to assign each node a column (level). Nodes at the same level are stacked vertically, centered in the available height. Edges are drawn as SVG cubic bezier curves from the right edge of the source node to the left edge of the target node.

Layout constants:

- Node: 120x40px (compact: 120x28px)
- Horizontal gap: 60px
- Vertical gap: 24px (compact: 16px)

Cycle-safe: nodes unreachable by Kahn's algorithm are placed in a final column.

## Status -> Token Mapping

| Status    | Node stroke        | Node text fill     | Edge stroke        | Animation                  |
| --------- | ------------------ | ------------------ | ------------------ | -------------------------- |
| `ok`      | `--status-ok`      | `--status-ok`      | `--status-ok`      | none                       |
| `warn`    | `--status-warning` | `--status-warning` | `--status-warning` | none                       |
| `error`   | `--status-error`   | `--status-error`   | `--status-error`   | none                       |
| `running` | `--accent`         | `--accent`         | `--accent`         | `sh-pipeline-pulse` (1.5s) |
| `idle`    | `--border-subtle`  | `--text-tertiary`  | `--border-subtle`  | none                       |

## CSS tokens/classes consumed

- `.sh-pipeline` -- outer container (`overflow: auto`)
- `.sh-pipeline--compact` -- compact variant (hides detail text)
- `.sh-pipeline-node` -- node `<g>` element
- `.sh-pipeline-node--{status}` -- status variant classes
- `.sh-pipeline-edge` -- edge `<path>` element (`fill: none`)
- `.sh-pipeline-edge--{status}` -- edge status variant classes
- `.sh-pipeline-detail` -- detail text element
- `--bg-surface` -- node rect fill
- `--border-subtle` -- default node stroke and edge stroke
- `--text-primary` -- default node text fill
- `--font-mono` -- node text font
- `--type-small` -- node text and detail text font size
- `--text-tertiary` -- detail text fill, idle node text fill

## Accessibility

- SVG has `role="img"` with configurable `aria-label` (defaults to "Pipeline diagram")
- Node labels are rendered as SVG `<text>` elements -- accessible to screen readers that parse SVG text
- Edge relationships are visual-only; for complex pipelines, consider supplementing with a text description

## Gotchas

- Edges reference node IDs via `from`/`to` -- mismatched IDs produce no edge (silent skip)
- Empty `nodes` array renders a 16x16 empty SVG
- Node status defaults to `"idle"` if omitted
- Edge color is determined by the _target_ node's status, not the source

## Related components

- **ShStatusBadge** -- for inline status indicators alongside pipeline context
- **ShTimeChart** -- for time-series data associated with pipeline stages
- **ShStatCard** -- for aggregate metrics about pipeline throughput
