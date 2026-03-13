# Dashboard Expansion Design

**Date:** 2026-03-13
**Scope:** superhot-ui new primitives + ollama-queue cohesion/completeness overhaul
**Status:** Approved — ready for implementation planning

---

## 1. Context

superhot-ui is the design system source of truth for all UI/UX built by Justin McFarland.
Every new UI pattern is built here first, then consumed by project dashboards.

**Design system pipeline:**

```
ui-template (base tokens)
    ↓
superhot-ui (SUPERHOT theme + effects + components)
    ↓
project dashboards (ollama-queue, ha-aria, project-hub)
```

**Current superhot-ui state:** 5 effects (freshness, shatter, glitch, mantra, threat-pulse), 5 Preact
components, full token system. ollama-queue uses ~20% of the available surface.

**This design adds:**

- 7 new DS primitives to superhot-ui
- 20 cohesion improvements to ollama-queue (consuming existing + new DS primitives)
- 10 completeness improvements (surfacing missing backend APIs)
- 1 new Backends tab (multi-GPU fleet management, dynamic add/remove)

---

## 2. Design Philosophy Constraints

Every new component must satisfy all four:

1. **One signal only** — communicates exactly one thing. No multi-purpose components.
2. **Diegetic** — effect reads as system output, not decoration. Would make sense in the SUPERHOT game world.
3. **Three-color palette** — white (environment), black (interactive), red (threat), cyan (health/success). No additional hues.
4. **Emotional loop fit** — maps to: tension → pause → plan → execute → catharsis.

---

## 3. New superhot-ui Primitives

### 3.1 ShSkeleton

**Signal:** data loading / not yet materialized
**Emotional loop:** tension → pause
**Diegetic metaphor:** terminal buffer filling line by line
**Layer:** CSS (`css/components/skeleton.css`) + Preact (`preact/ShSkeleton.jsx`)
**Props:** `rows` (default 3), `width` (default '100%'), `height` (default '1em'), `class`
**CSS:** phosphor-pulse keyframe on `--sh-phosphor-glow`, `background: linear-gradient(90deg, var(--bg-inset), var(--sh-phosphor-glow), var(--bg-inset))` animated left→right
**No JS utility needed** — pure CSS driven by class `.sh-skeleton`

### 3.2 ShToast

**Signal:** system event occurred (info / warning / error)
**Emotional loop:** execute → catharsis
**Diegetic metaphor:** piOS terminal output line with timestamp
**Layer:** CSS (`css/components/toast.css`) + Preact (`preact/ShToast.jsx`)
**Props:** `type` ('info'|'warn'|'error'), `message`, `onDismiss`, `duration` (ms, 0=persistent), `class`
**Behavior:** enters with `@starting-style` slide-in, dismisses with `shatterElement` → calls `onDismiss`. Error type applies `data-sh-effect="threat-pulse"` persistent.
**Container:** fixed bottom-right stack, z-index `--z-toast`, max 4 visible

### 3.3 ShStatusBadge

**Signal:** entity health state
**Emotional loop:** all nodes (status is always visible)
**Diegetic metaphor:** terminal status indicator
**Layer:** CSS (`css/components/status-badge.css`) + Preact (`preact/ShStatusBadge.jsx`)
**Props:** `status` ('healthy'|'error'|'warning'|'waiting'|'active'|'ok'), `label`, `glow` (bool, default true), `class`
**CSS:** `color: var(--status-{status})`, `box-shadow: 0 0 6px var(--status-{status}-glow)`, height `--badge-height`, padding `--badge-padding`
**No animation** — static indicator, motion reserved for ShThreatPulse

### 3.4 ShCommandPalette

**Signal:** command mode active
**Emotional loop:** plan
**Diegetic metaphor:** terminal command line / piOS input mode
**Layer:** CSS (`css/components/command-palette.css`) + Preact (`preact/ShCommandPalette.jsx`)
**Props:** `items` (array of `{id, label, description, action}`), `onSelect`, `placeholder`, `onClose`, `open` (bool)
**Behavior:**

