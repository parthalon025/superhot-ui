# superhot-ui Design Philosophy

The constitution for every component decision. When in doubt about whether something belongs in superhot-ui — run it through these four tests.

---

## Core Principle: Diegetic-First

Every visual effect communicates exactly one signal. Effects are information, not decoration. If you cannot name the single thing an effect communicates, it does not belong here.

**Test:** Can you complete this sentence? "When a user sees [effect], they know [exactly one thing]."

---

## The Four Tests

A new component must pass all four:

### 1. One Signal Only

The component communicates one thing. Not two. Not "status plus action." One.

| Pass                                        | Fail                                         |
| ------------------------------------------- | -------------------------------------------- |
| ShStatusBadge: "this entity's health state" | A badge that also triggers an action         |
| ShSkeleton: "data is loading"               | A loader that also shows progress %          |
| ShToast: "a system event occurred"          | A notification that also has inline controls |

### 2. Diegetic

The effect reads as system output — it would make sense in the SUPERHOT game world or a piOS terminal. No decorative flourishes that exist purely for visual interest.

| Pass                                                | Fail                               |
| --------------------------------------------------- | ---------------------------------- |
| Shatter on dismiss: "this thing is gone, destroyed" | Bounce animation on hover          |
| Mantra watermark: "system is broadcasting a status" | Gradient background for aesthetics |
| Glitch on error: "this thing is broken/corrupted"   | Loading spinner                    |

### 3. Six-Color Palette

Components use only the six established signal colors. No additional hues.

| Color  | Token                | Signal                         | Origin   |
| ------ | -------------------- | ------------------------------ | -------- |
| White  | `--sh-bright`        | Environment / background       | SUPERHOT |
| Black  | `--sh-void`          | Interactive / utility          | SUPERHOT |
| Red    | `--sh-threat`        | Threat / urgency / error       | SUPERHOT |
| Cyan   | `--sh-phosphor`      | Health / success / data        | SUPERHOT |
| Blue   | `--sh-portal-blue`   | Connection / inactive flow     | Portal   |
| Orange | `--sh-portal-orange` | Active flow / state transition | Portal   |

The four SUPERHOT colors are the backbone. Portal blue and orange add warmth and connection on top. In `breach` mode, facility state collapses Portal tokens into `--sh-threat` — the six reduce to four. Additional hues (amber, green, purple) are still forbidden.

### 4. Emotional Loop Fit

Every component belongs to a node in the emotional loop:

```
Tension → Pause → Plan → Execute → Catharsis
```

| Effect                          | Loop Node           |
| ------------------------------- | ------------------- |
| ShFrozen (stale data)           | Tension             |
| ShSkeleton (loading)            | Tension → Pause     |
| ShThreatPulse (anomaly)         | Tension             |
| ShMantra (system status)        | Pause               |
| ShCommandPalette (command mode) | Plan                |
| ShStatusBadge (entity state)    | All                 |
| ShToast (event notification)    | Execute → Catharsis |
| ShShatter (dismissal)           | Catharsis           |
| ShAnnouncement (system speaks)  | All                 |
| ShAntline (connection)          | Tension → Pause     |
| ShTestChamber (assembly)        | Tension → Pause     |
| Facility State (atmosphere)     | All                 |
| Narrator (personality text)     | All                 |

---

## The Time-Freeze Mechanic

Inspired by SUPERHOT's core mechanic: **time moves only when you move**. In superhot-ui, this maps to data age:

- **Fresh** (data just arrived) = alive, animated, full color
- **Cooling** (5–30 min old) = slightly desaturated, still functional
- **Frozen** (30–60 min old) = grey, translucent, needs attention
- **Stale** (60+ min) = ghosted, watermarked, "time has stopped"

Use `ShFrozen` / `applyFreshness` on any data card where staleness matters to the user's decision.

---

## The piOS Terminal Aesthetic

All text effects, watermarks, and system messages should read like terminal output from a fictional operating system — not like a modern web UI notification.

- Mantras are system broadcasts: `"SYSTEM PAUSED"`, `"OFFLINE"`, `"NO DATA"` — uppercase, terse, authoritative
- Toast messages are log lines: `"[JOB 1234] COMPLETE"`, `"DLQ: 3 ENTRIES"` — timestamp-prefixed
- Status badges are status codes: not "Healthy" but `healthy` in lowercase monospace

---

## What Does Not Belong Here

- **Business logic** — ShCommandPalette provides the shell, not the commands
- **Layout components** — grids, sidebars, navigation — those live in the consuming project
- **Data fetching** — components accept data as props, never fetch
- **App-specific patterns** — if it only makes sense for ollama-queue, build it in ollama-queue
- **Colors beyond the six** — if you need amber for warnings, use `--status-warning` (distinct amber for the warning tier between phosphor-healthy and threat-critical — not a seventh palette color)
- **Decorative animation** — hover bounce, idle wiggle, entrance flip — none of these

---

## The Portal Fusion

superhot-ui fuses two aesthetic layers into one atmosphere:

- **SUPERHOT** is the experiment — the infrastructure being monitored. Visual effects (shatter, glitch, mantra, threat-pulse, freeze) are the experiment's physical state.
- **Portal** adds personality and connection — GLaDOS narrates, antlines connect, test chambers assemble, the facility has a state.

The two are not separate themes. They are emotional poles of one experience:

| Facility State | Aesthetic                                 | User's Role                        |
| -------------- | ----------------------------------------- | ---------------------------------- |
| `normal`       | Portal calm — blue, clinical, witty       | Test subject (observed)            |
| `alert`        | The Third Thing — cracking, gallows humor | Operator (relied upon)             |
| `breach`       | SUPERHOT rage — red, commanding, minimal  | The experiment (identity collapse) |

The `alert` state is not a blend — it has its own unique aesthetic: gallows humor, visual degradation, stuttering motion, trailing typography. Protect it as the most valuable experience.

---

## Adding a New Component

Checklist before writing any code:

- [ ] Can I name the single signal this communicates?
- [ ] Is it diegetic (would it make sense in the SUPERHOT world)?
- [ ] Does it use only the six palette colors? Does it respond to facility state?
- [ ] Which emotional loop node does it belong to?
- [ ] Does it follow the three-layer pattern (CSS → JS → Preact)?
- [ ] Is it reusable across projects (not just ollama-queue)?
- [ ] Does it need all three layers, or just CSS?
- [ ] Is there an existing effect that already covers this signal?

If any answer is "no" or "I'm not sure" — stop and redesign before building.
