# ShCollapsible

**Signal:** section can be expanded or collapsed
**Emotional loop:** plan -> focus (reveal on demand)
**Diegetic metaphor:** cursor-as-toggle terminal section
**Palette:** cursor state classes (`sh-cursor-active`, `sh-cursor-working`, `sh-cursor-idle`)

## Props

| Prop          | Type                     | Default | Description                                |
| ------------- | ------------------------ | ------- | ------------------------------------------ |
| `title`       | string                   | --      | Section heading text (required)            |
| `defaultOpen` | boolean                  | `true`  | Initial open state                         |
| `loading`     | boolean                  | `false` | Disables toggle, shows working cursor      |
| `summary`     | string                   | --      | Shown in `.sh-bracket` when collapsed      |
| `subtitle`    | string                   | --      | Shown below title when expanded            |
| `children`    | preact.ComponentChildren | --      | Content rendered inside body when expanded |
| `class`       | string                   | --      | Additional CSS class                       |

## Usage

```jsx
import { ShCollapsible } from 'superhot-ui/preact';

<ShCollapsible title="SYSTEM STATUS">
  <p>All services nominal.</p>
</ShCollapsible>

<ShCollapsible title="QUEUE" defaultOpen={false} summary="12 pending">
  <ul>...</ul>
</ShCollapsible>

<ShCollapsible title="LOADING DIAGNOSTICS" loading={true}>
  <p>Will render once loading completes.</p>
</ShCollapsible>

<ShCollapsible title="DETAILS" subtitle="Last updated 30s ago">
  <p>Expanded view with subtitle.</p>
</ShCollapsible>
```

## CSS tokens/classes consumed

- `.sh-collapsible` -- container, `overflow: hidden`
- `.sh-collapsible-toggle` -- `<button>` element for the header
- `.sh-collapsible-title` -- title `<span>` inside the toggle
- `.sh-collapsible-subtitle` -- subtitle `<div>` shown when expanded
- `.sh-collapsible-body` -- content wrapper `<div>` shown when expanded
- `.sh-bracket` -- summary text shown when collapsed
- `.sh-cursor-active` -- applied when open
- `.sh-cursor-working` -- applied when loading (toggle disabled)
- `.sh-cursor-idle` -- applied when closed
- `data-sh-open="true|false"` -- data attribute reflecting open state
- `--space-2`, `--font-mono`, `--type-label`, `--tracking-wide`, `--text-secondary` -- typography and spacing via CSS collapsible rules
- `--duration-fast`, `--ease-default` -- transition timing for the chevron indicator

## Accessibility

- Toggle is a native `<button>` with `type="button"` -- keyboard-accessible by default
- `aria-expanded` reflects the current open/closed state
- `disabled` attribute set when `loading=true` -- prevents interaction during loading
- Content is conditionally rendered (not hidden via CSS), so screen readers only see it when open

## Related components

- **ShSkeleton** -- use inside the body for loading placeholders
- **ShStatCard** -- common child content within a collapsible section
- **ShStatsGrid** -- group multiple stat cards inside a collapsible body
