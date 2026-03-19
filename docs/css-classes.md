# CSS Class Reference

Complete reference of all CSS classes and data attributes in superhot-ui.

## Layout Primitives

| Class                | Signal                                                                   | File      |
| -------------------- | ------------------------------------------------------------------------ | --------- |
| `.sh-frame`          | Labeled data container with header/footer via `data-label`/`data-footer` | frame.css |
| `.sh-card`           | Simple card surface (no label system)                                    | frame.css |
| `.sh-callout`        | Info box with accent left border                                         | frame.css |
| `.sh-bracket`        | Wraps content in `[value]` brackets                                      | frame.css |
| `.sh-section-header` | Section header with animated scan-sweep bottom border                    | frame.css |
| `.sh-terminal-bg`    | CRT scan-line background texture                                         | frame.css |
| `.sh-clickable`      | Terminal-style hover affordance (left border + bg shift)                 | frame.css |

## Freshness States

| Attribute                 | Signal                                                 | File         |
| ------------------------- | ------------------------------------------------------ | ------------ |
| `data-sh-state="fresh"`   | Full opacity, no filter                                | superhot.css |
| `data-sh-state="cooling"` | Reduced saturation (0.7)                               | superhot.css |
| `data-sh-state="frozen"`  | Grayscale + blur backdrop, 0.6 opacity, frozen border  | superhot.css |
| `data-sh-state="stale"`   | Full grayscale, 0.5 opacity, "STALE" watermark overlay | superhot.css |

## Effects

| Class / Attribute                 | Signal                                                    | File         |
| --------------------------------- | --------------------------------------------------------- | ------------ |
| `data-sh-effect="glitch"`         | Chromatic aberration jitter (reads `data-sh-glitch-text`) | superhot.css |
| `data-sh-glitch-intensity="high"` | Longer, more iterations                                   | superhot.css |
| `data-sh-glitch-intensity="low"`  | Shorter, single iteration                                 | superhot.css |
| `data-sh-effect="threat-pulse"`   | Red border glow pulse (2 cycles)                          | superhot.css |
| `data-sh-mantra="TEXT"`           | Repeating watermark overlay                               | superhot.css |
| `.sh-fragment`                    | Shatter fragment (JS-created, animates out)               | superhot.css |

## Signal Degradation & Overlays

| Class / Attribute     | Signal                                                                | File                 |
| --------------------- | --------------------------------------------------------------------- | -------------------- |
| `.sh-signal-degraded` | SVG noise overlay + jitter animation for unreliable data sources (T3) | advanced-effects.css |
| `.sh-interlace`       | Repeating scan line overlay for passive monitoring (T1 ambient)       | advanced-effects.css |
| `[data-sh-burn-in]`   | Ghost text pseudo-element for permanent UI landmarks (T1 ambient)     | advanced-effects.css |

## Threshold Bar

| Class / Attribute   | Signal                                                        | File                 |
| ------------------- | ------------------------------------------------------------- | -------------------- |
| `.sh-threshold-bar` | Metric proximity bar (set `--sh-fill: 0-100`) with auto-color | advanced-effects.css |

## Boot Sequence

| Class                     | Signal                                              | File     |
| ------------------------- | --------------------------------------------------- | -------- |
| `.sh-boot-container`      | Mono terminal container for boot line output        | boot.css |
| `.sh-boot-line`           | Individual boot line (hidden by default, opacity 0) | boot.css |
| `.sh-boot-line--visible`  | Typewriter clip-path reveal animation               | boot.css |
| `.sh-boot-line--complete` | Fully revealed line (no animation, solid opacity)   | boot.css |

## Matrix Rain

| Class                    | Signal                                               | File            |
| ------------------------ | ---------------------------------------------------- | --------------- |
| `.sh-matrix-rain`        | Container with relative position and overflow hidden | matrix-rain.css |
| `.sh-matrix-rain-canvas` | Absolute-fill canvas for falling characters          | matrix-rain.css |

## Incident HUD

| Class                        | Signal                                     | File             |
| ---------------------------- | ------------------------------------------ | ---------------- |
| `.sh-incident-hud`           | Fixed top banner for system-wide incidents | incident-hud.css |
| `.sh-incident-hud--warning`  | Amber border + warm background variant     | incident-hud.css |
| `.sh-incident-hud--critical` | Red border + threat-tinted background      | incident-hud.css |

