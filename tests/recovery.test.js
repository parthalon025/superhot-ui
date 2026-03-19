import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { recoverySequence } from "../js/recovery.js";

describe("recoverySequence", () => {
  it("returns a promise", () => {
    const result = recoverySequence({
      glitchFn: mock.fn(),
      onBorderTransition: mock.fn(),
      onPulseStop: mock.fn(),
      onToast: mock.fn(),
    });
    assert.ok(result instanceof Promise);
  });
  it("calls steps in order", async () => {
    const order = [];
    await recoverySequence({
      glitchFn: () => order.push("glitch"),
      onBorderTransition: () => order.push("border"),
      onPulseStop: () => order.push("pulse"),
      onToast: () => order.push("toast"),
      delays: { afterGlitch: 0, afterBorder: 0, afterPulse: 0 },
    });
    assert.deepStrictEqual(order, ["glitch", "border", "pulse", "toast"]);
  });
  it("respects delay ordering", async () => {
    const timestamps = [];
    const start = Date.now();
    await recoverySequence({
      glitchFn: () => timestamps.push(Date.now() - start),
      onBorderTransition: () => timestamps.push(Date.now() - start),
      onPulseStop: () => timestamps.push(Date.now() - start),
      onToast: () => timestamps.push(Date.now() - start),
      delays: { afterGlitch: 10, afterBorder: 10, afterPulse: 10 },
    });
    // Each step should be after the previous
    for (let i = 1; i < timestamps.length; i++) {
      assert.ok(timestamps[i] >= timestamps[i - 1], `step ${i} should be after step ${i - 1}`);
    }
  });
});
