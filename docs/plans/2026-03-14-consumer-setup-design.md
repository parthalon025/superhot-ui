# Consumer Setup Design

**Date:** 2026-03-14
**Status:** Approved

## Problem

Two problems for consumers integrating superhot-ui:

1. **Integration friction** — three manual steps after `npm install`:
   - Symlink fix for worktrees (`npm install` creates a relative symlink that breaks silently)
   - esbuild Preact alias (dual-Preact crash if not configured)
   - Postinstall wiring (have to remember to add to package.json)

2. **Docs not surfaced** — design-philosophy.md, experience-design.md, consumer-guide.md, and component docs exist but consumers don't automatically get them loaded into Claude Code context. Developers build dashboards that drift from the design system.

## Solution

A `scripts/setup.js` that consumers run once (and then wire as postinstall) that:

1. Fixes the symlink (absolute path)
2. Injects a `## superhot-ui` block into the consumer's CLAUDE.md (creating it if absent)
3. Patches consumer's `package.json` to add postinstall entry (so it re-runs automatically)
4. Detects `esbuild.config.mjs` and prints the Preact alias snippet if not configured

The CLAUDE.md block includes key design rules **inline** (loaded every Claude session without file reads) plus links to all docs for deep reference.

## Version-Aware Updates

The injected block is prefixed with `<!-- superhot-ui 0.1.0 -->`. On re-run:

- Same version → skip (idempotent)
- Different version → replace block with current version
- No marker → append (first-time inject)

This means consumers get updated rules when superhot-ui releases a new version and they run `npm install` (which triggers postinstall → setup.js).

## CLAUDE.md Block Strategy

**Stable rules inline** (unlikely to change per-release):

- Typography discipline
- Navigation tone
- Interface health states
- Failure theater
- Time-freeze discipline
- Emotional arc
- Interaction feedback matrix
- Component rules (diegetic-first, one signal, four palette colors)
- Gotchas

**Volatile details as links** (component APIs, threshold overrides):

- `node_modules/superhot-ui/docs/consumer-guide.md`
- `node_modules/superhot-ui/docs/design-philosophy.md`
- `node_modules/superhot-ui/docs/experience-design.md`
- `node_modules/superhot-ui/docs/components/`

## Files

| File                         | Change                                           |
| ---------------------------- | ------------------------------------------------ |
| `scripts/setup.js`           | New — setup script with exported pure functions  |
| `docs/consumer-claude-md.md` | New — CLAUDE.md block template (source of truth) |
| `docs/consumer-guide.md`     | Update install section with setup step           |
| `README.md`                  | Update Installation section                      |
| `tests/setup.test.js`        | New — unit tests for all setup.js functions      |

## Non-Goals

- Does not configure esbuild automatically (too much variance in consumer configs)
- Does not run `npm run build` in superhot-ui (consumer's responsibility)
- Does not install Preact in the consumer (peer dep, consumer manages)