## Hardware Capability

| Attribute                        | Signal                                                    | File                 |
| -------------------------------- | --------------------------------------------------------- | -------------------- |
| `[data-sh-capability="full"]`    | All effects enabled (default, cores > 4)                  | advanced-effects.css |
| `[data-sh-capability="medium"]`  | Standard effects (cores 3-4)                              | advanced-effects.css |
| `[data-sh-capability="low"]`     | T1 animations off, overlays hidden (cores 1-2)            | advanced-effects.css |
| `[data-sh-capability="minimal"]` | All animations + transitions off (prefers-reduced-motion) | advanced-effects.css |

## Glow & Color Tokens

No dedicated glow classes exist. Glow is applied contextually through status variants on components (`.sh-status-badge`, `.sh-stat-card`) and via CSS custom properties (`--sh-threat-glow`, `--sh-phosphor-glow`). Override `--sh-*` tokens to customize.

## Animation Tiers

### Tier 1: Ambient (always-on, lowest energy)

| Class                   | Animation                      | File           |
| ----------------------- | ------------------------------ | -------------- |
| `.sh-t1-scan-sweep`     | Horizontal sweep, 6s loop      | animations.css |
| `.sh-t1-grid-pulse`     | Opacity pulse, 8s loop         | animations.css |
| `.sh-t1-border-shimmer` | Gradient shimmer, 3s loop      | animations.css |
| `.sh-t1-data-stream`    | Vertical drift, 2s loop        | animations.css |
| `.sh-t1-scan-line`      | Vertical scan, 3s loop         | animations.css |
| `.sh-t1-pulse-ring`     | Box-shadow ring pulse, 3s loop | animations.css |

### Tier 2: Data Refresh (one-shot, triggered by data update)

| Class               | Animation                  | File           |
| ------------------- | -------------------------- | -------------- |
| `.sh-t2-typewriter` | Fade-in + slide down, 0.3s | animations.css |
| `.sh-t2-tick-flash` | Background flash, 0.4s     | animations.css |
| `.sh-t2-bar-grow`   | Scale from bottom, 0.5s    | animations.css |

### Tier 3: Status Alert (strongest, auto-expires)

| Class                 | Animation                                          | File           |
| --------------------- | -------------------------------------------------- | -------------- |
| `.sh-t3-orange-pulse` | Orange box-shadow pulse, 3 reps                    | animations.css |
| `.sh-t3-border-alert` | Left border color sweep (warm to accent to subtle) | animations.css |
| `.sh-t3-badge-appear` | Slide-in from right with overshoot                 | animations.css |
| `.sh-t3-counter-bump` | Scale bounce, 0.3s                                 | animations.css |

### Animation Utilities

| Class                                   | Purpose                                    | File           |
| --------------------------------------- | ------------------------------------------ | -------------- |
| `.sh-animate-page-enter`                | Page-level fade-in + slide up              | animations.css |
| `.sh-animate-data-refresh`              | Box-shadow glow flash                      | animations.css |
| `.sh-stagger-children`                  | Staggers child fade-in (up to 10 children) | animations.css |
| `.sh-delay-100` through `.sh-delay-800` | Animation delay utilities (100ms steps)    | animations.css |

## ANSI Text & Colors

### Text Attributes (SGR)

| Class                 | Effect                    | File     |
| --------------------- | ------------------------- | -------- |
| `.sh-ansi-bold`       | Bold weight               | ansi.css |
| `.sh-ansi-dim`        | Tertiary text color       | ansi.css |
| `.sh-ansi-italic`     | Italic style              | ansi.css |
| `.sh-ansi-underline`  | Underline with 2px offset | ansi.css |
| `.sh-ansi-blink`      | 1s step blink             | ansi.css |
| `.sh-ansi-blink-fast` | 0.3s step blink           | ansi.css |
| `.sh-ansi-reverse`    | Inverted fg/bg            | ansi.css |
| `.sh-ansi-hidden`     | Transparent text          | ansi.css |
| `.sh-ansi-strike`     | Strikethrough             | ansi.css |
| `.sh-ansi-reset`      | Clears all SGR attributes | ansi.css |

### Foreground Colors (default superhot palette)

