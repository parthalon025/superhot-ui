# superhot-ui

SUPERHOT-inspired visual effects package for dashboards. CSS-first with optional JS utilities and Preact components.

**Repo:** https://github.com/parthalon025/superhot-ui (public)
**npm:** `npm install superhot-ui` — published as `superhot-ui@0.3.0`

## Architecture

Three layers (each optional):

1. **CSS** (`css/superhot.css`) — Pure CSS via `data-sh-*` attribute selectors. Works with any framework or none.
2. **JS** (`js/`) — Vanilla ESM utilities that set those attributes. No framework dependency.
3. **Preact** (`preact/`) — Thin component wrappers for Preact dashboards (ARIA, project-hub).

## Quick Start

Install from npm: `npm install superhot-ui`

Or link the CSS directly: `<link rel="stylesheet" href="../superhot-ui/css/superhot.css">`

## Consumers

- `ollama-queue/` — orchestration, escalation, HostCard Now page
- `project-hub/` — unified project status dashboard
- `lessons-db/` — spaced-repetition lessons SPA (`/ui/`)
- `framecast/` — phone upload UI + kiosk slideshow (green phosphor monitor variant)

## Build

- `npm run build` — Produces dist/superhot.css, dist/superhot.js, dist/superhot.preact.js
- `npm run dev` — Watch mode with sourcemaps
- `npm test` — Run unit tests (node --test)
- `node --test tests/freshness.test.js` — Single test file

## Effects Reference

