# Changelog

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