| Class                 | Maps to            | File     |
| --------------------- | ------------------ | -------- |
| `.sh-ansi-fg-black`   | `--sh-void`        | ansi.css |
| `.sh-ansi-fg-red`     | `--sh-threat`      | ansi.css |
| `.sh-ansi-fg-green`   | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-fg-yellow`  | `--status-warning` | ansi.css |
| `.sh-ansi-fg-blue`    | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-fg-magenta` | `--sh-threat`      | ansi.css |
| `.sh-ansi-fg-cyan`    | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-fg-white`   | `--sh-bright`      | ansi.css |

### Background Colors

| Class                 | Maps to            | File     |
| --------------------- | ------------------ | -------- |
| `.sh-ansi-bg-black`   | `--sh-void`        | ansi.css |
| `.sh-ansi-bg-red`     | `--sh-threat`      | ansi.css |
| `.sh-ansi-bg-green`   | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-bg-yellow`  | `--status-warning` | ansi.css |
| `.sh-ansi-bg-blue`    | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-bg-magenta` | `--sh-threat`      | ansi.css |
| `.sh-ansi-bg-cyan`    | `--sh-phosphor`    | ansi.css |
| `.sh-ansi-bg-white`   | `--sh-bright`      | ansi.css |

### Full CGA Mode

Opt-in via `data-sh-ansi-mode="full"` on a parent element. Overrides green, yellow, blue, and magenta to standard CGA hex values for both foreground and background.

## Form Elements

| Class                  | Signal                                           | File          |
| ---------------------- | ------------------------------------------------ | ------------- |
| `.sh-input`            | Terminal text input with phosphor focus glow     | utilities.css |
| `.sh-select`           | Terminal dropdown                                | utilities.css |
| `.sh-toggle`           | Binary ON/OFF switch with `data-sh-on` attribute | utilities.css |
| `.sh-toggle-indicator` | Toggle state display                             | utilities.css |
| `.sh-kbd`              | Keyboard shortcut badge                          | utilities.css |
| `.sh-tabs`             | Tab bar container                                | utilities.css |
| `.sh-tab`              | Individual tab                                   | utilities.css |
| `.sh-tab--active`      | Active tab with phosphor border                  | utilities.css |

## Data Visualization

| Class             | Signal                                | File          |
| ----------------- | ------------------------------------- | ------------- |
| `.sh-delta`       | Trend indicator container             | stat-card.css |
| `.sh-delta--up`   | Positive trend `[+value]` in phosphor | stat-card.css |
| `.sh-delta--down` | Negative trend `[-value]` in threat   | stat-card.css |
| `.sh-delta--flat` | Flat trend `[value]` in tertiary      | stat-card.css |
| `.sh-progress`    | Terminal progress bar `[▓▓▓░░░]`      | utilities.css |
| `.sh-badge-count` | Notification count pill               | utilities.css |

## Utilities

### Opacity (Rule 30)

| Class                    | Value | File          |
| ------------------------ | ----- | ------------- |
| `.sh-opacity-current`    | 1     | utilities.css |
| `.sh-opacity-secondary`  | 0.8   | utilities.css |
| `.sh-opacity-historical` | 0.6   | utilities.css |
| `.sh-opacity-disabled`   | 0.4   | utilities.css |

### Spacing (Rule 33)

| Class             | Gap  | Signal                      | File          |
| ----------------- | ---- | --------------------------- | ------------- |
| `.sh-gap-entity`  | 4px  | Same entity (label + value) | utilities.css |
| `.sh-gap-related` | 8px  | Related items               | utilities.css |
| `.sh-gap-group`   | 16px | Same section                | utilities.css |
| `.sh-gap-section` | 24px | Section boundary            | utilities.css |
| `.sh-gap-panel`   | 32px | Different concerns          | utilities.css |

### Typography

| Class             | Purpose                                            | File          |
| ----------------- | -------------------------------------------------- | ------------- |
| `.sh-label`       | Uppercase mono label, muted color, widest tracking | utilities.css |
| `.sh-value`       | Mono body text, primary color                      | utilities.css |
| `.sh-status-code` | Small mono text, lowercase                         | utilities.css |

### Hover (Rule 21)

| Class                       | Effect                              | File          |
| --------------------------- | ----------------------------------- | ------------- |
| `.sh-hover-reveal`          | Text becomes primary on hover       | utilities.css |
| `.sh-hover-phosphor-border` | Left border turns phosphor on hover | utilities.css |

### Grid (Rule 36)

| Class        | Purpose                                   | File          |
| ------------ | ----------------------------------------- | ------------- |
| `.sh-grid`   | CSS grid container with section-level gap | utilities.css |
| `.sh-grid-2` | 2-column grid                             | utilities.css |
| `.sh-grid-3` | 3-column grid                             | utilities.css |
| `.sh-grid-4` | 4-column grid                             | utilities.css |

### Prompt (terminal prefix)

| Class             | Prefix                 | File          |
| ----------------- | ---------------------- | ------------- |
| `.sh-prompt`      | `$ ` in phosphor color | utilities.css |
| `.sh-prompt-root` | `# ` in threat color   | utilities.css |

