import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { heartbeat } from "../js/heartbeat.js";

describe("heartbeat", () => {
  it("calls glitchFn with low intensity", () => {
    const glitchMock = mock.fn();
    const freshnessMock = mock.fn();
    const el = { setAttribute: mock.fn() };
    heartbeat(el, Date.now(), { glitchFn: glitchMock, freshnessFn: freshnessMock });
    assert.strictEqual(glitchMock.mock.calls.length, 1);
    assert.deepStrictEqual(glitchMock.mock.calls[0].arguments[1], {
      duration: 100,
      intensity: "low",
    });
  });
  it("calls freshnessFn with element and timestamp", () => {
    const glitchMock = mock.fn();
    const freshnessMock = mock.fn();
    const el = { setAttribute: mock.fn() };
    const ts = Date.now();
    heartbeat(el, ts, { glitchFn: glitchMock, freshnessFn: freshnessMock });
    assert.strictEqual(freshnessMock.mock.calls.length, 1);
    assert.strictEqual(freshnessMock.mock.calls[0].arguments[0], el);
    assert.strictEqual(freshnessMock.mock.calls[0].arguments[1], ts);
  });
  it("is a no-op when element is null", () => {
    heartbeat(null, Date.now());
  });
});
