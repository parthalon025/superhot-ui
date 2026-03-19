# Recipe: Loading States

Loading patterns with superhot-ui -- from boot sequence through skeleton placeholders to data arrival and empty states. The system never says "Loading..." -- it says STANDBY. Every code block is copy-pasteable.

---

## What you get

- Shape-matched skeleton placeholders per component type
- Choreographed entry with `.sh-stagger-children` (Rule 10)
- 4-phase entry timing: structure -> skeletons -> primary data -> secondary -> effects
- Boot sequence for app initialization
- Freshness lifecycle (fresh -> cooling -> frozen -> stale)
- Empty state for no-data views ("STANDBY", Ctrl+K hint)
- Matrix rain during heavy computation
- `@starting-style` entrance transitions
- Rest frames between animations (Rule 7)
- Full JSX examples for each pattern

---

## 1. Imports

```js
// JS utilities
import { bootSequence, applyFreshness } from "superhot-ui";

// Preact components
import {
  ShSkeleton,
  ShFrozen,
  ShMatrixRain,
  ShStatCard,
  ShHeroCard,
  ShStatsGrid,
  ShDataTable,
} from "superhot-ui/preact";

import { signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
```

---

## 2. Skeleton placeholders -- shape-matched

`ShSkeleton` renders phosphor-shimmer placeholder lines. Match the skeleton dimensions to the component it replaces so the layout does not shift on data arrival.

### Stat card skeleton

A stat card has a label line (~60% width) and a large value line. Match that shape:

```jsx
function StatCardSkeleton() {
  return (
    <div class="sh-card" style="padding: 12px; width: 120px">
      <ShSkeleton rows={1} width="60%" height="0.75em" />
      <div style="margin-top: 8px">
        <ShSkeleton rows={1} width="100%" height="2em" />
      </div>
    </div>
  );
}
```

### Table row skeleton

A data table row spans the full width. Match the row height from your table CSS:

```jsx
function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} style="padding: 8px">
          <ShSkeleton rows={1} width="100%" height="1em" />
        </td>
      ))}
    </tr>
  );
}
```

Render a full skeleton table with header + placeholder rows:

