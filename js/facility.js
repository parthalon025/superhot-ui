/**
 * Facility State System — unified atmosphere control.
 *
 * Three states shift EVERYTHING simultaneously:
 * - `normal` — Portal blue antlines, calm narrator, standard audio
 * - `alert`  — SUPERHOT red bleeds in, narrator becomes terse, threat tones
 * - `breach` — Full SUPERHOT mode, everything threat-pulsing, cult-command narrator
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
