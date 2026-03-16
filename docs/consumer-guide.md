# superhot-ui Consumer Guide

How to integrate superhot-ui into a project dashboard. Read this before building any UI.

---

## Install

```bash
npm install file:../superhot-ui
```

Or if the project is nested deeper:

```bash
npm install file:../../superhot-ui
```

**First-time setup** — run once after installing:

```bash
node node_modules/superhot-ui/scripts/setup.js
```

This script:

- Fixes the `node_modules/superhot-ui` symlink to an absolute path (worktree compatibility)
- Injects the superhot-ui design rules block into your `CLAUDE.md`
- Adds a `postinstall` entry to your `package.json` so setup re-runs automatically on `npm install`
- Prints the esbuild Preact alias snippet if your config needs it

**After that**, every `npm install` runs setup automatically via the patched postinstall.

**esbuild dual-Preact crash:** If setup prints an alias snippet, add it to your `esbuild.config.mjs`
bundle options. `file:` deps with their own `node_modules/preact` cause two Preact instances —
silent render failures.

---

## Import Paths

```js
// CSS (in your main CSS file or index.css)
@import 'superhot-ui/css';

// Tokens only (if you want to override before importing effects)
@import 'superhot-ui/tokens';

// JS utilities (vanilla)
import { applyFreshness, shatterElement, glitchText, applyMantra, removeMantra, playSfx, setCrtMode } from 'superhot-ui';

// Preact components
import { ShFrozen, ShShatter, ShGlitch, ShMantra, ShThreatPulse,
         ShSkeleton, ShToast, ShStatusBadge, ShStatCard,
         ShCommandPalette, ShCrtToggle } from 'superhot-ui/preact';
```

---

## CRT Mode

Enable globally in your layout root CSS:

```css
.layout-root {
  --sh-crt-stripe: block; /* scanline stripes — recommended */
  --sh-crt-scanline: none; /* moving scan beam — performance cost */
  --sh-crt-flicker: none; /* phosphor flicker — a11y risk */
}
```

Or use `ShCrtToggle` + `setCrtMode()` for user-controlled intensity:

```jsx
import { setCrtMode } from "superhot-ui";
import { ShCrtToggle } from "superhot-ui/preact";

<ShCrtToggle
  stripe={crtPrefs.stripe}
  scanline={crtPrefs.scanline}
  flicker={crtPrefs.flicker}
  onChange={(prefs) => {
    setCrtMode(prefs);
    localStorage.setItem("crt-prefs", JSON.stringify(prefs));
  }}
/>;
```

---

## Token Overrides

Override any `--sh-*` token before the effect CSS loads:

```css
:root {
  --sh-shatter-duration: 400ms; /* faster shatters */
  --sh-threat-pulse-duration: 1s; /* faster pulse */
}
```

Override semantic tokens for project-specific needs:

```css
:root {
  --bg-base: #0a0a0a; /* slightly off-black instead of pure void */
}
```

---

## Atmosphere Utilities

Read `docs/atmosphere-guide.md` for the full 20-rule guide. Key imports:

### Glow Hierarchy

```css
/* Apply to any element for visual priority levels */
.sh-glow-ambient    /* 4px phosphor — recedes */
.sh-glow-standard   /* 8px phosphor — standard focus */
.sh-glow-critical   /* 16px threat — demands attention */
.sh-glow-none       /* explicitly remove glow */
```

### Empty States

```jsx
import { ShEmptyState } from "superhot-ui/preact";

<ShEmptyState mantra="STANDBY" hint="Ctrl+K" />;
```

### CRT Presets

```js
import { setCrtPreset } from "superhot-ui";

setCrtPreset("data"); // stripe only — for tables/charts
setCrtPreset("status"); // stripe + scanline — for status dashboards
setCrtPreset("immersive"); // all three — for ambient displays
setCrtPreset("off"); // disable all CRT effects
```

### Effect Density

```js
import { trackEffect, isOverBudget } from "superhot-ui";

// Register when an effect starts
const cleanup = trackEffect("threat-pulse-card-3");

// Check budget before adding more
if (!isOverBudget()) {
  // safe to add another effect
}

// Call cleanup when effect ends
cleanup();
```

### Shatter Presets

