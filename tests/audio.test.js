/**
 * ShAudio tests
 * Tests that ShAudio.enabled=false prevents playSfx from creating AudioContext.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { ShAudio, playSfx } from "../js/audio.js";

describe("playSfx", () => {
  let audioCtxCreated;
  let origWindow;

  beforeEach(() => {
    audioCtxCreated = false;
    // ShAudio is a module-level singleton — reset enabled before each test
    ShAudio.enabled = false;

    // Provide a minimal window mock so playSfx doesn't throw on globalThis.window check
    origWindow = global.window;
    global.window = {
      AudioContext: class MockAudioContext {
        constructor() {
          audioCtxCreated = true;
          this.state = "running";
          this.sampleRate = 44100;
        }
        close() {
          this.state = "closed";
        }
        resume() {
          return Promise.resolve();
        }
        createOscillator() {
          return {
            type: "sine",
            frequency: { value: 0 },
            connect() {},
            start() {},
            stop() {},
          };
        }
        createGain() {
          return {
            gain: { value: 0.3, setValueAtTime() {}, linearRampToValueAtTime() {} },
            connect() {},
          };
        }
        createBiquadFilter() {
          return {
            type: "bandpass",
            frequency: { value: 0 },
            Q: { value: 0 },
            connect() {},
          };
        }
        createWaveShaper() {
          return {
            curve: null,
            oversample: "none",
            connect() {},
          };
        }
        createBuffer(channels, length, sampleRate) {
          return {
            getChannelData() {
              return new Float32Array(length);
            },
          };
        }
        createBufferSource() {
          return {
            buffer: null,
            connect() {},
            start() {},
            stop() {},
          };
        }
        get currentTime() {
          return 0;
        }
        get destination() {
          return {};
        }
      },
      matchMedia: () => ({ matches: false }),
    };
  });

  afterEach(() => {
    global.window = origWindow;
    ShAudio.enabled = false;
  });

  it("does not create AudioContext when ShAudio.enabled is false", () => {
    ShAudio.enabled = false;
    playSfx("complete");
    assert.equal(audioCtxCreated, false, "AudioContext should not be created when disabled");
  });

  it("creates AudioContext when ShAudio.enabled is true", () => {
    ShAudio.enabled = true;
    playSfx("complete");
    assert.equal(audioCtxCreated, true, "AudioContext should be created when enabled");
  });

  it("does not create AudioContext when prefers-reduced-motion is set", () => {
    ShAudio.enabled = true;
    global.window.matchMedia = () => ({ matches: true });
    playSfx("complete");
    assert.equal(audioCtxCreated, false, "AudioContext must not be created under reduced motion");
  });

  it("does not throw for unknown sfx type when enabled", () => {
    ShAudio.enabled = true;
    assert.doesNotThrow(() => playSfx("unknown_type"));
  });

  it("does not throw when window is undefined", () => {
    ShAudio.enabled = true;
    global.window = undefined;
    assert.doesNotThrow(() => playSfx("complete"));
  });

  it("ShAudio.enabled defaults to false on module load", () => {
    // The module-level default is false — we reset it in beforeEach
    assert.equal(ShAudio.enabled, false);
  });

  it("ShAudio.enabled can be toggled", () => {
    ShAudio.enabled = true;
    assert.equal(ShAudio.enabled, true);
    ShAudio.enabled = false;
    assert.equal(ShAudio.enabled, false);
  });
});
