/**
 * State-change label scramble — cycles through random ASCII for 5 frames then resolves.
 * Communicates "node status changed" — shorter than revealLabel (no directional reveal).
 *
 * @param {Element|null} el - DOM element whose textContent to animate
 * @param {string} finalText - The text to resolve to
 * @returns {() => void} Cancel function — clears interval and sets final text
 */
export function scrambleLabel(el, finalText) {
  if (!el) return () => {};
  if (typeof window === "undefined") {
    el.textContent = finalText;
    return () => {};
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = finalText;
    return () => {};
  }
  const chars = "!@#$%^&*?><|/\\[]";
  let count = 0;
  const interval = setInterval(() => {
    if (count >= 5) {
      el.textContent = finalText;
      clearInterval(interval);
      return;
    }
    el.textContent = Array.from(
      { length: finalText.length },
      () => chars[(Math.random() * chars.length) | 0],
    ).join("");
    count++;
  }, 40);
  return () => {
    clearInterval(interval);
    el.textContent = finalText;
  };
}
