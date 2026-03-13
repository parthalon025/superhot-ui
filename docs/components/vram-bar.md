# .sh-vram-bar

**Signal:** memory pressure (0–100%)
**Emotional loop:** tension
**Diegetic metaphor:** VRAM meter filling red as danger approaches
**Layer:** CSS utility only (no JS, no Preact)

## Usage

```html
<!-- HTML -->
<div class="sh-vram-bar" style="--sh-fill: 72">72%</div>
```

```jsx
// Preact with signal
<div
  class="sh-vram-bar"
  style={`--sh-fill: ${vramPct.value}`}
  aria-label={`VRAM: ${vramPct.value}%`}
  role="meter"
  aria-valuenow={vramPct.value}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

## CSS Custom Property

| Property    | Type       | Range | Description                                  |
| ----------- | ---------- | ----- | -------------------------------------------- |
| `--sh-fill` | `<number>` | 0–100 | Fill percentage. Registered via `@property`. |

## Color Interpolation

Uses `@property` registration for `--sh-fill` (type `<number>`, initial `0`). This enables smooth CSS transitions as the value changes.

Color interpolation:

- `--sh-fill: 0` → full `--sh-phosphor` (cyan — healthy)
- `--sh-fill: 50` → midpoint blend
- `--sh-fill: 100` → full `--sh-threat` (red — critical)

Transition: `--sh-fill 1s ease-out` — smooth real-time updates.

## Thresholds (visual only, no JS logic)

The CSS applies visual threshold markers at 80% and 95% via `::after` pseudo-elements. These are static CSS marks — no JavaScript needed.

## Gotchas

- Parent element needs defined width for the bar to render correctly
- `--sh-fill` is a unitless number (0–100), not a percentage string — do NOT pass `"72%"`, pass `72`
- The color interpolation only works because `--sh-fill` is registered with `@property`. Do not rename the property.
- Add `role="meter"` + `aria-valuenow/min/max` for accessibility — the CSS provides no ARIA semantics
