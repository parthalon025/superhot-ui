# ShStatCard

**Signal:** state of a system metric and whether it needs action
**Emotional loop:** all nodes (persistent dashboard metric)
**Diegetic metaphor:** HUD overlay projected onto the world
**Palette:** maps to `--status-*` tokens + `--sh-threat` on error

## Props

| Prop     | Type                                                     | Default | Description                             |
| -------- | -------------------------------------------------------- | ------- | --------------------------------------- |
| `label`  | string                                                   | —       | Metric name, displayed UPPERCASE        |
| `value`  | string\|number                                           | —       | The reading: `"3/12"`, `"paused"`, `12` |
| `status` | 'healthy'\|'error'\|'warning'\|'waiting'\|'active'\|'ok' | —       | Drives border, glow, and pulse behavior |
| `detail` | string                                                   | —       | Secondary context line: `"3 failing"`   |
| `href`   | string                                                   | —       | Makes the card a full-bleed anchor link |
| `class`  | string                                                   | —       | Additional CSS class                    |

## Usage

```jsx
import { ShStatCard } from 'superhot-ui/preact';

// Basic metric card
<ShStatCard label="PROJECTS" value={12} status="healthy" />

// With detail and link
<ShStatCard label="SERVICES" value="3/12" status="error" detail="3 failing" href="/projects" />

// Queue state
<ShStatCard label="QUEUE" value="STANDBY" status="waiting" detail="idle" />

// Warning with context
<ShStatCard label="QUEUE" value="2" status="warning" detail="1 failed today" href="/queue" />
```

## Behavior by status

| Status  | Border             | Glow                    | Pulse         |
| ------- | ------------------ | ----------------------- | ------------- |
| healthy | `--status-healthy` | `--status-healthy-glow` | none          |
| error   | `--sh-threat`      | `--sh-threat-glow`      | ShThreatPulse |
| warning | `--status-warning` | `--status-warning-glow` | none          |
| waiting | `--status-waiting` | none                    | none          |
| active  | `--status-active`  | `--status-active-glow`  | none          |
| ok      | `--status-ok`      | `--status-ok-glow`      | none          |

When `status="error"`, the card is automatically wrapped in `<ShThreatPulse active persistent>`. No extra wrapping needed.

## CSS tokens consumed

- `--status-{status}` — border color
- `--status-{status}-glow` — box-shadow glow
- `--sh-threat`, `--sh-threat-glow` — error state border + glow
- `--bg-surface` — card background
- `--type-label`, `--type-display`, `--type-small` — typography scale
- `--tracking-widest` — label letter spacing
- `--font-ui`, `--font-data` — label and value font families
- `--space-*` — internal padding

## Gotchas

- `status="error"` automatically activates `ShThreatPulse` — do not wrap manually
- `href` renders an `<a>` element; without `href` renders a `<div>`
- When using with Preact Signals, pass `signal.value` (unwrapped number/string) not the signal object — e.g. `<ShStatCard ... />` fed from `lastUpdated.value`, not `lastUpdated`
- Label text should be UPPERCASE by convention (`"SERVICES"`, `"QUEUE"`)
- Value text should be terse (`"3/12"`, `"STANDBY"`, `"paused"`) — no prose
