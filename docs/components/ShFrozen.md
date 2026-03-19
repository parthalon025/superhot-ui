# ShFrozen

**Signal:** data staleness / temporal freshness state
**Emotional loop:** trust calibration (visually degrades stale data so users know what to trust)
**Diegetic metaphor:** ice crystallization over aging CRT display data
**Palette:** `--sh-frozen` (desaturated slate for border/text in frozen/stale states)

## Props

| Prop         | Type                                                    | Default                                       | Description                                                                        |
| ------------ | ------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `timestamp`  | `number` \| `Signal<number>`                            | —                                             | Unix epoch ms of last data update. Signal for instant reactivity; number polls 30s |
| `thresholds` | `{ cooling?: number, frozen?: number, stale?: number }` | `{ cooling: 300, frozen: 1800, stale: 3600 }` | Age thresholds in seconds                                                          |
| `class`      | string                                                  | —                                             | Additional CSS class                                                               |
| `children`   | VNode                                                   | —                                             | Content to wrap                                                                    |

## Usage

```jsx
import { ShFrozen } from 'superhot-ui/preact';
import { signal } from '@preact/signals';

const lastUpdated = signal(Date.now());

// Signal-based — reacts instantly when signal updates
<ShFrozen timestamp={lastUpdated}>
  <ShStatCard status="active" label="Queue" value={42} />
</ShFrozen>

// Plain number — polls every 30s
<ShFrozen timestamp={1710720000000}>
  <div class="sh-frame">Last sync: 5 min ago</div>
</ShFrozen>

// Custom thresholds (in seconds)
<ShFrozen timestamp={ts} thresholds={{ cooling: 60, frozen: 300, stale: 600 }}>
  <span>Tighter staleness window</span>
</ShFrozen>
```

## Freshness states

| State     | Age threshold (default) | Visual effect                                                                    |
| --------- | ----------------------- | -------------------------------------------------------------------------------- |
| `fresh`   | < 5 min                 | No filter, full opacity                                                          |
| `cooling` | >= 5 min                | `saturate(0.7)`                                                                  |
| `frozen`  | >= 30 min               | `grayscale(0.8) saturate(0.2)`, opacity 0.6, blur backdrop, `--sh-frozen` border |
| `stale`   | >= 60 min               | `grayscale(1)`, opacity 0.5, `--sh-frozen` border, "STALE" watermark overlay     |

## Reactivity modes

- **Signal (`Signal<number>`):** Detected by checking `typeof timestamp === "object" && "value" in timestamp`. Subscribes via `timestamp.subscribe()` and reapplies freshness instantly on change. No polling overhead.
- **Plain number:** Sets up a `setInterval` that reapplies freshness every 30 seconds. Appropriate for static timestamps that only change with re-renders.

## Data attributes set

| Attribute       | Value                                               | Set by                                    |
| --------------- | --------------------------------------------------- | ----------------------------------------- |
| `data-sh-state` | `"fresh"` \| `"cooling"` \| `"frozen"` \| `"stale"` | `applyFreshness()` from `js/freshness.js` |

## CSS tokens consumed

- `--sh-frozen` — border-color for frozen/stale states
- `--sh-font` — font in the stale watermark `::after`
- `--sh-frost-shimmer-duration` (default `3s`) — registered property for shimmer timing
- Transitions: `filter 1s ease`, `opacity 1s ease` (on `[data-sh-state]`)

## Accessibility

- `prefers-reduced-motion: reduce` disables state transitions (instant change, no animation).
- `prefers-contrast: more` reduces desaturation so frozen/stale content stays readable (e.g., `grayscale(0.4)` instead of `0.8`).
- `forced-colors: active` (Windows High Contrast): frozen/stale borders use `GrayText` system color.
- Small containers (`@container max-width: 320px`): stale watermark `::after` is `display: none`.
- The `stale` watermark is decorative (`pointer-events: none`, `z-index: 1`); it does not block interaction.

## Gotchas

- `stale` state adds `position: relative`, `overflow: hidden`, and `contain: layout style` via CSS for the watermark overlay. Be aware if children need those properties.
- When using a Preact Signal, ensure the signal is stable across renders (defined outside the component or via `useSignal`). A new signal object on each render causes `useEffect` to resubscribe every cycle.
- `null` or `undefined` timestamp results in `"fresh"` state (no degradation).

## Related components

- **ShMantra** — similar watermark overlay mechanic (identity vs. temporal)
- **ShGlitch** — active disruption (frozen is passive degradation)
- **ShStatusBadge** — static health indicator (complementary: badge shows state, frozen shows age)
- **ShStatCard** — common child for freshness wrapping
