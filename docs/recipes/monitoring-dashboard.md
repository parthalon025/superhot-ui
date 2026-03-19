# Recipe: Monitoring Dashboard

Build a full monitoring dashboard with live KPIs, service health, resource metrics, failure escalation, and CRT atmosphere. Everything here is copy-pasteable -- wire in your own data source and ship.

---

## What you get

- Sidebar navigation + page banner header
- Hero card with sparkline, delta, freshness polling
- Stats grid with 4-6 KPIs
- Status badges for service health
- Threshold bars for resource metrics
- Heartbeat on each fetch cycle
- Escalation timer wired to mantra + incident HUD on failure
- Recovery sequence on service restoration
- CRT toggle with localStorage persistence
- Hardware auto-downgrade at app init

---

## 1. Install + init

```bash
npm install file:../superhot-ui
node node_modules/superhot-ui/scripts/setup.js
```

In your main CSS file:

```css
@import "superhot-ui/css";
```

At app init, detect hardware capability and downgrade effects automatically:

```js
import { detectCapability, applyCapability } from "superhot-ui";
applyCapability(detectCapability());
```

This sets `data-sh-capability` on `<html>` -- CSS tiers respond automatically. Call it once, before rendering anything.

---

## 2. Imports

```js
// JS utilities
import {
  applyThreshold,
  heartbeat,
  EscalationTimer,
  recoverySequence,
  applyMantra,
  removeMantra,
  glitchText,
  setCrtMode,
  detectCapability,
  applyCapability,
} from "superhot-ui";

// Preact components
import {
  ShNav,
  ShPageBanner,
  ShHeroCard,
  ShStatsGrid,
  ShStatusBadge,
  ShFrozen,
  ShMantra,
  ShIncidentHUD,
  ShCrtToggle,
  ShToast,
} from "superhot-ui/preact";

import { signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
```

---

## 3. Navigation items

Define your nav items. `system: true` items go in the More sheet on phone and the System section on desktop.

```js
function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" fill="currentColor" />
      <rect x="14" y="14" width="7" height="7" fill="currentColor" />
    </svg>
  );
}

function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: DashIcon },
  { path: "/services", label: "Services", icon: ServicesIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon, system: true },
];
```

---

## 4. CRT preferences with localStorage

Load saved CRT preferences on startup. Default to stripe-only -- full aesthetic, zero performance cost.

```js
function loadCrtPrefs() {
  try {
    const saved = localStorage.getItem("crt-prefs");
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return { stripe: true, scanline: false, flicker: false };
}

function saveCrtPrefs(prefs) {
  setCrtMode(prefs);
  localStorage.setItem("crt-prefs", JSON.stringify(prefs));
}
```

---

## 5. Polling + heartbeat

Set up a polling loop that fetches your monitoring API, updates signals, and calls `heartbeat()` on each cycle. The dashboard "breathes" when heartbeat fires regularly -- if it stops, the UI freezes visually.

```js
const systemData = signal(null);
const lastUpdated = signal(Date.now());
const fetchError = signal(null);

async function pollStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    systemData.value = data;
    lastUpdated.value = Date.now();
    fetchError.value = null;

    // Heartbeat fires a glitch micro-burst + freshness re-evaluation.
    // Pass the DOM element that should "breathe" and the timestamp.
    const el = document.querySelector("[data-dashboard-root]");
    if (el) heartbeat(el, data.timestamp);
  } catch (err) {
    fetchError.value = err;
  }
}
```

Start polling on mount:

```js
useEffect(() => {
  pollStatus();
  const id = setInterval(pollStatus, 10_000);
  return () => clearInterval(id);
}, []);
```

---

## 6. Failure escalation

`EscalationTimer` drives a 4-stage cadence: component (5s) -> sidebar (15s) -> section mantra (60s) -> layout mantra (120s). Wire it to `ShMantra` for watermark text and `ShIncidentHUD` for the top banner.

```js
const incidentActive = signal(false);
const incidentStart = signal(null);
const incidentMessage = signal("");
const sectionMantraActive = signal(false);

const escalation = new EscalationTimer({
  onEscalate: (level, name) => {
    if (name === "section") {
      sectionMantraActive.value = true;
    }
    if (name === "layout") {
      incidentActive.value = true;
      incidentStart.value = Date.now();
      incidentMessage.value = "SYSTEM DEGRADED";
    }
  },
  onReset: () => {
    sectionMantraActive.value = false;
    incidentActive.value = false;
  },
});
```

