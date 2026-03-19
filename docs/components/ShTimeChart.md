# ShTimeChart

**Signal:** temporal data progression
**Emotional loop:** monitor -> interpret (observe trends over time)
**Diegetic metaphor:** threat-red oscilloscope trace on void surface
**Palette:** `--accent` (default line color), `--text-tertiary` (axes, grid, legend)

## Props

| Prop        | Type          | Default           | Description                                        |
| ----------- | ------------- | ----------------- | -------------------------------------------------- |
| `data`      | Array<{t, v}> | `null`            | Array of `{t: unixSeconds, v: number}` objects     |
| `compact`   | boolean       | `false`           | Compact mode -- 48px height, no axes/legend/cursor |
| `color`     | string        | `"var(--accent)"` | CSS color or `var()` reference for the line        |
| `label`     | string        | `""`              | Series label (shown in legend)                     |
| `height`    | number        | --                | Override chart height in pixels                    |
| `className` | string        | `""`              | Additional CSS class                               |

## Usage

```jsx
import { ShTimeChart } from 'superhot-ui/preact';

const data = [
  { t: 1710700000, v: 42 },
  { t: 1710700060, v: 55 },
  { t: 1710700120, v: 38 },
];

<ShTimeChart data={data} label="CPU %" />

<ShTimeChart data={data} compact={true} />

<ShTimeChart data={data} color="var(--status-error)" label="Errors" height={200} />

<ShTimeChart data={null} />  // renders empty state: "—"
```

## CSS tokens/classes consumed

- `.sh-chart` -- container (`width: 100%`, `height: var(--sh-chart-height, 120px)`)
- `.sh-chart--compact` -- compact variant (`--sh-chart-height: 48px`)
- `.sh-chart--empty` -- empty state (centered em-dash placeholder)
- `--sh-chart-height` -- overridable chart height custom property
- `--sh-chart-marker-size`, `--sh-chart-marker-h` -- legend color swatch dimensions
- `--sh-chart-cursor-pt` -- cursor crosshair dot size
- `--font-mono` -- typography for axes, legend, empty state
- `--type-small` -- axis label and empty state font size
- `--type-nano` -- legend font size
- `--text-tertiary` -- axis text, legend text, grid lines, empty state text
- `--border-subtle` -- axis tick marks
- `--accent` -- default stroke color, cursor crosshair lines
- `--tracking-wide` -- legend letter spacing
- `--space-1`, `--space-2` -- legend padding and spacing

## uPlot Integration

ShTimeChart wraps [uPlot](https://github.com/leeoniya/uPlot) for high-performance time-series rendering. Key behaviors:

- **CSS custom properties are resolved** at mount time via `getComputedStyle` -- `var()` color references work correctly
- **ResizeObserver** re-fits the chart when the container resizes
- **Callback ref** (not `useRef`) initializes uPlot -- safe to call as a plain function in tests without a render cycle
- **Cleanup** runs on unmount: ResizeObserver disconnected, uPlot instance destroyed
- **Node/JSDOM fallback**: if `uPlot` or `window` is unavailable, the chart silently skips initialization

## Accessibility

- Container has `aria-label` set to the `label` prop value, or `"time series chart"` if label is empty
- Empty state is marked `aria-hidden="true"` (decorative em-dash)
- `prefers-reduced-motion: reduce` disables cursor transition animations

## Gotchas

- `uPlot` must be available as a peer dependency (`require("uplot")`) -- not bundled
- `data` must be an array of `{t, v}` objects where `t` is Unix seconds (not milliseconds)
- Null, undefined, or empty `data` renders the empty state -- no error thrown
- Color resolution happens once at mount; changing `color` prop after mount requires remounting the component
- The chart container must have nonzero dimensions at mount time for correct sizing

## Related components

- **ShStatCard** -- for single-value summaries alongside a chart
- **ShPipeline** -- for process flow visualization (complementary to time-series)
- **ShCollapsible** -- wrap a chart in a collapsible section for progressive disclosure
