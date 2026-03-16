# Atmosphere Guide — 40 Rules for Consumer Dashboards

How to maintain the SUPERHOT atmosphere when building on superhot-ui. These rules sit between the component API (`consumer-guide.md`) and the design constitution (`design-philosophy.md`). They govern the _feeling_ of the interface — the part that can't be enforced by tokens alone.

**Part I (1–20):** Effects, color, animation, sound, and performance.
**Part II (21–40):** Interaction, information design, spatial composition, and behavioral patterns.

---

## 1. The Void Breathes

The void-black background (`--bg-base`) is not a color choice. It is negative space — the emptiness that gives every glow, pulse, and text element its visual weight. **Consumers must preserve at least 60% void per viewport.** When the screen fills up with cards, tables, and charts, the void shrinks and the atmosphere collapses into a generic dark theme.

**Rule:** If a layout has more surface area covered by components than by void, the design is too dense. Pull elements apart. Let the void breathe between them.

```css
/* Generous spacing — let void dominate */
.dashboard-grid {
  gap: var(--space-6); /* 1.5rem minimum between surfaces */
  padding: var(--space-8);
}
```

---

## 2. Silence Is the Healthy Signal

The interaction feedback table says "no silent actions" — but _steady-state operation_ should be near-silent. When everything is healthy, the only movement is the CRT scanline crawl and the soft phosphor glow on active elements. No pulsing, no glitching, no mantras.

**The absence of effects IS the signal for "all clear."** If consumers add decorative animation during healthy state (pulsing status badges, animated backgrounds, idle shimmer), they destroy the contrast that makes failure theater work.

**Rule:** During operational state, the only animation is CRT stripe and `@starting-style` entrances for new data. Everything else is earned by a state change.

---

## 3. Red Is Scarce

Threat red (`--sh-threat`) is the most powerful signal in the palette. Its power comes from scarcity. If consumers use red for borders, accents, hover states, and decorative elements, it becomes noise — and when a real threat appears, it has nowhere to escalate.

**Red budget:** No more than 10% of visible surface area should be red at any time during healthy state. Reserve red exclusively for:

- Active threats (ShThreatPulse)
- Error status badges
- DLQ / failure indicators
- The shatter fragment tint (catharsis)

**If you need emphasis without threat**, use phosphor cyan. If you need hierarchy, use brightness levels (`--sh-bright`, `--text-secondary`, `--text-tertiary`). Red is the emergency brake — don't wear it out.

---

## 4. Phosphor Cyan Is Life

Cyan (`--sh-phosphor`) is not "accent color #2." It is the color of life in the SUPERHOT world. When phosphor glows, the system is alive — data is flowing, services are responding, connections are open.

When phosphor dims, time is freezing. The cooling→frozen→stale progression is a phosphor fade: from full cyan to desaturated grey to ghosted transparency.

**Consumer application:**

- Fresh data surfaces: phosphor border or subtle glow
- Active connections in topology graphs: phosphor-animated edges
- Interactive elements (buttons, links, command palette trigger): phosphor highlight
- Stale data: phosphor drains out via ShFrozen — grey replaces cyan

**Never combine phosphor cyan with threat red on the same element.** They are opposite poles. An element is either alive (cyan) or threatening (red), never both.

---

## 5. The Warm-Cool Axis Creates Depth

Red is warm. Cyan is cool. This isn't just palette diversity — it's a spatial depth cue.

- **Foreground / urgent:** warm (threat red) — things that demand immediate attention push forward
- **Background / ambient:** cool (phosphor cyan) — data, status, and structural elements recede
- **Neutral plane:** white/grey text occupies the middle ground

Consumers can use this to create spatial hierarchy without z-index tricks or drop shadows. A threat-pulsing card _feels_ closer than a phosphor-lit status badge, even at the same z-level.

**Rule:** If the warm-cool balance tips (too many red elements or too many cyan elements), the spatial illusion collapses and the interface flattens.

---

## 6. Glow Is Hierarchy

Not all glows are equal. Glow intensity (blur radius, opacity, spread) establishes visual priority:

| Priority | Glow Treatment             | Use Case                       |
| -------- | -------------------------- | ------------------------------ |
| Critical | `0 0 16px` + `0.5` opacity | Active threat, primary action  |
| Standard | `0 0 8px` + `0.25` opacity | Card hover, focused element    |
| Ambient  | `0 0 4px` + `0.1` opacity  | Edge glow, status indicator    |
| None     | No glow                    | Background surface, muted data |

**Rule:** Only one element per viewport should have critical-level glow at any time. If two things glow at maximum intensity, neither dominates and the hierarchy breaks.

