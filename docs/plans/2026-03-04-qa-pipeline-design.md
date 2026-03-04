# superhot-ui QA Pipeline Design

**Date:** 2026-03-04
**Goal:** Apply a comprehensive QA pipeline to superhot-ui so downstream consumers get flawless integration — testing not just the library's internals but its consumer interface.

---

## Context

superhot-ui sits in the design system pipeline as a theme library: `ui-template → superhot-ui → project dashboards`. expedition33-ui received the same treatment. superhot-ui has a fundamentally different stack (Preact + esbuild + Node native test runner) but the same quality bar applies.

**Current state:**

- 1 test file (`freshness.test.js`) covering 1 of 4 JS modules; 5 Preact components untested
- No CI workflow runs `npm test`
- lint-staged runs only Prettier (no ESLint, no type-check)
- No bundle size enforcement
- No CSS token contract — consumers can break silently on token renames

---

## Decisions

| Decision          | Choice                             | Rationale                                                                                          |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| Test runner       | Vitest (migrate from node --test)  | Unified tooling across design system; jsdom built-in; same patterns as ui-template/expedition33-ui |
| Visual regression | Skip                               | No running server; CSS animation screenshots brittle without GPU stack                             |
| Pre-commit hooks  | Migrate husky → simple-git-hooks   | Consistent with ui-template/expedition33-ui                                                        |
| CI shape          | Single ci.yml (no split fast/slow) | No Playwright, no server startup; all gates are fast                                               |

---

## Architecture

### Pre-commit Gate

Migrate husky → simple-git-hooks. lint-staged:

- `*.{js,jsx,ts,tsx,mjs}` → `eslint --max-warnings 0` + Prettier
- `*.{css,json,md}` → Prettier

### Test Coverage (Vitest)

`vitest.config.ts` with `@vitejs/plugin-preact`, jsdom environment, `globals: true`.

**Source unit tests** (import from `js/`, `preact/`):

- `freshness.test.ts` — migrate existing 10 tests
- `glitch.test.ts` — glitchText options, DOM attribute side-effects
- `mantra.test.ts` — applyMantra / removeMantra
- `shatter.test.ts` — fragment creation, drift, fade (needs jsdom)
- `ShFrozen.test.tsx` — renders with correct data-sh-state, ARIA label
- `ShGlitch.test.tsx` — applies glitch text attribute
- `ShMantra.test.tsx` — renders mantra watermark
- `ShShatter.test.tsx` — mount/unmount fragment lifecycle
- `ShThreatPulse.test.tsx` — renders with correct data-sh-effect

**Consumer integration tests** (import from compiled `dist/`):

- `consumer.test.ts` — imports from all 4 dist entry points (`dist/superhot.js`, `dist/superhot.css`, `dist/superhot.preact.js`, `css/tokens.css`); asserts each named export is a function/object. Catches build failures that source tests miss.

**CSS token contract test:**

- `css-tokens.test.ts` — reads `dist/superhot.css` as text; asserts all expected `--sh-*` token names are present. Prevents silent renames from breaking consumers.

### Accessibility

`vitest-axe` on each Preact component render in jsdom. Validates WCAG 2.1 AA without a browser. Catches missing ARIA on freshness state labels, threat pulse indicators, etc.

### Bundle Size

`.size-limit.json` with limits on all three dist outputs:

- `dist/superhot.css` ≤ 10 kB
- `dist/superhot.js` ≤ 5 kB
- `dist/superhot.preact.js` ≤ 8 kB

### CI Workflow (`ci.yml`)

```
checkout → install → lint --max-warnings 0 → test → build → verify exports → size-limit
```

Triggers: push/PR to main.

**Export integrity step** (after build): verifies all 4 `package.json` export targets exist and are non-empty. Immediately surfaces "package export not found" breakage.

---

## What This Buys

| Layer              | Before        | After                           |
| ------------------ | ------------- | ------------------------------- |
| Pre-commit         | Prettier only | ESLint + Prettier               |
| Unit tests         | 1 module / 4  | 4 modules / 4 + 5 components    |
| Consumer interface | Untested      | dist imports + export integrity |
| CSS tokens         | No contract   | Explicit token name assertions  |
| Bundle size        | Unchecked     | size-limit enforced in CI       |
| CI                 | No test run   | lint + test + build + size      |
