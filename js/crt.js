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

export const CRT_PRESETS = {
  data: { stripe: true, scanline: false, flicker: false },
  status: { stripe: true, scanline: true, flicker: false },
  immersive: { stripe: true, scanline: true, flicker: true },
  off: { stripe: false, scanline: false, flicker: false },
};

export function setCrtPreset(preset) {
  const config = CRT_PRESETS[preset];
  if (!config) throw new Error(`Unknown CRT preset: ${preset}`);
  setCrtMode(config);
}
