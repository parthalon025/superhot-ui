/**
 * Apply a repeating watermark behind an element.
 *
 * @param {Element} element - DOM element to apply watermark to
 * @param {string} text - Watermark text (e.g., "OFFLINE", "ERROR")
 */
export function applyMantra(element, text) {
  if (!element || !text) return;
  element.setAttribute("data-sh-mantra", text);
}

/**
 * Remove the watermark from an element.
 *
 * @param {Element} element - DOM element to clear watermark from
 */
export function removeMantra(element) {
  if (!element) return;
  element.removeAttribute("data-sh-mantra");
}