```jsx
function TableSkeleton({ columns = 4, rows = 5 }) {
  const headers = Array.from({ length: columns }, (_, i) => `COL ${i + 1}`);

  return (
    <div class="sh-data-table">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>
                <ShSkeleton rows={1} width="60%" height="0.75em" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Hero card skeleton

The hero card has a large metric value and optional sparkline area. Use a tall skeleton line for the value:

```jsx
function HeroCardSkeleton() {
  return (
    <div class="sh-frame" style="padding: 16px">
      <ShSkeleton rows={1} width="30%" height="0.75em" />
      <div style="margin-top: 12px">
        <ShSkeleton rows={1} width="40%" height="3em" />
      </div>
      <div style="margin-top: 8px">
        <ShSkeleton rows={1} width="20%" height="1em" />
      </div>
    </div>
  );
}
```

### Graph / chart skeleton

Match the exact chart container dimensions. Charts are typically fixed-height with full-width:

```jsx
function ChartSkeleton({ height = "200px" }) {
  return (
    <div class="sh-frame" style={`padding: 16px; height: ${height}`}>
      <ShSkeleton rows={1} width="30%" height="0.75em" />
      <div style="margin-top: 12px; height: calc(100% - 32px)">
        <ShSkeleton rows={1} width="100%" height="100%" />
      </div>
    </div>
  );
}
```

---

## 3. Choreographed entry with `.sh-stagger-children`

Add `.sh-stagger-children` to a container and its direct children fade in with staggered delays (50ms per child, up to 10 children). This is atmosphere Rule 10 -- elements enter one by one, not all at once.

```jsx
function StatsGrid({ stats, isLoading }) {
  return (
    <div class="sh-grid sh-grid-3 sh-gap-section sh-stagger-children">
      {isLoading
        ? Array.from({ length: 6 }, (_, i) => <StatCardSkeleton key={i} />)
        : stats.map((stat) => (
            <ShStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              status={stat.status}
            />
          ))}
    </div>
  );
}
```

The stagger timing (from `animations.css`):

| Child | Delay      |
| ----- | ---------- |
| 1st   | 50ms       |
| 2nd   | 100ms      |
| 3rd   | 150ms      |
| 4th   | 200ms      |
| 5th   | 250ms      |
| ...   | +50ms each |
| 10th  | 500ms      |

Each child animates with `sh-fade-in-up-kf` (0.4s ease-out) -- opacity 0 to 1 + translateY slide up.

`prefers-reduced-motion: reduce` disables all stagger animation -- children render immediately at full opacity.

---

## 4. Entry order -- 4-phase timing

Structure the mount order so heavier elements load after lighter ones. This creates a visual cadence that feels intentional:

| Phase             | Delay | What loads               | Why                              |
| ----------------- | ----- | ------------------------ | -------------------------------- |
| 1. Structure      | 0ms   | Nav, page banner, frames | Layout shell appears instantly   |
| 2. Skeletons      | 50ms  | ShSkeleton in each slot  | Placeholder shapes fill the grid |
| 3. Primary data   | 150ms | Hero card, main stats    | First fetch resolves             |
| 4. Secondary data | 250ms | Tables, graphs, badges   | Slower API calls resolve         |

After all data is loaded, effects activate at 400ms+ (freshness polling, heartbeat, CRT).

```jsx
function DashboardPage() {
  const phase = useSignal(1);
  const heroData = useSignal(null);
  const statsData = useSignal(null);
  const tableData = useSignal(null);

  useEffect(() => {
    // Phase 2: skeletons appear with stagger
    setTimeout(() => {
      phase.value = 2;
    }, 50);

    // Phase 3: fetch primary data
    fetch("/api/hero")
      .then((r) => r.json())
      .then((data) => {
        heroData.value = data;
        phase.value = 3;
      });

    // Phase 4: fetch secondary data
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        statsData.value = data;
      });
    fetch("/api/table")
      .then((r) => r.json())
      .then((data) => {
        tableData.value = data;
        phase.value = 4;
      });
  }, []);

  return (
    <main class="sh-animate-page-enter">
      {/* Phase 1: structure -- always present */}
      <div class="sh-frame" data-label="OVERVIEW">
        {heroData.value ? (
          <ShHeroCard
            value={heroData.value.value}
            label={heroData.value.label}
            unit={heroData.value.unit}
            delta={heroData.value.delta}
          />
        ) : (
          <HeroCardSkeleton />
        )}
      </div>

      {/* Phase 2-3: stats grid with stagger */}
      <div class="sh-stagger-children" style="margin-top: 16px">
        {statsData.value
          ? statsData.value.map((stat) => (
              <ShStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                status={stat.status}
              />
            ))
          : Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Phase 4: table */}
      <div style="margin-top: 16px">
        {tableData.value ? (
          <ShDataTable columns={tableData.value.columns} rows={tableData.value.rows} />
        ) : (
          <TableSkeleton columns={4} rows={5} />
        )}
      </div>
    </main>
  );
}
```

---

## 5. Boot sequence for app initialization

`bootSequence()` renders progressive typewriter text reveal -- each line appears with a clip-path animation, then locks solid. Use it for app startup or heavy module initialization.

```jsx
function AppBoot({ onReady }) {
  const containerRef = useRef(null);
  const booting = useSignal(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = bootSequence(
      containerRef.current,
      [
        "piOS v2.1.0",
        "LOADING MODULES...",
        "CONNECTING TO BACKEND...",
        "QUEUE: ONLINE",
        "SYSTEM READY",
      ],
      {
        charSpeed: 30, // ms per character
        lineDelay: 200, // ms between lines
        onComplete: () => {
          // Short pause before transitioning to the app
          setTimeout(() => {
            booting.value = false;
            onReady();
          }, 400);
        },
      },
    );

    return cleanup; // cancels pending timers on unmount
  }, []);

  if (!booting.value) return null;

  return <div ref={containerRef} class="sh-boot-container" style="padding: 24px" />;
}
```

Usage at the app root:

```jsx
function App() {
  const ready = useSignal(false);

  if (!ready.value) {
    return (
      <AppBoot
        onReady={() => {
          ready.value = true;
        }}
      />
    );
  }

  return <Dashboard />;
}
```

The container needs `.sh-boot-container` for terminal styling. The last line gets `.sh-cursor-active` (blinking block cursor). `bootSequence()` returns a cleanup function that cancels all pending timers -- safe for component unmount.

---

## 6. Freshness lifecycle with ShFrozen

`ShFrozen` wraps content and applies progressive visual degradation based on data age. The four states (atmosphere Rule 32):

| State     | Default threshold | Visual effect                                  |
| --------- | ----------------- | ---------------------------------------------- |
| `fresh`   | < 5 min           | Full color, full opacity                       |
| `cooling` | >= 5 min          | `saturate(0.7)` -- slightly desaturated        |
| `frozen`  | >= 30 min         | `grayscale(0.8)`, opacity 0.6, frozen border   |
| `stale`   | >= 60 min         | `grayscale(1)`, opacity 0.5, "STALE" watermark |

### With Preact Signals (instant reactivity)

```jsx
import { signal } from "@preact/signals";

