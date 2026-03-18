import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { revealLabel } from "../js/revealLabel.js";

function mockEl() {
  return { textContent: "" };
}

describe("revealLabel", () => {
  beforeEach(() => {
    delete globalThis.window;
  });

  it("sets textContent immediately when window is undefined", () => {
    const el = mockEl();
    revealLabel(el, "QUEUE", 0);
    assert.equal(el.textContent, "QUEUE");
  });

  it("sets textContent immediately when prefers-reduced-motion is active", () => {
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    const el = mockEl();
    revealLabel(el, "QUEUE");
    assert.equal(el.textContent, "QUEUE");
    delete globalThis.window;
  });

  it("resolves to finalText when duration is 0", () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const el = mockEl();
    revealLabel(el, "ARIA", 0);
    assert.equal(el.textContent, "ARIA");
    delete globalThis.window;
  });

  it("handles null element gracefully", () => {
    assert.doesNotThrow(() => revealLabel(null, "ARIA"));
  });

  it("handles empty string", () => {
    const el = mockEl();
    revealLabel(el, "", 0);
    assert.equal(el.textContent, "");
  });

  it("returns a cancel function", () => {
    const el = mockEl();
    const cancel = revealLabel(el, "TEST", 0);
    assert.equal(typeof cancel, "function");
  });

  it("cancel sets finalText immediately", () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const el = mockEl();
    const cancel = revealLabel(el, "DONE", 5000);
    cancel();
    assert.equal(el.textContent, "DONE");
    delete globalThis.window;
  });
});
