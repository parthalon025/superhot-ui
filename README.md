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

## Installation

**As a local package (sibling repo):**

```bash
npm install file:../superhot-ui
```

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

### JS utilities

```js
import { applyFreshness, glitchText, shatterElement, applyMantra } from "superhot-ui";

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
import { ShFrozen, ShShatter, ShGlitch, ShMantra, ShThreatPulse } from "superhot-ui/preact";

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

---

## License

MIT
