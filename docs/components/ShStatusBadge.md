# ShStatusBadge

**Signal:** entity health state
**Emotional loop:** all nodes (always visible)
**Diegetic metaphor:** terminal status code indicator
**Palette:** maps to `--status-*` tokens

## Props

| Prop     | Type                                                     | Default | Description                                        |
| -------- | -------------------------------------------------------- | ------- | -------------------------------------------------- |
| `status` | 'healthy'\|'error'\|'warning'\|'waiting'\|'active'\|'ok' | —       | Health state (required)                            |
| `label`  | string                                                   | —       | Display text (defaults to status value if omitted) |
| `glow`   | boolean                                                  | true    | Apply `--status-*-glow` drop-shadow                |
| `class`  | string                                                   | —       | Additional CSS class                               |

## Usage

```jsx
import { ShStatusBadge } from 'superhot-ui/preact';

<ShStatusBadge status="healthy" label="online" />
<ShStatusBadge status="error" label="FAILED" />
<ShStatusBadge status="waiting" label="queued" glow={false} />
<ShStatusBadge status="active" />  // label defaults to "active"
```

## Status → Token Mapping

| Status  | Color token        | Glow token              |
| ------- | ------------------ | ----------------------- |
| healthy | `--status-healthy` | `--status-healthy-glow` |
| error   | `--status-error`   | `--status-error-glow`   |
| warning | `--status-warning` | `--status-warning-glow` |
| waiting | `--status-waiting` | `--status-waiting-glow` |
| active  | `--status-active`  | `--status-active-glow`  |
| ok      | `--status-ok`      | `--status-ok-glow`      |

## CSS tokens consumed

- `--status-{status}` — text + border color
- `--status-{status}-glow` — box-shadow when `glow=true`
- `--badge-height`, `--badge-padding` — sizing
- `--type-label`, `--sh-font` — typography
- All radii: `0` (sharp corners)

## Gotchas

- No animation — ShStatusBadge is static. For pulsing threat states, wrap in `ShThreatPulse`.
- `label` text should be lowercase monospace-friendly: `"healthy"` not `"Healthy"`
- Use one ShStatusBadge per entity per state dimension — don't combine multiple states in one badge
