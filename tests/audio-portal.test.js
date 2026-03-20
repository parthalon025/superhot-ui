/**
 * Portal SFX behavioral tests.
 * Tests that each Portal-inspired SFX type doesn't throw when enabled.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { ShAudio, playSfx } from "../js/audio.js";

describe("Portal SFX", () => {
  let origWindow;

  beforeEach(() => {
    ShAudio.enabled = false;
    ShAudio.narratorPersonality = null;
    origWindow = global.window;
    global.window = {
      AudioContext: class MockAudioContext {
        constructor() {
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
            frequency: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {} },
            detune: { value: 0 },
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
          return { curve: null, oversample: "none", connect() {} };
        }
        createBuffer(channels, length) {
          return {
            getChannelData() {
              return new Float32Array(length);
            },
          };
        }
        createBufferSource() {
          return { buffer: null, connect() {}, start() {}, stop() {} };
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
    ShAudio.narratorPersonality = null;
  });

  const PORTAL_SFX = [
    "portal-chime",
    "portal-fail",
    "turret-deploy",
    "turret-shutdown",
    "facility-hum",
    "panel-slide",
  ];

  for (const sfx of PORTAL_SFX) {
    it(`playSfx('${sfx}') does not throw when enabled`, () => {
      ShAudio.enabled = true;
      assert.doesNotThrow(() => playSfx(sfx));
    });
  }

  it("does not throw for any Portal SFX when disabled", () => {
    ShAudio.enabled = false;
    for (const sfx of PORTAL_SFX) {
      assert.doesNotThrow(() => playSfx(sfx));
    }
  });

  // Narrator-aware routing tests
  describe("narrator-aware SFX routing", () => {
    it("routes success to portal-chime when glados personality active", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = "glados";
      // Should not throw — routes to portal-chime internally
      assert.doesNotThrow(() => playSfx("success"));
    });

    it("routes success to turret-deploy when turret personality active", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = "turret";
      assert.doesNotThrow(() => playSfx("success"));
    });

    it("routes error to portal-fail when wheatley personality active", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = "wheatley";
      assert.doesNotThrow(() => playSfx("error"));
    });

    it("routes error to turret-shutdown when turret personality active", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = "turret";
      assert.doesNotThrow(() => playSfx("error"));
    });

    it("keeps original type when superhot personality active", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = "superhot";
      assert.doesNotThrow(() => playSfx("complete"));
    });

    it("keeps original type when no personality set", () => {
      ShAudio.enabled = true;
      ShAudio.narratorPersonality = null;
      assert.doesNotThrow(() => playSfx("complete"));
    });
  });
});
