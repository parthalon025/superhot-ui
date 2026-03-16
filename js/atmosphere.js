/**
 * Effect density tracker — atmosphere-guide.md Rule 8.
 * Tracks active animated effects per viewport to prevent cognitive overload.
 * Max 3 simultaneous animated effects recommended.
 */

export const MAX_EFFECTS = 3;

const _active = new Set();

/**
 * Register an active effect. Returns a cleanup function.
 * Call cleanup when the effect ends or the element unmounts.
 * @param {string} id — Unique identifier for this effect instance
 * @returns {() => void} cleanup function
 */
export function trackEffect(id) {
  _active.add(id);
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    _active.delete(id);
  };
}

/** Current number of active animated effects. */
export function activeEffectCount() {
  return _active.size;
}

/** True if active effects exceed the recommended budget. */
export function isOverBudget() {
  return _active.size > MAX_EFFECTS;
}

/** Reset all tracked effects (testing only). */
export function resetEffects() {
  _active.clear();
}
