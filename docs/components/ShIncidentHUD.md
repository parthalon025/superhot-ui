# ShIncidentHUD

**Signal:** active system-wide incident
**Emotional loop:** Tension
**Diegetic metaphor:** emergency broadcast banner across top of screen
**Palette:** warning = `--status-warning` border, critical = `--sh-threat` border

## Props

| Prop            | Type                    | Default     | Description                     |
| --------------- | ----------------------- | ----------- | ------------------------------- |
| `active`        | boolean                 | —           | Show/hide the banner (required) |
| `severity`      | `'warning'\|'critical'` | `'warning'` | Visual severity tier            |
| `message`       | string                  | —           | Incident description text       |
| `timestamp`     | number                  | —           | Epoch ms when incident started  |
| `onAcknowledge` | Function                | —           | Called when ACK button clicked  |
| `class`         | string                  | —           | Additional CSS class            |

## Usage

```jsx
import { ShIncidentHUD } from 'superhot-ui/preact';

<ShIncidentHUD
  active={hasIncident}
  severity="critical"
  message="BACKEND OFFLINE"
  timestamp={incidentStart}
  onAcknowledge={() => ack()}
/>

<ShIncidentHUD
  active={degraded}
  severity="warning"
  message="HIGH LATENCY DETECTED"
/>
```

## Elapsed Time Auto-Format

When `timestamp` is provided, a live counter updates every second:

| Elapsed  | Display  |
| -------- | -------- |
| < 60s    | `42s`    |
| 1–59 min | `3m 22s` |
| 1h+      | `2h 15m` |

## CSS classes consumed

| Class                        | Purpose                        | File             |
| ---------------------------- | ------------------------------ | ---------------- |
| `.sh-incident-hud`           | Fixed top banner, flex layout  | incident-hud.css |
| `.sh-incident-hud--warning`  | Amber border, warm background  | incident-hud.css |
| `.sh-incident-hud--critical` | Red border, threat-tinted bg   | incident-hud.css |
| `.sh-incident-hud-message`   | Uppercase bold message text    | incident-hud.css |
| `.sh-incident-hud-time`      | Muted elapsed time display     | incident-hud.css |
| `.sh-incident-hud-action`    | ACK button (border, mono font) | incident-hud.css |

## Accessibility

- `role="alert"` on the container — screen readers announce immediately
- `aria-live="assertive"` — interrupts current speech
- Slides in from top via `sh-incident-slide-in` animation (200ms)
- `prefers-reduced-motion: reduce` disables slide animation
- `forced-colors: active` uses system Highlight/Canvas/CanvasText

## Gotchas

- Returns `null` when `active` is false — no DOM footprint when inactive
- Fixed positioning (`position: fixed; top: 0`) — pushes nothing; consuming app must add top padding/margin if needed
- ACK button only renders when `onAcknowledge` is provided
- Elapsed time only renders when `timestamp` is provided
- Uses `z-index: var(--z-toast)` — same layer as toast notifications
