# Recipe: Error Handling Flow

End-to-end error handling with superhot-ui -- from the first fault signal through escalation to recovery catharsis. Every code block is copy-pasteable. Wire in your own data source and ship.

---

## What you get

- Page-level error state with retry (`ShErrorState`, `role="alert"`)
- Transient toast notifications (info auto-dismiss, error persistent)
- Threat pulse on affected cards during errors
- Glitch burst on error onset
- Mantra watermark for persistent failures ("BACKEND OFFLINE")
- 4-stage escalation timer (component -> sidebar -> section -> layout)
- 5-step recovery sequence (glitch -> border -> pulse stop -> toast RESTORED)
- Incident HUD banner for system-wide incidents (warning vs critical)
- Signal degradation overlay on unreliable data sources
- Audio cues on fault and recovery
- Complete error boundary component with escalation wiring

---

## 1. Imports

```js
// JS utilities
import {
  EscalationTimer,
  recoverySequence,
  glitchText,
  applyMantra,
  removeMantra,
  playSfx,
  ShAudio,
  setFacilityState,
} from "superhot-ui";

// Preact components
import {
  ShErrorState,
  ShToast,
  ShThreatPulse,
  ShGlitch,
  ShMantra,
  ShIncidentHUD,
  ShFrozen,
  ShStatCard,
} from "superhot-ui/preact";

import { signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
```

---

## 2. Page-level error state

`ShErrorState` renders a terminal-style error dump with an optional retry button. Use it for full-page or section-level failures where the UI cannot render meaningful content.

```jsx
function ServicePanel({ service, onRetry }) {
  if (service.error) {
    return (
      <ShErrorState
        title="CONNECTION LOST"
        message={`Failed to reach ${service.name}. ${service.error.message}`}
        onRetry={onRetry}
      />
    );
  }

  return <ServiceContent service={service} />;
}
```

`ShErrorState` uses `role="alert"` and `aria-live="assertive"` -- screen readers announce it immediately on mount. The retry button is a native `<button>` -- keyboard-accessible with no extra work.

For section-level errors where the page still has other usable content, wrap just the failed section:

```jsx
<div class="sh-frame" data-label="SERVICES">
  {fetchError.value ? (
    <ShErrorState
      title="FETCH FAILED"
      message="Unable to load service list."
      onRetry={() => pollServices()}
    />
  ) : (
    <ServiceList services={services.value} />
  )}
</div>
```

---

## 3. Toast notifications

`ShToast` is a terminal log line -- terse, timestamped, auto-dismissed. Info toasts auto-dismiss after 3s. Error toasts persist (`duration={0}`) and pulse with `ShThreatPulse` until the user clicks to shatter them.

```jsx
const toasts = signal([]);

function addToast(type, message, duration) {
  const id = Date.now();
  // Error toasts persist by default; info/warn auto-dismiss
  const dur = duration ?? (type === "error" ? 0 : 3000);
  toasts.value = [...toasts.value, { id, type, message, duration: dur }];
}

function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}
```

Render the toast stack:

```jsx
function ToastStack() {
  return (
    <div class="sh-toast-container">
      {toasts.value.map((toast) => (
        <ShToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
```

Use terminal-style messages. piOS speaks in uppercase, terse, first-person:

```js
addToast("info", "SERVICE RESTORED"); // not "The service is back"
addToast("error", "[API] TIMEOUT — 30s LIMIT"); // not "API request timed out"
addToast("warn", "HIGH LATENCY DETECTED"); // not "Latency is above normal"
```

`onDismiss` fires after the shatter animation completes -- remove the toast from your signal inside it, not before.

---

## 4. Threat pulse on affected cards

Wrap any card in `ShThreatPulse` to add a pulsing red border glow. Default behavior: pulses twice then stops. Set `persistent` to pulse until the error clears.

```jsx
function ServiceCard({ service }) {
  const hasError = service.status === "error";

  return (
    <ShThreatPulse active={hasError} persistent>
      <ShFrozen timestamp={service.lastCheck}>
        <ShStatCard
          label={service.name}
          value={hasError ? "OFFLINE" : "ONLINE"}
          status={hasError ? "error" : "healthy"}
        />
      </ShFrozen>
    </ShThreatPulse>
  );
}
```

Pair with `role="alert"` or `aria-live="assertive"` on the child content if the pulse represents a state change the user needs to hear about.

---

## 5. Glitch burst on error onset

