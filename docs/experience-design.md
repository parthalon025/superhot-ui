# superhot-ui Experience Design

Interface orchestration rules for dashboards built on superhot-ui. This layer sits above
component rules (see `design-philosophy.md`) and governs how the whole interface behaves
as a system across health states, user actions, and time.

---

## The World Metaphor

A superhot-ui dashboard is not an admin panel. It is a **world you inhabit**.

The topology graph is the world — the crystalline space you look into. Stat cards and status
badges are HUD overlays projected onto that world. Navigation is spatial movement through it,
not a menu hierarchy.

**Implications:**

- The graph or primary data visualization is the **hero** of the dashboard — dominant, full
  presence, not buried in a tab
- Stat cards sit _on top of_ the world as HUD elements — not below it as a report
- Navigation labels name places, not functions: `TOPOLOGY` not `Graph`, `SYSTEMS` not
  `Services`, `QUEUE` not `Job Queue`

---

## Interface Health States

The dashboard operates in one of three modes. Each has a distinct visual signature applied
**across every surface simultaneously** — not just the affected component.

Facility state governs the atmosphere shift. `setFacilityState()` sets `data-sh-facility` on `<html>`, and CSS descendant selectors shift all Portal tokens simultaneously. The three health states map to facility states:

| Health State | Facility State | CSS Effect                         |
| ------------ | -------------- | ---------------------------------- |
| Operational  | `normal`       | Portal blue/orange unchanged       |
| Degraded     | `alert`        | `--sh-portal-blue` → `--sh-threat` |
| Critical     | `breach`       | All Portal tokens → threat red     |

### Operational (all healthy)

- Phosphor calm — `--sh-phosphor` glow on active elements, quiet
- CRT scanlines present, no animation beyond `ShFrozen` state polling
- Stat cards with `--status-healthy` borders, no pulse
- Graph nodes phosphor-lit, edges animated with `--sh-phosphor-glow`
- Recent activity: log lines entering with `@starting-style` slide-in

### Degraded (1+ services failed, system functional)

- `ShThreatPulse persistent` on affected graph nodes
- `ShGlitch` bursts on failed service name labels
- Sidebar indicator for affected route pulses threat red
- Incident HUD surfaces: `ShThreatPulse` + `ShMantra text="SYSTEM DEGRADED"`
- All else unchanged — degraded state is localized but announced

### Critical (majority failed or core service down)

- `ShMantra text="SYSTEM DEGRADED"` on **layout root** — watermarks the entire interface
- `ShThreatPulse persistent` on header
- Every failed node in graph: threat red + pulse
- Stat cards with `status="error"` all pulse simultaneously
- The interface itself communicates distress — not just a banner

**Rule:** Health state transitions change the whole interface at once, not card by card.
The system speaks with one voice.

---

## The Emotional Arc

Every dashboard session follows the same loop. Design decisions should reinforce each node.

```
Tension → Pause → Plan → Execute → Catharsis
```

| Interface moment                 | Loop node       | How it manifests                                                 |
| -------------------------------- | --------------- | ---------------------------------------------------------------- |
| Page load, data incoming         | Tension → Pause | `ShSkeleton` everywhere — phosphor shimmer, no content yet       |
| Data arrives, system healthy     | Pause           | Calm phosphor state, graph populated, edges glow                 |
| Stale data (ShFrozen activating) | Tension         | Cards grey out, mantra appears if very stale                     |
| Service failure detected         | Tension         | ShThreatPulse, ShGlitch, ShMantra broadcast                      |
| User opens command palette       | Plan            | `ShCommandPalette` opens with glitch burst — "I'm taking action" |
| User navigates to fix the issue  | Execute         | Route transition with `@starting-style` entrance                 |
| Service recovers                 | Catharsis       | ShGlitch burst on recovery, then phosphor calm returns           |
| Job completes (queue)            | Catharsis       | `playSfx('complete')` if audio enabled                           |
| Page load, panels assembling     | Tension → Pause | `ShTestChamber` panels slide in + `ShAnnouncement` greeting      |
| Facility state shifts            | Tension         | `setFacilityState('alert')` — red bleeds through blue            |
| Recovery with personality        | Catharsis       | `setFacilityState('normal')` + narrator success phrase           |

---

## Typography Discipline

All text in a superhot-ui dashboard reads like piOS terminal output. Not a web app. Not a
product. A terminal.

### Rules

**Labels:** UPPERCASE, `--tracking-widest`, `--text-muted`, `--type-label`

```
SYSTEMS    QUEUE    TOPOLOGY    STATUS
```

**Values:** Numeric or terse. Never prose.

```
3/12       PAUSED     healthy     00:14:22
```

**Status text:** Lowercase monospace status codes — not sentence case.

```
healthy    error    warning    waiting
```

**System messages (mantras, toasts):** Uppercase, terse, authoritative. First person from
the system, not descriptive of the system.

```
SYSTEM DEGRADED          ← not "Some services are down"
BACKEND OFFLINE          ← not "The backend is not responding"
[14:23:01] JOB COMPLETE  ← not "Job finished successfully"
NO DATA                  ← not "No data available yet"
STANDBY                  ← not "Loading..."
```