### Divider

| Class / Attribute                    | Signal                                           | File          |
| ------------------------------------ | ------------------------------------------------ | ------------- |
| `.sh-divider`                        | Horizontal separator                             | utilities.css |
| `.sh-divider[data-sh-divider-label]` | Separator with centered label via data attribute | utilities.css |

### Feedback & Animation

| Class               | Signal                                    | File           |
| ------------------- | ----------------------------------------- | -------------- |
| `.sh-copied`        | Copy feedback flash (phosphor glow)       | utilities.css  |
| `.sh-loading-dots`  | Animated `...` dots                       | utilities.css  |
| `.sh-void-gradient` | Radial gradient from center to void edges | utilities.css  |
| `.sh-ghost-row`     | Table row deletion fade animation         | data-table.css |

## Status

### Status Badge

| Class / Attribute          | Signal                                       | File             |
| -------------------------- | -------------------------------------------- | ---------------- |
| `.sh-status-badge`         | Inline status indicator with border and glow | status-badge.css |
| `data-sh-status="healthy"` | Green with glow                              | status-badge.css |
| `data-sh-status="ok"`      | Cyan with glow                               | status-badge.css |
| `data-sh-status="active"`  | Cyan with glow                               | status-badge.css |
| `data-sh-status="error"`   | Red with glow                                | status-badge.css |
| `data-sh-status="warning"` | Amber with glow                              | status-badge.css |
| `data-sh-status="waiting"` | Grey, no glow                                | status-badge.css |
| `data-sh-glow="false"`     | Suppresses glow on any status                | status-badge.css |

### Status Pill

| Class                      | Signal                               | File      |
| -------------------------- | ------------------------------------ | --------- |
| `.sh-status-pill`          | Uppercase mono pill with left border | frame.css |
| `.sh-status-pill--healthy` | Green                                | frame.css |
| `.sh-status-pill--warning` | Amber                                | frame.css |
| `.sh-status-pill--error`   | Red                                  | frame.css |
| `.sh-status-pill--waiting` | Grey                                 | frame.css |
| `.sh-status-pill--active`  | Cyan                                 | frame.css |

## Cursor States

| Class                | Symbol                | Blink Rate           | File      |
| -------------------- | --------------------- | -------------------- | --------- |
| `.sh-cursor-active`  | `\u2588` (full block) | 1s                   | frame.css |
| `.sh-cursor-working` | `\u258A` (3/4 block)  | 0.5s                 | frame.css |
| `.sh-cursor-idle`    | `_` (underscore)      | 2s (hidden on phone) | frame.css |

## Dashboard Components

### Page Banner

| Class             | Signal                                               | File       |
| ----------------- | ---------------------------------------------------- | ---------- |
| `.sh-page-banner` | Page header with CRT scan lines, sweep beam, flicker | banner.css |

### Hero Card

| Class                    | Signal                                | File          |
| ------------------------ | ------------------------------------- | ------------- |
| `.sh-hero-value`         | Large KPI metric value (accent color) | hero-card.css |
| `.sh-hero-unit`          | Unit label beside hero value          | hero-card.css |
| `.sh-hero-delta`         | Change indicator below value          | hero-card.css |
| `.sh-hero-card--warning` | Warning variant (value turns amber)   | hero-card.css |

### Stat Card