- Opens with `glitchText` on the trigger + `@starting-style` fade-in overlay
- Phosphor-glow border on search input (`--sh-phosphor` border + glow)
- Keyboard: `↑↓` navigate, `Enter` select, `Escape` close
- Filters `items` client-side by label/description match
- Closes with `shatterElement` on the overlay
  **Trigger:** `Cmd+K` / `Ctrl+K` — bound in consuming project, not in DS component
  **z-index:** `--z-modal`

### 3.5 ShCrtToggle

**Signal:** display intensity setting
**Emotional loop:** n/a (settings)
**Diegetic metaphor:** CRT monitor hardware controls
**Layer:** CSS (`css/components/crt-toggle.css`) + JS (`js/crt.js`) + Preact (`preact/ShCrtToggle.jsx`)
**Props:** `stripe` (bool), `scanline` (bool), `flicker` (bool), `onChange`, `class`
**JS (`crt.js`):** `setCrtMode({stripe, scanline, flicker})` — writes `--sh-crt-stripe`, `--sh-crt-scanline`, `--sh-crt-flicker` to `document.documentElement.style`
**Persistence:** consuming project handles localStorage; ShCrtToggle is stateless
**A11y:** flicker option includes warning label (photosensitivity risk)

### 3.6 .sh-vram-bar (CSS utility)

**Signal:** memory pressure (0–100%)
**Emotional loop:** tension
**Diegetic metaphor:** VRAM meter filling red as danger approaches
**Layer:** CSS only (`css/components/vram-bar.css`)
**Usage:** `<div class="sh-vram-bar" style="--sh-fill: 72">72%</div>`
**CSS:** `@property --sh-fill` (type `<number>`, initial 0) enables smooth interpolation. `background` interpolates `--sh-phosphor` → `--sh-threat` as `--sh-fill` goes 0→100 using `color-mix()`. Transition: `--sh-fill 1s ease-out`.
**No JS, no Preact** — consuming project binds `--sh-fill` to its VRAM signal

### 3.7 ShAudio (JS utility)

**Signal:** piOS soundscape (opt-in)
**Emotional loop:** catharsis (complete), tension (error/dlq)
**Layer:** JS only (`js/audio.js`)
**API:** `playSfx(type: 'complete'|'error'|'dlq'|'pause')` — Web Audio API, generates tones procedurally (no audio files)
**Opt-in:** only plays when `ShAudio.enabled = true` (consuming project sets this from user preference)
**Sounds:**

- `complete` — ascending two-tone (phosphor: 440Hz + 880Hz, 150ms each)
- `error` — descending buzz (threat: 220Hz + 110Hz, 200ms + distortion)
- `dlq` — single low tone (110Hz, 300ms)
- `pause` — soft click (880Hz, 50ms, fade)
  **Accessibility:** respects `prefers-reduced-motion` (silence when set)

---

## 4. ollama-queue Cohesion Improvements (20 items)

All consuming existing or new superhot-ui primitives. Build order: after superhot-ui primitives are published.

### Group A — Component adoption (5 items)

1. **ShFrozen on all data cards** — job cards, backend cards, model cards, recurring job rows. Timestamp = last API poll signal. Cards >30min grey; >60min watermarked.
2. **ShGlitch on all error states** — DLQ entries, failed job rows, backend failures, eval run errors. `intensity="medium"`. Non-color error discriminator (Treisman principle).
3. **ShMantra for system pause/offline** — `<ShMantra text="SYSTEM PAUSED" active={isDaemonPaused}>` on layout root. Replaces ad-hoc `applyMantra()` calls. Signal-reactive.
4. **ShShatter for all dismissals** — DLQ dismiss, alert strip close, notification close. Replaces `display:none`.
5. **ShThreatPulse standardized** — persistent on VRAM >90%, one-shot on new DLQ entry, one-shot on job killed. Remove all ad-hoc threat border styling.

### Group B — New DS primitive adoption (5 items)

