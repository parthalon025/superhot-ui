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

export const ShAudio = { enabled: false, narratorPersonality: null };

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
 * @param {'complete'|'error'|'dlq'|'pause'|'success'|'portal-chime'|'portal-fail'|'turret-deploy'|'turret-shutdown'|'facility-hum'|'panel-slide'|'boot'|'static'|'warning'|'recovery'} type
 */
export function playSfx(type) {
  if (!ShAudio.enabled) return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = _getCtx();
  if (!ctx) return;

  // Narrator-aware routing (recommendation B):
  // When a personality is active, map generic SFX to personality-appropriate sounds
  const resolvedType = _resolveNarratorSfx(type);

  switch (resolvedType) {
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

    // ── Foundation SFX (v0.3.0) ──
    case "boot":
      _playBoot(ctx);
      break;

    case "static":
      _playStatic(ctx);
      break;

    case "warning":
      _playWarning(ctx);
      break;

    case "recovery":
      _playRecovery(ctx);
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
 * Resolve SFX type based on active narrator personality.
 * Maps generic types to personality-appropriate sounds.
 */
function _resolveNarratorSfx(type) {
  const personality = ShAudio.narratorPersonality;
  if (!personality) return type;

  // Only remap generic types that have personality-specific variants
  if (type === "success" || type === "complete") {
    if (personality === "glados" || personality === "cave" || personality === "wheatley")
      return "portal-chime";
    if (personality === "turret") return "turret-deploy";
    // superhot personality → keep original "complete"
  }

  if (type === "error") {
    if (personality === "glados" || personality === "cave" || personality === "wheatley")
      return "portal-fail";
    if (personality === "turret") return "turret-shutdown";
  }

  return type;
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

// ── Foundation SFX implementations (v0.3.0) ──

function _playBoot(ctx) {
  const now = ctx.currentTime;
  _playTone(ctx, 200, 0.1, "sine");
  _playTone(ctx, 600, 0.1, "sine", 0.1);
}

function _playStatic(ctx) {
  _playNoiseBurst(ctx, 0.15);
}

function _playWarning(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.setValueAtTime(0, now + 0.05);
  gain.gain.setValueAtTime(0.3, now + 0.1);
  gain.gain.linearRampToValueAtTime(0, now + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

function _playRecovery(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.linearRampToValueAtTime(400, now + 0.25);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// ── Tension Drone (v0.3.0) ──

let _droneCtx = null;
let _droneGain = null;
let _droneOscs = [];

/**
 * Start or update a tension drone that intensifies with escalation level.
 * @param {number} level — Escalation level (0-4)
 */
export function setTensionDrone(level) {
  if (!ShAudio.enabled) return;
  if (typeof window === "undefined") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  stopTensionDrone();
  if (level <= 0) return;

  _droneCtx = new (window.AudioContext || window.webkitAudioContext)();
  _droneGain = _droneCtx.createGain();
  _droneGain.connect(_droneCtx.destination);
  _droneGain.gain.value = 0;
  _droneGain.gain.linearRampToValueAtTime(0.05 * level, _droneCtx.currentTime + 0.5);

  const frequencies = [40, 60, 80, 110];
  const count = Math.min(level, frequencies.length);
  for (let i = 0; i < count; i++) {
    const osc = _droneCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequencies[i];
    if (level >= 3) osc.detune.value = (i + 1) * 5 * (level - 2);
    osc.connect(_droneGain);
    osc.start();
    _droneOscs.push(osc);
  }
}

/**
 * Stop the tension drone with a fade-out.
 */
export function stopTensionDrone() {
  if (_droneCtx && _droneGain) {
    try {
      _droneGain.gain.linearRampToValueAtTime(0, _droneCtx.currentTime + 0.3);
      const ctx = _droneCtx;
      const oscs = _droneOscs;
      setTimeout(() => {
        for (const osc of oscs) {
          try {
            osc.stop();
          } catch (e) {
            /* already stopped */
          }
        }
        ctx.close();
      }, 350);
    } catch (e) {
      /* context already closed */
    }
  }
  _droneCtx = null;
  _droneGain = null;
  _droneOscs = [];
}