```js
import { shatterElement } from "superhot-ui";

shatterElement(el, "toast"); // 4 fragments — quick dismissal
shatterElement(el, "cancel"); // 6 fragments — deliberate destruction
shatterElement(el, "alert"); // 8 fragments — dramatic catharsis
shatterElement(el, "purge"); // 12 fragments — overwhelming release
```

### Rest-Frame Tokens

```css
/* Use these between animations to let the interface breathe */
animation-delay: var(--rest-after-shatter); /* 300ms */
animation-delay: var(--rest-after-glitch); /* 200ms */
animation-delay: var(--rest-after-state-change); /* 500ms */
animation-delay: var(--rest-after-navigation); /* 200ms */
```

---

## Component Composition

Effects compose via `animation-composition: accumulate` — stack as many as needed:

```jsx
// Threat panel: frozen + pulsing + watermarked simultaneously
<ShThreatPulse active={isUnhealthy} persistent>
  <ShMantra text="BACKEND OFFLINE" active={isUnhealthy}>
    <ShFrozen timestamp={lastHealthCheck}>
      <BackendCard backend={backend} />
    </ShFrozen>
  </ShMantra>
</ShThreatPulse>
```

```jsx
// Error row: glitches when failed, shatters when dismissed
<ShShatter onDismiss={() => dismissDlqEntry(entry.id)}>
  <ShGlitch active={entry.status === "failed"} intensity="medium">
    <DlqRow entry={entry} />
  </ShGlitch>
</ShShatter>
```

---

## VRAM Bar

```jsx
// CSS utility — no component import needed
<div class="sh-vram-bar" style={`--sh-fill: ${backend.vram_pct}`}>
  {backend.vram_pct}%
</div>
```

Wire to a signal for live interpolation:

```jsx
import { useSignal } from "@preact/signals";

const vramPct = useSignal(0);
// update vramPct.value from polling
<div class="sh-vram-bar" style={`--sh-fill: ${vramPct.value}`} />;
```

---

## Command Palette

ShCommandPalette provides the shell — the consuming project provides items and binds the key:

```jsx
import { useSignal } from "@preact/signals";
import { ShCommandPalette } from "superhot-ui/preact";

const paletteOpen = useSignal(false);

// Bind Cmd+K / Ctrl+K in app root
useEffect(() => {
  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      paletteOpen.value = !paletteOpen.value;
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

// Build items from store signals
const items = [
  {
    id: "submit",
    label: "Submit Job",
    description: "Queue a new job",
    action: () => openSubmitModal(),
  },
  {
    id: "pause",
    label: "Pause Daemon",
    description: "Stop processing jobs",
    action: () => pauseDaemon(),
  },
  // ... sourced from stores
];

<ShCommandPalette
  open={paletteOpen.value}
  items={items}
  placeholder="Type a command..."
  onSelect={(item) => {
    item.action();
    paletteOpen.value = false;
  }}
  onClose={() => (paletteOpen.value = false)}
/>;
```

---

## Toast Notifications

```jsx
import { useSignal } from "@preact/signals";
import { ShToast } from "superhot-ui/preact";

const toasts = useSignal([]);

const addToast = (type, message, duration = 3000) => {
  const id = Date.now();
  toasts.value = [...toasts.value, { id, type, message, duration }];
};

// In JSX
{
  toasts.value.map((toast) => (
    <ShToast
      key={toast.id}
      type={toast.type}
      message={toast.message}
      duration={toast.duration}
      onDismiss={() => (toasts.value = toasts.value.filter((t) => t.id !== toast.id))}
    />
  ));
}
```

---

## Audio (opt-in)

```js
import { playSfx } from "superhot-ui";

// Enable from user preference (default: off)
import { ShAudio } from "superhot-ui";
ShAudio.enabled = localStorage.getItem("sfx-enabled") === "true";

// Play on events
playSfx("complete"); // job finished
playSfx("error"); // job failed / DLQ
playSfx("pause"); // daemon paused
```

---

## Design Pipeline

```
ui-template (base tokens)
    ↓
superhot-ui (SUPERHOT theme + effects + components)
    ↓
project dashboards (ollama-queue, ha-aria, project-hub)
```

Token NAME changes in `ui-template` cascade through superhot-ui to all consumers. Coordinate before renaming tokens across the pipeline.

New UI patterns always go in superhot-ui first. Never build a DS-worthy component directly in a consuming project.
