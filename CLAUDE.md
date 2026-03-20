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

| Effect          | CSS Attribute                                   | JS Function                              | Preact Component     |
| --------------- | ----------------------------------------------- | ---------------------------------------- | -------------------- |
| Freshness       | `data-sh-state="fresh\|cooling\|frozen\|stale"` | `applyFreshness(el, timestamp)`          | `<ShFrozen>`         |
| Shatter         | `.sh-fragment` (JS-created)                     | `shatterElement(el, opts)`               | `<ShShatter>`        |
| Glitch          | `data-sh-effect="glitch"`                       | `glitchText(el, opts)`                   | `<ShGlitch>`         |
| Mantra          | `data-sh-mantra="TEXT"`                         | `applyMantra(el, text)`                  | `<ShMantra>`         |
| Threat Pulse    | `data-sh-effect="threat-pulse"`                 | —                                        | `<ShThreatPulse>`    |
| CRT Toggle      | —                                               | `setCrtMode({stripe,scanline,flicker})`  | `<ShCrtToggle>`      |
| Skeleton        | `.sh-skeleton`                                  | —                                        | `<ShSkeleton>`       |
| Toast           | `.sh-toast` + `data-sh-toast-type`              | —                                        | `<ShToast>`          |
| Stat Card       | `.sh-stat-card` + `data-sh-status`              | —                                        | `<ShStatCard>`       |
| Status Badge    | `.sh-status-badge` + `data-sh-status`           | —                                        | `<ShStatusBadge>`    |
| VRAM Bar        | `.sh-vram-bar` + `--sh-fill: <0-100>`           | —                                        | —                    |
| Command Palette | `.sh-command-palette-overlay`                   | —                                        | `<ShCommandPalette>` |
| Audio           | —                                               | `playSfx('complete\|error\|dlq\|pause')` | —                    |
| Narrator        | —                                               | `narrate(category, context)`             | —                    |
| Antline         | `.sh-antline` + `data-sh-antline-active`        | —                                        | `<ShAntline>`        |
| Test Chamber    | `.sh-test-chamber` + `.sh-panel`                | —                                        | `<ShTestChamber>`    |
| Announcement    | `.sh-announcement` + `data-sh-personality`      | —                                        | `<ShAnnouncement>`   |
| Portal Audio    | —                                               | `playSfx('portal-chime\|turret-deploy')` | —                    |

## File Layout

| Path                    | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `css/tokens.css`        | CSS custom properties (`--sh-*`) with dark mode         |
| `css/superhot.css`      | All effects (imports tokens.css)                        |
| `js/freshness.js`       | Timestamp to freshness state                            |
| `js/shatter.js`         | Fragment + drift + fade animation                       |
| `js/glitch.js`          | Chromatic aberration burst                              |
| `js/mantra.js`          | Repeating text watermark                                |
| `js/audio.js`           | Procedural SFX via Web Audio API (`ShAudio`, `playSfx`) |
| `js/crt.js`             | CRT CSS property writer (`setCrtMode`)                  |
| `js/narrator.js`        | Personality phrase engine (`narrate`, `ShNarrator`)     |
| `js/narrator-corpus.js` | Phrase bank (GLaDOS, Cave, Wheatley, Turret, SUPERHOT)  |
| `preact/Sh*.jsx`        | Preact wrapper components                               |
| `dist/`                 | Built outputs (gitignored)                              |
| `examples/demo.html`    | Standalone demo (no build step)                         |

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
