# superhot-ui

> **Time moves only when you move.**

A CSS-first visual effects package for dashboards, inspired by SUPERHOT. Minimalist. Striking. Time-bending.

No runtime required. Drop in a stylesheet, add an attribute, and your UI starts behaving like the world just froze.

---

## Who This Is For

- **Frontend developers** building dashboards, monitoring UIs, or real-time data displays who want distinctive visual effects that communicate data state (staleness, alerts, loading) through motion and aesthetics rather than just color
- **SUPERHOT fans** who want those aesthetics in a web project
- **Developers** who want CSS-first effects that work without a JavaScript animation library — just attributes and stylesheets

**Not for:** production marketing sites or accessibility-sensitive interfaces. These effects are intentionally striking and motion-heavy.

## Prerequisites

- A browser (effects are pure CSS — no JavaScript runtime required for basic use)
- Node.js 18+ for building from source or using the Preact wrappers
- Preact or React (only if using the component wrappers — raw CSS works standalone)

---

## Effects

### Freshness — _Time stopped. Or did it?_

Data ages. `freshness` makes that visible. An element transitions from **full color** → **cooling** → **slate grey** → **ghosted** as its timestamp gets older. Time-freeze aesthetics applied to real staleness.

Four states, driven by data age:

| State     | Age       | Look                            |
| --------- | --------- | ------------------------------- |
| `fresh`   | < 5 min   | Full color, alive               |
| `cooling` | 5–30 min  | Slightly desaturated            |
| `frozen`  | 30–60 min | Slate grey, translucent         |
| `stale`   | > 60 min  | Ghost — faded to near-invisible |

**CSS attribute:**

```html
<div data-sh-state="frozen">Last seen: 42 minutes ago</div>
```

**JS:**

```js
import { applyFreshness } from "superhot-ui";

applyFreshness(element, timestamp);
// Re-evaluates every 30s automatically via ShFrozen component
```

**Preact:**

```jsx
import { ShFrozen } from "superhot-ui/preact";

<ShFrozen timestamp={lastUpdated} thresholds={{ cooling: 300, frozen: 1800, stale: 3600 }}>
  {sensorValue}
</ShFrozen>;
```

---

### Shatter — _Click to destroy_

On dismiss, an element doesn't fade out. It **shatters** — splitting into jagged CSS fragments that drift outward, rotate, and dissolve. Satisfying. Final.

Parent must have `position: relative` — fragments are absolutely positioned during the animation.

**JS:**

```js
import { shatterElement } from "superhot-ui";

shatterElement(element, { onComplete: () => removeFromDom(element) });
```

**Preact:**

```jsx
import { ShShatter } from "superhot-ui/preact";

<ShShatter onDismiss={() => setAlerts((prev) => prev.filter((a) => a.id !== id))}>
  <AlertCard alert={alert} />
</ShShatter>;
```

Clicking anywhere on the `ShShatter` wrapper triggers the animation, then calls `onDismiss` when fragments have cleared.

---

### Glitch — _Reality hiccups_

A burst of chromatic aberration. Text splits into red/blue ghost copies, snaps back. Good for error states, warnings, or anything that needs to feel like a system fault.

Three intensity levels: `low`, `medium` (default), `high`.

**CSS attribute:**

```html
<div data-sh-effect="glitch" data-sh-glitch-intensity="high">SYSTEM ERROR</div>
```

**JS (one-shot, returns Promise):**

```js
import { glitchText } from "superhot-ui";

await glitchText(element, { duration: 300, intensity: "high" });
// Cleans up automatically after duration
```

**Preact:**

```jsx
import { ShGlitch } from "superhot-ui/preact";

<ShGlitch active={hasError} intensity="high">
  Connection lost
</ShGlitch>;
```

---

### Mantra — _The words behind everything_

A repeating text watermark tiled across the element background — like the SUPERHOT title screen. Subtle at rest, unavoidable at a glance. Use it for critical state overlays, empty states, or ambient classification labels.

**CSS attribute:**

