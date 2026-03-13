# ShSkeleton

**Signal:** data loading / not yet materialized
**Emotional loop:** tension → pause
**Diegetic metaphor:** terminal buffer filling line by line
**Palette:** cyan (`--sh-phosphor-glow`) on dark (`--bg-inset`)

## Props

| Prop     | Type   | Default | Description                        |
| -------- | ------ | ------- | ---------------------------------- |
| `rows`   | number | 3       | Number of skeleton lines to render |
| `width`  | string | '100%'  | Container width                    |
| `height` | string | '1em'   | Height of each skeleton line       |
| `class`  | string | —       | Additional CSS class               |

## Usage

```jsx
import { ShSkeleton } from "superhot-ui/preact";

// While loading
{
  isLoading ? <ShSkeleton rows={3} /> : <DataPanel data={data} />;
}

// Custom sizing
<ShSkeleton rows={1} height="2em" width="60%" />;
```

## CSS (class only, no component)

```html
<div class="sh-skeleton" style="height: 1em; width: 100%"></div>
```

## CSS tokens consumed

- `--sh-phosphor-glow` — shimmer color
- `--bg-inset` — background track
- `--sh-frost-shimmer-duration` — animation speed
- `--radius-full` — no, uses `0` (sharp)

## Animation

Phosphor shimmer sweeps left→right. Reads `prefers-reduced-motion` — stops animation, shows static phosphor tint.

## Gotchas

- Parent needs defined width/height for correct rendering
- Multiple `ShSkeleton` rows are individual divs, not a single element with `rows` copies via CSS
- Do not use for progress indication — ShSkeleton only signals "data not arrived yet", not % complete
