import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Minimal DOM stubs for Node environment
function makeElement(overrides = {}) {
  const el = {
    parentNode: null,
    style: {},
    className: "",
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 50 }),
    remove: () => {},
    ...overrides,
  };
  return el;
}

describe("SHATTER_PRESETS", () => {
  it("exports four named presets", async () => {
    const { SHATTER_PRESETS } = await import("../js/shatter.js");
    assert.ok(SHATTER_PRESETS.toast);
    assert.ok(SHATTER_PRESETS.cancel);
    assert.ok(SHATTER_PRESETS.alert);
    assert.ok(SHATTER_PRESETS.purge);
  });

  it("toast has 4 fragments", async () => {
    const { SHATTER_PRESETS } = await import("../js/shatter.js");
    assert.equal(SHATTER_PRESETS.toast.fragments, 4);
  });

  it("cancel has 6 fragments", async () => {
    const { SHATTER_PRESETS } = await import("../js/shatter.js");
    assert.equal(SHATTER_PRESETS.cancel.fragments, 6);
  });

  it("alert has 8 fragments", async () => {
    const { SHATTER_PRESETS } = await import("../js/shatter.js");
    assert.equal(SHATTER_PRESETS.alert.fragments, 8);
  });

  it("purge has 12 fragments", async () => {
    const { SHATTER_PRESETS } = await import("../js/shatter.js");
    assert.equal(SHATTER_PRESETS.purge.fragments, 12);
  });
});

describe("shatterElement with preset string", () => {
  it("accepts a preset name and uses its fragment count", async () => {
    const { shatterElement } = await import("../js/shatter.js");
    const children = [];
    const parent = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      style: { setProperty() {} },
      appendChild: (el) => children.push(el),
    };
    const el = makeElement({ parentNode: parent });
    const cleanup = shatterElement(el, "toast");
    assert.equal(children.length, 4);
    cleanup();
  });

  it("falls back to defaults for unknown preset name", async () => {
    const { shatterElement } = await import("../js/shatter.js");
    const children = [];
    const parent = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      style: { setProperty() {} },
      appendChild: (el) => children.push(el),
    };
    const el = makeElement({ parentNode: parent });
    shatterElement(el, "nonexistent");
    assert.equal(children.length, 12);
  });
});

describe("shatterElement", () => {
  it("calls onComplete immediately when element has no parentNode", async () => {
    const { shatterElement } = await import("../js/shatter.js");
    let called = false;
    shatterElement(makeElement({ parentNode: null }), {
      onComplete: () => {
        called = true;
      },
    });
    assert.equal(called, true);
  });

  it("defaults to 12 fragments", async () => {
    const { shatterElement } = await import("../js/shatter.js");
    const children = [];
    const parent = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      style: { setProperty() {} },
      appendChild: (el) => children.push(el),
    };
    const el = makeElement({ parentNode: parent });
    shatterElement(el, {});
    assert.equal(children.length, 12);
  });

  it("respects custom fragment count", async () => {
    const { shatterElement } = await import("../js/shatter.js");
    const children = [];
    const parent = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      style: { setProperty() {} },
      appendChild: (el) => children.push(el),
    };
    const el = makeElement({ parentNode: parent });
    shatterElement(el, { fragments: 3 });
    assert.equal(children.length, 3);
  });
});