```css
/* Ambient glow — recedes */
.data-edge {
  box-shadow: 0 0 4px oklch(0.72 0.15 195 / 0.1);
}

/* Critical glow — demands attention */
.threat-active {
  box-shadow: 0 0 16px oklch(0.58 0.25 25 / 0.5);
}
```

---

## 7. Animations Breathe — Pace with Rest

The emotional loop (Tension → Pause → Plan → Execute → Catharsis) describes _what_ happens. This rule governs _when_.

Between any two significant animations, the interface needs a **rest frame** — a moment of visual stillness where the user processes what just changed. Back-to-back animations without rest create sensory overload and break the dramatic pacing.

**Minimum rest periods:**

- After ShShatter: 300ms before any new animation on the same surface
- After ShGlitch burst: 200ms minimum rest
- After health state transition: 500ms before individual component animations begin
- After page navigation: let `@starting-style` entrance complete (typically 200ms) before activating data effects

**Implementation:** Use CSS `animation-delay` or JS `setTimeout` to enforce breath. Never chain `.animate()` calls without a gap.

---

## 8. Effect Density Budget

The design philosophy says "cognitive load reduction is the point." Here's the concrete limit:

**Maximum 3 simultaneous animated effects per viewport.** This counts:

- ShThreatPulse (each pulsing element = 1)
- ShGlitch (each glitching element = 1)
- ShMantra (each watermark = 1)
- ShSkeleton shimmer (grouped: all skeletons count as 1)
- CRT overlay effects (grouped: all CRT layers count as 1)

If a failure cascade triggers 6 threat pulses simultaneously, batch them: pulse the 3 most critical, then fade-in the rest after 500ms. The ShMantra on layout root _replaces_ individual element mantras during critical state — it doesn't add to them.

**Rule:** If you're composing effects (e.g., `ShThreatPulse` + `ShMantra` + `ShGlitch` on one element), that's 1 toward the budget, not 3. Composition on a single surface is fine. Simultaneous animation across many surfaces is the overload risk.

---

## 9. The Quiet World (Empty State Design)

An empty dashboard — no jobs, no errors, no data — is not an error state. It is the **quiet world**: a calm void with minimal phosphor, waiting for the user to act.

**Empty state hierarchy:**

1. **Void background** — dominant, unbroken
2. **Structural skeleton** — navigation, headers, empty card frames visible in `--text-tertiary`
3. **Single mantra** — `STANDBY` or `AWAITING DATA` centered, calm, no pulse
4. **Command palette hint** — subtle `Ctrl+K` or equivalent — the only call to action

**Never:** apologize ("No data yet"), show illustration mascots, or use loading spinners for genuinely empty states. The quiet world is purposeful emptiness. It's the game lobby before the round starts.

```
┌─────────────────────────────────────────┐
│  SYSTEMS         QUEUE        TOPOLOGY  │
│                                         │
│                                         │
│              STANDBY                    │
│                                         │
│                                         │
│                           ⌘K            │
└─────────────────────────────────────────┘
```

---

## 10. Entry Choreography (Stagger, Don't Flood)

When a page loads or data arrives, elements should enter in a choreographed sequence — not all at once. Simultaneous appearance is visually flat. Staggered entrance creates the illusion of the world _materializing_.

**Stagger order:**

1. **Structure first** (0ms) — navigation, headers, layout grid. These appear instantly.
2. **Skeletons second** (50ms) — ShSkeleton placeholders shimmer into existence.
3. **Primary data** (150ms) — hero card, topology graph, main stat. `@starting-style` fade-in.
4. **Secondary data** (250ms+) — individual stat cards, table rows, sidebar widgets. Stagger each by 50ms.
5. **Ambient effects last** (400ms+) — CRT layers, glow animations, freshness states activate.

```css
/* Built-in stagger utility */
.sh-stagger-children > * {
  animation: sh-fade-in 200ms ease-out both;
}
.sh-stagger-children > *:nth-child(1) {
  animation-delay: 0ms;
}
.sh-stagger-children > *:nth-child(2) {
  animation-delay: 50ms;
}
.sh-stagger-children > *:nth-child(3) {
  animation-delay: 100ms;
}
/* ... continues */
```

---

## 11. Exit Choreography (Shatter Is Earned)

Not every exit deserves a shatter. Shatter is _catharsis_ — the earned release after tension. Use it for:

- Dismissing alerts/errors (tension resolved)
- Canceling a job (deliberate destruction)
- Closing a modal after completing an action (mission complete)

For routine exits (navigating away, collapsing a panel, filtering a list), use simple opacity fade or `@starting-style` reverse. No shatter, no glitch. Routine actions don't earn drama.