```html
<div data-sh-mantra="OFFLINE · OFFLINE · OFFLINE">
  <!-- content here -->
</div>
```

**JS:**

```js
import { applyMantra } from "superhot-ui";

applyMantra(element, "ALERT · ALERT · ALERT");
```

**Preact:**

```jsx
import { ShMantra } from "superhot-ui/preact";

<ShMantra text="OFFLINE" active={isOffline}>
  <SystemStatusPanel />
</ShMantra>;
```

---

### Threat Pulse — _Something is wrong_

A crystalline red glow that pulses outward from the element. One pulse, two pulses — then gone. Or persistent, if the threat hasn't passed.

Uses `--sh-threat` (default `#DC2626`) for the glow color.

**CSS attribute:**

```html
<div data-sh-effect="threat-pulse">Critical alert</div>
```

**Preact:**

```jsx
import { ShThreatPulse } from 'superhot-ui/preact';

// One-shot: pulses and clears automatically
<ShThreatPulse active={newAlert}>
  <AlertBadge count={alertCount} />
</ShThreatPulse>

// Persistent: keeps pulsing until the threat resolves
<ShThreatPulse active={systemDown} persistent>
  <StatusIndicator label="Offline" />
</ShThreatPulse>
```

---

### CRT Toggle — _The display breathes_

User-configurable CRT scanline intensity. Four levels — off, low, medium, high — rendered as a segmented button selector. The consuming project applies the chosen intensity as a CSS custom property (`--crt-scanline-opacity`).

Two modes:

**Intensity mode** (recommended — single knob):

```jsx
import { ShCrtToggle } from "superhot-ui/preact";

<ShCrtToggle
  intensity={intensity} // 'off' | 'low' | 'medium' | 'high'
  onIntensityChange={({ intensity }) => setIntensity(intensity)}
/>;
```

Renders four segmented buttons. `onIntensityChange` is called with `{ intensity }` on selection.

**Granular mode** (three booleans):

```jsx
<ShCrtToggle
  stripe={stripe}
  scanline={scanline}
  flicker={flicker}
  onChange={({ stripe, scanline, flicker }) => setState({ stripe, scanline, flicker })}
/>
```

> **Accessibility:** The `flicker` option carries a photosensitivity warning. The component renders this warning automatically when in granular mode.

**Stateless** — the consuming project handles localStorage persistence and CSS variable application:

```js
// Typical pattern
function applyCrtIntensity(intensity) {
  const opacityMap = { off: 0, low: 0.02, medium: 0.05, high: 0.1 };
  document.documentElement.style.setProperty(
    "--crt-scanline-opacity",
    opacityMap[intensity] ?? opacityMap.medium,
  );
  localStorage.setItem("crt-prefs", JSON.stringify({ intensity }));
}
```

---

### Skeleton — _Waiting for the world to materialize_

Data that hasn't arrived yet. `ShSkeleton` renders phosphor-shimmer placeholder rows — a sweep of glow light across grey bars, frozen in place until content loads.

**CSS:**

```html
<div class="sh-skeleton" style="width: 100%; height: 1em"></div>
```

**Preact:**

```jsx
import { ShSkeleton } from "superhot-ui/preact";

<ShSkeleton rows={3} width="100%" height="1em" />;
```

Props: `rows` (default `3`), `width` (default `"100%"`), `height` (default `"1em"`), `class`.

---

### Toast — _The terminal speaks_

System events rendered as timestamped terminal output lines. Three severity levels: `info`, `warn`, `error`. Slides in from the right, shatters on dismiss. Persistent `error` toasts automatically get a `threat-pulse`.

**Preact:**

```jsx
import { ShToast } from "superhot-ui/preact";

// Auto-dismisses after 3s (default), shatters on click
<ShToast type="info" message="Queue job complete." onDismiss={() => remove(id)} />

// Persistent error — stays until clicked, pulses threat
<ShToast type="error" message="Connection lost." duration={0} onDismiss={() => setError(null)} />
```

Props: `type` (`'info'|'warn'|'error'`, default `'info'`), `message`, `duration` (ms, default `3000`, `0` = persistent), `onDismiss`, `class`.

