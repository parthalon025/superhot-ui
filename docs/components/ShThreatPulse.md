# ShThreatPulse

**Signal:** immediate threat or critical alert
**Emotional loop:** urgency (demands immediate attention, then subsides)
**Diegetic metaphor:** pulsing red border glow on a threat-detection monitor
**Palette:** `--sh-threat` (border), `--sh-threat-glow` (box-shadow pulse)

## Props

| Prop         | Type    | Default | Description                                                                      |
| ------------ | ------- | ------- | -------------------------------------------------------------------------------- |
| `active`     | boolean | —       | When truthy, applies the threat-pulse effect                                     |
| `persistent` | boolean | `false` | When `true`, pulse loops indefinitely. When `false`, auto-removes after 2 cycles |
| `class`      | string  | —       | Additional CSS class                                                             |
| `children`   | VNode   | —       | Content to wrap                                                                  |

## Usage

```jsx
import { ShThreatPulse } from 'superhot-ui/preact';

// Transient alert — pulses twice then removes itself
<ShThreatPulse active={hasCriticalError}>
  <ShStatCard status="error" label="DLQ" value={dlqCount} />
</ShThreatPulse>

// Persistent threat indicator — pulses until active goes falsy
<ShThreatPulse active persistent>
  <div class="sh-frame">INTRUDER DETECTED</div>
</ShThreatPulse>
```

## Auto-removal behavior

When `persistent` is `false` (default), the component reads `--sh-threat-pulse-duration` from computed styles, waits for `duration * 2 + 100ms` (two full animation cycles plus buffer), then removes `data-sh-effect` from the element. This prevents indefinite pulsing for transient alerts.

When `persistent` is `true`, the `useEffect` cleanup timer is skipped entirely and the pulse continues as long as `active` is truthy.

## Data attributes set

| Condition          | Attribute        | Value            |
| ------------------ | ---------------- | ---------------- |
| `active` is truthy | `data-sh-effect` | `"threat-pulse"` |

## CSS tokens consumed

- `--sh-threat-pulse-duration` (default `1.5s`) — animation duration per cycle
- `--sh-threat` — border color (`2px solid`)
- `--sh-threat-glow` — `drop-shadow` filter in reduced-motion fallback
- Animation: `sh-threat-glow` keyframes, `ease-in-out`, 2 iterations

## Accessibility

- `prefers-reduced-motion: reduce` disables animation; falls back to static `border-color: var(--sh-threat)` with `drop-shadow` glow.
- `forced-colors: active` (Windows High Contrast): uses `Highlight` border color, removes filter.
- Consider pairing with an `aria-live="assertive"` region or `role="alert"` on children for screen reader notification.

## Related components

- **ShGlitch** — visual corruption effect (different threat register: instability vs. alert)
- **ShStatusBadge** — static status indicator (wrap in ShThreatPulse for pulsing badge)
- **ShShatter** — dismissal animation (use after threat is acknowledged)
