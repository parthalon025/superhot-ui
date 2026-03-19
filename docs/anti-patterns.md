# Anti-Pattern Reference

Quick-reference of what NOT to do when building on superhot-ui. Each anti-pattern cites the atmosphere-guide rule that forbids it.

---

## Visual Anti-Patterns

| Don't                                                | Why                                                       | Do Instead                                                                  | Rule     |
| ---------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| Background color change on hover                     | Breaks the void                                           | Phosphor left-border reveal (`border-left: 2px solid var(--sh-phosphor)`)   | R21      |
| Scale transform on hover                             | Decorative, not diegetic                                  | Color reveal (`--text-primary` from `--text-secondary`)                     | R21      |
| Opacity shift on hover                               | Conflicts with relevance encoding (opacity = data signal) | Phosphor left-border or inline detail text                                  | R21, R30 |
| Box-shadow on hover                                  | Conflicts with glow hierarchy                             | Phosphor left-border reveal                                                 | R21, R6  |
| Full-width background highlight on table row hover   | Not how terminals work                                    | Faint phosphor left-border                                                  | R28      |
| Zebra striping on tables                             | Void between rows is sufficient separation                | Consistent void background with spacing                                     | R28      |
| More than 40% component coverage per viewport        | Collapses atmosphere into generic dark theme              | Preserve 60%+ void; increase spacing with `--space-6` or wider              | R1       |
| Two elements with critical-level glow simultaneously | Breaks glow hierarchy; neither dominates                  | One critical glow per viewport; demote others to standard/ambient           | R6       |
| Decorative borders (double, dashed-for-aesthetics)   | Borders signal containment, not decoration                | Use void/spacing for separation, glow hierarchy for emphasis                | R25      |
| Borders between sibling elements for separation      | Void is the separator                                     | Use `--space-*` tokens between elements                                     | R25      |
| Borders for emphasis                                 | Conflicts with glow hierarchy                             | Use glow levels (ambient/standard/critical)                                 | R25, R6  |
| `z-index: 999` on data tables or world-content       | World-content at HUD z-levels breaks the spatial metaphor | Keep data at z-layer 1-2; reserve high z for toasts, modals, mantras        | R16      |
| Suppress focus indicators (`outline: none`)          | Hides the keyboard crosshair from navigation              | Always provide visible `:focus-visible` ring (`2px solid var(--sh-threat)`) | R22      |
| Organic curves in layout                             | Breaks the crystalline world geometry                     | Sharp corners, regular geometric grids                                      | R36      |
| Inconsistent spacing (mixed hardcoded pixel values)  | Creates false Gestalt groupings                           | Use `--space-*` tokens exclusively                                          | R33      |

## Color Anti-Patterns

| Don't                                                              | Why                                                        | Do Instead                                                                        | Rule |
| ------------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| Use red for borders, accents, or decoration                        | Exhausts threat signal scarcity; red becomes noise         | Use phosphor cyan (`--sh-phosphor`) for emphasis, brightness levels for hierarchy | R3   |
| Use red for hover states                                           | Wears out the emergency brake                              | Reserve red for active threats, errors, DLQ, shatter tint only                    | R3   |
| Exceed 10% red surface area during healthy state                   | Destroys the escalation headroom                           | Audit red usage; replace decorative red with cyan or brightness                   | R3   |
| Combine phosphor cyan and threat red on the same element           | They are opposite poles (alive vs. threatening)            | An element is either cyan (alive) or red (threatening), never both                | R4   |
| Tip the warm-cool balance (too many red or too many cyan elements) | Collapses the spatial depth illusion; interface flattens   | Maintain warm-cool balance: red foreground/urgent, cyan background/ambient        | R5   |
| Use browser-default blue for focus ring                            | Breaks the piOS aesthetic; focus is targeting (threat-red) | `:focus-visible { outline: 2px solid var(--sh-threat) }`                          | R22  |

