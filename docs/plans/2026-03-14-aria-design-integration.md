# ARIA Design Integration — superhot-ui Expansion

**Date:** 2026-03-14
**Status:** Approved
**Source:** ARIA dashboard (`ha-aria/aria/dashboard/spa/src/`)
**Goal:** Extract all design patterns from the ARIA dashboard that are not already in superhot-ui and generalize them into first-class superhot-ui components. After this work, ARIA becomes a pure consumer of superhot-ui with no locally-owned design primitives.

---

## Background

ARIA already uses superhot-ui for data freshness (`ShFrozen`) and anomaly effects (glitch, threat pulse, shatter). But ARIA has an additional design layer — structural primitives, animation tiers, navigation, and data display components — that live only in `ha-aria`. This design extracts that layer into superhot-ui so any project can use it.

---

## Architecture

Four phases in dependency order. Each phase is independently releasable.

```
Phase 1: CSS primitives + animations    (no new Preact)
Phase 2: Preact components              (depends on Phase 1)
Phase 3: Navigation shell               (depends on Phase 1 + 2)
Phase 4: Charts + Pipeline              (depends on Phase 1 + 2, adds uPlot peer dep)
```

---

## Token Layer Additions (`css/semantic.css`)

| Token                | Light value                                         | Dark value              | Use                            |
| -------------------- | --------------------------------------------------- | ----------------------- | ------------------------------ |
| `--bg-terminal`      | `oklch(96% 0 0)`                                    | `oklch(8% 0 0)`         | Banner bg, nav bg, CRT texture |
| `--scan-line`        | `rgba(0,0,0,0.03)`                                  | `rgba(0,0,0,0.015)`     | CRT stripe color               |
| `--border-subtle`    | `oklch(88% 0 0)`                                    | `oklch(18% 0 0)`        | Default card borders           |
| `--border-primary`   | `oklch(75% 0 0)`                                    | `oklch(30% 0 0)`        | Hover/active borders           |
| `--accent`           | alias → `--sh-phosphor`                             | alias → `--sh-phosphor` | General accent (cyan)          |
| `--accent-glow`      | phosphor at 25% opacity                             | phosphor at 25% opacity | Glow halos                     |
| `--accent-warm`      | `oklch(72% 0.19 55)`                                | `oklch(72% 0.19 55)`    | Orange — T3 alerts, warnings   |
| `--accent-warm-glow` | warm at 30% opacity                                 | warm at 30% opacity     | T3 pulse glow                  |
| `--radius`           | `4px`                                               | `4px`                   | Frame/nav border radius        |
| `--font-mono`        | `'Perfect DOS VGA 437', 'Cascadia Code', monospace` | same                    | Wider mono stack               |
| `--type-hero`        | `2.5rem`                                            | `2.5rem`                | KPI display values             |
| `--type-headline`    | `1.125rem`                                          | `1.125rem`              | Card headings                  |
| `--type-label`       | `0.6875rem`                                         | `0.6875rem`             | Frame labels, status pills     |
| `--type-micro`       | `0.5rem`                                            | `0.5rem`                | Footer metadata                |

---

## Phase 1: CSS Structural Primitives + Animations

### `css/components/frame.css`