Fire a `ShGlitch` burst when an error first appears -- it signals data corruption / anomaly. Use `intensity="high"` for critical failures, `"low"` for transient.

```jsx
function ServiceLabel({ name, hasError }) {
  return (
    <ShGlitch active={hasError} intensity="high">
      <span class="sh-label">{name}</span>
    </ShGlitch>
  );
}
```

For a one-shot glitch burst on a DOM element (outside Preact component lifecycle), use the JS utility:

```js
import { glitchText } from "superhot-ui";

// Single burst on error detection
glitchText(serviceNameEl, { duration: 200, intensity: "medium" });
```

---

## 6. Mantra watermark for persistent failures

When a failure persists, escalate from component-level indicators to section or layout watermarks. `ShMantra` renders repeating phosphor text behind its children -- the system is broadcasting its state.

```jsx
function ServicesSection({ services, hasPersistentFailure }) {
  return (
    <ShMantra text="BACKEND OFFLINE" active={hasPersistentFailure}>
      <div class="sh-frame" data-label="SERVICES">
        <div class="sh-grid sh-grid-3 sh-gap-section">
          {services.map((svc) => (
            <ServiceCard key={svc.name} service={svc} />
          ))}
        </div>
      </div>
    </ShMantra>
  );
}
```

For layout-level watermarks during critical incidents, apply mantra directly via JS:

```js
const layoutEl = document.querySelector("[data-layout-root]");
applyMantra(layoutEl, "SYSTEM DEGRADED");

// On recovery:
removeMantra(layoutEl);
```

---

## 7. Escalation timer -- 4-stage cadence

`EscalationTimer` drives failure response from localized to global. The 4 stages map to escalating visual severity (atmosphere Rule 12):

| Stage | Name      | Default delay | Effect                         |
| ----- | --------- | ------------- | ------------------------------ |
| 1     | component | 5s            | Individual card pulse + glitch |
| 2     | sidebar   | 10s           | Nav item highlight             |
| 3     | section   | 45s           | Section mantra watermark       |
| 4     | layout    | 60s           | Incident HUD + layout mantra   |

```js
const incidentActive = signal(false);
const incidentSeverity = signal("warning");
const incidentMessage = signal("");
const incidentStart = signal(null);
const sectionMantraActive = signal(false);
const sidebarAlert = signal(false);

const escalation = new EscalationTimer({
  onEscalate: (level, name) => {
    if (name === "sidebar") {
      sidebarAlert.value = true;
    }
    if (name === "section") {
      sectionMantraActive.value = true;
      setFacilityState("alert");
    }
    if (name === "layout") {
      incidentActive.value = true;
      incidentSeverity.value = "critical";
      incidentMessage.value = "SYSTEM DEGRADED";
      incidentStart.value = Date.now();
      setFacilityState("breach");
    }
  },
  onReset: () => {
    sidebarAlert.value = false;
    sectionMantraActive.value = false;
    incidentActive.value = false;
    setFacilityState("normal");
  },
});
```

Start escalation when a failure is detected:

```js
function onServiceFailure(serviceName) {
  // Stage 1: immediate component-level effects
  playSfx("error");
  addToast("error", `[${serviceName}] OFFLINE`);

  // Begin escalation timer for stages 2-4
  escalation.start();
}
```

Custom thresholds for tighter or looser escalation:

```js
const fastEscalation = new EscalationTimer({
  thresholds: [3000, 8000, 30000, 45000], // faster for critical services
  onEscalate: (level, name) => {
    /* ... */
  },
  onReset: () => {
    /* ... */
  },
});
```

---

## 8. Recovery sequence

When a failed service comes back, run the 5-step choreography (atmosphere Rule 37). This is the catharsis moment -- the system exhales.

```js
async function handleRecovery(el) {
  // Reset facility atmosphere first
  setFacilityState("normal");

  // Stop escalation
  escalation.reset();

  // Audio cue -- the "all clear" tone
  playSfx("complete");

  // 5-step visual recovery: glitch -> border -> pulse stop -> toast -> calm
  await recoverySequence({
    glitchFn: () => glitchText(el, { duration: 100, intensity: "low" }),
    onBorderTransition: () => {
      el.style.borderColor = "var(--sh-phosphor)";
    },
    onPulseStop: () => {
      el.removeAttribute("data-sh-effect");
    },
    onToast: () => {
      addToast("info", "SERVICE RESTORED");
    },
  });
}
```

Custom timing for the recovery steps:

