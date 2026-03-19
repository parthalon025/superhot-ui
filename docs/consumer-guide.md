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

## Signal Degradation

```html
<div class="sh-signal-degraded">
  <MyDataCard source="{unreliableApi}" />
</div>
```

SVG noise overlay + jitter animation signals that a data source is unreliable (T3 alert). Stacks with other effects — wrap any container to mark its contents as degraded.

---

## Interlace (Surveillance Mode)

```html
<div class="sh-interlace">
  <SecurityFeed camera="{cam1}" />
</div>
```

Repeating scan line overlay for passive monitoring contexts (T1 ambient). Purely cosmetic — no interaction or data implications.

---

## Burn-in (Anchor Elements)

```html
<div class="sh-frame" data-sh-burn-in="SYSTEMS" data-label="SYSTEMS">...content...</div>
```

Ghost text pseudo-element for permanent UI landmarks (T1 ambient). The burn-in value appears as a faint centered watermark behind the content — use for section headers or frames that never change identity.

---

## Boot Sequence

```js
import { bootSequence } from "superhot-ui";
const cleanup = bootSequence(
  containerEl,
  ["piOS v2.1.0", "LOADING MODULES...", "QUEUE: ONLINE", "SYSTEM READY"],
  { onComplete: () => startApp() },
);
```

Progressive typewriter text reveal for system initialization. Each line appears with a clip-path animation, then locks into a solid state. The last line gets a blinking cursor. Returns a cleanup function that cancels pending timers.

Container element should have `.sh-boot-container` class for terminal styling.

---

## Matrix Rain

```jsx
import { ShMatrixRain } from "superhot-ui/preact";
<ShMatrixRain active={isProcessing} density="medium">
  <ProcessingCard job={currentJob} />
</ShMatrixRain>;
```

Canvas-based falling character columns. Signals that the system is computing a complex operation. Children render above the rain. Set `active={false}` to stop and clear.

Density controls column spacing: `"low"` (40px), `"medium"` (24px), `"high"` (14px).

---

## Incident HUD

```jsx
import { ShIncidentHUD } from "superhot-ui/preact";
<ShIncidentHUD
  active={hasIncident}
  severity="critical"
  message="BACKEND OFFLINE"
  timestamp={incidentStart}
  onAcknowledge={() => ack()}
/>;
```

Fixed top banner for system-wide incidents. Auto-formats elapsed time from `timestamp`. ACK button only renders when `onAcknowledge` is provided. Returns `null` when inactive.

Severity options: `"warning"` (amber) or `"critical"` (red). Uses `role="alert"` + `aria-live="assertive"` for screen reader announcement.

---

## Hardware Auto-Downgrade

```js
import { detectCapability, applyCapability } from "superhot-ui";
applyCapability(detectCapability()); // call once at app init
```

Detects device capability via `navigator.hardwareConcurrency` and `prefers-reduced-motion`, then sets `data-sh-capability` on `<html>` for CSS tier response. Four tiers: `"full"` (all effects), `"medium"` (standard), `"low"` (T1 off, overlays hidden), `"minimal"` (all animation/transitions off).

Call once at app init. CSS rules in `advanced-effects.css` and `matrix-rain.css` respond automatically.

---

## Threshold Bar

```html
<div class="sh-threshold-bar" style="--sh-fill: 85"></div>
```

Use with `applyThreshold()` for automatic glow class application:

```js
import { applyThreshold } from "superhot-ui";
applyThreshold(barEl, 85); // auto-applies sh-glow-critical class
```

Generalized metric bar with progressive color — calm (green), ambient, standard (amber), critical (red). Combine with any metric percentage.

---

## Terminal Form Elements

```html
<!-- Terminal form elements -->
<input class="sh-input" placeholder="SEARCH..." />
<select class="sh-select">
  <option>OPTION 1</option>
</select>
<label class="sh-toggle" data-sh-on="true">
  <span class="sh-toggle-indicator">ON</span> CRT Mode
</label>
<span class="sh-kbd">Ctrl+K</span>
<div class="sh-tabs">
  <span class="sh-tab sh-tab--active">QUEUE</span>
  <span class="sh-tab">LOGS</span>
</div>
```

All form elements inherit the terminal aesthetic — phosphor focus glow, void backgrounds, mono typography. Toggle state is driven by `data-sh-on` attribute (set via JS).

---

## watchFreshness

Auto-apply freshness state to all `[data-sh-timestamp]` children within a container. Re-evaluates on an interval.

```js
import { watchFreshness } from "superhot-ui";
// Auto-apply freshness to all [data-sh-timestamp] children
const cleanup = watchFreshness(containerEl, { interval: 15000 });
```

Returns a cleanup function that stops the interval.

---

## createToastManager