| Effect             | CSS Attribute                                                   | JS Function                              | Preact Component     |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------- | -------------------- |
| Freshness          | `data-sh-state="fresh\|cooling\|frozen\|stale"`                 | `applyFreshness(el, timestamp)`          | `<ShFrozen>`         |
| Shatter            | `.sh-fragment` (JS-created)                                     | `shatterElement(el, opts)`               | `<ShShatter>`        |
| Glitch             | `data-sh-effect="glitch"`                                       | `glitchText(el, opts)`                   | `<ShGlitch>`         |
| Mantra             | `data-sh-mantra="TEXT"`                                         | `applyMantra(el, text)`                  | `<ShMantra>`         |
| Threat Pulse       | `data-sh-effect="threat-pulse"`                                 | —                                        | `<ShThreatPulse>`    |
| CRT Toggle         | —                                                               | `setCrtMode({stripe,scanline,flicker})`  | `<ShCrtToggle>`      |
| Skeleton           | `.sh-skeleton`                                                  | —                                        | `<ShSkeleton>`       |
| Toast              | `.sh-toast` + `data-sh-toast-type`                              | —                                        | `<ShToast>`          |
| Stat Card          | `.sh-stat-card` + `data-sh-status`                              | —                                        | `<ShStatCard>`       |
| Status Badge       | `.sh-status-badge` + `data-sh-status`                           | —                                        | `<ShStatusBadge>`    |
| VRAM Bar           | `.sh-vram-bar` + `--sh-fill: <0-100>`                           | —                                        | —                    |
| Command Palette    | `.sh-command-palette-overlay`                                   | —                                        | `<ShCommandPalette>` |
| Audio              | —                                                               | `playSfx('complete\|error\|dlq\|pause')` | —                    |
| Page Banner        | `.sh-page-banner`                                               | —                                        | `<ShPageBanner>`     |
| Hero Card          | `.sh-hero-card`, `.sh-frame`                                    | —                                        | `<ShHeroCard>`       |
| Collapsible        | `.sh-frame` (section)                                           | —                                        | `<ShCollapsible>`    |
| Error State        | `.sh-frame` (role=alert)                                        | —                                        | `<ShErrorState>`     |
| Stats Grid         | `.sh-stats-grid`                                                | —                                        | `<ShStatsGrid>`      |
| Data Table         | `.sh-data-table`                                                | —                                        | `<ShDataTable>`      |
| Navigation         | `.sh-nav-phone`, `.sh-nav-rail`, `.sh-nav-sidebar`              | —                                        | `<ShNav>`            |
| Time Chart         | `.sh-chart`, `.sh-chart--compact`                               | —                                        | `<ShTimeChart>`      |
| Pipeline DAG       | `.sh-pipeline`                                                  | —                                        | `<ShPipeline>`       |
| Frame              | `.sh-frame`                                                     | —                                        | —                    |
| Card               | `.sh-card`                                                      | —                                        | —                    |
| Callout            | `.sh-callout`                                                   | —                                        | —                    |
| Bracket            | `.sh-bracket`                                                   | —                                        | —                    |
| Status Pill        | `.sh-status-pill`                                               | —                                        | —                    |
| Cursor States      | `.sh-cursor-active`, `.sh-cursor-working`, `.sh-cursor-idle`    | —                                        | —                    |
| Terminal BG        | `.sh-terminal-bg`                                               | —                                        | —                    |
| Section Header     | `.sh-section-header`                                            | —                                        | —                    |
| Clickable          | `.sh-clickable`                                                 | —                                        | —                    |
| Page Enter Anim    | `.sh-animate-page-enter`                                        | —                                        | —                    |
| Data Refresh       | `.sh-animate-data-refresh`                                      | —                                        | —                    |
| Stagger Children   | `.sh-stagger-children`                                          | —                                        | —                    |
| CRT Overlay        | `.sh-crt-overlay`                                               | —                                        | —                    |
| Modal              | `.sh-modal-overlay`, `.sh-modal`                                | —                                        | `<ShModal>`          |
| ANSI Text          | `.sh-ansi-bold`, `.sh-ansi-dim`, `.sh-ansi-blink`, etc.         | —                                        | —                    |
| ANSI Colors        | `.sh-ansi-fg-*`, `.sh-ansi-bg-*`                                | —                                        | —                    |
| Utilities          | `.sh-label`, `.sh-value`, `.sh-gap-*`, `.sh-grid`, `.sh-prompt` | —                                        | —                    |
| Threshold          | `.sh-glow-*` (auto-applied)                                     | `computeThreshold(pct)`                  | —                    |
| Heartbeat          | —                                                               | `heartbeat(el, timestamp)`               | —                    |
| Escalation         | —                                                               | `new EscalationTimer(opts)`              | —                    |
| Recovery           | —                                                               | `recoverySequence(opts)`                 | —                    |
| Terminal Chrome    | `.sh-collapsible`, `.sh-terminal-grid`, `.sh-rest-after-*`      | —                                        | —                    |
| Monitor Variants   | `data-sh-monitor="amber\|green"`                                | —                                        | —                    |
| Signal Degradation | `.sh-signal-degraded`                                           | —                                        | —                    |
| Interlace          | `.sh-interlace`                                                 | —                                        | —                    |
| Burn-in            | `data-sh-burn-in="TEXT"`                                        | —                                        | —                    |
| Threshold Bar      | `.sh-threshold-bar` + `--sh-fill`                               | `applyThreshold(el, pct)`                | —                    |
| Boot Sequence      | `.sh-boot-container`                                            | `bootSequence(el, lines)`                | —                    |
| Matrix Rain        | `.sh-matrix-rain`                                               | —                                        | `<ShMatrixRain>`     |
| Incident HUD       | `.sh-incident-hud`                                              | —                                        | `<ShIncidentHUD>`    |
| Hardware           | `data-sh-capability`                                            | `detectCapability()`                     | —                    |
| Orchestration      | —                                                               | `orchestrateEscalation(config)`          | —                    |
| Celebration        | —                                                               | `celebrationSequence(container, opts)`   | —                    |
| System Corruption  | `.sh-system-corrupted`                                          | —                                        | —                    |
| Tension Drone      | —                                                               | `setTensionDrone(level)`                 | —                    |
| Action Feedback    | —                                                               | `confirmAction(el, opts)`                | —                    |
| Event Timeline     | `.sh-event-timeline`                                            | —                                        | —                    |
| Progress Steps     | `.sh-progress-steps`                                            | —                                        | —                    |
| Filter Panel       | `.sh-filter-panel`, `.sh-filter-chip`                           | —                                        | —                    |
| Signal Bars        | `.sh-signal-bars`                                               | —                                        | —                    |
| Form Elements      | `.sh-input`, `.sh-select`, `.sh-toggle`, `.sh-tabs`             | —                                        | —                    |

## File Layout

