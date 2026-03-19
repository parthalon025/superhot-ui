# ShShatter

**Signal:** permanent dismissal / destruction
**Emotional loop:** finality (confirms irreversible removal with dramatic feedback)
**Diegetic metaphor:** glass shattering into triangular fragments that drift and fade
**Palette:** `--sh-glass` (fragment fill, red-tinted crystalline)

## Props

| Prop        | Type         | Default | Description                                               |
| ----------- | ------------ | ------- | --------------------------------------------------------- |
| `onDismiss` | `() => void` | —       | Callback fired after shatter animation completes          |
| `class`     | string       | —       | Additional CSS class                                      |
| `children`  | VNode        | —       | Content to display (hidden during shatter, removed after) |

## Usage

```jsx
import { ShShatter } from "superhot-ui/preact";

<ShShatter onDismiss={() => removeItem(id)}>
  <div class="sh-card">
    <span>Click anywhere to dismiss</span>
  </div>
</ShShatter>;

// In a list
{
  items.map((item) => (
    <ShShatter key={item.id} onDismiss={() => deleteItem(item.id)}>
      <ShStatCard status={item.status} label={item.name} value={item.value} />
    </ShShatter>
  ));
}
```

## Behavior

1. The wrapper `<div>` renders with `data-sh-dismiss=""` and an `onClick` handler.
2. On click, `shatterElement()` from `js/shatter.js` is called:
   - The original element is hidden (`visibility: hidden`)
   - 12 triangular `.sh-fragment` elements are created with random clip-paths
   - Fragments animate outward (drift + rotate + fade) over `--sh-shatter-duration`
   - After animation completes, fragments and the original element are removed from the DOM
   - `onDismiss` callback fires
3. If `ref.current` is null at click time, `onDismiss` fires immediately (no animation).

## Data attributes set

| Attribute         | Value | Notes                                      |
| ----------------- | ----- | ------------------------------------------ |
| `data-sh-dismiss` | `""`  | Always present (empty string, not boolean) |

## CSS tokens consumed

- `--sh-shatter-duration` (default `600ms`) — fragment animation duration
- `--sh-glass` — fragment background color (default: `color-mix(in oklch, var(--sh-threat) 25%, white)`)
- `--sh-frag-x`, `--sh-frag-y`, `--sh-frag-r` — per-fragment drift/rotation (set by JS)
- Animation: `sh-shatter-fragment` keyframes, `ease-out`, `forwards` fill

## Accessibility

- `prefers-reduced-motion: reduce` skips animation; fragments render with `opacity: 0` and cleanup fires immediately.
- Small containers (`@container max-width: 320px`): fragments use simple `opacity` fade instead of drift animation.
- The click handler is on the wrapper `<div>` -- ensure children contain a visible affordance indicating dismissability.
- Consider adding `role="button"` and `aria-label` to the wrapper if the dismissal action is not obvious from content.

## Gotchas

- Parent element needs `position: relative` (or non-static). The JS sets this automatically if parent is `static`.
- Fragments are absolutely positioned -- they can overflow the parent's visible area. Ensure the container does not clip with `overflow: hidden`.
- The element is **removed from the DOM** after shatter, not just hidden. `onDismiss` is the signal to update state.

## Related components

- **ShThreatPulse** — alert before dismissal (use to highlight, then shatter to remove)
- **ShGlitch** — instability indicator (reversible, unlike shatter)
- **ShToast** — transient notification (auto-dismisses, different metaphor)
