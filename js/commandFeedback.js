import { glitchText } from "./glitch.js";
import { playSfx } from "./audio.js";

/**
 * Provide execution feedback after a command/action is taken.
 * Plays a glitch burst + optional sound to confirm system received the command.
 * This is the "Execute" node of the emotional loop.
 *
 * @param {Element} [targetEl] — Element to glitch (e.g., the card that was acted upon)
 * @param {object} [opts]
 * @param {string} [opts.sound="complete"] — SFX to play
 * @param {'low'|'medium'|'high'} [opts.intensity="medium"] — Glitch intensity
 */
export function confirmAction(targetEl, opts = {}) {
  const { sound = "complete", intensity = "medium" } = opts;

  if (targetEl) {
    glitchText(targetEl, { duration: 150, intensity });
  }

  playSfx(sound);
}