const lastUpdated = signal(Date.now());

function LiveCard({ data }) {
  return (
    <ShFrozen timestamp={lastUpdated}>
      <ShStatCard label="QUEUE" value={data.depth} status="healthy" />
    </ShFrozen>
  );
}

// On each poll success, update the signal -- ShFrozen reacts instantly
async function onPollSuccess(data) {
  lastUpdated.value = Date.now();
}
```

### With plain number (polls every 30s)

```jsx
function StaticCard({ service }) {
  return (
    <ShFrozen timestamp={service.lastCheck}>
      <ShStatCard label={service.name} value={service.status} />
    </ShFrozen>
  );
}
```

### Custom thresholds

Tighter windows for real-time data, looser for batch processes:

```jsx
// Real-time sensor: stale after 2 minutes
<ShFrozen
  timestamp={sensorTs}
  thresholds={{ cooling: 30, frozen: 60, stale: 120 }}
>
  <SensorCard data={sensor} />
</ShFrozen>

// Batch job: stale after 24 hours
<ShFrozen
  timestamp={batchTs}
  thresholds={{ cooling: 3600, frozen: 14400, stale: 86400 }}
>
  <BatchStatus job={batch} />
</ShFrozen>
```

When using a Preact Signal, ensure the signal is stable across renders (defined outside the component or via `useSignal`). A new signal object on each render causes the effect to resubscribe every cycle.

---

## 7. Empty state -- quiet world

When there is no data to display, the system is in a known state -- not an error. Use `ShErrorState` (without `onRetry`) or build a custom empty state in the piOS voice. Never say "No data available" -- say STANDBY.

```jsx
function EmptyState({ message = "STANDBY", hint }) {
  return (
    <div class="sh-frame" style="text-align: center; padding: 48px 24px">
      <div style="font-family: var(--font-mono); font-size: var(--type-display); color: var(--text-muted); letter-spacing: 0.2em">
        {message}
      </div>
      {hint && (
        <div style="font-family: var(--font-mono); font-size: var(--type-label); color: var(--text-secondary); margin-top: 12px">
          {hint}
        </div>
      )}
    </div>
  );
}
```

Usage for different contexts:

```jsx
// No active jobs
<EmptyState message="NO ACTIVE JOBS" hint="Ctrl+K to submit" />

// Waiting for first data
<EmptyState message="AWAITING DATA" />

// System intentionally idle
<EmptyState message="STANDBY" hint="Ctrl+K to begin" />