| Class / Attribute                                | Signal                                         | File          |
| ------------------------------------------------ | ---------------------------------------------- | ------------- |
| `.sh-stat-card`                                  | Metric HUD card with status-driven border/glow | stat-card.css |
| `a.sh-stat-card`                                 | Clickable link variant                         | stat-card.css |
| `data-sh-status="healthy"` / `"ok"` / `"active"` | Green border + glow                            | stat-card.css |
| `data-sh-status="error"`                         | Red border + glow                              | stat-card.css |
| `data-sh-status="warning"`                       | Amber border + glow                            | stat-card.css |
| `data-sh-status="waiting"`                       | Grey border, no glow                           | stat-card.css |
| `.sh-stat-card-label`                            | Uppercase muted label                          | stat-card.css |
| `.sh-stat-card-value`                            | Large display value (tabular nums)             | stat-card.css |
| `.sh-stat-card-detail`                           | Secondary context line                         | stat-card.css |

### Navigation

| Class                     | Signal                                            | File    |
| ------------------------- | ------------------------------------------------- | ------- |
| `.sh-nav-phone`           | Fixed bottom bar (phone)                          | nav.css |
| `.sh-nav-rail`            | Fixed left icon rail (tablet, 56px)               | nav.css |
| `.sh-nav-rail--expanded`  | Expanded rail (240px)                             | nav.css |
| `.sh-nav-sidebar`         | Fixed left sidebar (desktop, 240px)               | nav.css |
| `.sh-nav-item`            | Nav link/button                                   | nav.css |
| `.sh-nav-item--active`    | Active state (accent left border)                 | nav.css |
| `.sh-nav-item--icon`      | Icon-only compact variant                         | nav.css |
| `.sh-nav-section-label`   | Collapsible section heading                       | nav.css |
| `.sh-nav-sheet`           | Full-screen sheet container (phone "more")        | nav.css |
| `.sh-nav-sheet-backdrop`  | Semi-transparent backdrop                         | nav.css |
| `.sh-nav-sheet-content`   | Bottom sheet panel                                | nav.css |
| `.sh-nav-sheet-header`    | Sheet title bar                                   | nav.css |
| `.sh-nav-content-phone`   | Content offset for phone nav (bottom padding)     | nav.css |
| `.sh-nav-content-tablet`  | Content offset for tablet rail (left padding)     | nav.css |
| `.sh-nav-content-desktop` | Content offset for desktop sidebar (left padding) | nav.css |
| `.sh-nav-phone-wrapper`   | Breakpoint wrapper: visible on phone              | nav.css |
| `.sh-nav-rail-wrapper`    | Breakpoint wrapper: visible on tablet             | nav.css |
| `.sh-nav-sidebar-wrapper` | Breakpoint wrapper: visible on desktop            | nav.css |

### Data Table

| Class                         | Signal                                 | File           |
| ----------------------------- | -------------------------------------- | -------------- |
| `.sh-data-table`              | Table container                        | data-table.css |
| `.sh-data-table-search`       | Search input field                     | data-table.css |
| `.sh-data-table-empty`        | Empty state message                    | data-table.css |
| `th[data-sortable="true"]`    | Sortable column header                 | data-table.css |
| `th[data-sort-active="true"]` | Currently sorted column (accent color) | data-table.css |

### Time Chart

| Class                | Signal                       | File      |
| -------------------- | ---------------------------- | --------- |
| `.sh-chart`          | uPlot chart container        | chart.css |
| `.sh-chart--compact` | Sparkline mode (48px height) | chart.css |
| `.sh-chart--empty`   | Empty/loading placeholder    | chart.css |

### Pipeline DAG

| Class                        | Signal                  | File         |
| ---------------------------- | ----------------------- | ------------ |
| `.sh-pipeline`               | Pipeline SVG container  | pipeline.css |
| `.sh-pipeline--compact`      | Hides detail text       | pipeline.css |
| `.sh-pipeline-node`          | Base node (rect + text) | pipeline.css |
| `.sh-pipeline-node--ok`      | OK status node          | pipeline.css |
| `.sh-pipeline-node--warn`    | Warning status node     | pipeline.css |
| `.sh-pipeline-node--error`   | Error status node       | pipeline.css |
| `.sh-pipeline-node--running` | Running node (pulsing)  | pipeline.css |
| `.sh-pipeline-node--idle`    | Idle node (muted)       | pipeline.css |
| `.sh-pipeline-edge`          | Base edge line          | pipeline.css |
| `.sh-pipeline-edge--ok`      | OK status edge          | pipeline.css |
| `.sh-pipeline-edge--warn`    | Warning status edge     | pipeline.css |
| `.sh-pipeline-edge--error`   | Error status edge       | pipeline.css |
| `.sh-pipeline-edge--running` | Running status edge     | pipeline.css |
| `.sh-pipeline-edge--idle`    | Idle status edge        | pipeline.css |
| `.sh-pipeline-detail`        | Detail text on nodes    | pipeline.css |

