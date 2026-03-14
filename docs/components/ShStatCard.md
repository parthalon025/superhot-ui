# ShStatCard

Decision-driving system metric HUD card.

**Signal:** state of a system metric and whether it needs action
**Emotional loop:** all nodes (persistent dashboard metric)
**Layer:** CSS + Preact

## Props

| Prop     | Type                                                     | Default | Description                       |
| -------- | -------------------------------------------------------- | ------- | --------------------------------- |
| `label`  | string                                                   | —       | Metric name, displayed UPPERCASE  |
| `value`  | string\|number                                           | —       | The reading: "3/12", "paused", 12 |
| `status` | 'healthy'\|'error'\|'warning'\|'waiting'\|'active'\|'ok' | —       | Drives border, glow, pulse        |
| `detail` | string                                                   | —       | Secondary context: "3 failing"    |
| `href`   | string                                                   | —       | Makes card a full-bleed anchor    |

## Usage

```jsx
import { ShStatCard } from 'superhot-ui/preact';

<ShStatCard label="SERVICES" value="3/12" status="error" detail="3 failing" href="/projects" />
<ShStatCard label="QUEUE" value="paused" status="warning" />
<ShStatCard label="PROJECTS" value={12} status="healthy" href="/projects" />
```

## Behavior

- `status="error"` wraps with `ShThreatPulse persistent` — card pulses until resolved
- Border color = `var(--status-{status})` — whole card signals state, not just a badge
- `href` renders full-bleed anchor — entire card is the click target
- `detail` narrows the decision: "3/12" alone is ambiguous; "3/12 · 3 failing" is actionable
