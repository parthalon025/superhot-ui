/**
 * setCrtMode tests
 * Tests that setCrtMode writes correct CSS custom properties to document.documentElement.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { setCrtMode, CRT_PRESETS, setCrtPreset } from "../js/crt.js";

// Minimal documentElement mock
function mockDocumentElement() {
  const styles = {};
  return {
    style: {
      setProperty(name, value) {
        styles[name] = value;
      },
      getPropertyValue(name) {
        return styles[name] ?? "";
      },
    },
    _styles: styles,
  };
}

describe("setCrtMode", () => {
  let root;
  let origDocument;

  beforeEach(() => {
    root = mockDocumentElement();
    origDocument = global.document;
    global.document = { documentElement: root };
  });

  afterEach(() => {
    global.document = origDocument;
  });

  it("sets all three properties to none when called with no args", () => {
    setCrtMode();
    assert.equal(root._styles["--sh-crt-stripe"], "none");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("sets --sh-crt-stripe to block when stripe=true", () => {
    setCrtMode({ stripe: true });
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("sets --sh-crt-scanline to block when scanline=true", () => {
    setCrtMode({ scanline: true });
    assert.equal(root._styles["--sh-crt-scanline"], "block");
    assert.equal(root._styles["--sh-crt-stripe"], "none");
  });

  it("sets --sh-crt-flicker to block when flicker=true", () => {
    setCrtMode({ flicker: true });
    assert.equal(root._styles["--sh-crt-flicker"], "block");
  });

  it("enables all three simultaneously", () => {
    setCrtMode({ stripe: true, scanline: true, flicker: true });
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "block");
    assert.equal(root._styles["--sh-crt-flicker"], "block");
  });

  it("disables all when called with all-false", () => {
    // First enable all
    setCrtMode({ stripe: true, scanline: true, flicker: true });
    // Then disable all
    setCrtMode({ stripe: false, scanline: false, flicker: false });
    assert.equal(root._styles["--sh-crt-stripe"], "none");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("only flicker enabled leaves stripe and scanline as none", () => {
    setCrtMode({ flicker: true });
    assert.equal(root._styles["--sh-crt-stripe"], "none");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "block");
  });
});

describe("CRT_PRESETS", () => {
  it("exports four named presets", () => {
    assert.ok(CRT_PRESETS.data);
    assert.ok(CRT_PRESETS.status);
    assert.ok(CRT_PRESETS.immersive);
    assert.ok(CRT_PRESETS.off);
  });

  it("data preset disables scanline and flicker", () => {
    assert.equal(CRT_PRESETS.data.stripe, true);
    assert.equal(CRT_PRESETS.data.scanline, false);
    assert.equal(CRT_PRESETS.data.flicker, false);
  });

  it("status preset enables scanline, disables flicker", () => {
    assert.equal(CRT_PRESETS.status.stripe, true);
    assert.equal(CRT_PRESETS.status.scanline, true);
    assert.equal(CRT_PRESETS.status.flicker, false);
  });

  it("immersive preset enables everything", () => {
    assert.equal(CRT_PRESETS.immersive.stripe, true);
    assert.equal(CRT_PRESETS.immersive.scanline, true);
    assert.equal(CRT_PRESETS.immersive.flicker, true);
  });

  it("off preset disables everything", () => {
    assert.equal(CRT_PRESETS.off.stripe, false);
    assert.equal(CRT_PRESETS.off.scanline, false);
    assert.equal(CRT_PRESETS.off.flicker, false);
  });
});

describe("setCrtPreset", () => {
  let root;
  let origDocument;

  beforeEach(() => {
    root = mockDocumentElement();
    origDocument = global.document;
    global.document = { documentElement: root };
  });

  afterEach(() => {
    global.document = origDocument;
  });

  it("applies the data preset", () => {
    setCrtPreset("data");
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "none");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("applies the status preset", () => {
    setCrtPreset("status");
    assert.equal(root._styles["--sh-crt-stripe"], "block");
    assert.equal(root._styles["--sh-crt-scanline"], "block");
    assert.equal(root._styles["--sh-crt-flicker"], "none");
  });

  it("throws on unknown preset", () => {
    assert.throws(() => setCrtPreset("nope"), /Unknown CRT preset/);
  });
});
