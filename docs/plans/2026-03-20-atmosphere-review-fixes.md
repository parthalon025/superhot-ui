# Atmosphere Review Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 7 findings from the atmosphere-reviewer test run while preserving the UI's ability to control the backend — every button, modal, command palette, and data surface must remain functional after changes.

**Architecture:** Three batches: (1) bundle gaps — make documented features actually ship to consumers, (2) facility cascade + doc fixes — make the atmosphere system complete, (3) agent refinements — add the 8 missing capabilities identified during brainstorming. No behavioral changes to existing components. Additive CSS imports and JS exports only.

**Tech Stack:** CSS (`@import`), esbuild (stdin barrel), Node.js (`node --test`)

**Safety principle:** These changes wire up existing, tested code to the distribution bundles. No new components, no behavior changes, no breaking API modifications. The UI/UX controls the backend the same way after — we're only fixing the plumbing between the library and its consumers.

---

## Batch 1: Bundle Gaps (Critical — consumers can't use documented features)

### Task 1: Add missing CSS component imports to superhot.css

**Files:**

- Modify: `css/superhot.css:8-20`

**Step 1: Add the 23 missing @import lines**

Current superhot.css imports 10 component files (skeleton, toast, status-badge, command-palette, vram-bar, crt-toggle, stat-card, antline, announcement, test-chamber, facility). Add the remaining 23:

```css
@import "./tokens.css";
@import "./semantic.css";
@import "./components/skeleton.css";
@import "./components/toast.css";
@import "./components/status-badge.css";
@import "./components/command-palette.css";
@import "./components/vram-bar.css";
@import "./components/crt-toggle.css";
@import "./components/stat-card.css";
@import "./components/antline.css";
@import "./components/announcement.css";
@import "./components/test-chamber.css";
@import "./components/facility.css";
@import "./components/advanced-effects.css";
@import "./components/animations.css";
@import "./components/ansi.css";
@import "./components/banner.css";
@import "./components/boot.css";
@import "./components/chart.css";
@import "./components/corruption.css";
@import "./components/crt-overlay.css";
@import "./components/data-table.css";
@import "./components/event-timeline.css";
@import "./components/filter-panel.css";
@import "./components/frame.css";
@import "./components/hero-card.css";
@import "./components/incident-hud.css";
@import "./components/matrix-rain.css";
@import "./components/modal.css";
@import "./components/nav.css";
@import "./components/pipeline.css";
@import "./components/progress-steps.css";
@import "./components/signal-bars.css";
@import "./components/terminal-chrome.css";
@import "./components/utilities.css";
```

**Step 2: Build and verify CSS output**

Run: `cd ~/Documents/projects/superhot-ui && npm run build`
Expected: Build completes, `dist/superhot.css` is larger than before.

**Step 3: Verify no class name collisions**

Run: `cd ~/Documents/projects/superhot-ui && grep -c '@layer superhot' css/components/*.css`
Expected: All component files use `@layer superhot.effects` — no specificity collisions. Verify none use unlayered rules that could override consumer styles.

**Step 4: Run tests**

Run: `cd ~/Documents/projects/superhot-ui && npm test`
Expected: All tests pass. CSS import order doesn't affect JS tests.

**Step 5: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add css/superhot.css
git commit -m "fix: add 23 missing CSS component imports to superhot.css

Consumers using @import 'superhot-ui/css' were getting no styles for
incident-hud, modal, nav, data-table, utilities, terminal-chrome,
ANSI, boot, and 15 other documented components. All 33 component
files now included in the entry point.