```js
await recoverySequence({
  glitchFn: () => glitchText(el, { duration: 80, intensity: "low" }),
  onBorderTransition: () => {
    /* ... */
  },
  onPulseStop: () => {
    /* ... */
  },
  onToast: () => {
    /* ... */
  },
  delays: {
    afterGlitch: 150, // ms after glitch before border transition (default: 200)
    afterBorder: 250, // ms after border before pulse stop (default: 300)
    afterPulse: 150, // ms after pulse stop before toast (default: 200)
  },
});
```

---

## 9. Incident HUD for system-wide incidents

`ShIncidentHUD` is a fixed top banner for critical situations. It auto-formats elapsed time, uses `role="alert"` for screen reader announcement, and the ACK button only renders when `onAcknowledge` is provided.

```jsx
function IncidentBanner() {
  return (
    <ShIncidentHUD
      active={incidentActive.value}
      severity={incidentSeverity.value}
      message={incidentMessage.value}
      timestamp={incidentStart.value}
      onAcknowledge={() => {
        incidentActive.value = false;
        escalation.reset();
      }}
    />
  );
}
```

Two severity levels:

```jsx
// Warning: amber border, warm background -- degraded but functional
<ShIncidentHUD
  active={isDegraded}
  severity="warning"
  message="HIGH LATENCY DETECTED"
  timestamp={degradedSince}
/>

// Critical: red border, threat-tinted background -- major outage
<ShIncidentHUD
  active={isDown}
  severity="critical"
  message="BACKEND OFFLINE"
  timestamp={downSince}
  onAcknowledge={() => ack()}
/>
```

The HUD uses fixed positioning (`top: 0`). It pushes nothing -- your app needs to add top padding if content would be hidden. It returns `null` when `active` is false (no DOM footprint).

---

## 10. Signal degradation on unreliable data sources

Wrap any container in `.sh-signal-degraded` to overlay SVG noise + jitter animation. This signals that the data source is unreliable -- not necessarily wrong, but not trustworthy.

```jsx
function DataCard({ source, data }) {
  return (
    <div class={source.reliable ? "" : "sh-signal-degraded"}>
      <ShFrozen timestamp={data.lastUpdated}>
        <ShStatCard
          label={source.name}
          value={data.value}
          status={source.reliable ? "healthy" : "warning"}
        />
      </ShFrozen>
    </div>
  );
}
```

Signal degradation stacks with other effects -- you can have a degraded, frozen, pulsing card simultaneously:

```jsx
<div class="sh-signal-degraded">
  <ShThreatPulse active={isCritical} persistent>
    <ShMantra text="UNRELIABLE" active={!source.reliable}>
      <ShFrozen timestamp={lastCheck}>
        <BackendCard backend={backend} />
      </ShFrozen>
    </ShMantra>
  </ShThreatPulse>
</div>
```

---

## 11. Audio cues

Enable audio from user preference (never auto-enabled). Play `"error"` on fault detection, `"complete"` on recovery.

```js
// Load preference at app init
ShAudio.enabled = localStorage.getItem("sfx-enabled") === "true";

// On error
function onFaultDetected(serviceName) {
  playSfx("error"); // descending buzz -- threat register
  addToast("error", `[${serviceName}] OFFLINE`);
  escalation.start();
}

// On recovery
function onServiceRecovered(serviceName, el) {
  playSfx("complete"); // ascending two-tone -- catharsis
  handleRecovery(el);
}
```

First `playSfx()` call after page load may be silenced by browser autoplay policy. Subsequent calls work. This is a browser constraint, not a bug.

---

## 12. Complete error boundary component

Here is the full error boundary assembled -- combines all patterns above into a single wired component.

