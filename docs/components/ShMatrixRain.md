# ShMatrixRain

**Signal:** system is computing a complex operation
**Emotional loop:** Tension → Pause (processing)
**Diegetic metaphor:** falling terminal characters over busy subsystems
**Palette:** `--sh-phosphor` (lead char: `rgba(0, 212, 255, 0.9)`, trail: `rgba(0, 212, 255, 0.15)`)

## Props

| Prop       | Type                      | Default    | Description                         |
| ---------- | ------------------------- | ---------- | ----------------------------------- |
| `active`   | boolean                   | —          | Start/stop the rain loop (required) |
| `density`  | `'low'\|'medium'\|'high'` | `'medium'` | Column spacing (40px/24px/14px)     |
| `class`    | string                    | —          | Additional CSS class                |
| `children` | preact children           | —          | Content rendered above the canvas   |

## Usage

```jsx
import { ShMatrixRain } from 'superhot-ui/preact';

<ShMatrixRain active={isProcessing} density="medium">
  <ProcessingCard job={currentJob} />
</ShMatrixRain>

<ShMatrixRain active={true} density="high" />
<ShMatrixRain active={false} />  // canvas cleared, rAF stopped
```

## How It Works

- Canvas-based rendering via `requestAnimationFrame` at ~20fps (50ms frame interval)
- `ResizeObserver` keeps canvas dimensions in sync with container
- Each column drops a lead character (bright) followed by a 12-char dim trail
- Columns reset randomly after passing the bottom edge
- When `active` flips to `false`, rAF is cancelled and canvas is cleared

## CSS classes consumed

| Class                    | Purpose                                        | File            |
| ------------------------ | ---------------------------------------------- | --------------- |
| `.sh-matrix-rain`        | Container — relative position, overflow hidden | matrix-rain.css |
| `.sh-matrix-rain-canvas` | Absolute-fill canvas, pointer-events none      | matrix-rain.css |

## Accessibility

- Canvas has `aria-hidden="true"` — purely decorative
- `prefers-reduced-motion: reduce` hides the canvas entirely
- Hardware capability `low` or `minimal` hides the canvas via CSS

## Gotchas

- Parent container must have a defined height — canvas fills its container via `getBoundingClientRect`
- Children render above the canvas (z-index stacking) — ensure child content has sufficient contrast
- Density changes cause a full effect restart (new `useEffect` cycle)
- The canvas is not SSR-compatible — requires DOM
