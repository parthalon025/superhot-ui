/**
 * CRT mode control — writes CSS custom properties to document.documentElement.
 *
 * Consuming project handles persistence (localStorage etc).
 * ShCrtToggle component calls this when user toggles settings.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.stripe=false] - Static scanline stripes (cheap)
 * @param {boolean} [opts.scanline=false] - Moving scan beam (performance-intensive)
 * @param {boolean} [opts.flicker=false] - Phosphor flicker (a11y: photosensitivity risk)
 */
export function setCrtMode({ stripe = false, scanline = false, flicker = false } = {}) {
  const root = document.documentElement;
  root.style.setProperty("--sh-crt-stripe", stripe ? "block" : "none");
  root.style.setProperty("--sh-crt-scanline", scanline ? "block" : "none");
  root.style.setProperty("--sh-crt-flicker", flicker ? "block" : "none");
}