**Shatter fragment count as emotional tuning:**
| Context | Fragments | Feeling |
|---------|-----------|---------|
| Dismiss toast | 4 | Quick, clean |
| Cancel stalled job | 6 | Deliberate destruction |
| Clear critical alert | 8–12 | Dramatic catharsis |
| Bulk DLQ purge | 12+ | Overwhelming release |

---

## 12. Failure Escalation Has a Cadence

Failure theater shows _what_ each severity looks like. This rule governs _when_ to escalate.

**Escalation timeline:**

1. **0–5s** — Single component response. ShThreatPulse on the affected card. Toast notification.
2. **5–15s** — Sidebar indicator pulses. If multiple services affected, the Incident HUD surfaces.
3. **15–60s** — If the failure persists, ShMantra appears on the affected section: `BACKEND OFFLINE`.
4. **60s+** — If critical (core service), ShMantra escalates to layout root: `SYSTEM DEGRADED`.

**Never jump to critical immediately.** Even if 5 services fail simultaneously, start with component-level response and escalate over 5–15 seconds. The escalation _itself_ is dramatic — watching the interface progressively darken creates more tension than an instant full-screen alert.

**De-escalation reverses the same cadence:** layout mantra clears first, then section mantras, then individual threat pulses resolve with a ShGlitch burst (catharsis), then phosphor calm returns.

---

## 13. Terminal Voice — The piOS Vocabulary

Typography discipline (`experience-design.md`) gives formatting rules. This expands them into a full voice guide.

**The piOS voice is:**

- **First person** — the system speaks about itself: `SYSTEM DEGRADED`, not "The system is degraded"
- **Present tense** — `RUNNING`, `PAUSED`, `OFFLINE`, never "was running" or "will pause"
- **Imperative when actionable** — `RETRY`, `ACKNOWLEDGE`, `DISMISS`
- **Declarative when informational** — `3 ACTIVE`, `QUEUE EMPTY`, `12ms LATENCY`

**The piOS voice is NOT:**

- Conversational — no "Hey, looks like..." or "Oops, something went wrong"
- Apologetic — no "Sorry, we couldn't..." or "Unfortunately..."
- Promotional — no "Try our new..." or "Did you know..."
- Emoji-laden — terminals don't emoji

**Vocabulary reference:**

| Concept  | piOS (correct)     | Web UI (wrong)               |
| -------- | ------------------ | ---------------------------- |
| Loading  | `STANDBY`          | "Loading..."                 |
| Error    | `FAULT` or `ERROR` | "Something went wrong"       |
| Empty    | `NO DATA`          | "Nothing here yet"           |
| Success  | `COMPLETE`         | "Successfully completed!"    |
| Warning  | `CAUTION`          | "Warning: please be careful" |
| Refresh  | `SYNC`             | "Refreshing..."              |
| Timeout  | `TIMEOUT`          | "The request took too long"  |
| Offline  | `OFFLINE`          | "Cannot connect to server"   |
| Recovery | `RESTORED`         | "Back online!"               |

---

## 14. CRT Tuning by Context

The three CRT layers (stripe, scanline, flicker) are not always-on. Tune them to context:

**Data-heavy dashboards** (tables, charts, dense grids):

- Stripe: `block` (subtle texture, minimal interference)
- Scanline: `none` (moving beam competes with data readability)
- Flicker: `none` (brightness variation makes numbers hard to read)

**Status dashboards** (topology graph, stat cards, hero panels):

- Stripe: `block`
- Scanline: `block` (slow scan beam adds life to sparse layouts)
- Flicker: optional, user-controlled (a11y risk)

**Mobile / small screens:**

- Stripe: `none` (scanlines at mobile resolution become muddy)
- Scanline: `none`
- Flicker: `none`

**Always respect `prefers-reduced-motion`.** When active, all three CRT layers should be `none`.

---

## 15. Reduced Motion Is Not Reduced Information

When `prefers-reduced-motion` is active, superhot-ui disables all animation. But the _information_ those animations carried must still be present through static alternatives:

| Effect        | Animated Version              | Reduced Motion Alternative             |
| ------------- | ----------------------------- | -------------------------------------- |
| ShThreatPulse | Pulsing red glow              | Static red border, `--sh-threat` color |
| ShGlitch      | Chromatic aberration burst    | Bold red text highlight for 1s         |
| ShShatter     | Fragment + fade               | Instant `display: none` or opacity: 0  |
| ShFrozen      | Progressive desaturation      | Immediate grey + `opacity: 0.5`        |
| ShSkeleton    | Phosphor shimmer              | Static grey placeholder blocks         |
| ShMantra      | Repeating watermark animation | Static centered watermark text         |
| CRT effects   | Moving scanline, flicker      | None — purely decorative               |

