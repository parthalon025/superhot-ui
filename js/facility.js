/**
 * Facility State System — unified atmosphere control.
 *
 * Three states shift CSS tokens simultaneously:
 * - `normal` — Portal blue/orange tokens unchanged
 * - `alert`  — SUPERHOT red bleeds into Portal blue (`--sh-portal-blue` → `--sh-threat`)
 * - `breach` — All Portal tokens become threat red/glow
 *
 * Note: Facility state controls CSS only. Narrator personality and audio
 * remapping are independent — set them explicitly via ShNarrator.personality
 * and ShAudio.narratorPersonality.
 *
 * Sets `data-sh-facility` on documentElement. CSS descendant selectors shift tokens.
 *
 * Usage:
 *   import { setFacilityState, getFacilityState } from 'superhot-ui';
 *   setFacilityState('alert');
 *
 * @module facility
 */

/** @type {'normal'|'alert'|'breach'} */
let _state = "normal";

/** Valid facility states */
const VALID_STATES = ["normal", "alert", "breach"];

/**
 * Set the facility state, shifting the entire atmosphere.
 * @param {'normal'|'alert'|'breach'} state
 */
export function setFacilityState(state) {
  if (!VALID_STATES.includes(state)) return;
  _state = state;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-sh-facility", state);
  }
}

/**
 * Get the current facility state.
 * @returns {'normal'|'alert'|'breach'}
 */
export function getFacilityState() {
  return _state;
}