Trigger escalation when polling fails:

```js
// Inside your polling error handler:
if (fetchError.value && !incidentActive.value) {
  escalation.start();
}
```

---

## 7. Recovery sequence

When a service comes back online after failure, run the 5-step recovery choreography: glitch -> border -> pulse stop -> toast -> calm.

```js
const toasts = signal([]);

function addToast(type, message) {
  const id = Date.now();
  toasts.value = [...toasts.value, { id, type, message, duration: 3000 }];
}

async function handleRecovery(el) {
  escalation.reset();

  await recoverySequence({
    glitchFn: () => glitchText(el, { duration: 100, intensity: "low" }),
    onBorderTransition: () => (el.style.borderColor = "var(--sh-phosphor)"),
    onPulseStop: () => el.removeAttribute("data-sh-effect"),
    onToast: () => addToast("info", "SERVICE RESTORED"),
  });
}
```

Call `handleRecovery(el)` when a previously-failed service responds healthy.

---

## 8. Threshold bars for resource metrics

Use `.sh-threshold-bar` with `applyThreshold()` for CPU, memory, disk -- any percentage metric. The bar auto-applies glow classes: calm (green), ambient, standard (amber), critical (red).

```jsx
function ResourceBar({ label, pct }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (barRef.current) {
      applyThreshold(barRef.current, pct);
    }
  }, [pct]);

  return (
    <div style="margin-bottom: 8px">
      <span class="sh-label">{label}</span>
      <span class="sh-value" style="margin-left: 8px">
        {pct}%
      </span>
      <div ref={barRef} class="sh-threshold-bar" style={`--sh-fill: ${pct}`} />
    </div>
  );
}
```

Custom thresholds per metric:

```js
// Tighter thresholds for memory
applyThreshold(memBarEl, memPct, { ambient: 50, standard: 70, critical: 85 });
```

---

## 9. Complete component tree

Here is the full dashboard assembled. Each section maps to a concept above.

```jsx
function MonitoringDashboard() {
  const currentPath = useSignal("/dashboard");
  const crtPrefs = useSignal(loadCrtPrefs());

  // Apply CRT mode on mount
  useEffect(() => {
    applyCapability(detectCapability());
    setCrtMode(crtPrefs.value);
  }, []);

  // Start polling
  useEffect(() => {
    pollStatus();
    const id = setInterval(pollStatus, 10_000);
    return () => clearInterval(id);
  }, []);

  const data = systemData.value;
  const services = data?.services ?? [];

  return (
    <div data-dashboard-root>
      {/* Incident banner -- fixed top, appears on escalation stage 4 */}
      <ShIncidentHUD
        active={incidentActive.value}
        severity="critical"
        message={incidentMessage.value}
        timestamp={incidentStart.value}
        onAcknowledge={() => {
          incidentActive.value = false;
          escalation.reset();
        }}
      />

      {/* Navigation -- all 3 breakpoints render, CSS hides inactive */}
      <ShNav
        currentPath={currentPath.value}
        logo={<span style="font-weight:600">piOS</span>}
        footer={
          <ShCrtToggle
            stripe={crtPrefs.value.stripe}
            scanline={crtPrefs.value.scanline}
            flicker={crtPrefs.value.flicker}
            onChange={(prefs) => {
              saveCrtPrefs(prefs);
              crtPrefs.value = prefs;
            }}
          />
        }
        items={NAV_ITEMS}
      />

      {/* Main content area -- offset by nav width */}
      <main class="sh-nav-content-desktop sh-nav-content-tablet sh-nav-content-phone">
        {/* Page banner -- pixel-art header */}
        <ShPageBanner namespace="piOS" page="DASHBOARD" />

        {/* Hero card -- primary KPI with sparkline + freshness */}
        <div style="margin-top: 16px">
          <ShHeroCard
            value={data?.uptime ?? null}
            label="UPTIME"
            unit="%"
            delta={data?.uptimeDelta ?? null}
            timestamp={data?.timestamp}
            sparkData={data?.uptimeSpark ?? null}
            sparkColor="var(--accent)"
            warning={data?.uptime < 99}
          />
        </div>

        {/* Stats grid -- secondary KPIs */}
        <div style="margin-top: 16px">
          <ShStatsGrid
            stats={[
              { label: "REQUESTS", value: data?.requests ?? null, unit: "/s" },
              { label: "LATENCY", value: data?.latency ?? null, unit: "ms" },
              { label: "ERROR RATE", value: data?.errorRate ?? null, unit: "%" },
              { label: "QUEUE DEPTH", value: data?.queueDepth ?? null },
              { label: "MEMORY", value: data?.memoryPct ?? null, unit: "%" },
              { label: "CONNECTIONS", value: data?.connections ?? null },
            ]}
          />
        </div>

        {/* Service health -- status badges for each service */}
        <div class="sh-frame" data-label="SERVICES" style="margin-top: 16px">
          <ShMantra text="DEGRADED" active={sectionMantraActive.value}>
            <div class="sh-grid sh-grid-3 sh-gap-section">
              {services.map((svc) => (
                <ShFrozen key={svc.name} timestamp={lastUpdated}>
                  <div class="sh-card" style="padding: 12px">
                    <span class="sh-label">{svc.name}</span>
                    <ShStatusBadge
                      status={svc.healthy ? "healthy" : "error"}
                      label={svc.healthy ? "online" : "offline"}
                    />
                  </div>
                </ShFrozen>
              ))}
            </div>
          </ShMantra>
        </div>

        {/* Resource metrics -- threshold bars */}
        <div class="sh-frame" data-label="RESOURCES" style="margin-top: 16px; padding: 12px">
          <ResourceBar label="CPU" pct={data?.cpuPct ?? 0} />
          <ResourceBar label="MEMORY" pct={data?.memoryPct ?? 0} />
          <ResourceBar label="DISK" pct={data?.diskPct ?? 0} />
        </div>

        {/* Toast stack */}
        {toasts.value.map((toast) => (
          <ShToast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onDismiss={() => (toasts.value = toasts.value.filter((t) => t.id !== toast.id))}
          />
        ))}
      </main>
    </div>
  );
}
```

