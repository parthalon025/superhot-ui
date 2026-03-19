/**
 * Hardware capability detection — atmosphere-guide.md Rule 19.
 * Detects device capability and sets a data attribute for CSS tier response.
 *
 * Tiers:
 * - "full"    — all effects enabled (cores > 4)
 * - "medium"  — T1 reduced (cores 3-4)
 * - "low"     — T1 off, shatter fragments reduced (cores 1-2)
 * - "minimal" — prefers-reduced-motion or explicit override
 */

/**
 * Detect device capability tier.
 * @returns {'minimal'|'low'|'medium'|'full'}
 */
export function detectCapability() {
  if (typeof globalThis.matchMedia === "function") {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "minimal";
  }
  const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4;
  if (cores <= 2) return "low";
  if (cores <= 4) return "medium";
  return "full";
}

/**
 * Apply capability tier to the document for CSS response.
 * @param {'minimal'|'low'|'medium'|'full'} tier
 */
export function applyCapability(tier) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-sh-capability", tier);
  }
}
