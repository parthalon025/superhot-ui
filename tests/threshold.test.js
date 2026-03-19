import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeThreshold } from "../js/threshold.js";

describe("computeThreshold", () => {
  it("returns calm for values 0-59", () => {
    assert.strictEqual(computeThreshold(0), "calm");
    assert.strictEqual(computeThreshold(59), "calm");
  });
  it("returns ambient for values 60-79", () => {
    assert.strictEqual(computeThreshold(60), "ambient");
    assert.strictEqual(computeThreshold(79), "ambient");
  });
  it("returns standard for values 80-89", () => {
    assert.strictEqual(computeThreshold(80), "standard");
    assert.strictEqual(computeThreshold(89), "standard");
  });
  it("returns critical for values 90+", () => {
    assert.strictEqual(computeThreshold(90), "critical");
    assert.strictEqual(computeThreshold(100), "critical");
  });
  it("supports custom breakpoints", () => {
    assert.strictEqual(
      computeThreshold(50, { ambient: 40, standard: 60, critical: 80 }),
      "ambient",
    );
  });
});
