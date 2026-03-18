import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { scrambleLabel } from "../js/scrambleLabel.js";

function mockEl() {
  return { textContent: "" };
}

describe("scrambleLabel", () => {
  beforeEach(() => {
    delete globalThis.window;
  });

  it("sets textContent immediately when window is undefined", () => {
    const el = mockEl();
    scrambleLabel(el, "ARIA");
    assert.equal(el.textContent, "ARIA");
  });

  it("sets textContent immediately when prefers-reduced-motion is active", () => {
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    const el = mockEl();
    scrambleLabel(el, "ARIA");
    assert.equal(el.textContent, "ARIA");
    delete globalThis.window;
  });

  it("eventually resolves to finalText", async () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const el = mockEl();
    scrambleLabel(el, "HUB");
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(el.textContent, "HUB");
    delete globalThis.window;
  });

  it("handles null element gracefully", () => {
    assert.doesNotThrow(() => scrambleLabel(null, "ARIA"));
  });

  it("returns a cancel function", () => {
    const el = mockEl();
    const cancel = scrambleLabel(el, "TEST");
    assert.equal(typeof cancel, "function");
  });

  it("cancel sets finalText immediately", () => {
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    const el = mockEl();
    const cancel = scrambleLabel(el, "DONE");
    cancel();
    assert.equal(el.textContent, "DONE");
    delete globalThis.window;
  });
});