| Path                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `css/tokens.css`        | CSS custom properties (`--sh-*`) with dark mode            |
| `css/superhot.css`      | All effects (imports tokens.css)                           |
| `js/freshness.js`       | Timestamp to freshness state                               |
| `js/shatter.js`         | Fragment + drift + fade animation                          |
| `js/glitch.js`          | Chromatic aberration burst                                 |
| `js/mantra.js`          | Repeating text watermark                                   |
| `js/audio.js`           | Procedural SFX via Web Audio API (`ShAudio`, `playSfx`)    |
| `js/crt.js`             | CRT CSS property writer (`setCrtMode`)                     |
| `js/atmosphere.js`      | Effect density tracker (`trackEffect`, `isOverBudget`)     |
| `js/threshold.js`       | Threshold signaling (`computeThreshold`, `applyThreshold`) |
| `js/heartbeat.js`       | Polling heartbeat (glitch burst + freshness on poll)       |
| `js/escalation.js`      | Failure escalation timer (4-stage cadence)                 |
| `js/recovery.js`        | Recovery sequence choreography (5-step async)              |
| `js/boot.js`            | Boot sequence typewriter reveal                            |
| `js/hardware.js`        | Hardware capability detection + CSS tier                   |
| `js/orchestrate.js`     | Multi-surface escalation coordinator                       |
| `js/celebration.js`     | Catharsis cascade (mantra + shatter + recovery)            |
| `js/commandFeedback.js` | Action feedback utility (`confirmAction`)                  |
| `js/toastManager.js`    | Toast queue and lifecycle management                       |
| `js/shortcuts.js`       | Keyboard shortcut bindings                                 |
| `js/monitorTheme.js`    | Monitor variant theme application                          |
| `js/scrollSpy.js`       | Scroll-based section tracking                              |
| `js/formatTime.js`      | Relative and absolute time formatting                      |
| `js/watchFreshness.js`  | Auto-polling freshness watcher                             |
| `js/revealLabel.js`     | Character-scramble entrance (`revealLabel`)                |
| `js/scrambleLabel.js`   | State-change label scramble (`scrambleLabel`)              |
| `preact/Sh*.jsx`        | Preact wrapper components (incl. ShModal)                  |
| `dist/`                 | Built outputs (gitignored)                                 |
| `examples/demo.html`    | Standalone demo (no build step)                            |

## Customization

Override any `--sh-*` token in your CSS:

```css
:root {
  --sh-threat: #ff00ff;
  --sh-shatter-duration: 400ms;
}
```

## Scope Tags

language:javascript, framework:preact

## Gotchas

- `dist/` is gitignored — run `npm run build` after cloning
- Preact components require `preact` as peer dependency
- Shatter creates absolutely-positioned fragments — parent needs `position: relative`
- Glitch `::before` pseudo-element reads `data-sh-glitch-text` — set via JS or manually
- `prefers-reduced-motion` disables all animation; static indicators remain

## Browser Support

| Feature                  | Chrome | Firefox | Safari | Edge |
| ------------------------ | ------ | ------- | ------ | ---- |
| Full fidelity            | 123+   | 128+    | 17.4+  | 123+ |
| With hex fallbacks       | 80+    | 75+     | 13+    | 80+  |
| Animations               | 117+   | 129+    | 17.4+  | 117+ |
| CSS-only (no animations) | 80+    | 75+     | 13+    | 80+  |

Modern features used: `oklch()`, `light-dark()`, `color-mix()`, `@property`, `@layer`, `@starting-style`, `container` queries. Hex fallback colors declared before every modern CSS color — older browsers see correct colors without effects.

## Code Quality

- Lint: `make lint`
- Format: `make format`

## Quality Gates

- Before committing: `/verify`
- Before PRs: `lessons-db scan --target . --baseline HEAD`

## Lessons

- Check before planning: `/check-lessons`
- Capture after bugs: `/capture-lesson`
- Lessons: `lessons-db search` to query, `lessons-db capture` to add. DB is authoritative — never write lesson .md files directly.

## Local AI Review

- Code review: `ollama-code-review .`

## Semantic Search

- Generate: `bash scripts/generate-embeddings.sh`
- Storage: `.embeddings/` (gitignored)