## Typography Anti-Patterns

| Don't                                                            | Why                                                             | Do Instead                                                   | Rule     |
| ---------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------ | -------- |
| Conversational voice ("Hey, looks like...")                      | piOS is a terminal, not a chatbot                               | First-person, present-tense system voice: `FAULT`, `OFFLINE` | R13      |
| Apologetic language ("Sorry, we couldn't...")                    | Terminals don't apologize                                       | Declarative: `ERROR`, `TIMEOUT`, `OFFLINE`                   | R13, R9  |
| Promotional tone ("Try our new...", "Did you know...")           | Terminals don't sell                                            | Imperative when actionable, declarative when informational   | R13      |
| Emoji in UI text                                                 | Terminals don't emoji                                           | Text labels in system voice: `[PAUSE]`, `ERROR`, `COMPLETE`  | R13, R31 |
| "Loading..."                                                     | Web convention, not piOS                                        | `STANDBY`                                                    | R13      |
| "Something went wrong"                                           | Vague, conversational                                           | `FAULT` or `ERROR`                                           | R13      |
| "Nothing here yet"                                               | Apologetic empty state                                          | `NO DATA`                                                    | R13      |
| "Successfully completed!"                                        | Promotional, exclamatory                                        | `COMPLETE`                                                   | R13      |
| "Warning: please be careful"                                     | Conversational, verbose                                         | `CAUTION`                                                    | R13      |
| "Refreshing..."                                                  | Web convention                                                  | `SYNC`                                                       | R13      |
| "The request took too long"                                      | Conversational                                                  | `TIMEOUT`                                                    | R13      |
| "Cannot connect to server"                                       | Conversational                                                  | `OFFLINE`                                                    | R13      |
| "Back online!"                                                   | Promotional, exclamatory                                        | `RESTORED`                                                   | R13      |
| "Are you sure you want to delete this?"                          | Conversational dialog                                           | `CONFIRM: PURGE DLQ (3 ENTRIES)?`                            | R29      |
| "Save changes before leaving?"                                   | Conversational dialog                                           | `UNSAVED CHANGES. DISCARD?`                                  | R29      |
| "This action cannot be undone."                                  | Verbose                                                         | `IRREVERSIBLE.`                                              | R29      |
| "Yes" / "No" or "OK" / "Never mind" for modal actions            | Web-convention button labels                                    | `[CONFIRM]` and `[CANCEL]`                                   | R29      |
| Approximate values ("about 3 hours ago", "~200", "fast", "most") | Precision communicates confidence; rounding signals uncertainty | Exact values: `3h 14m`, `197`, `12.4ms`, `83%`               | R23      |
| Centered table columns                                           | Terminals don't center                                          | Left-justified columns, monospace alignment                  | R28      |

## Time & Number Anti-Patterns

| Don't                                             | Why                               | Do Instead                                              | Rule |
| ------------------------------------------------- | --------------------------------- | ------------------------------------------------------- | ---- |
| `2:23 PM` (12-hour format)                        | piOS doesn't localize; it reports | `14:23:07` (24-hour / military)                         | R24  |
| `March 16, 2026` (localized date)                 | Not terminal voice                | `2026-03-16` (ISO format)                               | R24  |
| Spelled-out units ("seconds", "minutes", "hours") | Verbose for terminal              | Abbreviated: `s`, `m`, `h`, `d` (e.g., `14m 22s`)       | R24  |
| Day names ("Tuesday") or month names ("March")    | Locale-specific formatting        | ISO date format only                                    | R24  |
| AM/PM                                             | Locale-specific                   | 24-hour time                                            | R24  |
| Show "about" or "approximately" before values     | Ambiguity erodes confidence       | Show exact value, or explicit uncertainty: `197 +/- 12` | R23  |

## Animation Anti-Patterns