```jsx
function ErrorBoundaryDashboard() {
  const services = signal([]);
  const fetchError = signal(null);
  const layoutRef = useRef(null);

  // Enable audio from saved preference
  useEffect(() => {
    ShAudio.enabled = localStorage.getItem("sfx-enabled") === "true";
  }, []);

  // -- Polling --
  async function pollServices() {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();

      // Detect recovery: was failing, now succeeding
      if (fetchError.value && !data.error) {
        const el = layoutRef.current;
        if (el) onServiceRecovered("API", el);
      }

      services.value = data.services;
      fetchError.value = null;
    } catch (err) {
      // Detect first failure
      if (!fetchError.value) {
        onFaultDetected("API");
      }
      fetchError.value = err;
    }
  }

  function onFaultDetected(name) {
    playSfx("error");
    addToast("error", `[${name}] OFFLINE`);
    escalation.start();
  }

  async function onServiceRecovered(name, el) {
    playSfx("complete");
    escalation.reset();
    await recoverySequence({
      glitchFn: () => glitchText(el, { duration: 100, intensity: "low" }),
      onBorderTransition: () => {
        el.style.borderColor = "var(--sh-phosphor)";
      },
      onPulseStop: () => {
        el.removeAttribute("data-sh-effect");
      },
      onToast: () => addToast("info", "SERVICE RESTORED"),
    });
  }

  useEffect(() => {
    pollServices();
    const id = setInterval(pollServices, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={layoutRef} data-layout-root>
      {/* Incident HUD -- fixed top banner, appears at escalation stage 4 */}
      <ShIncidentHUD
        active={incidentActive.value}
        severity={incidentSeverity.value}
        message={incidentMessage.value}
        timestamp={incidentStart.value}
        onAcknowledge={() => {
          incidentActive.value = false;
          escalation.reset();
        }}
      />

      <main>
        {/* Full-page error state when the API is completely unreachable */}
        {fetchError.value && services.value.length === 0 ? (
          <ShErrorState
            title="CONNECTION LOST"
            message="Cannot reach the API server."
            onRetry={() => pollServices()}
          />
        ) : (
          /* Services section with escalation-driven mantra */
          <ShMantra text="BACKEND OFFLINE" active={sectionMantraActive.value}>
            <div class="sh-frame" data-label="SERVICES">
              <div class="sh-grid sh-grid-3 sh-gap-section sh-stagger-children">
                {services.value.map((svc) => (
                  <ShThreatPulse key={svc.name} active={svc.status === "error"} persistent>
                    <ShGlitch active={svc.status === "error"} intensity="medium">
                      <ShFrozen timestamp={svc.lastCheck}>
                        <ShStatCard
                          label={svc.name}
                          value={svc.status === "error" ? "OFFLINE" : "ONLINE"}
                          status={svc.status === "error" ? "error" : "healthy"}
                        />
                      </ShFrozen>
                    </ShGlitch>
                  </ShThreatPulse>
                ))}
              </div>
            </div>
          </ShMantra>
        )}

        {/* Unreliable data source -- signal degradation overlay */}
        {services.value
          .filter((svc) => svc.degraded)
          .map((svc) => (
            <div key={svc.name} class="sh-signal-degraded">
              <ShStatCard
                label={svc.name}
                value="DEGRADED"
                status="warning"
                detail="unreliable source"
              />
            </div>
          ))}
      </main>

      {/* Toast stack */}
      <ToastStack />
    </div>
  );
}
```

---

## 13. Wiring summary

The error flow follows this sequence:

```
Fault detected
  |-> playSfx("error")
  |-> addToast("error", "[SERVICE] OFFLINE")
  |-> escalation.start()
        |
        +-- 5s:  stage 1 (component) -- ShThreatPulse + ShGlitch on card
        +-- 10s: stage 2 (sidebar) -- nav item highlight
        +-- 45s: stage 3 (section) -- setFacilityState('alert') + ShMantra
        +-- 60s: stage 4 (layout) -- setFacilityState('breach') + ShIncidentHUD

Service recovers
  |-> setFacilityState('normal')
  |-> playSfx("complete")
  |-> escalation.reset()
  |-> recoverySequence()
        |
        +-- glitch burst (100ms, low)
        +-- 200ms pause
        +-- border transitions to phosphor
        +-- 300ms pause
        +-- threat pulse removed
        +-- 200ms pause
        +-- addToast("info", "SERVICE RESTORED")
```

Effects compose via `animation-composition: accumulate` -- a card can be pulsing, glitching, frozen, and watermarked simultaneously. Each effect communicates one signal. Together they paint the full picture of a failing system.

---

## API shape assumed

```json
{
  "services": [
    {
      "name": "API",
      "status": "healthy",
      "lastCheck": 1710720000000,
      "degraded": false
    },
    {
      "name": "WORKER",
      "status": "error",
      "lastCheck": 1710718200000,
      "degraded": false
    },
    {
      "name": "DATABASE",
      "status": "healthy",
      "lastCheck": 1710720000000,
      "degraded": true
    }
  ]
}
```

Adapt the field names to your backend. `status` drives `ShStatCard` and `ShThreatPulse`; `lastCheck` feeds `ShFrozen`; `degraded` triggers `.sh-signal-degraded`.
