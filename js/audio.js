/**
 * ShAudio — piOS soundscape (opt-in)
 *
 * Signal: system event feedback
 * Emotional loop: catharsis (complete), tension (error/dlq)
 * Accessibility: respects prefers-reduced-motion. Plays only when ShAudio.enabled = true.
 *
 * Usage:
 *   import { ShAudio, playSfx } from 'superhot-ui';
 *   ShAudio.enabled = true; // set from user preference
 *   playSfx('complete');
 */

export const ShAudio = { enabled: false };

/**
 * Play a sound effect procedurally via Web Audio API.
 *
 * @param {'complete'|'error'|'dlq'|'pause'} type
 */
export function playSfx(type) {
  if (!ShAudio.enabled) return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();

  switch (type) {
    case "complete":
      _playTone(ctx, 440, 0.15, "sine");
      _playTone(ctx, 880, 0.15, "sine", 0.15);
      break;

    case "error":
      _playTone(ctx, 220, 0.2, "sawtooth");
      _playTone(ctx, 110, 0.2, "sawtooth", 0.2, true);
      break;

    case "dlq":
      _playTone(ctx, 110, 0.3, "sine");
      break;

    case "pause":
      _playTone(ctx, 880, 0.05, "sine");
      break;

    default:
      // unknown type — no-op
      ctx.close();
      return;
  }

  // Auto-close context after sounds finish (+ 100ms buffer)
  const totalDuration = _soundDuration(type);
  setTimeout(() => ctx.close(), (totalDuration + 0.1) * 1000);
}

/**
 * Play a single tone.
 *
 * @param {AudioContext} ctx
 * @param {number} frequency - Hz
 * @param {number} duration - seconds
 * @param {OscillatorType} wave
 * @param {number} [startOffset=0] - seconds from now to start
 * @param {boolean} [distort=false] - add slight waveshaper distortion
 */
function _playTone(ctx, frequency, duration, wave, startOffset = 0, distort = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = wave;
  osc.frequency.value = frequency;

  const start = ctx.currentTime + startOffset;
  const end = start + duration;

  gain.gain.setValueAtTime(0.3, start);
  gain.gain.linearRampToValueAtTime(0, end);

  if (distort) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = _makeDistortionCurve(50);
    shaper.oversample = "2x";
    osc.connect(shaper);
    shaper.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(end);
}

/**
 * Total sound duration in seconds for a given type.
 *
 * @param {string} type
 * @returns {number}
 */
function _soundDuration(type) {
  switch (type) {
    case "complete":
      return 0.3; // 150ms + 150ms
    case "error":
      return 0.4; // 200ms + 200ms
    case "dlq":
      return 0.3;
    case "pause":
      return 0.05;
    default:
      return 0;
  }
}

/**
 * Create a soft distortion curve for error sounds.
 *
 * @param {number} amount
 * @returns {Float32Array}
 */
function _makeDistortionCurve(amount) {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}
