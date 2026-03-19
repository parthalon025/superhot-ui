# SUPERHOT UI

> TIME MOVES ONLY WHEN YOUR DATA MOVES.

SUPERHOT-inspired visual effects system for operational dashboards.
CSS-first. Framework-agnostic. Diegetic-only.

Every effect communicates exactly one signal. No decoration. No noise.

**v0.3.0** | [Consumer Guide](docs/consumer-guide.md) | MIT

---

## SYSTEM BOOT

```bash
npm install file:../superhot-ui
```

```css
@import "superhot-ui/css";
```

```js
import { applyFreshness, heartbeat, EscalationTimer } from "superhot-ui";
```

SYSTEM READY.

---

## THE EMOTIONAL LOOP

Every interaction follows one path. No branches. No shortcuts.

```
TENSION ────→ PAUSE ────→ PLAN ────→ EXECUTE ────→ CATHARSIS
   │            │           │            │              │
   ▼            ▼           ▼            ▼              ▼
 threat       mantra     command      confirm        shatter
 pulse       watermark   palette      action        fragments
 freeze      skeleton     blur       feedback      celebration
  snap       silence     target       glitch        recovery
 drone                               corrupt
```

The system escalates. You pause. You plan. You act. The system releases.

Then it starts again.

---

## EFFECTS INVENTORY

### TENSION

| Effect             | Trigger                                         | Signal              |
| ------------------ | ----------------------------------------------- | ------------------- |
| Threat Pulse       | `data-sh-effect="threat-pulse"`                 | SOMETHING IS WRONG  |
| Freshness          | `data-sh-state="fresh\|cooling\|frozen\|stale"` | TIME IS PASSING     |
| Escalation         | `new EscalationTimer(opts)`                     | IT IS GETTING WORSE |
| Tension Drone      | `setTensionDrone(level)`                        | AMBIENT PRESSURE    |
| Signal Bars        | `.sh-signal-bars`                               | CONNECTION QUALITY  |
| Signal Degradation | `.sh-signal-degraded`                           | UNRELIABLE SOURCE   |

### PAUSE

| Effect    | Trigger                  | Signal                      |
| --------- | ------------------------ | --------------------------- |
| Mantra    | `data-sh-mantra="TEXT"`  | THE WORDS BEHIND EVERYTHING |
| Skeleton  | `.sh-skeleton`           | WAITING TO MATERIALIZE      |
| Burn-in   | `data-sh-burn-in="TEXT"` | PERMANENT LANDMARK          |
| Interlace | `.sh-interlace`          | PASSIVE MONITORING          |

### PLAN

| Effect          | Trigger                       | Signal             |
| --------------- | ----------------------------- | ------------------ |
| Command Palette | `.sh-command-palette-overlay` | ENTER COMMAND MODE |
| Filter Panel    | `.sh-filter-panel`            | NARROW THE SCOPE   |
| Progress Steps  | `.sh-progress-steps`          | SEQUENCE VISIBLE   |

### EXECUTE

| Effect            | Trigger                   | Signal              |
| ----------------- | ------------------------- | ------------------- |
| Action Feedback   | `confirmAction(el, opts)` | INPUT ACKNOWLEDGED  |
| Glitch            | `data-sh-effect="glitch"` | REALITY HICCUP      |
| System Corruption | `.sh-system-corrupted`    | TOTAL FAULT         |
| Toast             | `.sh-toast`               | THE TERMINAL SPEAKS |

### CATHARSIS

| Effect        | Trigger                         | Signal          |
| ------------- | ------------------------------- | --------------- |
| Shatter       | `shatterElement(el, opts)`      | DESTROYED       |
| Celebration   | `celebrationSequence(el, opts)` | RELEASE         |
| Recovery      | `recoverySequence(opts)`        | SYSTEM RESTORED |
| Boot Sequence | `bootSequence(el, lines)`       | REBORN          |

### ORCHESTRATION

| Effect          | Trigger                         | Signal               |
| --------------- | ------------------------------- | -------------------- |
| Orchestrator    | `orchestrateEscalation(config)` | MULTI-SURFACE CRISIS |
| Heartbeat       | `heartbeat(el, timestamp)`      | ALIVE CHECK          |
| Hardware Detect | `detectCapability()`            | CAPABILITY TIER      |

---

## THREE LAYERS

Each optional. Use one, two, or all three.

```
CSS  ──→  data attributes, class names, zero runtime
JS   ──→  vanilla ESM utilities that set those attributes
JSX  ──→  Preact wrappers with ARIA + lifecycle
```

20 Preact components. 30+ CSS effects. 18 JS utilities.

---

## DASHBOARD PRIMITIVES

```
PageBanner   HeroCard     StatsGrid    DataTable
Nav          TimeChart    Pipeline     Collapsible
ErrorState   Modal        IncidentHUD  MatrixRain
StatCard     StatusBadge  Toast        CommandPalette
```

Form elements: `.sh-input`, `.sh-select`, `.sh-toggle`, `.sh-tabs`

Layout: `.sh-frame`, `.sh-card`, `.sh-callout`, `.sh-bracket`

Terminal: log viewer, code block, tooltip, breadcrumb

---

## BROWSER SUPPORT

| Tier          | Chrome | Firefox | Safari | Edge |
| ------------- | ------ | ------- | ------ | ---- |
| FULL FIDELITY | 123+   | 128+    | 17.4+  | 123+ |
| HEX FALLBACKS | 80+    | 75+     | 13+    | 80+  |
| ANIMATIONS    | 117+   | 129+    | 17.4+  | 117+ |
| CSS-ONLY      | 80+    | 75+     | 13+    | 80+  |

Modern features: `oklch()`, `light-dark()`, `color-mix()`, `@property`, `@layer`, `@starting-style`, container queries. Hex fallbacks declared before every modern color.

---

## ACCESSIBILITY

`prefers-reduced-motion` disables all animation. Static indicators remain.

Focus-visible on all interactive elements. ARIA labels throughout. Photosensitivity-safe blink rates. WCAG contrast on all threat colors.

The system respects the operator.

---

## CUSTOMIZATION

Override any `--sh-*` token:

```css
:root {
  --sh-threat: #ff00ff;
  --sh-shatter-duration: 400ms;
}
```

Monitor variants: `data-sh-monitor="amber|green"`

CRT intensity: off, low, medium, high.

---

## BUILD

```bash
npm run build    # dist/superhot.css + dist/superhot.js + dist/superhot.preact.js
npm run dev      # watch mode
npm test         # unit tests
```

---

## THE RULES

1. Every effect maps to exactly one signal
2. If it does not communicate, it does not exist
3. CSS first. JS when behavior requires it. Preact when lifecycle demands it
4. `prefers-reduced-motion` is law
5. The operator's attention is sacred. Never waste it

---

> SUPERHOT IS THE MOST INNOVATIVE DESIGN SYSTEM I'VE EVER USED.

MIT License
