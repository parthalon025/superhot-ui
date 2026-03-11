/**
 * Apply a freshness state to an element based on timestamp age.
 *
 * @param {Element} element - DOM element to apply state to
 * @param {Date|number} timestamp - When the data was last updated (Date or epoch ms)
 * @param {object} [thresholds] - Age thresholds in seconds
 * @param {number} [thresholds.cooling=300] - Seconds until "cooling" (5 min)
 * @param {number} [thresholds.frozen=1800] - Seconds until "frozen" (30 min)
 * @param {number} [thresholds.stale=3600] - Seconds until "stale" (60 min)
 * @returns {'fresh'|'cooling'|'frozen'|'stale'} The state applied
 */
export function applyFreshness(element, timestamp, thresholds = {}) {
  if (!element || !timestamp) return "fresh";

  const { cooling = 300, frozen = 1800, stale = 3600 } = thresholds;
  const epochMs = timestamp instanceof Date ? timestamp.getTime() : Number(timestamp);
  const ageSeconds = Math.max(0, (Date.now() - epochMs) / 1000);

  let state = "fresh";
  if (ageSeconds >= stale) state = "stale";
  else if (ageSeconds >= frozen) state = "frozen";
  else if (ageSeconds >= cooling) state = "cooling";

  element.setAttribute("data-sh-state", state);
  return state;
}