### VRAM Bar

| Class          | Signal                                         | File         |
| -------------- | ---------------------------------------------- | ------------ |
| `.sh-vram-bar` | Memory pressure meter (set `--sh-fill: 0-100`) | vram-bar.css |

### Skeleton

| Class          | Signal                               | File         |
| -------------- | ------------------------------------ | ------------ |
| `.sh-skeleton` | Phosphor shimmer loading placeholder | skeleton.css |

### Toast

| Class / Attribute            | Signal                          | File      |
| ---------------------------- | ------------------------------- | --------- |
| `.sh-toast-container`        | Fixed bottom-right toast stack  | toast.css |
| `.sh-toast`                  | Individual toast notification   | toast.css |
| `data-sh-toast-type="info"`  | Phosphor left border            | toast.css |
| `data-sh-toast-type="warn"`  | Warning left border + tinted bg | toast.css |
| `data-sh-toast-type="error"` | Threat left border + tinted bg  | toast.css |
| `.sh-toast-time`             | Timestamp prefix                | toast.css |
| `.sh-toast-msg`              | Message body                    | toast.css |

### Command Palette

| Class                                | Signal                         | File                |
| ------------------------------------ | ------------------------------ | ------------------- |
| `.sh-command-palette-overlay`        | Full-screen backdrop with blur | command-palette.css |
| `.sh-command-palette-panel`          | Centered dialog panel          | command-palette.css |
| `.sh-command-palette-input`          | Search/command text input      | command-palette.css |
| `.sh-command-palette-list`           | Scrollable item list           | command-palette.css |
| `.sh-command-palette-item`           | Individual selectable item     | command-palette.css |
| `.sh-command-palette-item--selected` | Keyboard-highlighted item      | command-palette.css |
| `.sh-command-palette-item-label`     | Item primary text              | command-palette.css |
| `.sh-command-palette-item-desc`      | Item description text          | command-palette.css |
| `.sh-command-palette-empty`          | Empty results message          | command-palette.css |

### Modal

| Class                       | Signal                                     | File      |
| --------------------------- | ------------------------------------------ | --------- |
| `.sh-modal-overlay`         | Fixed overlay backdrop (fade-in)           | modal.css |
| `.sh-modal`                 | Dialog panel                               | modal.css |
| `.sh-modal-title`           | Title text (uppercase, wide tracking)      | modal.css |
| `.sh-modal-body`            | Body content                               | modal.css |
| `.sh-modal-actions`         | Button row (flex, right-aligned)           | modal.css |
| `.sh-modal-action`          | Action button (ghost style)                | modal.css |
| `.sh-modal-action--confirm` | Destructive/confirm variant (threat color) | modal.css |

## CRT System

| Class / Attribute        | Signal                                                   | File            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| `.sh-crt`                | CRT wrapper (enables stripe/scanline/flicker via tokens) | superhot.css    |
| `.sh-crt-flicker-on`     | Enables phosphor flicker animation (a11y risk)           | superhot.css    |
| `.sh-crt-overlay`        | Full-page fixed scanline overlay (z-index 9999)          | crt-overlay.css |
| `.sh-crt-toggle`         | CRT hardware controls container                          | crt-toggle.css  |
| `.sh-crt-toggle-row`     | Individual toggle row (checkbox + label)                 | crt-toggle.css  |
| `.sh-crt-toggle-label`   | Toggle label text                                        | crt-toggle.css  |
| `.sh-crt-toggle-warning` | Accessibility warning text (e.g., flicker)               | crt-toggle.css  |

### CRT CSS Custom Properties

| Token               | Default | Signal                                           |
| ------------------- | ------- | ------------------------------------------------ |
| `--sh-crt-stripe`   | `block` | Set to `none` to disable static scanline stripes |
| `--sh-crt-scanline` | `none`  | Set to `block` to enable moving scan beam        |
| `--sh-crt-flicker`  | `none`  | Controlled via `.sh-crt-flicker-on` class        |

