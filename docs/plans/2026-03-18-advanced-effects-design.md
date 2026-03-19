# Advanced Terminal Effects — Design Document

**Date:** 2026-03-18
**Status:** Approved

## Overview

Phase 3 adds 5 advanced terminal effects, 4 audio types, hardware auto-downgrade, ShThresholdBar, ShIncidentHUD, and a sourcemap fix. Phase 4 (deferred) covers integration recipes, a11y tests, responsive tests, and dist CSS flattening.

## Phase 3 Scope (12 items)

### Visual Effects

1. **Signal degradation** (CSS) — `.sh-signal-degraded` — SVG turbulence noise overlay + opacity jitter. Signal: "data source is unreliable." T3 alert.
2. **Interlace** (CSS) — `.sh-interlace` — repeating-linear-gradient scan lines via `::after`. Signal: "passive monitoring feed." T1 ambient.
3. **Burn-in** (CSS) — `data-sh-burn-in="TEXT"` — ghost text via `::before` with sepia tint, blur, screen blend. Signal: "permanent fixture / anchor." T1 ambient.
4. **Boot sequence** (JS) — `bootSequence(el, lines, opts)` — progressive typewriter text reveal with stagger. Signal: "system is initializing." T2 one-shot. Returns cleanup function.
5. **Matrix rain** (Preact) — `<ShMatrixRain active={bool} density="medium">` — canvas-based falling character columns. Signal: "system is computing." T2 triggered.

### Audio

6. **4 new SFX types** — `boot` (POST beep), `static` (noise burst), `warning` (double-pulse), `recovery` (descending chime). Added to existing SOUNDS map in audio.js.

### Infrastructure

7. **Hardware auto-downgrade** (JS) — `detectCapability()` returns "minimal"|"low"|"medium"|"full". `applyCapability(tier)` sets `data-sh-capability` on documentElement. CSS responds by disabling animation tiers.
8. **Production sourcemaps** — flip `sourcemap: isWatch` to `sourcemap: true` in esbuild.config.mjs.

### Components

9. **ShThresholdBar** (CSS) — `.sh-threshold-bar` — generalized metric bar using `--sh-fill` custom property. Works with existing `applyThreshold()`.
10. **ShIncidentHUD** (Preact) — `<ShIncidentHUD active severity message timestamp onAcknowledge />` — fixed top banner for system-wide incidents. Warning (amber) or critical (red + pulse).

## Phase 4 Scope (deferred — quality investments)

11. Integration recipes (5 tutorial docs)
12. Accessibility tests (keyboard nav, focus trap, screen reader)
13. Responsive breakpoint tests
14. Dist CSS flattening

## Diegetic Test Results

| Effect             | "When the user sees **_, they know _**"          | Pass? |
| ------------------ | ------------------------------------------------ | ----- |
| Signal degradation | noise/static → data source is unreliable         | Yes   |
| Interlace          | scan lines → passive monitoring, not interactive | Yes   |
| Burn-in            | ghost text → permanent landmark element          | Yes   |
| Boot sequence      | typewriter lines → system is initializing        | Yes   |
| Matrix rain        | falling characters → system is computing         | Yes   |
| ShIncidentHUD      | top banner → active system-wide incident         | Yes   |
| ShThresholdBar     | colored bar → metric proximity to danger zone    | Yes   |

## Design Decisions

- **ShBroadcast dropped** — redundant with ShMantra at layout root + EscalationTimer level 4
- **Matrix rain uses canvas** — CSS cannot randomize character content per frame; canvas is the only option
- **Burn-in uses `::before`** — same pattern as mantra watermark, consumers set via data attribute
- **Hardware capability uses data attribute** — CSS can respond to tiers without JS per-component
- **No Preact wrappers for interlace/degradation/burn-in** — trivial class/attribute toggles don't benefit from component lifecycle
