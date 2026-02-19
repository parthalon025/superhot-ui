# PRD: superhot-ui — Standalone SUPERHOT Visual Effects Package

**Design doc:** `~/Documents/docs/plans/2026-02-19-superhot-ui-design.md`
**Date:** 2026-02-19

## Tasks

### 1. Bootstrap project repo with package.json and build tooling
**Blocked by:** —

Initialize superhot-ui as a Node.js project with esbuild, package.json exports map, directory structure (css/, js/, preact/, dist/, examples/, tests/), and .gitignore.

**Acceptance:** package.json exists with name "superhot-ui", all directories exist, dist/ is gitignored.

---

### 2. Create CSS tokens file with custom properties
**Blocked by:** 1

Write `css/tokens.css` with all `--sh-*` custom properties (threat, threat-glow, frozen, glass, void, timing tokens) including light defaults and dark mode overrides via `[data-theme="dark"]` and `prefers-color-scheme: dark`.

**Acceptance:** All 8 tokens present, dark mode selectors present.

---

### 3. Create CSS freshness state selectors
**Blocked by:** 2

In `css/superhot.css`, import tokens.css and implement `data-sh-state` selectors: fresh (no-op), cooling (saturate 0.7), frozen (grayscale + 60% opacity + frost border), stale (frozen + "STALE" watermark via `::after`).

**Acceptance:** All 4 state selectors present with correct CSS properties.

---

### 4. Create CSS effect keyframes and selectors
**Blocked by:** 3

Add keyframes (sh-glitch-jitter, sh-shatter-fragment, sh-threat-glow, sh-frost-shimmer) and effect selectors (glitch, shatter, threat-pulse) plus `data-sh-mantra` watermark.

**Acceptance:** All 4 keyframes and all effect selectors present.

---

### 5. Add responsive degradation and reduced-motion rules
**Blocked by:** 4

Media queries: phone (<640px) disables mantra and simplifies shatter, tablet (640-1023px) simplifies glitch, `prefers-reduced-motion` disables all animation.

**Acceptance:** All 3 media query breakpoints present.

---

### 6. Implement freshness.js utility
**Blocked by:** 1

`js/freshness.js` exporting `applyFreshness(element, timestamp, thresholds?)`. Calculates age, sets `data-sh-state`. Default thresholds: cooling=300s, frozen=1800s, stale=3600s. Returns state string.

**Acceptance:** File exists, exports function, importable via ESM.

---

### 7. Implement shatter.js utility
**Blocked by:** 1

`js/shatter.js` exporting `shatterElement(element, opts)`. Creates clip-path triangle fragments, animates drift+fade, calls onComplete, cleans up DOM. Returns cancel function.

**Acceptance:** File exists, exports function, uses clip-path, importable via ESM.

---

### 8. Implement glitch.js and mantra.js utilities
**Blocked by:** 1

`js/glitch.js` (glitchText with duration/intensity) and `js/mantra.js` (applyMantra, removeMantra). Both set/remove `data-sh-*` attributes.

**Acceptance:** Both files exist, all 3 functions exported, importable via ESM.

---

### 9. Write unit tests for JS utilities
**Blocked by:** 6

`tests/freshness.test.js` testing applyFreshness with mock elements. Test edge cases: future timestamps, missing thresholds, null element. Uses Node.js built-in test runner.

**Acceptance:** Tests file exists and `node --test` passes.

---

### 10. Create Preact components
**Blocked by:** 6, 7, 8

All 5 components: ShFrozen (interval-based freshness), ShShatter (dismiss with animation), ShGlitch (active prop toggle), ShMantra (watermark wrapper), ShThreatPulse (anomaly pulse).

**Acceptance:** All 5 .jsx files exist with correct imports and data attribute usage.

---

### 11. Configure esbuild and build scripts
**Blocked by:** 5, 10

`esbuild.config.mjs` producing 3 outputs: `dist/superhot.css`, `dist/superhot.js` (ESM), `dist/superhot.preact.js` (ESM). Build/dev scripts in package.json.

**Acceptance:** `npm run build` succeeds and all 3 dist files exist.

---

### 12. Create standalone demo.html
**Blocked by:** 5, 8

`examples/demo.html` demonstrating all 5 effects using CSS + vanilla JS only (no build step). Cards with freshness states, shatterable alert, glitch text, mantra watermark, threat pulse.

**Acceptance:** File exists with all effect references.

---

### 13. Write CLAUDE.md
**Blocked by:** 11

Project overview, build commands, testing instructions, file layout, consumer integration examples, gotchas.

**Acceptance:** File exists with build and test commands documented.

---

### 14. Run full quality gate
**Blocked by:** 9, 11, 12, 13

All tests pass, build produces all 3 dist files, all exports resolve, demo and CLAUDE.md exist.

**Acceptance:** All 8 gate checks pass.

## Dependency Graph

```
1 (bootstrap)
├── 2 (tokens) → 3 (states) → 4 (effects) → 5 (responsive)
├── 6 (freshness.js) → 9 (tests)
├── 7 (shatter.js)
├── 8 (glitch+mantra.js) → 12 (demo)
│
├── 6,7,8 → 10 (preact components)
├── 5,10 → 11 (build)
├── 5,8 → 12 (demo)
├── 11 → 13 (CLAUDE.md)
└── 9,11,12,13 → 14 (quality gate)
```
