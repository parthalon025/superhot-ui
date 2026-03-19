# ShGlitch

**Signal:** data corruption or anomaly detected
**Emotional loop:** tension (draws attention to instability)
**Diegetic metaphor:** CRT signal interference / chromatic aberration burst
**Palette:** `--sh-threat` (chromatic overlay color)

## Props

| Prop        | Type                              | Default    | Description                                     |
| ----------- | --------------------------------- | ---------- | ----------------------------------------------- |
| `active`    | boolean                           | —          | When truthy, applies the glitch effect          |
| `intensity` | `'low'` \| `'medium'` \| `'high'` | `'medium'` | Controls animation duration and iteration count |
| `class`     | string                            | —          | Additional CSS class                            |
| `children`  | VNode                             | —          | Content to wrap                                 |

## Usage

```jsx
import { ShGlitch } from 'superhot-ui/preact';

<ShGlitch active intensity="high">
  <span>ANOMALY DETECTED</span>
</ShGlitch>

<ShGlitch active={hasError} intensity="low">
  <span>{errorCount} failures</span>
</ShGlitch>

<ShGlitch active={false}>
  <span>stable — no effect applied</span>
</ShGlitch>
```

## Data attributes set

| Condition                     | Attribute                  | Value               |
| ----------------------------- | -------------------------- | ------------------- |
| `active` is truthy            | `data-sh-effect`           | `"glitch"`          |
| `intensity` is not `"medium"` | `data-sh-glitch-intensity` | `"low"` or `"high"` |

When `active` is falsy, no data attributes are set and the element renders as a plain `<div>`.

## CSS tokens consumed

- `--sh-glitch-duration` (default `300ms`) — base animation duration
  - `low`: `0.5x` duration, 1 iteration
  - `medium`: `1x` duration, 2 iterations
  - `high`: `1.5x` duration, 4 iterations
- `--sh-threat` — chromatic aberration `::before` pseudo-element color
- `--sh-font` — inherited terminal font stack

## Accessibility

- `prefers-reduced-motion: reduce` disables animation; text color falls back to `--sh-threat` (static indicator).
- Tablet (640px-1023px): animation replaced with color-shift transition only.
- `forced-colors: active` (Windows High Contrast): uses `Highlight` system color.
- The `::before` pseudo-element uses `pointer-events: none` so it never intercepts clicks.

## Related components

- **ShThreatPulse** — border-glow alert (complements glitch for threat escalation)
- **ShStatusBadge** — static status indicator (use when animation is not warranted)
- **ShShatter** — destructive dismissal effect (different emotional register: finality vs. instability)
