/**
 * setCrtMode tests
 * Tests that setCrtMode writes correct CSS custom properties to document.documentElement.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { setCrtMode } from "../js/crt.js";

// Minimal documentElement mock
function mockDocumentElement() {
  const styles = {};
  return {
    style: {
      setProperty(name, value) { styles[name] = value; },
      getPropertyValue(name) { return styles[name] ?? ""; },
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