Atmosphere-reviewer finding #1."
```

---

### Task 2: Add missing JS exports to esbuild barrel

**Files:**

- Modify: `esbuild.config.mjs:25-35`

**Step 1: Add the missing JS export lines to the stdin barrel**

Current barrel exports 9 modules. Add the 16 missing modules (each file's exports verified from the grep of `^export` across `js/*.js`):

```js
const jsConfig = {
  ...shared,
  stdin: {
    contents: [
      // Core effects
      "export { applyFreshness, computeFreshness } from './js/freshness.js';",
      "export { shatterElement } from './js/shatter.js';",
      "export { glitchText } from './js/glitch.js';",
      "export { applyMantra, removeMantra } from './js/mantra.js';",
      // Audio (all SFX — original + Portal + tension drone)
      "export { ShAudio, playSfx, setTensionDrone, stopTensionDrone } from './js/audio.js';",
      // Atmosphere budget
      "export { trackEffect, isOverBudget, activeEffectCount, resetEffects, MAX_EFFECTS } from './js/atmosphere.js';",
      // CRT
      "export { setCrtMode } from './js/crt.js';",
      // Narrator + Facility
      "export { narrate, ShNarrator } from './js/narrator.js';",
      "export { corpus } from './js/narrator-corpus.js';",
      "export { setFacilityState, getFacilityState } from './js/facility.js';",
      // Threshold
      "export { computeThreshold, applyThreshold } from './js/threshold.js';",
      // Heartbeat + Freshness watcher
      "export { heartbeat } from './js/heartbeat.js';",
      "export { watchFreshness } from './js/watchFreshness.js';",
      // Escalation + Orchestration + Recovery
      "export { EscalationTimer } from './js/escalation.js';",
      "export { orchestrateEscalation } from './js/orchestrate.js';",
      "export { recoverySequence } from './js/recovery.js';",
      // Celebration + Action feedback
      "export { celebrationSequence } from './js/celebration.js';",
      "export { confirmAction } from './js/commandFeedback.js';",
      // Boot
      "export { bootSequence } from './js/boot.js';",
      // Hardware detection
      "export { detectCapability, applyCapability } from './js/hardware.js';",
      // Utilities
      "export { createToastManager } from './js/toastManager.js';",
      "export { createShortcutRegistry } from './js/shortcuts.js';",
      "export { setMonitorVariant, loadMonitorVariant } from './js/monitorTheme.js';",
      "export { scrollSpy } from './js/scrollSpy.js';",
      "export { formatTime } from './js/formatTime.js';",
    ].join("\n"),
    resolveDir: ".",
    loader: "js",
  },
  outfile: "dist/superhot.js",
};
```

**Step 2: Build and verify**

Run: `cd ~/Documents/projects/superhot-ui && npm run build`
Expected: Build completes. `dist/superhot.js` is larger. No bundling errors.

**Step 3: Run tests**

Run: `cd ~/Documents/projects/superhot-ui && npm test`
Expected: All tests pass.

**Step 4: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add esbuild.config.mjs
git commit -m "fix: add 16 missing JS module exports to esbuild barrel

Consumers importing from 'superhot-ui' could not access
EscalationTimer, orchestrateEscalation, recoverySequence,
heartbeat, bootSequence, computeThreshold, watchFreshness,
and 9 other documented functions. All 25 JS modules now
exported from the bundle.

Atmosphere-reviewer finding #2."
```

---

## Batch 2: Facility Cascade + Doc Fixes

### Task 3: Remap Cave's terminal-amber tokens in facility.css

**Files:**

- Modify: `css/components/facility.css`
- Test: Visual inspection via `examples/demo.html`

**Step 1: Add terminal-amber remapping to breach state**

Add `--sh-terminal-amber` and `--sh-terminal-bg` overrides so Cave's announcement personality collapses to threat in breach:

```css
@layer superhot.effects {
  /* Alert: SUPERHOT red bleeds into Portal blue */
  [data-sh-facility="alert"] {
    --sh-portal-blue: var(--sh-threat);
  }

  /* Breach: full SUPERHOT mode — all Portal colors become threat */
  [data-sh-facility="breach"] {
    --sh-portal-orange: var(--sh-threat);
    --sh-portal-blue: var(--sh-threat);
    --sh-portal-blue-glow: var(--sh-threat-glow);
    --sh-portal-orange-glow: var(--sh-threat-glow);
    --sh-terminal-amber: var(--sh-threat);
    --sh-terminal-bg: color-mix(in oklch, var(--sh-threat) 8%, var(--sh-void));
  }
}
```

**Step 2: Build**

Run: `cd ~/Documents/projects/superhot-ui && npm run build`

**Step 3: Run tests**

Run: `cd ~/Documents/projects/superhot-ui && npm test`
Expected: All tests pass.

**Step 4: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add css/components/facility.css
git commit -m "fix: remap Cave's terminal-amber tokens in breach state

Cave's announcement personality used --sh-terminal-amber and
--sh-terminal-bg which were not shifted by facility.css. In breach,
Cave's announcement stayed amber while all other Portal tokens
collapsed to threat red. Now fully absorbed.

Atmosphere-reviewer finding #3."
```