---

## 10. Wiring it all together

The fetch loop is the heartbeat. Every cycle:

1. `pollStatus()` fetches `/api/status`
2. `heartbeat(el, timestamp)` fires a glitch micro-burst -- the dashboard breathes
3. `ShFrozen` wrappers re-evaluate freshness on each signal update
4. If fetch fails, `escalation.start()` begins the 4-stage failure cadence
5. On recovery, `recoverySequence()` choreographs the all-clear

The escalation stages:

| Stage         | Delay | Effect                                    |
| ------------- | ----- | ----------------------------------------- |
| 1 — component | 5s    | Individual card pulse                     |
| 2 — sidebar   | 15s   | Nav item highlights                       |
| 3 — section   | 60s   | `ShMantra` watermark: "DEGRADED"          |
| 4 — layout    | 120s  | `ShIncidentHUD` banner: "SYSTEM DEGRADED" |

CRT preferences persist across sessions via localStorage. The `ShCrtToggle` in the nav footer gives users control. Stripe-only is the recommended default -- full aesthetic, zero cost.

`applyCapability(detectCapability())` at init auto-downgrades effects on weak hardware. Four tiers: full, medium (standard), low (T1 off), minimal (all animation off). Your CSS responds automatically -- no conditional rendering needed.

---

## API shape assumed

The examples assume your `/api/status` returns something like:

```json
{
  "timestamp": "2026-03-18T10:00:00Z",
  "uptime": 99.8,
  "uptimeDelta": "+0.1% vs 24h",
  "uptimeSpark": [
    [0, 1, 2, 3],
    [99.7, 99.8, 99.8, 99.9]
  ],
  "requests": 1240,
  "latency": 42,
  "errorRate": 0.3,
  "queueDepth": 7,
  "memoryPct": 68,
  "connections": 156,
  "cpuPct": 45,
  "diskPct": 72,
  "services": [
    { "name": "API", "healthy": true },
    { "name": "WORKER", "healthy": true },
    { "name": "DATABASE", "healthy": false }
  ]
}
```

Adapt the field names to your backend. The shapes of `sparkData` (uPlot array), `timestamp` (ISO string), and `services` (array with `healthy` boolean) are the only ones the components are opinionated about.
