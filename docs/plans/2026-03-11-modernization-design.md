# superhot-ui Modernization Design

**Date:** 2026-03-11
**Status:** Approved
**Research:** `docs/plans/2026-03-11-superhot-design-research.md`

## Summary

Modernize superhot-ui across three layers — CSS architecture, visual fidelity, and Preact components — while preserving all existing `data-sh-*` API surfaces. No consumer-facing breaking changes. The goal: make every effect feel like it serves the game's emotional logic, not just its aesthetic.

**Execution order:** Phase 1 (CSS) → Phase 2 (Components). CSS changes are additive and don't touch the public API.

---

## Design Principles (from research)

1. **Diegetic-first:** each effect communicates exactly one signal — no ambiguity, no decoration
2. **Emotional loop integrity:** fresh → cooling → frozen → threat → shatter maps to a psychological arc, not just visual states
3. **Cognitive load reduction:** effects guide attention, they don't compete for it
4. **Cyan is the glow color, red is the threat color** — they are distinct and must not bleed into each other
5. **piOS mantras are system output** — typography and opacity should read like terminal messages

---

## Phase 1: CSS Modernization

### 1.1 Token System Overhaul (`css/tokens.css`)

#### New tokens

| Token                | Value                                                      | Purpose                                                       |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `--sh-threat`        | `oklch(52% 0.22 25)`                                       | Crystalline red — pure hue, more saturated than #DC2626       |
| `--sh-phosphor`      | `oklch(85% 0.18 195)`                                      | **NEW** — cyan CRT phosphor glow, hue 180-195                 |
| `--sh-phosphor-glow` | `color-mix(in oklch, var(--sh-phosphor) 20%, transparent)` | **NEW** — derived phosphor ambient                            |
| `--sh-threat-glow`   | `color-mix(in oklch, var(--sh-threat) 15%, transparent)`   | Derived from threat — stays in sync when overridden           |
| `--sh-frozen`        | `oklch(55% 0.04 240)`                                      | Desaturated slate                                             |
| `--sh-glass`         | `color-mix(in oklch, var(--sh-threat) 25%, white)`         | **Changed** — red-tinted crystalline (not white)              |
| `--sh-void`          | `#000000`                                                  | **Changed** — pure black per piOS spec                        |
| `--sh-bright`        | `#FFFFFF`                                                  | **NEW** — piOS bright text                                    |
| `--sh-middle`        | `#D3D3D3`                                                  | **NEW** — piOS mid text                                       |
| `--sh-dim`           | `#808080`                                                  | **NEW** — piOS dim text                                       |
| `--sh-font`          | `'Perfect DOS VGA 437', 'Fixedsys Excelsior', monospace`   | **NEW** — piOS terminal font stack                            |
| `--sh-crt-stripe`    | `block`                                                    | **NEW** — CRT scanline stripe toggle (block/none)             |
| `--sh-crt-scanline`  | `none`                                                     | **NEW** — moving scan beam (block/none, off by default)       |
| `--sh-crt-flicker`   | `none`                                                     | **NEW** — phosphor flicker (flicker/none, off + a11y warning) |

#### light-dark() consolidation

Replace the duplicated `[data-theme="dark"]` + `@media (prefers-color-scheme: dark)` blocks with a single `light-dark()` declaration per token:

```css
color-scheme: light dark;
--sh-threat: light-dark(oklch(52% 0.22 25), oklch(62% 0.22 25));
--sh-phosphor: light-dark(oklch(55% 0.18 195), oklch(85% 0.18 195));
```

Eliminates ~12 lines of duplication. Browser picks the correct value automatically.

#### @property registration

Register all color and timing tokens as typed properties — enables smooth transition when consumers override them:

```css
@property --sh-threat {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(52% 0.22 25);
}
@property --sh-phosphor {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(85% 0.18 195);
}
@property --sh-shatter-duration {
  syntax: "<time>";
  inherits: true;
  initial-value: 600ms;
}
/* etc. for all tokens */
```

---

### 1.2 CSS Architecture (`css/superhot.css`)

#### @layer structure

Declare at top of file — controls cascade without !important:

```css
@layer superhot.tokens, superhot.base, superhot.effects, superhot.crt;
```

- `superhot.tokens` — custom property declarations
- `superhot.base` — freshness states, responsive degradation
- `superhot.effects` — glitch, threat-pulse, mantra, shatter
- `superhot.crt` — CRT overlay infrastructure

Consumers override by placing their rules outside any layer (unlayered always wins).

#### CSS nesting

Effect variants nest inside their parent selector — single source of truth per attribute:

```css
@layer superhot.effects {
  [data-sh-effect="glitch"] {
    /* base glitch */
    &[data-sh-glitch-intensity="high"] {
      /* high variant */
    }
    &[data-sh-glitch-intensity="low"] {
      /* low variant */
    }

    @media (min-width: 640px) and (max-width: 1023px) {
      /* tablet degradation */
    }
    @media (prefers-reduced-motion: reduce) {
      /* motion disable */
    }
  }
}
```

#### animation-composition: accumulate

Prevents frozen + threat-pulse from fighting over `filter`/`border-color`:

```css
[data-sh-state] {
  animation-composition: accumulate;
}
[data-sh-effect="threat-pulse"] {
  animation-composition: accumulate;
}
```

---