Framework-agnostic toast state manager. Manages toast lifecycle (add, auto-dismiss, subscribe to changes).

```js
import { createToastManager } from "superhot-ui";
const toasts = createToastManager();
toasts.add("info", "JOB COMPLETE", 3000);
toasts.add("error", "QUEUE FAILED", 0); // persistent
toasts.subscribe((all) => renderToasts(all));
```

---

## createShortcutRegistry

Keyboard shortcut registry with conflict detection and listing.

```js
import { createShortcutRegistry } from "superhot-ui";
const shortcuts = createShortcutRegistry();
shortcuts.register("ctrl+k", "Command Palette", () => openPalette());
window.addEventListener("keydown", (e) => shortcuts.handleKeyDown(e));
```

---

## setMonitorVariant / loadMonitorVariant

Switch between phosphor monitor color variants (green, amber) with localStorage persistence.

```js
import { setMonitorVariant, loadMonitorVariant } from "superhot-ui";
loadMonitorVariant(); // restore from localStorage on init
setMonitorVariant("amber"); // switch to amber phosphor
```

---

## scrollSpy

Tracks which section is currently in view and fires a callback with the active section ID.

```js
import { scrollSpy } from "superhot-ui";
const sections = document.querySelectorAll("[data-section]");
const cleanup = scrollSpy([...sections], (id) => setActiveNav(id));
```

Returns a cleanup function that disconnects the observer.

---

## formatTime

Multi-format timestamp formatter for dashboard displays.

```js
import { formatTime } from "superhot-ui";
formatTime(Date.now(), "full"); // "14:23:07"
formatTime(Date.now(), "compact"); // "14:23"
formatTime(Date.now(), "date"); // "2026-03-18"
formatTime(Date.now(), "relative"); // "3m ago"
formatTime(90000, "duration"); // "1m 30s"
```

---

## Escalation Orchestration

```js
import { orchestrateEscalation } from "superhot-ui";

const esc = orchestrateEscalation({
  surfaces: {
    component: [failedCardEl],
    sidebar: [navIndicatorEl],
    section: sectionEl,
    layout: layoutEl,
  },
  sectionMantra: "BACKEND OFFLINE",
  layoutMantra: "SYSTEM CRITICAL",
  sounds: true,
  dimOthers: true,
  dimContainer: gridEl,
});

esc.start(); // begin escalation
esc.reset(); // on recovery — clears all effects + stops drone
```

---

## Celebration Sequence

```js
import { celebrationSequence } from "superhot-ui";

// Trigger after crisis resolves
celebrationSequence(containerEl, {
  text: "RESTORED",
  duration: 3000,
  shatter: true,
  sound: true,
  onComplete: () => console.log("calm restored"),
});
```

---

## Action Feedback

```js
import { confirmAction } from "superhot-ui";

// After command palette selection or button action
confirmAction(targetCardEl, { sound: "complete", intensity: "medium" });
```

---

## Tension Drone

```js
import { setTensionDrone, stopTensionDrone } from "superhot-ui";

setTensionDrone(1); // subtle 40Hz rumble
setTensionDrone(3); // dissonant 3-oscillator cluster
stopTensionDrone(); // fade out over 300ms
```

Note: Automatically wired into `orchestrateEscalation` — manual use only needed for custom escalation patterns.

---

## System Corruption

```html
<!-- Apply to layout root during critical system failure -->
<div class="sh-system-corrupted">...entire dashboard...</div>
```

---

## Event Timeline

```html
<div class="sh-event-timeline">
  <div class="sh-event-item sh-event-item--error">
    <span class="sh-event-item-time">14:23:07</span>
    <span class="sh-event-item-label">SERVICE FAULT</span>
    <div class="sh-event-item-detail">Connection refused</div>
  </div>
</div>
```

---

## Progress Steps

```html
<div class="sh-progress-steps">
  <span class="sh-progress-step sh-progress-step--complete">
    <span class="sh-progress-step-number">1</span> BUILD
  </span>
  <span class="sh-progress-step sh-progress-step--current">
    <span class="sh-progress-step-number">2</span> DEPLOY
  </span>
</div>
```

---

## Filter Panel

```html
<div class="sh-filter-panel">
  <div class="sh-filter-group">
    <div class="sh-filter-group-label">STATUS</div>
    <span class="sh-filter-chip sh-filter-chip--active">HEALTHY</span>
    <span class="sh-filter-chip">ERROR</span>
  </div>
</div>
```

---

## Signal Bars

```html
<span class="sh-signal-bars" data-sh-signal="4">
  <span class="sh-signal-bar"></span>
  <span class="sh-signal-bar"></span>
  <span class="sh-signal-bar"></span>
  <span class="sh-signal-bar"></span>
  <span class="sh-signal-bar"></span>
</span>
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