**Rule:** Every animated signal must have a static equivalent. The atmospheric effects (CRT, shatter drama, glitch bursts) can be removed in reduced-motion mode — they're decorative. The informational effects (threat pulse, frozen state, mantra) must degrade to static indicators, not disappear.

---

## 16. Z-Space Layering

The world metaphor says "stat cards are HUD overlays projected onto the world." Here's the concrete z-stack:

| Z-Layer | Content                                        | Token                |
| ------- | ---------------------------------------------- | -------------------- |
| 0       | Void background, layout grid                   | —                    |
| 1       | Topology graph, primary data surfaces          | —                    |
| 2       | Stat cards, data tables, secondary panels      | —                    |
| 3       | Navigation sidebar, header bar                 | —                    |
| 4       | ShMantra watermarks (positioned above content) | —                    |
| 5       | ShToast notifications                          | —                    |
| 6       | ShCommandPalette overlay                       | `--z-dropdown: 1000` |
| 7       | ShShatter fragments (during animation)         | —                    |

**Rule:** Content at a higher z-layer visually "belongs to the HUD." Content at a lower z-layer belongs to "the world." Toasts, command palettes, and mantras are HUD. Graphs, tables, and cards are the world. Don't put world-content at HUD z-levels (no `z-index: 999` on a data table).

---

## 17. Sound Design Grammar

The four built-in SFX (`complete`, `error`, `dlq`, `pause`) follow a grammar:

- **Complete:** short rising tone — catharsis, task finished, positive resolution
- **Error:** harsh, dissonant — immediate attention, something broke
- **DLQ:** low rumble — background threat, accumulating danger
- **Pause:** soft descending tone — intentional stop, system resting

**When extending audio for your project:**

- **Map to emotional loop nodes.** New sounds should reinforce one loop node, not bridge two.
- **Keep it procedural.** `ShAudio` uses Web Audio API synthesis, not recorded samples. This keeps the aesthetic consistent — everything sounds like it comes from the same terminal.
- **Respect the off-default.** Audio is `ShAudio.enabled = false` by default. Always gate behind user preference. Never auto-play.

**Sound + visual sync:** A sound event should coincide with the _peak_ of the visual effect:

- `complete` plays when ShShatter fragments are mid-scatter (not at trigger, not at cleanup)
- `error` plays when ShGlitch reaches maximum distortion
- `pause` plays when ShMantra text reaches full opacity

---

## 18. Data Freshness Beyond ShFrozen

ShFrozen handles the explicit fresh→stale lifecycle. But freshness thinking should permeate every data surface, not just wrapped components:

**Micro-freshness cues consumers can add:**

- **Timestamp glow:** The "last updated" label uses `applyFreshness` — as data ages, the label's phosphor glow dims
- **Edge animation speed:** In topology graphs, edge pulse speed correlates with data recency. Fresh = fast pulse, cooling = slow pulse, frozen = no pulse
- **Border saturation:** Card borders can desaturate independently of content: `border-color` interpolates from `--sh-phosphor` (fresh) to `--text-tertiary` (stale)
- **Opacity gradient:** Secondary elements (labels, decorative borders) fade before primary content does — creating progressive visual degradation

**Rule:** If a data surface shows a timestamp, that timestamp should have a visual freshness cue. The user should be able to scan the dashboard and see _which data is old_ without reading any numbers.

---

## 19. Performance Is Atmosphere

A 30fps CRT effect destroys immersion faster than removing the effect. Frame rate is atmosphere.

**Per-effect performance budget (60fps target):**

| Effect        | Paint Cost                          | Budget                    |
| ------------- | ----------------------------------- | ------------------------- |
| CRT stripe    | Low (CSS pseudo-element)            | Always OK                 |
| CRT scanline  | Medium (animated pseudo)            | Max 1 per page            |
| CRT flicker   | High (opacity animation on root)    | Optional, user-controlled |
| ShThreatPulse | Low (box-shadow animation)          | Max 5 simultaneous        |
| ShGlitch      | Medium (pseudo-element + clip-path) | Max 3 simultaneous        |
| ShShatter     | High (JS, creates DOM fragments)    | Max 1 at a time           |
| ShMantra      | Low (CSS pseudo-element)            | Unlimited                 |
| ShFrozen      | Low (filter: saturate)              | Unlimited                 |
| ShSkeleton    | Low (gradient animation)            | Unlimited                 |

