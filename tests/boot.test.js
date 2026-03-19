import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { bootSequence } from "../js/boot.js";

// Minimal DOM stub for Node environment
function makeSpan() {
  return {
    className: "",
    textContent: "",
    style: { setProperty: mock.fn() },
    classList: {
      _set: new Set(),
      add(c) {
        this._set.add(c);
      },
      remove(c) {
        this._set.delete(c);
      },
      contains(c) {
        return this._set.has(c);
      },
    },
  };
}

describe("bootSequence", () => {
  let origDoc;

  beforeEach(() => {
    origDoc = globalThis.document;
    globalThis.document = { createElement: () => makeSpan() };
  });

  afterEach(() => {
    if (origDoc === undefined) delete globalThis.document;
    else globalThis.document = origDoc;
  });

  it("returns a cleanup function", () => {
    const children = [];
    const el = {
      firstChild: null,
      removeChild: mock.fn(),
      appendChild: mock.fn((child) => children.push(child)),
    };
    const cleanup = bootSequence(el, ["LINE 1", "LINE 2"]);
    assert.strictEqual(typeof cleanup, "function");
    cleanup();
  });
  it("creates span elements for each line", () => {
    const children = [];
    const el = {
      firstChild: null,
      removeChild: mock.fn(),
      appendChild: mock.fn((child) => children.push(child)),
    };
    bootSequence(el, ["A", "B", "C"]);
    assert.strictEqual(el.appendChild.mock.calls.length, 3);
  });
  it("accepts empty lines array", () => {
    const el = {
      firstChild: null,
      removeChild: mock.fn(),
      appendChild: mock.fn(),
    };
    const cleanup = bootSequence(el, []);
    assert.strictEqual(typeof cleanup, "function");
    cleanup();
  });
  it("calls onComplete for empty lines", () => {
    const cb = mock.fn();
    const el = {
      firstChild: null,
      removeChild: mock.fn(),
      appendChild: mock.fn(),
    };
    bootSequence(el, [], { onComplete: cb });
    assert.strictEqual(cb.mock.calls.length, 1);
  });
  it("calls onComplete after last line", async () => {
    const cb = mock.fn();
    const el = {
      firstChild: null,
      removeChild: mock.fn(),
      appendChild: mock.fn(),
    };
    bootSequence(el, ["DONE"], { lineDelay: 0, charSpeed: 0, onComplete: cb });
    await new Promise((r) => setTimeout(r, 50));
    assert.strictEqual(cb.mock.calls.length, 1);
  });
});
