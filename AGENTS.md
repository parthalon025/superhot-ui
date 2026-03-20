# AGENTS.md — superhot-ui

Instructions for AI agents and Claude Code operating in this repository.

## Quick Start

```bash
npm install
npm run build
npm test
```

## Architecture

SUPERHOT × Portal visual effects library for dashboards. Three layers: CSS (data attributes), JS (vanilla ESM utilities), Preact (component wrappers with ARIA).

Key directories:

- `css/` — Tokens, semantic layer, 33 component CSS files
- `js/` — 25 vanilla ESM utility modules
- `preact/` — 27 Preact component wrappers
- `docs/` — Consumer guide, design philosophy, experience design, anti-patterns, recipes
- `.claude/agents/` — Atmosphere reviewer agent
- `tests/` — Unit tests (node --test)
- `docs/plans/` — Implementation plans

## Atmosphere System

Three coordinated systems — facility state (CSS tokens), narrator (personality phrases), audio (procedural SFX). The atmosphere-reviewer agent (`.claude/agents/atmosphere-reviewer.md`) ensures cohesion.

**Key concept:** The user is simultaneously test subject (observed by GLaDOS), operator (relied upon by the cast), and experiment (the act of using the UI). Facility state shifts the primary role: `normal` = test subject, `alert` = operator, `breach` = experiment.

## Commands Agents Must Know

- Build: `npm run build`
- Test: `npm test`
- Single test: `node --test tests/<file>.test.js`
- Lint: `make lint`
- Format: `make format`
- Check lessons: `lessons-db scan --target . --baseline HEAD`

## What NOT to Do

- Never commit `.env` or secrets
- Never skip tests before committing
- Never claim done without running `/verify`
- Never start implementing without checking `/check-lessons` first
- Never use `h` or `Fragment` as callback parameter names in JSX (esbuild shadows)
- Never add colors outside the 6-color palette (bright, void, threat, phosphor, portal-blue, portal-orange)
- Never add decorative animation (diegetic only — every effect communicates exactly one signal)

## Pipeline Status

See `tasks/pipeline-status.md` for current project phase.