---

### Task 4: Fix EscalationTimer threshold documentation

**Files:**

- Modify: `docs/consumer-guide.md`

**Step 1: Fix the threshold values**

In `docs/consumer-guide.md`, find the Failure & Recovery section. The EscalationTimer description says:

```
4-stage timeline: component → sidebar → section mantra → layout mantra (atmosphere Rule 12).
```

Change the escalation timing from "5s → 15s → 60s → 120s" to match the actual code (`[5000, 10000, 45000, 60000]`):

```
esc.start(); // begins 5s → 10s → 45s → 60s escalation
```

**Step 2: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add docs/consumer-guide.md
git commit -m "fix: correct EscalationTimer threshold docs (5/10/45/60s not 5/15/60/120s)

Atmosphere-reviewer finding #5."
```

---

### Task 5: Add companion role guidance to consumer docs

**Files:**

- Modify: `docs/consumer-guide.md` (after the Narrator section)
- Modify: `docs/consumer-claude-md.md` (in the Narrator block)

**Step 1: Add role guidance table to consumer-guide.md**

After the Narrator section's paragraph about five personalities, add:

```markdown
### Personality Roles

Each personality has a specific relationship to the operator — choose based on context, not preference:

| Personality | Role                                | Best for                                         | Facility state fit                           |
| ----------- | ----------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `glados`    | Overseer — observes, grades         | Main monitoring voice, status, errors            | All states (stays cool in breach)            |
| `cave`      | Founder — inspires, contextualizes  | Onboarding, setup, about pages, release notes    | `normal` only (not operational)              |
| `wheatley`  | Companion — mirrors operator stress | User-facing error recovery, unexpected states    | `normal` and `alert` (overwhelmed in breach) |
| `turret`    | Sentinel — terse sensor reports     | Alert banners, notification badges, terse status | All states (consistent observer)             |
| `superhot`  | The experiment itself               | Breach mantras, raw system voice                 | `breach` primarily                           |

During `alert`, GLaDOS gets shorter and more pointed. Wheatley accelerates. Turret reports steadily. Cave goes quiet. In `breach`, only GLaDOS (at her coldest), Turret, and SUPERHOT are appropriate — the situation is too severe for Wheatley's panic or Cave's pep talks.
```

**Step 2: Add brief role guidance to consumer-claude-md.md**

In the Narrator block, after the line about `ShAnnouncement`, add:

```markdown
- Personality is context, not preference: GLaDOS for main monitoring, Cave for onboarding/about, Wheatley for user-facing recovery, Turret for terse alerts, SUPERHOT for breach mantras
- During `breach`, use only GLaDOS (coldest), Turret, or SUPERHOT — other personalities fight the severity
```

**Step 3: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add docs/consumer-guide.md docs/consumer-claude-md.md
git commit -m "docs: add companion role guidance to consumer docs

Explains when to use each narrator personality based on their
relationship to the operator and which facility states they fit.
Prevents mismatches like Wheatley during breach.

Atmosphere-reviewer finding #6."
```

---

## Batch 3: Agent Refinements

### Task 6: Add context detection, severity levels, and adoption awareness to agent

**Files:**

- Modify: `.claude/agents/atmosphere-reviewer.md`

**Step 1: Add context detection preamble**

After the "Key Files" section, add:

```markdown
## Step 0: Locate the Design System

Before running any checks, determine your context:

1. If `./css/tokens.css` exists → you're in the superhot-ui repo. `SH_ROOT = .`
2. If `./node_modules/superhot-ui/css/tokens.css` exists → you're in a consumer project. `SH_ROOT = ./node_modules/superhot-ui`
3. Read all Key Files from `SH_ROOT`. Review consumer files from `./`.

When in a consumer, also check:

- `package.json` for superhot-ui dependency
- CLAUDE.md for the injected design rules block
- `esbuild.config.mjs` for Preact alias (if applicable)
```

**Step 2: Add severity levels**

In the "Output Format" section, after the verdict line, add:

```markdown
### Finding Severity

Tag each finding with a severity:

| Level     | Meaning                                                  | Action               |
| --------- | -------------------------------------------------------- | -------------------- |
| **BREAK** | Violates the recursive loop or breaks atmosphere cascade | Must fix before ship |
| **GAP**   | Missing integration that weakens the experience          | Should fix           |
| **NOTE**  | Opportunity to deepen the experience                     | Consider for future  |
```

