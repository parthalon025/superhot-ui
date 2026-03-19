# ShMantra

**Signal:** ambient system identity / branded watermark
**Emotional loop:** immersion (reinforces diegetic atmosphere without demanding attention)
**Diegetic metaphor:** repeating phosphor text burned into a CRT background
**Palette:** `--sh-void` (text), `--sh-phosphor` / `--sh-phosphor-glow` (text-shadow glow)

## Props

| Prop       | Type    | Default | Description                                                     |
| ---------- | ------- | ------- | --------------------------------------------------------------- |
| `text`     | string  | —       | Watermark text (repeated 4x in the `::before` pseudo-element)   |
| `active`   | boolean | —       | When truthy **and** `text` is set, applies the mantra watermark |
| `class`    | string  | —       | Additional CSS class                                            |
| `children` | VNode   | —       | Content to wrap (watermark renders behind children via z-index) |

## Usage

```jsx
import { ShMantra } from 'superhot-ui/preact';

<ShMantra active text="SUPERHOT">
  <div class="sh-frame">
    <p>Content with watermark behind it</p>
  </div>
</ShMantra>

<ShMantra active={isImmersive} text="OVERRIDE">
  <ShStatCard status="active" label="Queue" value={42} />
</ShMantra>
```

## Data attributes set

| Condition                          | Attribute        | Value            |
| ---------------------------------- | ---------------- | ---------------- |
| `active` truthy **and** `text` set | `data-sh-mantra` | The `text` value |

Both `active` and `text` must be truthy for the attribute to be set. If either is falsy, the element renders as a plain `<div>`.

## CSS tokens consumed

- `--sh-font` — watermark font family (terminal stack)
- `--sh-void` — watermark text color (`#000000`)
- `--sh-phosphor` — text-shadow inner glow
- `--sh-phosphor-glow` — text-shadow outer glow
- Watermark is `opacity: 0.06`, `font-size: 2rem`, `font-weight: 900`, `letter-spacing: 0.3em`, rotated `-5deg` and scaled `1.2x`

## Accessibility

- `prefers-reduced-motion: reduce` has no special effect (mantra is non-animated by default).
- Small containers (`@container max-width: 320px`): `::before` is `display: none` (watermark hidden on phone-sized cards).
- The `::before` pseudo-element uses `pointer-events: none` and `z-index: 1` -- it never blocks interaction with children.
- Watermark is purely decorative; no ARIA role needed.

## Gotchas

- Parent element gets `position: relative`, `overflow: hidden`, and `contain: layout style` via CSS -- be aware if your children need overflow or positioning.
- The watermark text is repeated 4x inline via `attr()` -- very long strings may clip or wrap oddly.

## Related components

- **ShGlitch** — active disruption effect (mantra is passive atmosphere)
- **ShFrozen** — another ambient state modifier (temporal vs. identity)
- **ShStatCard** — common child for mantra wrapping