**Empty states:** Never apologetic. The system is in a known state.

```
NO ACTIVE JOBS      OFFLINE     AWAITING DATA     STANDBY
```

---

## Navigation Tone

Sidebar and top navigation speak piOS, not web UI.

| Web UI (wrong) | piOS (correct) |
| -------------- | -------------- |
| Dashboard      | SYSTEMS        |
| Projects       | PROJECTS       |
| Queue          | QUEUE          |
| Graph          | TOPOLOGY       |
| Lessons        | — (own UI)     |

Active route indicator: phosphor left border (`3px solid var(--sh-phosphor)`) or phosphor
underline. Never a filled highlight or background change.

No hover tooltips. The label is the tooltip. If a label needs a tooltip, it's too long.

---

## Failure Theater

When a service or component fails, the response is **coordinated across surfaces**:

0. **Facility state** — `setFacilityState('alert'|'breach')` shifts all Portal colors globally (the umbrella over all other surfaces)
1. **Graph node** — `ShThreatPulse persistent`, color shifts to `--sh-threat`
2. **Stat card** — `status="error"`, border and glow shift, `ShThreatPulse` activates
3. **Sidebar** — indicator dot on the affected route pulses threat red
4. **Incident HUD** — surfaces with `ShThreatPulse` + `ShMantra text="SYSTEM DEGRADED"`
5. **Toast** — `ShToast type="error" duration={0}` (persistent) with service name
6. **Layout root** (critical only) — `ShMantra` watermarks the entire interface

Recovery reverses in the same order. The `ShGlitch` burst on a recovering node is the
catharsis moment — the system exhales.

---

## Time-Freeze Discipline

The core SUPERHOT mechanic: **time moves only when you move**. In dashboard terms: data
has age, and age is visible.

Every data surface that can go stale uses `ShFrozen`. No exceptions.

- All data cards: `<ShFrozen timestamp={lastUpdated}>` — feed a signal for instant reactivity
- Header "last updated" timestamp: `applyFreshness` on the element
- Graph nodes: freshness applied per-node based on last health check timestamp

Freshness thresholds (defaults, override per project if needed):

| State   | Threshold | Visual                               |
| ------- | --------- | ------------------------------------ |
| Fresh   | 0–5 min   | Full color, animated                 |
| Cooling | 5–30 min  | Slightly desaturated                 |
| Frozen  | 30–60 min | Grey, translucent                    |
| Stale   | 60+ min   | Ghosted, mantra watermark: `NO DATA` |

When data goes stale, the system isn't broken — time has stopped. The interface communicates
this through progressive desaturation, not an error state.

---

## Graph as World

The topology graph is the most SUPERHOT element of any dashboard. Design it accordingly.

- **Nodes:** circles, `--sh-phosphor` fill for healthy, `--sh-threat` for failed
- **Edges:** lines, `--sh-phosphor-glow` animated pulse in direction of data flow
- **Failure:** failed node gets `ShThreatPulse`, edges to it dim to `--sh-dim`
- **Removal:** `shatterElement` on the node before removing from DOM
- **Recovery:** `ShGlitch` burst on the node, then phosphor calm

The graph is never decorative. Every node is a real system entity. Every edge is a real
dependency. The visual state of the graph is the state of the system.

---

## Interaction Feedback

Every user action gets a response from the system. No silent actions.

| Action                     | Response                                                 |
| -------------------------- | -------------------------------------------------------- |
| Open command palette       | `ShCommandPalette` opens with glitch burst               |
| Select command             | `shatterElement` on palette, action executes             |
| Dismiss alert/notification | `shatterElement` on the element                          |
| Job submitted              | `ShToast type="info"` + `playSfx('complete')`            |
| Job failed                 | `ShToast type="error" duration={0}` + `playSfx('error')` |
| Navigate route             | `@starting-style` entrance on incoming route content     |
| Data refreshed             | `ShGlitch` micro-burst on the "last updated" timestamp   |

Silence is reserved for steady-state operation. Any change in the system gets a signal.

---

## Narrator & Companions

The narrator system adds personality to system communication. Five personalities, each with a specific relationship to the operator:

| Personality  | Role                        | When to use                        |
| ------------ | --------------------------- | ---------------------------------- |
| GLaDOS       | Overseer — observes, grades | Main monitoring voice              |
| Cave Johnson | Founder — inspires          | Onboarding, setup, about pages     |
| Wheatley     | Companion — mirrors stress  | User-facing error recovery         |
| Turret       | Sentinel — terse sensor     | Alert banners, notification badges |
| SUPERHOT     | The experiment              | Breach mantras, raw system voice   |

Narrator personality does not auto-change with facility state. Set it explicitly via `ShNarrator.personality`. Keep `ShAudio.narratorPersonality` in sync for personality-aware SFX remapping.

During `alert`, GLaDOS gets shorter and more pointed. Wheatley accelerates. Turret reports steadily. Cave goes quiet. In `breach`, only GLaDOS (at her coldest), Turret, and SUPERHOT are appropriate.