Update the output format examples to show severity tags:

```
### FACILITY CASCADE
- [BREAK] Cave's --sh-terminal-amber not remapped in breach — orphaned in atmosphere
- [GAP] Alert state has no motion stuttering mechanism
- [NOTE] Consider antline speed change in alert for additional dimension
```

**Step 3: Add adoption-level awareness**

After the context detection section, add:

```markdown
## Adoption Level Detection

When reviewing a consumer, detect adoption level before running checks:

| Tier                | Detection                                         | Checks to run                            |
| ------------------- | ------------------------------------------------- | ---------------------------------------- |
| **CSS-only**        | Imports `superhot-ui/css`, no JS imports          | Palette + anti-patterns only             |
| **Effects**         | Imports JS utilities (freshness, shatter, glitch) | + time-freeze discipline, rest state     |
| **Full atmosphere** | Imports facility state + narrator + audio         | All checks, full three-experience review |

Adjust expectations to the tier. Don't flag missing narrator in a CSS-only consumer.
```

**Step 4: Add operator agency check**

In the full pass checks, add as check 6.5 (between THREE EXPERIENCES and SIX DIMENSIONS):

```markdown
**6.5 OPERATOR AGENCY**

- Controls remain accessible during breach (buttons, modals, inputs still function)
- Information compresses but doesn't disappear (data is prioritized, never hidden)
- Recovery is possible from any state (the operator can always act)
- `ShModal` used for irreversible actions even during crisis (system asks, not just commands)
- The UI serves the operator at every facility state — atmosphere is not allowed to block function
```

**Step 5: Add accessibility check**

In the full pass checks, add as check 9.5 (after DOCUMENTATION COHESION):

```markdown
**9.5 ACCESSIBILITY ACROSS EXPERIENCES**

- `prefers-reduced-motion`: Three experiences still distinguishable without animation (color shift survives, motion dimension degrades gracefully)
- `forced-colors`: Facility state transitions maintain distinguishability (check for `@media (forced-colors: active)` overrides in facility.css)
- `aria-live` regions update correctly during facility transitions
- Narrator `ShAnnouncement` has `role="status"` + `aria-live="polite"` (screen reader announces personality text)
```

**Step 6: Add CSS @layer check to anti-patterns**

In the anti-patterns section under "Fusion anti-patterns", add:

```markdown
- Consumer CSS overrides placed inside `@layer` (will lose to superhot-ui's layered rules — overrides must be unlayered)
```

**Step 7: Add recipes reference**

In the "Key Files" table, add:

```markdown
| `docs/recipes/*.md` | Reference implementations of correct integration patterns |
```

**Step 8: Add narrator category semantics check**

In the COMPANION ROLES check, add:

```markdown
- Narrator categories used semantically: `narrate('destructive')` only for irreversible actions, `narrate('greeting')` only at session start, `narrate('countdown')` only with actual timed operations
```

**Step 9: Commit**

```bash
cd ~/Documents/projects/superhot-ui
git add .claude/agents/atmosphere-reviewer.md
git commit -m "feat: add 8 capabilities to atmosphere-reviewer agent

Context detection (superhot-ui repo vs consumer project), finding
severity levels (BREAK/GAP/NOTE), adoption-level awareness,
operator agency check, accessibility across experiences, CSS @layer
check, recipes reference, narrator category semantics.

Enables the agent to run in consumer projects and produce
prioritized, context-appropriate findings."
```

---

## Verification

After all 3 batches:

1. `npm run build` — verify dist/ outputs are complete
2. `npm test` — all tests pass
3. Open `examples/demo.html` — visual spot-check that effects still render
4. Verify consumer-guide.md and consumer-claude-md.md are consistent
5. Run the atmosphere-reviewer agent again — expect verdict to improve from GAPS FOUND toward COHESIVE (remaining gaps: foundational doc staleness, alert motion signature — both are design work, not fixes)

**What this does NOT change:**

- No component behavior modifications
- No new Preact components or JS modules
- No API changes — all existing imports continue to work
- No changes to how the UI controls the backend — every button, modal, command palette, data table, and interactive element works exactly as before
- The facility state system still shifts CSS tokens only — it never blocks interaction
