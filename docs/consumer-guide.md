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

## Threshold Signaling

```js
import { computeThreshold, applyThreshold } from "superhot-ui";

// Pure computation
const level = computeThreshold(vramPct); // 'calm'|'ambient'|'standard'|'critical'

// DOM application (auto-applies sh-glow-* class)
applyThreshold(el, vramPct);
applyThreshold(el, cpuPct, { ambient: 50, standard: 70, critical: 85 });
```

Progressive glow escalation based on metric percentage (atmosphere Rule 39).

---

## Polling Heartbeat

```js
import { heartbeat } from "superhot-ui";

// Call on each successful poll response
const data = await fetchStatus();
heartbeat(lastUpdatedEl, data.timestamp);
```

Fires a glitch micro-burst + freshness re-evaluation on each poll (atmosphere Rule 32). The dashboard "breathes" — regular heartbeat = alive, no heartbeat = frozen.

---

## Failure Escalation

```js
import { EscalationTimer } from "superhot-ui";

const esc = new EscalationTimer({
  onEscalate: (level, name) => {
    if (name === "section") applyMantra(sectionEl, "BACKEND OFFLINE");
    if (name === "layout") applyMantra(layoutEl, "SYSTEM DEGRADED");
  },
  onReset: () => removeMantra(layoutEl),
});

// On failure detected:
esc.start(); // begins 5s → 15s → 60s → 120s escalation

// On recovery:
esc.reset();
```

4-stage timeline: component → sidebar → section mantra → layout mantra (atmosphere Rule 12).

---

## Recovery Sequence

```js
import { recoverySequence } from "superhot-ui";

await recoverySequence({
  glitchFn: () => glitchText(el, { duration: 100, intensity: "low" }),
  onBorderTransition: () => (el.style.borderColor = "var(--sh-phosphor)"),
  onPulseStop: () => el.removeAttribute("data-sh-effect"),
  onToast: () => addToast("info", "RESTORED"),
});
```

5-step async recovery choreography: glitch → border → pulse stop → toast → calm (atmosphere Rule 37).

---

## Modal

```jsx
import { ShModal } from "superhot-ui/preact";

<ShModal
  open={confirmOpen}
  title="CONFIRM: PURGE DLQ (3 ENTRIES)"
  body="IRREVERSIBLE."
  onConfirm={() => {
    purge();
    setConfirmOpen(false);
  }}
  onCancel={() => setConfirmOpen(false)}
/>;
```

System interrupt — world pauses, piOS demands input (atmosphere Rule 29). Focus traps to confirm button, Escape key dismisses, overlay click cancels.

---

## ANSI Text Attributes

```html
<span class="sh-ansi-bold sh-ansi-fg-red">ERROR</span>
<span class="sh-ansi-dim">background process</span>
<span class="sh-ansi-blink sh-ansi-fg-cyan">ALERT</span>
<span class="sh-ansi-reverse">SELECTED</span>
<span class="sh-ansi-strike">deprecated</span>
```

Full CGA colors for log rendering:

```html
<div data-sh-ansi-mode="full">
  <span class="sh-ansi-fg-green">success</span>
  <span class="sh-ansi-fg-magenta">debug info</span>
</div>
```

10 SGR text attributes + 16-color foreground/background palette. Default mode maps ANSI colors to the superhot palette; `data-sh-ansi-mode="full"` enables standard CGA colors.

---

## Utility Classes

```html
<!-- Spacing (Rule 33) -->
<div class="sh-grid sh-grid-3 sh-gap-section">...</div>

<!-- Typography -->
<span class="sh-label">STATUS</span>
<span class="sh-value">197</span>
<span class="sh-status-code">running</span>

<!-- Opacity (Rule 30) -->
<div class="sh-opacity-secondary">supporting context</div>
<div class="sh-opacity-historical">completed jobs</div>

<!-- Terminal prompt -->
<div class="sh-prompt">ls -la</div>
<div class="sh-prompt-root">systemctl restart nginx</div>
```

---

## Monitor Variants

```html
<!-- Amber phosphor (P3 monitor) -->
<div data-sh-monitor="amber">...</div>

<!-- Green phosphor (P1 monitor) -->
<div data-sh-monitor="green">...</div>
```

Override `--sh-phosphor` for the entire subtree. Apply to layout root or individual sections.

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