## Terminal Chrome

### Phosphor Monitor Variants

| Attribute                 | Effect              | File                |
| ------------------------- | ------------------- | ------------------- |
| `data-sh-monitor="amber"` | Amber phosphor tint | terminal-chrome.css |
| `data-sh-monitor="green"` | Green phosphor tint | terminal-chrome.css |

### Collapsible

| Class / Attribute         | Signal                                       | File                |
| ------------------------- | -------------------------------------------- | ------------------- |
| `.sh-collapsible`         | Collapsible container                        | terminal-chrome.css |
| `.sh-collapsible-summary` | Clickable toggle row with `\u25B8` indicator | terminal-chrome.css |
| `.sh-collapsible-content` | Content area (hidden by default)             | terminal-chrome.css |
| `data-sh-open="true"`     | Shows content, rotates indicator             | terminal-chrome.css |

### Rest-Frame Delays

| Class                         | Token                       | File                |
| ----------------------------- | --------------------------- | ------------------- |
| `.sh-rest-after-shatter`      | `--rest-after-shatter`      | terminal-chrome.css |
| `.sh-rest-after-glitch`       | `--rest-after-glitch`       | terminal-chrome.css |
| `.sh-rest-after-state-change` | `--rest-after-state-change` | terminal-chrome.css |
| `.sh-rest-after-navigation`   | `--rest-after-navigation`   | terminal-chrome.css |

### Log Viewer

| Class                  | Signal                    | File                |
| ---------------------- | ------------------------- | ------------------- |
| `.sh-log`              | Log viewer container      | terminal-chrome.css |
| `.sh-log-timestamp`    | Timestamp in phosphor     | terminal-chrome.css |
| `.sh-log-level--error` | Error level in threat red | terminal-chrome.css |
| `.sh-log-level--warn`  | Warning level in amber    | terminal-chrome.css |
| `.sh-log-level--info`  | Info level in secondary   | terminal-chrome.css |
| `.sh-log-level--debug` | Debug level in tertiary   | terminal-chrome.css |

### Code Block

| Class      | Signal                                      | File                |
| ---------- | ------------------------------------------- | ------------------- |
| `.sh-code` | Code block with phosphor text + left border | terminal-chrome.css |

### Tooltip

| Class / Attribute | Signal                                        | File                |
| ----------------- | --------------------------------------------- | ------------------- |
| `.sh-tooltip`     | Hover tooltip via `data-sh-tooltip` attribute | terminal-chrome.css |

### Breadcrumb

| Class                      | Signal                                  | File                |
| -------------------------- | --------------------------------------- | ------------------- |
| `.sh-breadcrumb`           | Navigation path with `>` separators     | terminal-chrome.css |
| `.sh-breadcrumb-item`      | Individual breadcrumb (last = phosphor) | terminal-chrome.css |
| `.sh-breadcrumb-separator` | Separator element (`>` via `::before`)  | terminal-chrome.css |

### Terminal Grid

| Class               | Purpose                                                   | File                |
| ------------------- | --------------------------------------------------------- | ------------------- |
| `.sh-terminal-grid` | Box-drawing character alignment (mono, no ligatures, pre) | terminal-chrome.css |

## System Corruption

| Class                  | Signal                                                       | File           |
| ---------------------- | ------------------------------------------------------------ | -------------- |
| `.sh-system-corrupted` | piOS system instability — micro-glitches on entire interface | corruption.css |

## Event Timeline

| Class                     | Signal                                          | File               |
| ------------------------- | ----------------------------------------------- | ------------------ |
| `.sh-event-timeline`      | Vertical timeline container with connector line | event-timeline.css |
| `.sh-event-item`          | Individual event entry with dot marker          | event-timeline.css |
| `.sh-event-item--error`   | Error severity (threat red dot)                 | event-timeline.css |
| `.sh-event-item--warning` | Warning severity (amber dot)                    | event-timeline.css |
| `.sh-event-item--success` | Success severity (phosphor dot)                 | event-timeline.css |
| `.sh-event-item-time`     | Timestamp display                               | event-timeline.css |
| `.sh-event-item-label`    | Event name/title                                | event-timeline.css |
| `.sh-event-item-detail`   | Expandable detail text                          | event-timeline.css |