Wrap multiple toasts in `.sh-toast-container` for stacked positioning.

---

### Status Badge — _All nodes visible_

Inline health state indicator for entities. A bordered, monospace badge that glows the status color — green for healthy, red for error, amber for warning, dim for waiting.

**CSS attribute:**

```html
<span class="sh-status-badge" data-sh-status="healthy">healthy</span>
<span class="sh-status-badge" data-sh-status="error" data-sh-glow="false">error</span>
```

Valid `data-sh-status` values: `healthy`, `ok`, `active`, `error`, `warning`, `waiting`.

**Preact:**

```jsx
import { ShStatusBadge } from "superhot-ui/preact";

<ShStatusBadge status="healthy" />
<ShStatusBadge status="warning" label="DEGRADED" glow={false} />
```

Props: `status` (required), `label` (defaults to `status` value), `glow` (default `true`), `class`.

---

### VRAM Bar — _Memory pressure made visible_

A 4px progress bar that interpolates from phosphor green to threat red as fill pressure rises. Threshold markers appear at 80% and 95%. CSS-only — no JS required.

**CSS:**

```html
<div class="sh-vram-bar" style="--sh-fill: 72"></div>
```

Set `--sh-fill` to a number from `0` to `100`. The bar fill, color, and transition update automatically. Threshold marker lines are rendered via `::after`.

---

### Command Palette — _Enter command mode_

A full-screen overlay with a fuzzy-filtered command list. Glitches in on open. Keyboard-navigable (↑/↓, Enter, Escape). Closes on backdrop click.

**Preact:**

```jsx
import { ShCommandPalette } from "superhot-ui/preact";

const commands = [
  { id: "refresh", label: "Refresh data", description: "Pull latest from API" },
  { id: "settings", label: "Open settings" },
];

<ShCommandPalette
  open={paletteOpen}
  items={commands}
  onSelect={(item) => {
    item.action?.();
    setPaletteOpen(false);
  }}
  onClose={() => setPaletteOpen(false)}
  placeholder="Type a command..."
/>;
```

Props: `open` (required boolean), `items` (array of `{id, label, description?, action?}`), `onSelect` (called with selected item object), `onClose`, `placeholder` (default `"Type a command..."`), `class`.

---

### Audio — _The system has a voice_

Procedural sound effects via Web Audio API. Opt-in — silent by default. Respects `prefers-reduced-motion`.

Four sound types: `complete` (two ascending sine tones), `error` (distorted sawtooth), `dlq` (low sine), `pause` (brief high tone).

**JS:**

```js
import { ShAudio, playSfx } from "superhot-ui";

// Enable once from user preference
ShAudio.enabled = true;

playSfx("complete"); // job finished
playSfx("error"); // system fault
playSfx("dlq"); // dead-letter / unrecoverable
playSfx("pause"); // queue paused
```

`ShAudio.enabled` defaults to `false`. Set it from a user preference toggle — never enable automatically.

---

## Installation

**As a local package (sibling repo):**

```bash
npm install file:../superhot-ui
node node_modules/superhot-ui/scripts/setup.js
```

The setup script handles: symlink fix for worktrees, CLAUDE.md design rules injection, postinstall
wiring, and esbuild Preact alias detection. Run it once — after that `npm install` keeps it updated
automatically.

**CSS only (no build step):**

```html
<link rel="stylesheet" href="../superhot-ui/css/superhot.css" />
```

**After cloning:**

```bash
npm install
npm run build   # produces dist/superhot.css, dist/superhot.js, dist/superhot.preact.js
```

---

## Usage

### CSS only

```html
<link rel="stylesheet" href="superhot-ui/css" />

<!-- Freshness -->
<div data-sh-state="cooling">5 minutes ago</div>

<!-- Glitch -->
<div data-sh-effect="glitch">ERROR</div>

<!-- Threat Pulse -->
<div data-sh-effect="threat-pulse">ALERT</div>

<!-- Mantra -->
<div data-sh-mantra="SUPERHOT · SUPERHOT · SUPERHOT">Loading...</div>
```

