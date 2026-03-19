# ShHeroCard

**Signal:** KPI metric with data freshness
**Emotional loop:** awareness (always-visible vital sign)
**Diegetic metaphor:** mission-critical readout with temporal decay
**Palette:** `--accent` value, `--status-warning` amber override, `--text-*` hierarchy

## Props

| Prop         | Type    | Default         | Description                                           |
| ------------ | ------- | --------------- | ----------------------------------------------------- |
| `value`      | \*      | em-dash         | Display value (null renders `\u2014`)                 |
| `label`      | string  | --              | Frame header label (required, passed to `data-label`) |
| `unit`       | string  | --              | Unit suffix (e.g. "%", "kW")                          |
| `delta`      | string  | --              | Trend text below value                                |
| `warning`    | boolean | false           | Warning state -- amber value + left border            |
| `loading`    | boolean | false           | Switches cursor from `active` to `working`            |
| `sparkData`  | Array   | --              | uPlot data array for embedded sparkline               |
| `sparkColor` | string  | `var(--accent)` | Sparkline stroke color token                          |
| `timestamp`  | string  | --              | ISO timestamp for freshness polling                   |
| `href`       | string  | --              | Wraps card in `<a>` when provided                     |

## Usage

```jsx
import { ShHeroCard } from 'superhot-ui/preact';

<ShHeroCard value={42} label="QUEUE DEPTH" unit="jobs" />
<ShHeroCard value="98.7" label="UPTIME" unit="%" delta="+0.1% vs 24h" />
<ShHeroCard value={null} label="LATENCY" loading />
<ShHeroCard
  value={3.2}
  label="POWER"
  unit="kW"
  warning
  timestamp="2026-03-18T10:00:00Z"
  sparkData={[[0,1,2,3],[3.1,3.0,3.2,3.2]]}
  sparkColor="var(--status-warning)"
/>
<ShHeroCard value={12} label="ALERTS" href="#/alerts" />
```

## CSS tokens consumed

- `.sh-frame` -- outer container (inherits frame border, label, footer system)
- `.sh-hero-value` -- `--font-mono`, `--type-hero`, `--accent` (or `--status-warning` when warning)
- `.sh-hero-unit` -- `--font-mono`, `--type-headline`, `--text-tertiary`
- `.sh-hero-delta` -- `--type-label`, `--text-secondary`, `--font-mono`
- `--sh-hero-sparkline-width` -- sparkline column width (default `80px`)
- `.sh-cursor-active` / `.sh-cursor-working` -- cursor blink speed
- `.sh-hero-card--warning` -- overrides value color to `--status-warning`
- `.sh-clickable` -- applied to wrapping `<a>` when `href` is set
- `--space-2` -- gap between value and unit
- `data-sh-state` -- freshness attribute set by `computeFreshness()` polling

## Freshness system

When `timestamp` is provided, a callback ref starts a 30-second polling interval that calls `computeFreshness(timestamp)` and sets `data-sh-state` on the frame element. States: `fresh`, `cooling`, `frozen`, `stale`. The interval is stored on the DOM node as `_shFreshnessCleanup` for manual teardown.

## Accessibility

- Frame `data-label` provides visible label context
- When `href` is set, the card is wrapped in `<a>` with `display: block` -- keyboard-focusable and screen-reader-announced as a link
- `loading` state is visual only (cursor blink speed) -- no `aria-busy` attribute is set

## Related components

- `ShTimeChart` -- embedded sparkline (rendered internally via `sparkData`)
- `ShStatsGrid` -- for secondary metrics below a hero card
- `ShStatusBadge` -- pair with hero cards for entity health indicators
- `ShStatCard` -- simpler metric card without freshness or sparkline