## Progress Steps

| Class                         | Signal                              | File               |
| ----------------------------- | ----------------------------------- | ------------------ |
| `.sh-progress-steps`          | Horizontal step sequence container  | progress-steps.css |
| `.sh-progress-step`           | Individual step (default: pending)  | progress-steps.css |
| `.sh-progress-step-number`    | Circled step number                 | progress-steps.css |
| `.sh-progress-step--complete` | Completed step (phosphor border)    | progress-steps.css |
| `.sh-progress-step--current`  | Current step (phosphor fill + glow) | progress-steps.css |
| `.sh-progress-step--error`    | Failed step (threat fill)           | progress-steps.css |

## Filter Panel

| Class                     | Signal                            | File             |
| ------------------------- | --------------------------------- | ---------------- |
| `.sh-filter-panel`        | Faceted filter sidebar container  | filter-panel.css |
| `.sh-filter-group`        | Filter category group             | filter-panel.css |
| `.sh-filter-group-label`  | Category label (micro, uppercase) | filter-panel.css |
| `.sh-filter-chip`         | Individual filter tag (clickable) | filter-panel.css |
| `.sh-filter-chip--active` | Active filter (phosphor border)   | filter-panel.css |
| `.sh-filter-chip-remove`  | Remove button on active chip      | filter-panel.css |
| `.sh-active-filters`      | Applied filters bar above content | filter-panel.css |

## Signal Bars

| Class             | Signal                             | File            |
| ----------------- | ---------------------------------- | --------------- |
| `.sh-signal-bars` | Signal strength container (5 bars) | signal-bars.css |
| `.sh-signal-bar`  | Individual bar (height varies 1-5) | signal-bars.css |

## Data Attributes Summary

| Attribute                  | Values                                                   | Component                                      |
| -------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `data-sh-state`            | `fresh`, `cooling`, `frozen`, `stale`                    | Freshness system                               |
| `data-sh-effect`           | `glitch`, `threat-pulse`                                 | Effects system                                 |
| `data-sh-glitch-text`      | Any string                                               | Glitch pseudo-element content                  |
| `data-sh-glitch-intensity` | `high`, `low`                                            | Glitch intensity modifier                      |
| `data-sh-mantra`           | Any string                                               | Mantra watermark text                          |
| `data-sh-status`           | `healthy`, `ok`, `active`, `error`, `warning`, `waiting` | Status badge, stat card                        |
| `data-sh-glow`             | `false`                                                  | Suppresses status badge glow                   |
| `data-sh-toast-type`       | `info`, `warn`, `error`                                  | Toast severity                                 |
| `data-sh-monitor`          | `amber`, `green`                                         | Phosphor monitor variant                       |
| `data-sh-ansi-mode`        | `full`                                                   | Full CGA color palette                         |
| `data-sh-open`             | `true`                                                   | Collapsible expanded state                     |
| `data-sh-burn-in`          | Any string                                               | Burn-in ghost text                             |
| `data-sh-capability`       | `full`, `medium`, `low`, `minimal`                       | Hardware tier (CSS response)                   |
| `data-label`               | Any string                                               | Frame header text                              |
| `data-footer`              | Any string                                               | Frame footer text                              |
| `data-sh-on`               | `true`, `false`                                          | Toggle switch state                            |
| `data-sh-tooltip`          | Any string                                               | Tooltip hover text                             |
| `data-sh-divider-label`    | Any string                                               | Divider label text                             |
| `data-sh-timestamp`        | ISO timestamp                                            | watchFreshness target                          |
| `data-sortable`            | `true`                                                   | Data table sortable column                     |
| `data-sort-active`         | `true`                                                   | Data table active sort column                  |
| `data-sh-signal`           | `1`-`5`                                                  | Signal strength level, controls bar fill color |
| `data-sh-escalation`       | `2`-`4`                                                  | Escalation level, controls mantra opacity      |

## Global Styles (unlayered)

| Selector         | Purpose                                                  | File         |
| ---------------- | -------------------------------------------------------- | ------------ |
| `:focus-visible` | 2px threat-red outline (WCAG Rule 22)                    | superhot.css |
| `::selection`    | Reverse-video selection (red-tinted bg)                  | superhot.css |
| `@media print`   | Strips CRT overlays, mantra, stale watermark, animations | superhot.css |
