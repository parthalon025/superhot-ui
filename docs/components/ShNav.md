# ShNav

**Signal:** application structure and wayfinding
**Emotional loop:** orientation (where am I, where can I go)
**Diegetic metaphor:** terminal session switcher
**Palette:** `--accent` active indicator, `--text-tertiary` inactive, `--bg-surface` chrome

## Props

| Prop          | Type                                | Default | Description                              |
| ------------- | ----------------------------------- | ------- | ---------------------------------------- |
| `items`       | Array<{path, label, icon, system?}> | `[]`    | Navigation items                         |
| `currentPath` | string                              | `"/"`   | Active route path (matched against hash) |
| `logo`        | JSX                                 | --      | Brand/logo slot (tablet rail + desktop)  |
| `footer`      | JSX                                 | --      | Footer slot (all three modes)            |

### Item object shape

| Field    | Type      | Required | Description                                         |
| -------- | --------- | -------- | --------------------------------------------------- |
| `path`   | string    | yes      | Route path (matched against `currentPath`)          |
| `label`  | string    | yes      | Display text                                        |
| `icon`   | Component | yes      | Preact component rendered as `<item.icon />`        |
| `system` | boolean   | no       | If true, item goes in "System" section / More sheet |

## Three responsive modes

| Breakpoint       | Mode    | Layout                                      |
| ---------------- | ------- | ------------------------------------------- |
| `< 640px`        | Phone   | Fixed bottom tab bar (max 4 primary + More) |
| `640px - 1023px` | Tablet  | Collapsible left icon rail (56px / 240px)   |
| `>= 1024px`      | Desktop | Fixed left sidebar (240px)                  |

Breakpoint switching is CSS-only via `.sh-nav-phone-wrapper`, `.sh-nav-rail-wrapper`, `.sh-nav-sidebar-wrapper` visibility classes. All three DOM trees render simultaneously; CSS hides the inactive ones.

## Usage

```jsx
import { ShNav } from "superhot-ui/preact";

function DashIcon() {
  return <svg>...</svg>;
}
function QueueIcon() {
  return <svg>...</svg>;
}
function SettingsIcon() {
  return <svg>...</svg>;
}

<ShNav
  currentPath="/dashboard"
  logo={<span style="font-weight:600">ARIA</span>}
  footer={<span style="font-size:10px">v2.1.0</span>}
  items={[
    { path: "/dashboard", label: "Dashboard", icon: DashIcon },
    { path: "/queue", label: "Queue", icon: QueueIcon },
    { path: "/settings", label: "Settings", icon: SettingsIcon, system: true },
  ]}
/>;
```

## CSS classes consumed

### Navigation shells

- `.sh-nav-phone` -- fixed bottom bar (`--z-dropdown`, `--bg-surface`, `--border-subtle`, `env(safe-area-inset-bottom)`)
- `.sh-nav-rail` -- fixed left rail (56px, transitions to 240px when expanded)
- `.sh-nav-rail--expanded` -- expanded rail state (240px)
- `.sh-nav-sidebar` -- fixed left sidebar (240px)
- `.sh-terminal-bg` -- applied to desktop sidebar

### Items

- `.sh-nav-item` -- base nav link (`--type-label`, `--text-tertiary`, `--radius`, `--duration-fast`)
- `.sh-nav-item:hover` -- `--bg-surface-raised`, `--text-primary`
- `.sh-nav-item--active` -- `--bg-surface-raised`, `--text-primary`, `--accent` left border
- `.sh-nav-item--icon` -- icon-only mode (56x44px, centered)
- `.sh-nav-section-label` -- "System" collapsible section header

### Phone More sheet

- `.sh-nav-sheet` -- overlay container
- `.sh-nav-sheet-backdrop` -- semi-transparent backdrop
- `.sh-nav-sheet-content` -- bottom sheet panel (max 60vh, rounded top corners)
- `.sh-nav-sheet-header` -- sheet title row

### Breakpoint wrappers

- `.sh-nav-phone-wrapper` -- visible `< 640px`
- `.sh-nav-rail-wrapper` -- visible `640px - 1023px`
- `.sh-nav-sidebar-wrapper` -- visible `>= 1024px`

### Content offset helpers

- `.sh-nav-content-phone` -- `padding-bottom: 72px`
- `.sh-nav-content-tablet` -- `padding-left: 56px`
- `.sh-nav-content-desktop` -- `padding-left: 240px`

## Hash routing

ShNav listens for `hashchange` events and strips the `#` prefix to update the active path. Links render as `href="#/path"`. If `currentPath` prop changes externally, internal state syncs via effect.

## Phone behavior

- First 4 non-system items show as bottom tab icons
- System items (and overflow) appear in a "More" bottom sheet
- Active tab gets `--accent` top border
- More button shows `aria-expanded` state

## Tablet behavior

- Collapsed: icon-only rail (56px) with tooltip-style `title` attributes
- Expanded: full labels with "System" collapsible section
- Click hamburger to toggle; click backdrop overlay to collapse
- Expand/collapse button announces state via `aria-expanded`

## Accessibility

- All three modes use `<nav aria-label="Primary navigation">`
- Every link has `aria-label={item.label}`
- System section toggle has `aria-expanded`
- Phone More button has `aria-label="More navigation options"` and `aria-expanded`
- Close buttons have `aria-label="Close"`
- All decorative SVG icons use `aria-hidden="true"`
- Minimum touch target: 48x48px on phone items

## Related components

- `ShCommandPalette` -- keyboard-driven alternative to nav for power users
- `ShPageBanner` -- page-level header that sits inside the nav content area
- `ShHeroCard` -- primary content components that fill the nav content area
