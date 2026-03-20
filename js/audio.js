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
 *   playSfx('portal-chime');   // Portal-inspired ascending arpeggio
 *   playSfx('turret-deploy');  // Formant-filtered robotic tone
 */

export const ShAudio = { enabled: false };

/** @type {AudioContext|null} Shared context — lazily created, reused. */
let _ctx = null;

function _getCtx() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!_ctx || _ctx.state === "closed") _ctx = new AudioCtx();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

/**
 * Play a sound effect procedurally via Web Audio API.
 *
 * @param {'complete'|'error'|'dlq'|'pause'|'portal-chime'|'portal-fail'|'turret-deploy'|'turret-shutdown'|'facility-hum'|'panel-slide'} type
 */
export function playSfx(type) {
  if (!ShAudio.enabled) return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = _getCtx();
  if (!ctx) return;

  switch (type) {
    // ── Original SUPERHOT SFX ──
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

    // ── Portal-inspired SFX ──
    case "portal-chime":
      // Ascending arpeggio — Still Alive motif (F#4→A4→D5→A4)
      _playTone(ctx, 369.99, 0.12, "sine");
      _playTone(ctx, 440.0, 0.12, "sine", 0.12);
      _playTone(ctx, 587.33, 0.16, "sine", 0.24);
      _playTone(ctx, 440.0, 0.12, "sine", 0.4);
      break;

    case "portal-fail":
      // Chromatic descent — B4→Bb4→A4
      _playTone(ctx, 493.88, 0.12, "sine");
      _playTone(ctx, 466.16, 0.12, "sine", 0.12);
      _playTone(ctx, 440.0, 0.25, "sine", 0.24);
      break;

    case "turret-deploy":
      // Formant-filtered robotic activation tone
      _playFormantTone(ctx, 220, 0.15, [
        [800, 8, 0.6],
        [1150, 6, 0.4],
        [2800, 10, 0.2],
      ]);
      _playFormantTone(
        ctx,
        330,
        0.15,
        [
          [800, 8, 0.6],
          [1150, 6, 0.4],
          [2800, 10, 0.2],
        ],
        0.15,
      );
      break;

    case "turret-shutdown":
      // Descending formant — deactivation
      _playFormantTone(
        ctx,
        330,
        0.2,
        [
          [800, 8, 0.5],
          [1150, 6, 0.3],
        ],
        0,
      );
      _playFormantTone(
        ctx,
        165,
        0.3,
        [
          [600, 6, 0.4],
          [900, 5, 0.2],
        ],
        0.2,
      );
      break;

    case "facility-hum":
      // Low ambient drone — 60Hz with slight detuned chorus
      _playTone(ctx, 60, 0.8, "sine");
      _playTone(ctx, 60.5, 0.8, "sine"); // slight detune for chorus
      break;

    case "panel-slide":
      // Filtered noise burst — mechanical servo
      _playNoiseBurst(ctx, 0.15);
      break;

    default:
      return;
  }
}

/**
 * Play a single tone.
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
 * Play a formant-filtered tone (voice-like quality).
 */
function _playFormantTone(ctx, frequency, duration, formants, startOffset = 0) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = frequency;

  const merger = ctx.createGain();
  merger.gain.value = 0.3;

  const start = ctx.currentTime + startOffset;
  const end = start + duration;

  merger.gain.setValueAtTime(0.3, start);
  merger.gain.linearRampToValueAtTime(0, end);

  for (const [freq, q, vol] of formants) {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = vol;
    osc.connect(bp);
    bp.connect(g);
    g.connect(merger);
  }

  merger.connect(ctx.destination);
  osc.start(start);
  osc.stop(end);
}

/**
 * Play a filtered noise burst (mechanical/servo sound).
 */
function _playNoiseBurst(ctx, duration) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2000;
  bp.Q.value = 5;

  const gain = ctx.createGain();
  const start = ctx.currentTime;
  gain.gain.setValueAtTime(0.2, start);
  gain.gain.linearRampToValueAtTime(0, start + duration);

  source.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  source.start(start);
  source.stop(start + duration);
}

/**
 * Create a soft distortion curve for error sounds.
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
