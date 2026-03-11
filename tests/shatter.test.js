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
