import { playSfx } from "./audio.js";

/**
 * Apply a glitch effect to an element.
 *
 * @param {Element} element - DOM element to glitch
 * @param {object} [opts]
 * @param {number} [opts.duration=300] - Effect duration in ms
 * @param {'low'|'medium'|'high'} [opts.intensity='medium'] - Glitch intensity
 * @returns {Promise<void>} Resolves when effect completes
 */
export function glitchText(element, opts = {}) {
  const { duration = 300, intensity = "medium" } = opts;

  if (!element) return Promise.resolve();

  element.setAttribute("data-sh-glitch-text", element.textContent || "");
  element.setAttribute("data-sh-effect", "glitch");
  playSfx("static");
  if (intensity !== "medium") {
    element.setAttribute("data-sh-glitch-intensity", intensity);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      element.removeAttribute("data-sh-effect");
      element.removeAttribute("data-sh-glitch-text");
      element.removeAttribute("data-sh-glitch-intensity");
      resolve();
    }, duration);
  });
}
