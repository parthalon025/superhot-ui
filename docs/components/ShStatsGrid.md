# ShStatsGrid

**Signal:** secondary metric cluster
**Emotional loop:** context (supporting data around a primary KPI)
**Diegetic metaphor:** instrument panel gauge bank
**Palette:** `--text-primary` values, `--text-tertiary` labels, `--text-secondary` units

## Props

| Prop    | Type                         | Default | Description                               |
| ------- | ---------------------------- | ------- | ----------------------------------------- |
| `stats` | Array<{label, value, unit?}> | `[]`    | Array of stat objects to render           |
| `cols`  | number                       | --      | Fixed column count (auto-fill if omitted) |

### Stat object shape

| Field   | Type   | Required | Description                          |
| ------- | ------ | -------- | ------------------------------------ |
| `label` | string | yes      | Uppercase label text                 |
| `value` | \*     | no       | Display value (null renders em-dash) |
| `unit`  | string | no       | Unit suffix after value              |

## Usage

```jsx
import { ShStatsGrid } from 'superhot-ui/preact';

<ShStatsGrid stats={[
  { label: 'ENTITIES', value: 3050 },
  { label: 'UPTIME', value: '99.8', unit: '%' },
  { label: 'LATENCY', value: 42, unit: 'ms' },
  { label: 'QUEUE', value: null },
]} />

// Fixed 2-column layout
<ShStatsGrid cols={2} stats={[
  { label: 'IN', value: 128, unit: 'MB' },
  { label: 'OUT', value: 64, unit: 'MB' },
]} />
```

## CSS tokens consumed

- `--font-mono` -- all text
- `--type-label` -- label font size and unit font size
- `--type-headline` -- value font size
- `--text-primary` -- value color
- `--text-secondary` -- unit color
- `--text-tertiary` -- label color

## Layout

Uses inline CSS grid. When `cols` is omitted, grid uses `repeat(auto-fill, minmax(120px, 1fr))` with `12px` gap. When `cols` is provided, grid uses `repeat(N, 1fr)`.

No `.sh-stats-grid` class is applied -- styling is entirely inline. The component is a pure layout primitive.

## Accessibility

- Labels and values are in separate `<span>` elements -- screen readers announce them sequentially
- No interactive elements -- purely informational
- Text uses semantic color hierarchy (tertiary labels, primary values)

## Related components

- `ShHeroCard` -- primary KPI card that ShStatsGrid often accompanies
- `ShStatCard` -- individual stat card with status coloring and icon support
- `ShDataTable` -- for tabular data that needs sorting/search