### 1.3 Visual Enhancements

#### @starting-style on freshness states

Cards that render already-cooled now animate in from fresh:

```css
[data-sh-state="cooling"] {
  filter: saturate(0.7);
  @starting-style {
    filter: none;
  }
}
```

#### backdrop-filter on frozen (with @supports guard)

```css
@supports (backdrop-filter: blur(1px)) {
  [data-sh-state="frozen"] {
    backdrop-filter: blur(2px) brightness(0.85);
  }
}
```

#### contain: layout style on effect containers

```css
[data-sh-mantra],
[data-sh-state="stale"] {
  contain: layout style;
}
```

#### drop-shadow for threat pulse

Replace `box-shadow` (rectangle-only) with `filter: drop-shadow()` (follows actual shape):

```css
@keyframes sh-threat-glow {
  50% {
    filter: drop-shadow(0 0 8px var(--sh-threat));
  }
}
```

#### Phosphor glow on mantra text

```css
[data-sh-mantra]::before {
  font-family: var(--sh-font);
  text-shadow:
    0 0 2px var(--sh-phosphor),
    0 0 6px var(--sh-phosphor-glow);
}
```

#### Container queries for responsive degradation

Replace viewport breakpoints with container queries — effects degrade based on card size, not screen size:

```css
@container (max-width: 320px) {
  .sh-fragment {
    animation: none;
    opacity: 0;
  }
  [data-sh-mantra]::before {
    display: none;
  }
}
```

Consumers must declare `container-type: inline-size` on card wrappers.

#### CRT layer (`@layer superhot.crt`)

Three independently toggleable overlays via custom property switches:

```css
@layer superhot.crt {
  .sh-crt {
    /* Scanline stripes — cheap, always-on option */
    &::before {
      display: var(--sh-crt-stripe, none);
      content: "";
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(0, 0, 0, 0.08) 3px,
        rgba(0, 0, 0, 0.08) 4px
      );
    }
    /* Moving scan beam — performance-intensive, off by default */
    &::after {
      display: var(--sh-crt-scanline, none);
      animation: sh-crt-scan 3s linear infinite;
    }
  }
  /* Flicker — accessibility warning, opt-in only */
  @keyframes sh-crt-flicker {
    /* rapid opacity pulse */
  }
}
```

#### Accessibility additions

```css
@media (prefers-contrast: more) {
  [data-sh-state="frozen"] {
    opacity: 0.9;
    filter: grayscale(0.4);
  } /* less reduction */
  [data-sh-state="cooling"] {
    filter: saturate(0.9);
  } /* barely reduced */
}

@media (forced-colors: active) {
  --sh-threat: Highlight;
  --sh-frozen: GrayText;
  [data-sh-effect="threat-pulse"] {
    border-color: Highlight;
  }
}
```

---

## Phase 2: Component Modernization

### 2.1 JSX Transform

Remove `import { h } from 'preact'` from all components — configure esbuild JSX transform in `esbuild.config.mjs`:

```js
jsxFactory: 'h',
jsxFragment: 'Fragment',
jsxImportSource: 'preact',
```

All 5 components shift to standard JSX without the manual `h` import.

### 2.2 Preact Signals for ShFrozen

Replace 30-second polling `setInterval` with `useSignalEffect` — freshness updates the moment `timestamp` signal changes, not on the next poll tick:

- `timestamp` prop becomes a `Signal<number>` (consumers pass a signal)
- `useSignalEffect` re-runs when `timestamp.value` changes
- Fallback: accept plain `number` prop for non-signal consumers via overload

### 2.3 Shatter fragment count

Default fragments: 6 → 12. Fragment color: white glass → red-tinted crystalline (`--sh-glass`). Reflects the game's cathartic shattering feel.

---

## What Doesn't Change

- Every `data-sh-*` attribute name
- Every JS utility function signature (`applyFreshness`, `shatterElement`, `glitchText`, `applyMantra`, `removeMantra`)
- The three-layer progressive enhancement model (CSS → JS → Preact)
- All 10 existing unit tests pass without modification

---

## File Changes Summary

| File                       | Change type                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `css/tokens.css`           | Overhaul — @property, oklch, light-dark(), 6 new tokens                   |
| `css/superhot.css`         | @layer, nesting, @starting-style, @supports, container queries, CRT layer |
| `preact/ShFrozen.jsx`      | Signals support, remove `import { h }`                                    |
| `preact/ShShatter.jsx`     | Remove `import { h }`, fragment count/color update                        |
| `preact/ShGlitch.jsx`      | Remove `import { h }`                                                     |
| `preact/ShMantra.jsx`      | Remove `import { h }`                                                     |
| `preact/ShThreatPulse.jsx` | Remove `import { h }`                                                     |
| `esbuild.config.mjs`       | JSX transform config                                                      |
| `js/shatter.js`            | Default fragments 6 → 12                                                  |

---

## Success Criteria

1. All 10 existing unit tests pass unchanged
2. `npm run build` produces all 3 dist files
3. `demo.html` shows all effects working — frozen cards visibly animate in, shatter feels more cathartic, mantra text has phosphor glow
4. Container query degradation works: a 200px-wide card simplifies effects on desktop
5. `prefers-contrast: more` and `forced-colors: active` modes tested manually
6. No consumer-facing API changes — ARIA imports unchanged