| Don't                                                                                          | Why                                                              | Do Instead                                                                                                     | Rule     |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| Back-to-back animations without rest                                                           | Sensory overload; breaks dramatic pacing                         | Enforce rest frames: 300ms after shatter, 200ms after glitch, 500ms after state transition                     | R7       |
| Chain `.animate()` calls without a gap                                                         | No breathing room                                                | Use `animation-delay` or `setTimeout` for breath between effects                                               | R7       |
| More than 3 simultaneous animated effects per viewport                                         | Exceeds cognitive budget; overload risk                          | Batch: animate 3 most critical, fade-in rest after 500ms                                                       | R8       |
| Decorative idle animation during healthy state (pulsing badges, animated backgrounds, shimmer) | Destroys contrast that makes failure theater work                | Silence = healthy. Only CRT stripe and `@starting-style` entrances during operational state                    | R2       |
| ShShatter on routine exits (navigating away, collapsing panel, filtering)                      | Shatter is catharsis, earned by tension resolution               | Simple opacity fade or `@starting-style` reverse for routine actions                                           | R11      |
| Silent error recovery (error state disappears without ceremony)                                | Users can't tell the system healed; skips catharsis              | Recovery sequence: glitch burst, border transition threat-to-phosphor, toast `RESTORED`                        | R37      |
| CRT scanline + flicker on data-heavy dashboards                                                | Moving beam competes with data readability; numbers hard to read | Stripe only for dense data; scanline/flicker for sparse status dashboards                                      | R14      |
| CRT effects on mobile/small screens                                                            | Scanlines at mobile resolution become muddy                      | Disable all three CRT layers on mobile                                                                         | R14      |
| Ignoring `prefers-reduced-motion`                                                              | Accessibility violation                                          | Disable all animation; provide static equivalents for informational effects                                    | R14, R15 |
| Removing informational effects in reduced-motion without static alternatives                   | Information is lost                                              | Static red border replaces pulse, immediate grey replaces frozen, static text replaces mantra                  | R15      |
| Jump to critical failure state immediately on multi-service failure                            | Skips the tension-building escalation                            | Start component-level, escalate over 5-15s per the cadence: card -> sidebar -> section mantra -> layout mantra | R12      |
| 30fps CRT effects                                                                              | Sub-60fps destroys immersion faster than removing the effect     | Hit 60fps or disable the effect; use auto-downgrade for low-powered devices                                    | R19      |

## Layout Anti-Patterns

| Don't                                               | Why                                                    | Do Instead                                                                                             | Rule |
| --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---- |
| Urgent status or active errors below the fold       | User must scroll to discover problems; layout is wrong | System health and incident banners at top; use command palette for deep navigation                     | R26  |
| Flexbox wrapping for dashboard grids                | Items flow unpredictably; breaks crystalline geometry  | CSS Grid with explicit column/row definitions                                                          | R36  |
| `flex-grow` for spanning cards                      | Organic, unpredictable sizing                          | Explicit `grid-column: span 2`                                                                         | R36  |
| Mixed gap values (`gap: 12px 16px`)                 | Irregular spacing breaks world geometry                | Uniform `gap` using `--space-*` tokens                                                                 | R36  |
| Collapse grid when items don't fill it              | Breaks the lattice structure                           | Leave void cells; grid IS the world geometry                                                           | R36  |
| Raw JSON / Level 2 content on the main dashboard    | Information hierarchy is broken                        | Progressive disclosure: summary at Level 0, breakdowns at Level 1, raw data at Level 2 via drill-down  | R34  |
| Show everything at once (no progressive disclosure) | Overwhelms; no drill-down depth                        | Surface summary, reveal detail on interaction, drill to raw data                                       | R34  |
| All elements enter simultaneously on page load      | Visually flat; no materialization illusion             | Stagger: structure (0ms), skeletons (50ms), primary data (150ms), secondary (250ms+), effects (400ms+) | R10  |

## Content Anti-Patterns

