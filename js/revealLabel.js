/**
 * Character-scramble entrance for node labels.
 * Resolves left-to-right across 8 frames — piOS "system identifying target" effect.
 *
 * @param {Element|null} el - DOM element whose textContent to animate
 * @param {string} finalText - The text to resolve to
 * @param {number} [duration=300] - Total animation duration in ms
 * @returns {() => void} Cancel function — clears interval and sets final text
 */
export function revealLabel(el, finalText, duration = 300) {
  if (!el) return () => {};
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    el.textContent = finalText;
    return () => {};
  }
  if (duration <= 0) {
    el.textContent = finalText;
    return () => {};
  }
  const chars = "!@#$%^&*?><|/\\[]";
  const steps = 8;
  let frame = 0;
  const interval = setInterval(() => {
    const resolved = finalText.slice(0, Math.floor((frame / steps) * finalText.length));
    const noise = Array.from(
      { length: finalText.length - resolved.length },
      () => chars[(Math.random() * chars.length) | 0],
    ).join("");
    el.textContent = resolved + noise;
    if (++frame > steps) {
      el.textContent = finalText;
      clearInterval(interval);
    }
  }, duration / steps);
  return () => {
    clearInterval(interval);
    el.textContent = finalText;
  };
}
