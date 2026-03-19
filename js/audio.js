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
 * @param {'complete'|'error'|'dlq'|'pause'|'boot'|'static'|'warning'|'recovery'} type
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

    case "boot":
      _playBoot(ctx, ctx.destination);
      break;

    case "static":
      _playStatic(ctx, ctx.destination);
      break;

    case "warning":
      _playWarning(ctx, ctx.destination);
      break;

    case "recovery":
      _playRecovery(ctx, ctx.destination);
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
    case "boot":
      return 0.2;
    case "static":
      return 0.15;
    case "warning":
      return 0.15;
    case "recovery":
      return 0.25;
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

/**
 * Two-tone ascending beep: 200Hz for 100ms, then 600Hz for 100ms.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} gainNode
 */
function _playBoot(ctx, gainNode) {
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.value = 200;
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.linearRampToValueAtTime(0, now + 0.1);
  osc1.connect(gain1);
  gain1.connect(gainNode);
  osc1.start(now);
  osc1.stop(now + 0.1);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.value = 600;
  gain2.gain.setValueAtTime(0.3, now + 0.1);
  gain2.gain.linearRampToValueAtTime(0, now + 0.2);
  osc2.connect(gain2);
  gain2.connect(gainNode);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.2);
}

/**
 * White noise burst through a bandpass filter. Duration 150ms.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} gainNode
 */
function _playStatic(ctx, gainNode) {
  const now = ctx.currentTime;
  const duration = 0.15;
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * duration);

  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(gainNode);
  source.start(now);
  source.stop(now + duration);
}

/**
 * Double-pulse square wave at 440Hz: 50ms on, 50ms off, 50ms on.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} gainNode
 */
function _playWarning(ctx, gainNode) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 440;

  // Pulse 1: 0–50ms
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.setValueAtTime(0.3, now + 0.05);
  gain.gain.setValueAtTime(0, now + 0.05);
  // Silence: 50–100ms
  gain.gain.setValueAtTime(0, now + 0.1);
  // Pulse 2: 100–150ms
  gain.gain.setValueAtTime(0.3, now + 0.1);
  gain.gain.setValueAtTime(0.3, now + 0.15);
  gain.gain.linearRampToValueAtTime(0, now + 0.15);

  osc.connect(gain);
  gain.connect(gainNode);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Descending chime: 800Hz ramping to 400Hz over 250ms with fade-out.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} gainNode
 */
function _playRecovery(ctx, gainNode) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.linearRampToValueAtTime(400, now + 0.25);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.25);

  osc.connect(gain);
  gain.connect(gainNode);
  osc.start(now);
  osc.stop(now + 0.25);
}