**Auto-downgrade strategy:** If `navigator.hardwareConcurrency <= 2` or the device reports `prefers-reduced-motion`, disable CRT scanline and flicker, reduce ShShatter fragment count to 3, and skip ShGlitch chromatic aberration (use color-only highlight).

**Measurement:** Use `PerformanceObserver` for long animation frames. If any frame exceeds 16ms during effect playback, log it and consider reducing simultaneous effects.

---

## 20. The One-Sentence Test

Before adding any visual treatment to your dashboard, complete this sentence:

> "When the user sees **\_\_\_**, they know **\_\_\_**."

If you can't complete it with _exactly one thing_ the user knows, the treatment doesn't belong. If the answer is "it looks cool" — that's decoration, not diegetic design.

**Apply this test to every:**

- New CSS class you add
- Color you assign to an element
- Animation you trigger on a state change
- Sound effect you play
- Empty state message you write

The SUPERHOT game works because every visual element carries exactly one meaning. No ambiguity. No decoration. No noise. The dashboard should work the same way.

**The atmosphere is not what you add. It's what you don't.**

---

# Part II: Interaction, Information & Composition

---

## 21. Hover Is Interrogation

In SUPERHOT, you observe before you act. Hover should not change backgrounds, swap colors, or scale elements. Hover _reveals_: a subtle phosphor left-border, an underline, or a status detail that was hidden at rest.

Hover means "I'm looking at this" — not "I'm about to click this."

**Allowed hover treatments:**

- `border-left: 2px solid var(--sh-phosphor)` (attention indicator)
- `color: var(--text-primary)` on text that was `--text-secondary` (reveal)
- Tooltip-like detail text appearing inline (information on demand)

**Forbidden hover treatments:**