| Class                | Source              | Description                                                                                                                                                                                           |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.sh-frame`          | `.t-frame`          | Card with `data-label` → `::before` header, `data-footer` → `::after` footer. Both monospace uppercase, both hidden when attribute absent. Phone: reduced padding, square corners.                    |
| `.sh-bracket`        | `.t-bracket`        | Inline `[label]` via `::before`/`::after` pseudo-elements. Tertiary bracket color, secondary label color.                                                                                             |
| `.sh-status-pill`    | `.t-status`         | Monospace uppercase pill, surface-raised bg. Modifiers: `.sh-status-pill--healthy`, `--warning`, `--error`, `--waiting`, `--active`. Each sets text color + 3px left border in matching status token. |
| `.sh-cursor-active`  | `.cursor-active`    | `::after` appends `█` (U+2588), 1s step-end blink.                                                                                                                                                    |
| `.sh-cursor-working` | `.cursor-working`   | `::after` appends `▊` (U+258A), 0.5s step-end fast blink.                                                                                                                                             |
| `.sh-cursor-idle`    | `.cursor-idle`      | `::after` appends `_`, 2s step-end slow blink. Hidden on phone.                                                                                                                                       |
| `.sh-terminal-bg`    | `.t-terminal-bg`    | 4px CRT stripe via `repeating-linear-gradient`. Disabled on phone, disabled on non-header tablet.                                                                                                     |
| `.sh-section-header` | `.t-section-header` | Bottom border with `::after` scan-sweep accent animation.                                                                                                                                             |
| `.sh-card`           | `.t-card`           | Base card: surface bg, subtle border, shadow, 0.2s hover lift.                                                                                                                                        |
| `.sh-callout`        | `.t-callout`        | Info box: surface bg, 4px left accent border, subtle shadow.                                                                                                                                          |
| `.sh-clickable`      | `.clickable-data`   | Terminal hover: 2px transparent left border → accent on hover, surface-raised bg on hover.                                                                                                            |

All cursor classes respect `prefers-reduced-motion` (symbol visible, no blink).

### `css/components/banner.css`

`.sh-page-banner` — contains the full page banner experience:

- Background: `--bg-terminal`
- Left border: 3px `--accent`
- Border radius: `--radius`
- `animation: sh-crt-flicker 4s ease-in-out infinite` (opacity 0.97–1.0)
- `::before` — fixed scan-line stripe overlay (pointer-events none, z-index 2)
- `::after` — 8% wide beam sweeps left→right every 6s (`sh-banner-scan`), z-index 3
- `svg` inside — phosphor glow pulse animation (`sh-banner-glow 4s ease-in-out infinite`)
- `p` inside — monospace, letter-spacing 0.02em

Keyframes: `sh-banner-scan`, `sh-banner-glow`, `sh-crt-flicker`.

`prefers-reduced-motion`: flicker off, beam hidden, SVG gets static `drop-shadow` instead.

### `css/components/crt-overlay.css`

`.sh-crt-overlay` — full-page CRT scanline overlay:

- `position: fixed; inset: 0; pointer-events: none; z-index: 9999`
- `repeating-linear-gradient` at 1.5% opacity (4px period)
- Hidden under `prefers-reduced-motion`

### `css/components/animations.css`

**Tier 1 — Ambient** (always-on, decorative, disabled on phone):

| Class                   | Keyframe       | Duration    | Tablet |
| ----------------------- | -------------- | ----------- | ------ |
| `.sh-t1-scan-sweep`     | scan-sweep     | 6s infinite | ✓      |
| `.sh-t1-grid-pulse`     | grid-pulse     | 8s infinite | ✗      |
| `.sh-t1-border-shimmer` | border-shimmer | 3s infinite | ✗      |
| `.sh-t1-data-stream`    | data-stream    | 2s infinite | ✗      |
| `.sh-t1-scan-line`      | scan-line      | 3s infinite | ✓      |
| `.sh-t1-pulse-ring`     | pulse-cyan     | 3s infinite | ✓      |

**Tier 2 — Data Refresh** (one-shot, add/remove class on data update):

| Class               | Keyframe      | Duration                               |
| ------------------- | ------------- | -------------------------------------- |
| `.sh-t2-typewriter` | typewriter-in | 0.3s ease-out                          |
| `.sh-t2-tick-flash` | tick-flash    | 0.4s ease-out                          |
| `.sh-t2-bar-grow`   | bar-grow      | 0.5s ease-out, transform-origin bottom |

**Tier 3 — Status Alert** (strongest attention, auto-expires):

| Class                 | Keyframe     | Duration                                      |
| --------------------- | ------------ | --------------------------------------------- |
| `.sh-t3-orange-pulse` | orange-pulse | 0.6s × 3 iterations                           |
| `.sh-t3-border-alert` | border-alert | 1s forwards (warm → accent → subtle)          |
| `.sh-t3-badge-appear` | badge-appear | 0.4s spring cubic-bezier(0.34, 1.56, 0.64, 1) |
| `.sh-t3-counter-bump` | counter-bump | 0.3s scale 1 → 1.2 → 1                        |

**Utility classes:**

- `.sh-animate-page-enter` — 0.25s fade-up (page transitions)
- `.sh-animate-data-refresh` — 0.3s accent glow flash
- `.sh-stagger-children` — parent class; children get sequential `fade-in-up` delays (10 slots × 0.05s)
- `.sh-delay-{100,200,300,400,500,600,700,800}` — animation-delay utilities

**Responsive rules:**

- Phone: T1 fully disabled
- Tablet: T1 grid-pulse, border-shimmer, data-stream disabled
- `prefers-reduced-motion`: T1 + T2 fully disabled. T3 degrades to static color (no animation, visual state preserved via box-shadow/border-color).

---

## Phase 2: Preact Components

### `preact/ShPageBanner.jsx`

Generalized from `PageBanner.jsx`. Same pixel-font SVG engine (26 uppercase letters, 5-row binary bitmap, 10px unit grid).

**Props:** `namespace` (left word, e.g. `"ARIA"`), `page` (right word, e.g. `"HOME"`), `separator` (default `"✦"`), `subtitle` (optional subtext).

Renders inside `.sh-page-banner`. SVG uses `var(--accent)` for namespace, `var(--text-tertiary)` for separator, `var(--text-primary)` for page name. Subtitle in mono, `var(--text-secondary)`.

### `preact/ShHeroCard.jsx`

Generalized from `HeroCard.jsx`.

**Props:** `value`, `label`, `unit`, `delta`, `warning`, `loading`, `sparkData`, `sparkColor`, `timestamp`, `href`.

- Wraps content in `.sh-frame[data-label={label}]`
- Applies `.sh-cursor-working` when `loading`, `.sh-cursor-active` otherwise
- Sets `data-sh-state` from `timestamp` via `freshness.js` (30s polling interval, clears on unmount)
- Warning state: 3px left border in `--status-warning`, value in `--status-warning`
- Sparkline: renders `<ShTimeChart compact />` in 80×32px box when `sparkData` provided
- `href`: wraps entire card in `<a>` with `.sh-clickable`

### `preact/ShCollapsible.jsx`

Generalized from `CollapsibleSection.jsx`.

**Props:** `title`, `subtitle`, `summary`, `defaultOpen` (default `true`), `loading`, `children`.

Cursor IS the toggle affordance: `sh-cursor-idle` (collapsed), `sh-cursor-active` (expanded), `sh-cursor-working` (loading, toggle disabled). Toggle button: full-width, `aria-expanded`, borderBottom `--border-subtle`. Collapsed + subtitle present: shows `<span class="sh-bracket">` with summary. Content reveal: `.sh-animate-page-enter`.

### `preact/ShErrorState.jsx`

**Props:** `title` (default `"Error"`), `message`, `onRetry`.

Terminal-styled `.sh-frame` with `--sh-threat` colored icon prefix, message in mono, optional retry button. Matches superhot-ui's existing error aesthetic.

### `preact/ShStatsGrid.jsx`

**Props:** `stats[]` → `{ label, value, unit? }`.

CSS grid of labeled monospace values. `--type-label` uppercase labels in `--text-tertiary`, `--type-headline` values in `--text-primary`, `--type-label` units in `--text-secondary`. No charts. Responsive: 2-col phone → 3-col tablet → auto-fill desktop.

### `preact/ShDataTable.jsx`

Generalized from `DataTable.jsx`. Scoped to search + sort (no pagination, no filter slots in v1).

**Props:** `columns[]` → `{ key, label, sortable? }`, `rows[]`, `searchable` (default `true`).

- Search: text input filters all string-valued columns (case-insensitive)
- Sort: click column header toggles asc/desc; active column gets accent underline
- Wraps in `.sh-frame`
- Monospace typography throughout
- Empty state: "NO RESULTS" in `--text-tertiary`

### `preact/ShNav.jsx`

Generalized from `Sidebar.jsx`. No hardcoded branding, no ARIA-specific items.

**Props:** `items[]` → `{ path, label, icon, system? }`, `currentPath`, `logo` (JSX slot), `footer` (JSX slot).

Three internal sub-components rendered based on breakpoint:

**PhoneNav** (`< 640px`): Fixed bottom bar, 56px, `safe-area-inset-bottom`. Primary items (non-system) as tab buttons. "More" button opens slide-up sheet with system items. Sheet closes on navigation. 48×48px touch targets.

**TabletNav** (`640px–1023px`): Fixed left rail, 56px collapsed / 240px expanded. Hamburger toggle. Collapsed: icon-only for primary items. Expanded: labels + system section (collapsible). Overlay closes on navigation or outside click.

**DesktopNav** (`1024px+`): Fixed left sidebar, 240px. Logo slot at top. Primary nav + collapsible System section. Footer slot at bottom. `sh-terminal-bg` on sidebar body. Active item: accent left border + raised bg.

Active state detection: `currentPath` prop, `hashchange` event listener. Active item: 2px accent left border, `--bg-surface-raised`, `--text-primary`.

### `css/components/nav.css`

| Class                   | Description                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `.sh-nav-phone`         | Fixed bottom bar, 56px height, surface bg, subtle top border, safe-area padding     |
| `.sh-nav-rail`          | Fixed left, 56px↔240px, 0.2s width transition, surface bg, subtle right border      |
| `.sh-nav-sidebar`       | Fixed left, 240px, surface bg, subtle right border, `sh-terminal-bg`                |
| `.sh-nav-item`          | Flex row, 8px 12px padding, 2px transparent left border, tertiary text, 0.15s hover |
| `.sh-nav-item--active`  | Accent left border, raised bg, primary text                                         |
| `.sh-nav-item--icon`    | Icon-only variant (56×44px, centered)                                               |
| `.sh-nav-sheet`         | Slide-up overlay: fixed inset, 60vh max, surface bg, top radius 12px, shadow        |
| `.sh-nav-sheet-header`  | Sheet drag handle area: secondary label, close button                               |
| `.sh-nav-content`       | Content area layout helper: `pb-16` phone / `pl-14` tablet / `pl-60` desktop        |
| `.sh-nav-section-label` | 10px uppercase monospace section divider                                            |

---

## Phase 4: Charts + Pipeline

### `package.json` change

Add `uplot >= 1.6.0` to `peerDependencies`. Add `uplot` to `devDependencies`.

### `preact/ShTimeChart.jsx`

Generalized from `TimeChart.jsx`. Fully themed with superhot-ui tokens.

**Props:** `data` (uPlot format: `[timestamps[], ...series[]]`), `series[]` → `{ label, color, width? }`, `height`, `compact` (default `false`).

- Compact: no axes, no grid, no legend, no cursor. Height defaults 32px. `role="img"` + `aria-label` for accessibility.
- Full: axes in `--text-tertiary`, grid in `--border-subtle`, mono font, 8% opacity fill under line.
- CSS variable colors resolved via `getComputedStyle` before uPlot init (uPlot is canvas-based, can't read CSS vars natively).
- ResizeObserver for responsive width. Destroys and recreates on `data`/`series` change. Cleans up on unmount.

### `css/components/chart.css`

uPlot theme overrides: `.u-wrap` no white bg, `.u-legend` monospace, cursor crosshair in `--border-primary`.

### `preact/ShPipeline.jsx`

Generalized from `PipelineSankey.jsx`. No HA-specific topology.

**Props:** `nodes[]` → `{ id, label, status: 'healthy'|'warning'|'error'|'idle', detail? }`, `edges[]` → `{ from, to }`, `onNodeClick`.

SVG-rendered DAG (left-to-right layout). Nodes: rounded rects colored by status token. Edges: `stroke-dasharray` paths; healthy edges get `sh-t1-scan-sweep` flow animation, error edges get static threat red. Click on node calls `onNodeClick(node)`. Responsive via SVG `viewBox` + `width: 100%`.

### `css/components/pipeline.css`

`.sh-pipeline-flow-bar` — container: flex, gap 8px, elevated bg, subtle border, overflow-x auto.
`.sh-pipeline-node` — base node: surface bg, mono label, status border.

---

## File Inventory

### New Files

```
css/components/
  frame.css
  banner.css
  crt-overlay.css
  animations.css
  nav.css
  hero-card.css
  data-table.css
  chart.css
  pipeline.css

