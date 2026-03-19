# Changelog

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
