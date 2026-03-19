/**
 * Compute threshold level from a percentage value.
 * Maps to glow classes: calm (none), ambient, standard, critical.
 * Source: atmosphere-guide.md Rule 39.
 *
 * @param {number} pct - Value 0-100
 * @param {object} [breakpoints] - Custom thresholds
 * @param {number} [breakpoints.ambient=60]
 * @param {number} [breakpoints.standard=80]
 * @param {number} [breakpoints.critical=90]
 * @returns {'calm'|'ambient'|'standard'|'critical'}
 */
export function computeThreshold(pct, breakpoints = {}) {
  const { ambient = 60, standard = 80, critical = 90 } = breakpoints;
  if (pct >= critical) return "critical";
  if (pct >= standard) return "standard";
  if (pct >= ambient) return "ambient";
  return "calm";
}

const GLOW_CLASSES = ["sh-glow-ambient", "sh-glow-standard", "sh-glow-critical", "sh-glow-none"];

/**
 * Apply threshold-appropriate glow class to an element.
 *
 * @param {Element} el
 * @param {number} pct - Value 0-100
 * @param {object} [breakpoints]
 * @returns {'calm'|'ambient'|'standard'|'critical'}
 */
export function applyThreshold(el, pct, breakpoints) {
  if (!el) return "calm";
  const level = computeThreshold(pct, breakpoints);
  el.classList.remove(...GLOW_CLASSES);
  if (level !== "calm") {
    el.classList.add(`sh-glow-${level}`);
  }
  return level;
}
