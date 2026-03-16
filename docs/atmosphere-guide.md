# Atmosphere Guide — 20 Rules for Consumer Dashboards

How to maintain the SUPERHOT atmosphere when building on superhot-ui. These rules sit between the component API (`consumer-guide.md`) and the design constitution (`design-philosophy.md`). They govern the _feeling_ of the interface — the part that can't be enforced by tokens alone.

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