- Background color change (breaks the void)
- Scale transform (decorative, not diegetic)
- Opacity shift (conflicts with Rule 30's relevance encoding)
- Box-shadow on hover (conflicts with glow hierarchy — Rule 6)

```css
/* Correct: subtle phosphor reveal */
.sh-clickable:hover {
  border-left: 2px solid var(--sh-phosphor);
}

/* Wrong: background swap */
.row:hover {
  background: var(--bg-surface-raised); /* NO */
}
```

---

## 22. Focus Is Targeting

Keyboard focus is the crosshair. You are about to _act_ on this element. The focus ring is threat-red (`--sh-threat`) — not browser-default blue — because focus is the moment before execution.

Focus moves sequentially through actionable elements like selecting targets. Tab order should follow visual priority: hero card → stat cards → table rows → sidebar actions.

**Focus ring spec:**

```css
:focus-visible {
  outline: 2px solid var(--sh-threat);
  outline-offset: 2px;
}
```

**Rule:** Never suppress focus indicators. Never use `outline: none` without a visible replacement. Keyboard users navigate by focus — hiding it is hiding the crosshair.

---

## 23. Numbers Are Absolute

Never show "about 3 hours ago" or "~200." Show exact values: `3h 14m`, `197`. Precision communicates system confidence. Rounding communicates uncertainty — which should be explicit if intended.

| Correct    | Wrong             |
| ---------- | ----------------- |
| `197`      | ~200              |
| `3h 14m`   | about 3 hours ago |
| `12.4ms`   | fast              |
| `83%`      | most              |
| `0`        | none              |
| `197 ± 12` | approximately 200 |

**Exception:** When the exact number is meaningless to the user (e.g., internal IDs), truncate with an explicit marker: `a3f2...c891`.

**Rule:** If a value appears on screen, the user should be able to quote it exactly. No ambiguity.

---

## 24. Time Formats Are Military

`14:23:07` not `2:23 PM`. `2026-03-16` not `March 16, 2026`. The piOS terminal doesn't localize — it reports.

**Format reference:**

| Context             | Format       | Example      |
| ------------------- | ------------ | ------------ |
| Timestamp (full)    | `HH:MM:SS`   | `14:23:07`   |
| Timestamp (compact) | `HH:MM`      | `14:23`      |
| Date                | `YYYY-MM-DD` | `2026-03-16` |
| Duration (long)     | `Xh Ym`      | `3h 14m`     |
| Duration (short)    | `Xm Ys`      | `14m 22s`    |
| Duration (micro)    | `Xms`        | `850ms`      |
| Relative age        | `Xm ago`     | `14m ago`    |
| Uptime              | `Xd Xh`      | `2d 7h`      |

**Never use:** "seconds," "minutes," "hours," "March," "Tuesday," AM/PM, or locale-specific formatting.

---

## 25. Borders Signal Containment

Borders are structural, not decorative. They signal one thing: _this data is contained_.

| Border                                     | Signal                          |
| ------------------------------------------ | ------------------------------- |
| `1px var(--border-subtle)`                 | Container boundary (default)    |
| `2px var(--border-accent)`                 | Active/selected container       |
| `2px var(--sh-threat)`                     | Error container (ShThreatPulse) |
| `3px solid var(--sh-phosphor)` left-border | Active route indicator          |
| No border                                  | Data flows freely into the void |

**Never use borders for:**

- Visual decoration (double borders, dashed for aesthetics)
- Separation between sibling elements (use void/spacing instead)
- Emphasis (use glow hierarchy instead — Rule 6)

---

## 26. Scrolling Is Descent

When users scroll, they descend deeper into the system. Content at the top is immediate and urgent. Content below the fold is archival or historical.

**Layout order (top to bottom):**

1. System health / incident banner
2. Hero card / primary KPI
3. Active status (running jobs, live data)
4. Historical data (completed jobs, logs)
5. Configuration / settings

**Never put urgent status below the fold.** The command palette (`Ctrl+K`) exists precisely so users never _need_ to scroll to act.

**Rule:** If a user must scroll to discover an active error, the layout is wrong.

---

## 27. Loading Is Charging

ShSkeleton isn't "loading" — the system is _charging_. Data is energy; skeletons show where energy will flow. Multiple skeletons = multiple energy paths charging simultaneously.

When data arrives, the skeleton dissolves into content — energy completes its path. This is the `@starting-style` entrance: opacity 0 → 1, translateY -4px → 0. The content _materializes_ where the skeleton was.

**Skeleton placement rule:** A skeleton must occupy the exact space its content will fill. If the content is a stat card (120×80px), the skeleton is 120×80px. If the content is a table row, the skeleton is row-height × full-width. Never use generic pill shapes — they break the illusion of charging.

```jsx
// Correct: skeleton matches content shape
<ShSkeleton rows={1} width="120px" height="48px" />

// Wrong: generic skeleton unrelated to content size
<ShSkeleton rows={3} />  {/* what is this charging? */}
```

---

## 28. Tables Are Logs

Data tables read like terminal logs, not spreadsheets. The terminal logs events; it doesn't present business data in a grid.

**Table rules:**

- **Monospace alignment** — all values in `var(--sh-font)`
- **Left-justified** — no centered columns (terminals don't center)
- **Column headers** — UPPERCASE labels, `--text-muted`, `--tracking-widest`
- **Row hover** — faint phosphor left-border, not a full-width background highlight
- **No zebra striping** — the void between rows is sufficient visual separation
- **Timestamps first** — if a row has a timestamp, it's the leftmost column (log convention)
- **Status last** — status badge is the rightmost column (the conclusion)

```
TIMESTAMP    JOB          MODEL           STATUS
14:23:07     job-1234     qwen3:14b       complete
14:22:51     job-1233     llama3.1:70b    running
14:20:03     job-1232     qwen3:14b       error
```

---

## 29. Modals Are System Interrupts

A modal is not a dialog box — it is a system interrupt. The entire world darkens (`--bg-overlay`), and the modal presents a piOS prompt.

**Modal rules:**

- **Overlay:** `--bg-overlay` (near-black, 92% opacity) — the world is paused
- **Modal body:** sharp corners (`--radius: 0`), `1px var(--border-accent)`, monospace text
- **Language:** imperative, terse, first-person system voice
- **Actions:** `[CONFIRM]` and `[CANCEL]` — not "Yes" and "No", not "OK" and "Never mind"
- **Z-index:** `var(--z-modal)` — above everything except ShShatter fragments

**Voice examples:**

| Web UI (wrong)                          | piOS (correct)                    |
| --------------------------------------- | --------------------------------- |
| "Are you sure you want to delete this?" | `CONFIRM: PURGE DLQ (3 ENTRIES)?` |
| "Save changes before leaving?"          | `UNSAVED CHANGES. DISCARD?`       |
| "This action cannot be undone."         | `IRREVERSIBLE.`                   |

---

## 30. Opacity Encodes Relevance

Opacity is not a style choice — it is a data signal encoding how relevant content is to the current moment.

| Opacity     | Meaning                  | Use Case                                           |
| ----------- | ------------------------ | -------------------------------------------------- |
| `1.0`       | Current, actionable      | Active jobs, live metrics, primary actions         |
| `0.8`       | Related, secondary       | Supporting context, secondary stats                |
| `0.6`       | Historical, context-only | Completed jobs, past data                          |
| `0.4`       | Disabled, unavailable    | Disabled actions, unreachable services             |
| Below `0.4` | Hidden / transitioning   | ShFrozen stale state, ShShatter fragments mid-exit |

**Rule:** Never put actionable content below `0.8` opacity. If a user can click it, it must be prominent. This creates depth without z-index — high-opacity content _feels_ closer.

---

## 31. No Icons

SUPERHOT has no icons. The piOS terminal communicates through text, color, and effects — not pictograms.

| Icon (wrong) | Label (correct)                       |
| ------------ | ------------------------------------- |
| ⏸            | `[PAUSE]`                             |
| ▶            | `[RESUME]`                            |
| 🔴           | `ERROR` (in `--sh-threat` color)      |
| ✅           | `COMPLETE` (in `--sh-phosphor` color) |
| ⚙️           | `CONFIG`                              |
| 📊           | `METRICS`                             |
| 🔔 3         | `ALERTS: 3`                           |

**Exception:** SVG system diagrams (topology graphs, pipeline DAGs) use geometric shapes (circles, lines) — these are the _world_, not UI chrome.

**Rule:** If you reach for an icon, write a label instead. If the label is too long, the concept is too complex for an icon anyway.

---

## 32. The Dashboard Breathes (Polling Heartbeat)

Every poll cycle, fire a micro-animation on the "last updated" timestamp — an `ShGlitch` micro-burst or a brief `applyFreshness` re-evaluation. The dashboard isn't static between polls. It's alive, waiting.

**Heartbeat implementation:**

```js
// On each successful poll response:
glitchText(lastUpdatedEl, { duration: 100, intensity: "low" });
applyFreshness(lastUpdatedEl, Date.now());
```

**When polling stops** (network error, offline), the heartbeat stops. The user notices the _silence_ before they read the error. This is Rule 2 (Silence Is the Healthy Signal) applied to polling: regular heartbeat = alive, no heartbeat = frozen.

**Rule:** If the dashboard looks identical at `t=0` and `t=30s`, something is wrong. Either the heartbeat is missing, or the freshness states aren't updating.

---

## 33. Whitespace Is Gestalt

Every gap between elements communicates grouping (Gestalt law of proximity). Spacing is information, not empty pixels.

| Spacing | Token       | Signal                               |
| ------- | ----------- | ------------------------------------ |
| 4px     | `--space-1` | Same entity (label + value)          |
| 8px     | `--space-2` | Related items (stats in a row)       |
| 16px    | `--space-4` | Same section (cards in a group)      |
| 24px    | `--space-6` | Section boundary                     |
| 32px+   | `--space-8` | Different concerns (separate panels) |

**Rule:** Inconsistent spacing creates false groupings. If two cards are 16px apart and a third is 12px from one of them, the eye reads the 12px pair as a unit — regardless of semantic meaning. Use `--space-*` tokens exclusively. Never hardcode pixel values.

---

## 34. Progressive Disclosure Is Drilling

Don't show everything at once. Surface-level shows summary; interaction reveals detail; further drill shows raw data. Each level descends deeper — like drilling through SUPERHOT's simulation layers.

**Drill levels:**

| Level       | Content                         | Component                                     |
| ----------- | ------------------------------- | --------------------------------------------- |
| 0 — Surface | Summary KPI, health status      | `ShHeroCard`, `ShStatsGrid`                   |
| 1 — Detail  | Breakdowns, tables, charts      | `ShDataTable`, `ShTimeChart`, `ShCollapsible` |
| 2 — Raw     | Log lines, raw JSON, trace data | `ShCollapsible` with monospace code block     |

**Transitions between levels:**

- Level 0 → 1: `ShCollapsible` expand or route navigation with `@starting-style`
- Level 1 → 2: `ShCollapsible` nested expand or modal overlay
- Any level back up: collapse animation or route back transition

**Rule:** Never show Level 2 content (raw data) at Level 0 (surface). If raw JSON is on the main dashboard, the information hierarchy is broken.

---

## 35. Alerts: Binary Duration

A toast either auto-dismisses or persists until acknowledged. No middle ground.

| Type    | Duration         | Behavior                                     |
| ------- | ---------------- | -------------------------------------------- |
| Info    | 3000ms           | Auto-dismiss with `ShShatter` exit           |
| Warning | 5000ms           | Auto-dismiss, slightly longer                |
| Error   | `0` (persistent) | Stays until user dismisses or error resolves |

**No intermediate states:**

- No slow fade after 30 seconds
- No auto-collapse-but-still-present
- No countdown timer showing remaining display time
- No "click to keep visible"

**Rule:** If you're uncertain whether a toast should auto-dismiss, it shouldn't. Persistent is safer than lost.

---

## 36. Grids Are Crystalline

Layout grids should feel like a crystal lattice — regular, geometric, no organic curves or irregular spacing.

**Grid rules:**

- Use CSS Grid with explicit column/row definitions, not flexbox wrapping
- When items don't fill the grid, leave void cells — don't collapse the grid
- Column widths are uniform or follow a clear ratio (1:1, 1:2, 1:3)
- `gap` uses `--space-*` tokens — never mixed values
- The grid IS the world geometry; breaking it breaks the world

```css
/* Correct: crystalline grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

/* Wrong: organic flexbox wrapping */
.dashboard-flex {
  display: flex;
  flex-wrap: wrap; /* items flow unpredictably */
  gap: 12px 16px; /* mixed spacing */
}
```

**When a card spans multiple columns** (hero card, wide chart), use explicit `grid-column: span 2` — never `flex-grow`.

---

## 37. Error Recovery Is Visible

When an error resolves, don't silently remove the error state. Show the recovery. The user should _see_ the system heal.

**Recovery sequence:**

1. `ShGlitch` burst on the recovering element (catharsis)
2. Border color transitions from `--sh-threat` to `--sh-phosphor` (threat → life)
3. `ShThreatPulse` stops
4. `ShToast type="info"` confirms: `[14:23:07] RESTORED`
5. Phosphor calm returns

**Rule:** If an error state disappears without ceremony, users wonder "was that broken before?" Recovery is catharsis — the emotional payoff after tension. Skipping it is like ending a story mid-chapter.

---

## 38. The Interface Has Memory

Collapsed sections stay collapsed. Scroll position persists. CRT preferences persist. Sort orders persist. The piOS terminal remembers your configuration.

**What must persist (via `localStorage`):**

- CRT mode preferences (stripe/scanline/flicker)
- Audio enabled/disabled
- Collapsed section states
- Table sort column and direction
- Active route / last visited tab
- Command palette recent commands

**What must NOT persist:**

- Error states (errors are live data, not preferences)
- Freshness states (calculated from timestamps, not cached)
- Modal open/closed state (modals are interrupts, not persistent UI)

**Rule:** If the interface resets on refresh, it feels like amnesia. The system forgot you. Every UI state that represents a _user preference_ should survive a page reload.

---

## 39. Thresholds Are Visible Before They Break

When a metric approaches a danger zone, the _approach_ should be visible. Don't wait until the threshold is crossed to signal danger. Tension builds before the crisis.

**Progressive signaling:**

| Metric Range | Visual Treatment                                             |
| ------------ | ------------------------------------------------------------ |
| 0–60%        | Phosphor calm (normal)                                       |
| 60–80%       | `sh-glow-ambient` phosphor border appears                    |
| 80–90%       | `sh-glow-standard` + border shifts toward `--status-warning` |
| 90–100%      | `sh-glow-critical` + `ShThreatPulse` activates               |
| 100%+        | Full failure theater (Rule 12 escalation)                    |

**Apply to:** VRAM usage, queue depth, error rate, response latency — any metric with a known danger threshold.

```jsx
// VRAM bar with progressive signaling
<div
  class={`sh-vram-bar ${pct > 90 ? "sh-glow-critical" : pct > 80 ? "sh-glow-standard" : pct > 60 ? "sh-glow-ambient" : ""}`}
  style={`--sh-fill: ${pct}`}
>
  {pct}%
</div>
```

---

## 40. Skeleton Shapes Match Content

Skeleton loaders must match the _shape_ of the content they will replace. The skeleton is the shadow of the incoming data — it forecasts the layout before content arrives.

**Shape matching rules:**

| Content Type               | Skeleton Shape                                        |
| -------------------------- | ----------------------------------------------------- |
| Stat card (number + label) | Rectangle with number-height line + label-height line |
| Table (5 rows)             | 5 row-height lines at full width                      |
| Hero card (large metric)   | Wide rectangle with hero-size number line             |
| Graph / chart              | Rectangle at the graph's exact dimensions             |
| Status badge               | Small pill-width rectangle                            |
| Paragraph text             | 3 lines at 100%, 100%, 60% width                      |

**Never use:**

- Generic pill shapes unrelated to content size
- A single skeleton for an entire page (skeletons are per-component)
- Skeletons that are larger than their content (creates layout shift)

```jsx
// Correct: skeleton matches stat card anatomy
<ShSkeleton rows={2} width="120px" height="20px" />

// Wrong: generic skeleton with no relation to content
<ShSkeleton rows={3} />
```

**Rule:** If you can't tell what content a skeleton represents by looking at its shape, the skeleton is too generic.