// Offline mode
<EmptyState message="OFFLINE" />
```

Wire it into a data view:

```jsx
function JobsPanel({ jobs, isLoading }) {
  if (isLoading) {
    return <TableSkeleton columns={3} rows={5} />;
  }

  if (jobs.length === 0) {
    return <EmptyState message="NO ACTIVE JOBS" hint="Ctrl+K to submit" />;
  }

  return <ShDataTable columns={JOB_COLUMNS} rows={jobs} />;
}
```

Empty states are not errors. They use `--text-muted` (not `--status-error`), no threat colors, no pulse. The system is calm -- waiting for input.

---

## 8. Matrix rain during heavy computation

`ShMatrixRain` overlays falling terminal characters on a canvas. It signals that the system is computing -- use it for batch operations, model loading, or heavy initialization.

```jsx
function ProcessingView({ job }) {
  const isProcessing = job.status === "running";

  return (
    <ShMatrixRain active={isProcessing} density="medium">
      <div class="sh-frame" style="padding: 24px; min-height: 200px">
        <span class="sh-label">PROCESSING</span>
        <div style="margin-top: 8px">
          <span class="sh-value">{job.name}</span>
        </div>
        <div style="margin-top: 4px">
          <span class="sh-status-code">{job.status}</span>
        </div>
      </div>
    </ShMatrixRain>
  );
}
```

Density controls column spacing:

| Density    | Column gap | Use case                                 |
| ---------- | ---------- | ---------------------------------------- |
| `"low"`    | 40px       | Subtle background, content-heavy views   |
| `"medium"` | 24px       | Default, balanced visual weight          |
| `"high"`   | 14px       | Full "the system is working hard" effect |

```jsx
// Subtle background effect
<ShMatrixRain active={true} density="low">
  <ModelLoadingCard />
</ShMatrixRain>

// Dense rain for batch processing
<ShMatrixRain active={true} density="high">
  <BatchProgressPanel />
</ShMatrixRain>
```

The canvas has `aria-hidden="true"` -- purely decorative. `prefers-reduced-motion: reduce` hides the canvas entirely. Hardware capability `low` or `minimal` also hides it via CSS.

Parent container must have a defined height. Children render above the canvas via z-index stacking.

---

## 9. `@starting-style` entrance transitions

superhot-ui uses `@starting-style` for element entrance animations. When an element is added to the DOM, the browser reads the values declared in `@starting-style` as the "from" state and transitions to the element's normal style.

Freshness states use this for smooth transitions:

```css
/* From css/superhot.css -- this is already included when you import superhot-ui/css */
[data-sh-state="cooling"] {
  filter: saturate(0.7);
  transition:
    filter 1s ease,
    opacity 1s ease;

  @starting-style {
    filter: none; /* starts at full saturation, transitions to 0.7 */
  }
}
```

For your own components, apply entrance transitions using the `.sh-animate-page-enter` utility class:

```jsx
// Page-level entrance
<main class="sh-animate-page-enter">
  <DashboardContent />
</main>
```

Or build custom transitions using `@starting-style` in your CSS:

```css
.my-card {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;

  @starting-style {
    opacity: 0;
    transform: translateY(-4px);
  }
}
```

For skeleton-to-content transitions, swap the component and let `@starting-style` handle the entrance:

```jsx
function DataCard({ data, isLoading }) {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  return (
    <div class="sh-animate-data-refresh">
      <ShStatCard label={data.label} value={data.value} status={data.status} />
    </div>
  );
}
```

`.sh-animate-data-refresh` fires a box-shadow glow flash when the element enters -- a visual heartbeat that confirms new data arrived.

---

## 10. Rest frames between animations (Rule 7)

After intense animations (shatter, glitch), insert a rest frame before the next animation starts. This prevents animation fatigue and gives the user a moment to process what happened.

```html
<!-- The element pauses before its next animation fires -->
<div class="sh-rest-after-shatter">
  <ShStatCard label="QUEUE" value="0" status="waiting" />
</div>

<div class="sh-rest-after-glitch">
  <span class="sh-label">API</span>
