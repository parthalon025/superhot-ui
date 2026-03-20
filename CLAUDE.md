# superhot-ui

SUPERHOT-inspired visual effects package for dashboards. CSS-first with optional JS utilities and Preact components.

**Repo:** https://github.com/parthalon025/superhot-ui (private)

## Architecture

Three layers (each optional):

1. **CSS** (`css/superhot.css`) — Pure CSS via `data-sh-*` attribute selectors. Works with any framework or none.
2. **JS** (`js/`) — Vanilla ESM utilities that set those attributes. No framework dependency.
3. **Preact** (`preact/`) — Thin component wrappers for Preact dashboards (ARIA, project-hub).

## Quick Start

Install as local dependency from sibling project: `npm install file:../superhot-ui`

Or just link the CSS directly: `<link rel="stylesheet" href="../superhot-ui/css/superhot.css">`

## Build

- `npm run build` — Produces dist/superhot.css, dist/superhot.js, dist/superhot.preact.js
- `npm run dev` — Watch mode with sourcemaps
- `npm test` — Run unit tests (node --test)
- `node --test tests/freshness.test.js` — Single test file

## Effects Reference

| Effect          | CSS Attribute                                   | JS Function                                                       | Preact Component     |
| --------------- | ----------------------------------------------- | ----------------------------------------------------------------- | -------------------- |
| Freshness       | `data-sh-state="fresh\|cooling\|frozen\|stale"` | `applyFreshness(el, timestamp)`                                   | `<ShFrozen>`         |
| Shatter         | `.sh-fragment` (JS-created)                     | `shatterElement(el, opts)`                                        | `<ShShatter>`        |
| Glitch          | `data-sh-effect="glitch"`                       | `glitchText(el, opts)`                                            | `<ShGlitch>`         |
| Mantra          | `data-sh-mantra="TEXT"`                         | `applyMantra(el, text)`                                           | `<ShMantra>`         |
| Threat Pulse    | `data-sh-effect="threat-pulse"`                 | —                                                                 | `<ShThreatPulse>`    |
| CRT Toggle      | —                                               | `setCrtMode({stripe,scanline,flicker})`                           | `<ShCrtToggle>`      |
| Skeleton        | `.sh-skeleton`                                  | —                                                                 | `<ShSkeleton>`       |
| Toast           | `.sh-toast` + `data-sh-toast-type`              | —                                                                 | `<ShToast>`          |
| Stat Card       | `.sh-stat-card` + `data-sh-status`              | —                                                                 | `<ShStatCard>`       |
| Status Badge    | `.sh-status-badge` + `data-sh-status`           | —                                                                 | `<ShStatusBadge>`    |
| VRAM Bar        | `.sh-vram-bar` + `--sh-fill: <0-100>`           | —                                                                 | —                    |
| Command Palette | `.sh-command-palette-overlay`                   | —                                                                 | `<ShCommandPalette>` |
| Audio           | —                                               | `playSfx('complete\|error\|dlq\|pause\|boot\|warning\|recovery')` | —                    |
| Narrator        | —                                               | `narrate(category, context)`                                      | —                    |
| Antline         | `.sh-antline` + `data-sh-antline-active`        | —                                                                 | `<ShAntline>`        |
| Test Chamber    | `.sh-test-chamber` + `.sh-panel`                | —                                                                 | `<ShTestChamber>`    |
| Announcement    | `.sh-announcement` + `data-sh-personality`      | —                                                                 | `<ShAnnouncement>`   |
| Portal Audio    | —                                               | `playSfx('portal-chime\|turret-deploy')`                          | —                    |
| Facility State  | `data-sh-facility="normal\|alert\|breach"`      | `setFacilityState(state)`                                         | —                    |

## File Layout

| Path                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `css/tokens.css`        | CSS custom properties (`--sh-*`) with dark mode                |
| `css/superhot.css`      | All effects (imports tokens.css)                               |
| `js/freshness.js`       | Timestamp to freshness state                                   |
| `js/shatter.js`         | Fragment + drift + fade animation                              |
| `js/glitch.js`          | Chromatic aberration burst                                     |
| `js/mantra.js`          | Repeating text watermark                                       |
| `js/audio.js`           | Procedural SFX via Web Audio API (`ShAudio`, `playSfx`)        |
| `js/crt.js`             | CRT CSS property writer (`setCrtMode`)                         |
| `js/narrator.js`        | Personality phrase engine (`narrate`, `ShNarrator`)            |
| `js/narrator-corpus.js` | Phrase bank (GLaDOS, Cave, Wheatley, Turret, SUPERHOT)         |
| `js/facility.js`        | Facility state system (`setFacilityState`, `getFacilityState`) |
| `js/escalation.js`      | Failure escalation timer (4-stage progressive drama)           |
| `js/orchestrate.js`     | Multi-surface crisis orchestration (batteries-included)        |
| `js/recovery.js`        | 5-step async recovery choreography                             |
| `js/boot.js`            | Progressive typewriter boot sequence                           |
| `js/threshold.js`       | Metric threshold computation + DOM glow application            |
| `js/heartbeat.js`       | Polling heartbeat (glitch burst + freshness re-evaluation)     |
| `.claude/agents/`       | Atmosphere reviewer agent                                      |
| `preact/Sh*.jsx`        | Preact wrapper components                                      |
| `dist/`                 | Built outputs (gitignored)                                     |
| `examples/demo.html`    | Standalone demo (no build step)                                |

## Customization

Override any `--sh-*` token in your CSS:

```css
:root {
  --sh-threat: #ff00ff;
  --sh-shatter-duration: 400ms;
}
```

## Atmosphere System

Three coordinated systems govern the dashboard experience:

1. **Facility State** (`setFacilityState`) — CSS atmosphere master switch. Sets `data-sh-facility` on `<html>`, shifting all Portal tokens globally. Three states: `normal` (Portal calm), `alert` (red bleeds into blue), `breach` (full SUPERHOT — all Portal tokens become threat).

2. **Narrator** (`narrate`, `ShNarrator`) — Personality-driven phrase engine. Five personalities (GLaDOS, Cave, Wheatley, Turret, SUPERHOT) across 12 categories. Does NOT auto-change with facility state — set explicitly.

3. **Audio** (`playSfx`, `ShAudio`) — Procedural SFX. Original (complete, error, dlq, pause) + Portal (portal-chime, portal-fail, turret-deploy, turret-shutdown, facility-hum, panel-slide) + tension drone. Personality-aware remapping when `ShAudio.narratorPersonality` is set.

**Atmosphere Reviewer:** `.claude/agents/atmosphere-reviewer.md` — opus-model agent that reviews cohesion between SUPERHOT and Portal aesthetic layers. Runs proactive light pass on atmosphere file changes, full 11-check pass on demand.

## Scope Tags

language:javascript, framework:preact

## Gotchas

- `dist/` is gitignored — run `npm run build` after cloning
- Preact components require `preact` as peer dependency
- Shatter creates absolutely-positioned fragments — parent needs `position: relative`
- Glitch `::before` pseudo-element reads `data-sh-glitch-text` — set via JS or manually
- `prefers-reduced-motion` disables all animation; static indicators remain

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