### Semantic token layer

`@import 'superhot-ui/css'` is the recommended single-import path for consuming dashboards. It pulls in the full package: primitive effect CSS, semantic tokens (`--bg-*`, `--color-*`, `--text-*`, `--status-*`, etc.), and all DS component CSS.

```css
/* In your project's main CSS file */
@import "superhot-ui/css";

/* Tokens only (if you want to override before importing effects) */
@import "superhot-ui/tokens";

/* Override semantic tokens for project-specific needs */
:root {
  --bg-base: #0a0a0a;
}
```

### JS utilities

```js
import {
  applyFreshness,
  glitchText,
  shatterElement,
  applyMantra,
  playSfx,
  setCrtMode,
} from "superhot-ui";

// Freshness: auto-computes state from timestamp
applyFreshness(document.querySelector("#sensor"), new Date(lastSeen));

// Glitch: one-shot burst, Promise-based
await glitchText(document.querySelector("#status"), { intensity: "high" });

// Shatter: fragment and dissolve on click
shatterElement(document.querySelector("#card"), {
  onComplete: () => card.remove(),
});

// Mantra: tiled background watermark
applyMantra(document.querySelector("#panel"), "OFFLINE");
```

### Preact components

```jsx
import {
  ShFrozen,
  ShShatter,
  ShGlitch,
  ShMantra,
  ShThreatPulse,
  ShSkeleton,
  ShToast,
  ShStatusBadge,
  ShCommandPalette,
  ShCrtToggle,
} from "superhot-ui/preact";

function Dashboard() {
  return (
    <div>
      <ShThreatPulse active={criticalAlertCount > 0} persistent>
        <ShMantra text="ALERT" active={criticalAlertCount > 0}>
          <ShFrozen timestamp={lastRefresh}>
            <DataPanel />
          </ShFrozen>
        </ShMantra>
      </ShThreatPulse>

      {alerts.map((alert) => (
        <ShShatter key={alert.id} onDismiss={() => dismiss(alert.id)}>
          <AlertCard alert={alert} />
        </ShShatter>
      ))}
    </div>
  );
}
```

---

## Customization

All visual properties are CSS custom properties. Override any `--sh-*` token in your stylesheet:

```css
:root {
  --sh-threat: #ff00ff; /* Threat glow color */
  --sh-frozen: #475569; /* Frozen state color */
  --sh-shatter-duration: 400ms; /* Fragment animation speed */
  --sh-glitch-duration: 200ms; /* Glitch burst duration */
  --sh-threat-pulse-duration: 1.5s; /* Pulse cycle duration */
  --sh-frost-shimmer-duration: 3s; /* Frozen shimmer speed */
}
```

Dark mode is handled automatically via `[data-theme="dark"]` attribute or `prefers-color-scheme: dark`.

---

## Tech Stack

- **CSS** — attribute-selector-driven, zero runtime for pure CSS usage
- **JS** — vanilla ESM, no dependencies
- **Preact** — thin wrappers, peer dependency (`preact >= 10`)
- **Build** — esbuild, three outputs: CSS, JS, Preact bundle

---

## Accessibility

All animations respect `prefers-reduced-motion`. When motion is disabled, visual state indicators (color, opacity, text) remain; animation is suppressed.

---

## Gotchas

- `dist/` is gitignored — run `npm run build` after cloning
- Shatter requires `position: relative` on the parent element
- Glitch uses a `::before` pseudo-element — the JS utility sets `data-sh-glitch-text` automatically, but if you're using the CSS attribute directly you must set it manually
- Preact components require `preact` as a peer dependency (not bundled)
- `file:` dependency creates a relative symlink — breaks silently inside worktrees (see Installation above)
- `--sh-fill` in `.sh-vram-bar` is a unitless number 0–100, not a percentage string — `72` not `"72%"`
- Never use `h` or `Fragment` as callback parameter names in JSX — esbuild injects `h` as JSX factory and shadowing it causes silent render crashes

---

## License

MIT