</div>
```

Available rest-frame classes:

| Class                         | Token                       | Use after                 |
| ----------------------------- | --------------------------- | ------------------------- |
| `.sh-rest-after-shatter`      | `--rest-after-shatter`      | Dismissal / removal       |
| `.sh-rest-after-glitch`       | `--rest-after-glitch`       | Error detection / anomaly |
| `.sh-rest-after-state-change` | `--rest-after-state-change` | Status transition         |
| `.sh-rest-after-navigation`   | `--rest-after-navigation`   | Route change              |

These classes set `animation-delay` to the corresponding CSS custom property. Define the token values in your app's CSS:

```css
:root {
  --rest-after-shatter: 300ms;
  --rest-after-glitch: 200ms;
  --rest-after-state-change: 150ms;
  --rest-after-navigation: 100ms;
}
```

In practice, use rest frames after recovery sequences to let the calm state settle:

```js
await recoverySequence({
  /* ... */
});
// The element now has rest-after-glitch applied
el.classList.add("sh-rest-after-glitch");
// After the rest period, the next animation can fire cleanly
```

---

## 11. Complete loading flow

Here is the full loading lifecycle assembled -- boot -> skeleton -> stagger -> data -> freshness -> empty/matrix.

```jsx
function LoadingDashboard() {
  const ready = useSignal(false);
  const data = useSignal(null);
  const lastUpdated = signal(Date.now());
  const isProcessing = useSignal(false);

  // Phase 0: boot sequence
  if (!ready.value) {
    return (
      <AppBoot
        onReady={() => {
          ready.value = true;
        }}
      />
    );
  }

  return (
    <main class="sh-animate-page-enter">
      {/* Hero card -- skeleton until data arrives */}
      <div style="margin-bottom: 16px">
        {data.value ? (
          <ShFrozen timestamp={lastUpdated}>
            <ShHeroCard
              value={data.value.primary}
              label="THROUGHPUT"
              unit="req/s"
              delta={data.value.delta}
            />
          </ShFrozen>
        ) : (
          <HeroCardSkeleton />
        )}
      </div>

      {/* Stats grid -- staggered skeleton -> staggered data */}
      <div
        class="sh-stagger-children sh-gap-section"
        style="display: grid; grid-template-columns: repeat(3, 1fr)"
      >
        {data.value
          ? data.value.stats.map((stat) => (
              <ShFrozen key={stat.label} timestamp={lastUpdated}>
                <ShStatCard label={stat.label} value={stat.value} status={stat.status} />
              </ShFrozen>
            ))
          : Array.from({ length: 6 }, (_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Data table -- skeleton -> content -> empty state */}
      <div style="margin-top: 16px">
        {data.value === null ? (
          <TableSkeleton columns={4} rows={5} />
        ) : data.value.jobs.length === 0 ? (
          <EmptyState message="NO ACTIVE JOBS" hint="Ctrl+K to submit" />
        ) : (
          <ShDataTable columns={data.value.columns} rows={data.value.jobs} />
        )}
      </div>

      {/* Matrix rain overlay during heavy processing */}
      {isProcessing.value && (
        <ShMatrixRain active={true} density="medium">
          <div class="sh-frame" style="padding: 24px; min-height: 200px; text-align: center">
            <span class="sh-label">PROCESSING BATCH</span>
            <div class="sh-cursor-working" style="margin-top: 12px" />
          </div>
        </ShMatrixRain>
      )}
    </main>
  );
}
```

---

## 12. Lifecycle summary

```
App start
  |-> bootSequence() -- typewriter lines, terminal aesthetic
  |-> onComplete -> mount dashboard

Dashboard mount
  |-> .sh-animate-page-enter -- fade in + slide up
  |-> Phase 1 (0ms): nav, frames, structure shells
  |-> Phase 2 (50ms): ShSkeleton placeholders fill each slot
  |       via .sh-stagger-children (50ms per child)
  |-> Phase 3 (150ms): primary data arrives
  |       skeleton swaps to ShHeroCard, ShStatCard
  |       .sh-animate-data-refresh glow flash on entry
  |-> Phase 4 (250ms): secondary data arrives
  |       table skeleton swaps to ShDataTable
  |       OR EmptyState ("STANDBY") if no rows
  |-> Effects (400ms+): freshness polling starts
        ShFrozen begins lifecycle:
          fresh -> cooling -> frozen -> stale

Heavy computation
  |-> ShMatrixRain active={true} -- falling characters
  |-> .sh-cursor-working -- pulsing block cursor
  |-> On complete: active={false}, canvas cleared

Between animations
  |-> .sh-rest-after-* classes insert pause
  |-> Prevents animation fatigue (Rule 7)
```

Skeletons match the shape of the component they replace -- no layout shift. Stagger gives each element its moment. Rest frames prevent visual overload. The freshness lifecycle keeps the data honest after it arrives.