6. **ShSkeleton on all loading states** — replace all spinners and blank-on-load with phosphor-pulse skeletons. One pattern everywhere.
7. **ShToast for action feedback** — replace `useActionFeedback` inline messages with `ShToast` notifications. Errors use `type="error"` (persistent pulse). Successes auto-dismiss after 3s.
8. **ShStatusBadge on all status indicators** — every health/status badge across all 8 tabs uses ShStatusBadge with correct `status` prop. Eliminates custom badge CSS.
9. **ShCommandPalette (⌘K)** — submit job, cancel job, switch model, trigger eval run, navigate tab. Items sourced from existing store signals. Trigger bound in `app.jsx`.
10. **.sh-vram-bar on backend VRAM meters** — BackendsPanel VRAM bars use `.sh-vram-bar` with `--sh-fill` bound to `backend.vram_pct * 100`. Smooth interpolation phosphor→threat.

### Group C — CSS token sweep (5 items)

11. **CRT scanlines globally** — `--sh-crt-stripe: block` on `.layout-root` in `index.css`. One line. All 8 tabs get scanlines simultaneously.
12. **Semantic token sweep on all forms** — Settings, Eval Settings, SubmitJobModal, Schedule form: replace Tailwind classes with `--input-bg`, `--input-border`, `--input-border-focus`, `--input-height`.
13. **Type scale tokens uniformly** — replace `text-sm`, `text-xs`, `font-mono` with `--type-body`, `--type-label`, `--type-small`, `--type-micro`. `--type-display` for KPI numbers.
14. **Transition token sweep** — replace all `transition: all 0.2s` with `var(--transition-default)` / `var(--transition-fast)`.
15. **Scrollbar + selection + focus ring tokens** — one `::-webkit-scrollbar`, `::selection`, `:focus-visible` block in `index.css`. Thin phosphor thumbs, no browser defaults.

### Group D — Interaction + animation (5 items)

16. **glitchText on job state transitions** — pending→running→complete triggers `glitchText()` on status label. Makes transitions feel alive.
17. **shatterElement on job cancel** — cancel button calls `shatterElement` on the job card before removing it from DOM.
18. **@starting-style tab entrances uniformly** — apply entrance animation to all 8 tab content containers. Currently only some tabs have it.
19. **Freshness heartbeat in header** — `applyFreshness` on the "last updated" timestamp in CohesionHeader. Header greys out before data stops updating.
20. **ShCrtToggle in Settings** — persist CRT mode preference to localStorage. Toggle in the Settings page controls `ShCrtToggle`.

---

## 5. ollama-queue Completeness Improvements (10 items)

Surfacing backend APIs with zero frontend representation.

21. **Queue ETAs** (`/api/queue/etas`) — inline per-job estimated start time under each Now tab queue row.
22. **DLQ Schedule Preview** (`/api/dlq/schedule-preview`) — expandable panel in History DLQ section showing failure classification + predicted retry slots.
23. **Per-Job Run History** (`/api/schedule/{rj_id}/runs`) — expand recurring job row in Plan tab to show last 5 runs with duration sparkline + success/fail badges.
24. **Eval Confusion Matrix** (`/api/eval/runs/{id}/confusion`) — panel in Eval Runs detail view. TP/FP/FN/TN per variant.
25. **Eval Per-Item Results** (`/api/eval/runs/{id}/results`) — paginated results table in Eval Runs detail. Filter by TP/FP/FN/TN classification.
26. **Eval Export/Import** (`/api/eval/variants/export` + `/api/eval/variants/import`) — two buttons in Variants tab header. Export downloads JSON; import opens file picker.
27. **Eval Parameter Sweep** (`/api/eval/variants/sweep`) — "Sweep" button in Variants tab opens command palette command to configure and trigger sweep.
28. **Eval Templates CRUD** (`/api/eval/templates` + `PUT` + clone) — editable rows in Eval Settings. Factory templates (A–H + M) become editable inline.
29. **Eval Auto-Schedule** (`POST /api/eval/schedule`) — scheduler config in Eval Settings: "run eval every [interval] starting [time]."
30. **Live Variant History Chart** (`/api/eval/variants/{id}/history`) — uPlot sparkline per variant row in Variants tab. Click to expand full F1-over-time chart.

