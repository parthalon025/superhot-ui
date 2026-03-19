import { glitchText } from "./glitch.js";
import { applyFreshness } from "./freshness.js";

/**
 * Fire a polling heartbeat — glitch micro-burst + freshness re-evaluation.
 * Call on each successful poll response.
 * Source: atmosphere-guide.md Rule 32.
 *
 * @param {Element} el - The "last updated" element or dashboard root
 * @param {Date|number} timestamp - Server timestamp from poll response
 * @param {object} [opts]
 * @param {Function} [opts.glitchFn=glitchText] - Glitch function (injectable for testing)
 * @param {Function} [opts.freshnessFn=applyFreshness] - Freshness function (injectable for testing)
 * @param {object} [opts.thresholds] - Freshness thresholds
 */
export function heartbeat(el, timestamp, opts = {}) {
  if (!el) return;
  const { glitchFn = glitchText, freshnessFn = applyFreshness, thresholds } = opts;
  glitchFn(el, { duration: 150, intensity: "medium" });
  freshnessFn(el, timestamp, thresholds);
}
