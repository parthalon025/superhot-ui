# ShToast

**Signal:** system event occurred
**Emotional loop:** execute → catharsis
**Diegetic metaphor:** piOS terminal output line with timestamp
**Palette:** info=cyan, warn=dim, error=red threat

## Props

| Prop        | Type                    | Default | Description                              |
| ----------- | ----------------------- | ------- | ---------------------------------------- |
| `type`      | 'info'\|'warn'\|'error' | 'info'  | Visual treatment                         |
| `message`   | string                  | —       | Terminal-style message text              |
| `onDismiss` | function                | —       | Called after shatter animation completes |
| `duration`  | number                  | 3000    | Auto-dismiss delay in ms. 0 = persistent |
| `class`     | string                  | —       | Additional CSS class                     |

## Usage

```jsx
import { ShToast } from 'superhot-ui/preact';

<ShToast
  type="error"
  message="[JOB 1234] FAILED — exit code 1"
  duration={0}
  onDismiss={() => removeToast(id)}
/>

<ShToast
  type="info"
  message="[JOB 1235] COMPLETE — 42 tok/min"
  duration={3000}
  onDismiss={() => removeToast(id)}
/>
```

## Behavior

- Enters with `@starting-style` slide-in from bottom-right
- `type="error"` applies `ShThreatPulse persistent` and `duration=0` (never auto-dismisses)
- `type="warn"` applies `data-sh-state="cooling"` treatment
- Auto-dismiss timer starts after entrance animation completes
- Click anywhere on toast dismisses with `shatterElement` → calls `onDismiss`
- Max 4 toasts visible; oldest shatters to make room

## Positioning

ShToast renders into a fixed container (`--z-toast`), bottom-right. The consuming project must render a `<ShToastContainer>` or manage its own toast stack signal.

## CSS tokens consumed

- `--sh-threat` / `--sh-threat-glow` — error type
- `--sh-phosphor` — info type border
- `--status-warning` — warn type
- `--z-toast`, `--space-3`, `--space-4`
- `--bg-surface-raised`, `--border-subtle`
- `--type-label`, `--sh-font`

## Gotchas

- `onDismiss` is called AFTER the shatter animation — remove the toast from your signal inside `onDismiss`, not before
- Do not use for persistent system-state messages — use `ShMantra` instead
- Message text should be terse and terminal-style: `"[JOB 1234] COMPLETE"` not `"Your job has finished"`
