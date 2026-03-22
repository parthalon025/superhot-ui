# Changelog

## 1.0.0 (2026-03-22)


### Features

* add 7 new DS primitives (ShSkeleton, ShToast, ShStatusBadge, ShCommandPalette, ShCrtToggle, ShAudio, vram-bar) ([bf52a59](https://github.com/parthalon025/superhot-ui/commit/bf52a5978a609b2f3be7b11f26441fad66f0526f))
* add 8 capabilities to atmosphere-reviewer agent ([40420c1](https://github.com/parthalon025/superhot-ui/commit/40420c1363b7e1bf497d54346bb441d9b3111b81))
* add consumer setup script (symlink fix + CLAUDE.md inject + postinstall patch) ([850c983](https://github.com/parthalon025/superhot-ui/commit/850c9832fa0f75b8a6461a37f9e5f3e348a506c5))
* add CSS freshness state selectors ([998077c](https://github.com/parthalon025/superhot-ui/commit/998077ce0861ccea155cf0a7071aea48512212d5))
* add effect keyframes and selectors ([a6590ae](https://github.com/parthalon025/superhot-ui/commit/a6590aeed92388a7258daa9eb1786decab6f8654))
* add esbuild config and build pipeline ([2071a26](https://github.com/parthalon025/superhot-ui/commit/2071a265b834012a9d0ac0d0b2ea4a7999987122))
* add freshness.js utility ([099c5fe](https://github.com/parthalon025/superhot-ui/commit/099c5fe10f0522854485c1100a60a4211f9f74bf))
* add glitch.js and mantra.js utilities ([5286c74](https://github.com/parthalon025/superhot-ui/commit/5286c749fc3e3410890a540dc66e9f0927c62de9))
* add Portal-inspired narrator, audio, and UI components ([53231ad](https://github.com/parthalon025/superhot-ui/commit/53231adb31e5ad2e575a2127dbeb8d48fcd47972))
* add Preact components (ShFrozen, ShShatter, ShGlitch, ShMantra, ShThreatPulse) ([d74d500](https://github.com/parthalon025/superhot-ui/commit/d74d500ea13046bef3e73312579e49281691072f))
* add responsive degradation and reduced-motion rules ([dcc187c](https://github.com/parthalon025/superhot-ui/commit/dcc187c23ebebcaf37ef73deb4590921806aa683))
* add shatter.js utility ([29b1323](https://github.com/parthalon025/superhot-ui/commit/29b132306ce8a31add989ac503e80f593f8c13c0))
* add standalone demo page for all SUPERHOT effects ([f0d1370](https://github.com/parthalon025/superhot-ui/commit/f0d1370df326542545a2ba07a27d68cf0df10c20))
* add SUPERHOT CSS design tokens ([d82058f](https://github.com/parthalon025/superhot-ui/commit/d82058f8b8193652b67be339673f83bc93417fba))
* alert CSS atmosphere + forced-colors overrides ([d38323d](https://github.com/parthalon025/superhot-ui/commit/d38323de4ba262bb358b0f99e1b25ee46e0aa809))
* consumer setup script (symlink fix + CLAUDE.md inject + postinstall patch) ([a7df6f5](https://github.com/parthalon025/superhot-ui/commit/a7df6f594f66861c8a93cf5b7bd4a5844b5ac6b4))
* **css:** [@layer](https://github.com/layer), nesting, [@starting-style](https://github.com/starting-style), backdrop-filter, container queries, CRT layer, a11y ([7141b8c](https://github.com/parthalon025/superhot-ui/commit/7141b8cb6dcc737f5c05b070ceb0baf5c794f255))
* **css:** overhaul tokens — oklch, [@property](https://github.com/property), light-dark(), phosphor, piOS hierarchy ([1b36f4a](https://github.com/parthalon025/superhot-ui/commit/1b36f4a9738b94979fde60330d291fdfdb775151))
* dashboard expansion primitives ([9cf7c1c](https://github.com/parthalon025/superhot-ui/commit/9cf7c1ce347b70272dd6d448526179d46a217d60))
* export trackEffect/isOverBudget from atmosphere.js ([#13](https://github.com/parthalon025/superhot-ui/issues/13)) ([e558336](https://github.com/parthalon025/superhot-ui/commit/e5583367a0f17fa7a522bf358d206c241d7cc05d))
* **js:** bump shatter default fragments to 12, add shatter tests ([b92fa84](https://github.com/parthalon025/superhot-ui/commit/b92fa84d02afc8b861b915e7a23d3009614aebb2))
* **lint:** add ESLint config and fix husky pre-commit hook ([b7521ea](https://github.com/parthalon025/superhot-ui/commit/b7521ea77394dea940b213ad6be5673b2f0f39ac))
* modernize CSS architecture + Preact components ([82fdf41](https://github.com/parthalon025/superhot-ui/commit/82fdf413312db34c34e9c39956f09be4ba004dee))
* Portal Phase 2 — facility state system, atmosphere fusion, and test coverage ([ff4d979](https://github.com/parthalon025/superhot-ui/commit/ff4d979470a949ab44895ba8cc00f646d60c137f))
* **preact:** add intensity mode to ShCrtToggle ([#6](https://github.com/parthalon025/superhot-ui/issues/6)) ([ab0244c](https://github.com/parthalon025/superhot-ui/commit/ab0244c59813632488efe6abd15bff89f2f94903))
* **preact:** ShFrozen supports @preact/signals timestamp for instant reactivity ([e2b7df7](https://github.com/parthalon025/superhot-ui/commit/e2b7df74807b65893273c12e61e184fa85e38be7))
* propagate ShStatCard from feature/shstatcard worktree to main ([a64efea](https://github.com/parthalon025/superhot-ui/commit/a64efea33128b6ab1caf02ff8d2dc11ca7ceef4d))
* superhot-ui foundation maximization — 77 commits, 130 files, 9.1/10 SUPERHOT fidelity ([4f47eea](https://github.com/parthalon025/superhot-ui/commit/4f47eeada123297428a7b244b4043cd3c700ccf0))
* **tokens:** add semantic token layer — enables [@import](https://github.com/import) 'superhot-ui' as full theme ([#4](https://github.com/parthalon025/superhot-ui/issues/4)) ([949a071](https://github.com/parthalon025/superhot-ui/commit/949a07191af7965347dc2f1b76d029bf32b4ac63))


### Bug Fixes

* accessibility and forced-colors from 10-agent review ([db87d8f](https://github.com/parthalon025/superhot-ui/commit/db87d8f964ecc33ba2f1367ff42d6efa00ff2829))
* add .worktrees/ to eslint ignores ([8ef32c5](https://github.com/parthalon025/superhot-ui/commit/8ef32c5bbae4ef7245de17730a018d11523e1cf1))
* add 16 missing JS module exports to esbuild barrel ([60bd8ed](https://github.com/parthalon025/superhot-ui/commit/60bd8ed841c77680c7f1d96b04e97e523f6ea49a))
* add 23 missing CSS component imports to superhot.css ([d97f9b9](https://github.com/parthalon025/superhot-ui/commit/d97f9b9b425224dfdf3cecfa975c5a6a0f96e964))
* add scripts+docs to package files, fix test fixture, add symlink coverage ([5652349](https://github.com/parthalon025/superhot-ui/commit/5652349c59d973d76c0a767091dabe7bbc2b8d85))
* address 10-agent review findings ([51143d2](https://github.com/parthalon025/superhot-ui/commit/51143d2402b45324eb09d56b0ac874fdf96f5991))
* correct EscalationTimer threshold docs and add companion role guidance ([e0026ce](https://github.com/parthalon025/superhot-ui/commit/e0026ced6100352b400d2762a9130eee66ddad6d))
* correct facility.js JSDoc — document CSS-only scope, not aspirational narrator coupling ([d365434](https://github.com/parthalon025/superhot-ui/commit/d36543413c09bd3b39dfacb924e8c0168457d6b1))
* **css:** correct crt-stripe default, timing token names, remove state-transition ([c0fa52f](https://github.com/parthalon025/superhot-ui/commit/c0fa52f9b274a1587ed634567d6a5e1a62fcf739))
* **css:** replace removed --sh-state-transition with concrete value ([3d1d046](https://github.com/parthalon025/superhot-ui/commit/3d1d04638f383b3ac8da8c502558a6b8a4b74c84))
* **css:** restore original timing token names, simplify identical light-dark() values ([2dd86ff](https://github.com/parthalon025/superhot-ui/commit/2dd86ffe88eb05d4cf6023da91e7570188b8c97c))
* eslint config — add browser globals to scripts/tests, remove unused __filename ([0e6c002](https://github.com/parthalon025/superhot-ui/commit/0e6c0020cfbb7c9de715a816f70a5dff74bf1d81))
* eslint config — add browser globals to scripts/tests, remove unused __filename ([d2c2c3e](https://github.com/parthalon025/superhot-ui/commit/d2c2c3e6fd99ede3f5fc64bf12afba05d3858289))
* **pkg:** move @preact/signals to devDependencies — optional peer dep only ([15434da](https://github.com/parthalon025/superhot-ui/commit/15434daf812d82a522d95c9fed254ebbe2dadaf2))
* remap Cave's terminal-amber tokens in breach state ([ee1f9c4](https://github.com/parthalon025/superhot-ui/commit/ee1f9c4ca1b92cdb79c49e39768bcf56b4417fef))
* remove unused eslint-plugin-import and eslint-plugin-security ([5785a2c](https://github.com/parthalon025/superhot-ui/commit/5785a2ceb1fdddfdfff665282400b636dedb73be))
* Run 3 cohesion audit — frost-shimmer breach, success SFX, 5 undocumented SFX, dimOthers warning ([c191de1](https://github.com/parthalon025/superhot-ui/commit/c191de1773a9d787df6fed2c536d34e386b34141))
* setup.js — preserve postinstall, trailing newline, error handling, esbuild detection ([25f8cc6](https://github.com/parthalon025/superhot-ui/commit/25f8cc6cee78e0e80e911e009c08578f9928e256))
* status-warning doc claim, playSfx JSDoc, session farewell ([632d3c8](https://github.com/parthalon025/superhot-ui/commit/632d3c8d65e14f373bdd1256e2d90f7347a21423))
* use 'node --test tests/' for CI glob compatibility ([38cf8c4](https://github.com/parthalon025/superhot-ui/commit/38cf8c413689bfa92e3a58700238dd2279785e79))

## [0.4.0] — 2026-03-20

### Added — Portal Phase 2

- Facility state system (`setFacilityState`, `getFacilityState`) — atmosphere master switch. Three states: `normal` (Portal calm), `alert` (red bleeds into blue), `breach` (full SUPERHOT). Sets `data-sh-facility` on `<html>`, CSS descendant selectors shift all Portal tokens simultaneously.
- Narrator system (`narrate`, `ShNarrator`) — personality-driven phrase engine. 5 personalities (GLaDOS, Cave Johnson, Wheatley, Turret, SUPERHOT) × 12 categories. Template interpolation, anti-repeat, context-aware.
- Narrator corpus (`js/narrator-corpus.js`) — 330-line phrase bank with personality-appropriate text for every UI context.
- ShAnnouncement component — narrative banner with typing effect, personality styling, `prefers-reduced-motion` support, `aria-live="polite"`.
- ShAntline component — Portal-inspired animated connecting line. Active (orange) vs inactive (blue). Colors respond to facility state.
- ShTestChamber component — panel assembly container with staggered slide animation. Chamber number badge, direction control, compromised state.
- Portal SFX: `portal-chime` (ascending arpeggio), `portal-fail` (descending), `turret-deploy` (formant activation), `turret-shutdown` (formant deactivation), `facility-hum` (60Hz ambient), `panel-slide` (filtered noise burst).
- Personality-aware audio remapping — `ShAudio.narratorPersonality` auto-remaps generic SFX to personality variants (e.g., `complete` → `portal-chime` for GLaDOS).
- Facility CSS (`css/components/facility.css`) — token shifts for alert and breach states, including Cave's terminal-amber tokens.
- Atmosphere reviewer agent (`.claude/agents/atmosphere-reviewer.md`) — opus-model cohesion reviewer with recursive loop model, three-experience framework, 11-check review process, severity levels, consumer context detection.

### Fixed

- CSS bundle: 23 missing component CSS imports added to `superhot.css`. Consumers using `@import 'superhot-ui/css'` now get all 33 component files.
- JS bundle: 16 missing module exports added to esbuild barrel. Consumers can now import `EscalationTimer`, `orchestrateEscalation`, `recoverySequence`, `heartbeat`, `bootSequence`, `computeThreshold`, `watchFreshness`, `celebrationSequence`, `confirmAction`, `detectCapability`, `applyCapability`, `createToastManager`, `createShortcutRegistry`, `setMonitorVariant`, `loadMonitorVariant`, `scrollSpy`, `formatTime`.
- Cave's `--sh-terminal-amber` and `--sh-terminal-bg` tokens now remap to threat in breach state (previously orphaned).
- EscalationTimer threshold documentation corrected: 5s/10s/45s/60s (was incorrectly documented as 5s/15s/60s/120s).
- `facility.js` JSDoc corrected — documents CSS-only scope, removes aspirational narrator coupling claim.

### Changed

- Consumer guide restructured: App Initialization section, Facility State promoted to top, Audio consolidated, Failure & Recovery merged, Portal components integrated (not appended).
- Consumer CLAUDE.md template updated: 6-color palette, facility state rules, emotional arc with Portal, companion role guidance, Portal gotchas.
- Design philosophy updated for 6-color palette and Portal fusion.
- Experience design updated with facility state, narrator, and companion roles.

## [0.3.0] — 2026-03-18

### Added

- Signal degradation effect (.sh-signal-degraded) — SVG noise + jitter for unreliable sources
- Interlace overlay (.sh-interlace) — scan line pattern for passive monitoring
- Burn-in effect (data-sh-burn-in) — ghost text for permanent UI landmarks
- Threshold bar (.sh-threshold-bar) — generalized metric bar with progressive color
- Boot sequence utility (bootSequence) — progressive typewriter text reveal
- Matrix rain component (ShMatrixRain) — canvas-based falling character columns
- Incident HUD component (ShIncidentHUD) — fixed top banner for system-wide incidents
- 4 new audio SFX: boot, static, warning, recovery
- Hardware auto-downgrade (detectCapability, applyCapability) — CSS tier response
- Escalation orchestrator (orchestrateEscalation) — multi-surface crisis coordination
- Celebration sequence (celebrationSequence) — catharsis cascade with mantra + shatter
- System corruption mode (.sh-system-corrupted) — piOS glitch effect
- Tension drone audio (setTensionDrone/stopTensionDrone) — ambient escalation sound
- Action feedback utility (confirmAction) — execute node of emotional loop
- Escalation pause/resume methods on EscalationTimer
- Event timeline component (.sh-event-timeline)
- Progress steps component (.sh-progress-steps)
- Filter panel + chips (.sh-filter-panel, .sh-filter-chip)
- Signal bars (.sh-signal-bars)
- Form elements (.sh-input, .sh-select, .sh-toggle, .sh-kbd, .sh-tabs)
- Terminal chrome (log viewer, code block, tooltip, breadcrumb)
- Data visualization (delta indicators, progress bar, badge count)
- Utility effects (divider, loading dots, copy feedback, ghost row, void gradient)
- Alive-pulse breathing animation on fresh data
- Freeze-snap animation on data entering frozen state
- Mantra escalation opacity levels
- Shatter sound timing at mid-scatter
- Tension drone wired into orchestrateEscalation
- Emotional loop completion (pause beat, plan drama, execute feedback)
- WCAG fixes: threat red contrast 68%, focus-visible on all interactive elements, ARIA labels
- Photosensitivity fix: blink-fast slowed to 1.5s
- CSP fix: SVG data URI replaced with CSS-only noise
- Preflight validation script
- Production sourcemaps enabled

## [0.2.0] — 2026-03-18

### Added

- Browser compatibility: hex fallback colors for oklch/light-dark/color-mix
- Global `:focus-visible` rule (WCAG — atmosphere Rule 22)
- `::selection` reverse-video styling
- `@media print` rules for CRT and effects
- Utility classes: opacity (.sh-opacity-_), spacing (.sh-gap-_), typography (.sh-label, .sh-value, .sh-status-code), hover (.sh-hover-\*), grid (.sh-grid), prompt (.sh-prompt)
- ANSI SGR text attribute classes (bold, dim, blink, reverse, strike + reset)
- ANSI 16-color palette (default superhot mapping + opt-in full CGA mode)
- Threshold signaling utility (computeThreshold, applyThreshold)
- Polling heartbeat utility (heartbeat)
- Failure escalation timer (EscalationTimer)
- Recovery sequence choreography (recoverySequence)
- ShModal component — system interrupt with piOS voice and focus trap
- Phosphor monitor variants (amber, green via data-sh-monitor)
- Collapsible standalone CSS (.sh-collapsible)
- Rest-frame delay utility classes (.sh-rest-after-\*)
- Terminal grid alignment class (.sh-terminal-grid)
- CSS class reference documentation

## [0.1.0] — 2026-03-16

### Added

- Initial release: 20 Preact components, 18 CSS component files, 7 JS utilities
- Freshness states, shatter, glitch, mantra, threat pulse, CRT system
- Dashboard primitives (PageBanner, HeroCard, Nav, DataTable, Pipeline, etc.)
- VRAM bar, command palette, toast notifications
- T1/T2/T3 animation tier system
- Glow hierarchy (ambient, standard, critical)
- Effect density tracking