| Don't                                                    | Why                                                        | Do Instead                                                                               | Rule     |
| -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Icons (emoji or pictograms) for UI actions               | piOS communicates through text, color, and effects         | Text labels: `[PAUSE]`, `[RESUME]`, `ERROR`, `CONFIG`, `ALERTS: 3`                       | R31      |
| Illustration mascots in empty states                     | Not terminal aesthetic; purposeful emptiness is the design | Void + structural skeleton + single mantra (`STANDBY`) + command palette hint            | R9       |
| Apologize in empty states ("No data yet")                | Empty state is the quiet world, not an error               | `NO DATA` or `STANDBY`                                                                   | R9       |
| Loading spinners for genuinely empty states              | Empty is not loading                                       | Static quiet world: void, skeleton structure, mantra                                     | R9       |
| Generic pill-shaped skeletons unrelated to content       | Breaks the "charging" illusion                             | Skeleton must match exact dimensions and shape of incoming content                       | R27, R40 |
| Single skeleton for an entire page                       | Skeletons are per-component shadows                        | One skeleton per component, each matching its content shape                              | R40      |
| Skeletons larger than their content                      | Creates layout shift on content arrival                    | Match skeleton dimensions to content dimensions exactly                                  | R40      |
| `ShSkeleton rows={3}` with no size/shape context         | Can't tell what content it represents                      | Specify `width`, `height` matching the target component anatomy                          | R27, R40 |
| Auto-play audio                                          | Audio is off by default; never auto-play                   | Gate behind `ShAudio.enabled` user preference                                            | R17      |
| Sound at animation trigger or cleanup (wrong sync point) | Breaks dramatic timing                                     | Sound at animation peak: shatter mid-scatter, glitch max distortion, mantra full opacity | R17      |

## State & Behavior Anti-Patterns

| Don't                                                                    | Why                                                     | Do Instead                                                                                         | Rule |
| ------------------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| Toast with slow fade after 30s                                           | No intermediate states for alerts; binary duration only | Auto-dismiss (3-5s) or persist until acknowledged                                                  | R35  |
| Auto-collapse-but-still-present toast                                    | Ambiguous state                                         | Dismiss fully or persist fully                                                                     | R35  |
| Countdown timer on toast showing remaining time                          | Intermediate state; distracting                         | Auto-dismiss cleanly or persist                                                                    | R35  |
| "Click to keep visible" on auto-dismiss toast                            | Intermediate state                                      | Make it persistent (duration: 0) if it might need to stay                                          | R35  |
| Persist error states across page reload                                  | Errors are live data, not preferences                   | Recalculate error state from current data on load                                                  | R38  |
| Persist freshness states across page reload                              | Freshness is calculated from timestamps, not cached     | Recalculate from timestamps on load                                                                | R38  |
| Persist modal open/closed state                                          | Modals are interrupts, not persistent UI                | Modals always start closed                                                                         | R38  |
| Reset user preferences on page reload (CRT, audio, sort, collapse state) | Interface amnesia; system forgot the user               | Persist preferences via `localStorage`                                                             | R38  |
| Wait until threshold is crossed to signal danger                         | Misses the tension-building approach                    | Progressive signaling: ambient glow at 60%, standard at 80%, critical at 90%, full failure at 100% | R39  |
| Dashboard looks identical between poll cycles                            | No heartbeat; appears dead                              | Micro-animation on "last updated" each poll: glitch micro-burst + freshness re-evaluation          | R32  |
| Timestamps without visual freshness cues                                 | User must read numbers to assess data age               | `applyFreshness` on every timestamp; phosphor glow dims as data ages                               | R18  |
| Actionable content below 0.8 opacity                                     | Clickable things must be prominent                      | Keep interactive elements at 1.0 or 0.8 opacity minimum                                            | R30  |
| Adding visual treatment that fails the one-sentence test                 | "It looks cool" is decoration, not diegetic design      | Complete: "When user sees **_, they know _**" with exactly one meaning                             | R20  |