---

## 6. New Backends Tab

**Tab ID:** `backends` — 9th tab, between Consumers and Settings in the sidebar.

### 6.1 Fleet Overview Panel

- Grid of backend cards (one per configured node)
- Each card: hostname, GPU name, VRAM bar (`.sh-vram-bar`), loaded models list, health status (`ShStatusBadge`), routing weight
- `ShFrozen` wrapper with last-health-check timestamp
- `ShThreatPulse persistent` when unhealthy

### 6.2 Dynamic Node Management

Requires new backend endpoints (see §7):

- **Add node** — form: URL + routing weight + test button → `POST /api/backends`
- **Remove node** — `ShShatter` confirmation → `DELETE /api/backends/{url}`
- **Update weight** — inline slider → `PUT /api/backends/{url}/weight`
- **Test connectivity** — "Test" button → `GET /api/backends/{url}/test` → ShStatusBadge result

### 6.3 Routing Intelligence Panel

- Shows the 4-tier selection logic as a live diagram:
  - Health check → Model availability → Warm model → Hardware load → Weighted random
- Current job: which backend was selected and why (text label from last routing decision)

### 6.4 Backend Topology (ASCII)

- CSS grid-based ASCII diagram: this machine → remote nodes (lines show active routing)
- Active routing path highlights in phosphor cyan
- Pure CSS/HTML, no JS library

---

## 7. New Backend Endpoints Required

For dynamic node management (Backends tab §6.2), these endpoints must be added to ollama-queue:

| Method   | Path                         | Purpose                                             |
| -------- | ---------------------------- | --------------------------------------------------- |
| `POST`   | `/api/backends`              | Register new backend (url, weight) → persists to DB |
| `DELETE` | `/api/backends/{url}`        | Remove backend from DB + evict from caches          |
| `PUT`    | `/api/backends/{url}/weight` | Update routing weight                               |
| `GET`    | `/api/backends/{url}/test`   | Test connectivity (health check, model list)        |

**DB change:** New `backends` table (`url TEXT PK`, `weight REAL DEFAULT 1.0`, `enabled BOOL DEFAULT 1`, `added_at REAL`). `backend_router.py` reads from DB union with `OLLAMA_BACKENDS` env var (env var = read-only baseline; DB = runtime additions).

---

## 8. Build Order

```
Phase 1: superhot-ui additions
  1a. CSS: css/components/*.css (skeleton, toast, status-badge, command-palette, vram-bar, crt-toggle)
  1b. JS: js/audio.js, js/crt.js
  1c. Preact: ShSkeleton, ShToast, ShStatusBadge, ShCommandPalette, ShCrtToggle
  1d. Tests: tests/*.test.js for all new primitives
  1e. Examples: examples/components/*.html
  1f. npm run build → dist/ updated
  1g. Docs: docs/components/*.md

Phase 2: ollama-queue — superhot-ui adoption (Groups A+B, items 1–10)
  2a. Token sweep + CRT (Groups C+D, items 11–20) — can run in parallel with 2a
  2b. New Backends tab (frontend only — read from /api/backends)
  2c. Completeness improvements (items 21–30)

Phase 3: ollama-queue — backend additions
  3a. DB: backends table + migration
  3b. API: 4 new /api/backends/* endpoints
  3c. backend_router.py: DB-backed backend registry
  3d. Backends tab: wire dynamic management (add/remove/test/weight)
```

---

## 9. Acceptance Criteria (top-level)

- All 7 new superhot-ui primitives exported from `superhot-ui/preact` and `superhot-ui` entry points
- `npm run build` produces updated `dist/superhot.js` and `dist/superhot.preact.js`
- All new tests pass (`node --test`)
- ollama-queue: `npm run build` in spa/ succeeds after importing new primitives
- All 20 cohesion items visually applied across all 8 tabs
- All 10 completeness items surface their target API endpoints
- Backends tab renders, shows all configured nodes, supports add/remove/test/weight
- New `/api/backends/*` endpoints return correct responses
- No regressions: existing ollama-queue pytest suite passes (1,788 tests)
