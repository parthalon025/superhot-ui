# ShPageBanner

**Signal:** page identity / navigation wayfinding
**Emotional loop:** orientation (where am I in the system)
**Diegetic metaphor:** CRT phosphor pixel-art header with scan beam
**Palette:** `--accent` (namespace pixels), `--text-primary` (page pixels), `--text-tertiary` (separator pixels)

## Props

| Prop        | Type   | Default | Description                                                |
| ----------- | ------ | ------- | ---------------------------------------------------------- |
| `namespace` | string | `""`    | Left word rendered in pixel font (e.g. "ARIA")             |
| `page`      | string | `""`    | Right word rendered in pixel font (e.g. "HOME")            |
| `separator` | string | --      | Separator character (unused in render; cross pattern used) |
| `subtitle`  | string | --      | Optional subtitle text below the banner SVG                |

## Usage

```jsx
import { ShPageBanner } from 'superhot-ui/preact';

<ShPageBanner namespace="ARIA" page="HOME" />

<ShPageBanner namespace="QUEUE" page="DASHBOARD" subtitle="Last sync 2m ago" />

<ShPageBanner namespace="SYSTEM" page="SETTINGS" />
```

## Pixel Font

Text is rendered as a 5-row bitmap font inside an SVG. Each character is a grid of filled rectangles. Supports uppercase A-Z and space. Characters not in the font map are silently skipped.

The separator between namespace and page is always a cross/plus pattern (3x5 grid), regardless of the `separator` prop value.

## CSS tokens/classes consumed

- `.sh-page-banner` -- outer container with CRT effects
- `--bg-terminal` -- banner background
- `--border-subtle` -- border color
- `--accent` -- left border accent + namespace pixel fill + scan beam gradient + glow animation
- `--accent-glow` -- scan beam gradient + glow drop-shadow
- `--text-primary` -- page pixel fill
- `--text-tertiary` -- separator pixel fill
- `--text-secondary` -- subtitle text color
- `--radius` -- border-radius
- `--font-mono` -- subtitle font
- `--type-label` -- subtitle font size
- `--scan-line` -- CRT scanline overlay stripe color

### Animations

- `sh-banner-flicker` -- subtle opacity flicker (4s loop)
- `sh-banner-glow` -- phosphor glow pulse on SVG (4s loop)
- `sh-banner-scan` -- horizontal scan beam sweep (6s loop)

## Accessibility

- SVG has `role="img"` with `aria-label` set to `"{namespace} {page}"` -- screen readers announce the page identity
- Visual-only CRT effects (`::before`, `::after` pseudo-elements) have `pointer-events: none`
- `prefers-reduced-motion: reduce` disables all animations; applies a static drop-shadow instead

## Gotchas

- Only uppercase A-Z and space are supported in the pixel font -- numbers, punctuation, and lowercase are silently dropped
- The `separator` prop is accepted but not used in rendering; the cross pattern is always applied
- The SVG height is fixed at `2rem` with `width: auto` -- it scales horizontally based on text length

## Related components

- **ShHeroCard** -- for prominent content cards below the banner
- **ShCollapsible** -- for expandable sections on the same page
