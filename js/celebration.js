import { applyMantra, removeMantra } from "./mantra.js";
import { shatterElement } from "./shatter.js";
import { playSfx } from "./audio.js";

/**
 * Celebration cascade — the "SUPER HOT" moment when crisis resolves.
 * Mantra floods the screen, fragments scatter, then everything rebuilds.
 *
 * @param {Element} container — Layout root or section to celebrate
 * @param {object} [opts]
 * @param {string} [opts.text="RESTORED"] — Celebration mantra text
 * @param {number} [opts.duration=3000] — Total celebration duration in ms
 * @param {boolean} [opts.shatter=true] — Shatter children at climax
 * @param {boolean} [opts.sound=true] — Play completion SFX
 * @param {Function} [opts.onComplete] — Called when celebration finishes
 * @returns {() => void} Cleanup function
 */
export function celebrationSequence(container, opts = {}) {
  const { text = "RESTORED", duration = 3000, shatter = true, sound = true, onComplete } = opts;
  const timers = [];

  // Phase 1: Mantra floods in (0ms — 1500ms)
  applyMantra(container, text);
  container.setAttribute("data-sh-escalation", "3");

  timers.push(
    setTimeout(() => {
      container.setAttribute("data-sh-escalation", "4");
    }, 500),
  );

  // Phase 2: Climax — shatter + sound (1500ms)
  timers.push(
    setTimeout(() => {
      if (sound) playSfx("complete");
      if (shatter) {
        const children = [...container.querySelectorAll(".sh-frame, .sh-card, .sh-stat-card")];
        for (const child of children.slice(0, 5)) {
          shatterElement(child, { onComplete: () => {} });
        }
      }
    }, duration * 0.5),
  );

  // Phase 3: Calm — remove mantra, let stagger rebuild (3000ms)
  timers.push(
    setTimeout(() => {
      removeMantra(container);
      container.removeAttribute("data-sh-escalation");
      container.classList.add("sh-stagger-children");

      timers.push(
        setTimeout(() => {
          container.classList.remove("sh-stagger-children");
          onComplete?.();
        }, 600),
      );
    }, duration),
  );

  return () => {
    timers.forEach(clearTimeout);
    removeMantra(container);
    container.removeAttribute("data-sh-escalation");
  };
}
