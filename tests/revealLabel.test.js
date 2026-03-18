import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

function mockEl() {
  return { textContent: "" };
}

describe("revealLabel", () => {
  beforeEach(() => {
    delete globalThis.window;
  });

  it("sets textContent immediately when window is undefined", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "QUEUE", 0);
    assert.equal(el.textContent, "QUEUE");
  });

  it("sets textContent immediately when prefers-reduced-motion is active", async () => {
    globalThis.window = {
      matchMedia: () => ({ matches: true }),
    };
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "QUEUE");
    assert.equal(el.textContent, "QUEUE");
    delete globalThis.window;
  });

  it("resolves to finalText when duration is 0", async () => {
    globalThis.window = {
      matchMedia: () => ({ matches: false }),
    };
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "ARIA", 0);
    assert.equal(el.textContent, "ARIA");
    delete globalThis.window;
  });

  it("handles null element gracefully", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    assert.doesNotThrow(() => revealLabel(null, "ARIA"));
  });

  it("handles empty string", async () => {
    const { revealLabel } = await import("../js/revealLabel.js");
    const el = mockEl();
    revealLabel(el, "", 0);
    assert.equal(el.textContent, "");
  });
});