preact/
  ShPageBanner.jsx
  ShHeroCard.jsx
  ShCollapsible.jsx
  ShErrorState.jsx
  ShStatsGrid.jsx
  ShDataTable.jsx
  ShNav.jsx
  ShTimeChart.jsx
  ShPipeline.jsx

tests/
  frame.test.js
  banner.test.js
  cursor.test.js
  animations.test.js
  nav.test.js
  hero-card.test.js
  collapsible.test.js
  data-table.test.js
  time-chart.test.js
  pipeline.test.js

docs/components/
  ShFrame.md
  ShPageBanner.md
  ShCursor.md
  ShNav.md
  ShHeroCard.md
  ShTimeChart.md
  ShCollapsible.md
  ShDataTable.md
  ShStatsGrid.md
  ShPipeline.md

docs/animations.md
```

### Modified Files

- `css/semantic.css` — add 14 new tokens
- `css/superhot.css` — import all 9 new component CSS files
- `package.json` — add `uplot` to peerDependencies + devDependencies
- `CLAUDE.md` — update component inventory

**Totals:** 9 CSS + 9 Preact + 10 tests + 11 docs new. Existing 11 Preact → 20 total.

---

## ARIA Migration Path

After each phase ships, ARIA deletes its own copy and imports from superhot-ui:

| Phase | ARIA deletes                                                                                                                                    | ARIA imports                                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1     | T1/T2/T3 classes, cursor classes, `.t-frame`, `.t-bracket`, `.t-status-*`, `.t-terminal-bg`, `.page-banner-sh`, `.crt-overlay` from `index.css` | `sh-t*-*`, `sh-cursor-*`, `sh-frame`, `sh-bracket`, `sh-status-pill`, `sh-terminal-bg`, `sh-page-banner`, `sh-crt-overlay` |
| 2     | `HeroCard.jsx`, `CollapsibleSection.jsx`, `ErrorState.jsx`, `StatsGrid.jsx`                                                                     | `ShHeroCard`, `ShCollapsible`, `ShErrorState`, `ShStatsGrid` from `superhot-ui/preact`                                     |
| 3     | `Sidebar.jsx`                                                                                                                                   | `ShNav` from `superhot-ui/preact`                                                                                          |
| 4     | `TimeChart.jsx`, `PipelineSankey.jsx`                                                                                                           | `ShTimeChart`, `ShPipeline` from `superhot-ui/preact`                                                                      |

**End state:** ARIA's `index.css` shrinks from ~700 lines to ~50 (Tailwind import + expedition33-ui import + minimal project-specific overrides).

---

## Design Principles (Constraints for Implementation)

1. **`sh-*` prefix on all new CSS classes** — consistent with existing superhot-ui convention.
2. **CSS-first where possible** — cursor system, frame, bracket, animation tiers are pure CSS. Preact only when state or lifecycle is needed.
3. **No ARIA-specific logic in superhot-ui** — ShNav has no "OODA" structure, ShPipeline has no HA module topology. Consumers configure via props.
4. **Diegetic design rule preserved** — every new effect must communicate exactly one signal. ShCursor states (active/working/idle) each have one meaning.
5. **All animations respect `prefers-reduced-motion`** — T1+T2 disabled, T3 degrades to static color.
6. **uPlot colors resolved at render time** — `getComputedStyle` before uPlot init; canvas can't read CSS vars natively.
7. **No Tailwind dependency** — superhot-ui must work without Tailwind. All layout uses vanilla CSS.
